/**
 * Re-export fhir-kit-client's Client and types as the FHIR transport layer.
 * Consumers call client methods, then validate responses with fhir-zod schemas.
 *
 * @example
 * ```ts
 * import { Client } from '@ogca/fhir-client';
 * import { PatientSchema, BundleSchema, ConditionSchema } from '@ogca/fhir-client';
 *
 * const client = new Client({ baseUrl: process.env.FHIR_BASE_URL });
 *
 * // Read — fhir-kit-client fetches, Zod validates
 * const patient = PatientSchema.parse(
 *   await client.read({ resourceType: 'Patient', id: 'jane-smith' })
 * );
 *
 * // Search — use passthrough BundleSchema to preserve resourceType on entries,
 * // then parse each entry with its specific schema
 * const bundle = BundleSchema.parse(
 *   await client.search({ resourceType: 'Condition', searchParams: { patient: id } })
 * );
 * const conditions = (bundle.entry ?? [])
 *   .map(e => e.resource)
 *   .filter((r): r is NonNullable<typeof r> => r?.resourceType === 'Condition')
 *   .map(r => ConditionSchema.parse(r));
 * ```
 */
export { Client } from "fhir-kit-client";
export type { ClientConfig, FhirResource, SearchParams } from "fhir-kit-client";

export {
  getPatientDisplayName,
  getPatientDOB,
  getPatientGender,
  getPatientMRN,
} from "./patient-helpers";
