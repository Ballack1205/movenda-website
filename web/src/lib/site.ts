// Single source of truth for the public origin and the preview switch.
// Layout (canonical/OG), schema.ts (JSON-LD), robots.txt, llms*.txt and the
// sitemap all read from here so a DNS cutover is one env var
// (PUBLIC_SITE_URL) and one flag (PUBLIC_NOINDEX) in Render — nothing
// hardcoded anywhere else.

export const PREVIEW_URL = "https://movenda-preview.onrender.com";

export const SITE_URL = (import.meta.env.PUBLIC_SITE_URL || PREVIEW_URL).replace(/\/+$/, "");

/** True while the site is a pitch preview; flips with PUBLIC_NOINDEX=false at go-live. */
export const NOINDEX = import.meta.env.PUBLIC_NOINDEX !== "false";

/** Absolute URL for a site-relative path; passes through absolute URLs untouched. */
export function absoluteUrl(pathOrUrl: string): string;
export function absoluteUrl(pathOrUrl?: string): string | undefined;
export function absoluteUrl(pathOrUrl?: string): string | undefined {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl, `${SITE_URL}/`).toString();
}
