# bb3b3d35-1dab-d9c1-b72f-d11b97622fd3 - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example DiagnosticReport: bb3b3d35-1dab-d9c1-b72f-d11b97622fd3

Structured data from this resource. The JSON and XML tabs provide the complete FHIR representation.

* Metadata and profiles: Status
  * **Profile:** http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note: Final
* Metadata and profiles: Categories
  * **Profile:** http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note: History and physical note
* Metadata and profiles: Report type
  * **Profile:** http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note: History and physical note
* Metadata and profiles: Subject
  * **Profile:** http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note: [Julia Julia Terán (official) Female, DoB: 1942-11-30 ( https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-a081-24b98a0f139e)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-a081-24b98a0f139e)
* Metadata and profiles: Encounter
  * **Profile:** http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note: [Encounter: identifier = https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-58cf-1e7016b4cbfa (use: official, ); status = finished; class = ambulatory (ActCode#AMB); type = Encounter for symptom (procedure); period = 1985-07-25 22:05:30-0500 --> 1985-07-27 08:08:17-0500; reasonCode = Malignant neoplasm of breast (disorder)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-58cf-1e7016b4cbfa)
* Metadata and profiles: Effective time
  * **Profile:** http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note: 1985-07-25 22:05:30-0500
* Metadata and profiles: Issued
  * **Profile:** http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note: 1985-07-25 22:05:30-0500
* Metadata and profiles: Performers
  * **Profile:** http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note: `Dr. Bertram Pyle`

### Attachments


```

1985-07-25

# Chief Complaint
No complaints.

# History of Present Illness
Julia241 Julia241 is a 42 year-old hispanic white female.

# Social History
Patient is single. Patient quit smoking at age 16.
 Patient identifies as heterosexual.

Patient comes from a middle socioeconomic background.
 Patient has completed some college courses.
Patient currently has Anthem.

# Allergies
No Known Allergies.

# Medications
No Active Medications.

# Assessment and Plan
Patient is presenting with malignant neoplasm of breast (disorder). 


## Plan


```



## Resource Content

```json
{
  "resourceType" : "DiagnosticReport",
  "id" : "bb3b3d35-1dab-d9c1-b72f-d11b97622fd3",
  "meta" : {
    "profile" : ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"]
  },
  "status" : "final",
  "category" : [{
    "coding" : [{
      "system" : "http://loinc.org",
      "code" : "34117-2",
      "display" : "History and physical note"
    },
    {
      "system" : "http://loinc.org",
      "code" : "51847-2",
      "display" : "Evaluation + Plan note"
    }]
  }],
  "code" : {
    "coding" : [{
      "system" : "http://loinc.org",
      "code" : "34117-2",
      "display" : "History and physical note"
    },
    {
      "system" : "http://loinc.org",
      "code" : "51847-2",
      "display" : "Evaluation + Plan note"
    }]
  },
  "subject" : {
    "reference" : "urn:uuid:324d4f70-205b-60cc-a081-24b98a0f139e"
  },
  "encounter" : {
    "reference" : "urn:uuid:324d4f70-205b-60cc-58cf-1e7016b4cbfa"
  },
  "effectiveDateTime" : "1985-07-25T22:05:30-05:00",
  "issued" : "1985-07-25T22:05:30.471-05:00",
  "performer" : [{
    "reference" : "Practitioner?identifier=http://hl7.org/fhir/sid/us-npi|9999968495",
    "display" : "Dr. Bertram Pyle"
  }],
  "presentedForm" : [{
    "contentType" : "text/plain; charset=utf-8",
    "data" : "CjE5ODUtMDctMjUKCiMgQ2hpZWYgQ29tcGxhaW50Ck5vIGNvbXBsYWludHMuCgojIEhpc3Rvcnkgb2YgUHJlc2VudCBJbGxuZXNzCkp1bGlhMjQxIEp1bGlhMjQxIGlzIGEgNDIgeWVhci1vbGQgaGlzcGFuaWMgd2hpdGUgZmVtYWxlLgoKIyBTb2NpYWwgSGlzdG9yeQpQYXRpZW50IGlzIHNpbmdsZS4gUGF0aWVudCBxdWl0IHNtb2tpbmcgYXQgYWdlIDE2LgogUGF0aWVudCBpZGVudGlmaWVzIGFzIGhldGVyb3NleHVhbC4KClBhdGllbnQgY29tZXMgZnJvbSBhIG1pZGRsZSBzb2Npb2Vjb25vbWljIGJhY2tncm91bmQuCiBQYXRpZW50IGhhcyBjb21wbGV0ZWQgc29tZSBjb2xsZWdlIGNvdXJzZXMuClBhdGllbnQgY3VycmVudGx5IGhhcyBBbnRoZW0uCgojIEFsbGVyZ2llcwpObyBLbm93biBBbGxlcmdpZXMuCgojIE1lZGljYXRpb25zCk5vIEFjdGl2ZSBNZWRpY2F0aW9ucy4KCiMgQXNzZXNzbWVudCBhbmQgUGxhbgpQYXRpZW50IGlzIHByZXNlbnRpbmcgd2l0aCBtYWxpZ25hbnQgbmVvcGxhc20gb2YgYnJlYXN0IChkaXNvcmRlcikuIAoKCiMjIFBsYW4KCg=="
  }]
}

```
