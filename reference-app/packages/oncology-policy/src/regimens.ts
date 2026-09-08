/**
 * MOPA oncology regimen data model and FHIR bundle builder.
 *
 * Extracted from the EHR OrderEntryClient component so the regimen
 * definitions, MOPA canonical URLs, and the AntiCancerRegimenRequestGroup
 * builder are shared, testable, and reusable by any app that needs to
 * construct a draft oncology order Bundle.
 */

// ---------------------------------------------------------------------------
// MOPA canonical base + extension URLs
// ---------------------------------------------------------------------------

export const MOPA_BASE = "http://hl7.org/fhir/us/codex-mopa";
export const RXNORM = "http://www.nlm.nih.gov/research/umls/rxnorm";
const SNOMED = "http://snomed.info/sct";
export const TREATMENT_LINE = `${MOPA_BASE}/CodeSystem/treatment-line-cs`;
/** Da Vinci CRD's repeatable request-category extension (0..* on RequestGroup). */
export const EXT_REQUEST_CATEGORY =
  "http://hl7.org/fhir/us/davinci-crd/StructureDefinition/ext-request-category";
export const EXT_DAYS = `${MOPA_BASE}/StructureDefinition/regimen-days-of-cycle`;
export const REQUEST_GROUP_PROFILE = `${MOPA_BASE}/StructureDefinition/anticancer-regimen-requestgroup`;

export interface RegimenCategory {
  system: string;
  code: string;
  display: string;
}

const REGIMEN_INTENT_CODES = new Set([
  "373808002", // Curative
  "363676003", // Palliative
  "373846009", // Adjuvant
  "373847000", // Neoadjuvant
  "399707004", // Supportive
]);

/** True when a generic request category is one of the IG's regimen-intent codes. */
export function isRegimenIntentCategory(category: RegimenCategory): boolean {
  return category.system === SNOMED && REGIMEN_INTENT_CODES.has(category.code);
}

// ---------------------------------------------------------------------------
// Regimen data model
// ---------------------------------------------------------------------------

/**
 * A biosimilar alternative for a drug in a regimen.
 * Payer formulary policies may require substituting an originator
 * biologic with an FDA-approved biosimilar when one is available.
 */
export interface BiosimilarAlternative {
  rxnorm: string;
  display: string;
  /** Why the payer prefers this product (formulary rule, cost, etc.). */
  rationale: string;
}

export interface DrugEntry {
  actionId: string;
  title: string;
  rxnorm: string;
  display: string;
  dosageText: string;
  period: number; // cycle period in days
  count?: number; // number of cycles (omit = indefinite)
  daysOfCycle?: number[]; // which days within the cycle (1-indexed)
  /** Biosimilar alternatives the payer may require as substitutions. */
  biosimilars?: BiosimilarAlternative[];
}

/** A phase groups concurrent drugs; sequential regimens have multiple phases. */
export interface Phase {
  id: string;
  title: string;
  period: number;
  count?: number;
  afterPhase?: string; // relatedAction.actionId with relationship=after-end
  drugs: DrugEntry[];
}

export interface Regimen {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  /** AntiCancerRegimenPlanDefinition canonical URL. */
  canonicalUrl: string;
  /**
   * Catalog defaults used by the demo order-entry UI. These are copied into
   * the patient-specific RequestGroup only when the caller does not provide
   * explicit categories; they are not protocol properties or PlanDefinition
   * extensions.
   */
  defaultCategories: RegimenCategory[];
  /** Concurrent regimens have one phase; sequential have multiple. */
  phases: Phase[];
}

/** Read a catalog display category without making it part of protocol data. */
export function findRegimenCategory(
  regimen: Regimen,
  predicate: (category: RegimenCategory) => boolean
): RegimenCategory | undefined {
  return regimen.defaultCategories.find(predicate);
}

// ---------------------------------------------------------------------------
// Regimen definitions
// ---------------------------------------------------------------------------

export const REGIMENS: Regimen[] = [
  {
    id: "TH",
    label: "TH \u2014 Trastuzumab + Paclitaxel",
    shortLabel: "TH",
    description:
      "Weekly paclitaxel with trastuzumab. First-line adjuvant for HER2+ early breast cancer.",
    canonicalUrl: `${MOPA_BASE}/PlanDefinition/RegimenTH`,
    defaultCategories: [
      { system: SNOMED, code: "373846009", display: "Adjuvant - intent" },
      { system: TREATMENT_LINE, code: "1L", display: "First-line" },
    ],
    phases: [
      {
        id: "th-phase",
        title: "TH (weekly \u00d7 12 weeks)",
        period: 21,
        drugs: [
          {
            actionId: "paclitaxel-th",
            title: "Paclitaxel 80 mg/m\u00b2 IV \u2014 days 1, 8, 15 of 21-day cycle",
            rxnorm: "56946",
            display: "paclitaxel",
            dosageText: "80 mg/m\u00b2 IV over 1 hour, weekly (days 1, 8, 15 of 21-day cycle)",
            period: 21,
            daysOfCycle: [1, 8, 15],
          },
          {
            actionId: "trastuzumab-th",
            title: "Trastuzumab IV \u2014 days 1, 8, 15 of 21-day cycle",
            rxnorm: "224905",
            display: "trastuzumab",
            dosageText: "4 mg/kg IV loading dose week 1, then 2 mg/kg IV weekly (days 1, 8, 15)",
            period: 21,
            daysOfCycle: [1, 8, 15],
          },
        ],
      },
    ],
  },
  {
    id: "ddAC-T",
    label: "ddAC\u2192T \u2014 Dose-dense AC \u2192 Paclitaxel",
    shortLabel: "ddAC\u2192T",
    description:
      "Dose-dense doxorubicin/cyclophosphamide then paclitaxel, with pegfilgrastim (G-CSF) support. Adjuvant for ER-positive, HER2-negative breast cancer when Oncotype DX indicates chemotherapy benefit.",
    canonicalUrl: `${MOPA_BASE}/PlanDefinition/RegimenDdACT`,
    defaultCategories: [
      { system: SNOMED, code: "373846009", display: "Adjuvant - intent" },
      { system: TREATMENT_LINE, code: "1L", display: "First-line" },
    ],
    phases: [
      {
        id: "ac-phase",
        title: "AC Phase (q14d \u00d7 4 cycles)",
        period: 14,
        count: 4,
        drugs: [
          {
            actionId: "doxorubicin-ac",
            title: "Doxorubicin 60 mg/m\u00b2 IV \u2014 day 1 of each 14-day cycle",
            rxnorm: "3639",
            display: "doxorubicin",
            dosageText: "60 mg/m\u00b2 IV, day 1 of each 14-day cycle",
            period: 14,
            daysOfCycle: [1],
          },
          {
            actionId: "cyclophosphamide-ac",
            title: "Cyclophosphamide 600 mg/m\u00b2 IV \u2014 day 1 of each 14-day cycle",
            rxnorm: "3002",
            display: "cyclophosphamide",
            dosageText: "600 mg/m\u00b2 IV, day 1 of each 14-day cycle",
            period: 14,
            daysOfCycle: [1],
          },
          {
            actionId: "pegfilgrastim-ac",
            title: "Pegfilgrastim 6 mg SC \u2014 day 2 of each 14-day cycle (G-CSF support)",
            rxnorm: "67108",
            display: "pegfilgrastim (Neulasta)",
            dosageText:
              "6 mg subcutaneous, day 2 of each 14-day cycle (G-CSF support for dose-dense regimen)",
            period: 14,
            daysOfCycle: [2],
            biosimilars: [
              {
                rxnorm: "2102692",
                display: "pegfilgrastim-cbqv (Udenyca)",
                rationale:
                  "Payer step-therapy policy requires pegfilgrastim-cbqv (Udenyca) unless the patient has received Neulasta in the past 365 days, has a contraindication, or has previously failed Neulasta",
              },
            ],
          },
        ],
      },
      {
        id: "t-phase",
        title: "T Phase \u2014 Paclitaxel (q14d \u00d7 4 cycles)",
        period: 14,
        count: 4,
        afterPhase: "ac-phase",
        drugs: [
          {
            actionId: "paclitaxel-t",
            title: "Paclitaxel 175 mg/m\u00b2 IV \u2014 day 1 of each 14-day cycle",
            rxnorm: "56946",
            display: "paclitaxel",
            dosageText: "175 mg/m\u00b2 IV over 3 hours, day 1 of each 14-day cycle",
            period: 14,
            daysOfCycle: [1],
          },
        ],
      },
    ],
  },
  {
    id: "PHD",
    label: "PHD \u2014 Pertuzumab + Trastuzumab + Docetaxel",
    shortLabel: "PHD",
    description:
      "Pertuzumab, trastuzumab, and docetaxel q21d. First-line for HER2+ metastatic breast cancer.",
    canonicalUrl: `${MOPA_BASE}/PlanDefinition/RegimenPHD`,
    defaultCategories: [
      { system: SNOMED, code: "363676003", display: "Palliative intent" },
      { system: TREATMENT_LINE, code: "1L", display: "First-line" },
    ],
    phases: [
      {
        id: "phd-phase",
        title: "PHD (q21d)",
        period: 21,
        drugs: [
          {
            actionId: "pertuzumab-phd",
            title: "Pertuzumab IV \u2014 day 1 of each 21-day cycle",
            rxnorm: "1298944",
            display: "pertuzumab",
            dosageText: "840 mg IV cycle 1, then 420 mg IV q21d, day 1",
            period: 21,
            daysOfCycle: [1],
          },
          {
            actionId: "trastuzumab-phd",
            title: "Trastuzumab IV \u2014 day 1 of each 21-day cycle",
            rxnorm: "224905",
            display: "trastuzumab",
            dosageText: "8 mg/kg IV cycle 1, then 6 mg/kg IV q21d, day 1",
            period: 21,
            daysOfCycle: [1],
          },
          {
            actionId: "docetaxel-phd",
            title: "Docetaxel 75 mg/m\u00b2 IV \u2014 day 1 of each 21-day cycle",
            rxnorm: "72962",
            display: "docetaxel",
            dosageText: "75 mg/m\u00b2 IV, day 1 of each 21-day cycle",
            period: 21,
            daysOfCycle: [1],
          },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// AntiCancerRegimenRequestGroup builder
// Per MOPA IG: the RequestGroup IS the unit of PA evaluation.
// MedicationRequests are component resources referenced from action.resource.
// ---------------------------------------------------------------------------

function daysOfCycleExt(days: number[]) {
  return {
    url: EXT_DAYS,
    extension: days.map((d) => ({ url: "day", valueInteger: d })),
  };
}

function buildTimingTiming(drug: DrugEntry) {
  return {
    ...(drug.daysOfCycle?.length ? { extension: [daysOfCycleExt(drug.daysOfCycle)] } : {}),
    repeat: {
      period: drug.period,
      periodUnit: "d" as const,
      ...(drug.count ? { count: drug.count } : {}),
    },
  };
}

function buildMedicationRequest(patientId: string, drug: DrugEntry) {
  return {
    resourceType: "MedicationRequest",
    status: "draft",
    intent: "order",
    subject: { reference: `Patient/${patientId}` },
    medicationCodeableConcept: {
      coding: [{ system: RXNORM, code: drug.rxnorm, display: drug.display }],
      text: drug.display,
    },
    dosageInstruction: [{ text: drug.dosageText }],
  };
}

/**
 * Build a FHIR Bundle (type = collection) containing an
 * AntiCancerRegimenRequestGroup and its component MedicationRequests
 * for the given regimen and patient.
 */
export type DraftOrderStage = "order-select" | "order-sign";

export interface DraftBundleOptions {
  /** Categories are patient/order context and may contain any 0..* values. */
  categories?: RegimenCategory[];
  /** order-select may carry only the RequestGroup; order-sign carries components. */
  stage?: DraftOrderStage;
}

export function buildDraftBundle(
  patientId: string,
  regimen: Regimen,
  options: DraftBundleOptions = {}
) {
  const categories = options.categories ?? regimen.defaultCategories;
  // Keep the historical full bundle as the default for non-hook callers such
  // as substitution acceptance. Hook callers pass their explicit stage.
  const stage = options.stage ?? "order-sign";
  // 1. Generate a stable fullUrl for the RequestGroup
  const rgId = `rg-${regimen.id}`;
  const rgFullUrl = `urn:uuid:${rgId}`;

  // 2. Build one MedicationRequest per drug component
  const medEntries: Array<{ fullUrl: string; resource: object }> = [];
  for (const phase of regimen.phases) {
    for (const drug of phase.drugs) {
      medEntries.push({
        fullUrl: `urn:uuid:mr-${drug.actionId}`,
        resource: buildMedicationRequest(patientId, drug),
      });
    }
  }

  // 3. Build RequestGroup actions from phases
  const actions = regimen.phases.map((phase) => {
    const phaseAction: Record<string, unknown> = {
      id: phase.id,
      title: phase.title,
      timingTiming: {
        repeat: {
          period: phase.period,
          periodUnit: "d",
          ...(phase.count ? { count: phase.count } : {}),
        },
      },
      ...(phase.afterPhase
        ? {
            relatedAction: [{ actionId: phase.afterPhase, relationship: "after-end" }],
          }
        : {}),
      // Nested actions: one per drug in this phase
      action: phase.drugs.map((drug) => ({
        id: drug.actionId,
        title: drug.title,
        timingTiming: buildTimingTiming(drug),
        resource: { reference: `urn:uuid:mr-${drug.actionId}` },
      })),
    };
    return phaseAction;
  });

  // 4. Build the RequestGroup (AntiCancerRegimenRequestGroup)
  const requestGroup = {
    resourceType: "RequestGroup",
    id: rgId,
    status: "draft",
    intent: "order",
    subject: { reference: `Patient/${patientId}` },
    instantiatesCanonical: [regimen.canonicalUrl],
    meta: { profile: [REQUEST_GROUP_PROFILE] },
    extension: categories.map((category) => ({
      url: EXT_REQUEST_CATEGORY,
      valueCodeableConcept: { coding: [category] },
    })),
    action: actions,
  };

  return {
    resourceType: "Bundle",
    type: "collection" as const,
    entry:
      stage === "order-select"
        ? [{ fullUrl: rgFullUrl, resource: requestGroup }]
        : [{ fullUrl: rgFullUrl, resource: requestGroup }, ...medEntries],
  };
}

// ---------------------------------------------------------------------------
// Biosimilar substitution helpers
// ---------------------------------------------------------------------------

/**
 * Build a replacement MedicationRequest for a biosimilar substitution.
 *
 * Given a drug entry that has biosimilar alternatives, this produces a new
 * MedicationRequest with the biosimilar's RxNorm code and display, keeping
 * the same dosage instructions and patient reference.
 *
 * @returns the replacement MedicationRequest resource, or null if the drug
 *          has no biosimilar alternatives.
 */
export function buildReplacementMedicationRequest(
  patientId: string,
  drug: DrugEntry
): { resource: object; resourceId: string } | null {
  const bio = drug.biosimilars?.[0];
  if (!bio) return null;

  return {
    resourceId: `urn:uuid:mr-${drug.actionId}`,
    resource: {
      resourceType: "MedicationRequest",
      status: "draft",
      intent: "order",
      subject: { reference: `Patient/${patientId}` },
      medicationCodeableConcept: {
        coding: [{ system: RXNORM, code: bio.rxnorm, display: bio.display }],
        text: bio.display,
      },
      dosageInstruction: [{ text: drug.dosageText }],
      substitution: {
        allowed: true,
        reason: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v3-ActReason",
              code: "FP",
              display: "Formulary Policy",
            },
          ],
        },
      },
    },
  };
}

/**
 * Find all drugs in a regimen that have biosimilar alternatives.
 */
export function findBiosimilarDrugs(regimen: Regimen): Array<{ phase: Phase; drug: DrugEntry }> {
  const result: Array<{ phase: Phase; drug: DrugEntry }> = [];
  for (const phase of regimen.phases) {
    for (const drug of phase.drugs) {
      if (drug.biosimilars?.length) {
        result.push({ phase, drug });
      }
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Display helper: apply biosimilar substitution to a regimen
// ---------------------------------------------------------------------------

/**
 * Return a deep copy of the regimen where every drug that has a biosimilar
 * alternative is replaced with that alternative's display name and RxNorm
 * code. The dosage text, timing, and cycle structure are preserved.
 *
 * This is a *display-only* helper — it does not modify the original regimen
 * object. The actual FHIR draft-order modifications happen in the EHR layer
 * via `buildReplacementMedicationRequest` + the CDS suggestion actions.
 *
 * @param regimen  the original regimen template
 * @returns a new Regimen with biosimilar drugs substituted
 */
export function applyBiosimilarSubstitution(regimen: Regimen): Regimen {
  return {
    ...regimen,
    phases: regimen.phases.map((phase) => ({
      ...phase,
      drugs: phase.drugs.map((drug) => {
        const bio = drug.biosimilars?.[0];
        if (!bio) return drug;
        return {
          ...drug,
          display: bio.display,
          rxnorm: bio.rxnorm,
        };
      }),
    })),
  };
}
