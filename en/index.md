# Home - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Home

This implementation guide defines the **Medical Oncology Prior Authorization (MOPA)** framework. It is intentionally **informative**: it documents the oncology PA workflow, the gaps in Da Vinci CRD/DTR/PAS and mCODE, and the upstream proposals needed to close those gaps.

A FHIR Accelerator Program implementation guide

extending Da Vinci CRD / DTR / PAS for oncology prior authorization

### The Problem

Getting cancer treatment approved takes too long. For patients with breast cancer and other oncology diagnoses, prior authorization is fragmented, slow, and disconnected from the clinical evidence that guided the treatment decision. There is no shared, standards-based language for oncology treatment decisions and no common way to move the right clinical data from the point of care to the authorization system at the right moment.

**The regulatory pressure is now direct.** CMS-0062-P (April 2026) extends prior authorization requirements to prescription drugs — including chemotherapeutics and anti-cancer agents.

### The Framework

This IG defines a structured authorization exchange using the standard Da Vinci CRD workflow where the payer CRD service uses FHIR authorization (when provided) to query the EHR for required oncology patient context (diagnosis, staging, biomarkers, line of therapy) directly.

The workflow uses two CDS Hooks stages:

* **`order-select` (informational)** — the CRD service evaluates approvability and returns advisory cards before the provider signs the order
* **`order-sign` (final determination)** — the CRD service returns the binding coverage determination

For the upstream standards work items, see:

* [Da Vinci Gap Proposals](davinci-gap-proposals.md)
* [mCODE Gap Proposals](mcode-gap-proposals.md)

The MOPA Framework

Structured Auth Exchange

[CRD](https://hl7.org/fhir/us/davinci-crd/)

[DTR](https://hl7.org/fhir/us/davinci-dtr/)

[PAS](https://hl7.org/fhir/us/davinci-pas/)

Domain Models

[mCODE](https://hl7.org/fhir/us/mcode/)

[US Core](https://hl7.org/fhir/us/core/)

Enablers

[CDS Hooks](https://cds-hooks.hl7.org/)

### Scope

**In scope:**

* All oncology cancer types (solid tumors and hematologic malignancies)
* Anti-cancer regimen representation as a first-class FHIR artifact
* Standard Da Vinci CRD workflow for oncology — payer queries EHR FHIR API for required context
* Patient context data categories for oncology PA evaluation
* **Use Case 1: Breast cancer prior authorization** — the first concrete data requirements implementation, serving as the template for other cancer types

**Out of scope (this version):**

* **Coverage adjudication and benefit determination** — whether a treatment is covered is a payer decision; this IG delivers the structured request, not the decision logic
* **Post-denial workflows** — appeals, grievances, and peer-to-peer review processes
* **Regimen clinical equivalence and preference ranking** — comparative effectiveness of treatment options is a clinical decision support concern outside authorization exchange
* **Dose calculation and modification rules** — weight-based dosing, renal/hepatic adjustments, and toxicity-driven modifications are out of scope
* **Pharmacy benefit management (PBM) integration** — specialty pharmacy routing, formulary lookups, and drug pricing are not addressed
* **Radiation therapy and surgical procedure authorization** — this version covers anti-cancer drug regimens only
* **X12 transaction details** — EDI mapping is delegated to Da Vinci PAS
* **Clinical trial eligibility matching** — protocol screening and trial enrollment are outside the authorization workflow modeled here

### Stakeholders

| | |
| :--- | :--- |
| **Oncology Practice / Clinician** | Clinical guideline-aligned recommendations surface at the moment of ordering — structuring the treatment decision in a way that moves through authorization without friction |
| **Cancer Patient** | Clinical guideline-appropriate treatment is authorized faster because the clinical evidence supporting the decision arrives at the payer in a structured, computable form |
| **Health Plan / Payer** | Authorization requests carry the structured clinical evidence — diagnosis, staging, biomarkers, line of therapy — that coverage policy requires, enabling consistent, evidence-grounded determinations |
| **EHR / Ordering System** | A single conformant integration delivers clinical guideline-aligned CDS and structured authorization requests across all payers and cancer types, replacing fragmented per-payer builds |
| **Clinical Guideline Authority** | Computable regimen definitions flow directly from publication into clinical decision support and payer coverage evaluation — creating a traceable path from evidence to real-world treatment authorization |

### Dependencies

| | | |
| :--- | :--- | :--- |
| [US Core](http://hl7.org/fhir/us/core) | 7.0.0 | Base US patient, practitioner, and clinical data profiles |
| [mCODE](http://hl7.org/fhir/us/mcode) | 4.0.0 | Oncology clinical data foundation |
| [Da Vinci CRD](http://hl7.org/fhir/us/davinci-crd) | 2.2.1 | Coverage Requirements Discovery workflow backbone |
| [Da Vinci DTR](http://hl7.org/fhir/us/davinci-dtr) | 2.2.0 | Documentation Templates and Rules |
| [Da Vinci PAS](http://hl7.org/fhir/us/davinci-pas) | 2.2.1 | Prior Authorization Support |

### How to Read This Guide

* [Background](background.md) — Clinical problem, regulatory context, and gaps in existing standards
* [Use Cases and Actors](use-cases.md) — The workflow, system actors, and actor responsibilities
* [Da Vinci Gap Proposals](davinci-gap-proposals.md) — CRD, DTR, and PAS proposals derived from the gap analysis
* [mCODE Gap Proposals](mcode-gap-proposals.md) — Data model proposals derived from the gap analysis
* **Specification:** 
* [Regimen Modeling](regimen-model.md) — How anti-cancer regimens are represented as FHIR `PlanDefinition` and `RequestGroup`
* [CRD Workflow](cds-workflow.md) — How the payer CRD service queries the EHR FHIR API for oncology context
* [Data Requirements](data-requirements.md) — The oncology data categories queried during CRD evaluation
* [Breast Cancer PA](breast-cancer-pa.md) — Breast cancer-specific data requirements and gap analysis
 
* [Conformance](conformance.md) — Requirements for claiming conformance to this IG
* [Artifacts](artifacts.md) — All profiles, extensions, value sets, and examples

This publication includes IP covered under the following statements.

* ISO maintains the copyright on the country codes, and controls its use carefully. For further details see the ISO 3166 web page: [https://www.iso.org/iso-3166-country-codes.html](https://www.iso.org/iso-3166-country-codes.html)

* [ISO 3166-1 Codes for the representation of names of countries and their subdivisions — Part 1: Country code](http://terminology.hl7.org/6.5.0/CodeSystem-ISO3166Part1.html): [AntiCancerRegimenPlanDefinition](StructureDefinition-anticancer-regimen-plandefinition.md), [AntiCancerRegimenRequestGroup](StructureDefinition-anticancer-regimen-requestgroup.md)... Show 14 more, [DataRequirementLabel](StructureDefinition-data-requirement-label.md), [LineOfTherapyRequestCategory](StructureDefinition-line-of-therapy-request-category.md), [MOPAIG](index.md), [OcpaCodesCS](CodeSystem-ocpa-codes.md), [OcpaCrdClientCapabilityStatement](CapabilityStatement-ocpa-crd-client.md), [OcpaCrdServiceCapabilityStatement](CapabilityStatement-ocpa-crd-service.md), [RegimenDaysOfCycle](StructureDefinition-regimen-days-of-cycle.md), [RegimenDdACT](PlanDefinition-RegimenDdACT.md), [RegimenIntentVS](ValueSet-regimen-intent-vs.md), [RegimenPHD](PlanDefinition-RegimenPHD.md), [RegimenTH](PlanDefinition-RegimenTH.md), [TreatmentIntentRequestCategory](StructureDefinition-treatment-intent-request-category.md), [TreatmentLineCS](CodeSystem-treatment-line-cs.md) and [TreatmentLineVS](ValueSet-treatment-line-vs.md)


* This material contains content that is copyright of SNOMED International. Implementers of these specifications must have the appropriate SNOMED CT Affiliate license - for more information contact [https://www.snomed.org/get-snomed](https://www.snomed.org/get-snomed) or [info@snomed.org](mailto:info@snomed.org).

* [SNOMED Clinical Terms&reg; (SNOMED CT&reg;)](http://hl7.org/fhir/R4/codesystem-snomedct.html): [Bundle/ExampleOrderSelectBundle](Bundle-ExampleOrderSelectBundle.md), [Bundle/ExampleOrderSignBundle](Bundle-ExampleOrderSignBundle.md)... Show 10 more, [Condition/MOPABreastCancerConditionExample](Condition-MOPABreastCancerConditionExample.md), [Condition/MOPAMetastaticBreastCancerConditionExample](Condition-MOPAMetastaticBreastCancerConditionExample.md), [RegimenDdACT](PlanDefinition-RegimenDdACT.md), [RegimenIntentVS](ValueSet-regimen-intent-vs.md), [RegimenPHD](PlanDefinition-RegimenPHD.md), [RegimenTH](PlanDefinition-RegimenTH.md), [RequestGroup/DDACTRegimenOrder](RequestGroup-DDACTRegimenOrder.md), [RequestGroup/PHDRegimenOrder](RequestGroup-PHDRegimenOrder.md), [RequestGroup/THRegimenOrder](RequestGroup-THRegimenOrder.md) and [TreatmentIntentRequestCategory](StructureDefinition-treatment-intent-request-category.md)


* This material derives from the HL7 Terminology (THO). THO is copyright ©1989+ Health Level Seven International and is made available under the CC0 designation. For more licensing information see: [https://terminology.hl7.org/license.html](https://terminology.hl7.org/license.html)

* [Condition Category Codes](http://terminology.hl7.org/7.3.0/CodeSystem-condition-category.html): [Condition/MOPABreastCancerConditionExample](Condition-MOPABreastCancerConditionExample.md) and [Condition/MOPAMetastaticBreastCancerConditionExample](Condition-MOPAMetastaticBreastCancerConditionExample.md)
* [Condition Clinical Status Codes](http://terminology.hl7.org/7.3.0/CodeSystem-condition-clinical.html): [Condition/MOPABreastCancerConditionExample](Condition-MOPABreastCancerConditionExample.md) and [Condition/MOPAMetastaticBreastCancerConditionExample](Condition-MOPAMetastaticBreastCancerConditionExample.md)
* [ConditionVerificationStatus](http://terminology.hl7.org/7.3.0/CodeSystem-condition-ver-status.html): [Condition/MOPABreastCancerConditionExample](Condition-MOPABreastCancerConditionExample.md) and [Condition/MOPAMetastaticBreastCancerConditionExample](Condition-MOPAMetastaticBreastCancerConditionExample.md)
* [PlanDefinitionType](http://terminology.hl7.org/7.3.0/CodeSystem-plan-definition-type.html): [AntiCancerRegimenPlanDefinition](StructureDefinition-anticancer-regimen-plandefinition.md), [RegimenDdACT](PlanDefinition-RegimenDdACT.md), [RegimenPHD](PlanDefinition-RegimenPHD.md) and [RegimenTH](PlanDefinition-RegimenTH.md)


* Using RxNorm codes of type SAB=RXNORM as this specification describes does not require a UMLS license. Access to the full set of RxNorm definitions, and/or additional use of other RxNorm structures and information requires a UMLS license. The use of RxNorm in this specification is pursuant to HL7's status as a licensee of the NLM UMLS. HL7's license does not convey the right to use RxNorm to any users of this specification; implementers must acquire a license to use RxNorm in their own right.

* [RxNorm](http://terminology.hl7.org/6.5.0/CodeSystem-v3-rxNorm.html): [Bundle/ExampleOrderSignBundle](Bundle-ExampleOrderSignBundle.md), [MedicationRequest/CyclophosphamideMedRequestDDACT](MedicationRequest-CyclophosphamideMedRequestDDACT.md)... Show 8 more, [MedicationRequest/DocetaxelMedRequestPHD](MedicationRequest-DocetaxelMedRequestPHD.md), [MedicationRequest/DoxorubicinMedRequestDDACT](MedicationRequest-DoxorubicinMedRequestDDACT.md), [MedicationRequest/PaclitaxelMedRequestTH](MedicationRequest-PaclitaxelMedRequestTH.md), [MedicationRequest/PaclitaxelMedRequestTPHase](MedicationRequest-PaclitaxelMedRequestTPHase.md), [MedicationRequest/PegfilgrastimMedRequestDDACT](MedicationRequest-PegfilgrastimMedRequestDDACT.md), [MedicationRequest/PertuzumabMedRequestPHD](MedicationRequest-PertuzumabMedRequestPHD.md), [MedicationRequest/TrastuzumabMedRequestPHD](MedicationRequest-TrastuzumabMedRequestPHD.md) and [MedicationRequest/TrastuzumabMedRequestTH](MedicationRequest-TrastuzumabMedRequestTH.md)


