
### Conformance Verbs

The key words **SHALL**, **SHOULD**, **MAY**, and **SHALL NOT** in this specification are to be
interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

### Must Support

Elements marked **Must Support** (MS) in this IG SHALL be interpreted as follows:

- A system that receives a resource with a Must Support element populated SHALL be capable of
  processing that element without error.
- A system that produces a resource SHALL populate Must Support elements when the relevant data
  is known and available.

### Implementation Expectations

This guide is informative, so it does not establish a formal conformance claim for the IG itself.
The statements below describe the expected behavior of systems that adopt the MOPA artifacts and
patterns.

A system implementing these patterns does so by declaring the applicable actor role and meeting
the corresponding expectations below.

### Two-Stage Hook Semantics

The MOPA workflow uses `order-select` and `order-sign` as distinct stages with different card
semantics. Implementers SHALL understand and follow this distinction:

| Stage | Purpose | Card Semantics |
|---|---|---|
| `order-select` | Informational approvability check — fires when the provider selects a regimen, before signing | Cards SHOULD use `indicator: "info"` for approvable regimens (advisory, not binding). `indicator: "warning"` for PA-required or DTR-required. `indicator: "critical"` only for categorical exclusions. |
| `order-sign` | Final determination — fires when the provider signs the order | Cards carry the binding determination: `indicator: "success"` for Authorization Satisfied, `indicator: "warning"` for PA-required or DTR-required. Production exchange carries any needed DTR QuestionnaireResponse in `draftOrders`; the reference app's EHR write-back is demo-only. |
{: .table}

### Oncology CRD Client

A conformant **Oncology CRD Client** (EHR or ordering system):

1. **SHALL** include the selected anti-cancer regimen as a `RequestGroup` conforming to
   `AntiCancerRegimenRequestGroup` in `context.draftOrders` and `context.selections`.
2. **SHALL** fire `order-select` when the provider selects a regimen from the order-set,
   before the order is signed. At this stage the `RequestGroup` is present but component
   `MedicationRequest` resources may not yet be finalised.
3. **SHALL** fire `order-sign` when the provider signs the order, with finalised component
   `MedicationRequest` resources included in `context.draftOrders`.
4. **SHOULD** populate `RequestGroup.instantiatesCanonical` with the canonical URL of the
   `AntiCancerRegimenPlanDefinition` when the definition is known. Many EHR order-sets
   do not have a published canonical definition; omitting this field is permitted.
5. **SHALL** populate repeated Da Vinci CRD `ext-request-category` values on RequestGroup for
   available patient-specific treatment intent and line-of-therapy context. This requires the
   proposed CRD RequestGroup extension-context expansion.
6. **SHOULD** provide `fhirAuthorization` in the CDS Hooks request to allow the CRD service to
   query patient context directly from the EHR FHIR server.
6. **SHALL** apply accepted CDS Hooks suggestion actions (delete + create) to
   `context.draftOrders` in-session when a Propose Alternate Request card is accepted
   at `order-select`. The EHR **SHALL** update `RequestGroup.action[].resource`
   references to point to the replacement resources, and send the modified Bundle to
   `order-sign`.

### Oncology CRD Service

A conformant **Oncology CRD Service**:

1. **SHALL** be capable of evaluating the selected anti-cancer regimen `RequestGroup`.
   When `RequestGroup.instantiatesCanonical` is populated, the service **SHOULD** also resolve
   the referenced `PlanDefinition` to enrich evaluation.
2. **SHOULD** use `fhirAuthorization` — when provided — to query the EHR FHIR server for the
   oncology patient context required to evaluate the order.
3. **SHALL** return informational cards at `order-select` indicating the approvability status
   of the ordered regimen. These cards are advisory — the order has not been committed.
4. **SHALL** return a final determination at `order-sign` with the appropriate indicator:
   `success` for Authorization Satisfied, `warning` for PA-required or DTR-required.
5. **SHOULD** return a Propose Alternate Request card at `order-select` when the payer
   policy requires a biosimilar substitution. The card **SHOULD** use the CDS Hooks
   suggestion mechanism with `delete` + `create` actions targeting the component
   `MedicationRequest` within the `RequestGroup`, `selectionBehavior: "at-most-one"`,
   and oncology-specific `overrideReasons`. See [MOPA-DV-CRD-005](davinci-gap-proposals.html#mopa-dv-crd-005--propose-alternate-request-for-requestgroup-partial-replacement).
6. **SHALL** return a DTR launch card when required patient context is not available from the
   EHR FHIR server.

### Capability Statements

- [Oncology CRD Client Capability Statement](CapabilityStatement-ocpa-crd-client.html)
- [Oncology CRD Service Capability Statement](CapabilityStatement-ocpa-crd-service.html)
