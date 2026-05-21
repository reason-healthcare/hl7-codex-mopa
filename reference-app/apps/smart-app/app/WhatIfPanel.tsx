"use client";

import { useState } from "react";
import type { Regimen } from "../lib/guideline";

// ---------------------------------------------------------------------------
// Answer option definitions (mirrors DTR questionnaire-gen.ts)
// ---------------------------------------------------------------------------

const HER2_OPTIONS = [
  { code: "10828004", system: "http://snomed.info/sct", display: "Positive (IHC 3+)" },
  { code: "42425007", system: "http://snomed.info/sct", display: "Equivocal (IHC 2+)" },
  { code: "260385009", system: "http://snomed.info/sct", display: "Negative (IHC 0 / 1+)" },
];

const STAGE_OPTIONS = [
  { code: "13104003", system: "http://snomed.info/sct", display: "Stage I" },
  { code: "60333009", system: "http://snomed.info/sct", display: "Stage II" },
  { code: "50283003", system: "http://snomed.info/sct", display: "Stage III" },
  { code: "2640006", system: "http://snomed.info/sct", display: "Stage IV" },
];

const ECOG_OPTIONS = [
  { code: "425389002", system: "http://snomed.info/sct", display: "0 — Fully active" },
  {
    code: "422512005",
    system: "http://snomed.info/sct",
    display: "1 — Restricted in strenuous activity",
  },
  {
    code: "422894000",
    system: "http://snomed.info/sct",
    display: "2 — Ambulatory, capable of self-care",
  },
  { code: "423053003", system: "http://snomed.info/sct", display: "3 — Limited self-care" },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AnswerCoding {
  system: string;
  code: string;
  display: string;
}
interface Answers {
  her2?: AnswerCoding;
  cancerStage?: AnswerCoding;
  ecogPs?: AnswerCoding;
}
interface EvalResult {
  regimens: Regimen[];
  paStatus: "pre-approved" | "pa-required" | "dtr-required";
}

function Select({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { code: string; system: string; display: string }[];
  value: string;
  onChange: (v: AnswerCoding | undefined) => void;
}) {
  return (
    <div>
      {/* biome-ignore lint/a11y/noLabelWithoutControl: label wraps a sibling select in parent */}
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <select
        className="w-full text-sm border border-slate-200 rounded px-3 py-1.5 bg-white text-slate-800 focus:outline-none focus:border-blue-400"
        value={value}
        onChange={(e) => {
          const opt = options.find((o) => o.code === e.target.value);
          onChange(opt ? { system: opt.system, code: opt.code, display: opt.display } : undefined);
        }}
      >
        <option value="">— select —</option>
        {options.map((o) => (
          <option key={o.code} value={o.code}>
            {o.display}
          </option>
        ))}
      </select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function WhatIfPanel({ patientId }: { patientId: string }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvalResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof Answers>(key: K, val: AnswerCoding | undefined) {
    setAnswers((prev) => ({ ...prev, [key]: val }));
    setResult(null);
  }

  async function evaluate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, answers }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Evaluation failed");
    } finally {
      setLoading(false);
    }
  }

  const PA_LABEL: Record<EvalResult["paStatus"], { text: string; cls: string }> = {
    "pre-approved": {
      text: "Pre-authorized — no PA required",
      cls: "bg-green-50 border-green-200 text-green-800",
    },
    "pa-required": { text: "PA required", cls: "bg-amber-50 border-amber-200 text-amber-800" },
    "dtr-required": {
      text: "Incomplete data — DTR required",
      cls: "bg-slate-50 border-slate-200 text-slate-600",
    },
  };

  return (
    <div className="mt-4 border border-slate-200 rounded bg-white overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
        <p className="text-sm font-semibold text-slate-800">What-if Analysis</p>
        <p className="text-xs text-slate-500 mt-0.5">
          Enter hypothetical values to explore eligibility and authorization outcomes. Nothing is
          written to the patient record.
        </p>
      </div>

      <div className="px-4 py-4 space-y-3">
        <Select
          label="HER2 Status"
          options={HER2_OPTIONS}
          value={answers.her2?.code ?? ""}
          onChange={(v) => set("her2", v)}
        />
        <Select
          label="Cancer Stage"
          options={STAGE_OPTIONS}
          value={answers.cancerStage?.code ?? ""}
          onChange={(v) => set("cancerStage", v)}
        />
        <Select
          label="ECOG Performance Status"
          options={ECOG_OPTIONS}
          value={answers.ecogPs?.code ?? ""}
          onChange={(v) => set("ecogPs", v)}
        />

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={evaluate}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-700 text-white text-sm font-medium rounded hover:bg-blue-800 disabled:opacity-50 transition-colors"
        >
          {loading ? "Evaluating…" : "Evaluate"}
        </button>
      </div>

      {result && (
        <div className="border-t border-slate-200 px-4 py-4 space-y-3">
          {/* PA Status */}
          <div
            className={`border rounded px-3 py-2 text-sm font-medium ${PA_LABEL[result.paStatus].cls}`}
          >
            {PA_LABEL[result.paStatus].text}
          </div>

          {/* Regimens */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              Regimen Eligibility
            </p>
            <div className="space-y-1.5">
              {result.regimens.map((r) => (
                <div
                  key={r.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded border text-sm ${
                    r.eligible
                      ? "border-green-200 bg-green-50"
                      : "border-slate-200 bg-slate-50 opacity-60"
                  }`}
                >
                  <span
                    className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                      r.eligible ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {r.eligible ? "✓" : "✗"}
                  </span>
                  <span className="font-medium text-slate-800">{r.shortLabel}</span>
                  <span className="text-slate-500 text-xs">{r.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
