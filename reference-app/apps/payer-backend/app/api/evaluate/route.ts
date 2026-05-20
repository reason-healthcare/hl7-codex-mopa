import { type NextRequest, NextResponse } from "next/server";
import { evaluatePolicy } from "../../../lib/policy";

/** Request body for prior-authorization evaluation. */
interface EvaluateRequest {
  patientId: string;
  regimenId?: string;
}

/**
 * POST /api/evaluate
 *
 * Runs BreastCancerPayerPolicy CQL against live patient data fetched from
 * the EHR FHIR proxy and returns a prior-authorization determination.
 */
export async function POST(request: NextRequest) {
  let body: EvaluateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.patientId) {
    return NextResponse.json({ error: "patientId is required" }, { status: 400 });
  }

  try {
    const decision = await evaluatePolicy(body.patientId);
    return NextResponse.json(decision);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Policy evaluation failed" },
      { status: 500 }
    );
  }
}
