import Link from "next/link";

export function LegalFooterLinks() {
  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-600"
      aria-label="Rechtliches"
    >
      <Link href="/impressum" className="transition hover:text-slate-400">
        Impressum
      </Link>
      <span className="text-slate-800" aria-hidden>
        ·
      </span>
      <Link href="/datenschutz" className="transition hover:text-slate-400">
        Datenschutz
      </Link>
    </nav>
  );
}
