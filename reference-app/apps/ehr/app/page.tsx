import Link from "next/link";

const PATIENTS = [
  {
    id: process.env.JANE_SMITH_PATIENT_ID ?? "jane-smith",
    name: "Jane Smith",
    dob: "1972-04-15",
    mrn: "MRN-001",
  },
  { id: "maria-garcia", name: "Maria Garcia", dob: "1975-08-22", mrn: "MRN-002" },
  { id: "sandra-chen", name: "Sandra Chen", dob: "1963-11-05", mrn: "MRN-003" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-slate-800 text-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="font-semibold text-sm tracking-tight">OGCA Reference EHR</div>
        <a
          href="http://localhost:4000"
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          ← Hub
        </a>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Patient List
        </h1>

        <div className="bg-white rounded border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 font-medium text-slate-600">DOB</th>
                <th className="px-4 py-3 font-medium text-slate-600">MRN</th>
                <th className="px-4 py-3 font-medium text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {PATIENTS.map((p) => (
                <tr key={p.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                  <td className="px-4 py-3 text-slate-600">{p.dob}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.mrn}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/patients/${p.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Open Chart →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
