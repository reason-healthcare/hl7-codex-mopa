import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-slate-800 text-slate-100 px-6 py-3 flex items-center justify-between text-sm">
        <div className="font-semibold">PAS Service</div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <a href="http://localhost:4000" className="hover:text-slate-200 transition-colors">
            ← Hub
          </a>
          <span className="text-slate-600">|</span>
          <Link href="/docs" className="hover:text-slate-200 transition-colors">
            API docs
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="px-5 pt-5 pb-4 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Prior Authorization Support
            </p>
            <div className="flex items-baseline gap-2">
              <h1 className="text-base font-semibold text-slate-900">PAS Service</h1>
              <span className="font-mono text-xs text-slate-400">:4005</span>
            </div>
          </div>

          <div className="px-5 py-5 space-y-5 text-sm text-slate-600">
            <p className="leading-relaxed">
              Receives prior authorization request bundles from the EHR, routes them to the payer
              rules engine for policy evaluation, and returns a FHIR ClaimResponse with an approval,
              pend, or denial determination.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-1">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Role in workflow
                </p>
                <p className="leading-relaxed">
                  Called by the EHR after a clinician signs an order flagged PA-required by the CRD
                  Service. Translates the order into a $submit bundle and returns the payer
                  determination.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  Key endpoints
                </p>
                {[
                  { method: "POST", path: "/api/fhir/$submit", desc: "PA bundle submission" },
                  { method: "GET", path: "/api/fhir/$submit", desc: "Schema reference" },
                ].map((e) => (
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
        </div>
      </main>
    </div>
  );
}
