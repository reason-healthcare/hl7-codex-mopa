"use client";

import { useState, useEffect } from "react";
import type { CdsCard, CdsResponse } from "@mopa/cds-hooks";
import {
  REGIMENS,
  buildDraftBundle,
  type Regimen,
} from "@mopa/oncology-policy";
import Link from "next/link";

const CRD_SERVICE_URL = process.env.NEXT_PUBLIC_CRD_SERVICE_URL ?? "http://localhost:4003";
const EHR_BASE_URL    = process.env.NEXT_PUBLIC_EHR_BASE_URL    ?? "http://localhost:4001";
// FHIR reads from the browser go directly to HAPI (CORS: *) to avoid the
// auth-gated EHR proxy, which is reserved for SMART clients with tokens.
const FHIR_BASE_URL   = process.env.NEXT_PUBLIC_FHIR_BASE_URL   ?? "http://localhost:8080/fhir";

/**
 * Build a SMART EHR launch URL for a CDS Hooks smart link per the CDS Hooks spec:
 * https://cds-hooks.org/specification/current/#link
 *
 * The EHR appends iss (its own FHIR server) and launch (patient context) to the
 * app's launch endpoint, then includes appContext and any extra params.
 */
function buildSmartLaunchUrl(
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
// CDS Hooks fire
// ---------------------------------------------------------------------------

async function fireCdsHook(
  hook: "order-select" | "order-sign",
  patientId: string,
  regimen: Regimen,
): Promise<CdsResponse> {
  const draftOrders = buildDraftBundle(patientId, regimen);

  // Standard CDS Hooks request — no prefetch needed.
  // The CRD service uses fhirAuthorization to query the EHR FHIR server
  // directly for oncology patient context. fhirServer and fhirAuthorization
  // are injected server-side by /api/crd-hooks.
  const body = {
    hookInstance: crypto.randomUUID(),
    hook,
    context: {
      userId: "Practitioner/demo-user",
      patientId,
      draftOrders,
      selections: [`urn:uuid:rg-${regimen.id}`],
    },
  };

  const res = await fetch(`/api/crd-hooks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`CRD service error: ${res.status} ${res.statusText}`);
  return res.json() as Promise<CdsResponse>;
}

// ---------------------------------------------------------------------------
// CDS card rendering
// ---------------------------------------------------------------------------

/** Render **bold** markdown spans used in CRD detail strings. */
function renderDetail(text: string): React.ReactNode {
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

/** Colored badge: icon + label. Used by both card rows and the structured order-select summary. */
function StatusBadge({ indicator, label }: { indicator: string; label: string }) {
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

/**
 * A single CDS card row. All cards — regardless of source topic — use this
 * component so the EHR presents a consistent vocabulary for remote guidance.
 * No background color: status is conveyed by badge alone.
 */
function CdsCardRow({
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

/**
 * Structured two-line summary for order-select responses.
 * Shows Coverage Criteria status and, when determinable, PA Requirement.
 */
function OrderSelectSummary({
  cards,
  patientId,
  selectedRegimenId,
}: {
  cards: CdsCard[];
  patientId: string;
  selectedRegimenId?: string;
}) {
  const authSatisfied = cards.some((c) => c.indicator === "success");
  const paRequired = cards.some((c) => c.source.topic?.code === "prior-auth-required");
  const dtrCard = cards.find((c) => (c.links?.length ?? 0) > 0);
  const coverageMet = authSatisfied || paRequired;

  return (
    <div className="divide-y divide-slate-100">
      {/* Row 1: Coverage Criteria */}
      <div className="px-4 py-3 flex items-start gap-4 bg-slate-50">
        <span className="text-xs text-slate-400 w-36 flex-shrink-0 pt-0.5">Coverage Criteria</span>
        <div className="flex-1">
          {coverageMet ? (
            <StatusBadge indicator="info" label="Met" />
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

/**
 * Panel wrapping all cards returned by one CDS hook call.
 * The header makes provenance explicit: which service responded, and to which hook.
 */
function CrdResponsePanel({
  cards,
  hook,
  patientId,
  selectedRegimenId,
}: {
  cards: CdsCard[];
  hook: "order-select" | "order-sign";
  patientId: string;
  selectedRegimenId?: string;
}) {
  const sourceLabel = cards[0]?.source.label ?? "CRD Service";

  return (
    <div className="border border-slate-200 rounded overflow-hidden">
      {/* Provenance header */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          CDS Guidance
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

// ---------------------------------------------------------------------------
// PA outcome display — uses the same indicator vocabulary as CDS cards
// ---------------------------------------------------------------------------

interface ClaimResponseSummary {
  outcome: string;
  disposition?: string;
}

function ClaimResponseDisplay({ outcome, disposition }: ClaimResponseSummary) {
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OrderEntryPage({
  patientId,
}: {
  patientId: string;
}) {
  const [selected, setSelected] = useState<Regimen | null>(null);
  const [cards, setCards] = useState<CdsCard[]>([]);
  const [activeHook, setActiveHook] = useState<"order-select" | "order-sign" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signed, setSigned] = useState(false);
  const [paSubmitting, setPaSubmitting] = useState(false);
  const [paError, setPaError] = useState<string | null>(null);
  const [claimResponse, setClaimResponse] = useState<ClaimResponseSummary | null>(null);


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("dtr-complete") !== "true") return;
    const regimenId = params.get("regimen");
    const regimen = REGIMENS.find((r) => r.id === regimenId);
    const clean = new URL(window.location.href);
    clean.searchParams.delete("dtr-complete");
    clean.searchParams.delete("regimen");
    window.history.replaceState({}, "", clean.toString());
    if (!regimen) return;
    setSelected(regimen);
    setSigned(false);
    setLoading(true);
    setError(null);
    fireCdsHook("order-select", patientId, regimen)
      .then((r) => {
        setCards(r.cards);
        setActiveHook("order-select");
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "CRD service unavailable"))
      .finally(() => setLoading(false));
  }, [patientId]);

  async function callCrdHook(
    hook: "order-select" | "order-sign",
    regimen: Regimen,
    onSuccess: (cards: CdsCard[]) => void
  ) {
    setLoading(true);
    setError(null);
    try {
      const response = await fireCdsHook(hook, patientId, regimen);
      onSuccess(response.cards);
      setActiveHook(hook);
    } catch (e) {
      setError(e instanceof Error ? e.message : "CRD service unavailable");
    } finally {
      setLoading(false);
    }
  }

  function onSelectRegimen(regimen: Regimen) {
    setSelected(regimen);
    setSigned(false);
    setCards([]);
    setActiveHook(null);
    setClaimResponse(null);
    setPaError(null);
    callCrdHook("order-select", regimen, setCards);
  }

  function onSignOrder() {
    if (!selected) return;
    setClaimResponse(null);
    setPaError(null);
    callCrdHook("order-sign", selected, (newCards) => {
      setCards(newCards);
      setSigned(true);
    });
  }

  // PA submission only applies if a prior-auth-required card is returned
  const hasPaCard = cards.some((c) => c.source.topic?.code === "prior-auth-required");

  async function submitPa() {
    if (!selected) return;
    setPaSubmitting(true);
    setPaError(null);
    setClaimResponse(null);
    try {
      const res = await fetch("/api/pa-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          regimenId: selected.id,
          regimenLabel: selected.label,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const cr = (await res.json()) as { outcome?: string; disposition?: string };
      setClaimResponse({ outcome: cr.outcome ?? "unknown", disposition: cr.disposition });
    } catch (e) {
      setPaError(e instanceof Error ? e.message : "PA submission failed");
    } finally {
      setPaSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Regimen selector */}
      <section>
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Select Regimen
        </h2>
        <div className="space-y-2">
          {REGIMENS.map((regimen) => {
            const isSelected = selected?.id === regimen.id;
            return (
              <button
                key={regimen.id}
                type="button"
                onClick={() => onSelectRegimen(regimen)}
                className={`w-full text-left px-4 py-3 rounded border transition-colors ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span className="font-semibold text-sm text-slate-900">{regimen.label}</span>
                <p className="text-xs text-slate-500 mt-0.5">{regimen.description}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {regimen.phases.flatMap(p => p.drugs).map((drug) => (
                    <span
                      key={drug.rxnorm}
                      className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200"
                    >
                      {drug.display}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span
            className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin flex-shrink-0"
            aria-hidden="true"
          />
          Consulting CRD service…
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="border border-red-200 bg-red-50 rounded px-4 py-3 text-sm text-red-700">
          <span className="font-semibold">CRD error:</span> {error}
        </div>
      )}

      {/* CDS Guidance panel — consistent provenance wrapper for all hook responses */}
      {cards.length > 0 && activeHook && (
        <section>
          <CrdResponsePanel
            cards={cards}
            hook={activeHook}
            patientId={patientId}
            selectedRegimenId={selected?.id}
          />
        </section>
      )}

      {/* Sign Order */}
      {selected && !loading && (
        <section className="flex items-center gap-4 pt-1 border-t border-slate-200">
          {signed ? (
            <span className="inline-flex items-center gap-2 text-sm font-medium text-green-700">
              <span aria-hidden="true">✓</span> Order Signed
            </span>
          ) : (
            <button
              type="button"
              onClick={onSignOrder}
              className="px-5 py-2 bg-slate-800 text-white text-sm font-medium rounded hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 transition-colors"
            >
              Sign Order
            </button>
          )}
          {!signed && (
            <p className="text-xs text-slate-400">
              Signing fires the order-sign hook and initiates authorization.
            </p>
          )}
        </section>
      )}

      {/* Prior Authorization — action section, distinct from the CDS card that requests it */}
      {hasPaCard && (
        <section className="border border-slate-200 rounded overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-800">Prior Authorization</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Submit a prior-authorization request to the payer for a coverage determination.
            </p>
          </div>
          <div className="px-4 py-3 space-y-3">
            {paError && (
              <div className="border border-red-200 bg-red-50 rounded px-3 py-2 text-sm text-red-700">
                {paError}
              </div>
            )}
            {claimResponse ? (
              <ClaimResponseDisplay
                outcome={claimResponse.outcome}
                disposition={claimResponse.disposition}
              />
            ) : (
              <button
                type="button"
                onClick={submitPa}
                disabled={paSubmitting}
                className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 transition-colors"
              >
                {paSubmitting ? "Submitting…" : "Submit Prior Authorization"}
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
