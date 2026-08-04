"use client";

import { useEffect, useRef, useState } from "react";
import type { LogEntry, ServiceName } from "@mopa/logger";

// ---------------------------------------------------------------------------
// Service identity tokens
// ---------------------------------------------------------------------------

const SVC_BADGE: Record<ServiceName, string> = {
  crd:   "bg-amber-100  text-amber-800  border-amber-300",
  dtr:   "bg-violet-100 text-violet-800 border-violet-300",
  pas:   "bg-slate-100  text-slate-700  border-slate-300",
  payer: "bg-orange-100 text-orange-800 border-orange-300",
  ehr:   "bg-slate-800  text-white      border-slate-700",
  smart: "bg-blue-100   text-blue-800   border-blue-300",
  hub:   "bg-teal-100   text-teal-800   border-teal-300",
};

const SVC_DOT: Record<ServiceName, string> = {
  crd:   "bg-amber-400",
  dtr:   "bg-violet-400",
  pas:   "bg-slate-400",
  payer: "bg-orange-400",
  ehr:   "bg-slate-600",
  smart: "bg-blue-400",
  hub:   "bg-teal-400",
};

const METHOD_COLOR: Record<string, string> = {
  GET:    "text-sky-600",
  POST:   "text-violet-600",
  PUT:    "text-amber-600",
  DELETE: "text-red-600",
  PATCH:  "text-orange-600",
};

const STATUS_COLOR = (s: number) =>
  s < 300 ? "text-green-700" : s < 400 ? "text-sky-600" : s < 500 ? "text-amber-700" : "text-red-600";

const OUTCOME_COLOR: Record<string, string> = {
  "pre-approved":  "text-green-700",
  "pa-required":   "text-amber-700",
  "dtr-required":  "text-violet-700",
  "approved":      "text-green-700",
};

// ---------------------------------------------------------------------------
// Data model
// ---------------------------------------------------------------------------

interface Group {
  correlationId: string;
  entries: LogEntry[];
  patientId?: string;
  hook?: string;
  outcome?: string;
  startTs: string;
}

function groupEntries(entries: LogEntry[]): Group[] {
  const map = new Map<string, Group>();
  for (const e of entries) {
    const key = e.correlationId ?? `ungrouped-${e.ts}`;
    if (!map.has(key)) {
      map.set(key, { correlationId: key, entries: [], patientId: e.patientId, hook: e.hook, outcome: undefined, startTs: e.ts });
    }
    const g = map.get(key)!;
    g.entries.push(e);
    if (e.patientId) g.patientId = e.patientId;
    if (e.hook)      g.hook      = e.hook;
    if (e.outcome)   g.outcome   = e.outcome;
  }
  return [...map.values()];
}

function relativeTime(ts: string): string {
  const d = Date.now() - new Date(ts).getTime();
  if (d < 5_000)     return "just now";
  if (d < 60_000)    return `${Math.floor(d / 1_000)}s ago`;
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  return new Date(ts).toLocaleTimeString();
}

// ---------------------------------------------------------------------------
// Group divider — non-interactive section header
// ---------------------------------------------------------------------------

function GroupDivider({ group }: { group: Group }) {
  const isUngrouped = group.correlationId.startsWith("ungrouped-");
  const shortId = isUngrouped
    ? new Date(group.startTs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })
    : group.correlationId.slice(0, 8);
  const services = [...new Set(group.entries.map((e) => e.service as ServiceName))];
  const outcomeColor = group.outcome ? (OUTCOME_COLOR[group.outcome] ?? "text-slate-500") : undefined;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border-b border-slate-100">
      {/* Service badges */}
      {services.map((svc) => (
        <span
          key={svc}
          className={`text-[10px] font-semibold px-1.5 py-px rounded border flex-shrink-0 ${SVC_BADGE[svc] ?? ""}`}
        >
          {svc}
        </span>
      ))}

      {/* Correlation ID — sits after the badge so the service origin reads first */}
      <span className="font-mono text-[10px] text-slate-400 flex-shrink-0 tabular-nums">
        {shortId}
      </span>

      {/* Hook type */}
      {group.hook && (
        <span className="text-[10px] font-medium text-slate-600 flex-shrink-0">{group.hook}</span>
      )}

      {/* Patient */}
      {group.patientId && (
        <span className="text-[10px] text-slate-400 flex-shrink-0">· {group.patientId}</span>
      )}

      {/* Outcome */}
      {group.outcome && (
        <span className={`text-[10px] font-semibold flex-shrink-0 ${outcomeColor}`}>
          → {group.outcome}
        </span>
      )}

      {/* Rule */}
      <span className="flex-1 h-px bg-slate-200 mx-1" />

      {/* Entry count + timestamp */}
      <span className="text-[10px] text-slate-400 flex-shrink-0 tabular-nums">
        {group.entries.length === 1 ? "1 event" : `${group.entries.length} events`}
        {" · "}
        {relativeTime(group.startTs)}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Entry row — the single interactive unit
// ---------------------------------------------------------------------------

function EntryRow({ entry }: { entry: LogEntry }) {
  const [open, setOpen] = useState(false);
  const svc       = entry.service as ServiceName;
  // A request object that contains only a `url` key is redundant: the URL
  // is already shown as entry.path on the row. Suppress expand + panel for
  // those cases only; non-trivial GET requests (e.g. dtr.launch context)
  // should still be expandable.
  const isUrlOnlyRequest = (req: unknown): boolean => {
    if (!req || typeof req !== "object") return false;
    const keys = Object.keys(req as object);
    return keys.length === 1 && "url" in (req as object);
  };

  const hasPayload =
    (entry.request != null && !isUrlOnlyRequest(entry.request)) ||
    entry.response != null ||
    (entry.path != null && entry.summary != null && entry.level !== "info");

  // The primary label: method + path when present, otherwise summary.
  // Summary is reserved for the expanded panel to avoid repetition.
  const showSummaryOnRow = !entry.path;

  return (
    <div className="border-b border-slate-100 last:border-0">
      {/* Row */}
      <button
        type="button"
        disabled={!hasPayload}
        onClick={() => setOpen((o) => !o)}
        className={[
          "w-full text-left px-3 py-1.5 flex items-center gap-2 transition-colors",
          hasPayload ? "hover:bg-slate-50/80 cursor-pointer" : "cursor-default",
          open ? "bg-slate-50" : "",
        ].join(" ")}
      >
        {/* Service dot */}
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-px ${SVC_DOT[svc] ?? "bg-slate-400"}`} />

        {/* Log type */}
        <span className="font-mono text-[10px] text-slate-500 flex-shrink-0">{entry.type}</span>

        {/* Divider */}
        <span className="text-slate-200 text-[10px] flex-shrink-0" aria-hidden>·</span>

        {/* Method */}
        {entry.method && (
          <span className={`font-mono text-[11px] font-semibold flex-shrink-0 ${METHOD_COLOR[entry.method] ?? "text-slate-600"}`}>
            {entry.method}
          </span>
        )}

        {/* Path or summary */}
        {entry.path ? (
          <span className="font-mono text-[11px] text-slate-700 truncate flex-1 min-w-0">
            {entry.path}
          </span>
        ) : showSummaryOnRow ? (
          <span className="text-[11px] text-slate-600 truncate flex-1 min-w-0">
            {entry.summary}
          </span>
        ) : (
          <span className="flex-1 min-w-0" />
        )}

        {/* Status — only when defined */}
        {entry.status != null && entry.status > 0 && (
          <span className={`font-mono text-[10px] flex-shrink-0 tabular-nums ${STATUS_COLOR(entry.status)}`}>
            {entry.status}
          </span>
        )}

        {/* Duration */}
        {entry.durationMs != null && (
          <span className="text-[10px] text-slate-400 flex-shrink-0 tabular-nums">
            {entry.durationMs}ms
          </span>
        )}

        {/* Expand toggle — only when there is something to show */}
        {hasPayload && (
          <span className="text-[10px] text-slate-400 flex-shrink-0 w-3 text-right">
            {open ? "▲" : "▾"}
          </span>
        )}
      </button>

      {/* Expanded payload panel — one level, no nested expand */}
      {open && (
        <div className="px-3 pt-1 pb-3 space-y-3 bg-slate-50 border-t border-slate-100">
          {/* Summary — only for warn/error entries; success summaries restate
              what is already visible (method, path, status, duration) */}
          {entry.path && entry.summary && entry.level !== "info" && (
            <p className="text-[11px] text-slate-500 leading-snug">{entry.summary}</p>
          )}

          {entry.request != null && !isUrlOnlyRequest(entry.request) && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Request
              </p>
              <pre className="text-[10px] font-mono bg-slate-950 text-slate-200 px-3 py-2.5 rounded overflow-x-auto max-h-72 leading-relaxed">
                {JSON.stringify(entry.request, null, 2)}
              </pre>
            </div>
          )}

          {entry.response != null && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Response
              </p>
              <pre className="text-[10px] font-mono bg-slate-950 text-slate-200 px-3 py-2.5 rounded overflow-x-auto max-h-72 leading-relaxed">
                {JSON.stringify(entry.response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activity feed
// ---------------------------------------------------------------------------

export default function ActivityFeed() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [paused,  setPaused]  = useState(false);
  const [filter,  setFilter]  = useState<ServiceName | "all">("all");
  const [connected, setConnected] = useState(false);

  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const es = new EventSource("/api/log/stream");
    es.onopen  = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.onmessage = (event: MessageEvent) => {
      if (pausedRef.current) return;
      try {
        const entry = JSON.parse(event.data as string) as LogEntry;
        setEntries((prev) => [...prev.slice(-499), entry]);
      } catch { /* malformed */ }
    };
    return () => es.close();
  }, []);

  useEffect(() => {
    if (!paused) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length, paused]);

  const filtered = filter === "all" ? entries : entries.filter((e) => e.service === filter);
  const groups   = groupEntries(filtered);

  const services: Array<ServiceName | "all"> = ["all", "crd", "dtr", "pas", "payer", "smart"];

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">

        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-500" : "bg-slate-300"}`} />
          <span className="text-[11px] text-slate-500">{connected ? "Live" : "Disconnected"}</span>
        </div>

        {/* Service filter pills */}
        <div className="flex gap-1 flex-wrap">
          {services.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={[
                "text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors",
                filter === s
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:text-slate-700",
              ].join(" ")}
            >
              {s === "all" ? "All" : s.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="ml-auto flex gap-1.5">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="text-[11px] px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {paused ? "▶ Resume" : "⏸ Pause"}
          </button>
          <button
            type="button"
            onClick={async () => { await fetch("/api/log", { method: "DELETE" }); setEntries([]); }}
            className="text-[11px] px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* ── Feed ────────────────────────────────────────────────────────── */}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-1">
          <p className="text-sm font-medium text-slate-500">No activity yet</p>
          <p className="text-xs">Open the EHR, select a patient, and place an order.</p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
          {groups.map((g, gi) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: groups keyed by correlationId but ungrouped may collide
            <div key={`${g.correlationId}-${gi}`}>
              <GroupDivider group={g} />
              {g.entries.map((e, ei) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: log entries have no stable id
                <EntryRow key={ei} entry={e} />
              ))}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
