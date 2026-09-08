# Oncology CRD Service Capability Statement - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## CapabilityStatement: Oncology CRD Service Capability Statement (Experimental) 

 
Capability Statement for systems acting as an **Oncology CRD Service** (e.g., a payer or prior-authorization platform). A conformant service claims support for the Da Vinci CRD oncology profile defined in this IG by meeting the requirements below. 

 [Raw OpenAPI-Swagger Definition file](../ocpa-crd-service.openapi.json) | [Download](../ocpa-crd-service.openapi.json) 



## Resource Content

```json
{
  "resourceType" : "CapabilityStatement",
  "id" : "ocpa-crd-service",
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
  "url" : "http://hl7.org/fhir/us/codex-mopa/CapabilityStatement/ocpa-crd-service",
  "version" : "0.1.1-snapshot-080926",
  "name" : "OcpaCrdServiceCapabilityStatement",
  "title" : "Oncology CRD Service Capability Statement",
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
  "description" : "Capability Statement for systems acting as an **Oncology CRD Service**\n(e.g., a payer or prior-authorization platform).  A conformant service claims support for\nthe Da Vinci CRD oncology profile defined in this IG by meeting the requirements below.",
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
    "mode" : "server",
    "documentation" : "A conformant Oncology CRD Service SHALL:\n\n1. Be capable of evaluating the selected anti-cancer regimen `RequestGroup` and optionally\n   resolving its instantiated `PlanDefinition`.\n2. Evaluate patient-specific treatment-intent and line-of-therapy slices carried with the\n   Da Vinci CRD `ext-request-category` URL on the RequestGroup. Use\n   `fhirAuthorization` — when provided in the CDS Hooks request — to query the EHR FHIR\n   server for additional required oncology patient context (cancer condition, staging,\n   biomarkers, performance status, and prior therapy).\n3. Return informational cards at `order-select` indicating the approvability status of the\n   ordered regimen. These cards are advisory — the order has not been committed.\n4. Return a final determination at `order-sign` with the appropriate indicator: `success`\n   for Authorization Satisfied, `warning` for PA-required or DTR-required.\n5. Surface biosimilar substitution requirements at `order-select` so the provider is\n   informed of payer modifications before signing.\n6. Return a DTR launch card when required context is not available from the EHR FHIR server.",
    "resource" : [{
      "type" : "RequestGroup",
      "supportedProfile" : ["http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-requestgroup"],
      "documentation" : "SHALL resolve and evaluate RequestGroup resources received in CDS Hooks context.draftOrders, including the profile-sliced Da Vinci CRD ext-request-category values for treatment intent and line of therapy.",
      "interaction" : [{
        "code" : "read"
      }]
    },
    {
      "type" : "PlanDefinition",
      "supportedProfile" : ["http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-plandefinition"],
      "documentation" : "SHOULD resolve PlanDefinition referenced by RequestGroup.instantiatesCanonical.",
      "interaction" : [{
        "code" : "read"
      }]
    },
    {
      "type" : "Condition",
      "documentation" : "SHALL query Condition (primary cancer condition) from EHR FHIR server when fhirAuthorization is provided.",
      "interaction" : [{
        "code" : "search-type"
      }]
    },
    {
      "type" : "Observation",
      "documentation" : "MAY query Observation for staging, biomarkers, and performance status when required by policy; treatment intent and line of therapy are carried only in RequestGroup ext-request-category values.",
      "interaction" : [{
        "code" : "search-type"
      }]
    },
    {
      "type" : "MedicationRequest",
      "documentation" : "SHOULD query MedicationRequest (prior therapy) from EHR FHIR server when relevant.",
      "interaction" : [{
        "code" : "search-type"
      }]
    }]
  }]
}

```
