/**
 * Support / monetization links — set in `.env.local` (see `.env.example`).
 */

export interface SupportLinkConfig {
  linkedIn: string;
  website: string;
  buyMeACoffee: string;
  profileImage: string;
}

export function getSupportLinks(): SupportLinkConfig {
  return {
    linkedIn: process.env.NEXT_PUBLIC_LINKEDIN_URL?.trim() ?? "",
    website: process.env.NEXT_PUBLIC_WEBSITE_URL?.trim() ?? "",
    buyMeACoffee: process.env.NEXT_PUBLIC_BUYMEACOFFEE_URL?.trim() ?? "",
    profileImage: process.env.NEXT_PUBLIC_PROFILE_IMAGE?.trim() || "/profile.jpg",
  };
}

export function hasSupportLinks(links: SupportLinkConfig = getSupportLinks()): boolean {
  return Boolean(links.linkedIn || links.website || links.buyMeACoffee);
}

/** @deprecated use getSupportLinks() */
export const supportLinks = getSupportLinks();
