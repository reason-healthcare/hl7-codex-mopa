// ============================================================
// TreatmentLineCS — Line of Therapy Code System
// mCODE Migration Candidate — Proposed for mCODE STU5
//
// SNOMED CT has procedure-level codes for first-line (708255002) and
// second-line (708256001) treatment, but no clean ordinal qualifier-value
// codes suitable for an order-level regimen category.
// This code system fills that gap.
// ============================================================

CodeSystem: TreatmentLineCS
Id: treatment-line-cs
Title: "Treatment Line Code System"
Description: """Ordinal codes representing the line of systemic anti-cancer therapy.
These codes are used in TreatmentLineVS and in the LineOfTherapyRequestCategory constraint
profile for the RequestGroup `lineOfTherapy` category slice.

**mCODE Migration Candidate** — These codes are proposed for adoption in mCODE STU5
or as a SNOMED CT extension request. Once standard codes are available, this code
system should be deprecated."""

* ^status = #draft
* ^experimental = true
* ^purpose = """mCODE Migration Candidate — proposed for adoption in mCODE STU5 or as a SNOMED CT
extension request. Once standard codes are available this code system will be deprecated.
It is NOT intended to be a permanent artifact of this IG. See the mCODE Gap Proposals page
for the migration plan."""
* ^caseSensitive = true
* ^content = #complete

* #1L          "First-line"          "The first line of systemic anti-cancer therapy for this indication."
* #2L          "Second-line"         "The second line of systemic anti-cancer therapy; administered after first-line therapy failure, progression, or intolerance."
* #3L-plus     "Third-line or later" "The third or any subsequent line of systemic anti-cancer therapy."
* #maintenance "Maintenance"         "Maintenance therapy administered to prolong response after induction or consolidation treatment."
