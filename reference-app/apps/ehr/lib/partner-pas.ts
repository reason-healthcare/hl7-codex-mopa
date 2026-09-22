import { DEMO_CASES, REGIMENS } from "@mopa/oncology-policy";
import { partnerToken } from "./partner-crd";

type Resource = Record<string, any>;
type Entry = { fullUrl?: string; resource?: Resource };

const PAS = "http://hl7.org/fhir/us/davinci-pas/StructureDefinition/";
const DTR = "http://hl7.org/fhir/us/davinci-dtr/StructureDefinition/";
const MOPA_REQUEST_GROUP =
  "https://connectathon.hike.health/fhir/StructureDefinition/mopa-request-group";

function fail(message: string): never {
  throw new Error(message);
}

function references(actions: Resource[] = []): string[] {
  return actions.flatMap((action) => [
    ...(action.resource?.reference ? [action.resource.reference as string] : []),
    ...references(action.action),
  ]);
}

export function validateSignedOrders(patientId: string, regimenId: string, draftOrders: unknown) {
  if (!DEMO_CASES.some((demo) => demo.patientId === patientId)) fail("Unknown synthetic patient");
  const regimen = REGIMENS.find((item) => item.id === regimenId);
  if (!regimen) fail("Unknown synthetic regimen");
  const bundle = draftOrders as Resource;
  if (
    bundle?.resourceType !== "Bundle" ||
    bundle.type !== "collection" ||
    !Array.isArray(bundle.entry)
  )
    fail("Signed order Bundle required");
  const entries = bundle.entry as Entry[];
  const groups = entries.filter((entry) => entry.resource?.resourceType === "RequestGroup");
  const medications = entries.filter(
    (entry) => entry.resource?.resourceType === "MedicationRequest"
  );
  if (
    groups.length !== 1 ||
    medications.length === 0 ||
    groups.length + medications.length !== entries.length
  )
    fail("Signed regimen must contain one RequestGroup and its medications");
  const group = structuredClone(groups[0].resource!);
  if (
    group.id !== `rg-${regimenId}` ||
    group.subject?.reference !== `Patient/${patientId}` ||
    !group.instantiatesCanonical?.includes(regimen.canonicalUrl)
  )
    fail("Signed regimen does not match selected patient and regimen");
  const index = new Map<string, Resource>();
  const normalized = medications.map((entry) => {
    const med = structuredClone(entry.resource!);
    const fullUrl = entry.fullUrl;
    if (
      !fullUrl ||
      !/^urn:uuid:[A-Za-z0-9-]+$/.test(fullUrl) ||
      med.subject?.reference !== `Patient/${patientId}` ||
      !med.medicationCodeableConcept?.coding?.length
    )
      fail("Invalid signed medication component");
    med.id ??= fullUrl.slice("urn:uuid:".length);
    if (index.has(fullUrl) || index.has(`MedicationRequest/${med.id}`))
      fail("Duplicate medication reference");
    index.set(fullUrl, med);
    index.set(`MedicationRequest/${med.id}`, med);
    return med;
  });
  const refs = references(group.action);
  const linked = refs.map((ref) => index.get(ref));
  if (
    refs.length !== medications.length ||
    linked.some((med) => !med) ||
    new Set(linked).size !== medications.length
  )
    fail("Signed regimen medication references are incomplete");
  return { group, medications: normalized };
}

function extensionReference(resource: Resource, url: string): string | undefined {
  return resource.extension?.find((extension: Resource) => extension.url === url)?.valueReference
    ?.reference;
}

async function fhirGet(path: string): Promise<Resource> {
  const base = (process.env.FHIR_BASE_URL ?? "http://localhost:8080/fhir").replace(/\/$/, "");
  const response = await fetch(`${base}/${path}`, { headers: { "Cache-Control": "no-cache" } });
  if (!response.ok) fail(`FHIR evidence unavailable: ${path} (HTTP ${response.status})`);
  return (await response.json()) as Resource;
}

export async function buildPartnerPasBundle(input: {
  patientId: string;
  regimenId: string;
  draftOrders: unknown;
  claimId?: string;
}) {
  const { patientId, regimenId } = input;
  const { group, medications } = validateSignedOrders(patientId, regimenId, input.draftOrders);
  const signedEntries = (input.draftOrders as Resource).entry as Entry[];
  const medRefs = new Map(
    signedEntries
      .filter((entry) => entry.resource?.resourceType === "MedicationRequest")
      .map((entry, index) => [entry.fullUrl, `MedicationRequest/${medications[index].id}`])
  );
  function makeRelative(actions: Resource[] = []) {
    for (const action of actions) {
      if (action.resource?.reference && medRefs.has(action.resource.reference))
        action.resource.reference = medRefs.get(action.resource.reference);
      makeRelative(action.action);
    }
  }
  // The partner's PAS evidence extractor retains resource ids but discards
  // Bundle fullUrls; point regimen actions at the same meds by relative id.
  makeRelative(group.action);
  const patient = await fhirGet(`Patient/${encodeURIComponent(patientId)}`);
  const qrSearch = await fhirGet(
    `QuestionnaireResponse?subject=Patient/${encodeURIComponent(patientId)}&_count=100`
  );
  const responses = (qrSearch.entry ?? [])
    .map((entry: Entry) => entry.resource)
    .filter(
      (qr: Resource | undefined) =>
        qr?.resourceType === "QuestionnaireResponse" &&
        qr.status === "completed" &&
        qr.subject?.reference === `Patient/${patientId}` &&
        extensionReference(qr, `${DTR}qr-context`) === `RequestGroup/${group.id}`
    )
    .sort((a: Resource, b: Resource) =>
      String(b.meta?.lastUpdated ?? "").localeCompare(String(a.meta?.lastUpdated ?? ""))
    );
  const questionnaireResponse = responses[0] as Resource | undefined;
  const qrCoverage =
    questionnaireResponse && extensionReference(questionnaireResponse, `${DTR}qr-coverage`);
  let coverage: Resource | undefined;
  if (qrCoverage && /^Coverage\/[A-Za-z0-9.-]+$/.test(qrCoverage)) {
    coverage = await fhirGet(qrCoverage);
  } else {
    const found = await fhirGet(
      `Coverage?patient=${encodeURIComponent(patientId)}&status=active&_count=100`
    );
    coverage = found.entry
      ?.map((entry: Entry) => entry.resource)
      .find(
        (resource: Resource | undefined) =>
          resource?.status === "active" &&
          resource.beneficiary?.reference === `Patient/${patientId}`
      );
  }
  if (
    !coverage?.id ||
    coverage.status !== "active" ||
    coverage.beneficiary?.reference !== `Patient/${patientId}`
  )
    fail("No matching active Coverage for PAS");
  const payorReference = coverage.payor?.find((payor: Resource) =>
    /^Organization\/[A-Za-z0-9.-]+$/.test(payor.reference)
  )?.reference as string | undefined;
  if (!payorReference) fail("Coverage has no resolvable payer Organization");
  const organization = await fhirGet(payorReference);
  const claimId = input.claimId ?? `claim-${crypto.randomUUID()}`;
  if (!/^claim-[A-Za-z0-9-]{8,}$/.test(claimId)) fail("Invalid synthetic claim identifier");
  const claim: Resource = {
    resourceType: "Claim",
    id: claimId,
    meta: { profile: [`${PAS}profile-claim|2.2.1`] },
    identifier: [{ system: "urn:trnorg:5", value: claimId }],
    status: "active",
    use: "preauthorization",
    type: {
      coding: [{ system: "http://terminology.hl7.org/CodeSystem/claim-type", code: "pharmacy" }],
    },
    patient: { reference: `Patient/${patientId}` },
    insurer: { reference: payorReference },
    provider: { reference: "PractitionerRole/practitioner-1" },
    priority: { coding: [{ code: "normal" }] },
    insurance: [{ sequence: 1, focal: true, coverage: { reference: `Coverage/${coverage.id}` } }],
    extension: [
      { url: MOPA_REQUEST_GROUP, valueReference: { reference: `RequestGroup/${group.id}` } },
    ],
    item: medications.map((med, index) => ({
      sequence: index + 1,
      productOrService: med.medicationCodeableConcept,
      locationCodeableConcept: {
        coding: [
          {
            system:
              "https://www.cms.gov/Medicare/Coding/place-of-service-codes/Place_of_Service_Code_Set",
            code: "22",
          },
        ],
      },
      extension: [
        {
          url: `${PAS}extension-requestedService`,
          valueReference: { reference: `MedicationRequest/${med.id}` },
        },
      ],
    })),
  };
  const resources = [
    claim,
    group,
    ...medications,
    patient,
    coverage,
    organization,
    { resourceType: "PractitionerRole", id: "practitioner-1" },
    ...(questionnaireResponse ? [questionnaireResponse] : []),
  ];
  return {
    resourceType: "Bundle",
    id: `pas-${claimId}`,
    meta: { profile: [`${PAS}profile-pas-request-bundle|2.2.1`] },
    identifier: { system: "urn:hike:mopa", value: claimId },
    type: "collection",
    entry: resources.map((resource) => ({ fullUrl: `urn:uuid:${crypto.randomUUID()}`, resource })),
  };
}

export function summarizePartnerPas(payload: unknown) {
  const bundle = payload as Resource;
  const response = bundle?.entry
    ?.map((entry: Entry) => entry.resource)
    .find((resource: Resource | undefined) => resource?.resourceType === "ClaimResponse") as
    | Resource
    | undefined;
  if (!response) fail("Partner PAS response omitted ClaimResponse");
  const action = response.item?.[0]?.adjudication?.[0]?.extension
    ?.flatMap((extension: Resource) => extension.extension ?? [])
    ?.find((extension: Resource) => extension.url === `${PAS}extension-reviewActionCode`)
    ?.valueCodeableConcept?.coding?.[0];
  if (!action?.code) fail("Partner PAS response omitted X12 review action");
  return {
    outcome: response.outcome as string,
    disposition: response.disposition as string | undefined,
    preAuthRef: response.preAuthRef as string | undefined,
    reviewActionCode: action.code as string,
    reviewActionDisplay: action.display as string | undefined,
  };
}

export async function submitPartnerPas(bundle: Resource) {
  const base = process.env.PAS_PARTNER_BASE_URL?.replace(/\/$/, "");
  if (!base) fail("PAS_PARTNER_BASE_URL is not configured");
  const response = await fetch(`${base}/Claim/$submit`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await partnerToken()}`,
      Accept: "application/fhir+json",
      "Content-Type": "application/fhir+json",
    },
    body: JSON.stringify(bundle),
  });
  const payload = await response.json().catch(() => ({ error: "Non-JSON partner PAS response" }));
  return { status: response.status, payload };
}

export async function inquirePartnerPas(bundle: Resource) {
  const base = process.env.PAS_PARTNER_BASE_URL?.replace(/\/$/, "");
  if (!base) fail("PAS_PARTNER_BASE_URL is not configured");
  const response = await fetch(`${base}/Claim/$inquire`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${await partnerToken()}`,
      Accept: "application/fhir+json",
      "Content-Type": "application/fhir+json",
    },
    body: JSON.stringify(bundle),
  });
  const payload = await response.json().catch(() => ({ error: "Non-JSON partner PAS response" }));
  return { status: response.status, payload };
}
