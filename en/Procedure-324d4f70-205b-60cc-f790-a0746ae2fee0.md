# 324d4f70-205b-60cc-f790-a0746ae2fee0 - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example Procedure: 324d4f70-205b-60cc-f790-a0746ae2fee0

Profile: [US Core Procedure Profile](http://hl7.org/fhir/us/core/STU7/StructureDefinition-us-core-procedure.html)

**status**: Completed

**code**: Cytopathology procedure, preparation of smear, genital source (procedure)

**subject**: [Julia Julia Terán (official) Female, DoB: 1942-11-30 ( https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-a081-24b98a0f139e)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-a081-24b98a0f139e)

**encounter**: [Encounter: identifier = https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-95ce-922e94744be4 (use: official, ); status = finished; class = ambulatory (ActCode#AMB); type = Gynecology service (qualifier value); period = 2026-04-01 03:40:17-0500 --> 2026-04-01 04:05:18-0500; reasonCode = Malignant neoplasm of breast (disorder)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-95ce-922e94744be4)

**performed**: 2026-04-01 03:53:20-0500 --> 2026-04-01 04:05:18-0500

**location**: `OPEN ACCESS VASCULAR ACCESS CENTER INC`

**reasonReference**: [Malignant neoplasm of breast (disorder)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-e524-4f55fc9ea3c1)



## Resource Content

```json
{
  "resourceType" : "Procedure",
  "id" : "324d4f70-205b-60cc-f790-a0746ae2fee0",
  "meta" : {
    "profile" : ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"]
  },
  "status" : "completed",
  "code" : {
    "coding" : [{
      "system" : "http://snomed.info/sct",
      "code" : "90226004",
      "display" : "Cytopathology procedure, preparation of smear, genital source (procedure)"
    }],
    "text" : "Cytopathology procedure, preparation of smear, genital source (procedure)"
  },
  "subject" : {
    "reference" : "urn:uuid:324d4f70-205b-60cc-a081-24b98a0f139e"
  },
  "encounter" : {
    "reference" : "urn:uuid:324d4f70-205b-60cc-95ce-922e94744be4"
  },
  "performedPeriod" : {
    "start" : "2026-04-01T03:53:20-05:00",
    "end" : "2026-04-01T04:05:18-05:00"
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
