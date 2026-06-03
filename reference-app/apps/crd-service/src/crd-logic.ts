/**
 * OGCA CRD Service — business logic layer.
 *
 * This module contains pure functions so they can be tested without
 * instantiating the Next.js request/response layer.
 */

import type { CdsCard, CdsRequest, CdsResponse, CdsService } from "@ogca/cds-hooks";
import { resolvePrefetch } from "@ogca/cds-hooks";
import { CqlExecutionEngine, extractBundleResources } from "@ogca/cql-engine";
import type { ElmJson } from "@ogca/cql-engine";
import { CONDITION_REGISTRY, CATALOG_URL, findConditionEntry } from "@ogca/knowledge-artifacts";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const payerPolicyElm = require("../../../cql/elm/BreastCancerPayerPolicy.elm.json") as ElmJson;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

import {
  CRD_SERVICE_ID,
  CRD_SERVICE_ID_SIGN,
  CRD_SERVICE_TITLE,
  CRD_DEFAULT_PORT,
  LIBRARY_CANONICAL,
} from "./constants";
export {
  CRD_SERVICE_ID,
  CRD_SERVICE_ID_SIGN,
  CRD_SERVICE_TITLE,
  CRD_DEFAULT_PORT,
  LIBRARY_CANONICAL,
} from "./constants";

// Baseline prefetch — lowest-common denominator, condition-agnostic.
// Identifies the patient and their primary cancer condition so the CRD
// can route to the correct condition-specific policy without prior knowledge.
// OGCA-aware EHRs augment this with condition-specific templates from the
// conditionDataRequirements extension. Standard EHRs use this alone and the
// CRD falls back to dynamic fhirServer queries for disease-specific data.
export const BASELINE_PREFETCH_TEMPLATES: Record<string, string> = {
  patient: "Patient/{{context.patientId}}",
  conditions: "Condition?patient={{context.patientId}}&category=problem-list-item&_count=20",
};

// Full prefetch — all keys the CRD may need across all supported conditions.
// Used internally when resolving missing data via fhirServer fallback.
export const PREFETCH_TEMPLATES: Record<string, string> = {
  ...BASELINE_PREFETCH_TEMPLATES,
  her2: "Observation?patient={{context.patientId}}&code=http://loinc.org|85319-2,http://snomed.info/sct|431396003&_sort=-date&_count=5",
  cancerStage:
    "Observation?patient={{context.patientId}}&code=http://loinc.org|21908-9&_sort=-date&_count=1",
  ecogPs:
    "Observation?patient={{context.patientId}}&code=http://loinc.org|89247-1&_sort=-date&_count=1",
};

export const MISSING_KEY_LABELS: Record<string, string> = {
  breastCancer: "Breast cancer diagnosis",
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
const CQL_BC_PRESENT = "Breast Cancer Diagnosis Present";
const CQL_HER2_PRESENT = "HER2 Status Present";
const CQL_STAGE_PRESENT = "Cancer Stage Present";
const CQL_ECOG_PRESENT = "ECOG PS Present";

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

export function buildDiscoveryResponse(): { services: CdsService[] } {
  const extension = {
    "ogca-service-extension": {
      catalogUrl: CATALOG_URL,
      conditionDataRequirements: CONDITION_REGISTRY.map((entry) => ({
        condition: {
          system: entry.conditionSystem,
          code: entry.conditionCode,
          display: entry.conditionDisplay,
        },
        libraryUrl: entry.libraryUrl,
        prefetchTemplates: entry.prefetchTemplates,
      })),
      willUpdateOrders: false,
    },
  };

  const baseService = {
    title: CRD_SERVICE_TITLE,
    description:
      "Evaluates oncology chemotherapy orders against condition-specific guideline " +
      "and payer policy. Baseline prefetch carries patient demographics and primary " +
      "diagnosis; condition-specific data requirements are published in the " +
      "conditionDataRequirements extension for OGCA-aware EHRs.",
    prefetch: BASELINE_PREFETCH_TEMPLATES,
    extension,
  };

  return {
    services: [
      { ...baseService, id: CRD_SERVICE_ID, hook: "order-select" },
      { ...baseService, id: CRD_SERVICE_ID_SIGN, hook: "order-sign" },
    ],
  };
}

// ---------------------------------------------------------------------------
// CQL-driven completeness check
// ---------------------------------------------------------------------------

export type CheckResult =
  | { status: "pre-approved"; reason: string }
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

  const bcPresent = results[CQL_BC_PRESENT] as boolean;
  const her2Present = results[CQL_HER2_PRESENT] as boolean;
  const stagePresent = results[CQL_STAGE_PRESENT] as boolean;
  const ecogPresent = results[CQL_ECOG_PRESENT] as boolean;

  const missingKeys: string[] = [];
  if (!bcPresent) missingKeys.push("breastCancer");
  if (!her2Present) missingKeys.push("her2");
  if (!stagePresent) missingKeys.push("cancerStage");
  if (!ecogPresent) missingKeys.push("ecogPs");

  if (missingKeys.length > 0) {
    return { status: "dtr-required", missingKeys };
  }

  // All data present — check ECOG value to determine PA requirement.
  // ECOG 0 qualifies for direct coverage (pre-approved); ECOG ≥1 requires PA.
  const ecogScore = extractEcogScore(prefetch);
  if (ecogScore === 0) {
    return {
      status: "pre-approved",
      reason: "ECOG Performance Status 0 — direct coverage without prior authorization.",
    };
  }

  return { status: "approved", reason: "All required clinical data present." };
}

// ECOG SNOMED grade code → integer score
const ECOG_SNOMED_GRADES: Record<string, number> = {
  "425389002": 0, // ECOG performance status - grade 0
  "422512005": 1, // ECOG performance status - grade 1
  "422894000": 2, // ECOG performance status - grade 2
  "423053003": 3, // ECOG performance status - grade 3
};

/**
 * Extract the integer ECOG score from the ecogPs prefetch bundle.
 * Handles both valueInteger (base fixture) and valueCodeableConcept
 * with SNOMED grade codes (DTR-submitted observations).
 */
function extractEcogScore(prefetch: Record<string, unknown>): number | undefined {
  const resources = extractBundleResources(prefetch.ecogPs);
  for (const r of resources) {
    if (!r || typeof r !== "object") continue;
    const obs = r as Record<string, unknown>;
    if (obs.resourceType !== "Observation") continue;
    if (typeof obs.valueInteger === "number") return obs.valueInteger;
    const vc = obs.valueCodeableConcept as { coding?: Array<{ code?: string }> } | undefined;
    if (vc?.coding?.length) {
      const code = vc.coding[0]?.code ?? "";
      if (code in ECOG_SNOMED_GRADES) return ECOG_SNOMED_GRADES[code];
    }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// Card builders
// ---------------------------------------------------------------------------

const DTR_CLIENT_URL = process.env.DTR_CLIENT_URL ?? "http://localhost:4004";

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

export function buildPreApprovedCard(): CdsCard {
  return {
    summary: "Coverage pre-authorized — prior authorization not required",
    detail:
      "All required clinical data is present. ECOG Performance Status 0 qualifies this " +
      "patient for direct coverage. The order may proceed without a prior authorization request.",
    indicator: "info",
    source: {
      ...buildCardSource(),
      topic: {
        system: "http://hl7.org/fhir/us/davinci-crd/CodeSystem/temp",
        code: "prior-auth-not-required",
        display: "Prior Authorization Not Required",
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
  const bearerToken = request.fhirAuthorization?.access_token;

  // Step 1 — Identify the patient's primary condition from the baseline prefetch.
  const entry = findConditionEntry(prefetch.conditions);

  if (!entry) {
    return {
      cards: [
        {
          summary: "No applicable coverage policy",
          detail:
            "No oncology coverage policy is registered for the patient\u2019s primary condition. " +
            "Proceed with standard ordering.",
          indicator: "info",
          source: { label: CRD_SERVICE_TITLE },
        },
      ],
    };
  }

  // Step 2 — Fetch any condition-specific data the EHR did not provide.
  // OGCA-aware EHRs send this proactively; standard EHRs trigger this fallback.
  const missingPrefetchKeys = Object.keys(entry.prefetchTemplates).filter(
    (k) => prefetch[k] == null
  );

  let fullPrefetch = prefetch;
  if (missingPrefetchKeys.length > 0 && request.fhirServer) {
    const missing = Object.fromEntries(
      // biome-ignore lint/style/noNonNullAssertion: keys sourced from Object.keys()
      missingPrefetchKeys.map((k) => [k, entry.prefetchTemplates[k]!])
    );
    const fetched = await resolvePrefetch(missing, request.fhirServer, { patientId }, prefetch, bearerToken);
    fullPrefetch = { ...prefetch, ...fetched };
  }

  // Step 3 — Evaluate the condition-specific payer policy CQL.
  // Only breast cancer CQL is implemented; other registry entries stub to DTR.
  const BREAST_CANCER_CODE = "372137005";
  const result =
    entry.conditionCode === BREAST_CANCER_CODE
      ? await evaluatePayerPolicy(patientId, fullPrefetch)
      : { status: "dtr-required" as const, missingKeys: ["policy-not-yet-implemented"] };

  if (result.status === "pre-approved") {
    return { cards: [buildPreApprovedCard()] };
  }
  if (result.status === "approved") {
    if (request.hook === "order-sign") return { cards: [buildPaRequiredCard()] };
    return { cards: [buildCoverageMetCard()] };
  }
  return { cards: [buildDtrCard(result.missingKeys)] };
}
