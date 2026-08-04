/** Canonical base URL for all MOPA knowledge artifacts. */
export const BASE_URL = "http://hl7.org/fhir/us/codex-mopa";

/** Canonical URL of the PA data requirements Library. */
export const LIBRARY_CANONICAL = `${BASE_URL}/Library/BreastCancerPADataRequirements`;

/** Canonical URL of the Oncology CRD catalog Library. */
export const CATALOG_URL = `${BASE_URL}/Library/OncologyCRDCatalog`;

/**
 * Baseline CDS Hooks prefetch — condition-agnostic, included in every hook call.
 * Enough to identify the patient's primary cancer condition for routing.
 */
export const BASELINE_PREFETCH_TEMPLATES: Record<string, string> = {
  patient: "Patient/{{context.patientId}}",
  conditions: "Condition?patient={{context.patientId}}&category=problem-list-item&_count=20",
};

export const SYSTEM = {
  LOINC: "http://loinc.org",
  SNOMED: "http://snomed.info/sct",
  LIBRARY_TYPE: "http://terminology.hl7.org/CodeSystem/library-type",
  PLAN_TYPE: "http://terminology.hl7.org/CodeSystem/plan-definition-type",
  ACTION_TYPE: "http://terminology.hl7.org/CodeSystem/action-type",
  /** FHIR R4 standard usage-context-type codes (focus, workflow, task, …). */
  USAGE_CONTEXT_TYPE: "http://terminology.hl7.org/CodeSystem/usage-context-type",
  /** MOPA-specific layer classifier for usageContext.valueCodeableConcept. */
  MOPA_LAYER: "http://hl7.org/fhir/us/codex-mopa/CodeSystem/mopa-layer",
} as const;

/** Extension canonical URLs for MOPA regimen profiles. */
export const EXT = {
  REGIMEN_INTENT: `${BASE_URL}/StructureDefinition/ocpa-regimen-intent`,
  REGIMEN_TREATMENT_LINE: `${BASE_URL}/StructureDefinition/ocpa-regimen-treatment-line`,
  REGIMEN_DISEASE_CTX: `${BASE_URL}/StructureDefinition/ocpa-regimen-disease-context`,
  DAYS_OF_CYCLE: `${BASE_URL}/StructureDefinition/regimen-days-of-cycle`,
} as const;

/** Treatment line code system (local, mCODE STU5 migration candidate). */
export const TREATMENT_LINE_CS = `${BASE_URL}/CodeSystem/treatment-line-cs`;
export const MOPA_LAYER = {
  GUIDELINE_AUTHORITY: "guideline-authority",
  PAYER_POLICY: "payer-policy",
  REGIMEN_TEMPLATE: "regimen-template",
} as const;

/**
 * Build a single-element usageContext array that tags a resource with its
 * MOPA workflow layer (guideline-authority | payer-policy | regimen-template).
 */
export function layerContext(code: (typeof MOPA_LAYER)[keyof typeof MOPA_LAYER], display: string) {
  return [
    {
      code: { system: SYSTEM.USAGE_CONTEXT_TYPE, code: "workflow" },
      valueCodeableConcept: {
        coding: [{ system: SYSTEM.MOPA_LAYER, code, display }],
      },
    },
  ] as const;
}
