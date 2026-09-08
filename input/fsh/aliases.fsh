// ============================================================
// Aliases for the MOPA Implementation Guide
// ============================================================

// Standard terminology systems
Alias: $SCT        = http://snomed.info/sct
Alias: $LOINC      = http://loinc.org
Alias: $UCUMcs     = http://unitsofmeasure.org
Alias: $ICD10CM    = http://hl7.org/fhir/sid/icd-10-cm
Alias: $RxNorm     = http://www.nlm.nih.gov/research/umls/rxnorm

// HL7 FHIR terminology
Alias: $PD-TYPE         = http://terminology.hl7.org/CodeSystem/plan-definition-type
Alias: $RQ-INTENT       = http://hl7.org/fhir/request-intent
Alias: $OBS-CAT         = http://terminology.hl7.org/CodeSystem/observation-category

// Standard HL7 extensions
Alias: $DaysOfCycle          = http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle
Alias: $RequestCategory      = http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category
Alias: $StdStatus       = http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status
Alias: $FMM             = http://hl7.org/fhir/StructureDefinition/structuredefinition-fmm

// US Core profiles
Alias: $USCorePatient       = http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient|7.0.0
Alias: $USCorePractitioner  = http://hl7.org/fhir/us/core/StructureDefinition/us-core-practitioner|7.0.0
Alias: $USCoreCondition     = http://hl7.org/fhir/us/core/StructureDefinition/us-core-condition-encounter-diagnosis|7.0.0

// mCODE profiles
Alias: $mCODECancerPatient     = http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-patient
Alias: $mCODEPrimaryCancer     = http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-primary-cancer-condition
Alias: $mCODECancerMedRequest  = http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-request
Alias: $mCODETumorMarker       = http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-tumor-marker-test
Alias: $mCODEDiseaseStatus     = http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-disease-status
Alias: $mCODEECOG              = http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-ecog-performance-status

// MOPA local code systems
Alias: $OcpaCS             = http://hl7.org/fhir/us/codex-mopa/CodeSystem/ocpa-codes
Alias: $TreatmentLineCS    = http://hl7.org/fhir/us/codex-mopa/CodeSystem/treatment-line-cs

// MOPA local extensions
Alias: $DRLabel            = http://hl7.org/fhir/us/codex-mopa/StructureDefinition/data-requirement-label
