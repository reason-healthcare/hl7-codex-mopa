import { type NextRequest, NextResponse } from "next/server";
import {
  buildAuthorizationUrl,
  bypassToken,
  isAuthBypassed,
  serializeCookie,
  TOKEN_COOKIE,
  VERIFIER_COOKIE,
  STATE_COOKIE,
} from "@ogca/smart-auth";
import crypto from "node:crypto";

const CLIENT_ID = "ogca-smart-app";
const REDIRECT_URI = process.env.NEXT_PUBLIC_SMART_APP_URL
  ? `${process.env.NEXT_PUBLIC_SMART_APP_URL}/callback`
  : "http://localhost:4001/callback";

/**
 * EHR launch entry-point.
 * Receives `iss` (FHIR server / EHR base URL) and optional `launch` token,
 * then redirects to the EHR's /authorize endpoint.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const iss = searchParams.get("iss");
  const launch = searchParams.get("launch") ?? undefined;

  if (!iss) {
    return NextResponse.json({ error: "Missing iss parameter" }, { status: 400 });
  }

  // Bypass: skip OAuth, store a fixture token, redirect to home
  if (isAuthBypassed()) {
    const token = bypassToken();
    const response = NextResponse.redirect(new URL("/", request.url));
    response.headers.append(
      "Set-Cookie",
      serializeCookie(TOKEN_COOKIE, token.access_token, { maxAge: 3600 })
    );
    return response;
  }

  const state = crypto.randomBytes(8).toString("hex");
  const { url, verifier } = await buildAuthorizationUrl(
    {
      iss,
      redirectUri: REDIRECT_URI,
      clientId: CLIENT_ID,
      scope: "launch launch/patient patient/*.read openid fhirUser",
      launch,
    },
    state
  );

  const response = NextResponse.redirect(url);
  response.headers.append(
    "Set-Cookie",
    serializeCookie(VERIFIER_COOKIE, verifier, { maxAge: 300 })
  );
  response.headers.append("Set-Cookie", serializeCookie(STATE_COOKIE, state, { maxAge: 300 }));
  return response;
}
