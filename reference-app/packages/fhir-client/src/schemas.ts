/**
 * Minimal Zod schemas for the FHIR R4 resources needed in Phase 1.
 *
 * NOTE: @reasonhealth/fhir-zod is declared as a dependency for Phase 3+.
 * It ships TypeScript source (not compiled .d.ts) which causes tsc traversal
 * issues under strict mode. These hand-crafted schemas cover Phase 1 needs.
 * When fhir-client is compiled to .d.ts output (Phase 3+), direct fhir-zod
 * imports will work correctly via skipLibCheck on the compiled output.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

const CodingSchema = z.object({
  system: z.string().optional(),
  version: z.string().optional(),
  code: z.string().optional(),
  display: z.string().optional(),
  userSelected: z.boolean().optional(),
});

const CodeableConceptSchema = z.object({
  coding: z.array(CodingSchema).optional(),
  text: z.string().optional(),
});

const IdentifierSchema = z.object({
  use: z.string().optional(),
  type: CodeableConceptSchema.optional(),
  system: z.string().optional(),
  value: z.string().optional(),
});

const HumanNameSchema = z.object({
  use: z.string().optional(),
  text: z.string().optional(),
  family: z.string().optional(),
  given: z.array(z.string()).optional(),
  prefix: z.array(z.string()).optional(),
  suffix: z.array(z.string()).optional(),
});

const AddressSchema = z.object({
  use: z.string().optional(),
  type: z.string().optional(),
  text: z.string().optional(),
  line: z.array(z.string()).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

const QuantitySchema = z.object({
  value: z.number().optional(),
  comparator: z.string().optional(),
  unit: z.string().optional(),
  system: z.string().optional(),
  code: z.string().optional(),
});

const ReferenceSchema = z.object({
  reference: z.string().optional(),
  type: z.string().optional(),
  display: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Patient
// ---------------------------------------------------------------------------

export const PatientSchema = z.object({
  resourceType: z.literal("Patient"),
  id: z.string().optional(),
  identifier: z.array(IdentifierSchema).optional(),
  name: z.array(HumanNameSchema).optional(),
  gender: z.string().optional(),
  birthDate: z.string().optional(),
  address: z.array(AddressSchema).optional(),
  telecom: z.array(z.record(z.unknown())).optional(),
});

export type Patient = z.infer<typeof PatientSchema>;

// ---------------------------------------------------------------------------
// Condition
// ---------------------------------------------------------------------------

export const ConditionSchema = z.object({
  resourceType: z.literal("Condition"),
  id: z.string().optional(),
  clinicalStatus: CodeableConceptSchema.optional(),
  verificationStatus: CodeableConceptSchema.optional(),
  category: z.array(CodeableConceptSchema).optional(),
  code: CodeableConceptSchema.optional(),
  subject: ReferenceSchema,
  onsetDateTime: z.string().optional(),
  recordedDate: z.string().optional(),
});

export type Condition = z.infer<typeof ConditionSchema>;

// ---------------------------------------------------------------------------
// Observation
// ---------------------------------------------------------------------------

export const ObservationSchema = z.object({
  resourceType: z.literal("Observation"),
  id: z.string().optional(),
  status: z.string(),
  category: z.array(CodeableConceptSchema).optional(),
  code: CodeableConceptSchema,
  subject: ReferenceSchema.optional(),
  effectiveDateTime: z.string().optional(),
  valueCodeableConcept: CodeableConceptSchema.optional(),
  valueQuantity: QuantitySchema.optional(),
  valueString: z.string().optional(),
  valueInteger: z.number().optional(),
  valueBoolean: z.boolean().optional(),
});

export type Observation = z.infer<typeof ObservationSchema>;

// ---------------------------------------------------------------------------
// Bundle
// ---------------------------------------------------------------------------

const BundleEntrySchema = z.object({
  fullUrl: z.string().optional(),
  resource: z
    .union([PatientSchema, ConditionSchema, ObservationSchema, z.record(z.unknown())])
    .optional(),
  request: z
    .object({
      method: z.string(),
      url: z.string(),
    })
    .optional(),
  response: z
    .object({
      status: z.string(),
      location: z.string().optional(),
    })
    .optional(),
});

export const BundleSchema = z.object({
  resourceType: z.literal("Bundle"),
  id: z.string().optional(),
  type: z.string(),
  total: z.number().optional(),
  entry: z.array(BundleEntrySchema).optional(),
});

export type Bundle = z.infer<typeof BundleSchema>;

// ---------------------------------------------------------------------------
// Generic Resource
// ---------------------------------------------------------------------------

export const ResourceSchema = z.object({
  resourceType: z.string(),
  id: z.string().optional(),
});

export type Resource = z.infer<typeof ResourceSchema>;
