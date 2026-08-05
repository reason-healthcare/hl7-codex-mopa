import { describe, it, expect } from "vitest";
import {
  REGIMENS,
  buildDraftBundle,
  MOPA_BASE,
  RXNORM,
  TREATMENT_LINE,
  EXT_INTENT,
  EXT_LINE,
  type Regimen,
} from "../regimens";

type Resource = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Regimen definitions
// ---------------------------------------------------------------------------

describe("REGIMENS", () => {
  it("defines three breast cancer regimens", () => {
    expect(REGIMENS).toHaveLength(3);
    const ids = REGIMENS.map((r) => r.id);
    expect(ids).toContain("TH");
    expect(ids).toContain("ddAC-T");
    expect(ids).toContain("PHD");
  });

  it("every regimen has a canonicalUrl, intent, and treatmentLine", () => {
    for (const r of REGIMENS) {
      expect(r.canonicalUrl).toContain(MOPA_BASE);
      expect(r.intent.code).toBeTruthy();
      expect(r.intent.display).toBeTruthy();
      expect(r.treatmentLine.code).toBeTruthy();
    }
  });

  it("every regimen has at least one phase with at least one drug", () => {
    for (const r of REGIMENS) {
      expect(r.phases.length).toBeGreaterThanOrEqual(1);
      for (const p of r.phases) {
        expect(p.drugs.length).toBeGreaterThanOrEqual(1);
        for (const d of p.drugs) {
          expect(d.actionId).toBeTruthy();
          expect(d.rxnorm).toBeTruthy();
          expect(d.period).toBeGreaterThan(0);
        }
      }
    }
  });

  it("ddAC-T has two sequential phases with afterPhase on the second", () => {
    const ddact = REGIMENS.find((r) => r.id === "ddAC-T") as Regimen;
    expect(ddact.phases).toHaveLength(2);
    expect(ddact.phases[0]?.afterPhase).toBeUndefined();
    expect(ddact.phases[1]?.afterPhase).toBe("ac-phase");
  });
});

// ---------------------------------------------------------------------------
// buildDraftBundle
// ---------------------------------------------------------------------------

describe("buildDraftBundle", () => {
  const th = REGIMENS.find((r) => r.id === "TH") as Regimen;

  it("produces a Bundle of type collection", () => {
    const bundle = buildDraftBundle("jane-smith", th);
    expect(bundle.resourceType).toBe("Bundle");
    expect(bundle.type).toBe("collection");
  });

  it("includes a RequestGroup as the first entry", () => {
    const bundle = buildDraftBundle("jane-smith", th);
    const rg = bundle.entry[0]?.resource as Resource;
    expect(rg.resourceType).toBe("RequestGroup");
    expect(rg.id).toBe("rg-TH");
  });

  it("references the regimen canonical URL in instantiatesCanonical", () => {
    const bundle = buildDraftBundle("jane-smith", th);
    const rg = bundle.entry[0]?.resource as Resource;
    expect(rg.instantiatesCanonical).toContain(th.canonicalUrl);
  });

  it("creates one MedicationRequest per drug across all phases", () => {
    const bundle = buildDraftBundle("jane-smith", th);
    const medReqs = bundle.entry.slice(1).map((e) => e.resource as Resource);
    const totalDrugs = th.phases.flatMap((p) => p.drugs).length;
    expect(medReqs).toHaveLength(totalDrugs);
    for (const mr of medReqs) {
      expect(mr.resourceType).toBe("MedicationRequest");
      expect(mr.status).toBe("draft");
      expect(mr.intent).toBe("order");
    }
  });

  it("sets the patient reference on the RequestGroup and MedicationRequests", () => {
    const bundle = buildDraftBundle("jane-smith", th);
    const rg = bundle.entry[0]?.resource as Resource;
    const rgSubject = rg.subject as { reference?: string };
    expect(rgSubject.reference).toBe("Patient/jane-smith");
    const mr = bundle.entry[1]?.resource as Resource;
    const mrSubject = mr.subject as { reference?: string };
    expect(mrSubject.reference).toBe("Patient/jane-smith");
  });

  it("carries regimen intent and treatment line extensions on the RequestGroup", () => {
    const bundle = buildDraftBundle("jane-smith", th);
    const rg = bundle.entry[0]?.resource as Resource;
    const exts = rg.extension as Array<{ url: string }>;
    const urls = exts.map((e) => e.url);
    expect(urls).toContain(EXT_INTENT);
    expect(urls).toContain(EXT_LINE);
  });

  it("uses RxNorm for medication codeable concepts", () => {
    const bundle = buildDraftBundle("jane-smith", th);
    const mr = bundle.entry[1]?.resource as Resource;
    const mcc = mr.medicationCodeableConcept as { coding?: Array<{ system?: string }> };
    expect(mcc.coding?.[0]?.system).toBe(RXNORM);
  });

  it("builds sequential phase actions with relatedAction for ddAC-T", () => {
    const ddact = REGIMENS.find((r) => r.id === "ddAC-T") as Regimen;
    const bundle = buildDraftBundle("p1", ddact);
    const rg = bundle.entry[0]?.resource as Resource;
    const actions = rg.action as Array<Resource>;
    expect(actions).toHaveLength(2);
    expect(actions[1]?.relatedAction).toEqual([
      { actionId: "ac-phase", relationship: "after-end" },
    ]);
  });

  it("produces stable fullUrl URIs for the RequestGroup and MedicationRequests", () => {
    const bundle = buildDraftBundle("jane-smith", th);
    expect(bundle.entry[0]?.fullUrl).toBe("urn:uuid:rg-TH");
    const medFullUrls = bundle.entry.slice(1).map((e) => e.fullUrl);
    for (const url of medFullUrls) {
      expect(url).toMatch(/^urn:uuid:mr-/);
    }
  });
});
