# 810f5b73-c6ec-3a7b-1b76-34cc0edc0ccb - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example DiagnosticReport: 810f5b73-c6ec-3a7b-1b76-34cc0edc0ccb

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
  * **Profile:** http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note: [Encounter: identifier = https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-3b24-763d02e12997 (use: official, ); status = finished; class = ambulatory (ActCode#AMB); type = Administration of vaccine to produce active immunity (procedure); period = 2021-03-22 22:05:30-0500 --> 2021-03-22 22:20:30-0500](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-3b24-763d02e12997)
* Metadata and profiles: Effective time
  * **Profile:** http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note: 2021-03-22 22:05:30-0500
* Metadata and profiles: Issued
  * **Profile:** http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note: 2021-03-22 22:05:30-0500
* Metadata and profiles: Performers
  * **Profile:** http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note: `Dr. Bertram Pyle`

### Attachments


```

2021-03-22

# Chief Complaint
No complaints.

# History of Present Illness
Julia241 Julia241 is a 78 year-old hispanic white female.

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
Patient was given the following immunizations: covid-19, mrna, lnp-s, pf, 100 mcg/0.5ml dose or 50 mcg/0.25ml dose. 

```



## Resource Content

```json
{
  "resourceType" : "DiagnosticReport",
  "id" : "810f5b73-c6ec-3a7b-1b76-34cc0edc0ccb",
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
    "reference" : "urn:uuid:324d4f70-205b-60cc-3b24-763d02e12997"
  },
  "effectiveDateTime" : "2021-03-22T22:05:30-05:00",
  "issued" : "2021-03-22T22:05:30.471-05:00",
  "performer" : [{
    "reference" : "Practitioner?identifier=http://hl7.org/fhir/sid/us-npi|9999968495",
    "display" : "Dr. Bertram Pyle"
  }],
  "presentedForm" : [{
    "contentType" : "text/plain; charset=utf-8",
    "data" : "CjIwMjEtMDMtMjIKCiMgQ2hpZWYgQ29tcGxhaW50Ck5vIGNvbXBsYWludHMuCgojIEhpc3Rvcnkgb2YgUHJlc2VudCBJbGxuZXNzCkp1bGlhMjQxIEp1bGlhMjQxIGlzIGEgNzggeWVhci1vbGQgaGlzcGFuaWMgd2hpdGUgZmVtYWxlLgoKIyBTb2NpYWwgSGlzdG9yeQpQYXRpZW50IGlzIHNpbmdsZS4gUGF0aWVudCBxdWl0IHNtb2tpbmcgYXQgYWdlIDE2LgogUGF0aWVudCBpZGVudGlmaWVzIGFzIGhldGVyb3NleHVhbC4KClBhdGllbnQgY29tZXMgZnJvbSBhIG1pZGRsZSBzb2Npb2Vjb25vbWljIGJhY2tncm91bmQuCiBQYXRpZW50IGhhcyBjb21wbGV0ZWQgc29tZSBjb2xsZWdlIGNvdXJzZXMuClBhdGllbnQgY3VycmVudGx5IGhhcyBNZWRpY2FyZS4KCiMgQWxsZXJnaWVzCk5vIEtub3duIEFsbGVyZ2llcy4KCiMgTWVkaWNhdGlvbnMKTm8gQWN0aXZlIE1lZGljYXRpb25zLgoKIyBBc3Nlc3NtZW50IGFuZCBQbGFuCgoKCiMjIFBsYW4KUGF0aWVudCB3YXMgZ2l2ZW4gdGhlIGZvbGxvd2luZyBpbW11bml6YXRpb25zOiBjb3ZpZC0xOSwgbXJuYSwgbG5wLXMsIHBmLCAxMDAgbWNnLzAuNW1sIGRvc2Ugb3IgNTAgbWNnLzAuMjVtbCBkb3NlLiAK"
  }]
}

```
