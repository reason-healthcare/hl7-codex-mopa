import { LIBRARY_CANONICAL } from "./crd-logic";

/**
 * Static FHIR Library resource defining the PA data requirements for the
 * breast cancer oncology CRD workflow.
 *
 * The dataRequirement entries enumerate every clinical data element needed to
 * evaluate a regimen order — used by the DTR client to generate its questionnaire
 * and by the CDS SMART App (Phase 5) for gap analysis.
 */
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
      {
        system: "http://terminology.hl7.org/CodeSystem/library-type",
        code: "asset-collection",
        display: "Asset Collection",
      },
    ],
  },
  description:
    "Defines the clinical data elements required to evaluate a breast cancer " +
    "chemotherapy regimen for prior authorization under the OGCA workflow.",
  dataRequirement: [
    {
      type: "Patient",
      mustSupport: ["birthDate", "gender"],
    },
    {
      type: "Condition",
      mustSupport: ["code", "clinicalStatus", "onsetDateTime"],
      codeFilter: [
        {
          path: "category.coding.code",
          valueSet: "http://hl7.org/fhir/us/core/ValueSet/us-core-condition-category",
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
              system: "http://loinc.org",
              code: "85319-2",
              display: "HER2 [Presence] in Breast cancer specimen by Immune stain",
            },
            {
              system: "http://snomed.info/sct",
              code: "431396003",
              display: "Human epidermal growth factor 2 gene amplification detected (finding)",
            },
          ],
        },
      ],
      extension: [
        {
          url: "http://hl7.org/fhir/us/codex-ocpa/StructureDefinition/data-requirement-label",
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
          code: [
            {
              system: "http://loinc.org",
              code: "21908-9",
              display: "Stage group.clinical Cancer",
            },
          ],
        },
      ],
      extension: [
        {
          url: "http://hl7.org/fhir/us/codex-ocpa/StructureDefinition/data-requirement-label",
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
            {
              system: "http://loinc.org",
              code: "89247-1",
              display: "ECOG Performance Status score",
            },
          ],
        },
      ],
      extension: [
        {
          url: "http://hl7.org/fhir/us/codex-ocpa/StructureDefinition/data-requirement-label",
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
              system: "http://snomed.info/sct",
              code: "415068001",
              display: "Line of therapy (observable entity)",
            },
          ],
        },
      ],
      extension: [
        {
          url: "http://hl7.org/fhir/us/codex-ocpa/StructureDefinition/data-requirement-label",
          valueString: "Line of Therapy",
        },
      ],
    },
  ],
};
