# 324d4f70-205b-60cc-fea4-d040f20925df - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example Encounter: 324d4f70-205b-60cc-fea4-d040f20925df

Profile: [US Core Encounter Profile](http://hl7.org/fhir/us/core/STU7/StructureDefinition-us-core-encounter.html)

**identifier**: `https://github.com/synthetichealth/synthea`/324d4f70-205b-60cc-fea4-d040f20925df (use: official, )

**status**: Finished

**class**: [ActCode: AMB](http://terminology.hl7.org/7.4.0/CodeSystem-v3-ActCode.html#v3-ActCode-AMB) (ambulatory)

**type**: Administration of vaccine to produce active immunity (procedure)

**subject**: [Mrs. Julia241 Julia241 Terán294](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-a081-24b98a0f139e)

### Participants

| | | | |
| :--- | :--- | :--- | :--- |
| - | **Type** | **Period** | **Individual** |
| * | primary performer | 2021-02-22 21:05:30-0600 --> 2021-02-22 21:20:30-0600 | `Dr. Bertram Pyle` |

**period**: 2021-02-22 21:05:30-0600 --> 2021-02-22 21:20:30-0600

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
  "id" : "324d4f70-205b-60cc-fea4-d040f20925df",
  "meta" : {
    "profile" : ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"]
  },
  "identifier" : [{
    "use" : "official",
    "system" : "https://github.com/synthetichealth/synthea",
    "value" : "324d4f70-205b-60cc-fea4-d040f20925df"
  }],
  "status" : "finished",
  "class" : {
    "system" : "http://terminology.hl7.org/CodeSystem/v3-ActCode",
    "code" : "AMB"
  },
  "type" : [{
    "coding" : [{
      "system" : "http://snomed.info/sct",
      "code" : "33879002",
      "display" : "Administration of vaccine to produce active immunity (procedure)"
    }],
    "text" : "Administration of vaccine to produce active immunity (procedure)"
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
      "start" : "2021-02-22T21:05:30-06:00",
      "end" : "2021-02-22T21:20:30-06:00"
    },
    "individual" : {
      "reference" : "Practitioner?identifier=http://hl7.org/fhir/sid/us-npi|9999968495",
      "display" : "Dr. Bertram Pyle"
    }
  }],
  "period" : {
    "start" : "2021-02-22T21:05:30-06:00",
    "end" : "2021-02-22T21:20:30-06:00"
  },
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
