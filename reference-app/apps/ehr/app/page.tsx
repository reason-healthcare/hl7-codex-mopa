import { Fragment } from "react";
import Link from "next/link";
import { ServiceIntro } from "@mopa/ui";

const PATIENTS = [
  {
    id: process.env.JANE_SMITH_PATIENT_ID ?? "jane-smith",
    name: "Jane Smith",
    dob: "1972-04-15",
    mrn: "MRN-001",
    outcome: "Approvable" as const,
  },
  { id: "maria-garcia", name: "Maria Garcia", dob: "1975-08-22", mrn: "MRN-002", outcome: "PA Required"  as const },
  { id: "sandra-chen",  name: "Sandra Chen",  dob: "1963-11-05", mrn: "MRN-003", outcome: "DTR Required" as const },
  { id: "diane-roe",    name: "Diane Roe",    dob: "1977-06-22", mrn: "MRN-004", outcome: "Biosimilar Sub"  as const },
];

const OUTCOME_BADGE: Record<(typeof PATIENTS)[number]["outcome"], string> = {
  "Approvable":     "bg-green-100 text-green-800 border border-green-200",
  "PA Required":    "bg-amber-100 text-amber-800 border border-amber-200",
  "DTR Required":   "bg-slate-100 text-slate-600 border border-slate-200",
  "Biosimilar Sub": "bg-violet-100 text-violet-800 border border-violet-200",
};

function stripXhtml(div: string): string {
  return div
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function fetchNarrative(fhirBase: string, id: string): Promise<string | null> {
  try {
    const res = await fetch(`${fhirBase}/Patient/${id}`, {
      headers: { Accept: "application/fhir+json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const pt = (await res.json()) as Record<string, unknown>;
    const div = (pt.text as Record<string, unknown> | undefined)?.div as string | undefined;
    return div ? stripXhtml(div) : null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const fhirBase = process.env.FHIR_BASE_URL ?? "http://localhost:8080/fhir";
  const narratives = await Promise.all(PATIENTS.map((p) => fetchNarrative(fhirBase, p.id)));

  return (
    <>
      <ServiceIntro
        title="MOPA Reference EHR"
        description="Simulates a clinical order-entry system for oncology. Integrates CDS Hooks guidance (order-select/sign via the CRD Service), SMART on FHIR app launch, and prior authorization submission via the PAS Service."
      />

      <main className="w-full max-w-5xl mx-auto px-6 py-8">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Patient List
        </h2>

        <div className="bg-white rounded border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 font-medium text-slate-600">DOB</th>
                <th className="px-4 py-3 font-medium text-slate-600">MRN</th>
                <th className="px-4 py-3 font-medium text-slate-600">Expected Outcome</th>
                <th className="px-4 py-3 font-medium text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {PATIENTS.map((p, i) => (
                <Fragment key={p.id}>
                  <tr className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                    <td className="px-4 py-3 text-slate-600">{p.dob}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.mrn}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${OUTCOME_BADGE[p.outcome]}`}>
                        {p.outcome}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/patients/${p.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Open Chart →
                      </Link>
                    </td>
                  </tr>
                  {narratives[i] && (
                    <tr className="border-t border-slate-100 bg-slate-50/60">
                      <td
                        colSpan={5}
                        className="px-4 pb-3 pt-1 text-xs text-slate-500 leading-relaxed"
                      >
                        {narratives[i]}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
