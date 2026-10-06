# Regimen Modeling - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Regimen Modeling

### Overview

For oncology prior authorization, the selected clinical unit is not a single medication order. It is the coordinated **anti-cancer regimen**: disease context, treatment intent, regimen components, timing, sequential phases, and the clinical facts that justify the regimen.

This IG defines two complementary profiles that separate the **definition** of a regimen from its **instantiation** as a patient-specific order.

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

| | | |
| :--- | :--- | :--- |
| `PlanDefinition` | `AntiCancerRegimenPlanDefinition` | Canonical, versioned regimen protocol; published by guideline authority or institution |
| `RequestGroup` | `AntiCancerRegimenRequestGroup` | Patient-specific ordered instance; placed in CDS Hooks`draftOrders`;`instantiatesCanonical`optionally references PlanDefinition when a canonical definition is available |

### AntiCancerRegimenPlanDefinition

The canonical regimen definition carries:

* `type = order-set` — identifies this as an order set, not a clinical pathway
* `subject[x]` — the target cancer population (e.g., breast cancer); this is the canonical declaration of what cancer type the regimen is designed for
* `action[+]` — one action per regimen component (drug or phase)

### AntiCancerRegimenRequestGroup

The patient-specific ordered instance carries:

* `instantiatesCanonical` (Must Support) — canonical URL of the PlanDefinition being ordered, when a published definition exists; **MAY** be omitted when the regimen originates from a local order-set without a canonical definition
* `extension[category]` (Must Support, 0..*) — repeated Da Vinci CRD [`ext-request-category`](http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category) values for patient-specific ordering categories. The optional `category/treatmentIntent` and `category/lineOfTherapy` reslices constrain that same extension to `CodeableConcept` and require bindings to `RegimenIntentVS` and `TreatmentLineVS`, respectively. CRD 2.2.1 needs a proposed RequestGroup extension-context expansion before this use is available in the base CRD specification.
* `action[+]` — ordered components with cycle-day timing and phase sequencing

**Treatment intent and line of therapy** are patient-specific `CodeableConcept` categories on the RequestGroup. Both semantic slices serialize with the CRD extension URL; their constraint profiles provide the distinct required terminology bindings. No companion Observation is used.

#### Cycle Day Timing

Each action declares which day(s) of the cycle the drug is administered using the local `regimen-days-of-cycle` extension on `action.timingTiming`. This is a temporary local semantic pending an official `timing-daysOfCycle` context expansion. The `action.timingTiming.repeat` carries the machine-computable cycle period.

```
{
  "id": "paclitaxel-action",
  "title": "Paclitaxel",
  "timingTiming": {
    "repeat": { "period": 7, "periodUnit": "d" },
    "extension": [{
      "url": "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle",
      "extension": [{ "url": "day", "valueInteger": 1 }]
    }]
  },
  "resource": { "reference": "MedicationRequest/paclitaxel-order" }
}

```

#### Sequential Phase Ordering

For multi-phase regimens (e.g., AC→T: dose-dense doxorubicin/cyclophosphamide followed by paclitaxel), top-level action groups represent phases. `action.relatedAction` with `relationship = after-end` declares that the second phase begins after the first completes.

```
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

NCPDP Structured Sig encodes per-drug dispensing instructions and maps to `MedicationRequest.dosageInstruction`. It is **compatible** with this model at the leaf level (within each component `MedicationRequest` action) but is **not** a substitute for the `RequestGroup` layer. NCPDP Structured Sig has no concept of cycle day, cross-drug phase sequencing, or inter-drug ordering (`relatedAction`); those constructs live exclusively in the `RequestGroup`. For oral oncology agents dispensed via retail pharmacy (e.g., capecitabine, palbociclib), NCPDP SCRIPT remains the e-prescribing channel, but cycle context still belongs on the `RequestGroup` action.

### Examples

See [Example: Paclitaxel + Trastuzumab (concurrent, weekly)](RequestGroup-THRegimenOrder.md) and [Example: ddAC→T (sequential phases)](RequestGroup-DDACTRegimenOrder.md).

