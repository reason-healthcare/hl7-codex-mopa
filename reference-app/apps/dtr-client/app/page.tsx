import { cookies } from "next/headers";
import { ServiceIntro } from "@mopa/ui";
import {
  verifyToken,
  isAuthBypassed,
  patientFromBypassToken,
  TOKEN_COOKIE,
} from "@mopa/smart-auth";
import { buildQuestionnaire } from "../lib/questionnaire-gen";
import QuestionnaireForm from "./QuestionnaireForm";
import { EHR_BASE_URL } from "../lib/smart-config";

interface PageProps {
  searchParams: Promise<{
    appContext?: string;
    returnRegimen?: string;
  }>;
}

export default async function DtrClientHome({ searchParams }: PageProps) {
  const { appContext: rawAppContext, returnRegimen } = await searchParams;
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(TOKEN_COOKIE)?.value;

  // No launch context: show service landing instead of an auth error
  if (!rawToken) {
    return (
      <>
        <ServiceIntro
          title="DTR Client"
          description="Documentation Requirements Tool. Collects missing clinical data elements required for prior authorization via a generated FHIR Questionnaire. Requires a SMART EHR launch triggered by a DTR guidance card from the CRD Service."
        />
        <main className="w-full max-w-2xl mx-auto px-6 py-8">
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Documentation Requirements Tool
              </p>
              <div className="flex items-baseline gap-2">
                <h1 className="text-base font-semibold text-slate-900">DTR Client</h1>
                <span className="font-mono text-xs text-slate-400">:4004</span>
              </div>
            </div>
            <div className="px-5 py-5 space-y-5 text-sm text-slate-600">
              <p className="leading-relaxed">
                Collects missing clinical data required for prior authorization. Generates a FHIR
                Questionnaire from the PA data requirements library, accepts clinician responses,
                and writes completed Observations back to the EHR.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-1">
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Role in workflow
                  </p>
                  <p className="leading-relaxed">
                    Triggered by a DTR launch card returned by the CRD Service when required
                    clinical data is absent. Launched via SMART App launch from the EHR with an
                    appContext payload.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    How to launch
                  </p>
                  <p className="leading-relaxed">
                    Open a patient chart in the EHR, enter an order, and follow the &ldquo;Launch
                    Documentation Requirements Tool&rdquo; link from the CRD guidance card.
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

  // ------------------------------------------------------------------
  // Auth
  // ------------------------------------------------------------------
  let patientId: string | undefined;
  let authError: string | null = null;

  if (isAuthBypassed() && rawToken) {
    patientId = patientFromBypassToken(rawToken);
  } else if (!isAuthBypassed() && rawToken) {
    try {
      const claims = await verifyToken(rawToken);
      patientId = claims.patient as string | undefined;
    } catch {
      authError = "Token invalid or expired. Please re-launch from the EHR.";
    }
  } else {
    authError = "Not authenticated. Please launch from the EHR.";
  }

  // ------------------------------------------------------------------
  // App context
  // ------------------------------------------------------------------
  let parsedContext: { missingDataElements?: string[] } | null = null;
  if (rawAppContext) {
    try {
      parsedContext = JSON.parse(decodeURIComponent(rawAppContext));
    } catch {
      parsedContext = null;
    }
  }

  const missingKeys = parsedContext?.missingDataElements ?? [];
  const questionnaire = buildQuestionnaire(missingKeys);

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  return (
    <>
      <ServiceIntro
        title="DTR Client"
        description="Documentation Requirements Tool. Collects missing clinical data elements required for prior authorization and writes completed Observations back to the EHR."
      />
      <main className="w-full max-w-2xl mx-auto px-6 py-8 space-y-6">
        {authError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {authError}
          </div>
        ) : (
          <>
            {/* Launch context summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Launch Context
              </h2>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-slate-500">Patient ID</dt>
                  <dd className="font-mono text-xs text-slate-700">{patientId ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Auth Mode</dt>
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

            {/* Questionnaire */}
            {questionnaire.items.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
                <strong>All required data is present.</strong> No additional documentation needed.
                Return to the EHR to proceed with the order.
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-4">
                <div>
                  <h2 className="text-sm font-medium text-slate-800">
                    Missing Documentation Required
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Please provide the following clinical information to complete prior
                    authorization evaluation.
                  </p>
                </div>
                {patientId ? (
                  <QuestionnaireForm
                    questionnaire={questionnaire}
                    patientId={patientId}
                    ehrBaseUrl={EHR_BASE_URL}
                    returnRegimen={returnRegimen ?? null}
                  />
                ) : (
                  <p className="text-sm text-slate-500 italic">Patient context unavailable.</p>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
