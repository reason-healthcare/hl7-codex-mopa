import { ServiceIntro } from "@ogca/ui";

const ENDPOINTS = [
  { method: "POST", path: "/api/evaluate", desc: "CQL policy evaluation" },
  { method: "GET", path: "/api/evaluate", desc: "Schema reference" },
];

export default function Home() {
  return (
    <>
      <ServiceIntro
        title="Payer Backend"
        description="Rules engine for payer policy evaluation. Fetches patient clinical data from the EHR FHIR proxy, evaluates BreastCancerPayerPolicy CQL, and returns a prior authorization determination. Backing service — not part of the OGCA specification."
        apiDocsHref="/docs"
      />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-slate-100 text-sm">
            <div className="px-5 py-5 space-y-1.5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Role in workflow
              </p>
              <p className="text-slate-600 leading-relaxed">
                Called by the PAS Service. Stands in for a real payer rules engine in this reference
                implementation. Not an actor defined by the Da Vinci OGCA specification.
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
