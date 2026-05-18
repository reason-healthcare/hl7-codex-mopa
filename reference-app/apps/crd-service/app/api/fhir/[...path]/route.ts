import { fhirProxyHandler } from "@ogca/fhir-client";
import type { NextRequest } from "next/server";

type RouteContext = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  return fhirProxyHandler(request, { params });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
