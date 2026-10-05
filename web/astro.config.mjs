// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// PUBLIC_SITE_URL is set as a Render env var; falls back to the preview
// URL locally. Flip PUBLIC_NOINDEX to "false" only after go-live.
// src/lib/site.ts reads the same variables for canonical/JSON-LD/robots.
const site = process.env.PUBLIC_SITE_URL || "https://movenda-brief.onrender.com";
const hostMode = process.env.PUBLIC_HOST_MODE === "mpc";

const SANITY_PROJECT = process.env.PUBLIC_SANITY_PROJECT_ID || "k73l2by8";
const SANITY_DATASET = process.env.PUBLIC_SANITY_DATASET || "production";

// Pages that must never be in the sitemap (they are also noindex):
// post-contact / QR landing pages.
const SITEMAP_EXCLUDE = new Set([
  "/welkom",
  "/en/welkom",
  "/zoeken",
  "/en/zoeken",
]);

/**
 * path → last Sanity update (ISO) for CMS-backed routes, so the sitemap
 * carries a truthful <lastmod>. Static pages get none rather than a fake one.
 * Fetched once, lazily, via the public read API (same data the site builds from).
 * @type {Promise<Map<string, string>> | undefined}
 */
let lastmodMap;
/** Actiepagina's Julie keeps out of Google (zichtbaarInGoogle off). Filled by getLastmodMap. */
const noindexPaths = new Set();
async function getLastmodMap() {
  if (lastmodMap) return lastmodMap;
  lastmodMap = (async () => {
    /** @type {Map<string, string>} */
    const map = new Map();
    try {
      const query = `{
        "diensten": *[_type == "dienst"]{ "slug": slug.current, categorie, "u": _updatedAt },
        "team": *[_type == "teamlid" && actief == true]{ "slug": slug.current, "u": _updatedAt },
        "blog": *[_type == "blogPost"]{ "slug": slug.current, tags, "u": _updatedAt },
        "locaties": *[_type == "locatie"]{ "slug": slug.current, "u": _updatedAt },
        "acties": *[_type == "actiepagina" && !(_id in path("drafts.**"))]{ "slug": slug.current, zichtbaarInGoogle, "u": _updatedAt }
      }`;
      const res = await fetch(
        `https://${SANITY_PROJECT}.apicdn.sanity.io/v2026-01-01/data/query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`,
      );
      if (!res.ok) return map;
      const { result } = await res.json();
      const groep = new Set(["boxing", "hiit", "full-body", "powerplus", "skifit", "running", "core", "mxgp"]);
      const retired = new Set(["kleine-groepstraining"]);
      for (const d of result.diensten || []) {
        if (retired.has(d.slug)) continue;
        const onKine = d.categorie === "kine" || ["dry-needling", "cupping", "taping"].includes(d.slug);
        const base = onKine
          ? "/kinesitherapie"
          : d.categorie === "training"
            ? "/training"
            : groep.has(d.slug)
              ? "/groepslessen"
              : "/performance";
        map.set(`${base}/${d.slug}`, d.u);
        map.set(`/en${base}/${d.slug}`, d.u);
      }
      for (const t of result.team || []) {
        map.set(`/team/${t.slug}`, t.u);
        map.set(`/en/team/${t.slug}`, t.u);
      }
      /** @type {Map<string, number>} */
      const tagCount = new Map();
      for (const b of result.blog || []) {
        map.set(`/blog/${b.slug}`, b.u);
        map.set(`/en/blog/${b.slug}`, b.u);
        for (const tag of b.tags || []) tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
      }
      // Same threshold as TAG_INDEX_MIN_POSTS in src/lib/blog.ts.
      for (const [tag, n] of tagCount) {
        if (n >= 4) continue;
        noindexPaths.add(`/blog/tag/${tag}`);
        noindexPaths.add(`/en/blog/tag/${tag}`);
      }
      for (const l of result.locaties || []) {
        map.set(`/locaties/${l.slug}`, l.u);
        map.set(`/en/locaties/${l.slug}`, l.u);
      }
      for (const a of result.acties || []) {
        map.set(`/${a.slug}`, a.u);
        if (a.zichtbaarInGoogle === false) noindexPaths.add(`/${a.slug}`);
      }
      /** @param {{ u: string }[]} rows */
      const newest = (rows) => rows.map((r) => r.u).sort().at(-1) || "";
      if (result.blog?.length) map.set("/blog", newest(result.blog));
      if (result.team?.length) {
        map.set("/team", newest(result.team));
        map.set("/en/team", newest(result.team));
      }
    } catch {
      // Offline build: sitemap simply has no lastmod.
    }
    return map;
  })();
  return lastmodMap;
}

// https://astro.build/config
export default defineConfig({
  site,
  // Canonical URLs, hreflang, JSON-LD and the sitemap all use slash-less
  // URLs (/kinesitherapie/manuele-therapie). Output stays "directory"
  // (…/index.html) which Render serves for the slash-less path.
  trailingSlash: "never",
  // The single stylesheet (~19 KB) was render-blocking on slow mobile; inline it in every page.
  build: { inlineStylesheets: "always" },
  redirects: {
    "/groepslessen/kleine-groepstraining": {
      status: 301,
      destination: "/groepslessen",
    },
    "/en/groepslessen/kleine-groepstraining": {
      status: 301,
      destination: "/en/groepslessen",
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      filter: (url) => {
        const path = new URL(url).pathname.replace(/\/$/, "") || "/";
        if (SITEMAP_EXCLUDE.has(path)) return false;
        // Redirects to /over-ons/… (the MPC host keeps its own visie page).
        if (path === "/over" || path === "/en/over") return false;
        if (!hostMode && (path === "/performance/visie" || path === "/en/performance/visie")) return false;
        // Old /mpc URLs are redirects. The pages live at /performance and /groepslessen.
        if (path === "/mpc" || path.startsWith("/mpc/") || path === "/en/mpc" || path.startsWith("/en/mpc/")) return false;
        if (!hostMode) return true;
        if (path === "/" || path === "/en") return true;
        if (path.startsWith("/performance") || path.startsWith("/en/performance")) return true;
        if (path.startsWith("/groepslessen") || path.startsWith("/en/groepslessen")) return true;
        if (path === "/contact" || path === "/en/contact") return true;
        if (path === "/team" || path.startsWith("/team/")) return true;
        if (path === "/en/team" || path.startsWith("/en/team/")) return true;
        if (path === "/locaties/mpc" || path === "/en/locaties/mpc") return true;
        if (path === "/privacy" || path === "/en/privacy") return true;
        return false;
      },
      // hreflang alternates in the sitemap. Only emitted for paths that exist
      // in both /… and /en/… (the integration checks the real URL list).
      i18n: { defaultLocale: "nl", locales: { nl: "nl-BE", en: "en" } },
      serialize: async (item) => {
        const path = new URL(item.url).pathname.replace(/\/$/, "") || "/";
        const lastmod = (await getLastmodMap()).get(path);
        if (noindexPaths.has(path)) return undefined;
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
  ],
});
