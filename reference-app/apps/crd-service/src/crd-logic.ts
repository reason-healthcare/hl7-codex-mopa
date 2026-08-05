/**
 * MOPA CRD Service — business logic layer.
 *
 * This module contains the card builders and the main hook handler. The
 * shared terminology constants, FHIR query templates, and pure evaluation
 * helpers live in `@mopa/oncology-policy` so the payer backend and CRD
 * service reason over identical rules.
 *
 * Per the simplified MOPA specification, the CRD service uses standard
 * CDS Hooks with fhirAuthorization to query the EHR FHIR server directly
 * for oncology patient context. No custom discovery extension, prefetch
 * templates, or condition registry are used.
 */

import type { CdsCard, CdsRequest, CdsResponse, CdsService } from "@mopa/cds-hooks";
import {
  FHIR_QUERIES,
  MISSING_KEY_LABELS,
  evaluateBreastCancerPolicy,
  hasBreastCancer,
  fetchBundle,
  type OncologyContext,
} from "@mopa/oncology-policy";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

import {
  CRD_SERVICE_ID,
  CRD_SERVICE_ID_SIGN,
  CRD_SERVICE_TITLE,
  CRD_DEFAULT_PORT,
} from "./constants";

export {
  CRD_SERVICE_ID,
  CRD_SERVICE_ID_SIGN,
  CRD_SERVICE_TITLE,
  CRD_DEFAULT_PORT,
} from "./constants";

// Re-export shared policy symbols so existing imports keep working.
export {
  FHIR_QUERIES,
  MISSING_KEY_LABELS,
  evaluateBreastCancerPolicy,
  hasBreastCancer,
  type OncologyContext,
  type CheckResult,
} from "@mopa/oncology-policy";

// ---------------------------------------------------------------------------
// Discovery — standard CDS Hooks, no custom extension
// ---------------------------------------------------------------------------

export function buildDiscoveryResponse(): { services: CdsService[] } {
  const baseService: CdsService = {
    id: CRD_SERVICE_ID,
    hook: "order-select",
    title: CRD_SERVICE_TITLE,
    description:
      "Evaluates oncology chemotherapy orders against coverage policy. " +
      "Uses fhirAuthorization to query the EHR FHIR server directly for " +
      "oncology patient context. No prefetch configuration required.",
  };

  return {
    services: [
      baseService,
      {
        ...baseService,
        id: CRD_SERVICE_ID_SIGN,
        hook: "order-sign",
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Card builders — matching the MOPA spec card patterns
// ---------------------------------------------------------------------------

const DTR_CLIENT_URL = process.env.DTR_CLIENT_URL ?? "http://localhost:4004";

function buildCardSource() {
  return {
    label: CRD_SERVICE_TITLE,
    url: `http://localhost:${process.env.PORT ?? CRD_DEFAULT_PORT}/api/cds-services`,
  };
}

export function buildAuthorizationSatisfiedCard(detail?: string): CdsCard {
  return {
    summary: "Authorization Satisfied",
    detail:
      detail ??
      "All required oncology context has been retrieved from the EHR and coverage " +
      "criteria are met. Prior authorization conditions have been evaluated and " +
      "prior authorization can be bypassed.",
    indicator: "success",
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

export function buildPaRequiredCard(detail?: string): CdsCard {
  return {
    summary: "Prior Authorization Required",
    detail:
      detail ??
      "All required oncology context has been retrieved from the EHR and coverage " +
      "criteria are met, but prior authorization is required before fulfillment. " +
      "Submit a PA request to the payer for a coverage determination.",
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

export function buildDtrCard(missingKeys: string[]): CdsCard {
  const missingDisplay = missingKeys.map((k) => MISSING_KEY_LABELS[k] ?? k).join(", ");

  const appContext = JSON.stringify({
    missingDataElements: missingKeys,
  });

  return {
    summary: "Documentation Required",
    detail:
      `The following clinical data is needed to evaluate this order: **${missingDisplay}**. ` +
      "Launch the documentation app to provide the missing information.",
    indicator: "warning",
    source: buildCardSource(),
    links: [
      {
        label: "Complete Prior Authorization Documentation (DTR)",
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
  const fhirBase = request.fhirServer;
  const bearerToken = request.fhirAuthorization?.access_token;

  // If no fhirServer is provided, we cannot query for patient context.
  if (!fhirBase) {
    return {
      cards: [
        {
          summary: "No applicable coverage policy",
          detail:
            "No FHIR server access available. The CRD service requires fhirAuthorization " +
            "to query for oncology patient context. Proceed with standard ordering.",
          indicator: "info",
          source: { label: CRD_SERVICE_TITLE },
        },
      ],
    };
  }

  // Query the EHR FHIR server for oncology patient context.
  const queryResults = await Promise.all(
    Object.entries(FHIR_QUERIES).map(async ([key, queryFn]) => {
      const query = queryFn(patientId);
      const bundle = await fetchBundle(fhirBase, query, bearerToken);
      return [key, bundle] as const;
    })
  );

  const ctx: OncologyContext = {
    conditions: queryResults.find(([k]) => k === "conditions")?.[1] ?? null,
    her2: queryResults.find(([k]) => k === "her2")?.[1] ?? null,
    cancerStage: queryResults.find(([k]) => k === "cancerStage")?.[1] ?? null,
    ecogPs: queryResults.find(([k]) => k === "ecogPs")?.[1] ?? null,
    priorTherapy: queryResults.find(([k]) => k === "priorTherapy")?.[1] ?? null,
  };

  // Check if patient has breast cancer — only breast cancer policy is implemented.
  if (!hasBreastCancer(ctx.conditions)) {
    return {
      cards: [
        {
          summary: "No applicable coverage policy",
          detail:
            "No oncology coverage policy is registered for the patient's primary condition. " +
            "Proceed with standard ordering.",
          indicator: "info",
          source: { label: CRD_SERVICE_TITLE },
        },
      ],
    };
  }

  // Evaluate the breast cancer coverage policy.
  const result = evaluateBreastCancerPolicy(ctx);

  if (result.status === "authorization-satisfied") {
    return { cards: [buildAuthorizationSatisfiedCard(result.reason)] };
  }

  if (result.status === "pa-required") {
    return { cards: [buildPaRequiredCard(result.reason)] };
  }

  return { cards: [buildDtrCard(result.missingKeys)] };
}
