# Treatment Intent Request Category - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Extension: Treatment Intent Request Category (Experimental) 

Constrains the Da Vinci CRD Request Category extension for a patient-specific anti-cancer regimen treatment-intent category. The instance extension URL remains `http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category`; this profile adds oncology terminology semantics only. Its use on RequestGroup requires the proposed CRD RequestGroup extension-context expansion.

**mCODE Migration Candidate** — This constraint profile and its terminology semantics are proposed for inclusion in mCODE STU5; the underlying extension remains owned by Da Vinci CRD.

**Context of Use**

**Usage info**

**Usages:**

* Use this Extension: [Anti-Cancer Regimen RequestGroup](StructureDefinition-anticancer-regimen-requestgroup.md)

You can also check for [usages in the FHIR IG Statistics](https://packages2.fhir.org/xig/resource/hl7.fhir.us.codex-mopa|current/StructureDefinition/StructureDefinition-treatment-intent-request-category.json)

### Formal Views of Extension Content

 [Description Differentials, Snapshots, and other representations](http://build.fhir.org/ig/FHIR/ig-guidance/readingIgs.html#structure-definitions). 

 

Other representations of profile: [CSV](../StructureDefinition-treatment-intent-request-category.csv), [Excel](../StructureDefinition-treatment-intent-request-category.xlsx), [Schematron](../StructureDefinition-treatment-intent-request-category.sch) 



## Resource Content

```json
{
  "resourceType" : "StructureDefinition",
  "id" : "treatment-intent-request-category",
  "extension" : [{
    "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
    "valueCode" : "draft"
  },
  {
    "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-fmm",
    "valueInteger" : 0
  },
  {
    "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-wg",
    "valueCode" : "cic"
  }],
  "url" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/treatment-intent-request-category",
  "version" : "0.1.1-snapshot-080926",
  "name" : "TreatmentIntentRequestCategory",
  "title" : "Treatment Intent Request Category",
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
  "description" : "Constrains the Da Vinci CRD Request Category extension for a\npatient-specific anti-cancer regimen treatment-intent category. The instance extension URL\nremains `http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category`; this\nprofile adds oncology terminology semantics only. Its use on RequestGroup requires the proposed\nCRD RequestGroup extension-context expansion.\n\n**mCODE Migration Candidate** — This constraint profile and its terminology semantics are\nproposed for inclusion in mCODE STU5; the underlying extension remains owned by Da Vinci CRD.",
  "jurisdiction" : [{
    "coding" : [{
      "system" : "urn:iso:std:iso:3166",
      "code" : "US",
      "display" : "United States of America"
    }]
  }],
  "purpose" : "mCODE Migration Candidate — proposed for mCODE STU5. This artifact defines\noncology treatment-intent semantics for the CRD Request Category without introducing a second\nextension URL. It is NOT intended to be a permanent artifact of this IG. Canonical URLs will\nchange at migration.",
  "fhirVersion" : "4.0.1",
  "mapping" : [{
    "identity" : "rim",
    "uri" : "http://hl7.org/v3",
    "name" : "RIM Mapping"
  }],
  "kind" : "complex-type",
  "abstract" : false,
  "context" : [{
    "type" : "element",
    "expression" : "RequestGroup"
  }],
  "type" : "Extension",
  "baseDefinition" : "http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category",
  "derivation" : "constraint",
  "differential" : {
    "element" : [{
      "id" : "Extension.value[x]",
      "path" : "Extension.value[x]",
      "short" : "Treatment intent for this patient-specific regimen order; coding system is SNOMED CT",
      "min" : 1,
      "mustSupport" : true,
      "binding" : {
        "strength" : "required",
        "valueSet" : "http://hl7.org/fhir/us/codex-mopa/ValueSet/regimen-intent-vs"
      }
    },
    {
      "id" : "Extension.value[x].coding",
      "path" : "Extension.value[x].coding",
      "min" : 1
    },
    {
      "id" : "Extension.value[x].coding.system",
      "path" : "Extension.value[x].coding.system",
      "patternUri" : "http://snomed.info/sct"
    }]
  }
}

```
