// ============================================================
// DataRequirementLabel Extension
// mCODE Migration Candidate — Proposed for mCODE STU5
// ============================================================

Extension: DataRequirementLabel
Id: data-requirement-label
Title: "Data Requirement Label"
Description: """A human-readable label that identifies a DataRequirement entry within an
OncologyDataRequirementsLibrary. Used by tools such as DTR questionnaire generators and CRD
content viewers to display requirement names without parsing profile URLs.

The first DataRequirement entry in every condition-specific Library (the primary cancer
condition) SHALL carry a label of the canonical form '[Cancer Type] Diagnosis'
(e.g., 'Breast Cancer Diagnosis') to make the diagnostic prerequisite explicit and
machine-discoverable.

**mCODE Migration Candidate** — Proposed for inclusion in mCODE STU5."""

* ^status = #draft
* ^experimental = true
* ^purpose = """mCODE Migration Candidate — proposed for mCODE STU5. This artifact is defined in the
OGCA IG as a temporary home while a formal mCODE ballot proposal is prepared. It is NOT
intended to be a permanent artifact of this IG. Canonical URLs will change at migration.
See the mCODE Candidates page in this IG for the full migration plan."""
* ^extension[$StdStatus].valueCode = #draft
* ^extension[$FMM].valueInteger = 0

* ^context[0].type = #element
* ^context[0].expression = "DataRequirement"

* value[x] only string
* valueString ^short = "Human-readable label for this data requirement entry"
* valueString ^definition = """A short, human-readable name for this data requirement entry
(e.g., 'Breast Cancer Diagnosis', 'HER2 Status', 'ECOG Performance Status').
The first DataRequirement in each condition-specific Library SHALL use the form
'[Cancer Type] Diagnosis' (e.g., 'Breast Cancer Diagnosis')."""
