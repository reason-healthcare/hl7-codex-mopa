import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  substituteTemplate,
  resolvePrefetch,
  firstPrefetchResource,
  prefetchEntryCount,
  CdsRequestSchema,
  CdsResponseSchema,
} from "../index";

// ---------------------------------------------------------------------------
// substituteTemplate
// ---------------------------------------------------------------------------

describe("substituteTemplate", () => {
  it("replaces a single placeholder", () => {
    expect(substituteTemplate("Patient/{{context.patientId}}", { patientId: "p1" })).toBe(
      "Patient/p1"
    );
  });

  it("replaces multiple placeholders", () => {
    expect(
      substituteTemplate(
        "Observation?patient={{context.patientId}}&category={{context.category}}",
        { patientId: "p1", category: "laboratory" }
      )
    ).toBe("Observation?patient=p1&category=laboratory");
  });

  it("leaves placeholder empty when context key is missing", () => {
    expect(substituteTemplate("Patient/{{context.missing}}", {})).toBe("Patient/");
  });

  it("leaves non-placeholder text unchanged", () => {
    expect(substituteTemplate("Condition?category=problem-list-item", {})).toBe(
      "Condition?category=problem-list-item"
    );
  });
});

// ---------------------------------------------------------------------------
// resolvePrefetch
// ---------------------------------------------------------------------------

describe("resolvePrefetch", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ resourceType: "Bundle", type: "searchset", entry: [] }),
      })
    );
  });

  it("fetches missing prefetch keys", async () => {
    const result = await resolvePrefetch(
      { patient: "Patient/{{context.patientId}}" },
      "http://hapi:8080/fhir",
      { patientId: "jane-smith" }
    );
    expect(result.patient).toEqual({ resourceType: "Bundle", type: "searchset", entry: [] });
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      "http://hapi:8080/fhir/Patient/jane-smith",
      expect.anything()
    );
  });

  it("skips keys already populated in existing prefetch", async () => {
    const existing = { patient: { resourceType: "Patient", id: "jane-smith" } };
    const result = await resolvePrefetch(
      { patient: "Patient/{{context.patientId}}" },
      "http://hapi:8080/fhir",
      { patientId: "jane-smith" },
      existing
    );
    expect(result.patient).toBe(existing.patient);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it("strips trailing slash from fhirBase", async () => {
    await resolvePrefetch({ patient: "Patient/{{context.patientId}}" }, "http://hapi:8080/fhir/", {
      patientId: "p1",
    });
    expect(vi.mocked(fetch).mock.calls[0]?.[0] as string).toBe("http://hapi:8080/fhir/Patient/p1");
  });

  it("silently skips a key when the fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network error")));
    const result = await resolvePrefetch(
      { her2: "Observation?patient={{context.patientId}}" },
      "http://hapi:8080/fhir",
      { patientId: "p1" }
    );
    expect(result.her2).toBeUndefined();
  });

  it("silently skips a key when the server returns non-OK", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404, json: async () => ({}) })
    );
    const result = await resolvePrefetch(
      { her2: "Observation?patient={{context.patientId}}" },
      "http://hapi:8080/fhir",
      { patientId: "p1" }
    );
    expect(result.her2).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// firstPrefetchResource / prefetchEntryCount
// ---------------------------------------------------------------------------

describe("firstPrefetchResource", () => {
  it("returns the first entry resource from a Bundle", () => {
    const bundle = {
      resourceType: "Bundle",
      entry: [{ resource: { resourceType: "Observation", id: "obs-1" } }],
    };
    expect(firstPrefetchResource(bundle)).toEqual({ resourceType: "Observation", id: "obs-1" });
  });

  it("returns undefined for empty bundle", () => {
    expect(firstPrefetchResource({ resourceType: "Bundle", entry: [] })).toBeUndefined();
  });

  it("returns undefined for null/undefined input", () => {
    expect(firstPrefetchResource(undefined)).toBeUndefined();
    expect(firstPrefetchResource(null)).toBeUndefined();
  });
});

describe("prefetchEntryCount", () => {
  it("counts entries in a bundle", () => {
    const bundle = {
      entry: [{ resource: {} }, { resource: {} }],
    };
    expect(prefetchEntryCount(bundle)).toBe(2);
  });

  it("returns 0 for empty bundle", () => {
    expect(prefetchEntryCount({ entry: [] })).toBe(0);
  });

  it("returns 0 for non-bundle input", () => {
    expect(prefetchEntryCount(undefined)).toBe(0);
    expect(prefetchEntryCount("string")).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

describe("CdsRequestSchema", () => {
  it("parses a valid order-select request", () => {
    const raw = {
      hookInstance: "uuid-1",
      hook: "order-select",
      context: {
        userId: "Practitioner/p1",
        patientId: "jane-smith",
        draftOrders: { resourceType: "Bundle", type: "collection" },
        selections: [],
      },
    };
    expect(CdsRequestSchema.safeParse(raw).success).toBe(true);
  });

  it("rejects a request without hookInstance", () => {
    expect(CdsRequestSchema.safeParse({ hook: "order-select", context: {} }).success).toBe(false);
  });
});

describe("CdsResponseSchema", () => {
  it("parses a valid response with one card", () => {
    const raw = {
      cards: [
        {
          summary: "Pre-approved",
          indicator: "info",
          source: { label: "OGCA CRD" },
        },
      ],
    };
    expect(CdsResponseSchema.safeParse(raw).success).toBe(true);
  });

  it("rejects a card with invalid indicator", () => {
    const raw = {
      cards: [{ summary: "x", indicator: "success", source: { label: "x" } }],
    };
    expect(CdsResponseSchema.safeParse(raw).success).toBe(false);
  });
});
