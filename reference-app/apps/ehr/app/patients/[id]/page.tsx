import { FhirClient, PatientSchema, BundleSchema, getPatientDisplayName } from "@ogca/fhir-client";
import type { Condition, Observation } from "@ogca/fhir-client";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getFhirClient() {
  // Server-side: use internal FHIR base URL directly
  const base =
    process.env.FHIR_BASE_URL ?? "http://localhost:8080/fhir";
  return new FhirClient({ baseUrl: base });
}

function formatCode(resource: Condition | Observation): string {
  const coding = resource.code?.coding;
  if (coding && coding.length > 0) {
    return coding[0].display ?? coding[0].code ?? "Unknown";
  }
  return resource.code?.text ?? "Unknown";
}

function formatObsValue(obs: Observation): string {
  if (obs.valueCodeableConcept) {
    const c = obs.valueCodeableConcept.coding?.[0];
    return c?.display ?? c?.code ?? obs.valueCodeableConcept.text ?? "—";
  }
  if (obs.valueQuantity) {
    return `${obs.valueQuantity.value ?? ""} ${obs.valueQuantity.unit ?? ""}`.trim();
  }
  if (obs.valueString) return obs.valueString;
  return "—";
}

export default async function PatientChartPage({ params }: PageProps) {
  const { id } = await params;
  const client = await getFhirClient();

  let patient;
  let conditions: Condition[] = [];
  let observations: Observation[] = [];
  let error: string | null = null;

  try {
    patient = await client.read("Patient", id, PatientSchema);

    const condBundle = await client.search(
      "Condition",
      { patient: id },
      BundleSchema
    );
    conditions = (condBundle.entry ?? [])
      .map((e) => e.resource)
      .filter((r): r is Condition => r?.resourceType === "Condition");

    const obsBundle = await client.search(
      "Observation",
      { patient: id, _sort: "-date", _count: "50" },
      BundleSchema
    );
    observations = (obsBundle.entry ?? [])
      .map((e) => e.resource)
      .filter((r): r is Observation => r?.resourceType === "Observation");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load patient data";
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  const displayName = getPatientDisplayName(patient);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Patient banner */}
      <div className="bg-blue-900 text-white px-6 py-3 flex items-center gap-6 text-sm">
        <span className="font-semibold text-base">{displayName}</span>
        {patient.birthDate && <span>DOB: {patient.birthDate}</span>}
        {patient.gender && (
          <span className="capitalize">Sex: {patient.gender}</span>
        )}
        <span className="text-blue-300">FHIR ID: {patient.id}</span>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Demographics */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
            Demographics
          </h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Full Name</dt>
              <dd className="font-medium">{displayName}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Date of Birth</dt>
              <dd className="font-medium">{patient.birthDate ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Gender</dt>
              <dd className="font-medium capitalize">{patient.gender ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">FHIR ID</dt>
              <dd className="font-mono text-xs text-gray-600">{patient.id}</dd>
            </div>
            {patient.identifier?.map((id, i) => (
              <div key={i}>
                <dt className="text-gray-500">
                  {id.type?.coding?.[0]?.code ?? id.system ?? "Identifier"}
                </dt>
                <dd className="font-medium">{id.value ?? "—"}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Problem List */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
            Problem List
          </h2>
          {conditions.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No conditions recorded.</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-3 py-2 font-medium text-gray-600">Condition</th>
                  <th className="px-3 py-2 font-medium text-gray-600">Code</th>
                  <th className="px-3 py-2 font-medium text-gray-600">Status</th>
                  <th className="px-3 py-2 font-medium text-gray-600">Onset</th>
                </tr>
              </thead>
              <tbody>
                {conditions.map((cond, i) => (
                  <tr
                    key={cond.id ?? i}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-3 py-2">{formatCode(cond)}</td>
                    <td className="px-3 py-2 font-mono text-xs text-gray-500">
                      {cond.code?.coding?.[0]?.code ?? "—"}
                    </td>
                    <td className="px-3 py-2 capitalize">
                      {cond.clinicalStatus?.coding?.[0]?.code ?? "—"}
                    </td>
                    <td className="px-3 py-2">
                      {(cond as any).onsetDateTime?.slice(0, 10) ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Observations */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">
            Observations
          </h2>
          {observations.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No observations recorded.</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-3 py-2 font-medium text-gray-600">Observation</th>
                  <th className="px-3 py-2 font-medium text-gray-600">Value</th>
                  <th className="px-3 py-2 font-medium text-gray-600">Date</th>
                  <th className="px-3 py-2 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {observations.map((obs, i) => (
                  <tr
                    key={obs.id ?? i}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-3 py-2">{formatCode(obs)}</td>
                    <td className="px-3 py-2">{formatObsValue(obs)}</td>
                    <td className="px-3 py-2">
                      {obs.effectiveDateTime?.slice(0, 10) ?? "—"}
                    </td>
                    <td className="px-3 py-2 capitalize">{obs.status ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
