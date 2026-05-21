"use client";

import { useState } from "react";

type State = "idle" | "loading" | "success" | "error";

export default function ResetFixturesButton() {
  const [state, setState] = useState<State>("idle");
  const [detail, setDetail] = useState<string>("");

  async function handleReset() {
    setState("loading");
    setDetail("");
    try {
      const res = await fetch("/api/fixtures/reset", { method: "POST" });
      const data = (await res.json()) as {
        ok: boolean;
        results: Array<{ id: string; ok: boolean }>;
      };
      if (data.ok) {
        setState("success");
        setTimeout(() => window.location.reload(), 800);
      } else {
        const failed = data.results
          .filter((r) => !r.ok)
          .map((r) => r.id)
          .join(", ");
        setState("error");
        setDetail(`Failed: ${failed}`);
      }
    } catch (e) {
      setState("error");
      setDetail(e instanceof Error ? e.message : "Network error");
    }
  }

  const label: Record<State, string> = {
    idle: "Reset Patient Cases",
    loading: "Loading fixtures…",
    success: "Loaded — refreshing…",
    error: "Failed — retry",
  };
  const cls: Record<State, string> = {
    idle: "bg-emerald-600 hover:bg-emerald-700 text-white",
    loading: "bg-slate-400 text-white cursor-not-allowed",
    success: "bg-green-600 text-white",
    error: "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <div className="flex items-center gap-3 flex-shrink-0">
      <button
        type="button"
        disabled={state === "loading" || state === "success"}
        onClick={handleReset}
        className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold transition-colors ${cls[state]}`}
      >
        {state === "loading" && (
          <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        )}
        {label[state]}
      </button>
      {detail && <span className="text-xs text-red-600">{detail}</span>}
    </div>
  );
}
