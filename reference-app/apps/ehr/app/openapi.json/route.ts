import type { NextRequest } from "next/server";

const SPEC = {
  openapi: "3.0.3",
  info: {
    title: "MOPA EHR",
    version: "0.1.0",
    description:
      "Reference EHR exposing a FHIR R4 proxy, SMART on FHIR authorization endpoints, " +
      "and a prior-authorization submission gateway.",
  },
  servers: [{ url: "http://localhost:4001", description: "Local dev" }],
  tags: [
    { name: "FHIR", description: "FHIR R4 proxy to HAPI FHIR" },
    { name: "SMART", description: "SMART on FHIR authorization" },
    { name: "PA", description: "Prior authorization" },
  ],
  paths: {
    "/.well-known/smart-configuration": {
      get: {
        tags: ["SMART"],
        summary: "SMART discovery document",
        description: "Returns the SMART on FHIR well-known configuration for this EHR.",
        responses: {
          200: { description: "SMART configuration JSON" },
        },
      },
    },
    "/authorize": {
      get: {
        tags: ["SMART"],
        summary: "OAuth 2.0 authorization endpoint",
        parameters: [
          {
            name: "response_type",
            in: "query",
            required: true,
            schema: { type: "string", enum: ["code"] },
          },
          { name: "client_id", in: "query", required: true, schema: { type: "string" } },
          { name: "redirect_uri", in: "query", required: true, schema: { type: "string" } },
          { name: "scope", in: "query", required: true, schema: { type: "string" } },
          { name: "state", in: "query", required: true, schema: { type: "string" } },
          { name: "aud", in: "query", schema: { type: "string" } },
          { name: "launch", in: "query", schema: { type: "string" } },
        ],
        responses: { 302: { description: "Redirect to app redirect_uri with authorization code" } },
      },
    },
    "/token": {
      post: {
        tags: ["SMART"],
        summary: "OAuth 2.0 token endpoint",
        requestBody: {
          required: true,
          content: {
            "application/x-www-form-urlencoded": {
              schema: {
                type: "object",
                properties: {
                  grant_type: { type: "string", enum: ["authorization_code"] },
                  code: { type: "string" },
                  redirect_uri: { type: "string" },
                  client_id: { type: "string" },
                  code_verifier: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Access token response with patient context" },
          400: { description: "Invalid grant" },
        },
      },
    },
    "/api/fhir/{path}": {
      get: {
        tags: ["FHIR"],
        summary: "FHIR read / search",
        description:
          "Proxies GET requests to the HAPI FHIR server. Supports all standard FHIR resource types and search parameters.",
        parameters: [
          {
            name: "path",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "Patient/jane-smith",
          },
        ],
        responses: {
          200: { description: "FHIR resource or Bundle" },
          404: { description: "Resource not found" },
        },
      },
      post: {
        tags: ["FHIR"],
        summary: "FHIR create / operation",
        parameters: [{ name: "path", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { content: { "application/fhir+json": { schema: { type: "object" } } } },
        responses: {
          200: { description: "FHIR response" },
          201: { description: "Resource created" },
        },
      },
      put: {
        tags: ["FHIR"],
        summary: "FHIR update",
        parameters: [{ name: "path", in: "path", required: true, schema: { type: "string" } }],
        requestBody: { content: { "application/fhir+json": { schema: { type: "object" } } } },
        responses: { 200: { description: "Updated resource" } },
      },
      delete: {
        tags: ["FHIR"],
        summary: "FHIR delete",
        parameters: [{ name: "path", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Deleted" }, 404: { description: "Not found" } },
      },
    },
    "/api/pa-submit": {
      post: {
        tags: ["PA"],
        summary: "Submit prior authorization",
        description:
          "Forwards a PA request to the PAS service and returns the ClaimResponse determination.",
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
          200: { description: "ClaimResponse with outcome and disposition" },
          502: { description: "PAS service unreachable" },
        },
      },
    },
  },
};

export function GET(_req: NextRequest) {
  return Response.json(SPEC);
}
