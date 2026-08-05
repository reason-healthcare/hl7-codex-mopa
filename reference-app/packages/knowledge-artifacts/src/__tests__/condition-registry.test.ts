import { describe, it, expect } from "vitest";
import {
  CONDITION_REGISTRY,
  findConditionEntry,
  type ConditionRegistryEntry,
} from "../condition-registry";

describe("CONDITION_REGISTRY", () => {
  it("includes breast cancer and NSCLC entries", () => {
    const codes = CONDITION_REGISTRY.map((e) => e.conditionCode);
    expect(codes).toContain("372137005");
    expect(codes).toContain("254637007");
  });

  it("every entry has libraryUrl, guidelineUrl, and prefetchTemplates", () => {
    for (const entry of CONDITION_REGISTRY) {
      expect(entry.libraryUrl).toBeTruthy();
      expect(entry.guidelineUrl).toBeTruthy();
      expect(Object.keys(entry.prefetchTemplates).length).toBeGreaterThan(0);
    }
  });
});

describe("findConditionEntry", () => {
  function makeBundle(coding: { system: string; code: string }) {
    return {
      entry: [
        {
          resource: {
            resourceType: "Condition",
            code: { coding: [coding] },
          },
        },
      ],
    };
  }

  it("finds breast cancer by SNOMED code", () => {
    const entry = findConditionEntry(
      makeBundle({ system: "http://snomed.info/sct", code: "372137005" })
    );
    expect(entry).toBeDefined();
    expect(entry?.conditionDisplay).toContain("breast");
  });

  it("finds NSCLC by SNOMED code", () => {
    const entry = findConditionEntry(
      makeBundle({ system: "http://snomed.info/sct", code: "254637007" })
    );
    expect(entry).toBeDefined();
    expect(entry?.conditionDisplay).toContain("Non-small cell");
  });

  it("returns undefined for unknown condition code", () => {
    expect(
      findConditionEntry(makeBundle({ system: "http://snomed.info/sct", code: "999999" }))
    ).toBeUndefined();
  });

  it("returns undefined for null input", () => {
    expect(findConditionEntry(null)).toBeUndefined();
  });

  it("returns undefined for empty bundle", () => {
    expect(findConditionEntry({ entry: [] })).toBeUndefined();
  });

  it("skips non-Condition resources", () => {
    expect(
      findConditionEntry({
        entry: [
          { resource: { resourceType: "Observation", code: { coding: [{ code: "372137005" }] } } },
        ],
      })
    ).toBeUndefined();
  });

  it("matches on both system and code", () => {
    expect(
      findConditionEntry({
        entry: [
          {
            resource: {
              resourceType: "Condition",
              code: { coding: [{ system: "http://wrong.system", code: "372137005" }] },
            },
          },
        ],
      })
    ).toBeUndefined();
  });
});
