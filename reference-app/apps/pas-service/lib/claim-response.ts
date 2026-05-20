/**
 * FHIR ClaimResponse builder for prior-authorization determinations.
 *
 * Phase 7 stub — captures the essential FHIR fields without implementing
 * the full Da Vinci PAS ClaimResponse profile.
 */

export interface PaDecision {
  status: "approved" | "pended" | "denied";
  reason: string;
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

export function buildClaimResponse(id: string, decision: PaDecision): object {
  return {
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
    ...(decision.status === "denied" && {
      error: [
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
      ],
    }),
  };
}
