"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container, GraduationCap, LineChart, Search } from "lucide-react";

import { SupportLinkButtons } from "@/components/SupportLinkButtons";
import type { SupportLinkConfig } from "@/lib/config/support";
import { hasSupportLinks } from "@/lib/config/support";

const navLinks = [
  { href: "/train", label: "Train", icon: GraduationCap },
  { href: "/review", label: "Review", icon: Search },
  { href: "/progress", label: "Progress", icon: LineChart },
];

interface HeaderProps {
  links: SupportLinkConfig;
}

export function Header({ links }: HeaderProps) {
  const pathname = usePathname();
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
        {showSupport && (
          <div className="hidden border-l border-slate-800 pl-2 lg:block">
            <SupportLinkButtons links={links} size="sm" />
          </div>
        )}
      </div>
    </header>
  );
}
