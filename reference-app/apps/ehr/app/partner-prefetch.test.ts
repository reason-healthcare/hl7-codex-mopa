import { afterEach, describe, expect, it, vi } from "vitest";
import { buildPartnerPrefetch } from "../lib/partner-crd";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("partner CRD prefetch after DTR", () => {
  it("includes patient-scoped completed QuestionnaireResponses, including text answers", async () => {
    vi.stubEnv("FHIR_BASE_URL", "http://fhir.test/fhir");
    const calls: string[] = [];
    vi.stubGlobal("fetch", vi.fn(async (input: string) => {
      calls.push(input);
      const resource = input.endsWith("/Patient/sandra-chen")
        ? { resourceType: "Patient", id: "sandra-chen" }
        : { resourceType: "Bundle", type: "searchset", entry: input.includes("QuestionnaireResponse?")
          ? [{ resource: { resourceType: "QuestionnaireResponse", status: "completed",
            subject: { reference: "Patient/sandra-chen" },
            extension: [{ url: "http://hl7.org/fhir/us/davinci-dtr/StructureDefinition/qr-context",
              valueReference: { reference: "RequestGroup/rg-PHD" } }],
            item: [{ linkId: "priorTherapy", answer: [{ valueString: "No prior systemic therapy" }] }] } }]
          : [] };
      return { ok: true, json: async () => resource };
    }));
    const prefetch = await buildPartnerPrefetch("sandra-chen");
    expect(calls).toContain(
      "http://fhir.test/fhir/QuestionnaireResponse?subject=Patient/sandra-chen&_count=100"
    );
    expect(prefetch.questionnaireResponseBundle).toMatchObject({
      entry: [{ resource: { resourceType: "QuestionnaireResponse",
        item: [{ linkId: "priorTherapy" }] } }],
    });
  });
});
