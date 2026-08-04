/**
 * MOPA CRD Service — business logic layer.
 *
 * This module contains pure functions so they can be tested without
 * instantiating the Next.js request/response layer.
 *
 * Per the simplified MOPA specification, the CRD service uses standard
 * CDS Hooks with fhirAuthorization to query the EHR FHIR server directly
 * for oncology patient context. No custom discovery extension, prefetch
 * templates, or condition registry are used.
 */

import type { CdsCard, CdsRequest, CdsResponse, CdsService } from "@mopa/cds-hooks";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

import {
  CRD_SERVICE_ID,
  CRD_SERVICE_ID_SIGN,
  CRD_SERVICE_TITLE,
  CRD_DEFAULT_PORT,
} from "./constants";

export {
  CRD_SERVICE_ID,
  CRD_SERVICE_ID_SIGN,
  CRD_SERVICE_TITLE,
  CRD_DEFAULT_PORT,
} from "./constants";

// ---------------------------------------------------------------------------
// FHIR query templates — used to query the EHR FHIR server via fhirAuthorization
// ---------------------------------------------------------------------------

const SNOMED = "http://snomed.info/sct";
const LOINC = "http://loinc.org";

/** Breast cancer SNOMED code used to identify the applicable coverage policy. */
const BREAST_CANCER_CODE = "372137005";

/** FHIR search queries the CRD service issues against the EHR FHIR server. */
const FHIR_QUERIES: Record<string, (patientId: string) => string> = {
  conditions: (id) => `Condition?patient=${id}&category=problem-list-item&_count=20`,
  her2: (id) =>
    `Observation?patient=${id}&code=${LOINC}|85319-2,${SNOMED}|431396003&_sort=-date&_count=5`,
  cancerStage: (id) => `Observation?patient=${id}&code=${LOINC}|21908-9&_sort=-date&_count=1`,
  ecogPs: (id) => `Observation?patient=${id}&code=${LOINC}|89247-1&_sort=-date&_count=1`,
  priorTherapy: (id) =>
    `MedicationRequest?patient=${id}&status=completed,stopped&_count=20`,
};

/** Human-readable labels for missing data elements (used in DTR card). */
export const MISSING_KEY_LABELS: Record<string, string> = {
  breastCancer: "Breast cancer diagnosis",
  her2: "HER2 status",
  cancerStage: "Cancer stage",
  ecogPs: "ECOG Performance Status",
  priorTherapy: "Prior therapy history",
};

// ---------------------------------------------------------------------------
// Discovery — standard CDS Hooks, no custom extension
// ---------------------------------------------------------------------------

export function buildDiscoveryResponse(): { services: CdsService[] } {
  const baseService: CdsService = {
    id: CRD_SERVICE_ID,
    hook: "order-select",
    title: CRD_SERVICE_TITLE,
    description:
      "Evaluates oncology chemotherapy orders against coverage policy. " +
      "Uses fhirAuthorization to query the EHR FHIR server directly for " +
      "oncology patient context. No prefetch configuration required.",
  };

  return {
    services: [
      baseService,
      {
        ...baseService,
        id: CRD_SERVICE_ID_SIGN,
        hook: "order-sign",
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// FHIR query helpers
// ---------------------------------------------------------------------------

/** Fetch a FHIR search Bundle from the EHR server using fhirAuthorization. */
async function fetchBundle(
  fhirBase: string,
  query: string,
  bearerToken?: string
): Promise<Record<string, unknown> | null> {
  const base = fhirBase.replace(/\/$/, "");
  const headers: Record<string, string> = { Accept: "application/fhir+json" };
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`;

  try {
    const res = await fetch(`${base}/${query}`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Extract resource entries from a FHIR Bundle. */
function extractResources(bundle: unknown): Record<string, unknown>[] {
  if (!bundle || typeof bundle !== "object") return [];
  const b = bundle as { entry?: Array<{ resource?: unknown }> };
  return (b.entry ?? [])
    .map((e) => e.resource)
    .filter((r): r is Record<string, unknown> => !!r && typeof r === "object");
}

/** Check if a Condition bundle contains an active breast cancer diagnosis. */
function hasBreastCancer(conditionsBundle: unknown): boolean {
  const resources = extractResources(conditionsBundle);
  return resources.some((r) => {
    if (r.resourceType !== "Condition") return false;
    const codings = (r.code as { coding?: Array<{ system?: string; code?: string }> })?.coding ?? [];
    return codings.some(
      (c) => c.system === SNOMED && c.code === BREAST_CANCER_CODE
    );
  });
}

/** Check if an Observation bundle has any entries. */
function hasObservation(bundle: unknown): boolean {
  return extractResources(bundle).length > 0;
}

// ECOG SNOMED grade code → integer score
const ECOG_SNOMED_GRADES: Record<string, number> = {
  "425389002": 0,
  "422512005": 1,
  "422894000": 2,
  "423053003": 3,
};

/** Extract the integer ECOG score from an ECOG observation bundle. */
function extractEcogScore(ecogBundle: unknown): number | undefined {
  const resources = extractResources(ecogBundle);
  for (const obs of resources) {
    if (obs.resourceType !== "Observation") continue;
    if (typeof obs.valueInteger === "number") return obs.valueInteger;
    const vc = obs.valueCodeableConcept as { coding?: Array<{ code?: string }> } | undefined;
    if (vc?.coding?.length) {
      const code = vc.coding[0]?.code ?? "";
      if (code in ECOG_SNOMED_GRADES) return ECOG_SNOMED_GRADES[code];
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Coverage evaluation
// ---------------------------------------------------------------------------

export type CheckResult =
  | { status: "authorization-satisfied"; reason: string }
  | { status: "pa-required"; reason: string }
  | { status: "dtr-required"; missingKeys: string[] };

export interface OncologyContext {
  conditions: unknown;
  her2: unknown;
  cancerStage: unknown;
  ecogPs: unknown;
  priorTherapy: unknown;
}

/**
 * Evaluate coverage policy for a breast cancer regimen.
 *
 * Checks that all required oncology data elements are present from the
 * EHR FHIR server queries. If all present and criteria are met, returns
 * "authorization-satisfied". If any required data is missing, returns
 * "dtr-required" with the list of missing data categories.
 */
export function evaluateBreastCancerPolicy(ctx: OncologyContext): CheckResult {
  const missingKeys: string[] = [];

  if (!hasBreastCancer(ctx.conditions)) missingKeys.push("breastCancer");
  if (!hasObservation(ctx.her2)) missingKeys.push("her2");
  if (!hasObservation(ctx.cancerStage)) missingKeys.push("cancerStage");
  if (!hasObservation(ctx.ecogPs)) missingKeys.push("ecogPs");

  if (missingKeys.length > 0) {
    return { status: "dtr-required", missingKeys };
  }

  // All required data present — evaluate authorization level based on ECOG.
  // ECOG 0 (fully active) → pre-authorized, PA can be bypassed.
  // ECOG ≥ 1 → prior authorization is required before fulfillment.
  const ecogScore = extractEcogScore(ctx.ecogPs);

  if (ecogScore === 0) {
    return {
      status: "authorization-satisfied",
      reason:
        "All required oncology context present and coverage criteria met. " +
        "ECOG Performance Status is 0 (fully active). Prior authorization " +
        "conditions have been evaluated and PA can be bypassed.",
    };
  }

  return {
    status: "pa-required",
    reason:
      `All required oncology context is present, but ECOG Performance Status ` +
      `is ${ecogScore ?? "unknown"} (≥ 1). A formal prior authorization ` +
      `request must be submitted before fulfillment.`,
  };
}

// ---------------------------------------------------------------------------
// Card builders — matching the MOPA spec card patterns
// ---------------------------------------------------------------------------

const DTR_CLIENT_URL = process.env.DTR_CLIENT_URL ?? "http://localhost:4004";

function buildCardSource() {
  return {
    label: CRD_SERVICE_TITLE,
    url: `http://localhost:${process.env.PORT ?? CRD_DEFAULT_PORT}/api/cds-services`,
  };
}

export function buildAuthorizationSatisfiedCard(detail?: string): CdsCard {
  return {
    summary: "Authorization Satisfied",
    detail:
      detail ??
      "All required oncology context has been retrieved from the EHR and coverage " +
      "criteria are met. Prior authorization conditions have been evaluated and " +
      "prior authorization can be bypassed.",
    indicator: "success",
    source: {
      ...buildCardSource(),
      topic: {
        system: "http://hl7.org/fhir/us/davinci-crd/CodeSystem/temp",
        code: "coverage-information",
        display: "Coverage Information",
      },
    },
  };
}

export function buildPaRequiredCard(detail?: string): CdsCard {
  return {
    summary: "Prior Authorization Required",
    detail:
      detail ??
      "All required oncology context has been retrieved from the EHR and coverage " +
      "criteria are met, but prior authorization is required before fulfillment. " +
      "Submit a PA request to the payer for a coverage determination.",
    indicator: "warning",
    source: {
      ...buildCardSource(),
      topic: {
        system: "http://hl7.org/fhir/us/davinci-crd/CodeSystem/temp",
        code: "prior-auth-required",
        display: "Prior Authorization Required",
      },
    },
  };
}

export function buildDtrCard(missingKeys: string[]): CdsCard {
  const missingDisplay = missingKeys.map((k) => MISSING_KEY_LABELS[k] ?? k).join(", ");

  const appContext = JSON.stringify({
    missingDataElements: missingKeys,
  });

  return {
    summary: "Documentation Required",
    detail:
      `The following clinical data is needed to evaluate this order: **${missingDisplay}**. ` +
      "Launch the documentation app to provide the missing information.",
    indicator: "warning",
    source: buildCardSource(),
    links: [
      {
        label: "Complete Prior Authorization Documentation (DTR)",
        url: `${DTR_CLIENT_URL}/launch`,
        type: "smart",
        appContext,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Main hook handler
// ---------------------------------------------------------------------------

export async function handleOncologyCrd(
  request: CdsRequest<Record<string, unknown>>
): Promise<CdsResponse> {
  const patientId = (request.context.patientId as string) ?? "unknown";
  const fhirBase = request.fhirServer;
  const bearerToken = request.fhirAuthorization?.access_token;

  // If no fhirServer is provided, we cannot query for patient context.
  if (!fhirBase) {
    return {
      cards: [
        {
          summary: "No applicable coverage policy",
          detail:
            "No FHIR server access available. The CRD service requires fhirAuthorization " +
            "to query for oncology patient context. Proceed with standard ordering.",
          indicator: "info",
          source: { label: CRD_SERVICE_TITLE },
        },
      ],
    };
  }

  // Query the EHR FHIR server for oncology patient context.
  const queryResults = await Promise.all(
    Object.entries(FHIR_QUERIES).map(async ([key, queryFn]) => {
      const query = queryFn(patientId);
      const bundle = await fetchBundle(fhirBase, query, bearerToken);
      return [key, bundle] as const;
    })
  );

  const ctx: OncologyContext = {
    conditions: queryResults.find(([k]) => k === "conditions")?.[1] ?? null,
    her2: queryResults.find(([k]) => k === "her2")?.[1] ?? null,
    cancerStage: queryResults.find(([k]) => k === "cancerStage")?.[1] ?? null,
    ecogPs: queryResults.find(([k]) => k === "ecogPs")?.[1] ?? null,
    priorTherapy: queryResults.find(([k]) => k === "priorTherapy")?.[1] ?? null,
  };

  // Check if patient has breast cancer — only breast cancer policy is implemented.
  if (!hasBreastCancer(ctx.conditions)) {
    return {
      cards: [
        {
          summary: "No applicable coverage policy",
          detail:
            "No oncology coverage policy is registered for the patient's primary condition. " +
            "Proceed with standard ordering.",
          indicator: "info",
          source: { label: CRD_SERVICE_TITLE },
        },
      ],
    };
  }

  // Evaluate the breast cancer coverage policy.
  const result = evaluateBreastCancerPolicy(ctx);

  if (result.status === "authorization-satisfied") {
    return { cards: [buildAuthorizationSatisfiedCard(result.reason)] };
  }

  if (result.status === "pa-required") {
    return { cards: [buildPaRequiredCard(result.reason)] };
  }

  return { cards: [buildDtrCard(result.missingKeys)] };
}
