import { z } from "zod";

/**
 * Re-exports individual FHIR resource schemas and TypeScript types from
 * @reasonhealth/fhir-zod/r4 (v1.0.5+).
 *
 * BundleSchema is defined locally rather than re-exported from fhir-zod because
 * fhir-zod's Bundle.entry[].resource is typed as the abstract base Resource —
 * which does not include `resourceType` in its differential. Zod strips unknown
 * keys by default, so parsing a Bundle through fhir-zod's schema would drop
 * `resourceType` from all entries, breaking the `.filter(r => r.resourceType
 * === "Patient")` pattern used throughout the EHR.
 *
 * Our BundleSchema uses `z.record(z.unknown())` for the resource field so the
 * full JSON — including resourceType — passes through intact. Individual
 * resources are validated downstream with their specific schemas after
 * type-narrowing.
 */

export {
  PatientSchema,
  ConditionSchema,
  ObservationSchema,
  ResourceSchema,
} from "@reasonhealth/fhir-zod/r4";

export type {
  Patient,
  Condition,
  Observation,
  Resource,
} from "@reasonhealth/fhir-zod/r4";

// ---------------------------------------------------------------------------
// Bundle — passthrough-safe for search responses
// ---------------------------------------------------------------------------

const BundleEntrySchema = z.object({
  fullUrl: z.string().optional(),
  // z.record preserves all fields including resourceType — do not replace with
  // fhir-zod's Resource schema which strips unknown keys.
  resource: z.record(z.unknown()).optional(),
  request: z.object({ method: z.string(), url: z.string() }).optional(),
  response: z.object({ status: z.string(), location: z.string().optional() }).optional(),
});

export const BundleSchema = z.object({
  resourceType: z.literal("Bundle"),
  id: z.string().optional(),
  type: z.string(),
  total: z.number().optional(),
  entry: z.array(BundleEntrySchema).optional(),
});

export type Bundle = z.infer<typeof BundleSchema>;
