library BreastCancerGuideline version '0.1.0'

using FHIR version '4.0.1'

include FHIRHelpers version '4.0.1'

codesystem "LOINC":    'http://loinc.org'
codesystem "SNOMED-CT": 'http://snomed.info/sct'

code "HER2 by IHC": '85319-2' from "LOINC"
    display 'HER2, Breast cancer specimen'
code "HER2 Gene Amplification": '431396003' from "SNOMED-CT"
    display 'Human epidermal growth factor 2 gene amplification detected'
code "ER by IHC": '85337-4' from "LOINC"
    display 'Estrogen receptor Ag [Presence] in Breast cancer specimen by Immune stain'
code "PR by IHC": '85339-0' from "LOINC"
    display 'Progesterone receptor Ag [Presence] in Breast cancer specimen by Immune stain'
code "Oncotype DX Recurrence Score": '104119-3' from "LOINC"
    display 'Breast Cancer recurrence risk multigene analysis in Tissue by Molecular genetics method'
code "Postmenopausal State": '428361000124107' from "SNOMED-CT"
    display 'Postmenopausal state'

code "Primary Malignant Breast Cancer": '372137005' from "SNOMED-CT"
    display 'Primary malignant neoplasm of breast'

context Patient

/**
 * Active primary breast cancer diagnosis is present in the problem list.
 * Required as a prerequisite for all regimen recommendations.
 */
define "Has Active Breast Cancer":
  exists([Condition: "Primary Malignant Breast Cancer"])

/**
 * HER2 positive: a HER2 observation's valueCodeableConcept contains the SNOMED
 * positive qualifier code (10828004 or legacy 416940007), or HER2 gene
 * amplification is detected. Presence of a HER2 observation alone is not
 * sufficient — a negative (IHC 0/1+) result must not be treated as positive.
 */
define "Is HER2 Positive":
  exists([Observation: "HER2 by IHC"] O
    where exists(O.value.coding C
      where C.code.value = '10828004' or C.code.value = '416940007'))
    or exists([Observation: "HER2 Gene Amplification"])

/**
 * ER positive: an estrogen receptor observation's valueCodeableConcept
 * contains the SNOMED positive qualifier code.
 */
define "Is ER Positive":
  exists([Observation: "ER by IHC"] O
    where exists(O.value.coding C
      where C.code.value = '10828004' or C.code.value = '416940007'))

/**
 * Post-menopausal: a menopausal status observation reporting post-menopausal
 * state is present.
 */
define "Is Postmenopausal":
  exists([Observation: "Postmenopausal State"])

/**
 * Oncotype DX recurrence score >= 26: indicates that adjuvant chemotherapy
 * is beneficial for ER-positive, HER2-negative, node-negative breast cancer
 * in post-menopausal women (NCCN / TAILORx threshold).
 */
define "OncotypeDX Score High":
  exists([Observation: "Oncotype DX Recurrence Score"] O
    where O.value.value >= 26)

/**
 * ---- Regimen recommendations ----
 *
 * A confirmed breast cancer diagnosis is a prerequisite for all three
 * regimen paths. HER2 status determines the HER2-directed options; for
 * HER2-negative disease, ER status, menopausal status, and the Oncotype DX
 * recurrence score determine whether adjuvant chemotherapy is indicated.
 *
 * TH    (Trastuzumab + Paclitaxel)              — HER2-positive
 * PHD   (Pertuzumab + Trastuzumab + Docetaxel)  — HER2-positive
 * ddACT (dose-dense AC → Paclitaxel)            — HER2-negative, ER-positive,
 *                                                  post-menopausal, OncotypeDX >= 26
 */

define "TH Eligible":
  "Has Active Breast Cancer" and "Is HER2 Positive"

define "PHD Eligible":
  "Has Active Breast Cancer" and "Is HER2 Positive"

define "ddACT Eligible":
  "Has Active Breast Cancer"
    and not "Is HER2 Positive"
    and "Is ER Positive"
    and "Is Postmenopausal"
    and "OncotypeDX Score High"
