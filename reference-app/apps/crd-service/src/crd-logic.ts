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

import type { CdsAction, CdsCard, CdsRequest, CdsResponse, CdsService } from "@mopa/cds-hooks";
import {
  FHIR_QUERIES,
  MISSING_KEY_LABELS,
  REGIMENS,
  buildReplacementMedicationRequest,
  evaluateBreastCancerPolicy,
  findBiosimilarDrugs,
  hasBreastCancer,
  extractRequestCategories,
  fetchBundle,
  type OncologyContext,
  type Regimen,
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

/**
 * Find biosimilar substitutions for a regimen (by id).
 * Returns human-readable substitution strings for card detail text.
 */
function findSubstitutionDetail(regimenId: string): string | null {
  const regimen = REGIMENS.find((r) => r.id === regimenId) as Regimen | undefined;
  if (!regimen) return null;

  const subs: string[] = [];
  for (const phase of regimen.phases) {
    for (const drug of phase.drugs) {
      if (drug.biosimilars?.length) {
        const bio = drug.biosimilars?.[0];
        if (!bio) continue;
        subs.push(`${drug.display} → ${bio.display}`);
      }
    }
  }
  return subs.length > 0 ? subs.join("; ") : null;
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

/**
 * Informational approvability card for order-select.
 * Uses indicator: "info" (not "success") because the order is not yet signed.
 * The final binding determination comes at order-sign.
 */
export function buildApprovableCard(detail?: string): CdsCard {
  return {
    summary: "Approvable — PA Can Be Bypassed",
    detail:
      detail ??
      "All required oncology context has been retrieved from the EHR and coverage " +
        "criteria are met. This is an informational check at order selection — " +
        "the final determination will be returned at order sign. Prior authorization " +
        "conditions have been evaluated and PA can be bypassed.",
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

/**
 * Build a CDS Hooks suggestion card for biosimilar substitution at order-select.
 *
 * Per the CDS Hooks 2.0 spec, a card may carry `suggestions` with `actions`
 * of type `delete` + `create` to propose replacing a draft order resource.
 * The CRD IG calls this the "Propose Alternate Request" response pattern.
 *
 * The card uses:
 * - `indicator: "info"` — the regimen is approvable, but the payer modifies it
 * - `source.topic.code: "therapy-alternatives-req"` — CRD response type
 * - `selectionBehavior: "at-most-one"` — accept the substitution or proceed as-is
 * - `overrideReasons` — reasons the provider may decline the substitution
 */
export function buildSubstitutionSuggestionCard(
  patientId: string,
  regimen: Regimen,
  options: { includeDeletes?: boolean } = {}
): CdsCard | null {
  const includeDeletes = options.includeDeletes ?? true;
  const biosimilarDrugs = findBiosimilarDrugs(regimen);
  if (biosimilarDrugs.length === 0) return null;

  const actions: CdsAction[] = [];
  const subDescriptions: string[] = [];

  for (const { drug } of biosimilarDrugs) {
    const replacement = buildReplacementMedicationRequest(patientId, drug);
    if (!replacement) continue;

    const bio = drug.biosimilars?.[0];
    if (!bio) continue;

    // order-select may intentionally omit component MedicationRequests. Do
    // not emit delete actions for resources that are not present in that
    // payload; the EHR reconstructs the full order when the suggestion is
    // accepted. order-sign includes components and can use delete+create.
    if (includeDeletes) {
      actions.push({
        type: "delete",
        description: `Remove original ${drug.display} order`,
        resourceId: replacement.resourceId,
      });
    }

    // Create the replacement MedicationRequest with the biosimilar
    actions.push({
      type: "create",
      description: `Substitute ${bio.display} for ${drug.display}`,
      resource: replacement.resource,
    });

    subDescriptions.push(`${drug.display} → ${bio.display}`);
  }

  if (actions.length === 0) return null;

  const subText = subDescriptions.join("; ");

  return {
    uuid: crypto.randomUUID(),
    summary: "Payer Modification Required — Step-Therapy Substitution",
    detail:
      `Coverage criteria are met, but the payer policy requires the following ` +
      `substitution: **${subText}**. Accept the substitution to proceed with ` +
      `the payer-approved regimen, or override if clinically contraindicated.`,
    indicator: "info",
    source: {
      ...buildCardSource(),
      topic: {
        system: "http://hl7.org/fhir/us/davinci-crd/CodeSystem/temp",
        code: "therapy-alternatives-req",
        display: "Propose Alternate Request",
      },
    },
    suggestions: [
      {
        label: `Accept Substitution (${subText})`,
        uuid: crypto.randomUUID(),
        isRecommended: true,
        actions,
      },
    ],
    selectionBehavior: "at-most-one",
  };
}

/**
 * Informational PA-required card for order-select.
 * Uses indicator: "warning" to advise the provider that PA will be needed.
 */
export function buildPaWillBeRequiredCard(detail?: string): CdsCard {
  return {
    summary: "PA Will Be Required",
    detail:
      detail ??
      "All required oncology context has been retrieved from the EHR and coverage " +
        "criteria are met, but prior authorization will be required before fulfillment. " +
        "You may proceed with signing — a PA request will be submitted to the payer.",
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
// Substitution verification at order-sign
// ---------------------------------------------------------------------------

/**
 * Check whether the draft orders contain any non-preferred drugs that the
 * payer requires to be substituted. At order-sign, if a required substitution
 * was NOT applied (the provider overrode the suggestion), the order cannot
 * be approved.
 *
 * @returns list of unsubstituted drug display names, or empty if all clear
 */
function findUnsubstitutedDrugs(
  draftOrders: { entry?: Array<{ resource?: Record<string, unknown> }> } | undefined,
  regimen: Regimen | undefined
): string[] {
  if (!draftOrders || !regimen) return [];

  const biosimilarDrugs = findBiosimilarDrugs(regimen);
  if (biosimilarDrugs.length === 0) return [];

  // Collect RxNorm codes of the original (non-preferred) drugs
  const nonPreferredCodes = new Set(biosimilarDrugs.map(({ drug }) => drug.rxnorm));

  // Scan MedicationRequest resources in the draft orders
  const unsubstituted: string[] = [];
  for (const entry of draftOrders.entry ?? []) {
    const res = entry.resource;
    if (!res || res.resourceType !== "MedicationRequest") continue;
    const mcc = res.medicationCodeableConcept as
      | { coding?: Array<{ system?: string; code?: string }> }
      | undefined;
    const rxnormCode = mcc?.coding?.find(
      (c) => c.system === "http://www.nlm.nih.gov/research/umls/rxnorm"
    )?.code;
    if (rxnormCode && nonPreferredCodes.has(rxnormCode)) {
      const drug = biosimilarDrugs.find(({ drug }) => drug.rxnorm === rxnormCode)?.drug;
      if (drug) unsubstituted.push(drug.display);
    }
  }
  return unsubstituted;
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

  const categoryResult = extractRequestCategories(request.context.draftOrders);
  ctx.requestCategories = categoryResult.categories;
  ctx.invalidRequestCategories = categoryResult.invalid;

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

  // Determine the hook type to select the appropriate card semantics.
  // order-select: informational (info/warning) — advisory, order not yet signed.
  // order-sign: final determination (success/warning) — binding.
  const isOrderSelect = request.hook === "order-select";

  if (result.status === "authorization-satisfied") {
    // Check if the ordered regimen has required biosimilar substitutions.
    // The draftOrders Bundle contains the RequestGroup with
    // instantiatesCanonical pointing to the regimen PlanDefinition.
    const draftOrders = request.context.draftOrders as {
      entry?: Array<{ resource?: Record<string, unknown> }>;
    };
    const rg = draftOrders?.entry?.find(
      (e) => e.resource?.resourceType === "RequestGroup"
    )?.resource;
    const canonical = rg ? (rg.instantiatesCanonical as string[] | undefined)?.[0] : undefined;
    const regimen = canonical ? REGIMENS.find((r) => r.canonicalUrl === canonical) : undefined;
    const subDetail = regimen ? findSubstitutionDetail(regimen.id) : null;

    const detail = subDetail
      ? `${result.reason} **Payer modification required: ${subDetail}.**`
      : result.reason;

    if (isOrderSelect) {
      // At order-select: return the informational approvable card.
      // If the regimen has biosimilar substitutions, also return a
      // suggestion card so the provider can accept or override the
      // replacement before signing.
      const cards: CdsCard[] = [buildApprovableCard(detail)];

      if (regimen) {
        const hasMedicationRequests = (draftOrders?.entry ?? []).some(
          (entry) => entry.resource?.resourceType === "MedicationRequest"
        );
        const subCard = buildSubstitutionSuggestionCard(patientId, regimen, {
          includeDeletes: hasMedicationRequests,
        });
        if (subCard) cards.push(subCard);
      }

      return { cards };
    }

    // order-sign: verify that required substitutions were applied.
    // If the provider overrode the substitution suggestion, the draft orders
    // still contain the non-preferred drug and the order cannot be approved.
    if (!isOrderSelect && regimen) {
      const unsubstituted = findUnsubstitutedDrugs(
        request.context.draftOrders as
          | { entry?: Array<{ resource?: Record<string, unknown> }> }
          | undefined,
        regimen
      );
      if (unsubstituted.length > 0) {
        const drugList = unsubstituted.join(", ");
        return {
          cards: [
            buildPaRequiredCard(
              `Required substitution not applied: ${drugList}. ` +
                `The payer will not approve this order without the preferred ` +
                `product. Accept the substitution or submit a PA with ` +
                `exception justification.`
            ),
          ],
        };
      }
    }

    // order-sign: final authorization satisfied card (success indicator)
    return {
      cards: [buildAuthorizationSatisfiedCard(detail)],
    };
  }

  if (result.status === "pa-required") {
    // order-select: informational "PA will be required" (warning)
    // order-sign: final "PA required" (warning)
    return {
      cards: [
        isOrderSelect
          ? buildPaWillBeRequiredCard(result.reason)
          : buildPaRequiredCard(result.reason),
      ],
    };
  }

  return { cards: [buildDtrCard(result.missingKeys)] };
}
