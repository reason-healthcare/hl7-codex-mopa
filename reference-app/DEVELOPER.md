# Developer Guide

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

To run a single app or package:

```bash
pnpm --filter @ogca/ehr dev
pnpm --filter @ogca/crd-service build
pnpm --filter @ogca/cql-engine test
```

---

## Environment variables

Each app has a `.env.local` file. Copy `.env.example` (when present) and adjust.

| Variable | Default | Used by |
|---|---|---|
| `SMART_AUTH_BYPASS` | `true` | all apps — skip SMART OAuth for local dev |
| `SMART_JWT_SECRET` | `ogca-dev-secret-…` | EHR — HS256 token signing key |
| `FHIR_BASE_URL` | `http://localhost:8080/fhir` | EHR — upstream HAPI base URL |
| `NEXT_PUBLIC_CRD_SERVICE_URL` | `http://localhost:4002` | EHR, smart-app |
| `NEXT_PUBLIC_EHR_BASE_URL` | `http://localhost:4000` | smart-app, dtr-client |
| `DTR_CLIENT_URL` | `http://localhost:4003` | CRD Service |
| `EHR_FHIR_BASE_URL` | `http://localhost:4000/api/fhir` | dtr-client, payer-backend |
| `PAS_SERVICE_URL` | `http://localhost:4004` | EHR |
| `PAYER_BACKEND_URL` | `http://localhost:4005` | PAS Service |

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
| FHIR server | [HAPI FHIR](https://hapifhir.io) (Docker) |
| Orchestration | Docker Compose |

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
