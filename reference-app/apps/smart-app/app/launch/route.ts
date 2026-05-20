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

import { SMART_CLIENT_ID, SMART_REDIRECT_URI, SMART_SCOPE } from "../../lib/smart-config";

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
      redirectUri: SMART_REDIRECT_URI,
      clientId: SMART_CLIENT_ID,
      scope: SMART_SCOPE,
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
