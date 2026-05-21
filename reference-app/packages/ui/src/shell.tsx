import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// OgcaNav
// ---------------------------------------------------------------------------

interface OgcaNavProps {
  /** e.g. "Hub", "EHR", "CRD Service" */
  service: string;
}

export function OgcaNav({ service }: OgcaNavProps) {
  return (
    <nav className="bg-slate-800 text-slate-100">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-tight">
          OGCA: {service}
        </span>
        {/* biome-ignore lint/a11y/useImgPresentationRole: decorative brand logo */}
        <img src="/codex-logo.png" alt="CodeX" className="h-5 opacity-90" />
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// OgcaFooter
// ---------------------------------------------------------------------------

export function OgcaFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-4 text-xs text-slate-400 text-center">
        This reference implementation was built by{" "}
        <a
          href="https://vermonster.com"
          target="_blank"
          rel="noreferrer"
          className="underline hover:text-slate-600 transition-colors"
        >
          Vermonster
        </a>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// OgcaShell — wraps the full page: nav + scrollable body + footer
// ---------------------------------------------------------------------------

interface OgcaShellProps {
  service: string;
  children: ReactNode;
}

export function OgcaShell({ service, children }: OgcaShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <OgcaNav service={service} />
      <div className="flex-1 flex flex-col">{children}</div>
      <OgcaFooter />
    </div>
  );
}
