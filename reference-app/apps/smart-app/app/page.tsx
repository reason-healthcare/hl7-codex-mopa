import { cookies } from "next/headers";
import { Client, PatientSchema } from "@ogca/fhir-client";
import { verifyToken, isAuthBypassed, bypassToken, TOKEN_COOKIE } from "@ogca/smart-auth";

const EHR_FHIR_BASE = process.env.EHR_FHIR_BASE_URL ?? "http://localhost:4000/api/fhir";

export default async function SmartAppHome() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(TOKEN_COOKIE)?.value;

  let patientId: string | undefined;
  let accessToken: string | undefined;
  let authError: string | null = null;

  if (isAuthBypassed()) {
    const bypass = bypassToken();
    patientId = bypass.patient;
    accessToken = bypass.access_token;
  } else if (rawToken) {
    try {
      const claims = await verifyToken(rawToken);
      patientId = claims.patient as string | undefined;
      accessToken = rawToken;
    } catch {
      authError = "Token invalid or expired. Please re-launch from the EHR.";
    }
  }

  // Fetch patient demographics with the scoped token
  let patientName = "Unknown";
  let patientDob = "—";
  if (patientId && accessToken) {
    try {
      const client = new Client({ baseUrl: EHR_FHIR_BASE, bearerToken: accessToken });
      const patient = PatientSchema.parse(
        await client.read({ resourceType: "Patient", id: patientId })
      );
      const name = patient.name?.[0];
      patientName = name
        ? [name.given?.join(" "), name.family].filter(Boolean).join(" ")
        : patientId;
      patientDob = patient.birthDate ?? "—";
    } catch (e) {
      patientName = `${patientId} (fetch failed: ${e instanceof Error ? e.message : "?"})`;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-green-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="font-bold text-lg tracking-tight">OGCA CDS SMART App</div>
        <span className="text-green-300 text-sm">Layer 1 — Gap Analysis</span>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        {authError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {authError}
            <div className="mt-2">
              <a
                href={`/launch?iss=${encodeURIComponent(
                  process.env.NEXT_PUBLIC_EHR_BASE_URL ?? "http://localhost:4000"
                )}`}
                className="underline"
              >
                Re-launch
              </a>
            </div>
          </div>
        ) : patientId ? (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Launch Context
              </h2>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-gray-500">Patient</dt>
                  <dd className="font-medium">{patientName}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Date of Birth</dt>
                  <dd className="font-medium">{patientDob}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Patient ID</dt>
                  <dd className="font-mono text-xs text-gray-600">{patientId}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Auth Mode</dt>
                  <dd className="font-medium">
                    {isAuthBypassed() ? (
                      <span className="text-yellow-700">Bypass (dev)</span>
                    ) : (
                      <span className="text-green-700">SMART OAuth ✓</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              <strong>Phase 4 status:</strong> SMART launch complete — patient context received and
              FHIR data fetched with scoped token. Gap analysis UI and CQL guideline evaluation
              coming in Phase 5.
            </div>
          </>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-5 text-sm text-gray-500">
            No launch context.{" "}
            <a
              href={`/launch?iss=${encodeURIComponent(
                process.env.NEXT_PUBLIC_EHR_BASE_URL ?? "http://localhost:4000"
              )}`}
              className="text-green-700 underline"
            >
              Launch from EHR
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
