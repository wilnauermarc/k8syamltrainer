import Link from "next/link";
import { ArrowRight, Container, Keyboard, Zap } from "lucide-react";

import { SupportBanner } from "@/components/SupportBanner";
import { getSupportLinks } from "@/lib/config/support";

export default function HomePage() {
  const supportLinks = getSupportLinks();

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-20 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 ring-1 ring-sky-500/20">
        <Container className="h-7 w-7 text-sky-400" />
      </div>

      <h1 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
        Learn Kubernetes YAML
        <span className="block text-sky-400">by writing it live</span>
      </h1>

      <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400">
        Type manifests directly in the editor. Get instant feedback on syntax,
        required fields, and best practices — no copy-paste required.
      </p>

      <Link
        href="/train"
        className="mt-10 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-500"
      >
        Start training
        <ArrowRight className="h-4 w-4" />
      </Link>

      <Link
        href="/review"
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-500/20"
      >
        Review broken manifests
        <ArrowRight className="h-4 w-4" />
      </Link>

      <div className="mt-20 grid w-full gap-6 sm:grid-cols-3">
        <Feature
          icon={<Keyboard className="h-5 w-5 text-sky-400" />}
          title="Live editor"
          description="CodeMirror with YAML syntax highlighting, indentation, and scaffold templates."
        />
        <Feature
          icon={<Zap className="h-5 w-5 text-amber-400" />}
          title="Instant feedback"
          description="Validation runs as you type — see what's correct and what's missing."
        />
        <Feature
          icon={<Container className="h-5 w-5 text-emerald-400" />}
          title="Best practices"
          description="Learn probes, resource requests, image pinning, and more."
        />
      </div>

      <SupportBanner links={supportLinks} />
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-left">
      <div className="mb-3">{icon}</div>
      <h3 className="font-semibold text-slate-200">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}
