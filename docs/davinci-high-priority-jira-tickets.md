# Da Vinci High-Priority Jira Ticket Drafts

Source: [MOPA Da Vinci Gap Proposals](https://reason-healthcare.github.io/hl7-codex-ocpa/en/davinci-gap-proposals.html)

Scope: Da Vinci gap proposals currently marked `Must-have`.

The following tickets are drafted as HL7/FHIR specification change requests. Each ticket is scoped
to one high-priority Da Vinci CRD, DTR, or PAS gap that blocks the MOPA oncology prior authorization
workflow.

## Ticket 1

**Specification:** Da Vinci CRD

**Raised in Version:** Da Vinci CRD v2.2.1

**Summary:** Add CRD hook context guidance for oncology regimen `RequestGroup` authorization

**Related URL:** https://cds-hooks.org/hooks/order-select/

**Related Artifact(s):** `RequestGroup`, `PlanDefinition`, `MedicationRequest`, CRD `order-select`,
CRD `order-sign`, `context.draftOrders`, `context.selections`

**Related Page(s):**

- CDS Hooks `order-select` hook definition
- CDS Hooks `order-sign` hook definition
- Da Vinci CRD IG v2.2.1
- Da Vinci CRD Foundational Requirements

**Description:**

Issue type: Change Request

Priority: High

Component/s: CRD hook context guidance, Oncology Prior Authorization

IG gap description: [MOPA-DV-CRD-002 - RequestGroup as the PA unit in CRD hooks](https://reason-healthcare.github.io/hl7-codex-ocpa/en/davinci-gap-proposals.html#mopa-dv-crd-002-requestgroup-as-the-pa-unit-in-crd-hooks)

### Change Request

Add oncology-specific CRD hook context guidance/profile content allowing a regimen `RequestGroup`
to be carried as the primary prior authorization subject in `order-select` and `order-sign` hook
requests.

### Rationale

CRD hooks are generally centered on individual order resources such as `MedicationRequest`,
`ServiceRequest`, and `DeviceRequest`. Oncology prior authorization is often evaluated at the
regimen level: the full multi-drug protocol is the authorization unit, while component medication
orders are subordinate details.

Without CRD guidance for representing the regimen as the selected authorization subject, CRD
services may evaluate oncology orders per medication rather than at regimen scope.

### Requested Specification Updates

- Define CRD hook context guidance, through a hook definition amendment or oncology-specific hook
  context profile as needed, for including a regimen `RequestGroup` in `context.draftOrders` for
  `order-select` and `order-sign`.
- Define `context.selections` to reference the same regimen `RequestGroup` when the selected
  clinical unit is a regimen.
- Use the existing `RequestGroup.instantiatesCanonical` pattern to link the patient-specific
  regimen order to a canonical regimen `PlanDefinition` when one is known; do not require that
  link when the regimen originates from a local order set without a canonical definition.
- Clarify that `order-select` may include only the selected regimen `RequestGroup`, while
  `order-sign` should include finalized component `MedicationRequest` resources referenced from
  `RequestGroup.action.resource`.
- State that the CRD service evaluates the `RequestGroup` as the regimen-level authorization unit.
- Clarify that component `MedicationRequest` resources are subordinate to the regimen-level
  authorization decision, not independent PA subjects.

### MOPA Examples and Artifacts

- [TH Regimen Order](https://reason-healthcare.github.io/hl7-codex-ocpa/en/RequestGroup-THRegimenOrder.html) - patient-specific regimen instance as the PA unit
- [CRD Workflow](https://reason-healthcare.github.io/hl7-codex-ocpa/en/cds-workflow.html) - `RequestGroup` use in CRD hook context
- [Anti-Cancer Regimen RequestGroup profile](https://reason-healthcare.github.io/hl7-codex-ocpa/en/StructureDefinition-anticancer-regimen-requestgroup.html)
- [Anti-Cancer Regimen PlanDefinition profile](https://reason-healthcare.github.io/hl7-codex-ocpa/en/StructureDefinition-anticancer-regimen-plandefinition.html)
- [Oncology CRD Client Capability Statement](https://reason-healthcare.github.io/hl7-codex-ocpa/en/CapabilityStatement-ocpa-crd-client.html)
- [Oncology CRD Service Capability Statement](https://reason-healthcare.github.io/hl7-codex-ocpa/en/CapabilityStatement-ocpa-crd-service.html)

### Proposed Resolution Criteria

- CRD includes hook context guidance for `RequestGroup` as an oncology regimen authorization
  subject.
- CRD includes or references an example CRD request carrying a regimen `RequestGroup` with linked
  component medication orders.
- The guidance explains expected evaluation scope for the regimen and component orders.

## Ticket 2

**Specification:** Da Vinci DTR

**Raised in Version:** Da Vinci DTR v2.2.0

**Summary:** Add DTR support for `RequestGroup` as an oncology regimen order subject

**Related URL:** https://www.hl7.org/fhir/us/davinci-dtr/OperationDefinition-questionnaire-package.html

**Related Artifact(s):** `RequestGroup`, `QuestionnaireResponse`, DTR `$questionnaire-package`,
DTR questionnaire package input parameters, DTR questionnaire package bundle, CRD card `appContext`

**Related Page(s):**

- DTR `$questionnaire-package` operation
- DTR Questionnaire Package Input Parameters
- DTR Questionnaire Package Bundle
- Da Vinci DTR IG v2.2.0

**Related Section(s):** TBD - `$questionnaire-package`, launch context, and `QuestionnaireResponse` linkage sections

**Description:**

Issue type: Change Request

Priority: High

Component/s: `$questionnaire-package`, launch context, QuestionnaireResponse linkage

IG gap description: [MOPA-DV-DTR-001 - RequestGroup as the order subject in DTR](https://reason-healthcare.github.io/hl7-codex-ocpa/en/davinci-gap-proposals.html#mopa-dv-dtr-001-requestgroup-as-the-order-subject-in-dtr)

### Change Request

Update DTR guidance for `$questionnaire-package`, launch context, and completed documentation
linkage so an oncology regimen `RequestGroup` can serve as the order subject.

### Rationale

DTR `$questionnaire-package` selection and resulting `QuestionnaireResponse` linkage are tied to
the order being documented. For oncology prior authorization, the order being documented may be the
regimen `RequestGroup`, not only the individual component medication requests.

Without DTR guidance for `RequestGroup` as the order subject, documentation collection can lose the
connection to the regimen-level authorization unit returned by CRD.

### Requested Specification Updates

- Add `RequestGroup` as a valid oncology order subject for `$questionnaire-package` when the
  documentation request is for a regimen-level authorization decision.
- Define how the CRD-to-DTR launch context carries the regimen `RequestGroup` reference, including
  use of CRD card `appContext` to identify the regimen and missing oncology data elements.
- Define how the resulting `QuestionnaireResponse` is associated with the regimen authorization
  subject rather than only with individual component medication orders.
- Update the `$questionnaire-package` operation definition and DTR launch context guidance to
  support the regimen order subject.

### MOPA Examples and Artifacts

- [TH Regimen Order](https://reason-healthcare.github.io/hl7-codex-ocpa/en/RequestGroup-THRegimenOrder.html) - regimen instance that becomes the DTR subject
- [CRD Workflow](https://reason-healthcare.github.io/hl7-codex-ocpa/en/cds-workflow.html) - DTR launch card when regimen context is incomplete
- [Anti-Cancer Regimen RequestGroup profile](https://reason-healthcare.github.io/hl7-codex-ocpa/en/StructureDefinition-anticancer-regimen-requestgroup.html)
- [Workflow Walkthrough](https://reason-healthcare.github.io/hl7-codex-ocpa/en/walkthrough.html)

### Proposed Resolution Criteria

- DTR includes guidance for using `RequestGroup` as the oncology order subject.
- DTR includes or references an example questionnaire package request for a regimen `RequestGroup`.
- DTR includes or references an example `QuestionnaireResponse` linked to the regimen authorization
  subject.

## Ticket 3

**Specification:** Da Vinci PAS

**Raised in Version:** Da Vinci PAS v2.2.1

**Summary:** Add PAS guidance for oncology regimen-level structured submission and attachment handling

**Related URL:** https://www.hl7.org/fhir/us/davinci-pas/StructureDefinition-profile-claim.html

**Related Artifact(s):** `Claim`, `Claim.supportingInfo`, `RequestGroup`, `PlanDefinition`,
`DocumentReference`, PAS-to-X12 attachment handling

**Related Page(s):**

- PAS Claim profile
- PAS Conformance Details
- Da Vinci PAS IG v2.2.1

**Related Section(s):** TBD - PAS `Claim.supportingInfo`, conformance, and attachment handling sections

**Description:**

Issue type: Change Request

Priority: High

Component/s: PAS Claim, supporting information, FHIR-to-X12 attachment handling

IG gap description: [MOPA-DV-PAS-001 - Regimen-level structured submission](https://reason-healthcare.github.io/hl7-codex-ocpa/en/davinci-gap-proposals.html#mopa-dv-pas-001-regimen-level-structured-submission)

### Change Request

Add PAS guidance/profile content for submitting an oncology regimen as the prior authorization
subject, including how regimen-level FHIR content is represented in the existing PAS and X12
attachment flow.

### Rationale

PAS `Claim.supportingInfo` can carry supporting resources, but regimen identity and linkage are not
first-class in adjudication. Oncology prior authorization often depends on the complete regimen
identity, canonical regimen definition, disease context, line of therapy, component medication
orders, and supporting evidence.

Without PAS guidance for regimen-level context, implementers may package oncology authorization
requests inconsistently and payers may be unable to adjudicate at regimen scope.

### Requested Specification Updates

- Define PAS guidance/profile content for referencing the patient-specific regimen `RequestGroup`
  from the prior authorization submission.
- Define how the regimen `RequestGroup` is linked to a canonical regimen `PlanDefinition` when
  available.
- Specify that adjudication occurs at regimen scope with item detail.
- Define oncology-specific supporting-information handling for the regimen `RequestGroup`,
  canonical `PlanDefinition`, and supporting oncology evidence.
- Distinguish content expected to map to PAS/X12 request data from content expected to travel as
  FHIR supporting resources or non-FHIR attachments.
- Include an example X12-oriented submission or attachment strategy for current payer workflows
  without redefining X12 transaction details.

### MOPA Examples and Artifacts

- [TH Regimen Order](https://reason-healthcare.github.io/hl7-codex-ocpa/en/RequestGroup-THRegimenOrder.html) - patient-specific regimen with component medication linkage
- [Line of Therapy Observation](https://reason-healthcare.github.io/hl7-codex-ocpa/en/Observation-LineOfTherapyFirstLine.html) - supporting evidence for PA adjudication
- [Regimen Modeling](https://reason-healthcare.github.io/hl7-codex-ocpa/en/regimen-model.html) - regimen structure and linkage model
- [Anti-Cancer Regimen RequestGroup profile](https://reason-healthcare.github.io/hl7-codex-ocpa/en/StructureDefinition-anticancer-regimen-requestgroup.html)
- [Anti-Cancer Regimen PlanDefinition profile](https://reason-healthcare.github.io/hl7-codex-ocpa/en/StructureDefinition-anticancer-regimen-plandefinition.html)
- [Line of Therapy Observation profile](https://reason-healthcare.github.io/hl7-codex-ocpa/en/StructureDefinition-line-of-therapy-observation.html)

### Proposed Resolution Criteria

- PAS includes guidance for representing oncology regimen-level submissions using existing PAS
  mechanisms.
- PAS includes or references an example submission with a regimen `RequestGroup`, canonical
  `PlanDefinition`, item detail, and supporting oncology evidence.
- PAS includes or references an example showing how the regimen package is handled in the current
  PAS-to-X12 attachment path.
