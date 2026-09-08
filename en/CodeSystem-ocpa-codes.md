# MOPA Local Code System - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## CodeSystem: MOPA Local Code System (Experimental) 

 
Local codes defined by the MOPA IG for concepts that do not yet have an established representation in LOINC, SNOMED CT, or mCODE. These codes are migration candidates and should be retired in favor of standard codes as they become available. 

**⚠ mCODE Migration Candidate**

This MOPA Local Code System is defined in this IG as a **temporary home** while a formal proposal to incorporate it into [mCODE STU5](http://hl7.org/fhir/us/mcode) is developed. It is **not** intended to be a permanent artifact of the MOPA IG. Once adopted by mCODE, this IG will remove its local definition and reference the mCODE canonical URL instead.

This artifact carries `status = draft` and `experimental = true`. Canonical URLs will change at migration. See the [mCODE Gap Proposals](mcode-gap-proposals.md) page for the full proposal backlog.

This Code system is referenced in the definition of the following value sets:

* This CodeSystem is not used here; it may be used elsewhere (e.g. specifications and/or implementations that use this content)

-------

 [Description of the above table(s)](http://build.fhir.org/ig/FHIR/ig-guidance/readingIgs.html#terminology). 



## Resource Content

```json
{
  "resourceType" : "CodeSystem",
  "id" : "ocpa-codes",
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
  "url" : "http://hl7.org/fhir/us/codex-mopa/CodeSystem/ocpa-codes",
  "version" : "0.1.1-snapshot-080926",
  "name" : "OcpaCodesCS",
  "title" : "MOPA Local Code System",
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
  "description" : "Local codes defined by the MOPA IG for concepts that do not yet have\nan established representation in LOINC, SNOMED CT, or mCODE. These codes are migration\ncandidates and should be retired in favor of standard codes as they become available.",
  "jurisdiction" : [{
    "coding" : [{
      "system" : "urn:iso:std:iso:3166",
      "code" : "US",
      "display" : "United States of America"
    }]
  }],
  "purpose" : "mCODE Migration Candidate — individual codes submitted to LOINC and SNOMED CT.\nThis code system will be retired once standard codes are assigned. It is NOT intended to\nbe a permanent artifact of this IG. See the mCODE Gap Proposals page for the full proposal backlog.",
  "caseSensitive" : true,
  "content" : "complete",
  "count" : 3,
  "concept" : [{
    "code" : "anti-cancer",
    "display" : "Anti-Cancer Component",
    "definition" : "A regimen component that is an anti-cancer therapeutic agent (e.g., cytotoxic, targeted, immunotherapy)."
  },
  {
    "code" : "supportive",
    "display" : "Supportive Care Component",
    "definition" : "A regimen component that is supportive (e.g., antiemetic, growth factor, steroid not used as anti-cancer therapy)."
  },
  {
    "code" : "premedication",
    "display" : "Premedication Component",
    "definition" : "A regimen component administered as premedication prior to the primary agent."
  }]
}

```
