import { type NextRequest, NextResponse } from "next/server";
import {
  exchangeCode,
  parseCookies,
  serializeCookie,
  TOKEN_COOKIE,
  VERIFIER_COOKIE,
  STATE_COOKIE,
} from "@ogca/smart-auth";

const CLIENT_ID = "ogca-dtr-client";
const REDIRECT_URI = process.env.NEXT_PUBLIC_DTR_CLIENT_URL
  ? `${process.env.NEXT_PUBLIC_DTR_CLIENT_URL}/callback`
  : "http://localhost:4003/callback";

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
  if (savedStateRaw) {
    try {
      const payload = JSON.parse(Buffer.from(savedStateRaw, "base64url").toString("utf-8"));
      if (payload.state !== state) {
        return NextResponse.json({ error: "State mismatch" }, { status: 400 });
      }
      appContext = payload.appContext;
    } catch {
      // Non-fatal — state was not base64 encoded (e.g. plain string in bypass)
    }
  }

  const verifier = cookies[VERIFIER_COOKIE] ?? "";
  const tokenEndpoint = `${process.env.NEXT_PUBLIC_EHR_BASE_URL ?? "http://localhost:4000"}/token`;

  const tokenResponse = await exchangeCode(tokenEndpoint, code, verifier, {
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
  });

  const homeUrl = new URL("/", request.url);
  if (appContext) homeUrl.searchParams.set("appContext", appContext);

  const response = NextResponse.redirect(homeUrl);
  response.headers.append(
    "Set-Cookie",
    serializeCookie(TOKEN_COOKIE, tokenResponse.access_token, { maxAge: tokenResponse.expires_in })
  );
  response.headers.append("Set-Cookie", serializeCookie(VERIFIER_COOKIE, "", { maxAge: 0 }));
  response.headers.append("Set-Cookie", serializeCookie(STATE_COOKIE, "", { maxAge: 0 }));
  return response;
}
