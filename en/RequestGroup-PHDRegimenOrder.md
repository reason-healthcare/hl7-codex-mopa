# Example Regimen Order: PHD (Jane Smith, First-Line Metastatic HER2+) - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example RequestGroup: Example Regimen Order: PHD (Jane Smith, First-Line Metastatic HER2+)

Profile: [Anti-Cancer Regimen RequestGroup](StructureDefinition-anticancer-regimen-requestgroup.md)

**Request Category**: Palliative intent

**Request Category**: First-line

**instantiatesCanonical**: [PHD: Pertuzumab + Trastuzumab + Docetaxel — Metastatic HER2+ Breast Cancer](PlanDefinition-RegimenPHD.md)

**status**: Draft

**intent**: Order

**subject**: [Jane Smith (official) Female, DoB: 1968-04-15 ( http://hospital.example.org/patients#MRN-78432)](Patient-MOPAPatientExample.md)

> **action**
> **id**pertuzumab-phd-action
**title**: Pertuzumab IV day 1 q21d**timing**: Once per 21 days**resource**: [MedicationRequest: status = draft; intent = order; medication[x] = pertuzumab](MedicationRequest-PertuzumabMedRequestPHD.md)

> **action**
> **id**trastuzumab-phd-action
**title**: Trastuzumab IV day 1 q21d**timing**: Once per 21 days**resource**: [MedicationRequest: status = draft; intent = order; medication[x] = trastuzumab](MedicationRequest-TrastuzumabMedRequestPHD.md)

> **action**
> **id**docetaxel-phd-action
**title**: Docetaxel 75 mg/m² IV day 1 q21d**timing**: Once per 21 days**resource**: [MedicationRequest: status = draft; intent = order; medication[x] = docetaxel](MedicationRequest-DocetaxelMedRequestPHD.md)



## Resource Content

```json
{
  "resourceType" : "RequestGroup",
  "id" : "PHDRegimenOrder",
  "meta" : {
    "profile" : ["http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-requestgroup"]
  },
  "extension" : [{
    "url" : "http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category",
    "valueCodeableConcept" : {
      "coding" : [{
        "system" : "http://snomed.info/sct",
        "code" : "363676003",
        "display" : "Palliative intent"
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
  "instantiatesCanonical" : ["http://hl7.org/fhir/us/codex-mopa/PlanDefinition/RegimenPHD"],
  "status" : "draft",
  "intent" : "order",
  "subject" : {
    "reference" : "Patient/MOPAPatientExample"
  },
  "action" : [{
    "id" : "pertuzumab-phd-action",
    "title" : "Pertuzumab IV day 1 q21d",
    "timingTiming" : {
      "extension" : [{
        "extension" : [{
          "url" : "day",
          "valueInteger" : 1
        }],
        "url" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle"
      }],
      "repeat" : {
        "period" : 21,
        "periodUnit" : "d"
      }
    },
    "resource" : {
      "reference" : "MedicationRequest/PertuzumabMedRequestPHD"
    }
  },
  {
    "id" : "trastuzumab-phd-action",
    "title" : "Trastuzumab IV day 1 q21d",
    "timingTiming" : {
      "extension" : [{
        "extension" : [{
          "url" : "day",
          "valueInteger" : 1
        }],
        "url" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle"
      }],
      "repeat" : {
        "period" : 21,
        "periodUnit" : "d"
      }
    },
    "resource" : {
      "reference" : "MedicationRequest/TrastuzumabMedRequestPHD"
    }
  },
  {
    "id" : "docetaxel-phd-action",
    "title" : "Docetaxel 75 mg/m² IV day 1 q21d",
    "timingTiming" : {
      "extension" : [{
        "extension" : [{
          "url" : "day",
          "valueInteger" : 1
        }],
        "url" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle"
      }],
      "repeat" : {
        "period" : 21,
        "periodUnit" : "d"
      }
    },
    "resource" : {
      "reference" : "MedicationRequest/DocetaxelMedRequestPHD"
    }
  }]
}

```
