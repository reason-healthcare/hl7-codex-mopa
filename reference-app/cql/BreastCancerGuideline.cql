library BreastCancerGuideline version '0.1.0'

using FHIR version '4.0.1'

include FHIRHelpers version '4.0.1'

codesystem "LOINC":    'http://loinc.org'
codesystem "SNOMED-CT": 'http://snomed.info/sct'

code "HER2 by IHC": '85319-2' from "LOINC"
    display 'HER2, Breast cancer specimen'
code "HER2 Gene Amplification": '431396003' from "SNOMED-CT"
    display 'Human epidermal growth factor 2 gene amplification detected'

code "Primary Malignant Breast Cancer": '372137005' from "SNOMED-CT"
    display 'Primary malignant neoplasm of breast'

context Patient

/**
 * Active primary breast cancer diagnosis is present in the problem list.
 * Required as a prerequisite for all regimen recommendations — the guideline
 * only applies when the indication has been clinically established.
 */
define "Has Active Breast Cancer":
  exists([Condition: "Primary Malignant Breast Cancer"])

/**
 * HER2 positive: any HER2 observation is present.
 */
define "Is HER2 Positive":
  exists([Observation: "HER2 by IHC"])
    or exists([Observation: "HER2 Gene Amplification"])

/**
 * ---- Regimen recommendations ----
 *
 * A confirmed breast cancer diagnosis is a prerequisite for all three
 * regimen paths. HER2 status then determines which regimen is indicated.
 *
 * TH    (Trastuzumab + Paclitaxel)              — HER2-positive
 * PHD   (Pertuzumab + Trastuzumab + Docetaxel)  — HER2-positive
 * ddACT (dose-dense AC → Paclitaxel)            — HER2-negative
 */

define "TH Eligible":
  "Has Active Breast Cancer" and "Is HER2 Positive"

define "PHD Eligible":
  "Has Active Breast Cancer" and "Is HER2 Positive"

define "ddACT Eligible":
  "Has Active Breast Cancer" and not "Is HER2 Positive"
