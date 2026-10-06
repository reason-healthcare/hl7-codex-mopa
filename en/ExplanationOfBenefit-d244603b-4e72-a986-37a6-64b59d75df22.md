# d244603b-4e72-a986-37a6-64b59d75df22 - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Example ExplanationOfBenefit: d244603b-4e72-a986-37a6-64b59d75df22



## Resource Content

```json
{
  "resourceType" : "ExplanationOfBenefit",
  "id" : "d244603b-4e72-a986-37a6-64b59d75df22",
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
      "text" : "Anthem"
    },
    "beneficiary" : {
      "reference" : "urn:uuid:324d4f70-205b-60cc-a081-24b98a0f139e"
    },
    "payor" : [{
      "display" : "Anthem"
    }]
  }],
  "identifier" : [{
    "system" : "https://bluebutton.cms.gov/resources/variables/clm_id",
    "value" : "324d4f70-205b-60cc-4184-ff388bd1b344"
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
    "start" : "1985-07-27T08:08:17-05:00",
    "end" : "1986-07-27T08:08:17-05:00"
  },
  "created" : "1985-07-27T08:08:17-05:00",
  "insurer" : {
    "display" : "Anthem"
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
    "reference" : "urn:uuid:324d4f70-205b-60cc-4184-ff388bd1b344"
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
  "diagnosis" : [{
    "sequence" : 1,
    "diagnosisReference" : {
      "reference" : "urn:uuid:324d4f70-205b-60cc-e524-4f55fc9ea3c1"
    },
    "type" : [{
      "coding" : [{
        "system" : "http://terminology.hl7.org/CodeSystem/ex-diagnosistype",
        "code" : "principal"
      }]
    }]
  }],
  "insurance" : [{
    "focal" : true,
    "coverage" : {
      "reference" : "#coverage",
      "display" : "Anthem"
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
        "code" : "185345009",
        "display" : "Encounter for symptom (procedure)"
      }],
      "text" : "Encounter for symptom (procedure)"
    },
    "servicedPeriod" : {
      "start" : "1985-07-25T22:05:30-05:00",
      "end" : "1985-07-27T08:08:17-05:00"
    },
    "locationCodeableConcept" : {
      "coding" : [{
        "system" : "http://terminology.hl7.org/CodeSystem/ex-serviceplace",
        "code" : "21",
        "display" : "Nexis Health"
      }]
    },
    "encounter" : [{
      "reference" : "urn:uuid:324d4f70-205b-60cc-58cf-1e7016b4cbfa"
    }]
  },
  {
    "sequence" : 2,
    "diagnosisSequence" : [1],
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
        "code" : "254837009",
        "display" : "Malignant neoplasm of breast (disorder)"
      }],
      "text" : "Malignant neoplasm of breast (disorder)"
    },
    "servicedPeriod" : {
      "start" : "1985-07-25T22:05:30-05:00",
      "end" : "1985-07-27T08:08:17-05:00"
    },
    "locationCodeableConcept" : {
      "coding" : [{
        "system" : "http://terminology.hl7.org/CodeSystem/ex-serviceplace",
        "code" : "21",
        "display" : "Nexis Health"
      }]
    }
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
      "value" : 8624.83,
      "currency" : "USD"
    }
  }],
  "payment" : {
    "amount" : {
      "value" : 0,
      "currency" : "USD"
    }
  }
}

```
