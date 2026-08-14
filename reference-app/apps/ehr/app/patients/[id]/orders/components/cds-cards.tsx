"use client";

import type { CdsCard } from "@mopa/cds-hooks";
import type { Regimen } from "@mopa/oncology-policy";

// ---------------------------------------------------------------------------
// SMART launch URL builder
// ---------------------------------------------------------------------------

const EHR_BASE_URL = process.env.NEXT_PUBLIC_EHR_BASE_URL ?? "http://localhost:4001";

/**
 * Build a SMART EHR launch URL for a CDS Hooks smart link per the CDS Hooks spec:
 * https://cds-hooks.org/specification/current/#link
 *
 * The EHR appends iss (its own FHIR server) and launch (patient context) to the
 * app's launch endpoint, then includes appContext and any extra params.
 */
export function buildSmartLaunchUrl(
  link: { url: string; appContext?: string },
  patientId: string,
  extraParams?: Record<string, string>
): string {
  const url = new URL(link.url);
  url.searchParams.set("iss", `${EHR_BASE_URL}/api/fhir`);
  url.searchParams.set("launch", `patient/${patientId}`);
  if (link.appContext) url.searchParams.set("appContext", link.appContext);
  if (extraParams) {
    for (const [k, v] of Object.entries(extraParams)) url.searchParams.set(k, v);
  }
  return url.toString();
}

// ---------------------------------------------------------------------------
// Markdown rendering
// ---------------------------------------------------------------------------

/** Render **bold** markdown spans used in CRD detail strings. */
export function renderDetail(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: markdown split has no stable key
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      // biome-ignore lint/suspicious/noArrayIndexKey: markdown split has no stable key
      <span key={i}>{part}</span>
    )
  );
}

// ---------------------------------------------------------------------------
// Indicator vocabulary
// ---------------------------------------------------------------------------

interface IndicatorConfig {
  icon: string;
  label: string;
  badgeBg: string;
  badgeText: string;
}

const INDICATOR_CONFIG: Record<string, IndicatorConfig> = {
  info: {
    icon: "✓",
    label: "Info",
    badgeBg: "bg-green-100",
    badgeText: "text-green-800",
  },
  warning: {
    icon: "⚠",
    label: "Warning",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-800",
  },
  critical: {
    icon: "✕",
    label: "Critical",
    badgeBg: "bg-red-100",
    badgeText: "text-red-800",
  },
};

const INDICATOR_FALLBACK: IndicatorConfig = {
  icon: "ⓘ",
  label: "Notice",
  badgeBg: "bg-slate-100",
  badgeText: "text-slate-700",
};

export { INDICATOR_CONFIG, INDICATOR_FALLBACK };
export type { IndicatorConfig };

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------

/** Colored badge: icon + label. Used by both card rows and the structured order-select summary. */
export function StatusBadge({ indicator, label }: { indicator: string; label: string }) {
  const cfg = INDICATOR_CONFIG[indicator] ?? INDICATOR_FALLBACK;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${cfg.badgeBg} ${cfg.badgeText}`}
    >
      <span aria-hidden="true">{cfg.icon}</span>
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Draft order details
// ---------------------------------------------------------------------------

/**
 * Renders the selected regimen's drug details as a compact list.
 * Shown in the Coverage Discovery panel so the clinician sees exactly
 * what is being evaluated before signing.
 */
function DraftOrderDetails({ regimen }: { regimen: Regimen }) {
  return (
    <div className="space-y-2">
      {regimen.phases.map((phase) => (
        <div key={phase.id}>
          <p className="text-xs font-medium text-slate-500">{phase.title}</p>
          <ul className="mt-1 space-y-1">
            {phase.drugs.map((drug) => (
              <li key={drug.actionId} className="text-sm text-slate-700">
                <span className="font-medium">{drug.display}</span>
                <span className="text-slate-400"> · {drug.dosageText}</span>
                {drug.biosimilars?.map((bio) => (
                  <span
                    key={bio.rxnorm}
                    className="ml-2 inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded bg-violet-100 text-violet-800"
                  >
                    → {bio.display}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CDS card row
// ---------------------------------------------------------------------------

/**
 * A single CDS card row. All cards — regardless of source topic — use this
 * component so the EHR presents a consistent vocabulary for remote guidance.
 * No background color: status is conveyed by badge alone.
 */
export function CdsCardRow({
  card,
  patientId,
  selectedRegimenId,
}: {
  card: CdsCard;
  patientId: string;
  selectedRegimenId?: string;
}) {
  const cfg = INDICATOR_CONFIG[card.indicator] ?? INDICATOR_FALLBACK;

  return (
    <div className="px-4 py-3 bg-slate-50">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex-shrink-0">
          <StatusBadge indicator={card.indicator} label={cfg.label} />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug text-slate-900">{card.summary}</p>
          {card.detail && (
            <p className="mt-1 text-sm text-slate-600 leading-relaxed">
              {renderDetail(card.detail)}
            </p>
          )}
          {card.links && card.links.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {card.links.map((link) => {
                const href =
                  link.type === "smart"
                    ? buildSmartLaunchUrl(
                        link,
                        patientId,
                        selectedRegimenId ? { returnRegimen: selectedRegimenId } : undefined
                      )
                    : link.url;
                return (
                  <a
                    key={link.url}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors"
                  >
                    {link.label}
                    <span aria-hidden="true" className="text-slate-400">
                      ↗
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Order-select summary
// ---------------------------------------------------------------------------

/**
 * Structured summary for order-select responses.
 * Shows the draft order being evaluated, Coverage Criteria status, and
 * PA Requirement when determinable.
 */
export function OrderSelectSummary({
  cards,
  patientId,
  selectedRegimenId,
  regimen,
}: {
  cards: CdsCard[];
  patientId: string;
  selectedRegimenId?: string;
  regimen?: Regimen;
}) {
  // At order-select: info indicator = approvable; warning + prior-auth = PA will be required
  // At order-sign: success indicator = authorization satisfied; warning + prior-auth = PA required
  const approvable = cards.some((c) => c.indicator === "info");
  const authSatisfied = cards.some((c) => c.indicator === "success");
  const paRequired = cards.some((c) => c.source.topic?.code === "prior-auth-required");
  const dtrCard = cards.find((c) => (c.links?.length ?? 0) > 0);
  const coverageMet = approvable || authSatisfied || paRequired;

  return (
    <div className="divide-y divide-slate-100">
      {/* Row 0: Selected Order — what is being evaluated */}
      {regimen && (
        <div className="px-4 py-3 bg-slate-50">
          <span className="text-xs text-slate-400 block mb-2">Selected Order</span>
          <div className="flex items-start gap-2">
            <span className="text-sm font-semibold text-slate-900">{regimen.shortLabel}</span>
            <span className="text-xs text-slate-400 mt-0.5">{regimen.description}</span>
          </div>
          <div className="mt-2">
            <DraftOrderDetails regimen={regimen} />
          </div>
        </div>
      )}

      {/* Row 1: Coverage Criteria */}
      <div className="px-4 py-3 flex items-start gap-4 bg-slate-50">
        <span className="text-xs text-slate-400 w-36 flex-shrink-0 pt-0.5">Coverage Criteria</span>
        <div className="flex-1">
          {coverageMet ? (
            <StatusBadge indicator="info" label={approvable ? "Approvable" : "Met"} />
          ) : (
            <>
              <StatusBadge indicator={cards[0]?.indicator ?? "warning"} label="Incomplete" />
              {(dtrCard ?? cards[0])?.detail && (
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                  {/* biome-ignore lint/style/noNonNullAssertion: guarded by .detail check above */}
                  {renderDetail((dtrCard ?? cards[0])!.detail!)}
                </p>
              )}
              {(dtrCard?.links ?? []).length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {dtrCard?.links?.map((link) => {
                    const href =
                      link.type === "smart"
                        ? buildSmartLaunchUrl(
                            link,
                            patientId,
                            selectedRegimenId ? { returnRegimen: selectedRegimenId } : undefined
                          )
                        : link.url;
                    return (
                      <a
                        key={link.url}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors"
                      >
                        {link.label}
                        <span aria-hidden="true" className="text-slate-400">
                          ↗
                        </span>
                      </a>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Row 2: PA Requirement — shown when coverage criteria are met.
           authorization-satisfied (ECOG 0) → PA not required.
           pa-required (ECOG ≥ 1) → PA must be submitted before fulfillment. */}
      {coverageMet && (
        <div className="px-4 py-3 flex items-start gap-4 bg-slate-50">
          <span className="text-xs text-slate-400 w-36 flex-shrink-0 pt-0.5">PA Requirement</span>
          {paRequired ? (
            <StatusBadge indicator="warning" label="Required" />
          ) : (
            <StatusBadge indicator="info" label="Not required" />
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Coverage Discovery panel
// ---------------------------------------------------------------------------

/**
 * Panel wrapping all cards returned by one CDS hook call.
 * The header makes provenance explicit: which service responded, and to which hook.
 */
export function CrdResponsePanel({
  cards,
  hook,
  patientId,
  selectedRegimenId,
  regimen,
}: {
  cards: CdsCard[];
  hook: "order-select" | "order-sign";
  patientId: string;
  selectedRegimenId?: string;
  regimen?: Regimen;
}) {
  const sourceLabel = cards[0]?.source.label ?? "CRD Service";

  return (
    <div className="border border-slate-200 rounded overflow-hidden">
      {/* Provenance header */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Coverage Discovery
        </span>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>{sourceLabel}</span>
          <span aria-hidden="true">·</span>
          <code className="font-mono">{hook}</code>
        </div>
      </div>

      {hook === "order-select" ? (
        <OrderSelectSummary
          cards={cards}
          patientId={patientId}
          selectedRegimenId={selectedRegimenId}
          regimen={regimen}
        />
      ) : (
        <div className="divide-y divide-slate-100">
          {cards.map((card, i) => (
            <CdsCardRow
              key={card.uuid ?? i}
              card={card}
              patientId={patientId}
              selectedRegimenId={selectedRegimenId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
