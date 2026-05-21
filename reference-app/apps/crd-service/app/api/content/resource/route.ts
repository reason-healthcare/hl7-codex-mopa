import { type NextRequest, NextResponse } from "next/server";
import {
  GUIDELINE_PLAN_DEFINITION,
  PLAN_DEFINITION,
  GUIDELINE_LIBRARY,
  PAYER_POLICY_LIBRARY,
  LIBRARY_RESOURCE,
} from "../../../content-data";
import { withEmbeddedContent } from "@ogca/knowledge-artifacts";

// Logic libraries: CQL source + ELM embedded per Using CQL with FHIR IG
const LOGIC_LIBRARIES: Record<
  string,
  { library: typeof GUIDELINE_LIBRARY | typeof PAYER_POLICY_LIBRARY; cql: string; elm: string }
> = {
  "Library-BreastCancerGuideline": {
    library: GUIDELINE_LIBRARY,
    cql: "BreastCancerGuideline.cql",
    elm: "BreastCancerGuideline.elm.json",
  },
  "Library-BreastCancerPayerPolicy": {
    library: PAYER_POLICY_LIBRARY,
    cql: "BreastCancerPayerPolicy.cql",
    elm: "BreastCancerPayerPolicy.elm.json",
  },
};

// Other resources (no embedded content needed)
const RESOURCES: Record<string, object> = {
  "PlanDefinition-BreastCancerGuidelineCDS": GUIDELINE_PLAN_DEFINITION,
  "PlanDefinition-BreastCancerPAWorkflow": PLAN_DEFINITION,
  "Library-BreastCancerPADataRequirements": LIBRARY_RESOURCE,
};

export function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") ?? "";

  // Logic libraries: embed CQL + ELM per Using CQL with FHIR IG
  const logicLib = LOGIC_LIBRARIES[id];
  if (logicLib) {
    const enriched = withEmbeddedContent(logicLib.library, logicLib.cql, logicLib.elm);
    return NextResponse.json(enriched, {
      headers: {
        "Content-Type": "application/fhir+json",
        "Content-Disposition": `inline; filename="${id}.json"`,
      },
    });
  }

  const resource = RESOURCES[id];
  if (!resource) {
    return NextResponse.json({ error: "Not found", id }, { status: 404 });
  }
  return NextResponse.json(resource, {
    headers: {
      "Content-Type": "application/fhir+json",
      "Content-Disposition": `inline; filename="${id}.json"`,
    },
  });
}
