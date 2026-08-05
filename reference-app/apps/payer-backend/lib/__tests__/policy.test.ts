import { describe, it, expect, vi, beforeEach } from "vitest";
import { evaluatePolicy } from "../policy";

// Mock the shared policy helpers — we only need to test the PaDecision
// translation layer in payer-backend/lib/policy.ts, not the shared logic
// (which is already tested in @mopa/oncology-policy).

vi.mock("@mopa/oncology-policy", () => ({
  FHIR_QUERIES: {
    conditions: (id: string) => `Condition?patient=${id}`,
    her2: (id: string) => `Observation?patient=${id}&her2`,
    cancerStage: (id: string) => `Observation?patient=${id}&stage`,
    ecogPs: (id: string) => `Observation?patient=${id}&ecog`,
    priorTherapy: (id: string) => `MedicationRequest?patient=${id}`,
  },
  evaluateBreastCancerPolicy: vi.fn(),
  extractResources: (bundle: unknown) => {
    if (!bundle || typeof bundle !== "object") return [];
    const b = bundle as { entry?: Array<{ resource?: unknown }> };
    return (b.entry ?? []).map((e) => e.resource).filter(Boolean) as Record<string, unknown>[];
  },
  hasBreastCancer: (bundle: unknown) => {
    const b = bundle as { entry?: Array<{ resource?: { resourceType?: string; code?: { coding?: Array<{ system?: string; code?: string }> } } }> };
    return (b.entry ?? []).some((e) => {
      const r = e.resource;
      return r?.resourceType === "Condition" && r?.code?.coding?.some((c) => c.code === "372137005");
    });
  },
  hasObservation: (bundle: unknown) => {
    const b = bundle as { entry?: unknown[] };
    return (b.entry ?? []).length > 0;
  },
  toBundle: (resources: unknown[]) => ({
    resourceType: "Bundle",
    type: "searchset",
    total: resources.length,
    entry: resources.map((resource) => ({ resource })),
  }),
}));

import { evaluateBreastCancerPolicy } from "@mopa/oncology-policy";

function mockFetch(responses: Record<string, unknown>) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((url: string) => {
      for (const [key, val] of Object.entries(responses)) {
        if (url.includes(key)) {
          return Promise.resolve({ ok: true, json: async () => val });
        }
      }
      return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
    })
  );
}

const BC_CONDITION_BUNDLE = {
  entry: [
    {
      resource: {
        resourceType: "Condition",
        code: { coding: [{ system: "http://snomed.info/sct", code: "372137005" }] },
      },
    },
  ],
};

const OBS_BUNDLE = { entry: [{ resource: { resourceType: "Observation" } }] };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("evaluatePolicy", () => {
  it("returns pended when no breast cancer diagnosis found", async () => {
    mockFetch({ Condition: { entry: [] } });
    const decision = await evaluatePolicy("p1");
    expect(decision.status).toBe("pended");
    expect(decision.reason).toContain("No active breast cancer diagnosis");
  });

  it("returns pended when required observations are missing", async () => {
    mockFetch({
      Condition: BC_CONDITION_BUNDLE,
      her2: { entry: [] },
      stage: { entry: [] },
      ecog: { entry: [] },
    });
    const decision = await evaluatePolicy("p1");
    expect(decision.status).toBe("pended");
    expect(decision.reason).toContain("Missing required data");
  });

  it("returns approved when policy says authorization-satisfied", async () => {
    vi.mocked(evaluateBreastCancerPolicy).mockReturnValue({
      status: "authorization-satisfied",
      reason: "ECOG 0",
    });
    mockFetch({
      Condition: BC_CONDITION_BUNDLE,
      her2: OBS_BUNDLE,
      stage: OBS_BUNDLE,
      ecog: OBS_BUNDLE,
    });
    const decision = await evaluatePolicy("p1");
    expect(decision.status).toBe("approved");
    expect(decision.reason).toContain("All clinical criteria met");
  });

  it("returns pended when policy says pa-required", async () => {
    vi.mocked(evaluateBreastCancerPolicy).mockReturnValue({
      status: "pa-required",
      reason: "ECOG >= 1",
    });
    mockFetch({
      Condition: BC_CONDITION_BUNDLE,
      her2: OBS_BUNDLE,
      stage: OBS_BUNDLE,
      ecog: OBS_BUNDLE,
    });
    const decision = await evaluatePolicy("p1");
    expect(decision.status).toBe("pended");
    expect(decision.reason).toBe("ECOG >= 1");
  });

  it("returns pended when fetch throws (network error)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const decision = await evaluatePolicy("p1");
    expect(decision.status).toBe("pended");
    expect(decision.reason).toContain("No active breast cancer diagnosis");
  });
});
