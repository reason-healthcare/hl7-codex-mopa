import { describe, it, expect, vi, beforeEach } from "vitest";
import { FhirClient } from "../client";
import { PatientSchema, BundleSchema } from "../schemas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetch(body: unknown, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: async () => body,
    text: async () => JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// FhirClient
// ---------------------------------------------------------------------------

describe("FhirClient", () => {
  let client: FhirClient;

  beforeEach(() => {
    client = new FhirClient({ baseUrl: "http://hapi:8080/fhir" });
    vi.stubGlobal("fetch", mockFetch({ resourceType: "Patient", id: "p1" }));
  });

  describe("constructor", () => {
    it("strips trailing slash from baseUrl", () => {
      const c = new FhirClient({ baseUrl: "http://hapi:8080/fhir/" });
      // Verify no double-slash by checking a real request URL via fetch spy
      const spy = mockFetch({ resourceType: "Patient" });
      vi.stubGlobal("fetch", spy);
      c.read("Patient", "p1", PatientSchema);
      expect(spy.mock.calls[0]?.[0] as string).toBe("http://hapi:8080/fhir/Patient/p1");
    });
  });

  describe("read", () => {
    it("fetches the correct URL and parses with the schema", async () => {
      const spy = mockFetch({ resourceType: "Patient", id: "p1" });
      vi.stubGlobal("fetch", spy);

      const result = await client.read("Patient", "p1", PatientSchema);

      expect(spy).toHaveBeenCalledWith(
        "http://hapi:8080/fhir/Patient/p1",
        expect.objectContaining({ headers: expect.any(Object) })
      );
      expect(result.id).toBe("p1");
    });

    it("throws on non-OK response", async () => {
      vi.stubGlobal("fetch", mockFetch({ resourceType: "OperationOutcome" }, 404));
      await expect(client.read("Patient", "missing", PatientSchema)).rejects.toThrow(
        "FHIR read Patient/missing failed: 404"
      );
    });
  });

  describe("search", () => {
    it("builds the correct URL with query params", async () => {
      const bundleBody = {
        resourceType: "Bundle",
        type: "searchset",
        total: 0,
        entry: [],
      };
      const spy = mockFetch(bundleBody);
      vi.stubGlobal("fetch", spy);

      await client.search("Condition", { patient: "jane-smith" }, BundleSchema);

      const url = spy.mock.calls[0]?.[0] as string;
      expect(url).toContain("http://hapi:8080/fhir/Condition");
      expect(url).toContain("patient=jane-smith");
    });

    it("throws on non-OK response", async () => {
      vi.stubGlobal("fetch", mockFetch({}, 500));
      await expect(client.search("Patient", {}, BundleSchema)).rejects.toThrow(
        "FHIR search Patient failed: 500"
      );
    });
  });

  describe("create", () => {
    it("POSTs to the resource type endpoint", async () => {
      const spy = mockFetch({ resourceType: "Patient", id: "new-p" });
      vi.stubGlobal("fetch", spy);

      await client.create({ resourceType: "Patient", name: [{ family: "Test" }] }, PatientSchema);

      expect(spy).toHaveBeenCalledWith(
        "http://hapi:8080/fhir/Patient",
        expect.objectContaining({ method: "POST" })
      );
    });
  });

  describe("transaction", () => {
    it("POSTs a bundle to the base URL", async () => {
      const responseBundle = { resourceType: "Bundle", type: "transaction-response" };
      const spy = mockFetch(responseBundle);
      vi.stubGlobal("fetch", spy);

      await client.transaction({ resourceType: "Bundle", type: "transaction" });

      expect(spy).toHaveBeenCalledWith(
        "http://hapi:8080/fhir",
        expect.objectContaining({ method: "POST" })
      );
    });

    it("forwards accessToken as Authorization header", async () => {
      const authedClient = new FhirClient({
        baseUrl: "http://hapi:8080/fhir",
        accessToken: "token-abc",
      });
      const spy = mockFetch({ resourceType: "Bundle", type: "transaction-response" });
      vi.stubGlobal("fetch", spy);

      await authedClient.transaction({ resourceType: "Bundle", type: "transaction" });

      const options = spy.mock.calls[0]?.[1] as RequestInit;
      expect((options.headers as Record<string, string>).Authorization).toBe("Bearer token-abc");
    });
  });
});
