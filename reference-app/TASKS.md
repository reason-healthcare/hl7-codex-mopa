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

---

## Phase 2 — CRD Service + EHR Order Entry

**Status: Complete**

### packages/cds-hooks
- [x] Basic type stubs exist from Phase 1
- [x] Expand `CdsService` with OGCA extension fields (`libraryUrl`, `willUpdateOrders`)
- [x] Add `CdsContext` typed interfaces: `OrderSelectContext`, `OrderSignContext`
- [x] Add Zod schemas: `CdsRequestSchema`, `CdsResponseSchema` for runtime validation
- [x] Add `resolvePrefetch(templates, fhirBase, context)` helper — substitutes `{{context.X}}` placeholders and fetches each template against the FHIR server
- [x] Export all types + helpers from barrel `src/index.ts`
- [x] Add `vitest.config.ts` and `test` script to `package.json`
- [x] Tests: prefetch template substitution (unit), request/response Zod parsing

### apps/crd-service — dependencies + proxy
- [x] Add `@ogca/cds-hooks` and `@ogca/fhir-client` to `package.json`
- [x] Wire `/api/fhir/[...path]` proxy route (same pattern as EHR)
- [x] Update landing page to show service status + discovery URL

### apps/crd-service — GET /api/cds-services
- [x] Implement discovery route returning one service: `oncology-crd`
- [x] Service descriptor: hooks `order-select` + `order-sign`, prefetch templates for patient, HER2 Observation, Conditions
- [x] Include OGCA extension: `libraryUrl` pointing to `BreastCancerPADataRequirements`

### apps/crd-service — POST /api/cds-services/oncology-crd
- [x] Parse and validate incoming `CdsRequest` with Zod
- [x] Execute missing prefetch keys via `resolvePrefetch` if not provided by EHR
- [x] Hardcoded completeness check: inspect prefetch for HER2 Observation entry
- [x] Pre-approved path: HER2 present → return `info` card "Regimen pre-approved"
- [x] DTR path: HER2 absent → return `warning` card with SMART app link to DTR client and `appContext` containing Library canonical URL
- [x] Handle both `order-select` and `order-sign` hook names

### apps/crd-service — GET /api/Library/BreastCancerPADataRequirements
- [x] Return a static FHIR `Library` resource
- [x] `dataRequirement[]` entries: Patient demographics, primary cancer Condition, HER2 Observation, cancer stage Observation, ECOG PS Observation, line of therapy Observation
- [x] Set canonical URL used in DTR `appContext`

### apps/crd-service — tests
- [x] Add `vitest.config.ts` and `test` script
- [x] Unit test: completeness check logic (HER2 present → approved, absent → DTR card)
- [x] Unit test: `GET /api/cds-services` discovery shape
- [x] Unit test: `Library` resource structure and required data elements

### apps/ehr — Order Entry page
- [x] New page `/patients/[id]/orders` — order entry with link from chart page
- [x] Regimen selector: TH (Trastuzumab + Paclitaxel), ddAC→T (dose-dense AC → Taxol), PHD (Pertuzumab + Trastuzumab + Docetaxel)
- [x] On regimen selection: construct draft `MedicationRequest` FHIR resource
- [x] Client-side `POST` to CRD service `order-select` with prefetch bundle
- [x] Inline card display: render returned `CdsCard` with indicator colour, summary, detail, and links
- [x] "Sign Order" button: fires `order-sign` to CRD service, shows updated card
- [x] Loading and error states

### apps/ehr — fixtures for HER2 add/remove
- [x] Add `fixtures/add-her2.sh` — POSTs HER2-positive Observation to HAPI (exercises pre-approved path)
- [x] Add `fixtures/remove-her2.sh` — DELETEs the HER2 Observation (resets to DTR path)

### Notes
- HAPI FHIR's async search indexer may take ~10s after a PUT before token-based searches reflect the new resource. The `add-her2.sh` script is idempotent and safe to re-run. In practice, selecting a regimen in the EHR naturally happens after the indexing window.
- `_sort=-date` was removed from prefetch templates; it triggered HAPI's sort-index build path which has a longer async delay. Existence check (`_count=1`) is sufficient for Phase 2.
- The `resolvePrefetch` fetch is non-fatal: if a key fails, it's treated as absent (missing data element) and DTR card is returned. fix is in PR #2 of
  fhir-types-workspace but not yet released. `packages/fhir-client` uses hand-crafted
  Zod schemas in `src/schemas.ts` for Phase 1. Switch to `@reasonhealth/fhir-zod` once
  a fixed version is published.
- Next.js 16.2.6 installed (PLAN referenced v14 but v16 is the current release; App
  Router is available and behaves identically for our purposes).
- `turbopack.root` pinned in all `next.config.ts` files to suppress workspace-root
  inference warning.
- Done-when verified: HAPI running → fixtures loaded → EHR dev server at :4000 → Jane
  Smith chart renders Demographics, Problem List, Observations from HAPI via proxy.

---

## Phase 3 — CQL Guideline + Payer Policy

### CQL authoring
- [x] Create `cql/` directory at monorepo root
- [x] Author `cql/BreastCancerPayerPolicy.cql` — inputs: HER2 Observations, CancerStage Observations, EcogPS Observations retrieved from FHIR; outputs: `AllDataPresent` (Boolean), `MissingElements` (List<String>), `PAResult` ('approved'|'dtr-required')
- [x] Author `cql/BreastCancerGuideline.cql` — inputs: same clinical context; outputs: `TH_Eligible`, `PHD_Eligible`, `ddACT_Eligible` (Boolean), `ApprovableRegimens` (List<String>)
- [x] Compile `BreastCancerPayerPolicy.cql` → `cql/elm/BreastCancerPayerPolicy.elm.json` via `rh cql compile`
- [x] Compile `BreastCancerGuideline.cql` → `cql/elm/BreastCancerGuideline.elm.json` via `rh cql compile`
- [x] Commit both ELM JSON files

### packages/cql-engine
- [x] Add `cql-execution` and `cql-fhir-data-provider` npm dependencies
- [x] Implement `CqlExecutionEngine` class satisfying `CqlEngine` interface
- [x] `buildPatientSource(patientId, resources)` helper — assembles FHIR Bundle from prefetch resources for the PatientSource
- [x] Export `CqlExecutionEngine` and `buildPatientSource` from barrel
- [x] Add `vitest.config.ts` and `test` script
- [x] Unit tests: evaluate `BreastCancerPayerPolicy` ELM with mock prefetch data
  - [x] All data present → `AllDataPresent = true`, `PAResult = 'approved'`
  - [x] HER2 absent → `AllDataPresent = false`, `MissingElements` contains 'her2'
  - [x] Stage absent → `AllDataPresent = false`, `MissingElements` contains 'cancerStage'
  - [x] Nothing present → all three missing

### apps/crd-service
- [x] Add `@ogca/cql-engine` workspace dependency
- [x] Load `BreastCancerPayerPolicy.elm.json` at module init
- [x] Replace `checkCompleteness(prefetch)` with `evaluatePayerPolicy(prefetch)` backed by `CqlExecutionEngine`
- [x] `buildPatientSource` maps prefetch bundles (her2, cancerStage, ecogPs, patient) to FHIR resources for cql-execution
- [x] Update `Library/BreastCancerPADataRequirements` route to embed ELM JSON content in `content[0].data` (base64)
- [x] Update crd-logic tests to cover CQL-driven path

**Status: Complete**

### Notes
- `rh cql compile` available at v0.1.0-beta.1 — no Java required
- FHIR model info is bundled in `rh`; no `--model` flag needed
- `cql-execution` is Stage 1 evaluator; Stage 2 (`rh-cql` WASM) is a future swap behind the same `CqlEngine` interface with no application-level changes

---

## Phase 4 — SMART OAuth

### packages/smart-auth
- [x] Implement SMART on FHIR authorization code flow (RFC 6749 + PKCE)
- [x] `SmartConfig` interface: `issuer`, `authorizationEndpoint`, `tokenEndpoint`, `scopes`
- [x] `buildAuthorizationUrl(config, params)` — constructs the `/authorize` redirect URL with PKCE challenge
- [x] `exchangeCode(config, code, verifier)` — POSTs to `/token`, returns `SmartTokenResponse`
- [x] `buildSmartConfiguration(issuer)` — returns the `.well-known/smart-configuration` JSON object
- [x] Token storage helpers: `storeToken`, `loadToken`, `clearToken` (cookie/header based, SSR-safe)
- [x] `SMART_AUTH_BYPASS` guard: when env flag is true all auth functions no-op and return fixture tokens
- [x] Export all types and functions from barrel `src/index.ts`
- [x] Add `vitest.config.ts` and `test` script
- [x] Unit tests: `buildAuthorizationUrl` parameter encoding; `buildSmartConfiguration` shape; bypass mode

### apps/ehr — SMART authorization server
- [x] `GET /.well-known/smart-configuration` — advertise authorization and token endpoints
- [x] `GET /authorize` — validate `client_id`, `redirect_uri`, `scope`, `state`; render launch consent page
- [x] `POST /token` — validate authorization code + PKCE verifier; issue access token (JWT signed with HS256)
- [x] Token includes `patient`, `intent`, `scope` claims
- [x] Launch context page: minimal HTML confirm page (pre-approved for demo — no real user login)
- [x] "Launch CDS App" button on EHR patient chart linking to `/authorize?...` with correct launch params

### apps/ehr — FHIR proxy bearer validation
- [x] Middleware: extract `Authorization: Bearer <token>` on all `/api/fhir/[...path]` requests
- [x] Verify token signature and expiry (symmetric HS256)
- [x] If `SMART_AUTH_BYPASS=true` skip verification and pass through
- [x] Return `401 Unauthorized` with `WWW-Authenticate: Bearer` on invalid/missing token

### apps/smart-app — EHR launch
- [x] Add `@ogca/smart-auth` workspace dependency
- [x] SMART EHR launch: read `launch` and `iss` query params, redirect to EHR `/authorize`
- [x] On callback: exchange code for token, store in cookie
- [x] Replace stub landing page with authenticated "CDS App launched" confirmation showing patient context
- [x] If `SMART_AUTH_BYPASS=true` skip OAuth and use fixture token

### apps/dtr-client — EHR launch with appContext
- [x] Add `@ogca/smart-auth` workspace dependency
- [x] SMART EHR launch: same pattern as smart-app; additionally parse `appContext` from launch params
- [x] Display received `appContext` (libraryUrl + missingDataElements) on landing page
- [x] If `SMART_AUTH_BYPASS=true` skip OAuth

### Notes
- `SMART_AUTH_BYPASS=true` is already set in all `.env.local` files from Phase 1; bypass mode must remain functional so Phases 1–3 continue to work
- HS256 signing key stored in `SMART_JWT_SECRET` env var (auto-generated if absent in dev)
- Scopes to support: `launch`, `launch/patient`, `patient/*.read`, `openid`, `fhirUser`
**Status: Complete**

- Done when: "Launch CDS App" in EHR → real OAuth redirect → token issued → smart-app queries `/api/fhir/Patient/jane-smith` with bearer token → EHR proxy validates → 200 OK

---

## Phase 5 — CDS SMART App (Layer 1)

### apps/smart-app — data fetching
- [x] Add `@ogca/cql-engine` dependency for guideline evaluation
- [x] Add `@ogca/cds-hooks` dependency for CRD service URL constants
- [x] `lib/data-fetching.ts` — fetch Library resource from CRD; parallel DataRequirement FHIR queries (Patient, Conditions, HER2, CancerStage, ECOG PS, LineOfTherapy)
- [x] `lib/guideline.ts` — run `BreastCancerGuideline.elm.json` via `CqlExecutionEngine`; return `{ thEligible, phdEligible, ddactEligible }` and eligible regimen list

### apps/smart-app — gap analysis UI
- [x] Update `app/page.tsx` (server component): fetch Library → run DataRequirement queries → run CQL guideline → pass results to client components
- [x] `app/GapAnalysisTable.tsx` (server component): render present/missing table per DataRequirement label; highlight missing items in amber
- [x] `app/HER2InputForm.tsx` (client component): IHC score selector (IHC 3+, IHC 2+/ISH+, IHC 0/1); POST to write-back API; reload on success

### apps/smart-app — write-back
- [x] `app/api/write-back/route.ts` — POST endpoint; constructs FHIR Observation from submitted HER2 value; writes to EHR FHIR server via fhir-kit-client with bearer token from cookie; returns created resource or error

### apps/smart-app — regimen options
- [x] `app/RegimenOptions.tsx` (client component): render approvable regimen table from CQL results; each row has a deep-link `href` to `{EHR_BASE_URL}/patients/{patientId}/orders`; highlight TH when HER2-positive

### apps/smart-app — env / config
- [x] Add `NEXT_PUBLIC_CRD_SERVICE_URL` to `.env.local`
- [x] Update `lib/smart-config.ts` with `CRD_LIBRARY_URL` and `EHR_ORDERS_URL` helpers

**Status: Complete**

### Notes
- Done when: launch CDS App from Jane Smith chart → gap shows HER2 missing → enter IHC 3+ → write-back → page reloads → regimen options appear → select TH → lands on EHR order entry
- Write-back: bearer token extracted from `smart_token` cookie and forwarded on the FHIR POST; if SMART_AUTH_BYPASS=true use bypass token header
- HAPI indexing delay (~5-10s after write-back) means a manual page refresh may be needed in the demo — noted in the UI

## Phase 6 — DTR Client

**Status: Complete**

### `apps/dtr-client` — Questionnaire generation
- [x] `lib/questionnaire-gen.ts` — `buildQuestionnaire(missingKeys)` → `{ items: QItem[] }`, `ITEM_DEFINITIONS` export with HER2/Stage/ECOG items
- [x] `app/QuestionnaireForm.tsx` — client component: radio-per-item, POSTs to `/api/submit`, success redirect to EHR
- [x] `app/api/submit/route.ts` — POST Observations + QuestionnaireResponse to EHR FHIR; return `{ qrId, observationIds }`

### `apps/dtr-client` — Page + config
- [x] `app/page.tsx` — rewrite: fetch Library, build questionnaire, render form; handle authError, no-context, and all-present cases
- [x] `lib/smart-config.ts` — add `EHR_FHIR_BASE_URL`, `EHR_BASE_URL`
- [x] `.env.local` — add `EHR_FHIR_BASE_URL`, `EHR_BASE_URL`, `DTR_CLIENT_URL`

### `apps/dtr-client` — `returnRegimen` threading
- [x] `app/launch/route.ts` — extract `returnRegimen` from URL; include in state payload cookie; pass through bypass redirect
- [x] `app/callback/route.ts` — extract `returnRegimen` from state; append to home redirect URL

### `apps/ehr` — DTR return + auto-fire
- [x] `app/patients/[id]/orders/OrderEntryClient.tsx` — `CardDisplay` appends `&returnRegimen=${selectedRegimenId}` to smart links; `OrderEntryPage` uses `useEffect`/`window.location.search` to auto-select regimen and fire CRD on `?dtr-complete=true`

### Notes
- Bypass mode: `SMART_AUTH_BYPASS=true` — launch route sets cookie directly, threads `returnRegimen` via redirect URL params
- OAuth mode: `returnRegimen` survives the round-trip via base64url-encoded state cookie payload
- Submit route uses native fetch (not fhir-kit-client) — avoids agentkeepalive conflicts in Next.js API routes
- Done when: CRD returns DTR card → launch DTR → HER2 question → submit → QR saved → return to EHR → auto-fires order-select → pre-approved card
