import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  buildSmartConfiguration,
  buildAuthorizationUrl,
  generateCodeVerifier,
  generateCodeChallenge,
  serializeCookie,
  parseCookies,
  bypassToken,
  isAuthBypassed,
  issueToken,
  verifyToken,
  resetSigningKey,
} from "../index";

// ---------------------------------------------------------------------------
// buildSmartConfiguration
// ---------------------------------------------------------------------------

describe("buildSmartConfiguration", () => {
  it("returns required SMART well-known fields", () => {
    const cfg = buildSmartConfiguration("http://localhost:4000");
    expect(cfg.issuer).toBe("http://localhost:4000");
    expect(cfg.authorization_endpoint).toBe("http://localhost:4000/authorize");
    expect(cfg.token_endpoint).toBe("http://localhost:4000/token");
  });

  it("strips trailing slash from issuer", () => {
    const cfg = buildSmartConfiguration("http://localhost:4000/");
    expect(cfg.authorization_endpoint).toBe("http://localhost:4000/authorize");
  });

  it("advertises S256 code challenge method", () => {
    const cfg = buildSmartConfiguration("http://localhost:4000");
    expect(cfg.code_challenge_methods_supported).toContain("S256");
  });

  it("advertises launch-ehr capability", () => {
    const cfg = buildSmartConfiguration("http://localhost:4000");
    expect(cfg.capabilities).toContain("launch-ehr");
  });
});

// ---------------------------------------------------------------------------
// PKCE helpers
// ---------------------------------------------------------------------------

describe("generateCodeVerifier", () => {
  it("returns a URL-safe base64 string of 43 chars (32 random bytes)", () => {
    const v = generateCodeVerifier();
    expect(v).toMatch(/^[A-Za-z0-9\-_]+$/);
    expect(v.length).toBe(43);
  });

  it("generates unique values on each call", () => {
    expect(generateCodeVerifier()).not.toBe(generateCodeVerifier());
  });
});

describe("generateCodeChallenge", () => {
  it("returns a URL-safe base64 string (no +, /, =)", async () => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    expect(challenge).not.toContain("+");
    expect(challenge).not.toContain("/");
    expect(challenge).not.toContain("=");
  });

  it("is deterministic for the same verifier", async () => {
    const verifier = "test-verifier-abc123";
    const c1 = await generateCodeChallenge(verifier);
    const c2 = await generateCodeChallenge(verifier);
    expect(c1).toBe(c2);
  });

  it("produces different challenges for different verifiers", async () => {
    const c1 = await generateCodeChallenge(generateCodeVerifier());
    const c2 = await generateCodeChallenge(generateCodeVerifier());
    expect(c1).not.toBe(c2);
  });
});

// ---------------------------------------------------------------------------
// buildAuthorizationUrl
// ---------------------------------------------------------------------------

describe("buildAuthorizationUrl", () => {
  const params = {
    iss: "http://localhost:4000",
    redirectUri: "http://localhost:4001/callback",
    clientId: "ogca-smart-app",
  };

  it("returns a URL with required OAuth parameters", async () => {
    const { url } = await buildAuthorizationUrl(params, "state-xyz");
    const u = new URL(url);
    expect(u.searchParams.get("response_type")).toBe("code");
    expect(u.searchParams.get("client_id")).toBe("ogca-smart-app");
    expect(u.searchParams.get("redirect_uri")).toBe("http://localhost:4001/callback");
    expect(u.searchParams.get("state")).toBe("state-xyz");
    expect(u.searchParams.get("aud")).toBe("http://localhost:4000");
  });

  it("includes PKCE code_challenge and method=S256", async () => {
    const { url } = await buildAuthorizationUrl(params, "s1");
    const u = new URL(url);
    expect(u.searchParams.get("code_challenge_method")).toBe("S256");
    expect(u.searchParams.get("code_challenge")).toBeTruthy();
  });

  it("returns a verifier that matches the challenge", async () => {
    const { url, verifier } = await buildAuthorizationUrl(params, "s2");
    const challenge = new URL(url).searchParams.get("code_challenge") ?? "";
    expect(await generateCodeChallenge(verifier)).toBe(challenge);
  });

  it("appends launch param when provided", async () => {
    const { url } = await buildAuthorizationUrl({ ...params, launch: "launch-abc" }, "s3");
    expect(new URL(url).searchParams.get("launch")).toBe("launch-abc");
  });
});

// ---------------------------------------------------------------------------
// Cookie helpers
// ---------------------------------------------------------------------------

describe("serializeCookie", () => {
  it("serializes name=value with HttpOnly and SameSite=Lax by default", () => {
    const cookie = serializeCookie("token", "abc123");
    expect(cookie).toContain("token=abc123");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
  });

  it("includes Max-Age when provided", () => {
    const cookie = serializeCookie("token", "abc123", { maxAge: 3600 });
    expect(cookie).toContain("Max-Age=3600");
  });

  it("URL-encodes the value", () => {
    const cookie = serializeCookie("token", "a b+c");
    expect(cookie).toContain(encodeURIComponent("a b+c"));
  });
});

describe("parseCookies", () => {
  it("parses a cookie header into key-value pairs", () => {
    const cookies = parseCookies("token=abc; state=xyz");
    expect(cookies.token).toBe("abc");
    expect(cookies.state).toBe("xyz");
  });

  it("returns empty object for null input", () => {
    expect(parseCookies(null)).toEqual({});
  });

  it("URL-decodes values", () => {
    const cookies = parseCookies(`token=${encodeURIComponent("a b+c")}`);
    expect(cookies.token).toBe("a b+c");
  });
});

// ---------------------------------------------------------------------------
// Bypass mode
// ---------------------------------------------------------------------------

describe("bypassToken", () => {
  it("returns a Bearer token response with patient claim", () => {
    const t = bypassToken();
    expect(t.token_type).toBe("Bearer");
    expect(t.patient).toBe("jane-smith");
    expect(t.access_token).toBe("bypass-token");
  });

  it("accepts a custom patientId", () => {
    expect(bypassToken("custom-patient").patient).toBe("custom-patient");
  });
});

describe("isAuthBypassed", () => {
  const original = process.env.SMART_AUTH_BYPASS;
  afterEach(() => {
    process.env.SMART_AUTH_BYPASS = original;
  });

  it("returns true when SMART_AUTH_BYPASS=true", () => {
    process.env.SMART_AUTH_BYPASS = "true";
    expect(isAuthBypassed()).toBe(true);
  });

  it("returns false when SMART_AUTH_BYPASS is unset or false", () => {
    delete process.env.SMART_AUTH_BYPASS;
    expect(isAuthBypassed()).toBe(false);
    process.env.SMART_AUTH_BYPASS = "false";
    expect(isAuthBypassed()).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Token issuance and verification
// ---------------------------------------------------------------------------

describe("issueToken / verifyToken", () => {
  beforeEach(() => {
    process.env.SMART_JWT_SECRET = "test-secret-32-chars-exactly!!!";
    resetSigningKey(); // clear cache so each test gets the correct key
  });

  it("issues a verifiable JWT with correct claims", async () => {
    const token = await issueToken({
      sub: "user-1",
      patient: "jane-smith",
      scope: "patient/*.read",
    });
    const claims = await verifyToken(token);
    expect(claims.sub).toBe("user-1");
    expect(claims.patient).toBe("jane-smith");
    expect(claims.scope).toBe("patient/*.read");
  });

  it("token expires after the given duration", async () => {
    const token = await issueToken({
      sub: "u",
      patient: "p",
      scope: "s",
      expiresInSeconds: 3600,
    });
    const claims = await verifyToken(token);
    expect(claims.exp).toBeDefined();
    expect((claims.exp as number) - Math.floor(Date.now() / 1000)).toBeCloseTo(3600, -2);
  });

  it("verifyToken throws on a tampered token", async () => {
    const token = await issueToken({ sub: "u", patient: "p", scope: "s" });
    await expect(verifyToken(`${token}tampered`)).rejects.toThrow();
  });
});
