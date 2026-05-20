/** SMART client configuration for the DTR Client. */
export const SMART_CLIENT_ID = "ogca-dtr-client";

export const SMART_REDIRECT_URI = process.env.NEXT_PUBLIC_DTR_CLIENT_URL
  ? `${process.env.NEXT_PUBLIC_DTR_CLIENT_URL}/callback`
  : "http://localhost:4003/callback";

export const SMART_SCOPE = "launch launch/patient patient/*.read openid fhirUser";

/** EHR token endpoint derived from the EHR base URL. */
export const TOKEN_ENDPOINT = `${
  process.env.NEXT_PUBLIC_EHR_BASE_URL ?? "http://localhost:4000"
}/token`;
