# Example: Pertuzumab MedicationRequest (PHD regimen, draft) - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example MedicationRequest: Example: Pertuzumab MedicationRequest (PHD regimen, draft)

Profile: [Cancer-Related Medication Request Profile](http://hl7.org/fhir/us/mcode/STU4/StructureDefinition-mcode-cancer-related-medication-request.html)

**status**: Draft

**intent**: Order

**medication**: pertuzumab

**subject**: [Jane Smith (official) Female, DoB: 1968-04-15 ( http://hospital.example.org/patients#MRN-78432)](Patient-MOPAPatientExample.md)

**requester**: [Practitioner Maria Lopez (official)](Practitioner-MOPAOncologistExample.md)

**reasonReference**: [Condition Malignant neoplasm of breast](Condition-MOPAMetastaticBreastCancerConditionExample.md)

### DosageInstructions

| | |
| :--- | :--- |
| - | **Text** |
| * | 840 mg IV cycle 1, then 420 mg IV q21d |



## Resource Content

```json
{
  "resourceType" : "MedicationRequest",
  "id" : "PertuzumabMedRequestPHD",
  "meta" : {
    "profile" : ["http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-request"]
  },
  "status" : "draft",
  "intent" : "order",
  "medicationCodeableConcept" : {
    "coding" : [{
      "system" : "http://www.nlm.nih.gov/research/umls/rxnorm",
      "code" : "1298944",
      "display" : "pertuzumab"
    }]
  },
  "subject" : {
    "reference" : "Patient/MOPAPatientExample"
  },
  "requester" : {
    "reference" : "Practitioner/MOPAOncologistExample"
  },
  "reasonReference" : [{
    "reference" : "Condition/MOPAMetastaticBreastCancerConditionExample"
  }],
  "dosageInstruction" : [{
    "text" : "840 mg IV cycle 1, then 420 mg IV q21d"
  }]
}

```
