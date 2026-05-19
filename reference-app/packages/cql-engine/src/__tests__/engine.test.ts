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

const PATIENT_ID = "jane-smith";

function makeObs(code: string, system: string): object {
  return {
    resourceType: "Observation",
    id: `obs-${code}`,
    status: "final",
    code: { coding: [{ system, code }] },
    subject: { reference: `Patient/${PATIENT_ID}` },
  };
}

const HER2_OBS = makeObs("85319-2", "http://loinc.org");
const STAGE_OBS = makeObs("21908-9", "http://loinc.org");
const ECOG_OBS = makeObs("89247-1", "http://loinc.org");
const PATIENT = { resourceType: "Patient", id: PATIENT_ID };

// ---------------------------------------------------------------------------
// buildPatientBundle / extractBundleResources
// ---------------------------------------------------------------------------

describe("buildPatientBundle", () => {
  it("wraps resources in a collection Bundle", () => {
    const bundle = buildPatientBundle(PATIENT_ID, [PATIENT, HER2_OBS]);
    expect(bundle.resourceType).toBe("Bundle");
    expect(bundle.type).toBe("collection");
    expect(bundle.entry).toHaveLength(2);
  });

  it("injects a stub Patient when none is provided", () => {
    const bundle = buildPatientBundle(PATIENT_ID, [HER2_OBS]);
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
      entry: [{ resource: HER2_OBS }, { resource: STAGE_OBS }],
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

// Shared across both CQL evaluation describe blocks — CqlExecutionEngine is
// stateless so a single instance is safe for all tests.
const engine = new CqlExecutionEngine();

describe("BreastCancerPayerPolicy — CqlExecutionEngine", () => {
  it("all data present → AllDataPresent=true, PAResult=approved", async () => {
    const results = await engine.evaluate(policyElm, PATIENT_ID, [
      PATIENT,
      HER2_OBS,
      STAGE_OBS,
      ECOG_OBS,
    ]);
    expect(results["All Data Present"]).toBe(true);
    expect(results["PA Result"]).toBe("approved");
  });

  it("HER2 absent → HER2StatusPresent=false, AllDataPresent=false, PAResult=dtr-required", async () => {
    const results = await engine.evaluate(policyElm, PATIENT_ID, [PATIENT, STAGE_OBS, ECOG_OBS]);
    expect(results["HER2 Status Present"]).toBe(false);
    expect(results["All Data Present"]).toBe(false);
    expect(results["PA Result"]).toBe("dtr-required");
  });

  it("CancerStage absent → CancerStagePresent=false", async () => {
    const results = await engine.evaluate(policyElm, PATIENT_ID, [PATIENT, HER2_OBS, ECOG_OBS]);
    expect(results["Cancer Stage Present"]).toBe(false);
    expect(results["All Data Present"]).toBe(false);
  });

  it("ECOG absent → ECOGPSPresent=false", async () => {
    const results = await engine.evaluate(policyElm, PATIENT_ID, [PATIENT, HER2_OBS, STAGE_OBS]);
    expect(results["ECOG PS Present"]).toBe(false);
    expect(results["All Data Present"]).toBe(false);
  });

  it("no data → all checks false, PAResult=dtr-required", async () => {
    const results = await engine.evaluate(policyElm, PATIENT_ID, [PATIENT]);
    expect(results["HER2 Status Present"]).toBe(false);
    expect(results["Cancer Stage Present"]).toBe(false);
    expect(results["ECOG PS Present"]).toBe(false);
    expect(results["All Data Present"]).toBe(false);
    expect(results["PA Result"]).toBe("dtr-required");
  });
});

// ---------------------------------------------------------------------------
// BreastCancerGuideline CQL evaluation
// ---------------------------------------------------------------------------

describe("BreastCancerGuideline — CqlExecutionEngine", () => {
  it("HER2 present → IsHER2Positive=true, TH/PHD eligible, ddACT not eligible", async () => {
    const results = await engine.evaluate(guidelineElm, PATIENT_ID, [PATIENT, HER2_OBS]);
    expect(results["Is HER2 Positive"]).toBe(true);
    expect(results["TH Eligible"]).toBe(true);
    expect(results["PHD Eligible"]).toBe(true);
    expect(results["ddACT Eligible"]).toBe(false);
  });

  it("HER2 absent → IsHER2Positive=false, ddACT eligible, TH/PHD not eligible", async () => {
    const results = await engine.evaluate(guidelineElm, PATIENT_ID, [PATIENT]);
    expect(results["Is HER2 Positive"]).toBe(false);
    expect(results["TH Eligible"]).toBe(false);
    expect(results["PHD Eligible"]).toBe(false);
    expect(results["ddACT Eligible"]).toBe(true);
  });
});
