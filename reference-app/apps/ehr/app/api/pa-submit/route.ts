import { type NextRequest, NextResponse } from "next/server";

const PAS_SERVICE_URL = process.env.PAS_SERVICE_URL ?? "http://localhost:4004";

/**
 * POST /api/pa-submit
 *
 * Server-side proxy from the EHR order entry UI to the PAS Service.
 * Forwards { patientId, regimenId, regimenLabel } and returns the
 * FHIR ClaimResponse from the PAS Service.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const res = await fetch(`${PAS_SERVICE_URL}/api/fhir/$submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "PAS Service unreachable" },
      { status: 502 }
    );
  }
}
