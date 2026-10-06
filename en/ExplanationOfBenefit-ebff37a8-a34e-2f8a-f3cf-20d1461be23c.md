# ebff37a8-a34e-2f8a-f3cf-20d1461be23c - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example ExplanationOfBenefit: ebff37a8-a34e-2f8a-f3cf-20d1461be23c



## Resource Content

```json
{
  "resourceType" : "ExplanationOfBenefit",
  "id" : "ebff37a8-a34e-2f8a-f3cf-20d1461be23c",
  "contained" : [{
    "resourceType" : "ServiceRequest",
    "id" : "referral",
    "status" : "completed",
    "intent" : "order",
    "subject" : {
      "reference" : "urn:uuid:324d4f70-205b-60cc-a081-24b98a0f139e"
    },
    "requester" : {
      "reference" : "Practitioner?identifier=http://hl7.org/fhir/sid/us-npi|9999968495"
    },
    "performer" : [{
      "reference" : "Practitioner?identifier=http://hl7.org/fhir/sid/us-npi|9999968495"
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
    "value" : "324d4f70-205b-60cc-c25a-cd7373ad0288"
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
    "start" : "2021-03-01T18:46:24-06:00",
    "end" : "2022-03-01T18:46:24-06:00"
  },
  "created" : "2021-03-01T18:46:24-06:00",
  "insurer" : {
    "display" : "Medicare"
  },
  "provider" : {
    "reference" : "Practitioner?identifier=http://hl7.org/fhir/sid/us-npi|9999968495"
  },
  "referral" : {
    "reference" : "#referral"
  },
  "facility" : {
    "reference" : "Location?identifier=https://github.com/synthetichealth/synthea|3d038942-40fd-3bd7-a3b8-794b9cc858e8",
    "display" : "OPEN ACCESS VASCULAR ACCESS CENTER INC"
  },
  "claim" : {
    "reference" : "urn:uuid:324d4f70-205b-60cc-c25a-cd7373ad0288"
  },
  "outcome" : "complete",
  "careTeam" : [{
    "sequence" : 1,
    "provider" : {
      "reference" : "Practitioner?identifier=http://hl7.org/fhir/sid/us-npi|9999968495"
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
        "code" : "439740005",
        "display" : "Postoperative follow-up visit (procedure)"
      }],
      "text" : "Postoperative follow-up visit (procedure)"
    },
    "servicedPeriod" : {
      "start" : "2021-03-01T18:09:19-06:00",
      "end" : "2021-03-01T18:46:24-06:00"
    },
    "locationCodeableConcept" : {
      "coding" : [{
        "system" : "http://terminology.hl7.org/CodeSystem/ex-serviceplace",
        "code" : "21",
        "display" : "Nexis Health"
      }]
    },
    "encounter" : [{
      "reference" : "urn:uuid:324d4f70-205b-60cc-5ff8-97b1f4eef88d"
    }]
  },
  {
    "sequence" : 2,
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
        "code" : "25656009",
        "display" : "Physical examination, complete (procedure)"
      }],
      "text" : "Physical examination, complete (procedure)"
    },
    "servicedPeriod" : {
      "start" : "2021-03-01T18:09:19-06:00",
      "end" : "2021-03-01T18:46:24-06:00"
    },
    "locationCodeableConcept" : {
      "coding" : [{
        "system" : "http://terminology.hl7.org/CodeSystem/ex-serviceplace",
        "code" : "21",
        "display" : "Nexis Health"
      }]
    },
    "net" : {
      "value" : 615.85,
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
        "value" : 123.17000000000002,
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
        "value" : 492.68000000000006,
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
        "value" : 615.85,
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
        "value" : 615.85,
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
      "value" : 722.66,
      "currency" : "USD"
    }
  }],
  "payment" : {
    "amount" : {
      "value" : 492.68000000000006,
      "currency" : "USD"
    }
  }
}

```
