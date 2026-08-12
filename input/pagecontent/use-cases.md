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

### The Two-Layer Framework

This IG defines two connected layers that together address the full oncology PA workflow.

#### Layer 1 — Pre-Order Clinical Decision Support (optional)

Before a clinician places an order, the EHR surfaces clinical guideline-aligned regimen recommendations
based on the patient's specific situation: diagnosis, stage, biomarkers, and line of therapy.

This layer:
- Evaluates patient-specific context against computable clinical guidelines
- Returns recommended regimens with clinical guideline-aligned options
- Surfaces clinically relevant regimen choices before the order is placed

This layer is **provider-driven**, **guideline-informed**, and focuses on selecting the right
treatment upfront.

The upstream standards proposals for this workflow are collected on the
[Da Vinci Gap Proposals](davinci-gap-proposals.html) and
[mCODE Gap Proposals](mcode-gap-proposals.html) pages.

#### Layer 2 — Structured Authorization Exchange (Da Vinci CRD → DTR → PAS)

Once a regimen is selected, the workflow uses the standard Da Vinci CRD/DTR/PAS sequence:

- **CRD** receives the ordered `RequestGroup` and — if provided FHIR authorization — queries the
  EHR's FHIR server directly for the oncology patient context required to evaluate the order
- **DTR** collects any missing data the CRD service could not retrieve from the EHR FHIR server
- **PAS** submits the structured authorization package when PA is still required

### Workflow: Complete Oncology PA Sequence

1. Clinician opens patient chart and begins treatment planning

2. [Optional] Pre-order CDS evaluates patient context and returns
   clinical guideline-aligned regimen options before order selection

3. Clinician selects anti-cancer regimen → EHR creates draft RequestGroup
   (RequestGroup.instantiatesCanonical → PlanDefinition regimen definition)

4. EHR fires standard CDS Hooks `order-select` (informational):
   - Selected `RequestGroup` in `context.selections` and `context.draftOrders`
   - `fhirAuthorization` included when EHR FHIR access is available
   - CRD Service evaluates and returns **informational** cards:
     - Approvable (info) → PA can be bypassed; advisory check before signing
     - PA will be required (warning) → provider may proceed knowing PA is needed
     - DTR required (warning) → missing data; launch DTR to collect before signing
   - This is advisory — the order is not yet committed

5. Provider reviews approvability cards and decides whether to proceed

6. EHR fires standard CDS Hooks `order-sign` (final determination):
   - `RequestGroup` plus finalised component `MedicationRequest` resources
   - CRD Service re-evaluates and returns the **final binding determination**:

   IF context sufficient + criteria satisfied → Authorization Satisfied (PA bypassed)
   IF context incomplete in EHR → return DTR launch card
   IF context complete but criteria not met → return PA required card

7. DTR (if launched) uses the oncology questionnaire to:
   - Prepopulate known patient data from the EHR
   - Collect missing documentation not found via FHIR query

8. PAS (if PA required) submits structured authorization package
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
