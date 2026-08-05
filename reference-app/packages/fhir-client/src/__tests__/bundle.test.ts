import { describe, it, expect, vi, beforeEach } from "vitest";
import { extractResources, toBundle, fetchBundle } from "../bundle";

describe("extractResources", () => {
  it("returns resource objects from a Bundle", () => {
    const bundle = toBundle([{ resourceType: "Patient", id: "p1" }]);
    const resources = extractResources(bundle);
    expect(resources).toHaveLength(1);
    expect(resources[0]?.resourceType).toBe("Patient");
  });

  it("returns [] for null / undefined / non-object input", () => {
    expect(extractResources(null)).toEqual([]);
    expect(extractResources(undefined)).toEqual([]);
    expect(extractResources("not a bundle")).toEqual([]);
  });

  it("returns [] for a Bundle with no entries", () => {
    expect(extractResources(toBundle([]))).toEqual([]);
  });

  it("filters out entries lacking a resource", () => {
    const bundle = { entry: [{ resource: { resourceType: "Patient" } }, { other: "x" }] };
    expect(extractResources(bundle)).toHaveLength(1);
  });

  it("passes through an already-extracted resource array", () => {
    const resources = [{ resourceType: "Observation" }, { resourceType: "Condition" }];
    expect(extractResources(resources)).toEqual(resources);
  });
});

describe("toBundle", () => {
  it("wraps resources into a searchset Bundle shape", () => {
    const bundle = toBundle([{ resourceType: "Patient" }]);
    expect(bundle.resourceType).toBe("Bundle");
    expect(bundle.type).toBe("searchset");
    expect(bundle.total).toBe(1);
    expect(bundle.entry).toHaveLength(1);
  });

  it("handles an empty array", () => {
    const bundle = toBundle([]);
    expect(bundle.total).toBe(0);
    expect(bundle.entry).toEqual([]);
  });
});

describe("fetchBundle", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("ok")) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ resourceType: "Bundle", entry: [] }),
          });
        }
        return Promise.resolve({ ok: false, status: 500, json: async () => ({}) });
      })
    );
  });

  it("returns the parsed Bundle on a 200", async () => {
    const bundle = await fetchBundle("http://example.com/fhir", "ok");
    expect(bundle).not.toBeNull();
    expect(bundle?.resourceType).toBe("Bundle");
  });

  it("returns null on a non-200 response", async () => {
    expect(await fetchBundle("http://example.com/fhir", "fail")).toBeNull();
  });

  it("sends Authorization header when a bearer token is provided", async () => {
    const fetchSpy = vi.mocked(fetch);
    await fetchBundle("http://example.com/fhir", "ok", "abc123");
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://example.com/fhir/ok",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer abc123" }),
      })
    );
  });

  it("strips a trailing slash from the base URL", async () => {
    const fetchSpy = vi.mocked(fetch);
    await fetchBundle("http://example.com/fhir/", "ok");
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://example.com/fhir/ok",
      expect.anything()
    );
  });

  it("returns null when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    expect(await fetchBundle("http://example.com/fhir", "ok")).toBeNull();
  });
});
