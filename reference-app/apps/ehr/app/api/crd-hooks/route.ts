import { type NextRequest, NextResponse } from "next/server";
import { parseCookies, TOKEN_COOKIE, isAuthBypassed } from "@mopa/smart-auth";

/**
 * Server-side proxy for CDS Hooks requests — POST /api/crd-hooks
 *
 * The EHR client fires CDS hook calls here instead of directly to the CRD
 * service. This route reads the patient's Bearer token from the HttpOnly
 * smart_token cookie (inaccessible to client JS) and attaches it as
 * `fhirAuthorization` so the CRD can authenticate against the EHR's
 * FHIR proxy when resolving prefetch data.
 */

const CRD_SERVICE_URL =
  process.env.NEXT_PUBLIC_CRD_SERVICE_URL ?? "http://localhost:4003";

const EHR_FHIR_BASE = process.env.NEXT_PUBLIC_EHR_BASE_URL
  ? `${process.env.NEXT_PUBLIC_EHR_BASE_URL}/api/fhir`
  : "http://localhost:4001/api/fhir";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  // Build the enriched hook body. If a SMART bearer token is available
  // (the caller went through a SMART launch), route the CRD through the
  // EHR FHIR proxy with fhirAuthorization so it can access patient data
  // under the patient's credentials. Otherwise, omit fhirServer and let
  // the CRD fall back to its own FHIR_BASE_URL (direct HAPI), which
  // requires no auth in this reference implementation.
  const enriched: Record<string, unknown> = { ...body };

  const cookies = parseCookies(request.headers.get("cookie"));
  const bearerToken = cookies[TOKEN_COOKIE];

  if (bearerToken && !isAuthBypassed()) {
    enriched.fhirServer = EHR_FHIR_BASE;
    enriched.fhirAuthorization = {
      access_token: bearerToken,
      token_type: "Bearer",
      expires_in: 3600,
      scope: "patient/*.read",
      subject: "mopa-ehr",
    };
  } else if (isAuthBypassed()) {
    // Bypass mode: EHR proxy accepts unauthenticated requests.
    enriched.fhirServer = EHR_FHIR_BASE;
  }
  // No token + not bypassed: fhirServer intentionally omitted.

  try {
    const upstream = await fetch(`${CRD_SERVICE_URL}/api/cds-services/oncology-crd`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enriched),
    });
    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "CRD service unreachable" },
      { status: 502 }
    );
  }
}
