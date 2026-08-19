"use client";

import { useState, useEffect } from "react";
import type { CdsCard, CdsAction } from "@mopa/cds-hooks";
import { REGIMENS, buildDraftBundle, type Regimen } from "@mopa/oncology-policy";
import { RegimenSelector } from "./components/regimen-selector";
import { CrdResponsePanel } from "./components/cds-cards";
import { ClaimResponseDisplay, type ClaimResponseSummary } from "./components/pa-display";
import { fireCdsHook } from "./components/crd-hooks";

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

  const [suggestionAccepted, setSuggestionAccepted] = useState(false);
  const [suggestionOverridden, setSuggestionOverridden] = useState(false);
  const [modifiedDraftOrders, setModifiedDraftOrders] = useState<object | null>(null);

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
    onSuccess: (cards: CdsCard[]) => void,
    draftOrdersOverride?: object,
  ) {
    setLoading(true);
    setError(null);
    try {
      const response = await fireCdsHook(hook, patientId, regimen, draftOrdersOverride);
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
    setSuggestionAccepted(false);
    setSuggestionOverridden(false);
    setModifiedDraftOrders(null);
    callCrdHook("order-select", regimen, setCards);
  }

  function onAcceptSuggestion() {
    if (!selected) return;
    const suggestionCard = cards.find((c) => c.suggestions?.length);
    if (!suggestionCard?.suggestions) return;
    const bundle = buildDraftBundle(patientId, selected) as {
      resourceType: string;
      type: string;
      entry: Array<{ fullUrl: string; resource: Record<string, unknown> }>;
    };
    const allActions: CdsAction[] = suggestionCard.suggestions.flatMap((s) => s.actions ?? []);
    const deleteIds = new Set(allActions.filter((a) => a.type === "delete").map((a) => a.resourceId));
    let entries = bundle.entry.filter((e) => !deleteIds.has(e.fullUrl));
    for (const action of allActions.filter((a) => a.type === "create")) {
      if (!action.resource) continue;
      const resource = action.resource as Record<string, unknown>;
      const newId = (resource.id as string) ?? crypto.randomUUID();
      entries.push({ fullUrl: `urn:uuid:${newId}`, resource });
    }
    const rgEntry = entries.find((e) => e.resource.resourceType === "RequestGroup");
    if (rgEntry) {
      const actions = rgEntry.resource.action as Array<Record<string, unknown>> | undefined;
      if (actions) {
        for (const phaseAction of actions) {
          const drugActions = phaseAction.action as Array<Record<string, unknown>> | undefined;
          if (!drugActions) continue;
          for (const drugAction of drugActions) {
            const ref = drugAction.resource as { reference: string } | undefined;
            if (ref && deleteIds.has(ref.reference)) {
              const created = allActions.find((a) => a.type === "create");
              if (created?.resource) {
                const newRes = created.resource as Record<string, unknown>;
                const newId = (newRes.id as string) ?? "replacement";
                drugAction.resource = { reference: `urn:uuid:${newId}` };
              }
            }
          }
        }
      }
    }
    setModifiedDraftOrders({ ...bundle, entry: entries });
    setSuggestionAccepted(true);
    setSuggestionOverridden(false);
  }

  function onOverrideSuggestion() {
    setSuggestionOverridden(true);
    setSuggestionAccepted(false);
  }

  function onSignOrder() {
    if (!selected) return;
    setClaimResponse(null);
    setPaError(null);
    const draftOverride = suggestionAccepted ? modifiedDraftOrders ?? undefined : undefined;
    callCrdHook("order-sign", selected, (newCards) => {
      setCards(newCards);
      setSigned(true);
    }, draftOverride);
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
        body: JSON.stringify({ patientId, regimenId: selected.id, regimenLabel: selected.label }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      const cr = (await res.json()) as { outcome?: string; disposition?: string; processNote?: Array<{ text: string }> };
      setClaimResponse({ outcome: cr.outcome ?? "unknown", disposition: cr.disposition, processNote: cr.processNote });
    } catch (e) {
      setPaError(e instanceof Error ? e.message : "PA submission failed");
    } finally {
      setPaSubmitting(false);
    }
  }

  return (
    <div className="flex gap-4">
      {/* ── Left: Regimen selection + order details ── */}
      <div className="w-80 flex-shrink-0 space-y-4">
        <RegimenSelector regimens={REGIMENS} selectedId={selected?.id} onSelect={onSelectRegimen} />

        {/* Order details for selected regimen */}
        {selected && (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Order Details</span>
            </div>
            <div className="p-3 space-y-3">
              {selected.phases.map((phase) => (
                <div key={phase.id}>
                  <p className="text-xs font-medium text-slate-500">{phase.title}</p>
                  <ul className="mt-1 space-y-1.5">
                    {phase.drugs.map((drug) => (
                      <li key={drug.actionId} className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">{drug.display}</span>
                          {drug.biosimilars?.map((bio) => (
                            <span key={bio.rxnorm} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                              → {bio.display}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-slate-400">{drug.dosageText}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sign Order */}
        {selected && !loading && (
          <div className="flex items-center gap-4 pt-1">
            {signed ? (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-green-700">
                <span aria-hidden="true">✓</span> Order Signed
              </span>
            ) : (
              <button
                type="button"
                onClick={onSignOrder}
                className="w-full px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded hover:bg-slate-700 transition-colors"
              >
                Sign Order
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Right: CDS guidance + PA ── */}
      <div className="flex-1 min-w-0 space-y-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Coverage Discovery</h2>

        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            Consulting CRD service…
          </div>
        )}

        {error && (
          <div className="border border-red-200 bg-red-50 rounded px-4 py-3 text-sm text-red-700">
            <span className="font-semibold">CRD error:</span> {error}
          </div>
        )}

        {cards.length > 0 && activeHook && (
          <CrdResponsePanel
            cards={cards}
            hook={activeHook}
            patientId={patientId}
            selectedRegimenId={selected?.id}
            regimen={selected ?? undefined}
            onAcceptSuggestion={onAcceptSuggestion}
            onOverrideSuggestion={onOverrideSuggestion}
            suggestionAccepted={suggestionAccepted}
            suggestionOverridden={suggestionOverridden}
          />
        )}

        {!selected && !loading && (
          <div className="border border-slate-200 rounded-lg px-6 py-10 text-center">
            <p className="text-sm text-slate-400">Select a regimen to begin coverage discovery.</p>
          </div>
        )}

        {/* Prior Authorization */}
        {hasPaCard && (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800">Prior Authorization</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Submit a PA request to the payer for a coverage determination.
              </p>
            </div>
            <div className="px-4 py-3 space-y-3">
              {paError && (
                <div className="border border-red-200 bg-red-50 rounded px-3 py-2 text-sm text-red-700">
                  {paError}
                </div>
              )}
              {claimResponse ? (
                <ClaimResponseDisplay outcome={claimResponse.outcome} disposition={claimResponse.disposition} />
              ) : (
                <button
                  type="button"
                  onClick={submitPa}
                  disabled={paSubmitting}
                  className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {paSubmitting ? "Submitting…" : "Submit Prior Authorization"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
