/**
 * Shared registry for the Hub FHIR knowledge artifact API.
 * Library and PlanDefinition routes import from here.
 *
 * Logic libraries are served with embedded CQL + ELM per Using CQL with FHIR IG.
 * Draft resources (NSCLC) are served as-is — no CQL to embed yet.
 */
import {
  GUIDELINE_LIBRARY,
  PAYER_POLICY_LIBRARY,
  LIBRARY_RESOURCE,
  ONCOLOGY_CRD_CATALOG,
  NSCLC_GUIDELINE_LIBRARY,
  NSCLC_PAYER_POLICY_LIBRARY,
  GUIDELINE_PLAN_DEFINITION,
  PLAN_DEFINITION,
  NSCLC_GUIDELINE_PLAN_DEFINITION,
  NSCLC_PLAN_DEFINITION,
  REGIMEN_TH,
  REGIMEN_PHD,
  REGIMEN_DDACT,
  REGIMEN_OSIMERTINIB,
  REGIMEN_ALECTINIB,
  REGIMEN_PEMBROLIZUMAB,
  withEmbeddedContent,
} from "@ogca/knowledge-artifacts";

// ---------------------------------------------------------------------------
// Libraries
// ---------------------------------------------------------------------------

export const LIBRARIES: Record<string, object> = {
  BreastCancerGuideline: withEmbeddedContent(
    GUIDELINE_LIBRARY,
    "BreastCancerGuideline.cql",
    "BreastCancerGuideline.elm.json"
  ),
  BreastCancerPayerPolicy: withEmbeddedContent(
    PAYER_POLICY_LIBRARY,
    "BreastCancerPayerPolicy.cql",
    "BreastCancerPayerPolicy.elm.json"
  ),
  BreastCancerPADataRequirements: LIBRARY_RESOURCE,
  OncologyCRDCatalog: ONCOLOGY_CRD_CATALOG,
  // NSCLC — no CQL yet; served as metadata-only
  LungCancerGuideline: NSCLC_GUIDELINE_LIBRARY,
  LungCancerPayerPolicy: NSCLC_PAYER_POLICY_LIBRARY,
};

// ---------------------------------------------------------------------------
// PlanDefinitions
// ---------------------------------------------------------------------------

export const PLAN_DEFINITIONS: Record<string, object> = {
  // ECA rules — Layer 1
  BreastCancerGuidelineCDS: GUIDELINE_PLAN_DEFINITION,
  NSCLCGuidelineCDS: NSCLC_GUIDELINE_PLAN_DEFINITION,
  // ECA rules — Layer 2
  BreastCancerPAWorkflow: PLAN_DEFINITION,
  NSCLCPAWorkflow: NSCLC_PLAN_DEFINITION,
  // Order sets — Breast Cancer
  RegimenTH: REGIMEN_TH,
  RegimenPHD: REGIMEN_PHD,
  RegimenDdACT: REGIMEN_DDACT,
  // Order sets — NSCLC (draft)
  RegimenOsimertinib: REGIMEN_OSIMERTINIB,
  RegimenAlectinib: REGIMEN_ALECTINIB,
  RegimenPembrolizumab: REGIMEN_PEMBROLIZUMAB,
};

// ---------------------------------------------------------------------------
// Search helpers — used by both Library and PlanDefinition routes
// ---------------------------------------------------------------------------

type AnyResource = Record<string, unknown>;

/** Match usageContext.valueCodeableConcept.coding[*].code */
export function matchesContext(r: AnyResource, code: string): boolean {
  const uc = r.usageContext as
    | Array<{
        valueCodeableConcept?: { coding?: Array<{ code?: string; system?: string }> };
      }>
    | undefined;
  return (uc ?? []).some((u) =>
    (u.valueCodeableConcept?.coding ?? []).some((c) => c.code === code)
  );
}

/**
 * Match FHIR composite context-type-value param.
 * Format: <context-type-code>$<context-value-code>
 * e.g. "workflow$guideline-authority"
 * Systems are optional; if present format is system|code.
 */
export function matchesContextTypeValue(r: AnyResource, param: string): boolean {
  const [typeToken, valueToken] = param.split("$");
  if (!typeToken || !valueToken) return false;
  const typeCode = typeToken.includes("|") ? typeToken.split("|")[1] : typeToken;
  const valueCode = valueToken.includes("|") ? valueToken.split("|")[1] : valueToken;
  const uc = r.usageContext as
    | Array<{
        code?: { code?: string };
        valueCodeableConcept?: { coding?: Array<{ code?: string }> };
      }>
    | undefined;
  return (uc ?? []).some(
    (u) =>
      u.code?.code === typeCode &&
      (u.valueCodeableConcept?.coding ?? []).some((c) => c.code === valueCode)
  );
}

/** Match type.coding[*].code (eca-rule | order-set | logic-library | asset-collection) */
export function matchesType(r: AnyResource, code: string): boolean {
  const t = r.type as { coding?: Array<{ code?: string }> } | undefined;
  return (t?.coding ?? []).some((c) => c.code === code);
}

// ---------------------------------------------------------------------------
// Bundle builder
// ---------------------------------------------------------------------------

export function fhirBundle(
  resourceType: string,
  base: string,
  entries: [string, object][]
): object {
  return {
    resourceType: "Bundle",
    type: "searchset",
    total: entries.length,
    entry: entries.map(([id, resource]) => ({
      fullUrl: `${base}/fhir/${resourceType}/${id}`,
      resource,
    })),
  };
}
