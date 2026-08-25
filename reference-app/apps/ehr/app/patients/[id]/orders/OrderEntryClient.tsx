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

// ---------------------------------------------------------------------------
// Step status helpers
// ---------------------------------------------------------------------------

type StepStatus = "pending" | "active" | "action" | "complete" | "skipped";

function StepHeader({
  num,
  service,
  title,
  status,
}: {
  num: number;
  service: string;
  title: string;
  status: StepStatus;
}) {
  const statusLabel: Record<StepStatus, string> = {
    pending: "Pending",
    active: "In progress",
    action: "Action needed",
    complete: "Complete",
    skipped: "Skipped",
  };
  const statusColor: Record<StepStatus, string> = {
    pending: "text-slate-400",
    active: "text-blue-600",
    action: "text-amber-600",
    complete: "text-green-600",
    skipped: "text-slate-400",
  };

  return (
    <div className="flex items-center justify-between px-3 py-2 bg-slate-100 border-b border-slate-200">
      <div className="flex items-center gap-2">
        {status === "complete" ? (
          <span
            className="flex items-center justify-center w-4 h-4 rounded-full bg-green-500 text-white text-[10px] font-bold"
            aria-hidden="true"
          >
            ✓
          </span>
        ) : status === "skipped" ? (
          <span
            className="flex items-center justify-center w-4 h-4 rounded-full bg-slate-300 text-white text-[10px] font-bold"
            aria-hidden="true"
          >
            ✓
          </span>
        ) : (
          <span
            className={`w-2 h-2 rounded-full ${status === "active" ? "bg-blue-500 animate-pulse" : status === "action" ? "bg-amber-500" : "bg-slate-200"}`}
          />
        )}
        <span className="text-[10px] font-mono font-semibold text-slate-400">{num}</span>
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">{service}</span>
        <span className="text-xs text-slate-400">·</span>
        <span className="text-xs text-slate-500">{title}</span>
      </div>
      <span className={`text-[10px] font-medium ${statusColor[status]}`}>
        {statusLabel[status]}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function OrderEntryPage({ patientId }: { patientId: string }) {
  const [selected, setSelected] = useState<Regimen | null>(null);

  // CRD state — separate per hook
  const [selectCards, setSelectCards] = useState<CdsCard[]>([]);
  const [signCards, setSignCards] = useState<CdsCard[]>([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [signLoading, setSignLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Order state
  const [signed, setSigned] = useState(false);

  // PAS state
  const [paSubmitting, setPaSubmitting] = useState(false);
  const [paError, setPaError] = useState<string | null>(null);
  const [claimResponse, setClaimResponse] = useState<ClaimResponseSummary | null>(null);

  // Biosimilar suggestion state
  const [suggestionAccepted, setSuggestionAccepted] = useState(false);
  const [suggestionOverridden, setSuggestionOverridden] = useState(false);
  const [modifiedDraftOrders, setModifiedDraftOrders] = useState<object | null>(null);

  // DTR completion tracking
  const [dtrCompleted, setDtrCompleted] = useState(false);

  // ── Derived state for the workflow steps ──

  const hasSuggestion = selectCards.some((c) => c.suggestions && c.suggestions.length > 0);

  // DTR detection: cards with links (SMART launch) at either hook stage
  const selectDtrCard = selectCards.find((c) => (c.links?.length ?? 0) > 0);
  const signDtrCard = signCards.find((c) => (c.links?.length ?? 0) > 0);
  const _dtrNeeded = !!selectDtrCard || !!signDtrCard;

  // Coverage status from order-select
  const coverageMet =
    selectCards.some((c) => c.indicator === "info" || c.indicator === "success") ||
    selectCards.some((c) => c.source.topic?.code === "prior-auth-required");

  // PA required at either stage
  const hasPaCard =
    selectCards.some((c) => c.source.topic?.code === "prior-auth-required") ||
    signCards.some((c) => c.source.topic?.code === "prior-auth-required");

  // Authorization satisfied at order-sign
  const authSatisfied = signCards.some((c) => c.indicator === "success");

  // The regimen as displayed — substitution applied if accepted
  const displayRegimen =
    selected && suggestionAccepted ? applyBiosimilarSubstitution(selected) : selected;

  // ── DTR return handler ──
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
    setDtrCompleted(true);
    setSelectLoading(true);
    setError(null);
    fireCdsHook("order-select", patientId, regimen)
      .then((r) => setSelectCards(r.cards))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "CRD service unavailable"))
      .finally(() => setSelectLoading(false));
  }, [patientId]);

  // ── CRD hook caller ──
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
    setDtrCompleted(false);
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

  // ── Determine step statuses ──
  const selectStatus: StepStatus = !selected
    ? "pending"
    : selectLoading
      ? "active"
      : selectDtrCard && !dtrCompleted
        ? "action"
        : "complete";

  const dtrStatus: StepStatus = !selected
    ? "pending"
    : !selectDtrCard
      ? "skipped"
      : dtrCompleted
        ? "complete"
        : signed
          ? "skipped"
          : "action";

  const signStatus: StepStatus = !selected
    ? "pending"
    : signLoading
      ? "active"
      : signed
        ? signDtrCard
          ? "action"
          : "complete"
        : "pending";

  const pasStatus: StepStatus = !selected
    ? "pending"
    : !hasPaCard
      ? authSatisfied
        ? "skipped"
        : "pending"
      : claimResponse
        ? "complete"
        : paSubmitting
          ? "active"
          : signed
            ? "action"
            : "pending";

  return (
    <div className="flex gap-4">
      {/* ════════════════════════════════════════════════════════════════
          Left column — Order Selection + Order Detail
          ════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* ── Order Selection ── */}
        <RegimenSelector regimens={REGIMENS} selectedId={selected?.id} onSelect={onSelectRegimen} />

        {/* ── Order Detail ── */}
        {displayRegimen ? (
          <div className="rounded-lg border-2 border-slate-300 overflow-hidden shadow-sm">
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
                  A biosimilar substitution has been proposed — review in the CRD guidance panel
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

              {/* Sign Order button */}
              <div className="pt-2 border-t border-slate-200">
                {signed ? (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-green-700">
                    <span aria-hidden="true">✓</span> Order Signed
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onSignOrder}
                    disabled={signLoading || !selected}
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
          Right column — Coverage & Authorization workflow
          ════════════════════════════════════════════════════════════════ */}
      <div className="w-[420px] flex-shrink-0 space-y-3">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
          Coverage &amp; Authorization
        </h2>

        {error && (
          <div className="border border-red-200 bg-red-50 rounded px-4 py-3 text-sm text-red-700">
            <span className="font-semibold">Error:</span> {error}
          </div>
        )}

        {/* ── Step 1: CRD · Order Select ── */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <StepHeader num={1} service="CRD" title="Order Select" status={selectStatus} />
          <div className="bg-white">
            {selectLoading && (
              <div className="flex items-center gap-2 text-sm text-slate-500 px-4 py-4">
                <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                Consulting CRD service…
              </div>
            )}

            {!selected && !selectLoading && (
              <p className="px-4 py-4 text-sm text-slate-400">
                Select a regimen to begin coverage discovery.
              </p>
            )}

            {selectCards.length > 0 && !selectLoading && (
              <OrderSelectSummary
                cards={selectCards}
                patientId={patientId}
                selectedRegimenId={selected?.id}
                onAcceptSuggestion={onAcceptSuggestion}
                onOverrideSuggestion={onOverrideSuggestion}
                suggestionAccepted={suggestionAccepted}
                suggestionOverridden={suggestionOverridden}
              />
            )}
          </div>
        </div>

        {/* ── Step 2: DTR · Documentation ── */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <StepHeader num={2} service="DTR" title="Documentation" status={dtrStatus} />
          <div className="bg-white px-4 py-3">
            {dtrStatus === "skipped" && (
              <p className="text-sm text-slate-400">
                {selectDtrCard
                  ? "Skipped — order signed without completing documentation."
                  : "All required clinical data present — documentation not needed."}
              </p>
            )}

            {dtrStatus === "complete" && (
              <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                <span aria-hidden="true">✓</span>
                Documentation completed — clinical data updated.
              </p>
            )}

            {dtrStatus === "action" && selectDtrCard && (
              <>
                {selectDtrCard.detail && (
                  <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                    {renderDetailInline(selectDtrCard.detail)}
                  </p>
                )}
                {selectDtrCard.links?.map((link) => {
                  const href = buildDtrHref(link, selectDtrCard, patientId, selected?.id);
                  return (
                    <a
                      key={link.url}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                    >
                      {link.label}
                      <span aria-hidden="true">↗</span>
                    </a>
                  );
                })}
              </>
            )}

            {dtrStatus === "pending" && (
              <p className="text-sm text-slate-400">Awaiting order-select guidance.</p>
            )}
          </div>
        </div>

        {/* ── Step 3: CRD · Order Sign ── */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <StepHeader num={3} service="CRD" title="Order Sign" status={signStatus} />
          <div className="bg-white">
            {signLoading && (
              <div className="flex items-center gap-2 text-sm text-slate-500 px-4 py-4">
                <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                Signing order…
              </div>
            )}

            {!signed && !signLoading && (
              <p className="px-4 py-4 text-sm text-slate-400">
                {selected
                  ? "Sign the order to get the final authorization determination."
                  : "Select and sign an order to continue."}
              </p>
            )}

            {signCards.length > 0 && !signLoading && (
              <div className="divide-y divide-slate-100">
                {/* DTR launch link — same prominent UX as step 2 */}
                {signDtrCard && (
                  <div className="px-4 py-3 bg-amber-50">
                    {signDtrCard.detail && (
                      <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                        {renderDetailInline(signDtrCard.detail)}
                      </p>
                    )}
                    {signDtrCard.links?.map((link) => {
                      const href = buildDtrHref(link, signDtrCard, patientId, selected?.id);
                      return (
                        <a
                          key={link.url}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                        >
                          {link.label}
                          <span aria-hidden="true">↗</span>
                        </a>
                      );
                    })}
                  </div>
                )}
                {/* Non-DTR sign cards */}
                {signCards
                  .filter((c) => !((c.links?.length ?? 0) > 0))
                  .map((card, i) => (
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
        </div>

        {/* ── Step 4: PAS · Prior Authorization ── */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <StepHeader num={4} service="PAS" title="Prior Authorization" status={pasStatus} />
          <div className="bg-white px-4 py-3 space-y-3">
            {pasStatus === "skipped" && (
              <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                <span aria-hidden="true">✓</span>
                Authorization satisfied — PA not required.
              </p>
            )}

            {pasStatus === "pending" && (
              <p className="text-sm text-slate-400">
                {hasPaCard
                  ? "Sign the order, then submit a PA request to the payer."
                  : "Complete prior steps to determine PA requirements."}
              </p>
            )}

            {pasStatus === "action" && (
              <>
                <p className="text-xs text-slate-500">
                  Submit a prior authorization request to the payer for a coverage determination.
                </p>
                <button
                  type="button"
                  onClick={submitPa}
                  disabled={paSubmitting}
                  className="w-full px-4 py-2.5 bg-slate-800 text-white text-sm font-semibold rounded hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {paSubmitting ? "Submitting…" : "Submit Prior Authorization"}
                </button>
              </>
            )}

            {paError && (
              <div className="border border-red-200 bg-red-50 rounded px-3 py-2 text-sm text-red-700">
                {paError}
              </div>
            )}

            {claimResponse && (
              <ClaimResponseDisplay
                outcome={claimResponse.outcome}
                disposition={claimResponse.disposition}
                processNote={claimResponse.processNote}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers for DTR rendering
// ---------------------------------------------------------------------------

function renderDetailInline(text: string): React.ReactNode {
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

function buildDtrHref(
  link: { url: string; appContext?: string; type: string },
  card: CdsCard | undefined,
  patientId: string,
  selectedRegimenId?: string
): string {
  if (!card || link.type !== "smart") return link.url;
  const url = new URL(link.url);
  url.searchParams.set(
    "iss",
    `${process.env.NEXT_PUBLIC_EHR_BASE_URL ?? "http://localhost:4001"}/api/fhir`
  );
  url.searchParams.set("launch", `patient/${patientId}`);
  if (link.appContext) url.searchParams.set("appContext", link.appContext);
  if (selectedRegimenId) url.searchParams.set("returnRegimen", selectedRegimenId);
  return url.toString();
}
