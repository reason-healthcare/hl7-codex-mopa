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
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-tight text-slate-800">OGCA: {service}</span>
        {/* biome-ignore lint/a11y/useImgPresentationRole: decorative brand logo */}
        <img
          src="/codex-logo.png"
          alt="CodeX"
          style={{ maxWidth: "200px", height: "auto", width: "100%" }}
        />
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Vermonster wordmark SVG
// ---------------------------------------------------------------------------

function VermonsterLogo() {
  return (
    <svg
      viewBox="0 0 148 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Vermonster"
      style={{ height: "18px", width: "auto" }}
    >
      {/* Stylised V mark */}
      <path
        d="M2 3 L8.5 17 L15 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Wordmark */}
      <path
        d="M22 16 L26.2 6 L28 10.6 L29.8 6 L34 16 M36 16 V6 h5.5 a2.5 2.5 0 0 1 0 5 H36 M41.5 11 L45 16 M48 16 V6 l4 6 4-6 v10 M60 11 a5 5 0 1 1 10 0 a5 5 0 1 1-10 0 M73 16 V6 l7 7 V6 M83 6 h8 M87 6 v10 M94 6 h8 a3 3 0 0 1 0 5 h-8 m8 0 l3.5 5 M108 11 a5 5 0 1 0 9 2 M120 6 h6 a3 3 0 0 1 0 5 h-6 v5 M130 6 h8 v4 h-8 v6 h8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// OgcaFooter
// ---------------------------------------------------------------------------

export function OgcaFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-center gap-2 text-xs text-slate-400">
        <span>This reference implementation was built by</span>
        <a
          href="https://vermonster.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <VermonsterLogo />
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
