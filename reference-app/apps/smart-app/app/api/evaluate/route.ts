import { type NextRequest, NextResponse } from "next/server";
import { evaluateGuideline } from "../../../lib/guideline";
import {
  LOINC,
  evaluateBreastCancerPolicy,
  extractEcogScore,
  toBundle,
  type OncologyContext,
} from "@mopa/oncology-policy";

// ---------------------------------------------------------------------------
// Request / response types
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
  // Carry the SNOMED grade coding so extractEcogScore can map it to an
  // integer. The CRD pre-approval logic reads valueInteger when present.
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

/** Filter resources whose Observation code matches a LOINC code. */
function obsBundleByLoinc(resources: unknown[], loincCode: string) {
  return toBundle(
    resources.filter((r) => {
      const obs = r as { resourceType?: string; code?: { coding?: Array<{ system?: string; code?: string }> } };
      if (obs.resourceType !== "Observation") return false;
      return obs.code?.coding?.some((c) => c.system === LOINC && c.code === loincCode);
    })
  );
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

  // Determine PA status using the shared policy so the SMART app, CRD
  // service, and payer backend all reason over the same rules. The synthetic
  // resources are wrapped into Bundle-shaped objects to match the contract
  // the shared helpers expect.
  const ctx: OncologyContext = {
    // The SMART "what-if" panel does not synthesize a Condition; use the
    // Patient resource as a non-null placeholder so hasBreastCancer returns
    // false without a missing-data false-positive on conditions.
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

  return NextResponse.json({ regimens, paStatus, ecogScore });
}
