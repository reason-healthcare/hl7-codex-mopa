import type { NextRequest } from "next/server";

const SPEC = {
  openapi: "3.0.3",
  info: {
    title: "MOPA Payer Backend",
    version: "0.1.0",
    description:
      "Payer policy evaluation service. Fetches patient clinical data from the EHR FHIR " +
      "proxy, evaluates breast cancer coverage policy via the @mopa/oncology-policy shared " +
      "package, and returns a prior authorization determination.",
  },
  servers: [{ url: "http://localhost:4006", description: "Local dev" }],
  tags: [{ name: "Policy", description: "Coverage policy evaluation" }],
  paths: {
    "/api/evaluate": {
      post: {
        tags: ["Policy"],
        summary: "Evaluate payer policy for a patient",
        description:
          "Fetches breast cancer condition, HER2, cancer stage, and ECOG observations from " +
          "the EHR FHIR proxy, evaluates coverage criteria using the shared " +
          "@mopa/oncology-policy evaluateBreastCancerPolicy function, and returns an " +
          "approval determination (approved, pended, or denied).",
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
                  required: ["status", "reason"],
                  properties: {
                    status: {
                      type: "string",
                      enum: ["approved", "pended", "denied"],
                      description:
                        "approved = all criteria met; pended = incomplete data or PA " +
                        "required; denied = policy rejection.",
                    },
                    reason: {
                      type: "string",
                      example: "All clinical criteria met per payer policy. Authorization satisfied.",
                    },
                  },
                },
              },
            },
          },
          400: { description: "Missing patientId or invalid JSON body" },
          500: { description: "Policy evaluation error" },
        },
      },
    },
  },
};

export function GET(_req: NextRequest) {
  return Response.json(SPEC);
}
