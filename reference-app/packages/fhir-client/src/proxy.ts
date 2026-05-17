import { type NextRequest, NextResponse } from "next/server";

const FHIR_CONTENT_TYPE = "application/fhir+json";

/**
 * FHIR proxy utility.
 *
 * Drop into a Next.js App Router catch-all route:
 *   app/api/fhir/[...path]/route.ts
 *
 * Forwards all HTTP methods to the upstream FHIR server configured via
 * the FHIR_BASE_URL environment variable.
 */
export async function fhirProxyHandler(
  request: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  const upstreamBase =
    process.env.FHIR_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8080/fhir";

  const fhirPath = params.path.join("/");
  const upstreamUrl = `${upstreamBase}/${fhirPath}${request.nextUrl.search}`;

  const headers: Record<string, string> = {
    "Content-Type": FHIR_CONTENT_TYPE,
    Accept: FHIR_CONTENT_TYPE,
  };

  const authHeader = request.headers.get("authorization");
  if (authHeader) headers.Authorization = authHeader;

  const method = request.method;
  const body = ["GET", "HEAD", "DELETE"].includes(method) ? undefined : await request.text();

  try {
    const upstream = await fetch(upstreamUrl, { method, headers, body });
    const responseBody = await upstream.text();

    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? FHIR_CONTENT_TYPE,
      },
    });
  } catch (err) {
    console.error("[fhir-proxy] upstream error:", err);
    return NextResponse.json(
      {
        resourceType: "OperationOutcome",
        issue: [
          {
            severity: "error",
            code: "exception",
            diagnostics: err instanceof Error ? err.message : "Upstream FHIR request failed",
          },
        ],
      },
      { status: 502 }
    );
  }
}
