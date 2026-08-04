import { Client, PatientSchema, getPatientDisplayName } from "@mopa/fhir-client";
import type { Patient } from "@mopa/fhir-client";
import Link from "next/link";
import OrderEntryClient from "./OrderEntryClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderEntryPage({ params }: PageProps) {
  const { id } = await params;

  const client = new Client({
    baseUrl: process.env.FHIR_BASE_URL ?? "http://localhost:8080/fhir",
  });

  let patient: Patient | null = null;
  let displayName = id;

  try {
    patient = PatientSchema.parse(await client.read({ resourceType: "Patient", id }));
    displayName = getPatientDisplayName(patient);
  } catch {
    /* non-fatal */
  }

  return (
    <main className="w-full max-w-5xl mx-auto px-6 py-8 space-y-6">
      {/* Back links */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-700 transition-colors">← Patient List</Link>
        <span>/</span>
        <Link href={`/patients/${id}`} className="hover:text-slate-700 transition-colors">{displayName}</Link>
        <span>/</span>
        <span className="font-medium text-slate-700">Order Entry</span>
      </div>

      {/* Patient banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{displayName}</h2>
          <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
            {patient?.birthDate && <span>DOB: {patient.birthDate}</span>}
            {patient?.gender && <span className="capitalize">Sex: {patient.gender}</span>}
            <span className="font-mono">ID: {id}</span>
          </div>
        </div>
        <Link
          href={`/patients/${id}`}
          className="text-xs text-slate-500 hover:text-slate-700 flex-shrink-0 transition-colors"
        >
          ← Chart
        </Link>
      </div>

      <OrderEntryClient patientId={id} />
    </main>
  );
}
