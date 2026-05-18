import { describe, it, expect } from "vitest";
import {
  buildDiscoveryResponse,
  evaluatePayerPolicy,
  buildPreApprovedCard,
  buildDtrCard,
  handleOncologyCrd,
  CRD_SERVICE_ID,
  LIBRARY_CANONICAL,
  PREFETCH_TEMPLATES,
  MISSING_KEY_LABELS,
} from "../crd-logic";
import { LIBRARY_RESOURCE } from "../library-resource";

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

const FULL_PREFETCH = {
  patient: PATIENT,
  her2: makeBundle([HER2_OBS]),
  cancerStage: makeBundle([STAGE_OBS]),
  ecogPs: makeBundle([ECOG_OBS]),
};

// ---------------------------------------------------------------------------
// buildDiscoveryResponse
// ---------------------------------------------------------------------------

describe("buildDiscoveryResponse", () => {
  it("returns one service with id oncology-crd", () => {
    const { services } = buildDiscoveryResponse();
    expect(services).toHaveLength(1);
    expect(services[0]?.id).toBe(CRD_SERVICE_ID);
  });

  it("advertises order-select hook", () => {
    expect(buildDiscoveryResponse().services[0]?.hook).toBe("order-select");
  });

  it("includes all required prefetch keys", () => {
    const keys = Object.keys(buildDiscoveryResponse().services[0]?.prefetch ?? {});
    expect(keys).toContain("patient");
    expect(keys).toContain("her2");
    expect(keys).toContain("cancerStage");
    expect(keys).toContain("ecogPs");
  });

  it("includes OGCA extension with libraryUrl", () => {
    const ext = buildDiscoveryResponse().services[0]?.extension?.["ogca-service-extension"];
    expect(ext?.libraryUrl).toBe(LIBRARY_CANONICAL);
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

  it("no data → all three missing", async () => {
    const result = await evaluatePayerPolicy("jane-smith", {});
    expect(result.status).toBe("dtr-required");
    if (result.status === "dtr-required") {
      expect(result.missingKeys).toContain("her2");
      expect(result.missingKeys).toContain("cancerStage");
      expect(result.missingKeys).toContain("ecogPs");
    }
  });
});

// ---------------------------------------------------------------------------
// Card builders
// ---------------------------------------------------------------------------

describe("buildPreApprovedCard", () => {
  it("returns an info card", () => {
    expect(buildPreApprovedCard().indicator).toBe("info");
    expect(buildPreApprovedCard().summary).toMatch(/pre-approved/i);
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

  it("pre-approved when all data present", async () => {
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

  it("DTR card when prefetch is empty", async () => {
    const response = await handleOncologyCrd({ ...base });
    expect(response.cards[0]?.indicator).toBe("warning");
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
    const her2 = LIBRARY_RESOURCE.dataRequirement.find((dr) => {
      const cf = dr.codeFilter?.[0] as { code?: Array<{ code: string }> } | undefined;
      return cf?.code?.some((c) => c.code === "85319-2");
    });
    expect(her2).toBeDefined();
  });

  it("has dataRequirements for all required elements", () => {
    const labels = LIBRARY_RESOURCE.dataRequirement
      .flatMap((dr) => dr.extension ?? [])
      .map((e) => e.valueString);
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
