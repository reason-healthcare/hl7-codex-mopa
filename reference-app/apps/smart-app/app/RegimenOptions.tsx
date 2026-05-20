"use client";

import type { Regimen } from "../lib/guideline";

interface RegimenOptionsProps {
  regimens: Regimen[];
  patientId: string;
  ehrBaseUrl: string;
}

export default function RegimenOptions({ regimens, patientId, ehrBaseUrl }: RegimenOptionsProps) {
  const eligible = regimens.filter((r) => r.eligible);
  const ineligible = regimens.filter((r) => !r.eligible);

  if (eligible.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        No regimens eligible based on current clinical data.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {[...eligible, ...ineligible].map((regimen) => {
        const ordersUrl = `${ehrBaseUrl}/patients/${patientId}/orders`;
        return (
          <div
            key={regimen.id}
            className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
              regimen.eligible
                ? "border-green-300 bg-green-50"
                : "border-gray-200 bg-gray-50 opacity-60"
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                    regimen.eligible ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {regimen.eligible ? "✓ Eligible" : "✗ Not eligible"}
                </span>
                <span className="font-medium text-sm text-gray-800">{regimen.label}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{regimen.description}</p>
            </div>
            {regimen.eligible && (
              <a
                href={ordersUrl}
                className="ml-4 flex-shrink-0 px-3 py-1.5 bg-blue-700 text-white text-xs font-medium rounded hover:bg-blue-800 transition-colors"
              >
                Order {regimen.shortLabel} →
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
