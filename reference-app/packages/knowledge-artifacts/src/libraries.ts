/**
 * FHIR Library resources for MOPA knowledge artifacts.
 *
 * Each logic-library carries:
 *   - usageContext  tagging its MOPA layer (guideline-authority | payer-policy)
 *   - dataRequirement  the clinical data elements it needs
 *   - content  CQL + ELM URLs (populated by withEmbeddedContent at serve-time)
 *
 * Asset-collection libraries (LIBRARY_RESOURCE, ONCOLOGY_CRD_CATALOG) act as
 * manifests and do not carry usageContext or logic content.
 */
import {
  BASE_URL,
  LIBRARY_CANONICAL,
  CATALOG_URL,
  SYSTEM,
  MOPA_LAYER,
  layerContext,
} from "./constants";

// ---------------------------------------------------------------------------
// Breast Cancer — Layer 1 (guideline authority)
// ---------------------------------------------------------------------------

export const GUIDELINE_LIBRARY = {
  resourceType: "Library",
  id: "BreastCancerGuideline",
  url: `${BASE_URL}/Library/BreastCancerGuideline`,
  version: "0.1.0",
  name: "BreastCancerGuideline",
  title: "Breast Cancer Chemotherapy Guideline",
  status: "active",
  experimental: true,
  type: {
    coding: [{ system: SYSTEM.LIBRARY_TYPE, code: "logic-library", display: "Logic Library" }],
  },
  usageContext: layerContext(MOPA_LAYER.GUIDELINE_AUTHORITY, "Guideline Authority"),
  description:
    "CQL library encoding evidence-based clinical criteria for breast cancer " +
    "chemotherapy selection based on HER2 receptor status. Used by the Layer 1 " +
    "CDS SMART App. Does not encode payer policy.",
  dataRequirement: [
    {
      type: "Condition",
      mustSupport: ["code", "clinicalStatus"],
      codeFilter: [
        {
          path: "code",
          code: [
            {
              system: SYSTEM.SNOMED,
              code: "372137005",
              display: "Primary malignant neoplasm of breast",
            },
          ],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "Breast Cancer Diagnosis",
        },
      ],
    },
    {
      type: "Observation",
      mustSupport: ["code", "value[x]", "status"],
      codeFilter: [
        {
          path: "code",
          code: [
            { system: SYSTEM.LOINC, code: "85319-2", display: "HER2, Breast cancer specimen" },
          ],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "HER2 Status (IHC)",
        },
      ],
    },
    {
      type: "Observation",
      mustSupport: ["code", "value[x]", "status"],
      codeFilter: [
        {
          path: "code",
          code: [
            {
              system: SYSTEM.SNOMED,
              code: "431396003",
              display: "HER2 gene amplification detected",
            },
          ],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "HER2 Status (Gene Amplification)",
        },
      ],
    },
  ],
  content: [
    { contentType: "text/cql", url: `${BASE_URL}/cql/BreastCancerGuideline.cql` },
    {
      contentType: "application/elm+json",
      url: `${BASE_URL}/cql/elm/BreastCancerGuideline.elm.json`,
    },
  ],
} as const;

// ---------------------------------------------------------------------------
// Breast Cancer — Layer 2 (payer policy)
// ---------------------------------------------------------------------------

export const PAYER_POLICY_LIBRARY = {
  resourceType: "Library",
  id: "BreastCancerPayerPolicy",
  url: `${BASE_URL}/Library/BreastCancerPayerPolicy`,
  version: "0.1.0",
  name: "BreastCancerPayerPolicy",
  title: "Breast Cancer Prior Authorization Payer Policy",
  status: "active",
  experimental: true,
  type: {
    coding: [{ system: SYSTEM.LIBRARY_TYPE, code: "logic-library", display: "Logic Library" }],
  },
  usageContext: layerContext(MOPA_LAYER.PAYER_POLICY, "Payer Policy"),
  description:
    "CQL library defining data completeness and authorization level requirements " +
    "for breast cancer chemotherapy PA. Adds staging and performance status requirements " +
    "on top of HER2.",
  dataRequirement: [
    {
      type: "Condition",
      mustSupport: ["code", "clinicalStatus"],
      codeFilter: [
        {
          path: "code",
          code: [
            {
              system: SYSTEM.SNOMED,
              code: "372137005",
              display: "Primary malignant neoplasm of breast",
            },
          ],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "Breast Cancer Diagnosis",
        },
      ],
    },
    {
      type: "Observation",
      mustSupport: ["code", "value[x]", "status", "effectiveDateTime"],
      codeFilter: [
        {
          path: "code",
          code: [
            { system: SYSTEM.LOINC, code: "85319-2", display: "HER2, Breast cancer specimen" },
          ],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "HER2 Status",
        },
      ],
    },
    {
      type: "Observation",
      mustSupport: ["code", "value[x]", "status", "effectiveDateTime"],
      codeFilter: [
        {
          path: "code",
          code: [{ system: SYSTEM.LOINC, code: "21908-9", display: "Stage group.clinical Cancer" }],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "Cancer Stage",
        },
      ],
    },
    {
      type: "Observation",
      mustSupport: ["code", "value[x]", "status", "effectiveDateTime"],
      codeFilter: [
        {
          path: "code",
          code: [
            { system: SYSTEM.LOINC, code: "89247-1", display: "ECOG Performance Status score" },
          ],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "ECOG Performance Status",
        },
      ],
    },
  ],
  content: [
    { contentType: "text/cql", url: `${BASE_URL}/cql/BreastCancerPayerPolicy.cql` },
    {
      contentType: "application/elm+json",
      url: `${BASE_URL}/cql/elm/BreastCancerPayerPolicy.elm.json`,
    },
  ],
} as const;

// ---------------------------------------------------------------------------
// Breast Cancer — PA Data Requirements (asset-collection)
// ---------------------------------------------------------------------------

export const LIBRARY_RESOURCE = {
  resourceType: "Library",
  id: "BreastCancerPADataRequirements",
  url: LIBRARY_CANONICAL,
  version: "0.1.0",
  name: "BreastCancerPADataRequirements",
  title: "Breast Cancer Prior Authorization Data Requirements",
  status: "active",
  experimental: true,
  type: {
    coding: [
      { system: SYSTEM.LIBRARY_TYPE, code: "asset-collection", display: "Asset Collection" },
    ],
  },
  description:
    "Defines the clinical data elements required to evaluate a breast cancer " +
    "chemotherapy regimen for prior authorization under the MOPA workflow.",
  dataRequirement: [
    { type: "Patient", mustSupport: ["birthDate", "gender"] },
    {
      type: "Condition",
      mustSupport: ["code", "clinicalStatus", "onsetDateTime"],
      codeFilter: [
        {
          path: "code",
          code: [
            {
              system: SYSTEM.SNOMED,
              code: "372137005",
              display: "Primary malignant neoplasm of breast",
            },
          ],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "Breast Cancer Diagnosis",
        },
      ],
    },
    {
      type: "Observation",
      mustSupport: ["code", "value[x]", "status", "effectiveDateTime"],
      codeFilter: [
        {
          path: "code",
          code: [
            { system: SYSTEM.LOINC, code: "85319-2", display: "HER2, Breast cancer specimen" },
            {
              system: SYSTEM.SNOMED,
              code: "431396003",
              display: "Human epidermal growth factor 2 gene amplification detected (finding)",
            },
          ],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "HER2 Status",
        },
      ],
    },
    {
      type: "Observation",
      mustSupport: ["code", "value[x]", "status", "effectiveDateTime"],
      codeFilter: [
        {
          path: "code",
          code: [{ system: SYSTEM.LOINC, code: "21908-9", display: "Stage group.clinical Cancer" }],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "Cancer Stage",
        },
      ],
    },
    {
      type: "Observation",
      mustSupport: ["code", "value[x]", "status", "effectiveDateTime"],
      codeFilter: [
        {
          path: "code",
          code: [
            { system: SYSTEM.LOINC, code: "89247-1", display: "ECOG Performance Status score" },
          ],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "ECOG Performance Status",
        },
      ],
    },
    {
      type: "Observation",
      mustSupport: ["code", "value[x]", "status", "effectiveDateTime"],
      codeFilter: [
        {
          path: "code",
          code: [
            {
              system: SYSTEM.SNOMED,
              code: "415068001",
              display: "Line of therapy (observable entity)",
            },
          ],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "Line of Therapy",
        },
      ],
    },
  ],
} as const;

// ---------------------------------------------------------------------------
// Oncology CRD Catalog (asset-collection — registry of all condition pairs)
// ---------------------------------------------------------------------------

export const ONCOLOGY_CRD_CATALOG = {
  resourceType: "Library",
  id: "OncologyCRDCatalog",
  url: CATALOG_URL,
  version: "0.1.0",
  name: "OncologyCRDCatalog",
  title: "MOPA Oncology CRD Catalog",
  status: "active",
  experimental: true,
  type: {
    coding: [
      { system: SYSTEM.LIBRARY_TYPE, code: "asset-collection", display: "Asset Collection" },
    ],
  },
  description:
    "Catalog of all condition-specific payer policy and guideline Library pairs " +
    "registered with the MOPA Oncology CRD service. One entry per supported tumor type.",
  relatedArtifact: [
    {
      type: "composed-of",
      resource: `${BASE_URL}/Library/BreastCancerPayerPolicy`,
      display: "Breast Cancer Payer Policy",
    },
    {
      type: "composed-of",
      resource: `${BASE_URL}/Library/BreastCancerGuideline`,
      display: "Breast Cancer Guideline",
    },
    {
      type: "composed-of",
      resource: `${BASE_URL}/Library/LungCancerPayerPolicy`,
      display: "NSCLC Payer Policy (draft)",
    },
    {
      type: "composed-of",
      resource: `${BASE_URL}/Library/LungCancerGuideline`,
      display: "NSCLC Guideline (draft)",
    },
  ],
} as const;

// ---------------------------------------------------------------------------
// NSCLC — Layer 1 (guideline authority, draft)
// ---------------------------------------------------------------------------

export const NSCLC_GUIDELINE_LIBRARY = {
  resourceType: "Library",
  id: "LungCancerGuideline",
  url: `${BASE_URL}/Library/LungCancerGuideline`,
  version: "0.1.0",
  name: "LungCancerGuideline",
  title: "NSCLC Chemotherapy Guideline",
  status: "draft",
  experimental: true,
  type: {
    coding: [{ system: SYSTEM.LIBRARY_TYPE, code: "logic-library", display: "Logic Library" }],
  },
  usageContext: layerContext(MOPA_LAYER.GUIDELINE_AUTHORITY, "Guideline Authority"),
  description:
    "CQL library for NSCLC chemotherapy regimen selection based on EGFR mutation, " +
    "ALK rearrangement, and PD-L1 expression. Draft — CQL not yet authored.",
  dataRequirement: [
    {
      type: "Condition",
      mustSupport: ["code", "clinicalStatus"],
      codeFilter: [
        {
          path: "code",
          code: [
            { system: SYSTEM.SNOMED, code: "254637007", display: "Non-small cell lung cancer" },
          ],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "NSCLC Diagnosis",
        },
      ],
    },
    {
      type: "Observation",
      mustSupport: ["code", "value[x]", "status"],
      codeFilter: [
        {
          path: "code",
          code: [{ system: SYSTEM.LOINC, code: "21665-5", display: "EGFR gene mutation analysis" }],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "EGFR Mutation Status",
        },
      ],
    },
    {
      type: "Observation",
      mustSupport: ["code", "value[x]", "status"],
      codeFilter: [
        {
          path: "code",
          code: [{ system: SYSTEM.LOINC, code: "78205-2", display: "ALK gene rearrangements" }],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "ALK Rearrangement Status",
        },
      ],
    },
    {
      type: "Observation",
      mustSupport: ["code", "value[x]", "status"],
      codeFilter: [
        {
          path: "code",
          code: [
            {
              system: SYSTEM.LOINC,
              code: "105302-4",
              display: "PD-L1 [Interpretation] in Tissue by Immunohistochemistry",
            },
          ],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "PD-L1 Expression",
        },
      ],
    },
    {
      type: "Observation",
      mustSupport: ["code", "value[x]", "status"],
      codeFilter: [
        {
          path: "code",
          code: [
            { system: SYSTEM.LOINC, code: "89247-1", display: "ECOG Performance Status score" },
          ],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "ECOG Performance Status",
        },
      ],
    },
  ],
} as const;

// ---------------------------------------------------------------------------
// NSCLC — Layer 2 (payer policy, draft)
// ---------------------------------------------------------------------------

export const NSCLC_PAYER_POLICY_LIBRARY = {
  resourceType: "Library",
  id: "LungCancerPayerPolicy",
  url: `${BASE_URL}/Library/LungCancerPayerPolicy`,
  version: "0.1.0",
  name: "LungCancerPayerPolicy",
  title: "NSCLC Prior Authorization Payer Policy",
  status: "draft",
  experimental: true,
  type: {
    coding: [{ system: SYSTEM.LIBRARY_TYPE, code: "logic-library", display: "Logic Library" }],
  },
  usageContext: layerContext(MOPA_LAYER.PAYER_POLICY, "Payer Policy"),
  description:
    "CQL library for NSCLC prior authorization determination. Requires EGFR, ALK, and " +
    "PD-L1 biomarker documentation before coverage evaluation. Draft — CQL not yet authored.",
  dataRequirement: [
    {
      type: "Condition",
      mustSupport: ["code", "clinicalStatus"],
      codeFilter: [
        {
          path: "code",
          code: [
            { system: SYSTEM.SNOMED, code: "254637007", display: "Non-small cell lung cancer" },
          ],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "NSCLC Diagnosis",
        },
      ],
    },
    {
      type: "Observation",
      mustSupport: ["code", "value[x]", "status"],
      codeFilter: [
        {
          path: "code",
          code: [{ system: SYSTEM.LOINC, code: "21665-5", display: "EGFR gene mutation analysis" }],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "EGFR Mutation Status",
        },
      ],
    },
    {
      type: "Observation",
      mustSupport: ["code", "value[x]", "status"],
      codeFilter: [
        {
          path: "code",
          code: [{ system: SYSTEM.LOINC, code: "78205-2", display: "ALK gene rearrangements" }],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "ALK Rearrangement Status",
        },
      ],
    },
    {
      type: "Observation",
      mustSupport: ["code", "value[x]", "status"],
      codeFilter: [
        {
          path: "code",
          code: [
            {
              system: SYSTEM.LOINC,
              code: "105302-4",
              display: "PD-L1 [Interpretation] in Tissue by Immunohistochemistry",
            },
          ],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "PD-L1 Expression",
        },
      ],
    },
    {
      type: "Observation",
      mustSupport: ["code", "value[x]", "status"],
      codeFilter: [
        {
          path: "code",
          code: [
            { system: SYSTEM.LOINC, code: "89247-1", display: "ECOG Performance Status score" },
          ],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "ECOG Performance Status",
        },
      ],
    },
    {
      type: "Observation",
      mustSupport: ["code", "value[x]", "status"],
      codeFilter: [
        {
          path: "code",
          code: [{ system: SYSTEM.LOINC, code: "21908-9", display: "Stage group.clinical Cancer" }],
        },
      ],
      extension: [
        {
          url: `${BASE_URL}/StructureDefinition/data-requirement-label`,
          valueString: "Cancer Stage",
        },
      ],
    },
  ],
} as const;
