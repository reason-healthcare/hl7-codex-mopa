import { ServiceIntro } from "@ogca/ui";

const ENDPOINTS = [
  { method: "POST", path: "/api/fhir/$submit", desc: "PA bundle submission" },
  { method: "GET", path: "/api/fhir/$submit", desc: "Schema reference" },
];

export default function Home() {
  return (
    <>
      <ServiceIntro
        title="PAS Service"
        description="Prior Authorization Support. Receives PA submission bundles from the EHR, routes them to the payer rules engine for policy evaluation, and returns a FHIR ClaimResponse with an approval, pend, or denial determination."
        apiDocsHref="/docs"
      />

      <main className="w-full max-w-5xl mx-auto px-6 py-8">
        <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-slate-100 text-sm">
            <div className="px-5 py-5 space-y-1.5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Role in workflow
              </p>
              <p className="text-slate-600 leading-relaxed">
                Called by the EHR after a clinician signs an order flagged PA-required by the CRD
                Service. Translates the order into a $submit bundle and returns the payer
                determination.
              </p>
            </div>
            <div className="px-5 py-5 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Key endpoints
              </p>
              {ENDPOINTS.map((e) => (
                <div key={e.path + e.method} className="space-y-0.5">
                  <div className="flex items-baseline gap-2 font-mono text-xs">
                    <span className="text-slate-400 w-9 flex-shrink-0">{e.method}</span>
                    <span className="text-slate-700">{e.path}</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-11">{e.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
