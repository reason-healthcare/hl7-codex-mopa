// ============================================================
// CapabilityStatements.fsh
// Two CapabilityStatement instances for the MOPA IG:
//   1. ocpa-crd-client  — Oncology CRD Client (EHR / ordering system)
//   2. ocpa-crd-service — Oncology CRD Service (payer / PA platform)
//
// These are conformance-layer declarations and do not enumerate every
// optional FHIR interaction; they focus on the SHALL requirements stated
// in the Conformance page.
// ============================================================

// ─── 1. Oncology CRD Client ──────────────────────────────────────────────────

Instance: ocpa-crd-client
InstanceOf: CapabilityStatement
Usage: #definition
Title: "Oncology CRD Client Capability Statement"
Description: """Capability Statement for systems acting as an **Oncology CRD Client**
(e.g., an EHR or oncology ordering system).  A conformant client claims support for
the Da Vinci CRD oncology profile defined in this IG by meeting the requirements below."""

* name    = "OcpaCrdClientCapabilityStatement"
* status  = #draft
* experimental = true
* date    = "2026-05-04"
* kind    = #requirements
* fhirVersion = #4.0.1
* format[+]  = #json
* format[+]  = #xml

* implementationGuide[+] = "http://hl7.org/fhir/us/codex-mopa/ImplementationGuide/hl7.fhir.us.codex-mopa"
* implementationGuide[+] = "http://hl7.org/fhir/us/davinci-crd/ImplementationGuide/hl7.fhir.us.davinci-crd"

* rest[+].mode = #client
* rest[=].documentation = """
A conformant Oncology CRD Client SHALL:

1. Include the selected anti-cancer regimen as a `RequestGroup` conforming to
   `AntiCancerRegimenRequestGroup` in `context.draftOrders` and `context.selections`.
2. Fire `order-select` when the provider selects a regimen from the order-set, before signing.
   At this stage the `RequestGroup` is present but component MedicationRequests may not yet
   be finalised.
3. Fire `order-sign` when the provider signs the order, with finalised component
   MedicationRequest resources included in context.draftOrders.
4. Populate `RequestGroup.instantiatesCanonical` with the canonical URL of the
   `AntiCancerRegimenPlanDefinition` when the definition is known.
5. Populate `RequestGroup.extension:category/treatmentIntent` and
   `RequestGroup.extension:category/lineOfTherapy` when known at ordering time. Both reslices use
   the Da Vinci CRD `ext-request-category` URL and
   their required oncology value sets. This use requires the proposed CRD 2.2.1 RequestGroup
   extension-context expansion.
6. Provide `fhirAuthorization` in the CDS Hooks request when available, to allow the CRD
   service to query patient context directly from the EHR FHIR server.
"""

* rest[=].resource[+].type = #RequestGroup
* rest[=].resource[=].supportedProfile[+] =
    "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-requestgroup"
* rest[=].resource[=].documentation =
    "SHALL include a conformant RequestGroup in context.draftOrders at order-select and order-sign, including the profile-sliced Da Vinci CRD ext-request-category values for available treatment intent and line-of-therapy context."
* rest[=].resource[=].interaction[+].code = #read
* rest[=].resource[=].interaction[+].code = #create

* rest[=].resource[+].type = #PlanDefinition
* rest[=].resource[=].supportedProfile[+] =
    "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-plandefinition"
* rest[=].resource[=].documentation =
    "SHOULD support read of the PlanDefinition referenced by RequestGroup.instantiatesCanonical."
* rest[=].resource[=].interaction[+].code = #read

* rest[=].resource[+].type = #Condition
* rest[=].resource[=].documentation =
    "SHALL expose Condition resources (mCODE primary cancer) for CRD service queries."
* rest[=].resource[=].interaction[+].code = #read
* rest[=].resource[=].interaction[+].code = #search-type

* rest[=].resource[+].type = #Observation
* rest[=].resource[=].documentation =
    "SHOULD expose Observation resources for staging, biomarkers, and performance status when a CRD service requires them. Treatment intent and line of therapy are carried only as RequestGroup ext-request-category values."
* rest[=].resource[=].interaction[+].code = #read
* rest[=].resource[=].interaction[+].code = #search-type

* rest[=].resource[+].type = #MedicationRequest
* rest[=].resource[=].documentation =
    "SHOULD expose MedicationRequest resources (prior therapy) for CRD service queries."
* rest[=].resource[=].interaction[+].code = #read
* rest[=].resource[=].interaction[+].code = #search-type


// ─── 2. Oncology CRD Service ─────────────────────────────────────────────────

Instance: ocpa-crd-service
InstanceOf: CapabilityStatement
Usage: #definition
Title: "Oncology CRD Service Capability Statement"
Description: """Capability Statement for systems acting as an **Oncology CRD Service**
(e.g., a payer or prior-authorization platform).  A conformant service claims support for
the Da Vinci CRD oncology profile defined in this IG by meeting the requirements below."""

* name    = "OcpaCrdServiceCapabilityStatement"
* status  = #draft
* experimental = true
* date    = "2026-05-04"
* kind    = #requirements
* fhirVersion = #4.0.1
* format[+]  = #json
* format[+]  = #xml

* implementationGuide[+] = "http://hl7.org/fhir/us/codex-mopa/ImplementationGuide/hl7.fhir.us.codex-mopa"
* implementationGuide[+] = "http://hl7.org/fhir/us/davinci-crd/ImplementationGuide/hl7.fhir.us.davinci-crd"

* rest[+].mode = #server
* rest[=].documentation = """
A conformant Oncology CRD Service SHALL:

1. Be capable of evaluating the selected anti-cancer regimen `RequestGroup` and optionally
   resolving its instantiated `PlanDefinition`.
2. Evaluate patient-specific treatment-intent and line-of-therapy slices carried with the
   Da Vinci CRD `ext-request-category` URL on the RequestGroup. Use
   `fhirAuthorization` — when provided in the CDS Hooks request — to query the EHR FHIR
   server for additional required oncology patient context (cancer condition, staging,
   biomarkers, performance status, and prior therapy).
3. Return informational cards at `order-select` indicating the approvability status of the
   ordered regimen. These cards are advisory — the order has not been committed.
4. Return a final determination at `order-sign` with the appropriate indicator: `success`
   for Authorization Satisfied, `warning` for PA-required or DTR-required.
5. Surface biosimilar substitution requirements at `order-select` so the provider is
   informed of payer modifications before signing.
6. Return a DTR launch card when required context is not available from the EHR FHIR server.
"""

* rest[=].resource[+].type = #RequestGroup
* rest[=].resource[=].supportedProfile[+] =
    "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-requestgroup"
* rest[=].resource[=].documentation =
    "SHALL resolve and evaluate RequestGroup resources received in CDS Hooks context.draftOrders, including the profile-sliced Da Vinci CRD ext-request-category values for treatment intent and line of therapy."
* rest[=].resource[=].interaction[+].code = #read

* rest[=].resource[+].type = #PlanDefinition
* rest[=].resource[=].supportedProfile[+] =
    "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-plandefinition"
* rest[=].resource[=].documentation =
    "SHOULD resolve PlanDefinition referenced by RequestGroup.instantiatesCanonical."
* rest[=].resource[=].interaction[+].code = #read

* rest[=].resource[+].type = #Condition
* rest[=].resource[=].documentation =
    "SHALL query Condition (primary cancer condition) from EHR FHIR server when fhirAuthorization is provided."
* rest[=].resource[=].interaction[+].code = #search-type

* rest[=].resource[+].type = #Observation
* rest[=].resource[=].documentation =
    "MAY query Observation for staging, biomarkers, and performance status when required by policy; treatment intent and line of therapy are carried only in RequestGroup ext-request-category values."
* rest[=].resource[=].interaction[+].code = #search-type

* rest[=].resource[+].type = #MedicationRequest
* rest[=].resource[=].documentation =
    "SHOULD query MedicationRequest (prior therapy) from EHR FHIR server when relevant."
* rest[=].resource[=].interaction[+].code = #search-type
