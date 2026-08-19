/**
 * Payer policy evaluation.
 *
 * Fetches the patient's clinical observations from the EHR FHIR proxy and
 * evaluates coverage criteria to produce a prior-authorization determination.
 *
 * The shared terminology constants, FHIR query templates, and evaluation
 * helpers live in `@mopa/oncology-policy` so the payer backend and the CRD
 * service reason over identical rules. Bundle fetching and shaping helpers
 * come from `@mopa/fhir-client` (re-exported through oncology-policy).
 */

import {
  FHIR_QUERIES,
  REGIMENS,
  RXNORM,
  evaluateBreastCancerPolicy,
  extractResources,
  hasBreastCancer,
  hasObservation,
  toBundle,
  type BiosimilarAlternative,
  type OncologyContext,
  type Regimen,
} from "@mopa/oncology-policy";

const EHR_FHIR_BASE = process.env.EHR_FHIR_BASE_URL ?? "http://localhost:4001/api/fhir";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A required drug substitution from the payer. */
export interface DrugSubstitution {
  originalRxnorm: string;
  originalDisplay: string;
  substitutedRxnorm: string;
  substitutedDisplay: string;
  rationale: string;
}

export interface PaDecision {
  status: "approved" | "pended" | "denied";
  reason: string;
  /** Required substitutions when the payer modifies the ordered regimen. */
  substitutions?: DrugSubstitution[];
}

// ---------------------------------------------------------------------------
// Bundle fetching
// ---------------------------------------------------------------------------

/** Fetch a FHIR search Bundle and return its resource entries. */
async function getBundleResources(url: string): Promise<Record<string, unknown>[]> {
  try {
    const res = await fetch(`${EHR_FHIR_BASE}/${url}`);
    if (!res.ok) return [];
    const bundle = await res.json();
    return extractResources(bundle);
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Biosimilar substitution logic
// ---------------------------------------------------------------------------

/**
 * Find all biosimilar substitutions required by the payer for a given regimen.
 *
 * Walks the regimen's drugs and collects any that have a `biosimilars` entry.
 * In the demo, the ddAC-T regimen carries pegfilgrastim → Udenyca step therapy.
 */
function findBiosimilarSubstitutions(regimen: Regimen): DrugSubstitution[] {
  const subs: DrugSubstitution[] = [];
  for (const phase of regimen.phases) {
    for (const drug of phase.drugs) {
      if (drug.biosimilars?.length) {
        // Use the first listed biosimilar as the required substitution
        const bio: BiosimilarAlternative = drug.biosimilars[0];
        subs.push({
          originalRxnorm: drug.rxnorm,
          originalDisplay: drug.display,
          substitutedRxnorm: bio.rxnorm,
          substitutedDisplay: bio.display,
          rationale: bio.rationale,
        });
      }
    }
  }
  return subs;
}

// ---------------------------------------------------------------------------
// Policy evaluation
// ---------------------------------------------------------------------------

/**
 * Evaluate the payer policy against live patient data.
 *
 * Returns "approved" when all required clinical data is present and the
 * regimen meets policy criteria, "pended" when the determination is
 * incomplete, and "denied" when the policy explicitly rejects the request.
 *
 * When the payer requires biosimilar substitution, the `substitutions` array
 * is populated so the caller can surface the modification to the clinician.
 */
export async function evaluatePolicy(
  patientId: string,
  regimenId?: string,
): Promise<PaDecision> {
  const [conditions, her2, stage, ecog] = await Promise.all([
    getBundleResources(FHIR_QUERIES.conditions(patientId)),
    getBundleResources(FHIR_QUERIES.her2(patientId)),
    getBundleResources(FHIR_QUERIES.cancerStage(patientId)),
    getBundleResources(FHIR_QUERIES.ecogPs(patientId)),
  ]);

  const ctx: OncologyContext = {
    conditions: toBundle(conditions),
    her2: toBundle(her2),
    cancerStage: toBundle(stage),
    ecogPs: toBundle(ecog),
    priorTherapy: toBundle([]),
  };

  // No active breast cancer diagnosis → pended for manual review.
  if (!hasBreastCancer(ctx.conditions)) {
    return {
      status: "pended",
      reason: "No active breast cancer diagnosis found. Pending manual review.",
    };
  }

  // Missing required observation data → pended for manual review.
  const missing: string[] = [];
  if (!hasObservation(ctx.her2)) missing.push("HER2 status");
  if (!hasObservation(ctx.cancerStage)) missing.push("Cancer stage");
  if (!hasObservation(ctx.ecogPs)) missing.push("ECOG performance status");

  if (missing.length > 0) {
    return {
      status: "pended",
      reason: `Missing required data: ${missing.join(", ")}. Pending manual review.`,
    };
  }

  // All required data present — evaluate the shared policy and translate the
  // CRD-style result into a payer determination.
  const result = evaluateBreastCancerPolicy(ctx);

  if (result.status === "authorization-satisfied") {
    // Check for required biosimilar substitutions based on the ordered regimen.
    const regimen = regimenId
      ? REGIMENS.find((r) => r.id === regimenId)
      : undefined;

    const substitutions = regimen ? findBiosimilarSubstitutions(regimen) : [];

    if (substitutions.length > 0) {
      const subText = substitutions
        .map((s) => `${s.originalDisplay} → ${s.substitutedDisplay}`)
        .join("; ");
      return {
        status: "approved",
        reason:
          `All clinical criteria met per payer policy. Authorization satisfied ` +
          `with required substitution: ${subText}.`,
        substitutions,
      };
    }

    return {
      status: "approved",
      reason: "All clinical criteria met per payer policy. Authorization satisfied.",
    };
  }

  // pa-required → the payer still needs a formal submission; pended mirrors
  // the prior behavior where the determination is not yet final.
  if (result.status === "pa-required") {
    return {
      status: "pended",
      reason: result.reason,
    };
  }

  // dtr-required should be unreachable here because we already handled missing
  // data above, but keep a defensive branch for safety.
  return {
    status: "pended",
    reason: "Additional documentation is required before a determination can be made.",
  };
}
