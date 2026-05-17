import Link from "next/link";

// Jane Smith's fixture patient ID — set by the load-fixtures script
const JANE_SMITH_ID = process.env.JANE_SMITH_PATIENT_ID ?? "jane-smith";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <nav className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="font-bold text-lg tracking-tight">OGCA Reference EHR</div>
        <span className="text-blue-300 text-sm">SMART_AUTH_BYPASS=true</span>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">Patient List</h1>
        <p className="text-gray-500 text-sm mb-8">
          Phase 1 demo — one fixture patient loaded into HAPI FHIR.
        </p>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 font-medium text-gray-600">DOB</th>
                <th className="px-4 py-3 font-medium text-gray-600">MRN</th>
                <th className="px-4 py-3 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-200 hover:bg-blue-50">
                <td className="px-4 py-3 font-medium">Jane Smith</td>
                <td className="px-4 py-3">1972-04-15</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">MRN-001</td>
                <td className="px-4 py-3">
                  <Link
                    href={`/patients/${JANE_SMITH_ID}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Open Chart →
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-10 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
          <strong>Phase 1 status:</strong> EHR reads Jane Smith&apos;s chart from HAPI FHIR via{" "}
          <code className="font-mono bg-yellow-100 px-1 rounded">/api/fhir/[...path]</code>{" "}
          proxy. All other apps are stub landing pages.
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
          {[
            { label: "CDS SMART App", port: 4001 },
            { label: "CRD Service", port: 4002 },
            { label: "DTR Client", port: 4003 },
            { label: "PAS Service", port: 4004 },
            { label: "Payer Backend", port: 4005 },
          ].map(({ label, port }) => (
            <a
              key={port}
              href={`http://localhost:${port}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between bg-white border border-gray-200 rounded px-4 py-2 hover:border-blue-300 transition-colors"
            >
              <span className="text-gray-700">{label}</span>
              <span className="text-gray-400 font-mono">:{port}</span>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
