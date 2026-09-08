# Oncology CRD Client Capability Statement - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## CapabilityStatement: Oncology CRD Client Capability Statement (Experimental) 

 
Capability Statement for systems acting as an **Oncology CRD Client** (e.g., an EHR or oncology ordering system). A conformant client claims support for the Da Vinci CRD oncology profile defined in this IG by meeting the requirements below. 

 [Raw OpenAPI-Swagger Definition file](../ocpa-crd-client.openapi.json) | [Download](../ocpa-crd-client.openapi.json) 



## Resource Content

```json
{
  "resourceType" : "CapabilityStatement",
  "id" : "ocpa-crd-client",
  "extension" : [{
    "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-wg",
    "valueCode" : "cic"
  },
  {
    "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
    "valueCode" : "informative",
    "_valueCode" : {
      "extension" : [{
        "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-conformance-derivedFrom",
        "valueCanonical" : "http://hl7.org/fhir/us/codex-mopa/ImplementationGuide/hl7.fhir.us.codex-mopa"
      }]
    }
  }],
  "url" : "http://hl7.org/fhir/us/codex-mopa/CapabilityStatement/ocpa-crd-client",
  "version" : "0.1.1-snapshot-080926",
  "name" : "OcpaCrdClientCapabilityStatement",
  "title" : "Oncology CRD Client Capability Statement",
  "status" : "draft",
  "experimental" : true,
  "date" : "2026-05-04",
  "publisher" : "HL7 International / Clinical Interoperability Council",
  "contact" : [{
    "name" : "HL7 International / Clinical Interoperability Council",
    "telecom" : [{
      "system" : "url",
      "value" : "http://www.hl7.org/Special/committees/cic"
    },
    {
      "system" : "email",
      "value" : "ciclist@lists.HL7.org"
    }]
  }],
  "description" : "Capability Statement for systems acting as an **Oncology CRD Client**\n(e.g., an EHR or oncology ordering system).  A conformant client claims support for\nthe Da Vinci CRD oncology profile defined in this IG by meeting the requirements below.",
  "jurisdiction" : [{
    "coding" : [{
      "system" : "urn:iso:std:iso:3166",
      "code" : "US",
      "display" : "United States of America"
    }]
  }],
  "kind" : "requirements",
  "fhirVersion" : "4.0.1",
  "format" : ["json", "xml"],
  "implementationGuide" : ["http://hl7.org/fhir/us/codex-mopa/ImplementationGuide/hl7.fhir.us.codex-mopa",
  "http://hl7.org/fhir/us/davinci-crd/ImplementationGuide/hl7.fhir.us.davinci-crd"],
  "rest" : [{
    "mode" : "client",
    "documentation" : "A conformant Oncology CRD Client SHALL:\n\n1. Include the selected anti-cancer regimen as a `RequestGroup` conforming to\n   `AntiCancerRegimenRequestGroup` in `context.draftOrders` and `context.selections`.\n2. Fire `order-select` when the provider selects a regimen from the order-set, before signing.\n   At this stage the `RequestGroup` is present but component MedicationRequests may not yet\n   be finalised.\n3. Fire `order-sign` when the provider signs the order, with finalised component\n   MedicationRequest resources included in context.draftOrders.\n4. Populate `RequestGroup.instantiatesCanonical` with the canonical URL of the\n   `AntiCancerRegimenPlanDefinition` when the definition is known.\n5. Populate `RequestGroup.extension:category/treatmentIntent` and\n   `RequestGroup.extension:category/lineOfTherapy` when known at ordering time. Both reslices use\n   the Da Vinci CRD `ext-request-category` URL and\n   their required oncology value sets. This use requires the proposed CRD 2.2.1 RequestGroup\n   extension-context expansion.\n6. Provide `fhirAuthorization` in the CDS Hooks request when available, to allow the CRD\n   service to query patient context directly from the EHR FHIR server.",
    "resource" : [{
      "type" : "RequestGroup",
      "supportedProfile" : ["http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-requestgroup"],
      "documentation" : "SHALL include a conformant RequestGroup in context.draftOrders at order-select and order-sign, including the profile-sliced Da Vinci CRD ext-request-category values for available treatment intent and line-of-therapy context.",
      "interaction" : [{
        "code" : "read"
      },
      {
        "code" : "create"
      }]
    },
    {
      "type" : "PlanDefinition",
      "supportedProfile" : ["http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-plandefinition"],
      "documentation" : "SHOULD support read of the PlanDefinition referenced by RequestGroup.instantiatesCanonical.",
      "interaction" : [{
        "code" : "read"
      }]
    },
    {
      "type" : "Condition",
      "documentation" : "SHALL expose Condition resources (mCODE primary cancer) for CRD service queries.",
      "interaction" : [{
        "code" : "read"
      },
      {
        "code" : "search-type"
      }]
    },
    {
      "type" : "Observation",
      "documentation" : "SHOULD expose Observation resources for staging, biomarkers, and performance status when a CRD service requires them. Treatment intent and line of therapy are carried only as RequestGroup ext-request-category values.",
      "interaction" : [{
        "code" : "read"
      },
      {
        "code" : "search-type"
      }]
    },
    {
      "type" : "MedicationRequest",
      "documentation" : "SHOULD expose MedicationRequest resources (prior therapy) for CRD service queries.",
      "interaction" : [{
        "code" : "read"
      },
      {
        "code" : "search-type"
      }]
    }]
  }]
}

```
