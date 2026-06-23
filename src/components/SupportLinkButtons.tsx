import { Coffee, Globe } from "lucide-react";

import type { SupportLinkConfig } from "@/lib/config/support";
import { hasSupportLinks } from "@/lib/config/support";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 114.126 0 2.063 2.063 0 01-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

interface SupportLinkButtonsProps {
  links: SupportLinkConfig;
  size?: "sm" | "md";
}

export function SupportLinkButtons({ links, size = "sm" }: SupportLinkButtonsProps) {
  if (!hasSupportLinks(links)) return null;

  const isMd = size === "md";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
      {links.website && (
        <a
          href={links.website}
          target="_blank"
          rel="noopener noreferrer"
          className={
            isMd
              ? "inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-500/40 hover:text-emerald-300"
              : "inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/50 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-emerald-600/50 hover:text-emerald-300"
          }
        >
          <Globe className={isMd ? "h-4 w-4 text-emerald-400" : "h-3.5 w-3.5"} />
          Website
        </a>
      )}
      {links.linkedIn && (
        <a
          href={links.linkedIn}
          target="_blank"
          rel="noopener noreferrer"
          className={
            isMd
              ? "inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-500/40 hover:text-sky-300"
              : "inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/50 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-sky-600/50 hover:text-sky-300"
          }
        >
          <LinkedInIcon className={isMd ? "h-4 w-4 text-sky-400" : "h-3.5 w-3.5"} />
          LinkedIn
        </a>
      )}
      {links.buyMeACoffee && (
        <a
          href={links.buyMeACoffee}
          target="_blank"
          rel="noopener noreferrer"
          className={
            isMd
              ? "inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-500/20"
              : "inline-flex items-center gap-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-200/90 transition hover:bg-amber-500/20"
          }
        >
          <Coffee className={isMd ? "h-4 w-4 text-amber-400" : "h-3.5 w-3.5"} />
          Buy me a coffee
        </a>
      )}
    </div>
  );
}
