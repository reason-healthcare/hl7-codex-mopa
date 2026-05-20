import { type NextRequest, NextResponse } from "next/server";
import {
  exchangeCode,
  parseCookies,
  serializeCookie,
  TOKEN_COOKIE,
  VERIFIER_COOKIE,
  STATE_COOKIE,
} from "@ogca/smart-auth";

import { SMART_CLIENT_ID, SMART_REDIRECT_URI, TOKEN_ENDPOINT } from "../../lib/smart-config";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json(
      { error, description: searchParams.get("error_description") },
      { status: 400 }
    );
  }
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const cookies = parseCookies(request.headers.get("cookie"));
  const savedStateRaw = cookies[STATE_COOKIE];

  // Decode state payload (includes appContext carried through the OAuth round-trip)
  let appContext: string | undefined;
  let returnRegimen: string | undefined;
  if (savedStateRaw) {
    try {
      const payload = JSON.parse(Buffer.from(savedStateRaw, "base64url").toString("utf-8"));
      if (payload.state !== state) {
        return NextResponse.json({ error: "State mismatch" }, { status: 400 });
      }
      appContext = payload.appContext;
      returnRegimen = payload.returnRegimen;
    } catch {
      // Non-fatal — state was not base64 encoded (e.g. plain string in bypass)
    }
  }

  const verifier = cookies[VERIFIER_COOKIE] ?? "";

  const tokenResponse = await exchangeCode(TOKEN_ENDPOINT, code, verifier, {
    clientId: SMART_CLIENT_ID,
    redirectUri: SMART_REDIRECT_URI,
  });

  const homeUrl = new URL("/", request.url);
  if (appContext) homeUrl.searchParams.set("appContext", appContext);
  if (returnRegimen) homeUrl.searchParams.set("returnRegimen", returnRegimen);

  const response = NextResponse.redirect(homeUrl);
  response.headers.append(
    "Set-Cookie",
    serializeCookie(TOKEN_COOKIE, tokenResponse.access_token, { maxAge: tokenResponse.expires_in })
  );
  response.headers.append("Set-Cookie", serializeCookie(VERIFIER_COOKIE, "", { maxAge: 0 }));
  response.headers.append("Set-Cookie", serializeCookie(STATE_COOKIE, "", { maxAge: 0 }));
  return response;
}
