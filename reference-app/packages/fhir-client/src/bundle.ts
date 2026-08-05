/**
 * FHIR Bundle helpers — shared utilities for working with search Bundles.
 *
 * These are framework-agnostic and side-effect free so they can be reused
 * by any package or app that needs to pull resources out of a FHIR Bundle
 * or fetch a Bundle from a server.
 */

// ---------------------------------------------------------------------------
// Bundle extraction
// ---------------------------------------------------------------------------

/**
 * Extract resource entries from a FHIR Bundle (or any Bundle-shaped object).
 *
 * Accepts the full range of inputs the policy helpers can encounter:
 * real FHIR `Bundle` resources, already-extracted resource arrays, `null`,
 * `undefined`, or primitives. Returns a typed array of resource objects.
 */
export function extractResources(bundle: unknown): Record<string, unknown>[] {
  if (!bundle || typeof bundle !== "object") return [];
  // If the caller already passed an array of resources, pass them through.
  if (Array.isArray(bundle)) {
    return bundle.filter(
      (r): r is Record<string, unknown> => !!r && typeof r === "object"
    );
  }
  const b = bundle as { entry?: Array<{ resource?: unknown }> };
  return (b.entry ?? [])
    .map((e) => e.resource)
    .filter((r): r is Record<string, unknown> => !!r && typeof r === "object");
}

/** Wrap raw resources into a Bundle-shaped object. */
export function toBundle(resources: unknown[]) {
  return {
    resourceType: "Bundle" as const,
    type: "searchset" as const,
    total: resources.length,
    entry: resources.map((resource) => ({ resource })),
  };
}

// ---------------------------------------------------------------------------
// Bundle fetching
// ---------------------------------------------------------------------------

/** Fetch a FHIR search Bundle from a server. Returns null on failure. */
export async function fetchBundle(
  fhirBase: string,
  query: string,
  bearerToken?: string
): Promise<Record<string, unknown> | null> {
  const base = fhirBase.replace(/\/$/, "");
  const headers: Record<string, string> = { Accept: "application/fhir+json" };
  if (bearerToken) headers.Authorization = `Bearer ${bearerToken}`;

  try {
    const res = await fetch(`${base}/${query}`, {
      headers,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}
