# Treatment Line Code System - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## CodeSystem: Treatment Line Code System (Experimental) 

 
Ordinal codes representing the line of systemic anti-cancer therapy. These codes are used in TreatmentLineVS and in the LineOfTherapyRequestCategory constraint profile for the RequestGroup `lineOfTherapy` category slice. 
**mCODE Migration Candidate** — These codes are proposed for adoption in mCODE STU5 or as a SNOMED CT extension request. Once standard codes are available, this code system should be deprecated. 

**⚠ mCODE Migration Candidate**

This Treatment Line Code System is defined in this IG as a **temporary home** while a formal proposal to incorporate it into [mCODE STU5](http://hl7.org/fhir/us/mcode) is developed. It is **not** intended to be a permanent artifact of the MOPA IG. Once adopted by mCODE, this IG will remove its local definition and reference the mCODE canonical URL instead.

This artifact carries `status = draft` and `experimental = true`. Canonical URLs will change at migration. See the [mCODE Gap Proposals](mcode-gap-proposals.md) page for the full proposal backlog.

This Code system is referenced in the definition of the following value sets:

* [TreatmentLineVS](ValueSet-treatment-line-vs.md)

-------

 [Description of the above table(s)](http://build.fhir.org/ig/FHIR/ig-guidance/readingIgs.html#terminology). 



## Resource Content

```json
{
  "resourceType" : "CodeSystem",
  "id" : "treatment-line-cs",
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
  "url" : "http://hl7.org/fhir/us/codex-mopa/CodeSystem/treatment-line-cs",
  "version" : "0.1.1-snapshot-080926",
  "name" : "TreatmentLineCS",
  "title" : "Treatment Line Code System",
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
  "description" : "Ordinal codes representing the line of systemic anti-cancer therapy.\nThese codes are used in TreatmentLineVS and in the LineOfTherapyRequestCategory constraint\nprofile for the RequestGroup `lineOfTherapy` category slice.\n\n**mCODE Migration Candidate** — These codes are proposed for adoption in mCODE STU5\nor as a SNOMED CT extension request. Once standard codes are available, this code\nsystem should be deprecated.",
  "jurisdiction" : [{
    "coding" : [{
      "system" : "urn:iso:std:iso:3166",
      "code" : "US",
      "display" : "United States of America"
    }]
  }],
  "purpose" : "mCODE Migration Candidate — proposed for adoption in mCODE STU5 or as a SNOMED CT\nextension request. Once standard codes are available this code system will be deprecated.\nIt is NOT intended to be a permanent artifact of this IG. See the mCODE Gap Proposals page\nfor the migration plan.",
  "caseSensitive" : true,
  "content" : "complete",
  "count" : 4,
  "concept" : [{
    "code" : "1L",
    "display" : "First-line",
    "definition" : "The first line of systemic anti-cancer therapy for this indication."
  },
  {
    "code" : "2L",
    "display" : "Second-line",
    "definition" : "The second line of systemic anti-cancer therapy; administered after first-line therapy failure, progression, or intolerance."
  },
  {
    "code" : "3L-plus",
    "display" : "Third-line or later",
    "definition" : "The third or any subsequent line of systemic anti-cancer therapy."
  },
  {
    "code" : "maintenance",
    "display" : "Maintenance",
    "definition" : "Maintenance therapy administered to prolong response after induction or consolidation treatment."
  }]
}

```
