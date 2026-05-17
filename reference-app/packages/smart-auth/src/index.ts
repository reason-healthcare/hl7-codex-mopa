// SMART Auth stub — Phase 4 will implement SMART on FHIR OAuth flow

export interface SmartConfig {
  issuer: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  scopes: string[];
}

export interface SmartTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  patient?: string;
  intent?: string;
  smart_style_url?: string;
}

/** Returns true when auth bypass is enabled (SMART_AUTH_BYPASS=true env var). */
export function isAuthBypassed(): boolean {
  return process.env.SMART_AUTH_BYPASS === "true";
}
