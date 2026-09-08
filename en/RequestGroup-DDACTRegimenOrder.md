# Example Regimen Order: ddAC→T (Jane Smith, Adjuvant) — Sequential Phases - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example RequestGroup: Example Regimen Order: ddAC→T (Jane Smith, Adjuvant) — Sequential Phases

Profile: [Anti-Cancer Regimen RequestGroup](StructureDefinition-anticancer-regimen-requestgroup.md)

**Request Category**: Adjuvant - intent

**Request Category**: First-line

**instantiatesCanonical**: [ddAC→T: Dose-Dense Doxorubicin/Cyclophosphamide then Paclitaxel — Breast Cancer](PlanDefinition-RegimenDdACT.md)

**status**: Draft

**intent**: Order

**subject**: [Jane Smith (official) Female, DoB: 1968-04-15 ( http://hospital.example.org/patients#MRN-78432)](Patient-MOPAPatientExample.md)

> **action**
> **id**ac-phase-order
**title**: AC Phase (Cycles 1–4, q14d)**timing**: Count 4 times, Once per 14 days
> **action**
> **id**doxorubicin-action
**title**: Doxorubicin 60 mg/m² IV day 1**timing**: Once per 14 days**resource**: [MedicationRequest: status = draft; intent = order; medication[x] = doxorubicin](MedicationRequest-DoxorubicinMedRequestDDACT.md)

> **action**
> **id**cyclophosphamide-action
**title**: Cyclophosphamide 600 mg/m² IV day 1**timing**: Once per 14 days**resource**: [MedicationRequest: status = draft; intent = order; medication[x] = cyclophosphamide](MedicationRequest-CyclophosphamideMedRequestDDACT.md)

> **action**
> **id**pegfilgrastim-action
**title**: Pegfilgrastim 6 mg subcutaneous day 2**timing**: Once per 14 days**resource**: [MedicationRequest: status = draft; intent = order; medication[x] = pegfilgrastim](MedicationRequest-PegfilgrastimMedRequestDDACT.md)

> **action**
> **id**t-phase-order
**title**: T Phase — Paclitaxel (Cycles 5–8, q14d)

### RelatedActions

| | | |
| :--- | :--- | :--- |
| - | **ActionId** | **Relationship** |
| * | ac-phase-order | After End |

**timing**: Count 4 times, Once per 14 days
> **action**
> **id**paclitaxel-t-action
**title**: Paclitaxel 175 mg/m² IV day 1**timing**: Once per 14 days**resource**: [MedicationRequest: status = draft; intent = order; medication[x] = paclitaxel](MedicationRequest-PaclitaxelMedRequestTPHase.md)



## Resource Content

```json
{
  "resourceType" : "RequestGroup",
  "id" : "DDACTRegimenOrder",
  "meta" : {
    "profile" : ["http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-requestgroup"]
  },
  "extension" : [{
    "url" : "http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category",
    "valueCodeableConcept" : {
      "coding" : [{
        "system" : "http://snomed.info/sct",
        "code" : "373846009",
        "display" : "Adjuvant - intent"
      }]
    }
  },
  {
    "url" : "http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category",
    "valueCodeableConcept" : {
      "coding" : [{
        "system" : "http://hl7.org/fhir/us/codex-mopa/CodeSystem/treatment-line-cs",
        "code" : "1L",
        "display" : "First-line"
      }]
    }
  }],
  "instantiatesCanonical" : ["http://hl7.org/fhir/us/codex-mopa/PlanDefinition/RegimenDdACT"],
  "status" : "draft",
  "intent" : "order",
  "subject" : {
    "reference" : "Patient/MOPAPatientExample"
  },
  "action" : [{
    "id" : "ac-phase-order",
    "title" : "AC Phase (Cycles 1–4, q14d)",
    "timingTiming" : {
      "repeat" : {
        "count" : 4,
        "period" : 14,
        "periodUnit" : "d"
      }
    },
    "action" : [{
      "id" : "doxorubicin-action",
      "title" : "Doxorubicin 60 mg/m² IV day 1",
      "timingTiming" : {
        "extension" : [{
          "extension" : [{
            "url" : "day",
            "valueInteger" : 1
          }],
          "url" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle"
        }],
        "repeat" : {
          "period" : 14,
          "periodUnit" : "d"
        }
      },
      "resource" : {
        "reference" : "MedicationRequest/DoxorubicinMedRequestDDACT"
      }
    },
    {
      "id" : "cyclophosphamide-action",
      "title" : "Cyclophosphamide 600 mg/m² IV day 1",
      "timingTiming" : {
        "extension" : [{
          "extension" : [{
            "url" : "day",
            "valueInteger" : 1
          }],
          "url" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle"
        }],
        "repeat" : {
          "period" : 14,
          "periodUnit" : "d"
        }
      },
      "resource" : {
        "reference" : "MedicationRequest/CyclophosphamideMedRequestDDACT"
      }
    },
    {
      "id" : "pegfilgrastim-action",
      "title" : "Pegfilgrastim 6 mg subcutaneous day 2",
      "timingTiming" : {
        "extension" : [{
          "extension" : [{
            "url" : "day",
            "valueInteger" : 2
          }],
          "url" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle"
        }],
        "repeat" : {
          "period" : 14,
          "periodUnit" : "d"
        }
      },
      "resource" : {
        "reference" : "MedicationRequest/PegfilgrastimMedRequestDDACT"
      }
    }]
  },
  {
    "id" : "t-phase-order",
    "title" : "T Phase — Paclitaxel (Cycles 5–8, q14d)",
    "relatedAction" : [{
      "actionId" : "ac-phase-order",
      "relationship" : "after-end"
    }],
    "timingTiming" : {
      "repeat" : {
        "count" : 4,
        "period" : 14,
        "periodUnit" : "d"
      }
    },
    "action" : [{
      "id" : "paclitaxel-t-action",
      "title" : "Paclitaxel 175 mg/m² IV day 1",
      "timingTiming" : {
        "extension" : [{
          "extension" : [{
            "url" : "day",
            "valueInteger" : 1
          }],
          "url" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle"
        }],
        "repeat" : {
          "period" : 14,
          "periodUnit" : "d"
        }
      },
      "resource" : {
        "reference" : "MedicationRequest/PaclitaxelMedRequestTPHase"
      }
    }]
  }]
}

```
