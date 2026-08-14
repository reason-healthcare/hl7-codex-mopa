# MOPA Reference Application

A runnable, demo-quality reference implementation of the **Medical Oncology Prior
Authorization (MOPA)** workflow across six actors: Hub, EHR, CRD Service,
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

Four patients are loaded by a single script. Each patient has a distinct clinical
profile that exercises a different CDS outcome when an order is placed in the EHR.

```bash
bash fixtures/load-fixtures.sh
```

| Patient | ECOG | HER2 | Expected CDS outcome at order-select |
|---|---|---|---|
| **Jane Smith** (MRN-001) | 0 | Positive | Approvable — PA not required |
| **Maria Garcia** (MRN-002) | 1 | Positive | Approvable — PA required |
| **Sandra Chen** (MRN-003) | 1 | Absent | DTR Required — collect HER2 first |
| **Diane Roe** (MRN-004) | 0 | Positive | Approvable + biosimilar substitution suggestion |

The load script is idempotent. Re-running it purges existing data for each patient
before reloading, so you can reset mid-demo without side effects.

Each patient's `Patient.text.div` contains the canonical clinical narrative. The Hub
reads this live from HAPI and shows it on the **Demo Fixtures** tab.

---

## Demonstration script

An interactive, narrated walkthrough script is available:

```bash
bash fixtures/demo-walkthrough.sh
```

This script starts services, loads fixtures, and guides you through each demo path
with narration and prompts. Use `--quick` to skip setup if services are already running.

---

## Walkthrough — placing an order

1. Open the **Hub** at [http://localhost:4000](http://localhost:4000)
2. Switch to the **Demo Fixtures** tab to see all four patient cases
3. Click **Open in EHR** on any case
4. In the patient chart, open **Order Entry** and select the **TH** regimen
5. CRD fires on `order-select` — the outcome depends on the patient's data:

   | Case | What you see |
   |---|---|
   | Jane Smith | Approvable, PA not required — sign and proceed |
   | Maria Garcia | Approvable, PA required — sign, then submit PA |
   | Sandra Chen | Documentation Required — launch DTR, enter HER2, return to EHR |
   | Diane Roe | Approvable + violet suggestion panel: Accept Substitution (trastuzumab-dttb) or Override |

6. After DTR (Sandra Chen): HER2 is now present. The EHR re-fires `order-select` and
   CRD returns Approvable.

7. For Diane Roe: if the provider **accepts** the substitution, the EHR updates the
   draft orders in-session (replaces trastuzumab with trastuzumab-dttb) and sends the
   modified Bundle to `order-sign`. If **overridden**, the original order proceeds
   unchanged.

---

## Knowledge Artifacts

Browse at [http://localhost:4000/?tab=content](http://localhost:4000/?tab=content)

All FHIR knowledge artifacts are served by the Hub at `/fhir/PlanDefinition` and
`/fhir/Library`. The content browser organises them by type and layer:

- **ECA Rules — Payer Policy** (`BreastCancerPAWorkflow`, `NSCLCPAWorkflow`)
  — coverage determination rules used by the CRD Service
- **Order Sets — Regimen Templates** (`RegimenTH`, `RegimenPHD`, `RegimenDdACT`, …)
  — canonical chemotherapy regimen definitions per the MOPA
  `AntiCancerRegimenPlanDefinition` profile; include structured timing and
  sequential phase ordering via `relatedAction`

Each artifact links to its raw FHIR JSON via the Hub API.

---

## Ports

| App | Port |
|---|---|
| Hub | 4000 |
| EHR | 4001 |
| CRD Service | 4003 |
| DTR Client | 4004 |
| PAS Service | 4005 |
| Payer Backend | 4006 |
| HAPI FHIR | 8080 |

---

For architecture, shared packages, environment variables, and contribution guidelines
see **[DEVELOPER.md](./DEVELOPER.md)**.
