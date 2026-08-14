{:.no_toc}

### Overview

This page traces the concrete API calls involved in the MOPA workflow for a single clinical
scenario, using the Da Vinci CRD → DTR → PAS pipeline.

The workflow uses two CDS Hooks stages:

1. **`order-select` (informational)** — fires when the provider selects a regimen from the
   order-set, before signing. The CRD service evaluates approvability and returns informational
   cards so the provider can see whether the regimen will be approvable, whether PA will be
   required, or whether documentation is missing. This is advisory — the order has not been
   committed.

2. **`order-sign` (final determination)** — fires when the provider clicks Sign. The CRD
   service returns the final coverage determination: Authorization Satisfied (PA bypassed),
   PA required, or DTR still needed.

### Clinical Scenario

**Patient:** Jane Smith (DOB 1968-04-15, MRN-78432)  
**Clinician:** Dr. Maria Lopez, medical oncologist  
**Diagnosis:** Invasive ductal carcinoma, right breast — HER2+, ER−, PR−, Stage IIB (T2 N1 M0), diagnosed November 2025  
**Order:** Adjuvant TH regimen (paclitaxel 80 mg/m² IV weekly + trastuzumab), 12-week course

---

### CDS Hooks Workflow

The EHR fires a standard CDS Hooks request containing the ordered `RequestGroup` and — when
available — `fhirAuthorization` credentials. The CRD service uses those credentials to query
the EHR FHIR server directly for the oncology patient context it needs. No special extension
or prefetch configuration is required from the EHR.

#### API Call Sequence

```
Step 1  POST /cds-services/oncology-crd  ← order-select fires (informational)
          ↳ 1a: CRD service reads RequestGroup from draftOrders
          ↳ 1b: CRD service queries EHR FHIR server (using fhirAuthorization)
          ↳ 1c: Response A — Approvable (info indicator, PA can be bypassed)
          ↳ 1c: Response B — DTR required (warning, HER2 status missing from EHR)
Step 2  DTR questionnaire launched (Response B path only)
Step 3  POST /cds-services/oncology-crd  ← order-sign fires (final determination)
          ↳ 3a: CRD service queries EHR FHIR server (DTR responses may NOT be persisted)
          ↳ 3b: Response A — Authorization Satisfied (success indicator)
          ↳ 3b: Response B — DTR still required (warning, data still missing)
```

#### Step 1 — order-select (Informational Approvability Check)

Dr. Lopez selects the **TH regimen** from the oncology order-set. The EHR creates a draft
`RequestGroup` and fires `order-select` — this is an **informational** call that happens
**before the order is signed**. The CRD service evaluates the regimen's approvability and
returns advisory cards so Dr. Lopez can see whether the order will be approvable before
committing to it. The order is still a draft at this stage.

##### Step 1b — order-select Hook Request

```
POST https://cds.example.org/cds-services/oncology-crd
Content-Type: application/json
```

```jsonc
{
  "hook":         "order-select",
  "hookInstance": "a8f3c2e1-7b4d-4e9a-bc21-3f8d6a901c77",
  "fhirServer":   "https://ehr.example.org/fhir",
  "fhirAuthorization": {
    "access_token": "<bearer-token>",
    "token_type":   "Bearer",
    "expires_in":   300,
    "scope":        "patient/Condition.read patient/Observation.read patient/MedicationRequest.read patient/RequestGroup.read",
    "subject":      "oncology-crd-service"
  },

  // ── Standard CDS Hooks context ────────────────────────────────────────────
  "context": {
    "userId":      "Practitioner/MOPAOncologistExample",
    "patientId":   "MOPAPatientExample",
    "encounterId": "encounter-20260515-001",

    // At order-select only the RequestGroup is in selections; MedicationRequests
    // are still being authored and are not yet finalised.
    "selections": ["RequestGroup/THRegimenOrder"],

    "draftOrders": {
      "resourceType": "Bundle",
      "type": "collection",
      "entry": [
        {
          "fullUrl": "https://ehr.example.org/fhir/RequestGroup/THRegimenOrder",
          "resource": {
            "resourceType":          "RequestGroup",
            "id":                    "THRegimenOrder",
            "status":                "draft",
            "intent":                "order",
            "subject":               { "reference": "Patient/MOPAPatientExample" },
            // instantiatesCanonical links back to the protocol definition.
            // The CDS Service MAY fetch the PlanDefinition for richer evaluation.
            "instantiatesCanonical": ["http://hl7.org/fhir/us/codex-mopa/PlanDefinition/THRegimenDefinition"],
            "extension": [
              {
                "url": "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/ocpa-regimen-intent",
                "valueCodeableConcept": {
                  "coding": [{ "system": "http://snomed.info/sct", "code": "373846009", "display": "Adjuvant - intent" }]
                }
              },
              {
                "url": "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/ocpa-regimen-treatment-line",
                "valueCodeableConcept": {
                  "coding": [{ "system": "http://hl7.org/fhir/us/codex-mopa/CodeSystem/treatment-line-cs", "code": "1L", "display": "First-line" }]
                }
              },
              {
                // regimenDiseaseContext: OPTIONAL. An EHR MAY populate this
                // to make the disease context explicit on the RequestGroup.
                "url": "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/ocpa-regimen-disease-context",
                "valueCodeableConcept": {
                  "coding": [{ "system": "http://snomed.info/sct", "code": "254837009", "display": "Malignant neoplasm of breast" }]
                }
              }
            ],
            "action": [
              {
                "title":    "Paclitaxel 80 mg/m² IV — days 1, 8, 15 of 21-day cycle",
                "resource": { "reference": "MedicationRequest/PaclitaxelMedRequestTH" }
              },
              {
                "title":    "Trastuzumab IV — days 1, 8, 15 of 21-day cycle",
                "resource": { "reference": "MedicationRequest/TrastuzumabMedRequestTH" }
              }
            ]
          }
        }
      ]
    }
  },

}
```

##### Step 1b — CRD Service Queries EHR FHIR Server

Upon receiving the hook, the CRD service uses the `fhirAuthorization` access token to query
the EHR directly for required oncology context:

```
// 1. Primary cancer condition
GET https://ehr.example.org/fhir/Condition
    ?patient=MOPAPatientExample
    &code:in=http://hl7.org/fhir/us/mcode/ValueSet/mcode-primary-cancer-disorder-vs
    &clinical-status=active
Authorization: Bearer <bearer-token>
// Response: breast cancer (SNOMED 254837009), active, confirmed

// 2. Cancer stage
GET https://ehr.example.org/fhir/Observation
    ?patient=MOPAPatientExample
    &code:in=http://hl7.org/fhir/us/mcode/ValueSet/mcode-observation-codes-vs
    &_sort=-date&_count=1
// Response: Stage IIB (T2 N1 M0)

// 3. Biomarkers
GET https://ehr.example.org/fhir/Observation
    ?patient=MOPAPatientExample
    &code:in=http://hl7.org/fhir/us/mcode/ValueSet/mcode-tumor-marker-test-vs
// Response: HER2 IHC 3+ (positive), ER negative, PR negative

// 4. Line of therapy
GET https://ehr.example.org/fhir/Observation
    ?patient=MOPAPatientExample
    &code:in=http://hl7.org/fhir/us/codex-mopa/ValueSet/treatment-line-vs
// Response: First-line

// 5. Performance status
GET https://ehr.example.org/fhir/Observation
    ?patient=MOPAPatientExample
    &code:in=http://hl7.org/fhir/us/mcode/ValueSet/mcode-ecog-performance-status-vs
    &_sort=-date&_count=1
// Response: ECOG PS 1

// 6. Prior therapy
GET https://ehr.example.org/fhir/MedicationRequest
    ?patient=MOPAPatientExample
    &status=completed,stopped
// Response: empty — no prior systemic therapy
```

##### Step 1c — CDS Service Evaluation Logic

On receipt of the query results, the CDS Service evaluates:

```
1. Identify cancer type from Condition query:
   → code=254837009 "Malignant neoplasm of breast" → breast cancer evaluation

2. Evaluate coverage criteria against retrieved context:
   → Diagnosis confirmed (mcode-primary-cancer-condition): ✓
   → Stage IIB (T2 N1 M0) present: ✓
   → HER2 positive by IHC: ✓  ← key criterion for trastuzumab authorization
   → ER−/PR− confirmed: ✓
   → ECOG PS 1: ✓
   → No prior HER2-directed therapy: ✓ (prior therapy empty)
   → Line of therapy: first-line adjuvant: ✓

3. All criteria satisfied → evaluate coverage rules
   → TH adjuvant for HER2+ Stage IIB breast cancer: covered per Guideline Authority
   → Authorization Satisfied
```

##### Step 1c Response A — Approvable (Informational)

All required oncology context was retrieved from the EHR FHIR server and all PA criteria
were met. At `order-select` the CRD service returns an **informational** card (indicator: `info`)
indicating that the regimen is approvable and PA can be bypassed. This is advisory — the
provider has not yet signed the order. The final binding determination comes at `order-sign`.

```jsonc
// HTTP/1.1 200 OK
// Content-Type: application/json

{
  "cards": [
    {
      "uuid":      "card-e7f1a2b3-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
      "summary":   "TH Regimen: Approvable — PA Can Be Bypassed",
      "indicator": "info",
      "detail":    "Adjuvant TH (paclitaxel + trastuzumab) for HER2-positive Stage IIB breast cancer: prior authorization conditions have been evaluated and PA can be bypassed. This is an informational check at order selection — the final determination will be returned at order sign. HER2 IHC positivity confirmed, Stage IIB, first-line adjuvant.",
      "source": {
        "label": "MOPA Coverage Decision Support",
        "url":   "https://cds.example.org",
        "icon":  "https://cds.example.org/logo.png"
      }
    }
  ]
}
```

##### Step 1c Response B — DTR Required (HER2 Status Missing)

In this alternate scenario, the CRD service queried the EHR FHIR server for biomarkers
but found no HER2 Observation — the pathology report has not yet been filed. The service
cannot confirm HER2 positivity and returns a DTR launch card.

```jsonc
// HTTP/1.1 200 OK
// Content-Type: application/json

{
  "cards": [
    {
      "uuid":      "card-b3c4d5e6-7f8a-9b0c-1d2e-3f4a5b6c7d8e",
      "summary":   "Documentation Required: HER2 Status Needed for Trastuzumab Coverage",
      "indicator": "warning",
      "detail":    "HER2 receptor status is required to evaluate trastuzumab coverage. No HER2 result was found in the patient record. Please provide HER2 test results via the prior authorization documentation form.",
      "source": {
        "label": "MOPA Coverage Decision Support",
        "url":   "https://cds.example.org"
      },
      "links": [
        {
          "label": "Complete Prior Authorization Documentation (DTR)",
          "url":   "https://dtr.example.org/launch?iss=https%3A%2F%2Fehr.example.org%2Ffhir&launch=<launch-token>",
          "type":  "smart",
          "appContext": "{\"regimen\":\"RequestGroup/THRegimenOrder\",\"missingData\":[\"mcode-tumor-marker-test (HER2)\"]}"
        }
      ]
    }
  ]
}
```

---

#### Step 2 — DTR Questionnaire (Response B Path Only)

Dr. Lopez clicks "Complete Prior Authorization Documentation." The DTR SMART app launches
within the EHR and pre-populates all answers derivable from the patient record. The only
unanswered item is HER2 status.

Dr. Lopez enters HER2 IHC 3+ (positive). The DTR app captures the result as a
`QuestionnaireResponse` and signals completion to the EHR.

> **DTR responses are not persisted to the EHR FHIR server.** In most EHR deployments, the
> DTR `QuestionnaireResponse` is held in the EHR session context (or as an in-progress order
> attachment) but is **not** written back to the FHIR server as a clinical `Observation`.
> This means the CRD service cannot rely on finding DTR-collected data when it queries the
> EHR FHIR server at `order-sign`. The `QuestionnaireResponse` travels with the order
> submission to PAS, not back to the EHR's clinical data store.

This DTR exchange is governed by the Da Vinci DTR specification and is not reproduced in
full here.

---

#### Step 3 — order-sign: Final Determination

Dr. Lopez reviews the informational card from `order-select` and clicks **Sign**. The EHR
fires `order-sign`. The key differences from `order-select`:
- All companion `MedicationRequest` resources are now finalised and included in
  `context.draftOrders`.
- The CRD service returns the **final binding determination** (not informational).
- The CRD service queries the EHR FHIR server again for oncology context. However, because
  DTR responses are not persisted to the FHIR server, the CRD service **cannot assume**
  that data collected via DTR will be present. If the data is still missing, the CRD
  service returns a DTR-required card again, or the EHR may include the DTR
  `QuestionnaireResponse` in `context.draftOrders` so the CRD service can read it
  directly from the hook context rather than relying on a FHIR query.

##### Request (abbreviated — changes from order-select highlighted)

```
POST https://cds.example.org/cds-services/oncology-crd
Content-Type: application/json
```

```jsonc
{
  "hook":         "order-sign",
  "hookInstance": "f2e1d0c9-8b7a-6f5e-4d3c-2b1a0f9e8d7c",
  "fhirServer":   "https://ehr.example.org/fhir",
  "fhirAuthorization": { "...": "..." },

  "context": {
    "userId":    "Practitioner/MOPAOncologistExample",
    "patientId": "MOPAPatientExample",

    "draftOrders": {
      "resourceType": "Bundle",
      "type": "collection",
      "entry": [
        // RequestGroup — same as order-select
        { "resource": { "resourceType": "RequestGroup", "id": "THRegimenOrder", "...": "..." } },

        // MedicationRequests — now present and finalised
        {
          "resource": {
            "resourceType": "MedicationRequest",
            "id":           "PaclitaxelMedRequestTH",
            "status":       "draft",
            "intent":       "order",
            "subject":      { "reference": "Patient/MOPAPatientExample" },
            "medicationCodeableConcept": {
              "coding": [{ "system": "http://www.nlm.nih.gov/research/umls/rxnorm", "code": "56946", "display": "paclitaxel" }]
            },
            "dosageInstruction": [{ "text": "80 mg/m² IV over 1 hour, weekly (days 1, 8, 15 of 21-day cycle)" }]
          }
        },
        {
          "resource": {
            "resourceType": "MedicationRequest",
            "id":           "TrastuzumabMedRequestTH",
            "status":       "draft",
            "intent":       "order",
            "subject":      { "reference": "Patient/MOPAPatientExample" },
            "medicationCodeableConcept": {
              "coding": [{ "system": "http://www.nlm.nih.gov/research/umls/rxnorm", "code": "224905", "display": "trastuzumab" }]
            },
            "dosageInstruction": [{ "text": "4 mg/kg IV loading dose week 1, then 2 mg/kg IV weekly" }]
          }
        }
      ]
    }
  }
}
```

The CRD service queries the EHR FHIR server using `fhirAuthorization`. In the Response B path,
the HER2 status collected by DTR is **not** expected to be present on the EHR FHIR server —
DTR `QuestionnaireResponse` resources are held in the EHR session, not written back as
clinical `Observation` resources. The CRD service evaluation at `order-sign` therefore
**cannot assume** that data gaps identified at `order-select` have been filled.

##### Response — Authorization Satisfied

```jsonc
// HTTP/1.1 200 OK
// Content-Type: application/json

{
  "cards": [
    {
      "uuid":      "card-9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "summary":   "TH Regimen: Authorization Satisfied",
      "indicator": "success",
      "detail":    "Adjuvant TH (paclitaxel + trastuzumab) for HER2-positive (IHC 3+) Stage IIB breast cancer: while prior authorization would typically be required, the prior authorization conditions have been evaluated and prior authorization can be bypassed. Confirmed HER2 positivity (IHC 3+), Stage IIB disease, ECOG PS 1, no prior HER2-directed therapy, first-line adjuvant intent.",
      "source": {
        "label": "MOPA Coverage Decision Support",
        "url":   "https://cds.example.org"
      }
    }
  ],
  "systemActions": [
    {
      "type":        "create",
      "description": "Record authorization satisfied",
      "resource": {
        "resourceType": "Coverage",
        "status":       "active",
        "subscriber":   { "reference": "Patient/MOPAPatientExample" },
        "payor":        [{ "display": "Example Health Plan" }]
      }
    }
  ]
}
```

---

#### What Changes for a Different Cancer Type

If Dr. Lopez had instead been ordering a lung cancer regimen (e.g., carboplatin + pemetrexed
for NSCLC), the only differences in the CDS Hooks flow would be:

| Field | Breast cancer | Lung cancer |
|---|---|---|
| Primary cancer Condition code | SNOMED 254837009 | SNOMED 363358000 |
| Oncology queries issued | ER/PR/HER2, TNM breast staging | EGFR/ALK/PD-L1, TNM lung staging |
| DTR questionnaire (if needed) | Breast cancer PA form | Lung cancer PA form |
{: .table }

The hook request, the service endpoint, and the `fhirAuthorization` mechanism are identical.
The CRD service determines the applicable cancer type from its Condition query and selects
the appropriate coverage evaluation logic internally. The EHR requires no cancer-type-specific
configuration.

---

### Biosimilar Substitution — Propose Alternate Request

When the payer policy requires a biosimilar substitution (e.g., trastuzumab → trastuzumab-dttb),
the CRD service returns a **second card** at `order-select` alongside the approvable card. This
card uses the CDS Hooks suggestion mechanism (the Da Vinci CRD "Propose Alternate Request"
pattern) to propose replacing the original `MedicationRequest` with a biosimilar alternative.

#### Card structure

The substitution suggestion card contains:

- `indicator: "info"` — the regimen is approvable; the card proposes a modification
- `source.topic.code: "therapy-alternatives-req"` — CRD response type
- `suggestions[0]` with `actions`:
  - `delete` — targets the original trastuzumab `MedicationRequest` by `resourceId`
    (matching its `fullUrl` in `context.draftOrders`)
  - `create` — contains the replacement `MedicationRequest` with
    trastuzumab-dttb (RxNorm 1992624) and a `substitution` element
    indicating formulary policy
- `selectionBehavior: "at-most-one"` — accept the substitution or proceed as-is
- `overrideReasons` — clinical contraindication, patient preference, formulary exception

#### Provider interaction

The EHR renders the suggestion as Accept/Override buttons in the Coverage Discovery panel.
When the provider **accepts**:

1. The EHR applies the delete + create actions to `context.draftOrders` in-session
2. `RequestGroup.action[].resource` references are updated to point to the replacement
3. The modified Bundle is sent to `order-sign`
4. The CRD service returns **Authorization Satisfied** because the order now reflects
   the payer-approved regimen

When the provider **overrides**, the original order proceeds to `order-sign` unchanged.
The CRD service notes the override and may require PA submission for the non-substituted regimen.

#### Example response (order-select with biosimilar substitution)

```jsonc
{
  "cards": [
    {
      "uuid": "card-approvable-...",
      "summary": "Approvable — PA Can Be Bypassed",
      "indicator": "info",
      "detail": "All required oncology context has been retrieved... Payer modification required: trastuzumab → trastuzumab-dttb (Ontrudy).",
      "source": { "label": "MOPA CRD Service", "topic": { "code": "coverage-information" } }
    },
    {
      "uuid": "card-suggestion-...",
      "summary": "Payer Modification Required — Biosimilar Substitution",
      "indicator": "info",
      "source": {
        "label": "MOPA CRD Service",
        "topic": { "system": "http://hl7.org/fhir/us/davinci-crd/CodeSystem/temp", "code": "therapy-alternatives-req" }
      },
      "suggestions": [
        {
          "label": "Accept Substitution (trastuzumab → trastuzumab-dttb)",
          "uuid": "suggestion-...",
          "isRecommended": true,
          "actions": [
            { "type": "delete", "description": "Remove original trastuzumab order", "resourceId": "urn:uuid:mr-trastuzumab-th" },
            { "type": "create", "description": "Substitute trastuzumab-dttb (Ontrudy) for trastuzumab", "resource": { "resourceType": "MedicationRequest", "..." } }
          ]
        }
      ],
      "selectionBehavior": "at-most-one",
      "overrideReasons": [
        { "code": "clinical-contraindication", "display": "Clinical contraindication to biosimilar" },
        { "code": "patient-preference", "display": "Patient already established on reference product" },
        { "code": "formulary-exception", "display": "Formulary exception approved" }
      ]
    }
  ]
}
```

> **See [Da Vinci Gap Proposals](davinci-gap-proposals.html) — MOPA-DV-CRD-005** for the
> upstream proposal to formalize this pattern in the CRD IG.

---

#### See Also

- [CRD Workflow](cds-workflow.html) — how the CRD service queries back and conformance requirements
- [Data Requirements](data-requirements.html) — oncology data categories queried during CRD evaluation
- [Use Case 1: Breast Cancer PA](breast-cancer-pa.html) — clinical data requirements for this scenario
