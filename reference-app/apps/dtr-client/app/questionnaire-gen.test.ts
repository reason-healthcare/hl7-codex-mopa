import { describe, expect, it } from "vitest";
import { buildQuestionnaireFromPackage } from "../lib/questionnaire-gen";

const partnerPackage = {
  resourceType: "Parameters",
  parameter: [
    {
      name: "packagebundle",
      resource: {
        resourceType: "Bundle",
        entry: [
          {
            resource: {
              resourceType: "Questionnaire",
              url: "https://partner.example/fhir/Questionnaire/oncology",
              version: "1.0.0",
              item: [
                {
                  linkId: "her2",
                  text: "HER2 status",
                  type: "choice",
                  code: [{ system: "http://loinc.org", code: "85319-2", display: "HER2" }],
                  answerOption: [
                    {
                      valueCoding: {
                        system: "http://snomed.info/sct",
                        code: "10828004",
                        display: "Positive",
                      },
                    },
                  ],
                },
              ],
            },
          },
          {
            resource: {
              resourceType: "QuestionnaireResponse",
              questionnaire: "https://partner.example/fhir/Questionnaire/oncology|1.0.0",
              extension: [
                { url: "http://hl7.org/fhir/us/davinci-dtr/StructureDefinition/qr-context",
                  valueReference: { reference: "RequestGroup/rg-PHD" } },
                { url: "http://hl7.org/fhir/us/davinci-dtr/StructureDefinition/qr-coverage",
                  valueReference: { reference: "Coverage/mopa-connectathon-coverage" } },
              ],
            },
          },
        ],
      },
    },
  ],
};

describe("buildQuestionnaireFromPackage", () => {
  it("uses the exact Questionnaire returned by the partner package", () => {
    expect(buildQuestionnaireFromPackage(partnerPackage).questionnaire).toMatchObject({
      canonical: "https://partner.example/fhir/Questionnaire/oncology|1.0.0",
      contextReference: "RequestGroup/rg-PHD",
      coverageReference: "Coverage/mopa-connectathon-coverage",
      items: [{ linkId: "her2", text: "HER2 status" }],
    });
  });

  it("identifies rather than silently omitting an unsupported partner question", () => {
    const unsupported = structuredClone(partnerPackage) as any;
    unsupported.parameter[0].resource.entry[0].resource.item[0].type = "string";
    expect(buildQuestionnaireFromPackage(unsupported)).toEqual({
      error:
        "The partner Questionnaire contains “HER2 status” (linkId: her2) with type “string”. This reference DTR client supports coded choice and text questions.",
    });
  });

  it("renders a partner text item", () => {
    const textQuestion = structuredClone(partnerPackage) as any;
    textQuestion.parameter[0].resource.entry[0].resource.item.push({
      linkId: "priorTherapy",
      text: "Prior systemic therapy and response",
      type: "text",
    });
    expect(buildQuestionnaireFromPackage(textQuestion).questionnaire).toMatchObject({
      items: [
        { linkId: "her2", type: "choice" },
        {
          linkId: "priorTherapy",
          text: "Prior systemic therapy and response",
          type: "text",
        },
      ],
    });
  });
});
