import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const patients = ["jane-smith", "maria-garcia", "sandra-chen", "katherine-johnson"];

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("reset synthetic patient cases", () => {
  it("recreates searchable Coverage after every patient bundle", async () => {
    vi.stubEnv("FHIR_BASE_URL", "http://fhir.test/fhir");
    const calls: Array<{ path: string; method: string; body?: Record<string, unknown> }> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string, init?: RequestInit) => {
        calls.push({
          path: input.replace("http://fhir.test/fhir", ""),
          method: init?.method ?? "GET",
          body: init?.body ? JSON.parse(String(init.body)) : undefined,
        });
        return new Response("{}", { status: 200 });
      })
    );

    const response = await POST();
    expect(response.status).toBe(200);
    expect((await response.json()).results).toEqual(patients.map((id) => ({ id, ok: true })));
    expect(calls[0]).toMatchObject({ path: "/Organization/mopa-reference-payer", method: "PUT" });
    for (const id of patients) {
      const coveragePath = `/Coverage/mopa-reference-coverage-${id}`;
      const removed = calls.findIndex(
        (call) => call.path === coveragePath && call.method === "DELETE"
      );
      const reloaded = calls.findIndex(
        (call) => call.path === "" && call.method === "POST" && call.body?.id === `${id}-fixtures`
      );
      const recreated = calls.findIndex(
        (call) => call.path === coveragePath && call.method === "PUT"
      );
      expect(removed).toBeGreaterThan(-1);
      expect(reloaded).toBeGreaterThan(removed);
      expect(recreated).toBeGreaterThan(reloaded);
      expect(calls[recreated].body).toMatchObject({
        resourceType: "Coverage",
        status: "active",
        beneficiary: { reference: `Patient/${id}` },
        payor: [{ reference: "Organization/mopa-reference-payer" }],
      });
    }
    expect(
      calls.some((call) => call.method === "DELETE" && call.path.startsWith("/Coverage/ocpa-"))
    ).toBe(false);
  });

  it("reports a failed Coverage write instead of claiming reset succeeded", async () => {
    vi.stubEnv("FHIR_BASE_URL", "http://fhir.test/fhir");
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async (input: string, init?: RequestInit) =>
          new Response("{}", {
            status:
              input.endsWith("/Coverage/mopa-reference-coverage-sandra-chen") &&
              init?.method === "PUT"
                ? 500
                : 200,
          })
      )
    );
    const response = await POST();
    expect(response.status).toBe(502);
    const result = await response.json();
    expect(result.ok).toBe(false);
    expect(result.results.find((item: { id: string }) => item.id === "sandra-chen")).toMatchObject({
      ok: false,
      error: "Coverage/mopa-reference-coverage-sandra-chen: HTTP 500",
    });
  });

  it("does not reload a patient when its old app-owned Coverage cannot be removed", async () => {
    vi.stubEnv("FHIR_BASE_URL", "http://fhir.test/fhir");
    const calls: Array<{ path: string; method: string }> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string, init?: RequestInit) => {
        calls.push({ path: input, method: init?.method ?? "GET" });
        return new Response("{}", {
          status:
            input.endsWith("/Coverage/mopa-reference-coverage-sandra-chen") &&
            init?.method === "DELETE"
              ? 500
              : 200,
        });
      })
    );
    const response = await POST();
    expect(response.status).toBe(502);
    const result = await response.json();
    expect(result.results.find((item: { id: string }) => item.id === "sandra-chen")).toMatchObject({
      ok: false,
      error: "Coverage/mopa-reference-coverage-sandra-chen: HTTP 500",
    });
    expect(
      calls.some((call) => call.path.endsWith("/Patient/sandra-chen") && call.method === "DELETE")
    ).toBe(false);
  });
});
