"use client";

import { useState, useEffect } from "react";
import type { CdsCard, CdsResponse } from "@ogca/cds-hooks";
import Link from "next/link";

const CRD_SERVICE_URL = process.env.NEXT_PUBLIC_CRD_SERVICE_URL ?? "http://localhost:4002";

// ---------------------------------------------------------------------------
// Regimens
// ---------------------------------------------------------------------------

interface Regimen {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  /** SNOMED codes for the component drugs */
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

async function fireCdsHook(
  hook: "order-select" | "order-sign",
  patientId: string,
  regimen: Regimen
): Promise<CdsResponse> {
  const draftOrders = buildDraftBundle(patientId, regimen);
  const body = {
    hookInstance: crypto.randomUUID(),
    hook,
    context: {
      userId: "Practitioner/demo-user",
      patientId,
      draftOrders,
      selections: [`MedicationRequest/draft-${regimen.id}`],
    },
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
// Card display
// ---------------------------------------------------------------------------

const INDICATOR_CONFIG: Record<string, { container: string; badge: string }> = {
  info: {
    container: "bg-green-50 border-green-300 text-green-900",
    badge: "bg-green-100 text-green-800",
  },
  warning: {
    container: "bg-yellow-50 border-yellow-300 text-yellow-900",
    badge: "bg-yellow-100 text-yellow-800",
  },
  critical: {
    container: "bg-red-50 border-red-300 text-red-900",
    badge: "bg-red-100 text-red-800",
  },
};

function CardDisplay({ card, selectedRegimenId }: { card: CdsCard; selectedRegimenId?: string }) {
  if (card.source.topic?.code === "coverage-information") {
    return <CoverageInfoCard card={card} />;
  }

  const config = INDICATOR_CONFIG[card.indicator];
  return (
    <div className={`border rounded-lg p-4 ${config?.container ?? "bg-gray-50 border-gray-300"}`}>
      <div className="flex items-start gap-3">
        <span
          className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${
            config?.badge ?? ""
          }`}
        >
          {card.indicator}
        </span>
        <div className="flex-1">
          <p className="font-semibold text-sm">{card.summary}</p>
          {card.detail && <p className="mt-1 text-sm opacity-80">{card.detail}</p>}
          {card.source.label && (
            <p className="mt-2 text-xs opacity-60">Source: {card.source.label}</p>
          )}
          {card.links && card.links.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {card.links.map((link) => {
                const href =
                  link.type === "smart" && selectedRegimenId
                    ? `${link.url}&returnRegimen=${selectedRegimenId}`
                    : link.url;
                return (
                  <a
                    key={link.url}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 bg-white border border-current rounded hover:opacity-80 transition-opacity"
                  >
                    {link.label}
                    <span aria-hidden>↗</span>
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

function CoverageInfoCard({ card }: { card: CdsCard }) {
  return (
    <div className="border border-green-300 bg-green-50 rounded-lg px-4 py-3 space-y-2">
      <div className="flex items-center gap-2 text-sm text-green-800">
        <span className="text-base leading-none">✓</span>
        <span className="font-semibold">{card.summary}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-blue-800">
        <span className="text-base leading-none">ⓘ</span>
        <span>Prior authorization is required to finalize this order</span>
      </div>
      <p className="text-xs text-gray-500 pt-0.5">
        Sign the order below to submit the prior authorization request.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PA submission
// ---------------------------------------------------------------------------

interface ClaimResponseSummary {
  outcome: string;
  disposition?: string;
}

const OUTCOME_CONFIG: Record<
  string,
  { container: string; textColor: string; subColor: string; icon: string; label: string }
> = {
  complete: {
    container: "bg-green-50 border-green-300",
    textColor: "text-green-800",
    subColor: "text-green-700",
    icon: "✓",
    label: "Approved",
  },
  queued: {
    container: "bg-yellow-50 border-yellow-300",
    textColor: "text-yellow-800",
    subColor: "text-yellow-700",
    icon: "⏳",
    label: "Pending Review",
  },
};

const DENIED_OUTCOME_CONFIG = {
  container: "bg-red-50 border-red-300",
  textColor: "text-red-800",
  subColor: "text-red-700",
  icon: "✗",
  label: "Denied",
};

function ClaimResponseDisplay({ outcome, disposition }: ClaimResponseSummary) {
  const config = OUTCOME_CONFIG[outcome] ?? DENIED_OUTCOME_CONFIG;
  return (
    <div className={`rounded-lg border p-4 space-y-1 ${config.container}`}>
      <div className="flex items-center gap-2">
        <span className="text-base">{config.icon}</span>
        <span className={`text-sm font-semibold ${config.textColor}`}>PA {config.label}</span>
      </div>
      {disposition && <p className={`text-xs ${config.subColor}`}>{disposition}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OrderEntryPage({ patientId }: { patientId: string }) {
  const [selected, setSelected] = useState<Regimen | null>(null);
  const [cards, setCards] = useState<CdsCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signed, setSigned] = useState(false);
  const [paSubmitting, setPaSubmitting] = useState(false);
  const [paError, setPaError] = useState<string | null>(null);
  const [claimResponse, setClaimResponse] = useState<ClaimResponseSummary | null>(null);

  // Auto-fire order-select when returning from DTR (?dtr-complete=true&regimen=TH)
  // Uses window.location directly (mount-only) to avoid useSearchParams + Suspense.
  // State setters from useState are stable — safe to omit from deps.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("dtr-complete") !== "true") return;
    const regimenId = params.get("regimen");
    const regimen = REGIMENS.find((r) => r.id === regimenId);
    // Clean the URL before firing so a refresh doesn't re-trigger
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
      .then((r) => setCards(r.cards))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "CRD service unavailable"))
      .finally(() => setLoading(false));
  }, [patientId]); // patientId is the only external variable used

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
    } catch (e) {
      setError(e instanceof Error ? e.message : "CRD service unavailable");
    } finally {
      setLoading(false);
    }
  }

  function onSelectRegimen(regimen: Regimen) {
    setSelected(regimen);
    setSigned(false);
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
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">Order Entry</h1>
        <Link href={`/patients/${patientId}`} className="text-sm text-blue-600 hover:underline">
          ← Back to chart
        </Link>
      </div>

      {/* Regimen selector */}
      <section>
        <h2 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-3">
          Select Regimen
        </h2>
        <div className="space-y-2">
          {REGIMENS.map((regimen) => (
            <button
              key={regimen.id}
              type="button"
              onClick={() => onSelectRegimen(regimen)}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                selected?.id === regimen.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-blue-300"
              }`}
            >
              <div className="font-medium text-sm text-gray-800">{regimen.label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{regimen.description}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Checking with CRD service…
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* CDS Cards */}
      {cards.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-3">
            Coverage Guidance
          </h2>
          <div className="space-y-3">
            {cards.map((card, i) => (
              <CardDisplay key={card.uuid ?? i} card={card} selectedRegimenId={selected?.id} />
            ))}
          </div>
        </section>
      )}

      {/* PA submission — shown when CRD returns a PA-required card */}
      {hasPaCard && (
        <section className="bg-amber-50 border border-amber-200 rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold text-amber-900 uppercase tracking-wide">
            Prior Authorization Required
          </h2>
          <p className="text-sm text-amber-800">
            Submit a prior-authorization request. The payer will evaluate the clinical context and
            return a determination.
          </p>
          {paError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {paError}
            </p>
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
              className="px-4 py-2 bg-amber-700 text-white text-sm font-medium rounded-lg hover:bg-amber-800 disabled:opacity-50 transition-colors"
            >
              {paSubmitting ? "Submitting…" : "Submit Prior Authorization"}
            </button>
          )}
        </section>
      )}

      {/* Sign button */}
      {selected && !loading && (
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onSignOrder}
            disabled={signed}
            className="px-5 py-2 bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {signed ? "✓ Order Signed" : "Sign Order"}
          </button>
          {signed && (
            <span className="text-sm text-green-700 font-medium">Order signed successfully.</span>
          )}
        </div>
      )}
    </div>
  );
}
