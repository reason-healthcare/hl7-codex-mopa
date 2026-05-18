/**
 * OGCA CRD Service — business logic layer.
 *
 * This module contains pure functions so they can be tested without
 * instantiating the Next.js request/response layer.
 */

import type { CdsCard, CdsRequest, CdsResponse, CdsService } from "@ogca/cds-hooks";
import { prefetchEntryCount } from "@ogca/cds-hooks";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const CRD_SERVICE_ID = "oncology-crd";
export const CRD_SERVICE_TITLE = "OGCA Oncology CRD";
export const LIBRARY_CANONICAL =
  "http://hl7.org/fhir/us/codex-ocpa/Library/BreastCancerPADataRequirements";

/**
 * Prefetch templates advertised in the CDS service discovery response.
 * The EHR should resolve these and include them in every hook request;
 * the service will fetch any missing keys itself.
 */
export const PREFETCH_TEMPLATES: Record<string, string> = {
  patient: "Patient/{{context.patientId}}",
  conditions: "Condition?patient={{context.patientId}}&category=problem-list-item&_count=50",
  her2: "Observation?patient={{context.patientId}}&code=http://loinc.org|85319-2,http://snomed.info/sct|431396003&_count=5",
  cancerStage: "Observation?patient={{context.patientId}}&code=http://loinc.org|21908-9&_count=1",
  ecogPs: "Observation?patient={{context.patientId}}&code=http://loinc.org|89247-1&_count=1",
};

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

/** Build the CDS discovery response for this service. */
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
// Completeness check (Phase 2 — hardcoded, no CQL)
// ---------------------------------------------------------------------------

export type CheckResult =
  | { status: "approved"; reason: string }
  | { status: "dtr-required"; missingKeys: string[] };

/**
 * Determine whether all required clinical context is present.
 *
 * Phase 2 hardcodes the check: HER2 status must be present.
 * Phase 3 replaces this with CQL evaluation.
 */
export function checkCompleteness(prefetch: Record<string, unknown>): CheckResult {
  const missingKeys: string[] = [];

  if (prefetchEntryCount(prefetch.her2) === 0) missingKeys.push("her2");
  if (prefetchEntryCount(prefetch.cancerStage) === 0) missingKeys.push("cancerStage");
  if (prefetchEntryCount(prefetch.ecogPs) === 0) missingKeys.push("ecogPs");

  if (missingKeys.length > 0) {
    return { status: "dtr-required", missingKeys };
  }
  return { status: "approved", reason: "All required clinical context present." };
}

// ---------------------------------------------------------------------------
// Card builders
// ---------------------------------------------------------------------------

const DTR_CLIENT_URL = process.env.DTR_CLIENT_URL ?? "http://localhost:4003";

/** Human-readable labels for each required clinical data element key. */
export const MISSING_KEY_LABELS: Record<string, string> = {
  her2: "HER2 status",
  cancerStage: "Cancer stage",
  ecogPs: "ECOG Performance Status",
};

/** Build the shared `source` object used in all CRD cards. */
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

/**
 * Process a CDS Hooks request and return the appropriate card(s).
 *
 * Accepts both `order-select` and `order-sign` hook names.
 * The `prefetch` map must already be resolved before calling this function.
 */
export function handleOncologyCrd(request: CdsRequest<Record<string, unknown>>): CdsResponse {
  const prefetch = (request.prefetch ?? {}) as Record<string, unknown>;
  const result = checkCompleteness(prefetch);

  if (result.status === "approved") {
    return { cards: [buildPreApprovedCard()] };
  }
  return { cards: [buildDtrCard(result.missingKeys)] };
}
