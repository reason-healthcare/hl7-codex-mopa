import type { NextRequest } from "next/server";

const SPEC = {
  openapi: "3.0.3",
  info: {
    title: "MOPA CRD Service",
    version: "0.1.0",
    description:
      "Coverage Requirements Discovery service implementing standard CDS Hooks for " +
      "oncology chemotherapy prior authorization. Queries the EHR FHIR server via " +
      "fhirAuthorization to evaluate coverage criteria and return Authorization " +
      "Satisfied or DTR Required guidance cards.",
  },
  servers: [{ url: "http://localhost:4003", description: "Local dev" }],
  tags: [
    { name: "CDS Hooks", description: "CDS Hooks discovery and hook endpoints" },
    { name: "FHIR Proxy", description: "FHIR resource proxy" },
  ],
  paths: {
    "/api/cds-services": {
      get: {
        tags: ["CDS Hooks"],
        summary: "CDS Hooks discovery",
        description: "Returns the list of CDS services supported by this CRD instance.",
        responses: {
          200: {
            description: "CDS services discovery document",
            content: {
              "application/json": {
                schema: { type: "object", properties: { services: { type: "array" } } },
              },
            },
          },
        },
      },
    },
    "/api/cds-services/oncology-crd": {
      post: {
        tags: ["CDS Hooks"],
        summary: "Oncology CRD hook",
        description:
          "Handles `order-select` and `order-sign` CDS Hooks. Queries the EHR FHIR server " +
          "via fhirAuthorization for oncology patient context and returns Authorization " +
          "Satisfied (all criteria met) or DTR Required (missing data) guidance cards.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["hookInstance", "hook", "context"],
                properties: {
                  hookInstance: { type: "string", format: "uuid" },
                  hook: { type: "string", enum: ["order-select", "order-sign"] },
                  context: {
                    type: "object",
                    properties: {
                      patientId: { type: "string", example: "jane-smith" },
                      userId: { type: "string", example: "Practitioner/demo-user" },
                      draftOrders: {
                        type: "object",
                        description: "FHIR Bundle of draft orders (RequestGroup + MedicationRequests)",
                      },
                      selections: { type: "array", items: { type: "string" } },
                    },
                  },
                  fhirServer: { type: "string" },
                  fhirAuthorization: { type: "object" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "CDS Hooks response with guidance cards",
            content: {
              "application/json": {
                schema: { type: "object", properties: { cards: { type: "array" } } },
              },
            },
          },
        },
      },
    },
    "/api/cds-services/oncology-crd-sign": {
      post: {
        tags: ["CDS Hooks"],
        summary: "Oncology CRD order-sign hook",
        description:
          "Dedicated order-sign endpoint. Same evaluation logic as oncology-crd but " +
          "scoped to the order-sign hook.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["hookInstance", "hook", "context"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "CDS Hooks response with guidance cards",
          },
        },
      },
    },
    "/api/fhir/{path}": {
      get: {
        tags: ["FHIR Proxy"],
        summary: "FHIR read / search proxy",
        parameters: [{ name: "path", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "FHIR resource or Bundle" } },
      },
    },
  },
};

export function GET(_req: NextRequest) {
  return Response.json(SPEC);
}
