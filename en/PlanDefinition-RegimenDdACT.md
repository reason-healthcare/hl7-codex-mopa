# Example Regimen Definition: ddAC→T (Dose-Dense AC then Paclitaxel) - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## PlanDefinition: Example Regimen Definition: ddAC→T (Dose-Dense AC then Paclitaxel) (Experimental) 

 
Dose-dense AC x4 cycles (q14d) with pegfilgrastim support, followed by paclitaxel x4 cycles (q14d) for breast cancer. 

* Metadata: Title
  * ?: ddAC→T: Dose-Dense Doxorubicin/Cyclophosphamide then Paclitaxel — Breast Cancer
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
  * ?: Dose-dense AC x4 cycles (q14d) with pegfilgrastim support, followed by paclitaxel x4 cycles (q14d) for breast cancer.
* Metadata: Type
  * ?: Order Set
* Metadata: PlanDefinition Action
* Metadata: Id
  * ?: ac-phase
* Metadata: Title
  * ?: AC Phase — Doxorubicin + Cyclophosphamide (q14d × 4 cycles)
* Metadata: Timing
  * ?: Count 4 times, Once per 14 days
* Metadata: PlanDefinition Sub-Action (Parent Action ID: ac-phase)
* Metadata: Id
  * ?: doxorubicin-ac
* Metadata: Title
  * ?: Doxorubicin 60 mg/m² IV — Day 1 of each 14-day cycle
* Metadata: Timing
  * ?: Once per 14 days
* Metadata: PlanDefinition Sub-Action
* Metadata: Id
  * ?: doxorubicin-ac
* Metadata: Title
  * ?: Doxorubicin 60 mg/m² IV — Day 1 of each 14-day cycle
* Metadata: Timing
  * ?: Once per 14 days
* Metadata: PlanDefinition Sub-Action (Parent Action ID: ac-phase)
* Metadata: Id
  * ?: pegfilgrastim-ac
* Metadata: Title
  * ?: Pegfilgrastim 6 mg subcutaneous — Day 2 of each 14-day cycle
* Metadata: Description
  * ?: Pegfilgrastim supportive care on day 2 of each ddAC cycle
* Metadata: Timing
  * ?: Once per 14 days
* Metadata: PlanDefinition Sub-Action
* Metadata: Id
  * ?: pegfilgrastim-ac
* Metadata: Title
  * ?: Pegfilgrastim 6 mg subcutaneous — Day 2 of each 14-day cycle
* Metadata: Description
  * ?: Pegfilgrastim supportive care on day 2 of each ddAC cycle
* Metadata: Timing
  * ?: Once per 14 days
* Metadata: PlanDefinition Sub-Action (Parent Action ID: ac-phase)
* Metadata: Id
  * ?: cyclophosphamide-ac
* Metadata: Title
  * ?: Cyclophosphamide 600 mg/m² IV — Day 1 of each 14-day cycle
* Metadata: Timing
  * ?: Once per 14 days
* Metadata: PlanDefinition Sub-Action
* Metadata: Id
  * ?: cyclophosphamide-ac
* Metadata: Title
  * ?: Cyclophosphamide 600 mg/m² IV — Day 1 of each 14-day cycle
* Metadata: Timing
  * ?: Once per 14 days
* Metadata: PlanDefinition Action
* Metadata: Id
  * ?: t-phase
* Metadata: Title
  * ?: T Phase — Paclitaxel (q14d × 4 cycles)
* Metadata: Timing
  * ?: Count 4 times, Once per 14 days
* Metadata: PlanDefinition Sub-Action (Parent Action ID: t-phase)
* Metadata: Id
  * ?: paclitaxel-t
* Metadata: Title
  * ?: Paclitaxel 175 mg/m² IV — Day 1 of each 14-day cycle
* Metadata: Timing
  * ?: Once per 14 days
* Metadata: PlanDefinition Sub-Action
* Metadata: Id
  * ?: paclitaxel-t
* Metadata: Title
  * ?: Paclitaxel 175 mg/m² IV — Day 1 of each 14-day cycle
* Metadata: Timing
  * ?: Once per 14 days
* Metadata: Generated using version 0.5.4 of the sample-content-ig Liquid templates



## Resource Content

```json
{
  "resourceType" : "PlanDefinition",
  "id" : "RegimenDdACT",
  "meta" : {
    "profile" : ["http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-plandefinition"]
  },
  "url" : "http://hl7.org/fhir/us/codex-mopa/PlanDefinition/RegimenDdACT",
  "version" : "0.1.1-snapshot-080926",
  "name" : "RegimenDdACT",
  "title" : "ddAC→T: Dose-Dense Doxorubicin/Cyclophosphamide then Paclitaxel — Breast Cancer",
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
  "description" : "Dose-dense AC x4 cycles (q14d) with pegfilgrastim support, followed by paclitaxel x4 cycles (q14d) for breast cancer.",
  "jurisdiction" : [{
    "coding" : [{
      "system" : "urn:iso:std:iso:3166",
      "code" : "US",
      "display" : "United States of America"
    }]
  }],
  "action" : [{
    "id" : "ac-phase",
    "title" : "AC Phase — Doxorubicin + Cyclophosphamide (q14d × 4 cycles)",
    "timingTiming" : {
      "repeat" : {
        "count" : 4,
        "period" : 14,
        "periodUnit" : "d"
      }
    },
    "action" : [{
      "id" : "doxorubicin-ac",
      "title" : "Doxorubicin 60 mg/m² IV — Day 1 of each 14-day cycle",
      "timingTiming" : {
        "repeat" : {
          "period" : 14,
          "periodUnit" : "d"
        }
      }
    },
    {
      "id" : "pegfilgrastim-ac",
      "title" : "Pegfilgrastim 6 mg subcutaneous — Day 2 of each 14-day cycle",
      "description" : "Pegfilgrastim supportive care on day 2 of each ddAC cycle",
      "timingTiming" : {
        "extension" : [{
          "extension" : [{
            "url" : "day",
            "valueInteger" : 2
          }],
          "url" : "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle"
        }],
        "repeat" : {
          "period" : 14,
          "periodUnit" : "d"
        }
      }
    },
    {
      "id" : "cyclophosphamide-ac",
      "title" : "Cyclophosphamide 600 mg/m² IV — Day 1 of each 14-day cycle",
      "timingTiming" : {
        "repeat" : {
          "period" : 14,
          "periodUnit" : "d"
        }
      }
    }]
  },
  {
    "id" : "t-phase",
    "title" : "T Phase — Paclitaxel (q14d × 4 cycles)",
    "relatedAction" : [{
      "actionId" : "ac-phase",
      "relationship" : "after-end"
    }],
    "timingTiming" : {
      "repeat" : {
        "count" : 4,
        "period" : 14,
        "periodUnit" : "d"
      }
    },
    "action" : [{
      "id" : "paclitaxel-t",
      "title" : "Paclitaxel 175 mg/m² IV — Day 1 of each 14-day cycle",
      "timingTiming" : {
        "repeat" : {
          "period" : 14,
          "periodUnit" : "d"
        }
      }
    }]
  }]
}

```
