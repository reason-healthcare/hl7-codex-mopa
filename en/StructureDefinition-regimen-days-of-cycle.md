# Regimen Days of Cycle - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Extension: Regimen Days of Cycle 

Specifies the days within a repeating treatment cycle on which a regimen action is to be performed. Semantically identical to the HL7 core extension [timing-daysOfCycle](http://hl7.org/fhir/StructureDefinition/timing-daysOfCycle), but with context broadened to `Timing` so it can be applied to nested `RequestGroup.action.action` elements used in phased multi-agent regimens.

The cycle length is expressed via `Timing.repeat.period` / `Timing.repeat.periodUnit` on the same element. Day numbering starts at 1 (day 1 = first day of cycle 1).

This extension is a migration candidate for inclusion in the HL7 FHIR Extensions pack with an expanded context. See [regimen-model.html](regimen-model.md).

**Context of Use**

**⚠ mCODE Migration Candidate**

This Regimen Days of Cycle extension is defined in this IG as a **temporary home** while a formal proposal to incorporate it into [mCODE STU5](http://hl7.org/fhir/us/mcode) is developed. It is **not** intended to be a permanent artifact of the MOPA IG. Once adopted by mCODE, this IG will remove its local definition and reference the mCODE canonical URL instead.

This artifact carries `status = draft` and `experimental = true`. Canonical URLs will change at migration. See the [mCODE Gap Proposals](mcode-gap-proposals.md) page for the full proposal backlog.

**Usage info**

**Usages:**

* Examples for this Extension: [Bundle/ExampleOrderSelectBundle](Bundle-ExampleOrderSelectBundle.md), [Bundle/ExampleOrderSignBundle](Bundle-ExampleOrderSignBundle.md), [RegimenDdACT](PlanDefinition-RegimenDdACT.md), [RequestGroup/DDACTRegimenOrder](RequestGroup-DDACTRegimenOrder.md)... Show 2 more, [RequestGroup/PHDRegimenOrder](RequestGroup-PHDRegimenOrder.md) and [RequestGroup/THRegimenOrder](RequestGroup-THRegimenOrder.md)

You can also check for [usages in the FHIR IG Statistics](https://packages2.fhir.org/xig/resource/hl7.fhir.us.codex-mopa|current/StructureDefinition/StructureDefinition-regimen-days-of-cycle.json)

### Formal Views of Extension Content

 [Description Differentials, Snapshots, and other representations](http://build.fhir.org/ig/FHIR/ig-guidance/readingIgs.html#structure-definitions). 

 

Other representations of profile: [CSV](../StructureDefinition-regimen-days-of-cycle.csv), [Excel](../StructureDefinition-regimen-days-of-cycle.xlsx), [Schematron](../StructureDefinition-regimen-days-of-cycle.sch) 



## Resource Content

```json
{
  "resourceType" : "StructureDefinition",
  "id" : "regimen-days-of-cycle",
  "extension" : [{
    "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-wg",
    "valueCode" : "cic"
  },
  {
    "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-fmm",
    "valueInteger" : 0,
    "_valueInteger" : {
      "extension" : [{
        "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-conformance-derivedFrom",
        "valueCanonical" : "http://hl7.org/fhir/us/codex-mopa/ImplementationGuide/hl7.fhir.us.codex-mopa"
      }]
    }
  },
  {
    "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
    "valueCode" : "draft",
    "_valueCode" : {
      "extension" : [{
        "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-conformance-derivedFrom",
        "valueCanonical" : "http://hl7.org/fhir/us/codex-mopa/ImplementationGuide/hl7.fhir.us.codex-mopa"
      }]
    }
  }],
  "url" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle",
  "version" : "0.1.1-snapshot-080926",
  "name" : "RegimenDaysOfCycle",
  "title" : "Regimen Days of Cycle",
  "status" : "draft",
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
  "description" : "Specifies the days within a repeating treatment cycle on which a\nregimen action is to be performed. Semantically identical to the HL7 core extension\n[timing-daysOfCycle](http://hl7.org/fhir/StructureDefinition/timing-daysOfCycle),\nbut with context broadened to `Timing` so it can be applied to nested\n`RequestGroup.action.action` elements used in phased multi-agent regimens.\n\nThe cycle length is expressed via `Timing.repeat.period` / `Timing.repeat.periodUnit`\non the same element. Day numbering starts at 1 (day 1 = first day of cycle 1).\n\nThis extension is a migration candidate for inclusion in the HL7 FHIR Extensions\npack with an expanded context. See [regimen-model.html](regimen-model.html).",
  "jurisdiction" : [{
    "coding" : [{
      "system" : "urn:iso:std:iso:3166",
      "code" : "US",
      "display" : "United States of America"
    }]
  }],
  "purpose" : "mCODE Migration Candidate — proposed as a context-expansion request against\nhttp://hl7.org/fhir/StructureDefinition/timing-daysOfCycle in the HL7 FHIR Extensions pack.\nThis artifact is defined in the MOPA IG as a temporary home while that request is processed.\nIt is NOT intended to be a permanent artifact of this IG. Canonical URLs will change at\nmigration. See the mCODE Gap Proposals page in this IG for the full proposal backlog.",
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
    "expression" : "Timing"
  },
  {
    "type" : "element",
    "expression" : "PlanDefinition.action"
  },
  {
    "type" : "element",
    "expression" : "RequestGroup.action"
  }],
  "type" : "Extension",
  "baseDefinition" : "http://hl7.org/fhir/StructureDefinition/Extension",
  "derivation" : "constraint",
  "differential" : {
    "element" : [{
      "id" : "Extension",
      "path" : "Extension",
      "short" : "Regimen Days of Cycle",
      "definition" : "Specifies the days within a repeating treatment cycle on which a\nregimen action is to be performed. Semantically identical to the HL7 core extension\n[timing-daysOfCycle](http://hl7.org/fhir/StructureDefinition/timing-daysOfCycle),\nbut with context broadened to `Timing` so it can be applied to nested\n`RequestGroup.action.action` elements used in phased multi-agent regimens.\n\nThe cycle length is expressed via `Timing.repeat.period` / `Timing.repeat.periodUnit`\non the same element. Day numbering starts at 1 (day 1 = first day of cycle 1).\n\nThis extension is a migration candidate for inclusion in the HL7 FHIR Extensions\npack with an expanded context. See [regimen-model.html](regimen-model.html)."
    },
    {
      "id" : "Extension.extension",
      "path" : "Extension.extension",
      "min" : 1
    },
    {
      "id" : "Extension.extension:day",
      "path" : "Extension.extension",
      "sliceName" : "day",
      "short" : "Day(s) of the cycle on which the action is performed",
      "definition" : "An integer specifying a day within the cycle on which\nthis action is performed. 1 = first day of cycle 1. Multiple repetitions indicate\nmultiple administration days within the same cycle (e.g., 1, 8, 15 for weekly dosing\nin a 21-day cycle).",
      "min" : 1,
      "max" : "*"
    },
    {
      "id" : "Extension.extension:day.extension",
      "path" : "Extension.extension.extension",
      "max" : "0"
    },
    {
      "id" : "Extension.extension:day.url",
      "path" : "Extension.extension.url",
      "fixedUri" : "day"
    },
    {
      "id" : "Extension.extension:day.value[x]",
      "path" : "Extension.extension.value[x]",
      "min" : 1,
      "type" : [{
        "code" : "integer"
      }]
    },
    {
      "id" : "Extension.url",
      "path" : "Extension.url",
      "fixedUri" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle"
    },
    {
      "id" : "Extension.value[x]",
      "path" : "Extension.value[x]",
      "max" : "0"
    }]
  }
}

```
