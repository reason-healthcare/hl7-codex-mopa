# Treatment Line Value Set - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## ValueSet: Treatment Line Value Set (Experimental) 

 
Codes representing the ordinal line of systemic anti-cancer therapy. Used by LineOfTherapyRequestCategory for the patient-specific RequestGroup category. 
**mCODE Migration Candidate** — Proposed for mCODE STU5. 

 **References** 

* [Line of Therapy Request Category](StructureDefinition-line-of-therapy-request-category.md)

**⚠ mCODE Migration Candidate**

This Treatment Line Value Set is defined in this IG as a **temporary home** while a formal proposal to incorporate it into [mCODE STU5](http://hl7.org/fhir/us/mcode) is developed. It is **not** intended to be a permanent artifact of the MOPA IG. Once adopted by mCODE, this IG will remove its local definition and reference the mCODE canonical URL instead.

This artifact carries `status = draft` and `experimental = true`. Canonical URLs will change at migration. See the [mCODE Gap Proposals](mcode-gap-proposals.md) page for the full proposal backlog.

### Logical Definition (CLD)

 

### Expansion

-------

 [Description of the above table(s)](http://build.fhir.org/ig/FHIR/ig-guidance/readingIgs.html#terminology). 



## Resource Content

```json
{
  "resourceType" : "ValueSet",
  "id" : "treatment-line-vs",
  "extension" : [{
    "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-wg",
    "valueCode" : "cic"
  },
  {
    "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
    "valueCode" : "informative",
    "_valueCode" : {
      "extension" : [{
        "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-conformance-derivedFrom",
        "valueCanonical" : "http://hl7.org/fhir/us/codex-mopa/ImplementationGuide/hl7.fhir.us.codex-mopa"
      }]
    }
  }],
  "url" : "http://hl7.org/fhir/us/codex-mopa/ValueSet/treatment-line-vs",
  "version" : "0.1.1-snapshot-080926",
  "name" : "TreatmentLineVS",
  "title" : "Treatment Line Value Set",
  "status" : "draft",
  "experimental" : true,
  "date" : "2026-09-08T18:17:28-04:00",
  "publisher" : "HL7 International / Clinical Interoperability Council",
  "contact" : [{
    "name" : "HL7 International / Clinical Interoperability Council",
    "telecom" : [{
      "system" : "url",
      "value" : "http://www.hl7.org/Special/committees/cic"
    },
    {
      "system" : "email",
      "value" : "ciclist@lists.HL7.org"
    }]
  }],
  "description" : "Codes representing the ordinal line of systemic anti-cancer therapy.\nUsed by LineOfTherapyRequestCategory for the patient-specific RequestGroup category.\n\n**mCODE Migration Candidate** — Proposed for mCODE STU5.",
  "jurisdiction" : [{
    "coding" : [{
      "system" : "urn:iso:std:iso:3166",
      "code" : "US",
      "display" : "United States of America"
    }]
  }],
  "purpose" : "mCODE Migration Candidate — proposed for mCODE STU5. Will bind to SNOMED CT or\nsuccessor codes once TreatmentLineCS migrates. It is NOT intended to be a permanent\nartifact of this IG. See the mCODE Gap Proposals page for the full proposal backlog.",
  "compose" : {
    "include" : [{
      "system" : "http://hl7.org/fhir/us/codex-mopa/CodeSystem/treatment-line-cs"
    }]
  }
}

```
