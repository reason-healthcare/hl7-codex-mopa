import { NextRequest, NextResponse } from "next/server";

/**
 * FHIR proxy utility.
 *
 * Drop into a Next.js App Router catch-all route:
 *   app/api/fhir/[...path]/route.ts
 *
 * The handler forwards all HTTP methods to the upstream FHIR server configured
 * via the FHIR_BASE_URL environment variable.
 */
export async function fhirProxyHandler(
  request: NextRequest,
  { params }: { params: { path: string[] } }
): Promise<NextResponse> {
  const upstreamBase =
    process.env.FHIR_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8080/fhir";

  const fhirPath = params.path.join("/");
  const search = request.nextUrl.search ?? "";
  const upstreamUrl = `${upstreamBase}/${fhirPath}${search}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/fhir+json",
    Accept: "application/fhir+json",
  };

  // Forward auth header if present
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    headers["Authorization"] = authHeader;
  }

  let body: BodyInit | null = null;
  const method = request.method;
  if (!["GET", "HEAD", "DELETE"].includes(method)) {
    body = await request.text();
  }

  try {
    const upstream = await fetch(upstreamUrl, {
      method,
      headers,
      body: body ?? undefined,
    });

    const responseBody = await upstream.text();

    return new NextResponse(responseBody, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("Content-Type") ?? "application/fhir+json",
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
            diagnostics:
              err instanceof Error ? err.message : "Upstream FHIR request failed",
          },
        ],
      },
      { status: 502 }
    );
  }
}
