"use client";

import { useState, useEffect } from "react";
import type { CdsCard, CdsResponse } from "@ogca/cds-hooks";
import Link from "next/link";

const CRD_SERVICE_URL = process.env.NEXT_PUBLIC_CRD_SERVICE_URL ?? "http://localhost:4003";
const EHR_BASE_URL    = process.env.NEXT_PUBLIC_EHR_BASE_URL    ?? "http://localhost:4001";

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
  extraParams?: Record<string, string>,
): string {
  const url = new URL(link.url);
  url.searchParams.set("iss",    `${EHR_BASE_URL}/api/fhir`);
  url.searchParams.set("launch", `patient/${patientId}`);
  if (link.appContext) url.searchParams.set("appContext", link.appContext);
  if (extraParams) {
    for (const [k, v] of Object.entries(extraParams)) url.searchParams.set(k, v);
  }
  return url.toString();
}

// ---------------------------------------------------------------------------
// Regimens
// ---------------------------------------------------------------------------

interface Regimen {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  drugs: Array<{ system: string; code: string; display: string }>;
}

const REGIMENS: Regimen[] = [
  {
    id: "TH",
    label: "TH — Trastuzumab + Paclitaxel",
    shortLabel: "TH",
    description: "Weekly paclitaxel with trastuzumab. First-line for HER2+ early breast cancer.",
    drugs: [
      {
        system: "http://www.nlm.nih.gov/research/umls/rxnorm",
        code: "224905",
        display: "Trastuzumab",
      },
      {
        system: "http://www.nlm.nih.gov/research/umls/rxnorm",
        code: "56946",
        display: "Paclitaxel",
      },
    ],
  },
  {
    id: "ddAC-T",
    label: "ddAC→T — Dose-dense AC followed by Paclitaxel",
    shortLabel: "ddAC→T",
    description:
      "Dose-dense doxorubicin/cyclophosphamide followed by paclitaxel. For triple-negative or HR+ disease.",
    drugs: [
      {
        system: "http://www.nlm.nih.gov/research/umls/rxnorm",
        code: "3639",
        display: "Doxorubicin",
      },
      {
        system: "http://www.nlm.nih.gov/research/umls/rxnorm",
        code: "3002",
        display: "Cyclophosphamide",
      },
      {
        system: "http://www.nlm.nih.gov/research/umls/rxnorm",
        code: "56946",
        display: "Paclitaxel",
      },
    ],
  },
  {
    id: "PHD",
    label: "PHD — Pertuzumab + Trastuzumab + Docetaxel",
    shortLabel: "PHD",
    description:
      "Pertuzumab, trastuzumab, and docetaxel. First-line for HER2+ metastatic breast cancer.",
    drugs: [
      {
        system: "http://www.nlm.nih.gov/research/umls/rxnorm",
        code: "1298093",
        display: "Pertuzumab",
      },
      {
        system: "http://www.nlm.nih.gov/research/umls/rxnorm",
        code: "224905",
        display: "Trastuzumab",
      },
      {
        system: "http://www.nlm.nih.gov/research/umls/rxnorm",
        code: "72962",
        display: "Docetaxel",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Draft MedicationRequest builder
// ---------------------------------------------------------------------------

function buildDraftOrder(patientId: string, regimen: Regimen) {
  return {
    resourceType: "MedicationRequest",
    id: `draft-${regimen.id}`,
    status: "draft",
    intent: "proposal",
    subject: { reference: `Patient/${patientId}` },
    medicationCodeableConcept: {
      coding: regimen.drugs,
      text: regimen.shortLabel,
    },
    note: [{ text: regimen.description }],
  };
}

function buildDraftBundle(patientId: string, regimen: Regimen) {
  return {
    resourceType: "Bundle",
    type: "collection",
    entry: [{ resource: buildDraftOrder(patientId, regimen) }],
  };
}

// ---------------------------------------------------------------------------
// CDS Hooks fire
// ---------------------------------------------------------------------------

/**
 * Discovery cache — loaded once on component mount.
 * Holds conditionDataRequirements from the OGCA service extension so we can
 * add condition-specific prefetch to every hook call (OGCA-aware EHR path).
 */
let discoveryCache: Array<{
  condition: { system: string; code: string };
  prefetchTemplates: Record<string, string>;
}> | null = null;

async function loadDiscovery(): Promise<void> {
  if (discoveryCache !== null) return;
  try {
    const res = await fetch(`${CRD_SERVICE_URL}/api/cds-services`);
    if (!res.ok) {
      discoveryCache = [];
      return;
    }
    const data = (await res.json()) as {
      services?: Array<{
        extension?: {
          "ogca-service-extension"?: { conditionDataRequirements?: typeof discoveryCache };
        };
      }>;
    };
    discoveryCache =
      data.services?.[0]?.extension?.["ogca-service-extension"]?.conditionDataRequirements ?? [];
  } catch {
    discoveryCache = [];
  }
}

/**
 * Resolve any condition-specific prefetch templates that match the patient's
 * condition. Returns the additional prefetch keys to include in the hook body.
 */
async function resolveConditionPrefetch(
  patientId: string,
  conditionCode: string | undefined
): Promise<Record<string, unknown>> {
  if (!conditionCode || !discoveryCache) return {};
  const entry = discoveryCache.find((e) => e.condition.code === conditionCode);
  if (!entry) return {};

  const results: Record<string, unknown> = {};
  await Promise.all(
    Object.entries(entry.prefetchTemplates).map(async ([key, template]) => {
      const url = template.replace(/\{\{context\.patientId\}\}/g, patientId);
      try {
        const res = await fetch(`${window.location.origin}/api/fhir/${url}`, {
          headers: { Accept: "application/fhir+json" },
        });
        if (res.ok) results[key] = await res.json();
      } catch {
        /* non-fatal */
      }
    })
  );
  return results;
}

async function fireCdsHook(
  hook: "order-select" | "order-sign",
  patientId: string,
  regimen: Regimen,
  conditionCode?: string
): Promise<CdsResponse> {
  const draftOrders = buildDraftBundle(patientId, regimen);

  // OGCA-aware EHR path: augment with condition-specific prefetch
  const conditionPrefetch = await resolveConditionPrefetch(patientId, conditionCode);

  const body = {
    hookInstance: crypto.randomUUID(),
    hook,
    context: {
      userId: "Practitioner/demo-user",
      patientId,
      draftOrders,
      selections: [`MedicationRequest/draft-${regimen.id}`],
    },
    prefetch: conditionPrefetch,
    fhirServer: `${window.location.origin}/api/fhir`,
  };

  const res = await fetch(`${CRD_SERVICE_URL}/api/cds-services/oncology-crd`, {
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
function CdsCardRow({ card, patientId, selectedRegimenId }: { card: CdsCard; patientId: string; selectedRegimenId?: string }) {
  const cfg = INDICATOR_CONFIG[card.indicator] ?? INDICATOR_FALLBACK;

  return (
    <div className="px-4 py-3 bg-white">
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
                        selectedRegimenId ? { returnRegimen: selectedRegimenId } : undefined,
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
  const coverageCard = cards.find((c) => c.source.topic?.code === "coverage-information");
  const preApproved = cards.some((c) => c.source.topic?.code === "prior-auth-not-required");
  const dtrCard = cards.find((c) => (c.links?.length ?? 0) > 0);
  const coverageMet = (!!coverageCard && coverageCard.indicator === "info") || preApproved;

  return (
    <div className="divide-y divide-slate-100">
      {/* Row 1: Coverage Criteria */}
      <div className="px-4 py-3 flex items-start gap-4 bg-white">
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
                            selectedRegimenId ? { returnRegimen: selectedRegimenId } : undefined,
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

      {/* Row 2: PA Requirement — only when coverage criteria outcome is known */}
      {coverageMet && (
        <div className="px-4 py-3 flex items-start gap-4 bg-white">
          <span className="text-xs text-slate-400 w-36 flex-shrink-0 pt-0.5">PA Requirement</span>
          {preApproved ? (
            <StatusBadge indicator="info" label="Not required" />
          ) : (
            <StatusBadge indicator="warning" label="Required" />
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
        <OrderSelectSummary cards={cards} patientId={patientId} selectedRegimenId={selectedRegimenId} />
      ) : (
        <div className="divide-y divide-slate-100">
          {cards.map((card, i) => (
            <CdsCardRow key={card.uuid ?? i} card={card} patientId={patientId} selectedRegimenId={selectedRegimenId} />
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
  conditionCode,
}: {
  patientId: string;
  conditionCode?: string;
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

  // Load CDS discovery once so subsequent hook calls can add condition-specific prefetch
  useEffect(() => {
    void loadDiscovery();
  }, []);
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
    fireCdsHook("order-select", patientId, regimen, conditionCode)
      .then((r) => {
        setCards(r.cards);
        setActiveHook("order-select");
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "CRD service unavailable"))
      .finally(() => setLoading(false));
  }, [patientId, conditionCode]);

  async function callCrdHook(
    hook: "order-select" | "order-sign",
    regimen: Regimen,
    onSuccess: (cards: CdsCard[]) => void
  ) {
    setLoading(true);
    setError(null);
    try {
      const response = await fireCdsHook(hook, patientId, regimen, conditionCode);
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
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-7">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Order Entry</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Select a chemotherapy regimen to evaluate coverage requirements.
          </p>
        </div>
        <Link href={`/patients/${patientId}`} className="text-sm text-blue-600 hover:text-blue-700">
          ← Back to chart
        </Link>
      </div>

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
                  {regimen.drugs.map((drug) => (
                    <span
                      key={drug.code}
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
            className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0"
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
          <CrdResponsePanel cards={cards} hook={activeHook} patientId={patientId} selectedRegimenId={selected?.id} />
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
              className="px-5 py-2 bg-blue-700 text-white text-sm font-medium rounded hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 transition-colors"
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
        <section className="border border-slate-200 rounded bg-white overflow-hidden">
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
                className="px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 transition-colors"
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
