# 324d4f70-205b-60cc-6a71-2ed4bfa14ce0 - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example Encounter: 324d4f70-205b-60cc-6a71-2ed4bfa14ce0

Profile: [US Core Encounter Profile](http://hl7.org/fhir/us/core/STU7/StructureDefinition-us-core-encounter.html)

**identifier**: `https://github.com/synthetichealth/synthea`/324d4f70-205b-60cc-6a71-2ed4bfa14ce0 (use: official, )

**status**: Finished

**class**: [ActCode: AMB](http://terminology.hl7.org/7.4.0/CodeSystem-v3-ActCode.html#v3-ActCode-AMB) (ambulatory)

**type**: Postoperative follow-up visit (procedure)

**subject**: [Mrs. Julia241 Julia241 Terán294](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-a081-24b98a0f139e)

### Participants

| | | | |
| :--- | :--- | :--- | :--- |
| - | **Type** | **Period** | **Individual** |
| * | primary performer | 2018-03-05 14:05:01-0600 --> 2018-03-05 14:46:38-0600 | `Dr. Bertram Pyle` |

**period**: 2018-03-05 14:05:01-0600 --> 2018-03-05 14:46:38-0600

**reasonCode**: Malignant neoplasm of breast (disorder)

### Locations

| | |
| :--- | :--- |
| - | **Location** |
| * | `OPEN ACCESS VASCULAR ACCESS CENTER INC` |

**serviceProvider**: `OPEN ACCESS VASCULAR ACCESS CENTER INC`



## Resource Content

```json
{
  "resourceType" : "Encounter",
  "id" : "324d4f70-205b-60cc-6a71-2ed4bfa14ce0",
  "meta" : {
    "profile" : ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"]
  },
  "identifier" : [{
    "use" : "official",
    "system" : "https://github.com/synthetichealth/synthea",
    "value" : "324d4f70-205b-60cc-6a71-2ed4bfa14ce0"
  }],
  "status" : "finished",
  "class" : {
    "system" : "http://terminology.hl7.org/CodeSystem/v3-ActCode",
    "code" : "AMB"
  },
  "type" : [{
    "coding" : [{
      "system" : "http://snomed.info/sct",
      "code" : "439740005",
      "display" : "Postoperative follow-up visit (procedure)"
    }],
    "text" : "Postoperative follow-up visit (procedure)"
  }],
  "subject" : {
    "reference" : "urn:uuid:324d4f70-205b-60cc-a081-24b98a0f139e",
    "display" : "Mrs. Julia241 Julia241 Terán294"
  },
  "participant" : [{
    "type" : [{
      "coding" : [{
        "system" : "http://terminology.hl7.org/CodeSystem/v3-ParticipationType",
        "code" : "PPRF",
        "display" : "primary performer"
      }],
      "text" : "primary performer"
    }],
    "period" : {
      "start" : "2018-03-05T14:05:01-06:00",
      "end" : "2018-03-05T14:46:38-06:00"
    },
    "individual" : {
      "reference" : "Practitioner?identifier=http://hl7.org/fhir/sid/us-npi|9999968495",
      "display" : "Dr. Bertram Pyle"
    }
  }],
  "period" : {
    "start" : "2018-03-05T14:05:01-06:00",
    "end" : "2018-03-05T14:46:38-06:00"
  },
  "reasonCode" : [{
    "coding" : [{
      "system" : "http://snomed.info/sct",
      "code" : "254837009",
      "display" : "Malignant neoplasm of breast (disorder)"
    }]
  }],
  "location" : [{
    "location" : {
      "reference" : "Location?identifier=https://github.com/synthetichealth/synthea|3d038942-40fd-3bd7-a3b8-794b9cc858e8",
      "display" : "OPEN ACCESS VASCULAR ACCESS CENTER INC"
    }
  }],
  "serviceProvider" : {
    "reference" : "Organization?identifier=https://github.com/synthetichealth/synthea|22b012cf-d62c-3354-ad66-c36d080d1512",
    "display" : "OPEN ACCESS VASCULAR ACCESS CENTER INC"
  }
}

```
