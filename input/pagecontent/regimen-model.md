
### Overview

For oncology prior authorization, the selected clinical unit is not a single medication order.
It is the coordinated **anti-cancer regimen**: disease context, treatment intent, regimen
components, timing, sequential phases, and the clinical facts that justify the regimen.

This IG defines two complementary profiles that separate the *definition* of a regimen from its
*instantiation* as a patient-specific order.

### The PlanDefinition / RequestGroup Separation

```
PlanDefinition     ← canonical, reusable regimen protocol (not patient-specific)
       ↑
  (instantiatesCanonical — OPTIONAL; omit when no canonical definition exists)
       ↑
RequestGroup       ← patient-specific ordered regimen instance (CDS Hooks payload) [REQUIRED]
       ↓
MedicationRequest  ← component orders (available at order-sign)
```

<br/>


| Resource | Profile | Purpose |
|---|---|---|
| `PlanDefinition` | `OncologyAntiCancerRegimenPlanDefinition` | Canonical, versioned regimen protocol; published by guideline authority or institution |
| `RequestGroup` | `OncologyAntiCancerRegimenRequestGroup` | Patient-specific ordered instance; placed in CDS Hooks `draftOrders`; `instantiatesCanonical` optionally references PlanDefinition when a canonical definition is available |
{: .table }

### OncologyAntiCancerRegimenPlanDefinition

The canonical regimen definition carries:
- `type = order-set` — identifies this as an order set, not a clinical pathway
- `subject[x]` — the target cancer population (e.g., breast cancer); this is the canonical
  declaration of what cancer type the regimen is designed for
- `action[+]` — one action per regimen component (drug or phase)

### OncologyAntiCancerRegimenRequestGroup

The patient-specific ordered instance carries:
- `instantiatesCanonical` (Must Support) — canonical URL of the PlanDefinition being ordered, when a published definition exists; **MAY** be omitted when the regimen originates from a local order-set without a canonical definition
- `extension[regimenIntent]` (Must Support) — clinical intent of this order for this patient
  (curative, palliative, adjuvant, neoadjuvant). This is an ordering decision made at the
  time of prescribing and belongs on the RequestGroup, not the canonical PlanDefinition.
- `action[+]` — ordered components with cycle-day timing and phase sequencing

**Line of therapy** is documented via [`LineOfTherapyObservation`](StructureDefinition-line-of-therapy-observation.html)
in the patient record and supplied to the CRD Service via the `lineOfTherapy` prefetch entry.
It is not carried as an extension on the RequestGroup; the Observation provides the temporal
context, performer, and condition focus that an order-level extension cannot.

#### Cycle Day Timing

Each action declares which day(s) of the cycle the drug is administered using the
`timing-daysOfCycle` extension (`http://hl7.org/fhir/StructureDefinition/timing-daysOfCycle`).
The `action.timingTiming` carries the machine-computable cycle period.

```json
{
  "id": "paclitaxel-action",
  "title": "Paclitaxel",
  "timingTiming": { "repeat": { "period": 7, "periodUnit": "d" } },
  "extension": [{
    "url": "http://hl7.org/fhir/StructureDefinition/timing-daysOfCycle",
    "extension": [{ "url": "day", "valueInteger": 1 }]
  }],
  "resource": { "reference": "MedicationRequest/paclitaxel-order" }
}
```

#### Sequential Phase Ordering

For multi-phase regimens (e.g., AC→T: dose-dense doxorubicin/cyclophosphamide followed by
paclitaxel), top-level action groups represent phases. `action.relatedAction` with
`relationship = after-end` declares that the second phase begins after the first completes.

```json
{
  "id": "t-phase",
  "title": "T Phase — Paclitaxel",
  "relatedAction": [{
    "actionId": "ac-phase",
    "relationship": "after-end"
  }]
}
```

### Note on NCPDP Structured Sig

NCPDP Structured Sig encodes per-drug dispensing instructions and maps to
`MedicationRequest.dosageInstruction`. It is **compatible** with this model at the leaf level
(within each component `MedicationRequest` action) but is **not** a substitute for the
`RequestGroup` layer. NCPDP Structured Sig has no concept of cycle day, cross-drug phase
sequencing, or inter-drug ordering (`relatedAction`); those constructs live exclusively in the
`RequestGroup`. For oral oncology agents dispensed via retail pharmacy (e.g., capecitabine,
palbociclib), NCPDP SCRIPT remains the e-prescribing channel, but cycle context still belongs on
the `RequestGroup` action.

### Examples

See [Example: Paclitaxel + Trastuzumab (concurrent, weekly)](RequestGroup-THRegimenOrder.html)
and [Example: ddAC→T (sequential phases)](RequestGroup-DDACTRegimenOrder.html).
