import { describe, it, expect } from "vitest";
import {
  PatientSchema,
  ConditionSchema,
  ObservationSchema,
  BundleSchema,
  ResourceSchema,
} from "../schemas";

// ---------------------------------------------------------------------------
// PatientSchema
// ---------------------------------------------------------------------------

describe("PatientSchema", () => {
  it("parses a minimal patient", () => {
    const result = PatientSchema.safeParse({ resourceType: "Patient" });
    expect(result.success).toBe(true);
  });

  it("parses a full patient with name and identifiers", () => {
    const raw = {
      resourceType: "Patient",
      id: "jane-smith",
      identifier: [
        {
          type: {
            coding: [{ system: "http://terminology.hl7.org/CodeSystem/v2-0203", code: "MR" }],
          },
          value: "MRN-001",
        },
      ],
      name: [{ use: "official", family: "Smith", given: ["Jane", "Marie"] }],
      gender: "female",
      birthDate: "1972-04-15",
    };
    const result = PatientSchema.safeParse(raw);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.id).toBe("jane-smith");
    expect(result.data.name?.[0]?.family).toBe("Smith");
    expect(result.data.birthDate).toBe("1972-04-15");
  });

  it("rejects a resource with wrong resourceType", () => {
    const result = PatientSchema.safeParse({ resourceType: "Observation" });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// ConditionSchema
// ---------------------------------------------------------------------------

describe("ConditionSchema", () => {
  it("parses a minimal condition (subject is required)", () => {
    const result = ConditionSchema.safeParse({
      resourceType: "Condition",
      subject: { reference: "Patient/jane-smith" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a condition without subject", () => {
    const result = ConditionSchema.safeParse({ resourceType: "Condition" });
    expect(result.success).toBe(false);
  });

  it("parses onsetDateTime", () => {
    const result = ConditionSchema.safeParse({
      resourceType: "Condition",
      subject: { reference: "Patient/p1" },
      onsetDateTime: "2024-01-10",
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.onsetDateTime).toBe("2024-01-10");
  });
});

// ---------------------------------------------------------------------------
// ObservationSchema
// ---------------------------------------------------------------------------

describe("ObservationSchema", () => {
  it("parses a valueCodeableConcept observation", () => {
    const result = ObservationSchema.safeParse({
      resourceType: "Observation",
      status: "final",
      code: { coding: [{ system: "http://loinc.org", code: "21908-9", display: "Cancer Stage" }] },
      valueCodeableConcept: { text: "Stage IIIA" },
    });
    expect(result.success).toBe(true);
  });

  it("parses a valueInteger observation (ECOG)", () => {
    const result = ObservationSchema.safeParse({
      resourceType: "Observation",
      status: "final",
      code: { coding: [{ system: "http://loinc.org", code: "89247-1" }] },
      valueInteger: 1,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.valueInteger).toBe(1);
  });

  it("rejects an observation without status", () => {
    const result = ObservationSchema.safeParse({
      resourceType: "Observation",
      code: { text: "Test" },
    });
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// BundleSchema
// ---------------------------------------------------------------------------

describe("BundleSchema", () => {
  it("parses an empty searchset bundle", () => {
    const result = BundleSchema.safeParse({ resourceType: "Bundle", type: "searchset", total: 0 });
    expect(result.success).toBe(true);
  });

  it("parses a bundle with Patient entries", () => {
    const result = BundleSchema.safeParse({
      resourceType: "Bundle",
      type: "searchset",
      total: 1,
      entry: [
        {
          fullUrl: "http://example.com/fhir/Patient/1",
          resource: { resourceType: "Patient", id: "1" },
        },
      ],
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.entry).toHaveLength(1);
  });

  it("extracts entries typed as Patient", () => {
    const bundle = BundleSchema.parse({
      resourceType: "Bundle",
      type: "searchset",
      entry: [
        { resource: { resourceType: "Patient", id: "p1" } },
        { resource: { resourceType: "Observation", status: "final", code: { text: "x" } } },
      ],
    });
    const patients = (bundle.entry ?? [])
      .map((e) => e.resource)
      .filter((r): r is { resourceType: "Patient"; id?: string } => r?.resourceType === "Patient");
    expect(patients).toHaveLength(1);
    expect(patients[0]?.id).toBe("p1");
  });
});

// ---------------------------------------------------------------------------
// ResourceSchema
// ---------------------------------------------------------------------------

describe("ResourceSchema", () => {
  it("accepts any resourceType string", () => {
    const result = ResourceSchema.safeParse({ resourceType: "Anything", id: "123" });
    expect(result.success).toBe(true);
  });
});
