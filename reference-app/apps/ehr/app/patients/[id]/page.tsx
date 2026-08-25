import type { Condition, Observation, Patient } from "@mopa/fhir-client";
import {
  BundleSchema,
  Client,
  ConditionSchema,
  ObservationSchema,
  PatientSchema,
} from "@mopa/fhir-client";
import Link from "next/link";
import {
  type CategorizedObs,
  categorizeObservations,
  conditionDisplay,
  formatObsValue,
  obsDisplay,
  shortSystem,
} from "./_lib/chart-helpers";

interface PageProps {
  params: Promise<{ id: string }>;
}

function getFhirClient() {
  return new Client({ baseUrl: process.env.FHIR_BASE_URL ?? "http://localhost:8080/fhir" });
}

const SYS_ICD10 = "http://hl7.org/fhir/sid/icd-10-cm";
const SYS_LOINC = "http://loinc.org";

function bundleResources<T>(raw: unknown, resourceType: string, parse: (r: unknown) => T): T[] {
  const bundle = BundleSchema.parse(raw);
  return (bundle.entry ?? [])
    .map((e) => e.resource)
    .filter((r): r is NonNullable<typeof r> => r?.resourceType === resourceType)
    .map((r) => parse(r));
}

/**
 * Extract Condition.assessment references (Observation IDs) from a Condition.
 * These are the staging observations associated with the condition per mCODE.
 */
function _getConditionAssessmentRefs(cond: Condition): string[] {
  const stage = (cond as { stage?: Array<{ assessment?: Array<{ reference?: string }> }> }).stage;
  if (!stage) return [];
  return stage
    .flatMap((s) => s.assessment ?? [])
    .map((a) => a.reference ?? "")
    .filter(Boolean);
}

export default async function PatientChartPage({ params }: PageProps) {
  const { id } = await params;
  const client = getFhirClient();

  let patient: Patient | undefined;
  let conditions: Condition[] = [];
  let observations: Observation[] = [];
  let error: string | null = null;

  try {
    patient = PatientSchema.parse(await client.read({ resourceType: "Patient", id }));
    conditions = bundleResources(
      await client.search({ resourceType: "Condition", searchParams: { patient: id } }),
      "Condition",
      (r) => ConditionSchema.parse(r)
    );
    observations = bundleResources(
      await client.search({
        resourceType: "Observation",
        searchParams: { patient: id, _sort: "-date", _count: "50" },
      }),
      "Observation",
      (r) => ObservationSchema.parse(r)
    );
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load patient data";
  }

  if (error) {
    return (
      <div className="px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-xl">
          <h2 className="text-red-700 font-semibold text-lg mb-2">Error loading patient</h2>
          <p className="text-red-600 text-sm font-mono">{error}</p>
          <Link href="/" className="mt-4 inline-block text-blue-600 underline text-sm">
            ← Back to patient list
          </Link>
        </div>
      </div>
    );
  }

  if (!patient) return null;

  const { biomarkers, staging, labs } = categorizeObservations(observations);

  return (
    <div className="px-5 py-4 space-y-5 max-w-5xl">
      {/* ── Action bar ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-base font-semibold text-slate-800">Chart Review</h1>
        <Link
          href={`/patients/${id}/orders`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          New Order Entry →
        </Link>
      </div>

      {/* ── Clinical Narrative ── */}
      {patient.text?.div && (
        <details open className="border border-slate-200 rounded-lg overflow-hidden">
          <summary className="px-4 py-2 bg-slate-50 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden hover:bg-slate-100 transition-colors">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Clinical Narrative
            </span>
          </summary>
          <div className="px-4 py-3 text-sm text-slate-600 leading-relaxed">
            {patient.text.div
              .replace(/<[^>]+>/g, " ")
              .replace(/\s{2,}/g, " ")
              .trim()}
          </div>
        </details>
      )}

      {/* ── Clinical Synopsis ── */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
          <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Clinical Synopsis
          </h2>
        </div>

        {/* ── Conditions with associated staging ──
            Uses Observation.focus → Condition and Condition.stage.assessment → Observation
            per mCODE to associate staging observations with their condition. */}
        {conditions.length > 0 && (
          <div className="border-b border-slate-100">
            <div className="px-4 py-1.5 bg-slate-50/50 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-500">Conditions &amp; Staging</span>
            </div>
            <div className="divide-y divide-slate-100">
              {conditions.map((cond) => {
                const code =
                  cond.code?.coding?.find((c) => c.system === SYS_ICD10) ?? cond.code?.coding?.[0];

                // Match staging observations to this condition via Observation.focus
                const condRef = `Condition/${cond.id}`;
                const condStaging = staging.filter((s) => s.conditionRef === condRef);

                return (
                  <div key={cond.id} className="px-4 py-3">
                    {/* Condition header row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="font-medium text-slate-800">{conditionDisplay(cond)}</span>
                        {code?.code && (
                          <span className="text-xs font-mono text-slate-400">
                            {code.code} · {shortSystem(code.system)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="capitalize">
                          {cond.clinicalStatus?.coding?.[0]?.code ?? "—"}
                        </span>
                        <span className="whitespace-nowrap">
                          {cond.onsetDateTime?.slice(0, 10) ?? "—"}
                        </span>
                      </div>
                    </div>

                    {/* Associated staging observations (linked via Observation.focus) */}
                    {condStaging.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {condStaging.map((s) => (
                          <StagingCard key={s.obs.id} staging={s} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Biomarkers & Labs ── */}
        {(biomarkers.length > 0 || labs.length > 0) && (
          <div className="border-b border-slate-100">
            <div className="px-4 py-1.5 bg-slate-50/50 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-500">Biomarkers &amp; Labs</span>
            </div>

            {/* Biomarker Results */}
            {biomarkers.length > 0 && (
              <div className="border-b border-slate-100">
                <div className="px-4 py-1 bg-slate-50/30">
                  <span className="text-[10px] font-medium text-slate-400">Biomarker Results</span>
                </div>
                <div className="grid grid-cols-3 divide-x divide-slate-100">
                  {biomarkers.map((b) => {
                    const label = b.label.split(" ")[0];
                    const isPositive = b.valueCode === "10828004" || b.valueCode === "416940007";
                    return (
                      <div key={b.obs.id} className="px-4 py-3">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                          {label}
                        </p>
                        <p
                          className={`text-sm font-semibold mt-0.5 ${isPositive ? "text-rose-700" : "text-slate-700"}`}
                        >
                          {b.value}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {b.code} · {shortSystem(b.system)}
                        </p>
                        <p className="text-[10px] text-slate-400">{b.date}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Other Labs */}
            {labs.length > 0 && (
              <div>
                <div className="px-4 py-1 bg-slate-50/30">
                  <span className="text-[10px] font-medium text-slate-400">Other Labs</span>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {labs.map((l) => (
                      <tr key={l.obs.id} className="border-b border-slate-50 last:border-0">
                        <td className="px-4 py-1.5 text-slate-700">{l.label}</td>
                        <td className="px-4 py-1.5 text-slate-600 font-medium">{l.value}</td>
                        <td className="px-4 py-1.5 text-xs text-slate-400 font-mono">
                          {l.code} · {shortSystem(l.system)}
                        </td>
                        <td className="px-4 py-1.5 text-xs text-slate-400 text-right whitespace-nowrap">
                          {l.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── All Observations (expandable) ── */}
      {observations.length > 0 && (
        <details className="border border-slate-200 rounded-lg overflow-hidden">
          <summary className="px-4 py-2 bg-slate-50 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden hover:bg-slate-100 transition-colors">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              All Observations ({observations.length})
            </span>
          </summary>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-3 py-2 font-medium text-slate-600 text-xs">Observation</th>
                <th className="px-3 py-2 font-medium text-slate-600 text-xs">Value</th>
                <th className="px-3 py-2 font-medium text-slate-600 text-xs">Code</th>
                <th className="px-3 py-2 font-medium text-slate-600 text-xs">Date</th>
              </tr>
            </thead>
            <tbody>
              {observations.map((obs) => {
                const coding =
                  obs.code?.coding?.find((c) => c.system === SYS_LOINC) ?? obs.code?.coding?.[0];
                return (
                  <tr key={obs.id} className="border-t border-slate-100">
                    <td className="px-3 py-1.5 text-slate-700">{obsDisplay(obs)}</td>
                    <td className="px-3 py-1.5 text-slate-600 font-medium">
                      {formatObsValue(obs)}
                    </td>
                    <td className="px-3 py-1.5 text-xs text-slate-400 font-mono">
                      {coding?.code ?? "—"} · {shortSystem(coding?.system)}
                    </td>
                    <td className="px-3 py-1.5 text-xs text-slate-400 whitespace-nowrap">
                      {obs.effectiveDateTime?.slice(0, 10) ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </details>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// StagingCard — renders a single staging observation as a compact card
// ---------------------------------------------------------------------------

function StagingCard({ staging }: { staging: CategorizedObs }) {
  const label = staging.label.length > 40 ? staging.code : staging.label;
  return (
    <div className="bg-slate-50 rounded px-3 py-2 border border-slate-100">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold mt-0.5 text-slate-700">{staging.value}</p>
      <div className="flex items-center gap-2 mt-0.5">
        <p className="text-[10px] text-slate-400 font-mono">
          {staging.code} · {shortSystem(staging.system)}
        </p>
        <p className="text-[10px] text-slate-400">{staging.date}</p>
      </div>
    </div>
  );
}
