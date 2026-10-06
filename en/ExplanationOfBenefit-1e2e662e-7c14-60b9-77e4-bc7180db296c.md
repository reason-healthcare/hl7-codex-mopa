# 1e2e662e-7c14-60b9-77e4-bc7180db296c - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example ExplanationOfBenefit: 1e2e662e-7c14-60b9-77e4-bc7180db296c



## Resource Content

```json
{
  "resourceType" : "ExplanationOfBenefit",
  "id" : "1e2e662e-7c14-60b9-77e4-bc7180db296c",
  "contained" : [{
    "resourceType" : "ServiceRequest",
    "id" : "referral",
    "status" : "completed",
    "intent" : "order",
    "subject" : {
      "reference" : "urn:uuid:324d4f70-205b-60cc-a081-24b98a0f139e"
    },
    "requester" : {
      "reference" : "Practitioner?identifier=http://hl7.org/fhir/sid/us-npi|9999790493"
    },
    "performer" : [{
      "reference" : "Practitioner?identifier=http://hl7.org/fhir/sid/us-npi|9999790493"
    }]
  },
  {
    "resourceType" : "Coverage",
    "id" : "coverage",
    "status" : "active",
    "type" : {
      "text" : "Medicare"
    },
    "beneficiary" : {
      "reference" : "urn:uuid:324d4f70-205b-60cc-a081-24b98a0f139e"
    },
    "payor" : [{
      "display" : "Medicare"
    }]
  }],
  "identifier" : [{
    "system" : "https://bluebutton.cms.gov/resources/variables/clm_id",
    "value" : "324d4f70-205b-60cc-f3af-f8e08dd81174"
  },
  {
    "system" : "https://bluebutton.cms.gov/resources/identifier/claim-group",
    "value" : "99999999999"
  }],
  "status" : "active",
  "type" : {
    "coding" : [{
      "system" : "http://terminology.hl7.org/CodeSystem/claim-type",
      "code" : "professional"
    }]
  },
  "use" : "claim",
  "patient" : {
    "reference" : "urn:uuid:324d4f70-205b-60cc-a081-24b98a0f139e"
  },
  "billablePeriod" : {
    "start" : "2023-05-22T22:20:30-05:00",
    "end" : "2024-05-22T22:20:30-05:00"
  },
  "created" : "2023-05-22T22:20:30-05:00",
  "insurer" : {
    "display" : "Medicare"
  },
  "provider" : {
    "reference" : "Practitioner?identifier=http://hl7.org/fhir/sid/us-npi|9999790493"
  },
  "referral" : {
    "reference" : "#referral"
  },
  "facility" : {
    "reference" : "Location?identifier=https://github.com/synthetichealth/synthea|8d33f2d1-09d6-3578-9fb4-779d57023b3e",
    "display" : "CHILDRENS MEDICAL CARE INC"
  },
  "claim" : {
    "reference" : "urn:uuid:324d4f70-205b-60cc-f3af-f8e08dd81174"
  },
  "outcome" : "complete",
  "careTeam" : [{
    "sequence" : 1,
    "provider" : {
      "reference" : "Practitioner?identifier=http://hl7.org/fhir/sid/us-npi|9999790493"
    },
    "role" : {
      "coding" : [{
        "system" : "http://terminology.hl7.org/CodeSystem/claimcareteamrole",
        "code" : "primary",
        "display" : "Primary provider"
      }]
    }
  }],
  "insurance" : [{
    "focal" : true,
    "coverage" : {
      "reference" : "#coverage",
      "display" : "Medicare"
    }
  }],
  "item" : [{
    "sequence" : 1,
    "category" : {
      "coding" : [{
        "system" : "https://bluebutton.cms.gov/resources/variables/line_cms_type_srvc_cd",
        "code" : "1",
        "display" : "Medical care"
      }]
    },
    "productOrService" : {
      "coding" : [{
        "system" : "http://snomed.info/sct",
        "code" : "162673000",
        "display" : "General examination of patient (procedure)"
      }],
      "text" : "General examination of patient (procedure)"
    },
    "servicedPeriod" : {
      "start" : "2023-05-22T22:05:30-05:00",
      "end" : "2023-05-22T22:20:30-05:00"
    },
    "locationCodeableConcept" : {
      "coding" : [{
        "system" : "http://terminology.hl7.org/CodeSystem/ex-serviceplace",
        "code" : "19",
        "display" : "Nexis Health"
      }]
    },
    "encounter" : [{
      "reference" : "urn:uuid:324d4f70-205b-60cc-0162-2ce5311b5279"
    }]
  },
  {
    "sequence" : 2,
    "informationSequence" : [1],
    "category" : {
      "coding" : [{
        "system" : "https://bluebutton.cms.gov/resources/variables/line_cms_type_srvc_cd",
        "code" : "1",
        "display" : "Medical care"
      }]
    },
    "productOrService" : {
      "coding" : [{
        "system" : "http://hl7.org/fhir/sid/cvx",
        "code" : "140",
        "display" : "Influenza, split virus, trivalent, PF"
      }],
      "text" : "Influenza, split virus, trivalent, PF"
    },
    "servicedPeriod" : {
      "start" : "2023-05-22T22:05:30-05:00",
      "end" : "2023-05-22T22:20:30-05:00"
    },
    "locationCodeableConcept" : {
      "coding" : [{
        "system" : "http://terminology.hl7.org/CodeSystem/ex-serviceplace",
        "code" : "19",
        "display" : "Nexis Health"
      }]
    },
    "net" : {
      "value" : 136,
      "currency" : "USD"
    },
    "adjudication" : [{
      "category" : {
        "coding" : [{
          "system" : "https://bluebutton.cms.gov/resources/codesystem/adjudication",
          "code" : "https://bluebutton.cms.gov/resources/variables/line_coinsrnc_amt",
          "display" : "Line Beneficiary Coinsurance Amount"
        }]
      },
      "amount" : {
        "value" : 27.200000000000003,
        "currency" : "USD"
      }
    },
    {
      "category" : {
        "coding" : [{
          "system" : "https://bluebutton.cms.gov/resources/codesystem/adjudication",
          "code" : "https://bluebutton.cms.gov/resources/variables/line_prvdr_pmt_amt",
          "display" : "Line Provider Payment Amount"
        }]
      },
      "amount" : {
        "value" : 108.80000000000001,
        "currency" : "USD"
      }
    },
    {
      "category" : {
        "coding" : [{
          "system" : "https://bluebutton.cms.gov/resources/codesystem/adjudication",
          "code" : "https://bluebutton.cms.gov/resources/variables/line_sbmtd_chrg_amt",
          "display" : "Line Submitted Charge Amount"
        }]
      },
      "amount" : {
        "value" : 136,
        "currency" : "USD"
      }
    },
    {
      "category" : {
        "coding" : [{
          "system" : "https://bluebutton.cms.gov/resources/codesystem/adjudication",
          "code" : "https://bluebutton.cms.gov/resources/variables/line_alowd_chrg_amt",
          "display" : "Line Allowed Charge Amount"
        }]
      },
      "amount" : {
        "value" : 136,
        "currency" : "USD"
      }
    },
    {
      "category" : {
        "coding" : [{
          "system" : "https://bluebutton.cms.gov/resources/codesystem/adjudication",
          "code" : "https://bluebutton.cms.gov/resources/variables/line_bene_ptb_ddctbl_amt",
          "display" : "Line Beneficiary Part B Deductible Amount"
        }]
      },
      "amount" : {
        "value" : 0,
        "currency" : "USD"
      }
    },
    {
      "category" : {
        "coding" : [{
          "system" : "https://bluebutton.cms.gov/resources/codesystem/adjudication",
          "code" : "https://bluebutton.cms.gov/resources/variables/line_prcsg_ind_cd",
          "display" : "Line Processing Indicator Code"
        }]
      }
    }]
  }],
  "total" : [{
    "category" : {
      "coding" : [{
        "system" : "http://terminology.hl7.org/CodeSystem/adjudication",
        "code" : "submitted",
        "display" : "Submitted Amount"
      }],
      "text" : "Submitted Amount"
    },
    "amount" : {
      "value" : 299.63,
      "currency" : "USD"
    }
  }],
  "payment" : {
    "amount" : {
      "value" : 108.80000000000001,
      "currency" : "USD"
    }
  }
}

```
