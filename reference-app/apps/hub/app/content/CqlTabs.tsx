"use client";
import { useState } from "react";

export default function CqlTabs({ cql, elm }: { cql: string; elm: string }) {
  const [tab, setTab] = useState<"cql" | "elm">("cql");
  return (
    <div>
      <div className="flex border-b border-slate-200 mb-0">
        {(["cql", "elm"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-xs font-medium transition-colors ${
              tab === t
                ? "border-b-2 border-blue-600 text-blue-700 -mb-px"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "cql" ? "CQL Source" : "ELM (JSON)"}
          </button>
        ))}
      </div>
      <pre className="text-xs font-mono bg-slate-950 text-slate-100 p-4 overflow-x-auto rounded-b max-h-96 leading-relaxed whitespace-pre-wrap">
        {tab === "cql" ? cql : elm}
      </pre>
    </div>
  );
}
