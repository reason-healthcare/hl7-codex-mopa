/** SMART client configuration for the CDS SMART App. */
export const SMART_CLIENT_ID = "mopa-smart-app";

export const SMART_REDIRECT_URI = process.env.NEXT_PUBLIC_SMART_APP_URL
  ? `${process.env.NEXT_PUBLIC_SMART_APP_URL}/callback`
  : "http://localhost:4002/callback";

export const SMART_SCOPE = "launch launch/patient patient/*.read openid fhirUser";

/** EHR token endpoint — matches the dedicated auth route on the EHR. */
export const TOKEN_ENDPOINT = `${
  process.env.NEXT_PUBLIC_EHR_BASE_URL ?? "http://localhost:4001"
}/api/auth/token`;

/** EHR base URL used to build deep-links back to order entry. */
export const EHR_BASE_URL = process.env.NEXT_PUBLIC_EHR_BASE_URL ?? "http://localhost:4000";
