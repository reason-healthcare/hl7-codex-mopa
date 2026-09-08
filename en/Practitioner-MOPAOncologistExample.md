# Example Oncologist: Dr. Maria Lopez - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example Practitioner: Example Oncologist: Dr. Maria Lopez

Profile: [US Core Practitioner Profile](http://hl7.org/fhir/us/core/STU7/StructureDefinition-us-core-practitioner.html)

**identifier**: [United States National Provider Identifier](http://terminology.hl7.org/5.5.0/NamingSystem-npi.html)/1234567893

**name**: Maria Lopez (Official)



## Resource Content

```json
{
  "resourceType" : "Practitioner",
  "id" : "MOPAOncologistExample",
  "meta" : {
    "profile" : ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-practitioner"]
  },
  "identifier" : [{
    "system" : "http://hl7.org/fhir/sid/us-npi",
    "value" : "1234567893"
  }],
  "name" : [{
    "use" : "official",
    "family" : "Lopez",
    "given" : ["Maria"],
    "prefix" : ["Dr."]
  }]
}

```
