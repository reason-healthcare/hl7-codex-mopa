import type { ReactNode } from "react";

interface ServiceIntroProps {
  title: string;
  description: string;
  /** Optional href for API documentation (e.g. "/docs"). */
  apiDocsHref?: string;
  /** Slot for extra action elements (buttons, badges) shown right-aligned. */
  actions?: ReactNode;
}

/** White banner between the nav and main content on every service page. */
export function ServiceIntro({ title, description, apiDocsHref, actions }: ServiceIntroProps) {
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-6 py-5 flex items-start justify-between gap-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500 mt-0.5 leading-relaxed max-w-2xl">{description}</p>
          {apiDocsHref && (
            <a
              href={apiDocsHref}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mt-2"
            >
              API documentation →
            </a>
          )}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
