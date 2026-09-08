// ============================================================
// AntiCancerRegimenRequestGroup-examples.fsh
// 3 patient-specific ordered regimen instances mirroring the PD examples:
//   A — TH (Jane Smith, adjuvant, order-select)
//   B — ddAC→T (Jane Smith, adjuvant, sequential phases)
//   C — PHD (Jane Smith, first-line metastatic, order-select)
//
// All three RequestGroup instances demonstrate the local regimen-days-of-cycle
// extension ($DaysOfCycle) on action.timingTiming:
//   TH  — days 1, 8, 15 of a 21-day cycle (multi-day pattern)
//   ddAC→T — day 1 of each 14-day cycle (per-phase)
//   PHD — day 1 of each 21-day cycle
//
// Also includes companion draft MedicationRequest instances referenced
// from RequestGroup.action.resource (available at order-sign).
// RxNorm codes verified via NLM RxNav API 2026-05-04:
//   paclitaxel=56946, trastuzumab=224905, doxorubicin=3639,
//   cyclophosphamide=3002, pegfilgrastim=338036, pertuzumab=1298944, docetaxel=72962
// ============================================================

// ─── Companion MedicationRequests (draft, for action.resource refs) ──────────

Instance: PaclitaxelMedRequestTH
InstanceOf: http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-request
Usage: #example
Title: "Example: Paclitaxel MedicationRequest (TH regimen, draft)"
Description: "Draft MedicationRequest for paclitaxel 80 mg/m² IV weekly in TH regimen."
* status  = #draft
* intent  = #order
* subject = Reference(MOPAPatientExample)
* requester = Reference(MOPAOncologistExample)
* reasonReference = Reference(MOPABreastCancerConditionExample)
* medicationCodeableConcept = $RxNorm#56946 "paclitaxel"
* dosageInstruction[+].text = "80 mg/m² IV over 1 hour, weekly"

Instance: TrastuzumabMedRequestTH
InstanceOf: http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-request
Usage: #example
Title: "Example: Trastuzumab MedicationRequest (TH regimen, draft)"
Description: "Draft MedicationRequest for trastuzumab IV weekly in TH regimen."
* status  = #draft
* intent  = #order
* subject = Reference(MOPAPatientExample)
* requester = Reference(MOPAOncologistExample)
* reasonReference = Reference(MOPABreastCancerConditionExample)
* medicationCodeableConcept = $RxNorm#224905 "trastuzumab"
* dosageInstruction[+].text = "4 mg/kg IV loading dose week 1, then 2 mg/kg IV weekly"

Instance: DoxorubicinMedRequestDDACT
InstanceOf: http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-request
Usage: #example
Title: "Example: Doxorubicin MedicationRequest (ddAC→T regimen, draft)"
Description: "Draft MedicationRequest for doxorubicin 60 mg/m² IV in ddAC phase."
* status  = #draft
* intent  = #order
* subject = Reference(MOPAPatientExample)
* requester = Reference(MOPAOncologistExample)
* reasonReference = Reference(MOPABreastCancerConditionExample)
* medicationCodeableConcept = $RxNorm#3639 "doxorubicin"
* dosageInstruction[+].text = "60 mg/m² IV day 1 of each 14-day cycle"

Instance: CyclophosphamideMedRequestDDACT
InstanceOf: http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-request
Usage: #example
Title: "Example: Cyclophosphamide MedicationRequest (ddAC→T regimen, draft)"
Description: "Draft MedicationRequest for cyclophosphamide 600 mg/m² IV in ddAC phase."
* status  = #draft
* intent  = #order
* subject = Reference(MOPAPatientExample)
* requester = Reference(MOPAOncologistExample)
* reasonReference = Reference(MOPABreastCancerConditionExample)
* medicationCodeableConcept = $RxNorm#3002 "cyclophosphamide"
* dosageInstruction[+].text = "600 mg/m² IV day 1 of each 14-day cycle"

Instance: PegfilgrastimMedRequestDDACT
InstanceOf: http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-request
Usage: #example
Title: "Example: Pegfilgrastim MedicationRequest (ddAC→T regimen, draft)"
Description: "Draft MedicationRequest for pegfilgrastim 6 mg subcutaneous on day 2 of each ddAC cycle."
* status  = #draft
* intent  = #order
* subject = Reference(MOPAPatientExample)
* requester = Reference(MOPAOncologistExample)
* reasonReference = Reference(MOPABreastCancerConditionExample)
* medicationCodeableConcept = $RxNorm#338036 "pegfilgrastim"
* dosageInstruction[+].text = "6 mg subcutaneous day 2 of each 14-day cycle"

Instance: PaclitaxelMedRequestTPHase
InstanceOf: http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-request
Usage: #example
Title: "Example: Paclitaxel MedicationRequest (T phase, ddAC→T regimen, draft)"
Description: "Draft MedicationRequest for paclitaxel 175 mg/m² IV q14d in T phase."
* status  = #draft
* intent  = #order
* subject = Reference(MOPAPatientExample)
* requester = Reference(MOPAOncologistExample)
* reasonReference = Reference(MOPABreastCancerConditionExample)
* medicationCodeableConcept = $RxNorm#56946 "paclitaxel"
* dosageInstruction[+].text = "175 mg/m² IV over 3 hours, day 1 of each 14-day cycle"

Instance: PertuzumabMedRequestPHD
InstanceOf: http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-request
Usage: #example
Title: "Example: Pertuzumab MedicationRequest (PHD regimen, draft)"
Description: "Draft MedicationRequest for pertuzumab IV q21d in PHD regimen."
* status  = #draft
* intent  = #order
* subject = Reference(MOPAPatientExample)
* requester = Reference(MOPAOncologistExample)
* reasonReference = Reference(MOPAMetastaticBreastCancerConditionExample)
* medicationCodeableConcept = $RxNorm#1298944 "pertuzumab"
* dosageInstruction[+].text = "840 mg IV cycle 1, then 420 mg IV q21d"

Instance: TrastuzumabMedRequestPHD
InstanceOf: http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-request
Usage: #example
Title: "Example: Trastuzumab MedicationRequest (PHD regimen, draft)"
Description: "Draft MedicationRequest for trastuzumab IV q21d in PHD regimen."
* status  = #draft
* intent  = #order
* subject = Reference(MOPAPatientExample)
* requester = Reference(MOPAOncologistExample)
* reasonReference = Reference(MOPAMetastaticBreastCancerConditionExample)
* medicationCodeableConcept = $RxNorm#224905 "trastuzumab"
* dosageInstruction[+].text = "8 mg/kg IV cycle 1, then 6 mg/kg IV q21d"

Instance: DocetaxelMedRequestPHD
InstanceOf: http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-request
Usage: #example
Title: "Example: Docetaxel MedicationRequest (PHD regimen, draft)"
Description: "Draft MedicationRequest for docetaxel 75 mg/m² IV q21d in PHD regimen."
* status  = #draft
* intent  = #order
* subject = Reference(MOPAPatientExample)
* requester = Reference(MOPAOncologistExample)
* reasonReference = Reference(MOPAMetastaticBreastCancerConditionExample)
* medicationCodeableConcept = $RxNorm#72962 "docetaxel"
* dosageInstruction[+].text = "75 mg/m² IV day 1 of each 21-day cycle"


// ─── A: TH regimen order (typical case) ─────────────────────────────────────
// Adjuvant HER2+ early breast cancer. Concurrent two-agent weekly order.
// All Must Support elements populated. instantiatesCanonical references RegimenTH.
//
// Scheduling note: TH is conventionally given as a weekly regimen for 12 weeks.
// We represent it as a 21-day super-cycle with paclitaxel and trastuzumab
// administered on days 1, 8, and 15 — demonstrating the multi-day
// regimen-days-of-cycle pattern. This mirrors common EHR order-set encoding.
Instance: THRegimenOrder
InstanceOf: AntiCancerRegimenRequestGroup
Usage: #example
Title: "Example Regimen Order: TH (Jane Smith, Adjuvant HER2+) — Typical"
Description: """Patient-specific draft ordered TH regimen for Jane Smith at order-select.
instantiatesCanonical references RegimenTH. All Must Support elements populated.
Demonstrates regimen-days-of-cycle (days 1, 8, 15 of a 21-day cycle) and is the primary
reference example for AntiCancerRegimenRequestGroup."""

* status = #draft
* intent = #order
* subject = Reference(MOPAPatientExample)
* instantiatesCanonical = "http://hl7.org/fhir/us/codex-mopa/PlanDefinition/RegimenTH"
* extension[category][treatmentIntent].valueCodeableConcept = $SCT#373846009 "Adjuvant - intent"
* extension[category][lineOfTherapy].valueCodeableConcept = $TreatmentLineCS#1L "First-line"

// Paclitaxel — days 1, 8, 15 of a 21-day cycle (weekly x3 per cycle)
* action[+].id    = "paclitaxel-th-action"
* action[=].title = "Paclitaxel 80 mg/m² IV — days 1, 8, 15 of 21-day cycle"
* action[=].timingTiming.repeat.period     = 21
* action[=].timingTiming.repeat.periodUnit = #d
* action[=].timingTiming.extension[$DaysOfCycle].extension[day][+].valueInteger = 1
* action[=].timingTiming.extension[$DaysOfCycle].extension[day][+].valueInteger = 8
* action[=].timingTiming.extension[$DaysOfCycle].extension[day][+].valueInteger = 15
* action[=].resource = Reference(PaclitaxelMedRequestTH)

// Trastuzumab — days 1, 8, 15 of a 21-day cycle (weekly x3 per cycle)
* action[+].id    = "trastuzumab-th-action"
* action[=].title = "Trastuzumab IV — days 1, 8, 15 of 21-day cycle"
* action[=].timingTiming.repeat.period     = 21
* action[=].timingTiming.repeat.periodUnit = #d
* action[=].timingTiming.extension[$DaysOfCycle].extension[day][+].valueInteger = 1
* action[=].timingTiming.extension[$DaysOfCycle].extension[day][+].valueInteger = 8
* action[=].timingTiming.extension[$DaysOfCycle].extension[day][+].valueInteger = 15
* action[=].resource = Reference(TrastuzumabMedRequestTH)


// ─── B: ddAC→T regimen order (sequential phases) ────────────────────────────
// Adjuvant breast cancer. Two sequential phases with relatedAction.
Instance: DDACTRegimenOrder
InstanceOf: AntiCancerRegimenRequestGroup
Usage: #example
Title: "Example Regimen Order: ddAC→T (Jane Smith, Adjuvant) — Sequential Phases"
Description: """Patient-specific draft ddAC→T order for Jane Smith. AC phase (doxorubicin +
cyclophosphamide q14d x4) followed by T phase (paclitaxel q14d x4). Demonstrates sequential
phase ordering with action.relatedAction relationship = after-end."""

* status = #draft
* intent = #order
* subject = Reference(MOPAPatientExample)
* instantiatesCanonical = "http://hl7.org/fhir/us/codex-mopa/PlanDefinition/RegimenDdACT"
* extension[category][treatmentIntent].valueCodeableConcept = $SCT#373846009 "Adjuvant - intent"
* extension[category][lineOfTherapy].valueCodeableConcept = $TreatmentLineCS#1L "First-line"

// AC Phase — doxorubicin and cyclophosphamide day 1; pegfilgrastim day 2 of each 14-day cycle
* action[+].id    = "ac-phase-order"
* action[=].title = "AC Phase (Cycles 1–4, q14d)"
* action[=].timingTiming.repeat.count      = 4
* action[=].timingTiming.repeat.period     = 14
* action[=].timingTiming.repeat.periodUnit = #d

* action[=].action[+].id    = "doxorubicin-action"
* action[=].action[=].title = "Doxorubicin 60 mg/m² IV day 1"
* action[=].action[=].timingTiming.repeat.period     = 14
* action[=].action[=].timingTiming.repeat.periodUnit = #d
* action[=].action[=].timingTiming.extension[$DaysOfCycle].extension[day][+].valueInteger = 1
* action[=].action[=].resource = Reference(DoxorubicinMedRequestDDACT)

* action[=].action[+].id    = "cyclophosphamide-action"
* action[=].action[=].title = "Cyclophosphamide 600 mg/m² IV day 1"
* action[=].action[=].timingTiming.repeat.period     = 14
* action[=].action[=].timingTiming.repeat.periodUnit = #d
* action[=].action[=].timingTiming.extension[$DaysOfCycle].extension[day][+].valueInteger = 1
* action[=].action[=].resource = Reference(CyclophosphamideMedRequestDDACT)

// Pegfilgrastim supportive care — day 2 of each ddAC cycle
* action[=].action[+].id    = "pegfilgrastim-action"
* action[=].action[=].title = "Pegfilgrastim 6 mg subcutaneous day 2"
* action[=].action[=].timingTiming.repeat.period     = 14
* action[=].action[=].timingTiming.repeat.periodUnit = #d
* action[=].action[=].timingTiming.extension[$DaysOfCycle].extension[day][+].valueInteger = 2
* action[=].action[=].resource = Reference(PegfilgrastimMedRequestDDACT)

// T Phase — begins after AC phase ends; paclitaxel on day 1 of each 14-day cycle
* action[+].id    = "t-phase-order"
* action[=].title = "T Phase — Paclitaxel (Cycles 5–8, q14d)"
* action[=].relatedAction[+].actionId     = "ac-phase-order"
* action[=].relatedAction[=].relationship = #after-end
* action[=].timingTiming.repeat.count      = 4
* action[=].timingTiming.repeat.period     = 14
* action[=].timingTiming.repeat.periodUnit = #d

* action[=].action[+].id    = "paclitaxel-t-action"
* action[=].action[=].title = "Paclitaxel 175 mg/m² IV day 1"
* action[=].action[=].timingTiming.repeat.period     = 14
* action[=].action[=].timingTiming.repeat.periodUnit = #d
* action[=].action[=].timingTiming.extension[$DaysOfCycle].extension[day][+].valueInteger = 1
* action[=].action[=].resource = Reference(PaclitaxelMedRequestTPHase)


// ─── C: PHD regimen order (metastatic, first-line, palliative) ───────────────
// First-line metastatic HER2+. Three concurrent agents, q21d.
Instance: PHDRegimenOrder
InstanceOf: AntiCancerRegimenRequestGroup
Usage: #example
Title: "Example Regimen Order: PHD (Jane Smith, First-Line Metastatic HER2+)"
Description: """Patient-specific draft PHD regimen order for Jane Smith, first-line
metastatic HER2+ breast cancer. Pertuzumab + Trastuzumab + Docetaxel q21d.
Demonstrates palliative intent and first-line metastatic treatment setting."""

* status = #draft
* intent = #order
* subject = Reference(MOPAPatientExample)
* instantiatesCanonical = "http://hl7.org/fhir/us/codex-mopa/PlanDefinition/RegimenPHD"
* extension[category][treatmentIntent].valueCodeableConcept = $SCT#363676003 "Palliative intent"
* extension[category][lineOfTherapy].valueCodeableConcept = $TreatmentLineCS#1L "First-line"

// Pertuzumab — day 1 of each 21-day cycle
* action[+].id    = "pertuzumab-phd-action"
* action[=].title = "Pertuzumab IV day 1 q21d"
* action[=].timingTiming.repeat.period     = 21
* action[=].timingTiming.repeat.periodUnit = #d
* action[=].timingTiming.extension[$DaysOfCycle].extension[day][+].valueInteger = 1
* action[=].resource = Reference(PertuzumabMedRequestPHD)

// Trastuzumab — day 1 of each 21-day cycle
* action[+].id    = "trastuzumab-phd-action"
* action[=].title = "Trastuzumab IV day 1 q21d"
* action[=].timingTiming.repeat.period     = 21
* action[=].timingTiming.repeat.periodUnit = #d
* action[=].timingTiming.extension[$DaysOfCycle].extension[day][+].valueInteger = 1
* action[=].resource = Reference(TrastuzumabMedRequestPHD)

// Docetaxel — day 1 of each 21-day cycle
* action[+].id    = "docetaxel-phd-action"
* action[=].title = "Docetaxel 75 mg/m² IV day 1 q21d"
* action[=].timingTiming.repeat.period     = 21
* action[=].timingTiming.repeat.periodUnit = #d
* action[=].timingTiming.extension[$DaysOfCycle].extension[day][+].valueInteger = 1
* action[=].resource = Reference(DocetaxelMedRequestPHD)
