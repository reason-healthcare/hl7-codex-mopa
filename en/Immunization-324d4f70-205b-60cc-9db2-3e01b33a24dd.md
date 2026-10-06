# 324d4f70-205b-60cc-9db2-3e01b33a24dd - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example Immunization: 324d4f70-205b-60cc-9db2-3e01b33a24dd

Profile: [US Core Immunization Profile](http://hl7.org/fhir/us/core/STU7/StructureDefinition-us-core-immunization.html)

**status**: Completed

**vaccineCode**: COVID-19, mRNA, LNP-S, PF, 100 mcg/0.5mL dose or 50 mcg/0.25mL dose

**patient**: [Julia Julia Terán (official) Female, DoB: 1942-11-30 ( https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-a081-24b98a0f139e)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-a081-24b98a0f139e)

**encounter**: [Encounter: identifier = https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-3b24-763d02e12997 (use: official, ); status = finished; class = ambulatory (ActCode#AMB); type = Administration of vaccine to produce active immunity (procedure); period = 2021-03-22 22:05:30-0500 --> 2021-03-22 22:20:30-0500](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-3b24-763d02e12997)

**occurrence**: 2021-03-22 22:05:30-0500

**primarySource**: true

**location**: `OPEN ACCESS VASCULAR ACCESS CENTER INC`



## Resource Content

```json
{
  "resourceType" : "Immunization",
  "id" : "324d4f70-205b-60cc-9db2-3e01b33a24dd",
  "meta" : {
    "profile" : ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-immunization"]
  },
  "status" : "completed",
  "vaccineCode" : {
    "coding" : [{
      "system" : "http://hl7.org/fhir/sid/cvx",
      "code" : "207",
      "display" : "Dr. Bertram Pyle"
    }],
    "text" : "COVID-19, mRNA, LNP-S, PF, 100 mcg/0.5mL dose or 50 mcg/0.25mL dose"
  },
  "patient" : {
    "reference" : "urn:uuid:324d4f70-205b-60cc-a081-24b98a0f139e"
  },
  "encounter" : {
    "reference" : "urn:uuid:324d4f70-205b-60cc-3b24-763d02e12997"
  },
  "occurrenceDateTime" : "2021-03-22T22:05:30-05:00",
  "primarySource" : true,
  "location" : {
    "reference" : "Location?identifier=https://github.com/synthetichealth/synthea|3d038942-40fd-3bd7-a3b8-794b9cc858e8",
    "display" : "OPEN ACCESS VASCULAR ACCESS CENTER INC"
  }
}

```
