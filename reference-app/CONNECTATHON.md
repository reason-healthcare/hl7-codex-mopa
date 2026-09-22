# Connectathon API configuration

This guide runs the reference EHR and FHIR server while directing the workflow to
partner CRD, DTR, and PAS implementations. It is intended for an integration
rehearsal, not a production deployment.

The reference EHR can call partner CRD, DTR, and synthetic PAS endpoints. Its
bundled DTR write-back and default compact PAS request remain demo-only shims;
the optional synthetic partner PAS lane constructs a full Claim Bundle. None of
these paths is a production persistence or adjudication contract.

| Integration | Configuration | Request made by the EHR | Required partner behavior |
| --- | --- | --- | --- |
| CRD | `NEXT_PUBLIC_CRD_SERVICE_URL` | `POST {base}/api/cds-services/oncology-crd` | Accept the CDS Hooks `order-select` and `order-sign` requests sent by this EHR and return CDS Hooks cards. |
| DTR | CRD coverage-information extension or a CDS Hooks card link | When CRD supplies a `questionnaire` canonical, the EHR calls the partner's `$questionnaire-package` operation and launches the bundled DTR with that package. Otherwise the browser opens the card's `type: "smart"` link. | Return a package containing the CRD-selected Questionnaire, or supply a SMART-launchable card link as the fallback. |
| PAS (bundled demo) | `PAS_SERVICE_URL` | `POST {base}/api/fhir/$submit` | Accept this reference app's compact PA request. Used only when `PAS_PARTNER_BASE_URL` is unset. |
| PAS (synthetic partner) | `PAS_PARTNER_BASE_URL` | `POST {base}/Claim/$submit` | Send the signed regimen as a profiled Claim Bundle with all medications, patient, Coverage, payer, and the latest matching completed DTR response. Uses the CRD partner OAuth credentials with `pas` scope. |

The values above are base URLs. Do not include the path suffixes that the EHR
adds itself.

When `CRD_PARTNER_BASE_URL` is set, the EHR obtains and caches a bearer token
using the client-credentials variables below and calls the partner's standard
CRD paths directly. The secret is read only by the server route. The EHR also
adds local FHIR prefetch for the patient, active coverage, conditions,
observations, and prior medication requests.

## What is configurable

| Exact application environment variable | Default | Process that reads it | Use at the Connectathon |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_CRD_SERVICE_URL` | `http://localhost:4003` | EHR server route | CRD base URL. The EHR appends `/api/cds-services/oncology-crd`. |
| `CRD_PARTNER_BASE_URL` | unset | EHR server route | OAuth-protected partner CRD base. The EHR appends `/crd/cds-services/{hook}` and takes precedence over the local CRD URL. |
| `CRD_PARTNER_TOKEN_URL` | unset | EHR server route | OAuth 2.0 client-credentials token endpoint. |
| `CRD_PARTNER_CLIENT_ID` | unset | EHR server route | Partner client ID; server-side only. |
| `CRD_PARTNER_CLIENT_SECRET` | unset | EHR server route | Partner client secret; server-side only. |
| `CRD_PARTNER_SCOPE` | `crd dtr pas` | EHR server route | OAuth scope requested for the partner. |
| `CRD_PARTNER_PREFETCH` | `true` | EHR server route | Include local FHIR prefetch in partner CRD requests so the partner need not reach a localhost `fhirServer`. |
| `DTR_PARTNER_BASE_URL` | `CRD_PARTNER_BASE_URL` | EHR server route | Optional separate DTR base. The EHR appends `/Questionnaire/$questionnaire-package`; it uses the same client-credentials configuration as CRD. |
| `PAS_SERVICE_URL` | `http://localhost:4005` | EHR server route | PAS base URL. The EHR appends `/api/fhir/$submit`. |
| `PAS_PARTNER_BASE_URL` | unset | EHR server route | When set, replaces the compact demo PAS call with FHIR `Claim/$submit`; use only with the synthetic connectathon partner and provisioned `pas` OAuth scope. |
| `DTR_CLIENT_URL` | `http://localhost:4004` | Local CRD service only | Base URL used only when the bundled CRD service builds its own DTR link, appending `/launch`. It has no effect when using a partner CRD. |
| `NEXT_PUBLIC_DTR_CLIENT_URL` | `http://localhost:4004` | Local DTR client | Public callback base used by the bundled DTR client. It is not a way to configure a partner DTR. |
| `NEXT_PUBLIC_EHR_BASE_URL` | `http://localhost:4001` | EHR server and browser code; local DTR | Public EHR base. It determines the `fhirServer`/`iss` URL sent to CRD and DTR. |
| `EHR_BASE_URL` | `http://localhost:4001` | Local DTR client | Browser return base after the bundled DTR completes. |
| `EHR_FHIR_BASE_URL` | `http://localhost:4001/api/fhir` | Local DTR client and local payer backend | Server-side EHR FHIR proxy used by bundled components. |
| `PAYER_BACKEND_URL` | `http://localhost:4006` | Local PAS service | Base URL for the bundled PAS service's local policy evaluator. It does not configure a partner PAS API. |
| `FHIR_BASE_URL` | `http://localhost:8080/fhir` | EHR and FHIR proxy | Upstream FHIR R4 base URL. In the Compose example it is the HAPI container. |
| `SMART_AUTH_BYPASS` | unset (`false`) | EHR and bundled SMART clients | Set only to `true` for the self-contained demo. It creates fixture bypass tokens. |
| `SMART_JWT_SECRET` | development default | EHR SMART authorization implementation | Set a shared, non-default value if exercising the bundled non-bypass SMART flow. |

`NEXT_PUBLIC_` has special meaning in Next.js: values used in browser code are
embedded when the application is built. Set these values before starting a
development server or building a production image, and rebuild/restart when they
change. The CRD base is currently read by an EHR **server** route despite its
`NEXT_PUBLIC_` name; the public EHR base is also used by browser-side DTR launch
code. See the [Next.js environment-variable guidance](https://nextjs.org/docs/pages/guides/environment-variables).

## Partner API contracts and limits

### CRD

The EHR sends its CDS Hooks request through its own `/api/crd-hooks` route. The
body contains `hookInstance`, `hook`, and a context with `userId`, `patientId`,
`draftOrders`, and `selections`. It calls the same CRD endpoint for both
`order-select` and `order-sign`; the selected service is not discovered or
configurable separately.

With `SMART_AUTH_BYPASS=true`, the EHR adds `fhirServer` as
`{NEXT_PUBLIC_EHR_BASE_URL}/api/fhir`. With `SMART_AUTH_BYPASS=false` and an EHR
SMART session, it adds that value and `fhirAuthorization` to the CDS Hooks body.
Without bypass mode or a SMART session, it omits both fields. The EHR does not add
an `Authorization` header, client certificate, custom headers, or a configurable
path to the partner CRD request. A partner CRD must therefore be reachable from
the EHR container and, when `fhirServer` is supplied, be able to reach it.

For a local all-in-one demo, `http://localhost:4001` works as the public EHR URL.
For a partner CRD or DTR running elsewhere, it does not: `localhost` would refer
to that partner's own host. Set `EHR_PUBLIC_BASE_URL` to a browser- and
partner-reachable HTTPS URL in the Compose example below. That same URL is the
issuer used by the bundled SMART discovery endpoint.

### DTR

The EHR first examines `systemActions[].resource.extension` for the CRD
[`ext-coverage-information`](https://hl7.org/fhir/us/davinci-crd/2.2.1/en/StructureDefinition-ext-coverage-information.html)
extension. When it contains both a `questionnaire` canonical and a
`coverage-assertion-id`, the EHR treats that Questionnaire as authoritative:

1. It resolves the extension's local Coverage reference and sends the
   CRD-updated RequestGroup to the partner `Questionnaire/$questionnaire-package`
   operation with the assertion id. The partner's processing context retains the
   original component orders from the CRD hook request.
2. It verifies the returned package contains the same Questionnaire canonical,
   stores the short-lived package in the local FHIR server, and launches the
   bundled DTR client with its opaque package id.
3. The bundled DTR renders the partner Questionnaire. If the package cannot be
   retrieved or contains an unsupported question, it displays an error; it does
   not fall back to a SMART link or infer that documentation is complete.

Only when CRD does not provide a `questionnaire` canonical does the EHR render a
card's SMART link. For a link whose `type` is `smart`, it preserves the partner
URL and appends:

```text
iss={NEXT_PUBLIC_EHR_BASE_URL}/api/fhir
launch=patient/{patient-id}
appContext={value supplied in the CRD card, when present}
returnRegimen={selected regimen id, when present}
```

Use the partner DTR's launch URL in a CRD card only for this fallback path. The
bundled CRD can instead produce `{DTR_CLIENT_URL}/launch`, and the bundled DTR
understands that route, its own callback, and its demo write-back.

The bundled DTR writes `Observation` and `QuestionnaireResponse` resources to
the EHR FHIR server so the demo can re-run CRD. Its code labels that as demo-only;
a partner DTR should use the exchange and return pattern agreed for the
Connectathon rather than relying on this write-back behavior.

For the partner package path, the bundled DTR carries the package's
`QuestionnaireResponse` `qr-context` and `qr-coverage` references into the
saved response. The next partner CRD call prefetches patient-scoped completed
QuestionnaireResponses as well as coded Observations. This matters for text-only
items such as `priorTherapy`: there is no safe Observation mapping for free text,
so the payer must receive the completed, order-linked QuestionnaireResponse.

The no-browser regression for this handoff is:

```bash
./node_modules/.bin/vitest run apps/ehr/app/partner-dtr-headless.test.ts
```

It exercises the EHR's outbound `context + coverage + RequestGroup` package
request, the DTR package renderer, QR construction with both links, and the
next CRD prefetch. It mocks network responses and does not send PHI or create a
real authorization. A separate live partner test is still needed before
claiming a full browser-to-payer round trip.

### PAS

By default, the EHR uses the bundled compact PAS service. Its request body is:

```json
{
  "patientId": "jane-smith",
  "regimenId": "optional-regimen-id",
  "regimenLabel": "optional display label"
}
```

When `PAS_PARTNER_BASE_URL` is set, the EHR instead accepts the exact signed
RequestGroup and component MedicationRequests from order-sign, validates their
patient and reference closure, fetches the active Coverage and latest completed
order-linked QuestionnaireResponse, and sends a profiled Claim Bundle to
`{PAS_PARTNER_BASE_URL}/Claim/$submit`. The response is summarized from the
ClaimResponse's X12 review action, not from `outcome` alone (`complete` can mean
either A1 or A3). It displays the payer reference. This lane is deliberately
limited to the four synthetic reference patients; it is not a production PAS
implementation or a generic adapter for arbitrary partner authentication.

For the Hike synthetic connectathon rehearsal, set
`PAS_PARTNER_BASE_URL=https://connectathon.hike.health/oncology/api/v1` alongside
the existing `CRD_PARTNER_*` OAuth settings, with scope `crd dtr pas`. The
bundled PAS remains the fallback if this variable is unset. A guarded live
rehearsal is available with
`LIVE_SYNTHETIC_PAS_REHEARSAL=1 vitest run --project ehr app/partner-pas-live.test.ts`;
it creates synthetic PAS cases and expects Jane/no PAS, Maria/A1,
Sandra/HER2-negative A3, Katherine/Neulasta A4, and Katherine/Udenyca A1.

`PAYER_BACKEND_URL` is one hop behind this integration: it is used only by the
bundled PAS service to call the bundled policy evaluator. It has no role when
`PAS_SERVICE_URL` points directly at a partner PAS.

## Quick start with Docker Compose

The repository's current production Dockerfiles use stale package names, so this
recipe intentionally starts the monorepo in Next.js development mode. It mounts
the source read-only and copies it into the container's writable layer before
installing dependencies. It starts all reference apps so the normal local paths
remain available, while the EHR calls the configured partner CRD and PAS.

Install Docker Engine with the Docker Compose plugin. The fixture-loading command
runs on the host and requires `bash`, `curl`, and `python3`. The Docker workflow
does not require host Node.js or pnpm.

Create `connectathon.compose.yml` in `reference-app` with the following content:

```yaml
services:
  hapi:
    image: hapiproject/hapi:latest
    ports: ["8080:8080"]
    environment:
      hapi.fhir.fhir_version: R4
      hapi.fhir.allow_external_references: "true"
      hapi.fhir.allow_multiple_delete: "true"
      hapi.fhir.cors.allow_credentials: "true"
      hapi.fhir.cors.allowed_origin: "*"
      hapi.fhir.reuse_cached_search_results_millis: "0"
    volumes: [hapi-data:/data/hapi]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/fhir/metadata"]
      interval: 15s
      timeout: 10s
      retries: 8
      start_period: 45s

  apps:
    image: node:22
    working_dir: /workspace
    ports:
      - "4000:4000"
      - "4001:4001"
      - "4002:4002"
      - "4003:4003"
      - "4004:4004"
      - "4005:4005"
      - "4006:4006"
    volumes:
      - .:/source:ro
    environment:
      FHIR_BASE_URL: http://hapi:8080/fhir
      SMART_AUTH_BYPASS: "true"
      NEXT_PUBLIC_EHR_BASE_URL: ${EHR_PUBLIC_BASE_URL:-http://localhost:4001}
      NEXT_PUBLIC_CRD_SERVICE_URL: ${CRD_SERVICE_URL:-http://localhost:4003}
      PAS_SERVICE_URL: ${PAS_SERVICE_URL:-http://localhost:4005}
      DTR_CLIENT_URL: ${DTR_CLIENT_URL:-http://localhost:4004}
      NEXT_PUBLIC_DTR_CLIENT_URL: ${DTR_PUBLIC_BASE_URL:-http://localhost:4004}
      EHR_FHIR_BASE_URL: ${EHR_FHIR_BASE_URL:-http://localhost:4001/api/fhir}
      EHR_BASE_URL: ${EHR_PUBLIC_BASE_URL:-http://localhost:4001}
      PAYER_BACKEND_URL: ${PAYER_BACKEND_URL:-http://localhost:4006}
    depends_on:
      hapi:
        condition: service_healthy
    command:
      - /bin/sh
      - -ec
      - |
        mkdir -p /workspace
        tar -C /source --exclude=node_modules --exclude=.next --exclude=.turbo \
          --exclude=.pnpm-store --exclude-vcs --exclude='.env.local' \
          --exclude='apps/*/.env.local' -cf - . | tar -C /workspace -xf -
        corepack enable
        corepack install
        pnpm install --frozen-lockfile
        exec pnpm exec turbo run dev --env-mode=loose

volumes:
  hapi-data: {}
```

Create a local `connectathon.env` beside it. This file is intentionally not a
place for production credentials; the reference app has no credential variables
for its CRD or PAS outbound calls.

`CRD_SERVICE_URL`, `EHR_PUBLIC_BASE_URL`, and `DTR_PUBLIC_BASE_URL` in this file
are Compose substitution aliases, not additional application environment
variables. The recipe maps them to `NEXT_PUBLIC_CRD_SERVICE_URL`,
`NEXT_PUBLIC_EHR_BASE_URL`, and `NEXT_PUBLIC_DTR_CLIENT_URL`, respectively.

The following values are examples, not live partner endpoints. The recipe does
not create DNS records, TLS certificates, or an HTTPS ingress. Configure a
reachable HTTPS ingress separately before using a non-local public EHR URL.

```dotenv
# Partner base URLs; do not include the EHR's fixed suffixes.
CRD_SERVICE_URL=https://crd.connectathon.example
PAS_SERVICE_URL=https://pas-adapter.connectathon.example

# Must be reachable by the browser, partner CRD, and partner DTR.
EHR_PUBLIC_BASE_URL=https://ehr.connectathon.example

# Needed only when exercising the bundled local CRD/DTR/payer components.
DTR_CLIENT_URL=http://localhost:4004
DTR_PUBLIC_BASE_URL=http://localhost:4004
EHR_FHIR_BASE_URL=http://localhost:4001/api/fhir
PAYER_BACKEND_URL=http://localhost:4006
```

For a completely local rehearsal, create an empty `connectathon.env` (or comment
out the three partner/public URL lines). Compose then uses the localhost defaults.

Start the stack and load the reference fixtures:

```bash
cd reference-app
docker compose --env-file connectathon.env -f connectathon.compose.yml up

# In a second terminal, after HAPI is healthy:
FHIR_BASE_URL=http://localhost:8080/fhir bash fixtures/load-fixtures.sh
```

For an all-local rehearsal, open `http://localhost:4001`; for a remote rehearsal,
open the configured `EHR_PUBLIC_BASE_URL`. Select a patient and enter an order.
The EHR's order-select and order-sign calls should reach the configured CRD. A
DTR card should open the URL supplied by that CRD. When the CRD reports that PA
is needed, the EHR's submission should reach the configured PAS base URL.

To change the partner CRD, PAS, or public EHR base after editing
`connectathon.env`, restart the EHR process with the same files:

```bash
docker compose --env-file connectathon.env -f connectathon.compose.yml \
  up -d --force-recreate apps
```

Stop the rehearsal with:

```bash
docker compose --env-file connectathon.env -f connectathon.compose.yml down
```

The first container start, and every newly created `apps` container, downloads
dependencies. HAPI data is held in the named `hapi-data` volume; use normal
`docker compose down` when finished so fixtures survive the next rehearsal.

If a partner API runs on the Docker host, use
`http://host.docker.internal:PORT` for `CRD_SERVICE_URL` or `PAS_SERVICE_URL` on
Docker Desktop. A public partner endpoint normally needs no special Docker
networking. Do not use the `localhost` form for a service running in another
container or on another machine.

## Browser check

Use this short sequence after fixture loading to verify the actual handoffs.

1. Open a patient order entry page, choose a regimen, and confirm the browser's
   `POST /api/crd-hooks` succeeds for both order selection and signing.
2. For a CRD card with `source.topic.code: "prior-auth-required"`, sign the
   order and use the displayed PA submission action. Confirm its
   `POST /api/pa-submit` returns the partner PAS result.
3. For a `type: "smart"` DTR link, verify the opened URL contains the expected
   `iss`, `launch`, and `appContext`. To return to this EHR's order page and
   trigger its CRD re-check, a DTR can use
   `/patients/{patient-id}/orders?dtr-complete=true&regimen={regimen-id}`.
   The partner must also make its completed documentation available to the CRD
   before that re-check; the bundled DTR does this only through demo write-back.

## Running without Docker

For a local Node workflow, set the same exact application variables before
starting the EHR. Start HAPI separately, then run the EHR directly so Turbo does
not filter environment variables:

```bash
cd reference-app
export FHIR_BASE_URL=http://localhost:8080/fhir
# Use the externally reachable EHR URL when the CRD or DTR is remote.
export NEXT_PUBLIC_EHR_BASE_URL=https://ehr.connectathon.example
export NEXT_PUBLIC_CRD_SERVICE_URL=https://crd.connectathon.example
export PAS_SERVICE_URL=https://pas-adapter.connectathon.example
export SMART_AUTH_BYPASS=true
pnpm install --frozen-lockfile
pnpm --filter @mopa/ehr dev
```

The native workflow requires a supported Node.js version and pnpm. Replace the
public EHR URL with `http://localhost:4001` only when every participant runs on
the same machine.

The Compose recipe uses `turbo run dev --env-mode=loose` because this repository
does not declare task environment variables in `turbo.json`. See Turbo's
[environment-variable documentation](https://turborepo.dev/docs/crafting-your-repository/using-environment-variables)
for the strict-mode behavior.

## Verification scope

The application routes and the repository's existing Compose configuration were
inspected. The Compose example's configuration parsed with the documented
substitutions, its read-only source mount and endpoint values were asserted, and
its startup shell script passed `sh -n`. The all-local defaults also rendered as
CRD `4003`, PAS `4005`, EHR `4001`, and DTR `4004` with an empty environment
file. No container was started, and no partner endpoint, credentials, network
route, or end-to-end Connectathon transaction was available to test. Confirm the
partner contracts and external reachability before the event.

The maintained implementation points are the EHR [CRD proxy](./apps/ehr/app/api/crd-hooks/route.ts),
[PAS proxy](./apps/ehr/app/api/pa-submit/route.ts), and
[DTR launch builder](./apps/ehr/app/patients/%5Bid%5D/orders/OrderEntryClient.tsx).
