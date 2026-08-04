import type { NextRequest } from "next/server";

const SPEC = {
  openapi: "3.0.3",
  info: {
    title: "MOPA Payer Backend",
    version: "0.1.0",
    description:
      "Payer policy evaluation service. Fetches patient clinical data from the EHR FHIR " +
      "proxy, evaluates BreastCancerPayerPolicy CQL via the cql-engine package, and returns " +
      "a prior authorization determination.",
  },
  servers: [{ url: "http://localhost:4006", description: "Local dev" }],
  tags: [{ name: "Policy", description: "CQL policy evaluation" }],
  paths: {
    "/api/evaluate": {
      post: {
        tags: ["Policy"],
        summary: "Evaluate payer policy for a patient",
        description:
          "Fetches HER2, cancer stage, and ECOG observations from the EHR FHIR proxy, " +
          "runs BreastCancerPayerPolicy CQL, and returns an approval determination.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["patientId"],
                properties: {
                  patientId: { type: "string", example: "jane-smith" },
                  regimenId: { type: "string", example: "TH" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Prior authorization determination",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    outcome: { type: "string", enum: ["complete", "queued", "error"] },
                    disposition: { type: "string", example: "All required clinical data present." },
                  },
                },
              },
            },
          },
          400: { description: "Missing patientId" },
          502: { description: "EHR FHIR proxy unreachable" },
        },
      },
    },
  },
};

export function GET(_req: NextRequest) {
  return Response.json(SPEC);
}
