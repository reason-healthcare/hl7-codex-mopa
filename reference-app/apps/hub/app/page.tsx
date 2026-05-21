import Link from "next/link";
import ContentPage from "./content/page";

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
function ForkArrow({ left, right }: { left: string; right: string }) {
  return (
    <div className="flex items-start">
      <div className="flex-1 flex flex-col items-center">
        <div className="w-px h-3 bg-slate-500" />
        <span className="text-xs text-slate-600 font-medium leading-tight py-1 px-3 text-center">
          {left}
        </span>
        <div className="w-px h-3 bg-slate-500" />
        <span className="text-slate-500 text-sm leading-none">&#x25BC;</span>
      </div>
      <div className="flex-1 flex flex-col items-center">
        <div className="w-px h-3 bg-slate-500" />
        <span className="text-xs text-slate-600 font-medium leading-tight py-1 px-3 text-center">
          {right}
        </span>
        <div className="w-px h-3 bg-slate-500" />
        <span className="text-slate-500 text-sm leading-none">&#x25BC;</span>
      </div>
    </div>
  );
}

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
    <div className="space-y-0 w-full">
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

      {/* Fork: EHR → SMART App (left) / EHR → CRD group (right) */}
      <ForkArrow left="SMART App launch" right="CDS Hooks order-select / sign · PA submit" />

      {/* Row 2: SMART App | CRD+DTR+PAS group */}
      <div className="flex gap-4 items-stretch">
        {/* Left: SMART App */}
        <div className="flex-1 flex flex-col border border-blue-200 rounded-md bg-blue-50/40 p-2.5">
          <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider mb-2">
            Layer 1 &mdash; Guideline Authority
          </p>
          <SvcBox
            name="CDS SMART App"
            port={4002}
            role="Gap analysis · regimen recommendations"
            accent="blue"
            className="flex-1"
          />
        </div>

        {/* Right: CRD group — all amber */}
        <div className="flex-1 border border-amber-200 rounded-md bg-amber-50/40 p-2.5">
          <p className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider mb-2">
            Layer 2 &mdash; Coverage &amp; Authorization
          </p>
          <div className="flex gap-2">
            <SvcBox name="CRD" port={4003} role="Coverage determination" accent="amber" />
            <SvcBox name="DTR" port={4004} role="Questionnaire · write-back" accent="amber" />
            <SvcBox name="PAS" port={4005} role="PA submission routing" accent="amber" />
          </div>
        </div>
      </div>

      {/* Connector: Layer 2 → Payer Backend */}
      <div className="flex">
        <div className="flex-1" />
        <div className="flex-1 flex flex-col items-center">
          <VArrow label="PA evaluate (CQL)" />
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
              role="Knowledge Artifact Repository (not part of OGCA)"
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
          <span className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-300 inline-block" />
          Layer 1 &mdash; Guideline Authority
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-300 inline-block" />
          Layer 2 &mdash; Payer Policy
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Demo paths
// ---------------------------------------------------------------------------

const PATHS = [
  {
    id: "Path 1",
    label: "Pre-authorized",
    command: "bash fixtures/path1.sh",
    pivot: "ECOG = 0, HER2 positive",
    accent: {
      section: "border-green-300 bg-green-50",
      badge: "bg-green-100 text-green-800",
      step: "bg-green-600",
    },
    steps: [
      { actor: "EHR", action: "Open Order Entry, select TH regimen" },
      {
        actor: "EHR -> CRD",
        action: "Fires order-select with patient + condition in baseline prefetch",
      },
      {
        actor: "CRD",
        action: "Identifies breast cancer condition, fetches HER2 / Stage / ECOG from EHR",
      },
      { actor: "CRD -> EHR", action: "Returns pre-authorized card (ECOG=0) — no PA required" },
      { actor: "EHR", action: "Shows pre-authorized indicator. Sign Order." },
      { actor: "EHR -> CRD", action: "Fires order-sign" },
      { actor: "CRD -> EHR", action: "Confirms pre-authorization" },
      { actor: "EHR", action: "Order proceeds — no PA submission needed" },
    ],
  },
  {
    id: "Path 2",
    label: "PA Required",
    command: "bash fixtures/path2.sh",
    pivot: "ECOG = 1, HER2 positive",
    accent: {
      section: "border-amber-300 bg-amber-50",
      badge: "bg-amber-100 text-amber-800",
      step: "bg-amber-500",
    },
    steps: [
      { actor: "EHR", action: "Open Order Entry, select TH regimen" },
      { actor: "EHR -> CRD", action: "Fires order-select with baseline prefetch" },
      {
        actor: "CRD",
        action: "Identifies breast cancer, fetches HER2 / Stage / ECOG — all present, ECOG=1",
      },
      { actor: "CRD -> EHR", action: "Returns coverage-met card — PA required" },
      { actor: "EHR", action: "Shows PA Required indicator. Sign Order." },
      { actor: "EHR -> CRD", action: "Fires order-sign" },
      { actor: "CRD -> EHR", action: "Returns prior-auth-required card" },
      { actor: "EHR", action: "Shows Submit PA button" },
      { actor: "EHR -> PAS", action: "Submits PA request to PAS Service" },
      { actor: "PAS -> Payer", action: "Evaluates BreastCancerPayerPolicy CQL" },
      { actor: "Payer -> EHR", action: "ClaimResponse: Approved" },
    ],
  },
  {
    id: "Path 3",
    label: "DTR Required",
    command: "bash fixtures/path3.sh",
    pivot: "HER2 absent (ECOG = 1 — post-DTR continues as Path 2)",
    accent: {
      section: "border-slate-300 bg-slate-50",
      badge: "bg-slate-100 text-slate-700",
      step: "bg-slate-500",
    },
    steps: [
      { actor: "EHR", action: "Open Order Entry, select TH regimen" },
      { actor: "EHR -> CRD", action: "Fires order-select with baseline prefetch" },
      { actor: "CRD", action: "Identifies breast cancer, fetches data — HER2 absent" },
      { actor: "CRD -> EHR", action: "Returns additional-info-required card with DTR launch link" },
      { actor: "EHR", action: "Shows Launch Documentation Requirements Tool button" },
      {
        actor: "EHR -> DTR",
        action: "SMART launch with appContext: libraryUrl + missingDataElements=[her2]",
      },
      {
        actor: "DTR",
        action: "Fetches Library from Hub /fhir/Library, generates HER2 questionnaire",
      },
      { actor: "Clinician", action: "Selects HER2 result (e.g. IHC 3+ Positive)" },
      { actor: "DTR -> EHR", action: "Writes Observation + QuestionnaireResponse to HAPI" },
      { actor: "DTR", action: "Redirects to EHR with ?dtr-complete=true" },
      { actor: "EHR -> CRD", action: "Auto-fires order-select — HER2 now present" },
      { actor: "CRD -> EHR", action: "Returns coverage-met card (ECOG=1) — continues as Path 2" },
    ],
  },
];

function PathsTab() {
  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-500 bg-white border border-slate-200 rounded px-4 py-3">
        <strong className="text-slate-700">Pivot:</strong> ECOG Performance Status at order time
        determines the authorization outcome when all data is present. ECOG 0 → pre-authorized ·
        ECOG ≥1 → PA required · Missing data → DTR first.
      </div>

      {PATHS.map((path) => (
        <section key={path.id} className={`border rounded overflow-hidden ${path.accent.section}`}>
          <div className="px-4 py-3 border-b border-current/20 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${path.accent.badge}`}>
                  {path.id}
                </span>
                <span className="text-sm font-semibold text-slate-900">{path.label}</span>
              </div>
              <p className="text-xs text-slate-500">Pivot: {path.pivot}</p>
            </div>
            <code className="font-mono text-xs text-slate-500 bg-white/70 border border-slate-200 px-2 py-1 rounded flex-shrink-0">
              {path.command}
            </code>
          </div>
          <div className="px-4 py-3">
            <ol className="space-y-1.5">
              {path.steps.map((step, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: ordered steps, index is stable
                <li key={i} className="flex items-start gap-3 text-xs">
                  <span
                    className={`flex-shrink-0 w-5 h-5 rounded-full text-white flex items-center justify-center text-xs font-bold mt-0.5 ${path.accent.step}`}
                  >
                    {i + 1}
                  </span>
                  <span>
                    <span className="font-mono text-slate-500 mr-1.5">{step.actor}</span>
                    <span className="text-slate-700">{step.action}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const TABS = [
  { id: "services", label: "Services" },
  { id: "paths", label: "Demo Paths" },
  { id: "content", label: "Knowledge Artifacts" },
] as const;

export default async function HubPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; pd?: string }>;
}) {
  const { tab = "services", pd } = await searchParams;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Nav */}
      <nav className="bg-slate-800 text-slate-100 px-6 py-3 flex items-center justify-between text-sm">
        <div className="font-semibold">OGCA Reference Implementation</div>
        <a
          href="http://localhost:4001"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 font-medium"
        >
          Open EHR →
        </a>
      </nav>

      {/* Header + tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 pt-5 pb-0">
          <h1 className="text-lg font-semibold text-slate-900">
            Oncology Guideline-Compliant Authorization
          </h1>
          <p className="text-sm text-slate-500 mt-0.5 mb-4 flex items-center justify-between gap-6">
            <span>
              Reference implementation across six actors — Hub, EHR, CDS SMART App, CRD Service, DTR
              Client, PAS Service, Payer Backend.
            </span>
            <a
              href="http://localhost:4001"
              target="_blank"
              rel="noreferrer"
              className="flex-shrink-0 inline-flex items-center gap-1.5 rounded bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
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
      <main className="max-w-5xl mx-auto px-6 py-7">
        {tab === "services" && <ServicesTab />}
        {tab === "paths" && <PathsTab />}
        {tab === "content" && <ContentPage embedded pd={pd} />}
      </main>
    </div>
  );
}
