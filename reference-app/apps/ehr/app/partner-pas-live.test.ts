import { applyBiosimilarSubstitution, buildDraftBundle, REGIMENS } from "@mopa/oncology-policy";
import { describe, expect, it } from "vitest";

const base = process.env.LIVE_EHR_BASE_URL ?? "http://localhost:4001";
const live = process.env.LIVE_SYNTHETIC_PAS_REHEARSAL === "1";

async function post(path: string, body: unknown) {
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  expect(response.status, `${path}: ${JSON.stringify(payload)}`).toBe(200);
  return payload;
}

function draft(
  patientId: string,
  regimenId: string,
  accepted = false,
  stage: "order-select" | "order-sign" = "order-sign"
) {
  const regimen = REGIMENS.find((item) => item.id === regimenId)!;
  return buildDraftBundle(patientId, accepted ? applyBiosimilarSubstitution(regimen) : regimen, {
    stage,
  });
}

async function crd(
  patientId: string,
  regimenId: string,
  hook: "order-select" | "order-sign",
  signed?: unknown
) {
  return post("/api/crd-hooks", {
    hook,
    hookInstance: crypto.randomUUID(),
    context: {
      patientId,
      userId: "Practitioner/demo-user",
      draftOrders: signed ?? draft(patientId, regimenId, false, hook),
      selections: [`urn:uuid:rg-${regimenId}`],
    },
  });
}

describe.skipIf(!live)("live synthetic EHR CRD → PAS rehearsal", () => {
  it("Jane is satisfied at order-sign without PAS", async () => {
    const patientId = "jane-smith",
      regimenId = "TH";
    expect((await crd(patientId, regimenId, "order-select")).cards?.length).toBeGreaterThan(0);
    const response = await crd(patientId, regimenId, "order-sign");
    expect(
      response.cards.some(
        (card: { source?: { topic?: { code?: string } } }) =>
          card.source?.topic?.code === "prior-auth-required"
      )
    ).toBe(false);
    console.info("Jane: CRD order-sign satisfied; PAS correctly skipped");
  });

  it.each([
    ["Maria", "maria-garcia", "TH", false, "A1"],
    ["Sandra", "sandra-chen", "PHD", false, "A3"],
    ["Katherine retained", "katherine-johnson", "ddAC-T", false, "A4"],
    ["Katherine accepted", "katherine-johnson", "ddAC-T", true, "A1"],
  ] as const)("%s receives expected PAS review action", async (name, patientId, regimenId, accepted, expected) => {
    const signed = draft(patientId, regimenId, accepted);
    expect((await crd(patientId, regimenId, "order-select")).cards?.length).toBeGreaterThan(0);
    const sign = await crd(patientId, regimenId, "order-sign", signed);
    expect(sign.cards?.length).toBeGreaterThan(0);
    const claimId = `claim-rehearsal-${crypto.randomUUID()}`;
    const pas = await post("/api/pa-submit", {
      patientId,
      regimenId,
      draftOrders: signed,
      claimId,
    });
    expect(pas.reviewActionCode, JSON.stringify(pas)).toBe(expected);
    expect(pas.preAuthRef).toMatch(/^ONCO-/);
    const inquiry = await post("/api/pa-inquire", {
      patientId,
      regimenId,
      draftOrders: signed,
      claimId,
    });
    expect(inquiry.reviewActionCode, JSON.stringify(inquiry)).toBe(expected);
    expect(inquiry.preAuthRef).toBe(pas.preAuthRef);
    console.info(
      `${name}: CRD cards ${sign.cards.length}, PAS ${pas.reviewActionCode}, inquiry ${inquiry.reviewActionCode}, ${pas.preAuthRef}`
    );
  });
});
