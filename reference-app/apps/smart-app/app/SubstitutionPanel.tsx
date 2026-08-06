"use client";

export interface SubstitutionInfo {
  originalDisplay: string;
  substitutedDisplay: string;
  rationale: string;
}

/**
 * "Payer Modification" panel — shows the clinician what the payer will
 * change about the ordered regimen (e.g. biosimilar substitution).
 *
 * Appears between the guideline indication and the PA status so the
 * clinician sees the modification before signing.
 */
export default function SubstitutionPanel({ substitutions }: { substitutions: SubstitutionInfo[] }) {
  if (!substitutions.length) return null;

  return (
    <div className="border border-violet-300 bg-violet-50 rounded-lg px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-1.5 py-0.5 rounded bg-violet-100 text-violet-800">
          <span aria-hidden="true">⚠</span>
          Payer Modification Required
        </span>
      </div>
      <p className="text-sm text-slate-700 mb-3">
        The regimen is approved, but the payer requires the following substitution
        {substitutions.length > 1 ? "s" : ""}:
      </p>
      <div className="space-y-2">
        {substitutions.map((sub, i) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: substitutions have no stable id
            key={i}
            className="flex items-center gap-2 bg-white border border-violet-200 rounded px-3 py-2"
          >
            <div className="flex items-center gap-2 text-sm flex-1">
              <span className="font-medium text-slate-800 line-through decoration-slate-400">
                {sub.originalDisplay}
              </span>
              <span aria-hidden="true" className="text-violet-600 font-bold">→</span>
              <span className="font-medium text-violet-800">{sub.substitutedDisplay}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-3 italic">
        {substitutions[0]?.rationale}
      </p>
    </div>
  );
}
