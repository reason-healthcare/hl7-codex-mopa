# Da Vinci Gap Proposals - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Da Vinci Gap Proposals

This page captures the workflow and exchange gaps identified for Da Vinci CRD, DTR, and PAS. Each item is written as an upstream proposal for HL7 work group consideration.

**Must-have** items are blocking — the MOPA workflow cannot function without them being addressed upstream. **Nice-to-have** items improve interoperability and operational quality but are not blocking for a pilot implementation.

**Summary**

| | | | |
| :--- | :--- | :--- | :--- |
| MOPA-DV-CRD-001 | CRD | Oncology coverage outcome semantics | Nice-to-have |
| MOPA-DV-CRD-002 | CRD | `RequestGroup`as the PA unit in CRD hooks | **Must-have** |
| MOPA-DV-CRD-003 | CRD | CRD RequestGroup order profile and Request Category context expansion | **Must-have** |
| MOPA-DV-CRD-004 | CRD | `order-select`informational approvability semantics | Nice-to-have |
| MOPA-DV-CRD-005 | CRD | Propose Alternate Request for RequestGroup partial replacement (biosimilar substitution) | **Must-have** |
| MOPA-DV-DTR-001 | DTR | `RequestGroup`as the order subject in DTR | **Must-have** |
| MOPA-DV-DTR-002 | DTR | Structured exception / contraindication capture | Nice-to-have |
| MOPA-DV-PAS-001 | PAS | Regimen-level structured submission | **Must-have** |
| MOPA-DV-PAS-002 | PAS | Oncology pend / additional-info taxonomy | Nice-to-have |
| MOPA-DV-PAS-003 | PAS | Regimen-change update semantics | Nice-to-have |

### CRD

#### MOPA-DV-CRD-001 — Oncology coverage outcome semantics

**Priority: Nice-to-have**

**Problem**

CRD coverage-information outcomes do not express oncology branch states computably, such as guideline-concordant, needs DTR, PA required, or alternative required.

**Proposed solution**

Define an oncology outcome classification for CRD responses. The key states to express computably:

* **Authorization Satisfied** — PA conditions have been evaluated by the CRD service and PA can be bypassed (the regimen meets coverage criteria). This is distinct from "no PA required" (PA is categorically never required for this service).
* **DTR required** — context is incomplete; launch DTR to collect missing documentation
* **PA required** — context is complete but criteria are not met; submit via PAS
* **Cannot evaluate** — the CRD service lacks sufficient information to make a determination

**Examples**

Coverage outcome semantics are demonstrated in the regimen order examples:

* [TH Regimen Order](RequestGroup-THRegimenOrder.md) — Patient context with biomarker status (HER2+) informing coverage decision
* [Breast Cancer PA](breast-cancer-pa.md) — Data categories driving sufficiency checks

**Target destination**

[CRD Workflow](cds-workflow.md).

**Disposition path**

CRD work group issue and response-card model discussion.

#### MOPA-DV-CRD-002 — RequestGroup as the PA unit in CRD hooks

**Priority: Must-have**

**Problem**

CRD `order-select` and `order-sign` hooks are defined around individual order resources (`MedicationRequest`, `ServiceRequest`, `DeviceRequest`). Oncology prior authorization is evaluated at the **regimen level** — the entire multi-drug protocol (`RequestGroup`) is the unit being authorized, not individual medications within it. There is no standard way for a CRD hook to carry a `RequestGroup` as the primary PA subject, and no guidance on how a CRD service should evaluate authorization at regimen scope rather than per-medication.

**Proposed solution**

Define guidance for including a `RequestGroup` in `context.draftOrders` and `context.selections` as the primary authorization unit, with the CRD service evaluating the regimen as a whole. Clarify that component `MedicationRequest` resources within the `RequestGroup` actions are subordinate to the regimen-level authorization decision, not independent PA subjects.

**Examples**

* [TH Regimen Order](RequestGroup-THRegimenOrder.md) — Patient-specific regimen instance as the PA unit
* [CRD Workflow](cds-workflow.md) — How the `RequestGroup` is placed in `context.draftOrders`

**Target destination**

Da Vinci CRD IG — hook context guidance and `RequestGroup` support.

**Disposition path**

CRD work group review; may require a hook definition amendment or a new oncology-specific hook context profile.

#### MOPA-DV-CRD-003 — CRD order profile for RequestGroup

**Priority: Must-have**

**Problem**

Da Vinci CRD defines order profiles for specific resource types — `MedicationRequest`, `ServiceRequest`, `DeviceRequest`, and others — that constrain the resource for use in CRD hook contexts and specify how the CRD service should evaluate them. There is no corresponding CRD order profile for `RequestGroup`, which is the resource type MOPA uses as the primary PA subject for oncology regimens. Without a CRD profile for `RequestGroup`:

* EHRs have no standard guidance on what a `RequestGroup` in `context.draftOrders` should conform to when passed to a CRD service
* CRD services have no standard profile to validate against when evaluating the ordered regimen
* The CRD IG's coverage-information and suggestion card patterns are not formally tied to `RequestGroup` as a valid order type

**Proposed solution**

Define a CRD order profile for `RequestGroup` in the Da Vinci CRD IG, analogous to the existing profiles for `MedicationRequest` and `ServiceRequest`. The profile should:

1. **Constrain `RequestGroup` for CRD hook contexts**— require`status`,`intent = order`,`subject`, and`action`elements; reference the MOPA`AntiCancerRegimenRequestGroup`profile as a domain-specific specialization
1. **Define CRD service evaluation expectations**— how a CRD service should interpret`RequestGroup.instantiatesCanonical`to identify the regimen protocol, and how to evaluate the regimen as a whole rather than per-component
1. **Specify card behavior for `RequestGroup`**— what card types and indicators are appropriate when the PA subject is a regimen-level`RequestGroup`(e.g., coverage information at the regimen level, not per-medication)
1. **Support both `order-select` and `order-sign`**— the profile should accommodate the two-stage pattern where`order-select`carries only the`RequestGroup`(no finalised`MedicationRequest`components) and`order-sign`carries the full bundle
1. **Expand Request Category context**— add`RequestGroup`as an allowed context for`http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category`and define a repeated`category 0..* MS`slice. Treatment intent and line of therapy are representative oncology categories. CRD 2.2.1 currently permits the extension only on DeviceRequest, NutritionOrder, and VisionPrescription.

This proposal is complementary to [MOPA-DV-CRD-002](#mopa-dv-crd-002--requestgroup-as-the-pa-unit-in-crd-hooks), which establishes that `RequestGroup` should be the PA unit. This proposal asks CRD to formalize the resource profile that supports that decision.

**Examples**

* [TH Regimen Order](RequestGroup-THRegimenOrder.md) — `RequestGroup` conforming to the MOPA `AntiCancerRegimenRequestGroup` profile, which would be the domain-specific layer on top of the proposed CRD `RequestGroup` order profile
* [order-select Bundle](Bundle-ExampleOrderSelectBundle.md) — `RequestGroup` alone in `context.draftOrders` at `order-select`
* [order-sign Bundle](Bundle-ExampleOrderSignBundle.md) — `RequestGroup` plus component `MedicationRequest` resources at `order-sign`

**Target destination**

Da Vinci CRD IG — order profile section, alongside existing `MedicationRequest` and `ServiceRequest` CRD profiles.

**Disposition path**

CRD work group ballot proposal; coordinate with the CIC work group on the `AntiCancerRegimenRequestGroup` domain profile that would sit on top of the CRD profile.

#### MOPA-DV-CRD-004 — order-select informational approvability semantics

**Priority: Nice-to-have**

**Problem**

The CDS Hooks specification defines `order-select` as a hook that fires when a clinician selects an order from a catalog or order set, but does not prescribe the semantics of the cards returned. In practice, some CRD services return the same final determination at `order-select` as at `order-sign`, which can confuse providers — the order is not yet committed, but the card reads as if it is a final authorization decision.

In the oncology PA workflow, `order-select` is best used as an **informational approvability check**: the provider is asking "will this be approvable if I sign it?" The final binding determination should come at `order-sign`. There is no standard guidance distinguishing the card semantics between these two stages.

**Proposed solution**

Add CRD guidance distinguishing card semantics at `order-select` vs `order-sign`:

* **`order-select`** — cards SHOULD be informational (`indicator: "info"`) when the regimen appears approvable, indicating that the assessment is advisory and the final determination will come at sign. Warning cards for PA-required or DTR-required are appropriate. Critical cards SHOULD be reserved for categorical exclusions (never covered), since the order is not yet committed.
* **`order-sign`** — cards carry the final binding determination. Success indicates Authorization Satisfied (PA bypassed); warning indicates PA required or DTR still needed.

This distinction helps providers understand that the `order-select` card is a pre-check, not a final answer, and encourages them to proceed (or not) based on that advisory information.

**Target destination**

Da Vinci CRD IG — hook response guidance section.

**Disposition path**

CRD work group discussion; may be included as implementation guidance rather than a normative requirement.

### CRD (continued)

#### MOPA-DV-CRD-005 — Propose Alternate Request for RequestGroup partial replacement

**Priority: Must-have**

**Problem**

The CDS Hooks specification defines a suggestion mechanism (`card.suggestions` with `actions` of type `create`, `update`, and `delete`) that allows a CRD service to propose modifications to the draft orders. The Da Vinci CRD IG describes this as the "Propose Alternate Request" response type, with guidance for individual `MedicationRequest` and `ServiceRequest` resources.

However, when the PA subject is a `RequestGroup` (as in MOPA's regimen-level authorization), there is no standard guidance for **partial replacement** of component resources within the `RequestGroup`. For example, a payer may approve a regimen but require substituting one drug (trastuzumab) with a biosimilar (trastuzumab-dttb). The CRD service needs to propose deleting the original `MedicationRequest` and creating a replacement, while keeping the rest of the regimen intact.

The current specification does not address:

* How `delete` and `create` actions reference component `MedicationRequest` resources within a `RequestGroup` in `context.draftOrders` (by `resourceId` matching the entry's `fullUrl` or `resource.id`)
* How the EHR should update `RequestGroup.action[].resource` references when a component is replaced
* What `source.topic` code is appropriate for a partial-replacement suggestion (the CRD response types ValueSet includes `therapy-alternatives-req`, but this has not been applied to `RequestGroup` partial replacement)
* What `overrideReasons` are appropriate for oncology biosimilar substitution scenarios

**Proposed solution**

Extend the CRD IG's "Propose Alternate Request" guidance to cover `RequestGroup` partial replacement:

1. **Action targeting** — clarify that `delete` and `update` actions reference component resources in `context.draftOrders` by their entry `fullUrl` (or `resource.id` when `fullUrl` is absent). The CRD service identifies which `MedicationRequest` to replace by matching the `resourceId` to the draft orders Bundle entry.
1. **RequestGroup reference update** — when a component `MedicationRequest` is deleted and a replacement created, the EHR **SHALL** update `RequestGroup.action[].resource.reference` to point to the new resource. This preserves the regimen structure while reflecting the substitution.
1. **Topic code** — use `therapy-alternatives-req` from the CRD response types ValueSet for cards that propose a partial replacement within a `RequestGroup`.
1. **Override reasons**— define an oncology-specific override reason set for biosimilar substitution scenarios:
* `clinical-contraindication` — clinical contraindication to the biosimilar
* `patient-preference` — patient already established on the reference product
* `formulary-exception` — formulary exception approved by the payer

1. **Selection behavior** — `selectionBehavior: "at-most-one"` is appropriate because the provider either accepts the substitution or proceeds with the original order. The suggestion is not mandatory — the provider may override.
1. **order-select vs order-sign**— the Propose Alternate Request card**SHOULD**be returned at`order-select`(informational,`indicator: "info"`) so the provider sees the modification before signing. If the provider accepts, the EHR updates the draft orders in-session and sends the modified Bundle to`order-sign`. If the provider overrides, the original order proceeds to`order-sign`unchanged.

**Examples**

* [TH Regimen Order](RequestGroup-THRegimenOrder.md) — regimen with trastuzumab component that may be replaced with a biosimilar
* [CRD Workflow](cds-workflow.md) — biosimilar substitution at order-select

**Target destination**

Da Vinci CRD IG — "Propose Alternate Request" response type guidance, extended for `RequestGroup` partial replacement.

**Disposition path**

CRD work group review; coordinate with the CDS Hooks work group on the `resourceId` semantics for actions targeting `draftOrders` entries.

### DTR

#### MOPA-DV-DTR-001 — RequestGroup as the order subject in DTR

**Priority: Must-have**

**Problem**

DTR's `$questionnaire-package` operation selects a questionnaire based on an `order` parameter tied to a specific order resource type (`MedicationRequest`, `ServiceRequest`, etc.). The `QuestionnaireResponse` produced by DTR is likewise linked back to the individual order. For oncology, the authorization subject is the regimen (`RequestGroup`), not the individual `MedicationRequest` components within it. There is currently no standard way to:

* Pass a `RequestGroup` as the `order` parameter to `$questionnaire-package`
* Associate the completed `QuestionnaireResponse` with the `RequestGroup` as the authorization unit
* Ensure the DTR launch context carries the correct regimen reference when CRD returns a DTR launch card for a regimen-level decision

**Proposed solution**

Extend DTR guidance to support `RequestGroup` as a valid order subject for `$questionnaire-package` and `QuestionnaireResponse` linkage. Define how the DTR launch context (via `appContext` on the CRD card) carries the `RequestGroup` reference, and how the resulting `QuestionnaireResponse` is associated with the regimen rather than individual component medications.

**Examples**

* [TH Regimen Order](RequestGroup-THRegimenOrder.md) — Regimen instance that is the DTR subject when HER2 status is missing
* [CRD Workflow](cds-workflow.md) — DTR launch card returned when context is incomplete

**Target destination**

Da Vinci DTR IG — `$questionnaire-package` operation definition and launch context guidance.

**Disposition path**

DTR work group review; likely requires an amendment to the `$questionnaire-package` operation parameters and the DTR launch context specification.

#### MOPA-DV-DTR-002 — Structured exception / contraindication capture

**Priority: Nice-to-have**

**Problem**

Medical-necessity exceptions arrive as free text or attachments.

**Proposed solution**

Standard DTR structured answer patterns for intolerance and contraindication aligned to PA adjudication.

**Examples**

Structured exception capture is demonstrated in patient context examples:

* [MOPA Patient Example](Patient-MOPAPatientExample.md) — Patient with oncology context
* [Metastatic Breast Cancer Condition](Condition-MOPAMetastaticBreastCancerConditionExample.md) — Disease state supporting contraindication documentation

**Target destination**

[Breast Cancer PA](breast-cancer-pa.md) and [Data Requirements](data-requirements.md).

**Disposition path**

DTR work group and payer implementation feedback loop.

### PAS

#### MOPA-DV-PAS-001 — Regimen-level structured submission

**Priority: Must-have**

**Problem**

PAS `Claim.supportingInfo` can carry resources, but regimen identity and linkage are not first-class in adjudication.

**Proposed solution**

Define PAS guidance/profile to reference the regimen `RequestGroup` plus canonical `PlanDefinition`, and adjudicate at regimen scope with item detail.

**Examples**

Regimen-level submission is demonstrated in the regimen order examples:

* [TH Regimen Order](RequestGroup-THRegimenOrder.md) — Patient-specific regimen with full drug component linkage
* [Line of Therapy Request Category](StructureDefinition-line-of-therapy-request-category.md) — Order-level treatment sequence semantics bound to the treatment-line value set

**Target destination**

[Regimen Modeling](regimen-model.md).

**Disposition path**

PAS work group and claim submission profile discussion.

#### MOPA-DV-PAS-002 — Oncology pend / additional-info taxonomy

**Priority: Nice-to-have**

**Problem**

PEND and additional-info reasons are operationally variable and not granular enough for oncology work queues.

**Proposed solution**

Constrain the operational reason set with an oncology-specific taxonomy.

**Examples**

Oncology pend taxonomy and additional-info requirements are defined by the data requirements pattern:

* [Breast Cancer PA](breast-cancer-pa.md) — Granular data categories that map to pend reasons (biomarker result, prior-therapy failure, stage clarification)

**Target destination**

[Breast Cancer PA](breast-cancer-pa.md).

**Disposition path**

PAS work group and payer operations review.

#### MOPA-DV-PAS-003 — Regimen-change update semantics

**Priority: Nice-to-have**

**Problem**

Dose, schedule, and component substitutions are common, but PAS update and continuity semantics are inconsistent.

**Proposed solution**

Add explicit PAS update guidance that preserves authorization trace across regimen changes.

**Examples**

Regimen-change update semantics are demonstrated across the regimen order examples:

* [TH Regimen Order](RequestGroup-THRegimenOrder.md) — Component substitution pattern
* [ddAC→T Regimen Order](RequestGroup-DDACTRegimenOrder.md) — Sequential phase changes preserving authorization continuity

**Target destination**

[Regimen Modeling](regimen-model.md) and [Breast Cancer PA](breast-cancer-pa.md).

**Disposition path**

PAS work group and operational policy discussion.

**See Also**

* [Breast Cancer PA](breast-cancer-pa.md)
* [mCODE Gap Proposals](mcode-gap-proposals.md)

