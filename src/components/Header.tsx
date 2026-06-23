"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bug, Container, GraduationCap, LineChart, Sparkles } from "lucide-react";

import { SupportLinkButtons } from "@/components/SupportLinkButtons";
import { useWelcome } from "@/components/WelcomeProvider";
import type { SupportLinkConfig } from "@/lib/config/support";
import { hasSupportLinks } from "@/lib/config/support";

const navLinks = [
  { href: "/train", label: "Train", icon: GraduationCap },
  { href: "/debug", label: "Debug", icon: Bug },
  { href: "/progress", label: "Progress", icon: LineChart },
];

interface HeaderProps {
  links: SupportLinkConfig;
}

export function Header({ links }: HeaderProps) {
  const pathname = usePathname();
  const { openWelcome } = useWelcome();
  const showSupport = hasSupportLinks(links);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-800 bg-slate-950 px-4">
      <Link href="/" className="flex shrink-0 items-center gap-2.5 font-semibold text-slate-100">
        <Container className="h-5 w-5 text-sky-400" />
        <span className="hidden sm:inline">k8s YAML Trainer</span>
      </Link>

      <div className="flex min-w-0 items-center gap-2">
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition sm:px-3 ${
                  active
                    ? "bg-sky-500/15 text-sky-300"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={openWelcome}
          title="Why this trainer exists"
          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-sky-300"
          aria-label="Open welcome message"
        >
          <Sparkles className="h-4 w-4" />
        </button>
        {showSupport && (
          <div className="hidden border-l border-slate-800 pl-2 lg:block">
            <SupportLinkButtons links={links} size="sm" />
          </div>
        )}
      </div>
    </header>
  );
}
