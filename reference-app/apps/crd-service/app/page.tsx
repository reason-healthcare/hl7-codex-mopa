import { ServiceIntro } from "@mopa/ui";
import { buildDiscoveryResponse } from "../src/crd-logic";

export default function Home() {
  const { services } = buildDiscoveryResponse();

  return (
    <>
      <ServiceIntro
        title="CRD Service"
        description="Coverage Requirements Discovery. Evaluates oncology chemotherapy orders against payer policy via standard CDS Hooks. Uses fhirAuthorization to query the EHR FHIR server directly for oncology patient context."
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
                {" — standard CDS Hooks discovery. The CRD service queries the EHR FHIR server "}
                directly via fhirAuthorization for oncology patient context. No prefetch
                configuration required from the EHR.
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
                {services.map((s) => (
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

            {/* Description */}
            <div className="px-5 py-3">
              <p className="text-slate-400 mb-1">Service description</p>
              <p className="text-slate-600">{services[0]?.description}</p>
            </div>

            {/* FHIR queries */}
            <div className="px-5 py-3">
              <p className="text-slate-400 mb-2">FHIR queries issued via fhirAuthorization</p>
              <div className="space-y-1 bg-slate-50 border border-slate-100 rounded px-2.5 py-2">
                <div className="space-y-0.5">
                  <code className="font-mono text-slate-500">conditions</code>
                  <code className="font-mono text-slate-400 break-all block pl-3">
                    Condition?patient=...&category=problem-list-item
                  </code>
                </div>
                <div className="space-y-0.5">
                  <code className="font-mono text-slate-500">her2</code>
                  <code className="font-mono text-slate-400 break-all block pl-3">
                    Observation?patient=...&code=LOINC|85319-2,SNOMED|431396003
                  </code>
                </div>
                <div className="space-y-0.5">
                  <code className="font-mono text-slate-500">cancerStage</code>
                  <code className="font-mono text-slate-400 break-all block pl-3">
                    Observation?patient=...&code=LOINC|21908-9
                  </code>
                </div>
                <div className="space-y-0.5">
                  <code className="font-mono text-slate-500">ecogPs</code>
                  <code className="font-mono text-slate-400 break-all block pl-3">
                    Observation?patient=...&code=LOINC|89247-1
                  </code>
                </div>
                <div className="space-y-0.5">
                  <code className="font-mono text-slate-500">priorTherapy</code>
                  <code className="font-mono text-slate-400 break-all block pl-3">
                    MedicationRequest?patient=...&status=completed,stopped
                  </code>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
