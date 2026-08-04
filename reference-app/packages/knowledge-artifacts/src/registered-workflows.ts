/**
 * REGISTERED_WORKFLOWS — the single source of truth for all condition-specific
 * CDS workflows in the MOPA reference implementation.
 *
 * Each entry pairs a Layer 1 (guideline authority) and Layer 2 (payer policy)
 * PlanDefinition, the Libraries they depend on, and the CDS Hooks events they
 * respond to. The Hub content page reads this to build the condition selector.
 * buildDiscoveryResponse() derives the hook event set from active entries.
 *
 * FHIR R4 Clinical Reasoning: each Layer 2 PlanDefinition (type=eca-rule) maps
 * to a CDS service via its action.trigger (type=named-event, name=<hook-event>).
 */
import { GUIDELINE_PLAN_DEFINITION, PLAN_DEFINITION } from "./plan-definitions";
import { NSCLC_GUIDELINE_PLAN_DEFINITION, NSCLC_PLAN_DEFINITION } from "./plan-definitions";
import { GUIDELINE_LIBRARY, PAYER_POLICY_LIBRARY } from "./libraries";
import { NSCLC_GUIDELINE_LIBRARY, NSCLC_PAYER_POLICY_LIBRARY } from "./libraries";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DecisionRow {
  input: string;
  output: string;
  positive?: boolean;
}

export interface WorkflowLayerEntry {
  /** PlanDefinition.id */
  planDefId: string;
  /** Column header — e.g. "Breast Cancer Guideline Authority" */
  title: string;
  /** Library.name (for display and download links) */
  libraryName: string;
  /** Library.version */
  libraryVersion: string;
  /** Short attribution — e.g. "CDS SMART App" */
  usedBy: string;
  /** Long-form purpose prose */
  purpose: string;
  /** Summary decision table */
  decisionRows: DecisionRow[];
  /** PlanDefinition resource (for Plan Definition section) */
  planDef: {
    id: string;
    title: string;
    description?: string;
    purpose?: string;
    actions: readonly unknown[];
  };
  /** Library dataRequirement array (for Library section) */
  dataRequirements: readonly unknown[];
  /** Filename under cql/ for embedded CQL display; undefined = not yet implemented */
  cqlFile?: string;
}

export interface WorkflowEntry {
  conditionCode: string;
  conditionSystem: string;
  conditionDisplay: string;
  /** Short label for condition tabs */
  shortName: string;
  /**
   * active: fully implemented with CQL.
   * draft:  PlanDefinitions defined but CQL not yet authored.
   */
  status: "active" | "draft";
  /**
   * CDS Hook event names this workflow responds to.
   * Derived from PlanDefinition.action[*].trigger[*].name per FHIR R4
   * Clinical Reasoning spec. buildDiscoveryResponse() reads the union of
   * these across all active entries to determine which hooks to advertise.
   */
  hookEvents: string[];
  layer1: WorkflowLayerEntry;
  layer2: WorkflowLayerEntry;
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const REGISTERED_WORKFLOWS: WorkflowEntry[] = [
  // -------------------------------------------------------------------------
  // Breast Cancer (active)
  // -------------------------------------------------------------------------
  {
    conditionCode: "372137005",
    conditionSystem: "http://snomed.info/sct",
    conditionDisplay: "Primary malignant neoplasm of breast",
    shortName: "Breast Cancer",
    status: "active",
    hookEvents: ["order-select", "order-sign"],
    layer1: {
      planDefId: GUIDELINE_PLAN_DEFINITION.id,
      title: "Breast Cancer Guideline Authority",
      libraryName: GUIDELINE_LIBRARY.name,
      libraryVersion: GUIDELINE_LIBRARY.version,
      usedBy: "CDS SMART App",
      purpose:
        "Encodes evidence-based clinical criteria for breast cancer chemotherapy " +
        "selection based on HER2 receptor status. Used exclusively by the Layer 1 " +
        "CDS SMART App. Does not encode coverage, authorization, or administrative requirements.",
      decisionRows: [
        { input: "No active breast cancer diagnosis", output: "No recommendation" },
        { input: "Diagnosis present, HER2 positive", output: "TH indicated", positive: true },
        { input: "Diagnosis present, HER2 positive", output: "PHD indicated", positive: true },
        {
          input: "Diagnosis present, HER2 negative",
          output: "ddAC to T indicated",
          positive: true,
        },
        { input: "Diagnosis present, HER2 absent", output: "Gap: document HER2 status" },
      ],
      planDef: {
        id: GUIDELINE_PLAN_DEFINITION.id,
        title: GUIDELINE_PLAN_DEFINITION.title,
        description: GUIDELINE_PLAN_DEFINITION.description,
        purpose: GUIDELINE_PLAN_DEFINITION.purpose,
        actions: GUIDELINE_PLAN_DEFINITION.action,
      },
      dataRequirements: GUIDELINE_LIBRARY.dataRequirement,
      cqlFile: "BreastCancerGuideline.cql",
    },
    layer2: {
      planDefId: PLAN_DEFINITION.id,
      title: "Breast Cancer Payer Policy",
      libraryName: PAYER_POLICY_LIBRARY.name,
      libraryVersion: PAYER_POLICY_LIBRARY.version,
      usedBy: "CRD Service",
      purpose:
        "Enables systematic evaluation of prior authorization requirements at the " +
        "point of prescribing. Reduces manual review burden by ensuring data completeness " +
        "before PA submission and pre-authorizing eligible patients (ECOG 0) without a " +
        "formal PA request.",
      decisionRows: [
        { input: "No active breast cancer diagnosis", output: "No recommendation" },
        { input: "HER2 / Stage / ECOG absent", output: "DTR required: collect missing data" },
        {
          input: "All present, ECOG = 0",
          output: "Pre-authorized, no PA required",
          positive: true,
        },
        { input: "All present, ECOG >= 1", output: "PA required: submit to payer", positive: true },
        { input: "HER2 negative, criteria not met", output: "Policy not met" },
      ],
      planDef: {
        id: PLAN_DEFINITION.id,
        title: PLAN_DEFINITION.title,
        description: PLAN_DEFINITION.description,
        purpose: PLAN_DEFINITION.purpose,
        actions: PLAN_DEFINITION.action,
      },
      dataRequirements: PAYER_POLICY_LIBRARY.dataRequirement,
      cqlFile: "BreastCancerPayerPolicy.cql",
    },
  },

  // -------------------------------------------------------------------------
  // Non-Small Cell Lung Cancer (draft)
  // -------------------------------------------------------------------------
  {
    conditionCode: "254637007",
    conditionSystem: "http://snomed.info/sct",
    conditionDisplay: "Non-small cell lung cancer",
    shortName: "NSCLC",
    status: "draft",
    hookEvents: ["order-select", "order-sign"],
    layer1: {
      planDefId: NSCLC_GUIDELINE_PLAN_DEFINITION.id,
      title: "NSCLC Guideline Authority",
      libraryName: NSCLC_GUIDELINE_LIBRARY.name,
      libraryVersion: NSCLC_GUIDELINE_LIBRARY.version,
      usedBy: "CDS SMART App",
      purpose:
        "Encodes evidence-based regimen selection for non-small cell lung cancer based " +
        "on biomarker status (EGFR mutation, ALK rearrangement, PD-L1 expression) and " +
        "histology. Identifies missing biomarker data and recommends targeted therapy, " +
        "immunotherapy, or platinum-doublet chemotherapy when criteria are met.",
      decisionRows: [
        { input: "EGFR mutation detected", output: "Osimertinib indicated", positive: true },
        { input: "ALK rearrangement detected", output: "Alectinib indicated", positive: true },
        { input: "PD-L1 >= 50%", output: "Pembrolizumab monotherapy indicated", positive: true },
        { input: "PD-L1 1 to 49%", output: "Chemo-immunotherapy indicated", positive: true },
        {
          input: "All biomarkers negative or low",
          output: "Platinum doublet chemotherapy indicated",
          positive: true,
        },
        { input: "Biomarkers absent", output: "Gap: document EGFR / ALK / PD-L1" },
      ],
      planDef: {
        id: NSCLC_GUIDELINE_PLAN_DEFINITION.id,
        title: NSCLC_GUIDELINE_PLAN_DEFINITION.title,
        description: NSCLC_GUIDELINE_PLAN_DEFINITION.description,
        purpose: NSCLC_GUIDELINE_PLAN_DEFINITION.purpose,
        actions: NSCLC_GUIDELINE_PLAN_DEFINITION.action,
      },
      dataRequirements: NSCLC_GUIDELINE_LIBRARY.dataRequirement,
      cqlFile: undefined,
    },
    layer2: {
      planDefId: NSCLC_PLAN_DEFINITION.id,
      title: "NSCLC Payer Policy",
      libraryName: NSCLC_PAYER_POLICY_LIBRARY.name,
      libraryVersion: NSCLC_PAYER_POLICY_LIBRARY.version,
      usedBy: "CRD Service",
      purpose:
        "Governs coverage determination for NSCLC systemic therapy orders. Requires EGFR, " +
        "ALK, and PD-L1 biomarker documentation before authorization. Pre-authorizes targeted " +
        "therapies for biomarker-driven indications with ECOG 0 to 1.",
      decisionRows: [
        { input: "EGFR / ALK / PD-L1 absent", output: "DTR required: collect biomarker data" },
        {
          input: "Actionable mutation, ECOG 0 to 1",
          output: "Pre-authorized: targeted therapy",
          positive: true,
        },
        {
          input: "IO eligible (PD-L1 >= 50%), ECOG 0 to 1",
          output: "Pre-authorized: immunotherapy",
          positive: true,
        },
        {
          input: "Biomarkers present, ECOG >= 2",
          output: "PA required: submit to payer",
          positive: true,
        },
        { input: "Criteria not met", output: "Policy not met" },
      ],
      planDef: {
        id: NSCLC_PLAN_DEFINITION.id,
        title: NSCLC_PLAN_DEFINITION.title,
        description: NSCLC_PLAN_DEFINITION.description,
        purpose: NSCLC_PLAN_DEFINITION.purpose,
        actions: NSCLC_PLAN_DEFINITION.action,
      },
      dataRequirements: NSCLC_PAYER_POLICY_LIBRARY.dataRequirement,
      cqlFile: undefined,
    },
  },
];
