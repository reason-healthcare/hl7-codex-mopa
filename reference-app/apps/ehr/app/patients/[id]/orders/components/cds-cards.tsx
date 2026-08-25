"use client";

import type { CdsCard, CdsSuggestion } from "@mopa/cds-hooks";

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

export type { IndicatorConfig };
export { INDICATOR_CONFIG, INDICATOR_FALLBACK };

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
// Suggestion panel
// ---------------------------------------------------------------------------

/**
 * Renders a CDS Hooks suggestion as Accept/Override buttons.
 * When the provider accepts, the EHR applies the delete + create actions
 * to update the draft orders. When overridden, the original order proceeds.
 */
export function SuggestionPanel({
  card,
  onAccept,
  onOverride,
  accepted,
  overridden,
}: {
  card: CdsCard;
  onAccept: () => void;
  onOverride: () => void;
  accepted: boolean;
  overridden: boolean;
}) {
  const suggestions = card.suggestions ?? [];
  if (suggestions.length === 0) return null;

  return (
    <div className="px-4 py-3 bg-violet-50 border-t border-violet-200">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex-shrink-0 text-violet-600" aria-hidden="true">
          ⬆
        </span>
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm font-semibold text-violet-900">{card.summary}</p>
            {card.detail && (
              <p className="mt-1 text-sm text-violet-700 leading-relaxed">
                {renderDetail(card.detail)}
              </p>
            )}
          </div>

          {accepted ? (
            <div className="flex items-center gap-2 text-sm text-green-700">
              <span aria-hidden="true">✓</span>
              <span className="font-medium">Substitution accepted — order updated</span>
            </div>
          ) : overridden ? (
            <div className="flex items-start gap-2 text-sm text-amber-700">
              <span aria-hidden="true">⚠</span>
              <span className="font-medium">
                Override recorded — the order will not be approved without the substitution. Sign to
                submit for PA with exception justification.
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion: CdsSuggestion) => (
                <button
                  key={suggestion.uuid ?? suggestion.label}
                  type="button"
                  onClick={onAccept}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-violet-700 text-white rounded hover:bg-violet-800 transition-colors"
                >
                  {suggestion.label}
                </button>
              ))}
              <button
                type="button"
                onClick={onOverride}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 bg-white border border-slate-300 text-slate-600 rounded hover:bg-slate-50 transition-colors"
              >
                Override
              </button>
            </div>
          )}
        </div>
      </div>
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
// Order-select summary — CRD results only (no regimen echo)
// ---------------------------------------------------------------------------

/**
 * Structured summary for order-select CRD responses.
 *
 * Shows **coverage determination results only**: Coverage Criteria status,
 * PA Requirement, and any biosimilar suggestion cards. The regimen itself
 * is displayed in the EHR's Order Summary panel — this component does not
 * re-render the draft order to avoid duplicating the same drug list in
 * three places.
 *
 * PA Requirement logic:
 *   - When a biosimilar substitution is proposed and not yet accepted → "Required"
 *   - When the substitution is accepted → "Satisfied" (biosimilar satisfies the PA requirement)
 *   - When the substitution is overridden → "Required" (original drug still needs PA)
 *   - When pa-required topic card present (without suggestion) → "Required"
 *   - Otherwise → "Not required"
 */
export function OrderSelectSummary({
  cards,
  patientId,
  selectedRegimenId,
  onAcceptSuggestion,
  onOverrideSuggestion,
  suggestionAccepted,
  suggestionOverridden,
}: {
  cards: CdsCard[];
  patientId: string;
  selectedRegimenId?: string;
  onAcceptSuggestion?: () => void;
  onOverrideSuggestion?: () => void;
  suggestionAccepted?: boolean;
  suggestionOverridden?: boolean;
}) {
  // At order-select: info indicator = approvable; warning + prior-auth = PA will be required
  // At order-sign: success indicator = authorization satisfied; warning + prior-auth = PA required
  const approvable = cards.some((c) => c.indicator === "info");
  const authSatisfied = cards.some((c) => c.indicator === "success");
  const paRequired = cards.some((c) => c.source.topic?.code === "prior-auth-required");
  const hasSuggestion = cards.some((c) => c.suggestions && c.suggestions.length > 0);
  const dtrCard = cards.find((c) => (c.links?.length ?? 0) > 0);
  const coverageMet = approvable || authSatisfied || paRequired;

  // Determine PA requirement status based on suggestion state
  //   - Biosimilar substitution accepted → PA satisfied (biosimilar meets the requirement)
  //   - Biosimilar proposed but not accepted (or overridden) → PA required
  //   - pa-required topic card without suggestion → PA required
  //   - Otherwise → not required
  const paSatisfiedByBiosimilar = hasSuggestion && suggestionAccepted;
  const paRequiredStatus = paSatisfiedByBiosimilar ? false : !!(hasSuggestion || paRequired);

  return (
    <div className="divide-y divide-slate-100">
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
              <p className="mt-2 text-xs text-amber-600 font-medium">
                Documentation required — see Step 2.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Row 2: PA Requirement — shown when coverage criteria are met.
           When a biosimilar substitution is proposed → PA is Required.
           When the substitution is accepted → PA is Satisfied (biosimilar meets the requirement).
           When the substitution is overridden → PA remains Required.
           pa-required topic (ECOG ≥ 1 without suggestion) → PA Required.
           Otherwise (ECOG 0) → PA Not required. */}
      {coverageMet && (
        <div className="px-4 py-3 flex items-start gap-4 bg-slate-50">
          <span className="text-xs text-slate-400 w-36 flex-shrink-0 pt-0.5">PA Requirement</span>
          {paSatisfiedByBiosimilar ? (
            <StatusBadge indicator="info" label="Satisfied" />
          ) : paRequiredStatus ? (
            <StatusBadge indicator="warning" label="Required" />
          ) : (
            <StatusBadge indicator="info" label="Not required" />
          )}
        </div>
      )}

      {/* Suggestion cards — biosimilar substitution proposals */}
      {cards
        .filter((c) => c.suggestions && c.suggestions.length > 0)
        .map((card) => (
          <SuggestionPanel
            key={card.uuid ?? card.summary}
            card={card}
            onAccept={onAcceptSuggestion ?? (() => {})}
            onOverride={onOverrideSuggestion ?? (() => {})}
            accepted={suggestionAccepted ?? false}
            overridden={suggestionOverridden ?? false}
          />
        ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Coverage Discovery panel
// ---------------------------------------------------------------------------

/**
 * Panel wrapping all cards returned by one CDS hook call.
 * The header makes provenance explicit: which service responded, and to which hook.
 *
 * This panel shows **CRD response information only** — coverage criteria,
 * PA requirements, and suggestions. It does not echo the draft order; the
 * EHR's Order Summary panel is the single source of truth for the regimen.
 */
export function CrdResponsePanel({
  cards,
  hook,
  patientId,
  selectedRegimenId,
  onAcceptSuggestion,
  onOverrideSuggestion,
  suggestionAccepted,
  suggestionOverridden,
}: {
  cards: CdsCard[];
  hook: "order-select" | "order-sign";
  patientId: string;
  selectedRegimenId?: string;
  onAcceptSuggestion?: () => void;
  onOverrideSuggestion?: () => void;
  suggestionAccepted?: boolean;
  suggestionOverridden?: boolean;
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
          onAcceptSuggestion={onAcceptSuggestion}
          onOverrideSuggestion={onOverrideSuggestion}
          suggestionAccepted={suggestionAccepted}
          suggestionOverridden={suggestionOverridden}
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
