import { cookies } from "next/headers";
import { verifyToken, isAuthBypassed, bypassToken, TOKEN_COOKIE } from "@ogca/smart-auth";

interface PageProps {
  searchParams: Promise<{ appContext?: string }>;
}

export default async function DtrClientHome({ searchParams }: PageProps) {
  const { appContext: rawAppContext } = await searchParams;
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(TOKEN_COOKIE)?.value;

  let patientId: string | undefined;
  let authError: string | null = null;

  if (isAuthBypassed()) {
    patientId = bypassToken().patient;
  } else if (rawToken) {
    try {
      const claims = await verifyToken(rawToken);
      patientId = claims.patient as string | undefined;
    } catch {
      authError = "Token invalid or expired. Please re-launch from the EHR.";
    }
  }

  let parsedContext: { libraryUrl?: string; missingDataElements?: string[] } | null = null;
  if (rawAppContext) {
    try {
      parsedContext = JSON.parse(decodeURIComponent(rawAppContext));
    } catch {
      parsedContext = null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="font-bold text-lg tracking-tight">OGCA DTR Client</div>
        <span className="text-purple-300 text-sm">Documentation Requirements Tool</span>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        {authError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {authError}
          </div>
        ) : (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Launch Context
              </h2>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-gray-500">Patient ID</dt>
                  <dd className="font-mono text-xs text-gray-600">{patientId ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Auth Mode</dt>
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

            {parsedContext && (
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                  App Context (from CRD)
                </h2>
                <dl className="space-y-3 text-sm">
                  {parsedContext.libraryUrl && (
                    <div>
                      <dt className="text-gray-500">Library URL</dt>
                      <dd className="font-mono text-xs text-gray-600 break-all">
                        {parsedContext.libraryUrl}
                      </dd>
                    </div>
                  )}
                  {parsedContext.missingDataElements &&
                    parsedContext.missingDataElements.length > 0 && (
                      <div>
                        <dt className="text-gray-500 mb-1">Missing Data Elements</dt>
                        <dd>
                          <ul className="space-y-1">
                            {parsedContext.missingDataElements.map((el) => (
                              <li
                                key={el}
                                className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded mr-2"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                {el}
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    )}
                </dl>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
              <strong>Phase 4 status:</strong> SMART EHR launch complete —{" "}
              {parsedContext ? "appContext received from CRD." : "awaiting appContext from CRD."}{" "}
              Questionnaire generation and HER2 data entry coming in Phase 6.
            </div>
          </>
        )}
      </main>
    </div>
  );
}
