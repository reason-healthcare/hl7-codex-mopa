import type { Regimen } from "../lib/guideline";

interface RegimenOptionsProps {
  regimens: Regimen[];
}

export default function RegimenOptions({ regimens }: RegimenOptionsProps) {
  const indicated    = regimens.filter((r) => r.onGuideline);
  const notIndicated = regimens.filter((r) => !r.onGuideline);

  if (indicated.length === 0) {
    return (
      <p className="text-sm text-slate-500 italic">
        No regimens indicated by the guideline for the current clinical data.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {[...indicated, ...notIndicated].map((regimen) => (
        <div
          key={regimen.id}
          className={`rounded-lg border px-4 py-3 ${
            regimen.onGuideline
              ? "border-green-300 bg-green-50"
              : "border-slate-200 bg-slate-50 opacity-60"
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                regimen.onGuideline
                  ? "bg-green-100 text-green-800"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {regimen.onGuideline ? "On guideline" : "Not indicated"}
            </span>
            <span className="font-medium text-sm text-slate-800">{regimen.label}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{regimen.description}</p>
        </div>
      ))}
    </div>
  );
}
