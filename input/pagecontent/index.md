
This implementation guide defines the **Medical Oncology Prior Authorization (MOPA)** framework.
It is intentionally **informative**: it documents the oncology PA workflow, the gaps in Da Vinci
CRD/DTR/PAS and mCODE, and the upstream proposals needed to close those gaps.

<div class="mopa-logo-bar">
<img src="codex-logo.png" alt="HL7 CodeX FHIR Accelerator" />
<div class="mopa-logo-tagline">A FHIR Accelerator Program implementation guide<br/>extending Da Vinci CRD / DTR / PAS for oncology prior authorization</div>
</div>

### The Problem

Getting cancer treatment approved takes too long. For patients with breast cancer and other
oncology diagnoses, prior authorization is fragmented, slow, and disconnected from the clinical
evidence that guided the treatment decision. There is no shared, standards-based language for
oncology treatment decisions and no common way to move the right clinical data from the point of
care to the authorization system at the right moment.

**The regulatory pressure is now direct.** CMS-0062-P (April 2026) extends prior authorization
requirements to prescription drugs — including chemotherapeutics and anti-cancer agents.

### The Framework

This IG defines a structured authorization exchange using the standard Da Vinci CRD workflow
where the payer CRD service uses FHIR authorization (when provided) to query the EHR for
required oncology patient context (diagnosis, staging, biomarkers, line of therapy) directly.

The workflow uses two CDS Hooks stages:

- **`order-select` (informational)** — the CRD service evaluates approvability and returns
  advisory cards before the provider signs the order
- **`order-sign` (final determination)** — the CRD service returns the binding coverage
  determination

For the upstream standards work items, see:

- [Da Vinci Gap Proposals](davinci-gap-proposals.html)
- [mCODE Gap Proposals](mcode-gap-proposals.html)

<div style="border:2px solid #555; border-radius:6px; padding:16px; margin:1.2em 0; font-family:inherit; max-width:800px;">
<div style="text-align:center; font-weight:bold; font-size:1.1em; margin-bottom:14px;">The MOPA Framework</div>
<div style="display:flex; gap:12px; margin-bottom:10px;">
<div style="flex:1; border:2px solid #70ad47; border-radius:4px; padding:10px;">
<div style="font-weight:bold; text-align:center; margin-bottom:8px;">Structured Auth Exchange</div>
<div style="display:flex; gap:8px; justify-content:center;">
<div style="border:1px solid #70ad47; border-radius:3px; padding:4px 14px; background:#e2efda;"><a href="https://hl7.org/fhir/us/davinci-crd/" target="_blank" rel="noopener noreferrer">CRD</a></div>
<div style="border:1px solid #70ad47; border-radius:3px; padding:4px 14px; background:#e2efda;"><a href="https://hl7.org/fhir/us/davinci-dtr/" target="_blank" rel="noopener noreferrer">DTR</a></div>
<div style="border:1px solid #70ad47; border-radius:3px; padding:4px 14px; background:#e2efda;"><a href="https://hl7.org/fhir/us/davinci-pas/" target="_blank" rel="noopener noreferrer">PAS</a></div>
</div>
</div>
</div>
<div style="border:2px solid #c0392b; border-radius:4px; padding:10px; margin-bottom:10px;">
<div style="font-weight:bold; text-align:center; margin-bottom:8px; color:#c0392b;">Domain Models</div>
<div style="display:flex; gap:12px;">
<div style="flex:1; border:1px solid #c0392b; border-radius:3px; padding:6px; text-align:center; background:#fdf0ee; font-weight:bold;"><a href="https://hl7.org/fhir/us/mcode/" target="_blank" rel="noopener noreferrer">mCODE</a></div>
<div style="flex:1; border:1px solid #c0392b; border-radius:3px; padding:6px; text-align:center; background:#fdf0ee; font-weight:bold;"><a href="https://hl7.org/fhir/us/core/" target="_blank" rel="noopener noreferrer">US Core</a></div>
</div>
</div>
<div style="border:2px solid #e67e22; border-radius:4px; padding:10px;">
<div style="font-weight:bold; text-align:center; margin-bottom:8px; color:#e67e22;">Enablers</div>
<div style="display:flex; gap:12px;">
<div style="flex:1; border:1px solid #e67e22; border-radius:3px; padding:6px; text-align:center; background:#fef5ec; font-weight:bold;"><a href="https://cds-hooks.hl7.org/" target="_blank" rel="noopener noreferrer">CDS Hooks</a></div>
</div>
</div>
</div>

### Scope

**In scope:**
- All oncology cancer types (solid tumors and hematologic malignancies)
- Anti-cancer regimen representation as a first-class FHIR artifact
- Standard Da Vinci CRD workflow for oncology — payer queries EHR FHIR API for required context
- Patient context data categories for oncology PA evaluation
- **Use Case 1: Breast cancer prior authorization** — the first concrete data requirements
  implementation, serving as the template for other cancer types

**Out of scope (this version):**
- **Coverage adjudication and benefit determination** — whether a treatment is covered is a payer decision; this IG delivers the structured request, not the decision logic
- **Post-denial workflows** — appeals, grievances, and peer-to-peer review processes
- **Regimen clinical equivalence and preference ranking** — comparative effectiveness of treatment options is a clinical decision support concern outside authorization exchange
- **Dose calculation and modification rules** — weight-based dosing, renal/hepatic adjustments, and toxicity-driven modifications are out of scope
- **Pharmacy benefit management (PBM) integration** — specialty pharmacy routing, formulary lookups, and drug pricing are not addressed
- **Radiation therapy and surgical procedure authorization** — this version covers anti-cancer drug regimens only
- **X12 transaction details** — EDI mapping is delegated to Da Vinci PAS
- **Clinical trial eligibility matching** — protocol screening and trial enrollment are outside the authorization workflow modeled here

### Stakeholders

| Stakeholder | Benefit |
|---|---|
| **Oncology Practice / Clinician** | Clinical guideline-aligned recommendations surface at the moment of ordering — structuring the treatment decision in a way that moves through authorization without friction |
| **Cancer Patient** | Clinical guideline-appropriate treatment is authorized faster because the clinical evidence supporting the decision arrives at the payer in a structured, computable form |
| **Health Plan / Payer** | Authorization requests carry the structured clinical evidence — diagnosis, staging, biomarkers, line of therapy — that coverage policy requires, enabling consistent, evidence-grounded determinations |
| **EHR / Ordering System** | A single conformant integration delivers clinical guideline-aligned CDS and structured authorization requests across all payers and cancer types, replacing fragmented per-payer builds |
| **Clinical Guideline Authority** | Computable regimen definitions flow directly from publication into clinical decision support and payer coverage evaluation — creating a traceable path from evidence to real-world treatment authorization |
{: .table }

<div style="max-width: 400px;">
<img src="mopa-stakeholders.svg" alt="MOPA Stakeholder Diagram" style="width:100%;" />
</div>

### Dependencies

| Implementation Guide | Version | Role |
|---|---|---|
| [US Core](http://hl7.org/fhir/us/core) | 7.0.0 | Base US patient, practitioner, and clinical data profiles |
| [mCODE](http://hl7.org/fhir/us/mcode) | 4.0.0 | Oncology clinical data foundation |
| [Da Vinci CRD](http://hl7.org/fhir/us/davinci-crd) | 2.2.1 | Coverage Requirements Discovery workflow backbone |
| [Da Vinci DTR](http://hl7.org/fhir/us/davinci-dtr) | 2.2.0 | Documentation Templates and Rules |
| [Da Vinci PAS](http://hl7.org/fhir/us/davinci-pas) | 2.2.1 | Prior Authorization Support |
{: .table }

### How to Read This Guide

- [Background](background.html) — Clinical problem, regulatory context, and gaps in existing standards
- [Use Cases and Actors](use-cases.html) — The workflow, system actors, and actor responsibilities
- [Da Vinci Gap Proposals](davinci-gap-proposals.html) — CRD, DTR, and PAS proposals derived from the gap analysis
- [mCODE Gap Proposals](mcode-gap-proposals.html) — Data model proposals derived from the gap analysis
- **Specification:**
  - [Regimen Modeling](regimen-model.html) — How anti-cancer regimens are represented as FHIR `PlanDefinition` and `RequestGroup`
  - [CRD Workflow](cds-workflow.html) — How the payer CRD service queries the EHR FHIR API for oncology context
  - [Data Requirements](data-requirements.html) — The oncology data categories queried during CRD evaluation
  - [Breast Cancer PA](breast-cancer-pa.html) — Breast cancer-specific data requirements and gap analysis
- [Conformance](conformance.html) — Requirements for claiming conformance to this IG
- [Artifacts](artifacts.html) — All profiles, extensions, value sets, and examples

{% include ip-statements.xhtml %}
