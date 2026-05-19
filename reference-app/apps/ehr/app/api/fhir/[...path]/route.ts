import { fhirProxyHandler } from "@ogca/fhir-client";
import { verifyToken, isAuthBypassed, parseCookies, TOKEN_COOKIE } from "@ogca/smart-auth";
import { type NextRequest, NextResponse } from "next/server";

type RouteContext = { params: Promise<{ path: string[] }> };

/** Extract bearer token from Authorization header or smart_token cookie. */
function extractToken(request: NextRequest): string | null {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const cookies = parseCookies(request.headers.get("cookie"));
  return cookies[TOKEN_COOKIE] ?? null;
}

async function handle(request: NextRequest, context: RouteContext) {
  // Bypass auth for Phases 1–3 / dev mode
  if (!isAuthBypassed()) {
    const token = extractToken(request);
    if (!token) {
      return new NextResponse(null, {
        status: 401,
        headers: { "WWW-Authenticate": 'Bearer realm="OGCA EHR"' },
      });
    }
    try {
      await verifyToken(token);
    } catch {
      return new NextResponse(null, {
        status: 401,
        headers: { "WWW-Authenticate": 'Bearer error="invalid_token"' },
      });
    }
  }

  const params = await context.params;
  return fhirProxyHandler(request, { params });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
export const PATCH = handle;
