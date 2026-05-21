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
      display: "HER2, Breast cancer specimen",
    },
    answerOption: [
      {
        valueCoding: {
          system: "http://snomed.info/sct",
          code: "10828004",
          display: "Positive (IHC 3+)",
        },
      },
      {
        valueCoding: {
          system: "http://snomed.info/sct",
          code: "42425007",
          display: "Equivocal (IHC 2+)",
        },
      },
      {
        valueCoding: {
          system: "http://snomed.info/sct",
          code: "260385009",
          display: "Negative (IHC 0 / 1+)",
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
          code: "13104003",
          display: "Stage I",
        },
      },
      {
        valueCoding: {
          system: "http://snomed.info/sct",
          code: "60333009",
          display: "Stage II",
        },
      },
      {
        valueCoding: {
          system: "http://snomed.info/sct",
          code: "50283003",
          display: "Stage III",
        },
      },
      {
        valueCoding: {
          system: "http://snomed.info/sct",
          code: "2640006",
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
          system: "http://snomed.info/sct",
          code: "425389002",
          display: "ECOG 0 — Fully active",
        },
      },
      {
        valueCoding: {
          system: "http://snomed.info/sct",
          code: "422512005",
          display: "ECOG 1 — Restricted in strenuous activity",
        },
      },
      {
        valueCoding: {
          system: "http://snomed.info/sct",
          code: "422894000",
          display: "ECOG 2 — Ambulatory, capable of self-care",
        },
      },
      {
        valueCoding: {
          system: "http://snomed.info/sct",
          code: "423053003",
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
