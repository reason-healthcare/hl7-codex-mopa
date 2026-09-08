import type { NextRequest } from "next/server";

const SPEC = {
  openapi: "3.0.3",
  info: {
    title: "MOPA CDS SMART App",
    version: "0.1.1-snapshot-080926",
    description:
      "SMART on FHIR app providing guideline-based gap analysis and evidence-based regimen " +
      "recommendations for breast cancer chemotherapy. Supports MOPA-aware chart-back and read-only what-if modes.",
  },
  servers: [{ url: "http://localhost:4002", description: "Local dev" }],
  tags: [
    { name: "SMART", description: "SMART App Launch" },
    { name: "FHIR Write-back", description: "Write observations to the EHR" },
    { name: "Evaluation", description: "Hypothetical guideline evaluation" },
  ],
  paths: {
    "/launch": {
      get: {
        tags: ["SMART"],
        summary: "SMART launch entry point",
        description:
          "Receives iss and launch parameters from the EHR, initiates SMART authorization or bypass.",
        parameters: [
          {
            name: "iss",
            in: "query",
            required: true,
            schema: { type: "string" },
            description: "EHR FHIR base URL",
          },
          {
            name: "launch",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "EHR-issued opaque launch token",
          },
        ],
        responses: { 302: { description: "Redirect to EHR /authorize or app home (bypass)" } },
      },
    },
    "/callback": {
      get: {
        tags: ["SMART"],
        summary: "OAuth callback",
        parameters: [
          { name: "code", in: "query", required: true, schema: { type: "string" } },
          { name: "state", in: "query", required: true, schema: { type: "string" } },
        ],
        responses: { 302: { description: "Redirect to app home with session cookie set" } },
      },
    },
    "/api/write-back": {
      post: {
        tags: ["FHIR Write-back"],
        summary: "Write observation to EHR",
        description:
          "Creates a FHIR Observation on the EHR FHIR proxy with the provided code and value.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["patientId", "code", "system", "display", "value", "valueDisplay"],
                properties: {
                  patientId: { type: "string" },
                  code: { type: "string", description: "LOINC observation code" },
                  system: { type: "string", description: "LOINC system URL" },
                  display: { type: "string" },
                  value: { type: "string", description: "SNOMED value code" },
                  valueDisplay: { type: "string" },
                  valueSystem: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Created FHIR Observation" },
          400: { description: "Invalid request body" },
          502: { description: "EHR FHIR server error" },
        },
      },
    },
    "/api/evaluate": {
      post: {
        tags: ["Evaluation"],
        summary: "What-if guideline + PA evaluation",
        description:
          "Evaluates hypothetical clinical answers against the BreastCancerGuideline and " +
          "BreastCancerPayerPolicy CQL without writing to FHIR. Returns regimen eligibility " +
          "and PA authorization status.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["patientId"],
                properties: {
                  patientId: { type: "string" },
                  answers: {
                    type: "object",
                    properties: {
                      her2: { $ref: "#/components/schemas/AnswerCoding" },
                      cancerStage: { $ref: "#/components/schemas/AnswerCoding" },
                      ecogPs: { $ref: "#/components/schemas/AnswerCoding" },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Evaluation result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    regimens: { type: "array" },
                    paStatus: {
                      type: "string",
                      enum: ["pre-approved", "pa-required", "dtr-required"],
                    },
                    ecogScore: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      AnswerCoding: {
        type: "object",
        required: ["system", "code", "display"],
        properties: {
          system: { type: "string" },
          code: { type: "string" },
          display: { type: "string" },
        },
      },
    },
  },
};

export function GET(_req: NextRequest) {
  return Response.json(SPEC);
}
