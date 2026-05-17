# OGCA Reference Application — Task Tracking

Task list maintained per-phase during implementation. See `PLAN.md` Agent Instructions
for format rules and commit discipline.

---

## Phase 1 — Foundation

**Status: Complete**

### Monorepo scaffold
- [x] Create `reference-app/package.json` (pnpm workspace root with Turborepo)
- [x] Create `reference-app/pnpm-workspace.yaml`
- [x] Create `reference-app/turbo.json`
- [x] Create `reference-app/.gitignore`
- [x] Create `reference-app/.npmrc`

### packages/fhir-client
- [x] Scaffold `packages/fhir-client/package.json`
- [x] Scaffold `packages/fhir-client/tsconfig.json`
- [x] Implement typed fetch wrapper (`src/client.ts`) — imports from local `src/schemas.ts`
- [x] Implement FHIR proxy Next.js route template (`src/proxy.ts`)
- [x] Export barrel (`src/index.ts`)

### packages/cds-hooks (stub)
- [x] Scaffold `packages/cds-hooks/package.json`
- [x] Create stub `src/index.ts` with type exports

### packages/cql-engine (stub)
- [x] Scaffold `packages/cql-engine/package.json`
- [x] Create stub `src/index.ts` with `CqlEngine` interface

### packages/smart-auth (stub)
- [x] Scaffold `packages/smart-auth/package.json`
- [x] Create stub `src/index.ts`

### packages/ui (stub)
- [x] Scaffold `packages/ui/package.json`
- [x] Create stub `src/index.ts` with placeholder component

### apps/ehr
- [x] Scaffold Next.js 14 app at `apps/ehr` (App Router, Tailwind) — Next.js 16 installed
- [x] Configure `next.config.ts` with port 4000 and `output: standalone`
- [x] Add `@ogca/fhir-client` workspace dependency
- [x] Implement `/api/fhir/[...path]` proxy route
- [x] Implement patient chart page (`/patients/[id]`): Demographics, Problem List, Observations
- [x] Implement home page with link to Jane Smith's chart

### apps/smart-app (stub)
- [x] Scaffold Next.js app at `apps/smart-app` with placeholder landing page (port 4001)

### apps/crd-service (stub)
- [x] Scaffold Next.js app at `apps/crd-service` with placeholder landing page (port 4002)

### apps/dtr-client (stub)
- [x] Scaffold Next.js app at `apps/dtr-client` with placeholder landing page (port 4003)

### apps/pas-service (stub)
- [x] Scaffold Next.js app at `apps/pas-service` with placeholder landing page (port 4004)

### apps/payer-backend (stub)
- [x] Scaffold Next.js app at `apps/payer-backend` with placeholder landing page (port 4005)

### Docker Compose
- [x] Create `reference-app/docker-compose.yml` with HAPI FHIR + all 6 apps
- [x] Create `.env.example` at monorepo root
- [x] Create per-app `.env.local.example` for `FHIR_BASE_URL` (ehr only; others inherit defaults)

### Patient Fixtures
- [x] Create `reference-app/fixtures/jane-smith-bundle.json` FHIR Bundle with:
  - [x] Patient — Jane Smith
  - [x] Condition — breast cancer (primary, SNOMED + ICD-10-CM coded)
  - [x] Observation — cancer stage (Stage IIIA, LOINC 21908-9)
  - [x] Observation — ECOG Performance Status (PS 1, LOINC 89247-1)
  - [x] Observation — line of therapy (first-line, SNOMED)
  - [x] Observation — prior therapy (none, SNOMED)
  - [x] HER2 Observation intentionally omitted
- [x] Create `reference-app/fixtures/load-fixtures.sh` script to POST bundle to HAPI

### Notes
- `@reasonhealth/fhir-zod@1.0.4` (npm) has TS7022/TS2457 bugs; fix is in PR #2 of
  fhir-types-workspace but not yet released. `packages/fhir-client` uses hand-crafted
  Zod schemas in `src/schemas.ts` for Phase 1. Switch to `@reasonhealth/fhir-zod` once
  a fixed version is published.
- Next.js 16.2.6 installed (PLAN referenced v14 but v16 is the current release; App
  Router is available and behaves identically for our purposes).
- `turbopack.root` pinned in all `next.config.ts` files to suppress workspace-root
  inference warning.
- Done-when verified: HAPI running → fixtures loaded → EHR dev server at :4000 → Jane
  Smith chart renders Demographics, Problem List, Observations from HAPI via proxy.
