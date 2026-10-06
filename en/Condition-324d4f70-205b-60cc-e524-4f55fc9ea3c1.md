# 324d4f70-205b-60cc-e524-4f55fc9ea3c1 - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example Condition: 324d4f70-205b-60cc-e524-4f55fc9ea3c1

Profile: [US Core Condition Encounter Diagnosis Profile](http://hl7.org/fhir/us/core/STU7/StructureDefinition-us-core-condition-encounter-diagnosis.html)

**clinicalStatus**: Active

**verificationStatus**: Confirmed

**category**: Encounter Diagnosis

**code**: Malignant neoplasm of breast (disorder)

**subject**: [Julia Julia Terán (official) Female, DoB: 1942-11-30 ( https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-a081-24b98a0f139e)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-a081-24b98a0f139e)

**encounter**: [Encounter: identifier = https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-58cf-1e7016b4cbfa (use: official, ); status = finished; class = ambulatory (ActCode#AMB); type = Encounter for symptom (procedure); period = 1985-07-25 22:05:30-0500 --> 1985-07-27 08:08:17-0500; reasonCode = Malignant neoplasm of breast (disorder)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-58cf-1e7016b4cbfa)

**onset**: 1985-07-25 22:05:30-0500

**recordedDate**: 1985-07-25 22:05:30-0500



## Resource Content

```json
{
  "resourceType" : "Condition",
  "id" : "324d4f70-205b-60cc-e524-4f55fc9ea3c1",
  "meta" : {
    "profile" : ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-condition-encounter-diagnosis"]
  },
  "clinicalStatus" : {
    "coding" : [{
      "system" : "http://terminology.hl7.org/CodeSystem/condition-clinical",
      "code" : "active"
    }]
  },
  "verificationStatus" : {
    "coding" : [{
      "system" : "http://terminology.hl7.org/CodeSystem/condition-ver-status",
      "code" : "confirmed"
    }]
  },
  "category" : [{
    "coding" : [{
      "system" : "http://terminology.hl7.org/CodeSystem/condition-category",
      "code" : "encounter-diagnosis",
      "display" : "Encounter Diagnosis"
    }]
  }],
  "code" : {
    "coding" : [{
      "system" : "http://snomed.info/sct",
      "code" : "254837009",
      "display" : "Malignant neoplasm of breast (disorder)"
    }],
    "text" : "Malignant neoplasm of breast (disorder)"
  },
  "subject" : {
    "reference" : "urn:uuid:324d4f70-205b-60cc-a081-24b98a0f139e"
  },
  "encounter" : {
    "reference" : "urn:uuid:324d4f70-205b-60cc-58cf-1e7016b4cbfa"
  },
  "onsetDateTime" : "1985-07-25T22:05:30-05:00",
  "recordedDate" : "1985-07-25T22:05:30-05:00"
}

```
