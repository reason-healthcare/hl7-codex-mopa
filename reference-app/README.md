# OGCA Reference Application

A runnable, demo-quality reference implementation of the **Oncology Guideline-Compliant
Authorization (OGCA)** workflow across six actors: EHR, CDS SMART App, CRD Service,
DTR Client, PAS Service, and Payer Backend.

> **Status:** Phases 1–7 complete. See [`PLAN.md`](./PLAN.md) for the roadmap.

---

## Run locally

**Prerequisites:** Node.js ≥ 20, pnpm ≥ 10, Docker

```bash
# 1. Install
cd reference-app
pnpm install

# 2. Start HAPI FHIR
docker compose up hapi -d

# 3. Load Jane Smith fixtures
bash fixtures/load-fixtures.sh

# 4. Start all six apps (Turborepo, hot-reload)
pnpm dev
```

Open [http://localhost:4001](http://localhost:4001).

For a fully containerised setup (demos, CI):

```bash
docker compose up   # all six apps + HAPI, production builds
```

---

## Demo scenario — Jane Smith, TH regimen

Three demo paths are available. Each is set up with a single script that resets HAPI
to a clean state and configures the relevant data.

### Pivot: ECOG Performance Status

The key variable that determines authorization outcome when all required data is present:

| ECOG score | CRD outcome | Path |
|---|---|---|
| **0** (Fully active) | Pre-authorized — no PA submission needed | Path 1 |
| **≥ 1** (Restricted) | Coverage criteria met — PA required | Path 2 |
| — | Missing data — DTR required | Path 3 |

Base fixtures load with **ECOG = 1** and **HER2 absent**.

---

### Path 1 — pre-authorized (ECOG 0, all data present)

```bash
bash fixtures/path1.sh
```

1. EHR → Jane Smith → **Order Entry** → select **TH**
2. CRD (`order-select`) returns **Coverage pre-authorized — no PA required** card
3. **Sign Order** → CRD (`order-sign`) confirms pre-authorization
4. No PA submission step — order proceeds directly

---

### Path 2 — PA required (ECOG 1, all data present)

```bash
bash fixtures/path2.sh
```

1. EHR → Jane Smith → **Order Entry** → select **TH**
2. CRD (`order-select`) returns **Coverage criteria met** card with PA Required row
3. **Sign Order** → CRD (`order-sign`) returns **Prior authorization required** card
4. **Submit Prior Authorization** → Payer Backend runs CQL → **ClaimResponse: Approved**

---

### Path 3 — DTR required (HER2 missing)

```bash
bash fixtures/path3.sh
```

1. EHR → Jane Smith → **Order Entry** → select **TH**
2. CRD returns **Additional information required** card with DTR link
3. **Launch Documentation Requirements Tool** → HER2 question renders
4. Select a HER2 value → **Submit Documentation** → Observation written to HAPI
5. DTR redirects back to EHR → `order-select` auto-fires
6. Post-DTR outcome depends on ECOG already present (ECOG=1 → Path 2)

To test DTR → pre-authorized variant:
```bash
bash fixtures/path1.sh && bash fixtures/remove-her2.sh
```
This sets ECOG=0 first, then removes HER2 — completing DTR then follows Path 1.
5. **Submit Prior Authorization** → Payer Backend runs CQL → **ClaimResponse: Approved**

### Path 2 — DTR path (HER2 missing)

1. `bash fixtures/remove-her2.sh` (or start fresh — HER2 absent by default)
2. EHR → Jane Smith → **Order Entry** → select **TH**
3. CRD returns **Additional information required** card with DTR link
4. **Launch Documentation Requirements Tool** → HER2 question renders
5. Select **IHC 3+ (Positive)** → **Submit Documentation** → Observation written to HAPI
6. DTR redirects back to EHR → `order-select` auto-fires → **Coverage criteria met** card
7. Sign Order → PA submission → approved

### Path 3 — CDS SMART App gap analysis

1. EHR → Jane Smith → **Launch CDS App**
2. Gap table shows **HER2 Missing** (if absent)
3. Inline form → **Save HER2 Result** → Observation written to HAPI
4. After HAPI indexes (~10 s), reload → **TH Eligible** regimen appears
5. **Order TH →** deep-links to EHR order entry

---

## CDS SMART App

The SMART App operates in two modes, switchable via URL parameter.

### Mode 1 — OGCA-aware (default)

`http://localhost:4001` or `http://localhost:4001?mode=ogca`

The app can write observations back to the EHR FHIR server. When HER2 is missing,
an inline form lets the clinician enter the result. The observation is stored in HAPI
and the gap analysis re-evaluates automatically.

### Mode 2 — Read-only (what-if)

`http://localhost:4001?mode=readonly`

The app cannot chart observations. A **What-if Analysis** panel lets users enter
hypothetical values for all required data elements (HER2, cancer stage, ECOG) and
evaluates eligibility and authorization outcome locally — nothing is written to FHIR.
Useful for demonstrating the decision logic without modifying patient data.

---

## Clinical Content

`http://localhost:4002/content`

Shows the two-layer CDS architecture side by side:

- **Layer 1 — Guideline Authority** (`BreastCancerGuideline`) — regimen eligibility rules
  used by the SMART App. Determines what is clinically appropriate.
- **Layer 2 — Payer Policy** (`BreastCancerPayerPolicy`) — PA data requirements and
  authorization thresholds used by the CRD service. A subset of the guideline authority:
  cannot approve what the guideline rejects.

Includes full CQL source for both libraries.

---

## Ports

| App | Port |
|---|---|
| Hub | 4000 |
| EHR | 4001 |
| CDS SMART App | 4002 |
| CRD Service | 4003 |
| DTR Client | 4004 |
| PAS Service | 4005 |
| Payer Backend | 4006 |
| HAPI FHIR | 8080 |

---

For architecture, shared packages, environment variables, and contribution guidelines
see **[DEVELOPER.md](./DEVELOPER.md)**.
