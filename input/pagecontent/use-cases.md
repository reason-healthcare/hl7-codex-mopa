### Actors

| Actor | Description |
|---|---|
| **Oncology CRD Client** | An EHR or ordering system that invokes CDS Hooks `order-select` or `order-sign` during anti-cancer regimen ordering |
| **Oncology CRD Service** | A payer coverage decision service that evaluates the ordered regimen by querying the EHR's FHIR API for required patient context, returning cards or an Authorization Satisfied result |
| **DTR Client** | A system that collects missing patient context using questionnaires when the CRD service could not retrieve sufficient data from the EHR FHIR server |
| **PAS Client** | A system that submits a structured prior authorization request when PA is required after CRD/DTR |
| **PAS Server** | A payer system that receives and adjudicates the PA request |
| **Guideline Authority** | An organization (e.g., NCCN, ASCO, internal pathways program) that publishes canonical regimen definitions as computable `PlanDefinition` artifacts |
{: .table }

### Workflow

The MOPA workflow uses the standard Da Vinci CRD/DTR/PAS sequence with two CDS Hooks stages:

- **`order-select` (informational)** — fires when the provider selects a regimen from the
  order-set, before signing. The CRD service evaluates approvability and returns informational
  cards. This is advisory — the order has not been committed.
- **`order-sign` (final determination)** — fires when the provider signs the order. The CRD
  service returns the final binding coverage determination.
- **DTR** collects any missing data the CRD service could not retrieve from the EHR FHIR server
- **PAS** submits the structured authorization package when PA is still required

### Workflow: Complete Oncology PA Sequence

1. Clinician opens patient chart and begins treatment planning

2. Clinician selects anti-cancer regimen → EHR creates draft RequestGroup
   (RequestGroup.instantiatesCanonical → PlanDefinition regimen definition)

3. EHR fires standard CDS Hooks `order-select` (informational):
   - Selected `RequestGroup` in `context.selections` and `context.draftOrders`
   - `fhirAuthorization` included when EHR FHIR access is available
   - CRD Service evaluates and returns **informational** cards:
     - Approvable (info) → PA can be bypassed; advisory check before signing
     - PA will be required (warning) → provider may proceed knowing PA is needed
     - DTR required (warning) → missing data; launch DTR to collect before signing
   - This is advisory — the order is not yet committed

4. Provider reviews approvability cards and decides whether to proceed

5. EHR fires standard CDS Hooks `order-sign` (final determination):
   - `RequestGroup` plus finalised component `MedicationRequest` resources
   - CRD Service re-evaluates and returns the **final binding determination**:

   IF context sufficient + criteria satisfied → Authorization Satisfied (PA bypassed)
   IF context incomplete in EHR → return DTR launch card
   IF context complete but criteria not met → return PA required card

6. DTR (if launched) uses the oncology questionnaire to:
   - Prepopulate known patient data from the EHR
   - Collect missing documentation not found via FHIR query

7. PAS (if PA required) submits structured authorization package
   Payer adjudicates and returns decision

<div style="display: block; float: none;">
   <img src="mopa-workflow.svg"/>
</div>

### Pre-Conditions

For the full workflow to operate:
- The EHR SHALL have access to relevant patient context (mCODE-based Observations, Conditions,
  MedicationRequests)
- A canonical regimen definition (`OncologyAntiCancerRegimenPlanDefinition`) SHOULD be available
  for the ordered regimen
- The EHR SHOULD provide `fhirAuthorization` in the CDS Hooks request so the CRD service can
  query patient context directly

### Relationship to Da Vinci

This IG extends Da Vinci CRD/DTR/PAS. It does not replace any Da Vinci workflow. Systems
implementing this IG SHALL also conform to the relevant Da Vinci IGs for the workflows they
support.
