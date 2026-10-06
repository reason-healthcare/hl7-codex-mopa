# 810f2d9d-89f3-1988-1b76-06f5d1e2ebd8 - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example DiagnosticReport: 810f2d9d-89f3-1988-1b76-06f5d1e2ebd8

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
  * **Profile:** http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note: [Encounter: identifier = https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-9843-105155e736bb (use: official, ); status = finished; class = ambulatory (ActCode#AMB); type = General examination of patient (procedure); period = 2018-04-23 22:05:30-0500 --> 2018-04-23 22:20:30-0500](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-9843-105155e736bb)
* Metadata and profiles: Effective time
  * **Profile:** http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note: 2018-04-23 22:05:30-0500
* Metadata and profiles: Issued
  * **Profile:** http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note: 2018-04-23 22:05:30-0500
* Metadata and profiles: Performers
  * **Profile:** http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note: `Dr. Bertram Pyle`

### Attachments


```

2018-04-23

# Chief Complaint
No complaints.

# History of Present Illness
Julia241 Julia241 is a 75 year-old hispanic white female.

# Social History
Patient is single. Patient quit smoking at age 16.
 Patient identifies as heterosexual.

Patient comes from a middle socioeconomic background.
 Patient has completed some college courses.
Patient currently has Medicare.

# Allergies
No Known Allergies.

# Medications
No Active Medications.

# Assessment and Plan



## Plan
Patient was given the following immunizations: influenza, split virus, trivalent, pf. 

```



## Resource Content

```json
{
  "resourceType" : "DiagnosticReport",
  "id" : "810f2d9d-89f3-1988-1b76-06f5d1e2ebd8",
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
    "reference" : "urn:uuid:324d4f70-205b-60cc-9843-105155e736bb"
  },
  "effectiveDateTime" : "2018-04-23T22:05:30-05:00",
  "issued" : "2018-04-23T22:05:30.471-05:00",
  "performer" : [{
    "reference" : "Practitioner?identifier=http://hl7.org/fhir/sid/us-npi|9999790493",
    "display" : "Dr. Bertram Pyle"
  }],
  "presentedForm" : [{
    "contentType" : "text/plain; charset=utf-8",
    "data" : "CjIwMTgtMDQtMjMKCiMgQ2hpZWYgQ29tcGxhaW50Ck5vIGNvbXBsYWludHMuCgojIEhpc3Rvcnkgb2YgUHJlc2VudCBJbGxuZXNzCkp1bGlhMjQxIEp1bGlhMjQxIGlzIGEgNzUgeWVhci1vbGQgaGlzcGFuaWMgd2hpdGUgZmVtYWxlLgoKIyBTb2NpYWwgSGlzdG9yeQpQYXRpZW50IGlzIHNpbmdsZS4gUGF0aWVudCBxdWl0IHNtb2tpbmcgYXQgYWdlIDE2LgogUGF0aWVudCBpZGVudGlmaWVzIGFzIGhldGVyb3NleHVhbC4KClBhdGllbnQgY29tZXMgZnJvbSBhIG1pZGRsZSBzb2Npb2Vjb25vbWljIGJhY2tncm91bmQuCiBQYXRpZW50IGhhcyBjb21wbGV0ZWQgc29tZSBjb2xsZWdlIGNvdXJzZXMuClBhdGllbnQgY3VycmVudGx5IGhhcyBNZWRpY2FyZS4KCiMgQWxsZXJnaWVzCk5vIEtub3duIEFsbGVyZ2llcy4KCiMgTWVkaWNhdGlvbnMKTm8gQWN0aXZlIE1lZGljYXRpb25zLgoKIyBBc3Nlc3NtZW50IGFuZCBQbGFuCgoKCiMjIFBsYW4KUGF0aWVudCB3YXMgZ2l2ZW4gdGhlIGZvbGxvd2luZyBpbW11bml6YXRpb25zOiBpbmZsdWVuemEsIHNwbGl0IHZpcnVzLCB0cml2YWxlbnQsIHBmLiAK"
  }]
}

```
