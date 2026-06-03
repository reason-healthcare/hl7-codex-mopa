import { NextResponse } from "next/server";
import { buildSmartConfiguration } from "@ogca/smart-auth";

/**
 * SMART on FHIR well-known configuration endpoint.
 *
 * Served at {FHIR_ISS}/.well-known/smart-configuration so that SMART clients
 * that receive `iss=http://localhost:4001/api/fhir` can discover the
 * authorization and token endpoints via standard capability discovery.
 *
 * The issuer matches the FHIR base URL (as required by SMART App Launch 2.0),
 * but the auth endpoints are hosted on dedicated /api/auth/* routes to keep
 * FHIR and OAuth concerns cleanly separated.
 */

const EHR_BASE = (process.env.NEXT_PUBLIC_EHR_BASE_URL ?? "http://localhost:4001").replace(
  /\/$/,
  ""
);
const EHR_FHIR_BASE = `${EHR_BASE}/api/fhir`;

export function GET() {
  const base = buildSmartConfiguration(EHR_FHIR_BASE);
  return NextResponse.json(
    {
      ...base,
      // Override the derived endpoints to use the dedicated auth routes.
      authorization_endpoint: `${EHR_BASE}/api/auth/authorize`,
      token_endpoint: `${EHR_BASE}/api/auth/token`,
    },
    { headers: { "Access-Control-Allow-Origin": "*" } }
  );
}
