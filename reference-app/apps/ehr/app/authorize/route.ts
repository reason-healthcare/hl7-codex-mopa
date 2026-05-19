import { type NextRequest, NextResponse } from "next/server";
import { serializeCookie, STATE_COOKIE } from "@ogca/smart-auth";
import crypto from "node:crypto";

/**
 * SMART /authorize endpoint.
 *
 * Validates the incoming authorization request, stores state + code_challenge
 * in cookies, then renders the launch consent page (auto-approves for demo).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const responseType = searchParams.get("response_type");
  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const state = searchParams.get("state");
  const codeChallenge = searchParams.get("code_challenge");
  const codeChallengeMethod = searchParams.get("code_challenge_method");

  // Basic validation
  if (responseType !== "code") {
    return NextResponse.json({ error: "unsupported_response_type" }, { status: 400 });
  }
  if (!clientId || !redirectUri || !state) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Missing required parameters" },
      { status: 400 }
    );
  }
  if (codeChallenge && codeChallengeMethod !== "S256") {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "Only S256 code_challenge_method is supported",
      },
      { status: 400 }
    );
  }

  // Generate authorization code (short-lived opaque token)
  const code = crypto.randomBytes(16).toString("hex");
  const patientId = searchParams.get("patient") ?? "jane-smith";
  const scope = searchParams.get("scope") ?? "launch/patient patient/*.read openid fhirUser";
  const launch = searchParams.get("launch");

  // Encode all grant data into the code itself (base64 JSON — acceptable for demo)
  const grantPayload = Buffer.from(
    JSON.stringify({ code, clientId, redirectUri, patientId, scope, launch, codeChallenge })
  ).toString("base64url");

  // Auto-approve: redirect straight back with the code
  const callbackUrl = new URL(redirectUri);
  callbackUrl.searchParams.set("code", grantPayload);
  callbackUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(callbackUrl.toString());

  // Persist state for CSRF check on callback
  response.headers.append("Set-Cookie", serializeCookie(STATE_COOKIE, state, { maxAge: 300 }));

  return response;
}
