// ============================================================
// RegimenIntentExtension
// mCODE Migration Candidate — Proposed for mCODE STU5
// ============================================================

Extension: RegimenIntentExtension
Id: ocpa-regimen-intent
Title: "Regimen Intent"
Description: """The clinical intent of the anti-cancer regimen (e.g., curative,
palliative, adjuvant, neoadjuvant, supportive). Applied on the patient-specific
ordered instance (RequestGroup) only — intent is a clinical decision made at the
time of ordering for a specific patient and is not a property of the canonical
protocol definition.

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
* valueCodeableConcept from RegimenIntentVS (extensible)
