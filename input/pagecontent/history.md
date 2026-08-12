
### Version 0.1.0 (ci-build)

Initial draft release.

- Defined Medical Oncology Prior Authorization (MOPA) framework: Da Vinci CRD/DTR/PAS with two-stage CDS Hooks (order-select informational, order-sign final)
- Defined `OncologyAntiCancerRegimenPlanDefinition` profile
- Defined `OncologyAntiCancerRegimenRequestGroup` profile with cycle-day timing and sequential
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
