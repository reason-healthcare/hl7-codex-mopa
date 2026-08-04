import type { NextRequest } from "next/server";

const SPEC = {
  openapi: "3.0.3",
  info: {
    title: "MOPA CRD Service",
    version: "0.1.0",
    description:
      "Coverage Requirements Discovery service implementing CDS Hooks for breast cancer " +
      "chemotherapy prior authorization. Evaluates oncology orders by querying the EHR FHIR server via fhirAuthorization to return " +
      "pre-authorization, PA-required, or DTR-required guidance cards.",
  },
  servers: [{ url: "http://localhost:4003", description: "Local dev" }],
  tags: [
    { name: "CDS Hooks", description: "CDS Hooks discovery and hook endpoints" },
    { name: "FHIR Proxy", description: "FHIR resource proxy" },
    { name: "Content", description: "Clinical content artifacts" },
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
          "Handles `order-select` and `order-sign` CDS Hooks. Evaluates coverage requirements " +
          "and returns guidance cards: pre-authorized (ECOG 0), PA required (ECOG ≥1), or DTR launch.",
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
                        description: "FHIR Bundle of draft MedicationRequests",
                      },
                      selections: { type: "array", items: { type: "string" } },
                    },
                  },
                  prefetch: { type: "object" },
                  fhirServer: { type: "string" },
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
    "/api/fhir/{path}": {
      get: {
        tags: ["FHIR Proxy"],
        summary: "FHIR read / search proxy",
        parameters: [{ name: "path", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "FHIR resource or Bundle" } },
      },
    },
    "/api/Library/BreastCancerPADataRequirements": {
      get: {
        tags: ["Content"],
        summary: "PA data requirements Library resource",
        description:
          "Returns the FHIR Library resource describing all clinical data elements required for PA evaluation.",
        responses: {
          200: {
            description: "FHIR Library (asset-collection)",
            content: { "application/fhir+json": {} },
          },
        },
      },
    },
    "/api/content/resource": {
      get: {
        tags: ["Content"],
        summary: "FHIR knowledge artifact by ID",
        parameters: [
          {
            name: "id",
            in: "query",
            required: true,
            schema: {
              type: "string",
              enum: [
                "PlanDefinition-BreastCancerGuidelineCDS",
                "PlanDefinition-BreastCancerPAWorkflow",
                "Library-BreastCancerGuideline",
                "Library-BreastCancerPayerPolicy",
                "Library-BreastCancerPADataRequirements",
              ],
            },
          },
        ],
        responses: {
          200: { description: "FHIR resource as JSON", content: { "application/fhir+json": {} } },
          404: { description: "Unknown resource ID" },
        },
      },
    },
    "/api/content/package": {
      get: {
        tags: ["Content"],
        summary: "Download layer package as tgz",
        description:
          "Streams a FHIR npm-style tgz package containing PlanDefinition, Library, and CQL source for the requested layer.",
        parameters: [
          {
            name: "layer",
            in: "query",
            required: true,
            schema: { type: "string", enum: ["1", "2"] },
          },
        ],
        responses: {
          200: { description: "tgz archive", content: { "application/gzip": {} } },
          400: { description: "layer must be 1 or 2" },
        },
      },
    },
  },
};

export function GET(_req: NextRequest) {
  return Response.json(SPEC);
}
