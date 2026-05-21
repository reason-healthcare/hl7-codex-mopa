# OGCA Reference Application

A runnable, demo-quality reference implementation of the **Oncology Guideline-Compliant
Authorization (OGCA)** workflow across six actors: Hub, EHR, CDS SMART App, CRD Service,
DTR Client, PAS Service, and Payer Backend.

---

## Run locally

**Prerequisites:** Node.js ≥ 20, pnpm ≥ 10, Docker

```bash
# 1. Install
cd reference-app
pnpm install

# 2. Start HAPI FHIR
docker compose up hapi -d

# 3. Load all demo patient fixtures
bash fixtures/load-fixtures.sh

# 4. Start all apps (Turborepo, hot-reload)
pnpm dev
```

Open [http://localhost:4000](http://localhost:4000) — the Hub is the entry point.

For a fully containerised setup (demos, CI):

```bash
docker compose up   # all apps + HAPI, production builds
```

---

## Demo patient cases

All three cases are loaded by a single script. Each patient has a distinct clinical
profile that exercises a different CDS outcome when an order is placed in the EHR.

```bash
bash fixtures/load-fixtures.sh
```

| Patient | ECOG | HER2 | Expected CDS outcome |
|---|---|---|---|
| **Jane Smith** (MRN-001) | 0 | Positive | Pre-authorized — no PA required |
| **Maria Garcia** (MRN-002) | 1 | Positive | PA required — submit to payer |
| **Sandra Chen** (MRN-003) | 1 | Absent | DTR required — collect HER2 first |

The load script is idempotent. Re-running it purges existing data for each patient
before reloading, so you can reset mid-demo without side effects.

Each patient's `Patient.text.div` contains the canonical clinical narrative. The Hub
reads this live from HAPI and shows it on the **Demo Fixtures** tab.

---

## Walkthrough — placing an order

1. Open the **Hub** at [http://localhost:4000](http://localhost:4000)
2. Switch to the **Demo Fixtures** tab to see all three patient cases
3. Click **Open in EHR** on any case
4. In the patient chart, open **Order Entry** and select the **TH** regimen
5. CRD fires on `order-select` — the outcome depends on the patient's data:

   | Case | What you see |
   |---|---|
   | Jane Smith | Pre-authorized badge — sign and proceed |
   | Maria Garcia | PA Required badge — sign, then Submit PA |
   | Sandra Chen | DTR card — launch DTR, enter HER2, return to EHR |

6. After DTR (Sandra Chen): HER2 is now present. The EHR re-fires `order-select` and
   CRD returns the PA Required outcome (ECOG 1). Proceed as Maria Garcia's case.

---

## CDS SMART App

Launch from the EHR patient chart. Operates in two modes:

**OGCA-aware (default)** — Gap analysis against the BreastCancerGuideline CQL library.
When HER2 is missing an inline form lets the clinician enter the result and writes
the observation back to HAPI.

**Read-only (what-if)** — Add `?mode=readonly` to the launch URL. A what-if panel lets
users enter hypothetical values for all required data elements and evaluates guideline
eligibility locally — nothing is written to FHIR.

---

## Knowledge Artifacts

Browse at [http://localhost:4000/?tab=content](http://localhost:4000/?tab=content)

All FHIR knowledge artifacts are served by the Hub at `/fhir/PlanDefinition` and
`/fhir/Library`. The content browser organises them by type and layer:

- **ECA Rules — Guideline Authority** (`BreastCancerGuidelineCDS`, `NSCLCGuidelineCDS`)
  — evidence-based regimen recommendations, used by the CDS SMART App
- **ECA Rules — Payer Policy** (`BreastCancerPAWorkflow`, `NSCLCPAWorkflow`)
  — coverage determination rules used by the CRD Service; carry CDS Hooks
  `action.trigger` so discovery is derived from the registered PlanDefinitions
- **Order Sets — Regimen Templates** (`RegimenTH`, `RegimenPHD`, `RegimenDdACT`, …)
  — canonical chemotherapy regimen definitions per the OGCA
  `AntiCancerRegimenPlanDefinition` profile; include structured timing and
  sequential phase ordering via `relatedAction`

Each artifact links to its raw FHIR JSON via the Hub API.

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
