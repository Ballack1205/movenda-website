// Public origin, preview/index switch, host mode (MPC-only), and visual theme.
// Layout (canonical/OG), schema.ts (JSON-LD), robots.txt, llms*.txt and the
// sitemap all read from here so a DNS cutover is env vars in Render — nothing
// hardcoded in pages.

export const PREVIEW_URL = "https://movenda-preview.onrender.com";
export const OLD_MOVENDA_URL = "https://www.movenda.be";

export type Theme = "current" | "lab";
export type HostMode = "full" | "mpc";

export const SITE_URL = (import.meta.env.PUBLIC_SITE_URL || PREVIEW_URL).replace(/\/+$/, "");

/** True unless PUBLIC_NOINDEX=false. Keep true on MPC until Friday 25 Sep 2026 + explicit OK. */
export const NOINDEX = import.meta.env.PUBLIC_NOINDEX !== "false";

/** Visual theme. QR preview and MPC-this-week stay `current`. Lab is a parallel noindex host. */
export const THEME: Theme = import.meta.env.PUBLIC_THEME === "lab" ? "lab" : "current";

/**
 * `mpc`: this deploy is only the Performance Centre (mpc.movenda.be).
 * Movenda brand links go to the existing Squarespace site. Flip back to
 * `full` when www.movenda.be points here; then 301 mpc.movenda.be → /mpc.
 */
export const HOST_MODE: HostMode = import.meta.env.PUBLIC_HOST_MODE === "mpc" ? "mpc" : "full";

export const MPC_HOST = HOST_MODE === "mpc";

export const MOVENDA_PUBLIC_URL = (import.meta.env.PUBLIC_MOVENDA_URL || OLD_MOVENDA_URL).replace(
  /\/+$/,
  "",
);

/** Absolute URL for a site-relative path; passes through absolute URLs untouched. */
export function absoluteUrl(pathOrUrl: string): string;
export function absoluteUrl(pathOrUrl?: string): string | undefined;
export function absoluteUrl(pathOrUrl?: string): string | undefined {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl, `${SITE_URL}/`).toString();
}

/** MPC home on this host (`/` when host-mode is on, `/mpc` on the full site). */
export function mpcHomePath(lang: "nl" | "en" = "nl"): string {
  if (MPC_HOST) return lang === "en" ? "/en" : "/";
  return lang === "en" ? "/en/mpc" : "/mpc";
}

/** Movenda home: old www.movenda.be while only MPC is on this deploy. */
export function movendaHomeHref(lang: "nl" | "en" = "nl"): string {
  if (MPC_HOST) return MOVENDA_PUBLIC_URL;
  return lang === "en" ? "/en" : "/";
}

/** Paths that belong on an MPC-only sitemap (when HOST_MODE=mpc). */
export function isMpcSitemapPath(pathname: string): boolean {
  const p = pathname.replace(/\/$/, "") || "/";
  if (p === "/" || p === "/en") return true;
  if (p.startsWith("/mpc") || p.startsWith("/en/mpc")) return true;
  if (p === "/contact" || p === "/en/contact") return true;
  if (p === "/team" || p.startsWith("/team/")) return true;
  if (p === "/en/team" || p.startsWith("/en/team/")) return true;
  if (p === "/locaties/mpc" || p === "/en/locaties/mpc") return true;
  if (p === "/privacy" || p === "/en/privacy") return true;
  return false;
}
