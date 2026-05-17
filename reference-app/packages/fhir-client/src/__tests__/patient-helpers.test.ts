import { describe, it, expect } from "vitest";
import {
  getPatientDisplayName,
  getPatientDOB,
  getPatientGender,
  getPatientMRN,
} from "../patient-helpers";
import type { Patient } from "../schemas";

const base: Patient = { resourceType: "Patient" };

describe("getPatientDisplayName", () => {
  it("returns id when no name", () => {
    expect(getPatientDisplayName({ ...base, id: "p1" })).toBe("p1");
  });

  it("returns 'Unknown' when no name and no id", () => {
    expect(getPatientDisplayName(base)).toBe("Unknown");
  });

  it("returns name.text when present", () => {
    const p: Patient = { ...base, name: [{ text: "Jane Smith" }] };
    expect(getPatientDisplayName(p)).toBe("Jane Smith");
  });

  it("assembles given + family when no text", () => {
    const p: Patient = { ...base, name: [{ given: ["Jane", "Marie"], family: "Smith" }] };
    expect(getPatientDisplayName(p)).toBe("Jane Marie Smith");
  });

  it("handles family-only name", () => {
    const p: Patient = { ...base, name: [{ family: "Smith" }] };
    expect(getPatientDisplayName(p)).toBe("Smith");
  });

  it("falls back to id when name fields are empty", () => {
    const p: Patient = { ...base, id: "p1", name: [{}] };
    expect(getPatientDisplayName(p)).toBe("p1");
  });
});

describe("getPatientDOB", () => {
  it("returns birthDate when present", () => {
    expect(getPatientDOB({ ...base, birthDate: "1972-04-15" })).toBe("1972-04-15");
  });

  it("returns 'Unknown' when absent", () => {
    expect(getPatientDOB(base)).toBe("Unknown");
  });
});

describe("getPatientGender", () => {
  it("returns gender when present", () => {
    expect(getPatientGender({ ...base, gender: "female" })).toBe("female");
  });

  it("returns 'unknown' when absent", () => {
    expect(getPatientGender(base)).toBe("unknown");
  });
});

describe("getPatientMRN", () => {
  it("finds MR identifier value", () => {
    const p: Patient = {
      ...base,
      identifier: [
        {
          type: {
            coding: [{ system: "http://terminology.hl7.org/CodeSystem/v2-0203", code: "MR" }],
          },
          value: "MRN-001",
        },
      ],
    };
    expect(getPatientMRN(p)).toBe("MRN-001");
  });

  it("returns undefined when no identifier", () => {
    expect(getPatientMRN(base)).toBeUndefined();
  });

  it("returns undefined when no MR-typed identifier", () => {
    const p: Patient = {
      ...base,
      identifier: [{ type: { coding: [{ code: "SS" }] }, value: "123-45-6789" }],
    };
    expect(getPatientMRN(p)).toBeUndefined();
  });
});
