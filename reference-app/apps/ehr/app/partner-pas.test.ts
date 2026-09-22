import { applyBiosimilarSubstitution, buildDraftBundle, REGIMENS } from "@mopa/oncology-policy";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { summarizePartnerPas, validateSignedOrders } from "../lib/partner-pas";
import { POST as INQUIRE } from "./api/pa-inquire/route";
import { POST } from "./api/pa-submit/route";

const PAS = "http://hl7.org/fhir/us/davinci-pas/StructureDefinition/";
const DTR = "http://hl7.org/fhir/us/davinci-dtr/StructureDefinition/";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function order(patientId: string, regimenId: string, accepted = false) {
  const regimen = REGIMENS.find((item) => item.id === regimenId)!;
  return buildDraftBundle(patientId, accepted ? applyBiosimilarSubstitution(regimen) : regimen);
}

function payerResponse(action: "A1" | "A3" | "A4") {
  return {
    resourceType: "Bundle",
    type: "collection",
    entry: [
      {
        resource: {
          resourceType: "ClaimResponse",
          outcome: action === "A4" ? "queued" : "complete",
          disposition: `Synthetic ${action}`,
          preAuthRef: "ONCO-test",
          item: [
            {
              adjudication: [
                {
                  extension: [
                    {
                      extension: [
                        {
                          url: `${PAS}extension-reviewActionCode`,
                          valueCodeableConcept: { coding: [{ code: action, display: action }] },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    ],
  };
}

describe("synthetic partner PAS boundary", () => {
  it("rejects an incomplete or cross-patient signed regimen before sending", () => {
    const complete = order("sandra-chen", "PHD");
    expect(validateSignedOrders("sandra-chen", "PHD", complete).medications).toHaveLength(3);
    expect(() => validateSignedOrders("maria-garcia", "PHD", complete)).toThrow("does not match");
    expect(() =>
      validateSignedOrders("sandra-chen", "PHD", {
        ...complete,
        entry: complete.entry.slice(0, -1),
      })
    ).toThrow("incomplete");
    expect(() => validateSignedOrders("unknown", "PHD", complete)).toThrow(
      "Unknown synthetic patient"
    );
  });

  it("keeps the accepted biosimilar in the signed PAS medications", () => {
    const original = validateSignedOrders(
      "katherine-johnson",
      "ddAC-T",
      order("katherine-johnson", "ddAC-T")
    );
    const accepted = validateSignedOrders(
      "katherine-johnson",
      "ddAC-T",
      order("katherine-johnson", "ddAC-T", true)
    );
    const codes = (value: typeof original) =>
      value.medications.flatMap((med) =>
        med.medicationCodeableConcept.coding.map((coding: { code: string }) => coding.code)
      );
    expect(codes(original)).toContain("338036");
    expect(codes(accepted)).toContain("2102692");
    expect(codes(accepted)).not.toContain("338036");
  });

  it.each([
    "A1",
    "A3",
    "A4",
  ] as const)("parses X12 %s instead of guessing from ClaimResponse.outcome", (action) => {
    const summary = summarizePartnerPas(payerResponse(action));
    expect(summary).toMatchObject({ reviewActionCode: action, preAuthRef: "ONCO-test" });
    if (action === "A3") expect(summary.outcome).toBe("complete");
  });

  it("runs the EHR route with signed meds and a matching completed DTR response", async () => {
    vi.stubEnv("FHIR_BASE_URL", "http://fhir.test/fhir");
    vi.stubEnv("PAS_PARTNER_BASE_URL", "https://payer.test/oncology/api/v1");
    vi.stubEnv("CRD_PARTNER_TOKEN_URL", "https://payer.test/oauth/token");
    vi.stubEnv("CRD_PARTNER_CLIENT_ID", "synthetic-client");
    vi.stubEnv("CRD_PARTNER_CLIENT_SECRET", "synthetic-secret");
    const qr = {
      resourceType: "QuestionnaireResponse",
      id: "qr-sandra",
      status: "completed",
      subject: { reference: "Patient/sandra-chen" },
      extension: [
        { url: `${DTR}qr-context`, valueReference: { reference: "RequestGroup/rg-PHD" } },
        { url: `${DTR}qr-coverage`, valueReference: { reference: "Coverage/sandra-plan" } },
      ],
      item: [{ linkId: "her2", answer: [{ valueCoding: { code: "260385009" } }] }],
    };
    const coverage = {
      resourceType: "Coverage",
      id: "sandra-plan",
      status: "active",
      beneficiary: { reference: "Patient/sandra-chen" },
      payor: [{ reference: "Organization/synthetic-payer" }],
    };
    const calls: Array<{ url: string; body?: any }> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string, init?: RequestInit) => {
        const url = String(input);
        calls.push({
          url,
          body:
            init?.body && url.endsWith("/Claim/$submit")
              ? JSON.parse(String(init.body))
              : undefined,
        });
        const payload = url.endsWith("/oauth/token")
          ? { access_token: "test-token", expires_in: 3600 }
          : url.endsWith("/Patient/sandra-chen")
            ? { resourceType: "Patient", id: "sandra-chen" }
            : url.includes("QuestionnaireResponse?")
              ? { resourceType: "Bundle", entry: [{ resource: qr }] }
              : url.endsWith("/Coverage/sandra-plan")
                ? coverage
                : url.endsWith("/Organization/synthetic-payer")
                  ? { resourceType: "Organization", id: "synthetic-payer" }
                  : payerResponse("A3");
        return { ok: true, status: 200, json: async () => payload };
      })
    );
    const response = await POST(
      new NextRequest("http://ehr.test/api/pa-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: "sandra-chen",
          regimenId: "PHD",
          draftOrders: order("sandra-chen", "PHD"),
          claimId: "claim-test-sandra",
        }),
      })
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      reviewActionCode: "A3",
      preAuthRef: "ONCO-test",
    });
    const sent = calls.find((call) => call.url.endsWith("/Claim/$submit"))!.body;
    expect(
      sent.entry.filter((entry: any) => entry.resource.resourceType === "MedicationRequest")
    ).toHaveLength(3);
    expect(sent.entry.some((entry: any) => entry.resource.id === "qr-sandra")).toBe(true);
    expect(
      sent.entry.find((entry: any) => entry.resource.resourceType === "Claim").resource.insurance[0]
        .coverage.reference
    ).toBe("Coverage/sandra-plan");
  });

  it("checks the latest decision with $inquire using the submitted Claim.id", async () => {
    vi.stubEnv("FHIR_BASE_URL", "http://fhir.test/fhir");
    vi.stubEnv("PAS_PARTNER_BASE_URL", "https://payer.test/oncology/api/v1");
    vi.stubEnv("CRD_PARTNER_TOKEN_URL", "https://payer.test/oauth/token");
    vi.stubEnv("CRD_PARTNER_CLIENT_ID", "synthetic-client");
    vi.stubEnv("CRD_PARTNER_CLIENT_SECRET", "synthetic-secret");
    const coverage = {
      resourceType: "Coverage",
      id: "maria-plan",
      status: "active",
      beneficiary: { reference: "Patient/maria-garcia" },
      payor: [{ reference: "Organization/synthetic-payer" }],
    };
    const pasCalls: Array<{ url: string; claimId: string }> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string, init?: RequestInit) => {
        const url = String(input);
        if (url.includes("/Claim/$")) {
          const sent = JSON.parse(String(init?.body));
          const claim = sent.entry.find(
            (entry: { resource: { resourceType: string } }) =>
              entry.resource.resourceType === "Claim"
          ).resource;
          pasCalls.push({ url, claimId: claim.id });
        }
        const payload = url.endsWith("/oauth/token")
          ? { access_token: "test-token", expires_in: 3600 }
          : url.endsWith("/Patient/maria-garcia")
            ? { resourceType: "Patient", id: "maria-garcia" }
            : url.includes("QuestionnaireResponse?")
              ? { resourceType: "Bundle", entry: [] }
              : url.includes("Coverage?")
                ? { resourceType: "Bundle", entry: [{ resource: coverage }] }
                : url.endsWith("/Organization/synthetic-payer")
                  ? { resourceType: "Organization", id: "synthetic-payer" }
                  : payerResponse(url.endsWith("/Claim/$inquire") ? "A1" : "A4");
        return { ok: true, status: 200, json: async () => payload };
      })
    );
    const input = {
      patientId: "maria-garcia",
      regimenId: "TH",
      draftOrders: order("maria-garcia", "TH"),
      claimId: "claim-manual-inquiry-test",
    };
    const request = (path: string, value: unknown) =>
      new NextRequest(`http://ehr.test/api/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });

    const submitted = await POST(request("pa-submit", input));
    expect(submitted.status).toBe(200);
    expect(await submitted.json()).toMatchObject({ reviewActionCode: "A4", canInquire: true });

    const inquired = await INQUIRE(request("pa-inquire", input));
    expect(inquired.status).toBe(200);
    expect(await inquired.json()).toMatchObject({ reviewActionCode: "A1", canInquire: true });
    expect(pasCalls.map((call) => call.url)).toEqual([
      "https://payer.test/oncology/api/v1/Claim/$submit",
      "https://payer.test/oncology/api/v1/Claim/$inquire",
    ]);
    expect(pasCalls.map((call) => call.claimId)).toEqual([input.claimId, input.claimId]);

    const missingClaim = await INQUIRE(request("pa-inquire", { ...input, claimId: undefined }));
    expect(missingClaim.status).toBe(400);
    expect(pasCalls).toHaveLength(2);
  });
});
