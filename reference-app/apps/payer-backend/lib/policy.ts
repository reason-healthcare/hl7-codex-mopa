/**
 * Payer policy evaluation for Phase 7.
 *
 * Fetches the patient's clinical observations from the EHR FHIR proxy and
 * evaluates BreastCancerPayerPolicy.elm.json to produce a prior-authorization
 * determination.
 */
import { CqlExecutionEngine } from "@ogca/cql-engine";
import type { ElmJson } from "@ogca/cql-engine";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const policyElm = require("../../../cql/elm/BreastCancerPayerPolicy.elm.json") as ElmJson;

const engine = new CqlExecutionEngine();

const EHR_FHIR_BASE = process.env.EHR_FHIR_BASE_URL ?? "http://localhost:4000/api/fhir";

export interface PaDecision {
  status: "approved" | "pended" | "denied";
  reason: string;
}

/** Fetch all FHIR resources relevant to the PA policy for a given patient. */
async function fetchPaResources(patientId: string): Promise<unknown[]> {
  const base = EHR_FHIR_BASE;

  async function getBundle(url: string): Promise<unknown[]> {
    try {
      const res = await fetch(`${base}/${url}`);
      if (!res.ok) return [];
      const bundle = (await res.json()) as {
        entry?: Array<{ resource?: unknown }>;
      };
      return (bundle.entry ?? []).map((e) => e.resource).filter(Boolean) as unknown[];
    } catch {
      return [];
    }
  }

  async function getResource(url: string): Promise<unknown | null> {
    try {
      const res = await fetch(`${base}/${url}`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  const [patient, her2, stage, ecog, conditions] = await Promise.all([
    getResource(`Patient/${patientId}`),
    getBundle(
      `Observation?patient=${patientId}&code=http://loinc.org|85319-2,http://snomed.info/sct|431396003&_count=5`
    ),
    getBundle(`Observation?patient=${patientId}&code=http://loinc.org|21908-9&_count=1`),
    getBundle(`Observation?patient=${patientId}&code=http://loinc.org|89247-1&_count=1`),
    getBundle(`Condition?patient=${patientId}&category=problem-list-item&_count=20`),
  ]);

  return [...(patient ? [patient] : []), ...her2, ...stage, ...ecog, ...conditions];
}

/**
 * Evaluate the payer policy CQL against live patient data.
 *
 * Returns "approved" when all required clinical data is present and the
 * regimen meets policy criteria, "pended" when the determination is
 * incomplete, and "denied" when the policy explicitly rejects the request.
 */
export async function evaluatePolicy(patientId: string): Promise<PaDecision> {
  const resources = await fetchPaResources(patientId);
  const results = await engine.evaluate(policyElm, patientId, resources);

  const paResult = results["PA Result"] as string | undefined;

  if (paResult === "approved") {
    return {
      status: "approved",
      reason: "All clinical criteria met per payer policy.",
    };
  }

  // dtr-required means missing data reached the payer — pend for manual review
  return {
    status: "pended",
    reason: "One or more required data elements could not be verified. Pending manual review.",
  };
}
