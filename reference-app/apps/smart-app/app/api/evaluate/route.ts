import { type NextRequest, NextResponse } from "next/server";
import { evaluateGuideline } from "../../../lib/guideline";

// ---------------------------------------------------------------------------
// ECOG SNOMED grade codes → integer score (mirrors crd-logic.ts)
// ---------------------------------------------------------------------------
const ECOG_SNOMED_GRADES: Record<string, number> = {
  "425389002": 0,
  "422512005": 1,
  "422894000": 2,
  "423053003": 3,
};

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
      coding: [{ system: "http://loinc.org", code: loincCode, display: loincDisplay }],
    },
    subject: { reference: `Patient/${patientId}` },
    valueCodeableConcept: {
      coding: [{ system: value.system, code: value.code, display: value.display }],
    },
  };
}

function buildEcogObs(patientId: string, value: AnswerCoding) {
  const score = ECOG_SNOMED_GRADES[value.code];
  return {
    resourceType: "Observation",
    status: "final",
    code: {
      coding: [
        { system: "http://loinc.org", code: "89247-1", display: "ECOG Performance Status score" },
      ],
    },
    subject: { reference: `Patient/${patientId}` },
    // Use valueInteger so the CRD pre-approval logic can read it
    ...(score !== undefined
      ? { valueInteger: score }
      : {
          valueCodeableConcept: {
            coding: [{ system: value.system, code: value.code, display: value.display }],
          },
        }),
  };
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

  // Determine PA status from ECOG value
  const ecogScore = answers.ecogPs
    ? (ECOG_SNOMED_GRADES[answers.ecogPs.code] ?? undefined)
    : undefined;

  const allPresent = !!(answers.her2 && answers.cancerStage && answers.ecogPs);
  const paStatus = !allPresent ? "dtr-required" : ecogScore === 0 ? "pre-approved" : "pa-required";

  return NextResponse.json({ regimens, paStatus, ecogScore });
}
