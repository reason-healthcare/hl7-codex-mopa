import type { NextRequest } from "next/server";
import {
  PLAN_DEFINITIONS,
  fhirBundle,
  matchesContext,
  matchesContextTypeValue,
  matchesType,
} from "../registry";

const HUB_BASE = process.env.NEXT_PUBLIC_HUB_BASE_URL ?? "http://localhost:4000";

export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const url = sp.get("url");
  const name = sp.get("name");
  const title = sp.get("title");
  const type = sp.get("type");
  const context = sp.get("context");
  const contextTypeValue = sp.get("context-type-value");

  const matches = Object.entries(PLAN_DEFINITIONS).filter(([, pd]) => {
    const r = pd as Record<string, unknown>;
    if (url && r.url !== url) return false;
    if (name && r.name !== name) return false;
    if (title && !((r.title as string) ?? "").toLowerCase().includes(title.toLowerCase()))
      return false;
    if (type && !matchesType(r, type)) return false;
    if (context && !matchesContext(r, context)) return false;
    if (contextTypeValue && !matchesContextTypeValue(r, contextTypeValue)) return false;
    return true;
  });

  return Response.json(fhirBundle("PlanDefinition", HUB_BASE, matches), {
    headers: { "Content-Type": "application/fhir+json" },
  });
}
