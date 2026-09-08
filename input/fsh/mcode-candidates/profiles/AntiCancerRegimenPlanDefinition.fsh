// ============================================================
// AntiCancerRegimenPlanDefinition
// mCODE Migration Candidate — Proposed for mCODE STU5
// ============================================================

Profile: AntiCancerRegimenPlanDefinition
Parent: PlanDefinition
Id: anticancer-regimen-plandefinition
Title: "Anti-Cancer Regimen PlanDefinition"
Description: """A canonical, reusable anti-cancer therapy regimen definition represented
as a FHIR PlanDefinition order set. This resource is NOT patient-specific; it is
referenced by AntiCancerRegimenRequestGroup instances via RequestGroup.instantiatesCanonical.

A regimen definition describes the protocol — component drugs, timing, cycle structure,
and sequential phase ordering. Treatment intent and line of therapy are patient-specific
ordering categories and are carried on the RequestGroup via the category extension; this
canonical definition does not carry those attributes.

**mCODE Migration Candidate** — This profile is proposed for inclusion in mCODE STU5.
It addresses the gap documented in the mCODE gap analysis: mCODE does not currently
represent anti-cancer regimens as first-class, computable entities."""

* ^status = #draft
* ^experimental = true
* ^purpose = """mCODE Migration Candidate — proposed for mCODE STU5. This artifact is defined in the
MOPA IG as a temporary home while a formal mCODE ballot proposal is prepared. It is NOT
intended to be a permanent artifact of this IG. Canonical URLs will change at migration.
See the mCODE Gap Proposals page in this IG for the full proposal backlog."""
* ^extension[$StdStatus].valueCode = #draft
* ^extension[$FMM].valueInteger = 0

// Regimen type is always order-set
* type 1..1 MS
* type = $PD-TYPE#order-set "Order Set"

// Cancer type for which this regimen is defined
* subject[x] 1..1 MS
* subject[x] only CodeableConcept
* subjectCodeableConcept ^short = "Cancer type for which this regimen is designed (e.g., SNOMED CT malignant neoplasm code)"

// Version is important for canonical references
* version MS
* name MS
* title 1..1 MS
* description MS

// Patient-specific ordering context is carried on the RequestGroup via the category
// extension. PlanDefinition.subject[x] declares the target cancer population.

// At least one action (drug or phase)
* action 1..* MS
* action.title 1..1 MS
* action.title ^short = "Drug name or phase name (e.g., 'Paclitaxel', 'AC Phase')"
* action.description MS
* action.timingTiming MS
* action.timingTiming ^short = "Cycle period (e.g., every 7 days, every 21 days)"

// Nested actions for multi-drug phases
* action.action MS
* action.action.title 1..1 MS
* action.action.timingTiming MS
* action.action.definitionCanonical MS
* action.action.definitionCanonical ^short = "ActivityDefinition defining the component drug"

// Sequential phase ordering using relatedAction
* action.relatedAction MS
* action.relatedAction.actionId 1..1
* action.relatedAction.relationship 1..1
* action.relatedAction.relationship ^short = "Use 'after-end' for sequential phase ordering (e.g., AC phase → T phase)"

// Component drug reference (for flat regimens)
* action.definitionCanonical MS
