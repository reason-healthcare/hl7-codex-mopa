# Specification Notes

Issues, ambiguities, and gaps discovered while building and exercising this
reference implementation. Each entry describes the observed problem, the
workaround applied here, and a proposed change to the specification.

---

## SN-001 — CRD `order-select` vs `order-sign` response semantics are underspecified

**Discovered during:** Phase 7 (PAS Service integration)

**Status: ✅ Applied to IG — 2026-05-27**

> IG changes applied:
> - Added **"Hook Lifecycle: `order-select` and `order-sign`"** section to `cds-hooks-extension.md`
>   defining the communicative intent of each hook, the SHALL-NOT-imply-final-determination rule
>   for `order-select`, and the `determiningCriteria` extension proposal with `pre-screen` / `final`
>   values.
> - Updated the **Discovery conformance requirements** table to reference the hook lifecycle guidance.

**Observed problem:**
The Da Vinci CRD specification defines both `order-select` and `order-sign` hooks
but does not clearly distinguish what each hook's response should communicate when
coverage criteria are met. In this implementation we initially returned a
"Regimen pre-approved — No prior authorization is needed at this time" card on
`order-select`, then immediately returned a "Prior authorization required" card on
`order-sign`. The two cards directly contradict each other from the clinician's
perspective.

**Workaround applied:**
`order-select` now returns a **"Coverage criteria met"** card whose detail text
explicitly states that prior authorization will still be required at signing:
*"Prior authorization will be required before this order can be fulfilled — sign the
order to submit."*
`order-sign` returns a **"Prior authorization required"** card with a submit action.

**Proposed specification change:**
The CRD IG should define the intended lifecycle across hooks and make the
relationship between `order-select` and `order-sign` responses explicit:

- `order-select` — intent: coverage pre-screening. The response should communicate
  the coverage status and set expectations (e.g. PA will be required, or no PA
  needed). It should **not** use language that implies final determination.
- `order-sign` — intent: finalization. The response should direct the next action
  (submit PA, or confirm no action required).

The `coverage-information` topic code should carry a `determiningCriteria` extension
or equivalent to distinguish pre-screen results from final results, so EHRs can
render them appropriately without relying on summary string parsing.

---

---

## SN-002 — Da Vinci CRD discovery has no mechanism for condition-specific data requirements

**Discovered during:** Multi-condition architecture design

**Status: ✅ Applied to IG — 2026-05-27**

> IG changes applied:
> - Replaced the Layer 2 discovery extension shape from `dataRequirementsLibraries[{canonical, cancerType}]`
>   to `conditionDataRequirements[{condition, libraryUrl, prefetchTemplates}]` in `cds-hooks-extension.md`.
> - Updated **Layer 1** baseline `prefetch` to publish only `patient` and `conditions` (condition-agnostic);
>   moved full condition-specific templates to `conditionDataRequirements.prefetchTemplates`.
> - Added **"Two-Tier EHR Fallback Behavior"** table documenting MOPA-aware vs standard EHR paths.
> - Added `catalogLibrary` field to the discovery extension, pointing to `OncologyCRDCatalog`
>   with `relatedArtifact` composition pattern for catalog Libraries.
> - Updated the **Relationship between discovery layers** diagram to reflect the new structure.
> - Updated the **Discovery conformance requirements** table.

**Observed problem:**
The Da Vinci CRD specification defines a `GET /cds-services` discovery endpoint that
returns static prefetch templates on the service descriptor. These templates are
evaluated before the hook fires — the EHR pre-fetches data using them and includes
the results in the hook request. This works for payer policies that apply uniformly
to a drug regardless of indication (e.g., "always fetch the formulary status").

It breaks for specialty care — oncology, rheumatology, rare disease — where the
relevant clinical data depends entirely on the patient's condition:

- Breast cancer: HER2, cancer stage, ECOG performance status
- Lung cancer: EGFR mutation, ALK fusion, PD-L1 expression
- Multiple myeloma: FISH cytogenetics, protein electrophoresis, bone marrow biopsy

You cannot enumerate all possible biomarkers in the static discovery prefetch without
fetching irrelevant data for every patient on every order. The routing of "which data
to fetch" belongs in the CRD, not the EHR.

**Workaround applied:**
A two-level prefetch architecture:

1. **Baseline prefetch** (in the standard `prefetch` field): condition-agnostic.
   Contains only `patient` and `conditions` (problem list) — enough to identify
   the relevant cancer type without any disease-specific knowledge.

2. **Condition-specific prefetch** (in the MOPA `mopa-service-extension`): a new
   `conditionDataRequirements` array, one entry per supported condition, each with:
   - `condition` — FHIR Coding identifying the cancer type
   - `libraryUrl` — canonical URL of the condition-specific payer policy Library
   - `prefetchTemplates` — CDS Hooks template strings for this condition

MOPA-aware EHRs read `conditionDataRequirements` at startup and cache a
condition → templates map. When the patient's condition matches an entry, the EHR
adds those templates to the hook call. This eliminates a CRD callback round-trip
for aware EHRs.

For standard (non-MOPA) EHRs, the CRD falls back to fetching condition-specific
data directly from `request.fhirServer` after identifying the condition from the
minimal baseline prefetch. Correct behaviour is guaranteed for all EHRs regardless
of whether they implement the extension.

A condition registry (`condition-registry.ts`) maps condition codes to their
Library, prefetch templates, and evaluator function. Adding a new cancer type
requires a single registry entry — the discovery document, hook handler, and
content viewer all derive from it.

**Proposed specification change:**
The Da Vinci CRD IG should:

1. Define a `conditionDataRequirements` extension on `CdsService` (or a first-class
   field) that expresses condition-indexed data requirements alongside the baseline
   prefetch templates.

2. Define the two-tier EHR behaviour: MOPA-aware EHRs use `conditionDataRequirements`
   for proactive prefetch; standard EHRs trigger CRD fhirServer fallback. Both must
   yield identical CRD responses.

3. Clarify that `mopa-service-extension.libraryUrl` on a multi-condition service
   should reference a **catalog Library** (`OncologyCRDCatalog`) rather than a
   condition-specific Library, and define the `relatedArtifact` composition pattern
   for catalog Libraries.

4. Consider whether `conditionDataRequirements` belongs in the CDS Hooks spec itself
   (as a general pattern applicable beyond oncology) or remains an MOPA-specific
   extension. The same problem exists in cardiology (HFrEF vs HFpEF data requirements
   differ), rheumatology, and rare disease.

**Reference implementation:**
- `apps/crd-service/src/constants.ts` — shared constants (no circular dependency)
- `apps/crd-service/src/condition-registry.ts` — condition → Library/templates map
- `apps/crd-service/src/crd-logic.ts` — baseline prefetch, discovery builder, handler
- `apps/ehr/app/patients/[id]/orders/OrderEntryClient.tsx` — MOPA-aware EHR path

---

## SN-003 — Primary cancer condition is a missing data element in CRD evaluation

**Discovered during:** Multi-condition architecture review

**Status: ✅ Applied to IG — 2026-05-27**

> IG changes applied:
> - **New FSH extension** `DataRequirementLabel` (`input/fsh/mcode-candidates/extensions/DataRequirementLabel.fsh`):
>   a `string` extension on `DataRequirement` carrying a human-readable label for the entry.
> - **Invariant `ocpa-dr-1`** added to `OncologyDataRequirementsLibrary` profile:
>   `dataRequirement.first().type = 'Condition'` (error severity) enforces the primary cancer
>   condition as the first entry.
> - **Extension slice** `DataRequirementLabel named label 0..1 MS` added to
>   `dataRequirement.extension` in the profile; ordering rule documented in the profile description.
> - **`BreastCancerPADataRequirements` example** updated: first `dataRequirement` now carries
>   `data-requirement-label` = `"Breast Cancer Diagnosis"`; all other entries carry descriptive labels.
> - **`data-requirements.md`** updated with a dedicated **"Ordering Rule: Primary Cancer Condition
>   First (SN-003)"** section explaining the invariant, the clinical rationale, and the label
>   convention with a JSON example.
> - **`breast-cancer-pa.md`** Diagnosis row updated to note the ordering and label requirements.
> - **`aliases.fsh`** updated with `$DRLabel` alias.

**Observed problem:**
The initial reference implementation evaluated HER2 status, cancer stage, and ECOG
performance status for prior authorization — but never verified that the patient had
an active primary breast cancer diagnosis. The guideline and payer policy CQL
implicitly assumed a breast cancer context without making it an explicit data
requirement. A patient with HER2-positive HER carcinoid tumour could theoretically
receive a PA approval for TH.

**Workaround applied:**
Added `"Breast Cancer Diagnosis Present"` as an explicit CQL expression and data
requirement in both `BreastCancerPayerPolicy.cql` and `BreastCancerGuideline.cql`.
SNOMED 372137005 (Primary malignant neoplasm of breast) is the anchor code.
The guideline now gates all three regimen definitions on `Has Active Breast Cancer`.
The payer policy includes `Breast Cancer Diagnosis Present` in `All Data Present`.

The condition is fetched via the `conditions` baseline prefetch key
(`Condition?patient=...&category=problem-list-item`) which is present in all hook
calls regardless of EHR type. No new prefetch key is needed.

**Proposed specification change:**
The MOPA IG should explicitly require that the primary cancer condition be declared
as the first `dataRequirement` in every condition-specific Library, ordered before
biomarker observations, to make the diagnostic prerequisite visible to consumers of
the Library resource. The condition `dataRequirement` entry should carry a
`data-requirement-label` extension value of the canonical condition name (e.g.,
"Breast Cancer Diagnosis") for display in tools such as the DTR questionnaire
generator and the CRD content viewer.
