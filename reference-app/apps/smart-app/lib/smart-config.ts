/** SMART client configuration for the CDS SMART App. */
export const SMART_CLIENT_ID = "ogca-smart-app";

export const SMART_REDIRECT_URI = process.env.NEXT_PUBLIC_SMART_APP_URL
  ? `${process.env.NEXT_PUBLIC_SMART_APP_URL}/callback`
  : "http://localhost:4001/callback";

export const SMART_SCOPE = "launch launch/patient patient/*.read openid fhirUser";

/** EHR token endpoint derived from the EHR base URL. */
export const TOKEN_ENDPOINT = `${
  process.env.NEXT_PUBLIC_EHR_BASE_URL ?? "http://localhost:4000"
}/token`;

/** CRD Service base URL for fetching the Library resource. */
export const CRD_SERVICE_URL = process.env.NEXT_PUBLIC_CRD_SERVICE_URL ?? "http://localhost:4002";

/** Full URL of the PA data requirements Library on the CRD service. */
export const CRD_LIBRARY_URL = `${CRD_SERVICE_URL}/api/Library/BreastCancerPADataRequirements`;

/** EHR base URL used to build deep-links back to order entry. */
export const EHR_BASE_URL = process.env.NEXT_PUBLIC_EHR_BASE_URL ?? "http://localhost:4000";
