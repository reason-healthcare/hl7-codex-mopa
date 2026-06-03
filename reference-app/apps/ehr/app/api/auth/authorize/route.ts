import { type NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { storeCode } from "../../../../lib/auth-code-store";
import { createLogger } from "@ogca/logger";

const logger = createLogger("ehr");

/**
 * SMART on FHIR authorization endpoint — GET /api/auth/authorize
 *
 * Validates the incoming PKCE authorization request, stores an in-memory
 * authorization code, and immediately redirects back to the client. No
 * consent screen is shown — all requests are auto-approved (reference impl).
 */
export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;

  const responseType = p.get("response_type");
  const clientId = p.get("client_id");
  const redirectUri = p.get("redirect_uri");
  const scope = p.get("scope") ?? "launch/patient patient/*.read openid fhirUser";
  const state = p.get("state") ?? "";
  const launch = p.get("launch") ?? undefined;
  const codeChallenge = p.get("code_challenge");
  const codeChallengeMethod = p.get("code_challenge_method");

  // --- Validate required parameters ---
  if (responseType !== "code") {
    return NextResponse.json({ error: "unsupported_response_type" }, { status: 400 });
  }
  if (!clientId || !redirectUri || !state) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "Missing required parameters" },
      { status: 400 }
    );
  }
  if (!codeChallenge) {
    return NextResponse.json(
      { error: "invalid_request", error_description: "PKCE code_challenge is required" },
      { status: 400 }
    );
  }
  if (codeChallengeMethod !== "S256") {
    return NextResponse.json(
      {
        error: "invalid_request",
        error_description: "Only S256 code_challenge_method is supported",
      },
      { status: 400 }
    );
  }

  // --- Extract patient context from EHR launch token (pattern: "patient/{id}") ---
  let patientId = "unknown";
  if (launch?.startsWith("patient/")) {
    patientId = launch.slice("patient/".length);
  }

  // --- Issue authorization code and persist to store (state threaded as correlationId) ---
  const code = crypto.randomBytes(16).toString("hex");
  storeCode(code, { patientId, scope, redirectUri, codeChallenge, state });

  logger.info("smart.launch", {
    correlationId: state,
    patientId,
    path: "/api/auth/authorize",
    method: "GET",
    status: 302,
    summary: `SMART authorize — code issued for patient ${patientId} (client: ${clientId})`,
  });

  // --- Auto-approve: redirect to client with code ---
  const callbackUrl = new URL(redirectUri);
  callbackUrl.searchParams.set("code", code);
  callbackUrl.searchParams.set("state", state);

  return NextResponse.redirect(callbackUrl.toString());
}
