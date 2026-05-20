/**
 * OGCA CRD Service — business logic layer.
 *
 * This module contains pure functions so they can be tested without
 * instantiating the Next.js request/response layer.
 */

import type { CdsCard, CdsRequest, CdsResponse, CdsService } from "@ogca/cds-hooks";
import { CqlExecutionEngine, extractBundleResources } from "@ogca/cql-engine";
import type { ElmJson } from "@ogca/cql-engine";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const payerPolicyElm = require("../../../cql/elm/BreastCancerPayerPolicy.elm.json") as ElmJson;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CRD_SERVICE_ID = "oncology-crd";
export const CRD_SERVICE_TITLE = "OGCA Oncology CRD";
export const CRD_DEFAULT_PORT = 4002;
export const LIBRARY_CANONICAL =
  "http://hl7.org/fhir/us/codex-ocpa/Library/BreastCancerPADataRequirements";

export const PREFETCH_TEMPLATES: Record<string, string> = {
  patient: "Patient/{{context.patientId}}",
  conditions: "Condition?patient={{context.patientId}}&category=problem-list-item&_count=50",
  her2: "Observation?patient={{context.patientId}}&code=http://loinc.org|85319-2,http://snomed.info/sct|431396003&_count=5",
  cancerStage: "Observation?patient={{context.patientId}}&code=http://loinc.org|21908-9&_count=1",
  ecogPs: "Observation?patient={{context.patientId}}&code=http://loinc.org|89247-1&_count=1",
};

export const MISSING_KEY_LABELS: Record<string, string> = {
  her2: "HER2 status",
  cancerStage: "Cancer stage",
  ecogPs: "ECOG Performance Status",
};

// ---------------------------------------------------------------------------
// ELM loading
// ---------------------------------------------------------------------------

const cqlEngine = new CqlExecutionEngine();

// CQL expression names from BreastCancerPayerPolicy.cql.
// Defined as constants so a rename in CQL is caught at a single call-site.
const CQL_HER2_PRESENT = "HER2 Status Present";
const CQL_STAGE_PRESENT = "Cancer Stage Present";
const CQL_ECOG_PRESENT = "ECOG PS Present";

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

export function buildDiscoveryResponse(): { services: CdsService[] } {
  const service: CdsService = {
    id: CRD_SERVICE_ID,
    hook: "order-select",
    title: CRD_SERVICE_TITLE,
    description:
      "Evaluates oncology medication orders against guideline and payer policy. " +
      "Returns a pre-approval decision or a link to the DTR app for missing data.",
    prefetch: PREFETCH_TEMPLATES,
    extension: {
      "ogca-service-extension": {
        libraryUrl: LIBRARY_CANONICAL,
        willUpdateOrders: false,
      },
    },
  };
  return { services: [service] };
}

// ---------------------------------------------------------------------------
// CQL-driven completeness check (Phase 3)
// ---------------------------------------------------------------------------

export type CheckResult =
  | { status: "approved"; reason: string }
  | { status: "dtr-required"; missingKeys: string[] };

/**
 * Evaluate BreastCancerPayerPolicy CQL against the resolved prefetch.
 *
 * Extracts FHIR resources from each prefetch bundle, runs the CQL library,
 * and maps the expression results to a CheckResult.
 */
export async function evaluatePayerPolicy(
  patientId: string,
  prefetch: Record<string, unknown>
): Promise<CheckResult> {
  const resources: unknown[] = [
    // Patient resource (single object from the patient prefetch key)
    ...(prefetch.patient ? [prefetch.patient] : []),
    // Bundle entries for each observation prefetch key
    ...extractBundleResources(prefetch.her2),
    ...extractBundleResources(prefetch.cancerStage),
    ...extractBundleResources(prefetch.ecogPs),
    ...extractBundleResources(prefetch.conditions),
  ];

  const results = await cqlEngine.evaluate(payerPolicyElm, patientId, resources);

  const her2Present = results[CQL_HER2_PRESENT] as boolean;
  const stagePresent = results[CQL_STAGE_PRESENT] as boolean;
  const ecogPresent = results[CQL_ECOG_PRESENT] as boolean;

  const missingKeys: string[] = [];
  if (!her2Present) missingKeys.push("her2");
  if (!stagePresent) missingKeys.push("cancerStage");
  if (!ecogPresent) missingKeys.push("ecogPs");

  if (missingKeys.length > 0) {
    return { status: "dtr-required", missingKeys };
  }
  return { status: "approved", reason: "All required clinical context present per CQL policy." };
}

// ---------------------------------------------------------------------------
// Card builders
// ---------------------------------------------------------------------------

const DTR_CLIENT_URL = process.env.DTR_CLIENT_URL ?? "http://localhost:4003";

function buildCardSource() {
  return {
    label: CRD_SERVICE_TITLE,
    url: `http://localhost:${process.env.PORT ?? CRD_DEFAULT_PORT}/api/cds-services`,
  };
}

export function buildPaRequiredCard(): CdsCard {
  return {
    summary: "Prior authorization required",
    detail:
      "All required clinical data is present. A formal prior authorization request must be " +
      "submitted before this order can be fulfilled. Use the Submit PA button to proceed.",
    indicator: "warning",
    source: {
      ...buildCardSource(),
      topic: {
        system: "http://hl7.org/fhir/us/davinci-crd/CodeSystem/temp",
        code: "prior-auth-required",
        display: "Prior Authorization Required",
      },
    },
  };
}

export function buildCoverageMetCard(): CdsCard {
  return {
    summary: "Coverage criteria met",
    detail:
      "All required clinical data is present and the regimen meets guideline criteria. " +
      "Prior authorization will be required before this order can be fulfilled — " +
      "sign the order to submit.",
    indicator: "info",
    source: {
      ...buildCardSource(),
      topic: {
        system: "http://hl7.org/fhir/us/davinci-crd/CodeSystem/temp",
        code: "coverage-information",
        display: "Coverage Information",
      },
    },
  };
}

export function buildDtrCard(missingKeys: string[]): CdsCard {
  const missingDisplay = missingKeys.map((k) => MISSING_KEY_LABELS[k] ?? k).join(", ");

  const appContext = JSON.stringify({
    libraryUrl: LIBRARY_CANONICAL,
    missingDataElements: missingKeys,
  });

  return {
    summary: "Additional information required",
    detail:
      `The following clinical data is needed to evaluate this order: **${missingDisplay}**. ` +
      "Launch the documentation app to provide the missing information.",
    indicator: "warning",
    source: buildCardSource(),
    links: [
      {
        label: "Launch Documentation Requirements Tool",
        url: `${DTR_CLIENT_URL}/launch`,
        type: "smart",
        appContext,
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Main hook handler
// ---------------------------------------------------------------------------

export async function handleOncologyCrd(
  request: CdsRequest<Record<string, unknown>>
): Promise<CdsResponse> {
  const patientId = (request.context.patientId as string) ?? "unknown";
  const prefetch = (request.prefetch ?? {}) as Record<string, unknown>;

  const result = await evaluatePayerPolicy(patientId, prefetch);

  if (result.status === "approved") {
    // order-sign requires formal PA; order-select is a quick pre-screen
    if (request.hook === "order-sign") {
      return { cards: [buildPaRequiredCard()] };
    }
    return { cards: [buildCoverageMetCard()] };
  }
  return { cards: [buildDtrCard(result.missingKeys)] };
}
