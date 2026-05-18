library BreastCancerGuideline version '0.1.0'

using FHIR version '4.0.1'

include FHIRHelpers version '4.0.1'

codesystem "LOINC": 'http://loinc.org'
codesystem "SNOMED-CT": 'http://snomed.info/sct'

code "HER2 by IHC": '85319-2' from "LOINC"
    display 'HER2 [Presence] in Breast cancer specimen by Immune stain'
code "HER2 Gene Amplification": '431396003' from "SNOMED-CT"
    display 'Human epidermal growth factor 2 gene amplification detected'

context Patient

/**
 * HER2 positive: any HER2 observation is present.
 * Phase 3: presence check only.
 * Phase 5 refinement: inspect value coding for IHC 3+ or ISH amplified.
 */
define "Is HER2 Positive":
  exists([Observation: "HER2 by IHC"])
    or exists([Observation: "HER2 Gene Amplification"])

/**
 * ---- Regimen eligibility ----
 *
 * TH    (Trastuzumab + Paclitaxel)              — HER2-positive
 * PHD   (Pertuzumab + Trastuzumab + Docetaxel)  — HER2-positive
 * ddACT (dose-dense AC → Paclitaxel)            — HER2-negative
 */

define "TH Eligible":
  "Is HER2 Positive"

define "PHD Eligible":
  "Is HER2 Positive"

define "ddACT Eligible":
  not "Is HER2 Positive"
