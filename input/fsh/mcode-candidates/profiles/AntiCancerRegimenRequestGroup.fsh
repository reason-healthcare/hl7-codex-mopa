// ============================================================
// AntiCancerRegimenRequestGroup
// mCODE Migration Candidate — Proposed for mCODE STU5
// ============================================================

Profile: AntiCancerRegimenRequestGroup
Parent: RequestGroup
Id: anticancer-regimen-requestgroup
Title: "Anti-Cancer Regimen RequestGroup"
Description: """A patient-specific ordered anti-cancer therapy regimen instance.
This resource is included in the CDS Hooks draftOrders Bundle and referenced in
context.selections at order-select and order-sign.

**CDS Hooks Context.** This profile is designed for use in the Da Vinci CRD workflow.
The `RequestGroup` is the primary prior-authorization subject — the unit of evaluation
for coverage policy — not the individual `MedicationRequest` components within it.

**Two-Stage Hook Pattern.** The MOPA workflow uses `order-select` and `order-sign`
as distinct stages:

- **`order-select`** (informational): The `RequestGroup` is present in `context.draftOrders`
  but component `MedicationRequest` resources may not yet be finalised. The CRD service
  returns informational cards indicating approvability. This is advisory — the order is
  not yet committed.
- **`order-sign`** (final determination): The `RequestGroup` is accompanied by finalised
  component `MedicationRequest` resources. The CRD service returns the final coverage
  determination (Authorization Satisfied, PA required, or DTR required).

**CRD Order Profile Proposal.** This profile serves as the domain-specific layer for
oncology regimens. A complementary CRD order profile for `RequestGroup` is proposed
(MOPA-DV-CRD-003) to formalize `RequestGroup` as a standard order type in the Da Vinci
CRD IG, analogous to existing CRD profiles for `MedicationRequest` and `ServiceRequest`.

RequestGroup.instantiatesCanonical SHALL be populated with the canonical URL of the
AntiCancerRegimenPlanDefinition when the canonical regimen definition is known.

Two scheduling patterns are supported in regimen actions:

1. **Cycle-day timing** — Each action (or action.action for phased regimens) uses the
   local extension `http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle`
   on action.timingTiming to declare which days of the cycle the drug is administered.
   The action.timingTiming.repeat carries the machine-computable cycle period.

2. **Sequential phase ordering** — For multi-phase regimens (e.g., AC→T),
   top-level action groups represent phases and action.relatedAction with
   relationship = after-end declares that the second phase begins after the first.

**mCODE Migration Candidate** — This profile is proposed for inclusion in mCODE STU5.
It is the MVP artifact for oncology prior authorization: the selected clinical unit
passed to the CRD service."""

* ^status = #draft
* ^experimental = true
* ^purpose = """mCODE Migration Candidate — proposed for mCODE STU5. This artifact is defined in the
MOPA IG as a temporary home while a formal mCODE ballot proposal is prepared. It is NOT
intended to be a permanent artifact of this IG. Canonical URLs will change at migration.
See the mCODE Gap Proposals page in this IG for the full proposal backlog."""
* ^extension[$StdStatus].valueCode = #draft
* ^extension[$FMM].valueInteger = 0

// Required workflow elements
* status MS
* intent 1..1 MS
* intent = $RQ-INTENT#order "Order"

// Patient (oncology context — reference mCODE Cancer Patient when available)
* subject 1..1 MS
* subject only Reference($USCorePatient or $mCODECancerPatient)

// Canonical regimen definition — the key link to AntiCancerRegimenPlanDefinition
* instantiatesCanonical MS
* instantiatesCanonical ^short = "Canonical URL of the AntiCancerRegimenPlanDefinition this instance instantiates"
* instantiatesCanonical ^definition = """When the canonical regimen definition is known, this SHALL reference an
AntiCancerRegimenPlanDefinition. The CRD Service SHOULD use this reference to identify
the regimen and locate the associated data requirements Library.

At order-select this field helps the CRD service identify the regimen protocol for
approvability evaluation. At order-sign it supports the final coverage determination."""

// Patient-specific ordering context extensions
// regimenIntent: why THIS patient is receiving this regimen (ordering decision, not protocol property)
// regimenDiseaseContext: optional convenience — CDS Service reads cancer type from prefetch.primaryCancer
* extension contains
    RegimenIntentExtension named regimenIntent 0..1 MS

// Action constraints
* action MS
* action.id 1..1
* action.id ^short = "Action identifier — required for relatedAction cross-referencing in sequential regimens"
* action.title 1..1 MS
* action.title ^short = "Drug name or phase label"

* action.timingTiming MS
* action.timingTiming ^short = "Cycle period. Use regimen-days-of-cycle extension on this element for cycle-day scheduling."

* action.relatedAction MS
* action.relatedAction.actionId 1..1
* action.relatedAction.relationship 1..1
* action.relatedAction.relationship ^short = "Use 'after-end' for sequential phase ordering"

* action.resource MS
* action.resource ^short = "Reference to draft MedicationRequest for this component. Present at order-sign; MAY be absent at order-select."

// Nested actions for phased regimens
* action.action MS
* action.action.id 1..1
* action.action.title 1..1 MS
* action.action.timingTiming MS
* action.action.resource MS
