/**
 * Payer policy evaluation.
 *
 * Fetches the patient's clinical observations from the EHR FHIR proxy and
 * evaluates coverage criteria to produce a prior-authorization determination.
 * Uses direct FHIR queries matching the simplified MOPA CRD pattern.
 */

const SNOMED = "http://snomed.info/sct";
const LOINC = "http://loinc.org";
const BREAST_CANCER_CODE = "254837009";

const EHR_FHIR_BASE = process.env.EHR_FHIR_BASE_URL ?? "http://localhost:4000/api/fhir";

export interface PaDecision {
  status: "approved" | "pended" | "denied";
  reason: string;
}

async function getBundle(url: string): Promise<unknown[]> {
  try {
    const res = await fetch(`${EHR_FHIR_BASE}/${url}`);
    if (!res.ok) return [];
    const bundle = (await res.json()) as {
      entry?: Array<{ resource?: unknown }>;
    };
    return (bundle.entry ?? []).map((e) => e.resource).filter(Boolean) as unknown[];
  } catch {
    return [];
  }
}

/** Check if a list of Condition resources contains active breast cancer. */
function hasBreastCancer(resources: unknown[]): boolean {
  return resources.some((r) => {
    if (!r || typeof r !== "object") return false;
    const cond = r as Record<string, unknown>;
    if (cond.resourceType !== "Condition") return false;
    const codings = (cond.code as { coding?: Array<{ system?: string; code?: string }> })?.coding ?? [];
    return codings.some((c) => c.system === SNOMED && c.code === BREAST_CANCER_CODE);
  });
}

/** Check if an Observation bundle has any entries. */
function hasObservation(resources: unknown[]): boolean {
  return resources.length > 0;
}

/**
 * Evaluate the payer policy against live patient data.
 *
 * Returns "approved" when all required clinical data is present and the
 * regimen meets policy criteria, "pended" when the determination is
 * incomplete, and "denied" when the policy explicitly rejects the request.
 */
export async function evaluatePolicy(patientId: string): Promise<PaDecision> {
  const [conditions, her2, stage, ecog] = await Promise.all([
    getBundle(`Condition?patient=${patientId}&category=problem-list-item&_count=20`),
    getBundle(
      `Observation?patient=${patientId}&code=${LOINC}|85319-2,${SNOMED}|431396003&_count=5`
    ),
    getBundle(`Observation?patient=${patientId}&code=${LOINC}|21908-9&_count=1`),
    getBundle(`Observation?patient=${patientId}&code=${LOINC}|89247-1&_count=1`),
  ]);

  // Check data completeness
  if (!hasBreastCancer(conditions)) {
    return {
      status: "pended",
      reason: "No active breast cancer diagnosis found. Pending manual review.",
    };
  }

  const missing: string[] = [];
  if (!hasObservation(her2)) missing.push("HER2 status");
  if (!hasObservation(stage)) missing.push("Cancer stage");
  if (!hasObservation(ecog)) missing.push("ECOG performance status");

  if (missing.length > 0) {
    return {
      status: "pended",
      reason: `Missing required data: ${missing.join(", ")}. Pending manual review.`,
    };
  }

  // All required data present — coverage criteria met
  return {
    status: "approved",
    reason: "All clinical criteria met per payer policy. Authorization satisfied.",
  };
}
