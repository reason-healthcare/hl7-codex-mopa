import { type NextRequest, NextResponse } from "next/server";
import { issueToken, generateCodeChallenge } from "@ogca/smart-auth";

const CORS = { "Access-Control-Allow-Origin": "*" };

const TOKEN_EXPIRES_IN = 3600;

/** Grant payload encoded into the opaque authorization code. */
interface AuthGrant {
  code: string;
  clientId: string;
  redirectUri: string;
  patientId: string;
  scope: string;
  launch?: string;
  codeChallenge?: string;
}

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
 * SMART /token endpoint.
 *
 * Accepts an authorization_code grant, verifies the PKCE code_verifier,
 * and issues a signed JWT access token.
 */
export async function POST(request: NextRequest) {
  let body: URLSearchParams;
  try {
    const text = await request.text();
    body = new URLSearchParams(text);
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

  // Decode grant payload embedded in the opaque code
  let grant: AuthGrant;
  try {
    grant = JSON.parse(Buffer.from(code, "base64url").toString("utf-8"));
  } catch {
    return NextResponse.json({ error: "invalid_grant" }, { status: 400, headers: CORS });
  }

  // Validate client and redirect_uri
  if (grant.clientId !== clientId || grant.redirectUri !== redirectUri) {
    return NextResponse.json({ error: "invalid_client" }, { status: 401, headers: CORS });
  }

  // Verify PKCE when a challenge was included in the authorization request
  if (grant.codeChallenge) {
    if (!codeVerifier) {
      return NextResponse.json(
        { error: "invalid_grant", error_description: "code_verifier required" },
        { status: 400, headers: CORS }
      );
    }
    const expected = await generateCodeChallenge(codeVerifier);
    if (expected !== grant.codeChallenge) {
      return NextResponse.json(
        { error: "invalid_grant", error_description: "PKCE verification failed" },
        { status: 400, headers: CORS }
      );
    }
  }

  const access_token = await issueToken({
    sub: clientId,
    patient: grant.patientId,
    scope: grant.scope,
    expiresInSeconds: TOKEN_EXPIRES_IN,
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
