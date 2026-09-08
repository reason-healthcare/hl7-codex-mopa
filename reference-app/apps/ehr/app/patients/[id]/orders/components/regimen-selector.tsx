"use client";

import { findRegimenCategory, isRegimenIntentCategory, type Regimen } from "@mopa/oncology-policy";

/**
 * EHR-style regimen selection table. Renders one row per regimen with its
 * short label, description, intent, and treatment line. Each row has a
 * "Select Order" button with a hover state. Calls onSelect when clicked.
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
    <section className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
        <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          Order Selection
        </h2>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50/50 border-b border-slate-200 text-left">
            <th className="px-3 py-1.5 font-medium text-slate-500 text-xs w-24">Regimen</th>
            <th className="px-3 py-1.5 font-medium text-slate-500 text-xs">Description</th>
            <th className="px-3 py-1.5 font-medium text-slate-500 text-xs w-28">Intent</th>
            <th className="px-3 py-1.5 font-medium text-slate-500 text-xs w-20">Line</th>
            <th className="px-3 py-1.5 w-32" />
          </tr>
        </thead>
        <tbody>
          {regimens.map((regimen) => {
            const isSelected = selectedId === regimen.id;
            const intent = findRegimenCategory(regimen, isRegimenIntentCategory);
            const line = findRegimenCategory(regimen, (c) =>
              c.system.endsWith("treatment-line-cs")
            );
            return (
              <tr
                key={regimen.id}
                className={`border-b border-slate-100 last:border-0 transition-colors ${
                  isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                }`}
              >
                <td className="px-3 py-2.5 font-semibold text-slate-900 whitespace-nowrap">
                  {regimen.shortLabel}
                </td>
                <td className="px-3 py-2.5 text-xs text-slate-500">{regimen.description}</td>
                <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                  {intent?.display ?? "Not specified"}
                </td>
                <td className="px-3 py-2.5 text-xs text-slate-500 whitespace-nowrap">
                  {line?.display ?? "Not specified"}
                </td>
                <td className="px-3 py-2.5 text-right">
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-blue-600 text-white rounded">
                      <span aria-hidden="true">✓</span>
                      Selected
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelect(regimen)}
                      className="inline-flex items-center text-xs font-semibold px-2.5 py-1 bg-white border border-slate-300 text-slate-600 rounded hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
                    >
                      Select Order
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
