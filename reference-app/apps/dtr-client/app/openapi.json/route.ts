import type { NextRequest } from "next/server";

const SPEC = {
  openapi: "3.0.3",
  info: {
    title: "MOPA DTR Client",
    version: "0.1.1-snapshot-080926",
    description:
      "Documentation Requirements Tool. Launched via SMART EHR context with an appContext " +
      "identifying missing data elements. Generates a questionnaire, collects answers, " +
      "persists FHIR Observations and a QuestionnaireResponse, then returns control to the EHR.",
  },
  servers: [{ url: "http://localhost:4004", description: "Local dev" }],
  tags: [
    { name: "SMART", description: "SMART App Launch" },
    { name: "Documentation", description: "Questionnaire submission" },
  ],
  paths: {
    "/launch": {
      get: {
        tags: ["SMART"],
        summary: "SMART launch entry point",
        parameters: [
          { name: "iss", in: "query", required: true, schema: { type: "string" } },
          { name: "launch", in: "query", required: false, schema: { type: "string" } },
          {
            name: "returnRegimen",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Regimen ID to return to in EHR after completion",
          },
        ],
        responses: { 302: { description: "Redirect to EHR /authorize or home (bypass)" } },
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
        responses: { 302: { description: "Redirect to DTR home with session cookie" } },
      },
    },
    "/api/submit": {
      post: {
        tags: ["Documentation"],
        summary: "Submit questionnaire answers",
        description:
          "Creates a FHIR Observation for each answered item and a QuestionnaireResponse " +
          "aggregating all answers on the EHR FHIR server.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["patientId", "answers"],
                properties: {
                  patientId: { type: "string" },
                  answers: {
                    type: "object",
                    description: "Map of linkId to answer coding",
                    additionalProperties: {
                      type: "object",
                      properties: {
                        system: { type: "string" },
                        code: { type: "string" },
                        display: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "{ qrId, observationIds }" },
          400: { description: "Invalid request" },
          502: { description: "EHR FHIR write failed" },
        },
      },
    },
  },
};

export function GET(_req: NextRequest) {
  return Response.json(SPEC);
}
