/**
 * FHIR ClaimResponse builder for prior-authorization determinations.
 *
 * Captures the essential FHIR fields without implementing the full Da Vinci
 * PAS ClaimResponse profile. When the payer requires biosimilar substitution,
 * the substitution details are included in the disposition text and as
 * processNote entries so the ordering clinician can see what changed.
 */

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

/** Minimal typed shape for the ClaimResponse we build. */
export interface FhirClaimResponse {
  resourceType: "ClaimResponse";
  id: string;
  status: string;
  type: { coding: Array<{ system: string; code: string; display: string }> };
  use: string;
  created: string;
  outcome: string;
  disposition: string;
  error?: Array<{ code: { coding: Array<{ system: string; code: string; display: string }> } }>;
  /** Process notes carrying substitution details when the payer modifies the order. */
  processNote?: Array<{ text: string }>;
}

const OUTCOME_MAP: Record<PaDecision["status"], string> = {
  approved: "complete",
  pended: "queued",
  denied: "error",
};

const DISPOSITION_LABEL: Record<PaDecision["status"], string> = {
  approved: "Approved",
  pended: "Pending additional review",
  denied: "Denied",
};

/**
 * Build substitution processNote entries for the ClaimResponse.
 * Each substitution becomes a human-readable note.
 */
function buildSubstitutionNotes(
  substitutions: DrugSubstitution[],
): Array<{ text: string }> {
  return substitutions.map((s) => ({
    text: `Substitution required: ${s.originalDisplay} (RxNorm ${s.originalRxnorm}) → ${s.substitutedDisplay} (RxNorm ${s.substitutedRxnorm}). ${s.rationale}`,
  }));
}

export function buildClaimResponse(id: string, decision: PaDecision): FhirClaimResponse {
  const base: FhirClaimResponse = {
    resourceType: "ClaimResponse",
    id,
    status: "active",
    type: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/claim-type",
          code: "pharmacy",
          display: "Pharmacy",
        },
      ],
    },
    use: "preauthorization",
    created: new Date().toISOString().slice(0, 10),
    outcome: OUTCOME_MAP[decision.status],
    disposition: `${DISPOSITION_LABEL[decision.status]} — ${decision.reason}`,
  };

  if (decision.status === "denied") {
    base.error = [
      {
        code: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/adjudication-error",
              code: "a001",
              display: "Policy criteria not met",
            },
          ],
        },
      },
    ];
  }

  // Carry substitution details as processNote entries when the payer
  // modifies the ordered regimen (e.g. biosimilar substitution).
  if (decision.substitutions?.length) {
    base.processNote = buildSubstitutionNotes(decision.substitutions);
  }

  return base;
}
