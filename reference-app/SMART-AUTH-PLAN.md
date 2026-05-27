# SMART on FHIR Full Authorization Flow — Implementation Plan

## Current State

All three apps (CDS SMART App, DTR Client, EHR) run with `SMART_AUTH_BYPASS=true`.
In bypass mode the EHR launch endpoint skips OAuth, encodes the patient ID directly
into a cookie (`bypass-token:{patientId}`), and redirects straight to the app home.
No token exchange occurs; no authorization server is involved.

The `@ogca/smart-auth` package already contains all the primitives:

| Symbol | Status | Purpose |
|---|---|---|
| `buildSmartConfiguration(issuer)` | ✅ implemented | Build `.well-known/smart-configuration` JSON |
| `buildAuthorizationUrl(params, state)` | ✅ implemented | Client-side PKCE redirect URL |
| `issueToken(claims)` | ✅ implemented | Sign an HS256 JWT with patient + scope |
| `verifyToken(token)` | ✅ implemented | Verify and decode the JWT |
| `exchangeCode(params)` | ✅ implemented | Client-side code→token POST |
| PKCE helpers (`generateVerifier`, `deriveChallenge`) | ✅ implemented | RFC 7636 S256 |
| EHR authorization endpoint | ❌ missing | Accepts `code` request, issues auth code |
| EHR token endpoint | ❌ missing | Exchanges code + verifier for JWT |
| EHR SMART configuration endpoint | ❌ missing | Advertises auth + token URLs |
| In-memory authorization code store | ❌ missing | Holds pending codes during exchange |

---

## What Needs to Be Built

### 1. EHR — Three new API routes

#### `GET /api/fhir/.well-known/smart-configuration`

Advertises the EHR as a SMART authorization server. The SMART App calls this
immediately after receiving the `iss` launch parameter.

```
Response (200 application/json):
{
  "issuer": "http://localhost:4001/api/fhir",
  "authorization_endpoint": "http://localhost:4001/api/auth/authorize",
  "token_endpoint": "http://localhost:4001/api/auth/token",
  "scopes_supported": ["launch", "launch/patient", "patient/*.read", "openid", "fhirUser"],
  "response_types_supported": ["code"],
  "capabilities": ["launch-ehr", "client-public", "context-ehr-patient", "permission-patient"],
  "code_challenge_methods_supported": ["S256"]
}
```

Implementation: call `buildSmartConfiguration(EHR_FHIR_BASE)` from `@ogca/smart-auth`.

---

#### `GET /api/auth/authorize`

The OAuth 2.0 authorization endpoint. The SMART App redirects here with PKCE.

**Query parameters:**

| Param | Required | Description |
|---|---|---|
| `response_type` | yes | Must be `code` |
| `client_id` | yes | Any public client ID (reference impl: accept all) |
| `redirect_uri` | yes | Must be within the allowed origins (SMART App / DTR) |
| `scope` | yes | e.g. `launch/patient patient/*.read openid fhirUser` |
| `launch` | yes (EHR launch) | Opaque launch context issued by the EHR. In this reference impl the EHR sets it to `patient/{patientId}` |
| `state` | yes | Random string; must be echoed back verbatim |
| `code_challenge` | yes | PKCE S256 challenge derived from the verifier |
| `code_challenge_method` | yes | Must be `S256` |

**Behavior:**

1. Validate `response_type=code`, presence of `code_challenge`, `code_challenge_method=S256`.
2. Extract `patientId` from `launch` (pattern `patient/{id}`).
3. Generate a short-lived authorization code (random UUID, TTL 60 s).
4. Store `{ code → { patientId, scope, redirect_uri, code_challenge, expiresAt } }` in the
   **in-memory code store** (see below).
5. Redirect to `{redirect_uri}?code={code}&state={state}`.

For the reference implementation this endpoint auto-approves all requests — no user
consent screen is shown. A production implementation would display a consent UI here.

---

#### `POST /api/auth/token`

The OAuth 2.0 token endpoint. The SMART App calls this to exchange its authorization
code for a bearer token.

**Request body** (`application/x-www-form-urlencoded`):

| Field | Value |
|---|---|
| `grant_type` | `authorization_code` |
| `code` | Authorization code from the authorize step |
| `redirect_uri` | Must match what was registered at authorize time |
| `code_verifier` | PKCE verifier; SHA-256 hash must equal stored `code_challenge` |
| `client_id` | Same client ID used at authorize time |

**Behavior:**

1. Look up `code` in the code store. Return `400 invalid_grant` if absent or expired.
2. Verify PKCE: `SHA-256(code_verifier)` base64url-encoded must equal stored `code_challenge`.
3. Delete the code from the store (single-use).
4. Call `issueToken({ sub: clientId, patient: patientId, scope })` from `@ogca/smart-auth`.
5. Return:

```json
{
  "access_token": "<signed JWT>",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "launch/patient patient/*.read openid fhirUser",
  "patient": "jane-smith"
}
```

---

### 2. EHR — In-memory authorization code store

A simple module-level `Map` in the EHR app:

```typescript
// apps/ehr/lib/auth-code-store.ts
interface PendingCode {
  patientId:     string;
  scope:         string;
  redirectUri:   string;
  codeChallenge: string;
  expiresAt:     number; // Date.now() + 60_000
}
const store = new Map<string, PendingCode>();

export function storeCode(code: string, data: PendingCode): void { ... }
export function consumeCode(code: string): PendingCode | null { ... }
```

`consumeCode` deletes the entry after reading it (single-use) and returns `null` if
the code is absent or past `expiresAt`.

---

### 3. EHR — SMART App launch route update

The existing `apps/ehr/app/patients/[id]/page.tsx` already builds the launch URL:

```
http://localhost:4002/launch?iss={EHR_FHIR_BASE}&launch=patient/{patientId}
```

No change needed here — the `launch=patient/{id}` encoding is already what the
authorize endpoint expects.

---

### 4. `packages/smart-auth` — Minor additions

The `exchangeCode` function already exists. The SMART App and DTR launch/callback
routes use it when `SMART_AUTH_BYPASS=false`. No new primitives needed — just ensure:

- `SMART_JWT_SECRET` env var is set on the EHR (default `ogca-dev-secret-change-in-production`
  is already in the package for dev; set a real secret in production).
- The same secret is set on SMART App and DTR so `verifyToken` succeeds.

---

### 5. Environment variable changes

Remove or set to `false` in each app's `.env.local`:

```bash
# apps/ehr/.env.local
SMART_AUTH_BYPASS=false
SMART_JWT_SECRET=ogca-dev-secret-change-in-production

# apps/smart-app/.env.local
SMART_AUTH_BYPASS=false
SMART_JWT_SECRET=ogca-dev-secret-change-in-production

# apps/dtr-client/.env.local
SMART_AUTH_BYPASS=false
SMART_JWT_SECRET=ogca-dev-secret-change-in-production
```

All three apps share the same `SMART_JWT_SECRET` so tokens issued by the EHR can be
verified by the SMART App and DTR.

---

## Full Launch Sequence (non-bypass)

```
EHR chart page
  │
  │  GET /launch?iss=http://localhost:4001/api/fhir&launch=patient/jane-smith
  ▼
SMART App /launch route
  │  1. Calls buildAuthorizationUrl({ iss, redirectUri, clientId, scope, launch }, state)
  │     which internally fetches iss/.well-known/smart-configuration to discover endpoints
  │  2. Generates PKCE verifier + challenge
  │  3. Stores verifier in VERIFIER_COOKIE, state in STATE_COOKIE
  │  4. Redirects browser to:
  ▼
EHR GET /api/auth/authorize
  │  1. Validates params, extracts patientId from launch=patient/jane-smith
  │  2. Stores { code → { patientId, scope, codeChallenge, redirectUri } }
  │  3. Redirects to:
  ▼
SMART App GET /callback?code={code}&state={state}
  │  1. Verifies state matches STATE_COOKIE
  │  2. Calls exchangeCode({ code, verifier, redirectUri, tokenEndpoint })
  ▼
EHR POST /api/auth/token
  │  1. Looks up code, verifies PKCE, deletes code (single-use)
  │  2. Calls issueToken({ patient, scope }) → signed HS256 JWT
  │  3. Returns { access_token, patient, scope, ... }
  ▼
SMART App /callback route
  │  1. Stores access_token in TOKEN_COOKIE
  │  2. Redirects to SMART App home /
  ▼
SMART App page.tsx
     1. Reads TOKEN_COOKIE
     2. Calls verifyToken(rawToken) → { patient: "jane-smith", scope, ... }
     3. Uses patient + bearerToken for FHIR requests
```

---

## Files to Create / Modify

| File | Change |
|---|---|
| `apps/ehr/lib/auth-code-store.ts` | **New** — in-memory code store |
| `apps/ehr/app/api/fhir/.well-known/smart-configuration/route.ts` | **New** — SMART config endpoint |
| `apps/ehr/app/api/auth/authorize/route.ts` | **New** — Authorization endpoint |
| `apps/ehr/app/api/auth/token/route.ts` | **New** — Token endpoint |
| `apps/ehr/.env.local` | Set `SMART_AUTH_BYPASS=false`, add `SMART_JWT_SECRET` |
| `apps/smart-app/.env.local` | Set `SMART_AUTH_BYPASS=false`, add `SMART_JWT_SECRET` |
| `apps/dtr-client/.env.local` | Set `SMART_AUTH_BYPASS=false`, add `SMART_JWT_SECRET` |

No changes needed to `packages/smart-auth` — all required primitives already exist.

---

## Security Notes (Reference Implementation)

- **Secret key**: `SMART_JWT_SECRET` uses HS256 (symmetric). All services sharing the
  secret can both issue and verify tokens. Suitable for a reference impl; a production
  system would use RS256 with a public/private key pair and expose a JWKS endpoint.
- **Public clients**: The authorize endpoint accepts any `client_id` without validation.
  This is intentional for a reference implementation.
- **No consent screen**: The authorize endpoint auto-approves all requests. A production
  implementation displays a patient consent UI.
- **In-memory code store**: Authorization codes live only in the current Node.js process.
  Restarting the EHR dev server invalidates all pending codes. Acceptable for demos.
- **PKCE is enforced**: `code_challenge` is required and verified at token exchange.
  This protects against authorization code interception even with the simplified server.

---

## Out of Scope for This Plan

- Refresh tokens
- Token introspection endpoint
- JWKS endpoint (RS256)
- Multi-tenant or multi-patient consent
- Standalone launch (no EHR context)
- `offline_access` scope
