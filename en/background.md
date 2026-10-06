# Background - MOPA — Medical Oncology Prior Authorization v0.1.1-snapshot-080926

## Background

### The Oncology Prior Authorization Problem

For oncology patients, the prior authorization process between clinicians and health plans is fragmented, slow, and often disconnected from the clinical evidence that guided the treatment decision. Clinicians document the same information in multiple systems. Payers request data already in the medical record. Approvals are delayed. Treatments are postponed.

The problem is consistent across cancer types — breast, lung, colorectal, hematologic, and beyond. The root cause is structural: there is no shared, standards-based language for oncology treatment decisions, and no common way to move the right clinical data from the point of care to the authorization system at the right moment.

### Regulatory Context

**CMS-0062-P** (proposed April 2026) extends prior authorization requirements to prescription drugs, including chemotherapeutics and anti-cancer agents. For the first time, health plans face federal requirements to support structured, electronic prior authorization for the drug classes at the center of oncology care. No interoperability standard currently exists that adequately addresses how to exchange the clinical context — regimen, stage, biomarkers, line of therapy — that oncology drug authorization actually requires.

### Gaps in Existing Standards

#### Da Vinci CRD / DTR / PAS

Da Vinci significantly improves the mechanics of prior authorization, but it operates:

* **Reactively (post-order)** — starting after order selection with little information on payer policies upfront, leading to rework and delayed notification of coverage decisions
* **At the service level, not regimen level** — CRD hooks (`order-select`/`order-sign`) are defined around individual order resources (`MedicationRequest`, `ServiceRequest`); there is no standard way to submit a `RequestGroup` as the primary PA unit, even though oncology authorization is evaluated at the protocol (regimen) level, not per-medication
* **Without clinical equivalence semantics** — no standard way to express approvable vs. non-approvable regimen options or step therapy within oncology care
* **Without an oncology data foundation** — US Core alone does not support staging, biomarkers, or treatment context, resulting in heavy DTR burden

#### mCODE

mCODE provides a strong foundation for oncology interoperability — diagnosis, staging, biomarkers, performance status, and treatment events — but does not yet:

* Represent **anti-cancer regimens as first-class, computable entities** (ordered treatment plans rather than individual medication requests)
* Standardize **line-of-therapy and treatment setting** concepts required for PA decisions
* Express **clinical equivalence or preference** across regimens
* Provide a **structured PA submission package** that carries all required patient context

### The Role of a Guideline Authority

An independent guideline authority (such as NCCN or ASCO) can play a unique dual role: serving both as a trusted source of **clinical decision support** and as a neutral arbiter of baseline electronic prior authorization. By publishing evidence-based, computable guidance that defines clinically appropriate and equivalent treatment options, the authority establishes a common foundation that both providers and payers rely on.

This creates the opportunity for a **baseline approval layer**, where treatments that adhere to guideline-defined criteria can be automatically recognized as appropriate for authorization, reducing variability across payers. However, coverage adjudication and benefit determination are out of scope for this IG; payers make independent coverage decisions based on their policies. This IG enables the structured information exchange that supports such decisions.

### Relationship to This IG

This IG fills the identified gaps by defining:

1. A**computable anti-cancer regimen representation**—`PlanDefinition`(canonical protocol) and`RequestGroup`(patient-specific ordered instance)
1. A**standard Da Vinci CRD workflow**for oncology — the payer CRD service uses FHIR authorization to query the EHR for required oncology context at the time of ordering
1. A**defined set of oncology data categories**(cancer condition, staging, biomarkers, line of therapy, performance status, prior therapy) that the CRD service queries and that DTR collects when data is missing from the EHR
1. A**cancer-specific data requirements pattern**with breast cancer PA as the first concrete implementation, designed to be replicated for lung, colorectal, hematologic, and other cancer types

These artifacts are incremental extensions to Da Vinci CRD/DTR/PAS and mCODE. The specific gaps are tracked as explicit backlog items on the [Da Vinci Gap Proposals](davinci-gap-proposals.md) and [mCODE Gap Proposals](mcode-gap-proposals.md) pages.

**⚠ mCODE Gap Proposals**

Several artifacts defined in this IG — the anti-cancer regimen profiles, treatment-line observation, regimen extensions, and related terminology — are proposed for migration into mCODE STU5. They are published here to unblock pilots and are **not** intended to be permanent MOPA artifacts. See [mCODE Gap Proposals](mcode-gap-proposals.md) for the full list, migration plan, and guidance for implementers.

