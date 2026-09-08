# Example: CDS Hooks order-sign draftOrders Bundle (TH regimen) - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example Bundle: Example: CDS Hooks order-sign draftOrders Bundle (TH regimen)



## Resource Content

```json
{
  "resourceType" : "Bundle",
  "id" : "ExampleOrderSignBundle",
  "type" : "collection",
  "entry" : [{
    "fullUrl" : "http://hl7.org/fhir/us/codex-mopa/RequestGroup/THRegimenOrder",
    "resource" : {
      "resourceType" : "RequestGroup",
      "id" : "THRegimenOrder",
      "meta" : {
        "profile" : ["http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-requestgroup"]
      },
      "text" : {
        "status" : "extensions",
        "div" : "<div xmlns=\"http://www.w3.org/1999/xhtml\"><a name=\"RequestGroup_THRegimenOrder\"> </a><p class=\"res-header-id\"><b>Generated Narrative: RequestGroup THRegimenOrder</b></p><a name=\"THRegimenOrder\"> </a><a name=\"hcTHRegimenOrder\"> </a><div style=\"display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%\"><p style=\"margin-bottom: 0px\"/><p style=\"margin-bottom: 0px\">Profile: <a href=\"StructureDefinition-anticancer-regimen-requestgroup.html\">Anti-Cancer Regimen RequestGroup</a></p></div><p><b>Request Category</b>: <span title=\"Codes:{http://snomed.info/sct 373846009}\">Adjuvant - intent</span></p><p><b>Request Category</b>: <span title=\"Codes:{http://hl7.org/fhir/us/codex-mopa/CodeSystem/treatment-line-cs 1L}\">First-line</span></p><p><b>instantiatesCanonical</b>: <a href=\"PlanDefinition-RegimenTH.html\">TH: Paclitaxel + Trastuzumab (Weekly) — HER2+ Breast Cancer</a></p><p><b>status</b>: Draft</p><p><b>intent</b>: Order</p><p><b>subject</b>: <a href=\"Patient-MOPAPatientExample.html\">Jane Smith (official) Female, DoB: 1968-04-15 ( http://hospital.example.org/patients#MRN-78432)</a></p><blockquote><p><b>action</b></p><blockquote><p><b>id</b></p>paclitaxel-th-action</blockquote><p><b>title</b>: Paclitaxel 80 mg/m² IV — days 1, 8, 15 of 21-day cycle</p><p><b>timing</b>: Once per 21 days</p><p><b>resource</b>: <a href=\"MedicationRequest-PaclitaxelMedRequestTH.html\">MedicationRequest: status = draft; intent = order; medication[x] = paclitaxel</a></p></blockquote><blockquote><p><b>action</b></p><blockquote><p><b>id</b></p>trastuzumab-th-action</blockquote><p><b>title</b>: Trastuzumab IV — days 1, 8, 15 of 21-day cycle</p><p><b>timing</b>: Once per 21 days</p><p><b>resource</b>: <a href=\"MedicationRequest-TrastuzumabMedRequestTH.html\">MedicationRequest: status = draft; intent = order; medication[x] = trastuzumab</a></p></blockquote></div>"
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
      "instantiatesCanonical" : ["http://hl7.org/fhir/us/codex-mopa/PlanDefinition/RegimenTH"],
      "status" : "draft",
      "intent" : "order",
      "subject" : {
        "reference" : "Patient/MOPAPatientExample"
      },
      "action" : [{
        "id" : "paclitaxel-th-action",
        "title" : "Paclitaxel 80 mg/m² IV — days 1, 8, 15 of 21-day cycle",
        "timingTiming" : {
          "extension" : [{
            "extension" : [{
              "url" : "day",
              "valueInteger" : 1
            },
            {
              "url" : "day",
              "valueInteger" : 8
            },
            {
              "url" : "day",
              "valueInteger" : 15
            }],
            "url" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle"
          }],
          "repeat" : {
            "period" : 21,
            "periodUnit" : "d"
          }
        },
        "resource" : {
          "reference" : "MedicationRequest/PaclitaxelMedRequestTH"
        }
      },
      {
        "id" : "trastuzumab-th-action",
        "title" : "Trastuzumab IV — days 1, 8, 15 of 21-day cycle",
        "timingTiming" : {
          "extension" : [{
            "extension" : [{
              "url" : "day",
              "valueInteger" : 1
            },
            {
              "url" : "day",
              "valueInteger" : 8
            },
            {
              "url" : "day",
              "valueInteger" : 15
            }],
            "url" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle"
          }],
          "repeat" : {
            "period" : 21,
            "periodUnit" : "d"
          }
        },
        "resource" : {
          "reference" : "MedicationRequest/TrastuzumabMedRequestTH"
        }
      }]
    }
  },
  {
    "fullUrl" : "http://hl7.org/fhir/us/codex-mopa/MedicationRequest/PaclitaxelMedRequestTH",
    "resource" : {
      "resourceType" : "MedicationRequest",
      "id" : "PaclitaxelMedRequestTH",
      "meta" : {
        "profile" : ["http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-request"]
      },
      "text" : {
        "status" : "generated",
        "div" : "<div xmlns=\"http://www.w3.org/1999/xhtml\"><a name=\"MedicationRequest_PaclitaxelMedRequestTH\"> </a><p class=\"res-header-id\"><b>Generated Narrative: MedicationRequest PaclitaxelMedRequestTH</b></p><a name=\"PaclitaxelMedRequestTH\"> </a><a name=\"hcPaclitaxelMedRequestTH\"> </a><div style=\"display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%\"><p style=\"margin-bottom: 0px\"/><p style=\"margin-bottom: 0px\">Profile: <a href=\"http://hl7.org/fhir/us/mcode/STU4/StructureDefinition-mcode-cancer-related-medication-request.html\">Cancer-Related Medication Request Profile</a></p></div><p><b>status</b>: Draft</p><p><b>intent</b>: Order</p><p><b>medication</b>: <span title=\"Codes:{http://www.nlm.nih.gov/research/umls/rxnorm 56946}\">paclitaxel</span></p><p><b>subject</b>: <a href=\"Patient-MOPAPatientExample.html\">Jane Smith (official) Female, DoB: 1968-04-15 ( http://hospital.example.org/patients#MRN-78432)</a></p><p><b>requester</b>: <a href=\"Practitioner-MOPAOncologistExample.html\">Practitioner Maria Lopez (official)</a></p><p><b>reasonReference</b>: <a href=\"Condition-MOPABreastCancerConditionExample.html\">Condition Malignant neoplasm of breast</a></p><h3>DosageInstructions</h3><table class=\"grid\"><tr><td style=\"display: none\">-</td><td><b>Text</b></td></tr><tr><td style=\"display: none\">*</td><td>80 mg/m² IV over 1 hour, weekly</td></tr></table></div>"
      },
      "status" : "draft",
      "intent" : "order",
      "medicationCodeableConcept" : {
        "coding" : [{
          "system" : "http://www.nlm.nih.gov/research/umls/rxnorm",
          "code" : "56946",
          "display" : "paclitaxel"
        }]
      },
      "subject" : {
        "reference" : "Patient/MOPAPatientExample"
      },
      "requester" : {
        "reference" : "Practitioner/MOPAOncologistExample"
      },
      "reasonReference" : [{
        "reference" : "Condition/MOPABreastCancerConditionExample"
      }],
      "dosageInstruction" : [{
        "text" : "80 mg/m² IV over 1 hour, weekly"
      }]
    }
  },
  {
    "fullUrl" : "http://hl7.org/fhir/us/codex-mopa/MedicationRequest/TrastuzumabMedRequestTH",
    "resource" : {
      "resourceType" : "MedicationRequest",
      "id" : "TrastuzumabMedRequestTH",
      "meta" : {
        "profile" : ["http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-request"]
      },
      "text" : {
        "status" : "generated",
        "div" : "<div xmlns=\"http://www.w3.org/1999/xhtml\"><a name=\"MedicationRequest_TrastuzumabMedRequestTH\"> </a><p class=\"res-header-id\"><b>Generated Narrative: MedicationRequest TrastuzumabMedRequestTH</b></p><a name=\"TrastuzumabMedRequestTH\"> </a><a name=\"hcTrastuzumabMedRequestTH\"> </a><div style=\"display: inline-block; background-color: #d9e0e7; padding: 6px; margin: 4px; border: 1px solid #8da1b4; border-radius: 5px; line-height: 60%\"><p style=\"margin-bottom: 0px\"/><p style=\"margin-bottom: 0px\">Profile: <a href=\"http://hl7.org/fhir/us/mcode/STU4/StructureDefinition-mcode-cancer-related-medication-request.html\">Cancer-Related Medication Request Profile</a></p></div><p><b>status</b>: Draft</p><p><b>intent</b>: Order</p><p><b>medication</b>: <span title=\"Codes:{http://www.nlm.nih.gov/research/umls/rxnorm 224905}\">trastuzumab</span></p><p><b>subject</b>: <a href=\"Patient-MOPAPatientExample.html\">Jane Smith (official) Female, DoB: 1968-04-15 ( http://hospital.example.org/patients#MRN-78432)</a></p><p><b>requester</b>: <a href=\"Practitioner-MOPAOncologistExample.html\">Practitioner Maria Lopez (official)</a></p><p><b>reasonReference</b>: <a href=\"Condition-MOPABreastCancerConditionExample.html\">Condition Malignant neoplasm of breast</a></p><h3>DosageInstructions</h3><table class=\"grid\"><tr><td style=\"display: none\">-</td><td><b>Text</b></td></tr><tr><td style=\"display: none\">*</td><td>4 mg/kg IV loading dose week 1, then 2 mg/kg IV weekly</td></tr></table></div>"
      },
      "status" : "draft",
      "intent" : "order",
      "medicationCodeableConcept" : {
        "coding" : [{
          "system" : "http://www.nlm.nih.gov/research/umls/rxnorm",
          "code" : "224905",
          "display" : "trastuzumab"
        }]
      },
      "subject" : {
        "reference" : "Patient/MOPAPatientExample"
      },
      "requester" : {
        "reference" : "Practitioner/MOPAOncologistExample"
      },
      "reasonReference" : [{
        "reference" : "Condition/MOPABreastCancerConditionExample"
      }],
      "dosageInstruction" : [{
        "text" : "4 mg/kg IV loading dose week 1, then 2 mg/kg IV weekly"
      }]
    }
  }]
}

```
