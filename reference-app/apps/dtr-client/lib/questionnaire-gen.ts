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

export interface ChoiceQuestionItem {
  linkId: string;
  text: string;
  type: "choice";
  /** FHIR Observation code used when writing back an Observation. */
  observationCode: AnswerCoding;
  answerOption: Array<{ valueCoding: AnswerCoding }>;
}

export interface TextQuestionItem {
  linkId: string;
  text: string;
  type: "text";
}

export type QItem = ChoiceQuestionItem | TextQuestionItem;
export type QuestionnaireAnswer = AnswerCoding | string;

export interface QuestionnaireDef {
  items: QItem[];
  canonical?: string;
  contextReference?: string;
  coverageReference?: string;
}

export interface PartnerQuestionnairePackageResult {
  questionnaire?: QuestionnaireDef;
  error?: string;
}

/** Per-item definitions keyed by DataKey (matches CRD missingKeys). */
export const ITEM_DEFINITIONS: Record<string, ChoiceQuestionItem> = {
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
    .filter((item): item is ChoiceQuestionItem => item !== undefined);
  return { items };
}

/** Extract the Questionnaire selected by a partner DTR $questionnaire-package response. */
export function buildQuestionnaireFromPackage(
  payload: unknown
): PartnerQuestionnairePackageResult {
  if (!payload || typeof payload !== "object") {
    return { error: "The partner package is not a FHIR Parameters resource." };
  }
  const parameters = (payload as { parameter?: unknown }).parameter;
  if (!Array.isArray(parameters)) {
    return { error: "The partner package does not contain Parameters.parameter." };
  }
  const bundle = parameters.find(
    (
      parameter
    ): parameter is { name?: unknown; resource?: { resourceType?: unknown; entry?: unknown } } =>
      Boolean(
        parameter &&
          typeof parameter === "object" &&
          (parameter as { name?: unknown }).name === "packagebundle" &&
          (parameter as { resource?: { resourceType?: unknown } }).resource?.resourceType ===
            "Bundle"
      )
  )?.resource;
  if (!bundle || !Array.isArray(bundle.entry)) {
    return { error: "The partner package does not contain a packagebundle Bundle." };
  }
  const questionnaire = bundle.entry
    .map((entry) =>
      entry && typeof entry === "object" ? (entry as { resource?: unknown }).resource : undefined
    )
    .find(
      (
        resource
      ): resource is {
        resourceType: "Questionnaire";
        url?: unknown;
        version?: unknown;
        item?: unknown;
      } =>
        Boolean(
          resource &&
            typeof resource === "object" &&
            (resource as { resourceType?: unknown }).resourceType === "Questionnaire"
        )
    );
  if (!questionnaire) {
    return { error: "The partner package does not contain a Questionnaire resource." };
  }
  if (!Array.isArray(questionnaire.item)) {
    return { error: "The partner Questionnaire has no items to render." };
  }

  const items: QItem[] = [];
  for (const item of questionnaire.item) {
    if (!item || typeof item !== "object") {
      return { error: "The partner Questionnaire contains an invalid item." };
    }
    const candidate = item as {
      linkId?: unknown;
      text?: unknown;
      type?: unknown;
      code?: unknown;
      answerOption?: unknown;
    };
    const itemLabel =
      typeof candidate.text === "string"
        ? `“${candidate.text}”${typeof candidate.linkId === "string" ? ` (linkId: ${candidate.linkId})` : ""}`
        : typeof candidate.linkId === "string"
          ? `linkId “${candidate.linkId}”`
          : "an unnamed item";
    if (candidate.type === "text") {
      if (typeof candidate.linkId !== "string" || typeof candidate.text !== "string") {
        return {
          error: `The partner Questionnaire contains ${itemLabel}, but a text question needs both linkId and text.`,
        };
      }
      items.push({ linkId: candidate.linkId, text: candidate.text, type: "text" });
      continue;
    }
    if (candidate.type !== "choice") {
      return {
        error: `The partner Questionnaire contains ${itemLabel} with type “${String(candidate.type)}”. This reference DTR client supports coded choice and text questions.`,
      };
    }
    if (typeof candidate.linkId !== "string" || typeof candidate.text !== "string") {
      return {
        error: `The partner Questionnaire contains ${itemLabel}, but a coded choice question needs both linkId and text.`,
      };
    }
    const observationCode = Array.isArray(candidate.code) ? candidate.code[0] : undefined;
    const answerOption = Array.isArray(candidate.answerOption)
      ? candidate.answerOption.flatMap((option) => {
          const coding =
            option && typeof option === "object"
              ? (option as { valueCoding?: unknown }).valueCoding
              : undefined;
          return isCoding(coding) ? [{ valueCoding: coding }] : [];
        })
      : [];
    if (!isCoding(observationCode) || answerOption.length === 0) {
      return {
        error: `The partner Questionnaire contains coded choice question ${itemLabel}, but it is missing a coded Observation or coded answer options.`,
      };
    }
    items.push({
      linkId: candidate.linkId,
      text: candidate.text,
      type: "choice",
      observationCode,
      answerOption,
    });
  }
  const canonical =
    typeof questionnaire.url === "string"
      ? `${questionnaire.url}${typeof questionnaire.version === "string" ? `|${questionnaire.version}` : ""}`
      : undefined;
  const responseTemplate = bundle.entry
    .map((entry) =>
      entry && typeof entry === "object" ? (entry as { resource?: unknown }).resource : undefined
    )
    .find((resource) =>
      Boolean(resource && typeof resource === "object" &&
        (resource as { resourceType?: unknown }).resourceType === "QuestionnaireResponse" &&
        (resource as { questionnaire?: unknown }).questionnaire === canonical)
    ) as { extension?: unknown } | undefined;
  const extensions = Array.isArray(responseTemplate?.extension) ? responseTemplate.extension : [];
  const linkedReference = (suffix: "qr-context" | "qr-coverage", type: "RequestGroup" | "Coverage") => {
    const extension = extensions.find((value) =>
      value && typeof value === "object" &&
      (value as { url?: unknown }).url ===
        `http://hl7.org/fhir/us/davinci-dtr/StructureDefinition/${suffix}`
    ) as { valueReference?: { reference?: unknown } } | undefined;
    const reference = extension?.valueReference?.reference;
    return typeof reference === "string" &&
      new RegExp(`^${type}/[A-Za-z0-9.-]+$`).test(reference) ? reference : undefined;
  };
  // Do not silently omit a partner-supplied question and imply that the
  // documentation is complete.
  return { questionnaire: {
    items, canonical,
    contextReference: linkedReference("qr-context", "RequestGroup"),
    coverageReference: linkedReference("qr-coverage", "Coverage"),
  } };
}

function isCoding(value: unknown): value is AnswerCoding {
  if (!value || typeof value !== "object") return false;
  const coding = value as Partial<AnswerCoding>;
  return (
    typeof coding.system === "string" &&
    typeof coding.code === "string" &&
    typeof coding.display === "string"
  );
}
