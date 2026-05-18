library BreastCancerPayerPolicy version '0.1.0'

using FHIR version '4.0.1'

include FHIRHelpers version '4.0.1'

codesystem "LOINC": 'http://loinc.org'
codesystem "SNOMED-CT": 'http://snomed.info/sct'

// HER2 observation codes
code "HER2 by IHC": '85319-2' from "LOINC"
    display 'HER2 [Presence] in Breast cancer specimen by Immune stain'
code "HER2 Gene Amplification": '431396003' from "SNOMED-CT"
    display 'Human epidermal growth factor 2 gene amplification detected'

// Cancer staging
code "Clinical Stage Group": '21908-9' from "LOINC"
    display 'Stage group.clinical Cancer'

// Performance status
code "ECOG Performance Status": '89247-1' from "LOINC"
    display 'ECOG Performance Status score'

context Patient

/**
 * ---- Required data element presence checks ----
 * Each expression returns true when at least one qualifying
 * Observation for that element is present in the patient record.
 */

define "HER2 Status Present":
  exists([Observation: "HER2 by IHC"])
    or exists([Observation: "HER2 Gene Amplification"])

define "Cancer Stage Present":
  exists([Observation: "Clinical Stage Group"])

define "ECOG PS Present":
  exists([Observation: "ECOG Performance Status"])

/**
 * ---- Aggregate completeness ----
 */

define "All Data Present":
  "HER2 Status Present"
    and "Cancer Stage Present"
    and "ECOG PS Present"

/**
 * ---- Prior authorization result ----
 * 'approved'     — all required data present; no PA workflow needed
 * 'dtr-required' — one or more data elements missing; launch DTR
 */

define "PA Result":
  if "All Data Present" then 'approved'
  else 'dtr-required'
