### mCODE Gap Proposals

This page captures the data-model gaps identified in the MOPA analysis. Each item is written as an
upstream proposal for mCODE STU5 consideration, with breast cancer PA used as the anchor use case.

**Summary**


| ID | Problem | Proposed solution | Repo artifact |
|---|---|---|---|
| MOPA-MC-001 | No first-class computable regimen definition | Add regimen PlanDefinition profile | `AntiCancerRegimenPlanDefinition` |
| MOPA-MC-002 | No patient-specific regimen instance | Add regimen RequestGroup profile | `AntiCancerRegimenRequestGroup` |
| MOPA-MC-003 | Line-of-therapy semantics not standardized for sequencing/PA | Profile the CRD Request Category and require the treatment-line value set | `LineOfTherapyRequestCategory`, `TreatmentLineCS/VS` |
| MOPA-MC-004 | Treatment-intent semantics and coding guidance needed | Profile the CRD Request Category and require the regimen-intent value set | `TreatmentIntentRequestCategory`, `RegimenIntentVS` |
| MOPA-MC-005 | Order-level oncology categories need CRD support | Reuse CRD `ext-request-category`; propose RequestGroup context | _(Da Vinci CRD proposal)_ |
| MOPA-MC-006 | Disease context placement needs clarity | Use PlanDefinition.subject plus RequestGroup.subject and queried Condition | _(no extension artifact)_ |
| MOPA-MC-007 | No oncology PA data categories pattern | Add oncology data categories pattern for cancer-type PA evaluation | _(no repo artifact — see [Data Requirements](data-requirements.html))_ |
| MOPA-MC-008 | Biomarker results not PA-normalized | Add normalized biomarker result guidance / profiling | Breast cancer PA guidance |

### MOPA-MC-001 — Regimen definition

**Problem**

mCODE has no first-class computable regimen definition.

**Proposed solution**

Add a regimen `PlanDefinition` profile. This profile would represent anti-cancer treatment plans as computable clinical guidelines that can be used for prior authorization evaluation and order-select decision support.

**Examples**

Canonical regimen definitions from this IG:

- [TH Regimen Definition](PlanDefinition-RegimenTH.html) — Paclitaxel + Trastuzumab (HER2+ breast cancer)
- [ddAC→T Regimen Definition](PlanDefinition-RegimenDdACT.html) — Dose-dense AC then Paclitaxel
- [PHD Regimen Definition](PlanDefinition-RegimenPHD.html) — Pertuzumab + Trastuzumab + Docetaxel (HER2+ metastatic breast cancer)

**Target destination**

mCODE STU5 regimen `PlanDefinition` profile in the mCODE Implementation Guide.

**Disposition path**

mCODE work group proposal and ballot-ready profile design for STU5.

### MOPA-MC-002 — Regimen instance

**Problem**

mCODE has no patient-specific regimen instance representation.

**Proposed solution**

Add a regimen `RequestGroup` profile that carries the instantiated regimen definition for a specific patient, including the ordered components and lifecycle state.

**Examples**

Patient-specific regimen orders from this IG (CRD order-select context):

- [TH Regimen Order](RequestGroup-THRegimenOrder.html) — Patient instance: Jane Smith, adjuvant HER2+ breast cancer
- [ddAC→T Regimen Order](RequestGroup-DDACTRegimenOrder.html) — Sequential phase ordering pattern
- [PHD Regimen Order](RequestGroup-PHDRegimenOrder.html) — Metastatic HER2+ with three-agent regimen

Also see: [CDS Hooks order-select Bundle](Bundle-ExampleOrderSelectBundle.html) — Full oncology context payload

**Target destination**

mCODE STU5 regimen `RequestGroup` profile.

**Disposition path**

mCODE work group proposal and instance-model review for STU5 ballot.

### MOPA-MC-003 — Line of therapy

**Problem**

Line of therapy is not standardized for sequencing or prior authorization workflows.

**Proposed solution**

Add `LineOfTherapyRequestCategory`, a constraint profile on the Da Vinci CRD
`ext-request-category`. It requires a `CodeableConcept` bound to `TreatmentLineVS` and is exposed
as the optional `RequestGroup.extension:category/lineOfTherapy` reslice. This keeps the treatment sequence
semantics on the patient-specific order without creating a companion Observation. CRD 2.2.1
needs a RequestGroup extension-context expansion for this use.

**Examples**

Line of therapy is demonstrated on the patient-specific RequestGroup examples:

- [TH Regimen Order](RequestGroup-THRegimenOrder.html) — first-line adjuvant treatment
- [ddAC→T Regimen Order](RequestGroup-DDACTRegimenOrder.html) — first-line adjuvant treatment
- [PHD Regimen Order](RequestGroup-PHDRegimenOrder.html) — first-line metastatic treatment

**Target destination**

mCODE STU5 `LineOfTherapyRequestCategory` semantics and `TreatmentLineCS/VS`. The underlying
extension URL and RequestGroup context expansion belong to Da Vinci CRD.

**Disposition path**

mCODE terminology and profile coordination for sequencing semantics.

### MOPA-MC-004 — Regimen intent

**Problem**

Regimen intent is not explicit in mCODE, creating ambiguity about treatment goals. Intent is a
patient-specific ordering decision and does not belong on the canonical regimen definition.

**Proposed solution**

Add `TreatmentIntentRequestCategory`, a constraint profile on the Da Vinci CRD
`ext-request-category`. It requires a `CodeableConcept` bound to `RegimenIntentVS` and is exposed
as the optional `RequestGroup.extension:category/treatmentIntent` reslice. The open `category 0..* MS`
slice still permits other request categories. CRD must add RequestGroup to the extension's
context; mCODE does not own a replacement extension.

**Examples**

Regimen intent is demonstrated on the patient-specific RequestGroup examples in this IG:

- [TH Regimen Order](RequestGroup-THRegimenOrder.html) — adjuvant intent
- [ddAC→T Regimen Order](RequestGroup-DDACTRegimenOrder.html) — adjuvant intent
- [PHD Regimen Order](RequestGroup-PHDRegimenOrder.html) — palliative intent

**Target destination**

mCODE STU5 `TreatmentIntentRequestCategory` semantics and terminology guidance; the RequestGroup
extension context expansion is a Da Vinci CRD proposal.

**Disposition path**

mCODE terminology and clinical-semantics review, coordinated with Da Vinci CRD.

### MOPA-MC-005 — Treatment line extension

**Problem**

Treatment line as a regimen attribute is missing from mCODE profile design. The ordering context
belongs on the patient-specific `RequestGroup`, not on the canonical `PlanDefinition`.

**Proposed solution**

Carry treatment intent and line of therapy as coded categories on the patient-specific
`RequestGroup` using the profiled `treatmentIntent` and `lineOfTherapy` slices. Both serialize as
Da Vinci CRD `ext-request-category` values, while the open `category 0..* MS` slice permits other
categories. CRD 2.2.1 needs the proposed RequestGroup context expansion.

**Examples**

Treatment line is captured on patient-specific RequestGroup examples:

- [PHD Regimen Order](RequestGroup-PHDRegimenOrder.html) — patient-specific first-line instance

**Target destination**

Da Vinci CRD Request Category extension context expansion; mCODE retains the oncology semantics
and terminology bindings supplied by the two constraint profiles.

**Disposition path**

Da Vinci CRD extension-context proposal plus mCODE sequencing-semantics discussion with guideline
authorities.

### MOPA-MC-006 — Disease context placement

**Problem**

Disease context must remain distinct from order categories and must not introduce a duplicate
regimen extension.

**Proposed solution**

Use `PlanDefinition.subject[x]` to declare the protocol's target cancer population. Use
`RequestGroup.subject` to identify the patient and query the relevant `Condition` through CRD
FHIR access for patient-specific disease context. Do not define a regimen disease-context extension.

**Examples**

Disease context examples across the protocol and patient context:

- [TH Regimen Definition](PlanDefinition-RegimenTH.html) — target breast cancer population
- [PHD Regimen Definition](PlanDefinition-RegimenPHD.html) — target HER2+ metastatic breast cancer population

**Target destination**

PlanDefinition and RequestGroup/Condition implementation guidance; no new mCODE extension.

**Disposition path**

mCODE context-modeling review for oncology domain.

### MOPA-MC-007 — Oncology PA data categories pattern

**Problem**

mCODE has no standard pattern for declaring which specific observations and conditions are
required for a given cancer type's prior authorization evaluation. Implementers building
oncology CRD services have no mCODE-grounded way to enumerate the clinical data categories
(staging, biomarkers, line of therapy, etc.) relevant to a specific cancer PA decision.

**Proposed solution**

Add an oncology data categories pattern to mCODE — as structured canonical guidance
that declares per-cancer-type clinical data elements needed for PA evaluation. This would
give CRD service implementers a standards-grounded reference for what to query when
evaluating a given cancer type. MOPA documents the categories in this IG's
[Data Requirements](data-requirements.html) page; mCODE STU5 would formalize them.

**Examples**

- [Breast Cancer PA](breast-cancer-pa.html) — Data categories for breast cancer PA: diagnosis, staging, ER/PR/HER2, line of therapy, performance status, prior therapy
- [Data Requirements](data-requirements.html) — MOPA's current data categories table

**Target destination**

mCODE STU5 — oncology data categories pattern for PA evaluation.

**Disposition path**

mCODE clinical informatics review; coordinate with Da Vinci CRD/DTR work groups.

### MOPA-MC-008 — Biomarker normalization

**Problem**

ER/PR/HER2 biomarker results are not PA-normalized across laboratories and assays in mCODE.

**Proposed solution**

Add normalized biomarker result guidance and profiling to standardize biomarker terminology and thresholds for prior authorization.

**Examples**

Biomarker normalization context is demonstrated in the breast cancer PA examples. See:

- [TH Regimen Order](RequestGroup-THRegimenOrder.html) — HER2+ patient context with biomarker references
- [Breast Cancer PA](breast-cancer-pa.html) — Biomarker data categories for PA evaluation

**Target destination**

mCODE STU5 plus breast cancer PA guidance and biomarker normalization library.

**Disposition path**

mCODE and MOPA breast cancer work stream; this item is net-new guidance pending mCODE STU5 ballot.

### Note on RegimenDaysOfCycle

`RegimenDaysOfCycle` is not a MOPA-MC item. Its real destination is a context-expansion request
against `timing-daysOfCycle` in the HL7 FHIR Extensions pack. Track it with that destination flag
rather than as an mCODE migration candidate.

### See Also

- [Breast Cancer PA](breast-cancer-pa.html) — Detailed breast cancer prior authorization implementation
- [Da Vinci Gap Proposals](davinci-gap-proposals.html) — CRD/DTR/PAS workflow and exchange proposals
- [Use Cases and Actors](use-cases.html) — Two-layer workflow framework for oncology PA
- [Regimen Modeling](regimen-model.html) — Anti-cancer regimen as `PlanDefinition` and `RequestGroup`
- [CRD Workflow](cds-workflow.html) — How the CRD service queries the EHR for oncology context
- [Data Requirements](data-requirements.html) — Oncology data categories queried during CRD evaluation
