export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-900 rounded-2xl mx-auto flex items-center justify-center">
          <span className="text-white text-2xl font-bold">
            DT
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800">DTR Client</h1>
        <p className="text-gray-500 text-sm max-w-sm">
          Stub landing page — Phase 1. Full implementation in later phases.
        </p>
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded px-4 py-2 text-sm text-blue-700">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          Running on port 4003
        </div>
        <div className="pt-2">
          <a
            href="http://localhost:4000"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to EHR
          </a>
        </div>
      </div>
    </div>
  );
}
