import { describe, it, expect } from "vitest";
import {
  buildDiscoveryResponse,
  checkCompleteness,
  buildPreApprovedCard,
  buildDtrCard,
  handleOncologyCrd,
  CRD_SERVICE_ID,
  LIBRARY_CANONICAL,
  PREFETCH_TEMPLATES,
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

const HER2_OBS = { resourceType: "Observation", id: "her2-obs", status: "final" };
const STAGE_OBS = { resourceType: "Observation", id: "stage-obs", status: "final" };
const ECOG_OBS = { resourceType: "Observation", id: "ecog-obs", status: "final" };

const FULL_PREFETCH = {
  patient: { resourceType: "Patient", id: "jane-smith" },
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
    const { services } = buildDiscoveryResponse();
    expect(services[0]?.hook).toBe("order-select");
  });

  it("includes all required prefetch keys", () => {
    const { services } = buildDiscoveryResponse();
    const keys = Object.keys(services[0]?.prefetch ?? {});
    expect(keys).toContain("patient");
    expect(keys).toContain("her2");
    expect(keys).toContain("cancerStage");
    expect(keys).toContain("ecogPs");
  });

  it("includes OGCA extension with libraryUrl", () => {
    const { services } = buildDiscoveryResponse();
    const ext = services[0]?.extension?.["ogca-service-extension"];
    expect(ext?.libraryUrl).toBe(LIBRARY_CANONICAL);
  });
});

// ---------------------------------------------------------------------------
// checkCompleteness
// ---------------------------------------------------------------------------

describe("checkCompleteness", () => {
  it("returns approved when all data is present", () => {
    const result = checkCompleteness(FULL_PREFETCH);
    expect(result.status).toBe("approved");
  });

  it("returns dtr-required when HER2 is missing", () => {
    const result = checkCompleteness({ ...FULL_PREFETCH, her2: makeBundle() });
    expect(result.status).toBe("dtr-required");
    if (result.status === "dtr-required") expect(result.missingKeys).toContain("her2");
  });

  it("returns dtr-required when cancer stage is missing", () => {
    const result = checkCompleteness({ ...FULL_PREFETCH, cancerStage: makeBundle() });
    expect(result.status).toBe("dtr-required");
    if (result.status === "dtr-required") expect(result.missingKeys).toContain("cancerStage");
  });

  it("returns dtr-required when ECOG PS is missing", () => {
    const result = checkCompleteness({ ...FULL_PREFETCH, ecogPs: makeBundle() });
    expect(result.status).toBe("dtr-required");
    if (result.status === "dtr-required") expect(result.missingKeys).toContain("ecogPs");
  });

  it("lists all missing keys when nothing is populated", () => {
    const result = checkCompleteness({});
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
    const card = buildPreApprovedCard();
    expect(card.indicator).toBe("info");
    expect(card.summary).toMatch(/pre-approved/i);
  });
});

describe("buildDtrCard", () => {
  it("returns a warning card with a SMART link", () => {
    const card = buildDtrCard(["her2"]);
    expect(card.indicator).toBe("warning");
    expect(card.links).toHaveLength(1);
    expect(card.links?.[0]?.type).toBe("smart");
  });

  it("encodes libraryUrl and missingDataElements in appContext", () => {
    const card = buildDtrCard(["her2", "cancerStage"]);
    const ctx = JSON.parse(card.links?.[0]?.appContext ?? "{}");
    expect(ctx.libraryUrl).toBe(LIBRARY_CANONICAL);
    expect(ctx.missingDataElements).toEqual(["her2", "cancerStage"]);
  });

  it("human-labels missing keys in card detail", () => {
    const card = buildDtrCard(["her2"]);
    expect(card.detail).toMatch(/HER2 status/i);
  });
});

// ---------------------------------------------------------------------------
// handleOncologyCrd — integration of check + card selection
// ---------------------------------------------------------------------------

describe("handleOncologyCrd", () => {
  const baseRequest = {
    hookInstance: "test-instance",
    hook: "order-select",
    context: {
      userId: "Practitioner/p1",
      patientId: "jane-smith",
      draftOrders: { resourceType: "Bundle" as const, type: "collection" },
      selections: ["MedicationRequest/mr-1"],
    },
  };

  it("returns pre-approved card when all prefetch present", () => {
    const response = handleOncologyCrd({ ...baseRequest, prefetch: FULL_PREFETCH });
    expect(response.cards[0]?.indicator).toBe("info");
  });

  it("returns DTR card when HER2 is absent", () => {
    const response = handleOncologyCrd({
      ...baseRequest,
      prefetch: { ...FULL_PREFETCH, her2: makeBundle() },
    });
    expect(response.cards[0]?.indicator).toBe("warning");
    expect(response.cards[0]?.links?.[0]?.type).toBe("smart");
  });

  it("returns DTR card when prefetch is empty", () => {
    const response = handleOncologyCrd({ ...baseRequest });
    expect(response.cards[0]?.indicator).toBe("warning");
  });
});

// ---------------------------------------------------------------------------
// Library resource
// ---------------------------------------------------------------------------

describe("LIBRARY_RESOURCE", () => {
  it("has the correct canonical URL", () => {
    expect(LIBRARY_RESOURCE.url).toBe(LIBRARY_CANONICAL);
  });

  it("includes a dataRequirement for HER2", () => {
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
// PREFETCH_TEMPLATES — template substitution smoke test
// ---------------------------------------------------------------------------

describe("PREFETCH_TEMPLATES", () => {
  it("all templates contain {{context.patientId}}", () => {
    const nonPatient = Object.entries(PREFETCH_TEMPLATES)
      .filter(([k]) => k !== "patient")
      .every(([, v]) => v.includes("{{context.patientId}}"));
    expect(nonPatient).toBe(true);
  });
});
