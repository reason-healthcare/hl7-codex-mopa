/**
 * Questionnaire generation for the DTR Client.
 *
 * Builds an in-memory questionnaire from the missing DataRequirement keys
 * reported by the CRD service. Only items listed in missingKeys are included —
 * no questions are shown for data already present in the FHIR server.
 */

export interface AnswerCoding {
  system: string;
  code: string;
  display: string;
}

export interface QItem {
  linkId: string;
  text: string;
  type: "choice";
  /** FHIR Observation code used when writing back an Observation. */
  observationCode: AnswerCoding;
  answerOption: Array<{ valueCoding: AnswerCoding }>;
}

export interface QuestionnaireDef {
  items: QItem[];
}

/** Per-item definitions keyed by DataKey (matches CRD missingKeys). */
export const ITEM_DEFINITIONS: Record<string, QItem> = {
  her2: {
    linkId: "her2",
    text: "HER2 Status",
    type: "choice",
    observationCode: {
      system: "http://loinc.org",
      code: "85319-2",
      display: "HER2 [Presence] in Breast cancer specimen by Immune stain",
    },
    answerOption: [
      {
        valueCoding: {
          system: "http://snomed.info/sct",
          code: "431396003",
          display: "IHC 3+ (Positive)",
        },
      },
      {
        valueCoding: {
          system: "http://snomed.info/sct",
          code: "431397007",
          display: "IHC 2+ / ISH Amplified",
        },
      },
      {
        valueCoding: {
          system: "http://snomed.info/sct",
          code: "260385009",
          display: "IHC 0 / IHC 1+ (Negative)",
        },
      },
    ],
  },
  cancerStage: {
    linkId: "cancerStage",
    text: "Cancer Stage",
    type: "choice",
    observationCode: {
      system: "http://loinc.org",
      code: "21908-9",
      display: "Stage group.clinical Cancer",
    },
    answerOption: [
      {
        valueCoding: {
          system: "http://snomed.info/sct",
          code: "1228882005",
          display: "Stage I",
        },
      },
      {
        valueCoding: {
          system: "http://snomed.info/sct",
          code: "1229947003",
          display: "Stage II",
        },
      },
      {
        valueCoding: {
          system: "http://snomed.info/sct",
          code: "1229966003",
          display: "Stage III",
        },
      },
      {
        valueCoding: {
          system: "http://snomed.info/sct",
          code: "1229967007",
          display: "Stage IV",
        },
      },
    ],
  },
  ecogPs: {
    linkId: "ecogPs",
    text: "ECOG Performance Status",
    type: "choice",
    observationCode: {
      system: "http://loinc.org",
      code: "89247-1",
      display: "ECOG Performance Status score",
    },
    answerOption: [
      {
        valueCoding: {
          system: "http://loinc.org",
          code: "LA9622-7",
          display: "ECOG 0 — Fully active",
        },
      },
      {
        valueCoding: {
          system: "http://loinc.org",
          code: "LA9623-5",
          display: "ECOG 1 — Restricted in strenuous activity",
        },
      },
      {
        valueCoding: {
          system: "http://loinc.org",
          code: "LA9624-3",
          display: "ECOG 2 — Ambulatory, capable of self-care",
        },
      },
      {
        valueCoding: {
          system: "http://loinc.org",
          code: "LA9625-0",
          display: "ECOG 3 — Limited self-care",
        },
      },
    ],
  },
};

/**
 * Build a questionnaire for the given missing DataRequirement keys.
 * Unknown keys are silently dropped.
 */
export function buildQuestionnaire(missingKeys: string[]): QuestionnaireDef {
  const items = missingKeys
    .map((k) => ITEM_DEFINITIONS[k])
    .filter((item): item is QItem => item !== undefined);
  return { items };
}
