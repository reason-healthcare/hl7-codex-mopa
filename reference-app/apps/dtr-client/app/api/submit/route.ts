import { type NextRequest, NextResponse } from "next/server";
import { parseCookies, isAuthBypassed, TOKEN_COOKIE } from "@ogca/smart-auth";
import { ITEM_DEFINITIONS } from "../../../lib/questionnaire-gen";
import type { AnswerCoding, QItem } from "../../../lib/questionnaire-gen";

const EHR_FHIR_BASE = process.env.EHR_FHIR_BASE_URL ?? "http://localhost:4000/api/fhir";

/** Request body: one answer per questionnaire item. */
interface SubmitRequest {
  patientId: string;
  answers: Record<string, AnswerCoding>;
}

const LAB_CATEGORY = {
  system: "http://terminology.hl7.org/CodeSystem/observation-category",
  code: "laboratory",
  display: "Laboratory",
} as const;

function buildObservation(
  patientId: string,
  itemDef: QItem,
  answerCoding: AnswerCoding,
  date: string
) {
  return {
    resourceType: "Observation",
    status: "final",
    category: [{ coding: [LAB_CATEGORY] }],
    code: { coding: [itemDef.observationCode], text: itemDef.text },
    subject: { reference: `Patient/${patientId}` },
    effectiveDateTime: date,
    valueCodeableConcept: { coding: [answerCoding], text: answerCoding.display },
  };
}

function buildQuestionnaireResponse(
  patientId: string,
  answers: Record<string, AnswerCoding>,
  date: string
) {
  return {
    resourceType: "QuestionnaireResponse",
    status: "completed",
    subject: { reference: `Patient/${patientId}` },
    authored: date,
    item: Object.entries(answers).map(([linkId, coding]) => ({
      linkId,
      text: ITEM_DEFINITIONS[linkId]?.text ?? linkId,
      answer: [{ valueCoding: coding }],
    })),
  };
}

/**
 * Submit DTR documentation.
 *
 * For each answered item:
 *   1. POST a FHIR Observation so the CRD prefetch can find it on the next order-select.
 *   2. POST a single QuestionnaireResponse aggregating all answers.
 *
 * Uses native fetch (not fhir-kit-client) to avoid agentkeepalive conflicts in Next.js.
 */
export async function POST(request: NextRequest) {
  let body: SubmitRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const cookies = parseCookies(request.headers.get("cookie"));
  const bearerToken = isAuthBypassed() ? "bypass-token" : (cookies[TOKEN_COOKIE] ?? "");
  const fhirHeaders = {
    "Content-Type": "application/fhir+json",
    Accept: "application/fhir+json",
    Authorization: `Bearer ${bearerToken}`,
  };

  const today = new Date().toISOString().slice(0, 10);

  // ------------------------------------------------------------------
  // 1. POST a FHIR Observation for each answered item
  // ------------------------------------------------------------------
  const observationIds: string[] = [];
  for (const [linkId, answerCoding] of Object.entries(body.answers)) {
    const itemDef = ITEM_DEFINITIONS[linkId];
    if (!itemDef) continue;
    try {
      const res = await fetch(`${EHR_FHIR_BASE}/Observation`, {
        method: "POST",
        headers: fhirHeaders,
        body: JSON.stringify(buildObservation(body.patientId, itemDef, answerCoding, today)),
      });
      if (res.ok) {
        const saved = (await res.json()) as { id?: string };
        if (saved.id) observationIds.push(saved.id);
      }
    } catch {
      // Non-fatal: continue without this observation
    }
  }

  // ------------------------------------------------------------------
  // 2. POST a QuestionnaireResponse aggregating all answers
  // ------------------------------------------------------------------
  try {
    const res = await fetch(`${EHR_FHIR_BASE}/QuestionnaireResponse`, {
      method: "POST",
      headers: fhirHeaders,
      body: JSON.stringify(buildQuestionnaireResponse(body.patientId, body.answers, today)),
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `FHIR QR save failed: ${text}` }, { status: 502 });
    }
    const saved = (await res.json()) as { id?: string };
    return NextResponse.json({ qrId: saved.id, observationIds });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "FHIR write failed" },
      { status: 502 }
    );
  }
}
