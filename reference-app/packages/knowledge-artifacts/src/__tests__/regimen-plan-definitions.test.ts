import { describe, expect, it } from "vitest";
import { PROFILES } from "../constants";
import { REGIMEN_DDACT, REGIMEN_PHD, REGIMEN_TH } from "../plan-definitions";

const REGIMENS = [REGIMEN_TH, REGIMEN_DDACT, REGIMEN_PHD];

describe("regimen PlanDefinitions", () => {
  it("uses the IG canonical identities and profile", () => {
    expect(REGIMENS.map((regimen) => regimen.id)).toEqual([
      "RegimenTH",
      "RegimenDdACT",
      "RegimenPHD",
    ]);

    for (const regimen of REGIMENS) {
      expect(regimen.url).toBe(`http://hl7.org/fhir/us/codex-mopa/PlanDefinition/${regimen.id}`);
      expect(regimen.version).toBe("0.1.1-snapshot-080926");
      expect(regimen.meta.profile).toEqual([PROFILES.ANTI_CANCER_REGIMEN_PLAN_DEFINITION]);
      expect("extension" in regimen).toBe(false);
    }
  });

  it("includes pegfilgrastim in the ddAC phase", () => {
    const actionIds = REGIMEN_DDACT.action.flatMap((phase) =>
      "action" in phase ? phase.action.map((action) => action.id) : []
    );
    expect(actionIds).toContain("pegfilgrastim-ac");
  });
});
