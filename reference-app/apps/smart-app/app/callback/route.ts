import { type NextRequest, NextResponse } from "next/server";
import {
  exchangeCode,
  parseCookies,
  serializeCookie,
  TOKEN_COOKIE,
  VERIFIER_COOKIE,
  STATE_COOKIE,
} from "@ogca/smart-auth";

const CLIENT_ID = "ogca-smart-app";
const REDIRECT_URI = process.env.NEXT_PUBLIC_SMART_APP_URL
  ? `${process.env.NEXT_PUBLIC_SMART_APP_URL}/callback`
  : "http://localhost:4001/callback";

/**
 * OAuth callback — exchanges the authorization code for a token and stores
 * it in a cookie before redirecting to the app home page.
 */
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

  // CSRF check
  const savedState = cookies[STATE_COOKIE];
  if (savedState && savedState !== state) {
    return NextResponse.json({ error: "State mismatch" }, { status: 400 });
  }

  const verifier = cookies[VERIFIER_COOKIE] ?? "";
  const tokenEndpoint = `${process.env.NEXT_PUBLIC_EHR_BASE_URL ?? "http://localhost:4000"}/token`;

  const tokenResponse = await exchangeCode(tokenEndpoint, code, verifier, {
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
  });

  const response = NextResponse.redirect(new URL("/", request.url));
  response.headers.append(
    "Set-Cookie",
    serializeCookie(TOKEN_COOKIE, tokenResponse.access_token, { maxAge: tokenResponse.expires_in })
  );
  // Clear one-time cookies
  response.headers.append("Set-Cookie", serializeCookie(VERIFIER_COOKIE, "", { maxAge: 0 }));
  response.headers.append("Set-Cookie", serializeCookie(STATE_COOKIE, "", { maxAge: 0 }));
  return response;
}
