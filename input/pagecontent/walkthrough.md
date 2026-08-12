{:.no_toc}

### Overview

This page traces the concrete API calls involved in two MOPA workflows for the same clinical
scenario, corresponding to the two-layer framework defined in [Use Cases and Actors](use-cases.html).

**Layer 1** (optional) is provider-driven pre-order CDS: a SMART app launched from the EHR
that reviews available patient data, collects missing elements, and presents
guideline-concordant regimen options before an order is placed.

**Layer 2** is the automated structured authorization exchange: the CDS Hooks pipeline that
fires during order entry and drives CRD → DTR → PAS as needed.

Both layers share the same oncology data categories as the basis for clinical evaluation.

### Clinical Scenario

**Patient:** Jane Smith (DOB 1968-04-15, MRN-78432)  
**Clinician:** Dr. Maria Lopez, medical oncologist  
**Diagnosis:** Invasive ductal carcinoma, right breast — HER2+, ER−, PR−, Stage IIB (T2 N1 M0), diagnosed November 2025  
**Order:** Adjuvant TH regimen (paclitaxel 80 mg/m² IV weekly + trastuzumab), 12-week course

---

### Layer 1 — Pre-Order Clinical Decision Support (Optional)

The SMART app is the primary CDS tool for the provider. It is launched directly from the
EHR when the provider clicks a CDS button in the patient chart. It has three responsibilities:

1. **Data review** — query the FHIR server for relevant oncology data elements and display what is present
2. **Data collection** — allow the provider to enter or confirm any missing elements inline
3. **Regimen options** — present guideline-concordant anticancer regimen options based on the
   complete clinical context

This flow is governed by the SMART App Launch (EHR launch) specification. No CDS Hooks
invocation occurs.

#### When This Applies

- Provider opens a patient chart and clicks the oncology CDS tool
- An oncology coordinator reviews PA readiness before the ordering encounter
- A clinician wants to explore guideline-based regimen options before selecting from the
  order-set

#### Step 1 — EHR Launch

The provider clicks the CDS button in the EHR. The EHR initiates a SMART EHR launch,
providing the app with the FHIR server base URL and a launch token encoding the current
patient context.

```
GET https://smart-app.example.org/launch?iss=https%3A%2F%2Fehr.example.org%2Ffhir&launch=<launch-token>
```

The app completes the SMART OAuth flow and obtains an access token scoped to the current
patient. The SMART App Launch specification governs this exchange and it is not reproduced
here.

#### Step 2 — Cancer Type Identification

With a patient-scoped access token, the app queries the EHR FHIR server for the patient's
active primary cancer condition to determine which oncology data categories apply.

##### App reads primary cancer condition

```
GET https://ehr.example.org/fhir/Condition?patient=MOPAPatientExample
    &code:in=http://hl7.org/fhir/us/mcode/ValueSet/mcode-primary-cancer-disorder-vs
    &clinical-status=active
Accept: application/fhir+json
Authorization: Bearer <smart-access-token>
```

```
// Response: single active primary cancer — breast cancer (SNOMED 254837009)
{
  "resourceType": "Bundle", "type": "searchset", "total": 1,
  "entry": [{
    "resource": {
      "resourceType": "Condition",
      "code": { "coding": [{ "system": "http://snomed.info/sct", "code": "254837009", "display": "Malignant neoplasm of breast" }] },
      "clinicalStatus": { "coding": [{ "code": "active" }] }
    }
  }]
}
```

The app uses the cancer type to determine which oncology data elements to query next.

#### Step 3 — Data Element Queries

For each oncology data category relevant to breast cancer, the app queries the EHR FHIR server.
These run in parallel where possible.

```
// Primary cancer condition (already retrieved in Step 2 — reused)

// TNM stage group
GET https://ehr.example.org/fhir/Observation
    ?patient=MOPAPatientExample
    &_profile=http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-tnm-stage-group
    &_sort=-date&_count=1
Authorization: Bearer <smart-access-token>

// Tumor markers (ER, PR, HER2)
GET https://ehr.example.org/fhir/Observation
    ?patient=MOPAPatientExample
    &code:in=http://hl7.org/fhir/us/mcode/ValueSet/mcode-tumor-marker-test-vs
    &_sort=-date
Authorization: Bearer <smart-access-token>

// ECOG performance status
GET https://ehr.example.org/fhir/Observation
    ?patient=MOPAPatientExample
    &_profile=http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-ecog-performance-status
    &_sort=-date&_count=1
Authorization: Bearer <smart-access-token>

// Line of therapy
GET https://ehr.example.org/fhir/Observation
    ?patient=MOPAPatientExample
    &_profile=http://hl7.org/fhir/us/codex-mopa/StructureDefinition/line-of-therapy-observation
Authorization: Bearer <smart-access-token>

// Prior systemic therapy
GET https://ehr.example.org/fhir/MedicationRequest
    ?patient=MOPAPatientExample
    &_profile=http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-request
    &status=completed,stopped
Authorization: Bearer <smart-access-token>
```

#### Step 4 — UX: Data Review, Missing Item Input, and Regimen Options

With query results in hand the app presents a three-phase interface. This is a UX
description, not an API call.

##### Phase 1 — Data Review

Each relevant oncology data element is shown with its current value or a missing indicator:

| Data Element | Value | Source |
|---|---|---|
| Primary cancer | Malignant neoplasm of breast | Condition (confirmed, active) |
| TNM stage | Stage IIB (T2 N1 M0) | Observation 2025-11-10 |
| ER status | Negative | Observation 2025-11-12 |
| PR status | Negative | Observation 2025-11-12 |
| HER2 status | **Missing** | No result found |
| ECOG performance status | PS 1 | Observation 2026-05-10 |
| Line of therapy | First-line | Observation |
| Prior systemic therapy | None on record | MedicationRequest |
{: .table }

##### Phase 2 — Missing Item Input

For each missing element the app renders an inline input. HER2 status is the only gap for
Jane Smith. Dr. Lopez selects the result directly in the app:

> **HER2 status** _(required for trastuzumab coverage)_  
> \[ IHC 0 \] \[ IHC 1+ \] \[ IHC 2+ \] **\[ IHC 3+ (Positive) \]** \[ ISH Amplified \] \[ ISH Not Amplified \]

> **EHR write-back limitation:** Not all EHRs grant SMART apps write access to clinical
> data. Whether the app can persist entered values as `Observation` resources on the EHR
> FHIR server depends on the scopes the EHR grants at launch. Two patterns are realistic:
>
> - **Write-back supported** — the EHR grants `patient/Observation.write` (or `patient/*.write`)
>   and the app persists the entered value directly. When order-select fires shortly after,
>   the CRD service queries the EHR FHIR server and finds the new Observation, allowing a
>   complete determination without invoking DTR.
>
> - **Write-back not supported** — the EHR does not grant write scopes. The app holds the
>   entered value in session only. The gap remains in the FHIR server, so the CDS Service
>   will still return a DTR card at order-select time. The app’s value for the session
>   serves as a convenience pre-fill for the DTR questionnaire rather than a durable record.

Where write-back is supported, the app persists the entered value as an `Observation`
conforming to `mcode-tumor-marker-test`:

```
POST https://ehr.example.org/fhir/Observation
Content-Type: application/fhir+json
Authorization: Bearer <smart-access-token>

{
  "resourceType": "Observation",
  "meta": { "profile": ["http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-tumor-marker-test"] },
  "status": "final",
  "code": { "coding": [{ "system": "http://loinc.org", "code": "85319-2", "display": "HER2 [Presence] in Breast cancer specimen by Immune stain" }] },
  "subject": { "reference": "Patient/MOPAPatientExample" },
  "effectiveDateTime": "2026-05-15",
  "valueCodeableConcept": {
    "coding": [{ "system": "http://snomed.info/sct", "code": "10828004", "display": "Positive (qualifier value)" }]
  }
}
```

##### Phase 3 — Guideline-Based Regimen Options

With all data elements now present and confirmed, the app evaluates the clinical context
against its guideline knowledge base and presents applicable anticancer regimen options.
For Jane Smith (HER2+, ER−, PR−, Stage IIB, adjuvant intent, first-line, ECOG PS 1, no
prior HER2-directed therapy):

| Regimen | Guideline Authority | Setting | Notes |
|---|---|---|---|
| **TH** (paclitaxel + trastuzumab) | Guideline Authority | Adjuvant, HER2+ | Approvable for Stage I–II, HER2+, node-positive |
| **AC→TH** (ddAC → paclitaxel + trastuzumab) | Guideline Authority | Adjuvant, HER2+ | Higher-risk node-positive disease |
| **TCHP** (docetaxel + carboplatin + trastuzumab + pertuzumab) | Guideline Authority | Adjuvant, HER2+, node-positive | Consider when anthracycline contraindicated |
{: .table }

The provider selects the approvable regimen. That selection is carried forward into the
EHR order-set, which creates the `RequestGroup` and fires `order-select` — transitioning
into the CDS Hooks workflow described in Layer 2.

---

### Layer 2 — Structured Authorization Exchange (CDS Hooks)

This is the automated pipeline that fires during order entry. It uses two CDS Hooks stages:

1. **`order-select` (informational)** — fires when the provider selects a regimen from the
   order-set, before signing. The CRD service evaluates approvability and returns informational
   cards so the provider can see whether the regimen will be approvable, whether PA will be
   required, or whether documentation is missing. This is advisory — the order has not been
   committed.

2. **`order-sign` (final determination)** — fires when the provider clicks Sign. The CRD
   service returns the final coverage determination: Authorization Satisfied (PA bypassed),
   PA required, or DTR still needed.

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
          ↳ 3a: CRD service re-queries EHR FHIR server (HER2 now present in Response B path)
          ↳ 3b: Response — Authorization Satisfied (success indicator)
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

Dr. Lopez enters HER2 IHC 3+ (positive). The DTR app saves a `QuestionnaireResponse` to
the EHR's FHIR server and signals completion.

This DTR exchange is governed by the Da Vinci DTR specification and is not reproduced in
full here.

---

#### Step 3 — order-sign: Final Determination

Dr. Lopez reviews the informational card from `order-select` and clicks **Sign**. The EHR
fires `order-sign`. The key differences from `order-select`:
- All companion `MedicationRequest` resources are now finalised and included in
  `context.draftOrders`.
- The CRD service returns the **final binding determination** (not informational).
- In the Response B path, the CRD service re-queries the EHR FHIR server and now finds
  the HER2 Observation saved by DTR.

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

The CRD service re-queries the EHR FHIR server using `fhirAuthorization`. In the Response B path,
the HER2 Observation saved by DTR is now present on the EHR server.

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

#### See Also

- [CRD Workflow](cds-workflow.html) — how the CRD service queries back and conformance requirements
- [Data Requirements](data-requirements.html) — oncology data categories queried during CRD evaluation
- [Use Case 1: Breast Cancer PA](breast-cancer-pa.html) — clinical data requirements for this scenario
