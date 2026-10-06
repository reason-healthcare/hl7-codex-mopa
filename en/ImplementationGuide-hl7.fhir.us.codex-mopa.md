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
  "date" : "2026-10-06T14:22:03-04:00",
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
    "version" : "7.4.0"
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
        "valueString" : "path-liquid"
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
        "valueCode" : "path-liquid"
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
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-0023164a-4998-e288-0fc3-5a02cf3447ec.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/0023164a-4998-e288-0fc3-5a02cf3447ec"
      },
      "name" : "0023164a-4998-e288-0fc3-5a02cf3447ec",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-034e73d7-b3e2-6cc5-8e1c-2689d95581dc.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/034e73d7-b3e2-6cc5-8e1c-2689d95581dc"
      },
      "name" : "034e73d7-b3e2-6cc5-8e1c-2689d95581dc",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-044ec3a5-ac5c-c5cf-381c-76563c3c6a6e.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/044ec3a5-ac5c-c5cf-381c-76563c3c6a6e"
      },
      "name" : "044ec3a5-ac5c-c5cf-381c-76563c3c6a6e",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-0459bdb5-def8-b1d7-82ec-3a8515c37416.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/0459bdb5-def8-b1d7-82ec-3a8515c37416"
      },
      "name" : "0459bdb5-def8-b1d7-82ec-3a8515c37416",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-0579b0c9-385b-3c39-b609-906dd78f09eb.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/0579b0c9-385b-3c39-b609-906dd78f09eb"
      },
      "name" : "0579b0c9-385b-3c39-b609-906dd78f09eb",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-07fff275-f553-ea8f-019e-600b79d2e7b4.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/07fff275-f553-ea8f-019e-600b79d2e7b4"
      },
      "name" : "07fff275-f553-ea8f-019e-600b79d2e7b4",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-0b1d6b94-0349-8896-1a58-a12f68ad9b08.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/0b1d6b94-0349-8896-1a58-a12f68ad9b08"
      },
      "name" : "0b1d6b94-0349-8896-1a58-a12f68ad9b08",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-0b9dfc64-4d1b-44dc-7339-61c56cda8e1a.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/0b9dfc64-4d1b-44dc-7339-61c56cda8e1a"
      },
      "name" : "0b9dfc64-4d1b-44dc-7339-61c56cda8e1a",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-0d603019-569c-3dfd-bf52-0782656f0baf.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/0d603019-569c-3dfd-bf52-0782656f0baf"
      },
      "name" : "0d603019-569c-3dfd-bf52-0782656f0baf",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-0e5cedb9-b1f5-ca95-175a-e803a532a5c0.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/0e5cedb9-b1f5-ca95-175a-e803a532a5c0"
      },
      "name" : "0e5cedb9-b1f5-ca95-175a-e803a532a5c0",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-0ef7963b-44f0-eed0-a4f7-c994fb472fd7.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/0ef7963b-44f0-eed0-a4f7-c994fb472fd7"
      },
      "name" : "0ef7963b-44f0-eed0-a4f7-c994fb472fd7",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-0fc51de2-2205-cd09-2ee2-96d4adb2a834.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/0fc51de2-2205-cd09-2ee2-96d4adb2a834"
      },
      "name" : "0fc51de2-2205-cd09-2ee2-96d4adb2a834",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-128537af-c773-1cb5-6897-33a45b59966b.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/128537af-c773-1cb5-6897-33a45b59966b"
      },
      "name" : "128537af-c773-1cb5-6897-33a45b59966b",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-1346baf8-318e-1f54-5b36-8d47cbf4f8ac.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/1346baf8-318e-1f54-5b36-8d47cbf4f8ac"
      },
      "name" : "1346baf8-318e-1f54-5b36-8d47cbf4f8ac",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-163e5f23-e6c7-e6ce-e175-29ec2556c67c.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/163e5f23-e6c7-e6ce-e175-29ec2556c67c"
      },
      "name" : "163e5f23-e6c7-e6ce-e175-29ec2556c67c",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-1798d623-ba95-06b0-aa15-a55a8557462e.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/1798d623-ba95-06b0-aa15-a55a8557462e"
      },
      "name" : "1798d623-ba95-06b0-aa15-a55a8557462e",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-17b38b00-d4df-7cc5-7e8c-e348c4b1cc5f.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/17b38b00-d4df-7cc5-7e8c-e348c4b1cc5f"
      },
      "name" : "17b38b00-d4df-7cc5-7e8c-e348c4b1cc5f",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-18a52e2d-fbc6-1025-ff7e-8735cd88d2d2.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/18a52e2d-fbc6-1025-ff7e-8735cd88d2d2"
      },
      "name" : "18a52e2d-fbc6-1025-ff7e-8735cd88d2d2",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-18d9193e-e891-43e5-7fb2-7186d863937f.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/18d9193e-e891-43e5-7fb2-7186d863937f"
      },
      "name" : "18d9193e-e891-43e5-7fb2-7186d863937f",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-19c02e32-9639-794a-7e1a-7db80fef14af.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/19c02e32-9639-794a-7e1a-7db80fef14af"
      },
      "name" : "19c02e32-9639-794a-7e1a-7db80fef14af",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-1a3b3eb0-d10e-5688-c572-0978b6c3ac7c.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/1a3b3eb0-d10e-5688-c572-0978b6c3ac7c"
      },
      "name" : "1a3b3eb0-d10e-5688-c572-0978b6c3ac7c",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-1a43cff7-7a5b-4319-e97a-9ab9b9d9d595.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/1a43cff7-7a5b-4319-e97a-9ab9b9d9d595"
      },
      "name" : "1a43cff7-7a5b-4319-e97a-9ab9b9d9d595",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-1e2e662e-7c14-60b9-77e4-bc7180db296c.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/1e2e662e-7c14-60b9-77e4-bc7180db296c"
      },
      "name" : "1e2e662e-7c14-60b9-77e4-bc7180db296c",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-1e448c14-029c-8999-97fa-e225fe911d7f.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/1e448c14-029c-8999-97fa-e225fe911d7f"
      },
      "name" : "1e448c14-029c-8999-97fa-e225fe911d7f",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-24fd9372-65b4-201d-7497-fa4bbdfc0fef.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/24fd9372-65b4-201d-7497-fa4bbdfc0fef"
      },
      "name" : "24fd9372-65b4-201d-7497-fa4bbdfc0fef",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-297f9c08-541e-c4a5-962b-c0003d469198.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/297f9c08-541e-c4a5-962b-c0003d469198"
      },
      "name" : "297f9c08-541e-c4a5-962b-c0003d469198",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-2d9f1ccf-b761-0146-34e0-76860da5afa4.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/2d9f1ccf-b761-0146-34e0-76860da5afa4"
      },
      "name" : "2d9f1ccf-b761-0146-34e0-76860da5afa4",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-303bebd6-0fd2-1c3d-16b5-a22c21ce10d1.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/303bebd6-0fd2-1c3d-16b5-a22c21ce10d1"
      },
      "name" : "303bebd6-0fd2-1c3d-16b5-a22c21ce10d1",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-3080623e-0093-d6f4-d6ed-f7c27f90fbed.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/3080623e-0093-d6f4-d6ed-f7c27f90fbed"
      },
      "name" : "3080623e-0093-d6f4-d6ed-f7c27f90fbed",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-003d-0101f53e3154.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-003d-0101f53e3154"
      },
      "name" : "324d4f70-205b-60cc-003d-0101f53e3154",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-0162-2ce5311b5279.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-0162-2ce5311b5279"
      },
      "name" : "324d4f70-205b-60cc-0162-2ce5311b5279",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-0297-a5a1bd87d1f0.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-0297-a5a1bd87d1f0"
      },
      "name" : "324d4f70-205b-60cc-0297-a5a1bd87d1f0",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-0db7-b058ebf14b84.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-0db7-b058ebf14b84"
      },
      "name" : "324d4f70-205b-60cc-0db7-b058ebf14b84",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Immunization"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Immunization-324d4f70-205b-60cc-0ffb-080f18161ad7.html"
      }],
      "reference" : {
        "reference" : "Immunization/324d4f70-205b-60cc-0ffb-080f18161ad7"
      },
      "name" : "324d4f70-205b-60cc-0ffb-080f18161ad7",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-immunization"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-1179-6df0b91f7525.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-1179-6df0b91f7525"
      },
      "name" : "324d4f70-205b-60cc-1179-6df0b91f7525",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-15e5-0fac43d29b6d.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-15e5-0fac43d29b6d"
      },
      "name" : "324d4f70-205b-60cc-15e5-0fac43d29b6d",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Immunization"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Immunization-324d4f70-205b-60cc-16ae-241e134b0576.html"
      }],
      "reference" : {
        "reference" : "Immunization/324d4f70-205b-60cc-16ae-241e134b0576"
      },
      "name" : "324d4f70-205b-60cc-16ae-241e134b0576",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-immunization"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-1962-0ea00b3cda63.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-1962-0ea00b3cda63"
      },
      "name" : "324d4f70-205b-60cc-1962-0ea00b3cda63",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-1b84-c52fb680231c.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-1b84-c52fb680231c"
      },
      "name" : "324d4f70-205b-60cc-1b84-c52fb680231c",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-1c64-64c037697bf3.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-1c64-64c037697bf3"
      },
      "name" : "324d4f70-205b-60cc-1c64-64c037697bf3",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-1c88-e6cda8ec7531.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-1c88-e6cda8ec7531"
      },
      "name" : "324d4f70-205b-60cc-1c88-e6cda8ec7531",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-1de8-a9cbc4e0036a.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-1de8-a9cbc4e0036a"
      },
      "name" : "324d4f70-205b-60cc-1de8-a9cbc4e0036a",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-2051-e8ee0a6b654f.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-2051-e8ee0a6b654f"
      },
      "name" : "324d4f70-205b-60cc-2051-e8ee0a6b654f",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-24a8-4d3ad8b8ae01.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-24a8-4d3ad8b8ae01"
      },
      "name" : "324d4f70-205b-60cc-24a8-4d3ad8b8ae01",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-2538-a83ef5b75ab1.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-2538-a83ef5b75ab1"
      },
      "name" : "324d4f70-205b-60cc-2538-a83ef5b75ab1",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-2692-72c2133050cf.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-2692-72c2133050cf"
      },
      "name" : "324d4f70-205b-60cc-2692-72c2133050cf",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-279b-886aa2782723.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-279b-886aa2782723"
      },
      "name" : "324d4f70-205b-60cc-279b-886aa2782723",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-2837-ffb3962d6ce2.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-2837-ffb3962d6ce2"
      },
      "name" : "324d4f70-205b-60cc-2837-ffb3962d6ce2",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-283d-7af8bdc429cc.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-283d-7af8bdc429cc"
      },
      "name" : "324d4f70-205b-60cc-283d-7af8bdc429cc",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-324c-f8d35cb030be.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-324c-f8d35cb030be"
      },
      "name" : "324d4f70-205b-60cc-324c-f8d35cb030be",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-35e0-61c760c27bcc.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-35e0-61c760c27bcc"
      },
      "name" : "324d4f70-205b-60cc-35e0-61c760c27bcc",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-36ed-00f83f2202f1.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-36ed-00f83f2202f1"
      },
      "name" : "324d4f70-205b-60cc-36ed-00f83f2202f1",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-3b24-763d02e12997.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-3b24-763d02e12997"
      },
      "name" : "324d4f70-205b-60cc-3b24-763d02e12997",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-3e41-e5b04e10d69c.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-3e41-e5b04e10d69c"
      },
      "name" : "324d4f70-205b-60cc-3e41-e5b04e10d69c",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-3eca-e327cc5deb09.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-3eca-e327cc5deb09"
      },
      "name" : "324d4f70-205b-60cc-3eca-e327cc5deb09",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-3fde-27be9c1c7826.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-3fde-27be9c1c7826"
      },
      "name" : "324d4f70-205b-60cc-3fde-27be9c1c7826",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-403a-3d51560b106f.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-403a-3d51560b106f"
      },
      "name" : "324d4f70-205b-60cc-403a-3d51560b106f",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-406d-3b0c7ff097ca.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-406d-3b0c7ff097ca"
      },
      "name" : "324d4f70-205b-60cc-406d-3b0c7ff097ca",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-4184-ff388bd1b344.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-4184-ff388bd1b344"
      },
      "name" : "324d4f70-205b-60cc-4184-ff388bd1b344",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-47b3-71b6fedb37cf.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-47b3-71b6fedb37cf"
      },
      "name" : "324d4f70-205b-60cc-47b3-71b6fedb37cf",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-4a51-7fd58c9a38b2.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-4a51-7fd58c9a38b2"
      },
      "name" : "324d4f70-205b-60cc-4a51-7fd58c9a38b2",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-4aa7-17255db300c3.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-4aa7-17255db300c3"
      },
      "name" : "324d4f70-205b-60cc-4aa7-17255db300c3",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-4add-381d14c5ddf7.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-4add-381d14c5ddf7"
      },
      "name" : "324d4f70-205b-60cc-4add-381d14c5ddf7",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-4d78-41a6e431eb81.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-4d78-41a6e431eb81"
      },
      "name" : "324d4f70-205b-60cc-4d78-41a6e431eb81",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-4ef6-22f142d7d336.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-4ef6-22f142d7d336"
      },
      "name" : "324d4f70-205b-60cc-4ef6-22f142d7d336",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-500d-52c21db4e8d4.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-500d-52c21db4e8d4"
      },
      "name" : "324d4f70-205b-60cc-500d-52c21db4e8d4",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-51b7-9b21c65312d1.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-51b7-9b21c65312d1"
      },
      "name" : "324d4f70-205b-60cc-51b7-9b21c65312d1",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-53c4-cfdf2b5dd320.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-53c4-cfdf2b5dd320"
      },
      "name" : "324d4f70-205b-60cc-53c4-cfdf2b5dd320",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Immunization"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Immunization-324d4f70-205b-60cc-55c4-fdc38b673678.html"
      }],
      "reference" : {
        "reference" : "Immunization/324d4f70-205b-60cc-55c4-fdc38b673678"
      },
      "name" : "324d4f70-205b-60cc-55c4-fdc38b673678",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-immunization"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-55f7-f9f4976b1da5.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-55f7-f9f4976b1da5"
      },
      "name" : "324d4f70-205b-60cc-55f7-f9f4976b1da5",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Immunization"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Immunization-324d4f70-205b-60cc-56b1-5917b91995a7.html"
      }],
      "reference" : {
        "reference" : "Immunization/324d4f70-205b-60cc-56b1-5917b91995a7"
      },
      "name" : "324d4f70-205b-60cc-56b1-5917b91995a7",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-immunization"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-5756-faa9406416fb.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-5756-faa9406416fb"
      },
      "name" : "324d4f70-205b-60cc-5756-faa9406416fb",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-57cb-2e4d766f0fbf.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-57cb-2e4d766f0fbf"
      },
      "name" : "324d4f70-205b-60cc-57cb-2e4d766f0fbf",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-58cf-1e7016b4cbfa.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-58cf-1e7016b4cbfa"
      },
      "name" : "324d4f70-205b-60cc-58cf-1e7016b4cbfa",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-58eb-26b259294074.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-58eb-26b259294074"
      },
      "name" : "324d4f70-205b-60cc-58eb-26b259294074",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-58ec-40d72349ab5a.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-58ec-40d72349ab5a"
      },
      "name" : "324d4f70-205b-60cc-58ec-40d72349ab5a",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-5a2f-e1a6ea69a91a.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-5a2f-e1a6ea69a91a"
      },
      "name" : "324d4f70-205b-60cc-5a2f-e1a6ea69a91a",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-5a82-eca43b90700e.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-5a82-eca43b90700e"
      },
      "name" : "324d4f70-205b-60cc-5a82-eca43b90700e",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-5b10-efa5a0f8e7b4.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-5b10-efa5a0f8e7b4"
      },
      "name" : "324d4f70-205b-60cc-5b10-efa5a0f8e7b4",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-5bdf-a78105e167bf.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-5bdf-a78105e167bf"
      },
      "name" : "324d4f70-205b-60cc-5bdf-a78105e167bf",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-5c6d-fa71b7a30f38.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-5c6d-fa71b7a30f38"
      },
      "name" : "324d4f70-205b-60cc-5c6d-fa71b7a30f38",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-5d84-12f20bffd1a0.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-5d84-12f20bffd1a0"
      },
      "name" : "324d4f70-205b-60cc-5d84-12f20bffd1a0",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-5da8-7e4d633e3065.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-5da8-7e4d633e3065"
      },
      "name" : "324d4f70-205b-60cc-5da8-7e4d633e3065",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-5ff8-97b1f4eef88d.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-5ff8-97b1f4eef88d"
      },
      "name" : "324d4f70-205b-60cc-5ff8-97b1f4eef88d",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-65ac-50e059411094.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-65ac-50e059411094"
      },
      "name" : "324d4f70-205b-60cc-65ac-50e059411094",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-6608-11e9eb72b9ce.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-6608-11e9eb72b9ce"
      },
      "name" : "324d4f70-205b-60cc-6608-11e9eb72b9ce",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-6a71-2ed4bfa14ce0.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-6a71-2ed4bfa14ce0"
      },
      "name" : "324d4f70-205b-60cc-6a71-2ed4bfa14ce0",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-6b1e-13ab57e5fded.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-6b1e-13ab57e5fded"
      },
      "name" : "324d4f70-205b-60cc-6b1e-13ab57e5fded",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-6e65-238220288f48.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-6e65-238220288f48"
      },
      "name" : "324d4f70-205b-60cc-6e65-238220288f48",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-6ea5-936285139eb8.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-6ea5-936285139eb8"
      },
      "name" : "324d4f70-205b-60cc-6ea5-936285139eb8",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-6fdf-b576336a84a6.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-6fdf-b576336a84a6"
      },
      "name" : "324d4f70-205b-60cc-6fdf-b576336a84a6",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Immunization"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Immunization-324d4f70-205b-60cc-7094-d2c0c5ac0f16.html"
      }],
      "reference" : {
        "reference" : "Immunization/324d4f70-205b-60cc-7094-d2c0c5ac0f16"
      },
      "name" : "324d4f70-205b-60cc-7094-d2c0c5ac0f16",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-immunization"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-70db-c23708019e5e.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-70db-c23708019e5e"
      },
      "name" : "324d4f70-205b-60cc-70db-c23708019e5e",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-715e-56f83a1bf839.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-715e-56f83a1bf839"
      },
      "name" : "324d4f70-205b-60cc-715e-56f83a1bf839",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-7c2d-4382d3c52063.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-7c2d-4382d3c52063"
      },
      "name" : "324d4f70-205b-60cc-7c2d-4382d3c52063",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-7e2e-dd08e1c087a0.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-7e2e-dd08e1c087a0"
      },
      "name" : "324d4f70-205b-60cc-7e2e-dd08e1c087a0",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-7fda-a04a956dcc4e.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-7fda-a04a956dcc4e"
      },
      "name" : "324d4f70-205b-60cc-7fda-a04a956dcc4e",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-8033-ba5bdb4eee1c.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-8033-ba5bdb4eee1c"
      },
      "name" : "324d4f70-205b-60cc-8033-ba5bdb4eee1c",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-80fd-fb51401f0e6b.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-80fd-fb51401f0e6b"
      },
      "name" : "324d4f70-205b-60cc-80fd-fb51401f0e6b",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-81ae-b206c7842f06.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-81ae-b206c7842f06"
      },
      "name" : "324d4f70-205b-60cc-81ae-b206c7842f06",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-8cfc-844c633f72f8.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-8cfc-844c633f72f8"
      },
      "name" : "324d4f70-205b-60cc-8cfc-844c633f72f8",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Immunization"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Immunization-324d4f70-205b-60cc-8d2d-8f7aecfab0af.html"
      }],
      "reference" : {
        "reference" : "Immunization/324d4f70-205b-60cc-8d2d-8f7aecfab0af"
      },
      "name" : "324d4f70-205b-60cc-8d2d-8f7aecfab0af",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-immunization"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Immunization"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Immunization-324d4f70-205b-60cc-9034-26ba188a4c3a.html"
      }],
      "reference" : {
        "reference" : "Immunization/324d4f70-205b-60cc-9034-26ba188a4c3a"
      },
      "name" : "324d4f70-205b-60cc-9034-26ba188a4c3a",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-immunization"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-9472-8c7c3d2e45ab.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-9472-8c7c3d2e45ab"
      },
      "name" : "324d4f70-205b-60cc-9472-8c7c3d2e45ab",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-95ce-922e94744be4.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-95ce-922e94744be4"
      },
      "name" : "324d4f70-205b-60cc-95ce-922e94744be4",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-9671-6809a100f0ff.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-9671-6809a100f0ff"
      },
      "name" : "324d4f70-205b-60cc-9671-6809a100f0ff",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-96a9-d91d739652da.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-96a9-d91d739652da"
      },
      "name" : "324d4f70-205b-60cc-96a9-d91d739652da",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-976f-e37e8b0f6171.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-976f-e37e8b0f6171"
      },
      "name" : "324d4f70-205b-60cc-976f-e37e8b0f6171",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-9843-105155e736bb.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-9843-105155e736bb"
      },
      "name" : "324d4f70-205b-60cc-9843-105155e736bb",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-9d5c-9755ae6ec44b.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-9d5c-9755ae6ec44b"
      },
      "name" : "324d4f70-205b-60cc-9d5c-9755ae6ec44b",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Immunization"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Immunization-324d4f70-205b-60cc-9db2-3e01b33a24dd.html"
      }],
      "reference" : {
        "reference" : "Immunization/324d4f70-205b-60cc-9db2-3e01b33a24dd"
      },
      "name" : "324d4f70-205b-60cc-9db2-3e01b33a24dd",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-immunization"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Patient"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Patient-324d4f70-205b-60cc-a081-24b98a0f139e.html"
      }],
      "reference" : {
        "reference" : "Patient/324d4f70-205b-60cc-a081-24b98a0f139e"
      },
      "name" : "324d4f70-205b-60cc-a081-24b98a0f139e",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-a761-abf04ae61cff.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-a761-abf04ae61cff"
      },
      "name" : "324d4f70-205b-60cc-a761-abf04ae61cff",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-a7d9-31c7aace7e53.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-a7d9-31c7aace7e53"
      },
      "name" : "324d4f70-205b-60cc-a7d9-31c7aace7e53",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-a901-56495c7d7915.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-a901-56495c7d7915"
      },
      "name" : "324d4f70-205b-60cc-a901-56495c7d7915",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Immunization"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Immunization-324d4f70-205b-60cc-ab2b-7e1872e256ad.html"
      }],
      "reference" : {
        "reference" : "Immunization/324d4f70-205b-60cc-ab2b-7e1872e256ad"
      },
      "name" : "324d4f70-205b-60cc-ab2b-7e1872e256ad",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-immunization"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-ac7e-a59622bf63f2.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-ac7e-a59622bf63f2"
      },
      "name" : "324d4f70-205b-60cc-ac7e-a59622bf63f2",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-af17-52591ce4bfab.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-af17-52591ce4bfab"
      },
      "name" : "324d4f70-205b-60cc-af17-52591ce4bfab",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-b275-92eb37de846e.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-b275-92eb37de846e"
      },
      "name" : "324d4f70-205b-60cc-b275-92eb37de846e",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-b87f-486a766d7690.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-b87f-486a766d7690"
      },
      "name" : "324d4f70-205b-60cc-b87f-486a766d7690",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-b9b0-4e978d5fbba8.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-b9b0-4e978d5fbba8"
      },
      "name" : "324d4f70-205b-60cc-b9b0-4e978d5fbba8",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-bb2c-7c63f78b79f2.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-bb2c-7c63f78b79f2"
      },
      "name" : "324d4f70-205b-60cc-bb2c-7c63f78b79f2",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-bcea-2e77475b36da.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-bcea-2e77475b36da"
      },
      "name" : "324d4f70-205b-60cc-bcea-2e77475b36da",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-c1ba-e935897de7ef.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-c1ba-e935897de7ef"
      },
      "name" : "324d4f70-205b-60cc-c1ba-e935897de7ef",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-c1d4-7b24da488762.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-c1d4-7b24da488762"
      },
      "name" : "324d4f70-205b-60cc-c1d4-7b24da488762",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-c25a-cd7373ad0288.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-c25a-cd7373ad0288"
      },
      "name" : "324d4f70-205b-60cc-c25a-cd7373ad0288",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-c292-39c3b263355c.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-c292-39c3b263355c"
      },
      "name" : "324d4f70-205b-60cc-c292-39c3b263355c",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-c3b8-2f51d4c14ab0.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-c3b8-2f51d4c14ab0"
      },
      "name" : "324d4f70-205b-60cc-c3b8-2f51d4c14ab0",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-c53c-b3838c180ebd.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-c53c-b3838c180ebd"
      },
      "name" : "324d4f70-205b-60cc-c53c-b3838c180ebd",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Immunization"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Immunization-324d4f70-205b-60cc-c9b8-3f36c803f63f.html"
      }],
      "reference" : {
        "reference" : "Immunization/324d4f70-205b-60cc-c9b8-3f36c803f63f"
      },
      "name" : "324d4f70-205b-60cc-c9b8-3f36c803f63f",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-immunization"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-cc9b-9a8dac0bf429.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-cc9b-9a8dac0bf429"
      },
      "name" : "324d4f70-205b-60cc-cc9b-9a8dac0bf429",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Immunization"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Immunization-324d4f70-205b-60cc-cf00-62e8f31e53f8.html"
      }],
      "reference" : {
        "reference" : "Immunization/324d4f70-205b-60cc-cf00-62e8f31e53f8"
      },
      "name" : "324d4f70-205b-60cc-cf00-62e8f31e53f8",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-immunization"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-d01e-01c162d00a1e.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-d01e-01c162d00a1e"
      },
      "name" : "324d4f70-205b-60cc-d01e-01c162d00a1e",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-d167-ce53d138fb07.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-d167-ce53d138fb07"
      },
      "name" : "324d4f70-205b-60cc-d167-ce53d138fb07",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-d218-8bd9b86f704e.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-d218-8bd9b86f704e"
      },
      "name" : "324d4f70-205b-60cc-d218-8bd9b86f704e",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-d22e-a00332260b6a.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-d22e-a00332260b6a"
      },
      "name" : "324d4f70-205b-60cc-d22e-a00332260b6a",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-d349-8836c48ba066.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-d349-8836c48ba066"
      },
      "name" : "324d4f70-205b-60cc-d349-8836c48ba066",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-d5dd-8d9526fc9cac.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-d5dd-8d9526fc9cac"
      },
      "name" : "324d4f70-205b-60cc-d5dd-8d9526fc9cac",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-d603-07e52baa590b.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-d603-07e52baa590b"
      },
      "name" : "324d4f70-205b-60cc-d603-07e52baa590b",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-d72e-353b774455cf.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-d72e-353b774455cf"
      },
      "name" : "324d4f70-205b-60cc-d72e-353b774455cf",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-d8d9-4789ddde2599.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-d8d9-4789ddde2599"
      },
      "name" : "324d4f70-205b-60cc-d8d9-4789ddde2599",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-d989-86644ae1848a.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-d989-86644ae1848a"
      },
      "name" : "324d4f70-205b-60cc-d989-86644ae1848a",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-da21-a0ada8fdccaf.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-da21-a0ada8fdccaf"
      },
      "name" : "324d4f70-205b-60cc-da21-a0ada8fdccaf",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-daa0-f375f040f2ca.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-daa0-f375f040f2ca"
      },
      "name" : "324d4f70-205b-60cc-daa0-f375f040f2ca",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-e24f-0300820f0d4b.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-e24f-0300820f0d4b"
      },
      "name" : "324d4f70-205b-60cc-e24f-0300820f0d4b",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-e308-404db14d3249.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-e308-404db14d3249"
      },
      "name" : "324d4f70-205b-60cc-e308-404db14d3249",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Condition"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Condition-324d4f70-205b-60cc-e524-4f55fc9ea3c1.html"
      }],
      "reference" : {
        "reference" : "Condition/324d4f70-205b-60cc-e524-4f55fc9ea3c1"
      },
      "name" : "324d4f70-205b-60cc-e524-4f55fc9ea3c1",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-condition-encounter-diagnosis"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-e748-241d7cdbbddd.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-e748-241d7cdbbddd"
      },
      "name" : "324d4f70-205b-60cc-e748-241d7cdbbddd",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-e77a-de35e12d61c2.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-e77a-de35e12d61c2"
      },
      "name" : "324d4f70-205b-60cc-e77a-de35e12d61c2",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-e7e7-eeab8432491c.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-e7e7-eeab8432491c"
      },
      "name" : "324d4f70-205b-60cc-e7e7-eeab8432491c",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-ea9d-c861c301dc37.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-ea9d-c861c301dc37"
      },
      "name" : "324d4f70-205b-60cc-ea9d-c861c301dc37",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-eb4a-3f746aca7988.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-eb4a-3f746aca7988"
      },
      "name" : "324d4f70-205b-60cc-eb4a-3f746aca7988",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-f07b-ca9c0d01152d.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-f07b-ca9c0d01152d"
      },
      "name" : "324d4f70-205b-60cc-f07b-ca9c0d01152d",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-f192-9af1d1042e24.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-f192-9af1d1042e24"
      },
      "name" : "324d4f70-205b-60cc-f192-9af1d1042e24",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-f220-dd931dfdd2e5.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-f220-dd931dfdd2e5"
      },
      "name" : "324d4f70-205b-60cc-f220-dd931dfdd2e5",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-f3af-f8e08dd81174.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-f3af-f8e08dd81174"
      },
      "name" : "324d4f70-205b-60cc-f3af-f8e08dd81174",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-f442-d49d506f10a7.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-f442-d49d506f10a7"
      },
      "name" : "324d4f70-205b-60cc-f442-d49d506f10a7",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-f6ec-9182270fc784.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-f6ec-9182270fc784"
      },
      "name" : "324d4f70-205b-60cc-f6ec-9182270fc784",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-f790-a0746ae2fee0.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-f790-a0746ae2fee0"
      },
      "name" : "324d4f70-205b-60cc-f790-a0746ae2fee0",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-f846-d4397fc18ba4.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-f846-d4397fc18ba4"
      },
      "name" : "324d4f70-205b-60cc-f846-d4397fc18ba4",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-f89c-1abb9feabaee.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-f89c-1abb9feabaee"
      },
      "name" : "324d4f70-205b-60cc-f89c-1abb9feabaee",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-f89e-b677aa848d76.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-f89e-b677aa848d76"
      },
      "name" : "324d4f70-205b-60cc-f89e-b677aa848d76",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-fb7a-ec524eb0db28.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-fb7a-ec524eb0db28"
      },
      "name" : "324d4f70-205b-60cc-fb7a-ec524eb0db28",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Immunization"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Immunization-324d4f70-205b-60cc-fb8e-0edef8cb8ac2.html"
      }],
      "reference" : {
        "reference" : "Immunization/324d4f70-205b-60cc-fb8e-0edef8cb8ac2"
      },
      "name" : "324d4f70-205b-60cc-fb8e-0edef8cb8ac2",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-immunization"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Procedure"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Procedure-324d4f70-205b-60cc-fd9c-53747ed763c3.html"
      }],
      "reference" : {
        "reference" : "Procedure/324d4f70-205b-60cc-fd9c-53747ed763c3"
      },
      "name" : "324d4f70-205b-60cc-fd9c-53747ed763c3",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-procedure"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Claim"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Claim-324d4f70-205b-60cc-fe0f-215c3c52d84c.html"
      }],
      "reference" : {
        "reference" : "Claim/324d4f70-205b-60cc-fe0f-215c3c52d84c"
      },
      "name" : "324d4f70-205b-60cc-fe0f-215c3c52d84c",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Encounter"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Encounter-324d4f70-205b-60cc-fea4-d040f20925df.html"
      }],
      "reference" : {
        "reference" : "Encounter/324d4f70-205b-60cc-fea4-d040f20925df"
      },
      "name" : "324d4f70-205b-60cc-fea4-d040f20925df",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-encounter"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-32d39940-2bed-c1cc-0086-49d00b926100.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/32d39940-2bed-c1cc-0086-49d00b926100"
      },
      "name" : "32d39940-2bed-c1cc-0086-49d00b926100",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-34d599b4-bd48-1345-e786-299461e74712.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/34d599b4-bd48-1345-e786-299461e74712"
      },
      "name" : "34d599b4-bd48-1345-e786-299461e74712",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-353d2977-c37c-0ec0-3262-23163111933f.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/353d2977-c37c-0ec0-3262-23163111933f"
      },
      "name" : "353d2977-c37c-0ec0-3262-23163111933f",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-35e21a02-69ae-8a8c-0394-cbfbd713f5d7.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/35e21a02-69ae-8a8c-0394-cbfbd713f5d7"
      },
      "name" : "35e21a02-69ae-8a8c-0394-cbfbd713f5d7",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-3684963b-420d-3f4e-2b18-7cb4f863514a.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/3684963b-420d-3f4e-2b18-7cb4f863514a"
      },
      "name" : "3684963b-420d-3f4e-2b18-7cb4f863514a",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-385fb839-1925-0168-27ec-96a6aeb53ecc.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/385fb839-1925-0168-27ec-96a6aeb53ecc"
      },
      "name" : "385fb839-1925-0168-27ec-96a6aeb53ecc",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-388fced2-345d-64b6-defd-6456b35a89af.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/388fced2-345d-64b6-defd-6456b35a89af"
      },
      "name" : "388fced2-345d-64b6-defd-6456b35a89af",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-39646991-afa3-7005-82a2-d12d15048fc4.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/39646991-afa3-7005-82a2-d12d15048fc4"
      },
      "name" : "39646991-afa3-7005-82a2-d12d15048fc4",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-3a68c8ad-8605-c3c4-4366-c2f779429eef.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/3a68c8ad-8605-c3c4-4366-c2f779429eef"
      },
      "name" : "3a68c8ad-8605-c3c4-4366-c2f779429eef",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-3e3dd483-8ab0-bcd9-b7f4-2a9586a550bf.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/3e3dd483-8ab0-bcd9-b7f4-2a9586a550bf"
      },
      "name" : "3e3dd483-8ab0-bcd9-b7f4-2a9586a550bf",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-40679c3d-3c07-c049-0d5b-08e95fffa971.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/40679c3d-3c07-c049-0d5b-08e95fffa971"
      },
      "name" : "40679c3d-3c07-c049-0d5b-08e95fffa971",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-406c76a1-9630-be4b-7feb-091e6567890d.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/406c76a1-9630-be4b-7feb-091e6567890d"
      },
      "name" : "406c76a1-9630-be4b-7feb-091e6567890d",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-477e74d5-4c1b-7c04-85b9-68940575325a.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/477e74d5-4c1b-7c04-85b9-68940575325a"
      },
      "name" : "477e74d5-4c1b-7c04-85b9-68940575325a",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-4861bb45-5293-1cc3-9ea3-d13930c67679.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/4861bb45-5293-1cc3-9ea3-d13930c67679"
      },
      "name" : "4861bb45-5293-1cc3-9ea3-d13930c67679",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-4f30932e-24cc-b82b-e4c1-89a87fe2d698.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/4f30932e-24cc-b82b-e4c1-89a87fe2d698"
      },
      "name" : "4f30932e-24cc-b82b-e4c1-89a87fe2d698",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-5363ba6c-37e7-603c-3308-59a0059a10cc.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/5363ba6c-37e7-603c-3308-59a0059a10cc"
      },
      "name" : "5363ba6c-37e7-603c-3308-59a0059a10cc",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-578f3c65-a224-08fb-40b7-09590ed02cf3.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/578f3c65-a224-08fb-40b7-09590ed02cf3"
      },
      "name" : "578f3c65-a224-08fb-40b7-09590ed02cf3",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-5c061728-5ba7-2c80-75b2-f2537ad4809a.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/5c061728-5ba7-2c80-75b2-f2537ad4809a"
      },
      "name" : "5c061728-5ba7-2c80-75b2-f2537ad4809a",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-5c290f77-b687-222e-cca2-b18e241cb2e8.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/5c290f77-b687-222e-cca2-b18e241cb2e8"
      },
      "name" : "5c290f77-b687-222e-cca2-b18e241cb2e8",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-5e57b3dd-42f7-a8f5-3982-d3f969fc42a2.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/5e57b3dd-42f7-a8f5-3982-d3f969fc42a2"
      },
      "name" : "5e57b3dd-42f7-a8f5-3982-d3f969fc42a2",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-61346cb7-94ff-eeb9-e5b3-69dc8e9e5c4e.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/61346cb7-94ff-eeb9-e5b3-69dc8e9e5c4e"
      },
      "name" : "61346cb7-94ff-eeb9-e5b3-69dc8e9e5c4e",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-61ae1cb3-c6f7-d331-e62d-19d8c09640c6.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/61ae1cb3-c6f7-d331-e62d-19d8c09640c6"
      },
      "name" : "61ae1cb3-c6f7-d331-e62d-19d8c09640c6",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-63c5dd79-2805-7644-8ece-db7371f8b31f.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/63c5dd79-2805-7644-8ece-db7371f8b31f"
      },
      "name" : "63c5dd79-2805-7644-8ece-db7371f8b31f",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-65c2eab5-e79f-e040-9e55-daa11e6aa89d.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/65c2eab5-e79f-e040-9e55-daa11e6aa89d"
      },
      "name" : "65c2eab5-e79f-e040-9e55-daa11e6aa89d",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-664240c3-5ece-5799-01a7-a1e31e179601.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/664240c3-5ece-5799-01a7-a1e31e179601"
      },
      "name" : "664240c3-5ece-5799-01a7-a1e31e179601",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-683c151d-e1d3-4aa7-8895-cb7421f30547.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/683c151d-e1d3-4aa7-8895-cb7421f30547"
      },
      "name" : "683c151d-e1d3-4aa7-8895-cb7421f30547",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "Provenance"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Provenance-6992255d-3a3e-7e1b-04f7-84eef418d151.html"
      }],
      "reference" : {
        "reference" : "Provenance/6992255d-3a3e-7e1b-04f7-84eef418d151"
      },
      "name" : "6992255d-3a3e-7e1b-04f7-84eef418d151",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-provenance"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-6b9d04bc-f887-b142-5f09-b0e0f070d90f.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/6b9d04bc-f887-b142-5f09-b0e0f070d90f"
      },
      "name" : "6b9d04bc-f887-b142-5f09-b0e0f070d90f",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-6bc547ec-3734-e642-4b69-e72004e796d2.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/6bc547ec-3734-e642-4b69-e72004e796d2"
      },
      "name" : "6bc547ec-3734-e642-4b69-e72004e796d2",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-6bcd79b4-f9d1-1e02-5f3a-25d8f1ba45cf.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/6bcd79b4-f9d1-1e02-5f3a-25d8f1ba45cf"
      },
      "name" : "6bcd79b4-f9d1-1e02-5f3a-25d8f1ba45cf",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-6cb2b349-d7d7-f3e1-1151-e7178a8883c1.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/6cb2b349-d7d7-f3e1-1151-e7178a8883c1"
      },
      "name" : "6cb2b349-d7d7-f3e1-1151-e7178a8883c1",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-70686202-c601-8e2f-e11b-ceaf514b753a.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/70686202-c601-8e2f-e11b-ceaf514b753a"
      },
      "name" : "70686202-c601-8e2f-e11b-ceaf514b753a",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-71769078-6471-2b8c-d6da-8352d4374127.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/71769078-6471-2b8c-d6da-8352d4374127"
      },
      "name" : "71769078-6471-2b8c-d6da-8352d4374127",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-770a1131-8061-f2b4-b3e5-3c3a7e5c3ca7.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/770a1131-8061-f2b4-b3e5-3c3a7e5c3ca7"
      },
      "name" : "770a1131-8061-f2b4-b3e5-3c3a7e5c3ca7",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-7827663b-151e-c74e-4d71-1994cb7504ba.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/7827663b-151e-c74e-4d71-1994cb7504ba"
      },
      "name" : "7827663b-151e-c74e-4d71-1994cb7504ba",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-7bf61bd2-84bf-b775-6f32-f6fd8dbdb1bf.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/7bf61bd2-84bf-b775-6f32-f6fd8dbdb1bf"
      },
      "name" : "7bf61bd2-84bf-b775-6f32-f6fd8dbdb1bf",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-7d406308-ccf7-eb57-01bf-602dc69658ed.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/7d406308-ccf7-eb57-01bf-602dc69658ed"
      },
      "name" : "7d406308-ccf7-eb57-01bf-602dc69658ed",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-803be58e-714f-100b-66b5-9be4834b049f.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/803be58e-714f-100b-66b5-9be4834b049f"
      },
      "name" : "803be58e-714f-100b-66b5-9be4834b049f",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-810f2d9d-89f3-1988-1b76-06f5d1e2ebd8.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/810f2d9d-89f3-1988-1b76-06f5d1e2ebd8"
      },
      "name" : "810f2d9d-89f3-1988-1b76-06f5d1e2ebd8",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-810f5b73-c6ec-3a7b-1b76-34cc0edc0ccb.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/810f5b73-c6ec-3a7b-1b76-34cc0edc0ccb"
      },
      "name" : "810f5b73-c6ec-3a7b-1b76-34cc0edc0ccb",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-8709b501-0255-bd34-b3e4-e02359880198.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/8709b501-0255-bd34-b3e4-e02359880198"
      },
      "name" : "8709b501-0255-bd34-b3e4-e02359880198",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-880c798b-353e-3f48-3a83-47720e9752d2.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/880c798b-353e-3f48-3a83-47720e9752d2"
      },
      "name" : "880c798b-353e-3f48-3a83-47720e9752d2",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-885cc705-823a-3826-82a6-ba425d654124.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/885cc705-823a-3826-82a6-ba425d654124"
      },
      "name" : "885cc705-823a-3826-82a6-ba425d654124",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-891d499d-3d50-9810-7cb6-fcd09706ee54.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/891d499d-3d50-9810-7cb6-fcd09706ee54"
      },
      "name" : "891d499d-3d50-9810-7cb6-fcd09706ee54",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-8a6b74b5-e231-2ecf-08fd-f18518fbf10f.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/8a6b74b5-e231-2ecf-08fd-f18518fbf10f"
      },
      "name" : "8a6b74b5-e231-2ecf-08fd-f18518fbf10f",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-8a98d15f-89fb-3c68-e0de-765a88c9961e.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/8a98d15f-89fb-3c68-e0de-765a88c9961e"
      },
      "name" : "8a98d15f-89fb-3c68-e0de-765a88c9961e",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-8ba2a788-d4ff-1383-613e-0ceca977f286.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/8ba2a788-d4ff-1383-613e-0ceca977f286"
      },
      "name" : "8ba2a788-d4ff-1383-613e-0ceca977f286",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-8f8a214c-6c3b-71c8-a186-15e052b5281e.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/8f8a214c-6c3b-71c8-a186-15e052b5281e"
      },
      "name" : "8f8a214c-6c3b-71c8-a186-15e052b5281e",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-98aa1bed-3b39-60e5-ff83-74352b0bb07f.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/98aa1bed-3b39-60e5-ff83-74352b0bb07f"
      },
      "name" : "98aa1bed-3b39-60e5-ff83-74352b0bb07f",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-98fc4c29-33b7-1b65-ffd5-a47123896aff.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/98fc4c29-33b7-1b65-ffd5-a47123896aff"
      },
      "name" : "98fc4c29-33b7-1b65-ffd5-a47123896aff",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-9d1d80e4-2e12-b01e-32ad-88d435ca0e8c.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/9d1d80e4-2e12-b01e-32ad-88d435ca0e8c"
      },
      "name" : "9d1d80e4-2e12-b01e-32ad-88d435ca0e8c",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-9d3d7489-9293-423a-5393-8685872728b4.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/9d3d7489-9293-423a-5393-8685872728b4"
      },
      "name" : "9d3d7489-9293-423a-5393-8685872728b4",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-9e1826e7-1ee6-5615-68da-6665b163254c.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/9e1826e7-1ee6-5615-68da-6665b163254c"
      },
      "name" : "9e1826e7-1ee6-5615-68da-6665b163254c",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-9ea36e5b-716f-7dc8-5dec-acc30cd4dee8.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/9ea36e5b-716f-7dc8-5dec-acc30cd4dee8"
      },
      "name" : "9ea36e5b-716f-7dc8-5dec-acc30cd4dee8",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-a3325c89-e3b2-823a-5988-6e85d84668b4.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/a3325c89-e3b2-823a-5988-6e85d84668b4"
      },
      "name" : "a3325c89-e3b2-823a-5988-6e85d84668b4",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-a770495f-efc3-3077-1505-cddeece82a16.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/a770495f-efc3-3077-1505-cddeece82a16"
      },
      "name" : "a770495f-efc3-3077-1505-cddeece82a16",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-a77df40e-86a5-5115-a578-3e01c3807c1e.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/a77df40e-86a5-5115-a578-3e01c3807c1e"
      },
      "name" : "a77df40e-86a5-5115-a578-3e01c3807c1e",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-a8a3868e-2470-68a4-f296-c3694f79669e.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/a8a3868e-2470-68a4-f296-c3694f79669e"
      },
      "name" : "a8a3868e-2470-68a4-f296-c3694f79669e",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-ab096977-c407-80df-a82e-6316319d055e.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/ab096977-c407-80df-a82e-6316319d055e"
      },
      "name" : "ab096977-c407-80df-a82e-6316319d055e",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-ac2ef1fb-a79e-75d2-9f9b-9e1f9f879d9f.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/ac2ef1fb-a79e-75d2-9f9b-9e1f9f879d9f"
      },
      "name" : "ac2ef1fb-a79e-75d2-9f9b-9e1f9f879d9f",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-ac674294-09ee-54f2-9fd3-eeb801d77cbf.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/ac674294-09ee-54f2-9fd3-eeb801d77cbf"
      },
      "name" : "ac674294-09ee-54f2-9fd3-eeb801d77cbf",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-ad805677-99bb-7506-0ea0-15c0d823106c.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/ad805677-99bb-7506-0ea0-15c0d823106c"
      },
      "name" : "ad805677-99bb-7506-0ea0-15c0d823106c",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-aeb002a3-5159-8657-d9b9-009d9b4cc332.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/aeb002a3-5159-8657-d9b9-009d9b4cc332"
      },
      "name" : "aeb002a3-5159-8657-d9b9-009d9b4cc332",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
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
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-b0ea08e2-af5a-a47f-1e7f-99d92a5bddd6.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/b0ea08e2-af5a-a47f-1e7f-99d92a5bddd6"
      },
      "name" : "b0ea08e2-af5a-a47f-1e7f-99d92a5bddd6",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-b2f97ed6-d697-f867-f161-1a3c37b7b7b0.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/b2f97ed6-d697-f867-f161-1a3c37b7b7b0"
      },
      "name" : "b2f97ed6-d697-f867-f161-1a3c37b7b7b0",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-b3943349-1969-b9b2-5833-6716cc1a4992.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/b3943349-1969-b9b2-5833-6716cc1a4992"
      },
      "name" : "b3943349-1969-b9b2-5833-6716cc1a4992",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-b3f7ffc6-850d-66e9-60ce-6d5c14dfc5b1.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/b3f7ffc6-850d-66e9-60ce-6d5c14dfc5b1"
      },
      "name" : "b3f7ffc6-850d-66e9-60ce-6d5c14dfc5b1",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-b6c039db-34f7-ef6a-3b3f-37002e965d00.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/b6c039db-34f7-ef6a-3b3f-37002e965d00"
      },
      "name" : "b6c039db-34f7-ef6a-3b3f-37002e965d00",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-bb3b3d35-1dab-d9c1-b72f-d11b97622fd3.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/bb3b3d35-1dab-d9c1-b72f-d11b97622fd3"
      },
      "name" : "bb3b3d35-1dab-d9c1-b72f-d11b97622fd3",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-c2215eb5-e6f2-0def-40b3-db851dbcd02f.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/c2215eb5-e6f2-0def-40b3-db851dbcd02f"
      },
      "name" : "c2215eb5-e6f2-0def-40b3-db851dbcd02f",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-c3520393-d01a-7dce-f71f-b6445ffa226d.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/c3520393-d01a-7dce-f71f-b6445ffa226d"
      },
      "name" : "c3520393-d01a-7dce-f71f-b6445ffa226d",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-c4e9b8f6-3605-b8d7-cde7-b34029429402.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/c4e9b8f6-3605-b8d7-cde7-b34029429402"
      },
      "name" : "c4e9b8f6-3605-b8d7-cde7-b34029429402",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-c61ed03c-4e13-3cc7-1c30-cc30e1f9b67e.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/c61ed03c-4e13-3cc7-1c30-cc30e1f9b67e"
      },
      "name" : "c61ed03c-4e13-3cc7-1c30-cc30e1f9b67e",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-c729ea8a-2179-f0c8-8969-691c9e492793.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/c729ea8a-2179-f0c8-8969-691c9e492793"
      },
      "name" : "c729ea8a-2179-f0c8-8969-691c9e492793",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-c7ab3348-9f86-63ef-6c4a-67165236f3cf.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/c7ab3348-9f86-63ef-6c4a-67165236f3cf"
      },
      "name" : "c7ab3348-9f86-63ef-6c4a-67165236f3cf",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-cb143d49-a165-3b39-01de-ff891ff7b809.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/cb143d49-a165-3b39-01de-ff891ff7b809"
      },
      "name" : "cb143d49-a165-3b39-01de-ff891ff7b809",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-cd6155b5-ddf2-3ae6-4bf3-d28514bcfd26.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/cd6155b5-ddf2-3ae6-4bf3-d28514bcfd26"
      },
      "name" : "cd6155b5-ddf2-3ae6-4bf3-d28514bcfd26",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-d0fcf862-c0e6-6964-7d20-f04be8b35cd1.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/d0fcf862-c0e6-6964-7d20-f04be8b35cd1"
      },
      "name" : "d0fcf862-c0e6-6964-7d20-f04be8b35cd1",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-d217b1a2-6e82-9345-84c8-41821321c713.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/d217b1a2-6e82-9345-84c8-41821321c713"
      },
      "name" : "d217b1a2-6e82-9345-84c8-41821321c713",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-d244603b-4e72-a986-37a6-64b59d75df22.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/d244603b-4e72-a986-37a6-64b59d75df22"
      },
      "name" : "d244603b-4e72-a986-37a6-64b59d75df22",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-d5a38635-1611-9360-f3f9-1d96fceaec55.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/d5a38635-1611-9360-f3f9-1d96fceaec55"
      },
      "name" : "d5a38635-1611-9360-f3f9-1d96fceaec55",
      "exampleBoolean" : true
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
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-dccd6cab-3a1d-9dad-dabe-d33607d04fae.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/dccd6cab-3a1d-9dad-dabe-d33607d04fae"
      },
      "name" : "dccd6cab-3a1d-9dad-dabe-d33607d04fae",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-ddffdf72-76cb-6956-5b00-913323a69477.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/ddffdf72-76cb-6956-5b00-913323a69477"
      },
      "name" : "ddffdf72-76cb-6956-5b00-913323a69477",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-e03f31d6-c997-3e18-ff86-81a30f32a37c.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/e03f31d6-c997-3e18-ff86-81a30f32a37c"
      },
      "name" : "e03f31d6-c997-3e18-ff86-81a30f32a37c",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-e280dd4c-ddf5-b03e-046d-cfcc63a28b6a.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/e280dd4c-ddf5-b03e-046d-cfcc63a28b6a"
      },
      "name" : "e280dd4c-ddf5-b03e-046d-cfcc63a28b6a",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-e51ade29-614f-a989-be73-2619339f43f0.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/e51ade29-614f-a989-be73-2619339f43f0"
      },
      "name" : "e51ade29-614f-a989-be73-2619339f43f0",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-e68112fe-e224-d464-532d-8d8e084dff18.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/e68112fe-e224-d464-532d-8d8e084dff18"
      },
      "name" : "e68112fe-e224-d464-532d-8d8e084dff18",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-e9d0e8d6-9a35-e32c-294f-7b53696cadef.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/e9d0e8d6-9a35-e32c-294f-7b53696cadef"
      },
      "name" : "e9d0e8d6-9a35-e32c-294f-7b53696cadef",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-eb08b96d-76c3-1c9e-411a-b5620aa99655.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/eb08b96d-76c3-1c9e-411a-b5620aa99655"
      },
      "name" : "eb08b96d-76c3-1c9e-411a-b5620aa99655",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-eb2d5b15-167c-278e-daff-aaaf7d557fd6.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/eb2d5b15-167c-278e-daff-aaaf7d557fd6"
      },
      "name" : "eb2d5b15-167c-278e-daff-aaaf7d557fd6",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-ebff37a8-a34e-2f8a-f3cf-20d1461be23c.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/ebff37a8-a34e-2f8a-f3cf-20d1461be23c"
      },
      "name" : "ebff37a8-a34e-2f8a-f3cf-20d1461be23c",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-ef722d95-1656-3076-df44-7d2f7d2f88be.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/ef722d95-1656-3076-df44-7d2f7d2f88be"
      },
      "name" : "ef722d95-1656-3076-df44-7d2f7d2f88be",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
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
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-f11e6a04-d423-7636-18eb-5d7180476e20.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/f11e6a04-d423-7636-18eb-5d7180476e20"
      },
      "name" : "f11e6a04-d423-7636-18eb-5d7180476e20",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "ExplanationOfBenefit"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "ExplanationOfBenefit-f379b045-f0a2-6edb-4bae-0eb38633294b.html"
      }],
      "reference" : {
        "reference" : "ExplanationOfBenefit/f379b045-f0a2-6edb-4bae-0eb38633294b"
      },
      "name" : "f379b045-f0a2-6edb-4bae-0eb38633294b",
      "exampleBoolean" : true
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-f3c906d9-6f23-c217-b312-45410a892337.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/f3c906d9-6f23-c217-b312-45410a892337"
      },
      "name" : "f3c906d9-6f23-c217-b312-45410a892337",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-f87c4036-8850-2777-97b0-0de938e0071c.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/f87c4036-8850-2777-97b0-0de938e0071c"
      },
      "name" : "f87c4036-8850-2777-97b0-0de938e0071c",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DiagnosticReport"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DiagnosticReport-f95e43d9-6da2-3357-b8a7-824109079477.html"
      }],
      "reference" : {
        "reference" : "DiagnosticReport/f95e43d9-6da2-3357-b8a7-824109079477"
      },
      "name" : "f95e43d9-6da2-3357-b8a7-824109079477",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-diagnosticreport-note"
    },
    {
      "extension" : [{
        "url" : "http://hl7.org/fhir/tools/StructureDefinition/resource-information",
        "valueString" : "DocumentReference"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "DocumentReference-fa4de280-88f7-e2d3-7ecc-dfa582965069.html"
      }],
      "reference" : {
        "reference" : "DocumentReference/fa4de280-88f7-e2d3-7ecc-dfa582965069"
      },
      "name" : "fa4de280-88f7-e2d3-7ecc-dfa582965069",
      "exampleCanonical" : "http://hl7.org/fhir/us/core/StructureDefinition/us-core-documentreference"
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
        "valueString" : "Bundle"
      },
      {
        "url" : "http://hl7.org/fhir/StructureDefinition/implementationguide-page",
        "valueUri" : "Bundle-teran-breast-cancer-r4-clean.html"
      }],
      "reference" : {
        "reference" : "Bundle/teran-breast-cancer-r4-clean"
      },
      "name" : "Terán Breast Cancer — Cleaned R4 Bundle",
      "description" : "Supplied cleaned R4 transaction Bundle for patient data review. See the Patient Bundle Review page for contents and provenance. Included without asserting MOPA or mCODE conformance.",
      "exampleBoolean" : true
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
          "valueUrl" : "patient-bundle-review.html"
        }],
        "nameUrl" : "patient-bundle-review.html",
        "title" : "Patient Bundle Review",
        "generation" : "markdown"
      },
      {
        "extension" : [{
          "url" : "http://hl7.org/fhir/StructureDefinition/structuredefinition-standards-status",
          "valueCode" : "informative"
        },
        {
          "url" : "http://hl7.org/fhir/tools/StructureDefinition/ig-page-name",
          "valueUrl" : "patient-attachment-review.html"
        }],
        "nameUrl" : "patient-attachment-review.html",
        "title" : "Decoded Attachment Review",
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
      "value" : "input/teran-patient/examples"
    },
    {
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
