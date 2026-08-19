import { type NextRequest, NextResponse } from "next/server";
import { evaluateGuideline } from "../../../lib/guideline";
import {
  LOINC,
  REGIMENS,
  evaluateBreastCancerPolicy,
  extractEcogScore,
  toBundle,
  type OncologyContext,
  type Regimen as SharedRegimen,
} from "@mopa/oncology-policy";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AnswerCoding {
  system: string;
  code: string;
  display: string;
}

interface EvaluateRequest {
  patientId: string;
  answers: {
    her2?: AnswerCoding;
    cancerStage?: AnswerCoding;
    ecogPs?: AnswerCoding;
  };
}

/** A required substitution surfaced from the payer policy. */
interface SubstitutionResult {
  originalDisplay: string;
  substitutedDisplay: string;
  rationale: string;
}

interface EvaluateResponse {
  regimens: Awaited<ReturnType<typeof evaluateGuideline>>;
  paStatus: "pre-approved" | "pa-required" | "dtr-required";
  ecogScore: number | undefined;
  /** Payer-required substitutions (e.g. biosimilar). Empty when none. */
  substitutions: SubstitutionResult[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildObs(loincCode: string, loincDisplay: string, patientId: string, value: AnswerCoding) {
  return {
    resourceType: "Observation",
    status: "final",
    code: {
      coding: [{ system: LOINC, code: loincCode, display: loincDisplay }],
    },
    subject: { reference: `Patient/${patientId}` },
    valueCodeableConcept: {
      coding: [{ system: value.system, code: value.code, display: value.display }],
    },
  };
}

function buildEcogObs(patientId: string, value: AnswerCoding) {
  return {
    resourceType: "Observation",
    status: "final",
    code: {
      coding: [
        { system: LOINC, code: "89247-1", display: "ECOG Performance Status score" },
      ],
    },
    subject: { reference: `Patient/${patientId}` },
    valueCodeableConcept: {
      coding: [{ system: value.system, code: value.code, display: value.display }],
    },
  };
}

function obsBundleByLoinc(resources: unknown[], loincCode: string) {
  return toBundle(
    resources.filter((r) => {
      const obs = r as { resourceType?: string; code?: { coding?: Array<{ system?: string; code?: string }> } };
      if (obs.resourceType !== "Observation") return false;
      return obs.code?.coding?.some((c) => c.system === LOINC && c.code === loincCode);
    })
  );
}

/**
 * Find biosimilar substitutions across all regimens that are on-guideline.
 * In the demo, ddAC-T carries pegfilgrastim → Udenyca step therapy.
 */
function findSubstitutionsForIndicatedRegimens(
  regimens: SharedRegimen[],
  onGuidelineIds: string[],
): SubstitutionResult[] {
  const subs: SubstitutionResult[] = [];
  for (const regimen of regimens) {
    if (!onGuidelineIds.includes(regimen.id)) continue;
    for (const phase of regimen.phases) {
      for (const drug of phase.drugs) {
        if (drug.biosimilars?.length) {
          const bio = drug.biosimilars[0];
          subs.push({
            originalDisplay: drug.display,
            substitutedDisplay: bio.display,
            rationale: bio.rationale,
          });
        }
      }
    }
  }
  return subs;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  let body: EvaluateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { patientId, answers } = body;

  // Build synthetic FHIR resources from the provided answers
  const resources: unknown[] = [{ resourceType: "Patient", id: patientId }];

  if (answers.her2) {
    resources.push(buildObs("85319-2", "HER2, Breast cancer specimen", patientId, answers.her2));
  }
  if (answers.cancerStage) {
    resources.push(
      buildObs("21908-9", "Stage group.clinical Cancer", patientId, answers.cancerStage)
    );
  }
  if (answers.ecogPs) {
    resources.push(buildEcogObs(patientId, answers.ecogPs));
  }

  // Evaluate guideline eligibility
  const regimens = await evaluateGuideline(patientId, resources);

  // Determine PA status using the shared policy
  const ctx: OncologyContext = {
    conditions: toBundle(resources.filter((r) => (r as { resourceType?: string }).resourceType === "Patient")),
    her2: obsBundleByLoinc(resources, "85319-2"),
    cancerStage: obsBundleByLoinc(resources, "21908-9"),
    ecogPs: obsBundleByLoinc(resources, "89247-1"),
    priorTherapy: toBundle([]),
  };

  const policyResult = evaluateBreastCancerPolicy(ctx);
  const ecogScore = extractEcogScore(ctx.ecogPs);

  const paStatus =
    policyResult.status === "authorization-satisfied"
      ? "pre-approved"
      : policyResult.status === "pa-required"
        ? "pa-required"
        : "dtr-required";

  // Find biosimilar substitutions for indicated regimens.
  // Only surface substitutions when the policy is pre-approved or PA-required
  // (i.e. the data is complete enough for the payer to weigh in).
  const indicatedIds = regimens.filter((r) => r.onGuideline).map((r) => r.id);
  const substitutions =
    paStatus === "dtr-required"
      ? []
      : findSubstitutionsForIndicatedRegimens(REGIMENS, indicatedIds);

  const response: EvaluateResponse = {
    regimens,
    paStatus,
    ecogScore,
    substitutions,
  };

  return NextResponse.json(response);
}
