"use client";

import { useState } from "react";
import type { GapResult } from "../lib/data-fetching";
import { REQUIRED_KEYS } from "../lib/data-fetching";

interface HER2InputFormProps {
  patientId: string;
  gap: GapResult;
}

const HER2_OPTIONS = [
  {
    value: "431396003",
    system: "http://snomed.info/sct",
    label: "IHC 3+ (Positive)",
    description: "Strong complete membrane staining",
  },
  {
    value: "431397007",
    system: "http://snomed.info/sct",
    label: "IHC 2+ / ISH Amplified",
    description: "Moderate complete membrane staining, ISH amplified",
  },
  {
    value: "431396003",
    system: "http://snomed.info/sct",
    label: "IHC 0 / IHC 1+ (Negative)",
    description: "No or faint incomplete membrane staining",
  },
];

// Override the third option code for negative
HER2_OPTIONS[2] = {
  value: "260385009",
  system: "http://snomed.info/sct",
  label: "IHC 0 / IHC 1+ (Negative)",
  description: "No or faint incomplete membrane staining",
};

export default function HER2InputForm({ patientId, gap }: HER2InputFormProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (gap.present || !REQUIRED_KEYS.includes(gap.key)) return null;

  async function handleSubmit() {
    if (!selected) return;
    const option = HER2_OPTIONS.find((o) => o.value === selected);
    if (!option) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/write-back", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          code: "85319-2",
          system: "http://loinc.org",
          display: "HER2 [Presence] in Breast cancer specimen by Immune stain",
          value: option.value,
          valueDisplay: option.label,
          valueSystem: option.system,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
      }
      setSubmitted(true);
      // Reload after a short delay to allow HAPI to index the new observation
      setTimeout(() => window.location.reload(), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Write-back failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mt-3 bg-green-50 border border-green-200 rounded p-3 text-sm text-green-800">
        ✓ HER2 result saved. Reloading gap analysis in 3 seconds…
        <span className="text-xs text-green-600 block mt-1">
          (HAPI search index may take ~10s — refresh again if HER2 still shows missing)
        </span>
      </div>
    );
  }

  return (
    <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-3 space-y-3">
      <p className="text-sm font-medium text-amber-900">Enter HER2 result:</p>
      <div className="space-y-2">
        {HER2_OPTIONS.map((opt) => (
          <label key={opt.value + opt.label} className="flex items-start gap-2 cursor-pointer">
            <input
              type="radio"
              name="her2"
              value={opt.value}
              checked={
                selected === opt.value &&
                opt.label === HER2_OPTIONS.find((o) => o.value === selected)?.label
              }
              onChange={() => setSelected(opt.value)}
              className="mt-0.5"
            />
            <span className="text-sm">
              <span className="font-medium text-gray-800">{opt.label}</span>
              <span className="text-gray-500 ml-1">— {opt.description}</span>
            </span>
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selected || submitting}
        className="px-4 py-1.5 bg-amber-600 text-white text-sm font-medium rounded hover:bg-amber-700 disabled:opacity-50 transition-colors"
      >
        {submitting ? "Saving…" : "Save HER2 Result"}
      </button>
    </div>
  );
}
