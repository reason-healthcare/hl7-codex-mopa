# 324d4f70-205b-60cc-7fda-a04a956dcc4e - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example Claim: 324d4f70-205b-60cc-7fda-a04a956dcc4e

**status**: Active

**type**: Professional

**use**: Claim

**patient**: [Julia241 Julia241 Terán294](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-a081-24b98a0f139e)

**billablePeriod**: 2020-03-27 18:21:20-0500 --> 2020-03-27 18:38:20-0500

**created**: 2020-03-27 18:38:20-0500

**provider**: `OPEN ACCESS VASCULAR ACCESS CENTER INC`

**priority**: Normal

**facility**: `OPEN ACCESS VASCULAR ACCESS CENTER INC`

### Procedures

| | | |
| :--- | :--- | :--- |
| - | **Sequence** | **Procedure[x]** |
| * | 1 | [Procedure Mammography (procedure)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-d22e-a00332260b6a) |

### Insurances

| | | | |
| :--- | :--- | :--- | :--- |
| - | **Sequence** | **Focal** | **Coverage** |
| * | 1 | true | Medicare |

> **item****sequence**: 1**productOrService**: Screening surveillance (regime/therapy)**encounter**: [Encounter: identifier = https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-8033-ba5bdb4eee1c (use: official, ); status = finished; class = ambulatory (ActCode#AMB); type = Screening surveillance (regime/therapy); period = 2020-03-27 18:21:20-0500 --> 2020-03-27 18:38:20-0500; reasonCode = Malignant neoplasm of breast (disorder)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-8033-ba5bdb4eee1c)

> **item****sequence**: 2**procedureSequence**: 1**productOrService**: Mammography (procedure)

### Nets

| | | |
| :--- | :--- | :--- |
| - | **Value** | **Currency** |
| * | 118.82 | United States dollar |


### Totals

| | | |
| :--- | :--- | :--- |
| - | **Value** | **Currency** |
| * | 225.63 | United States dollar |



## Resource Content

```json
{
  "resourceType" : "Claim",
  "id" : "324d4f70-205b-60cc-7fda-a04a956dcc4e",
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
    "start" : "2020-03-27T18:21:20-05:00",
    "end" : "2020-03-27T18:38:20-05:00"
  },
  "created" : "2020-03-27T18:38:20-05:00",
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
      "reference" : "urn:uuid:324d4f70-205b-60cc-d22e-a00332260b6a"
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
        "code" : "410410006",
        "display" : "Screening surveillance (regime/therapy)"
      }],
      "text" : "Screening surveillance (regime/therapy)"
    },
    "encounter" : [{
      "reference" : "urn:uuid:324d4f70-205b-60cc-8033-ba5bdb4eee1c"
    }]
  },
  {
    "sequence" : 2,
    "procedureSequence" : [1],
    "productOrService" : {
      "coding" : [{
        "system" : "http://snomed.info/sct",
        "code" : "71651007",
        "display" : "Mammography (procedure)"
      }],
      "text" : "Mammography (procedure)"
    },
    "net" : {
      "value" : 118.82,
      "currency" : "USD"
    }
  }],
  "total" : {
    "value" : 225.63,
    "currency" : "USD"
  }
}

```
