# Example Patient: Jane Smith - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example Patient: Example Patient: Jane Smith

Profile: [US Core Patient Profile](http://hl7.org/fhir/us/core/STU7/StructureDefinition-us-core-patient.html)

Jane Smith (official) Female, DoB: 1968-04-15 ( http://hospital.example.org/patients#MRN-78432)

-------

| | |
| :--- | :--- |
| Contact Detail | 42 Maple Street Springfield IL 62701 |



## Resource Content

```json
{
  "resourceType" : "Patient",
  "id" : "MOPAPatientExample",
  "meta" : {
    "profile" : ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"]
  },
  "identifier" : [{
    "system" : "http://hospital.example.org/patients",
    "value" : "MRN-78432"
  }],
  "name" : [{
    "use" : "official",
    "family" : "Smith",
    "given" : ["Jane"]
  }],
  "gender" : "female",
  "birthDate" : "1968-04-15",
  "address" : [{
    "line" : ["42 Maple Street"],
    "city" : "Springfield",
    "state" : "IL",
    "postalCode" : "62701"
  }]
}

```
