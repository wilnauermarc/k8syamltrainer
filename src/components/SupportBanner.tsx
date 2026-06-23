import type { SupportLinkConfig } from "@/lib/config/support";
import { hasSupportLinks } from "@/lib/config/support";

import { SupportLinkButtons } from "./SupportLinkButtons";
import { SupportProfileAvatar } from "./SupportProfileAvatar";

interface SupportBannerProps {
  links: SupportLinkConfig;
}

export function SupportBanner({ links }: SupportBannerProps) {
  if (!hasSupportLinks(links)) return null;

  return (
    <section className="mt-16 w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-center">
      <div className="mb-4 flex justify-center">
        <SupportProfileAvatar
          src={links.profileImage}
          size="md"
          href={links.website || links.linkedIn || undefined}
        />
      </div>
      <p className="text-sm text-slate-400">
        Found this useful for interviews or day-to-day K8s work?
      </p>
      <p className="mt-1 text-xs text-slate-600">
        Connect, follow along, or buy me a coffee — it keeps the trainer free.
      </p>
      <div className="mt-4 flex justify-center">
        <SupportLinkButtons links={links} size="md" />
      </div>
    </section>
  );
}
