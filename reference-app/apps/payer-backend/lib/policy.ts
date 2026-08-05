/**
 * Payer policy evaluation.
 *
 * Fetches the patient's clinical observations from the EHR FHIR proxy and
 * evaluates coverage criteria to produce a prior-authorization determination.
 *
 * The shared terminology constants, FHIR query templates, and evaluation
 * helpers live in `@mopa/oncology-policy` so the payer backend and the CRD
 * service reason over identical rules.
 */

import {
  FHIR_QUERIES,
  evaluateBreastCancerPolicy,
  hasBreastCancer,
  hasObservation,
  type OncologyContext,
} from "@mopa/oncology-policy";

const EHR_FHIR_BASE = process.env.EHR_FHIR_BASE_URL ?? "http://localhost:4001/api/fhir";

export interface PaDecision {
  status: "approved" | "pended" | "denied";
  reason: string;
}

/** Fetch a FHIR search Bundle and return its resource entries. */
async function getBundle(url: string): Promise<Record<string, unknown>[]> {
  try {
    const res = await fetch(`${EHR_FHIR_BASE}/${url}`);
    if (!res.ok) return [];
    const bundle = (await res.json()) as {
      entry?: Array<{ resource?: unknown }>;
    };
    return (bundle.entry ?? [])
      .map((e) => e.resource)
      .filter((r): r is Record<string, unknown> => !!r && typeof r === "object");
  } catch {
    return [];
  }
}

/** Wrap raw resource arrays back into a Bundle-shaped object for the shared helpers. */
function toBundle(resources: Record<string, unknown>[]) {
  return {
    resourceType: "Bundle",
    type: "searchset",
    total: resources.length,
    entry: resources.map((resource) => ({ resource })),
  };
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
    getBundle(FHIR_QUERIES.conditions(patientId)),
    getBundle(FHIR_QUERIES.her2(patientId)),
    getBundle(FHIR_QUERIES.cancerStage(patientId)),
    getBundle(FHIR_QUERIES.ecogPs(patientId)),
  ]);

  // Reuse the shared policy primitives. The CRD service feeds FHIR Bundles
  // into these same helpers, so we wrap our resource arrays back into a
  // Bundle shape to keep the contract identical.
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
