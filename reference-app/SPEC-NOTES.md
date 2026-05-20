# Specification Notes

Issues, ambiguities, and gaps discovered while building and exercising this
reference implementation. Each entry describes the observed problem, the
workaround applied here, and a proposed change to the specification.

---

## SN-001 — CRD `order-select` vs `order-sign` response semantics are underspecified

**Discovered during:** Phase 7 (PAS Service integration)

**Observed problem:**
The Da Vinci CRD specification defines both `order-select` and `order-sign` hooks
but does not clearly distinguish what each hook's response should communicate when
coverage criteria are met. In this implementation we initially returned a
"Regimen pre-approved — No prior authorization is needed at this time" card on
`order-select`, then immediately returned a "Prior authorization required" card on
`order-sign`. The two cards directly contradict each other from the clinician's
perspective.

**Workaround applied:**
`order-select` now returns a **"Coverage criteria met"** card whose detail text
explicitly states that prior authorization will still be required at signing:
*"Prior authorization will be required before this order can be fulfilled — sign the
order to submit."*
`order-sign` returns a **"Prior authorization required"** card with a submit action.

**Proposed specification change:**
The CRD IG should define the intended lifecycle across hooks and make the
relationship between `order-select` and `order-sign` responses explicit:

- `order-select` — intent: coverage pre-screening. The response should communicate
  the coverage status and set expectations (e.g. PA will be required, or no PA
  needed). It should **not** use language that implies final determination.
- `order-sign` — intent: finalization. The response should direct the next action
  (submit PA, or confirm no action required).

The `coverage-information` topic code should carry a `determiningCriteria` extension
or equivalent to distinguish pre-screen results from final results, so EHRs can
render them appropriately without relying on summary string parsing.

---
