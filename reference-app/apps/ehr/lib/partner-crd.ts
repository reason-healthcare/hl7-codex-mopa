import { createLogger } from "@mopa/logger";

type FhirBundle = {
  resourceType: "Bundle";
  type: "searchset";
  entry?: Array<{ resource?: Record<string, unknown> }>;
};

type TokenResponse = { access_token: string; expires_in?: number };

type FhirResource = Record<string, unknown>;

const logger = createLogger("ehr");

let cachedToken: { value: string; expiresAt: number } | undefined;

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export function isPartnerCrdConfigured(): boolean {
  return Boolean(process.env.CRD_PARTNER_BASE_URL);
}

export function isPartnerDtrConfigured(): boolean {
  return Boolean(process.env.DTR_PARTNER_BASE_URL ?? process.env.CRD_PARTNER_BASE_URL);
}

export async function partnerToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) return cachedToken.value;

  const response = await fetch(required("CRD_PARTNER_TOKEN_URL"), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: required("CRD_PARTNER_CLIENT_ID"),
      client_secret: required("CRD_PARTNER_CLIENT_SECRET"),
      scope: process.env.CRD_PARTNER_SCOPE ?? "crd dtr pas",
    }),
  });
  if (!response.ok) throw new Error(`Partner OAuth failed: HTTP ${response.status}`);
  const payload = (await response.json()) as TokenResponse;
  if (!payload.access_token) throw new Error("Partner OAuth response omitted access_token");
  cachedToken = {
    value: payload.access_token,
    expiresAt: now + (payload.expires_in ?? 3600) * 1000,
  };
  return payload.access_token;
}

async function searchBundle(baseUrl: string, path: string): Promise<FhirBundle> {
  // A completed DTR response must be visible to the very next CRD call. HAPI
  // can otherwise reuse an older search result that predates the FHIR write.
  const response = await fetch(`${baseUrl}/${path}`, {
    headers: { "Cache-Control": "no-cache" },
  });
  if (!response.ok) throw new Error(`Local FHIR prefetch failed: HTTP ${response.status}`);
  return (await response.json()) as FhirBundle;
}

export async function buildPartnerPrefetch(patientId: string): Promise<Record<string, unknown>> {
  const baseUrl = (process.env.FHIR_BASE_URL ?? "http://localhost:8080/fhir").replace(/\/$/, "");
  const encodedPatient = encodeURIComponent(patientId);
  const [
    patient,
    coverageBundle,
    conditionBundle,
    observationBundle,
    questionnaireResponseBundle,
    priorMedicationRequestBundle,
  ] = await Promise.all([
    fetch(`${baseUrl}/Patient/${encodedPatient}`).then(async (response) => {
      if (!response.ok) throw new Error(`Local FHIR patient fetch failed: HTTP ${response.status}`);
      return response.json();
    }),
    searchBundle(
      baseUrl,
      `Coverage?patient=${encodedPatient}&status=active&_include=Coverage:payor`
    ),
    searchBundle(baseUrl, `Condition?patient=${encodedPatient}&clinical-status=active&_count=100`),
    searchBundle(baseUrl, `Observation?patient=${encodedPatient}&_count=200`),
    searchBundle(baseUrl, `QuestionnaireResponse?subject=Patient/${encodedPatient}&_count=100`),
    searchBundle(
      baseUrl,
      `MedicationRequest?patient=${encodedPatient}&status=completed,stopped&_count=100`
    ),
  ]);
  return {
    patient,
    coverageBundle,
    conditionBundle,
    observationBundle,
    questionnaireResponseBundle,
    priorMedicationRequestBundle,
  };
}

export async function callPartnerCrd(
  hook: "order-select" | "order-sign",
  body: Record<string, unknown>
): Promise<{ status: number; payload: unknown }> {
  const baseUrl = required("CRD_PARTNER_BASE_URL").replace(/\/$/, "");
  const enriched = { ...body };
  const context = body.context as { patientId?: string } | undefined;
  if (context?.patientId && process.env.CRD_PARTNER_PREFETCH !== "false") {
    enriched.prefetch = await buildPartnerPrefetch(context.patientId);
  }

  const response = await fetch(`${baseUrl}/crd/cds-services/${hook}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await partnerToken()}`,
      Accept: "application/json",
      "Content-Type": "application/fhir+json",
    },
    body: JSON.stringify(enriched),
  });
  const payload = await response.json();
  return { status: response.status, payload };
}

export async function buildPartnerDtrPackage({
  contextId,
  patientId,
  orders,
  questionnaireCanonical,
  coverageReference,
}: {
  contextId: string;
  patientId: string;
  orders: FhirResource[];
  questionnaireCanonical: string;
  coverageReference?: string;
}): Promise<FhirResource> {
  const fhirBase = (process.env.FHIR_BASE_URL ?? "http://localhost:8080/fhir").replace(/\/$/, "");
  const coverage = await resolveCoverage(fhirBase, patientId, coverageReference);
  if (!coverage) throw new Error("No active Coverage found for DTR questionnaire package");

  const baseUrl = (process.env.DTR_PARTNER_BASE_URL ?? required("CRD_PARTNER_BASE_URL")).replace(
    /\/$/,
    ""
  );
  const requestUrl = `${baseUrl}/Questionnaire/$questionnaire-package`;
  const request = {
    resourceType: "Parameters",
    parameter: [
      { name: "context", valueString: contextId },
      { name: "coverage", resource: coverage },
      ...orders.map((order) => ({ name: "order", resource: order })),
    ],
  };
  const startedAt = Date.now();
  const response = await fetch(requestUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await partnerToken()}`,
      Accept: "application/fhir+json",
      "Content-Type": "application/fhir+json",
    },
    body: JSON.stringify(request),
  });
  const payload = await response.json().catch(() => ({ error: "non_json_partner_response" }));
  logger.info("dtr.package", {
    correlationId: contextId,
    patientId,
    method: "POST",
    path: "/Questionnaire/$questionnaire-package",
    requestUrl,
    responseUrl: requestUrl,
    status: response.status,
    durationMs: Date.now() - startedAt,
    request,
    response: payload,
    summary: `DTR questionnaire package → partner (${response.status})`,
  });
  if (!response.ok) throw new Error(`Partner DTR package failed: HTTP ${response.status}`);
  if (!partnerPackageContainsQuestionnaire(payload, questionnaireCanonical)) {
    throw new Error("Partner DTR package did not include the CRD-selected Questionnaire");
  }
  return payload;
}

async function resolveCoverage(
  fhirBase: string,
  patientId: string,
  coverageReference?: string
): Promise<FhirResource | undefined> {
  // The CRD coverage extension is authoritative when it includes a local FHIR
  // reference. Only permit a relative Coverage reference; never follow an
  // arbitrary URL from a CDS card.
  if (coverageReference && /^Coverage\/[A-Za-z0-9.-]+$/.test(coverageReference)) {
    const response = await fetch(`${fhirBase}/${coverageReference}`);
    if (response.ok) return (await response.json()) as FhirResource;
    if (response.status !== 404) {
      throw new Error(`CRD-referenced Coverage fetch failed: HTTP ${response.status}`);
    }
  }
  const coverageBundle = await searchBundle(
    fhirBase,
    `Coverage?patient=${encodeURIComponent(patientId)}&status=active&_count=1`
  );
  return coverageBundle.entry?.find((entry) => entry.resource)?.resource;
}

function partnerPackageContainsQuestionnaire(payload: FhirResource, canonical: string): boolean {
  const expected = canonical.split("|")[0];
  const parameters = payload.parameter;
  if (!Array.isArray(parameters)) return false;
  return parameters.some((parameter) => {
    if (!parameter || typeof parameter !== "object") return false;
    const bundle = (parameter as { name?: unknown; resource?: FhirResource }).resource;
    if ((parameter as { name?: unknown }).name !== "packagebundle" || !bundle) return false;
    const entries = bundle.entry;
    return (
      Array.isArray(entries) &&
      entries.some((entry) => {
        const resource =
          entry && typeof entry === "object"
            ? (entry as { resource?: FhirResource }).resource
            : undefined;
        return resource?.resourceType === "Questionnaire" && resource.url === expected;
      })
    );
  });
}
