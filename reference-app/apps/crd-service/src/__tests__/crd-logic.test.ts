import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildDiscoveryResponse,
  evaluateBreastCancerPolicy,
  buildAuthorizationSatisfiedCard,
  buildDtrCard,
  handleOncologyCrd,
  CRD_SERVICE_ID,
  CRD_SERVICE_ID_SIGN,
  MISSING_KEY_LABELS,
  type OncologyContext,
} from "../crd-logic";

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
const PRIOR_THERAPY_BUNDLE = makeBundle([]);

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
        code: "254837009",
        display: "Malignant neoplasm of breast",
      },
    ],
  },
};

const FULL_CONTEXT: OncologyContext = {
  conditions: makeBundle([BC_CONDITION]),
  her2: makeBundle([HER2_OBS]),
  cancerStage: makeBundle([STAGE_OBS]),
  ecogPs: makeBundle([ECOG_OBS]),
  priorTherapy: PRIOR_THERAPY_BUNDLE,
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

  it("does not include a custom extension", () => {
    const { services } = buildDiscoveryResponse();
    expect(services[0]?.extension).toBeUndefined();
  });

  it("does not advertise prefetch templates", () => {
    const { services } = buildDiscoveryResponse();
    expect(services[0]?.prefetch).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// evaluateBreastCancerPolicy
// ---------------------------------------------------------------------------

describe("evaluateBreastCancerPolicy", () => {
  it("all data present → authorization-satisfied", () => {
    const result = evaluateBreastCancerPolicy(FULL_CONTEXT);
    expect(result.status).toBe("authorization-satisfied");
  });

  it("HER2 absent → dtr-required, missingKeys contains her2", () => {
    const result = evaluateBreastCancerPolicy({
      ...FULL_CONTEXT,
      her2: makeBundle(),
    });
    expect(result.status).toBe("dtr-required");
    if (result.status === "dtr-required") expect(result.missingKeys).toContain("her2");
  });

  it("cancer stage absent → dtr-required, missingKeys contains cancerStage", () => {
    const result = evaluateBreastCancerPolicy({
      ...FULL_CONTEXT,
      cancerStage: makeBundle(),
    });
    expect(result.status).toBe("dtr-required");
    if (result.status === "dtr-required") expect(result.missingKeys).toContain("cancerStage");
  });

  it("ECOG absent → dtr-required, missingKeys contains ecogPs", () => {
    const result = evaluateBreastCancerPolicy({
      ...FULL_CONTEXT,
      ecogPs: makeBundle(),
    });
    expect(result.status).toBe("dtr-required");
    if (result.status === "dtr-required") expect(result.missingKeys).toContain("ecogPs");
  });

  it("breast cancer diagnosis absent → dtr-required, missingKeys contains breastCancer", () => {
    const result = evaluateBreastCancerPolicy({
      ...FULL_CONTEXT,
      conditions: makeBundle(),
    });
    expect(result.status).toBe("dtr-required");
    if (result.status === "dtr-required") expect(result.missingKeys).toContain("breastCancer");
  });

  it("no data → all four missing", () => {
    const result = evaluateBreastCancerPolicy({
      conditions: makeBundle(),
      her2: makeBundle(),
      cancerStage: makeBundle(),
      ecogPs: makeBundle(),
      priorTherapy: makeBundle(),
    });
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

describe("buildAuthorizationSatisfiedCard", () => {
  it("returns a success card", () => {
    expect(buildAuthorizationSatisfiedCard().indicator).toBe("success");
  });

  it("summary says Authorization Satisfied", () => {
    expect(buildAuthorizationSatisfiedCard().summary).toBe("Authorization Satisfied");
  });
});

describe("buildDtrCard", () => {
  it("returns a warning card with a SMART link", () => {
    const card = buildDtrCard(["her2"]);
    expect(card.indicator).toBe("warning");
    expect(card.links?.[0]?.type).toBe("smart");
  });

  it("encodes missingDataElements in appContext", () => {
    const card = buildDtrCard(["her2", "cancerStage"]);
    const ctx = JSON.parse(card.links?.[0]?.appContext ?? "{}");
    expect(ctx.missingDataElements).toEqual(["her2", "cancerStage"]);
  });

  it("uses MISSING_KEY_LABELS in detail text", () => {
    const card = buildDtrCard(["her2"]);
    expect(card.detail).toContain(MISSING_KEY_LABELS.her2);
  });
});

// ---------------------------------------------------------------------------
// handleOncologyCrd — integration (with mocked fetch)
// ---------------------------------------------------------------------------

describe("handleOncologyCrd", () => {
  const baseRequest = {
    hookInstance: "test",
    hook: "order-select" as const,
    context: {
      userId: "Practitioner/p1",
      patientId: "jane-smith",
      draftOrders: { resourceType: "Bundle" as const, type: "collection" },
      selections: [],
    },
    fhirServer: "http://localhost:8080/fhir",
  };

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        // Route FHIR queries to mock responses
        if (url.includes("Condition")) {
          return Promise.resolve({
            ok: true,
            json: async () => FULL_CONTEXT.conditions,
          });
        }
        if (url.includes("85319-2") || url.includes("431396003")) {
          return Promise.resolve({
            ok: true,
            json: async () => FULL_CONTEXT.her2,
          });
        }
        if (url.includes("21908-9")) {
          return Promise.resolve({
            ok: true,
            json: async () => FULL_CONTEXT.cancerStage,
          });
        }
        if (url.includes("89247-1")) {
          return Promise.resolve({
            ok: true,
            json: async () => FULL_CONTEXT.ecogPs,
          });
        }
        if (url.includes("MedicationRequest")) {
          return Promise.resolve({
            ok: true,
            json: async () => FULL_CONTEXT.priorTherapy,
          });
        }
        return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
      })
    );
  });

  it("order-select + all data present → authorization satisfied", async () => {
    const response = await handleOncologyCrd(baseRequest);
    expect(response.cards[0]?.indicator).toBe("success");
    expect(response.cards[0]?.summary).toBe("Authorization Satisfied");
  });

  it("order-sign + all data present → authorization satisfied", async () => {
    const response = await handleOncologyCrd({
      ...baseRequest,
      hook: "order-sign",
    });
    expect(response.cards[0]?.indicator).toBe("success");
  });

  it("DTR card when HER2 absent", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("Condition")) {
          return Promise.resolve({
            ok: true,
            json: async () => FULL_CONTEXT.conditions,
          });
        }
        if (url.includes("85319-2") || url.includes("431396003")) {
          return Promise.resolve({
            ok: true,
            json: async () => makeBundle(), // empty — HER2 missing
          });
        }
        if (url.includes("21908-9")) {
          return Promise.resolve({
            ok: true,
            json: async () => FULL_CONTEXT.cancerStage,
          });
        }
        if (url.includes("89247-1")) {
          return Promise.resolve({
            ok: true,
            json: async () => FULL_CONTEXT.ecogPs,
          });
        }
        if (url.includes("MedicationRequest")) {
          return Promise.resolve({
            ok: true,
            json: async () => FULL_CONTEXT.priorTherapy,
          });
        }
        return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
      })
    );

    const response = await handleOncologyCrd(baseRequest);
    expect(response.cards[0]?.indicator).toBe("warning");
    expect(response.cards[0]?.links?.[0]?.type).toBe("smart");
  });

  it("no fhirServer → no-policy info card", async () => {
    const response = await handleOncologyCrd({
      ...baseRequest,
      fhirServer: undefined,
    });
    expect(response.cards[0]?.indicator).toBe("info");
    expect(response.cards[0]?.summary).toMatch(/No applicable coverage policy/);
  });
});
