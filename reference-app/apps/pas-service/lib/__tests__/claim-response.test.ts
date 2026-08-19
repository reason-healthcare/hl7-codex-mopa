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

// ---------------------------------------------------------------------------
// Substitution processNote entries
// ---------------------------------------------------------------------------

describe("buildClaimResponse with substitutions", () => {
  it("includes processNote entries when substitutions are present", () => {
    const cr = buildClaimResponse("cr-sub-1", {
      status: "approved",
      reason: "All criteria met with substitution.",
      substitutions: [
        {
          originalRxnorm: "224905",
          originalDisplay: "pegfilgrastim (Neulasta)",
          substitutedRxnorm: "2102692",
          substitutedDisplay: "pegfilgrastim-cbqv (Udenyca)",
          rationale: "Payer requires biosimilar substitution",
        },
      ],
    });
    expect(cr.outcome).toBe("complete");
    expect(cr.processNote).toBeDefined();
    expect(cr.processNote).toHaveLength(1);
    expect(cr.processNote?.[0]?.text).toContain("pegfilgrastim (Neulasta)");
    expect(cr.processNote?.[0]?.text).toContain("pegfilgrastim-cbqv (Udenyca)");
    expect(cr.processNote?.[0]?.text).toContain("224905");
    expect(cr.processNote?.[0]?.text).toContain("2102692");
  });

  it("has no processNote when substitutions are absent", () => {
    const cr = buildClaimResponse("cr-sub-2", {
      status: "approved",
      reason: "All criteria met.",
    });
    expect(cr.processNote).toBeUndefined();
  });

  it("has no processNote for pended decisions without substitutions", () => {
    const cr = buildClaimResponse("cr-sub-3", {
      status: "pended",
      reason: "Awaiting review.",
    });
    expect(cr.processNote).toBeUndefined();
  });

  it("handles multiple substitutions", () => {
    const cr = buildClaimResponse("cr-sub-4", {
      status: "approved",
      reason: "Approved with modifications.",
      substitutions: [
        {
          originalRxnorm: "224905",
          originalDisplay: "pegfilgrastim (Neulasta)",
          substitutedRxnorm: "2102692",
          substitutedDisplay: "pegfilgrastim-cbqv (Udenyca)",
          rationale: "Biosimilar required",
        },
        {
          originalRxnorm: "1298944",
          originalDisplay: "pertuzumab",
          substitutedRxnorm: "9999999",
          substitutedDisplay: "pertuzumab-biosimilar",
          rationale: "Biosimilar required",
        },
      ],
    });
    expect(cr.processNote).toHaveLength(2);
    expect(cr.processNote?.[0]?.text).toContain("pegfilgrastim (Neulasta)");
    expect(cr.processNote?.[1]?.text).toContain("pertuzumab");
  });
});
