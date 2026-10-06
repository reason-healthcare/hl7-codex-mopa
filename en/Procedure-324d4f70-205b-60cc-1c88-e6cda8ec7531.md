# 324d4f70-205b-60cc-1c88-e6cda8ec7531 - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example Procedure: 324d4f70-205b-60cc-1c88-e6cda8ec7531

Profile: [US Core Procedure Profile](http://hl7.org/fhir/us/core/STU7/StructureDefinition-us-core-procedure.html)

**status**: Completed

**code**: Manual pelvic examination (procedure)

**subject**: [Julia Julia Terán (official) Female, DoB: 1942-11-30 ( https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-a081-24b98a0f139e)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-a081-24b98a0f139e)

**encounter**: [Encounter: identifier = https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-d218-8bd9b86f704e (use: official, ); status = finished; class = ambulatory (ActCode#AMB); type = Gynecology service (qualifier value); period = 2023-04-10 23:08:22-0500 --> 2023-04-10 23:42:26-0500; reasonCode = Malignant neoplasm of breast (disorder)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-d218-8bd9b86f704e)

**performed**: 2023-04-10 23:08:22-0500 --> 2023-04-10 23:22:51-0500

**location**: `OPEN ACCESS VASCULAR ACCESS CENTER INC`

**reasonReference**: [Malignant neoplasm of breast (disorder)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-e524-4f55fc9ea3c1)



## Resource Content

```json
{
  "resourceType" : "Procedure",
  "id" : "324d4f70-205b-60cc-1c88-e6cda8ec7531",
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
    "reference" : "urn:uuid:324d4f70-205b-60cc-d218-8bd9b86f704e"
  },
  "performedPeriod" : {
    "start" : "2023-04-10T23:08:22-05:00",
    "end" : "2023-04-10T23:22:51-05:00"
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
