# Regimen Intent Value Set - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## ValueSet: Regimen Intent Value Set (Experimental) 

 
The clinical intent of an anti-cancer regimen. All codes are drawn from the SNOMED CT "Intents (nature of procedure values)" hierarchy (363675004). 
**mCODE Migration Candidate** — Proposed for mCODE STU5. 

 **References** 

* [Treatment Intent Request Category](StructureDefinition-treatment-intent-request-category.md)

**⚠ mCODE Migration Candidate**

This Regimen Intent Value Set is defined in this IG as a **temporary home** while a formal proposal to incorporate it into [mCODE STU5](http://hl7.org/fhir/us/mcode) is developed. It is **not** intended to be a permanent artifact of the MOPA IG. Once adopted by mCODE, this IG will remove its local definition and reference the mCODE canonical URL instead.

This artifact carries `status = draft` and `experimental = true`. Canonical URLs will change at migration. See the [mCODE Gap Proposals](mcode-gap-proposals.md) page for the full proposal backlog.

### Logical Definition (CLD)

 

### Expansion

-------

 [Description of the above table(s)](http://build.fhir.org/ig/FHIR/ig-guidance/readingIgs.html#terminology). 



## Resource Content

```json
{
  "resourceType" : "ValueSet",
  "id" : "regimen-intent-vs",
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
  "url" : "http://hl7.org/fhir/us/codex-mopa/ValueSet/regimen-intent-vs",
  "version" : "0.1.1-snapshot-080926",
  "name" : "RegimenIntentVS",
  "title" : "Regimen Intent Value Set",
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
  "description" : "The clinical intent of an anti-cancer regimen. All codes are drawn from\nthe SNOMED CT \\\"Intents (nature of procedure values)\\\" hierarchy (363675004).\n\n**mCODE Migration Candidate** — Proposed for mCODE STU5.",
  "jurisdiction" : [{
    "coding" : [{
      "system" : "urn:iso:std:iso:3166",
      "code" : "US",
      "display" : "United States of America"
    }]
  }],
  "purpose" : "mCODE Migration Candidate — proposed for mCODE STU5. All codes are sourced from\nSNOMED CT (no local codes required). This value set will reference the mCODE canonical URL\nonce adopted. It is NOT intended to be a permanent artifact of this IG. See the mCODE\nCandidates page for the migration plan.",
  "compose" : {
    "include" : [{
      "system" : "http://snomed.info/sct",
      "concept" : [{
        "code" : "373808002",
        "display" : "Curative - procedure intent"
      },
      {
        "code" : "363676003",
        "display" : "Palliative intent"
      },
      {
        "code" : "373846009",
        "display" : "Adjuvant - intent"
      },
      {
        "code" : "373847000",
        "display" : "Neoadjuvant intent"
      },
      {
        "code" : "399707004",
        "display" : "Supportive - procedure intent"
      }]
    }]
  }
}

```
