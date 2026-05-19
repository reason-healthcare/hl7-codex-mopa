/**
 * SMART on FHIR authorization helpers — Phase 4.
 *
 * Implements the authorization code flow with PKCE (RFC 7636) as required
 * by SMART App Launch Framework 2.0. Covers both sides of the exchange:
 *   - Client helpers: buildAuthorizationUrl, exchangeCode, token storage
 *   - Server helpers: buildSmartConfiguration, issueToken, verifyToken
 *
 * When SMART_AUTH_BYPASS=true all client operations return fixture values so
 * Phases 1–3 behaviour is preserved during development.
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";

// ---------------------------------------------------------------------------
// Configuration types
// ---------------------------------------------------------------------------

export interface SmartConfig {
  /** FHIR server / issuer base URL (no trailing slash) */
  issuer: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  scopes: string[];
}

export interface SmartTokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
  patient?: string;
  intent?: string;
  smart_style_url?: string;
}

export interface SmartLaunchParams {
  /** EHR-issued opaque launch token */
  launch?: string;
  /** FHIR server base URL (identifies the EHR) */
  iss: string;
  /** OAuth redirect_uri */
  redirectUri: string;
  clientId: string;
  scope?: string;
}

// ---------------------------------------------------------------------------
// Well-known SMART configuration
// ---------------------------------------------------------------------------

/**
 * Build the `.well-known/smart-configuration` JSON object for the EHR.
 * Advertises the authorization and token endpoint URLs.
 */
export function buildSmartConfiguration(issuer: string) {
  const base = issuer.replace(/\/$/, "");
  return {
    issuer: base,
    authorization_endpoint: `${base}/authorize`,
    token_endpoint: `${base}/token`,
    token_endpoint_auth_methods_supported: ["client_secret_basic", "none"],
    grant_types_supported: ["authorization_code"],
    scopes_supported: [
      "launch",
      "launch/patient",
      "patient/*.read",
      "patient/*.write",
      "openid",
      "fhirUser",
      "offline_access",
    ],
    response_types_supported: ["code"],
    capabilities: [
      "launch-ehr",
      "launch-standalone",
      "client-public",
      "sso-openid-connect",
      "context-ehr-patient",
      "permission-patient",
    ],
    code_challenge_methods_supported: ["S256"],
  };
}

// ---------------------------------------------------------------------------
// PKCE helpers
// ---------------------------------------------------------------------------

/**
 * Generate a cryptographically random PKCE code verifier (43–128 chars,
 * URL-safe base64 without padding per RFC 7636 §4.1).
 */
export function generateCodeVerifier(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Derive the PKCE S256 code challenge from a verifier.
 * challenge = BASE64URL(SHA-256(ASCII(verifier)))
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

// ---------------------------------------------------------------------------
// Client: authorization URL
// ---------------------------------------------------------------------------

/**
 * Build the full `/authorize` redirect URL including PKCE challenge.
 *
 * @returns `{ url, verifier }` — store `verifier` in session for the token exchange.
 */
export async function buildAuthorizationUrl(
  params: SmartLaunchParams,
  state: string
): Promise<{ url: string; verifier: string }> {
  if (isAuthBypassed()) {
    return { url: "", verifier: BYPASS_VERIFIER };
  }

  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  const base = params.iss.replace(/\/$/, "");
  const authEndpoint = `${base}/authorize`;

  const searchParams = new URLSearchParams({
    response_type: "code",
    client_id: params.clientId,
    redirect_uri: params.redirectUri,
    scope: params.scope ?? "launch launch/patient patient/*.read openid fhirUser",
    state,
    aud: params.iss,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });
  if (params.launch) searchParams.set("launch", params.launch);

  return { url: `${authEndpoint}?${searchParams.toString()}`, verifier };
}

// ---------------------------------------------------------------------------
// Client: token exchange
// ---------------------------------------------------------------------------

/**
 * Exchange an authorization code for tokens (token endpoint POST).
 */
export async function exchangeCode(
  tokenEndpoint: string,
  code: string,
  verifier: string,
  params: { clientId: string; redirectUri: string }
): Promise<SmartTokenResponse> {
  if (isAuthBypassed()) return bypassToken();

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: params.redirectUri,
    client_id: params.clientId,
    code_verifier: verifier,
  });

  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${res.status} — ${err}`);
  }
  return res.json() as Promise<SmartTokenResponse>;
}

// ---------------------------------------------------------------------------
// Server: token issuance and verification
// ---------------------------------------------------------------------------

export interface SmartTokenClaims extends JWTPayload {
  patient?: string;
  scope: string;
  intent?: string;
}

/** Derive a 256-bit key from the JWT secret env var. */
function getSigningKey(): Uint8Array {
  const secret = process.env.SMART_JWT_SECRET ?? "ogca-dev-secret-change-in-production";
  return new TextEncoder().encode(secret.padEnd(32, "!").slice(0, 32));
}

/**
 * Issue a signed SMART access token (HS256 JWT).
 */
export async function issueToken(claims: {
  sub: string;
  patient: string;
  scope: string;
  intent?: string;
  expiresInSeconds?: number;
}): Promise<string> {
  const expiresIn = claims.expiresInSeconds ?? 3600;
  return new SignJWT({
    patient: claims.patient,
    scope: claims.scope,
    intent: claims.intent,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .sign(getSigningKey());
}

/**
 * Verify a SMART bearer token. Returns the decoded claims or throws.
 */
export async function verifyToken(token: string): Promise<SmartTokenClaims> {
  const { payload } = await jwtVerify(token, getSigningKey());
  return payload as SmartTokenClaims;
}

// ---------------------------------------------------------------------------
// Token storage (cookie-based, SSR-safe)
// ---------------------------------------------------------------------------

export const TOKEN_COOKIE = "smart_token";
export const VERIFIER_COOKIE = "smart_verifier";
export const STATE_COOKIE = "smart_state";

/** Serialize a cookie header value with secure defaults. */
export function serializeCookie(
  name: string,
  value: string,
  options: { maxAge?: number; path?: string; httpOnly?: boolean; sameSite?: string } = {}
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  parts.push(`Path=${options.path ?? "/"}`);
  if (options.httpOnly !== false) parts.push("HttpOnly");
  parts.push(`SameSite=${options.sameSite ?? "Lax"}`);
  return parts.join("; ");
}

/** Parse a raw Cookie header string into a key→value map. */
export function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(";").map((p) => {
      const [k, ...v] = p.trim().split("=");
      return [k?.trim() ?? "", decodeURIComponent(v.join("="))];
    })
  );
}

// ---------------------------------------------------------------------------
// Bypass mode
// ---------------------------------------------------------------------------

export const BYPASS_VERIFIER = "bypass-verifier";

/** Return a dummy token response for bypass mode. */
export function bypassToken(patientId = "jane-smith"): SmartTokenResponse {
  return {
    access_token: "bypass-token",
    token_type: "Bearer",
    expires_in: 3600,
    scope: "launch/patient patient/*.read openid fhirUser",
    patient: patientId,
  };
}

/**
 * Returns true when SMART auth is bypassed via SMART_AUTH_BYPASS=true.
 * All client functions short-circuit in bypass mode.
 */
export function isAuthBypassed(): boolean {
  return process.env.SMART_AUTH_BYPASS === "true";
}
