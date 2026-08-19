/**
 * CQL engine implementation — Stage 1: cql-execution + cql-exec-fhir.
 *
 * The CqlEngine interface is the stable abstraction. Swapping to the
 * rh-cql WASM evaluator (Stage 2) requires only replacing this file.
 *
 * Note: cql-execution and cql-exec-fhir are CommonJS-only packages (no ESM
 * entry point). We use `import` with `esModuleInterop` which TypeScript
 * compiles to `require()` calls — this is the standard interop pattern and
 * avoids lint-disabling `no-require-imports` suppressions.
 */

import { Library, Executor } from "cql-execution";
import * as cqlFhir from "cql-exec-fhir";

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
    patchElmCompatibility(elm);
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

// ---------------------------------------------------------------------------
// ELM compatibility patches (rh v0.2.x -> cql-execution v3.x)
// ---------------------------------------------------------------------------

/**
 * Patch ELM JSON produced by `rh cql compile` v0.2.x for compatibility with
 * the cql-execution v3.x evaluator (Stage 1).
 *
 * rh v0.2.8 emits `First` / `Last` with the child expression under an
 * `operand` key, but cql-execution's First/Last classes read `json.source`.
 * Without this patch, `First.execute` throws because `this.source` is
 * undefined.
 */
function patchElmCompatibility(elm: ElmJson): void {
  const walk = (node: unknown): void => {
    if (!node || typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    const type = obj["type"];

    // Fix 1: rh v0.2.x emits First/Last with `operand` but cql-execution
    // expects `source`.
    if (type === "First" || type === "Last") {
      if ("operand" in obj && !("source" in obj)) {
        obj["source"] = obj["operand"];
        delete obj["operand"];
      }
    }

    // Fix 2: rh v0.2.x emits Property with `source: ExpressionRef("alias")`
    // for query-alias references, but cql-execution expects `scope: "alias"`.
    // Without `scope`, the Property resolves the ExpressionRef which returns
    // the raw FHIRObject, but the .get() fallback for choice types (e.g.,
    // Observation.value -> valueCodeableConcept) only works when `scope`
    // is set so that ctx.get(scope) returns the FHIRObject directly.
    if (type === "Property" && "source" in obj && !("scope" in obj)) {
      const src = obj["source"] as Record<string, unknown> | undefined;
      if (src?.["type"] === "ExpressionRef" && typeof src["name"] === "string") {
        obj["scope"] = src["name"];
        delete obj["source"];
      }
    }

    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) {
        for (const item of value) walk(item);
      } else {
        walk(value);
      }
    }
  };
  walk(elm);
}
