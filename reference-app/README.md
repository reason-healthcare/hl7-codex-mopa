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

Open [http://localhost:4000](http://localhost:4000).

For a fully containerised setup (demos, CI):

```bash
docker compose up   # all six apps + HAPI, production builds
```

---

## Demo scenario — Jane Smith, TH regimen

> **HER2 is intentionally absent from the base fixtures** — its absence triggers
> the DTR/gap-analysis path. Run `bash fixtures/add-her2.sh` to add it.

### Path 1 — pre-approved (all data present)

1. `bash fixtures/add-her2.sh`
2. EHR → Jane Smith → **Order Entry** → select **TH**
3. CRD returns **Regimen pre-approved** card
4. **Sign Order** → CRD returns **Prior authorization required** card
5. **Submit Prior Authorization** → Payer Backend runs CQL → **ClaimResponse: Approved**

### Path 2 — DTR path (HER2 missing)

1. `bash fixtures/remove-her2.sh` (or start fresh — HER2 absent by default)
2. EHR → Jane Smith → **Order Entry** → select **TH**
3. CRD returns **Additional information required** card with DTR link
4. **Launch Documentation Requirements Tool** → HER2 question renders
5. Select **IHC 3+ (Positive)** → **Submit Documentation** → Observation written to HAPI
6. DTR redirects back to EHR → `order-select` auto-fires → **Pre-approved** card
7. Sign Order → PA submission → approved

### Path 3 — CDS SMART App gap analysis

1. EHR → Jane Smith → **Launch CDS App**
2. Gap table shows **HER2 Missing** (if absent)
3. Inline form → **Save HER2 Result** → Observation written to HAPI
4. After HAPI indexes (~10 s), reload → **TH Eligible** regimen appears
5. **Order TH →** deep-links to EHR order entry

---

## Ports

| App | Port |
|---|---|
| EHR | 4000 |
| CDS SMART App | 4001 |
| CRD Service | 4002 |
| DTR Client | 4003 |
| PAS Service | 4004 |
| Payer Backend | 4005 |
| HAPI FHIR | 8080 |

---

For architecture, shared packages, environment variables, and contribution guidelines
see **[DEVELOPER.md](./DEVELOPER.md)**.
