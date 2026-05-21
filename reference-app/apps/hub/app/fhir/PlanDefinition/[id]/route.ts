import type { NextRequest } from "next/server";
import { PLAN_DEFINITIONS } from "../../registry";

export function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return params.then(({ id }) => {
    const resource = PLAN_DEFINITIONS[id];
    if (!resource) {
      return Response.json(
        {
          resourceType: "OperationOutcome",
          issue: [
            { severity: "error", code: "not-found", diagnostics: `PlanDefinition/${id} not found` },
          ],
        },
        { status: 404, headers: { "Content-Type": "application/fhir+json" } }
      );
    }
    return Response.json(resource, {
      headers: {
        "Content-Type": "application/fhir+json",
        "Content-Disposition": `inline; filename="PlanDefinition-${id}.json"`,
      },
    });
  });
}
