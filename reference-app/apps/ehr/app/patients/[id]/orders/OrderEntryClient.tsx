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

  // Suggestion state — tracks whether the provider accepted or overrode
  // a biosimilar substitution proposed by the CRD at order-select.
  const [suggestionAccepted, setSuggestionAccepted] = useState(false);
  const [suggestionOverridden, setSuggestionOverridden] = useState(false);
  // The modified draftOrders Bundle after applying substitution actions.
  // When set, this is sent to order-sign instead of the regimen template.
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

  /**
   * Accept a biosimilar substitution suggestion.
   *
   * Applies the CDS Hooks suggestion actions (delete + create) to the
   * draft orders Bundle, producing a modified Bundle that is sent to
   * order-sign instead of the regimen template.
   */
  function onAcceptSuggestion() {
    if (!selected) return;

    const suggestionCard = cards.find((c) => c.suggestions?.length);
    if (!suggestionCard?.suggestions) return;

    // Start from the regimen template draft orders
    const bundle = buildDraftBundle(patientId, selected) as {
      resourceType: string;
      type: string;
      entry: Array<{ fullUrl: string; resource: Record<string, unknown> }>;
    };

    // Collect all actions across all suggestions
    const allActions: CdsAction[] = suggestionCard.suggestions.flatMap((s) => s.actions ?? []);

    // Apply delete actions: remove entries whose fullUrl matches resourceId
    const deleteIds = new Set(
      allActions.filter((a) => a.type === "delete").map((a) => a.resourceId)
    );
    let entries = bundle.entry.filter((e) => !deleteIds.has(e.fullUrl));

    // Apply create actions: add new entries with generated fullUrls
    for (const action of allActions.filter((a) => a.type === "create")) {
      if (!action.resource) continue;
      const resource = action.resource as Record<string, unknown>;
      const newId = (resource.id as string) ?? crypto.randomUUID();
      entries.push({ fullUrl: `urn:uuid:${newId}`, resource });
    }

    // Update the RequestGroup's action references to point to the new resources
    // (the RequestGroup is always the first entry)
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
              // Point to the first created resource (the replacement)
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

    const modifiedBundle = { ...bundle, entry: entries };
    setModifiedDraftOrders(modifiedBundle);
    setSuggestionAccepted(true);
    setSuggestionOverridden(false);
  }

  function onOverrideSuggestion() {
    setSuggestionOverridden(true);
    setSuggestionAccepted(false);
    // Keep the original draft orders — no modification needed
  }

  function onSignOrder() {
    if (!selected) return;
    setClaimResponse(null);
    setPaError(null);
    // If the substitution was accepted, send the modified draft orders to order-sign
    // so the CRD sees the biosimilar MedicationRequest and returns "Authorization Satisfied".
    const draftOverride = suggestionAccepted ? modifiedDraftOrders ?? undefined : undefined;
    callCrdHook("order-sign", selected, (newCards) => {
      setCards(newCards);
      setSigned(true);
    }, draftOverride);
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
      const cr = (await res.json()) as { outcome?: string; disposition?: string; processNote?: Array<{ text: string }> };
      setClaimResponse({ outcome: cr.outcome ?? "unknown", disposition: cr.disposition, processNote: cr.processNote });
    } catch (e) {
      setPaError(e instanceof Error ? e.message : "PA submission failed");
    } finally {
      setPaSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Regimen selector */}
      <RegimenSelector
        regimens={REGIMENS}
        selectedId={selected?.id}
        onSelect={onSelectRegimen}
      />

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

      {/* Coverage Discovery panel — shows draft order details + coverage determination */}
      {cards.length > 0 && activeHook && (
        <section>
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
