# Oncology Regimen and Patient Context Extensions for CRD/CDS Hooks

## 1. Purpose

This document proposes an oncology-specific extension pattern for Da Vinci CRD using CDS Hooks `order-select` and `order-sign`.

The goal is to support prior authorization evaluation at the **anti-cancer regimen level**, while using mCODE-based patient context to determine whether an ordered regimen is sufficiently documented for guideline-aligned pre-approval or reduced documentation burden.

This proposal focuses on four artifacts:

1. A CDS Hooks extension for oncology CRD context.
2. An anti-cancer regimen profile on FHIR `PlanDefinition` with `type = order-set` — the canonical, reusable regimen definition.
3. An anti-cancer regimen profile on FHIR `RequestGroup` — the patient-specific ordered instance passed as the CDS Hooks payload.
4. A reusable oncology data-requirements pattern using FHIR `DataRequirement`, preferably published in a cancer-specific `Library`.

Regimen comparison, clinical equivalence, and preference ranking are intentionally out of scope for this phase.

---

## 2. Background

Da Vinci CRD uses CDS Hooks to evaluate coverage, documentation, and prior authorization requirements during ordering workflows. The CDS Hooks `order-select` hook occurs when a clinician selects one or more new orders, before signing. The hook includes:

- `context.selections`: the FHIR ids of newly selected orders.
- `context.draftOrders`: a FHIR Bundle containing the current unsigned orders.

The CDS Hooks and CRD examples commonly show `MedicationRequest`, such as `MedicationRequest/103`, but the field itself is generic: `selections` references FHIR resources in the `draftOrders` Bundle.

For oncology, the selected clinical unit is often not a single medication order. It is the coordinated **anti-cancer regimen**: disease context, treatment intent, regimen components, timing, line of therapy, and the clinical facts that justify the regimen.

FHIR separates the *definition* of a regimen from its *instantiation* as a patient-specific order. In this proposal:

- The canonical anti-cancer regimen definition is represented as a profiled `PlanDefinition` with `type = order-set`. This is the reusable, versioned protocol — not patient-specific.
- The patient-specific ordered instance is represented as a profiled `RequestGroup`, with `RequestGroup.instantiatesCanonical` referencing the `PlanDefinition`. This is what is placed in the CDS Hooks `draftOrders` Bundle and referenced in `context.selections`.

mCODE provides a strong foundation for oncology data, including profiles for primary cancer condition, cancer stage, cancer-related medication requests, medication administrations, and performance status. However, mCODE does not currently define a first-class anti-cancer regimen profile (either as definition or as ordered instance) or a cancer-specific prior authorization data-requirements package. This proposal fills that gap by defining both profiles and a reusable data-requirements pattern.

---

## 3. Design Principles

### 3.1 Treat the regimen as the selected clinical unit

For oncology CRD, the selected order is the patient-specific anti-cancer regimen instance, represented as a `RequestGroup`. The `RequestGroup.instantiatesCanonical` references the canonical `PlanDefinition` regimen definition.

Component `MedicationRequest`, `ServiceRequest`, or other request resources may also be included as `RequestGroup.action` references when instantiated, but they should not be the only representation of the regimen.

```text
PlanDefinition    = the canonical regimen definition / protocol (not patient-specific)
RequestGroup      = the patient-specific ordered regimen instance (instantiatesCanonical → PlanDefinition)
MedicationRequest / ServiceRequest = component orders within the RequestGroup
CDS Hooks selections + draftOrders = the RequestGroup and/or component draft orders
```

> **NOTE — NCPDP Structured Sig:**
> NCPDP Structured Sig encodes per-drug dispensing instructions (dose, route, frequency, duration) and maps to `MedicationRequest.dosageInstruction` (`Dosage`). It is **compatible** with this model at the leaf level — i.e., within each component `MedicationRequest` action. It is **not** a substitute for the `RequestGroup` layer. NCPDP Structured Sig has no concept of cycle day, cross-drug phase sequencing, or inter-drug ordering (`relatedAction`); those constructs live exclusively in the `RequestGroup`. For oral oncology agents dispensed via retail pharmacy (e.g., capecitabine, palbociclib), NCPDP SCRIPT is the e-prescribing channel and structured sig governs the per-fill instructions, but cycle context (e.g., "days 1–14 of a 21-day cycle") still belongs on the `RequestGroup` action, not the sig.

### 3.2 Use CDS Hooks extension for oncology-specific context

CDS Hooks extensibility is handled through reserved JSON `extension` elements, not through FHIR `Extension` elements.

This proposal uses a CDS Hooks request-level extension to identify:

1. The selected oncology regimen.
2. The required data-requirements artifact.
3. Whether complete patient context is required for pre-approval.

### 3.3 Use `DataRequirement` for patient data requirements

The patient-context requirements should be represented using the FHIR `DataRequirement` datatype.

A `DataRequirement` can specify:

- Resource type.
- Expected profile.
- Code filters.
- Date filters.
- Sort criteria.
- Must-support elements.

This is a cleaner model than using `PlanDefinition` as a data-requirements container.

### 3.4 Separate ordered regimen, data requirements, and actual patient context

The core model separates three concepts:

```text
Regimen RequestGroup (instantiatesCanonical → PlanDefinition)
  What is being ordered, for this patient.

PlanDefinition
  The canonical regimen definition the RequestGroup instantiates.

DataRequirement[]
  What patient data is needed to evaluate the order.

Patient Context Bundle / FHIR API
  The actual patient data supplied or retrieved.
```

A `Library` may be used as a governable, versioned wrapper for the `DataRequirement[]`.

---

## 4. CDS Hooks Oncology Request Pattern

### 4.1 Scope

Use the standard CDS Hooks request structure for:

```text
order-select
order-sign
```

The pattern applies when the selected order is an anti-cancer therapy regimen. The selected
`RequestGroup` is included directly in `context.draftOrders` and referenced by
`context.selections`; no custom top-level CDS Hooks request extension is required.

### 4.2 Conformance intent

Base CDS Hooks should not require oncology context for all clients. The oncology profile
instead constrains the FHIR resources supplied through the standard hook context.

Recommended language:

```text
For CDS Clients claiming conformance to this oncology CRD profile, when an anti-cancer
therapy regimen is selected or signed, the client SHALL include a conformant RequestGroup
in context.draftOrders and reference it from context.selections.
```

```text
For CDS Services claiming conformance to this oncology CRD profile, the service SHALL be
capable of interpreting the anti-cancer regimen RequestGroup, its repeated Request Category
extensions, and its instantiated PlanDefinition.
```

### 4.3 Regimen context shape

The patient-specific RequestGroup identifies the protocol and carries order categories. The
same Da Vinci CRD `ext-request-category` URL is repeated once for each category; treatment
intent and line of therapy are representative values.

```json
{
  "resourceType": "RequestGroup",
  "id": "breast-cancer-regimen-request-001",
  "meta": {
    "profile": [
      "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-requestgroup"
    ]
  },
  "status": "draft",
  "intent": "order",
  "subject": { "reference": "Patient/456" },
  "instantiatesCanonical": [
    "http://hl7.org/fhir/us/codex-mopa/PlanDefinition/RegimenTH"
  ],
  "extension": [
    {
      "url": "http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category",
      "valueCodeableConcept": {
        "coding": [{ "system": "http://snomed.info/sct", "code": "373846009", "display": "Adjuvant - intent" }]
      }
    },
    {
      "url": "http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category",
      "valueCodeableConcept": {
        "coding": [{ "system": "http://hl7.org/fhir/us/codex-mopa/CodeSystem/treatment-line-cs", "code": "1L", "display": "First-line" }]
      }
    }
  ]
}
```

### 4.4 Data requirements

A service may advertise ordinary CDS Hooks prefetch templates and may use a versioned FHIR
`Library.dataRequirement[]` as the governable source for its queries. The reference app
advertises neither custom discovery fields nor prefetch; it uses `fhirAuthorization` to query
patient context from the EHR FHIR endpoint. These are discovery and clinical-reasoning
concerns, not fields in a custom request extension.

### 4.5 Example: `order-select`

```json
{
  "hook": "order-select",
  "hookInstance": "d1577c69-dfbe-44ad-ba6d-3e05e953b2ea",
  "fhirServer": "https://ehr.example.org/fhir",
  "context": {
    "userId": "Practitioner/123",
    "patientId": "Patient/456",
    "encounterId": "Encounter/789",
    "selections": [
      "RequestGroup/breast-cancer-regimen-request-001"
    ],
    "draftOrders": {
      "resourceType": "Bundle",
      "type": "collection",
      "entry": [
        {
          "resource": {
            "resourceType": "RequestGroup",
            "id": "breast-cancer-regimen-request-001",
            "meta": {
              "profile": [
                "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-requestgroup"
              ]
            },
            "status": "draft",
            "intent": "order",
            "subject": {
              "reference": "Patient/456"
            },
            "instantiatesCanonical": [
              "http://hl7.org/fhir/us/codex-mopa/PlanDefinition/RegimenTH"
            ],
            "extension": [
              {
                "url": "http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category",
                "valueCodeableConcept": {
                  "coding": [{ "system": "http://snomed.info/sct", "code": "373846009", "display": "Adjuvant - intent" }]
                }
              },
              {
                "url": "http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category",
                "valueCodeableConcept": {
                  "coding": [{ "system": "http://hl7.org/fhir/us/codex-mopa/CodeSystem/treatment-line-cs", "code": "1L", "display": "First-line" }]
                }
              }
            ]
          }
        }
      ]
    }
  }
}
```

### 4.6 Example: `order-sign`

At `order-sign`, the `RequestGroup` carries `instantiatesCanonical` pointing to the regimen `PlanDefinition`. Component `MedicationRequest` resources are included in the Bundle and referenced from `RequestGroup.action`.

```json
{
  "hook": "order-sign",
  "hookInstance": "3e9b32b2-814a-4f89-9f65-23d89a780d44",
  "fhirServer": "https://ehr.example.org/fhir",
  "context": {
    "userId": "Practitioner/123",
    "patientId": "Patient/456",
    "encounterId": "Encounter/789",
    "draftOrders": {
      "resourceType": "Bundle",
      "type": "collection",
      "entry": [
        {
          "resource": {
            "resourceType": "RequestGroup",
            "id": "breast-cancer-regimen-request-001",
            "meta": {
              "profile": [
                "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-requestgroup"
              ]
            },
            "status": "draft",
            "intent": "order",
            "subject": {
              "reference": "Patient/456"
            },
            "instantiatesCanonical": [
              "http://hl7.org/fhir/us/codex-mopa/PlanDefinition/RegimenTH"
            ],
            "extension": [
              {
                "url": "http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category",
                "valueCodeableConcept": {
                  "coding": [{ "system": "http://snomed.info/sct", "code": "373846009", "display": "Adjuvant - intent" }]
                }
              },
              {
                "url": "http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category",
                "valueCodeableConcept": {
                  "coding": [{ "system": "http://hl7.org/fhir/us/codex-mopa/CodeSystem/treatment-line-cs", "code": "1L", "display": "First-line" }]
                }
              }
            ],
            "action": [
              {
                "id": "paclitaxel-action",
                "title": "Paclitaxel",
                "timingTiming": { "repeat": { "period": 7, "periodUnit": "d" }, "extension": [{ "url": "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle", "extension": [{ "url": "day", "valueInteger": 1 }] }] },
                "resource": { "reference": "MedicationRequest/paclitaxel-order" }
              },
              {
                "id": "trastuzumab-action",
                "title": "Trastuzumab",
                "timingTiming": { "repeat": { "period": 7, "periodUnit": "d" }, "extension": [{ "url": "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle", "extension": [{ "url": "day", "valueInteger": 1 }] }] },
                "resource": { "reference": "MedicationRequest/trastuzumab-order" }
              }
            ]
          }
        },
        {
          "resource": {
            "resourceType": "MedicationRequest",
            "id": "paclitaxel-order",
            "meta": {
              "profile": [
                "http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-request"
              ]
            },
            "status": "draft",
            "intent": "order",
            "subject": {
              "reference": "Patient/456"
            }
          }
        },
        {
          "resource": {
            "resourceType": "MedicationRequest",
            "id": "trastuzumab-order",
            "meta": {
              "profile": [
                "http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-request"
              ]
            },
            "status": "draft",
            "intent": "order",
            "subject": {
              "reference": "Patient/456"
            }
          }
        }
      ]
    }
  }
}
```

---

## 5. Anti-Cancer Regimen Profiles

### 5.1 PlanDefinition profile: canonical regimen definition

Define a new mCODE-adjacent profile:

```text
AntiCancerRegimenPlanDefinition
```

This profile represents a canonical, reusable anti-cancer therapy regimen definition as a FHIR `PlanDefinition` order set. It is not patient-specific.

It is the canonical definition referenced by `AntiCancerRegimenRequestGroup` instances via `RequestGroup.instantiatesCanonical`.

### 5.2 PlanDefinition FSH profile

Draft FSH:

```fsh
Profile: AntiCancerRegimenPlanDefinition
Parent: PlanDefinition
Id: anticancer-regimen-plandefinition
Title: "Anti-Cancer Regimen PlanDefinition"
Description: "A coordinated anti-cancer therapy regimen represented as a FHIR PlanDefinition order set."

* status 1..1
* type 1..1
* type = http://terminology.hl7.org/CodeSystem/plan-definition-type#order-set

* subject[x] 1..1
* subject[x] only CodeableConcept

* action 1..*
* action.title 1..1
* action.definitionCanonical 0..1
* action.timingTiming.extension[http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle] 0..1
```

Patient-specific intent and treatment line are not carried on the canonical
`PlanDefinition`. They are represented on the patient-specific `RequestGroup` via repeated
Da Vinci CRD `ext-request-category` values (`category 0..* MS`). CRD 2.2.1 needs the proposed
RequestGroup extension-context expansion for this use.

### 5.3 Disease context and order categories

`PlanDefinition.subject[x]` declares the protocol's target cancer population. The ordered
patient is `RequestGroup.subject`; CRD obtains patient-specific disease context from the relevant
`Condition`. No regimen disease-context extension is defined. Treatment intent and line are
repeated Da Vinci CRD Request Category values on RequestGroup, not PlanDefinition properties.

### 5.4 PlanDefinition example

```json
{
  "resourceType": "PlanDefinition",
  "id": "RegimenTH",
  "meta": {
    "profile": [
      "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-plandefinition"
    ]
  },
  "url": "http://hl7.org/fhir/us/codex-mopa/PlanDefinition/RegimenTH",
  "version": "0.1.1-snapshot-080926",
  "name": "RegimenTH",
  "title": "Paclitaxel + Trastuzumab Anti-Cancer Therapy Regimen",
  "status": "active",
  "type": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/plan-definition-type",
        "code": "order-set",
        "display": "Order Set"
      }
    ]
  },
  "subjectCodeableConcept": {
    "text": "Breast cancer"
  },
  "action": [
    {
      "id": "paclitaxel-th",
      "title": "Paclitaxel",
      "description": "Paclitaxel anti-cancer therapy component",
      "timingTiming": { "extension": [
        {
          "url": "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle",
          "extension": [{ "url": "day", "valueInteger": 1 }]
        }
      ] },
      "definitionCanonical": "http://example.org/fhir/ActivityDefinition/paclitaxel-medication-request"
    },
    {
      "id": "trastuzumab-th",
      "title": "Trastuzumab",
      "description": "Trastuzumab anti-cancer therapy component",
      "timingTiming": { "extension": [
        {
          "url": "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle",
          "extension": [{ "url": "day", "valueInteger": 1 }]
        }
      ] },
      "definitionCanonical": "http://example.org/fhir/ActivityDefinition/trastuzumab-medication-request"
    }
  ]
}
```

---

### 5.5 RequestGroup profile: patient-specific ordered instance

#### Intent

Define a new mCODE-adjacent profile:

```text
AntiCancerRegimenRequestGroup
```

This profile represents a patient-specific ordered anti-cancer therapy regimen as a FHIR `RequestGroup`. It is the resource placed in the CDS Hooks `draftOrders` Bundle and referenced in `context.selections`.

Patient-specific intent and treatment line are carried on this resource through repeated Da Vinci
CRD `ext-request-category` values (`category 0..* MS`), not on the canonical `PlanDefinition`.

`RequestGroup.instantiatesCanonical` is must-support. When the canonical regimen definition is known, it SHOULD reference an `AntiCancerRegimenPlanDefinition`.

The profile supports two scheduling requirements that are essential for oncology PA evaluation:

1. **Cycle day timing** — each action declares which day(s) of the cycle the drug is administered (e.g., day 1, day 1 and 8). The local `regimen-days-of-cycle` extension on `action.timingTiming` carries this as one or more integers pending official `timing-daysOfCycle` context expansion; `action.timingTiming.repeat` carries the machine-computable cycle period.

2. **Sequential phase ordering** — for regimens like AC followed by T (dose-dense doxorubicin/cyclophosphamide → paclitaxel), top-level action groups represent phases and `action.relatedAction` with `relationship = after-end` declares that the second phase begins after the first completes.

#### FSH profile

```fsh
Profile: AntiCancerRegimenRequestGroup
Parent: RequestGroup
Id: anticancer-regimen-requestgroup
Title: "Anti-Cancer Regimen RequestGroup"
Description: "A patient-specific ordered anti-cancer therapy regimen. When the canonical regimen definition is known, instantiatesCanonical SHOULD reference an AntiCancerRegimenPlanDefinition. Uses the local regimen-days-of-cycle extension on Timing pending official context expansion."

* status 1..1
* intent 1..1
* intent = http://hl7.org/fhir/request-intent#order

* subject 1..1
* subject only Reference(Patient)

* instantiatesCanonical MS

* extension contains
    http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category named category 0..* MS

* action 0..*
* action.id 1..1                        // required for relatedAction cross-reference
* action.title 1..1
* action.timingTiming 0..1              // cycle period: e.g., every 14 days, every 21 days
* action.relatedAction 0..*             // sequential ordering between phase groups
* action.relatedAction.actionId 1..1
* action.relatedAction.relationship 1..1
* action.relatedAction.offsetDuration 0..1  // optional delay between phases
* action.action 0..*                    // nested actions within a phase group
* action.action.id 1..1
* action.action.title 1..1
* action.action.timingTiming 0..1
* action.action.resource 0..1
* action.action.timingTiming.extension[http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle] 0..1
* action.timingTiming.extension[http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle] 0..1
* action.resource 0..1
```

#### Example A: concurrent regimen with daysOfCycle timing (Paclitaxel + Trastuzumab, weekly)

Both agents administered on day 1 of each 7-day cycle.

```json
{
  "resourceType": "RequestGroup",
  "id": "breast-cancer-regimen-request-001",
  "meta": {
    "profile": [
      "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-requestgroup"
    ]
  },
  "status": "draft",
  "intent": "order",
  "subject": { "reference": "Patient/456" },
  "instantiatesCanonical": [
    "http://hl7.org/fhir/us/codex-mopa/PlanDefinition/RegimenTH"
  ],
  "extension": [
    {
      "url": "http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category",
      "valueCodeableConcept": { "coding": [{ "system": "http://snomed.info/sct", "code": "373846009", "display": "Adjuvant - intent" }] }
    },
    {
      "url": "http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category",
      "valueCodeableConcept": { "coding": [{ "system": "http://hl7.org/fhir/us/codex-mopa/CodeSystem/treatment-line-cs", "code": "1L", "display": "First-line" }] }
    }
  ],
  "action": [
    {
      "id": "paclitaxel-action",
      "title": "Paclitaxel",
      "timingTiming": {
        "repeat": { "period": 7, "periodUnit": "d" },
        "extension": [
        {
          "url": "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle",
          "extension": [{ "url": "day", "valueInteger": 1 }]
        }
      ] },
      "resource": { "reference": "MedicationRequest/paclitaxel-order" }
    },
    {
      "id": "trastuzumab-action",
      "title": "Trastuzumab",
      "timingTiming": {
        "repeat": { "period": 7, "periodUnit": "d" },
        "extension": [
        {
          "url": "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle",
          "extension": [{ "url": "day", "valueInteger": 1 }]
        }
      ] },
      "resource": { "reference": "MedicationRequest/trastuzumab-order" }
    }
  ]
}
```

#### Example B: sequential regimen with phase ordering (dose-dense AC → T)

Phase 1 — ddAC: doxorubicin and cyclophosphamide, day 1 of each 14-day cycle, 4 cycles.
Phase 2 — T: paclitaxel, day 1 of each 14-day cycle, 4 cycles, starting after ddAC completes.

`relatedAction` on the T phase declares `after-end` of the AC phase.

```json
{
  "resourceType": "RequestGroup",
  "id": "breast-cancer-ddac-t-request-001",
  "meta": {
    "profile": [
      "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/anticancer-regimen-requestgroup"
    ]
  },
  "status": "draft",
  "intent": "order",
  "subject": { "reference": "Patient/456" },
  "instantiatesCanonical": [
    "http://hl7.org/fhir/us/codex-mopa/PlanDefinition/RegimenDdACT"
  ],
  "action": [
    {
      "id": "ac-phase",
      "title": "ddAC Phase (Cycles 1–4)",
      "timingTiming": {
        "repeat": {
          "count": 4,
          "period": 14,
          "periodUnit": "d"
        }
      },
      "action": [
        {
          "id": "doxorubicin-action",
          "title": "Doxorubicin",
          "timingTiming": {
            "repeat": { "period": 14, "periodUnit": "d" }
          },
          "extension": [
            {
              "url": "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle",
              "extension": [{ "url": "day", "valueInteger": 1 }]
            }
          ],
          "resource": { "reference": "MedicationRequest/doxorubicin-order" }
        },
        {
          "id": "cyclophosphamide-action",
          "title": "Cyclophosphamide",
          "timingTiming": {
            "repeat": { "period": 14, "periodUnit": "d" }
          },
          "extension": [
            {
              "url": "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle",
              "extension": [{ "url": "day", "valueInteger": 1 }]
            }
          ],
          "resource": { "reference": "MedicationRequest/cyclophosphamide-order" }
        }
      ]
    },
    {
      "id": "t-phase",
      "title": "T Phase — Paclitaxel (Cycles 5–8)",
      "relatedAction": [
        {
          "actionId": "ac-phase",
          "relationship": "after-end"
        }
      ],
      "timingTiming": {
        "repeat": {
          "count": 4,
          "period": 14,
          "periodUnit": "d"
        }
      },
      "action": [
        {
          "id": "paclitaxel-action",
          "title": "Paclitaxel",
          "timingTiming": {
            "repeat": { "period": 14, "periodUnit": "d" }
          },
          "extension": [
            {
              "url": "http://hl7.org/fhir/us/codex-mopa/StructureDefinition/regimen-days-of-cycle",
              "extension": [{ "url": "day", "valueInteger": 1 }]
            }
          ],
          "resource": { "reference": "MedicationRequest/paclitaxel-order" }
        }
      ]
    }
  ]
}
```

---

## 6. Oncology Data Requirements Pattern

### 6.1 Intent

Define a reusable pattern for describing the patient context required to evaluate an anti-cancer regimen.

The data requirements themselves are represented as FHIR `DataRequirement` entries.

A `Library` may be used as the versioned and governable wrapper.

```text
OncologyDataRequirementsLibrary
  Library.dataRequirement[0..*] contains the actual FHIR DataRequirement entries.
```

Cancer-specific instances or profiles derive from this base pattern:

```text
OncologyDataRequirementsLibrary
  ├── BreastCancerPADataRequirementsLibrary
  ├── LungCancerPADataRequirementsLibrary
  ├── ColorectalCancerPADataRequirementsLibrary
  ├── ProstateCancerPADataRequirementsLibrary
  └── MelanomaPADataRequirementsLibrary
```

### 6.2 Artifact roles

| Artifact | FHIR type | Purpose |
|---|---|---|
| Anti-cancer regimen definition | `PlanDefinition` | Canonical, reusable regimen protocol (not patient-specific) |
| Anti-cancer regimen order | `RequestGroup` | Patient-specific ordered instance; `instantiatesCanonical` → `PlanDefinition`; passed in CDS Hooks `draftOrders` |
| Data requirements | `DataRequirement[]` | Declares required patient data |
| Governed data requirements package | `Library` | Optional wrapper for versioning, publication, dependencies, and reuse |
| Patient context | `Bundle` or FHIR queries | Supplies actual patient data |
| DTR documentation | `Questionnaire` / `QuestionnaireResponse` | Collects missing patient context |

### 6.3 Library profile draft

```fsh
Profile: OncologyDataRequirementsLibrary
Parent: Library
Id: oncology-data-requirements-library
Title: "Oncology Data Requirements Library"
Description: "A Library profile that publishes cancer-specific FHIR DataRequirement entries for CRD pre-approval and DTR documentation."

* status 1..1
* type 1..1
* subject[x] 1..1
* subject[x] only CodeableConcept
* dataRequirement 1..*
```

### 6.4 Data requirement categories

The base oncology profile should support common requirements across cancers:

| Category | Purpose |
|---|---|
| Primary cancer condition | Identify the cancer diagnosis being treated |
| Stage / extent of disease | Determine disease setting and treatment appropriateness |
| Biomarkers | Capture cancer-specific treatment selectors |
| Treatment setting | Adjuvant, neoadjuvant, metastatic, recurrent, maintenance |
| Line of therapy | Determine current treatment sequence |
| Prior therapy | Identify prior systemic, surgical, and radiation treatment |
| Performance status | Determine eligibility for selected regimen |
| Exceptions / contraindications | Support alternate documentation and medical necessity |
| Ordered regimen | Link patient context to selected anti-cancer regimen |

---

## 7. Breast Cancer Data Requirements Library

### 7.1 Intent

The first cancer-specific derivative should be:

```text
BreastCancerPADataRequirementsLibrary
```

This artifact defines the patient facts required to evaluate an anti-cancer therapy regimen for breast cancer.

### 7.2 Example Library

```json
{
  "resourceType": "Library",
  "id": "breast-cancer-pa-data-requirements",
  "meta": {
    "profile": [
      "http://example.org/fhir/StructureDefinition/oncology-data-requirements-library"
    ]
  },
  "url": "http://example.org/fhir/Library/breast-cancer-pa-data-requirements",
  "version": "1.0.0",
  "name": "BreastCancerPADataRequirements",
  "title": "Breast Cancer Prior Authorization Data Requirements",
  "status": "active",
  "type": {
    "coding": [
      {
        "system": "http://terminology.hl7.org/CodeSystem/library-type",
        "code": "asset-collection",
        "display": "Asset Collection"
      }
    ]
  },
  "subjectCodeableConcept": {
    "coding": [
      {
        "system": "http://snomed.info/sct",
        "code": "254837009",
        "display": "Malignant tumor of breast"
      }
    ]
  },
  "dataRequirement": [
    {
      "type": "Condition",
      "profile": [
        "http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-primary-cancer-condition"
      ]
    },
    {
      "type": "Observation",
      "profile": [
        "http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-stage"
      ]
    },
    {
      "type": "Observation",
      "codeFilter": [
        {
          "path": "code",
          "valueSet": "http://example.org/fhir/ValueSet/breast-cancer-er-status"
        }
      ]
    },
    {
      "type": "Observation",
      "codeFilter": [
        {
          "path": "code",
          "valueSet": "http://example.org/fhir/ValueSet/breast-cancer-pr-status"
        }
      ]
    },
    {
      "type": "Observation",
      "codeFilter": [
        {
          "path": "code",
          "valueSet": "http://example.org/fhir/ValueSet/breast-cancer-her2-status"
        }
      ]
    },
    {
      "type": "MedicationStatement",
      "profile": [
        "http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-statement"
      ]
    },
    {
      "type": "MedicationAdministration",
      "profile": [
        "http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-cancer-related-medication-administration"
      ]
    },
    {
      "type": "Observation",
      "profile": [
        "http://hl7.org/fhir/us/mcode/StructureDefinition/mcode-ecog-performance-status"
      ]
    }
  ]
}
```

### 7.3 Breast cancer data requirement matrix

| Requirement | Likely mCODE basis | Notes |
|---|---|---|
| Primary breast cancer diagnosis | Primary Cancer Condition | Should constrain diagnosis coding and laterality expectations |
| Stage | Cancer stage / TNM-related mCODE profiles | Need to clarify clinical vs pathologic stage by use case |
| ER status | Observation / biomarker pattern | Requires value set/profile clarity |
| PR status | Observation / biomarker pattern | Requires value set/profile clarity |
| HER2 status | Observation / biomarker pattern | Critical for HER2-directed therapy |
| Treatment setting / intent | Da Vinci CRD `ext-request-category` on RequestGroup | Patient-specific order category; CRD RequestGroup context expansion proposed |
| Line of therapy | Profiled Da Vinci CRD RequestGroup category | `lineOfTherapy` category with required `TreatmentLineVS` binding |
| Prior systemic therapy | mCODE medication statement/administration/request | Need summarization pattern for prior therapy |
| Performance status | mCODE ECOG/Karnofsky profiles | Required only for selected regimens/policies |
| Contraindication / exception | Likely new profile/extension | Needed when guideline-concordant care requires exception documentation |
| Ordered regimen (instance) | New RequestGroup profile | Patient-specific ordered regimen; `instantiatesCanonical` → PlanDefinition |
| Regimen definition | New PlanDefinition profile | Canonical protocol; referenced by RequestGroup |

---

## 8. CRD and DTR Reuse Pattern

The same data-requirements artifact should drive both CRD and DTR.

### 8.1 CRD usage

CRD uses the data requirements to determine whether the EHR has supplied enough patient context to support a pre-approval decision.

```text
Clinician selects regimen
  -> RequestGroup (instantiatesCanonical -> PlanDefinition)
  -> DataRequirement[] from Library
  -> Patient Context Bundle or FHIR query
  -> CRD evaluation
```

Possible CRD outcomes:

| Condition | CRD response |
|---|---|
| Required data complete and criteria satisfied | No PA required, pre-approval, or silent success |
| Required data incomplete | Return DTR launch card |
| Required data complete but criteria not met | Return PA required or documentation required |
| Regimen cannot be evaluated | Return coverage/documentation guidance |

### 8.2 DTR usage

DTR uses the same data requirements to determine what documentation must be collected.

```text
DataRequirement[]
  -> Questionnaire selection or generation
  -> Questionnaire prepopulation
  -> Missing data capture
  -> QuestionnaireResponse / documentation package
```

The key advantage is that CRD and DTR are no longer based on separate logic. CRD uses the requirements to determine completeness and pre-approval eligibility. DTR uses the same requirements to collect the gaps.

---

## 9. CDS Hooks Discovery Pattern

The reference app uses standard CDS Hooks discovery with one service for each supported hook.
It does not advertise a custom oncology extension or prefetch templates. The service receives
the profiled RequestGroup in `draftOrders` and uses `fhirAuthorization` for patient-context
queries.

```json
{
  "services": [
    {
      "hook": "order-select",
      "id": "oncology-crd-order-select",
      "title": "Oncology CRD Order Select",
      "description": "Evaluates oncology chemotherapy orders using authorized EHR FHIR queries."
    },
    {
      "hook": "order-sign",
      "id": "oncology-crd-order-sign",
      "title": "Oncology CRD Order Sign",
      "description": "Returns the final coverage determination for an oncology regimen."
    }
  ]
}
```

---

## 10. Proposed Conformance Statements

### 10.1 CDS Client

```text
A conformant oncology CRD CDS Client SHALL include the selected anti-cancer regimen as a RequestGroup conforming to AntiCancerRegimenRequestGroup in context.draftOrders and context.selections when the selected clinical unit is a regimen.
```

```text
A conformant oncology CRD CDS Client SHALL populate RequestGroup.instantiatesCanonical with the canonical URL of the AntiCancerRegimenPlanDefinition being ordered when the definition is known.
```

```text
A conformant oncology CRD CDS Client SHALL populate repeated Da Vinci CRD ext-request-category values on RequestGroup for available patient-specific treatment intent and line-of-therapy context, subject to the proposed CRD RequestGroup context expansion.
```

```text
A conformant oncology CRD CDS Client SHOULD include instantiated component MedicationRequest, ServiceRequest, or other request resources as RequestGroup.action references when available.
```

```text
A conformant oncology CRD CDS Client SHALL make available the patient context required by the referenced DataRequirement entries through prefetch, FHIR API access, or an included patient context Bundle.
```

### 10.2 CDS Service

```text
A conformant oncology CRD CDS Service SHALL be capable of evaluating the selected anti-cancer regimen RequestGroup and resolving its instantiated PlanDefinition.
```

```text
A conformant oncology CRD CDS Service SHALL use the referenced or included DataRequirement entries to determine whether the supplied patient context is sufficient for pre-approval evaluation.
```

```text
A conformant oncology CRD CDS Service SHOULD return a DTR launch card when required patient context is missing and additional documentation is needed.
```

### 10.3 Data Requirements Library

```text
A cancer-specific data-requirements Library SHALL conform to OncologyDataRequirementsLibrary.
```

```text
A cancer-specific data-requirements Library SHALL declare required clinical data using Library.dataRequirement.
```

```text
A cancer-specific data-requirements Library SHOULD use mCODE profiles where available and define additional profiles or extensions only where mCODE is insufficient.
```

---

## 11. End-to-End Workflow

```text
1. Clinician selects an anti-cancer regimen in the oncology EHR.

2. The EHR invokes CDS Hooks order-select.

3. The CRD request includes:
   - selected RequestGroup regimen instance (in context.selections and draftOrders)
   - RequestGroup.instantiatesCanonical referencing the PlanDefinition regimen definition
   - repeated CRD ext-request-category values for available treatment intent and line
   - standard fhirAuthorization when the service needs to query additional patient context

4. The CRD service evaluates the selected regimen and required patient context.

5. If enough patient context is available and criteria are satisfied:
   - CRD returns no PA required, pre-approval, or other low-friction response.

6. If required patient context is missing:
   - CRD returns a DTR card.

7. DTR uses the same DataRequirement entries to:
   - select or generate the questionnaire
   - prepopulate known data
   - collect missing documentation

8. Completed documentation supports downstream PAS submission if PA remains required.
```

---

## 12. Recommended Summary Language

This proposal defines an oncology RequestGroup pattern for Da Vinci CRD using standard CDS
Hooks `order-select` and `order-sign` request fields.

For anti-cancer therapy, the selected clinical unit is the patient-specific ordered regimen, represented as a profiled FHIR `RequestGroup` included in the CDS Hooks `draftOrders` Bundle. `RequestGroup.instantiatesCanonical` references the canonical regimen definition, represented as a profiled `PlanDefinition` with `type = order-set`.

The RequestGroup identifies the selected regimen and repeats Da Vinci CRD
`ext-request-category` for patient-specific treatment intent, line of therapy, and other
order categories. CRD needs the proposed RequestGroup context expansion for that extension.
Cancer-specific data requirements are represented using FHIR `DataRequirement` entries,
preferably published in a cancer-specific `Library` for versioning and reuse; they are not
carried in a custom CDS Hooks request extension.

For breast cancer, the Library will declare required mCODE-based data such as primary cancer condition, stage, ER/PR/HER2 status, prior therapy, line of therapy, and performance status. CRD will use these data requirements to determine whether pre-approval can be evaluated, and DTR will use the same requirements to collect or prepopulate missing documentation.

The final model is:

```text
RequestGroup    = ordered regimen instance (patient-specific; instantiatesCanonical → PlanDefinition)
PlanDefinition  = canonical regimen definition (reusable protocol)
Library.dataRequirement = required patient context
DataRequirement = individual computable requirement
Questionnaire   = DTR collection instrument
Bundle / FHIR API = actual patient data
```
