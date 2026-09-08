# MOPA Gap Analysis

**Project:** MOPA — Medical Oncology Prior Authorization
**Purpose:** Identify gaps in DaVinci (CRD/DTR/PAS) and mCODE that block oncology
prior authorization, and frame each as a proposal for upstream adoption. This IG
becomes informative, anchored by the breast cancer use case.

This analysis is anchored to the actual MOPA artifacts already in the repository.
The codebase separates two artifact classes — **data-model artifacts** (tagged
"mCODE Migration Candidate" in `input/fsh/mcode-candidates/`) and
**workflow/exchange proposals** for CRD, DTR, and PAS. The generic Request Category
extension remains owned by Da Vinci CRD; MOPA proposes expanding its context to
`RequestGroup` rather than defining a local replacement.

## Proposal ID conventions

- **DaVinci:** `MOPA-DV-CRD-###`, `MOPA-DV-DTR-###`, `MOPA-DV-PAS-###`
- **mCODE:** `MOPA-MC-###`
- Each proposal: **Problem** (gap in current spec), **Proposed solution**,
  **Examples**, plus destination/repo-artifact traceability.

---

## DaVinci gap proposals (workflow / exchange)

### CRD

#### MOPA-DV-CRD-001 — Oncology coverage outcome semantics
- **Problem:** CRD coverage-information outcomes don't express oncology branch states
  (guideline-concordant vs. needs-DTR vs. PA-required vs. alternative-required) computably.
- **Proposed solution:** Define an oncology outcome classification (codes or
  coverage-information constraint) for CRD responses.
- **Examples:** "Regimen meets policy — no PA"; "Conditionally covered pending HER2
  evidence"; "Alternative regimen required."

#### MOPA-DV-CRD-002 — `RequestGroup` as the PA unit in CRD hooks
- **Problem:** Oncology authorization applies to the multi-agent regimen, but CRD has no
  standard guidance for treating `RequestGroup` as the primary order in `draftOrders` and
  `selections`.
- **Proposed solution:** Define regimen-level evaluation around a patient-specific
  `RequestGroup`; component `MedicationRequest` resources remain subordinate orders.
- **Examples:** `RequestGroup/THRegimenOrder`, `Bundle/ExampleOrderSelectBundle`, and
  `Bundle/ExampleOrderSignBundle`.

#### MOPA-DV-CRD-003 — CRD order profile and Request Category context for `RequestGroup`
- **Problem:** CRD 2.2.1 has no RequestGroup order profile, and its
  `ext-request-category` extension does not permit `RequestGroup` as context.
- **Proposed solution:** Add a CRD RequestGroup order profile and expand
  `ext-request-category` to `RequestGroup`, with a repeatable `category 0..* MS` slice.
  Treatment intent and line of therapy are representative oncology category values.
- **Examples:** All MOPA RequestGroup examples carry the same CRD extension URL once per
  category; no local intent, treatment-line, or category extension is defined.

#### MOPA-DV-CRD-004 — `order-select` informational approvability semantics
- **Problem:** Returning a final-looking coverage determination before an order is signed
  can mislead users.
- **Proposed solution:** Treat `order-select` as advisory and `order-sign` as the final
  determination, while using the same regimen identity and patient categories at both stages.
- **Examples:** RequestGroup-only draft orders at selection; RequestGroup plus component
  requests at signing.

#### MOPA-DV-CRD-005 — Partial regimen replacement suggestions
- **Problem:** A payer may require one component substitution, such as a biosimilar, without
  replacing the whole regimen.
- **Proposed solution:** Clarify Propose Alternate Request actions for component resources
  referenced by a RequestGroup. Delete actions target only resources present in
  `draftOrders`; create-only suggestions are valid when order-select carries the group alone.
- **Examples:** Pegfilgrastim to pegfilgrastim-cbqv in the ddAC→T regimen.

### DTR

#### MOPA-DV-DTR-001 — `RequestGroup` as the order subject in DTR
- **Problem:** DTR guidance does not define how a regimen-level RequestGroup anchors
  questionnaire selection, prepopulation, and the completed response.
- **Proposed solution:** Use the selected RequestGroup and its `instantiatesCanonical`
  PlanDefinition as the order subject while keeping one shared data-requirements Library
  across CRD and DTR.
- **Examples:** A TH RequestGroup launches the HER2 documentation module; the resulting
  QuestionnaireResponse remains associated with that regimen order.

#### MOPA-DV-DTR-002 — Structured exception / contraindication capture
- **Problem:** Medical-necessity exceptions arrive as free text / attachments.
- **Proposed solution:** Standard DTR structured answer patterns for
  intolerance/contraindication aligned to PA adjudication.
- **Examples:** "Prior intolerance to agent X + supporting Observation"; structured
  contraindication reason.

### PAS

#### MOPA-DV-PAS-001 — Regimen-level structured submission
- **Problem:** PAS Claim `supportingInfo` can carry resources, but regimen
  identity/linkage isn't first-class in adjudication.
- **Proposed solution:** PAS guidance/profile to reference the regimen RequestGroup +
  canonical PlanDefinition and adjudicate at regimen scope with item detail.
- **Examples:** `Claim.supportingInfo` → RequestGroup instance + DTR
  QuestionnaireResponse.

#### MOPA-DV-PAS-002 — Oncology pend / additional-info taxonomy
- **Problem:** PEND and additional-info reasons are operationally variable; not granular
  for oncology work queues.
- **Proposed solution:** Constrained oncology reason taxonomy.
- **Examples:** "Need biomarker result"; "Need prior-therapy failure evidence"; "Need
  stage clarification."

#### MOPA-DV-PAS-003 — Regimen-change update semantics
- **Problem:** Dose/schedule/component substitutions are common; PAS update/continuity
  semantics are inconsistent.
- **Proposed solution:** Explicit PAS update guidance preserving auth trace across
  regimen changes.
- **Examples:** Component substitution retains authorization; cycle-timing change
  doesn't force restart unless policy-critical.

---

## mCODE gap proposals (data model)

Each below already exists in the repo under `input/fsh/mcode-candidates/` tagged
**mCODE Migration Candidate (STU5)**.

| ID | Problem (mCODE gap) | Proposed solution | Repo artifact |
|---|---|---|---|
| **MOPA-MC-001** | No first-class computable regimen *definition* | Add regimen PlanDefinition profile | `AntiCancerRegimenPlanDefinition` |
| **MOPA-MC-002** | No patient-specific regimen *instance* | Add regimen RequestGroup profile | `AntiCancerRegimenRequestGroup` |
| **MOPA-MC-003** | Line-of-therapy semantics not standardized for sequencing/PA | Profile the CRD Request Category for line of therapy and bind it to the treatment-line value set | `LineOfTherapyRequestCategory`, `TreatmentLineCS/VS` |
| **MOPA-MC-004** | Treatment-intent coding guidance needed | Define oncology terminology guidance for CRD request categories | `RegimenIntentVS` |
| **MOPA-MC-005** | Order-level treatment line needs CRD support | Reuse `ext-request-category`; propose RequestGroup context expansion | Da Vinci CRD proposal |
| **MOPA-MC-006** | Disease context placement needs clarity | Use PlanDefinition.subject plus RequestGroup.subject and queried Condition | No extension artifact |
| **MOPA-MC-007** | No oncology PA data-requirements packaging | Add oncology data-requirements Library pattern | `OncologyDataRequirementsLibrary` |
| **MOPA-MC-008** | Biomarker results not PA-normalized (ER/PR/HER2) | Add normalized biomarker result guidance/profiling | (net-new — see `breast-cancer-pa.md`) |

### Edge cases / notes

- **Biomarker normalization (MOPA-MC-008)** has no artifact yet — net-new work.
- **`RegimenDaysOfCycle`** lives in `mcode-candidates` but its real destination is a
  **context-expansion request against `timing-daysOfCycle` in the HL7 FHIR Extensions
  pack**, not mCODE. Track it on the mCODE page with an explicit "destination: FHIR
  Extensions pack" flag rather than a `MOPA-MC` ID, to avoid mislabeling.

---

## Source basis

- DaVinci CRD 2.2.1 (hooks, deviations, cards, conformance)
- DaVinci DTR 2.2.0 (specification, questionnaire-package / next-question operations)
- DaVinci PAS 2.2.1 (use cases, Claim $submit specification, artifacts)
- mCODE STU4 (treatment group, profiles/extensions/value sets)
- Repo MOPA artifacts: `input/fsh/mcode-candidates/`, `input/pagecontent/`
