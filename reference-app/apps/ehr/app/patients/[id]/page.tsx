import {
  Client,
  PatientSchema,
  BundleSchema,
  ConditionSchema,
  ObservationSchema,
  getPatientDisplayName,
} from "@ogca/fhir-client";
import type { Condition, Observation, Patient } from "@ogca/fhir-client";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

function getFhirClient() {
  return new Client({
    baseUrl: process.env.FHIR_BASE_URL ?? "http://localhost:8080/fhir",
  });
}

const SYS_ICD10 = "http://hl7.org/fhir/sid/icd-10-cm";
const SYS_SNOMED = "http://snomed.info/sct";
const SYS_LOINC = "http://loinc.org";

type Coding = { system?: string; code?: string; display?: string };

/**
 * Return the first coding whose system matches one of the given systems,
 * checked in priority order. Falls back to the first coding if none match.
 */
function pickCoding(codings: Coding[] | undefined, ...priority: string[]): Coding | undefined {
  if (!codings?.length) return undefined;
  for (const sys of priority) {
    const match = codings.find((c) => c.system === sys);
    if (match) return match;
  }
  return codings[0];
}

/** Display name for a Condition — ICD-10-CM preferred, SNOMED fallback. */
function conditionDisplay(cond: Condition): string {
  const c = pickCoding(cond.code?.coding, SYS_ICD10, SYS_SNOMED);
  return c?.display ?? cond.code?.text ?? "Unknown";
}

/** Display name for an Observation — LOINC preferred, SNOMED fallback. */
function obsDisplay(obs: Observation): string {
  const c = pickCoding(obs.code?.coding, SYS_LOINC, SYS_SNOMED);
  return c?.display ?? obs.code?.text ?? "Unknown";
}

function formatObsValue(obs: Observation): string {
  if (obs.valueCodeableConcept) {
    const c = pickCoding(obs.valueCodeableConcept.coding, SYS_SNOMED, SYS_LOINC);
    return c?.display ?? c?.code ?? obs.valueCodeableConcept.text ?? "—";
  }
  if (obs.valueQuantity) {
    return `${obs.valueQuantity.value ?? ""} ${obs.valueQuantity.unit ?? ""}`.trim();
  }
  if (obs.valueInteger !== undefined) return String(obs.valueInteger);
  if (obs.valueString) return obs.valueString;
  return "—";
}

/** Shorten a FHIR system URL to a human-readable label. */
function shortSystem(system: string | undefined): string {
  if (!system) return "";
  if (system === SYS_ICD10) return "ICD-10-CM";
  if (system.includes("icd-10")) return "ICD-10";
  if (system.includes("icd")) return "ICD";
  if (system.includes("loinc")) return "LOINC";
  if (system.includes("snomed")) return "SNOMED CT";
  if (system.includes("unitsofmeasure")) return "UCUM";
  if (system.includes("rxnorm")) return "RxNorm";
  return system.split("/").filter(Boolean).pop() ?? system;
}

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
      <div className="flex items-center justify-center py-20">
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
    <main className="w-full max-w-5xl mx-auto px-6 py-8 space-y-8">
      {/* Back link */}
      <Link href="/" className="text-xs text-slate-500 hover:text-slate-700 transition-colors">
        ← Patient List
      </Link>

      {/* Patient banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg px-5 py-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-base font-semibold text-slate-900">{displayName}</h1>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
            {patient.birthDate && <span>DOB: {patient.birthDate}</span>}
            {patient.gender && <span className="capitalize">Sex: {patient.gender}</span>}
            <span className="font-mono text-slate-400">ID: {patient.id}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href={`/patients/${patient.id}/orders`}
            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded font-medium transition-colors text-white"
          >
            Order Entry →
          </Link>
          <a
            href={(() => {
              const u = new URL("http://localhost:4002/launch");
              u.searchParams.set(
                "iss",
                `${process.env.NEXT_PUBLIC_EHR_BASE_URL ?? "http://localhost:4001"}/api/fhir`
              );
              u.searchParams.set("launch", `patient/${patient.id}`);
              return u.toString();
            })()}
            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded font-medium transition-colors text-white"
            target="_blank"
            rel="noreferrer"
          >
            Launch CDS App ↗
          </a>
        </div>
      </div>
      {/* Demographics */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-4">
          Demographics
        </h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-slate-500">Full Name</dt>
            <dd className="font-medium">{displayName}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Date of Birth</dt>
            <dd className="font-medium">{patient.birthDate ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Gender</dt>
            <dd className="font-medium capitalize">{patient.gender ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-500">FHIR ID</dt>
            <dd className="font-mono text-xs text-slate-500">{patient.id}</dd>
          </div>
          {patient.identifier?.map((ident) => (
            <div key={ident.value ?? ident.system ?? ident.use ?? "id"}>
              <dt className="text-slate-500">
                {ident.type?.coding?.[0]?.code ?? ident.system ?? "Identifier"}
              </dt>
              <dd className="font-medium">{ident.value ?? "—"}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Problem List */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-4">
          Problem List
        </h2>
        {conditions.length === 0 ? (
          <p className="text-slate-400 text-sm italic">No conditions recorded.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-3 py-2 font-medium text-slate-600">Condition</th>
                <th className="px-3 py-2 font-medium text-slate-600">Status</th>
                <th className="px-3 py-2 font-medium text-slate-600">Onset</th>
              </tr>
            </thead>
            <tbody>
              {conditions.map((cond) => {
                const codeCoding = pickCoding(cond.code?.coding, SYS_ICD10, SYS_SNOMED);
                return (
                  <tr key={cond.id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-3 py-2">
                      {conditionDisplay(cond)}
                      {codeCoding?.code && (
                        <div className="text-xs text-slate-400 mt-0.5 font-mono">
                          {codeCoding.code}
                          {codeCoding.system && (
                            <span className="font-sans"> · {shortSystem(codeCoding.system)}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 capitalize">
                      {cond.clinicalStatus?.coding?.[0]?.code ?? "—"}
                    </td>
                    <td className="px-3 py-2">{cond.onsetDateTime?.slice(0, 10) ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* Observations */}
      <section>
        <h2 className="text-sm font-semibold text-slate-700 border-b border-slate-200 pb-2 mb-4">
          Observations
        </h2>
        {observations.length === 0 ? (
          <p className="text-slate-400 text-sm italic">No observations recorded.</p>
        ) : (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-3 py-2 font-medium text-slate-600">Observation</th>
                <th className="px-3 py-2 font-medium text-slate-600">Value</th>
                <th className="px-3 py-2 font-medium text-slate-600">Status</th>
                <th className="px-3 py-2 font-medium text-slate-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {observations.map((obs) => {
                const obsCoding = pickCoding(obs.code?.coding, SYS_LOINC, SYS_SNOMED);
                const valCoding = obs.valueCodeableConcept?.coding?.[0];
                const valQty = obs.valueQuantity;
                return (
                  <tr key={obs.id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-3 py-2">
                      {obsDisplay(obs)}
                      {obsCoding?.code && (
                        <div className="text-xs text-slate-400 mt-0.5 font-mono">
                          {obsCoding.code}
                          {obsCoding.system && (
                            <span className="font-sans"> · {shortSystem(obsCoding.system)}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {formatObsValue(obs)}
                      {valCoding?.code && (
                        <div className="text-xs text-slate-400 mt-0.5 font-mono">
                          {valCoding.code}
                          {valCoding.system && (
                            <span className="font-sans"> · {shortSystem(valCoding.system)}</span>
                          )}
                        </div>
                      )}
                      {!valCoding && valQty?.code && (
                        <div className="text-xs text-slate-400 mt-0.5 font-mono">
                          {valQty.code}
                          {valQty.system && (
                            <span className="font-sans"> · {shortSystem(valQty.system)}</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 capitalize">{obs.status ?? "—"}</td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {obs.effectiveDateTime?.slice(0, 10) ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
