# Anti-Cancer Regimen PlanDefinition - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Resource Profile: Anti-Cancer Regimen PlanDefinition ( Experimental ) 

 
A canonical, reusable anti-cancer therapy regimen definition represented as a FHIR PlanDefinition order set. This resource is NOT patient-specific; it is referenced by AntiCancerRegimenRequestGroup instances via RequestGroup.instantiatesCanonical. 
A regimen definition describes the protocol — component drugs, timing, cycle structure, and sequential phase ordering. Treatment intent and line of therapy are patient-specific ordering categories and are carried on the RequestGroup via the category extension; this canonical definition does not carry those attributes. 
**mCODE Migration Candidate** — This profile is proposed for inclusion in mCODE STU5. It addresses the gap documented in the mCODE gap analysis: mCODE does not currently represent anti-cancer regimens as first-class, computable entities. 

**⚠ mCODE Migration Candidate**

This Anti-Cancer Regimen PlanDefinition profile is defined in this IG as a **temporary home** while a formal proposal to incorporate it into [mCODE STU5](http://hl7.org/fhir/us/mcode) is developed. It is **not** intended to be a permanent artifact of the MOPA IG. Once adopted by mCODE, this IG will remove its local definition and reference the mCODE canonical URL instead.

This artifact carries `status = draft` and `experimental = true`. Canonical URLs will change at migration. See the [mCODE Gap Proposals](mcode-gap-proposals.md) page for the full proposal backlog.

**Usages:**

* Examples for this Profile: [RegimenDdACT](PlanDefinition-RegimenDdACT.md), [RegimenPHD](PlanDefinition-RegimenPHD.md) and [RegimenTH](PlanDefinition-RegimenTH.md)
* CapabilityStatements using this Profile: [Oncology CRD Client Capability Statement](CapabilityStatement-ocpa-crd-client.md) and [Oncology CRD Service Capability Statement](CapabilityStatement-ocpa-crd-service.md)

You can also check for [usages in the FHIR IG Statistics](https://packages2.fhir.org/xig/resource/hl7.fhir.us.codex-mopa|current/StructureDefinition/StructureDefinition-anticancer-regimen-plandefinition.json)

### Formal Views of Profile Content

 [Description Differentials, Snapshots, and other representations](http://build.fhir.org/ig/FHIR/ig-guidance/readingIgs.html#structure-definitions). 

 

Other representations of profile: [CSV](../StructureDefinition-anticancer-regimen-plandefinition.csv), [Excel](../StructureDefinition-anticancer-regimen-plandefinition.xlsx), [Schematron](../StructureDefinition-anticancer-regimen-plandefinition.sch) 



## Resource Content

```json
{
  "resourceType" : "StructureDefinition",
  "id" : "anticancer-regimen-plandefinition",
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
  "url" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-plandefinition",
  "version" : "0.1.1-snapshot-080926",
  "name" : "AntiCancerRegimenPlanDefinition",
  "title" : "Anti-Cancer Regimen PlanDefinition",
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
  "description" : "A canonical, reusable anti-cancer therapy regimen definition represented\nas a FHIR PlanDefinition order set. This resource is NOT patient-specific; it is\nreferenced by AntiCancerRegimenRequestGroup instances via RequestGroup.instantiatesCanonical.\n\nA regimen definition describes the protocol — component drugs, timing, cycle structure,\nand sequential phase ordering. Treatment intent and line of therapy are patient-specific\nordering categories and are carried on the RequestGroup via the category extension; this\ncanonical definition does not carry those attributes.\n\n**mCODE Migration Candidate** — This profile is proposed for inclusion in mCODE STU5.\nIt addresses the gap documented in the mCODE gap analysis: mCODE does not currently\nrepresent anti-cancer regimens as first-class, computable entities.",
  "jurisdiction" : [{
    "coding" : [{
      "system" : "urn:iso:std:iso:3166",
      "code" : "US",
      "display" : "United States of America"
    }]
  }],
  "purpose" : "mCODE Migration Candidate — proposed for mCODE STU5. This artifact is defined in the\nMOPA IG as a temporary home while a formal mCODE ballot proposal is prepared. It is NOT\nintended to be a permanent artifact of this IG. Canonical URLs will change at migration.\nSee the mCODE Gap Proposals page in this IG for the full proposal backlog.",
  "fhirVersion" : "4.0.1",
  "mapping" : [{
    "identity" : "workflow",
    "uri" : "http://hl7.org/fhir/workflow",
    "name" : "Workflow Pattern"
  },
  {
    "identity" : "w5",
    "uri" : "http://hl7.org/fhir/fivews",
    "name" : "FiveWs Pattern Mapping"
  },
  {
    "identity" : "objimpl",
    "uri" : "http://hl7.org/fhir/object-implementation",
    "name" : "Object Implementation Information"
  },
  {
    "identity" : "rim",
    "uri" : "http://hl7.org/v3",
    "name" : "RIM Mapping"
  }],
  "kind" : "resource",
  "abstract" : false,
  "type" : "PlanDefinition",
  "baseDefinition" : "http://hl7.org/fhir/StructureDefinition/PlanDefinition",
  "derivation" : "constraint",
  "differential" : {
    "element" : [{
      "id" : "PlanDefinition",
      "path" : "PlanDefinition"
    },
    {
      "id" : "PlanDefinition.version",
      "path" : "PlanDefinition.version",
      "mustSupport" : true
    },
    {
      "id" : "PlanDefinition.name",
      "path" : "PlanDefinition.name",
      "mustSupport" : true
    },
    {
      "id" : "PlanDefinition.title",
      "path" : "PlanDefinition.title",
      "min" : 1,
      "mustSupport" : true
    },
    {
      "id" : "PlanDefinition.type",
      "path" : "PlanDefinition.type",
      "min" : 1,
      "patternCodeableConcept" : {
        "coding" : [{
          "system" : "http://terminology.hl7.org/CodeSystem/plan-definition-type",
          "code" : "order-set",
          "display" : "Order Set"
        }]
      },
      "mustSupport" : true
    },
    {
      "id" : "PlanDefinition.subject[x]",
      "path" : "PlanDefinition.subject[x]",
      "short" : "Cancer type for which this regimen is designed (e.g., SNOMED CT malignant neoplasm code)",
      "min" : 1,
      "type" : [{
        "code" : "CodeableConcept"
      }],
      "mustSupport" : true
    },
    {
      "id" : "PlanDefinition.description",
      "path" : "PlanDefinition.description",
      "mustSupport" : true
    },
    {
      "id" : "PlanDefinition.action",
      "path" : "PlanDefinition.action",
      "min" : 1,
      "mustSupport" : true
    },
    {
      "id" : "PlanDefinition.action.title",
      "path" : "PlanDefinition.action.title",
      "short" : "Drug name or phase name (e.g., 'Paclitaxel', 'AC Phase')",
      "min" : 1,
      "mustSupport" : true
    },
    {
      "id" : "PlanDefinition.action.description",
      "path" : "PlanDefinition.action.description",
      "mustSupport" : true
    },
    {
      "id" : "PlanDefinition.action.relatedAction",
      "path" : "PlanDefinition.action.relatedAction",
      "mustSupport" : true
    },
    {
      "id" : "PlanDefinition.action.relatedAction.relationship",
      "path" : "PlanDefinition.action.relatedAction.relationship",
      "short" : "Use 'after-end' for sequential phase ordering (e.g., AC phase → T phase)"
    },
    {
      "id" : "PlanDefinition.action.timing[x]",
      "path" : "PlanDefinition.action.timing[x]",
      "slicing" : {
        "discriminator" : [{
          "type" : "type",
          "path" : "$this"
        }],
        "ordered" : false,
        "rules" : "open"
      }
    },
    {
      "id" : "PlanDefinition.action.timing[x]:timingTiming",
      "path" : "PlanDefinition.action.timing[x]",
      "sliceName" : "timingTiming",
      "short" : "Cycle period (e.g., every 7 days, every 21 days)",
      "min" : 0,
      "max" : "1",
      "type" : [{
        "code" : "Timing"
      }],
      "mustSupport" : true
    },
    {
      "id" : "PlanDefinition.action.definition[x]",
      "path" : "PlanDefinition.action.definition[x]",
      "slicing" : {
        "discriminator" : [{
          "type" : "type",
          "path" : "$this"
        }],
        "ordered" : false,
        "rules" : "open"
      }
    },
    {
      "id" : "PlanDefinition.action.definition[x]:definitionCanonical",
      "path" : "PlanDefinition.action.definition[x]",
      "sliceName" : "definitionCanonical",
      "min" : 0,
      "max" : "1",
      "type" : [{
        "code" : "canonical",
        "targetProfile" : ["http://hl7.org/fhir/StructureDefinition/ActivityDefinition",
        "http://hl7.org/fhir/StructureDefinition/PlanDefinition",
        "http://hl7.org/fhir/StructureDefinition/Questionnaire"]
      }],
      "mustSupport" : true
    },
    {
      "id" : "PlanDefinition.action.action",
      "path" : "PlanDefinition.action.action",
      "type" : [{
        "code" : "BackboneElement"
      }],
      "mustSupport" : true
    },
    {
      "id" : "PlanDefinition.action.action.title",
      "path" : "PlanDefinition.action.action.title",
      "min" : 1,
      "mustSupport" : true
    },
    {
      "id" : "PlanDefinition.action.action.timing[x]",
      "path" : "PlanDefinition.action.action.timing[x]",
      "slicing" : {
        "discriminator" : [{
          "type" : "type",
          "path" : "$this"
        }],
        "ordered" : false,
        "rules" : "open"
      }
    },
    {
      "id" : "PlanDefinition.action.action.timing[x]:timingTiming",
      "path" : "PlanDefinition.action.action.timing[x]",
      "sliceName" : "timingTiming",
      "min" : 0,
      "max" : "1",
      "type" : [{
        "code" : "Timing"
      }],
      "mustSupport" : true
    },
    {
      "id" : "PlanDefinition.action.action.definition[x]",
      "path" : "PlanDefinition.action.action.definition[x]",
      "slicing" : {
        "discriminator" : [{
          "type" : "type",
          "path" : "$this"
        }],
        "ordered" : false,
        "rules" : "open"
      }
    },
    {
      "id" : "PlanDefinition.action.action.definition[x]:definitionCanonical",
      "path" : "PlanDefinition.action.action.definition[x]",
      "sliceName" : "definitionCanonical",
      "short" : "ActivityDefinition defining the component drug",
      "min" : 0,
      "max" : "1",
      "type" : [{
        "code" : "canonical",
        "targetProfile" : ["http://hl7.org/fhir/StructureDefinition/ActivityDefinition",
        "http://hl7.org/fhir/StructureDefinition/PlanDefinition",
        "http://hl7.org/fhir/StructureDefinition/Questionnaire"]
      }],
      "mustSupport" : true
    }]
  }
}

```
