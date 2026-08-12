import Link from "next/link";
import ContentPage from "./content/page";
import ActivityFeed from "./activity/ActivityFeed";

// ---------------------------------------------------------------------------
// Diagram primitives
// ---------------------------------------------------------------------------

type Accent = "blue" | "amber" | "violet" | "teal" | "slate" | "dark";

const BORDER: Record<Accent, string> = {
  blue: "border-blue-300   bg-blue-50",
  amber: "border-amber-300  bg-amber-50",
  violet: "border-violet-300 bg-violet-50",
  teal: "border-teal-300   bg-teal-50",
  slate: "border-slate-300  bg-white",
  dark: "border-slate-700  bg-slate-800",
};
const PORT_COLOR: Record<Accent, string> = {
  blue: "text-blue-500",
  amber: "text-amber-600",
  violet: "text-violet-500",
  teal: "text-teal-600",
  slate: "text-slate-400",
  dark: "text-slate-400",
};
const ROLE_COLOR: Record<Accent, string> = {
  blue: "text-blue-700",
  amber: "text-amber-700",
  violet: "text-violet-700",
  teal: "text-teal-700",
  slate: "text-slate-500",
  dark: "text-slate-300",
};
const NAME_COLOR: Record<Accent, string> = {
  blue: "text-slate-900",
  amber: "text-slate-900",
  violet: "text-slate-900",
  teal: "text-slate-900",
  slate: "text-slate-900",
  dark: "text-white",
};

/** A clickable service box. */
function SvcBox({
  name,
  port,
  role,
  sub,
  accent = "slate",
  className = "",
}: {
  name: string;
  port: number;
  role: string;
  sub?: string;
  accent?: Accent;
  className?: string;
}) {
  return (
    <a
      href={`http://localhost:${port}`}
      target="_blank"
      rel="noreferrer"
      className={`block border rounded-md px-3 py-2.5 hover:shadow-sm transition-shadow ${BORDER[accent]} ${className}`}
    >
      <div className="flex items-baseline gap-1.5">
        <span className={`text-sm font-semibold ${NAME_COLOR[accent]}`}>{name}</span>
        <span className={`font-mono text-xs ${PORT_COLOR[accent]}`}>:{port}</span>
      </div>
      <p className={`text-xs mt-0.5 ${ROLE_COLOR[accent]}`}>{role}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5 italic">{sub}</p>}
    </a>
  );
}

/** Vertical downward connector with a centred label. */
function VArrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-0 select-none">
      <div className="w-px h-3 bg-slate-500" />
      <span className="text-xs text-slate-600 font-medium leading-none py-1 px-2 text-center">
        {label}
      </span>
      <div className="w-px h-3 bg-slate-500" />
      <span className="text-slate-500 text-sm leading-none">&#x25BC;</span>
    </div>
  );
}

/** Forked connector: two labelled downward arrows side-by-side. */

/** Horizontal connector between two sibling boxes (used inside the CRD group). */
function _HArrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-0 px-1 select-none">
      <span className="text-[10px] text-slate-400 leading-none">{label}</span>
      <span className="text-slate-300 text-base leading-none">&#x25B6;</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Services block diagram
// ---------------------------------------------------------------------------

function ServicesTab() {
  return (
    <>
      {/* Row 1: EHR region */}
      <div className="border border-slate-300 rounded-md bg-slate-800/5 p-2.5">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Electronic Health Record
        </p>
        <div className="flex gap-3 items-stretch">
          <div className="flex-1">
            <SvcBox
              name="EHR"
              port={4001}
              role="Patient chart · Order entry · SMART host · PA submission"
              accent="dark"
              className="h-full"
            />
          </div>
          <SvcBox
            name="HAPI FHIR"
            port={8080}
            role="FHIR R4 patient data store"
            sub="Shared data layer"
            accent="dark"
          />
        </div>
      </div>

      {/* Arrow: EHR → CRD/DTR/PAS group */}
      <div className="flex justify-center py-1">
        <div className="flex flex-col items-center text-[10px] text-slate-500 italic">
          <span className="mb-0.5">order-select (info) → order-sign (binding) · PA submit</span>
          <div className="w-px h-3 bg-slate-300" />
        </div>
      </div>

      {/* Row 2: CRD+DTR+PAS group */}
      <div className="border border-amber-200 rounded-md bg-amber-50/40 p-2.5">
        <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider mb-2">
          Coverage &amp; Authorization (CDS Hooks)
        </p>
        <div className="flex gap-2">
          <SvcBox name="CRD" port={4003} role="Coverage determination · order-select · order-sign" accent="amber" />
          <SvcBox name="DTR" port={4004} role="Questionnaire · DTR launch via CRD card" accent="amber" />
          <SvcBox name="PAS" port={4005} role="PA submission routing" accent="amber" />
        </div>
      </div>

      {/* Connector: Layer 2 → Payer Backend */}
      <div className="flex">
        <div className="flex-1" />
        <div className="flex-1 flex flex-col items-center">
          <VArrow label="PA evaluate" />
        </div>
      </div>

      {/* Row 3: Backing Services */}
      <div className="border border-slate-200 rounded-md bg-slate-50/60 p-2.5">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Backing Services
        </p>
        <div className="flex gap-4">
          <div className="flex-1">
            <SvcBox
              name="Hub"
              port={4000}
              role="Knowledge Artifact Repository (not part of MOPA)"
              sub="/fhir/Library · /fhir/PlanDefinition"
              accent="dark"
            />
          </div>
          <div className="flex-1">
            <SvcBox
              name="Payer Backend"
              port={4006}
              role="Rules Engine (reference uses CQL)"
              sub="Approval · pend · denial"
              accent="amber"
            />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="pt-4 mt-1 flex flex-wrap gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-slate-800 border border-slate-700 inline-block" />
          Platform (EHR &amp; Hub)
        </span>

        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-300 inline-block" />
          Layer 2 &mdash; Payer Policy
        </span>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Tab: Demo paths
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Tab: Demo Fixtures
// ---------------------------------------------------------------------------

const FIXTURE_CASES = [
  {
    patientId: "jane-smith",
    mrn: "MRN-001",
    dob: "1972-04-15",
    outcome: "Pre-authorized" as const,
    outcomeNote: "ECOG 0 — no PA required",
  },
  {
    patientId: "maria-garcia",
    mrn: "MRN-002",
    dob: "1975-08-22",
    outcome: "PA Required" as const,
    outcomeNote: "ECOG 1 — submit PA to payer",
  },
  {
    patientId: "sandra-chen",
    mrn: "MRN-003",
    dob: "1963-11-05",
    outcome: "DTR Required" as const,
    outcomeNote: "HER2 absent — collect via DTR",
  },
  {
    patientId: "diane-roe",
    mrn: "MRN-004",
    dob: "1977-06-22",
    outcome: "Biosimilar Sub" as const,
    outcomeNote: "ECOG 0 — payer requires trastuzumab-dttb",
  },
] as const;

type Outcome = (typeof FIXTURE_CASES)[number]["outcome"];

const OUTCOME_STYLE: Record<Outcome, string> = {
  "Pre-authorized": "bg-green-100 text-green-800 border-green-300",
  "PA Required": "bg-amber-100 text-amber-800 border-amber-300",
  "DTR Required": "bg-slate-100 text-slate-700 border-slate-300",
  "Biosimilar Sub": "bg-violet-100 text-violet-800 border-violet-300",
};

function stripXhtml(div: string): string {
  return div
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

async function fetchPatient(fhirBase: string, id: string): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(`${fhirBase}/Patient/${id}`, {
      headers: { Accept: "application/fhir+json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json() as Promise<Record<string, unknown>>;
  } catch {
    return null;
  }
}

import ResetFixturesButton from "./demo/ResetFixturesButton";

// ---------------------------------------------------------------------------
// Clinical data fetch helpers
// ---------------------------------------------------------------------------

type FhirResource = Record<string, unknown>;

async function fetchBundle(url: string): Promise<FhirResource[]> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/fhir+json" },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const b = (await res.json()) as { entry?: Array<{ resource?: FhirResource }> };
    return (b.entry ?? []).map((e) => e.resource).filter(Boolean) as FhirResource[];
  } catch {
    return [];
  }
}

function obsValue(obs: FhirResource): string {
  if (obs.valueInteger !== undefined) return String(obs.valueInteger);
  const cc = obs.valueCodeableConcept as
    | { text?: string; coding?: Array<{ display?: string }> }
    | undefined;
  return cc?.text ?? cc?.coding?.[0]?.display ?? "—";
}

function obsName(obs: FhirResource): string {
  const code = obs.code as { text?: string; coding?: Array<{ display?: string }> } | undefined;
  return code?.text ?? code?.coding?.[0]?.display ?? "Observation";
}

function condName(cond: FhirResource): string {
  const code = cond.code as { text?: string; coding?: Array<{ display?: string }> } | undefined;
  return code?.text ?? code?.coding?.[0]?.display ?? "Condition";
}

function condStatus(cond: FhirResource): string {
  const cs = cond.clinicalStatus as { coding?: Array<{ code?: string }> } | undefined;
  return cs?.coding?.[0]?.code ?? "unknown";
}

// ---------------------------------------------------------------------------
// DemoFixturesTab
// ---------------------------------------------------------------------------

async function DemoFixturesTab() {
  const fhirBase = process.env.FHIR_BASE_URL ?? "http://localhost:8080/fhir";
  const ehrBase = process.env.NEXT_PUBLIC_EHR_BASE_URL ?? "http://localhost:4001";

  // Fetch patient + clinical data for all three cases in parallel
  const caseData = await Promise.all(
    FIXTURE_CASES.map(async (c) => {
      const [patient, conditions, observations] = await Promise.all([
        fetchPatient(fhirBase, c.patientId),
        fetchBundle(`${fhirBase}/Condition?patient=${c.patientId}&_count=10`),
        fetchBundle(`${fhirBase}/Observation?patient=${c.patientId}&_count=20&_sort=-date`),
      ]);
      return { ...c, patient, conditions, observations };
    })
  );

  const anyLoaded = caseData.some((d) => d.patient != null);

  return (
    <>
      {/* Instruction bar */}
      <div className="bg-white border border-slate-200 rounded px-4 py-3 flex items-start justify-between gap-6">
        <p className="text-sm text-slate-600">
          Three patient cases, each pre-loaded with clinical data that exercises a different CDS
          outcome. Reset to reload all cases into HAPI FHIR, then open each chart in the EHR.
        </p>
        <ResetFixturesButton />
      </div>

      {!anyLoaded && (
        <div className="border border-amber-200 bg-amber-50 rounded px-4 py-3 text-sm text-amber-800">
          Fixtures not loaded yet. Click <strong>Reset Patient Cases</strong> above and ensure HAPI
          FHIR is running.
        </div>
      )}

      {/* Patient case cards */}
      <div className="space-y-4">
        {caseData.map((c) => {
          const rawDiv = (c.patient?.text as Record<string, unknown> | undefined)?.div as
            | string
            | undefined;
          const narrative = rawDiv ? stripXhtml(rawDiv) : null;
          const nameArr = c.patient?.name as
            | Array<{ family?: string; given?: string[] }>
            | undefined;
          const fullName = nameArr?.[0]
            ? `${(nameArr[0].given ?? []).join(" ")} ${nameArr[0].family ?? ""}`.trim()
            : c.patientId;

          return (
            <div
              key={c.patientId}
              className="bg-white border border-slate-200 rounded-lg overflow-hidden"
            >
              {/* Card header */}
              <div className="px-4 py-3 border-b border-slate-100 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded border ${OUTCOME_STYLE[c.outcome]}`}
                    >
                      {c.outcome}
                    </span>
                    <span className="text-base font-semibold text-slate-900">{fullName}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    DOB {c.dob} &middot; {c.mrn} &middot; {c.outcomeNote}
                  </p>
                </div>
                <a
                  href={`${ehrBase}/patients/${c.patientId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-shrink-0 inline-flex items-center gap-1 rounded bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
                >
                  Open in EHR
                </a>
              </div>

              {/* Narrative */}
              <div className="px-4 py-3 border-b border-slate-100">
                {narrative ? (
                  <p className="text-sm text-slate-600 leading-relaxed">{narrative}</p>
                ) : (
                  <p className="text-sm text-slate-400 italic">Patient not yet loaded.</p>
                )}
              </div>

              {/* Expandable clinical data */}
              {(c.conditions.length > 0 || c.observations.length > 0) && (
                <details className="group">
                  <summary className="px-4 py-2.5 flex items-center justify-between cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden bg-slate-50 hover:bg-slate-100 transition-colors">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Clinical Data
                    </span>
                    <span className="text-slate-400 text-sm group-open:rotate-180 transition-transform">
                      &#9662;
                    </span>
                  </summary>

                  <div className="px-4 py-3 space-y-3 border-t border-slate-100">
                    {/* Conditions */}
                    {c.conditions.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          Conditions
                        </p>
                        <div className="space-y-1">
                          {c.conditions.map((cond, i) => (
                            // biome-ignore lint/suspicious/noArrayIndexKey: conditions have no stable id here
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <span
                                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${condStatus(cond) === "active" ? "bg-green-500" : "bg-slate-300"}`}
                              />
                              <span className="text-slate-700">{condName(cond)}</span>
                              <span className="text-slate-400 capitalize">{condStatus(cond)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Observations */}
                    {c.observations.length > 0 && (
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          Observations
                        </p>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-left border-b border-slate-100">
                              <th className="pb-1 font-medium text-slate-500 w-1/2">Observation</th>
                              <th className="pb-1 font-medium text-slate-500">Value</th>
                              <th className="pb-1 font-medium text-slate-500 text-right">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {c.observations.map((obs, i) => (
                              // biome-ignore lint/suspicious/noArrayIndexKey: observations have no stable id here
                              <tr key={i} className="border-t border-slate-50">
                                <td className="py-1 text-slate-600">{obsName(obs)}</td>
                                <td className="py-1 font-medium text-slate-800">{obsValue(obs)}</td>
                                <td className="py-1 text-slate-400 text-right">
                                  {(obs.effectiveDateTime as string | undefined)?.slice(0, 10) ??
                                    "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

const TABS = [
  { id: "services", label: "Services" },
  { id: "activity", label: "Activity" },
  { id: "paths", label: "Demo Patient Cases" },
  { id: "content", label: "Knowledge Artifacts" },
] as const;

export default async function HubPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; pd?: string }>;
}) {
  const { tab = "services", pd } = await searchParams;

  return (
    <>
      {/* Header + tabs — shell provides nav and footer */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 pt-5 pb-0">
          <h1 className="text-lg font-semibold text-slate-900">
            Oncology Guideline-Compliant Authorization
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 mb-4 flex items-center justify-between gap-6">
            <span>
              Reference implementation across six actors — Hub, EHR, CRD Service, DTR Client, PAS Service, and Payer Backend, CRD Service, DTR
              Client, PAS Service, Payer Backend.
            </span>
            <a
              href="http://localhost:4001"
              target="_blank"
              rel="noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-1.5 rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              Get Started: Launch EHR
            </a>
          </p>
        </div>
        <div className="max-w-5xl mx-auto px-6 flex border-t border-slate-100">
          {TABS.map((t) => (
            <Link
              key={t.id}
              href={`?tab=${t.id}`}
              className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "border-b-2 border-blue-600 text-blue-700 -mb-px"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <main className="w-full max-w-5xl mx-auto px-6 py-7">
        {tab === "services" && <ServicesTab />}
        {tab === "paths" && <DemoFixturesTab />}
        {tab === "activity" && <ActivityFeed />}
        {tab === "content" && <ContentPage embedded pd={pd} />}
      </main>
    </>
  );
}
