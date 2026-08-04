import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import CqlTabs from "./CqlTabs";
import {
  // Libraries
  GUIDELINE_LIBRARY,
  PAYER_POLICY_LIBRARY,
  LIBRARY_RESOURCE,
  ONCOLOGY_CRD_CATALOG,
  NSCLC_GUIDELINE_LIBRARY,
  NSCLC_PAYER_POLICY_LIBRARY,
  // PlanDefinitions — eca-rule
  GUIDELINE_PLAN_DEFINITION,
  PLAN_DEFINITION,
  NSCLC_GUIDELINE_PLAN_DEFINITION,
  NSCLC_PLAN_DEFINITION,
  // PlanDefinitions — order-set
  REGIMEN_TH,
  REGIMEN_PHD,
  REGIMEN_DDACT,
  REGIMEN_OSIMERTINIB,
  REGIMEN_ALECTINIB,
  REGIMEN_PEMBROLIZUMAB,
} from "@mopa/knowledge-artifacts";

// ---------------------------------------------------------------------------
// Static registries
// ---------------------------------------------------------------------------

type AnyPlanDef = Record<string, unknown>;
type AnyLibrary = Record<string, unknown>;

const ALL_PLAN_DEFS: AnyPlanDef[] = [
  GUIDELINE_PLAN_DEFINITION as AnyPlanDef,
  PLAN_DEFINITION as AnyPlanDef,
  NSCLC_GUIDELINE_PLAN_DEFINITION as AnyPlanDef,
  NSCLC_PLAN_DEFINITION as AnyPlanDef,
  REGIMEN_TH as AnyPlanDef,
  REGIMEN_PHD as AnyPlanDef,
  REGIMEN_DDACT as AnyPlanDef,
  REGIMEN_OSIMERTINIB as AnyPlanDef,
  REGIMEN_ALECTINIB as AnyPlanDef,
  REGIMEN_PEMBROLIZUMAB as AnyPlanDef,
];

const LIBRARIES_BY_ID: Record<string, AnyLibrary> = {
  BreastCancerGuideline: GUIDELINE_LIBRARY as AnyLibrary,
  BreastCancerPayerPolicy: PAYER_POLICY_LIBRARY as AnyLibrary,
  BreastCancerPADataRequirements: LIBRARY_RESOURCE as AnyLibrary,
  OncologyCRDCatalog: ONCOLOGY_CRD_CATALOG as AnyLibrary,
  LungCancerGuideline: NSCLC_GUIDELINE_LIBRARY as AnyLibrary,
  LungCancerPayerPolicy: NSCLC_PAYER_POLICY_LIBRARY as AnyLibrary,
};

/** CQL + ELM filenames for logic libraries that have them. */
const CQL_FILES: Record<string, { cql: string; elm: string }> = {
  BreastCancerGuideline: {
    cql: "BreastCancerGuideline.cql",
    elm: "BreastCancerGuideline.elm.json",
  },
  BreastCancerPayerPolicy: {
    cql: "BreastCancerPayerPolicy.cql",
    elm: "BreastCancerPayerPolicy.elm.json",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const CQL_DIR = path.join(process.cwd(), "..", "..", "cql");
const ELM_DIR = path.join(CQL_DIR, "elm");

function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
}

function typeCode(pd: AnyPlanDef): string {
  return (pd.type as { coding?: Array<{ code?: string }> })?.coding?.[0]?.code ?? "";
}

function layerCode(pd: AnyPlanDef): string {
  const uc = pd.usageContext as
    | Array<{ valueCodeableConcept?: { coding?: Array<{ code?: string }> } }>
    | undefined;
  return uc?.[0]?.valueCodeableConcept?.coding?.[0]?.code ?? "";
}

function layerDisplay(pd: AnyPlanDef): string {
  const uc = pd.usageContext as
    | Array<{ valueCodeableConcept?: { coding?: Array<{ display?: string }> } }>
    | undefined;
  return uc?.[0]?.valueCodeableConcept?.coding?.[0]?.display ?? "";
}

/** Format a timingTiming.repeat into concise oncology notation (e.g. q7d ×12). */
function formatTiming(repeat: {
  period?: number;
  periodUnit?: string;
  frequency?: number;
  count?: number;
}): string {
  if (!repeat.period) return "";
  const freq = repeat.frequency ?? 1;
  const period = repeat.period;
  const unit = repeat.periodUnit ?? "d";
  let sched: string;
  if (freq > 1 && period === 1 && unit === "d") {
    sched = `${freq}\u00d7 daily`;
  } else {
    sched = `q${period}${unit}`;
  }
  return repeat.count ? `${sched} \u00d7${repeat.count}` : sched;
}

/** Extract day numbers from a regimen-days-of-cycle extension on timingTiming. */
function extractDays(
  ext: Array<{ url?: string; extension?: Array<{ url?: string; valueInteger?: number }> }>
): number[] {
  const e = ext.find(
    (e) => (e.url ?? "").includes("days-of-cycle") || (e.url ?? "").includes("daysOfCycle")
  );
  return (
    (e?.extension ?? [])
      .filter((x) => x.url === "day" && x.valueInteger != null)
      // biome-ignore lint/style/noNonNullAssertion: guarded by != null filter above
      .map((x) => x.valueInteger!)
  );
}

/** Extract a CodeableConcept display from an extension by URL suffix. */
function extDisplay(pd: AnyPlanDef, urlSuffix: string): string | undefined {
  const exts = pd.extension as
    | Array<{ url?: string; valueCodeableConcept?: { coding?: Array<{ display?: string }> } }>
    | undefined;
  return exts?.find((e) => (e.url ?? "").endsWith(urlSuffix))?.valueCodeableConcept?.coding?.[0]
    ?.display;
}
function linkedLibraryIds(pd: AnyPlanDef): string[] {
  const libs = pd.library as string[] | undefined;
  return (libs ?? []).map((url) => url.split("/").at(-1) ?? "").filter(Boolean);
}

/** Find order-set PlanDefinitions referenced via action[*].definitionCanonical. */
function collectDefinitionRefs(actions: unknown[]): string[] {
  const ids: string[] = [];
  for (const a of actions) {
    const action = a as Record<string, unknown>;
    const def = action.definitionCanonical as string | undefined;
    if (def) ids.push(def.split("/").at(-1) ?? "");
    const nested = action.action as unknown[] | undefined;
    if (nested) ids.push(...collectDefinitionRefs(nested));
  }
  return ids;
}

// ---------------------------------------------------------------------------
// Tiny UI primitives
// ---------------------------------------------------------------------------

function Badge({
  label,
  variant = "slate",
}: {
  label: string;
  variant?: "blue" | "amber" | "violet" | "green" | "slate" | "teal";
}) {
  const cls: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200",
    green: "bg-green-50 text-green-700 border-green-200",
    slate: "bg-slate-100 text-slate-600 border-slate-200",
    teal: "bg-teal-50 text-teal-700 border-teal-200",
  };
  return (
    <span
      className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${cls[variant]}`}
    >
      {label}
    </span>
  );
}

function typeBadge(code: string) {
  if (code === "eca-rule") return <Badge label="ECA Rule" variant="blue" />;
  if (code === "order-set") return <Badge label="Order Set" variant="violet" />;
  return <Badge label={code} />;
}

function layerBadge(code: string) {
  if (code === "guideline-authority") return <Badge label="Guideline Authority" variant="teal" />;
  if (code === "payer-policy") return <Badge label="Payer Policy" variant="amber" />;
  if (code === "regimen-template") return <Badge label="Regimen Template" variant="violet" />;
  return null;
}

function statusBadge(status: string) {
  if (status === "active") return <Badge label="active" variant="green" />;
  if (status === "draft") return <Badge label="draft" variant="amber" />;
  return <Badge label={status} />;
}

// ---------------------------------------------------------------------------
// Action tree
// ---------------------------------------------------------------------------

function ActionNode({ action, depth = 0 }: { action: Record<string, unknown>; depth?: number }) {
  const children = action.action as Record<string, unknown>[] | undefined;
  const trigger = (action.trigger as Array<{ name?: string }> | undefined)?.[0]?.name;
  const defRef = action.definitionCanonical as string | undefined;
  const defId = defRef?.split("/").at(-1);
  const related = (
    action.relatedAction as Array<{ actionId?: string; relationship?: string }> | undefined
  )?.[0];

  const timingRaw = action.timingTiming as
    | {
        repeat?: { period?: number; periodUnit?: string; frequency?: number; count?: number };
        extension?: Array<{
          url?: string;
          extension?: Array<{ url?: string; valueInteger?: number }>;
        }>;
      }
    | undefined;
  const timingStr = timingRaw?.repeat ? formatTiming(timingRaw.repeat) : "";
  const days = timingRaw?.extension ? extractDays(timingRaw.extension) : [];

  return (
    <li className={`space-y-1 ${depth > 0 ? "ml-5 border-l border-slate-200 pl-3" : ""}`}>
      <div className="flex items-start gap-2 py-1">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800">{action.title as string}</p>
          {(action.description as string | undefined) && (
            <p className="text-xs text-slate-500 mt-0.5">{action.description as string}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-1">
            {trigger && (
              <span className="font-mono text-[10px] text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                hook: {trigger}
              </span>
            )}
            {timingStr && (
              <span className="font-mono text-[10px] text-slate-700 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                {timingStr}
              </span>
            )}
            {days.length > 0 && (
              <span className="font-mono text-[10px] text-teal-700 bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded">
                day{days.length > 1 ? "s" : ""}: {days.join(", ")}
              </span>
            )}
            {related && (
              <span className="font-mono text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                {related.relationship}: {related.actionId}
              </span>
            )}
            {defId && (
              <span className="font-mono text-[10px] text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded">
                order-set: {defId}
              </span>
            )}
          </div>
        </div>
      </div>
      {children && children.length > 0 && (
        <ul className="space-y-0">
          {children.map((child, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: nested actions have no stable id
            <ActionNode key={i} action={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// Data requirement row
// ---------------------------------------------------------------------------

function DataReqRow({ req }: { req: Record<string, unknown> }) {
  const type = req.type as string;
  const label = (req.extension as Array<{ valueString?: string }> | undefined)?.find((e) =>
    (e as { url?: string }).url?.endsWith("data-requirement-label")
  )?.valueString;
  const codes =
    (
      req.codeFilter as
        | Array<{ code?: Array<{ system?: string; code?: string; display?: string }> }>
        | undefined
    )?.[0]?.code ?? [];
  const sys = (s?: string) =>
    !s
      ? ""
      : s.includes("snomed")
        ? "SNOMED CT"
        : s.includes("loinc")
          ? "LOINC"
          : (s.split("/").at(-1) ?? s);

  return (
    <tr className="border-t border-slate-100 align-top">
      <td className="px-3 py-2 font-medium text-slate-700 text-xs whitespace-nowrap">
        {label ?? type}
      </td>
      <td className="px-3 py-2 text-xs text-slate-500">{type}</td>
      <td className="px-3 py-2 text-xs">
        {codes.map((c, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: code array has no stable id
          <div key={i} className="leading-snug">
            <span className="text-slate-700 font-mono">{c.code}</span>
            <span className="text-slate-400 ml-1">{sys(c.system)}</span>
          </div>
        ))}
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Library detail panel
// ---------------------------------------------------------------------------

function LibraryPanel({
  libId,
  cqlSource,
  elmSource,
}: {
  libId: string;
  cqlSource: string;
  elmSource: string;
}) {
  const lib = LIBRARIES_BY_ID[libId];
  if (!lib) return null;

  const dataReqs = (lib.dataRequirement as Record<string, unknown>[] | undefined) ?? [];
  const hasCql = cqlSource.length > 0;
  const isDraft = lib.status === "draft";

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Library</p>
            {statusBadge(lib.status as string)}
          </div>
          <p className="font-semibold text-slate-900 mt-0.5">{lib.title as string}</p>
          <p className="font-mono text-xs text-slate-400 mt-0.5">
            {lib.name as string} v{lib.version as string}
          </p>
        </div>
        <a
          href={`/fhir/Library/${libId}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-mono text-blue-600 hover:text-blue-700 hover:underline flex-shrink-0"
        >
          View FHIR &#x7B;&#x7D;
        </a>
      </div>

      {(lib.description as string | undefined) && (
        <p className="px-4 py-3 text-sm text-slate-600 border-b border-slate-100">
          {lib.description as string}
        </p>
      )}

      {/* Data requirements */}
      {dataReqs.length > 0 && (
        <details open className="group">
          <summary className="flex items-center justify-between px-4 py-2.5 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 list-none [&::-webkit-details-marker]:hidden border-b border-slate-200">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Data Requirements
            </span>
            <span className="text-slate-400 text-sm group-open:rotate-180 transition-transform">
              &#9662;
            </span>
          </summary>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left border-b border-slate-200">
                <th className="px-3 py-2 text-xs font-medium text-slate-500">Label</th>
                <th className="px-3 py-2 text-xs font-medium text-slate-500">FHIR Type</th>
                <th className="px-3 py-2 text-xs font-medium text-slate-500">Code</th>
              </tr>
            </thead>
            <tbody>
              {dataReqs.map((r, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: data requirements have no stable id
                <DataReqRow key={i} req={r} />
              ))}
            </tbody>
          </table>
        </details>
      )}

      {/* CQL / ELM source */}
      <details className="group">
        <summary className="flex items-center justify-between px-4 py-2.5 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 list-none [&::-webkit-details-marker]:hidden border-t border-slate-200">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            CQL / ELM Source
          </span>
          <span className="text-slate-400 text-sm group-open:rotate-180 transition-transform">
            &#9662;
          </span>
        </summary>
        {hasCql ? (
          <CqlTabs cql={cqlSource} elm={elmSource || "{}"} />
        ) : (
          <p className="px-4 py-3 text-xs text-slate-400 italic border-t border-slate-100">
            {isDraft ? "CQL not yet authored for this draft library." : "CQL source not available."}
          </p>
        )}
      </details>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PlanDefinition list card
// ---------------------------------------------------------------------------

function PdListCard({ pd, href }: { pd: AnyPlanDef; href: string }) {
  const tc = typeCode(pd);
  const lc = layerCode(pd);
  const st = pd.status as string;
  const id = pd.id as string;

  return (
    <div className="relative border border-slate-200 rounded-lg bg-white hover:border-slate-300 hover:shadow-sm transition-all">
      <Link href={href} className="block px-4 py-3 pr-20">
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          {typeBadge(tc)}
          {layerBadge(lc)}
          {statusBadge(st)}
        </div>
        <p className="text-sm font-semibold text-slate-900 leading-snug">{pd.title as string}</p>
        {(pd.description as string | undefined) && (
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{pd.description as string}</p>
        )}
      </Link>
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
        <span className="font-mono text-xs text-slate-400">v{pd.version as string}</span>
        <a
          href={`/fhir/PlanDefinition/${id}`}
          target="_blank"
          rel="noreferrer"
          className="text-[10px] font-mono text-blue-500 hover:text-blue-700"
        >
          FHIR &#x7B;&#x7D;
        </a>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Master list view
// ---------------------------------------------------------------------------

function ListView({ embedded }: { embedded: boolean }) {
  const pd = (id: string) => (embedded ? `/?tab=content&pd=${id}` : `?pd=${id}`);

  const ecaRules = ALL_PLAN_DEFS.filter((p) => typeCode(p) === "eca-rule");
  const orderSets = ALL_PLAN_DEFS.filter((p) => typeCode(p) === "order-set");

  const guidelineEca = ecaRules.filter((p) => layerCode(p) === "guideline-authority");
  const payerEca = ecaRules.filter((p) => layerCode(p) === "payer-policy");

  return (
    <div className="space-y-8">
      {/* ECA Rules */}
      <section>
        <div className="flex items-baseline gap-2 mb-4">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            ECA Rules
          </h2>
          <span className="text-xs text-slate-400">event-condition-action</span>
        </div>

        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-2">
              Guideline Authority
            </p>
            <div className="space-y-2">
              {guidelineEca.map((p) => (
                <PdListCard key={p.id as string} pd={p} href={pd(p.id as string)} />
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">
              Payer Policy
            </p>
            <div className="space-y-2">
              {payerEca.map((p) => (
                <PdListCard key={p.id as string} pd={p} href={pd(p.id as string)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Order Sets */}
      <section>
        <div className="flex items-baseline gap-2 mb-4">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
            Order Sets
          </h2>
          <span className="text-xs text-slate-400">regimen templates</span>
        </div>
        <p className="text-xs font-semibold text-violet-600 uppercase tracking-wider mb-2">
          Regimen Templates
        </p>
        <div className="grid grid-cols-2 gap-2">
          {orderSets.map((p) => (
            <PdListCard key={p.id as string} pd={p} href={pd(p.id as string)} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail view
// ---------------------------------------------------------------------------

function DetailView({ pd, embedded }: { pd: AnyPlanDef; embedded: boolean }) {
  const backHref = embedded ? "/?tab=content" : "/content";
  const id = pd.id as string;
  const tc = typeCode(pd);
  const lc = layerDisplay(pd);
  const st = pd.status as string;
  const actions = (pd.action as Record<string, unknown>[] | undefined) ?? [];

  // Regimen-specific extensions (order-sets)
  const isOrderSet = tc === "order-set";
  const rIntent = isOrderSet ? extDisplay(pd, "ocpa-regimen-intent") : undefined;
  const rLine = isOrderSet ? extDisplay(pd, "ocpa-regimen-treatment-line") : undefined;
  const rDisease = isOrderSet ? extDisplay(pd, "ocpa-regimen-disease-context") : undefined;
  const rSubject = (
    pd.subjectCodeableConcept as { coding?: Array<{ display?: string }> } | undefined
  )?.coding?.[0]?.display;

  // Find linked libraries — a PlanDefinition may reference multiple
  // (e.g. BreastCancerPAWorkflow links both a data-requirements catalog
  // and an executable payer policy CQL library).
  const libIds = linkedLibraryIds(pd);

  // Find referenced order-sets (for eca-rules)
  const refOrderSetIds = tc === "eca-rule" ? collectDefinitionRefs(actions) : [];
  const refOrderSets = ALL_PLAN_DEFS.filter((p) => refOrderSetIds.includes(p.id as string));

  return (
    <div className="space-y-6">
      {/* Back + breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href={backHref} className="hover:text-slate-800 transition-colors font-medium">
          ← All artifacts
        </Link>
        <span className="text-slate-300">/</span>
        <span>{tc === "eca-rule" ? "ECA Rules" : "Order Sets"}</span>
        {lc && (
          <>
            <span className="text-slate-300">/</span>
            <span>{lc}</span>
          </>
        )}
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-1.5 flex-wrap mb-2">
          {typeBadge(tc)}
          {layerBadge(layerCode(pd))}
          {statusBadge(st)}
          <span className="font-mono text-xs text-slate-400">v{pd.version as string}</span>
          <a
            href={`/fhir/PlanDefinition/${id}`}
            target="_blank"
            rel="noreferrer"
            className="ml-auto text-xs font-mono text-blue-600 hover:text-blue-700 hover:underline"
          >
            View FHIR source &#x7B;&#x7D;
          </a>
        </div>
        <h1 className="text-xl font-semibold text-slate-900">{pd.title as string}</h1>
        {(pd.description as string | undefined) && (
          <p className="text-sm text-slate-600 mt-1">{pd.description as string}</p>
        )}
        {(pd.purpose as string | undefined) && (
          <p className="text-sm text-slate-500 mt-1 italic">{pd.purpose as string}</p>
        )}

        {/* Regimen clinical context (order-sets only) */}
        {isOrderSet && (rSubject ?? rIntent ?? rLine) && (
          <div className="flex flex-wrap gap-2 mt-3">
            {rSubject && (
              <span className="text-xs bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-slate-600">
                <span className="font-medium text-slate-400">Subject:</span> {rSubject}
              </span>
            )}
            {rIntent && (
              <span className="text-xs bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-slate-600">
                <span className="font-medium text-slate-400">Intent:</span> {rIntent}
              </span>
            )}
            {rLine && (
              <span className="text-xs bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-slate-600">
                <span className="font-medium text-slate-400">Line:</span> {rLine}
              </span>
            )}
            {rDisease && rDisease !== rSubject && (
              <span className="text-xs bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-slate-600">
                <span className="font-medium text-slate-400">Disease context:</span> {rDisease}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {actions.length > 0 && (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Actions</p>
          </div>
          <ul className="px-4 py-3 space-y-1">
            {actions.map((a, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: actions have no stable id
              <ActionNode key={i} action={a} />
            ))}
          </ul>
        </div>
      )}

      {/* Linked Libraries — render all, not just the first */}
      {libIds.length > 0 && (
        <div className="space-y-4">
          {libIds.map((libId) => {
            const files = CQL_FILES[libId];
            const cql = files ? readFile(path.join(CQL_DIR, files.cql)) : "";
            const elm = files ? readFile(path.join(ELM_DIR, files.elm)) : "";
            return (
              <LibraryPanel
                key={libId}
                libId={libId}
                cqlSource={cql}
                elmSource={elm}
              />
            );
          })}
        </div>
      )}

      {/* Referenced order-sets */}
      {refOrderSets.length > 0 && (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Referenced Order Sets
            </p>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">
            {refOrderSets.map((p) => (
              <PdListCard
                key={p.id as string}
                pd={p}
                href={embedded ? `/?tab=content&pd=${p.id as string}` : `?pd=${p.id as string}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function ContentPage({
  embedded = false,
  pd: pdProp,
  searchParams: pageSearchParams,
}: {
  embedded?: boolean;
  pd?: string;
  searchParams?: Promise<Record<string, string>>;
}) {
  const sp = pageSearchParams ? await pageSearchParams : ({} as Record<string, string>);
  const selectedId = pdProp ?? sp.pd;
  const selectedPd = selectedId ? ALL_PLAN_DEFS.find((p) => p.id === selectedId) : undefined;

  const inner = (
    <div>
      {selectedPd ? (
        <DetailView pd={selectedPd} embedded={embedded} />
      ) : (
        <ListView embedded={embedded} />
      )}
    </div>
  );

  if (embedded) return inner;

  return (
    <div className="min-h-screen bg-slate-100">
      <nav className="bg-slate-800 text-slate-100 px-6 py-3 flex items-center justify-between text-sm">
        <div className="font-semibold">MOPA Reference Hub</div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <Link href="/" className="hover:text-slate-200 transition-colors">
            ← Hub
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-slate-200">Clinical Content</span>
        </div>
      </nav>
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-lg font-semibold text-slate-900">Clinical Content</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            FHIR knowledge artifacts governing the MOPA two-layer CDS architecture. Browse
            PlanDefinitions by type and layer, then inspect related Libraries and order sets.
          </p>
        </div>
      </div>
      <main className="max-w-4xl mx-auto px-6 py-7">{inner}</main>
    </div>
  );
}
