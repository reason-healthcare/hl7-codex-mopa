# CRD Workflow - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## CRD Workflow

### Overview

This IG describes how the Da Vinci CRD workflow is used for oncology prior authorization. The payer CRD service uses standard CDS Hooks mechanisms — specifically FHIR API access provided via `fhirAuthorization` — to query the EHR's FHIR server directly for the oncology patient context it requires.

This approach keeps the EHR-side integration simple and standard: the EHR fires the standard `order-select` and `order-sign` hooks with the `RequestGroup` in `draftOrders`, and the CRD service does the work of fetching what it needs.

### Two-Stage Hook Semantics

The MOPA workflow uses `order-select` and `order-sign` for distinct purposes. Understanding this distinction is critical to the oncology PA workflow:

#### order-select — Informational Approvability Check

`order-select` fires when the provider selects a regimen from the order-set but **before** the order is signed. At this stage the order is still a draft — the provider is checking whether the regimen will be approvable. The CRD service evaluates the regimen against coverage policy and returns **informational cards** that allow the provider to make an informed decision about whether to proceed:

* **`indicator: "info"`** — the regimen appears approvable. This is the expected indicator for an approvability check when all criteria are met. The card informs the provider that coverage conditions have been evaluated and PA can be bypassed, but the determination is **not binding** — it is informational guidance at the selection stage, not a final authorization.
* **`indicator: "info"`** — the regimen cannot be evaluated yet. Missing data prevents a determination; the card should direct the provider to collect the missing information.
* **`indicator: "warning"`** — PA will be required. The regimen is clinically appropriate but the payer will require a formal PA submission. The provider may still proceed to sign, understanding that PA is needed before fulfillment.
* **`indicator: "warning"`** — a DTR launch is needed. Some required data is not available in the EHR; the card includes a SMART link to launch DTR and collect the missing information before signing.

The key principle: **`order-select` is advisory**. The provider sees the approvability assessment and can decide whether to proceed, adjust the order, or collect missing documentation — all before committing to the order. The CRD service **SHOULD NOT** return `indicator: "critical"` or `indicator: "error"` at `order-select` unless the regimen is categorically excluded (never covered), because the order has not yet been committed.

#### order-sign — Final Determination

`order-sign` fires when the provider clicks **Sign**. At this point the order is being committed. The `RequestGroup` is accompanied by finalised component `MedicationRequest` resources. The CRD service re-evaluates and returns the **final coverage determination**:

* **`indicator: "success"`** — Authorization Satisfied. The regimen meets coverage criteria; PA can be bypassed. This is a binding determination at sign time.
* **`indicator: "warning"`** — PA required. The provider may still sign, but PA must be submitted before fulfillment.
* **`indicator: "warning"`** — DTR still required. Missing data collected via DTR at `order-select` is not persisted to the EHR FHIR server and therefore may not be available to the CRD service at `order-sign`. The card launches DTR for final documentation, or the EHR may carry the DTR `QuestionnaireResponse` in `context.draftOrders`.

### How the CRD Service Obtains Patient Context

When a CDS Hooks request includes a `fhirAuthorization` object, the CRD service **MAY** use the provided access token to query the EHR's FHIR server directly for the oncology facts it requires to evaluate the ordered regimen.

The CRD service queries for the same clinical data elements that would otherwise be collected via DTR — the difference is that the payer queries them directly rather than asking the clinician to re-enter them. This is opaque to the standard CDS Hooks API: the EHR does not need to know which resources the payer will query.

Relevant data categories the CRD service typically queries:

| | | |
| :--- | :--- | :--- |
| Primary cancer condition | `Condition` | mCODE primary cancer ValueSet, active status |
| Cancer stage | `Observation` | mCODE staging codes |
| Biomarkers | `Observation` | mCODE tumor marker ValueSet |
| Line of therapy | `Observation` | MOPA treatment-line ValueSet |
| Performance status | `Observation` | mCODE ECOG/Karnofsky codes |
| Prior therapy | `MedicationRequest`/`Procedure` | Completed anti-cancer treatments |

### CDS Hooks Request Shape

The EHR fires a standard CRD hook with:

* `context.patientId` — identifies the patient
* `context.selections` and `context.draftOrders` — includes the `RequestGroup` conforming to `AntiCancerRegimenRequestGroup`
* `fhirAuthorization` — FHIR access credentials the CRD service uses to query back (when available)

```
{
  "hook": "order-select",
  "hookInstance": "...",
  "context": {
    "userId": "Practitioner/DrLopez",
    "patientId": "MOPAPatientExample",
    "selections": ["urn:uuid:rg-TH"],
    "draftOrders": {
      "resourceType": "Bundle",
      "type": "collection",
      "entry": [
        {
          "fullUrl": "urn:uuid:rg-TH",
          "resource": {
            "resourceType": "RequestGroup",
            "id": "rg-TH",
            "meta": {
              "profile": [
                "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-requestgroup"
              ]
            },
            "status": "draft",
            "intent": "order",
            "subject": { "reference": "Patient/MOPAPatientExample" },
            "instantiatesCanonical": [
              "http://hl7.org/fhir/us/codex-mopa/PlanDefinition/RegimenTH"
            ],
            "extension": [
              {
                "url": "http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category",
                "valueCodeableConcept": {
                  "coding": [{ "system": "http://snomed.info/sct", "code": "373846009", "display": "Adjuvant - intent" }]
                }
              },
              {
                "url": "http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category",
                "valueCodeableConcept": {
                  "coding": [{ "system": "http://hl7.org/fhir/us/codex-mopa/CodeSystem/treatment-line-cs", "code": "1L", "display": "First-line" }]
                }
              }
            ]
          }
        }
      ]
    }
  },
  "fhirAuthorization": {
    "access_token": "...",
    "token_type": "Bearer",
    "expires_in": 300,
    "scope": "patient/Condition.read patient/Observation.read patient/MedicationRequest.read",
    "subject": "cds-service"
  },
  "fhirServer": "https://ehr.example.org/fhir"
}

```

### CRD Service Evaluation Flow

Upon receiving the hook, the CRD service:

1. Reads the`RequestGroup`from`context.draftOrders`to identify the ordered regimen
1. If`RequestGroup.instantiatesCanonical`is populated, optionally resolves the canonical`PlanDefinition`for richer protocol-level evaluation
1. Uses`fhirAuthorization`to query the EHR FHIR server for the required oncology facts
1. Evaluates the regimen against its coverage policy using the retrieved context
1. Returns the appropriate CRD response card(s):
* At `order-select`: informational cards indicating approvability status
* At `order-sign`: final determination cards (success/warning as appropriate)

> **DTR data persistence assumption.** The CRD service **SHOULD NOT** assume that data collected via DTR between `order-select` and `order-sign` will be available when querying the EHR FHIR server at `order-sign`. In most EHR deployments, DTR `QuestionnaireResponse` resources are held in the EHR session context — not written back as clinical `Observation` resources on the FHIR server. If the CRD service requires DTR-collected data for its final determination, the EHR **SHOULD** include the `QuestionnaireResponse` in `context.draftOrders` at `order-sign` so the CRD service can read it directly from the hook context.

### Possible CRD Outcomes

| | | | |
| :--- | :--- | :--- | :--- |
| order-select | Context complete + criteria satisfied | Approvable — PA can be bypassed | `info` |
| order-select | Context complete + biosimilar substitution required | Approvable + Propose Alternate Request card (suggestion with delete + create) | `info` |
| order-select | Context complete + PA required | PA will be required at sign | `warning` |
| order-select | Context incomplete | DTR launch card to collect missing data | `warning` |
| order-select | Regimen categorically excluded | Not covered | `critical` |
| order-sign | Context complete + criteria satisfied | **Authorization Satisfied**— PA bypassed | `success` |
| order-sign | Context complete + PA required | PA required — submit via PAS | `warning` |
| order-sign | Context incomplete (DTR data not persisted) | DTR launch card or read QuestionnaireResponse from draftOrders | `warning` |

### Biosimilar Substitution at order-select

When the payer's coverage policy requires a biosimilar substitution (e.g., trastuzumab → trastuzumab-dttb), the CRD service **SHOULD** return a **Propose Alternate Request** card at `order-select` using the CDS Hooks suggestion mechanism. This allows the provider to accept or override the substitution **before** signing.

The card uses the following CDS Hooks constructs:

* **`suggestions`** — one suggestion containing `delete` + `create` actions 
* `delete` action: targets the original `MedicationRequest` by `resourceId` (matching its `fullUrl` in `context.draftOrders`)
* `create` action: contains the replacement `MedicationRequest` with the biosimilar's RxNorm code and a `substitution` element indicating formulary policy
 
* **`selectionBehavior: "at-most-one"`** — the provider either accepts the substitution or proceeds with the original order
* **`overrideReasons`** — oncology-specific reasons for declining: clinical contraindication, patient preference, formulary exception
* **`source.topic.code: "therapy-alternatives-req"`** — CRD response type for alternate request proposals
* **`indicator: "info"`** — the regimen is approvable; the card proposes a modification, not a denial

When the provider **accepts** the suggestion, the EHR applies the delete + create actions to the draft orders in-session, updates `RequestGroup.action[].resource` references to point to the replacement `MedicationRequest`, and sends the modified Bundle to `order-sign`. The CRD service then returns **Authorization Satisfied** because the order now reflects the payer-approved regimen.

When the provider **overrides** the suggestion, the original order proceeds to `order-sign` unchanged. The CRD service notes the override and may require PA submission for the non-substituted regimen.

At `order-sign`, the final determination card carries the substitution detail and the PAS `ClaimResponse` includes `processNote` entries with the full substitution rationale.

> **See [Da Vinci Gap Proposals](davinci-gap-proposals.md) — MOPA-DV-CRD-005** for the upstream proposal to formalize this pattern in the CRD IG.

### Conformance Requirements

| | |
| :--- | :--- |
| **Oncology CRD Client** | **SHALL**include the`RequestGroup`in`context.draftOrders`conforming to`AntiCancerRegimenRequestGroup` |
| **Oncology CRD Client** | **SHALL**fire`order-select`when the provider selects a regimen from the order-set, before signing |
| **Oncology CRD Client** | **SHALL**fire`order-sign`when the provider signs the order, with finalised component`MedicationRequest`resources |
| **Oncology CRD Client** | **SHOULD**provide`fhirAuthorization`so the CRD service can query for patient context |
| **Oncology CRD Service** | **SHALL**be capable of evaluating the`RequestGroup`to identify the ordered regimen |
| **Oncology CRD Service** | **SHOULD**use`fhirAuthorization`to query the EHR for required oncology facts when provided |
| **Oncology CRD Service** | **SHALL**return informational cards at`order-select`indicating approvability status |
| **Oncology CRD Service** | **SHALL**return a final determination at`order-sign`with the appropriate indicator (`success`or`warning`) |
| **Oncology CRD Service** | **SHOULD**return a Propose Alternate Request card (suggestion with delete + create actions) at`order-select`when the payer requires a biosimilar substitution, so the provider can accept or override before signing |
| **Oncology CRD Service** | **SHALL**return a DTR launch card when required context is not available via FHIR query |

### Examples

For a complete end-to-end walkthrough see [Workflow Walkthrough](walkthrough.md).

For the `RequestGroup` payload, see [Example: TH Regimen Order](RequestGroup-THRegimenOrder.md).

