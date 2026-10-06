# 324d4f70-205b-60cc-5a2f-e1a6ea69a91a - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example Procedure: 324d4f70-205b-60cc-5a2f-e1a6ea69a91a

Profile: [US Core Procedure Profile](http://hl7.org/fhir/us/core/STU7/StructureDefinition-us-core-procedure.html)

**status**: Completed

**code**: Physical examination, complete (procedure)

**subject**: [Julia Julia Terán (official) Female, DoB: 1942-11-30 ( https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-a081-24b98a0f139e)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-a081-24b98a0f139e)

**encounter**: [Encounter: identifier = https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-65ac-50e059411094 (use: official, ); status = finished; class = ambulatory (ActCode#AMB); type = Postoperative follow-up visit (procedure); period = 2019-03-17 16:33:52-0500 --> 2019-03-17 17:06:12-0500; reasonCode = Malignant neoplasm of breast (disorder)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-65ac-50e059411094)

**performed**: 2019-03-17 16:33:52-0500 --> 2019-03-17 17:06:12-0500

**location**: `OPEN ACCESS VASCULAR ACCESS CENTER INC`

**reasonReference**: [Malignant neoplasm of breast (disorder)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-e524-4f55fc9ea3c1)



## Resource Content

```json
{
  "resourceType" : "Procedure",
  "id" : "324d4f70-205b-60cc-5a2f-e1a6ea69a91a",
  "meta" : {
    "profile" : ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"]
  },
  "status" : "completed",
  "code" : {
    "coding" : [{
      "system" : "http://snomed.info/sct",
      "code" : "25656009",
      "display" : "Physical examination, complete (procedure)"
    }],
    "text" : "Physical examination, complete (procedure)"
  },
  "subject" : {
    "reference" : "urn:uuid:324d4f70-205b-60cc-a081-24b98a0f139e"
  },
  "encounter" : {
    "reference" : "urn:uuid:324d4f70-205b-60cc-65ac-50e059411094"
  },
  "performedPeriod" : {
    "start" : "2019-03-17T16:33:52-05:00",
    "end" : "2019-03-17T17:06:12-05:00"
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
