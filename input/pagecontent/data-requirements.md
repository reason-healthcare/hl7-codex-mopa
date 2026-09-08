
### Overview

This page defines the oncology patient data categories that are relevant for prior authorization
evaluation. These categories inform what the CRD service queries via FHIR when it receives
a FHIR access token in the CDS Hooks `fhirAuthorization` object.

The CRD service retrieves data directly from the EHR's FHIR server using standard
FHIR search queries.

### The Separation of Concerns

```
RequestGroup      ← what is being ordered (patient-specific regimen instance)
PlanDefinition    ← the canonical regimen definition the RequestGroup instantiates
EHR FHIR server   ← source of patient context; queried by CRD service via fhirAuthorization
DTR Questionnaire ← collection instrument for missing data when FHIR query is insufficient
```

### Oncology Data Categories

All cancer-specific evaluations draw on these data categories. For each, the table shows the
relevant FHIR resource and the primary mCODE-based query pattern.

| Category | FHIR Resource | Query Basis |
|---|---|---|
| Primary cancer condition | `Condition` | `code:in` mCODE primary cancer ValueSet |
| Stage / extent of disease | `Observation` | `code:in` mCODE staging ValueSet |
| Biomarkers | `Observation` | `code:in` mCODE tumor marker ValueSet |
| Treatment intent / setting | `RequestGroup.extension:category` | Order-specific Da Vinci CRD `ext-request-category` value; no FHIR query needed |
| Line of therapy | `RequestGroup.extension:category/lineOfTherapy` | Order-specific profiled CRD category, bound to `TreatmentLineVS`; no separate FHIR query is required |
| Prior therapy | `MedicationRequest` / `Procedure` | Completed anti-cancer treatments |
| Performance status | `Observation` | `code:in` mCODE ECOG/Karnofsky ValueSet |
| Ordered regimen | `RequestGroup` | Passed in `context.draftOrders` — no query needed |
{: .table }

### CRD Usage

When the CRD service receives a `fhirAuthorization` object in the hook request, it issues
FHIR search queries against the EHR server to retrieve the categories above. The service
then evaluates the ordered `RequestGroup` against the retrieved patient context.

If required data is missing from the FHIR server (not yet documented), the CRD service
returns a DTR launch card so the clinician can enter the missing information.

### DTR Usage

DTR collects data the FHIR server does not yet contain. The same oncology data categories
drive the DTR questionnaire — the DTR form covers the same clinical domains as the FHIR
queries, filling gaps the CRD service could not resolve automatically.

### Breast Cancer Data Requirements

See [Use Case 1: Breast Cancer PA](breast-cancer-pa.html) for the specific data elements,
biomarker combinations, and staging constraints applied in the first concrete implementation.
