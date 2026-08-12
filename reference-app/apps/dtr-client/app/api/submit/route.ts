import { type NextRequest, NextResponse } from "next/server";
import { parseCookies, isAuthBypassed, TOKEN_COOKIE } from "@mopa/smart-auth";
import { ITEM_DEFINITIONS } from "../../../lib/questionnaire-gen";
import type { AnswerCoding, QItem } from "../../../lib/questionnaire-gen";
import { createLogger } from "@mopa/logger";

const logger = createLogger("dtr");
const EHR_FHIR_BASE = process.env.EHR_FHIR_BASE_URL ?? "http://localhost:4001/api/fhir";

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
 * IG GUIDANCE — DTR data is NOT persisted to the EHR FHIR server for clinical use.
 *
 * The correct MOPA pattern: DTR returns a QuestionnaireResponse in the
 * CDS Hooks context.draftOrders Bundle so the CRD can re-evaluate without
 * re-querying the FHIR server. The EHR does NOT write QuestionnaireResponse
 * (or derived Observations) to the FHIR server as clinical data.
 *
 * This implementation writes Observations and QuestionnaireResponse to the
 * HAPI FHIR server for demonstration purposes — it allows the CRD to pick
 * up the data on the next order-select call without an in-flight context.
 * In a production system, the EHR would hold the QuestionnaireResponse in
 * session storage and include it in draftOrders at order-sign.
 */
export async function POST(request: NextRequest) {
  let body: SubmitRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const cookies = parseCookies(request.headers.get("cookie"));
  const rawToken = cookies[TOKEN_COOKIE] ?? "";
  const bearerToken = isAuthBypassed() ? rawToken : rawToken;
  const patientId = body.patientId;
  // Single correlation ID shared across both log entries so the submit
  // and the FHIR write-back appear in the same Activity group.
  const correlationId = crypto.randomUUID();

  logger.info("dtr.submit", {
    correlationId,
    patientId,
    path: "/api/submit",
    method: "POST",
    missingElements: Object.keys(body.answers),
    request: body,
    summary: `DTR submit — ${Object.keys(body.answers).join(", ")} for patient ${patientId}`,
  });
  const fhirHeaders = {
    "Content-Type": "application/fhir+json",
    Accept: "application/fhir+json",
    Authorization: `Bearer ${bearerToken}`,
  };

  const t0 = Date.now();
  const today = new Date().toISOString().slice(0, 10);

  // ------------------------------------------------------------------
  // DEMO ONLY: POST a FHIR Observation for each answered item.
  // Production: hold in session; include in draftOrders at order-sign.
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
  // DEMO ONLY: POST a QuestionnaireResponse to the FHIR server.
  // Production: return QuestionnaireResponse in CDS Hooks context.
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
    logger.info("fhir.write", {
      correlationId,
      patientId,
      path: "/QuestionnaireResponse",
      method: "POST",
      status: 201,
      durationMs: Date.now() - t0,
      response: { qrId: saved.id, observationIds },
      summary: `DTR write-back complete (demo) — QR ${saved.id ?? "unknown"}, ${observationIds.length} observations`,
    });
    return NextResponse.json({ qrId: saved.id, observationIds });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "FHIR write failed" },
      { status: 502 }
    );
  }
}
