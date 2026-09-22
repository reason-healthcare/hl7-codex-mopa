# Connectathon API configuration

This guide runs the reference EHR and FHIR server while directing the workflow to
partner CRD, DTR, and PAS implementations. It is intended for an integration
rehearsal, not a production deployment.

The reference EHR exposes three configurable integration paths. Its bundled DTR
write-back and compact PAS request are demo-only interoperability shims: the DTR
path is not a production persistence contract, and the PAS path is not a
conformant Da Vinci PAS Claim `$submit` package.

| Integration | Configuration | Request made by the EHR | Required partner behavior |
| --- | --- | --- | --- |
| CRD | `NEXT_PUBLIC_CRD_SERVICE_URL` | `POST {base}/api/cds-services/oncology-crd` | Accept the CDS Hooks `order-select` and `order-sign` requests sent by this EHR and return CDS Hooks cards. |
| DTR | CRD coverage-information extension or a CDS Hooks card link | When CRD supplies a `questionnaire` canonical, the EHR calls the partner's `$questionnaire-package` operation and launches the bundled DTR with that package. Otherwise the browser opens the card's `type: "smart"` link. | Return a package containing the CRD-selected Questionnaire, or supply a SMART-launchable card link as the fallback. |
| PAS | `PAS_SERVICE_URL` | `POST {base}/api/fhir/$submit` | Accept this reference app's compact PA request and return its expected ClaimResponse fields. |

The values above are base URLs. Do not include the path suffixes that the EHR
adds itself.

Use [`connectathon.env.example`](./connectathon.env.example) as the generic
starting point. Copy it to `connectathon.env`, keep that copy private, and
change only the values needed for the selected profile. The template contains
no credentials or real partner endpoints.

### Local services

Leave the `CRD_PARTNER_*` variables empty or unset. The EHR uses the bundled
services at `4003` (CRD), `4004` (DTR), and `4005` (PAS), with HAPI FHIR at
`8080`. Keep `LOG_HUB_URL=http://localhost:4000/api/log` so service events
appear in the Hub Activity tab.

For a native Node run, load the environment before starting every workspace
task and use Turbo's loose environment mode so undeclared Connectathon
variables reach the child apps:

```bash
cd reference-app
test -f connectathon.env || cp connectathon.env.example connectathon.env
set -a; source connectathon.env; set +a
pnpm install --frozen-lockfile
pnpm exec turbo run dev --env-mode=loose
```

For a partner CRD/DTR run, set `CRD_PARTNER_BASE_URL`,
`CRD_PARTNER_TOKEN_URL`, `CRD_PARTNER_CLIENT_ID`, and
`CRD_PARTNER_CLIENT_SECRET` from the partner's private onboarding material.
Set `DTR_PARTNER_BASE_URL` only when DTR uses a different base; otherwise leave
it unset so it falls back to `CRD_PARTNER_BASE_URL`. Keep client credentials
server-side and never use `NEXT_PUBLIC_` names for them. `CRD_PARTNER_PREFETCH`
defaults to `true`, which sends local FHIR prefetch so the partner does not
need to reach a localhost `fhirServer`.

The current PAS route supports the compact `POST /api/fhir/$submit` contract
documented below. Set `PAS_SERVICE_URL` to a third-party base only when that
partner accepts this exact contract. If it requires a different operation,
authentication scheme, or FHIR Bundle shape, place a private adapter at that
boundary; there is no generic credential or request-transformation setting in
this reference app. The profiles can be mixed per integration: unset partner
variables continue to use local services, while a configured partner CRD takes
precedence over the bundled CRD.

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
| `LOG_HUB_URL` | unset | All reference services | Hub ingest URL for the Activity tab. Set it to the Hub's `/api/log` route. |
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

### PAS

The EHR does not send a full Da Vinci PAS Claim Bundle. Its request body is:

```json
{
  "patientId": "jane-smith",
  "regimenId": "optional-regimen-id",
  "regimenLabel": "optional display label"
}
```

It expects JSON with at least `outcome`; it displays optional `disposition` and
`processNote[].text` fields as a ClaimResponse-style result. The outbound request
has only `Content-Type: application/json`; there is no environment variable for
partner authentication, request transformation, or another PAS operation path.
Use a small Connectathon adapter if the partner API requires a FHIR Claim Bundle,
OAuth credentials, mTLS, or different paths.

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
      LOG_HUB_URL: http://hub:4000/api/log
      SMART_AUTH_BYPASS: "true"
      NEXT_PUBLIC_EHR_BASE_URL: ${EHR_PUBLIC_BASE_URL:-http://localhost:4001}
      NEXT_PUBLIC_CRD_SERVICE_URL: ${CRD_SERVICE_URL:-http://localhost:4003}
      PAS_SERVICE_URL: ${PAS_SERVICE_URL:-http://localhost:4005}
      DTR_CLIENT_URL: ${DTR_CLIENT_URL:-http://localhost:4004}
      NEXT_PUBLIC_DTR_CLIENT_URL: ${DTR_PUBLIC_BASE_URL:-http://localhost:4004}
      EHR_FHIR_BASE_URL: ${EHR_FHIR_BASE_URL:-http://localhost:4001/api/fhir}
      EHR_BASE_URL: ${EHR_PUBLIC_BASE_URL:-http://localhost:4001}
      PAYER_BACKEND_URL: ${PAYER_BACKEND_URL:-http://localhost:4006}
      CRD_PARTNER_BASE_URL: ${CRD_PARTNER_BASE_URL:-}
      CRD_PARTNER_TOKEN_URL: ${CRD_PARTNER_TOKEN_URL:-}
      CRD_PARTNER_CLIENT_ID: ${CRD_PARTNER_CLIENT_ID:-}
      CRD_PARTNER_CLIENT_SECRET: ${CRD_PARTNER_CLIENT_SECRET:-}
      CRD_PARTNER_SCOPE: ${CRD_PARTNER_SCOPE:-crd dtr pas}
      CRD_PARTNER_PREFETCH: ${CRD_PARTNER_PREFETCH:-true}
      DTR_PARTNER_BASE_URL: ${DTR_PARTNER_BASE_URL:-${CRD_PARTNER_BASE_URL:-}}
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

Copy `connectathon.env.example` to `connectathon.env` beside the Compose file
if it does not already exist.
This file is intentionally private. Never commit it or place client secrets in
the repository. The Compose recipe passes partner variables to the server-side
EHR process only; it does not expose them as `NEXT_PUBLIC_` browser variables.

`CRD_SERVICE_URL`, `EHR_PUBLIC_BASE_URL`, and `DTR_PUBLIC_BASE_URL` in this file
are Compose substitution aliases, not additional application environment
variables. The recipe maps them to `NEXT_PUBLIC_CRD_SERVICE_URL`,
`NEXT_PUBLIC_EHR_BASE_URL`, and `NEXT_PUBLIC_DTR_CLIENT_URL`, respectively.

The following values are examples, not live partner endpoints. The recipe does
not create DNS records, TLS certificates, or an HTTPS ingress. Configure a
reachable HTTPS ingress separately before using a non-local public EHR URL.

For a completely local rehearsal, keep the values from
`connectathon.env.example`. For a partner rehearsal, replace the generic
partner variables with values supplied privately by that partner. The public
EHR URL must be reachable by the browser and any partner that receives the
FHIR issuer; use an HTTPS ingress when the partner cannot reach localhost.

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
test -f connectathon.env || cp connectathon.env.example connectathon.env
set -a; source connectathon.env; set +a
pnpm install --frozen-lockfile
# Start the full local/mixed profile:
pnpm exec turbo run dev --env-mode=loose

# If every integration except the EHR is remote, the EHR alone is sufficient:
# pnpm exec turbo run dev --filter=@mopa/ehr --env-mode=loose
```

The native workflow requires a supported Node.js version and pnpm. Replace the
public EHR URL with `http://localhost:4001` only when every participant runs on
the same machine.

The Compose recipe uses `turbo run dev --env-mode=loose` because this repository
does not declare task environment variables in `turbo.json`. See Turbo's
[environment-variable documentation](https://turborepo.dev/docs/crafting-your-repository/using-environment-variables)
for the strict-mode behavior.

## Verification scope

The examples describe environment forwarding and the fixed endpoint contracts;
they do not provision DNS, TLS, ingress, partner credentials, or a particular
third-party integration. Before a rehearsal, confirm the selected profile with
the Activity tab, the EHR's `/api/crd-hooks` response, and the partner's own
request identifiers. Do not treat a successful local service check as evidence
that a remote partner contract or production PAS conformance has been verified.

The maintained implementation points are the EHR [CRD proxy](./apps/ehr/app/api/crd-hooks/route.ts),
[PAS proxy](./apps/ehr/app/api/pa-submit/route.ts), and
[DTR launch builder](./apps/ehr/app/patients/%5Bid%5D/orders/OrderEntryClient.tsx).
