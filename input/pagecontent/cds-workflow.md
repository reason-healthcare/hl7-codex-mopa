
### Overview

This IG describes how the Da Vinci CRD workflow is used for oncology prior authorization.
The payer CRD service uses standard CDS Hooks mechanisms — specifically FHIR API access
provided via `fhirAuthorization` — to query the EHR's FHIR server directly for the oncology
patient context it requires.

This approach keeps the EHR-side integration simple and standard: the EHR fires the
standard `order-select` and `order-sign` hooks with the `RequestGroup` in `draftOrders`,
and the CRD service does the work of fetching what it needs.

### Two-Stage Hook Semantics

The MOPA workflow uses `order-select` and `order-sign` for distinct purposes. Understanding
this distinction is critical to the oncology PA workflow:

#### order-select — Informational Approvability Check

`order-select` fires when the provider selects a regimen from the order-set but **before**
the order is signed. At this stage the order is still a draft — the provider is checking
whether the regimen will be approvable. The CRD service evaluates the regimen against
coverage policy and returns **informational cards** that allow the provider to make an
informed decision about whether to proceed:

- **`indicator: "info"`** — the regimen appears approvable. This is the expected indicator
  for an approvability check when all criteria are met. The card informs the provider that
  coverage conditions have been evaluated and PA can be bypassed, but the determination is
  **not binding** — it is informational guidance at the selection stage, not a final
  authorization.
- **`indicator: "info"`** — the regimen cannot be evaluated yet. Missing data prevents a
  determination; the card should direct the provider to collect the missing information.
- **`indicator: "warning"`** — PA will be required. The regimen is clinically appropriate
  but the payer will require a formal PA submission. The provider may still proceed to
  sign, understanding that PA is needed before fulfillment.
- **`indicator: "warning"`** — a DTR launch is needed. Some required data is not available
  in the EHR; the card includes a SMART link to launch DTR and collect the missing
  information before signing.

The key principle: **`order-select` is advisory**. The provider sees the approvability
assessment and can decide whether to proceed, adjust the order, or collect missing
documentation — all before committing to the order. The CRD service **SHOULD NOT** return
`indicator: "critical"` or `indicator: "error"` at `order-select` unless the regimen is
categorically excluded (never covered), because the order has not yet been committed.

#### order-sign — Final Determination

`order-sign` fires when the provider clicks **Sign**. At this point the order is being
committed. The `RequestGroup` is accompanied by finalised component `MedicationRequest`
resources. The CRD service re-evaluates and returns the **final coverage determination**:

- **`indicator: "success"`** — Authorization Satisfied. The regimen meets coverage criteria;
  PA can be bypassed. This is a binding determination at sign time.
- **`indicator: "warning"`** — PA required. The provider may still sign, but PA must be
  submitted before fulfillment.
- **`indicator: "warning"`** — DTR still required. Missing data was not collected between
  select and sign; the card launches DTR for final documentation.

### How the CRD Service Obtains Patient Context

When a CDS Hooks request includes a `fhirAuthorization` object, the CRD service **MAY**
use the provided access token to query the EHR's FHIR server directly for the oncology
facts it requires to evaluate the ordered regimen.

The CRD service queries for the same clinical data elements that would otherwise be
collected via DTR — the difference is that the payer queries them directly rather than
asking the clinician to re-enter them. This is opaque to the standard CDS Hooks API:
the EHR does not need to know which resources the payer will query.

Relevant data categories the CRD service typically queries:

| Data Category | FHIR Resource | Key Filters |
|---|---|---|
| Primary cancer condition | `Condition` | mCODE primary cancer ValueSet, active status |
| Cancer stage | `Observation` | mCODE staging codes |
| Biomarkers | `Observation` | mCODE tumor marker ValueSet |
| Line of therapy | `Observation` | MOPA treatment-line ValueSet |
| Performance status | `Observation` | mCODE ECOG/Karnofsky codes |
| Prior therapy | `MedicationRequest` / `Procedure` | Completed anti-cancer treatments |
{: .table }

### CDS Hooks Request Shape

The EHR fires a standard CRD hook with:

- `context.patientId` — identifies the patient
- `context.selections` and `context.draftOrders` — includes the `RequestGroup` conforming to `OncologyAntiCancerRegimenRequestGroup`
- `fhirAuthorization` — FHIR access credentials the CRD service uses to query back (when available)

```json
{
  "hook": "order-select",
  "hookInstance": "...",
  "context": {
    "userId": "Practitioner/DrLopez",
    "patientId": "MOPAPatientExample",
    "selections": ["RequestGroup/THRegimenOrder"],
    "draftOrders": {
      "resourceType": "Bundle",
      "entry": [{ "resource": { "resourceType": "RequestGroup", "id": "THRegimenOrder", "..." } }]
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

1. Reads the `RequestGroup` from `context.draftOrders` to identify the ordered regimen
2. If `RequestGroup.instantiatesCanonical` is populated, optionally resolves the canonical
   `PlanDefinition` for richer protocol-level evaluation
3. Uses `fhirAuthorization` to query the EHR FHIR server for the required oncology facts
4. Evaluates the regimen against its coverage policy using the retrieved context
5. Returns the appropriate CRD response card(s):
   - At `order-select`: informational cards indicating approvability status
   - At `order-sign`: final determination cards (success/warning as appropriate)

### Possible CRD Outcomes

| Stage | Condition | CRD Response | Indicator |
|---|---|---|---|
| order-select | Context complete + criteria satisfied | Approvable — PA can be bypassed | `info` |
| order-select | Context complete + PA required | PA will be required at sign | `warning` |
| order-select | Context incomplete | DTR launch card to collect missing data | `warning` |
| order-select | Regimen categorically excluded | Not covered | `critical` |
| order-sign | Context complete + criteria satisfied | **Authorization Satisfied** — PA bypassed | `success` |
| order-sign | Context complete + PA required | PA required — submit via PAS | `warning` |
| order-sign | Context incomplete | DTR launch card (data still missing) | `warning` |
{: .table }

### Biosimilar Substitution at order-select

When the payer's coverage policy requires a biosimilar substitution (e.g., trastuzumab →
trastuzumab-dttb), the CRD service **SHOULD** surface this at `order-select` as an
informational card so the provider sees the modification **before** signing. The card
detail text should clearly state the required substitution. At `order-sign`, the final
determination card carries the substitution detail and the PAS `ClaimResponse` includes
`processNote` entries with the full substitution rationale.

### Conformance Requirements

| Actor | Requirement |
|---|---|
| **Oncology CRD Client** | **SHALL** include the `RequestGroup` in `context.draftOrders` conforming to `OncologyAntiCancerRegimenRequestGroup` |
| **Oncology CRD Client** | **SHALL** fire `order-select` when the provider selects a regimen from the order-set, before signing |
| **Oncology CRD Client** | **SHALL** fire `order-sign` when the provider signs the order, with finalised component `MedicationRequest` resources |
| **Oncology CRD Client** | **SHOULD** provide `fhirAuthorization` so the CRD service can query for patient context |
| **Oncology CRD Service** | **SHALL** be capable of evaluating the `RequestGroup` to identify the ordered regimen |
| **Oncology CRD Service** | **SHOULD** use `fhirAuthorization` to query the EHR for required oncology facts when provided |
| **Oncology CRD Service** | **SHALL** return informational cards at `order-select` indicating approvability status |
| **Oncology CRD Service** | **SHALL** return a final determination at `order-sign` with the appropriate indicator (`success` or `warning`) |
| **Oncology CRD Service** | **SHOULD** surface biosimilar substitution requirements at `order-select` so the provider is informed before signing |
| **Oncology CRD Service** | **SHALL** return a DTR launch card when required context is not available via FHIR query |
{: .table }

### Examples

For a complete end-to-end walkthrough see [Workflow Walkthrough](walkthrough.html).

For the `RequestGroup` payload, see [Example: TH Regimen Order](RequestGroup-THRegimenOrder.html).
