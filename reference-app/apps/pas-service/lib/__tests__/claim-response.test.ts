import { describe, it, expect } from "vitest";
import { buildClaimResponse, type PaDecision } from "../claim-response";

describe("buildClaimResponse", () => {
  it("maps approved → outcome=complete", () => {
    const cr = buildClaimResponse("cr-1", { status: "approved", reason: "All criteria met." });
    expect(cr.resourceType).toBe("ClaimResponse");
    expect(cr.id).toBe("cr-1");
    expect(cr.status).toBe("active");
    expect(cr.use).toBe("preauthorization");
    expect(cr.outcome).toBe("complete");
    expect(cr.disposition).toContain("Approved");
    expect(cr.disposition).toContain("All criteria met.");
    expect(cr.error).toBeUndefined();
  });

  it("maps pended → outcome=queued", () => {
    const cr = buildClaimResponse("cr-2", { status: "pended", reason: "Awaiting review." });
    expect(cr.outcome).toBe("queued");
    expect(cr.disposition).toContain("Pending");
    expect(cr.error).toBeUndefined();
  });

  it("maps denied → outcome=error and includes error block", () => {
    const cr = buildClaimResponse("cr-3", { status: "denied", reason: "Not covered." });
    expect(cr.outcome).toBe("error");
    expect(cr.disposition).toContain("Denied");
    expect(cr.error).toBeDefined();
    expect(cr.error).toHaveLength(1);
    expect(cr.error?.[0]?.code.coding?.[0]?.code).toBe("a001");
  });

  it("sets created to a valid date string", () => {
    const cr = buildClaimResponse("cr-4", { status: "approved", reason: "ok" });
    expect(cr.created).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(cr.created).toString()).not.toBe("Invalid Date");
  });

  it("uses pharmacy claim type", () => {
    const cr = buildClaimResponse("cr-5", { status: "approved", reason: "ok" });
    expect(cr.type.coding[0]?.code).toBe("pharmacy");
  });
});
