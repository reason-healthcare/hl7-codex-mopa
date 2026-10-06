# 324d4f70-205b-60cc-f89c-1abb9feabaee - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example Procedure: 324d4f70-205b-60cc-f89c-1abb9feabaee

Profile: [US Core Procedure Profile](http://hl7.org/fhir/us/core/STU7/StructureDefinition-us-core-procedure.html)

**status**: Completed

**code**: Manual pelvic examination (procedure)

**subject**: [Julia Julia Terán (official) Female, DoB: 1942-11-30 ( https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-a081-24b98a0f139e)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-a081-24b98a0f139e)

**encounter**: [Encounter: identifier = https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-406d-3b0c7ff097ca (use: official, ); status = finished; class = ambulatory (ActCode#AMB); type = Gynecology service (qualifier value); period = 2024-04-18 00:43:48-0500 --> 2024-04-18 01:16:00-0500; reasonCode = Malignant neoplasm of breast (disorder)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-406d-3b0c7ff097ca)

**performed**: 2024-04-18 00:43:48-0500 --> 2024-04-18 00:58:24-0500

**location**: `OPEN ACCESS VASCULAR ACCESS CENTER INC`

**reasonReference**: [Malignant neoplasm of breast (disorder)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-e524-4f55fc9ea3c1)



## Resource Content

```json
{
  "resourceType" : "Procedure",
  "id" : "324d4f70-205b-60cc-f89c-1abb9feabaee",
  "meta" : {
    "profile" : ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"]
  },
  "status" : "completed",
  "code" : {
    "coding" : [{
      "system" : "http://snomed.info/sct",
      "code" : "35025007",
      "display" : "Manual pelvic examination (procedure)"
    }],
    "text" : "Manual pelvic examination (procedure)"
  },
  "subject" : {
    "reference" : "urn:uuid:324d4f70-205b-60cc-a081-24b98a0f139e"
  },
  "encounter" : {
    "reference" : "urn:uuid:324d4f70-205b-60cc-406d-3b0c7ff097ca"
  },
  "performedPeriod" : {
    "start" : "2024-04-18T00:43:48-05:00",
    "end" : "2024-04-18T00:58:24-05:00"
  },
  "location" : {
    "reference" : "Location?identifier=https://github.com/synthetichealth/synthea|3d038942-40fd-3bd7-a3b8-794b9cc858e8",
    "display" : "OPEN ACCESS VASCULAR ACCESS CENTER INC"
  },
  "reasonReference" : [{
    "reference" : "urn:uuid:324d4f70-205b-60cc-e524-4f55fc9ea3c1",
    "display" : "Malignant neoplasm of breast (disorder)"
  }]
}

```
