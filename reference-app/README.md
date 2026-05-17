# OGCA Reference Application

A runnable, demo-quality reference implementation of the **Oncology Guideline-Compliant
Authorization (OGCA)** workflow. Six actors are modelled as independent Next.js
applications sharing common packages in a Turborepo + pnpm monorepo.

> **Status:** Phase 1 complete — EHR reads Jane Smith's chart from HAPI FHIR.
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
│   └── payer-backend/    :4005  Payer Backend — policy evaluation, determination
└── packages/
    ├── fhir-client/      fhir-kit-client re-export + fhir-zod schemas + proxy handler
    ├── cds-hooks/        CDS Hooks types (Phase 2)
    ├── cql-engine/       CqlEngine interface + cql-execution adapter (Phase 3)
    ├── smart-auth/       SMART on FHIR OAuth flow (Phase 4)
    └── ui/               Shared Tailwind components
```

### FHIR client pattern

Transport and validation are cleanly separated using
[`fhir-kit-client`](https://github.com/Vermonster/fhir-kit-client) and
[`@reasonhealth/fhir-zod`](https://github.com/reason-healthcare/fhir-types-workspace):

```ts
import { Client, PatientSchema, BundleSchema, ConditionSchema } from "@ogca/fhir-client";

const client = new Client({ baseUrl: process.env.FHIR_BASE_URL });

// Read — fhir-kit-client fetches, Zod validates
const patient = PatientSchema.parse(
  await client.read({ resourceType: "Patient", id })
);

// Search — passthrough BundleSchema preserves resourceType on entries
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
upstream FHIR server at `FHIR_BASE_URL`. Client-side code uses the local proxy;
server components call the FHIR server directly.

```
GET /api/fhir/Patient/jane-smith  →  GET http://localhost:8080/fhir/Patient/jane-smith
```

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 20 |
| pnpm | ≥ 9 |
| Docker | any recent version |

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

Loads a FHIR transaction bundle containing Jane Smith's chart:

| Resource | ID | Notes |
|---|---|---|
| Patient | `jane-smith` | DOB 1972-04-15, MRN-001 |
| Condition | `jane-smith-breast-cancer` | Primary breast cancer (SNOMED + ICD-10-CM) |
| Observation | `jane-smith-cancer-stage` | Stage IIIA (LOINC 21908-9) |
| Observation | `jane-smith-ecog-ps` | ECOG PS 1 (LOINC 89247-1) |
| Observation | `jane-smith-line-of-therapy` | First-line |
| Observation | `jane-smith-prior-therapy` | None (treatment-naïve) |

> **HER2 is intentionally absent.** Its absence triggers the DTR/gap-analysis
> flow in Phase 5+. Add it manually to exercise the pre-approved CRD path.

### 4. Start the EHR

```bash
cd apps/ehr
pnpm dev          # → http://localhost:4000
```

Open [http://localhost:4000](http://localhost:4000) → click **Open Chart** →
Jane Smith's Demographics, Problem List, and Observations are fetched live from HAPI.

---

## All apps at once (Docker Compose)

```bash
docker compose up
```

All six apps and HAPI start together. Apps are pre-built into standalone Next.js
output inside their Docker images.

```
http://localhost:4000  EHR
http://localhost:4001  CDS SMART App  (stub)
http://localhost:4002  CRD Service    (stub)
http://localhost:4003  DTR Client     (stub)
http://localhost:4004  PAS Service    (stub)
http://localhost:4005  Payer Backend  (stub)
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

To run a single app:

```bash
pnpm --filter @ogca/ehr dev
pnpm --filter @ogca/crd-service build
```

---

## Environment variables

Copy `.env.example` to `.env.local` inside each app directory and adjust as needed.

| Variable | Default | Description |
|---|---|---|
| `FHIR_BASE_URL` | `http://localhost:8080/fhir` | Upstream FHIR server base URL |
| `JANE_SMITH_PATIENT_ID` | `jane-smith` | Fixture patient id used on the EHR home page |
| `SMART_AUTH_BYPASS` | `true` | Skip SMART OAuth (Phases 1–3). Set `false` in Phase 4+ |

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
| CQL runtime (Phase 3) | `cql-execution` + `cql-fhir-data-provider` |
| Lint + format | [Biome](https://biomejs.dev) |
| Tests | [Vitest](https://vitest.dev) |
| FHIR server | [HAPI FHIR](https://hapifhir.io) (Docker) |
| Orchestration | Docker Compose |

---

## Shared packages

### `@ogca/fhir-client`

Re-exports `fhir-kit-client`'s `Client` and `@reasonhealth/fhir-zod/r4` schemas as
the single FHIR import point across the monorepo. Also exports `fhirProxyHandler` for
wiring up the Next.js catch-all proxy route, and patient display helpers.

```ts
import { Client, PatientSchema, BundleSchema, fhirProxyHandler } from "@ogca/fhir-client";
```

> **Note on `BundleSchema`:** a local passthrough schema is used instead of
> fhir-zod's generated one. fhir-zod types `Bundle.entry[].resource` as the
> abstract `Resource` base — which strips `resourceType` during Zod parsing.
> The local schema uses `z.record(z.unknown())` for the resource field so
> `resourceType` is preserved for downstream filtering.

### `@ogca/cds-hooks`

CDS Hooks request/response types. Fully implemented in Phase 2.

### `@ogca/cql-engine`

`CqlEngine` interface and provider adapter. Implemented in Phase 3.

### `@ogca/smart-auth`

SMART on FHIR authorization code flow, PKCE, token storage. Implemented in Phase 4.

### `@ogca/ui`

Shared Tailwind components (`PatientBanner`, PA form shell). Extended throughout phases.

---

## Fixture patient — Jane Smith

The fixture bundle (`fixtures/jane-smith-bundle.json`) is a FHIR transaction that can
be loaded into any R4-compatible server.

```bash
# Load into a non-default server
bash fixtures/load-fixtures.sh https://my-server.example.com/fhir
```

The bundle uses `PUT` (conditional) entries so it is idempotent — safe to run multiple times.

---

## Implementation phases

| Phase | Title | Status |
|---|---|---|
| 1 | Foundation — monorepo, FHIR proxy, Jane Smith chart | ✅ Complete |
| 2 | CRD Service + EHR Order Entry | 🔜 |
| 3 | CQL Guideline + Payer Policy | 🔜 |
| 4 | SMART OAuth | 🔜 |
| 5 | CDS SMART App (Layer 1) | 🔜 |
| 6 | DTR Client | 🔜 |
| 7 | PAS Service + Payer Backend | 🔜 |
| 8 | Integration, Polish, Docs | 🔜 |

See [`PLAN.md`](./PLAN.md) for full descriptions and done-when criteria.
