import { cookies } from "next/headers";
import { Client, PatientSchema } from "@mopa/fhir-client";
import { log } from "@mopa/logger";
import { ServiceIntro } from "@mopa/ui";
import {
  verifyToken,
  isAuthBypassed,
  patientFromBypassToken,
  TOKEN_COOKIE,
} from "@mopa/smart-auth";
import {
  fetchLibrary,
  runGapAnalysis,
  flattenResources,
  REQUIRED_KEYS,
} from "../lib/data-fetching";
import type { GapResult } from "../lib/data-fetching";
import { evaluateGuideline } from "../lib/guideline";
import type { Regimen } from "../lib/guideline";
import HER2InputForm from "./HER2InputForm";
import RegimenOptions from "./RegimenOptions";

import WhatIfPanel from "./WhatIfPanel";

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

export default async function SmartAppHome({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode: modeParam } = await searchParams;
  const mode: "mopa" | "readonly" = modeParam === "readonly" ? "readonly" : "mopa";
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(TOKEN_COOKIE)?.value;

  // No launch context: show service landing instead of an auth error
  if (!rawToken) {
    return (
      <>
        <ServiceIntro
          title="CDS SMART App"
          description="Layer 1 guideline-based CDS. Performs gap analysis against the BreastCancerGuideline CQL library and surfaces evidence-based chemotherapy regimen recommendations. Requires a SMART EHR launch from a patient chart."
        />
        <main className="w-full max-w-2xl mx-auto px-6 py-8">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-slate-100">
              <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">
                Layer 1 &mdash; Guideline Authority
              </p>
              <div className="flex items-baseline gap-2">
                <h1 className="text-base font-semibold text-slate-900">CDS SMART App</h1>
                <span className="font-mono text-xs text-slate-400">:4002</span>
              </div>
            </div>
            <div className="px-5 py-5 space-y-5 text-sm text-slate-600">
              <p className="leading-relaxed">
                Guideline-based clinical decision support for oncology order entry. Runs gap
                analysis against the BreastCancerGuideline CQL library and returns evidence-based
                chemotherapy regimen recommendations.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-1">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Role in workflow
                  </p>
                  <p className="leading-relaxed">
                    Launched via SMART App launch from the EHR patient chart. Receives patient
                    context and a bearer token, then evaluates clinical data requirements and
                    returns regimen options when all gaps are met.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    How to launch
                  </p>
                  <p className="leading-relaxed">
                    Open a patient chart in the EHR and select &ldquo;Launch CDS App&rdquo; from the
                    chart actions. The EHR provides patient context automatically.
                  </p>
                  <a
                    href="http://localhost:4001"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors mt-1"
                  >
                    Go to EHR →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  let patientId: string | undefined;
  let bearerToken: string;
  let authError: string | null = null;

  if (isAuthBypassed() && rawToken) {
    patientId = patientFromBypassToken(rawToken);
    bearerToken = rawToken;
  } else if (!isAuthBypassed() && rawToken) {
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
  let guideline: Regimen[] | null = null;
  let libraryTitle = "Breast Cancer PA Data Requirements";

  if (patientId && bearerToken) {
    const correlationId = `smart-${crypto.randomUUID().slice(0, 8)}`;
    const [library] = await Promise.all([fetchLibrary(correlationId)]);
    if (library) libraryTitle = library.url.split("/").pop() ?? libraryTitle;

    gaps = await runGapAnalysis(patientId, EHR_FHIR_BASE, bearerToken, correlationId);
    allRequiredPresent = REQUIRED_KEYS.every((k) => gaps.find((g) => g.key === k)?.present);

    const missingKeys = gaps
      .filter((g) => REQUIRED_KEYS.includes(g.key) && !g.present)
      .map((g) => g.key);
    if (allRequiredPresent) {
      const resources = flattenResources(gaps);
      guideline = await evaluateGuideline(patientId, resources);
    }

    log({
      service: "smart",
      level: "info",
      type: "cds.response",
      correlationId,
      patientId,
      missingElements: missingKeys,
      outcome: allRequiredPresent ? "all-data-present" : "gaps-found",
      response: {
        gaps: gaps
          .filter((g) => REQUIRED_KEYS.includes(g.key))
          .map((g) => ({ key: g.key, present: g.present })),
        regimens: guideline?.map((r) => r.id) ?? [],
      },
      summary: allRequiredPresent
        ? `Gap analysis: all data present — ${guideline?.length ?? 0} regimen(s) indicated`
        : `Gap analysis: missing ${missingKeys.join(", ")}`,
    });
  }

  // Show only data elements relevant to gap analysis (not patient/conditions)
  const displayedGaps = gaps.filter((g) => REQUIRED_KEYS.includes(g.key));
  const her2Gap = gaps.find((g) => g.key === "her2");

  return (
    <>
      <ServiceIntro
        title="CDS SMART App"
        description="Layer 1 guideline-based CDS. Gap analysis against the BreastCancerGuideline CQL library and evidence-based regimen recommendations for the ordering clinician."
      />
      <main className="w-full max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Mode badge */}
        <div className="flex items-center justify-end gap-2">
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium ${
              mode === "mopa"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            {mode === "mopa" ? "MOPA-aware" : "Read-only"}
          </span>
          <a
            href={mode === "mopa" ? "?mode=readonly" : "?mode=mopa"}
            className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            Switch to {mode === "mopa" ? "read-only" : "MOPA-aware"}
          </a>
        </div>
        {authError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {authError}
          </div>
        ) : (
          <>
            {/* Patient banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">{patientName}</p>
                <p className="text-xs text-slate-500 font-mono">{patientId}</p>
              </div>
              {!isAuthBypassed() && (
                <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-700">
                  SMART OAuth ✓
                </span>
              )}
            </div>

            {/* Gap Analysis */}
            <section className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Gap Analysis
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Library: <span className="font-mono">{libraryTitle}</span>
              </p>

              {displayedGaps.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Loading…</p>
              ) : (
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-left">
                      <th className="px-3 py-2 text-xs font-medium text-slate-500">Data Element</th>
                      <th className="px-3 py-2 text-xs font-medium text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedGaps.map((gap) => (
                      <tr key={gap.key} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-medium text-slate-800">{gap.label}</td>
                        <td className="px-3 py-2">
                          <StatusBadge present={gap.present} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* HER2 input form (MOPA-aware) or what-if panel (read-only) */}
              {mode === "mopa"
                ? her2Gap &&
                  !her2Gap.present &&
                  patientId && <HER2InputForm patientId={patientId} gap={her2Gap} />
                : patientId && <WhatIfPanel patientId={patientId} />}
            </section>

            {/* Guideline-Indicated Regimens — shown when all required data present */}
            {allRequiredPresent && guideline && (
              <section className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Guideline-Indicated Regimens
                </h2>
                <p className="text-xs text-slate-500 mb-4">
                  Based on BreastCancerGuideline CQL evaluation
                </p>
                <RegimenOptions regimens={guideline} />
              </section>
            )}

            {/* Data gaps prevent guideline evaluation */}
            {!allRequiredPresent && displayedGaps.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                <strong>Missing data:</strong> Complete the data elements above to see which regimens are indicated by the guideline.
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
