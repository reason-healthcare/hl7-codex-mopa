# Data Requirement Label - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Extension: Data Requirement Label (Experimental) 

A human-readable label that identifies a DataRequirement entry within an OncologyDataRequirementsLibrary. Used by tools such as DTR questionnaire generators and CRD content viewers to display requirement names without parsing profile URLs.

The first DataRequirement entry in every condition-specific Library (the primary cancer condition) SHALL carry a label of the canonical form '[Cancer Type] Diagnosis' (e.g., 'Breast Cancer Diagnosis') to make the diagnostic prerequisite explicit and machine-discoverable.

**mCODE Migration Candidate** — Proposed for inclusion in mCODE STU5.

**Context of Use**

### Overview

The `DataRequirementLabel` extension attaches a short, human-readable name to a `DataRequirement` entry within an `OncologyDataRequirementsLibrary`. This allows DTR questionnaire generators, CRD content viewers, and other tooling to display requirement names without parsing profile URLs.

### Usage

Apply this extension to any `DataRequirement` entry in a condition-specific Library instance. The first `DataRequirement` in every Library (the primary cancer condition, required by invariant `ocpa-dr-1`) **SHALL** carry a label of the canonical form `[Cancer Type] Diagnosis` (e.g., `Breast Cancer Diagnosis`). All other entries **SHOULD** carry descriptive labels.

### Constraints Summary

* Applied only to `DataRequirement` elements (context: `DataRequirement`)
* Value is a `string` — a short, human-readable name for the requirement
* First DataRequirement label convention: `[Cancer Type] Diagnosis`

**Usage info**

**Usages:**

* This Extension is not used by any profiles in this Specification

You can also check for [usages in the FHIR IG Statistics](https://packages2.fhir.org/xig/resource/hl7.fhir.us.codex-mopa|current/StructureDefinition/StructureDefinition-data-requirement-label.json)

### Formal Views of Extension Content

 [Description Differentials, Snapshots, and other representations](http://build.fhir.org/ig/FHIR/ig-guidance/readingIgs.html#structure-definitions). 

 

Other representations of profile: [CSV](../StructureDefinition-data-requirement-label.csv), [Excel](../StructureDefinition-data-requirement-label.xlsx), [Schematron](../StructureDefinition-data-requirement-label.sch) 



## Resource Content

```json
{
  "resourceType" : "StructureDefinition",
  "id" : "data-requirement-label",
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
  "url" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/data-requirement-label",
  "version" : "0.1.1-snapshot-080926",
  "name" : "DataRequirementLabel",
  "title" : "Data Requirement Label",
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
  "description" : "A human-readable label that identifies a DataRequirement entry within an\nOncologyDataRequirementsLibrary. Used by tools such as DTR questionnaire generators and CRD\ncontent viewers to display requirement names without parsing profile URLs.\n\nThe first DataRequirement entry in every condition-specific Library (the primary cancer\ncondition) SHALL carry a label of the canonical form '[Cancer Type] Diagnosis'\n(e.g., 'Breast Cancer Diagnosis') to make the diagnostic prerequisite explicit and\nmachine-discoverable.\n\n**mCODE Migration Candidate** — Proposed for inclusion in mCODE STU5.",
  "jurisdiction" : [{
    "coding" : [{
      "system" : "urn:iso:std:iso:3166",
      "code" : "US",
      "display" : "United States of America"
    }]
  }],
  "purpose" : "mCODE Migration Candidate — proposed for mCODE STU5. This artifact is defined in the\nOGCA IG as a temporary home while a formal mCODE ballot proposal is prepared. It is NOT\nintended to be a permanent artifact of this IG. Canonical URLs will change at migration.\nSee the mCODE Candidates page in this IG for the full migration plan.",
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
    "expression" : "DataRequirement"
  }],
  "type" : "Extension",
  "baseDefinition" : "http://hl7.org/fhir/StructureDefinition/Extension",
  "derivation" : "constraint",
  "differential" : {
    "element" : [{
      "id" : "Extension",
      "path" : "Extension",
      "short" : "Data Requirement Label",
      "definition" : "A human-readable label that identifies a DataRequirement entry within an\nOncologyDataRequirementsLibrary. Used by tools such as DTR questionnaire generators and CRD\ncontent viewers to display requirement names without parsing profile URLs.\n\nThe first DataRequirement entry in every condition-specific Library (the primary cancer\ncondition) SHALL carry a label of the canonical form '[Cancer Type] Diagnosis'\n(e.g., 'Breast Cancer Diagnosis') to make the diagnostic prerequisite explicit and\nmachine-discoverable.\n\n**mCODE Migration Candidate** — Proposed for inclusion in mCODE STU5."
    },
    {
      "id" : "Extension.extension",
      "path" : "Extension.extension",
      "max" : "0"
    },
    {
      "id" : "Extension.url",
      "path" : "Extension.url",
      "fixedUri" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/data-requirement-label"
    },
    {
      "id" : "Extension.value[x]",
      "path" : "Extension.value[x]",
      "short" : "Human-readable label for this data requirement entry",
      "definition" : "A short, human-readable name for this data requirement entry\n(e.g., 'Breast Cancer Diagnosis', 'HER2 Status', 'ECOG Performance Status').\nThe first DataRequirement in each condition-specific Library SHALL use the form\n'[Cancer Type] Diagnosis' (e.g., 'Breast Cancer Diagnosis').",
      "type" : [{
        "code" : "string"
      }]
    }]
  }
}

```
