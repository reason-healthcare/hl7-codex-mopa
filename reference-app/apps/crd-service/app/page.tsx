import { BASELINE_PREFETCH_TEMPLATES } from "@ogca/knowledge-artifacts";
import { ServiceIntro } from "@ogca/ui";
import { buildDiscoveryResponse } from "../src/crd-logic";

export default function Home() {
  const { services } = buildDiscoveryResponse();

  type Svc = (typeof services)[number] & {
    extension?: {
      "ogca-service-extension"?: {
        catalogUrl?: string;
        conditionDataRequirements?: Array<{
          condition: { code: string; system: string; display: string };
          libraryUrl: string;
          prefetchTemplates: Record<string, string>;
        }>;
      };
    };
  };
  const typed = services as Svc[];
  const ext = typed[0]?.extension?.["ogca-service-extension"];

  const shortSys = (s: string) =>
    s.includes("snomed")
      ? "SNOMED CT"
      : s.includes("loinc")
        ? "LOINC"
        : (s.split("/").filter(Boolean).pop() ?? s);

  const ACCENTS = [
    {
      hdr: "bg-blue-50 border-blue-200",
      label: "text-blue-700",
      badge: "bg-blue-100 text-blue-700",
    },
    {
      hdr: "bg-teal-50 border-teal-200",
      label: "text-teal-700",
      badge: "bg-teal-100 text-teal-700",
    },
    {
      hdr: "bg-violet-50 border-violet-200",
      label: "text-violet-700",
      badge: "bg-violet-100 text-violet-700",
    },
  ];

  return (
    <>
      <ServiceIntro
        title="CRD Service"
        description="Coverage Requirements Discovery. Evaluates oncology chemotherapy orders against payer policy via CDS Hooks and returns coverage guidance — pre-authorized, PA required, or DTR required."
        apiDocsHref="/docs"
      />
      <main className="w-full max-w-5xl mx-auto px-6 py-8">
        <section className="border border-slate-200 rounded overflow-hidden">
          {/* Header */}
          <div className="bg-slate-800 px-5 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-100 uppercase tracking-wide">
                CDS Service Registration
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                <code className="font-mono text-slate-300">GET /api/cds-services</code>
                {
                  " — one entry per hook. The OGCA extension publishes condition-specific data requirements "
                }
                so aware EHRs can send proactive prefetch; standard EHRs trigger CRD fhirServer
                fallback.
              </p>
            </div>
            <a
              href="/api/cds-services"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 flex-shrink-0 ml-5 font-mono"
            >
              /api/cds-services ↗
            </a>
          </div>

          <div className="divide-y divide-slate-100 text-xs bg-white">
            {/* Registered hooks */}
            <div className="px-5 py-3">
              <p className="text-slate-400 mb-2">Registered hooks</p>
              <div className="flex flex-wrap gap-2">
                {typed.map((s) => (
                  <div
                    key={s.id}
                    className="inline-flex items-center gap-1.5 border border-slate-200 rounded px-2.5 py-1 bg-slate-50"
                  >
                    <code className="font-mono text-slate-700">{s.id}</code>
                    <span className="text-slate-300">·</span>
                    <span className="font-mono text-slate-500">{s.hook}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Baseline prefetch */}
            <div className="px-5 py-3">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-slate-400">Baseline prefetch</p>
                <span className="bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">
                  Standard CDS Hooks
                </span>
              </div>
              <div className="space-y-1 bg-slate-50 border border-slate-100 rounded px-2.5 py-2">
                {Object.entries(BASELINE_PREFETCH_TEMPLATES).map(([key, query]) => (
                  <div key={key} className="space-y-0.5">
                    <code className="font-mono text-slate-500">{key}</code>
                    <code className="font-mono text-slate-400 break-all block pl-3">{query}</code>
                  </div>
                ))}
              </div>
            </div>

            {/* OGCA extension */}
            <div className="px-5 py-4 space-y-4">
              <div className="flex items-center gap-2">
                <p className="text-slate-400">Extension</p>
                <code className="font-mono text-slate-600">ogca-service-extension</code>
                <span className="bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded">
                  OGCA
                </span>
              </div>

              <div className="ml-4">
                <p className="text-slate-400 mb-0.5">catalogUrl</p>
                <code className="font-mono text-slate-600 break-all">{ext?.catalogUrl}</code>
              </div>

              <div className="ml-4">
                <p className="text-slate-400 mb-2">conditionDataRequirements</p>
                <div
                  className={`grid gap-3 ${(ext?.conditionDataRequirements?.length ?? 0) > 1 ? "grid-cols-2" : "grid-cols-1"}`}
                >
                  {(ext?.conditionDataRequirements ?? []).map((entry, idx) => {
                    // biome-ignore lint/style/noNonNullAssertion: ACCENTS length is fixed above
                    const ac = ACCENTS[idx % ACCENTS.length]!;
                    return (
                      <div
                        key={entry.condition.code}
                        className="border border-slate-200 rounded overflow-hidden"
                      >
                        <div
                          className={`border-b px-3 py-2 flex items-start justify-between gap-2 ${ac.hdr}`}
                        >
                          <div>
                            <p className={`font-semibold ${ac.label}`}>{entry.condition.display}</p>
                            <p className="text-slate-400 mt-0.5">
                              {shortSys(entry.condition.system)}
                            </p>
                          </div>
                          <span
                            className={`flex-shrink-0 font-mono text-xs px-1.5 py-0.5 rounded ${ac.badge}`}
                          >
                            {entry.condition.code}
                          </span>
                        </div>
                        <div className="px-3 py-2.5 space-y-2.5 bg-white">
                          <div>
                            <p className="text-slate-400 mb-0.5">libraryUrl</p>
                            <code className="font-mono text-slate-600 break-all leading-relaxed">
                              {entry.libraryUrl}
                            </code>
                          </div>
                          <div>
                            <p className="text-slate-400 mb-1">prefetchTemplates</p>
                            <div className="space-y-1 bg-slate-50 border border-slate-100 rounded px-2 py-1.5">
                              {Object.entries(entry.prefetchTemplates).map(([key, query]) => (
                                <div key={key} className="space-y-0.5">
                                  <code className="font-mono text-slate-500">{key}</code>
                                  <code className="font-mono text-slate-400 break-all block pl-3">
                                    {query}
                                  </code>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
