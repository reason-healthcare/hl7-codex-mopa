/**
 * Condition registry — maps primary cancer condition codes to their
 * condition-specific Library pair and CDS Hooks prefetch templates.
 *
 * The CRD service uses this registry to:
 *   1. Build the conditionDataRequirements extension on the discovery document
 *   2. Route incoming hook calls to the correct payer policy
 *   3. Fall back to dynamic fhirServer queries when prefetch is absent
 *
 * Adding a new cancer type requires one new entry here.
 */
import { LIBRARY_CANONICAL, CATALOG_URL, BASE_URL } from "./constants";

export { CATALOG_URL };

export interface ConditionRegistryEntry {
  conditionCode: string;
  conditionSystem: string;
  conditionDisplay: string;
  /** Canonical URL of the condition-specific payer policy Library. */
  libraryUrl: string;
  /** Canonical URL of the condition-specific guideline Library. */
  guidelineUrl: string;
  /**
   * CDS Hooks prefetch template strings for this condition.
   * Published in the discovery extension so OGCA-aware EHRs can
   * proactively prefetch; also used by the CRD fhirServer fallback.
   */
  prefetchTemplates: Record<string, string>;
}

export const CONDITION_REGISTRY: ConditionRegistryEntry[] = [
  {
    conditionCode: "372137005",
    conditionSystem: "http://snomed.info/sct",
    conditionDisplay: "Primary malignant neoplasm of breast",
    libraryUrl: LIBRARY_CANONICAL,
    guidelineUrl: `${BASE_URL}/Library/BreastCancerGuideline`,
    prefetchTemplates: {
      her2: "Observation?patient={{context.patientId}}&code=http://loinc.org|85319-2,http://snomed.info/sct|431396003&_sort=-date&_count=5",
      cancerStage:
        "Observation?patient={{context.patientId}}&code=http://loinc.org|21908-9&_sort=-date&_count=1",
      ecogPs:
        "Observation?patient={{context.patientId}}&code=http://loinc.org|89247-1&_sort=-date&_count=1",
    },
  },
  {
    conditionCode: "254637007",
    conditionSystem: "http://snomed.info/sct",
    conditionDisplay: "Non-small cell lung cancer",
    libraryUrl: `${BASE_URL}/Library/LungCancerPayerPolicy`,
    guidelineUrl: `${BASE_URL}/Library/LungCancerGuideline`,
    prefetchTemplates: {
      egfr: "Observation?patient={{context.patientId}}&code=http://loinc.org|21665-5&_sort=-date&_count=1",
      alk: "Observation?patient={{context.patientId}}&code=http://loinc.org|78205-2&_sort=-date&_count=1",
      pdl1: "Observation?patient={{context.patientId}}&code=http://loinc.org|105302-4&_sort=-date&_count=1",
    },
  },
];

/**
 * Find the registry entry for a patient's primary condition.
 * Matches against code.coding in any Condition resource in the bundle.
 */
export function findConditionEntry(conditionsBundle: unknown): ConditionRegistryEntry | undefined {
  if (!conditionsBundle || typeof conditionsBundle !== "object") return undefined;
  const bundle = conditionsBundle as { entry?: Array<{ resource?: unknown }> };
  const resources = (bundle.entry ?? [])
    .map((e) => e.resource)
    .filter((r): r is Record<string, unknown> => !!r);

  for (const resource of resources) {
    if (resource.resourceType !== "Condition") continue;
    const codings =
      (resource.code as { coding?: Array<{ system?: string; code?: string }> })?.coding ?? [];
    for (const coding of codings) {
      const entry = CONDITION_REGISTRY.find(
        (e) => e.conditionCode === coding.code && e.conditionSystem === coding.system
      );
      if (entry) return entry;
    }
  }
  return undefined;
}
