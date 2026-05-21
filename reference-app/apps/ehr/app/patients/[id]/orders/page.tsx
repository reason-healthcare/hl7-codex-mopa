import { Client, PatientSchema, getPatientDisplayName } from "@ogca/fhir-client";
import type { Patient } from "@ogca/fhir-client";
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
  let conditionCode: string | undefined;

  try {
    patient = PatientSchema.parse(await client.read({ resourceType: "Patient", id }));
    displayName = getPatientDisplayName(patient);
  } catch {
    /* non-fatal */
  }

  // Fetch primary condition to pass conditionCode for OGCA-aware prefetch
  try {
    const { BundleSchema, ConditionSchema } = await import("@ogca/fhir-client");
    const raw = await client.search({
      resourceType: "Condition",
      searchParams: { patient: id, category: "problem-list-item", _count: "5" },
    });
    const bundle = BundleSchema.parse(raw);
    const first = (bundle.entry ?? [])
      .map((e) => e.resource)
      .find((r) => r?.resourceType === "Condition");
    if (first) {
      const cond = ConditionSchema.parse(first);
      conditionCode = cond.code?.coding?.find((c) => c.system === "http://snomed.info/sct")?.code;
    }
  } catch {
    /* non-fatal */
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Patient banner — consistent with chart page */}
      <div className="bg-slate-800 text-slate-100 px-6 py-3 flex items-center gap-6 text-sm">
        <span className="font-semibold">{displayName}</span>
        {patient?.birthDate && <span className="text-slate-300">DOB: {patient.birthDate}</span>}
        {patient?.gender && (
          <span className="text-slate-300 capitalize">Sex: {patient.gender}</span>
        )}
        <span className="font-mono text-xs text-slate-400">FHIR ID: {id}</span>
        <div className="ml-auto">
          <Link
            href={`/patients/${id}`}
            className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded transition-colors text-slate-200"
          >
            ← Chart
          </Link>
        </div>
      </div>

      <OrderEntryClient patientId={id} conditionCode={conditionCode} />
    </div>
  );
}
