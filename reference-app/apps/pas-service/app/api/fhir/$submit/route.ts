import { type NextRequest, NextResponse } from "next/server";
import { buildClaimResponse } from "../../../../lib/claim-response";
import type { PaDecision, FhirClaimResponse } from "../../../../lib/claim-response";
import { createLogger } from "@ogca/logger";

const logger = createLogger("pas");
const PAYER_BACKEND_URL = process.env.PAYER_BACKEND_URL ?? "http://localhost:4006";

/** Simplified PA submission request body. */
interface PaSubmitRequest {
  patientId: string;
  regimenId?: string;
  regimenLabel?: string;
}

/**
 * POST /api/fhir/$submit
 *
 * Entry point for prior-authorization submission. Validates the request,
 * delegates CQL policy evaluation to the Payer Backend, and returns a
 * FHIR ClaimResponse with the determination.
 */
export async function POST(request: NextRequest) {
  let body: PaSubmitRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!body.patientId) {
    return NextResponse.json({ error: "patientId is required" }, { status: 400 });
  }

  const correlationId = request.headers.get("x-correlation-id") ?? undefined;
  const t0 = Date.now();

  logger.info("pa.submit", {
    correlationId,
    patientId: body.patientId,
    path: "/api/fhir/$submit",
    method: "POST",
    request: body,
    summary: `PA submission for patient ${body.patientId}${body.regimenId ? ` (${body.regimenId})` : ""}`,
  });

  // Delegate to Payer Backend for CQL evaluation
  let decision: PaDecision;
  try {
    const res = await fetch(`${PAYER_BACKEND_URL}/api/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(correlationId ? { "X-Correlation-ID": correlationId } : {}),
      },
      body: JSON.stringify({ patientId: body.patientId, regimenId: body.regimenId }),
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Payer Backend evaluation failed: ${text}` },
        { status: 502 }
      );
    }
    decision = (await res.json()) as PaDecision;
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Payer Backend unreachable" },
      { status: 502 }
    );
  }

  const id = `cr-${Date.now()}`;
  const claimResponse: FhirClaimResponse = buildClaimResponse(id, decision);

  logger.info("pa.result", {
    correlationId,
    patientId: body.patientId,
    paResult: decision.status,
    durationMs: Date.now() - t0,
    status: 200,
    response: claimResponse,
    summary: `PA result: ${decision.status} (${Date.now() - t0}ms)`,
  });

  return NextResponse.json(claimResponse, {
    status: 201,
    headers: { "Content-Type": "application/fhir+json" },
  });
}
