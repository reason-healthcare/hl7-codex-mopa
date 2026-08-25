import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CqlExecutionEngine, buildPatientBundle, extractBundleResources } from "../index";
import type { ElmJson } from "../index";

// ---------------------------------------------------------------------------
// Load compiled ELM
// ---------------------------------------------------------------------------

const ELM_DIR = resolve(__dirname, "../../../../cql/elm");

let policyElm: ElmJson;
let guidelineElm: ElmJson;

beforeAll(() => {
  policyElm = JSON.parse(
    readFileSync(resolve(ELM_DIR, "BreastCancerPayerPolicy.elm.json"), "utf-8")
  ) as ElmJson;
  guidelineElm = JSON.parse(
    readFileSync(resolve(ELM_DIR, "BreastCancerGuideline.elm.json"), "utf-8")
  ) as ElmJson;
});

// ---------------------------------------------------------------------------
// FHIR fixture helpers
// ---------------------------------------------------------------------------

const PATIENT_ID = "katherine-johnson";
const SNOMED = "http://snomed.info/sct";
const LOINC = "http://loinc.org";

function makeObs(code: string, system: string): object {
  return {
    resourceType: "Observation",
    id: `obs-${code}`,
    status: "final",
    code: { coding: [{ system, code }] },
    subject: { reference: `Patient/${PATIENT_ID}` },
  };
}

function makeObsWithValue(
  code: string,
  system: string,
  valueCode: string,
  valueSystem: string,
  valueDisplay: string
): object {
  return {
    resourceType: "Observation",
    id: `obs-${code}`,
    status: "final",
    code: { coding: [{ system, code }] },
    subject: { reference: `Patient/${PATIENT_ID}` },
    valueCodeableConcept: {
      coding: [{ system: valueSystem, code: valueCode, display: valueDisplay }],
    },
  };
}

function makeObsWithInteger(code: string, system: string, value: number): object {
  return {
    resourceType: "Observation",
    id: `obs-${code}`,
    status: "final",
    code: { coding: [{ system, code }] },
    subject: { reference: `Patient/${PATIENT_ID}` },
    valueInteger: value,
  };
}

function makeDiagnosis(snomedCode: string): object {
  return {
    resourceType: "Condition",
    id: `condition-${snomedCode}`,
    clinicalStatus: {
      coding: [
        { system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" },
      ],
    },
    code: { coding: [{ system: "http://snomed.info/sct", code: snomedCode }] },
    subject: { reference: `Patient/${PATIENT_ID}` },
  };
}

const PATIENT = { resourceType: "Patient", id: PATIENT_ID };
const BREAST_CA_DX = makeDiagnosis("372137005");

// HER2 observations
const HER2_POSITIVE = makeObsWithValue("85319-2", LOINC, "10828004", SNOMED, "Positive (qualifier value)");
const HER2_NEGATIVE = makeObsWithValue("85319-2", LOINC, "260385009", SNOMED, "Negative (qualifier value)");

// ER / PR observations
const ER_POSITIVE = makeObsWithValue("85337-4", LOINC, "10828004", SNOMED, "Positive (qualifier value)");
const PR_NEGATIVE = makeObsWithValue("85339-0", LOINC, "260385009", SNOMED, "Negative (qualifier value)");

// Stage observation
const STAGE_OBS = makeObsWithValue("21908-9", LOINC, "1222766008", SNOMED, "Stage IIA (AJCC)");

// ECOG observation
const ECOG_OBS = makeObsWithInteger("89247-1", LOINC, 0);

// OncotypeDX observation (recurrence score = 28)
const ONCOTYPEDX_28 = makeObsWithInteger("104119-3", LOINC, 28);

// Menopausal status observation (postmenopausal)
const POSTMENOPAUSAL = makeObsWithValue("428361000124107", SNOMED, "428361000124107", SNOMED, "Postmenopausal state");

// ---------------------------------------------------------------------------
// buildPatientBundle / extractBundleResources
// ---------------------------------------------------------------------------

describe("buildPatientBundle", () => {
  it("wraps resources in a collection Bundle", () => {
    const bundle = buildPatientBundle(PATIENT_ID, [PATIENT, HER2_POSITIVE]);
    expect(bundle.resourceType).toBe("Bundle");
    expect(bundle.type).toBe("collection");
    expect(bundle.entry).toHaveLength(2);
  });

  it("injects a stub Patient when none is provided", () => {
    const bundle = buildPatientBundle(PATIENT_ID, [HER2_POSITIVE]);
    const types = bundle.entry.map((e) => (e.resource as { resourceType: string }).resourceType);
    expect(types).toContain("Patient");
  });

  it("does not duplicate Patient when one is already in resources", () => {
    const bundle = buildPatientBundle(PATIENT_ID, [PATIENT, ECOG_OBS]);
    const patients = bundle.entry.filter(
      (e) => (e.resource as { resourceType: string }).resourceType === "Patient"
    );
    expect(patients).toHaveLength(1);
  });
});

describe("extractBundleResources", () => {
  it("extracts resources from a searchset Bundle", () => {
    const bundle = {
      resourceType: "Bundle",
      type: "searchset",
      entry: [{ resource: HER2_POSITIVE }, { resource: STAGE_OBS }],
    };
    expect(extractBundleResources(bundle)).toHaveLength(2);
  });

  it("returns empty array for non-bundle input", () => {
    expect(extractBundleResources(undefined)).toEqual([]);
    expect(extractBundleResources(null)).toEqual([]);
    expect(extractBundleResources({ resourceType: "Patient" })).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// BreastCancerPayerPolicy CQL evaluation
// ---------------------------------------------------------------------------

const engine = new CqlExecutionEngine();

describe("BreastCancerPayerPolicy — CqlExecutionEngine", () => {
  const FULL_DATA = [
    PATIENT,
    BREAST_CA_DX,
    ER_POSITIVE,
    PR_NEGATIVE,
    HER2_NEGATIVE,
    STAGE_OBS,
    POSTMENOPAUSAL,
    ONCOTYPEDX_28,
    ECOG_OBS,
  ];

  it("all data present → AllDataPresent=true, PAResult=approved", async () => {
    const results = await engine.evaluate(policyElm, PATIENT_ID, FULL_DATA);
    expect(results["All Data Present"]).toBe(true);
    expect(results["PA Result"]).toBe("approved");
  });

  it("ER absent → AllDataPresent=false, PAResult=dtr-required", async () => {
    const results = await engine.evaluate(
      policyElm,
      PATIENT_ID,
      FULL_DATA.filter((r) => r !== ER_POSITIVE)
    );
    expect(results["ER Status Present"]).toBe(false);
    expect(results["All Data Present"]).toBe(false);
    expect(results["PA Result"]).toBe("dtr-required");
  });

  it("PR absent → AllDataPresent=false", async () => {
    const results = await engine.evaluate(
      policyElm,
      PATIENT_ID,
      FULL_DATA.filter((r) => r !== PR_NEGATIVE)
    );
    expect(results["PR Status Present"]).toBe(false);
    expect(results["All Data Present"]).toBe(false);
  });

  it("OncotypeDX absent → AllDataPresent=false", async () => {
    const results = await engine.evaluate(
      policyElm,
      PATIENT_ID,
      FULL_DATA.filter((r) => r !== ONCOTYPEDX_28)
    );
    expect(results["OncotypeDX Present"]).toBe(false);
    expect(results["All Data Present"]).toBe(false);
  });

  it("Menopausal status absent → AllDataPresent=false", async () => {
    const results = await engine.evaluate(
      policyElm,
      PATIENT_ID,
      FULL_DATA.filter((r) => r !== POSTMENOPAUSAL)
    );
    expect(results["Menopausal Status Present"]).toBe(false);
    expect(results["All Data Present"]).toBe(false);
  });

  it("HER2 absent → AllDataPresent=false", async () => {
    const results = await engine.evaluate(
      policyElm,
      PATIENT_ID,
      FULL_DATA.filter((r) => r !== HER2_NEGATIVE)
    );
    expect(results["HER2 Status Present"]).toBe(false);
    expect(results["All Data Present"]).toBe(false);
  });

  it("no data → all checks false, PAResult=dtr-required", async () => {
    const results = await engine.evaluate(policyElm, PATIENT_ID, [PATIENT]);
    expect(results["ER Status Present"]).toBe(false);
    expect(results["PR Status Present"]).toBe(false);
    expect(results["HER2 Status Present"]).toBe(false);
    expect(results["Cancer Stage Present"]).toBe(false);
    expect(results["Menopausal Status Present"]).toBe(false);
    expect(results["OncotypeDX Present"]).toBe(false);
    expect(results["ECOG PS Present"]).toBe(false);
    expect(results["All Data Present"]).toBe(false);
    expect(results["PA Result"]).toBe("dtr-required");
  });
});

// ---------------------------------------------------------------------------
// BreastCancerGuideline CQL evaluation
// ---------------------------------------------------------------------------

describe("BreastCancerGuideline — CqlExecutionEngine", () => {
  it("HER2 positive (IHC 3+) → IsHER2Positive=true, TH/PHD eligible, ddACT not eligible", async () => {
    const results = await engine.evaluate(guidelineElm, PATIENT_ID, [
      PATIENT,
      BREAST_CA_DX,
      HER2_POSITIVE,
    ]);
    expect(results["Is HER2 Positive"]).toBe(true);
    expect(results["TH Eligible"]).toBe(true);
    expect(results["PHD Eligible"]).toBe(true);
    expect(results["ddACT Eligible"]).toBe(false);
  });

  it("HER2 negative (IHC 1+) without ER/OncotypeDX → ddACT not eligible (missing criteria)", async () => {
    const results = await engine.evaluate(guidelineElm, PATIENT_ID, [
      PATIENT,
      BREAST_CA_DX,
      HER2_NEGATIVE,
    ]);
    expect(results["Is HER2 Positive"]).toBe(false);
    expect(results["TH Eligible"]).toBe(false);
    expect(results["PHD Eligible"]).toBe(false);
    expect(results["ddACT Eligible"]).toBe(false);
  });

  it("Katherine Johnson scenario: ER+, HER2-, postmenopausal, OncotypeDX 28 → ddACT eligible", async () => {
    const results = await engine.evaluate(guidelineElm, PATIENT_ID, [
      PATIENT,
      BREAST_CA_DX,
      ER_POSITIVE,
      PR_NEGATIVE,
      HER2_NEGATIVE,
      STAGE_OBS,
      POSTMENOPAUSAL,
      ONCOTYPEDX_28,
    ]);
    expect(results["Is HER2 Positive"]).toBe(false);
    expect(results["Is ER Positive"]).toBe(true);
    expect(results["Is Postmenopausal"]).toBe(true);
    expect(results["OncotypeDX Score High"]).toBe(true);
    expect(results["ddACT Eligible"]).toBe(true);
    expect(results["TH Eligible"]).toBe(false);
    expect(results["PHD Eligible"]).toBe(false);
  });

  it("ER negative → IsERPositive=false, ddACT not eligible", async () => {
    const erNegative = makeObsWithValue("85337-4", LOINC, "260385009", SNOMED, "Negative (qualifier value)");
    const results = await engine.evaluate(guidelineElm, PATIENT_ID, [
      PATIENT,
      BREAST_CA_DX,
      erNegative,
      HER2_NEGATIVE,
      POSTMENOPAUSAL,
      ONCOTYPEDX_28,
    ]);
    expect(results["Is ER Positive"]).toBe(false);
    expect(results["ddACT Eligible"]).toBe(false);
  });

  it("OncotypeDX below threshold (score 18) → ddACT not eligible", async () => {
    const lowScore = makeObsWithInteger("104119-3", LOINC, 18);
    const results = await engine.evaluate(guidelineElm, PATIENT_ID, [
      PATIENT,
      BREAST_CA_DX,
      ER_POSITIVE,
      HER2_NEGATIVE,
      POSTMENOPAUSAL,
      lowScore,
    ]);
    expect(results["OncotypeDX Score High"]).toBe(false);
    expect(results["ddACT Eligible"]).toBe(false);
  });

  it("no diagnosis → no regimens eligible", async () => {
    const results = await engine.evaluate(guidelineElm, PATIENT_ID, [
      PATIENT,
      ER_POSITIVE,
      HER2_NEGATIVE,
      POSTMENOPAUSAL,
      ONCOTYPEDX_28,
    ]);
    expect(results["Has Active Breast Cancer"]).toBe(false);
    expect(results["ddACT Eligible"]).toBe(false);
    expect(results["TH Eligible"]).toBe(false);
  });
});
