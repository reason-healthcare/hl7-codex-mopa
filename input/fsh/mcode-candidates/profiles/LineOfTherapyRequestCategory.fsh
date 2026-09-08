// ============================================================
// LineOfTherapyRequestCategory
// Constraint profile on Da Vinci CRD Request Category
// mCODE Migration Candidate — Proposed for mCODE STU5
// ============================================================

Profile: LineOfTherapyRequestCategory
Parent: $RequestCategory
Id: line-of-therapy-request-category
Title: "Line of Therapy Request Category"
Description: """Constrains the Da Vinci CRD Request Category extension for a
patient-specific anti-cancer regimen line-of-therapy category. The instance extension URL
remains `http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category`; this
profile adds oncology terminology semantics only. Its use on RequestGroup requires the proposed
CRD RequestGroup extension-context expansion.

**mCODE Migration Candidate** — This constraint profile and its terminology semantics are
proposed for inclusion in mCODE STU5; the underlying extension remains owned by Da Vinci CRD."""

* ^status = #draft
* ^experimental = true
* ^purpose = """mCODE Migration Candidate — proposed for mCODE STU5. This artifact defines
oncology line-of-therapy semantics for the CRD Request Category without introducing a second
extension URL. It is NOT intended to be a permanent artifact of this IG. Canonical URLs will
change at migration."""
* ^extension[$StdStatus].valueCode = #draft
* ^extension[$FMM].valueInteger = 0
* ^context[+].type = #element
* ^context[=].expression = "RequestGroup"
* value[x] 1..1 MS
* value[x] only CodeableConcept
* valueCodeableConcept.coding 1..*
* valueCodeableConcept.coding.system = $TreatmentLineCS
* valueCodeableConcept from TreatmentLineVS (required)
* valueCodeableConcept ^short = "Line of therapy for this patient-specific regimen order; coding system is TreatmentLineCS"
