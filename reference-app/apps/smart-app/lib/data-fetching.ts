/**
 * Data-fetching helpers for the CDS SMART App.
 *
 * Executes parallel FHIR queries for oncology data categories directly
 * against the EHR FHIR server — no Library fetch required.
 */
import { Client, BundleSchema } from "@mopa/fhir-client";
import { log } from "@mopa/logger";

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
// Data gap analysis — direct FHIR queries (no Library fetch)
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
          const resource   = await client.read({ resourceType: "Patient", id: patientId });
          const durationMs = Date.now() - t0;
          log({ service: "smart", level: "info", type: "fhir.read", correlationId,
            patientId, method: "GET",
            path:     `${fhirBase}/Patient/${patientId}`,
            request:  { url: `${fhirBase}/Patient/${patientId}` },
            response: resource,
            status: 200, durationMs,
            summary: `FHIR GET ${fhirBase}/Patient/${patientId} → 200` });
          return { key, label: KEY_LABELS[key], present: true, resources: [resource] };
        }

        const raw      = await client.search({
          resourceType: query.split("?")[0] ?? "Observation",
          searchParams: Object.fromEntries(new URLSearchParams(query.split("?")[1] ?? "")),
        });
        const bundle    = BundleSchema.parse(raw);
        const resources = (bundle.entry ?? []).map(e => e.resource).filter(Boolean) as unknown[];
        const durationMs = Date.now() - t0;
        const present    = resources.length > 0;

        log({ service: "smart", level: "info", type: "fhir.read", correlationId,
          patientId, method: "GET",
          path:     `${fhirBase}/${query}`,
          request:  { url: `${fhirBase}/${query}` },
          response: raw,
          status:   200, durationMs,
          outcome:  present ? `${resources.length} result(s)` : "absent",
          summary:  `FHIR GET ${fhirBase}/${query} → ${present ? `${resources.length} result(s)` : "absent"} (${durationMs}ms)` });

        return { key, label: KEY_LABELS[key], present, resources };
      } catch (e) {
        log({ service: "smart", level: "error", type: "fhir.read", correlationId,
          patientId, method: "GET", path: `${fhirBase}/${query}`,
          summary: `FHIR GET ${fhirBase}/${query} error: ${e instanceof Error ? e.message : String(e)}` });
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
