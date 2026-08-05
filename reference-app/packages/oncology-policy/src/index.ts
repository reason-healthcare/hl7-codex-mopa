/**
 * @mopa/oncology-policy — shared oncology coverage policy primitives.
 *
 * This package centralizes the terminology constants, FHIR query templates,
 * and pure evaluation helpers that are reused by both the CRD service
 * (coverage requirements determination) and the payer backend
 * (prior-authorization adjudication). Keeping the policy logic in one place
 * guarantees the two services reason over identical rules.
 *
 * Everything exported here is framework-agnostic and side-effect free so it
 * can be unit tested without a Next.js request context.
 */

// ---------------------------------------------------------------------------
// Terminology constants
// ---------------------------------------------------------------------------

export const SNOMED = "http://snomed.info/sct";
export const LOINC = "http://loinc.org";

/** Breast cancer SNOMED code used to identify the applicable coverage policy. */
export const BREAST_CANCER_CODE = "372137005";

/** LOINC codes for the observation queries issued by the policy. */
export const HER2_LOINC = "85319-2";
export const HER2_SNOMED = "431396003";
export const STAGE_LOINC = "21908-9";
export const ECOG_LOINC = "89247-1";

// ---------------------------------------------------------------------------
// FHIR query templates
// ---------------------------------------------------------------------------

/**
 * FHIR search queries the CRD service issues against the EHR FHIR server.
 * Each template takes a patient id and returns the relative search URL.
 */
export const FHIR_QUERIES: Record<string, (patientId: string) => string> = {
  conditions: (id) => `Condition?patient=${id}&category=problem-list-item&_count=20`,
  her2: (id) =>
    `Observation?patient=${id}&code=${LOINC}|${HER2_LOINC},${SNOMED}|${HER2_SNOMED}&_sort=-date&_count=5`,
  cancerStage: (id) =>
    `Observation?patient=${id}&code=${LOINC}|${STAGE_LOINC}&_sort=-date&_count=1`,
  ecogPs: (id) =>
    `Observation?patient=${id}&code=${LOINC}|${ECOG_LOINC}&_sort=-date&_count=1`,
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
// FHIR Bundle helpers — re-exported from @mopa/fhir-client
// ---------------------------------------------------------------------------

import { extractResources, toBundle, fetchBundle } from "@mopa/fhir-client";

export { extractResources, toBundle, fetchBundle };

// ---------------------------------------------------------------------------
// Policy evaluation primitives
// ---------------------------------------------------------------------------

/** Check if a Condition bundle contains an active breast cancer diagnosis. */
export function hasBreastCancer(conditionsBundle: unknown): boolean {
  const resources = extractResources(conditionsBundle);
  return resources.some((r) => {
    if (r.resourceType !== "Condition") return false;
    const codings = (r.code as { coding?: Array<{ system?: string; code?: string }> })?.coding ?? [];
    return codings.some((c) => c.system === SNOMED && c.code === BREAST_CANCER_CODE);
  });
}

/** Check if an Observation bundle has any entries. */
export function hasObservation(bundle: unknown): boolean {
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
export function extractEcogScore(ecogBundle: unknown): number | undefined {
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
