import type { ReactNode } from "react";

interface ServiceIntroProps {
  title: string;
  description: string;
  apiDocsHref?: string;
  actions?: ReactNode;
}

/** Slate-50 context band between nav and main canvas on every service page. */
export function ServiceIntro({ title, description, apiDocsHref, actions }: ServiceIntroProps) {
  return (
    <div className="bg-slate-50 border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-6 py-6 flex items-start justify-between gap-8">
        <div>
          <h1 className="text-base font-semibold text-slate-900">{title}</h1>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed max-w-[65ch]">{description}</p>
          {apiDocsHref && (
            <a
              href={apiDocsHref}
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium mt-2 transition-colors"
            >
              API documentation →
            </a>
          )}
        </div>
        {actions && <div className="flex-shrink-0 pt-0.5">{actions}</div>}
      </div>
    </div>
  );
}
