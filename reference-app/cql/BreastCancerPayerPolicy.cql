library BreastCancerPayerPolicy version '0.1.0'

using FHIR version '4.0.1'

include FHIRHelpers version '4.0.1'

codesystem "LOINC":    'http://loinc.org'
codesystem "SNOMED-CT": 'http://snomed.info/sct'

// HER2 observation codes
code "HER2 by IHC": '85319-2' from "LOINC"
    display 'HER2, Breast cancer specimen'
code "HER2 Gene Amplification": '431396003' from "SNOMED-CT"
    display 'Human epidermal growth factor 2 gene amplification detected'

// Hormone receptor status
code "ER by IHC": '85337-4' from "LOINC"
    display 'Estrogen receptor Ag [Presence] in Breast cancer specimen by Immune stain'
code "PR by IHC": '85339-0' from "LOINC"
    display 'Progesterone receptor Ag [Presence] in Breast cancer specimen by Immune stain'

// Genomic risk
code "Oncotype DX Recurrence Score": '104119-3' from "LOINC"
    display 'Breast Cancer recurrence risk multigene analysis in Tissue by Molecular genetics method'

// Menopausal status
code "Postmenopausal State": '428361000124107' from "SNOMED-CT"
    display 'Postmenopausal state'

// Cancer staging
code "Clinical Stage Group": '21908-9' from "LOINC"
    display 'Stage group.clinical Cancer'

// Performance status
code "ECOG Performance Status": '89247-1' from "LOINC"
    display 'ECOG Performance Status score'

// Primary diagnosis
code "Primary Malignant Breast Cancer": '372137005' from "SNOMED-CT"
    display 'Primary malignant neoplasm of breast'

context Patient

/**
 * ---- Required data element presence checks ----
 * Aligned with the CodeX PA in MedOnc POC required clinical elements:
 * Diagnosis, ER/PR/HER2, Stage, Menopausal status, Oncotype DX score.
 */

define "Breast Cancer Diagnosis Present":
  exists([Condition: "Primary Malignant Breast Cancer"])

define "ER Status Present":
  exists([Observation: "ER by IHC"])

define "PR Status Present":
  exists([Observation: "PR by IHC"])

define "HER2 Status Present":
  exists([Observation: "HER2 by IHC"])
    or exists([Observation: "HER2 Gene Amplification"])

define "Cancer Stage Present":
  exists([Observation: "Clinical Stage Group"])

define "Menopausal Status Present":
  exists([Observation: "Postmenopausal State"])

define "OncotypeDX Present":
  exists([Observation: "Oncotype DX Recurrence Score"])

define "ECOG PS Present":
  exists([Observation: "ECOG Performance Status"])

/**
 * ---- Aggregate completeness ----
 */

define "All Data Present":
  "Breast Cancer Diagnosis Present"
    and "ER Status Present"
    and "PR Status Present"
    and "HER2 Status Present"
    and "Cancer Stage Present"
    and "Menopausal Status Present"
    and "OncotypeDX Present"
    and "ECOG PS Present"

/**
 * ---- Prior authorization result ----
 * 'approved'     — all required data present; no PA workflow needed
 * 'dtr-required' — one or more data elements missing; launch DTR
 */

define "PA Result":
  if "All Data Present" then 'approved'
  else 'dtr-required'
