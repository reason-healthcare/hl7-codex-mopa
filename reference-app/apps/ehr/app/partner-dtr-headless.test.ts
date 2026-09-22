import { afterEach, describe, expect, it, vi } from "vitest";
import { buildQuestionnaireFromPackage } from "../../dtr-client/lib/questionnaire-gen";
import { buildQuestionnaireResponse } from "../../dtr-client/lib/questionnaire-response";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("headless partner CRD → DTR → next CRD handoff", () => {
  it("retains order/coverage context when a text answer returns from DTR", async () => {
    vi.stubEnv("FHIR_BASE_URL", "http://fhir.test/fhir");
    vi.stubEnv("CRD_PARTNER_BASE_URL", "https://payer.test/oncology/api/v1");
    vi.stubEnv("CRD_PARTNER_TOKEN_URL", "https://payer.test/oauth/token");
    vi.stubEnv("CRD_PARTNER_CLIENT_ID", "synthetic-client");
    vi.stubEnv("CRD_PARTNER_CLIENT_SECRET", "synthetic-secret");
    const coverage = {
      resourceType: "Coverage",
      id: "mopa-connectathon-coverage",
      status: "active",
      beneficiary: { reference: "Patient/sandra-chen" },
    };
    const canonical =
      "https://mock.oncohealth.example/fhir/Questionnaire/breast-cancer-regimen|2026.1-mock";
    const packagePayload = {
      resourceType: "Parameters",
      parameter: [
        {
          name: "packagebundle",
          resource: {
            resourceType: "Bundle",
            type: "collection",
            entry: [
              {
                resource: {
                  resourceType: "Questionnaire",
                  url: canonical.split("|")[0],
                  version: "2026.1-mock",
                  item: [
                    {
                      linkId: "priorTherapy",
                      text: "Prior systemic therapy and response",
                      type: "text",
                      required: true,
                    },
                  ],
                },
              },
              {
                resource: {
                  resourceType: "QuestionnaireResponse",
                  questionnaire: canonical,
                  subject: { reference: "Patient/sandra-chen" },
                  extension: [
                    {
                      url: "http://hl7.org/fhir/us/davinci-dtr/StructureDefinition/qr-context",
                      valueReference: { reference: "RequestGroup/rg-PHD" },
                    },
                    {
                      url: "http://hl7.org/fhir/us/davinci-dtr/StructureDefinition/qr-coverage",
                      valueReference: { reference: "Coverage/mopa-connectathon-coverage" },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    };
    const requests: Array<{ url: string; body?: unknown; headers?: HeadersInit }> = [];
    let savedResponse: ReturnType<typeof buildQuestionnaireResponse> | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string, init?: RequestInit) => {
        requests.push({
          url: input,
          headers: init?.headers,
          body:
            init?.body && !input.endsWith("/oauth/token")
              ? JSON.parse(String(init.body))
              : undefined,
        });
        const payload = input.endsWith("/oauth/token")
          ? { access_token: "synthetic-test-token", expires_in: 3600 }
          : input.endsWith("/Questionnaire/$questionnaire-package")
            ? packagePayload
            : input.endsWith("/Coverage/mopa-connectathon-coverage")
              ? coverage
              : input.endsWith("/Patient/sandra-chen")
                ? { resourceType: "Patient", id: "sandra-chen" }
                : {
                    resourceType: "Bundle",
                    type: "searchset",
                    entry:
                      input.includes("QuestionnaireResponse?") &&
                      savedResponse &&
                      new Headers(init?.headers).get("Cache-Control") === "no-cache"
                        ? [{ resource: savedResponse }]
                        : [],
                  };
        return { ok: true, status: 200, json: async () => payload };
      })
    );

    const { buildPartnerDtrPackage, buildPartnerPrefetch } = await import("../lib/partner-crd");
    const payload = await buildPartnerDtrPackage({
      contextId: "mopa-ctx-123",
      patientId: "sandra-chen",
      orders: [{ resourceType: "RequestGroup", id: "rg-PHD" }],
      questionnaireCanonical: canonical,
      coverageReference: "Coverage/mopa-connectathon-coverage",
    });
    const outbound = requests.find((request) =>
      request.url.endsWith("/Questionnaire/$questionnaire-package")
    );
    expect(outbound?.body).toMatchObject({
      resourceType: "Parameters",
      parameter: [
        { name: "context", valueString: "mopa-ctx-123" },
        { name: "coverage", resource: { id: "mopa-connectathon-coverage" } },
        { name: "order", resource: { id: "rg-PHD" } },
      ],
    });
    const rendered = buildQuestionnaireFromPackage(payload).questionnaire;
    expect(rendered).toMatchObject({
      items: [{ linkId: "priorTherapy", type: "text" }],
      contextReference: "RequestGroup/rg-PHD",
      coverageReference: "Coverage/mopa-connectathon-coverage",
    });
    if (!rendered) throw new Error("Partner questionnaire did not render");
    savedResponse = buildQuestionnaireResponse(
      "sandra-chen",
      { priorTherapy: "No prior systemic therapy." },
      rendered.items,
      "2026-09-20",
      rendered.canonical,
      rendered.contextReference,
      rendered.coverageReference
    );
    const prefetch = await buildPartnerPrefetch("sandra-chen");
    expect(prefetch.questionnaireResponseBundle).toMatchObject({
      entry: [
        {
          resource: {
            item: [
              { linkId: "priorTherapy", answer: [{ valueString: "No prior systemic therapy." }] },
            ],
            extension: [
              { valueReference: { reference: "RequestGroup/rg-PHD" } },
              { valueReference: { reference: "Coverage/mopa-connectathon-coverage" } },
            ],
          },
        },
      ],
    });
    expect(
      requests.some((request) =>
        request.url.includes("QuestionnaireResponse?subject=Patient/sandra-chen")
      )
    ).toBe(true);
    expect(
      requests.find((request) =>
        request.url.includes("QuestionnaireResponse?subject=Patient/sandra-chen")
      )?.headers
    ).toMatchObject({
      "Cache-Control": "no-cache",
    });
  });
});
