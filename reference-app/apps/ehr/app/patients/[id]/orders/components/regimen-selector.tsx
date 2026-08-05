"use client";

import type { Regimen } from "@mopa/oncology-policy";

/**
 * Regimen selection list. Renders one button per regimen with its label,
 * description, and drug tags. Calls onSelect when a regimen is clicked.
 */
export function RegimenSelector({
  regimens,
  selectedId,
  onSelect,
}: {
  regimens: Regimen[];
  selectedId?: string;
  onSelect: (regimen: Regimen) => void;
}) {
  return (
    <section>
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
        Select Regimen
      </h2>
      <div className="space-y-2">
        {regimens.map((regimen) => {
          const isSelected = selectedId === regimen.id;
          return (
            <button
              key={regimen.id}
              type="button"
              onClick={() => onSelect(regimen)}
              className={`w-full text-left px-4 py-3 rounded border transition-colors ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="font-semibold text-sm text-slate-900">{regimen.label}</span>
              <p className="text-xs text-slate-500 mt-0.5">{regimen.description}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {regimen.phases.flatMap((p) => p.drugs).map((drug) => (
                  <span
                    key={drug.rxnorm}
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
  );
}
