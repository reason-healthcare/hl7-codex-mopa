import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildDiscoveryResponse,
  evaluateBreastCancerPolicy,
  buildAuthorizationSatisfiedCard,
  buildPaRequiredCard,
  buildApprovableCard,
  buildPaWillBeRequiredCard,
  buildDtrCard,
  buildSubstitutionSuggestionCard,
  handleOncologyCrd,
  CRD_SERVICE_ID,
  CRD_SERVICE_ID_SIGN,
  MISSING_KEY_LABELS,
  type OncologyContext,
} from "../crd-logic";
import { REGIMENS } from "@mopa/oncology-policy";

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
  valueInteger: 0,
};

const ECOG_OBS_SCORE_1 = {
  resourceType: "Observation",
  id: "ecog-1",
  status: "final",
  code: { coding: [{ system: "http://loinc.org", code: "89247-1" }] },
  valueInteger: 1,
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
        code: "372137005",
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
  it("all data present, ECOG 0 → authorization-satisfied", () => {
    const result = evaluateBreastCancerPolicy(FULL_CONTEXT);
    expect(result.status).toBe("authorization-satisfied");
  });

  it("all data present, ECOG 1 → pa-required", () => {
    const result = evaluateBreastCancerPolicy({
      ...FULL_CONTEXT,
      ecogPs: makeBundle([ECOG_OBS_SCORE_1]),
    });
    expect(result.status).toBe("pa-required");
  });

  it("all data present, ECOG absent (no value) → pa-required", () => {
    const ecogNoValue = {
      resourceType: "Observation",
      id: "ecog-no-val",
      status: "final",
      code: { coding: [{ system: "http://loinc.org", code: "89247-1" }] },
    };
    const result = evaluateBreastCancerPolicy({
      ...FULL_CONTEXT,
      ecogPs: makeBundle([ecogNoValue]),
    });
    expect(result.status).toBe("pa-required");
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

describe("buildPaRequiredCard", () => {
  it("returns a warning card", () => {
    expect(buildPaRequiredCard().indicator).toBe("warning");
  });

  it("summary says Prior Authorization Required", () => {
    expect(buildPaRequiredCard().summary).toBe("Prior Authorization Required");
  });

  it("has prior-auth-required topic code", () => {
    expect(buildPaRequiredCard().source.topic?.code).toBe("prior-auth-required");
  });
});

describe("buildApprovableCard", () => {
  it("returns an info card (not success)", () => {
    expect(buildApprovableCard().indicator).toBe("info");
  });

  it("summary says Approvable", () => {
    expect(buildApprovableCard().summary).toContain("Approvable");
  });

  it("has coverage-information topic code", () => {
    expect(buildApprovableCard().source.topic?.code).toBe("coverage-information");
  });
});

describe("buildPaWillBeRequiredCard", () => {
  it("returns a warning card", () => {
    expect(buildPaWillBeRequiredCard().indicator).toBe("warning");
  });

  it("summary says PA Will Be Required", () => {
    expect(buildPaWillBeRequiredCard().summary).toBe("PA Will Be Required");
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
            json: async () => makeBundle([ECOG_OBS]),
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

  it("order-select + all data present → approvable (info)", async () => {
    const response = await handleOncologyCrd(baseRequest);
    expect(response.cards[0]?.indicator).toBe("info");
    expect(response.cards[0]?.summary).toContain("Approvable");
  });

  it("order-sign + all data present → authorization satisfied (success)", async () => {
    const response = await handleOncologyCrd({
      ...baseRequest,
      hook: "order-sign",
    });
    expect(response.cards[0]?.indicator).toBe("success");
    expect(response.cards[0]?.summary).toBe("Authorization Satisfied");
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

// ---------------------------------------------------------------------------
// buildSubstitutionSuggestionCard
// ---------------------------------------------------------------------------

describe("buildSubstitutionSuggestionCard", () => {
  it("returns null for regimen without biosimilars", () => {
    // ddAC-T has no biosimilars
    const ddact = REGIMENS.find((r) => r.id === "ddAC-T")!;
    const card = buildSubstitutionSuggestionCard("jane-smith", ddact);
    expect(card).toBeNull();
  });

  it("returns a suggestion card for TH regimen (has biosimilars)", () => {
    const th = REGIMENS.find((r) => r.id === "TH")!;
    const card = buildSubstitutionSuggestionCard("jane-smith", th);

    expect(card).not.toBeNull();
    expect(card!.indicator).toBe("info");
    expect(card!.source.topic?.code).toBe("therapy-alternatives-req");
    expect(card!.suggestions).toBeDefined();
    expect(card!.suggestions!.length).toBe(1);
    expect(card!.selectionBehavior).toBe("at-most-one");
  });

  it("suggestion has delete + create actions", () => {
    const th = REGIMENS.find((r) => r.id === "TH")!;
    const card = buildSubstitutionSuggestionCard("jane-smith", th);

    const actions = card!.suggestions![0].actions!;
    const types = actions.map((a: { type: string }) => a.type);
    expect(types).toContain("delete");
    expect(types).toContain("create");
  });

  it("delete action references the original MedicationRequest resourceId", () => {
    const th = REGIMENS.find((r) => r.id === "TH")!;
    const card = buildSubstitutionSuggestionCard("jane-smith", th);

    const deleteAction = card!.suggestions![0].actions!.find((a: { type: string }) => a.type === "delete");
    expect(deleteAction!.resourceId).toBe("urn:uuid:mr-trastuzumab-th");
  });

  it("create action has a MedicationRequest with biosimilar RxNorm code", () => {
    const th = REGIMENS.find((r) => r.id === "TH")!;
    const card = buildSubstitutionSuggestionCard("jane-smith", th);

    const createAction = card!.suggestions![0].actions!.find((a: { type: string }) => a.type === "create");
    const resource = createAction!.resource as { resourceType: string; medicationCodeableConcept: { coding: Array<{ code: string; display: string }> } };
    expect(resource.resourceType).toBe("MedicationRequest");
    expect(resource.medicationCodeableConcept.coding[0].code).toBe("1992624");
    expect(resource.medicationCodeableConcept.coding[0].display).toContain("trastuzumab-dttb");
  });

  it("card has override reasons", () => {
    const th = REGIMENS.find((r) => r.id === "TH")!;
    const card = buildSubstitutionSuggestionCard("jane-smith", th);

    expect(card!.overrideReasons).toBeDefined();
    expect(card!.overrideReasons!.length).toBeGreaterThan(0);
    expect(card!.overrideReasons![0].code).toBe("clinical-contraindication");
  });
});

// ---------------------------------------------------------------------------
// handleOncologyCrd — biosimilar suggestion at order-select
// ---------------------------------------------------------------------------

describe("handleOncologyCrd — biosimilar substitution", () => {
  const thDraftOrders = {
    resourceType: "Bundle" as const,
    type: "collection" as const,
    entry: [
      {
        fullUrl: "urn:uuid:rg-TH",
        resource: {
          resourceType: "RequestGroup",
          id: "rg-TH",
          status: "draft",
          intent: "order",
          instantiatesCanonical: ["http://hl7.org/fhir/us/codex-mopa/PlanDefinition/RegimenTH"],
        },
      },
    ],
  };

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) => {
        if (url.includes("Condition")) {
          return Promise.resolve({ ok: true, json: async () => FULL_CONTEXT.conditions });
        }
        if (url.includes("85319-2") || url.includes("431396003")) {
          return Promise.resolve({ ok: true, json: async () => FULL_CONTEXT.her2 });
        }
        if (url.includes("21908-9")) {
          return Promise.resolve({ ok: true, json: async () => FULL_CONTEXT.cancerStage });
        }
        if (url.includes("89247-1")) {
          return Promise.resolve({ ok: true, json: async () => makeBundle([ECOG_OBS]) });
        }
        if (url.includes("MedicationRequest")) {
          return Promise.resolve({ ok: true, json: async () => FULL_CONTEXT.priorTherapy });
        }
        return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
      })
    );
  });

  it("order-select with TH regimen returns approvable card + substitution suggestion card", async () => {
    const response = await handleOncologyCrd({
      hookInstance: "test",
      hook: "order-select",
      context: {
        userId: "Practitioner/p1",
        patientId: "jane-smith",
        draftOrders: thDraftOrders,
        selections: ["urn:uuid:rg-TH"],
      },
      fhirServer: "http://localhost:8080/fhir",
    });

    expect(response.cards.length).toBe(2);
    // First card: approvable
    expect(response.cards[0]?.indicator).toBe("info");
    expect(response.cards[0]?.summary).toContain("Approvable");
    // Second card: substitution suggestion
    expect(response.cards[1]?.suggestions).toBeDefined();
    expect(response.cards[1]?.source.topic?.code).toBe("therapy-alternatives-req");
  });

  it("order-sign with TH regimen returns only authorization satisfied (no suggestion)", async () => {
    const response = await handleOncologyCrd({
      hookInstance: "test",
      hook: "order-sign",
      context: {
        userId: "Practitioner/p1",
        patientId: "jane-smith",
        draftOrders: thDraftOrders,
        selections: ["urn:uuid:rg-TH"],
      },
      fhirServer: "http://localhost:8080/fhir",
    });

    expect(response.cards.length).toBe(1);
    expect(response.cards[0]?.indicator).toBe("success");
    expect(response.cards[0]?.suggestions).toBeUndefined();
  });
});
