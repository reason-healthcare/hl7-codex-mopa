# 324d4f70-205b-60cc-ab2b-7e1872e256ad - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example Immunization: 324d4f70-205b-60cc-ab2b-7e1872e256ad

Profile: [US Core Immunization Profile](http://hl7.org/fhir/us/core/STU7/StructureDefinition-us-core-immunization.html)

**status**: Completed

**vaccineCode**: Influenza, split virus, trivalent, PF

**patient**: [Julia Julia Terán (official) Female, DoB: 1942-11-30 ( https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-a081-24b98a0f139e)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-a081-24b98a0f139e)

**encounter**: [Encounter: identifier = https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-da21-a0ada8fdccaf (use: official, ); status = finished; class = ambulatory (ActCode#AMB); type = General examination of patient (procedure); period = 2020-05-04 22:05:30-0500 --> 2020-05-04 22:20:30-0500](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-da21-a0ada8fdccaf)

**occurrence**: 2020-05-04 22:05:30-0500

**primarySource**: true

**location**: `CHILDRENS MEDICAL CARE INC`



## Resource Content

```json
{
  "resourceType" : "Immunization",
  "id" : "324d4f70-205b-60cc-ab2b-7e1872e256ad",
  "meta" : {
    "profile" : ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-immunization"]
  },
  "status" : "completed",
  "vaccineCode" : {
    "coding" : [{
      "system" : "http://hl7.org/fhir/sid/cvx",
      "code" : "140",
      "display" : "Influenza, split virus, trivalent, PF"
    }],
    "text" : "Influenza, split virus, trivalent, PF"
  },
  "patient" : {
    "reference" : "urn:uuid:324d4f70-205b-60cc-a081-24b98a0f139e"
  },
  "encounter" : {
    "reference" : "urn:uuid:324d4f70-205b-60cc-da21-a0ada8fdccaf"
  },
  "occurrenceDateTime" : "2020-05-04T22:05:30-05:00",
  "primarySource" : true,
  "location" : {
    "reference" : "Location?identifier=https://github.com/synthetichealth/synthea|8d33f2d1-09d6-3578-9fb4-779d57023b3e",
    "display" : "CHILDRENS MEDICAL CARE INC"
  }
}

```
