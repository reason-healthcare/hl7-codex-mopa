"use client";

import { INDICATOR_CONFIG, type IndicatorConfig } from "./cds-cards";

// ---------------------------------------------------------------------------
// PA outcome display — uses the same indicator vocabulary as CDS cards
// ---------------------------------------------------------------------------

export interface ProcessNote {
  text: string;
}

export interface ClaimResponseSummary {
  outcome: string;
  disposition?: string;
  /** Process notes carrying substitution details when the payer modifies the order. */
  processNote?: ProcessNote[];
}

export function ClaimResponseDisplay({ outcome, disposition, processNote }: ClaimResponseSummary) {
  const isApproved = outcome === "complete";
  const isPending = outcome === "queued";

  let cfg: IndicatorConfig;
  let label: string;

  if (isApproved) {
    cfg = INDICATOR_CONFIG.info;
    label = "PA Approved";
  } else if (isPending) {
    cfg = INDICATOR_CONFIG.warning;
    label = "Pending Review";
  } else {
    cfg = INDICATOR_CONFIG.critical;
    label = "PA Denied";
  }

  const bgClass = isApproved ? "bg-green-50" : isPending ? "bg-amber-50" : "bg-red-50";

  return (
    <div className={bgClass}>
      <div className="rounded px-4 py-3 flex items-start gap-3">
        <span
          className={`mt-0.5 flex-shrink-0 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${cfg.badgeBg} ${cfg.badgeText}`}
          role="img"
          aria-label={cfg.label}
        >
          <span aria-hidden="true">{cfg.icon}</span>
          {cfg.label}
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          {disposition && <p className="text-sm text-slate-600 mt-0.5">{disposition}</p>}
        </div>
      </div>

      {/* Payer substitution notes — shown when the payer modifies the order */}
      {processNote && processNote.length > 0 && (
        <div className="border-t border-violet-200 bg-violet-50 px-4 py-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-violet-100 text-violet-800">
              <span aria-hidden="true">⚠</span>
              Payer Modification
            </span>
          </div>
          <div className="space-y-2">
            {processNote.map((note, i) => (
              <p
                // biome-ignore lint/suspicious/noArrayIndexKey: process notes have no stable id
                key={i}
                className="text-sm text-slate-700"
              >
                {note.text}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
