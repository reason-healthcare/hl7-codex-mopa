import type { NextRequest } from "next/server";
import { LIBRARIES } from "../../registry";

export function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return params.then(({ id }) => {
    const resource = LIBRARIES[id];
    if (!resource) {
      return Response.json(
        {
          resourceType: "OperationOutcome",
          issue: [{ severity: "error", code: "not-found", diagnostics: `Library/${id} not found` }],
        },
        { status: 404, headers: { "Content-Type": "application/fhir+json" } }
      );
    }
    return Response.json(resource, {
      headers: {
        "Content-Type": "application/fhir+json",
        "Content-Disposition": `inline; filename="Library-${id}.json"`,
      },
    });
  });
}
