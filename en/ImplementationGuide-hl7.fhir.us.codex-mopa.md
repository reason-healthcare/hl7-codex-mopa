# Resource MOPA — Medical Oncology Prior Authorization



## Resource Content

```json
{
  "resourceType" : "ImplementationGuide",
  "id" : "hl7.fhir.us.codex-mopa",
  "language" : "en",
  "extension" : [{
    "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
    "valueCode" : "draft"
  },
  {
    "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-wg",
    "valueCode" : "cic"
  },
  {
    "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-fmm",
    "valueInteger" : 0
  }],
  "url" : "http://hl7.org/fhir/us/codex-mopa/ImplementationGuide/hl7.fhir.us.codex-mopa",
  "version" : "0.1.1-snapshot-080926",
  "name" : "MOPAIG",
  "title" : "MOPA — Medical Oncology Prior Authorization",
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
  "description" : "Informative Medical Oncology Prior Authorization (MOPA) framework covering all cancer types and documenting upstream proposal gaps for Da Vinci CRD/DTR/PAS and mCODE. The guide uses breast cancer prior authorization as the first concrete use case and data requirements implementation.",
  "jurisdiction" : [{
    "coding" : [{
      "system" : "urn:iso:std:iso:3166",
      "code" : "US",
      "display" : "United States of America"
    }]
  }],
  "packageId" : "hl7.fhir.us.codex-mopa",
  "license" : "CC0-1.0",
  "fhirVersion" : ["4.0.1"],
  "dependsOn" : [{
    "id" : "hl7tx",
    "extension" : [{
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/implementationguide-dependency-comment",
      "valueMarkdown" : "Automatically added as a dependency - all IGs depend on HL7 Terminology"
    }],
    "uri" : "http://terminology.hl7.org/ImplementationGuide/hl7.terminology",
    "packageId" : "hl7.terminology.r4",
    "version" : "7.3.0"
  },
  {
    "id" : "hl7_fhir_uv_extensions_r4",
    "uri" : "http://hl7.org/fhir/extensions/ImplementationGuide/hl7.fhir.uv.extensions",
    "packageId" : "hl7.fhir.uv.extensions.r4",
    "version" : "5.2.0"
  },
  {
    "id" : "hl7fhiruscore",
    "uri" : "http://hl7.org/fhir/us/core/ImplementationGuide/hl7.fhir.us.core",
    "packageId" : "hl7.fhir.us.core",
    "version" : "7.0.0"
  },
  {
    "id" : "fhirmcode",
    "uri" : "http://hl7.org/fhir/us/mcode/ImplementationGuide/hl7.fhir.us.mcode",
    "packageId" : "hl7.fhir.us.mcode",
    "version" : "4.0.0"
  },
  {
    "id" : "davinciCRD",
    "uri" : "http://hl7.org/fhir/us/davinci-crd/ImplementationGuide/hl7.fhir.us.davinci-crd",
    "packageId" : "hl7.fhir.us.davinci-crd",
    "version" : "2.2.1"
  },
  {
    "id" : "davinciDTR",
    "uri" : "http://hl7.org/fhir/us/davinci-dtr/ImplementationGuide/hl7.fhir.us.davinci-dtr",
    "packageId" : "hl7.fhir.us.davinci-dtr",
    "version" : "2.2.0"
  },
  {
    "id" : "davinciPAS",
    "uri" : "http://hl7.org/fhir/us/davinci-pas/ImplementationGuide/hl7.fhir.us.davinci-pas",
    "packageId" : "hl7.fhir.us.davinci-pas",
    "version" : "2.2.1"
  }],
  "definition" : {
    "extension" : [{
      "extension" : [{
        "url" : "code",
        "valueString" : "copyrightyear"
      },
      {
        "url" : "value",
        "valueString" : "2026+"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "releaselabel"
      },
      {
        "url" : "value",
        "valueString" : "snapshot-080926"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "show-inherited-invariants"
      },
      {
        "url" : "value",
        "valueString" : "false"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "path-history"
      },
      {
        "url" : "value",
        "valueString" : "http://hl7.org/fhir/us/codex-mopa/history.html"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "autoload-resources"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "path-liquid-template"
      },
      {
        "url" : "value",
        "valueString" : "template/liquid"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "path-liquid-template"
      },
      {
        "url" : "value",
        "valueString" : "input/liquid"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "path-qa"
      },
      {
        "url" : "value",
        "valueString" : "temp/qa"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "path-temp"
      },
      {
        "url" : "value",
        "valueString" : "temp/pages"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "path-output"
      },
      {
        "url" : "value",
        "valueString" : "output"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "path-suppressed-warnings"
      },
      {
        "url" : "value",
        "valueString" : "input/ignoreWarnings.txt"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "template-html"
      },
      {
        "url" : "value",
        "valueString" : "template-page.html"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "template-md"
      },
      {
        "url" : "value",
        "valueString" : "template-page-md.html"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "apply-contact"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "apply-context"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "apply-copyright"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "apply-jurisdiction"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "apply-license"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "apply-publisher"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "apply-version"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "apply-wg"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "active-tables"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "fmm-definition"
      },
      {
        "url" : "value",
        "valueString" : "http://hl7.org/fhir/versions.html#maturity"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "propagate-status"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "excludelogbinaryformat"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "tabbed-snapshots"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueString" : "i18n-default-lang"
      },
      {
        "url" : "value",
        "valueString" : "en"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-internal-dependency",
      "valueCode" : "hl7.fhir.uv.tools.r4#1.1.2"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "copyrightyear"
      },
      {
        "url" : "value",
        "valueString" : "2026+"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "releaselabel"
      },
      {
        "url" : "value",
        "valueString" : "snapshot-080926"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "show-inherited-invariants"
      },
      {
        "url" : "value",
        "valueString" : "false"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "path-history"
      },
      {
        "url" : "value",
        "valueString" : "http://hl7.org/fhir/us/codex-mopa/history.html"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "autoload-resources"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "path-liquid-template"
      },
      {
        "url" : "value",
        "valueString" : "template/liquid"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "path-liquid-template"
      },
      {
        "url" : "value",
        "valueString" : "input/liquid"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "path-qa"
      },
      {
        "url" : "value",
        "valueString" : "temp/qa"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "path-temp"
      },
      {
        "url" : "value",
        "valueString" : "temp/pages"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "path-output"
      },
      {
        "url" : "value",
        "valueString" : "output"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "path-suppressed-warnings"
      },
      {
        "url" : "value",
        "valueString" : "input/ignoreWarnings.txt"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "template-html"
      },
      {
        "url" : "value",
        "valueString" : "template-page.html"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "template-md"
      },
      {
        "url" : "value",
        "valueString" : "template-page-md.html"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "apply-contact"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "apply-context"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "apply-copyright"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "apply-jurisdiction"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "apply-license"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "apply-publisher"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "apply-version"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "apply-wg"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "active-tables"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "fmm-definition"
      },
      {
        "url" : "value",
        "valueString" : "http://hl7.org/fhir/versions.html#maturity"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "propagate-status"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "excludelogbinaryformat"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "tabbed-snapshots"
      },
      {
        "url" : "value",
        "valueString" : "true"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    },
    {
      "extension" : [{
        "url" : "code",
        "valueCode" : "i18n-default-lang"
      },
      {
        "url" : "value",
        "valueString" : "en"
      }],
      "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-parameter"
    }],
    "resource" : [{
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "StructureDefinition:resource"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "StructureDefinition-anticancer-regimen-plandefinition.html"
      }],
      "reference" : {
        "reference" : "StructureDefinition/anticancer-regimen-plandefinition"
      },
      "name" : "Anti-Cancer Regimen PlanDefinition",
      "description" : "A canonical, reusable anti-cancer therapy regimen definition represented\nas a FHIR PlanDefinition order set. This resource is NOT patient-specific; it is\nreferenced by AntiCancerRegimenRequestGroup instances via RequestGroup.instantiatesCanonical.\n\nA regimen definition describes the protocol — component drugs, timing, cycle structure,\nand sequential phase ordering. Treatment intent and line of therapy are patient-specific\nordering categories and are carried on the RequestGroup via the category extension; this\ncanonical definition does not carry those attributes.\n\n**mCODE Migration Candidate** — This profile is proposed for inclusion in mCODE STU5.\nIt addresses the gap documented in the mCODE gap analysis: mCODE does not currently\nrepresent anti-cancer regimens as first-class, computable entities.",
      "exampleBoolean" : false
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "StructureDefinition:resource"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "StructureDefinition-anticancer-regimen-requestgroup.html"
      }],
      "reference" : {
        "reference" : "StructureDefinition/anticancer-regimen-requestgroup"
      },
      "name" : "Anti-Cancer Regimen RequestGroup",
      "description" : "A patient-specific ordered anti-cancer therapy regimen instance.\nThis resource is included in the CDS Hooks draftOrders Bundle and referenced in\ncontext.selections at order-select and order-sign.\n\n**CDS Hooks Context.** This profile is designed for use in the Da Vinci CRD workflow.\nThe `RequestGroup` is the primary prior-authorization subject — the unit of evaluation\nfor coverage policy — not the individual `MedicationRequest` components within it.\n\n**Two-Stage Hook Pattern.** The MOPA workflow uses `order-select` and `order-sign`\nas distinct stages:\n\n- **`order-select`** (informational): The `RequestGroup` is present in `context.draftOrders`\n  but component `MedicationRequest` resources may not yet be finalised. The CRD service\n  returns informational cards indicating approvability. This is advisory — the order is\n  not yet committed.\n- **`order-sign`** (final determination): The `RequestGroup` is accompanied by finalised\n  component `MedicationRequest` resources. The CRD service returns the final coverage\n  determination (Authorization Satisfied, PA required, or DTR required).\n\n**CRD Order Profile Proposal.** This profile serves as the domain-specific layer for\noncology regimens. A complementary CRD order profile for `RequestGroup` is proposed\n(MOPA-DV-CRD-003) to formalize `RequestGroup` as a standard order type in the Da Vinci\nCRD IG, analogous to existing CRD profiles for `MedicationRequest` and `ServiceRequest`.\n\nRequestGroup.instantiatesCanonical SHALL be populated with the canonical URL of the\nAntiCancerRegimenPlanDefinition when the canonical regimen definition is known.\n\nTwo scheduling patterns are supported in regimen actions:\n\n1. **Cycle-day timing** — Each action (or action.action for phased regimens) uses the\n   local extension `http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle`\n   on action.timingTiming to declare which days of the cycle the drug is administered.\n   The action.timingTiming.repeat carries the machine-computable cycle period.\n\n2. **Sequential phase ordering** — For multi-phase regimens (e.g., AC→T),\n   top-level action groups represent phases and action.relatedAction with\n   relationship = after-end declares that the second phase begins after the first.\n\n**mCODE Migration Candidate** — This profile is proposed for inclusion in mCODE STU5.\nIt is the MVP artifact for oncology prior authorization: the selected clinical unit\npassed to the CRD service.",
      "exampleBoolean" : false
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "StructureDefinition:extension"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "StructureDefinition-data-requirement-label.html"
      }],
      "reference" : {
        "reference" : "StructureDefinition/data-requirement-label"
      },
      "name" : "Data Requirement Label",
      "description" : "A human-readable label that identifies a DataRequirement entry within an\nOncologyDataRequirementsLibrary. Used by tools such as DTR questionnaire generators and CRD\ncontent viewers to display requirement names without parsing profile URLs.\n\nThe first DataRequirement entry in every condition-specific Library (the primary cancer\ncondition) SHALL carry a label of the canonical form '[Cancer Type] Diagnosis'\n(e.g., 'Breast Cancer Diagnosis') to make the diagnostic prerequisite explicit and\nmachine-discoverable.\n\n**mCODE Migration Candidate** — Proposed for inclusion in mCODE STU5.",
      "exampleBoolean" : false
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Practitioner"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Practitioner-MOPAOncologistExample.html"
      }],
      "reference" : {
        "reference" : "Practitioner/MOPAOncologistExample"
      },
      "name" : "Example Oncologist: Dr. Maria Lopez",
      "description" : "Fictional medical oncologist used across MOPA IG examples.",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Patient"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Patient-MOPAPatientExample.html"
      }],
      "reference" : {
        "reference" : "Patient/MOPAPatientExample"
      },
      "name" : "Example Patient: Jane Smith",
      "description" : "Fictional 57-year-old female patient used consistently across all MOPA\nIG examples. DO NOT use real patient data.",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "PlanDefinition"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "PlanDefinition-RegimenDdACT.html"
      }],
      "reference" : {
        "reference" : "PlanDefinition/RegimenDdACT"
      },
      "name" : "Example Regimen Definition: ddAC→T (Dose-Dense AC then Paclitaxel)",
      "description" : "Canonical definition of dose-dense doxorubicin (60 mg/m²) plus\ncyclophosphamide (600 mg/m²) q14d × 4 cycles (AC phase), followed by paclitaxel\n(175 mg/m²) q14d × 4 cycles (T phase) for breast cancer. Demonstrates\nsequential phase ordering using action.relatedAction with relationship = after-end.",
      "exampleCanonical" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-plandefinition"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "PlanDefinition"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "PlanDefinition-RegimenPHD.html"
      }],
      "reference" : {
        "reference" : "PlanDefinition/RegimenPHD"
      },
      "name" : "Example Regimen Definition: PHD (Pertuzumab + Trastuzumab + Docetaxel)",
      "description" : "Canonical definition of pertuzumab (840 mg loading, then 420 mg IV) plus\ntrastuzumab (8 mg/kg loading, then 6 mg/kg IV) plus docetaxel (75 mg/m² IV), every 21 days,\nfor metastatic HER2-positive breast cancer. Treatment intent and line of therapy are\ncarried on the RequestGroup via the category extension.",
      "exampleCanonical" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-plandefinition"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "PlanDefinition"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "PlanDefinition-RegimenTH.html"
      }],
      "reference" : {
        "reference" : "PlanDefinition/RegimenTH"
      },
      "name" : "Example Regimen Definition: TH (Paclitaxel + Trastuzumab, Weekly)",
      "description" : "Canonical definition of weekly Paclitaxel (80 mg/m² IV) plus Trastuzumab\n(4 mg/kg loading, then 2 mg/kg IV) for 12 weeks in HER2-positive early breast\ncancer. The canonical definition carries protocol structure only — treatment intent and\nline of therapy are patient-context and live on the RequestGroup.",
      "exampleCanonical" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-plandefinition"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "RequestGroup"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "RequestGroup-DDACTRegimenOrder.html"
      }],
      "reference" : {
        "reference" : "RequestGroup/DDACTRegimenOrder"
      },
      "name" : "Example Regimen Order: ddAC→T (Jane Smith, Adjuvant) — Sequential Phases",
      "description" : "Patient-specific draft ddAC→T order for Jane Smith. AC phase (doxorubicin +\ncyclophosphamide q14d x4) followed by T phase (paclitaxel q14d x4). Demonstrates sequential\nphase ordering with action.relatedAction relationship = after-end.",
      "exampleCanonical" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-requestgroup"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "RequestGroup"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "RequestGroup-PHDRegimenOrder.html"
      }],
      "reference" : {
        "reference" : "RequestGroup/PHDRegimenOrder"
      },
      "name" : "Example Regimen Order: PHD (Jane Smith, First-Line Metastatic HER2+)",
      "description" : "Patient-specific draft PHD regimen order for Jane Smith, first-line\nmetastatic HER2+ breast cancer. Pertuzumab + Trastuzumab + Docetaxel q21d.\nDemonstrates palliative intent and first-line metastatic treatment setting.",
      "exampleCanonical" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-requestgroup"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "RequestGroup"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "RequestGroup-THRegimenOrder.html"
      }],
      "reference" : {
        "reference" : "RequestGroup/THRegimenOrder"
      },
      "name" : "Example Regimen Order: TH (Jane Smith, Adjuvant HER2+) — Typical",
      "description" : "Patient-specific draft ordered TH regimen for Jane Smith at order-select.\ninstantiatesCanonical references RegimenTH. All Must Support elements populated.\nDemonstrates regimen-days-of-cycle (days 1, 8, 15 of a 21-day cycle) and is the primary\nreference example for AntiCancerRegimenRequestGroup.",
      "exampleCanonical" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-requestgroup"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Bundle"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Bundle-ExampleOrderSelectBundle.html"
      }],
      "reference" : {
        "reference" : "Bundle/ExampleOrderSelectBundle"
      },
      "name" : "Example: CDS Hooks order-select draftOrders Bundle (TH regimen)",
      "description" : "Collection Bundle placed in context.draftOrders of an\norder-select CDS Hooks request.  At order-select the RequestGroup is present\nbut individual MedicationRequests are still draft and are not required.",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Bundle"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Bundle-ExampleOrderSignBundle.html"
      }],
      "reference" : {
        "reference" : "Bundle/ExampleOrderSignBundle"
      },
      "name" : "Example: CDS Hooks order-sign draftOrders Bundle (TH regimen)",
      "description" : "Collection Bundle placed in context.draftOrders of an\norder-sign CDS Hooks request.  At order-sign the RequestGroup plus all\ncompanion MedicationRequests are present.",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "MedicationRequest"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "MedicationRequest-CyclophosphamideMedRequestDDACT.html"
      }],
      "reference" : {
        "reference" : "MedicationRequest/CyclophosphamideMedRequestDDACT"
      },
      "name" : "Example: Cyclophosphamide MedicationRequest (ddAC→T regimen, draft)",
      "description" : "Draft MedicationRequest for cyclophosphamide 600 mg/m² IV in ddAC phase.",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "MedicationRequest"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "MedicationRequest-DocetaxelMedRequestPHD.html"
      }],
      "reference" : {
        "reference" : "MedicationRequest/DocetaxelMedRequestPHD"
      },
      "name" : "Example: Docetaxel MedicationRequest (PHD regimen, draft)",
      "description" : "Draft MedicationRequest for docetaxel 75 mg/m² IV q21d in PHD regimen.",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "MedicationRequest"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "MedicationRequest-DoxorubicinMedRequestDDACT.html"
      }],
      "reference" : {
        "reference" : "MedicationRequest/DoxorubicinMedRequestDDACT"
      },
      "name" : "Example: Doxorubicin MedicationRequest (ddAC→T regimen, draft)",
      "description" : "Draft MedicationRequest for doxorubicin 60 mg/m² IV in ddAC phase.",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Condition"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Condition-MOPAMetastaticBreastCancerConditionExample.html"
      }],
      "reference" : {
        "reference" : "Condition/MOPAMetastaticBreastCancerConditionExample"
      },
      "name" : "Example: Metastatic HER2+ Breast Cancer (Stage IV)",
      "description" : "Metastatic HER2-positive breast cancer with liver and bone involvement,\nnewly diagnosed Stage IV (de novo). Used in PHD regimen examples.",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "MedicationRequest"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "MedicationRequest-PaclitaxelMedRequestTPHase.html"
      }],
      "reference" : {
        "reference" : "MedicationRequest/PaclitaxelMedRequestTPHase"
      },
      "name" : "Example: Paclitaxel MedicationRequest (T phase, ddAC→T regimen, draft)",
      "description" : "Draft MedicationRequest for paclitaxel 175 mg/m² IV q14d in T phase.",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "MedicationRequest"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "MedicationRequest-PaclitaxelMedRequestTH.html"
      }],
      "reference" : {
        "reference" : "MedicationRequest/PaclitaxelMedRequestTH"
      },
      "name" : "Example: Paclitaxel MedicationRequest (TH regimen, draft)",
      "description" : "Draft MedicationRequest for paclitaxel 80 mg/m² IV weekly in TH regimen.",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "MedicationRequest"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "MedicationRequest-PegfilgrastimMedRequestDDACT.html"
      }],
      "reference" : {
        "reference" : "MedicationRequest/PegfilgrastimMedRequestDDACT"
      },
      "name" : "Example: Pegfilgrastim MedicationRequest (ddAC→T regimen, draft)",
      "description" : "Draft MedicationRequest for pegfilgrastim 6 mg subcutaneous on day 2 of each ddAC cycle.",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "MedicationRequest"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "MedicationRequest-PertuzumabMedRequestPHD.html"
      }],
      "reference" : {
        "reference" : "MedicationRequest/PertuzumabMedRequestPHD"
      },
      "name" : "Example: Pertuzumab MedicationRequest (PHD regimen, draft)",
      "description" : "Draft MedicationRequest for pertuzumab IV q21d in PHD regimen.",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Condition"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Condition-MOPABreastCancerConditionExample.html"
      }],
      "reference" : {
        "reference" : "Condition/MOPABreastCancerConditionExample"
      },
      "name" : "Example: Primary HER2+ Breast Cancer (Stage IIB)",
      "description" : "Invasive ductal carcinoma of right breast, HER2-positive,\nStage IIB (T2 N1 M0), diagnosed November 2025. Referenced by all MOPA examples\ndepicting Jane Smith's adjuvant treatment course.",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "MedicationRequest"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "MedicationRequest-TrastuzumabMedRequestPHD.html"
      }],
      "reference" : {
        "reference" : "MedicationRequest/TrastuzumabMedRequestPHD"
      },
      "name" : "Example: Trastuzumab MedicationRequest (PHD regimen, draft)",
      "description" : "Draft MedicationRequest for trastuzumab IV q21d in PHD regimen.",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "MedicationRequest"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "MedicationRequest-TrastuzumabMedRequestTH.html"
      }],
      "reference" : {
        "reference" : "MedicationRequest/TrastuzumabMedRequestTH"
      },
      "name" : "Example: Trastuzumab MedicationRequest (TH regimen, draft)",
      "description" : "Draft MedicationRequest for trastuzumab IV weekly in TH regimen.",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "StructureDefinition:extension"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "StructureDefinition-line-of-therapy-request-category.html"
      }],
      "reference" : {
        "reference" : "StructureDefinition/line-of-therapy-request-category"
      },
      "name" : "Line of Therapy Request Category",
      "description" : "Constrains the Da Vinci CRD Request Category extension for a\npatient-specific anti-cancer regimen line-of-therapy category. The instance extension URL\nremains `http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category`; this\nprofile adds oncology terminology semantics only. Its use on RequestGroup requires the proposed\nCRD RequestGroup extension-context expansion.\n\n**mCODE Migration Candidate** — This constraint profile and its terminology semantics are\nproposed for inclusion in mCODE STU5; the underlying extension remains owned by Da Vinci CRD.",
      "exampleBoolean" : false
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "CodeSystem"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "CodeSystem-ocpa-codes.html"
      }],
      "reference" : {
        "reference" : "CodeSystem/ocpa-codes"
      },
      "name" : "MOPA Local Code System",
      "description" : "Local codes defined by the MOPA IG for concepts that do not yet have\nan established representation in LOINC, SNOMED CT, or mCODE. These codes are migration\ncandidates and should be retired in favor of standard codes as they become available.",
      "exampleBoolean" : false
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "CapabilityStatement"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "CapabilityStatement-ocpa-crd-client.html"
      }],
      "reference" : {
        "reference" : "CapabilityStatement/ocpa-crd-client"
      },
      "name" : "Oncology CRD Client Capability Statement",
      "description" : "Capability Statement for systems acting as an **Oncology CRD Client**\n(e.g., an EHR or oncology ordering system).  A conformant client claims support for\nthe Da Vinci CRD oncology profile defined in this IG by meeting the requirements below.",
      "exampleBoolean" : false
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "CapabilityStatement"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "CapabilityStatement-ocpa-crd-service.html"
      }],
      "reference" : {
        "reference" : "CapabilityStatement/ocpa-crd-service"
      },
      "name" : "Oncology CRD Service Capability Statement",
      "description" : "Capability Statement for systems acting as an **Oncology CRD Service**\n(e.g., a payer or prior-authorization platform).  A conformant service claims support for\nthe Da Vinci CRD oncology profile defined in this IG by meeting the requirements below.",
      "exampleBoolean" : false
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "StructureDefinition:extension"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "StructureDefinition-regimen-days-of-cycle.html"
      }],
      "reference" : {
        "reference" : "StructureDefinition/regimen-days-of-cycle"
      },
      "name" : "Regimen Days of Cycle",
      "description" : "Specifies the days within a repeating treatment cycle on which a\nregimen action is to be performed. Semantically identical to the HL7 core extension\n[timing-daysOfCycle](http://hl7.org/fhir/StructureDefinition/timing-daysOfCycle),\nbut with context broadened to `Timing` so it can be applied to nested\n`RequestGroup.action.action` elements used in phased multi-agent regimens.\n\nThe cycle length is expressed via `Timing.repeat.period` / `Timing.repeat.periodUnit`\non the same element. Day numbering starts at 1 (day 1 = first day of cycle 1).\n\nThis extension is a migration candidate for inclusion in the HL7 FHIR Extensions\npack with an expanded context. See [regimen-model.html](regimen-model.html).",
      "exampleBoolean" : false
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ValueSet"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ValueSet-regimen-intent-vs.html"
      }],
      "reference" : {
        "reference" : "ValueSet/regimen-intent-vs"
      },
      "name" : "Regimen Intent Value Set",
      "description" : "The clinical intent of an anti-cancer regimen. All codes are drawn from\nthe SNOMED CT \\\"Intents (nature of procedure values)\\\" hierarchy (363675004).\n\n**mCODE Migration Candidate** — Proposed for mCODE STU5.",
      "exampleBoolean" : false
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "StructureDefinition:extension"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "StructureDefinition-treatment-intent-request-category.html"
      }],
      "reference" : {
        "reference" : "StructureDefinition/treatment-intent-request-category"
      },
      "name" : "Treatment Intent Request Category",
      "description" : "Constrains the Da Vinci CRD Request Category extension for a\npatient-specific anti-cancer regimen treatment-intent category. The instance extension URL\nremains `http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category`; this\nprofile adds oncology terminology semantics only. Its use on RequestGroup requires the proposed\nCRD RequestGroup extension-context expansion.\n\n**mCODE Migration Candidate** — This constraint profile and its terminology semantics are\nproposed for inclusion in mCODE STU5; the underlying extension remains owned by Da Vinci CRD.",
      "exampleBoolean" : false
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "CodeSystem"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "CodeSystem-treatment-line-cs.html"
      }],
      "reference" : {
        "reference" : "CodeSystem/treatment-line-cs"
      },
      "name" : "Treatment Line Code System",
      "description" : "Ordinal codes representing the line of systemic anti-cancer therapy.\nThese codes are used in TreatmentLineVS and in the LineOfTherapyRequestCategory constraint\nprofile for the RequestGroup `lineOfTherapy` category slice.\n\n**mCODE Migration Candidate** — These codes are proposed for adoption in mCODE STU5\nor as a SNOMED CT extension request. Once standard codes are available, this code\nsystem should be deprecated.",
      "exampleBoolean" : false
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ValueSet"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ValueSet-treatment-line-vs.html"
      }],
      "reference" : {
        "reference" : "ValueSet/treatment-line-vs"
      },
      "name" : "Treatment Line Value Set",
      "description" : "Codes representing the ordinal line of systemic anti-cancer therapy.\nUsed by LineOfTherapyRequestCategory for the patient-specific RequestGroup category.\n\n**mCODE Migration Candidate** — Proposed for mCODE STU5.",
      "exampleBoolean" : false
    }],
    "page" : {
      "extension" : [{
        "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
        "valueCode" : "informative"
      },
      {
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-page-name",
        "valueUrl" : "toc.html"
      }],
      "nameUrl" : "toc.html",
      "title" : "Table of Contents",
      "generation" : "html",
      "page" : [{
        "extension" : [{
          "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
          "valueCode" : "informative"
        },
        {
          "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-page-name",
          "valueUrl" : "index.html"
        }],
        "nameUrl" : "index.html",
        "title" : "Home",
        "generation" : "markdown"
      },
      {
        "extension" : [{
          "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
          "valueCode" : "informative"
        },
        {
          "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-page-name",
          "valueUrl" : "background.html"
        }],
        "nameUrl" : "background.html",
        "title" : "Background",
        "generation" : "markdown"
      },
      {
        "extension" : [{
          "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
          "valueCode" : "informative"
        },
        {
          "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-page-name",
          "valueUrl" : "use-cases.html"
        }],
        "nameUrl" : "use-cases.html",
        "title" : "Use Cases and Actors",
        "generation" : "markdown"
      },
      {
        "extension" : [{
          "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
          "valueCode" : "informative"
        },
        {
          "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-page-name",
          "valueUrl" : "regimen-model.html"
        }],
        "nameUrl" : "regimen-model.html",
        "title" : "Regimen Modeling",
        "generation" : "markdown"
      },
      {
        "extension" : [{
          "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
          "valueCode" : "informative"
        },
        {
          "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-page-name",
          "valueUrl" : "cds-workflow.html"
        }],
        "nameUrl" : "cds-workflow.html",
        "title" : "CRD Workflow",
        "generation" : "markdown"
      },
      {
        "extension" : [{
          "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
          "valueCode" : "informative"
        },
        {
          "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-page-name",
          "valueUrl" : "walkthrough.html"
        }],
        "nameUrl" : "walkthrough.html",
        "title" : "Workflow Walkthrough (Layers 1 & 2)",
        "generation" : "markdown"
      },
      {
        "extension" : [{
          "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
          "valueCode" : "informative"
        },
        {
          "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-page-name",
          "valueUrl" : "data-requirements.html"
        }],
        "nameUrl" : "data-requirements.html",
        "title" : "Data Requirements",
        "generation" : "markdown"
      },
      {
        "extension" : [{
          "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
          "valueCode" : "informative"
        },
        {
          "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-page-name",
          "valueUrl" : "breast-cancer-pa.html"
        }],
        "nameUrl" : "breast-cancer-pa.html",
        "title" : "Use Case 1: Breast Cancer PA",
        "generation" : "markdown"
      },
      {
        "extension" : [{
          "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
          "valueCode" : "informative"
        },
        {
          "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-page-name",
          "valueUrl" : "davinci-gap-proposals.html"
        }],
        "nameUrl" : "davinci-gap-proposals.html",
        "title" : "Da Vinci Gap Proposals",
        "generation" : "markdown"
      },
      {
        "extension" : [{
          "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
          "valueCode" : "informative"
        },
        {
          "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-page-name",
          "valueUrl" : "mcode-gap-proposals.html"
        }],
        "nameUrl" : "mcode-gap-proposals.html",
        "title" : "mCODE Gap Proposals",
        "generation" : "markdown"
      },
      {
        "extension" : [{
          "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
          "valueCode" : "informative"
        },
        {
          "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-page-name",
          "valueUrl" : "conformance.html"
        }],
        "nameUrl" : "conformance.html",
        "title" : "Conformance",
        "generation" : "markdown"
      },
      {
        "extension" : [{
          "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
          "valueCode" : "informative"
        },
        {
          "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-page-name",
          "valueUrl" : "artifacts.html"
        }],
        "nameUrl" : "artifacts.html",
        "title" : "Artifacts Summary",
        "generation" : "html"
      },
      {
        "extension" : [{
          "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
          "valueCode" : "informative"
        },
        {
          "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-page-name",
          "valueUrl" : "downloads.html"
        }],
        "nameUrl" : "downloads.html",
        "title" : "Downloads",
        "generation" : "markdown"
      },
      {
        "extension" : [{
          "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
          "valueCode" : "informative"
        },
        {
          "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-page-name",
          "valueUrl" : "history.html"
        }],
        "nameUrl" : "history.html",
        "title" : "Change Log",
        "generation" : "markdown"
      }]
    },
    "parameter" : [{
      "code" : "path-resource",
      "value" : "input/capabilities"
    },
    {
      "code" : "path-resource",
      "value" : "input/examples"
    },
    {
      "code" : "path-resource",
      "value" : "input/extensions"
    },
    {
      "code" : "path-resource",
      "value" : "input/models"
    },
    {
      "code" : "path-resource",
      "value" : "input/operations"
    },
    {
      "code" : "path-resource",
      "value" : "input/profiles"
    },
    {
      "code" : "path-resource",
      "value" : "input/resources"
    },
    {
      "code" : "path-resource",
      "value" : "input/vocabulary"
    },
    {
      "code" : "path-resource",
      "value" : "input/maps"
    },
    {
      "code" : "path-resource",
      "value" : "input/testing"
    },
    {
      "code" : "path-resource",
      "value" : "input/history"
    },
    {
      "code" : "path-resource",
      "value" : "fsh-generated/resources"
    },
    {
      "code" : "path-pages",
      "value" : "template/config"
    },
    {
      "code" : "path-pages",
      "value" : "input/assets"
    },
    {
      "code" : "path-pages",
      "value" : "input/images"
    },
    {
      "code" : "path-tx-cache",
      "value" : "input-cache/txcache"
    }]
  }
}

```
