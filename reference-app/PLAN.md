# MOPA Reference Application — Phased Implementation Plan

## Overview

A monorepo reference implementation demonstrating the complete MOPA workflow across six
actors. Each actor is a separate Next.js application sharing common packages. The goal is a
runnable, demo-quality reference that exercises every interface defined in the IG.

---

## Agent Instructions

> **These instructions apply to any AI agent implementing this plan.**

### Task Tracking

Before beginning work on any phase, create or update `reference-app/TASKS.md` with a
detailed task list for that phase. Tasks must be granular enough that each one represents
a discrete, verifiable unit of work (a file created, a route implemented, a test passing,
a config entry added). Do not batch unrelated work into a single task.

**Task list format:**

```markdown
## Phase N — <Phase Title>

### <Sub-area> (e.g. package name, app name, config)
- [ ] Task description
- [ ] Task description
- [x] Completed task
```

**Rules:**
- Mark tasks `[x]` as they are completed — do not remove completed tasks
- If a task reveals sub-tasks during implementation, add them inline beneath it
- If a task is blocked or deferred, annotate it: `- [ ] Task _(blocked: reason)_`
- Add a `### Notes` section to each phase for decisions, deviations, or discoveries
  made during implementation
- When a phase is fully complete, add a `**Status: Complete**` line at the top of
  that phase section

### Before Starting Each Phase

1. Read the full phase description in this PLAN.md
2. Read the current `TASKS.md` to understand completed work
3. Expand the phase into granular tasks in `TASKS.md` before writing any code
4. Confirm the "Done when" criterion is testable as written — if not, clarify it in
   the `### Notes` section before proceeding

### Commit Discipline

- Commit at logical checkpoints (a package scaffold, a working route, a passing test)
- Commit messages reference the phase: `Phase 1: scaffold monorepo with Turborepo`
- Push to `origin/ig` after each commit; merge to `origin/main` at phase completion

---

## Architecture

### Monorepo (Turborepo + pnpm)

```
reference-app/
├── apps/
│   ├── ehr/              # Oncology EHR — patient chart, ordering UI, SMART launch host
│   ├── smart-app/        # Layer 1 CDS SMART App — gap analysis, regimen options
│   ├── crd-service/      # CRD Service — CDS Hooks server, Library host
│   ├── dtr-client/       # DTR Client — questionnaire, prepopulation, QR persistence
│   ├── pas-service/      # PAS Service — $submit, routing, ClaimResponse
│   └── payer-backend/    # Payer Backend — policy evaluation, determination
└── packages/
    ├── fhir-client/      # Typed FHIR R4 client + FHIR proxy utility
    ├── cds-hooks/        # CDS Hooks types, discovery, request/response helpers
    ├── cql-engine/       # cql-execution wrapper + FHIR data provider
    ├── smart-auth/       # SMART on FHIR OAuth flow (EHR launch + standalone)
    └── ui/               # Shared Tailwind/shadcn components (EHR chrome, PA form shell)
```

### FHIR Proxy Pattern

Every app exposes `/api/fhir/[...path]` routes that proxy to a configured upstream FHIR
server. The upstream base URL is an environment variable — any FHIR R4 server works. Custom
operations and prototype-specific overrides are intercepted before proxying.

### CQL Execution

CQL is compiled to ELM JSON using the `rh` CLI (`rh cql compile`) from the
[Reason Health Rust toolkit](https://github.com/reason-healthcare/rh). This eliminates
the Java CQL-to-ELM toolchain dependency entirely. The `rh` binary is available as:

- Pre-built binaries for macOS (ARM + Intel), Linux (static musl), Windows
- Docker image: `ghcr.io/reason-healthcare/rh:latest` (included in Docker Compose)

Compiled ELM JSON is committed to the repo.

#### CQL Evaluation — Two-Stage Strategy

The `cql-engine` shared package exposes a stable provider interface so the underlying
evaluation engine can be swapped without touching application code:

```ts
// packages/cql-engine/src/index.ts
export interface CqlEngine {
  evaluate(elm: ElmJson, context: FhirContext, expression: string): CqlResult
}
```

**Stage 1 (Phase 3) — `cql-execution` npm:**  
Initial implementation uses the `cql-execution` + `cql-fhir-data-provider` npm packages.
This is a known path, works today, and unblocks the CRD Service and CDS SMART App.

**Stage 2 (Phase 3+ iteration) — `rh-cql` WASM:**  
`rh-cql` already implements a pure Rust ELM evaluator (`evaluate_elm`,
`evaluate_elm_with_trace`). Compiling it to WebAssembly via `wasm-pack` produces a WASM
module that runs natively in both Node.js and the browser — no subprocess, no npm
dependency on `cql-execution`. The reference app is a direct driver for this work:

- The `CqlEngine` interface is already defined — swapping the implementation is a
  single-package change with no application-level impact
- Running CQL evaluation in the browser (CDS SMART App) becomes possible without a
  server round-trip
- Advances `rh-cql` WASM support as a maintained side effect, benefiting the broader
  toolkit

```bash
# Compile CQL to ELM JSON (dev/build time via rh binary or Docker)
rh cql compile BreastCancerGuideline.cql --output BreastCancerGuideline.elm.json
rh cql compile BreastCancerPayerPolicy.cql --output BreastCancerPayerPolicy.elm.json
```

---

## Technology Stack

| Concern | Choice |
|---|---|
| Monorepo | Turborepo + pnpm |
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind + shadcn/ui |
| FHIR types + validation | `@reasonhealth/fhir-zod/r4` — Zod schemas with inferred TypeScript types; replaces `@types/fhir` and standalone Zod FHIR schemas |
| CQL compile | `rh cql compile` (Reason Health Rust CLI, no Java required) |
| CQL runtime (Stage 1) | `cql-execution` + `cql-fhir-data-provider` (Phase 3 initial) |
| CQL runtime (Stage 2) | `rh-cql` compiled to WASM via `wasm-pack` (Phase 3+ iteration) |
| OAuth | Custom SMART on FHIR (NextAuth.js as base) |
| FHIR server | HAPI FHIR (Docker) — swappable via env var |
| Orchestration | Docker Compose |

### `@reasonhealth/fhir-zod` notes

Provides Zod schemas for FHIR R4/R4B/R5 with inferred TypeScript types. The `fhir-client`
shared package re-exports from `@reasonhealth/fhir-zod/r4` as the single import point
across the monorepo. All FHIR server responses are parsed through Zod schemas at the proxy
boundary.

```ts
import { PatientSchema, ObservationSchema } from '@reasonhealth/fhir-zod/r4'
import type { Patient, Observation } from '@reasonhealth/fhir-zod/r4'

// Runtime validation at proxy boundary
const patient = PatientSchema.parse(rawJson)
```

---

## Guideline and Payer Policy

Two separate `Library` resources containing CQL compiled to ELM JSON, hosted on the CRD
Service.

### Guideline Library — `BreastCancerGuideline.cql`
- **Input:** cancer type, stage, biomarkers, ECOG PS, line of therapy, prior therapy
- **Output:** set of approvable regimens with rationale
- **Used by:** CDS SMART App (Layer 1 regimen options) and CRD Service (pre-approval)

### Payer Policy Library — `BreastCancerPayerPolicy.cql`
- **Input:** same clinical context + submitted regimen
- **Output:** `approved` / `pending` / `denied` + reason code
- **Used by:** CRD Service (pre-approval evaluation) and Payer Backend (PA adjudication)

The `OncologyDataRequirementsLibrary` from the IG defines the required data elements.
These CQL Libraries define the rules evaluated over those elements.

---

## Local Ports

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

## Phased Plan

### Phase 1 — Foundation
**Goal:** Everything runs locally, FHIR data is accessible, proxy works.

- Turborepo + pnpm scaffold: all 6 apps + all packages stubbed
- Docker Compose: HAPI FHIR + all 6 apps
- `fhir-client` package: typed fetch wrapper using `@reasonhealth/fhir-zod/r4`, proxy
  route template (`/api/fhir/[...path]`)
- Patient fixtures loaded into HAPI: Jane Smith with breast cancer condition, staging,
  ECOG PS, line of therapy, prior therapy; HER2 intentionally absent
- EHR app: read-only patient chart (Demographics, Problem List, Observations) confirming
  FHIR proxy works
- All other apps: placeholder landing page

**Done when:** `docker compose up` → browse EHR → see Jane Smith's chart pulling from HAPI.

---

### Phase 2 — CRD Service + EHR Order Entry
**Goal:** End-to-end Layer 2 loop fires and returns a card. No CQL, no auth.

- `cds-hooks` package: discovery types, request/response types, prefetch executor
- CRD Service:
  - `GET /cds-services` — discovery with prefetch templates + MOPA extension
  - `POST /cds-services/oncology-crd` — order-select and order-sign handler
  - `GET /Library/BreastCancerPADataRequirements` — Library resource endpoint
  - Hardcoded completeness check (checks prefetch keys populated, no CQL yet)
  - Returns pre-approved card or DTR launch card
- EHR app:
  - Order Entry page: regimen selector (TH / ddAC→T / PHD)
  - Fires `order-select` with prefetch on selection, displays returned card inline
  - Sign button fires `order-sign`

**Done when:** Select TH regimen → order-select → DTR card (HER2 missing). Add HER2 to
HAPI manually → order-select → pre-approved card.

---

### Phase 3 — CQL Guideline + Payer Policy
**Goal:** Rules are computable, not hardcoded.

- Author `BreastCancerGuideline.cql` and `BreastCancerPayerPolicy.cql`
- Compile both to ELM JSON using `rh cql compile` and commit
- `cql-engine` package: implement `CqlEngine` interface backed by `cql-execution` npm
- CRD Service: replace hardcoded checks with CQL evaluation via `cql-engine`
- Library resources updated to include ELM JSON
- **Iteration:** once CQL evaluation is proven, swap `cql-execution` for `rh-cql` WASM
  module — no application code changes required due to the `CqlEngine` interface

**Done when:** Change HER2 to negative in HAPI → CRD correctly denies. Change back to
positive → CRD approves. Logic is fully driven by CQL.

---

### Phase 4 — SMART OAuth
**Goal:** Real SMART on FHIR auth for all SMART app launches.

- `smart-auth` package: authorization code flow, PKCE, token storage, scopes
- EHR app acts as SMART authorization server:
  - `/.well-known/smart-configuration`
  - `/authorize` and `/token` endpoints
  - Issues launch tokens, enforces patient-scoped access
- CDS SMART App: EHR launch + standalone launch support
- DTR Client: EHR launch with `appContext`
- All FHIR proxy routes: validate bearer token before proxying
- `SMART_AUTH_BYPASS=true` env flag retained for Phases 1–3 compatibility

**Done when:** "Launch CDS App" in EHR → real OAuth redirect → token issued → SMART app
queries FHIR with scoped token.

---

### Phase 5 — CDS SMART App (Layer 1)
**Goal:** Full Layer 1 workflow functional.

- EHR launch → read primary cancer condition → fetch Library → parallel DataRequirement
  queries
- Gap analysis UI: present/missing table per DataRequirement
- Missing item input: inline form, HER2 selector for demo case
- Conditional `POST /Observation` write-back:
  - Write-back supported: persists Observation; subsequent order-select prefetch finds it
  - Write-back not supported: holds in session; serves as DTR questionnaire pre-fill
- Regimen options: CQL guideline evaluation → approvable regimen table
- Provider selects regimen → deep-link to EHR order-set

**Done when:** Launch CDS App from Jane Smith chart → gap shows HER2 missing → enter IHC
3+ → write-back → regimen options appear → select TH → lands in EHR order entry.

---

### Phase 6 — DTR Client
**Goal:** DTR round-trip closes the incomplete-context path.

- Receives SMART EHR launch with `appContext` (Library canonical + missing requirements)
- Questionnaire generation: constructs `Questionnaire` from Library `DataRequirement[]`
  for missing items only
- CQL-driven prepopulation for items already present in FHIR server
- Renders only genuinely missing questions (HER2 in demo case)
- On submit: saves `QuestionnaireResponse` to EHR FHIR server, posts feedback to CRD
- EHR: on DTR completion re-triggers order-select (or enables sign)

**Done when:** CRD returns DTR card → launch DTR → HER2 question → submit → QR saved →
EHR re-evaluates → pre-approved.

---

### Phase 7 — PAS Service + Payer Backend
**Goal:** PA-required path produces a structured determination.

- PAS Service:
  - `POST /fhir/$submit` — validates PA Bundle, routes to Payer Backend
  - Returns `ClaimResponse` to EHR
- Payer Backend:
  - CQL policy evaluation (reuses `cql-engine` package)
  - Returns approved / pended / denied with reason
- CRD Service: PA-required card includes link to trigger PAS submission
- EHR: PA submission UI showing ClaimResponse determination

**Done when:** CRD returns PA-required card → submit → Payer Backend evaluates CQL →
ClaimResponse returned with approval.

---

### Phase 8 — Integration, Polish, Docs
**Goal:** Demo-ready reference implementation.

- Full scenario scripted end-to-end: Jane Smith, TH regimen, all three paths:
  1. Happy path (all context present → pre-approved at order-select)
  2. DTR path (HER2 missing → DTR → complete → pre-approved at order-sign)
  3. PAS path (PA required → submit → payer determination)
- EHR UI polish: patient banner, nav, PA form shell
- Docker Compose profiles: `dev` (hot reload) and `demo` (production build)
- `.env.example` per app
- README: architecture diagram, setup steps, scenario walkthrough
- Automated smoke test: hits each service's key endpoint in sequence

---

## Open Questions

1. **FHIR server** — use HAPI Docker for all phases, or is there an existing server to
   point at for early phases?
2. **CQL authoring** — draft CQL for review, or will CQL be authored separately?
3. **Auth bypass** — confirm `SMART_AUTH_BYPASS=true` env flag acceptable for Phases 1–3?
4. **EHR chrome** — establish patient banner + nav in Phase 1, or minimal read-only chart
   is sufficient?
5. **DTR/PAS** — build minimal shims or wrap existing Da Vinci reference implementations?

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| CQL-to-ELM requires Java toolchain | Use `rh cql compile` (Rust binary) — no JVM needed; Docker image available for CI |
| `cql-execution` npm coverage gaps | `CqlEngine` interface isolates the dependency; swap for `rh-cql` WASM when ready |
| SMART auth is complex | Phase 4 is self-contained; `SMART_AUTH_BYPASS` flag for earlier phases |
| DTR Questionnaire generation is underspecified | Start with static Questionnaire derived from Library; dynamic generation in Phase 8 |
| Da Vinci PAS Bundle structure is complex | Stub with simplified Bundle in Phase 7; align to full spec in Phase 8 |
| HAPI is heavyweight for local dev | Provide lightweight in-memory fixture server as alternative for Phases 1–3 |
