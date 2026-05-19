/**
 * CQL engine implementation — Stage 1: cql-execution + cql-exec-fhir.
 *
 * The CqlEngine interface is the stable abstraction. Swapping to the
 * rh-cql WASM evaluator (Stage 2) requires only replacing this file.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Library, Executor } = require("cql-execution");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cqlFhir = require("cql-exec-fhir");

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface ElmJson {
  library: Record<string, unknown>;
}

export type CqlExpressionResults = Record<string, unknown>;

export interface CqlEngine {
  /**
   * Evaluate a compiled ELM library against a patient's FHIR resources.
   *
   * @param elm       Compiled ELM JSON from `rh cql compile` (v0.2.0-beta.2+)
   * @param patientId FHIR Patient.id — used as the patient context key
   * @param resources Array of FHIR R4 resource objects
   * @returns Map of expression name → result value
   */
  evaluate(elm: ElmJson, patientId: string, resources: unknown[]): Promise<CqlExpressionResults>;
}

// ---------------------------------------------------------------------------
// FHIR patient bundle builder
// ---------------------------------------------------------------------------

interface FhirBundle {
  resourceType: "Bundle";
  type: string;
  entry: Array<{ resource: unknown }>;
}

/**
 * Assemble a FHIR collection Bundle from a flat resource array.
 * PatientSource.loadBundles() expects one bundle per patient.
 * Injects a stub Patient resource when none is present so cql-execution
 * can resolve the patient context.
 */
export function buildPatientBundle(patientId: string, resources: unknown[]): FhirBundle {
  const hasPatient = resources.some(
    (r) => (r as { resourceType?: string }).resourceType === "Patient"
  );
  const entries: Array<{ resource: unknown }> = [];
  if (!hasPatient) {
    entries.push({ resource: { resourceType: "Patient", id: patientId } });
  }
  for (const resource of resources) {
    entries.push({ resource });
  }
  return { resourceType: "Bundle", type: "collection", entry: entries };
}

/**
 * Extract all resources from a FHIR searchset Bundle's entry array.
 * Returns an empty array when the input is not a recognisable Bundle.
 */
export function extractBundleResources(bundle: unknown): unknown[] {
  if (!bundle || typeof bundle !== "object") return [];
  const b = bundle as { entry?: Array<{ resource?: unknown }> };
  return (b.entry ?? []).map((e) => e.resource).filter(Boolean) as unknown[];
}

// ---------------------------------------------------------------------------
// CqlExecutionEngine
// ---------------------------------------------------------------------------

export class CqlExecutionEngine implements CqlEngine {
  async evaluate(
    elm: ElmJson,
    patientId: string,
    resources: unknown[]
  ): Promise<CqlExpressionResults> {
    const lib = new Library(elm);
    const executor = new Executor(lib);

    const source = cqlFhir.PatientSource.FHIRv401();
    source.loadBundles([buildPatientBundle(patientId, resources)]);

    const execResults = await executor.exec(source);

    const patientResults =
      execResults?.patientResults?.[patientId] ??
      Object.values(execResults?.patientResults ?? {})[0] ??
      {};

    return patientResults as CqlExpressionResults;
  }
}
