import { PatientSchema } from "@ogca/fhir-client";
import { Client } from "@ogca/fhir-client";
import { getPatientDisplayName } from "@ogca/fhir-client";
import OrderEntryClient from "./OrderEntryClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderEntryPage({ params }: PageProps) {
  const { id } = await params;

  const client = new Client({
    baseUrl: process.env.FHIR_BASE_URL ?? "http://localhost:8080/fhir",
  });

  let displayName = id;
  try {
    const patient = PatientSchema.parse(await client.read({ resourceType: "Patient", id }));
    displayName = getPatientDisplayName(patient);
  } catch {
    // non-fatal — still render the order entry page
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Patient banner */}
      <div className="bg-blue-900 text-white px-6 py-3 flex items-center gap-6 text-sm">
        <span className="font-semibold text-base">{displayName}</span>
        <span className="text-blue-300">FHIR ID: {id}</span>
      </div>

      <OrderEntryClient patientId={id} />
    </div>
  );
}
