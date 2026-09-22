import { describe, expect, it } from "vitest";
import { buildQuestionnaireResponse } from "../../../lib/questionnaire-response";

describe("buildQuestionnaireResponse", () => {
  it("preserves text answers in the QuestionnaireResponse without inventing an Observation mapping", () => {
    expect(
      buildQuestionnaireResponse(
        "sandra-chen",
        {
          her2: { system: "http://snomed.info/sct", code: "10828004", display: "Positive" },
          priorTherapy: "No prior systemic therapy.",
        },
        [
          {
            linkId: "her2",
            text: "HER2 status",
            type: "choice",
            observationCode: { system: "http://loinc.org", code: "85319-2", display: "HER2" },
            answerOption: [],
          },
          {
            linkId: "priorTherapy",
            text: "Prior systemic therapy and response",
            type: "text",
          },
        ],
        "2026-09-20",
        "https://partner.example/Questionnaire/breast-cancer|1",
        "RequestGroup/rg-PHD",
        "Coverage/mopa-connectathon-coverage"
      )
    ).toMatchObject({
      questionnaire: "https://partner.example/Questionnaire/breast-cancer|1",
      extension: [
        { url: "http://hl7.org/fhir/us/davinci-dtr/StructureDefinition/qr-context",
          valueReference: { reference: "RequestGroup/rg-PHD" } },
        { url: "http://hl7.org/fhir/us/davinci-dtr/StructureDefinition/qr-coverage",
          valueReference: { reference: "Coverage/mopa-connectathon-coverage" } },
      ],
      item: [
        { linkId: "her2", answer: [{ valueCoding: { code: "10828004" } }] },
        { linkId: "priorTherapy", answer: [{ valueString: "No prior systemic therapy." }] },
      ],
    });
  });
});
