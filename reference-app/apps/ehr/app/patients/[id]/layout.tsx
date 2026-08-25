import { Client, PatientSchema, getPatientDisplayName, getPatientMRN, getPatientDOB, getPatientGender } from "@mopa/fhir-client";
import type { Patient } from "@mopa/fhir-client";
import Link from "next/link";
import { calculateAge } from "./_lib/chart-helpers";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function PatientLayout({ children, params }: LayoutProps) {
  const { id } = await params;

  let patient: Patient | null = null;
  try {
    const client = new Client({ baseUrl: process.env.FHIR_BASE_URL ?? "http://localhost:8080/fhir" });
    patient = PatientSchema.parse(await client.read({ resourceType: "Patient", id }));
  } catch {
    /* patient not found — render children without sidebar */
  }

  if (!patient) {
    return <main className="w-full px-6 py-8">{children}</main>;
  }

  const name = getPatientDisplayName(patient);
  const mrn = getPatientMRN(patient);
  const dob = getPatientDOB(patient);
  const gender = getPatientGender(patient);
  const age = dob !== "Unknown" ? calculateAge(dob) : null;

  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 49px)" }}>
      {/* ── Left sidebar ── */}
      <aside className="w-56 flex-shrink-0 bg-slate-100 border-r border-slate-200 flex flex-col">
        {/* Patient mini-card */}
        <div className="px-4 py-3 border-b border-slate-200">
          <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            {age !== null && <span>{age}y</span>}
            <span className="capitalize">{gender === "unknown" ? "" : gender}</span>
            {mrn && <span className="font-mono text-slate-400">· {mrn}</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2">
          <p className="px-4 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Chart</p>
          <Link
            href={`/patients/${id}`}
            className="flex items-center gap-2 px-4 py-1.5 text-sm text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <span className="w-1 h-1 rounded-full bg-slate-400" />
            Chart Review
          </Link>
          <Link
            href={`/patients/${id}/orders`}
            className="flex items-center gap-2 px-4 py-1.5 text-sm text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <span className="w-1 h-1 rounded-full bg-slate-400" />
            Order Entry
          </Link>

          <p className="px-4 py-1 mt-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Reference</p>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-1.5 text-sm text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            Patient List
          </Link>
        </nav>

        {/* FHIR provenance footer */}
        <div className="px-4 py-2 border-t border-slate-200">
          <p className="text-[10px] text-slate-400 font-mono truncate">FHIR: {id}</p>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Patient banner — persists across chart and orders pages */}
        <div className="bg-slate-700 text-white px-5 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold">{name}</span>
            <span className="text-xs text-slate-300">DOB: {dob}</span>
            <span className="text-xs text-slate-300 capitalize">{gender}</span>
            {age !== null && <span className="text-xs text-slate-300">{age} yrs</span>}
            {mrn && <span className="text-xs text-slate-300 font-mono">MRN: {mrn}</span>}
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
