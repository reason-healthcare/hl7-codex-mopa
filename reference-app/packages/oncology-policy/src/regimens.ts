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
export const EXT_INTENT = `${MOPA_BASE}/StructureDefinition/ocpa-regimen-intent`;
export const EXT_LINE = `${MOPA_BASE}/StructureDefinition/ocpa-regimen-treatment-line`;
export const EXT_DAYS = `${MOPA_BASE}/StructureDefinition/regimen-days-of-cycle`;

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
  intent: { code: string; display: string; system?: string };
  treatmentLine: { code: string; display: string };
  /** Concurrent regimens have one phase; sequential have multiple. */
  phases: Phase[];
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
    intent: { code: "373846009", display: "Adjuvant - intent", system: SNOMED },
    treatmentLine: { code: "1L", display: "First-line" },
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
            biosimilars: [
              {
                rxnorm: "1992624",
                display: "trastuzumab-dttb (Ontrudy)",
                rationale: "Payer requires biosimilar substitution when an FDA-approved biosimilar is available",
              },
            ],
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
      "Dose-dense doxorubicin/cyclophosphamide then paclitaxel. Adjuvant for HER2-negative breast cancer.",
    canonicalUrl: `${MOPA_BASE}/PlanDefinition/RegimenDdACT`,
    intent: { code: "373846009", display: "Adjuvant - intent", system: SNOMED },
    treatmentLine: { code: "1L", display: "First-line" },
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
    intent: { code: "363676003", display: "Palliative intent", system: SNOMED },
    treatmentLine: { code: "1L", display: "First-line" },
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
            biosimilars: [
              {
                rxnorm: "1992624",
                display: "trastuzumab-dttb (Ontrudy)",
                rationale: "Payer requires biosimilar substitution when an FDA-approved biosimilar is available",
              },
            ],
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
    ...(drug.daysOfCycle?.length
      ? { extension: [daysOfCycleExt(drug.daysOfCycle)] }
      : {}),
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
export function buildDraftBundle(patientId: string, regimen: Regimen) {
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
    extension: [
      {
        url: EXT_INTENT,
        valueCodeableConcept: {
          coding: [
            {
              system: regimen.intent.system ?? SNOMED,
              code: regimen.intent.code,
              display: regimen.intent.display,
            },
          ],
        },
      },
      {
        url: EXT_LINE,
        valueCodeableConcept: {
          coding: [
            {
              system: TREATMENT_LINE,
              code: regimen.treatmentLine.code,
              display: regimen.treatmentLine.display,
            },
          ],
        },
      },
    ],
    action: actions,
  };

  return {
    resourceType: "Bundle",
    type: "collection" as const,
    entry: [{ fullUrl: rgFullUrl, resource: requestGroup }, ...medEntries],
  };
}
