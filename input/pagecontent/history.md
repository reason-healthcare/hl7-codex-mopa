
### Version 0.1.1-snapshot-080926 (snapshot-080926)

Dated snapshot aligning the implementation guide and reference application.

- Reused the Da Vinci CRD Request Category extension on the anti-cancer regimen
  `RequestGroup` as an open `category 0..*` slice
- Added profiled treatment-intent and line-of-therapy category semantics with required
  bindings to `RegimenIntentVS` and `TreatmentLineVS`
- Removed the separate line-of-therapy Observation model and corresponding reference-app
  queries, fixtures, and data requirements
- Aligned regimen canonical identities, order-select/order-sign payloads, supportive-medication
  content, policy evaluation, examples, and implementation guidance

### Version 0.1.0 (ci-build)

Initial draft release.

- Defined Medical Oncology Prior Authorization (MOPA) framework: Da Vinci CRD/DTR/PAS with two-stage CDS Hooks (order-select informational, order-sign final)
- Defined `AntiCancerRegimenPlanDefinition` profile
- Defined `AntiCancerRegimenRequestGroup` profile with cycle-day timing and sequential
  phase ordering
- Defined CRD workflow: payer CRD service uses `fhirAuthorization` to query EHR FHIR server
  directly for required oncology context
- Defined "Authorization Satisfied" as the computable CRD success outcome
- Documented oncology data categories for CRD evaluation (no Library-driven discovery
  pattern — the CRD service queries the EHR FHIR server directly)
- Added breast cancer PA data requirements matrix with mCODE gap analysis
- Added conformance statements for Oncology CRD Client and Service
- Documented must-have Da Vinci gaps: CRD-001 (outcome semantics), CRD-002 (`RequestGroup`
  as PA unit in hooks), DTR-001 (`RequestGroup` as order subject in DTR), PAS-001 (regimen-level submission)
