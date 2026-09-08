import { describe, it, expect } from "vitest";
import {
  SNOMED,
  LOINC,
  BREAST_CANCER_CODE,
  FHIR_QUERIES,
  REQUEST_CATEGORY_EXTENSION,
  TREATMENT_LINE_CS,
  extractRequestCategories,
  MISSING_KEY_LABELS,
  extractResources,
  hasBreastCancer,
  hasObservation,
  extractEcogScore,
  evaluateBreastCancerPolicy,
  type OncologyContext,
} from "../index";

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
        system: SNOMED,
        code: BREAST_CANCER_CODE,
        display: "Malignant neoplasm of breast",
      },
    ],
  },
};

const HER2_OBS = {
  resourceType: "Observation",
  id: "her2",
  status: "final",
  code: { coding: [{ system: LOINC, code: "85319-2" }] },
};
const STAGE_OBS = {
  resourceType: "Observation",
  id: "stage",
  status: "final",
  code: { coding: [{ system: LOINC, code: "21908-9" }] },
};
const ECOG_OBS_0 = {
  resourceType: "Observation",
  id: "ecog-0",
  status: "final",
  code: { coding: [{ system: LOINC, code: "89247-1" }] },
  valueInteger: 0,
};
const ECOG_OBS_1 = {
  resourceType: "Observation",
  id: "ecog-1",
  status: "final",
  code: { coding: [{ system: LOINC, code: "89247-1" }] },
  valueInteger: 1,
};

const FULL_CONTEXT: OncologyContext = {
  conditions: makeBundle([BC_CONDITION]),
  her2: makeBundle([HER2_OBS]),
  cancerStage: makeBundle([STAGE_OBS]),
  ecogPs: makeBundle([ECOG_OBS_0]),
  priorTherapy: makeBundle([]),
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe("terminology constants", () => {
  it("exports SNOMED and LOINC system URIs", () => {
    expect(SNOMED).toBe("http://snomed.info/sct");
    expect(LOINC).toBe("http://loinc.org");
  });

  it("exports the breast cancer SNOMED code", () => {
    expect(BREAST_CANCER_CODE).toBe("372137005");
  });
});

describe("FHIR_QUERIES", () => {
  it("produces a conditions query with the patient id", () => {
    expect(FHIR_QUERIES.conditions("abc")).toBe(
      "Condition?patient=abc&category=problem-list-item&_count=20"
    );
  });

  it("produces a her2 query referencing LOINC and SNOMED codes", () => {
    const q = FHIR_QUERIES.her2("abc");
    expect(q).toContain("85319-2");
    expect(q).toContain("431396003");
    expect(q).toContain("patient=abc");
  });

  it("produces a cancer stage query", () => {
    expect(FHIR_QUERIES.cancerStage("abc")).toContain("21908-9");
  });

  it("produces an ecog query", () => {
    expect(FHIR_QUERIES.ecogPs("abc")).toContain("89247-1");
  });

  it("produces a prior therapy query for completed/stopped MedicationRequests", () => {
    expect(FHIR_QUERIES.priorTherapy("abc")).toContain("MedicationRequest");
    expect(FHIR_QUERIES.priorTherapy("abc")).toContain("completed,stopped");
  });
});

describe("MISSING_KEY_LABELS", () => {
  it("labels all four required data elements", () => {
    expect(MISSING_KEY_LABELS.breastCancer).toBe("Breast cancer diagnosis");
    expect(MISSING_KEY_LABELS.her2).toBe("HER2 status");
    expect(MISSING_KEY_LABELS.cancerStage).toBe("Cancer stage");
    expect(MISSING_KEY_LABELS.ecogPs).toBe("ECOG Performance Status");
  });
});

// ---------------------------------------------------------------------------
// extractResources
// ---------------------------------------------------------------------------

describe("extractResources", () => {
  it("returns resource objects from a Bundle", () => {
    const bundle = makeBundle([{ resourceType: "Patient", id: "p1" }]);
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
    expect(extractResources(makeBundle([]))).toEqual([]);
  });

  it("filters out entries lacking a resource", () => {
    const bundle = {
      entry: [{ resource: { resourceType: "Patient" } }, { other: "x" }],
    };
    expect(extractResources(bundle)).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// hasBreastCancer
// ---------------------------------------------------------------------------

describe("hasBreastCancer", () => {
  it("returns true when a breast cancer Condition is present", () => {
    expect(hasBreastCancer(makeBundle([BC_CONDITION]))).toBe(true);
  });

  it("returns false for a non-breast-cancer condition", () => {
    const other = {
      resourceType: "Condition",
      code: { coding: [{ system: SNOMED, code: "999999999" }] },
    };
    expect(hasBreastCancer(makeBundle([other]))).toBe(false);
  });

  it("returns false for an empty bundle", () => {
    expect(hasBreastCancer(makeBundle([]))).toBe(false);
  });

  it("ignores non-Condition resources", () => {
    expect(hasBreastCancer(makeBundle([HER2_OBS]))).toBe(false);
  });

  it("returns false for null input", () => {
    expect(hasBreastCancer(null)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// hasObservation
// ---------------------------------------------------------------------------

describe("hasObservation", () => {
  it("returns true when the bundle has at least one resource", () => {
    expect(hasObservation(makeBundle([HER2_OBS]))).toBe(true);
  });

  it("returns false for an empty bundle", () => {
    expect(hasObservation(makeBundle([]))).toBe(false);
  });

  it("returns false for null input", () => {
    expect(hasObservation(null)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// extractEcogScore
// ---------------------------------------------------------------------------

describe("extractEcogScore", () => {
  it("reads valueInteger from an ECOG observation", () => {
    expect(extractEcogScore(makeBundle([ECOG_OBS_0]))).toBe(0);
    expect(extractEcogScore(makeBundle([ECOG_OBS_1]))).toBe(1);
  });

  it("maps SNOMED grade codes to integer scores", () => {
    const snomed = (code: string) => ({
      resourceType: "Observation",
      code: { coding: [{ system: LOINC, code: "89247-1" }] },
      valueCodeableConcept: { coding: [{ system: SNOMED, code }] },
    });
    expect(extractEcogScore(makeBundle([snomed("425389002")]))).toBe(0);
    expect(extractEcogScore(makeBundle([snomed("422512005")]))).toBe(1);
    expect(extractEcogScore(makeBundle([snomed("422894000")]))).toBe(2);
    expect(extractEcogScore(makeBundle([snomed("423053003")]))).toBe(3);
  });

  it("returns undefined when no value is present", () => {
    const noValue = {
      resourceType: "Observation",
      code: { coding: [{ system: LOINC, code: "89247-1" }] },
    };
    expect(extractEcogScore(makeBundle([noValue]))).toBeUndefined();
  });

  it("returns undefined for an empty bundle", () => {
    expect(extractEcogScore(makeBundle([]))).toBeUndefined();
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

  it("consumes repeated intent and line categories on RequestGroup", () => {
    const result = evaluateBreastCancerPolicy({
      ...FULL_CONTEXT,
      requestCategories: [
        { system: SNOMED, code: "373846009", display: "Adjuvant - intent" },
        { system: TREATMENT_LINE_CS, code: "1L", display: "First-line" },
      ],
    });
    expect(result.status).toBe("authorization-satisfied");
    if (result.status === "authorization-satisfied") {
      expect(result.reason).toContain("Adjuvant - intent");
    }
  });

  it("requires PA for a valid subsequent-line category", () => {
    const result = evaluateBreastCancerPolicy({
      ...FULL_CONTEXT,
      requestCategories: [
        { system: SNOMED, code: "363676003", display: "Palliative intent" },
        { system: TREATMENT_LINE_CS, code: "2L", display: "Second-line" },
      ],
    });
    expect(result.status).toBe("pa-required");
    if (result.status === "pa-required") {
      expect(result.reason).toContain("Palliative intent");
    }
  });

  it("extracts repeated CRD categories and rejects malformed values", () => {
    const result = extractRequestCategories({
      entry: [
        {
          resource: {
            resourceType: "RequestGroup",
            extension: [
              {
                url: REQUEST_CATEGORY_EXTENSION,
                valueCodeableConcept: {
                  coding: [{ system: SNOMED, code: "373846009", display: "Adjuvant - intent" }],
                },
              },
              {
                url: REQUEST_CATEGORY_EXTENSION,
                valueCodeableConcept: { coding: [{ system: TREATMENT_LINE_CS, code: "1L" }] },
              },
              { url: REQUEST_CATEGORY_EXTENSION, valueString: "not-a-code" },
            ],
          },
        },
      ],
    });
    expect(result.categories).toHaveLength(2);
    expect(result.invalid).toHaveLength(1);
  });

  it("all data present, ECOG 1 → pa-required", () => {
    const result = evaluateBreastCancerPolicy({
      ...FULL_CONTEXT,
      ecogPs: makeBundle([ECOG_OBS_1]),
    });
    expect(result.status).toBe("pa-required");
  });

  it("all data present, ECOG absent (no value) → pa-required", () => {
    const noValue = {
      resourceType: "Observation",
      id: "ecog-no-val",
      status: "final",
      code: { coding: [{ system: LOINC, code: "89247-1" }] },
    };
    const result = evaluateBreastCancerPolicy({
      ...FULL_CONTEXT,
      ecogPs: makeBundle([noValue]),
    });
    expect(result.status).toBe("pa-required");
  });

  it("HER2 absent → dtr-required, missingKeys contains her2", () => {
    const result = evaluateBreastCancerPolicy({ ...FULL_CONTEXT, her2: makeBundle() });
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
    const result = evaluateBreastCancerPolicy({ ...FULL_CONTEXT, ecogPs: makeBundle() });
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

  it("reports missing keys in a stable order", () => {
    const result = evaluateBreastCancerPolicy({
      conditions: makeBundle(),
      her2: makeBundle(),
      cancerStage: makeBundle(),
      ecogPs: makeBundle(),
      priorTherapy: makeBundle(),
    });
    if (result.status === "dtr-required") {
      expect(result.missingKeys).toEqual(["breastCancer", "her2", "cancerStage", "ecogPs"]);
    }
  });
});
