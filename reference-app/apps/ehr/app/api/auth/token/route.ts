import { type NextRequest, NextResponse } from "next/server";
import { issueToken, generateCodeChallenge } from "@ogca/smart-auth";
import { consumeCode } from "../../../../lib/auth-code-store";
import { createLogger } from "@ogca/logger";

const logger = createLogger("ehr");
const CORS = { "Access-Control-Allow-Origin": "*" };
const TOKEN_EXPIRES_IN = 3600;

export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...CORS,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

/**
 * SMART on FHIR token endpoint — POST /api/auth/token
 *
 * Accepts an `authorization_code` grant. Verifies PKCE, consumes the
 * single-use authorization code, and returns a signed HS256 JWT access token
 * with the patient context embedded as a claim.
 */
export async function POST(request: NextRequest) {
  const t0 = Date.now();

  let body: URLSearchParams;
  try {
    body = new URLSearchParams(await request.text());
  } catch {
    return NextResponse.json({ error: "invalid_request" }, { status: 400, headers: CORS });
  }

  const grantType = body.get("grant_type");
  const code = body.get("code");
  const redirectUri = body.get("redirect_uri");
  const clientId = body.get("client_id");
  const codeVerifier = body.get("code_verifier");

  if (grantType !== "authorization_code") {
    return NextResponse.json({ error: "unsupported_grant_type" }, { status: 400, headers: CORS });
  }
  if (!code || !redirectUri || !clientId) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Missing required parameters" },
      { status: 400, headers: CORS }
    );
  }

  // --- Consume code (single-use, TTL enforced inside consumeCode) ---
  const grant = consumeCode(code);
  if (!grant) {
    return NextResponse.json(
      { error: "invalid_grant", error_description: "Authorization code invalid or expired" },
      { status: 400, headers: CORS }
    );
  }

  // --- Validate redirect_uri matches what was registered at authorize time ---
  if (grant.redirectUri !== redirectUri) {
    return NextResponse.json(
      { error: "invalid_grant", error_description: "redirect_uri mismatch" },
      { status: 400, headers: CORS }
    );
  }

  // --- Verify PKCE: SHA-256(code_verifier) must equal stored code_challenge ---
  if (!codeVerifier) {
    return NextResponse.json(
      { error: "invalid_grant", error_description: "code_verifier required" },
      { status: 400, headers: CORS }
    );
  }
  const derivedChallenge = await generateCodeChallenge(codeVerifier);
  if (derivedChallenge !== grant.codeChallenge) {
    return NextResponse.json(
      { error: "invalid_grant", error_description: "PKCE verification failed" },
      { status: 400, headers: CORS }
    );
  }

  // --- Issue signed JWT ---
  const access_token = await issueToken({
    sub: clientId,
    patient: grant.patientId,
    scope: grant.scope,
    expiresInSeconds: TOKEN_EXPIRES_IN,
  });

  logger.info("smart.token", {
    // Thread the OAuth state from the code store so this event joins the
    // authorize and launch events in the same Activity group.
    correlationId: grant.state,
    patientId: grant.patientId,
    path: "/api/auth/token",
    method: "POST",
    status: 200,
    durationMs: Date.now() - t0,
    summary: `SMART token issued for patient ${grant.patientId} (client: ${clientId}, scope: ${grant.scope})`,
  });

  return NextResponse.json(
    {
      access_token,
      token_type: "Bearer",
      expires_in: TOKEN_EXPIRES_IN,
      scope: grant.scope,
      patient: grant.patientId,
    },
    { headers: CORS }
  );
}
