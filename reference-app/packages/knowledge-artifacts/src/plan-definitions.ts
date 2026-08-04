/**
 * FHIR PlanDefinition resources for MOPA knowledge artifacts.
 *
 * Three PlanDefinition types in use:
 *   eca-rule     — event-condition-action rules (Layer 1 guideline + Layer 2 payer policy)
 *   order-set    — regimen templates (selectable chemotherapy orders)
 *
 * Layer 2 eca-rule PlanDefinitions carry FHIR R4 Clinical Reasoning triggers:
 *   action[*].trigger[*].type  = "named-event"
 *   action[*].trigger[*].name  = <CDS Hooks event>  (order-select | order-sign)
 * buildDiscoveryResponse() reads these to derive the CDS discovery hook set.
 *
 * usageContext distinguishes the MOPA layer on each resource so the Hub
 * FHIR API can filter by context=guideline-authority | payer-policy | regimen-template.
 */
import {
  BASE_URL,
  LIBRARY_CANONICAL,
  SYSTEM,
  MOPA_LAYER,
  layerContext,
  EXT,
  TREATMENT_LINE_CS,
} from "./constants";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a regimenIntent extension value. */
function regimenIntent(snomedCode: string, display: string) {
  return {
    url: EXT.REGIMEN_INTENT,
    valueCodeableConcept: { coding: [{ system: SYSTEM.SNOMED, code: snomedCode, display }] },
  };
}
/** Build a regimenTreatmentLine extension value. */
function treatmentLine(code: string, display: string) {
  return {
    url: EXT.REGIMEN_TREATMENT_LINE,
    valueCodeableConcept: { coding: [{ system: TREATMENT_LINE_CS, code, display }] },
  };
}
/** Build a regimenDiseaseContext extension value. */
function diseaseContext(snomedCode: string, display: string) {
  return {
    url: EXT.REGIMEN_DISEASE_CTX,
    valueCodeableConcept: { coding: [{ system: SYSTEM.SNOMED, code: snomedCode, display }] },
  };
}
/** Build a regimen-days-of-cycle extension on a timingTiming. */
function daysOfCycle(...days: number[]) {
  return {
    url: EXT.DAYS_OF_CYCLE,
    extension: days.map((d) => ({ url: "day", valueInteger: d })),
  };
}

// ===========================================================================
// ===========================================================================
// BREAST CANCER REGIMENS
// ===========================================================================

// ---------------------------------------------------------------------------
// TH — Paclitaxel + Trastuzumab (weekly, adjuvant HER2+)
// ---------------------------------------------------------------------------

export const REGIMEN_TH = {
  resourceType: "PlanDefinition",
  id: "RegimenTH",
  url: `${BASE_URL}/PlanDefinition/RegimenTH`,
  version: "0.1.0",
  name: "RegimenTH",
  title: "TH: Paclitaxel + Trastuzumab (Weekly) \u2014 Adjuvant HER2+ Breast Cancer",
  status: "active",
  experimental: true,
  type: { coding: [{ system: SYSTEM.PLAN_TYPE, code: "order-set", display: "Order Set" }] },
  usageContext: layerContext(MOPA_LAYER.REGIMEN_TEMPLATE, "Regimen Template"),
  description:
    "Weekly Paclitaxel + Trastuzumab for 12 weeks; standard adjuvant regimen for early HER2+ breast cancer.",
  subjectCodeableConcept: {
    coding: [{ system: SYSTEM.SNOMED, code: "254837009", display: "Malignant neoplasm of breast" }],
  },
  extension: [
    regimenIntent("373846009", "Adjuvant - intent"),
    treatmentLine("1L", "First-line"),
    diseaseContext("254837009", "Malignant neoplasm of breast"),
  ],
  action: [
    {
      id: "paclitaxel",
      title: "Paclitaxel 80 mg/m\u00b2 IV \u2014 Day 1 of each 7-day cycle",
      description: "80 mg/m\u00b2 IV over 1 hour, weekly (day 1 of 7-day cycle)",
      type: { coding: [{ system: SYSTEM.ACTION_TYPE, code: "create" }] },
      timingTiming: {
        extension: [daysOfCycle(1)],
        repeat: { count: 12, period: 7, periodUnit: "d" },
      },
    },
    {
      id: "trastuzumab",
      title: "Trastuzumab 4 mg/kg IV (loading), then 2 mg/kg IV weekly",
      description: "4 mg/kg loading dose week 1, then 2 mg/kg IV weekly (day 1 of 7-day cycle)",
      type: { coding: [{ system: SYSTEM.ACTION_TYPE, code: "create" }] },
      timingTiming: {
        extension: [daysOfCycle(1)],
        repeat: { count: 12, period: 7, periodUnit: "d" },
      },
    },
  ],
} as const;

// ---------------------------------------------------------------------------
// PHD — Pertuzumab + Trastuzumab + Docetaxel (q21d, first-line metastatic HER2+)
// ---------------------------------------------------------------------------

export const REGIMEN_PHD = {
  resourceType: "PlanDefinition",
  id: "RegimenPHD",
  url: `${BASE_URL}/PlanDefinition/RegimenPHD`,
  version: "0.1.0",
  name: "RegimenPHD",
  title:
    "PHD: Pertuzumab + Trastuzumab + Docetaxel \u2014 First-Line Metastatic HER2+ Breast Cancer",
  status: "active",
  experimental: true,
  type: { coding: [{ system: SYSTEM.PLAN_TYPE, code: "order-set", display: "Order Set" }] },
  usageContext: layerContext(MOPA_LAYER.REGIMEN_TEMPLATE, "Regimen Template"),
  description:
    "PHD every 21 days for first-line HER2+ metastatic breast cancer. Standard of care per CLEOPATRA trial.",
  subjectCodeableConcept: {
    coding: [{ system: SYSTEM.SNOMED, code: "254837009", display: "Malignant neoplasm of breast" }],
  },
  extension: [
    regimenIntent("363676003", "Palliative intent"),
    treatmentLine("1L", "First-line"),
    diseaseContext("254837009", "Malignant neoplasm of breast"),
  ],
  action: [
    {
      id: "pertuzumab",
      title: "Pertuzumab 840 mg IV (cycle 1), then 420 mg IV q21d",
      description: "840 mg IV loading dose cycle 1, then 420 mg IV, day 1 of each 21-day cycle",
      type: { coding: [{ system: SYSTEM.ACTION_TYPE, code: "create" }] },
      timingTiming: {
        extension: [daysOfCycle(1)],
        repeat: { period: 21, periodUnit: "d" },
      },
    },
    {
      id: "trastuzumab",
      title: "Trastuzumab 8 mg/kg IV (cycle 1), then 6 mg/kg IV q21d",
      description: "8 mg/kg loading dose cycle 1, then 6 mg/kg IV, day 1 of each 21-day cycle",
      type: { coding: [{ system: SYSTEM.ACTION_TYPE, code: "create" }] },
      timingTiming: {
        extension: [daysOfCycle(1)],
        repeat: { period: 21, periodUnit: "d" },
      },
    },
    {
      id: "docetaxel",
      title: "Docetaxel 75 mg/m\u00b2 IV \u2014 Day 1 of each 21-day cycle",
      description: "75 mg/m\u00b2 IV, day 1 of each 21-day cycle",
      type: { coding: [{ system: SYSTEM.ACTION_TYPE, code: "create" }] },
      timingTiming: {
        extension: [daysOfCycle(1)],
        repeat: { period: 21, periodUnit: "d" },
      },
    },
  ],
} as const;

// ---------------------------------------------------------------------------
// ddAC\u2192T — Dose-dense AC then Paclitaxel (sequential phases, adjuvant)
// relatedAction.relationship = "after-end" per FHIR R4 Clinical Reasoning
// and the MOPA AntiCancerRegimenPlanDefinition profile.
// ---------------------------------------------------------------------------

export const REGIMEN_DDACT = {
  resourceType: "PlanDefinition",
  id: "RegimenDdACT",
  url: `${BASE_URL}/PlanDefinition/RegimenDdACT`,
  version: "0.1.0",
  name: "RegimenDdACT",
  title: "ddAC\u2192T: Dose-Dense AC \u2192 Paclitaxel \u2014 Adjuvant Breast Cancer",
  status: "active",
  experimental: true,
  type: { coding: [{ system: SYSTEM.PLAN_TYPE, code: "order-set", display: "Order Set" }] },
  usageContext: layerContext(MOPA_LAYER.REGIMEN_TEMPLATE, "Regimen Template"),
  description:
    "Dose-dense AC x4 cycles (q14d) then paclitaxel x4 cycles (q14d). Standard adjuvant regimen. Requires G-CSF support.",
  subjectCodeableConcept: {
    coding: [{ system: SYSTEM.SNOMED, code: "254837009", display: "Malignant neoplasm of breast" }],
  },
  extension: [
    regimenIntent("373846009", "Adjuvant - intent"),
    treatmentLine("1L", "First-line"),
    diseaseContext("254837009", "Malignant neoplasm of breast"),
  ],
  action: [
    {
      id: "ac-phase",
      title: "AC Phase \u2014 Doxorubicin + Cyclophosphamide (q14d \u00d7 4 cycles)",
      description: "Cycles 1\u20134. Requires G-CSF support.",
      groupingBehavior: "sentence-group",
      selectionBehavior: "all",
      timingTiming: {
        repeat: { count: 4, period: 14, periodUnit: "d" },
      },
      action: [
        {
          id: "doxorubicin",
          title: "Doxorubicin 60 mg/m\u00b2 IV \u2014 Day 1 of each 14-day cycle",
          type: { coding: [{ system: SYSTEM.ACTION_TYPE, code: "create" }] },
          timingTiming: {
            extension: [daysOfCycle(1)],
            repeat: { period: 14, periodUnit: "d" },
          },
        },
        {
          id: "cyclophosphamide",
          title: "Cyclophosphamide 600 mg/m\u00b2 IV \u2014 Day 1 of each 14-day cycle",
          type: { coding: [{ system: SYSTEM.ACTION_TYPE, code: "create" }] },
          timingTiming: {
            extension: [daysOfCycle(1)],
            repeat: { period: 14, periodUnit: "d" },
          },
        },
      ],
    },
    {
      id: "t-phase",
      title: "T Phase \u2014 Paclitaxel (q14d \u00d7 4 cycles)",
      description: "Cycles 5\u20138, begins after AC phase ends. Requires G-CSF support.",
      groupingBehavior: "sentence-group",
      selectionBehavior: "all",
      relatedAction: [{ actionId: "ac-phase", relationship: "after-end" }],
      timingTiming: {
        repeat: { count: 4, period: 14, periodUnit: "d" },
      },
      action: [
        {
          id: "paclitaxel",
          title: "Paclitaxel 175 mg/m\u00b2 IV \u2014 Day 1 of each 14-day cycle",
          type: { coding: [{ system: SYSTEM.ACTION_TYPE, code: "create" }] },
          timingTiming: {
            extension: [daysOfCycle(1)],
            repeat: { period: 14, periodUnit: "d" },
          },
        },
      ],
    },
  ],
} as const;

// ===========================================================================
// NSCLC REGIMENS (draft)
// ===========================================================================

export const REGIMEN_OSIMERTINIB = {
  resourceType: "PlanDefinition",
  id: "RegimenOsimertinib",
  url: `${BASE_URL}/PlanDefinition/RegimenOsimertinib`,
  version: "0.1.0",
  name: "RegimenOsimertinib",
  title: "Osimertinib 80 mg PO \u2014 EGFR-Mutated NSCLC",
  status: "draft",
  experimental: true,
  type: { coding: [{ system: SYSTEM.PLAN_TYPE, code: "order-set", display: "Order Set" }] },
  usageContext: layerContext(MOPA_LAYER.REGIMEN_TEMPLATE, "Regimen Template"),
  description:
    "NSCLC with EGFR exon 19 deletion or exon 21 L858R mutation. First-line targeted therapy.",
  subjectCodeableConcept: {
    coding: [{ system: SYSTEM.SNOMED, code: "254637007", display: "Non-small cell lung cancer" }],
  },
  extension: [
    regimenIntent("363676003", "Palliative intent"),
    treatmentLine("1L", "First-line"),
    diseaseContext("254637007", "Non-small cell lung cancer"),
  ],
  action: [
    {
      id: "osimertinib",
      title: "Osimertinib 80 mg PO once daily (continuous)",
      description: "80 mg orally once daily, continuous until progression or intolerance",
      type: { coding: [{ system: SYSTEM.ACTION_TYPE, code: "create" }] },
      timingTiming: { repeat: { frequency: 1, period: 1, periodUnit: "d" } },
    },
  ],
} as const;

export const REGIMEN_ALECTINIB = {
  resourceType: "PlanDefinition",
  id: "RegimenAlectinib",
  url: `${BASE_URL}/PlanDefinition/RegimenAlectinib`,
  version: "0.1.0",
  name: "RegimenAlectinib",
  title: "Alectinib 600 mg PO BID \u2014 ALK-Positive NSCLC",
  status: "draft",
  experimental: true,
  type: { coding: [{ system: SYSTEM.PLAN_TYPE, code: "order-set", display: "Order Set" }] },
  usageContext: layerContext(MOPA_LAYER.REGIMEN_TEMPLATE, "Regimen Template"),
  description: "NSCLC with ALK rearrangement. First-line targeted therapy.",
  subjectCodeableConcept: {
    coding: [{ system: SYSTEM.SNOMED, code: "254637007", display: "Non-small cell lung cancer" }],
  },
  extension: [
    regimenIntent("363676003", "Palliative intent"),
    treatmentLine("1L", "First-line"),
    diseaseContext("254637007", "Non-small cell lung cancer"),
  ],
  action: [
    {
      id: "alectinib",
      title: "Alectinib 600 mg PO twice daily (continuous)",
      description:
        "600 mg orally twice daily with food, continuous until progression or intolerance",
      type: { coding: [{ system: SYSTEM.ACTION_TYPE, code: "create" }] },
      timingTiming: { repeat: { frequency: 2, period: 1, periodUnit: "d" } },
    },
  ],
} as const;

export const REGIMEN_PEMBROLIZUMAB = {
  resourceType: "PlanDefinition",
  id: "RegimenPembrolizumab",
  url: `${BASE_URL}/PlanDefinition/RegimenPembrolizumab`,
  version: "0.1.0",
  name: "RegimenPembrolizumab",
  title: "Pembrolizumab 200 mg IV q21d \u2014 PD-L1 \u2265 50% NSCLC",
  status: "draft",
  experimental: true,
  type: { coding: [{ system: SYSTEM.PLAN_TYPE, code: "order-set", display: "Order Set" }] },
  usageContext: layerContext(MOPA_LAYER.REGIMEN_TEMPLATE, "Regimen Template"),
  description:
    "NSCLC with PD-L1 TPS >= 50%, no actionable EGFR/ALK. First-line immunotherapy monotherapy.",
  subjectCodeableConcept: {
    coding: [{ system: SYSTEM.SNOMED, code: "254637007", display: "Non-small cell lung cancer" }],
  },
  extension: [
    regimenIntent("363676003", "Palliative intent"),
    treatmentLine("1L", "First-line"),
    diseaseContext("254637007", "Non-small cell lung cancer"),
  ],
  action: [
    {
      id: "pembrolizumab",
      title: "Pembrolizumab 200 mg IV \u2014 Day 1 of each 21-day cycle",
      description: "200 mg IV over 30 minutes, day 1 of each 21-day cycle",
      type: { coding: [{ system: SYSTEM.ACTION_TYPE, code: "create" }] },
      timingTiming: {
        extension: [daysOfCycle(1)],
        repeat: { period: 21, periodUnit: "d" },
      },
    },
  ],
} as const;

// ===========================================================================
// BREAST CANCER ECA-RULE PLAN DEFINITIONS
// ===========================================================================

// ---------------------------------------------------------------------------
// Layer 1 — Breast Cancer Guideline CDS (eca-rule)
// ---------------------------------------------------------------------------

export const GUIDELINE_PLAN_DEFINITION = {
  resourceType: "PlanDefinition",
  id: "BreastCancerGuidelineCDS",
  url: `${BASE_URL}/PlanDefinition/BreastCancerGuidelineCDS`,
  version: "0.1.0",
  name: "BreastCancerGuidelineCDS",
  title: "Breast Cancer Chemotherapy Guideline CDS",
  status: "active",
  experimental: true,
  type: { coding: [{ system: SYSTEM.PLAN_TYPE, code: "eca-rule", display: "ECA Rule" }] },
  usageContext: layerContext(MOPA_LAYER.GUIDELINE_AUTHORITY, "Guideline Authority"),
  description:
    "ECA rule surfacing evidence-based regimen recommendations based on HER2 receptor " +
    "status for breast cancer chemotherapy.",
  purpose:
    "Provides real-time evidence-based clinical decision support to oncologists ordering " +
    "chemotherapy, ensuring guideline-concordant recommendations based on HER2 receptor status. " +
    "The SMART App uses this rule to surface clinically indicated options and identify missing clinical data.",
  library: [`${BASE_URL}/Library/BreastCancerGuideline`],
  action: [
    {
      id: "gap-analysis",
      title: "Evaluate Data Completeness",
      description:
        "Assess whether HER2 status required for guideline evaluation is present in the patient record.",
      action: [
        {
          id: "document-her2",
          title: "Document HER2 Status",
          description:
            "HER2 status is absent. Prompt the clinician to enter or retrieve the HER2 result.",
          condition: [
            {
              kind: "applicability",
              expression: { language: "text/cql-identifier", expression: "not Is HER2 Positive" },
            },
          ],
        },
      ],
    },
    {
      id: "regimen-selection",
      title: "Surface Eligible Regimens",
      description:
        "HER2 status is present. Evaluate guideline criteria and present indicated regimens.",
      condition: [
        {
          kind: "applicability",
          expression: { language: "text/cql-identifier", expression: "Is HER2 Positive" },
        },
      ],
      action: [
        {
          id: "recommend-th",
          title: "TH — Trastuzumab + Paclitaxel",
          description: "HER2-positive. First-line for early breast cancer.",
          definitionCanonical: `${BASE_URL}/PlanDefinition/RegimenTH`,
          condition: [
            {
              kind: "applicability",
              expression: { language: "text/cql-identifier", expression: "TH Eligible" },
            },
          ],
        },
        {
          id: "recommend-phd",
          title: "PHD — Pertuzumab + Trastuzumab + Docetaxel",
          description: "HER2-positive. First-line for metastatic breast cancer.",
          definitionCanonical: `${BASE_URL}/PlanDefinition/RegimenPHD`,
          condition: [
            {
              kind: "applicability",
              expression: { language: "text/cql-identifier", expression: "PHD Eligible" },
            },
          ],
        },
        {
          id: "recommend-ddact",
          title: "ddAC→T — Dose-dense AC → Paclitaxel",
          description: "HER2-negative. For triple-negative or HR+ disease.",
          definitionCanonical: `${BASE_URL}/PlanDefinition/RegimenDdACT`,
          condition: [
            {
              kind: "applicability",
              expression: { language: "text/cql-identifier", expression: "ddACT Eligible" },
            },
          ],
        },
      ],
    },
  ],
} as const;

// ---------------------------------------------------------------------------
// Layer 2 — Breast Cancer PA Workflow (eca-rule)
// action.trigger per FHIR R4 Clinical Reasoning §8.3 (named-event maps to CDS Hook)
// ---------------------------------------------------------------------------

export const PLAN_DEFINITION = {
  resourceType: "PlanDefinition",
  id: "BreastCancerPAWorkflow",
  url: `${BASE_URL}/PlanDefinition/BreastCancerPAWorkflow`,
  version: "0.1.0",
  name: "BreastCancerPAWorkflow",
  title: "Breast Cancer Prior Authorization Workflow",
  status: "active",
  experimental: true,
  type: { coding: [{ system: SYSTEM.PLAN_TYPE, code: "eca-rule", display: "ECA Rule" }] },
  usageContext: layerContext(MOPA_LAYER.PAYER_POLICY, "Payer Policy"),
  description:
    "ECA rule governing coverage determination for breast cancer chemotherapy orders " +
    "via CDS Hooks order-select and order-sign.",
  purpose:
    "Enables systematic evaluation of prior authorization requirements at the point of " +
    "prescribing. Reduces manual review burden by ensuring data completeness before PA " +
    "submission and pre-authorizing eligible patients (ECOG 0) without a formal PA request.",
  library: [LIBRARY_CANONICAL],
  action: [
    {
      id: "on-order-select",
      title: "Evaluate at Order Select",
      description:
        "Assess data completeness and provide initial coverage guidance when the clinician selects an order.",
      trigger: [{ type: "named-event", name: "order-select" }],
      action: [
        {
          id: "check-completeness",
          title: "Check Data Completeness",
          description: "Evaluate whether all required clinical data elements are present.",
          condition: [
            {
              kind: "applicability",
              expression: { language: "text/cql-identifier", expression: "All Data Present" },
            },
          ],
          action: [
            {
              id: "launch-dtr",
              title: "Launch Documentation Requirements Tool",
              description:
                "One or more required data elements are missing. Launch DTR to collect them.",
              condition: [
                {
                  kind: "applicability",
                  expression: {
                    language: "text/cql-identifier",
                    expression: "not All Data Present",
                  },
                },
              ],
              type: { coding: [{ system: SYSTEM.ACTION_TYPE, code: "create" }] },
            },
          ],
        },
        {
          id: "initial-coverage",
          title: "Provide Initial Coverage Guidance",
          description:
            "All required data is present. Return pre-authorization or PA-required card.",
          condition: [
            {
              kind: "applicability",
              expression: { language: "text/cql-identifier", expression: "All Data Present" },
            },
          ],
        },
      ],
    },
    {
      id: "on-order-sign",
      title: "Confirm Authorization at Order Sign",
      description: "Confirm the authorization level when the clinician signs the order.",
      trigger: [{ type: "named-event", name: "order-sign" }],
      action: [
        {
          id: "pre-authorize",
          title: "Pre-authorize (No PA Required)",
          description:
            "ECOG Performance Status = 0. Coverage is pre-authorized; order may proceed.",
          condition: [
            {
              kind: "applicability",
              expression: { language: "text/cql-identifier", expression: "ECOG Score Is Zero" },
            },
          ],
        },
        {
          id: "require-pa",
          title: "Require Prior Authorization",
          description:
            "ECOG Performance Status >= 1. A formal PA request must be submitted before fulfillment.",
          condition: [
            {
              kind: "applicability",
              expression: { language: "text/cql-identifier", expression: "ECOG Score Is Positive" },
            },
          ],
        },
      ],
    },
  ],
} as const;

// ===========================================================================
// NSCLC ECA-RULE PLAN DEFINITIONS (draft)
// ===========================================================================

// Layer 1 — NSCLC Guideline CDS (eca-rule, draft)
// ---------------------------------------------------------------------------

export const NSCLC_GUIDELINE_PLAN_DEFINITION = {
  resourceType: "PlanDefinition",
  id: "NSCLCGuidelineCDS",
  url: `${BASE_URL}/PlanDefinition/NSCLCGuidelineCDS`,
  version: "0.1.0",
  name: "NSCLCGuidelineCDS",
  title: "NSCLC Chemotherapy Guideline CDS",
  status: "draft",
  experimental: true,
  type: { coding: [{ system: SYSTEM.PLAN_TYPE, code: "eca-rule", display: "ECA Rule" }] },
  usageContext: layerContext(MOPA_LAYER.GUIDELINE_AUTHORITY, "Guideline Authority"),
  description:
    "ECA rule for NSCLC regimen selection based on EGFR, ALK, and PD-L1 biomarker status. Draft.",
  purpose:
    "Provides biomarker-driven regimen recommendations for NSCLC at the point of " +
    "chemotherapy ordering. Surfaces targeted therapy, immunotherapy, or platinum-doublet " +
    "recommendations based on molecular profiling.",
  library: [`${BASE_URL}/Library/LungCancerGuideline`],
  action: [
    {
      id: "biomarker-gap-check",
      title: "Evaluate Biomarker Completeness",
      description: "Assess whether EGFR, ALK, and PD-L1 results are present.",
      action: [
        {
          id: "document-biomarkers",
          title: "Document Molecular Profile",
          description:
            "One or more required biomarkers are absent. Prompt clinician to document EGFR, ALK, and PD-L1.",
        },
      ],
    },
    {
      id: "regimen-selection",
      title: "Surface Eligible Regimens",
      description: "Biomarkers are present. Evaluate and present indicated regimens.",
      action: [
        {
          id: "recommend-osimertinib",
          title: "Osimertinib (EGFR-targeted)",
          definitionCanonical: `${BASE_URL}/PlanDefinition/RegimenOsimertinib`,
        },
        {
          id: "recommend-alectinib",
          title: "Alectinib (ALK-targeted)",
          definitionCanonical: `${BASE_URL}/PlanDefinition/RegimenAlectinib`,
        },
        {
          id: "recommend-pembrolizumab",
          title: "Pembrolizumab (PD-L1 >= 50%)",
          definitionCanonical: `${BASE_URL}/PlanDefinition/RegimenPembrolizumab`,
        },
      ],
    },
  ],
} as const;

// ---------------------------------------------------------------------------
// Layer 2 — NSCLC PA Workflow (eca-rule, draft)
// ---------------------------------------------------------------------------

export const NSCLC_PLAN_DEFINITION = {
  resourceType: "PlanDefinition",
  id: "NSCLCPAWorkflow",
  url: `${BASE_URL}/PlanDefinition/NSCLCPAWorkflow`,
  version: "0.1.0",
  name: "NSCLCPAWorkflow",
  title: "NSCLC Prior Authorization Workflow",
  status: "draft",
  experimental: true,
  type: { coding: [{ system: SYSTEM.PLAN_TYPE, code: "eca-rule", display: "ECA Rule" }] },
  usageContext: layerContext(MOPA_LAYER.PAYER_POLICY, "Payer Policy"),
  description:
    "ECA rule governing coverage determination for NSCLC systemic therapy orders. Draft.",
  purpose:
    "Governs coverage determination for NSCLC systemic therapy. Requires EGFR, ALK, and " +
    "PD-L1 biomarker documentation before authorization. Pre-authorizes targeted therapies " +
    "for biomarker-driven indications with ECOG 0 to 1.",
  library: [`${BASE_URL}/Library/LungCancerPayerPolicy`],
  action: [
    {
      id: "on-order-select",
      title: "Evaluate at Order Select",
      trigger: [{ type: "named-event", name: "order-select" }],
      action: [
        { id: "check-biomarkers", title: "Check Biomarker Completeness" },
        { id: "initial-coverage", title: "Provide Initial Coverage Guidance" },
      ],
    },
    {
      id: "on-order-sign",
      title: "Confirm Authorization at Order Sign",
      trigger: [{ type: "named-event", name: "order-sign" }],
      action: [
        { id: "pre-authorize", title: "Pre-authorize (targeted therapy, ECOG 0-1)" },
        { id: "require-pa", title: "Require Prior Authorization" },
      ],
    },
  ],
} as const;
