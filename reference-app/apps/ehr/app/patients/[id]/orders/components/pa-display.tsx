"use client";

import { INDICATOR_CONFIG, type IndicatorConfig } from "./cds-cards";

// ---------------------------------------------------------------------------
// PA outcome display — uses the same indicator vocabulary as CDS cards
// ---------------------------------------------------------------------------

export interface ClaimResponseSummary {
  outcome: string;
  disposition?: string;
}

export function ClaimResponseDisplay({ outcome, disposition }: ClaimResponseSummary) {
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
    <div className={`rounded px-4 py-3 flex items-start gap-3 ${bgClass}`}>
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
  );
}
