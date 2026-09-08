// ============================================================
// OcpaCodesCS — Local MOPA Code System
// Codes that do not yet exist in an external standard system.
// Each code is a migration candidate for LOINC, SNOMED CT, or mCODE.
// ============================================================

CodeSystem: OcpaCodesCS
Id: ocpa-codes
Title: "MOPA Local Code System"
Description: """Local codes defined by the MOPA IG for concepts that do not yet have
an established representation in LOINC, SNOMED CT, or mCODE. These codes are migration
candidates and should be retired in favor of standard codes as they become available."""

* ^status = #draft
* ^experimental = true
* ^purpose = """mCODE Migration Candidate — individual codes submitted to LOINC and SNOMED CT.
This code system will be retired once standard codes are assigned. It is NOT intended to
be a permanent artifact of this IG. See the mCODE Gap Proposals page for the full proposal backlog."""
* ^caseSensitive = true
* ^content = #complete

// ---- Regimen component role codes ----
* #anti-cancer
    "Anti-Cancer Component"
    "A regimen component that is an anti-cancer therapeutic agent (e.g., cytotoxic, targeted, immunotherapy)."
* #supportive
    "Supportive Care Component"
    "A regimen component that is supportive (e.g., antiemetic, growth factor, steroid not used as anti-cancer therapy)."
* #premedication
    "Premedication Component"
    "A regimen component administered as premedication prior to the primary agent."
