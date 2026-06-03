/**
 * In-memory authorization code store.
 *
 * Holds pending PKCE authorization codes from /api/auth/authorize until they
 * are consumed by /api/auth/token. Each code is single-use and expires after
 * 60 seconds. Acceptable for a reference implementation — a production server
 * would use Redis or a database so codes survive process restarts.
 */

const CODE_TTL_MS = 60_000;

export interface PendingCode {
  patientId: string;
  scope: string;
  redirectUri: string;
  codeChallenge: string;
  /** OAuth state parameter — threaded as correlationId through the Activity feed. */
  state: string;
  expiresAt: number;
}

const store = new Map<string, PendingCode>();

/** Persist a freshly issued authorization code. */
export function storeCode(code: string, data: Omit<PendingCode, "expiresAt">): void {
  store.set(code, { ...data, expiresAt: Date.now() + CODE_TTL_MS });
}

/**
 * Look up and atomically consume an authorization code.
 * Returns the associated grant data, or `null` when the code is unknown,
 * already used, or expired.
 */
export function consumeCode(code: string): PendingCode | null {
  const entry = store.get(code);
  if (!entry) return null;
  store.delete(code); // single-use
  if (Date.now() > entry.expiresAt) return null;
  return entry;
}
