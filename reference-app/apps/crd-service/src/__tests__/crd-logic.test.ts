import { describe, it, expect } from "vitest";
import {
  buildDiscoveryResponse,
  evaluatePayerPolicy,
  buildCoverageMetCard,
  buildPaRequiredCard,
  buildDtrCard,
  handleOncologyCrd,
  CRD_SERVICE_ID,
  CRD_SERVICE_ID_SIGN,
  LIBRARY_CANONICAL,
  PREFETCH_TEMPLATES,
  MISSING_KEY_LABELS,
} from "../crd-logic";
import { LIBRARY_RESOURCE } from "@mopa/knowledge-artifacts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBundle(entries: unknown[] = []) {
  return {
    resourceType: "Bundle",
    type: "searchset",
    total: entries.length,
    entry: entries.map((resource) => ({ resource })),
  };
}

const HER2_OBS = {
  resourceType: "Observation",
  id: "her2",
  status: "final",
  code: { coding: [{ system: "http://loinc.org", code: "85319-2" }] },
};
const STAGE_OBS = {
  resourceType: "Observation",
  id: "stage",
  status: "final",
  code: { coding: [{ system: "http://loinc.org", code: "21908-9" }] },
};
const ECOG_OBS = {
  resourceType: "Observation",
  id: "ecog",
  status: "final",
  code: { coding: [{ system: "http://loinc.org", code: "89247-1" }] },
};
const PATIENT = { resourceType: "Patient", id: "jane-smith" };

const BC_CONDITION = {
  resourceType: "Condition",
  id: "breast-cancer",
  clinicalStatus: {
    coding: [
      { system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" },
    ],
  },
  code: {
    coding: [
      {
        system: "http://snomed.info/sct",
        code: "372137005",
        display: "Primary malignant neoplasm of breast",
      },
    ],
  },
};

const FULL_PREFETCH = {
  patient: PATIENT,
  conditions: makeBundle([BC_CONDITION]),
  her2: makeBundle([HER2_OBS]),
  cancerStage: makeBundle([STAGE_OBS]),
  ecogPs: makeBundle([ECOG_OBS]),
};

// ---------------------------------------------------------------------------
// buildDiscoveryResponse
// ---------------------------------------------------------------------------

describe("buildDiscoveryResponse", () => {
  it("returns two services: order-select and order-sign", () => {
    const { services } = buildDiscoveryResponse();
    expect(services).toHaveLength(2);
    expect(services[0]?.id).toBe(CRD_SERVICE_ID);
    expect(services[0]?.hook).toBe("order-select");
    expect(services[1]?.id).toBe(CRD_SERVICE_ID_SIGN);
    expect(services[1]?.hook).toBe("order-sign");
  });

  it("advertises order-select hook", () => {
    expect(buildDiscoveryResponse().services[0]?.hook).toBe("order-select");
  });

  it("baseline prefetch contains patient and conditions only", () => {
    const keys = Object.keys(buildDiscoveryResponse().services[0]?.prefetch ?? {});
    expect(keys).toContain("patient");
    expect(keys).toContain("conditions");
    // Disease-specific keys are in conditionDataRequirements, not baseline prefetch
    expect(keys).not.toContain("her2");
  });

  it("includes conditionDataRequirements extension with breast cancer entry", () => {
    const ext = buildDiscoveryResponse().services[0]?.extension?.["mopa-service-extension"];
    const reqs = ext?.conditionDataRequirements ?? [];
    expect(reqs.length).toBeGreaterThan(0);
    const bc = reqs.find((r) => r.condition.code === "372137005");
    expect(bc).toBeDefined();
    expect(bc?.libraryUrl).toBe(LIBRARY_CANONICAL);
    expect(bc?.prefetchTemplates).toHaveProperty("her2");
  });
});

// ---------------------------------------------------------------------------
// evaluatePayerPolicy — CQL-driven
// ---------------------------------------------------------------------------

describe("evaluatePayerPolicy — CQL evaluation", () => {
  it("all data present → approved", async () => {
    const result = await evaluatePayerPolicy("jane-smith", FULL_PREFETCH);
    expect(result.status).toBe("approved");
  });

  it("HER2 absent → dtr-required, missingKeys contains her2", async () => {
    const result = await evaluatePayerPolicy("jane-smith", {
      ...FULL_PREFETCH,
      her2: makeBundle(),
    });
    expect(result.status).toBe("dtr-required");
    if (result.status === "dtr-required") expect(result.missingKeys).toContain("her2");
  });

  it("cancer stage absent → dtr-required, missingKeys contains cancerStage", async () => {
    const result = await evaluatePayerPolicy("jane-smith", {
      ...FULL_PREFETCH,
      cancerStage: makeBundle(),
    });
    expect(result.status).toBe("dtr-required");
    if (result.status === "dtr-required") expect(result.missingKeys).toContain("cancerStage");
  });

  it("ECOG absent → dtr-required, missingKeys contains ecogPs", async () => {
    const result = await evaluatePayerPolicy("jane-smith", {
      ...FULL_PREFETCH,
      ecogPs: makeBundle(),
    });
    expect(result.status).toBe("dtr-required");
    if (result.status === "dtr-required") expect(result.missingKeys).toContain("ecogPs");
  });

  it("breast cancer diagnosis absent → dtr-required, missingKeys contains breastCancer", async () => {
    const result = await evaluatePayerPolicy("jane-smith", {
      ...FULL_PREFETCH,
      conditions: makeBundle(),
    });
    expect(result.status).toBe("dtr-required");
    if (result.status === "dtr-required") expect(result.missingKeys).toContain("breastCancer");
  });

  it("no data → all four missing", async () => {
    const result = await evaluatePayerPolicy("jane-smith", {});
    expect(result.status).toBe("dtr-required");
    if (result.status === "dtr-required") {
      expect(result.missingKeys).toContain("breastCancer");
      expect(result.missingKeys).toContain("her2");
      expect(result.missingKeys).toContain("cancerStage");
      expect(result.missingKeys).toContain("ecogPs");
    }
  });
});

// ---------------------------------------------------------------------------
// Card builders
// ---------------------------------------------------------------------------

describe("buildPaRequiredCard", () => {
  it("returns a warning card", () => {
    expect(buildPaRequiredCard().indicator).toBe("warning");
  });

  it("summary mentions prior authorization", () => {
    expect(buildPaRequiredCard().summary.toLowerCase()).toContain("prior authorization");
  });

  it("topic code is prior-auth-required", () => {
    expect(buildPaRequiredCard().source.topic?.code).toBe("prior-auth-required");
  });
});

describe("buildCoverageMetCard", () => {
  it("returns an info card", () => {
    expect(buildCoverageMetCard().indicator).toBe("info");
    expect(buildCoverageMetCard().source.topic?.code).toBe("coverage-information");
  });

  it("summary mentions coverage criteria, not pre-approval", () => {
    expect(buildCoverageMetCard().summary.toLowerCase()).toContain("coverage criteria");
  });

  it("detail explains PA is still required at signing", () => {
    expect(buildCoverageMetCard().detail).toMatch(/prior authorization will be required/i);
  });
});

describe("buildDtrCard", () => {
  it("returns a warning card with a SMART link", () => {
    const card = buildDtrCard(["her2"]);
    expect(card.indicator).toBe("warning");
    expect(card.links?.[0]?.type).toBe("smart");
  });

  it("encodes libraryUrl and missingDataElements in appContext", () => {
    const card = buildDtrCard(["her2", "cancerStage"]);
    const ctx = JSON.parse(card.links?.[0]?.appContext ?? "{}");
    expect(ctx.libraryUrl).toBe(LIBRARY_CANONICAL);
    expect(ctx.missingDataElements).toEqual(["her2", "cancerStage"]);
  });

  it("uses MISSING_KEY_LABELS in detail text", () => {
    const card = buildDtrCard(["her2"]);
    expect(card.detail).toContain(MISSING_KEY_LABELS.her2);
  });
});

// ---------------------------------------------------------------------------
// handleOncologyCrd — integration
// ---------------------------------------------------------------------------

describe("handleOncologyCrd", () => {
  const base = {
    hookInstance: "test",
    hook: "order-select",
    context: {
      userId: "Practitioner/p1",
      patientId: "jane-smith",
      draftOrders: { resourceType: "Bundle" as const, type: "collection" },
      selections: [],
    },
  };

  it("order-select + all data present → coverage-criteria-met card", async () => {
    const response = await handleOncologyCrd({ ...base, prefetch: FULL_PREFETCH });
    expect(response.cards[0]?.indicator).toBe("info");
    expect(response.cards[0]?.summary).toMatch(/coverage criteria/i);
  });

  it("order-sign + all data present → PA-required card", async () => {
    const response = await handleOncologyCrd({
      ...base,
      hook: "order-sign",
      prefetch: FULL_PREFETCH,
    });
    expect(response.cards[0]?.indicator).toBe("warning");
    expect(response.cards[0]?.source.topic?.code).toBe("prior-auth-required");
  });

  it("order-sign + data missing → DTR card (not PA-required)", async () => {
    const response = await handleOncologyCrd({
      ...base,
      hook: "order-sign",
      prefetch: { ...FULL_PREFETCH, her2: makeBundle() },
    });
    expect(response.cards[0]?.links?.[0]?.type).toBe("smart");
  });

  it("coverage-criteria-met card when all data present", async () => {
    const response = await handleOncologyCrd({ ...base, prefetch: FULL_PREFETCH });
    expect(response.cards[0]?.indicator).toBe("info");
  });

  it("DTR card when HER2 absent", async () => {
    const response = await handleOncologyCrd({
      ...base,
      prefetch: { ...FULL_PREFETCH, her2: makeBundle() },
    });
    expect(response.cards[0]?.indicator).toBe("warning");
    expect(response.cards[0]?.links?.[0]?.type).toBe("smart");
  });

  it("no matching condition in prefetch → no-policy info card", async () => {
    const response = await handleOncologyCrd({ ...base });
    expect(response.cards[0]?.indicator).toBe("info");
    expect(response.cards[0]?.summary).toMatch(/No applicable coverage policy/);
  });
});

// ---------------------------------------------------------------------------
// LIBRARY_RESOURCE
// ---------------------------------------------------------------------------

describe("LIBRARY_RESOURCE", () => {
  it("has the correct canonical URL", () => {
    expect(LIBRARY_RESOURCE.url).toBe(LIBRARY_CANONICAL);
  });

  it("includes a HER2 dataRequirement", () => {
    const reqs = LIBRARY_RESOURCE.dataRequirement as unknown as Array<Record<string, unknown>>;
    const her2 = reqs.find((dr) => {
      const cf = (dr.codeFilter as Array<{ code?: Array<{ code: string }> }> | undefined)?.[0];
      return cf?.code?.some((c) => c.code === "85319-2");
    });
    expect(her2).toBeDefined();
  });

  it("has dataRequirements for all required elements", () => {
    const reqs = LIBRARY_RESOURCE.dataRequirement as unknown as Array<{
      extension?: Array<{ url: string; valueString?: string }>;
    }>;
    const labels = reqs.flatMap((dr) => dr.extension ?? []).map((e) => e.valueString);
    expect(labels).toContain("HER2 Status");
    expect(labels).toContain("Cancer Stage");
    expect(labels).toContain("ECOG Performance Status");
    expect(labels).toContain("Line of Therapy");
  });
});

// ---------------------------------------------------------------------------
// PREFETCH_TEMPLATES
// ---------------------------------------------------------------------------

describe("PREFETCH_TEMPLATES", () => {
  it("all non-patient templates reference patientId", () => {
    const all = Object.entries(PREFETCH_TEMPLATES)
      .filter(([k]) => k !== "patient")
      .every(([, v]) => v.includes("{{context.patientId}}"));
    expect(all).toBe(true);
  });
});
