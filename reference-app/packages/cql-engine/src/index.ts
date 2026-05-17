// CQL Engine stub — Phase 3 will implement CqlEngine backed by cql-execution

export type CqlResult = unknown;

export interface FhirContext {
  patientId: string;
  resources: unknown[];
}

export interface ElmJson {
  library: unknown;
}

export interface CqlEngine {
  evaluate(
    elm: ElmJson,
    context: FhirContext,
    expression: string
  ): CqlResult;
}
