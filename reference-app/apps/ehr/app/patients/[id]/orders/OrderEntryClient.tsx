"use client";

import type { CdsAction, CdsCard } from "@mopa/cds-hooks";
import {
  applyBiosimilarSubstitution,
  buildDraftBundle,
  REGIMENS,
  type Regimen,
} from "@mopa/oncology-policy";
import { useEffect, useState } from "react";
import { CdsCardRow, OrderSelectSummary } from "./components/cds-cards";
import { fireCdsHook } from "./components/crd-hooks";
import { ClaimResponseDisplay, type ClaimResponseSummary } from "./components/pa-display";
import { RegimenSelector } from "./components/regimen-selector";

export default function OrderEntryPage({ patientId }: { patientId: string }) {
  const [selected, setSelected] = useState<Regimen | null>(null);

  // Separate card state for each hook phase
  const [selectCards, setSelectCards] = useState<CdsCard[]>([]);
  const [signCards, setSignCards] = useState<CdsCard[]>([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [signLoading, setSignLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [signed, setSigned] = useState(false);
  const [paSubmitting, setPaSubmitting] = useState(false);
  const [paError, setPaError] = useState<string | null>(null);
  const [claimResponse, setClaimResponse] = useState<ClaimResponseSummary | null>(null);

  const [suggestionAccepted, setSuggestionAccepted] = useState(false);
  const [suggestionOverridden, setSuggestionOverridden] = useState(false);
  const [modifiedDraftOrders, setModifiedDraftOrders] = useState<object | null>(null);

  // Whether the order-select response contains a biosimilar suggestion
  const hasSuggestion = selectCards.some((c) => c.suggestions && c.suggestions.length > 0);

  // Whether either hook phase indicates PA is required.
  // At order-select this is "PA Will Be Required" (advisory); at order-sign
  // it is the final "Prior Authorization Required" determination. The submit
  // button is shown in both cases so the provider can initiate PA early.
  const hasPaCard =
    selectCards.some((c) => c.source.topic?.code === "prior-auth-required") ||
    signCards.some((c) => c.source.topic?.code === "prior-auth-required");

  // The regimen as it should be displayed — when the substitution is
  // accepted, drug names are swapped for the biosimilar alternatives so
  // the Order Detail panel reflects the current state of the order.
  const displayRegimen =
    selected && suggestionAccepted ? applyBiosimilarSubstitution(selected) : selected;

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
    setSignCards([]);
    setSelectLoading(true);
    setError(null);
    fireCdsHook("order-select", patientId, regimen)
      .then((r) => {
        setSelectCards(r.cards);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "CRD service unavailable"))
      .finally(() => setSelectLoading(false));
  }, [patientId]);

  async function callCrdHook(
    hook: "order-select" | "order-sign",
    regimen: Regimen,
    onSuccess: (cards: CdsCard[]) => void,
    draftOrdersOverride?: object
  ) {
    const loading = hook === "order-select" ? setSelectLoading : setSignLoading;
    loading(true);
    setError(null);
    try {
      const response = await fireCdsHook(hook, patientId, regimen, draftOrdersOverride);
      onSuccess(response.cards);
    } catch (e) {
      setError(e instanceof Error ? e.message : "CRD service unavailable");
    } finally {
      loading(false);
    }
  }

  function onSelectRegimen(regimen: Regimen) {
    setSelected(regimen);
    setSigned(false);
    setSelectCards([]);
    setSignCards([]);
    setClaimResponse(null);
    setPaError(null);
    setSuggestionAccepted(false);
    setSuggestionOverridden(false);
    setModifiedDraftOrders(null);
    callCrdHook("order-select", regimen, setSelectCards);
  }

  function onAcceptSuggestion() {
    if (!selected) return;
    const suggestionCard = selectCards.find((c) => c.suggestions?.length);
    if (!suggestionCard?.suggestions) return;
    const bundle = buildDraftBundle(patientId, selected) as {
      resourceType: string;
      type: string;
      entry: Array<{ fullUrl: string; resource: Record<string, unknown> }>;
    };
    const allActions: CdsAction[] = suggestionCard.suggestions.flatMap((s) => s.actions ?? []);
    const deleteIds = new Set(
      allActions.filter((a) => a.type === "delete").map((a) => a.resourceId)
    );
    const entries = bundle.entry.filter((e) => !deleteIds.has(e.fullUrl));
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
    const draftOverride = suggestionAccepted ? (modifiedDraftOrders ?? undefined) : undefined;
    callCrdHook(
      "order-sign",
      selected,
      (newCards) => {
        setSignCards(newCards);
        setSigned(true);
      },
      draftOverride
    );
  }

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
      const cr = (await res.json()) as {
        outcome?: string;
        disposition?: string;
        processNote?: Array<{ text: string }>;
      };
      setClaimResponse({
        outcome: cr.outcome ?? "unknown",
        disposition: cr.disposition,
        processNote: cr.processNote,
      });
    } catch (e) {
      setPaError(e instanceof Error ? e.message : "PA submission failed");
    } finally {
      setPaSubmitting(false);
    }
  }

  return (
    <div className="flex gap-4">
      {/* ════════════════════════════════════════════════════════════════
          Left column — Order Selection + Order Detail (stacked)
          ════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* ── Order Selection ── */}
        <RegimenSelector regimens={REGIMENS} selectedId={selected?.id} onSelect={onSelectRegimen} />

        {/* ── Order Detail (what you will sign) ── */}
        {displayRegimen ? (
          <div className="rounded-lg border-2 border-slate-300 overflow-hidden shadow-sm">
            {/* Header bar — prominent */}
            <div className="bg-slate-700 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wide">
                  Order Detail
                </span>
                <span className="text-base font-bold text-white">{displayRegimen.shortLabel}</span>
                <span className="text-xs text-slate-300 hidden sm:inline">
                  {displayRegimen.description}
                </span>
              </div>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                  signed ? "bg-green-500 text-white" : "bg-slate-600 text-slate-200"
                }`}
              >
                {signed ? "Signed" : "Draft"}
              </span>
            </div>

            {/* Body */}
            <div className="bg-white p-4 space-y-4">
              {/* Intent + treatment line badges */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600">
                  {displayRegimen.treatmentLine.display}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600">
                  {displayRegimen.intent.display}
                </span>
              </div>

              {/* Phases + drugs */}
              {displayRegimen.phases.map((phase) => (
                <div key={phase.id} className="space-y-1.5">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    {phase.title}
                  </p>
                  <table className="w-full text-sm">
                    <tbody>
                      {phase.drugs.map((drug) => {
                        const originalDrug = selected?.phases
                          .flatMap((p) => p.drugs)
                          .find((d) => d.actionId === drug.actionId);
                        const wasSubstituted =
                          suggestionAccepted &&
                          originalDrug?.biosimilars?.[0]?.display === drug.display;

                        return (
                          <tr
                            key={drug.actionId}
                            className="border-b border-slate-50 last:border-0"
                          >
                            <td className="py-1.5 pr-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-medium text-slate-800">{drug.display}</span>
                                {wasSubstituted && (
                                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-violet-100 text-violet-700">
                                    substituted
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-1.5 text-xs text-slate-400 text-right whitespace-nowrap">
                              {drug.dosageText}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}

              {/* Substitution status line */}
              {hasSuggestion && !suggestionAccepted && !suggestionOverridden && (
                <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200">
                  A biosimilar substitution has been proposed — review in Prior Authorization
                </p>
              )}
              {suggestionAccepted && (
                <p className="text-[11px] text-green-700 font-medium pt-1 border-t border-slate-200">
                  ✓ Substitution applied — order updated
                </p>
              )}
              {suggestionOverridden && (
                <p className="text-[11px] text-amber-700 font-medium pt-1 border-t border-slate-200">
                  ⚠ Substitution overridden — original order proceeds
                </p>
              )}

              {/* Sign Order — prominent action button */}
              <div className="pt-2 border-t border-slate-200">
                {signed ? (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-green-700">
                    <span aria-hidden="true">✓</span> Order Signed
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onSignOrder}
                    disabled={signLoading}
                    className="w-full px-4 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {signLoading ? "Signing…" : "Sign Order"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-slate-200 px-6 py-12 text-center">
            <p className="text-sm text-slate-400">Select a regimen above to compose the order.</p>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          Right column — Prior Authorization
          Shows both order-select and order-sign CRD results
          ════════════════════════════════════════════════════════════════ */}
      <div className="w-96 flex-shrink-0 space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
          Prior Authorization
        </h2>

        {error && (
          <div className="border border-red-200 bg-red-50 rounded px-4 py-3 text-sm text-red-700">
            <span className="font-semibold">CRD error:</span> {error}
          </div>
        )}

        {/* ── Order-select section ── */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200 pb-1">
            Order-select
          </h3>

          {selectLoading && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              Consulting CRD service…
            </div>
          )}

          {!selected && !selectLoading && (
            <div className="border border-slate-200 rounded-lg px-4 py-8 text-center">
              <p className="text-sm text-slate-400">
                Select a regimen to begin coverage discovery.
              </p>
            </div>
          )}

          {selectCards.length > 0 && (
            <div className="border border-slate-200 rounded overflow-hidden">
              <OrderSelectSummary
                cards={selectCards}
                patientId={patientId}
                selectedRegimenId={selected?.id}
                onAcceptSuggestion={onAcceptSuggestion}
                onOverrideSuggestion={onOverrideSuggestion}
                suggestionAccepted={suggestionAccepted}
                suggestionOverridden={suggestionOverridden}
              />
            </div>
          )}
        </div>

        {/* ── Order-sign section ── */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200 pb-1">
            Order-sign
          </h3>

          {signLoading && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              Signing order…
            </div>
          )}

          {!signed && !signLoading && (
            <div className="border border-slate-200 rounded-lg px-4 py-8 text-center">
              <p className="text-sm text-slate-400">
                Sign the order to get the final authorization determination.
              </p>
            </div>
          )}

          {signCards.length > 0 && (
            <div className="border border-slate-200 rounded overflow-hidden divide-y divide-slate-100">
              {signCards.map((card, i) => (
                <CdsCardRow
                  key={card.uuid ?? i}
                  card={card}
                  patientId={patientId}
                  selectedRegimenId={selected?.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── PA Submission ──
            Visible whenever PA is required (at either order-select or order-sign).
            Per the Da Vinci CRD/PAS flow, the provider can initiate PA after
            the CRD service identifies that prior authorization is needed. */}
        {hasPaCard && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-200 pb-1">
              PA Submission
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                <p className="text-xs text-slate-500">
                  Submit a prior authorization request to the payer for a coverage determination.
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
                    processNote={claimResponse.processNote}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={submitPa}
                    disabled={paSubmitting}
                    className="w-full px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {paSubmitting ? "Submitting…" : "Submit Prior Authorization"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
