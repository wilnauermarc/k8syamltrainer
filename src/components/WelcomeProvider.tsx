"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { X } from "lucide-react";

import { SupportLinkButtons } from "@/components/SupportLinkButtons";
import { SupportProfileAvatar } from "@/components/SupportProfileAvatar";
import type { SupportLinkConfig } from "@/lib/config/support";
import { hasSupportLinks } from "@/lib/config/support";
import { dismissWelcome, isWelcomeDismissed } from "@/lib/storage/welcome";

interface WelcomeContextValue {
  openWelcome: () => void;
}

const WelcomeContext = createContext<WelcomeContextValue | null>(null);

export function useWelcome() {
  const ctx = useContext(WelcomeContext);
  if (!ctx) {
    throw new Error("useWelcome must be used within WelcomeProvider");
  }
  return ctx;
}

interface WelcomeProviderProps {
  children: React.ReactNode;
  links: SupportLinkConfig;
}

export function WelcomeProvider({ children, links }: WelcomeProviderProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isWelcomeDismissed()) {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const openWelcome = useCallback(() => setOpen(true), []);

  const handleDismiss = useCallback(() => {
    dismissWelcome();
    setOpen(false);
  }, []);

  return (
    <WelcomeContext.Provider value={{ openWelcome }}>
      {children}
      <WelcomeOverlay
        open={open}
        links={links}
        onClose={() => setOpen(false)}
        onDismiss={handleDismiss}
      />
    </WelcomeContext.Provider>
  );
}

interface WelcomeOverlayProps {
  open: boolean;
  links: SupportLinkConfig;
  onClose: () => void;
  onDismiss: () => void;
}

function WelcomeOverlay({ open, links, onClose, onDismiss }: WelcomeOverlayProps) {
  const showSupport = hasSupportLinks(links);
  const profileHref = links.website || links.linkedIn || undefined;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-stretch justify-center p-0 transition sm:p-4 lg:p-8 ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        aria-label="Close welcome message"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className={`relative flex h-full w-full max-w-5xl flex-col overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl transition-all duration-300 ease-out sm:max-h-[min(720px,100%)] sm:rounded-2xl lg:flex-row ${
          open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
        }`}
      >
        <section className="relative flex shrink-0 flex-col justify-between border-b border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-sky-950/40 px-6 py-8 sm:px-8 lg:w-[min(380px,42%)] lg:border-b-0 lg:border-r">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800/80 hover:text-slate-200 lg:hidden"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <SupportProfileAvatar
              src={links.profileImage}
              size="lg"
              href={profileHref}
            />
            <p className="mt-5 text-sm font-medium uppercase tracking-wider text-sky-400">
              👋 Welcome
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-100">Hi, I&apos;m Marc</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              I built this trainer to help you understand Kubernetes YAML — not just generate it.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Free &amp; open learning. If it helps you grow, I&apos;d love to stay connected.
            </p>
          </div>

          {showSupport && (
            <div className="mt-8 flex justify-center lg:justify-start">
              <SupportLinkButtons links={links} size="md" align="start" />
            </div>
          )}
        </section>

        <section className="flex min-h-0 flex-1 flex-col">
          <div className="hidden items-start justify-between gap-3 border-b border-slate-800 px-6 py-5 lg:flex">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Why this exists
              </p>
              <h3 id="welcome-title" className="mt-1 text-lg font-semibold text-slate-100">
                Kubernetes YAML Trainer
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 text-sm leading-relaxed text-slate-300 sm:px-8">
            <p className="lg:hidden text-xs font-medium uppercase tracking-wider text-slate-500">
              Why this exists
            </p>
            <p className="mt-2 lg:mt-0">Yes, AI can generate Kubernetes manifests in seconds.</p>
            <p className="mt-4 font-medium text-slate-100">
              And that&apos;s exactly why understanding them matters more than ever.
            </p>
            <p className="mt-4">
              In real-world environments, engineers don&apos;t just generate YAMLs — they review
              them, debug them, improve them, and operate the systems behind them.
            </p>
            <p className="mt-4">This trainer isn&apos;t about memorizing syntax.</p>
            <p className="mt-4">
              It&apos;s about learning to recognize patterns, understand Kubernetes concepts, spot
              mistakes, and build the intuition needed to work confidently with cloud-native
              platforms.
            </p>
            <div className="mt-6 rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
              <p className="font-medium text-sky-200">Think of it this way:</p>
              <p className="mt-2 text-slate-300">AI can help you write manifests.</p>
              <p className="mt-2 font-medium text-slate-100">
                You still need to know whether they&apos;re correct.
              </p>
            </div>
            <p className="mt-6 text-slate-400">Happy learning 🚀</p>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-800 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
            >
              Maybe later
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500"
            >
              Got it
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
