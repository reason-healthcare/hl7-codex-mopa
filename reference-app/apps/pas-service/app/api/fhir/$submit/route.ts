import { type NextRequest, NextResponse } from "next/server";
import { buildClaimResponse } from "../../../../lib/claim-response";
import type { PaDecision, FhirClaimResponse } from "../../../../lib/claim-response";

const PAYER_BACKEND_URL = process.env.PAYER_BACKEND_URL ?? "http://localhost:4005";

/** Simplified PA submission request body (Phase 7 stub — not full Da Vinci PAS Bundle). */
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

  // Delegate to Payer Backend for CQL evaluation
  let decision: PaDecision;
  try {
    const res = await fetch(`${PAYER_BACKEND_URL}/api/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
  return NextResponse.json(claimResponse, {
    status: 201,
    headers: { "Content-Type": "application/fhir+json" },
  });
}
