import type { NextRequest } from "next/server";

const SPEC = {
  openapi: "3.0.3",
  info: {
    title: "MOPA PAS Service",
    version: "0.1.1-snapshot-080926",
    description:
      "Prior Authorization Service. Receives simplified PA submission requests from the EHR, " +
      "delegates CQL policy evaluation to the Payer Backend, and returns a FHIR ClaimResponse.",
  },
  servers: [{ url: "http://localhost:4005", description: "Local dev" }],
  tags: [{ name: "PA", description: "Prior authorization submission" }],
  paths: {
    "/api/fhir/$submit": {
      post: {
        tags: ["PA"],
        summary: "Submit prior authorization request",
        description:
          "Validates the PA request, calls the Payer Backend for CQL policy evaluation, " +
          "and returns a FHIR ClaimResponse with the coverage determination.",
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
                  regimenLabel: { type: "string", example: "TH — Trastuzumab + Paclitaxel" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "FHIR ClaimResponse with outcome and disposition",
            content: { "application/fhir+json": { schema: { type: "object" } } },
          },
          400: { description: "Missing patientId" },
          502: { description: "Payer Backend unreachable or evaluation failed" },
        },
      },
    },
  },
};

export function GET(_req: NextRequest) {
  return Response.json(SPEC);
}
