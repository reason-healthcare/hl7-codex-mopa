# Example: Primary HER2+ Breast Cancer (Stage IIB) - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example Condition: Example: Primary HER2+ Breast Cancer (Stage IIB)

Profile: [Primary Cancer Condition Profile](http://hl7.org/fhir/us/mcode/STU4/StructureDefinition-mcode-primary-cancer-condition.html)

**clinicalStatus**: Active

**verificationStatus**: Confirmed

**category**: Problem List Item

**code**: Malignant neoplasm of breast

**bodySite**: Left breast structure (body structure)

**subject**: [Jane Smith (official) Female, DoB: 1968-04-15 ( http://hospital.example.org/patients#MRN-78432)](Patient-MOPAPatientExample.md)

**onset**: 2025-11-03



## Resource Content

```json
{
  "resourceType" : "Condition",
  "id" : "MOPABreastCancerConditionExample",
  "meta" : {
    "profile" : ["http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-primary-cancer-condition"]
  },
  "clinicalStatus" : {
    "coding" : [{
      "system" : "http://terminology.hl7.org/CodeSystem/condition-clinical",
      "code" : "active"
    }]
  },
  "verificationStatus" : {
    "coding" : [{
      "system" : "http://terminology.hl7.org/CodeSystem/condition-ver-status",
      "code" : "confirmed"
    }]
  },
  "category" : [{
    "coding" : [{
      "system" : "http://terminology.hl7.org/CodeSystem/condition-category",
      "code" : "problem-list-item"
    }]
  }],
  "code" : {
    "coding" : [{
      "system" : "http://snomed.info/sct",
      "code" : "254837009",
      "display" : "Malignant neoplasm of breast"
    }]
  },
  "bodySite" : [{
    "coding" : [{
      "system" : "http://snomed.info/sct",
      "code" : "80248007",
      "display" : "Left breast structure (body structure)"
    }]
  }],
  "subject" : {
    "reference" : "Patient/MOPAPatientExample"
  },
  "onsetDateTime" : "2025-11-03"
}

```
