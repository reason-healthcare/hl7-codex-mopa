# 163e5f23-e6c7-e6ce-e175-29ec2556c67c - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example ExplanationOfBenefit: 163e5f23-e6c7-e6ce-e175-29ec2556c67c



## Resource Content

```json
{
  "resourceType" : "ExplanationOfBenefit",
  "id" : "163e5f23-e6c7-e6ce-e175-29ec2556c67c",
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
    "value" : "324d4f70-205b-60cc-403a-3d51560b106f"
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
    "start" : "2022-03-25T22:05:20-05:00",
    "end" : "2023-03-25T22:05:20-05:00"
  },
  "created" : "2022-03-25T22:05:20-05:00",
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
    "reference" : "urn:uuid:324d4f70-205b-60cc-403a-3d51560b106f"
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
        "code" : "310061009",
        "display" : "Gynecology service (qualifier value)"
      }],
      "text" : "Gynecology service (qualifier value)"
    },
    "servicedPeriod" : {
      "start" : "2022-03-25T21:34:33-05:00",
      "end" : "2022-03-25T22:05:20-05:00"
    },
    "locationCodeableConcept" : {
      "coding" : [{
        "system" : "http://terminology.hl7.org/CodeSystem/ex-serviceplace",
        "code" : "21",
        "display" : "Nexis Health"
      }]
    },
    "encounter" : [{
      "reference" : "urn:uuid:324d4f70-205b-60cc-e308-404db14d3249"
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
        "code" : "35025007",
        "display" : "Manual pelvic examination (procedure)"
      }],
      "text" : "Manual pelvic examination (procedure)"
    },
    "servicedPeriod" : {
      "start" : "2022-03-25T21:34:33-05:00",
      "end" : "2022-03-25T22:05:20-05:00"
    },
    "locationCodeableConcept" : {
      "coding" : [{
        "system" : "http://terminology.hl7.org/CodeSystem/ex-serviceplace",
        "code" : "21",
        "display" : "Nexis Health"
      }]
    },
    "net" : {
      "value" : 287.99,
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
        "value" : 57.598000000000006,
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
        "value" : 230.39200000000002,
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
        "value" : 287.99,
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
        "value" : 287.99,
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
  },
  {
    "sequence" : 3,
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
        "code" : "90226004",
        "display" : "Cytopathology procedure, preparation of smear, genital source (procedure)"
      }],
      "text" : "Cytopathology procedure, preparation of smear, genital source (procedure)"
    },
    "servicedPeriod" : {
      "start" : "2022-03-25T21:34:33-05:00",
      "end" : "2022-03-25T22:05:20-05:00"
    },
    "locationCodeableConcept" : {
      "coding" : [{
        "system" : "http://terminology.hl7.org/CodeSystem/ex-serviceplace",
        "code" : "21",
        "display" : "Nexis Health"
      }]
    },
    "net" : {
      "value" : 1231.7,
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
        "value" : 246.34000000000003,
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
        "value" : 985.3600000000001,
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
        "value" : 1231.7,
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
        "value" : 1231.7,
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
      "value" : 1626.5,
      "currency" : "USD"
    }
  }],
  "payment" : {
    "amount" : {
      "value" : 1215.7520000000002,
      "currency" : "USD"
    }
  }
}

```
