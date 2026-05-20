/** SMART client configuration for the DTR Client. */
export const SMART_CLIENT_ID = "ogca-dtr-client";

export const SMART_REDIRECT_URI = process.env.NEXT_PUBLIC_DTR_CLIENT_URL
  ? `${process.env.NEXT_PUBLIC_DTR_CLIENT_URL}/callback`
  : "http://localhost:4003/callback";

export const SMART_SCOPE = "launch launch/patient patient/*.read openid fhirUser";
