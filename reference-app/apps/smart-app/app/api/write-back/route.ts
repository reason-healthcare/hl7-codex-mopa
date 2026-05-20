import { type NextRequest, NextResponse } from "next/server";
import { parseCookies, isAuthBypassed, TOKEN_COOKIE } from "@ogca/smart-auth";

const EHR_FHIR_BASE = process.env.EHR_FHIR_BASE_URL ?? "http://localhost:4000/api/fhir";

const CORS = { "Access-Control-Allow-Origin": "*" };

/** Request body for the write-back endpoint. */
interface WriteBackRequest {
  patientId: string;
  code: string;
  system: string;
  display: string;
  value: string;
  valueDisplay: string;
  valueSystem?: string;
}

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...CORS,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

/**
 * Write-back endpoint: creates a FHIR Observation on the EHR FHIR server.
 *
 * Request body: { patientId, code, system, display, value, valueDisplay, valueSystem? }
 * Uses native fetch (not fhir-kit-client) to avoid agentkeepalive conflicts in Next.js.
 */
export async function POST(request: NextRequest) {
  let body: WriteBackRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: CORS });
  }

  // Bearer token: read from cookie (bypass mode forwards a fixture value)
  const cookies = parseCookies(request.headers.get("cookie"));
  const bearerToken = isAuthBypassed() ? "bypass-token" : (cookies[TOKEN_COOKIE] ?? "");

  const observation = {
    resourceType: "Observation",
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "laboratory",
            display: "Laboratory",
          },
        ],
      },
    ],
    code: {
      coding: [{ system: body.system, code: body.code, display: body.display }],
      text: body.display,
    },
    subject: { reference: `Patient/${body.patientId}` },
    effectiveDateTime: new Date().toISOString().slice(0, 10),
    valueCodeableConcept: {
      coding: [
        {
          system: body.valueSystem ?? "http://snomed.info/sct",
          code: body.value,
          display: body.valueDisplay,
        },
      ],
      text: body.valueDisplay,
    },
  };

  try {
    const res = await fetch(`${EHR_FHIR_BASE}/Observation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/fhir+json",
        Accept: "application/fhir+json",
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify(observation),
    });

    const responseBody = await res.json();
    return NextResponse.json(responseBody, { status: res.status, headers: CORS });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "FHIR write failed" },
      { status: 502, headers: CORS }
    );
  }
}
