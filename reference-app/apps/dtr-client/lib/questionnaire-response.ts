import type { QItem, QuestionnaireAnswer } from "./questionnaire-gen";
import { ITEM_DEFINITIONS } from "./questionnaire-gen";

export function buildQuestionnaireResponse(
  patientId: string,
  answers: Record<string, QuestionnaireAnswer>,
  items: QItem[],
  date: string,
  questionnaireCanonical?: string,
  contextReference?: string,
  coverageReference?: string
) {
  const itemDefinitions = new Map(items.map((item) => [item.linkId, item]));
  const extensions = [
    ...(contextReference && /^RequestGroup\/[A-Za-z0-9.-]+$/.test(contextReference)
      ? [{ url: "http://hl7.org/fhir/us/davinci-dtr/StructureDefinition/qr-context",
          valueReference: { reference: contextReference } }]
      : []),
    ...(coverageReference && /^Coverage\/[A-Za-z0-9.-]+$/.test(coverageReference)
      ? [{ url: "http://hl7.org/fhir/us/davinci-dtr/StructureDefinition/qr-coverage",
          valueReference: { reference: coverageReference } }]
      : []),
  ];
  return {
    resourceType: "QuestionnaireResponse",
    ...(questionnaireCanonical ? { questionnaire: questionnaireCanonical } : {}),
    ...(extensions.length ? { extension: extensions } : {}),
    status: "completed",
    subject: { reference: `Patient/${patientId}` },
    authored: date,
    item: Object.entries(answers).map(([linkId, answer]) => {
      const item = itemDefinitions.get(linkId) ?? ITEM_DEFINITIONS[linkId];
      return {
        linkId,
        text: item?.text ?? linkId,
        answer: [typeof answer === "string" ? { valueString: answer } : { valueCoding: answer }],
      };
    }),
  };
}
