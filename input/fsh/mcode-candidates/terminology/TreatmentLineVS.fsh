// ============================================================
// TreatmentLineVS — Line of Therapy Value Set
// mCODE Migration Candidate — Proposed for mCODE STU5
// ============================================================

ValueSet: TreatmentLineVS
Id: treatment-line-vs
Title: "Treatment Line Value Set"
Description: """Codes representing the ordinal line of systemic anti-cancer therapy.
Used in LineOfTherapyObservation.valueCodeableConcept.

**mCODE Migration Candidate** — Proposed for mCODE STU5."""

* ^status = #draft
* ^experimental = true
* ^purpose = """mCODE Migration Candidate — proposed for mCODE STU5. Will bind to SNOMED CT or
successor codes once TreatmentLineCS migrates. It is NOT intended to be a permanent
artifact of this IG. See the mCODE Gap Proposals page for the full proposal backlog."""

* include codes from system $TreatmentLineCS
