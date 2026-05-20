# OGCA Reference Application

A runnable, demo-quality reference implementation of the **Oncology Guideline-Compliant
Authorization (OGCA)** workflow. Six actors are modelled as independent Next.js
applications sharing common packages in a Turborepo + pnpm monorepo.

> **Status:** Phases 1–7 complete.
> See [`PLAN.md`](./PLAN.md) for the full phased roadmap and
> [`TASKS.md`](./TASKS.md) for granular progress tracking.

---

## Architecture

```
reference-app/
├── apps/
│   ├── ehr/              :4000  Oncology EHR — patient chart, order entry, SMART host
│   ├── smart-app/        :4001  Layer 1 CDS SMART App — gap analysis, regimen options
│   ├── crd-service/      :4002  CRD Service — CDS Hooks server, Library host
│   ├── dtr-client/       :4003  DTR Client — questionnaire, prepopulation, QR persistence
│   ├── pas-service/      :4004  PAS Service — $submit, routing, ClaimResponse
│   └── payer-backend/    :4005  Payer Backend — CQL policy evaluation, determination
└── packages/
    ├── fhir-client/      fhir-kit-client re-export + fhir-zod schemas + proxy handler
    ├── cds-hooks/        CDS Hooks types, discovery, request/response helpers
    ├── cql-engine/       CqlEngine interface + cql-execution adapter
    ├── smart-auth/       SMART on FHIR OAuth (EHR launch, PKCE, token cookies)
    └── ui/               Shared Tailwind components
```

### FHIR client pattern

Transport and validation are separated using
[`fhir-kit-client`](https://github.com/Vermonster/fhir-kit-client) and
[`@reasonhealth/fhir-zod`](https://github.com/reason-healthcare/fhir-types-workspace):

```ts
import { Client, PatientSchema, BundleSchema, ConditionSchema } from "@ogca/fhir-client";

const client = new Client({ baseUrl: process.env.FHIR_BASE_URL });

const patient = PatientSchema.parse(
  await client.read({ resourceType: "Patient", id })
);

const bundle = BundleSchema.parse(
  await client.search({ resourceType: "Condition", searchParams: { patient: id } })
);
const conditions = (bundle.entry ?? [])
  .map((e) => e.resource)
  .filter((r): r is NonNullable<typeof r> => r?.resourceType === "Condition")
  .map((r) => ConditionSchema.parse(r));
```

### FHIR proxy

Every app exposes `/api/fhir/[...path]` — a catch-all route that forwards to the
upstream FHIR server. Client components use the local proxy; server components call
the FHIR server directly.

```
GET /api/fhir/Patient/jane-smith  →  GET http://localhost:8080/fhir/Patient/jane-smith
```

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | ≥ 20 | |
| pnpm | ≥ 10 | `npm install -g pnpm` |
| Docker | any recent | HAPI FHIR only |
| pm2 | ≥ 5 | optional — `npm install -g pm2` |

---

## Quick start

### 1. Install dependencies

```bash
cd reference-app
pnpm install
```

### 2. Start HAPI FHIR

```bash
docker compose up hapi -d
```

HAPI starts on `:8080`. First startup takes ~30 seconds while the JVM initialises.

### 3. Load fixture data

```bash
bash fixtures/load-fixtures.sh
```

Loads Jane Smith's chart as a FHIR transaction bundle:

| Resource | ID | Notes |
|---|---|---|
| Patient | `jane-smith` | DOB 1972-04-15, MRN-001 |
| Condition | `jane-smith-breast-cancer` | Primary breast cancer (SNOMED + ICD-10-CM) |
| Observation | `jane-smith-cancer-stage` | Stage IIIA (LOINC 21908-9) |
| Observation | `jane-smith-ecog-ps` | ECOG PS 1 (LOINC 89247-1) |
| Observation | `jane-smith-line-of-therapy` | First-line |
| Observation | `jane-smith-prior-therapy` | None (treatment-naïve) |

> **HER2 is intentionally absent** — its absence triggers the DTR/gap-analysis
> path (Phases 5–6). Use `bash fixtures/add-her2.sh` to add it and exercise
> the pre-approved / PA-required paths, or submit it via the CDS SMART App UI.

### 4. Start the apps

**Option A — pm2 (recommended for local dev):**

```bash
pm2 start ecosystem.config.cjs
```

All six apps start in hot-reload mode. See [pm2 commands](#pm2-commands) below.

**Option B — single app:**

```bash
pnpm --filter @ogca/ehr dev          # → http://localhost:4000
```

**Option C — Turborepo (all apps, one terminal):**

```bash
pnpm dev
```

### 5. Open the EHR

[http://localhost:4000](http://localhost:4000) → **Open Chart** →
Jane Smith's chart pulls live from HAPI.

---

## pm2 commands

All commands run from `reference-app/`.

```bash
pm2 start ecosystem.config.cjs   # start all six apps
pm2 list                          # status table
pm2 logs                          # tail all app logs
pm2 logs ehr                      # tail one app
pm2 restart ehr                   # restart one app (picks up .env.local changes)
pm2 stop all                      # stop without removing
pm2 delete all                    # stop and remove all processes
```

---

## Docker Compose

```bash
docker compose up
```

Starts all six apps and HAPI together. Apps run as production Next.js builds inside
their Docker images — use this for demos or CI, not for active development.

```
http://localhost:4000  EHR
http://localhost:4001  CDS SMART App
http://localhost:4002  CRD Service
http://localhost:4003  DTR Client
http://localhost:4004  PAS Service
http://localhost:4005  Payer Backend
http://localhost:8080  HAPI FHIR
```

---

## Development commands

All commands run from `reference-app/`.

```bash
pnpm dev              # start all apps in watch mode (Turborepo)
pnpm build            # production build of all apps
pnpm typecheck        # tsc --noEmit across all packages and apps
pnpm lint             # Biome lint
pnpm format           # Biome format (writes)
pnpm format:check     # Biome format (check only, CI-safe)
pnpm test             # Vitest (all packages)
pnpm test:watch       # Vitest in watch mode
pnpm test:coverage    # Vitest with v8 coverage
pnpm clean            # remove .next / dist / .turbo artefacts
```

---

## Environment variables

Each app has a `.env.local` file. Copy `.env.example` (when present) and adjust.
The key variables shared across apps:

| Variable | Default | Description |
|---|---|---|
| `SMART_AUTH_BYPASS` | `true` | Skip SMART OAuth — set `false` to require real tokens |
| `SMART_JWT_SECRET` | `ogca-dev-secret-…` | HS256 signing key for SMART tokens (EHR only) |
| `FHIR_BASE_URL` | `http://localhost:8080/fhir` | Upstream HAPI base URL (EHR only) |
| `NEXT_PUBLIC_CRD_SERVICE_URL` | `http://localhost:4002` | CRD Service base URL (EHR, smart-app) |
| `NEXT_PUBLIC_EHR_BASE_URL` | `http://localhost:4000` | EHR base URL (smart-app, dtr-client) |
| `DTR_CLIENT_URL` | `http://localhost:4003` | DTR Client base URL (CRD Service) |
| `EHR_FHIR_BASE_URL` | `http://localhost:4000/api/fhir` | EHR FHIR proxy (dtr-client, payer-backend) |
| `PAS_SERVICE_URL` | `http://localhost:4004` | PAS Service base URL (EHR) |
| `PAYER_BACKEND_URL` | `http://localhost:4005` | Payer Backend base URL (PAS Service) |

---

## Demo scenario — Jane Smith, TH regimen

The full workflow from chart to prior-authorization:

### Path 1 — pre-approved (all data present)

1. `bash fixtures/add-her2.sh` — add IHC 3+ HER2 Observation
2. EHR → Jane Smith → **Order Entry** → select **TH**
3. `order-select` fires CRD → **Regimen pre-approved** card appears
4. **Sign Order** fires `order-sign` → **Prior authorization required** card appears
5. **Submit Prior Authorization** → Payer Backend runs CQL → **ClaimResponse: Approved**

### Path 2 — DTR path (HER2 missing)

1. `bash fixtures/remove-her2.sh` (or start fresh — HER2 absent by default)
2. EHR → Jane Smith → **Order Entry** → select **TH**
3. `order-select` fires CRD → **Additional information required** card with DTR link
4. **Launch Documentation Requirements Tool** → DTR app loads with HER2 question
5. Select **IHC 3+ (Positive)** → **Submit Documentation** → Observation written to HAPI
6. DTR redirects back to EHR → `order-select` auto-fires → **Pre-approved** card
7. Proceed to Sign Order → PA submission → approved

### Path 3 — CDS SMART App gap analysis

1. EHR → Jane Smith → **Launch CDS App** (from chart page)
2. Smart App fetches Library from CRD, runs parallel FHIR queries, evaluates CQL
3. Gap table shows **HER2 Missing** (if absent)
4. Inline HER2 form → **Save HER2 Result** → write-back Observation
5. After HAPI indexes (~10 s), reload → **TH Eligible** regimen appears
6. **Order TH →** deep-links to EHR order entry

---

## Fixture helpers

```bash
bash fixtures/load-fixtures.sh          # load Jane Smith (idempotent)
bash fixtures/add-her2.sh               # add IHC 3+ HER2 Observation
bash fixtures/remove-her2.sh            # remove HER2 (reset to gap state)

# Load into a non-default FHIR server
bash fixtures/load-fixtures.sh https://my-server.example.com/fhir
```

---

## Technology stack

| Concern | Choice |
|---|---|
| Monorepo | [Turborepo](https://turbo.build) + [pnpm](https://pnpm.io) workspaces |
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| FHIR transport | [`fhir-kit-client`](https://github.com/Vermonster/fhir-kit-client) |
| FHIR types + validation | [`@reasonhealth/fhir-zod`](https://github.com/reason-healthcare/fhir-types-workspace) |
| CQL compile | `rh cql compile` (Reason Health Rust CLI, no JVM required) |
| CQL runtime | `cql-execution` + `cql-fhir-data-provider` |
| Lint + format | [Biome](https://biomejs.dev) |
| Tests | [Vitest](https://vitest.dev) |
| Process manager | [pm2](https://pm2.keymetrics.io) (local dev) |
| FHIR server | [HAPI FHIR](https://hapifhir.io) (Docker) |
| Orchestration | Docker Compose (demo / CI) |

---

## Shared packages

### `@ogca/fhir-client`

Re-exports `fhir-kit-client`'s `Client` and `@reasonhealth/fhir-zod/r4` schemas as
the single FHIR import point across the monorepo. Also exports `fhirProxyHandler` for
the Next.js catch-all proxy route and patient display helpers.

> **`BundleSchema` note:** uses a local passthrough schema (`z.record(z.unknown())`)
> for `entry[].resource` instead of fhir-zod's generated one, which strips
> `resourceType` via the abstract `Resource` base type.

### `@ogca/cds-hooks`

CDS Hooks request/response types, discovery helpers, and Zod schemas for runtime
validation at the CRD Service API boundary.

### `@ogca/cql-engine`

`CqlEngine` interface and `CqlExecutionEngine` adapter backed by `cql-execution`.
ELM JSON is compiled at author-time using `rh cql compile` and committed to
`cql/elm/`. Both the CRD Service and Payer Backend load ELM via `require()` so
Next.js bundles it with no `__dirname` issues.

### `@ogca/smart-auth`

SMART on FHIR authorization code flow with PKCE. The EHR acts as the authorization
server (issues tokens); apps use `SMART_AUTH_BYPASS=true` in `.env.local` for
development without real OAuth round-trips.

### `@ogca/ui`

Shared Tailwind components (`PatientBanner`). Extended throughout phases.

---

## Implementation phases

| Phase | Title | Status |
|---|---|---|
| 1 | Foundation — monorepo, FHIR proxy, Jane Smith chart | ✅ Complete |
| 2 | CRD Service + EHR Order Entry | ✅ Complete |
| 3 | CQL Guideline + Payer Policy | ✅ Complete |
| 4 | SMART OAuth | ✅ Complete |
| 5 | CDS SMART App (Layer 1) | ✅ Complete |
| 6 | DTR Client | ✅ Complete |
| 7 | PAS Service + Payer Backend | ✅ Complete |
| 8 | Integration, Polish, Docs | 🔜 |

See [`PLAN.md`](./PLAN.md) for full descriptions and done-when criteria.
