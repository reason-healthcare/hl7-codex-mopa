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

// ELM loaded above via require() — no runtime FS access needed

const cqlEngine = new CqlExecutionEngine();

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

  const her2Present = results["HER2 Status Present"] as boolean;
  const stagePresent = results["Cancer Stage Present"] as boolean;
  const ecogPresent = results["ECOG PS Present"] as boolean;

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
    url: `http://localhost:${process.env.PORT ?? 4002}/api/cds-services`,
  };
}

export function buildPreApprovedCard(): CdsCard {
  return {
    summary: "Regimen pre-approved",
    detail:
      "All required clinical data is present and the regimen meets guideline criteria. " +
      "No prior authorization is needed at this time.",
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
    return { cards: [buildPreApprovedCard()] };
  }
  return { cards: [buildDtrCard(result.missingKeys)] };
}
