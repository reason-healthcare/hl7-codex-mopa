// ============================================================
// AntiCancerRegimenPlanDefinition-examples.fsh
// 3 canonical regimen definitions covering:
//   A — TH: Paclitaxel + Trastuzumab (weekly, adjuvant HER2+)
//   B — ddAC→T: dose-dense AC then Paclitaxel (sequential, adjuvant)
//   C — PHD: Pertuzumab + Trastuzumab + Docetaxel (metastatic HER2+)
//
// Demonstrates: RegimenIntentExtension,
//               RegimenDaysOfCycle extension, sequential phase relatedAction
// NOTE: regimenIntent is carried on RequestGroup only (patient-specific ordering context).
//       PlanDefinition.subject[x] declares the target cancer population; no clinical context
//       extensions are placed on the canonical definition.
// ============================================================

// ─── A: TH — Paclitaxel + Trastuzumab, weekly x12 (typical case) ──────────
// Adjuvant HER2+ early breast cancer. Concurrent two-agent weekly regimen.
// All Must Support elements populated.
Instance: THRegimenDefinition
InstanceOf: AntiCancerRegimenPlanDefinition
Usage: #example
Title: "Example Regimen Definition: TH (Paclitaxel + Trastuzumab, Weekly)"
Description: """Canonical definition of weekly Paclitaxel (80 mg/m² IV) plus Trastuzumab
(4 mg/kg loading, then 2 mg/kg IV) for 12 weeks in adjuvant HER2-positive early breast
cancer. The canonical definition carries protocol structure only — treatment intent and
line of therapy are patient-context and live on the RequestGroup."""

* url     = "http://hl7.org/fhir/us/codex-mopa/PlanDefinition/THRegimenDefinition"
* version = "1.0.0"
* name    = "THRegimenDefinition"
* title   = "TH: Paclitaxel + Trastuzumab (Weekly) — Adjuvant HER2+ Breast Cancer"
* status  = #active
* experimental = true
* type    = $PD-TYPE#order-set "Order Set"
* subjectCodeableConcept = $SCT#254837009 "Malignant neoplasm of breast"
* description = "Weekly Paclitaxel + Trastuzumab for 12 weeks; standard adjuvant regimen for early HER2+ breast cancer."

* action[+].id    = "paclitaxel-th"
* action[=].title = "Paclitaxel 80 mg/m² IV — Day 1 of each 7-day cycle"
* action[=].description = "Paclitaxel 80 mg/m² IV over 1 hour, weekly (day 1 of 7-day cycle) x12 doses"
* action[=].timingTiming.repeat.period = 7
* action[=].timingTiming.repeat.periodUnit = #d
* action[=].timingTiming.repeat.count = 12

* action[+].id    = "trastuzumab-th"
* action[=].title = "Trastuzumab 4 mg/kg (loading) then 2 mg/kg IV weekly"
* action[=].description = "Trastuzumab 4 mg/kg IV loading dose week 1, then 2 mg/kg IV weekly (day 1 of 7-day cycle) x11 doses"
* action[=].timingTiming.repeat.period = 7
* action[=].timingTiming.repeat.periodUnit = #d
* action[=].timingTiming.repeat.count = 12


// ─── B: ddAC→T — Dose-Dense AC then Paclitaxel (sequential phases) ─────────
// Adjuvant, any subtype. Two sequential phases with relatedAction after-end.
// Demonstrates sequential phase ordering pattern.
Instance: DDACTRegimenDefinition
InstanceOf: AntiCancerRegimenPlanDefinition
Usage: #example
Title: "Example Regimen Definition: ddAC→T (Dose-Dense AC then Paclitaxel)"
Description: """Canonical definition of dose-dense doxorubicin (60 mg/m²) plus
cyclophosphamide (600 mg/m²) q14d × 4 cycles (AC phase), followed by paclitaxel
(175 mg/m²) q14d × 4 cycles (T phase) for adjuvant breast cancer. Demonstrates
sequential phase ordering using action.relatedAction with relationship = after-end."""

* url     = "http://hl7.org/fhir/us/codex-mopa/PlanDefinition/DDACTRegimenDefinition"
* version = "1.0.0"
* name    = "DDACTRegimenDefinition"
* title   = "ddAC→T: Dose-Dense Doxorubicin/Cyclophosphamide then Paclitaxel — Adjuvant Breast Cancer"
* status  = #active
* experimental = true
* type    = $PD-TYPE#order-set "Order Set"
* subjectCodeableConcept = $SCT#254837009 "Malignant neoplasm of breast"
* description = "Dose-dense AC x4 cycles (q14d) followed by paclitaxel x4 cycles (q14d). Standard adjuvant regimen."

// Phase 1: ddAC (2 concurrent agents, q14d x4)
* action[+].id    = "ac-phase"
* action[=].title = "AC Phase — Doxorubicin + Cyclophosphamide (q14d × 4 cycles)"
* action[=].timingTiming.repeat.count  = 4
* action[=].timingTiming.repeat.period = 14
* action[=].timingTiming.repeat.periodUnit = #d

* action[=].action[+].id    = "doxorubicin-ac"
* action[=].action[=].title = "Doxorubicin 60 mg/m² IV — Day 1 of each 14-day cycle"
* action[=].action[=].timingTiming.repeat.period = 14
* action[=].action[=].timingTiming.repeat.periodUnit = #d

* action[=].action[+].id    = "cyclophosphamide-ac"
* action[=].action[=].title = "Cyclophosphamide 600 mg/m² IV — Day 1 of each 14-day cycle"
* action[=].action[=].timingTiming.repeat.period = 14
* action[=].action[=].timingTiming.repeat.periodUnit = #d

// Phase 2: T (paclitaxel, q14d x4) — starts after AC phase ends
* action[+].id    = "t-phase"
* action[=].title = "T Phase — Paclitaxel (q14d × 4 cycles)"
* action[=].relatedAction[+].actionId    = "ac-phase"
* action[=].relatedAction[=].relationship = #after-end
* action[=].timingTiming.repeat.count  = 4
* action[=].timingTiming.repeat.period = 14
* action[=].timingTiming.repeat.periodUnit = #d

* action[=].action[+].id    = "paclitaxel-t"
* action[=].action[=].title = "Paclitaxel 175 mg/m² IV — Day 1 of each 14-day cycle"
* action[=].action[=].timingTiming.repeat.period = 14
* action[=].action[=].timingTiming.repeat.periodUnit = #d


// ─── C: PHD — Pertuzumab + Trastuzumab + Docetaxel (first-line metastatic) ─
// Palliative intent. Three concurrent agents, every 21 days. Minimal example
// showing palliative / metastatic context.
Instance: PHDRegimenDefinition
InstanceOf: AntiCancerRegimenPlanDefinition
Usage: #example
Title: "Example Regimen Definition: PHD (Pertuzumab + Trastuzumab + Docetaxel)"
Description: """Canonical definition of pertuzumab (840 mg loading, then 420 mg IV) plus
trastuzumab (8 mg/kg loading, then 6 mg/kg IV) plus docetaxel (75 mg/m² IV), every 21 days,
for first-line metastatic HER2-positive breast cancer. Demonstrates palliative intent."""

* url     = "http://hl7.org/fhir/us/codex-mopa/PlanDefinition/PHDRegimenDefinition"
* version = "1.0.0"
* name    = "PHDRegimenDefinition"
* title   = "PHD: Pertuzumab + Trastuzumab + Docetaxel — First-Line Metastatic HER2+ Breast Cancer"
* status  = #active
* experimental = true
* type    = $PD-TYPE#order-set "Order Set"
* subjectCodeableConcept = $SCT#254837009 "Malignant neoplasm of breast"
* description = "PHD regimen every 21 days for first-line HER2+ metastatic breast cancer. Standard of care per CLEOPATRA trial."

* action[+].id    = "pertuzumab-phd"
* action[=].title = "Pertuzumab 840 mg IV (cycle 1), then 420 mg IV q21d"
* action[=].timingTiming.repeat.period = 21
* action[=].timingTiming.repeat.periodUnit = #d

* action[+].id    = "trastuzumab-phd"
* action[=].title = "Trastuzumab 8 mg/kg IV (cycle 1), then 6 mg/kg IV q21d"
* action[=].timingTiming.repeat.period = 21
* action[=].timingTiming.repeat.periodUnit = #d

* action[+].id    = "docetaxel-phd"
* action[=].title = "Docetaxel 75 mg/m² IV — Day 1 of each 21-day cycle"
* action[=].timingTiming.repeat.period = 21
* action[=].timingTiming.repeat.periodUnit = #d
