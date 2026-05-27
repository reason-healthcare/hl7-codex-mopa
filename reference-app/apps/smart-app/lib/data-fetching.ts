/**
 * Data-fetching helpers for the CDS SMART App.
 *
 * Fetches the PA data requirements Library from the CRD service and
 * executes parallel FHIR queries for each DataRequirement against the EHR.
 */
import { Client, BundleSchema } from "@ogca/fhir-client";
import { CRD_LIBRARY_URL } from "./smart-config";
import { log } from "@ogca/logger";

// ---------------------------------------------------------------------------
// Library resource types
// ---------------------------------------------------------------------------

export interface DataRequirementLabel {
  url: string;
  valueString: string;
}

export interface DataRequirement {
  type: string;
  codeFilter?: Array<{
    path: string;
    code?: Array<{ system: string; code: string; display?: string }>;
    valueSet?: string;
  }>;
  extension?: DataRequirementLabel[];
}

export interface LibraryResource {
  resourceType: "Library";
  id: string;
  url: string;
  dataRequirement: DataRequirement[];
}

// ---------------------------------------------------------------------------
// DataRequirement → FHIR query mapping
// ---------------------------------------------------------------------------

/** Key used to identify each data element in gap analysis. */
export type DataKey =
  | "her2"
  | "cancerStage"
  | "ecogPs"
  | "lineOfTherapy"
  | "conditions"
  | "patient";

export interface GapResult {
  key: DataKey;
  label: string;
  present: boolean;
  resources: unknown[];
}

const FHIR_QUERIES: Record<DataKey, (patientId: string) => string> = {
  patient: (id) => `Patient/${id}`,
  conditions: (id) => `Condition?patient=${id}&category=problem-list-item&_count=20`,
  her2: (id) =>
    `Observation?patient=${id}&code=http://loinc.org|85319-2,http://snomed.info/sct|431396003&_count=5`,
  cancerStage: (id) => `Observation?patient=${id}&code=http://loinc.org|21908-9&_count=1`,
  ecogPs: (id) => `Observation?patient=${id}&code=http://loinc.org|89247-1&_count=1`,
  lineOfTherapy: (id) => `Observation?patient=${id}&code=http://snomed.info/sct|415068001&_count=1`,
};

const KEY_LABELS: Record<DataKey, string> = {
  patient: "Patient Demographics",
  conditions: "Problem List",
  her2: "HER2 Status",
  cancerStage: "Cancer Stage",
  ecogPs: "ECOG Performance Status",
  lineOfTherapy: "Line of Therapy",
};

// DataRequirements that affect PA approval
export const REQUIRED_KEYS: DataKey[] = ["her2", "cancerStage", "ecogPs"];

/** FHIR coding for the HER2 observation — shared with the write-back form. */
export const HER2_LOINC_CODE = "85319-2";
export const HER2_LOINC_SYSTEM = "http://loinc.org";
export const HER2_LOINC_DISPLAY = "HER2, Breast cancer specimen";

// ---------------------------------------------------------------------------
// Library fetch
// ---------------------------------------------------------------------------

export async function fetchLibrary(correlationId?: string): Promise<LibraryResource | null> {
  const t0 = Date.now();
  log({
    service: "smart", level: "info", type: "fhir.read",
    correlationId,
    method: "GET", path: CRD_LIBRARY_URL,
    summary: `Fetching PA data requirements library from Hub`,
  });
  try {
    const res = await fetch(CRD_LIBRARY_URL, {
      headers: { Accept: "application/fhir+json" },
      cache: "no-store",
    });
    const durationMs = Date.now() - t0;
    if (!res.ok) {
      log({ service: "smart", level: "warn", type: "fhir.read", correlationId,
        method: "GET", path: CRD_LIBRARY_URL, status: res.status, durationMs,
        summary: `Library fetch failed: HTTP ${res.status}` });
      return null;
    }
    const library = await res.json() as LibraryResource;
    log({ service: "smart", level: "info", type: "fhir.read", correlationId,
      method: "GET", path: CRD_LIBRARY_URL, status: 200, durationMs,
      response: { id: library.id, url: library.url, dataRequirements: library.dataRequirement?.length },
      summary: `Library fetched: ${library.id} (${library.dataRequirement?.length ?? 0} data requirements)` });
    return library;
  } catch (e) {
    log({ service: "smart", level: "error", type: "fhir.read", correlationId,
      method: "GET", path: CRD_LIBRARY_URL,
      summary: `Library fetch error: ${e instanceof Error ? e.message : String(e)}` });
    return null;
  }
}

// ---------------------------------------------------------------------------
// DataRequirement gap analysis
// ---------------------------------------------------------------------------

/**
 * Run all DataRequirement FHIR queries in parallel against the EHR.
 * Returns one GapResult per required data element.
 */
export async function runGapAnalysis(
  patientId: string,
  fhirBase: string,
  bearerToken: string,
  correlationId?: string,
): Promise<GapResult[]> {
  const client = new Client({ baseUrl: fhirBase, bearerToken });
  const keys = Object.keys(FHIR_QUERIES) as DataKey[];

  const results = await Promise.all(
    keys.map(async (key): Promise<GapResult> => {
      const queryFn = FHIR_QUERIES[key];
      const query   = queryFn ? queryFn(patientId) : "";
      if (!query) return { key, label: KEY_LABELS[key], present: false, resources: [] };

      const path = key === "patient" ? `${fhirBase}/${query}` : `${fhirBase}/${query}`;
      const t0   = Date.now();

      try {
        if (key === "patient") {
          const resource  = await client.read({ resourceType: "Patient", id: patientId });
          const durationMs = Date.now() - t0;
          log({ service: "smart", level: "info", type: "fhir.read", correlationId,
            patientId, method: "GET", path: `Patient/${patientId}`,
            status: 200, durationMs,
            summary: `FHIR GET Patient/${patientId} — found` });
          return { key, label: KEY_LABELS[key], present: true, resources: [resource] };
        }

        const raw     = await client.search({
          resourceType: query.split("?")[0] ?? "Observation",
          searchParams: Object.fromEntries(new URLSearchParams(query.split("?")[1] ?? "")),
        });
        const bundle    = BundleSchema.parse(raw);
        const resources = (bundle.entry ?? []).map(e => e.resource).filter(Boolean) as unknown[];
        const durationMs = Date.now() - t0;
        const present    = resources.length > 0;

        log({ service: "smart", level: "info", type: "fhir.read", correlationId,
          patientId, method: "GET",
          path:      query.split("?")[0] ?? "",
          status:    200, durationMs,
          outcome:   present ? `${resources.length} result(s)` : "absent",
          summary:   `FHIR ${KEY_LABELS[key]}: ${present ? `${resources.length} result(s)` : "absent"}` });

        return { key, label: KEY_LABELS[key], present, resources };
      } catch (e) {
        log({ service: "smart", level: "error", type: "fhir.read", correlationId,
          patientId, method: "GET", path: query.split("?")[0] ?? "",
          summary: `FHIR ${KEY_LABELS[key]} error: ${e instanceof Error ? e.message : String(e)}` });
        return { key, label: KEY_LABELS[key], present: false, resources: [] };
      }
    })
  );

  return results;
}

/** Flatten GapResults into a resource array suitable for CQL evaluation. */
export function flattenResources(gaps: GapResult[]): unknown[] {
  return gaps.flatMap((g) => g.resources);
}
