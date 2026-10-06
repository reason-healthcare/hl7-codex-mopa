# 324d4f70-205b-60cc-fb7a-ec524eb0db28 - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example Claim: 324d4f70-205b-60cc-fb7a-ec524eb0db28

**status**: Active

**type**: Professional

**use**: Claim

**patient**: [Julia241 Julia241 Terán294](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-a081-24b98a0f139e)

**billablePeriod**: 2025-03-14 01:16:00-0500 --> 2025-03-14 01:56:16-0500

**created**: 2025-03-14 01:56:16-0500

**provider**: `OPEN ACCESS VASCULAR ACCESS CENTER INC`

**priority**: Normal

**facility**: `OPEN ACCESS VASCULAR ACCESS CENTER INC`

### Procedures

| | | |
| :--- | :--- | :--- |
| - | **Sequence** | **Procedure[x]** |
| * | 1 | [Procedure Physical examination, complete (procedure)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-e7e7-eeab8432491c) |

### Insurances

| | | | |
| :--- | :--- | :--- | :--- |
| - | **Sequence** | **Focal** | **Coverage** |
| * | 1 | true | Medicare |

> **item****sequence**: 1**productOrService**: Postoperative follow-up visit (procedure)**encounter**: [Encounter: identifier = https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-c53c-b3838c180ebd (use: official, ); status = finished; class = ambulatory (ActCode#AMB); type = Postoperative follow-up visit (procedure); period = 2025-03-14 01:16:00-0500 --> 2025-03-14 01:56:16-0500; reasonCode = Malignant neoplasm of breast (disorder)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-c53c-b3838c180ebd)

> **item****sequence**: 2**procedureSequence**: 1**productOrService**: Physical examination, complete (procedure)

### Nets

| | | |
| :--- | :--- | :--- |
| - | **Value** | **Currency** |
| * | 615.85 | United States dollar |


### Totals

| | | |
| :--- | :--- | :--- |
| - | **Value** | **Currency** |
| * | 722.66 | United States dollar |



## Resource Content

```json
{
  "resourceType" : "Claim",
  "id" : "324d4f70-205b-60cc-fb7a-ec524eb0db28",
  "status" : "active",
  "type" : {
    "coding" : [{
      "system" : "http://terminology.hl7.org/CodeSystem/claim-type",
      "code" : "professional"
    }]
  },
  "use" : "claim",
  "patient" : {
    "reference" : "urn:uuid:324d4f70-205b-60cc-a081-24b98a0f139e",
    "display" : "Julia241 Julia241 Terán294"
  },
  "billablePeriod" : {
    "start" : "2025-03-14T01:16:00-05:00",
    "end" : "2025-03-14T01:56:16-05:00"
  },
  "created" : "2025-03-14T01:56:16-05:00",
  "provider" : {
    "reference" : "Organization?identifier=https://github.com/synthetichealth/synthea|22b012cf-d62c-3354-ad66-c36d080d1512",
    "display" : "OPEN ACCESS VASCULAR ACCESS CENTER INC"
  },
  "priority" : {
    "coding" : [{
      "system" : "http://terminology.hl7.org/CodeSystem/processpriority",
      "code" : "normal"
    }]
  },
  "facility" : {
    "reference" : "Location?identifier=https://github.com/synthetichealth/synthea|3d038942-40fd-3bd7-a3b8-794b9cc858e8",
    "display" : "OPEN ACCESS VASCULAR ACCESS CENTER INC"
  },
  "procedure" : [{
    "sequence" : 1,
    "procedureReference" : {
      "reference" : "urn:uuid:324d4f70-205b-60cc-e7e7-eeab8432491c"
    }
  }],
  "insurance" : [{
    "sequence" : 1,
    "focal" : true,
    "coverage" : {
      "display" : "Medicare"
    }
  }],
  "item" : [{
    "sequence" : 1,
    "productOrService" : {
      "coding" : [{
        "system" : "http://snomed.info/sct",
        "code" : "439740005",
        "display" : "Postoperative follow-up visit (procedure)"
      }],
      "text" : "Postoperative follow-up visit (procedure)"
    },
    "encounter" : [{
      "reference" : "urn:uuid:324d4f70-205b-60cc-c53c-b3838c180ebd"
    }]
  },
  {
    "sequence" : 2,
    "procedureSequence" : [1],
    "productOrService" : {
      "coding" : [{
        "system" : "http://snomed.info/sct",
        "code" : "25656009",
        "display" : "Physical examination, complete (procedure)"
      }],
      "text" : "Physical examination, complete (procedure)"
    },
    "net" : {
      "value" : 615.85,
      "currency" : "USD"
    }
  }],
  "total" : {
    "value" : 722.66,
    "currency" : "USD"
  }
}

```
