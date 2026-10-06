# Example: Cyclophosphamide MedicationRequest (ddAC→T regimen, draft) - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example MedicationRequest: Example: Cyclophosphamide MedicationRequest (ddAC→T regimen, draft)

Profile: [Cancer-Related Medication Request Profile](http://hl7.org/fhir/us/mcode/STU4/StructureDefinition-mcode-cancer-related-medication-request.html)

**status**: Draft

**intent**: Order

**medication**: cyclophosphamide

**subject**: [Jane Smith (official) Female, DoB: 1968-04-15 ( http://hospital.example.org/patients#MRN-78432)](Patient-MOPAPatientExample.md)

**requester**: [Practitioner Maria Lopez (official)](Practitioner-MOPAOncologistExample.md)

**reasonReference**: [Condition Malignant neoplasm of breast](Condition-MOPABreastCancerConditionExample.md)

### DosageInstructions

| | |
| :--- | :--- |
| - | **Text** |
| * | 600 mg/m² IV day 1 of each 14-day cycle |



## Resource Content

```json
{
  "resourceType" : "MedicationRequest",
  "id" : "CyclophosphamideMedRequestDDACT",
  "meta" : {
    "profile" : ["http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-request"]
  },
  "status" : "draft",
  "intent" : "order",
  "medicationCodeableConcept" : {
    "coding" : [{
      "system" : "http://www.nlm.nih.gov/research/umls/rxnorm",
      "code" : "3002",
      "display" : "cyclophosphamide"
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
    "text" : "600 mg/m² IV day 1 of each 14-day cycle"
  }]
}

```
