# 324d4f70-205b-60cc-3eca-e327cc5deb09 - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example Claim: 324d4f70-205b-60cc-3eca-e327cc5deb09

**status**: Active

**type**: Professional

**use**: Claim

**patient**: [Julia241 Julia241 Terán294](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-a081-24b98a0f139e)

**billablePeriod**: 2026-04-01 03:40:17-0500 --> 2026-04-01 04:05:18-0500

**created**: 2026-04-01 04:05:18-0500

**provider**: `OPEN ACCESS VASCULAR ACCESS CENTER INC`

**priority**: Normal

**facility**: `OPEN ACCESS VASCULAR ACCESS CENTER INC`

> **procedure****sequence**: 1**procedure**: [Procedure Manual pelvic examination (procedure)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-57cb-2e4d766f0fbf)

> **procedure****sequence**: 2**procedure**: [Procedure Cytopathology procedure, preparation of smear, genital source (procedure)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-f790-a0746ae2fee0)

### Insurances

| | | | |
| :--- | :--- | :--- | :--- |
| - | **Sequence** | **Focal** | **Coverage** |
| * | 1 | true | Medicare |

> **item****sequence**: 1**productOrService**: Gynecology service (qualifier value)**encounter**: [Encounter: identifier = https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-95ce-922e94744be4 (use: official, ); status = finished; class = ambulatory (ActCode#AMB); type = Gynecology service (qualifier value); period = 2026-04-01 03:40:17-0500 --> 2026-04-01 04:05:18-0500; reasonCode = Malignant neoplasm of breast (disorder)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-95ce-922e94744be4)

> **item****sequence**: 2**procedureSequence**: 1**productOrService**: Manual pelvic examination (procedure)

### Nets

| | | |
| :--- | :--- | :--- |
| - | **Value** | **Currency** |
| * | 123.17 | United States dollar |


> **item****sequence**: 3**procedureSequence**: 2**productOrService**: Cytopathology procedure, preparation of smear, genital source (procedure)

### Nets

| | | |
| :--- | :--- | :--- |
| - | **Value** | **Currency** |
| * | 4926.8 | United States dollar |


### Totals

| | | |
| :--- | :--- | :--- |
| - | **Value** | **Currency** |
| * | 5156.78 | United States dollar |



## Resource Content

```json
{
  "resourceType" : "Claim",
  "id" : "324d4f70-205b-60cc-3eca-e327cc5deb09",
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
    "start" : "2026-04-01T03:40:17-05:00",
    "end" : "2026-04-01T04:05:18-05:00"
  },
  "created" : "2026-04-01T04:05:18-05:00",
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
      "reference" : "urn:uuid:324d4f70-205b-60cc-57cb-2e4d766f0fbf"
    }
  },
  {
    "sequence" : 2,
    "procedureReference" : {
      "reference" : "urn:uuid:324d4f70-205b-60cc-f790-a0746ae2fee0"
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
        "code" : "310061009",
        "display" : "Gynecology service (qualifier value)"
      }],
      "text" : "Gynecology service (qualifier value)"
    },
    "encounter" : [{
      "reference" : "urn:uuid:324d4f70-205b-60cc-95ce-922e94744be4"
    }]
  },
  {
    "sequence" : 2,
    "procedureSequence" : [1],
    "productOrService" : {
      "coding" : [{
        "system" : "http://snomed.info/sct",
        "code" : "35025007",
        "display" : "Manual pelvic examination (procedure)"
      }],
      "text" : "Manual pelvic examination (procedure)"
    },
    "net" : {
      "value" : 123.17,
      "currency" : "USD"
    }
  },
  {
    "sequence" : 3,
    "procedureSequence" : [2],
    "productOrService" : {
      "coding" : [{
        "system" : "http://snomed.info/sct",
        "code" : "90226004",
        "display" : "Cytopathology procedure, preparation of smear, genital source (procedure)"
      }],
      "text" : "Cytopathology procedure, preparation of smear, genital source (procedure)"
    },
    "net" : {
      "value" : 4926.8,
      "currency" : "USD"
    }
  }],
  "total" : {
    "value" : 5156.78,
    "currency" : "USD"
  }
}

```
