// Constants + helpers
export {
  BASE_URL,
  LIBRARY_CANONICAL,
  PAYER_POLICY_CANONICAL,
  CATALOG_URL,
  SYSTEM,
  MOPA_LAYER,
  layerContext,
  EXT,
  PROFILES,
  TREATMENT_LINE_CS,
} from "./constants";

// Libraries
export {
  GUIDELINE_LIBRARY,
  PAYER_POLICY_LIBRARY,
  LIBRARY_RESOURCE,
  ONCOLOGY_CRD_CATALOG,
  NSCLC_GUIDELINE_LIBRARY,
  NSCLC_PAYER_POLICY_LIBRARY,
} from "./libraries";

// PlanDefinitions
export {
  // Breast Cancer — eca-rule
  GUIDELINE_PLAN_DEFINITION,
  PLAN_DEFINITION,
  // Breast Cancer — order-set regimens
  REGIMEN_TH,
  REGIMEN_PHD,
  REGIMEN_DDACT,
  // NSCLC — eca-rule (draft)
  NSCLC_GUIDELINE_PLAN_DEFINITION,
  NSCLC_PLAN_DEFINITION,
  // NSCLC — order-set regimens (draft)
  REGIMEN_OSIMERTINIB,
  REGIMEN_ALECTINIB,
  REGIMEN_PEMBROLIZUMAB,
} from "./plan-definitions";

// Condition registry (CRD routing)
export {
  CONDITION_REGISTRY,
  CATALOG_URL as CONDITION_CATALOG_URL,
  findConditionEntry,
} from "./condition-registry";
export type { ConditionRegistryEntry } from "./condition-registry";

// Registered workflows (content page + CRD discovery)
export { REGISTERED_WORKFLOWS } from "./registered-workflows";
export type { WorkflowEntry, WorkflowLayerEntry, DecisionRow } from "./registered-workflows";

// Library content embedding (Hub FHIR API)
export { withEmbeddedContent } from "./library-content";
