# 19c02e32-9639-794a-7e1a-7db80fef14af - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example ExplanationOfBenefit: 19c02e32-9639-794a-7e1a-7db80fef14af



## Resource Content

```json
{
  "resourceType" : "ExplanationOfBenefit",
  "id" : "19c02e32-9639-794a-7e1a-7db80fef14af",
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
    "value" : "324d4f70-205b-60cc-0297-a5a1bd87d1f0"
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
    "start" : "2026-04-01T03:40:17-05:00",
    "end" : "2027-04-01T03:40:17-05:00"
  },
  "created" : "2026-04-01T03:40:17-05:00",
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
    "reference" : "urn:uuid:324d4f70-205b-60cc-0297-a5a1bd87d1f0"
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
        "code" : "410410006",
        "display" : "Screening surveillance (regime/therapy)"
      }],
      "text" : "Screening surveillance (regime/therapy)"
    },
    "servicedPeriod" : {
      "start" : "2026-04-01T03:17:06-05:00",
      "end" : "2026-04-01T03:40:17-05:00"
    },
    "locationCodeableConcept" : {
      "coding" : [{
        "system" : "http://terminology.hl7.org/CodeSystem/ex-serviceplace",
        "code" : "21",
        "display" : "Nexis Health"
      }]
    },
    "encounter" : [{
      "reference" : "urn:uuid:324d4f70-205b-60cc-f6ec-9182270fc784"
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
        "code" : "71651007",
        "display" : "Mammography (procedure)"
      }],
      "text" : "Mammography (procedure)"
    },
    "servicedPeriod" : {
      "start" : "2026-04-01T03:17:06-05:00",
      "end" : "2026-04-01T03:40:17-05:00"
    },
    "locationCodeableConcept" : {
      "coding" : [{
        "system" : "http://terminology.hl7.org/CodeSystem/ex-serviceplace",
        "code" : "21",
        "display" : "Nexis Health"
      }]
    },
    "net" : {
      "value" : 261.12,
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
        "value" : 52.224000000000004,
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
        "value" : 208.89600000000002,
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
        "value" : 261.12,
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
        "value" : 261.12,
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
      "value" : 367.93,
      "currency" : "USD"
    }
  }],
  "payment" : {
    "amount" : {
      "value" : 208.89600000000002,
      "currency" : "USD"
    }
  }
}

```
