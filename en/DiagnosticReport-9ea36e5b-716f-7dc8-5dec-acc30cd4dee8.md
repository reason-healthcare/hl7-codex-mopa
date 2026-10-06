# 9ea36e5b-716f-7dc8-5dec-acc30cd4dee8 - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example DiagnosticReport: 9ea36e5b-716f-7dc8-5dec-acc30cd4dee8

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
  * **Profile:** http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note: [Encounter: identifier = https://github.com/synthetichealth/synthea#324d4f70-205b-60cc-af17-52591ce4bfab (use: official, ); status = finished; class = ambulatory (ActCode#AMB); type = Gynecology service (qualifier value); period = 2018-03-05 15:02:48-0600 --> 2018-03-05 15:33:52-0600; reasonCode = Malignant neoplasm of breast (disorder)](Bundle-teran-breast-cancer-r4-clean.md#urn-uuid-324d4f70-205b-60cc-af17-52591ce4bfab)
* Metadata and profiles: Effective time
  * **Profile:** http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note: 2018-03-05 15:02:48-0600
* Metadata and profiles: Issued
  * **Profile:** http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note: 2018-03-05 15:02:48-0600
* Metadata and profiles: Performers
  * **Profile:** http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note: `Dr. Bertram Pyle`

### Attachments


```

2018-03-05

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

The following procedures were conducted:
- manual pelvic examination (procedure)
- cytopathology procedure, preparation of smear, genital source (procedure)

```



## Resource Content

```json
{
  "resourceType" : "DiagnosticReport",
  "id" : "9ea36e5b-716f-7dc8-5dec-acc30cd4dee8",
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
    "reference" : "urn:uuid:324d4f70-205b-60cc-af17-52591ce4bfab"
  },
  "effectiveDateTime" : "2018-03-05T15:02:48-06:00",
  "issued" : "2018-03-05T15:02:48.471-06:00",
  "performer" : [{
    "reference" : "Practitioner?identifier=http://hl7.org/fhir/sid/us-npi|9999968495",
    "display" : "Dr. Bertram Pyle"
  }],
  "presentedForm" : [{
    "contentType" : "text/plain; charset=utf-8",
    "data" : "CjIwMTgtMDMtMDUKCiMgQ2hpZWYgQ29tcGxhaW50Ck5vIGNvbXBsYWludHMuCgojIEhpc3Rvcnkgb2YgUHJlc2VudCBJbGxuZXNzCkp1bGlhMjQxIEp1bGlhMjQxIGlzIGEgNzUgeWVhci1vbGQgaGlzcGFuaWMgd2hpdGUgZmVtYWxlLgoKIyBTb2NpYWwgSGlzdG9yeQpQYXRpZW50IGlzIHNpbmdsZS4gUGF0aWVudCBxdWl0IHNtb2tpbmcgYXQgYWdlIDE2LgogUGF0aWVudCBpZGVudGlmaWVzIGFzIGhldGVyb3NleHVhbC4KClBhdGllbnQgY29tZXMgZnJvbSBhIG1pZGRsZSBzb2Npb2Vjb25vbWljIGJhY2tncm91bmQuCiBQYXRpZW50IGhhcyBjb21wbGV0ZWQgc29tZSBjb2xsZWdlIGNvdXJzZXMuClBhdGllbnQgY3VycmVudGx5IGhhcyBNZWRpY2FyZS4KCiMgQWxsZXJnaWVzCk5vIEtub3duIEFsbGVyZ2llcy4KCiMgTWVkaWNhdGlvbnMKTm8gQWN0aXZlIE1lZGljYXRpb25zLgoKIyBBc3Nlc3NtZW50IGFuZCBQbGFuCgoKCiMjIFBsYW4KClRoZSBmb2xsb3dpbmcgcHJvY2VkdXJlcyB3ZXJlIGNvbmR1Y3RlZDoKLSBtYW51YWwgcGVsdmljIGV4YW1pbmF0aW9uIChwcm9jZWR1cmUpCi0gY3l0b3BhdGhvbG9neSBwcm9jZWR1cmUsIHByZXBhcmF0aW9uIG9mIHNtZWFyLCBnZW5pdGFsIHNvdXJjZSAocHJvY2VkdXJlKQo="
  }]
}

```
