import { cookies } from "next/headers";
import { Client, PatientSchema } from "@ogca/fhir-client";
import { verifyToken, isAuthBypassed, bypassToken, TOKEN_COOKIE } from "@ogca/smart-auth";
import {
  fetchLibrary,
  runGapAnalysis,
  flattenResources,
  REQUIRED_KEYS,
} from "../lib/data-fetching";
import type { GapResult } from "../lib/data-fetching";
import { evaluateGuideline } from "../lib/guideline";
import { EHR_BASE_URL } from "../lib/smart-config";
import HER2InputForm from "./HER2InputForm";
import RegimenOptions from "./RegimenOptions";

const EHR_FHIR_BASE = process.env.EHR_FHIR_BASE_URL ?? "http://localhost:4000/api/fhir";

// ---------------------------------------------------------------------------
// Indicator badge colours
// ---------------------------------------------------------------------------

function StatusBadge({ present }: { present: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
        present ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${present ? "bg-green-500" : "bg-amber-500"}`} />
      {present ? "Present" : "Missing"}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SmartAppHome() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(TOKEN_COOKIE)?.value;

  let patientId: string | undefined;
  let bearerToken: string;
  let authError: string | null = null;

  if (isAuthBypassed()) {
    const bypass = bypassToken();
    patientId = bypass.patient;
    bearerToken = bypass.access_token;
  } else if (rawToken) {
    try {
      const claims = await verifyToken(rawToken);
      patientId = claims.patient as string | undefined;
      bearerToken = rawToken;
    } catch {
      authError = "Token invalid or expired. Please re-launch from the EHR.";
      bearerToken = "";
    }
  } else {
    authError = "Not authenticated. Launch this app from the EHR patient chart.";
    bearerToken = "";
  }

  // Fetch patient name
  let patientName = patientId ?? "Unknown";
  if (patientId && bearerToken) {
    try {
      const fhirClient = new Client({ baseUrl: EHR_FHIR_BASE, bearerToken });
      const patient = PatientSchema.parse(
        await fhirClient.read({ resourceType: "Patient", id: patientId })
      );
      const name = patient.name?.[0];
      patientName = name
        ? [name.given?.join(" "), name.family].filter(Boolean).join(" ")
        : patientId;
    } catch {
      // non-fatal
    }
  }

  // Fetch Library + run gap analysis + evaluate guideline
  let gaps: GapResult[] = [];
  let allRequiredPresent = false;
  let guideline: Awaited<ReturnType<typeof evaluateGuideline>> | null = null;
  let libraryTitle = "Breast Cancer PA Data Requirements";

  if (patientId && bearerToken) {
    const [library] = await Promise.all([fetchLibrary()]);
    if (library) libraryTitle = library.url.split("/").pop() ?? libraryTitle;

    gaps = await runGapAnalysis(patientId, EHR_FHIR_BASE, bearerToken);
    allRequiredPresent = REQUIRED_KEYS.every((k) => gaps.find((g) => g.key === k)?.present);

    if (allRequiredPresent) {
      const resources = flattenResources(gaps);
      guideline = await evaluateGuideline(patientId, resources);
    }
  }

  // Show only data elements relevant to gap analysis (not patient/conditions)
  const displayedGaps = gaps.filter((g) => REQUIRED_KEYS.includes(g.key));
  const her2Gap = gaps.find((g) => g.key === "her2");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-green-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="font-bold text-lg tracking-tight">OGCA CDS SMART App</div>
        <span className="text-green-300 text-sm">Layer 1 — Gap Analysis & Regimen Options</span>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {authError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {authError}
          </div>
        ) : (
          <>
            {/* Patient banner */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{patientName}</p>
                <p className="text-xs text-gray-500 font-mono">{patientId}</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  isAuthBypassed() ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                }`}
              >
                {isAuthBypassed() ? "Bypass" : "SMART OAuth ✓"}
              </span>
            </div>

            {/* Gap Analysis */}
            <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
                Gap Analysis
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Library: <span className="font-mono">{libraryTitle}</span>
              </p>

              {displayedGaps.length === 0 ? (
                <p className="text-sm text-gray-500 italic">Loading…</p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-3 py-2 text-xs font-medium text-gray-500">Data Element</th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedGaps.map((gap) => (
                      <tr key={gap.key} className="border-t border-gray-100">
                        <td className="px-3 py-2 font-medium text-gray-800">{gap.label}</td>
                        <td className="px-3 py-2">
                          <StatusBadge present={gap.present} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* HER2 input form — shown when HER2 is missing */}
              {her2Gap && !her2Gap.present && patientId && (
                <HER2InputForm patientId={patientId} gap={her2Gap} />
              )}
            </section>

            {/* Regimen Options — shown when all required data present */}
            {allRequiredPresent && guideline && (
              <section className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
                  Regimen Options
                </h2>
                <p className="text-xs text-gray-500 mb-4">
                  Based on BreastCancerGuideline CQL evaluation
                </p>
                <RegimenOptions
                  regimens={guideline.regimens}
                  patientId={patientId ?? ""}
                  ehrBaseUrl={EHR_BASE_URL}
                />
              </section>
            )}

            {/* All data present but no regimens computed yet */}
            {!allRequiredPresent && displayedGaps.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                <strong>Action required:</strong> Enter the missing data element(s) above to unlock
                regimen options.
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
