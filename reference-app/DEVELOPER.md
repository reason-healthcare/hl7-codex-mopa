# Developer Guide

---

## Architecture

```
reference-app/
├── apps/
│   ├── ehr/              :4001  Oncology EHR — patient chart, order entry, SMART host
│   ├── crd-service/      :4003  CRD Service — CDS Hooks server, Library host
│   ├── dtr-client/       :4004  DTR Client — questionnaire, prepopulation, QR persistence
│   ├── pas-service/      :4005  PAS Service — $submit, routing, ClaimResponse
│   └── payer-backend/    :4006  Payer Backend — TypeScript policy evaluation, determination
└── packages/
    ├── fhir-client/      fhir-kit-client re-export + fhir-zod schemas + proxy handler
    ├── cds-hooks/        CDS Hooks types, discovery, request/response helpers
    ├── cql-engine/       CqlEngine interface + cql-execution adapter + ELM compat patches
    ├── knowledge-artifacts/  FHIR Library + PlanDefinition resources, condition registry
    ├── oncology-policy/  Shared terminology, FHIR queries, coverage eval, regimen definitions
    ├── smart-auth/       SMART on FHIR OAuth (EHR launch, PKCE, token cookies)
    └── ui/               Shared Tailwind components
```

### FHIR client pattern

Transport and validation are separated using
[`fhir-kit-client`](https://github.com/Vermonster/fhir-kit-client) and
[`@reasonhealth/fhir-zod`](https://github.com/reason-healthcare/fhir-types-workspace):

```ts
import { Client, PatientSchema, BundleSchema, ConditionSchema } from "@mopa/fhir-client";

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
pnpm --filter @mopa/ehr dev
pnpm --filter @mopa/crd-service build
pnpm --filter @mopa/cql-engine test
```

---

## Environment variables

Each app has a `.env.local` file. Copy `.env.example` (when present) and adjust.

For the supported external CRD, DTR, and PAS integration points, endpoint
suffixes, and a Connectathon Docker Compose workflow, see
[CONNECTATHON.md](./CONNECTATHON.md).

| Variable | Default | Used by |
|---|---|---|
| `SMART_AUTH_BYPASS` | `true` | all apps — skip SMART OAuth for local dev |
| `SMART_JWT_SECRET` | `mopa-dev-secret-…` | EHR — HS256 token signing key |
| `FHIR_BASE_URL` | `http://localhost:8080/fhir` | EHR — upstream HAPI base URL |
| `NEXT_PUBLIC_CRD_SERVICE_URL` | `http://localhost:4003` | EHR |
| `NEXT_PUBLIC_EHR_BASE_URL` | `http://localhost:4001` | dtr-client |
| `DTR_CLIENT_URL` | `http://localhost:4004` | CRD Service |
| `EHR_FHIR_BASE_URL` | `http://localhost:4001/api/fhir` | dtr-client, payer-backend |
| `PAS_SERVICE_URL` | `http://localhost:4005` | EHR |
| `PAYER_BACKEND_URL` | `http://localhost:4006` | PAS Service |

---

## Shared packages

### `@mopa/fhir-client`

Re-exports `fhir-kit-client`'s `Client` and `@reasonhealth/fhir-zod/r4` schemas as
the single FHIR import point across the monorepo. Also exports `fhirProxyHandler` for
the Next.js catch-all proxy route and patient display helpers.

> **`BundleSchema` note:** uses a local passthrough schema (`z.record(z.unknown())`)
> for `entry[].resource` instead of fhir-zod's generated one, which strips
> `resourceType` via the abstract `Resource` base type.

### `@mopa/cds-hooks`

CDS Hooks request/response types, discovery helpers, and Zod schemas for runtime
validation at the CRD Service API boundary.

### `@mopa/cql-engine`

`CqlEngine` interface and `CqlExecutionEngine` adapter backed by `cql-execution`.
ELM JSON is compiled at author-time using `rh cql compile` and committed to
`cql/elm/`. Both the CRD Service and Payer Backend load ELM via `require()` so
Next.js bundles it with no `__dirname` issues.

The engine includes a `patchElmCompatibility` function that fixes ELM differences
between `rh` v0.2.x and `cql-execution` v3.x at runtime:
- `First`/`Last` elements: rh emits `operand`, cql-execution expects `source`
- `Property` elements referencing query aliases: rh emits `source=ExpressionRef`,
  cql-execution needs `scope` for FHIR choice-type resolution (e.g.,
  `Observation.value` → `valueCodeableConcept` / `valueInteger`)

A `FHIRHelpers.cql` library is committed to `cql/` and its compiled ELM to
`cql/elm/` so that `rh cql compile` can resolve the `include FHIRHelpers`
declaration. CQL that accesses FHIR primitive values (e.g., `O.value.coding`
where `C.code.value` extracts the string from a FHIR.Coding) must use the
`.value` property accessor pattern compatible with cql-execution's FHIR model
info resolution.

### `@mopa/knowledge-artifacts`

FHIR Library and PlanDefinition resources for the MOPA workflow. Includes the
breast cancer guideline and payer policy libraries, regimen PlanDefinitions
(TH, PHD, ddAC→T with pegfilgrastim), the condition registry for CRD routing,
and the registered-workflows catalog used by the Hub content viewer.

### `@mopa/oncology-policy`

Shared terminology constants, FHIR query templates, coverage evaluation helpers,
and regimen definitions used by both the CRD Service and Payer Backend. The
regimen definitions include biosimilar/step-therapy alternatives (e.g.,
pegfilgrastim → pegfilgrastim-cbqv/Udenyca).

### `@mopa/smart-auth`

SMART on FHIR authorization code flow with PKCE. The EHR acts as the authorization
server (issues tokens); apps use `SMART_AUTH_BYPASS=true` in `.env.local` for
development without real OAuth round-trips.

### `@mopa/ui`

Shared Tailwind components (`PatientBanner`). Extended throughout phases.

---

## Fixture helpers

```bash
bash fixtures/load-fixtures.sh          # load all four demo patients (idempotent)
bash fixtures/add-her2.sh               # add IHC 3+ HER2 Observation for Jane Smith
bash fixtures/remove-her2.sh            # remove HER2 (reset to gap state)

# Load into a non-default FHIR server
bash fixtures/load-fixtures.sh https://my-server.example.com/fhir
```

### Demo patients

| Patient | MRN | Key clinical profile |
|---|---|---|
| Jane Smith | MRN-001 | Stage IIIA, HER2+, ECOG 0 |
| Maria Garcia | MRN-002 | Stage IIIA, HER2+, ECOG 1 |
| Sandra Chen | MRN-003 | Stage IIIA, HER2 absent, ECOG 1 |
| Katherine Johnson | MRN-004 | ER+, HER2- (IHC 1+), Stage IIA, post-menopausal, OncotypeDX 28 — CodeX PA in MedOnc POC base case |

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
| 6 | DTR Client | ✅ Complete |
| 7 | PAS Service + Payer Backend | ✅ Complete |
| 8 | Integration, Polish, Docs | 🔜 |

See [`PLAN.md`](./PLAN.md) for full descriptions and done-when criteria.
