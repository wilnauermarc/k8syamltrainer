import type { SupportLinkConfig } from "@/lib/config/support";
import { hasSupportLinks } from "@/lib/config/support";

import { LegalFooterLinks } from "./LegalFooterLinks";
import { SupportLinkButtons } from "./SupportLinkButtons";
import { SupportProfileAvatar } from "./SupportProfileAvatar";

interface SupportFooterProps {
  links: SupportLinkConfig;
}

export function SupportFooter({ links }: SupportFooterProps) {
  const showSupport = hasSupportLinks(links);

  return (
    <footer className="shrink-0 border-t border-slate-800/80 bg-slate-950/80">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-3">
        {showSupport && (
          <div className="flex w-full flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-3">
              <SupportProfileAvatar
                src={links.profileImage}
                size="sm"
                href={links.website || links.linkedIn || undefined}
              />
              <p className="text-xs text-slate-600">
                Free & open learning — if it helps you, consider supporting.
              </p>
            </div>
            <SupportLinkButtons links={links} size="sm" />
          </div>
        )}
        <LegalFooterLinks />
      </div>
    </footer>
  );
}
