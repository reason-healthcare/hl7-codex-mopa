// ============================================================
// RegimenDiseaseContextExtension
// mCODE Migration Candidate — Proposed for mCODE STU5
// ============================================================

Extension: RegimenDiseaseContextExtension
Id: ocpa-regimen-disease-context
Title: "Regimen Disease Context"
Description: """Identifies the cancer type for which this anti-cancer regimen is ordered.
Carries a coded cancer type value (e.g., SNOMED CT malignant neoplasm concept)
on the patient-specific RequestGroup instance. This is an optional convenience
extension — the CDS Service resolves the cancer type from prefetch.primaryCancer
rather than this extension.

Note: The canonical PlanDefinition already declares its target cancer population
via PlanDefinition.subject[x]; this extension is not appropriate on PlanDefinition.

**mCODE Migration Candidate** — Proposed for inclusion in mCODE STU5 as an extension
on the anti-cancer regimen RequestGroup profile."""

* ^status = #draft
* ^experimental = true
* ^purpose = """mCODE Migration Candidate — proposed for mCODE STU5. This artifact is defined in the
MOPA IG as a temporary home while a formal mCODE ballot proposal is prepared. It is NOT
intended to be a permanent artifact of this IG. Canonical URLs will change at migration.
See the mCODE Gap Proposals page in this IG for the full proposal backlog."""

* ^context[0].type = #element
* ^context[0].expression = "RequestGroup"

* value[x] only CodeableConcept
