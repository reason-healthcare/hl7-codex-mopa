# Example Regimen Definition: PHD (Pertuzumab + Trastuzumab + Docetaxel) - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## PlanDefinition: Example Regimen Definition: PHD (Pertuzumab + Trastuzumab + Docetaxel) (Experimental) 

 
PHD regimen every 21 days for HER2+ metastatic breast cancer. Standard of care per CLEOPATRA trial. 

* Metadata: Title
  * ?: PHD: Pertuzumab + Trastuzumab + Docetaxel — Metastatic HER2+ Breast Cancer
* Metadata: Version
  * ?: 0.1.1-snapshot-080926
* Metadata: Experimental
  * ?: true
* Metadata: Subject Type
  * ?: Malignant neoplasm of breast
* Metadata: Jurisdiction
  * ?: United States of America
* Metadata: Steward (Publisher)
  * ?: HL7 International / Clinical Interoperability Council
* Metadata: Steward Contact
  * ?: HL7 International / Clinical Interoperability Council
* Metadata: Description
  * ?: PHD regimen every 21 days for HER2+ metastatic breast cancer. Standard of care per CLEOPATRA trial.
* Metadata: Type
  * ?: Order Set
* Metadata: PlanDefinition Action
* Metadata: Id
  * ?: pertuzumab-phd
* Metadata: Title
  * ?: Pertuzumab 840 mg IV (cycle 1), then 420 mg IV q21d
* Metadata: Timing
  * ?: Once per 21 days
* Metadata: PlanDefinition Action
* Metadata: Id
  * ?: trastuzumab-phd
* Metadata: Title
  * ?: Trastuzumab 8 mg/kg IV (cycle 1), then 6 mg/kg IV q21d
* Metadata: Timing
  * ?: Once per 21 days
* Metadata: PlanDefinition Action
* Metadata: Id
  * ?: docetaxel-phd
* Metadata: Title
  * ?: Docetaxel 75 mg/m² IV — Day 1 of each 21-day cycle
* Metadata: Timing
  * ?: Once per 21 days
* Metadata: Generated using version 0.5.4 of the sample-content-ig Liquid templates



## Resource Content

```json
{
  "resourceType" : "PlanDefinition",
  "id" : "RegimenPHD",
  "meta" : {
    "profile" : ["http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-plandefinition"]
  },
  "url" : "http://hl7.org/fhir/us/codex-mopa/PlanDefinition/RegimenPHD",
  "version" : "0.1.1-snapshot-080926",
  "name" : "RegimenPHD",
  "title" : "PHD: Pertuzumab + Trastuzumab + Docetaxel — Metastatic HER2+ Breast Cancer",
  "type" : {
    "coding" : [{
      "system" : "http://terminology.hl7.org/CodeSystem/plan-definition-type",
      "code" : "order-set",
      "display" : "Order Set"
    }]
  },
  "status" : "active",
  "experimental" : true,
  "subjectCodeableConcept" : {
    "coding" : [{
      "system" : "http://snomed.info/sct",
      "code" : "254837009",
      "display" : "Malignant neoplasm of breast"
    }]
  },
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
  "description" : "PHD regimen every 21 days for HER2+ metastatic breast cancer. Standard of care per CLEOPATRA trial.",
  "jurisdiction" : [{
    "coding" : [{
      "system" : "urn:iso:std:iso:3166",
      "code" : "US",
      "display" : "United States of America"
    }]
  }],
  "action" : [{
    "id" : "pertuzumab-phd",
    "title" : "Pertuzumab 840 mg IV (cycle 1), then 420 mg IV q21d",
    "timingTiming" : {
      "repeat" : {
        "period" : 21,
        "periodUnit" : "d"
      }
    }
  },
  {
    "id" : "trastuzumab-phd",
    "title" : "Trastuzumab 8 mg/kg IV (cycle 1), then 6 mg/kg IV q21d",
    "timingTiming" : {
      "repeat" : {
        "period" : 21,
        "periodUnit" : "d"
      }
    }
  },
  {
    "id" : "docetaxel-phd",
    "title" : "Docetaxel 75 mg/m² IV — Day 1 of each 21-day cycle",
    "timingTiming" : {
      "repeat" : {
        "period" : 21,
        "periodUnit" : "d"
      }
    }
  }]
}

```
