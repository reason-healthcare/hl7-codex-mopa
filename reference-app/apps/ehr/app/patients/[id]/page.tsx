import {
  Client,
  PatientSchema,
  BundleSchema,
  ConditionSchema,
  ObservationSchema,
} from "@mopa/fhir-client";
import type { Condition, Observation, Patient } from "@mopa/fhir-client";
import Link from "next/link";
import {
  categorizeObservations,
  conditionDisplay,
  obsDisplay,
  formatObsValue,
  shortSystem,
  calculateAge,
  type CategorizedObs,
} from "./_lib/chart-helpers";

interface PageProps {
  params: Promise<{ id: string }>;
}

function getFhirClient() {
  return new Client({ baseUrl: process.env.FHIR_BASE_URL ?? "http://localhost:8080/fhir" });
}

const SYS_ICD10 = "http://hl7.org/fhir/sid/icd-10-cm";
const SYS_SNOMED = "http://snomed.info/sct";
const SYS_LOINC = "http://loinc.org";

function bundleResources<T>(raw: unknown, resourceType: string, parse: (r: unknown) => T): T[] {
  const bundle = BundleSchema.parse(raw);
  return (bundle.entry ?? [])
    .map((e) => e.resource)
    .filter((r): r is NonNullable<typeof r> => r?.resourceType === resourceType)
    .map((r) => parse(r));
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
  const age = patient.birthDate ? calculateAge(patient.birthDate) : null;

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

      {/* ── Clinical Synopsis ── */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
          <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Clinical Synopsis</h2>
        </div>

        {/* Problem List */}
        <div className="border-b border-slate-100">
          <div className="px-4 py-1.5 bg-slate-50/50 border-b border-slate-100">
            <span className="text-xs font-medium text-slate-500">Problem List</span>
          </div>
          {conditions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-400 italic">No conditions recorded.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {conditions.map((cond) => {
                  const code = cond.code?.coding?.find((c) => c.system === SYS_ICD10) ?? cond.code?.coding?.[0];
                  return (
                    <tr key={cond.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-2">
                        <span className="font-medium text-slate-800">{conditionDisplay(cond)}</span>
                        {code?.code && (
                          <span className="ml-2 text-xs font-mono text-slate-400">
                            {code.code} · {shortSystem(code.system)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <span className="inline-flex items-center gap-1 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className="text-slate-600 capitalize">{cond.clinicalStatus?.coding?.[0]?.code ?? "—"}</span>
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right text-xs text-slate-400 whitespace-nowrap">
                        {cond.onsetDateTime?.slice(0, 10) ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Biomarker Results */}
        {biomarkers.length > 0 && (
          <div className="border-b border-slate-100">
            <div className="px-4 py-1.5 bg-slate-50/50 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-500">Biomarker Results</span>
            </div>
            <div className="grid grid-cols-3 divide-x divide-slate-100">
              {biomarkers.map((b) => {
                const label = b.label.split(" ")[0];
                const isPositive = b.valueCode === "10828004" || b.valueCode === "416940007";
                return (
                  <div key={b.obs.id} className="px-4 py-3">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                    <p className={`text-sm font-semibold mt-0.5 ${isPositive ? "text-rose-700" : "text-slate-700"}`}>
                      {b.value}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{b.code} · {shortSystem(b.system)}</p>
                    <p className="text-[10px] text-slate-400">{b.date}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Staging & Genomic */}
        {staging.length > 0 && (
          <div className="border-b border-slate-100">
            <div className="px-4 py-1.5 bg-slate-50/50 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-500">Staging &amp; Clinical Assessment</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
              {staging.map((s) => (
                <div key={s.obs.id} className="px-4 py-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    {s.label.length > 40 ? s.code : s.label}
                  </p>
                  <p className="text-sm font-semibold mt-0.5 text-slate-700">{s.value}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{s.code} · {shortSystem(s.system)}</p>
                  <p className="text-[10px] text-slate-400">{s.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Labs */}
        {labs.length > 0 && (
          <div>
            <div className="px-4 py-1.5 bg-slate-50/50 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-500">Other Observations</span>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {labs.map((l) => (
                  <tr key={l.obs.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-1.5 text-slate-700">{l.label}</td>
                    <td className="px-4 py-1.5 text-slate-600 font-medium">{l.value}</td>
                    <td className="px-4 py-1.5 text-xs text-slate-400 font-mono">{l.code} · {shortSystem(l.system)}</td>
                    <td className="px-4 py-1.5 text-xs text-slate-400 text-right whitespace-nowrap">{l.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                const coding = obs.code?.coding?.find((c) => c.system === SYS_LOINC) ?? obs.code?.coding?.[0];
                return (
                  <tr key={obs.id} className="border-t border-slate-100">
                    <td className="px-3 py-1.5 text-slate-700">{obsDisplay(obs)}</td>
                    <td className="px-3 py-1.5 text-slate-600 font-medium">{formatObsValue(obs)}</td>
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

      {/* ── Demographics detail ── */}
      <details className="border border-slate-200 rounded-lg overflow-hidden">
        <summary className="px-4 py-2 bg-slate-50 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden hover:bg-slate-100 transition-colors">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Demographics</span>
        </summary>
        <dl className="grid grid-cols-2 gap-4 text-sm px-4 py-3">
          <div>
            <dt className="text-slate-500 text-xs">Date of Birth</dt>
            <dd className="font-medium">{patient.birthDate ?? "—"}{age !== null && ` (${age} yrs)`}</dd>
          </div>
          <div>
            <dt className="text-slate-500 text-xs">Gender</dt>
            <dd className="font-medium capitalize">{patient.gender ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500 text-xs">FHIR ID</dt>
            <dd className="font-mono text-xs text-slate-500">{patient.id}</dd>
          </div>
          {patient.identifier?.map((ident) => (
            <div key={ident.value ?? ident.system ?? "id"}>
              <dt className="text-slate-500 text-xs">
                {ident.type?.coding?.[0]?.code ?? ident.system ?? "Identifier"}
              </dt>
              <dd className="font-medium">{ident.value ?? "—"}</dd>
            </div>
          ))}
        </dl>
      </details>

      {/* ── Clinical Narrative ── */}
      {patient.text?.div && (
        <details className="border border-slate-200 rounded-lg overflow-hidden">
          <summary className="px-4 py-2 bg-slate-50 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden hover:bg-slate-100 transition-colors">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Clinical Narrative</span>
          </summary>
          <div className="px-4 py-3 text-sm text-slate-600 leading-relaxed">
            {patient.text.div.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim()}
          </div>
        </details>
      )}
    </div>
  );
}
