/**
 * CQL engine implementation — Stage 1: cql-execution + cql-exec-fhir.
 *
 * The CqlEngine interface is the stable abstraction. Swapping to the
 * rh-cql WASM evaluator (Stage 2) requires only replacing this file.
 *
 * Note: rh cql compile (v0.1.0-beta.1) does not emit a `context`
 * attribute on ExpressionDef nodes. cql-execution v3 requires
 * `context: "Patient"` to evaluate expressions in patient context.
 * patchElmContext() adds the missing attribute at runtime.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Library, Executor } = require("cql-execution");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cqlFhir = require("cql-exec-fhir");

/** Lazily-resolved FHIR 4.0.1 model info for primaryCodePath lookup. */
function getFhirModelInfo() {
  return cqlFhir.PatientSource.FHIRv401()._modelInfo;
}

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
   * @param elm       Compiled ELM JSON (from `rh cql compile`, patched for context)
   * @param patientId FHIR Patient.id — used as the patient context key
   * @param resources Array of FHIR R4 resource objects
   * @returns Map of expression name → result value
   */
  evaluate(elm: ElmJson, patientId: string, resources: unknown[]): Promise<CqlExpressionResults>;
}

// ---------------------------------------------------------------------------
// ELM context patch
// ---------------------------------------------------------------------------

/**
 * `rh cql compile` (v0.1.0-beta.1) omits two attributes that cql-execution
 * requires from ExpressionDef and Retrieve nodes:
 *
 * 1. `context: "Patient"` on ExpressionDef — executor skips expressions
 *    without this attribute when iterating the patient context.
 *
 * 2. `codeProperty` on Retrieve — executor calls `record.getCode(undefined)`
 *    which throws; should be the FHIR model's primaryCodePath (e.g. "code"
 *    for Observation and Condition).
 *
 * Both are added here as a runtime patch. Remove once `rh` includes them.
 */
export function patchElmContext(elm: ElmJson): ElmJson {
  const patched = JSON.parse(JSON.stringify(elm)) as ElmJson;
  const lib = patched.library as {
    statements?: { def?: Array<Record<string, unknown>> };
  };
  const modelInfo = getFhirModelInfo() as {
    findClass: (name: string) => { primaryCodePath?: string } | null;
  };

  for (const stmt of lib.statements?.def ?? []) {
    // 1. Add missing context
    if (stmt.context == null) stmt.context = "Patient";

    // 2. Recursively add missing codeProperty to Retrieve nodes
    addCodeProperty(stmt as Record<string, unknown>, modelInfo);
  }
  return patched;
}

function addCodeProperty(
  node: Record<string, unknown>,
  modelInfo: { findClass: (name: string) => { primaryCodePath?: string } | null }
): void {
  if (!node || typeof node !== "object") return;
  if (node.type === "Retrieve" && node.codeProperty == null && node.dataType) {
    const dataType = String(node.dataType).replace(/^\{http:\/\/hl7\.org\/fhir\}/, "FHIR.");
    const cls = modelInfo.findClass(dataType);
    if (cls?.primaryCodePath) node.codeProperty = cls.primaryCodePath;
  }
  // cql-execution v3 treats a non-array executedCodes as a ValueSet and calls
  // resolveValueSet() — which fails for plain Code/Concept references. Wrap
  // single-code `codes` expressions in a List node so typeIsArray() is true.
  // Also: rh emits ExpressionRef for code defs in Retrieve.codes but
  // cql-execution looks up codes in library.codes only via CodeRef — fix the type.
  if (
    node.type === "Retrieve" &&
    node.codes &&
    typeof node.codes === "object" &&
    !Array.isArray(node.codes)
  ) {
    const codesNode = node.codes as Record<string, unknown>;
    // Rewrite ExpressionRef → CodeRef so cql-execution finds it in library.codes
    if (codesNode.type === "ExpressionRef") {
      codesNode.type = "CodeRef";
    }
    const t = codesNode.type as string;
    if (t === "CodeRef" || t === "ConceptRef") {
      node.codes = { type: "List", element: [codesNode] };
    }
  }
  for (const val of Object.values(node)) {
    if (val && typeof val === "object") {
      if (Array.isArray(val)) {
        for (const item of val) addCodeProperty(item as Record<string, unknown>, modelInfo);
      } else {
        addCodeProperty(val as Record<string, unknown>, modelInfo);
      }
    }
  }
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
    const patchedElm = patchElmContext(elm);
    const lib = new Library(patchedElm);
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
