"use client";

import { useEffect, useRef, useState } from "react";
import type { LogEntry, ServiceName } from "@ogca/logger";

// ---------------------------------------------------------------------------
// Colours + labels
// ---------------------------------------------------------------------------

const SERVICE_STYLE: Record<ServiceName, string> = {
  crd: "bg-amber-100  text-amber-800  border-amber-300",
  dtr: "bg-violet-100 text-violet-800 border-violet-300",
  pas: "bg-slate-100  text-slate-700  border-slate-300",
  payer: "bg-orange-100 text-orange-800 border-orange-300",
  ehr: "bg-slate-800  text-white       border-slate-700",
  smart: "bg-blue-100  text-blue-800   border-blue-300",
  hub: "bg-teal-100  text-teal-800   border-teal-300",
};

const SERVICE_DOT: Record<ServiceName, string> = {
  crd: "bg-amber-500",
  dtr: "bg-violet-500",
  pas: "bg-slate-500",
  payer: "bg-orange-500",
  ehr: "bg-slate-800",
  smart: "bg-blue-500",
  hub: "bg-teal-500",
};

const STATUS_STYLE = (s?: number) =>
  !s
    ? "text-slate-400"
    : s < 300
      ? "text-green-700"
      : s < 400
        ? "text-blue-700"
        : s < 500
          ? "text-amber-700"
          : "text-red-700";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Group {
  correlationId: string;
  entries: LogEntry[];
  patientId?: string;
  hook?: string;
  outcome?: string;
  startTs: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function groupEntries(entries: LogEntry[]): Group[] {
  const map = new Map<string, Group>();
  for (const e of entries) {
    const key = e.correlationId ?? `ungrouped-${e.ts}`;
    if (!map.has(key)) {
      map.set(key, {
        correlationId: key,
        entries: [],
        patientId: e.patientId,
        hook: e.hook,
        outcome: undefined,
        startTs: e.ts,
      });
    }
    const g = map.get(key)!;
    g.entries.push(e);
    if (e.patientId) g.patientId = e.patientId;
    if (e.hook) g.hook = e.hook;
    if (e.outcome) g.outcome = e.outcome;
  }
  // Return newest group first
  return [...map.values()];
}

function relativeTime(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 5_000) return "just now";
  if (diff < 60_000) return `${Math.floor(diff / 1_000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return new Date(ts).toLocaleTimeString();
}

// ---------------------------------------------------------------------------
// Entry row
// ---------------------------------------------------------------------------

function EntryRow({ entry }: { entry: LogEntry }) {
  const [open, setOpen] = useState(false);
  const svc = entry.service as ServiceName;

  return (
    <div className="border-t border-slate-100 first:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 transition-colors"
      >
        {/* Service dot */}
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${SERVICE_DOT[svc] ?? "bg-slate-400"}`}
        />

        {/* Service badge */}
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border flex-shrink-0 ${SERVICE_STYLE[svc] ?? ""}`}
        >
          {entry.service}
        </span>

        {/* Type */}
        <span className="font-mono text-[10px] text-slate-500 flex-shrink-0">{entry.type}</span>

        {/* Method + path */}
        {entry.method && (
          <span className="font-mono text-xs text-slate-400 flex-shrink-0">{entry.method}</span>
        )}
        {entry.path && (
          <span className="font-mono text-xs text-slate-600 truncate flex-1">{entry.path}</span>
        )}

        {/* Summary */}
        {!entry.path && (
          <span className="text-xs text-slate-600 truncate flex-1">{entry.summary}</span>
        )}

        {/* Status + duration */}
        <span className={`font-mono text-[10px] flex-shrink-0 ${STATUS_STYLE(entry.status)}`}>
          {entry.status}
        </span>
        {entry.durationMs != null && (
          <span className="text-[10px] text-slate-400 flex-shrink-0">{entry.durationMs}ms</span>
        )}

        {/* Expand indicator */}
        <span className="text-slate-300 text-xs flex-shrink-0">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          {/* Summary row */}
          <p className="text-xs text-slate-600 font-medium">{entry.summary}</p>

          {/* Payload panels */}
          {entry.request != null && (
            <details className="group">
              <summary className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:text-slate-600">
                Request ▾
              </summary>
              <pre className="mt-1 text-[10px] font-mono bg-slate-950 text-slate-100 p-2 rounded overflow-x-auto max-h-64 leading-relaxed">
                {JSON.stringify(entry.request, null, 2)}
              </pre>
            </details>
          )}
          {entry.response != null && (
            <details className="group">
              <summary className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:text-slate-600">
                Response ▾
              </summary>
              <pre className="mt-1 text-[10px] font-mono bg-slate-950 text-slate-100 p-2 rounded overflow-x-auto max-h-64 leading-relaxed">
                {JSON.stringify(entry.response, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Interaction group
// ---------------------------------------------------------------------------

function GroupRow({ group, defaultOpen }: { group: Group; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const outcomeColor =
    group.outcome === "pre-approved"
      ? "text-green-700"
      : group.outcome === "pa-required"
        ? "text-amber-700"
        : group.outcome === "dtr-required"
          ? "text-violet-700"
          : group.outcome === "approved"
            ? "text-green-700"
            : "text-slate-500";

  const isUngrouped = group.correlationId.startsWith("ungrouped-");

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left bg-slate-50 px-4 py-2.5 flex items-center gap-3 hover:bg-slate-100 transition-colors"
      >
        <span className="flex-1 flex items-center gap-2 min-w-0">
          {/* Correlation / hook info */}
          {!isUngrouped && (
            <span className="font-mono text-xs text-slate-500 flex-shrink-0">
              {group.correlationId.slice(0, 8)}
            </span>
          )}
          {group.hook && (
            <span className="text-xs font-medium text-slate-700 flex-shrink-0">{group.hook}</span>
          )}
          {group.patientId && (
            <span className="text-xs text-slate-500 flex-shrink-0">· {group.patientId}</span>
          )}
          {group.outcome && (
            <span className={`text-xs font-semibold flex-shrink-0 ${outcomeColor}`}>
              → {group.outcome}
            </span>
          )}
          <span className="text-[10px] text-slate-400 ml-auto flex-shrink-0">
            {group.entries.length} event{group.entries.length !== 1 ? "s" : ""} ·{" "}
            {relativeTime(group.startTs)}
          </span>
        </span>
        <span className="text-slate-400 text-xs flex-shrink-0">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="divide-y divide-slate-50">
          {group.entries.map((e, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: log entries have no stable id
            <EntryRow key={i} entry={e} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ActivityFeed() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState<ServiceName | "all">("all");
  const [connected, setConnected] = useState(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const es = new EventSource("/api/log/stream");

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.onmessage = (event: MessageEvent) => {
      if (pausedRef.current) return;
      try {
        const entry = JSON.parse(event.data as string) as LogEntry;
        setEntries((prev) => [...prev.slice(-499), entry]);
      } catch {
        /* malformed event */
      }
    };

    return () => es.close();
  }, []);

  // Scroll to bottom whenever new entries arrive and the feed is not paused
  useEffect(() => {
    if (!paused) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [paused]);

  const filtered = filter === "all" ? entries : entries.filter((e) => e.service === filter);

  const groups = groupEntries(filtered);

  const services: Array<ServiceName | "all"> = ["all", "crd", "dtr", "pas", "payer", "smart"];

  return (
    <div className="space-y-4 w-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Connection status */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-400"}`} />
          <span className="text-slate-500">{connected ? "Live" : "Disconnected"}</span>
        </div>

        {/* Service filter */}
        <div className="flex gap-1 flex-wrap">
          {services.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilter(s)}
              className={`text-[10px] font-semibold px-2 py-1 rounded border transition-colors ${
                filter === s
                  ? "bg-slate-800 text-white border-slate-800"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
            >
              {s === "all" ? "All services" : s.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="text-xs px-3 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            {paused ? "▶ Resume" : "⏸ Pause"}
          </button>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/log", { method: "DELETE" });
              setEntries([]);
            }}
            className="text-xs px-3 py-1 rounded border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Log groups */}
      {groups.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          <p className="font-medium">No activity yet</p>
          <p className="mt-1 text-xs">
            Open the EHR, load a patient chart, and place an order to see CDS Hooks traffic here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((g, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: groups keyed by correlationId but may collide for ungrouped
            <GroupRow
              key={`${g.correlationId}-${i}`}
              group={g}
              defaultOpen={i === groups.length - 1}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
