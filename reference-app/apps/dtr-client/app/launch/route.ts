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

const CLIENT_ID = "ogca-dtr-client";
const REDIRECT_URI = process.env.NEXT_PUBLIC_DTR_CLIENT_URL
  ? `${process.env.NEXT_PUBLIC_DTR_CLIENT_URL}/callback`
  : "http://localhost:4003/callback";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const iss = searchParams.get("iss");
  const launch = searchParams.get("launch") ?? undefined;
  // appContext is passed through as a launch param by the CRD DTR card
  const appContext = searchParams.get("appContext") ?? undefined;

  if (!iss) {
    return NextResponse.json({ error: "Missing iss parameter" }, { status: 400 });
  }

  if (isAuthBypassed()) {
    const token = bypassToken();
    const url = new URL("/", request.url);
    if (appContext) url.searchParams.set("appContext", appContext);
    const response = NextResponse.redirect(url);
    response.headers.append(
      "Set-Cookie",
      serializeCookie(TOKEN_COOKIE, token.access_token, { maxAge: 3600 })
    );
    return response;
  }

  const state = crypto.randomBytes(8).toString("hex");
  const statePayload = JSON.stringify({ state, appContext });
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
  response.headers.append(
    "Set-Cookie",
    serializeCookie(STATE_COOKIE, Buffer.from(statePayload).toString("base64url"), { maxAge: 300 })
  );
  return response;
}
