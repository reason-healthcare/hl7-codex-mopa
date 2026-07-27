# Da Vinci High-Priority Jira Ticket Drafts

Scope: High-priority Da Vinci CRD, DTR, and PAS gaps for oncology prior authorization.

The following tickets are drafted as HL7/FHIR specification change requests. Each ticket
is scoped to one high-priority Da Vinci CRD, DTR, or PAS gap that blocks oncology prior
authorization workflows.

## Ticket 1

**Specification:** Da Vinci CRD

**Raised in Version:** Da Vinci CRD v2.2.1

**Summary:** Add CRD hook context guidance for oncology regimen `RequestGroup`
authorization

**Related URL:** https://cds-hooks.org/hooks/order-select/

**Related Artifact(s):** `RequestGroup`, `PlanDefinition`, `MedicationRequest`, CRD
`order-select`, CRD `order-sign`, `context.draftOrders`, `context.selections`, mCODE
oncology clinical context profiles/value sets

**Related Page(s):**

- CDS Hooks `order-select` hook definition
- CDS Hooks `order-sign` hook definition
- Da Vinci CRD IG v2.2.1
- Da Vinci CRD Foundational Requirements
- mCODE STU4

**Description:**

Issue type: Change Request

Priority: High

Component/s: CRD hook context guidance, Oncology Prior Authorization

IG gap description:
[MOPA-DV-CRD-002 - RequestGroup as the PA unit in CRD hooks](https://reason-healthcare.github.io/hl7-codex-ocpa/en/davinci-gap-proposals.html#mopa-dv-crd-002-requestgroup-as-the-pa-unit-in-crd-hooks)

### Change Request

Add oncology-specific CRD hook context guidance/profile content allowing a regimen
`RequestGroup` to be carried as the primary prior authorization subject in
`order-select` and `order-sign` hook requests.

### Rationale

CRD hooks are generally centered on individual order resources such as
`MedicationRequest`, `ServiceRequest`, and `DeviceRequest`. Oncology prior authorization
is often evaluated at the regimen level: the full multi-drug protocol is the
authorization unit, while component medication orders are subordinate details.

Without CRD guidance for representing the regimen as the selected authorization subject,
CRD services may evaluate oncology orders per medication rather than at regimen scope.
CRD should address this workflow gap by stating that the regimen `RequestGroup` may be
the PA subject in the hook context and that the service may retrieve supporting oncology
patient context through standard FHIR access using `fhirAuthorization`.

Current CRD conformance rules allow services to depend on profiles defined by CRD, HRex,
or US Core. CRD supports US Core 3.1.1, 6.1.0, and 7.0.0 and either uses US Core profiles
directly or constrains them for the CRD use case.

To establish the corresponding expectation for oncology, CRD should add mCODE STU4 to
the profiles permitted for oncology use cases and state that data reasonably expected to
conform to an mCODE profile SHOULD do so. mCODE STU4 uses US Core 6.1.0 as its US Core
baseline, which CRD already supports. Data not covered by mCODE may use other appropriate
FHIR or US Core profiles; CRD should not define new oncology data models.

### Requested Specification Updates

- Define CRD hook context guidance, through a hook definition amendment or
  oncology-specific hook context profile as needed, for including a regimen
  `RequestGroup` in `context.draftOrders` for `order-select` and `order-sign`.
- For `order-select`, define `context.selections` to reference the same regimen
  `RequestGroup` when the selected clinical unit is a regimen.
- Use the existing `RequestGroup.instantiatesCanonical` pattern to link the
  patient-specific regimen order to a canonical regimen `PlanDefinition` when one is
  known; do not require that link when the regimen originates from a local order set
  without a canonical definition.
- Clarify that `order-select` may include only the selected regimen `RequestGroup`,
  while `order-sign` should include available component `MedicationRequest` resources
  referenced from `RequestGroup.action.resource`. Define how the service handles
  components that are unresolved or not yet available without requiring every component
  order to be finalized at hook invocation.
- State that the CRD service evaluates the `RequestGroup` as the regimen-level
  authorization unit and treats component `MedicationRequest` resources as item detail,
  not independent PA subjects.
- Add `RequestGroup` to the resources on which the CRD coverage-information extension
  may be used so a Coverage Information system action can preserve the regimen as the
  subject of subsequent DTR and PAS workflow.
- Clarify that the regimen `RequestGroup` is evaluated against oncology patient context
  obtained through standard FHIR access, not by requiring all context to be embedded in
  the hook payload.
- Update CRD conformance to add mCODE STU4 to the profile set CRD services may depend on
  for oncology use cases, and state that oncology context SHOULD conform to an applicable
  mCODE profile. Identify mCODE STU4's US Core 6.1.0 baseline.
- Identify the oncology patient-context categories that
  map to mCODE today: primary cancer condition, cancer stage, tumor markers/biomarkers,
  performance status, and cancer-related medication history.
- Define how CRD may support externally defined interim oncology-specific profiles,
  extensions, or value sets for concepts not covered by current mCODE, including line
  of therapy, regimen intent/treatment setting, regimen-disease context, and regimen
  `RequestGroup`/`PlanDefinition`. Such candidate artifacts SHALL be identified by
  canonical URL and treated as non-mCODE artifacts unless and until adopted by mCODE.
  They are not assumed to be permitted in CRD unless CRD explicitly allows their use.

### Illustrative Example Payload

At `order-select`, the selected clinical unit can be a regimen `RequestGroup` in
`context.draftOrders`, referenced by `context.selections`. Component medication orders
may not yet be finalized:

```json
{
  "hook": "order-select",
  "context": {
    "patientId": "example-patient",
    "selections": ["RequestGroup/THRegimenOrder"],
    "draftOrders": {
      "resourceType": "Bundle",
      "type": "collection",
      "entry": [
        {
          "resource": {
            "resourceType": "RequestGroup",
            "id": "THRegimenOrder",
            "status": "draft",
            "intent": "order",
            "instantiatesCanonical": [
              "http://example.org/fhir/PlanDefinition/THRegimenDefinition"
            ]
          }
        }
      ]
    }
  },
  "fhirAuthorization": {
    "scope": "patient/Condition.read patient/Observation.read patient/MedicationRequest.read"
  }
}
```

At `order-sign`, the same regimen `RequestGroup` can be carried with the component
`MedicationRequest` resources available at that point and referenced from
`RequestGroup.action.resource`:

```json
{
  "resourceType": "Bundle",
  "type": "collection",
  "entry": [
    { "fullUrl": "RequestGroup/THRegimenOrder" },
    { "fullUrl": "MedicationRequest/PaclitaxelMedRequestTH" },
    { "fullUrl": "MedicationRequest/TrastuzumabMedRequestTH" }
  ]
}
```

### Proposed Resolution Criteria

- CRD includes hook context guidance for `RequestGroup` as an oncology regimen
  authorization subject.
- CRD includes or references an example CRD request carrying a regimen `RequestGroup`
  with available linked component medication orders and handling for components that are
  unresolved or not yet available.
- The guidance explains expected evaluation scope for the regimen and component orders.
- CRD permits the coverage-information extension to be associated with the regimen
  `RequestGroup`.
- CRD permits use of mCODE STU4 for oncology context and distinguishes data covered by
  mCODE from identified gaps.

## Ticket 2

**Specification:** Da Vinci DTR

**Raised in Version:** Da Vinci DTR v2.2.0

**Summary:** Add DTR support for `RequestGroup` as an oncology regimen order subject

**Related URL:**
https://www.hl7.org/fhir/us/davinci-dtr/OperationDefinition-questionnaire-package.html

**Related Artifact(s):** `RequestGroup`, `QuestionnaireResponse`, DTR
`$questionnaire-package`, DTR questionnaire package input parameters, DTR questionnaire
package bundle, DTR `qr-context`, CRD coverage-information, SMART `fhirContext`, mCODE
oncology clinical context profiles/value sets

**Related Page(s):**

- DTR `$questionnaire-package` operation
- DTR Questionnaire Package Input Parameters
- DTR Questionnaire Package Bundle
- Da Vinci DTR IG v2.2.0
- mCODE STU4

**Related Section(s):** TBD - `$questionnaire-package`, CRD-to-DTR context, and
`QuestionnaireResponse` linkage sections

**Description:**

Issue type: Change Request

Priority: High

Component/s: `$questionnaire-package`, launch context, QuestionnaireResponse linkage

IG gap description:
[MOPA-DV-DTR-001 - RequestGroup as the order subject in DTR](https://reason-healthcare.github.io/hl7-codex-ocpa/en/davinci-gap-proposals.html#mopa-dv-dtr-001-requestgroup-as-the-order-subject-in-dtr)

### Change Request

Update DTR guidance for `$questionnaire-package`, CRD-to-DTR context, and completed
documentation linkage so an oncology regimen `RequestGroup` can serve as the order
subject.

### Rationale

DTR `$questionnaire-package` selection and resulting `QuestionnaireResponse` linkage are
tied to the order being documented. For oncology prior authorization, the order being
documented may be the regimen `RequestGroup`, not only the individual component
medication requests.

Without DTR guidance for `RequestGroup` as the order subject, documentation collection
can lose the connection to the regimen-level authorization unit returned by CRD. DTR
should preserve that connection by allowing regimen-level documentation to be requested
for the regimen `RequestGroup` and by using the same oncology patient-context categories
queried by CRD for questionnaire launch and prepopulation.

Current DTR conformance rules allow questionnaire selection and population logic to
depend on profiles defined by DTR, HRex, or US Core. To use mCODE-based oncology data
consistently with CRD, DTR should add mCODE STU4 to the permitted profile set for
oncology use cases. Its US Core 6.1.0 baseline is already supported by DTR.

### Requested Specification Updates

- Add `RequestGroup` to the allowed resource types for the DTR Questionnaire Package
  Input Parameters `order` parameter when documentation is associated with a
  regimen-level authorization decision.
- Add `RequestGroup` to the allowed reference targets for the DTR `qr-context`
  extension and corresponding search guidance so a completed `QuestionnaireResponse`
  can remain associated with the regimen authorization subject.
- Define how the current CRD-to-DTR flow carries the regimen context: CRD returns a
  Coverage Information system action with the coverage-information extension on the
  regimen `RequestGroup`; the CRD client then gives the user an opportunity to launch
  DTR; and a SMART DTR launch passes the `RequestGroup` and applicable `Coverage` through
  `fhirContext`.
- Update DTR conformance to add mCODE STU4 to the profile set DTR services may depend on
  for oncology questionnaire selection and population. Use mCODE profile or value-set
  canonical URLs to identify oncology documentation targets where applicable.
- Define how DTR may support externally defined interim oncology-specific profiles,
  extensions, or value sets for identified mCODE gaps such as line of therapy and
  regimen treatment setting. Such candidate artifacts SHALL be identified by canonical
  URL and treated as non-mCODE artifacts unless and until adopted by mCODE. They are
  not assumed to be permitted in DTR unless DTR explicitly allows their use.
- Clarify that DTR questionnaire prepopulation for oncology uses the same data
  categories queried by CRD, so the clinician is asked only for context not available
  through the EHR FHIR server.

### Illustrative Example Payload

These examples show the proposed target state and require the requested CRD and DTR
changes before they are conformant. When CRD indicates through Coverage Information that
clinical documentation is needed, a SMART DTR launch should carry the regimen and
coverage references through `fhirContext`:

```json
{
  "patient": "example-patient",
  "fhirContext": [
    { "reference": "RequestGroup/THRegimenOrder" },
    { "reference": "Coverage/example-coverage" }
  ]
}
```

The completed DTR documentation should link back to the regimen authorization subject
rather than only to the individual component `MedicationRequest` resources. This uses
the DTR `qr-context` extension because FHIR R4
`QuestionnaireResponse.basedOn` cannot reference `RequestGroup`:

```json
{
  "resourceType": "QuestionnaireResponse",
  "extension": [
    {
      "url": "http://hl7.org/fhir/us/davinci-dtr/StructureDefinition/qr-context",
      "valueReference": { "reference": "RequestGroup/THRegimenOrder" }
    }
  ],
  "status": "completed",
  "subject": { "reference": "Patient/example-patient" },
  "item": [
    {
      "linkId": "her2-status",
      "answer": [
        {
          "valueCoding": {
            "system": "http://snomed.info/sct",
            "code": "10828004",
            "display": "Positive (qualifier value)"
          }
        }
      ]
    }
  ]
}
```

### Proposed Resolution Criteria

- DTR includes guidance for using `RequestGroup` as the oncology order subject.
- DTR includes or references an example questionnaire package request for a regimen
  `RequestGroup`.
- DTR includes or references an example `QuestionnaireResponse` linked to the regimen
  authorization subject through `qr-context`.
- DTR describes the CRD Coverage Information and SMART `fhirContext` flow.
- DTR permits use of mCODE STU4 for oncology questionnaire selection and population and
  identifies how candidate artifacts are handled for mCODE gaps.

## Ticket 3

**Specification:** Da Vinci PAS

**Raised in Version:** Da Vinci PAS v2.2.1

**Summary:** Add PAS guidance for oncology regimen-level structured submission and
attachment handling

**Related URL:**
https://www.hl7.org/fhir/us/davinci-pas/StructureDefinition-profile-claim.html

**Related Artifact(s):** `Claim`, `Claim.supportingInfo`, `RequestGroup`,
`PlanDefinition`, `DocumentReference`, PAS-to-X12 attachment handling, mCODE oncology
supporting evidence

**Related Page(s):**

- PAS Claim profile
- PAS Conformance Details
- Da Vinci PAS IG v2.2.1
- mCODE STU4

**Related Section(s):** TBD - PAS `Claim.supportingInfo`, conformance, and attachment
handling sections

**Description:**

Issue type: Change Request

Priority: High

Component/s: PAS Claim, supporting information, FHIR-to-X12 attachment handling

IG gap description:
[MOPA-DV-PAS-001 - Regimen-level structured submission](https://reason-healthcare.github.io/hl7-codex-ocpa/en/davinci-gap-proposals.html#mopa-dv-pas-001-regimen-level-structured-submission)

### Change Request

Add PAS guidance/profile content for submitting an oncology regimen as the prior
authorization subject, including how regimen-level FHIR content is represented in the
existing PAS and X12 attachment flow.

### Rationale

PAS `Claim.supportingInfo` can carry supporting resources, but regimen identity and
linkage are not first-class in the authorization submission. Oncology prior authorization
often depends on the complete regimen identity, canonical regimen definition, disease
context, line of therapy, component medication orders, and supporting evidence.

Without PAS guidance for regimen-level context, implementers may package oncology
authorization requests inconsistently and lose the relationship between the regimen and
its components. PAS should preserve the regimen-centered structure established by CRD
and DTR in the authorization submission: the patient-specific regimen `RequestGroup`,
optional canonical `PlanDefinition`, component medication orders, and supporting
oncology context.

Current PAS conformance rules do not allow services to depend on supporting resources
outside profiles defined by PAS, CRD, DTR, HRex, or US Core. Therefore, narrative
guidance to use mCODE would be insufficient: PAS should add mCODE STU4 to the permitted
profile set for oncology supporting information. mCODE profiles based on US Core 6.1.0
also conform to their US Core parents, while mCODE profiles without a US Core parent
require explicit PAS support.

### Requested Specification Updates

- Define one structured oncology regimen-package pattern that preserves the
  patient-specific regimen `RequestGroup` as the authorization unit, retains component
  item detail, links the canonical regimen `PlanDefinition` when available, and carries
  supporting oncology evidence.
- Update the applicable `Claim.supportingInfo.valueReference` targets to permit
  `RequestGroup` and `PlanDefinition`. PAS already permits common US Core supporting
  resources, including Observations; only mCODE profiles or candidate artifacts not
  covered by existing PAS targets need explicit additional support.
- Update PAS conformance to add mCODE STU4 to the profile set PAS services may depend on
  for oncology supporting information and state that supporting resources SHOULD
  conform to an applicable mCODE profile.
- Define how PAS may support externally defined interim oncology-specific profiles,
  extensions, or value sets for known mCODE gaps, including line of therapy, regimen
  intent/treatment setting, and regimen-disease context. Such candidate artifacts SHALL
  be identified by canonical URL and treated as non-mCODE artifacts unless and until
  adopted by mCODE. They are not assumed to be permitted in PAS unless PAS explicitly
  allows the applicable profile and reference target.
- Distinguish content expected to map to PAS/X12 request data from content expected to
  travel as FHIR supporting resources or non-FHIR attachments.
- Include an example X12-oriented submission or attachment strategy for current payer
  workflows without redefining X12 transaction details.

### Illustrative Example Payload

The following is a proposed target-state payload. In PAS v2.2.1, the Observation
supporting-information references use existing PAS support for US Core Observation
targets. The non-conformant pieces are the proposed `RequestGroup` and `PlanDefinition`
references, unless PAS also chooses to allow additional non-US-Core mCODE profiles or
candidate artifacts. A regimen-level PAS submission should be able to reference the
ordered regimen, its canonical definition when known, component medication orders, and
oncology evidence resources:

```json
{
  "resourceType": "Claim",
  "use": "preauthorization",
  "supportingInfo": [
    {
      "sequence": 1,
      "category": { "text": "ordered oncology regimen" },
      "valueReference": { "reference": "RequestGroup/THRegimenOrder" }
    },
    {
      "sequence": 2,
      "category": { "text": "canonical regimen definition" },
      "valueReference": { "reference": "PlanDefinition/THRegimenDefinition" }
    },
    {
      "sequence": 3,
      "category": { "text": "line of therapy" },
      "valueReference": { "reference": "Observation/LineOfTherapyFirstLine" }
    },
    {
      "sequence": 4,
      "category": { "text": "HER2 tumor marker result" },
      "valueReference": { "reference": "Observation/HER2TumorMarkerExample" }
    }
  ],
  "item": [
    {
      "sequence": 1,
      "productOrService": { "text": "Paclitaxel + trastuzumab regimen" }
    }
  ]
}
```

The line-of-therapy evidence below is an interim candidate artifact represented as an
Observation. PAS already supports Observation references when they conform to an allowed
US Core Observation target; PAS would need explicit guidance only if it permits a
non-US-Core candidate profile or otherwise constrains how this oncology-specific
Observation is exchanged:

```json
{
  "resourceType": "Observation",
  "id": "LineOfTherapyFirstLine",
  "status": "final",
  "code": { "text": "Line of Therapy" },
  "subject": { "reference": "Patient/example-patient" },
  "focus": [{ "reference": "Condition/PrimaryBreastCancerExample" }],
  "effectivePeriod": { "start": "2026-01-15" },
  "valueCodeableConcept": { "text": "First-line" }
}
```

### Proposed Resolution Criteria

- PAS includes guidance for representing oncology regimen-level submissions using
  a structured regimen-package pattern that preserves the regimen as the authorization
  unit and retains component item detail.
- PAS includes or references an example submission with a regimen `RequestGroup`,
  canonical `PlanDefinition`, item detail, and supporting oncology evidence.
- PAS includes or references an example showing how the regimen package is handled in
  the current PAS-to-X12 attachment path.
- PAS permits use of mCODE STU4 for oncology supporting information and distinguishes
  applicable mCODE profiles from candidate artifacts used for identified gaps.
