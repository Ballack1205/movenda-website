// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// PUBLIC_SITE_URL is set as a Render env var; falls back to the preview
// URL locally. Flip PUBLIC_NOINDEX to "false" only after go-live.
// src/lib/site.ts reads the same variables for canonical/JSON-LD/robots.
const site = process.env.PUBLIC_SITE_URL || "https://movenda-preview.onrender.com";

const SANITY_PROJECT = process.env.PUBLIC_SANITY_PROJECT_ID || "k73l2by8";
const SANITY_DATASET = process.env.PUBLIC_SANITY_DATASET || "production";

// Pages that must never be in the sitemap (they are also noindex):
// post-contact / QR landing pages.
const SITEMAP_EXCLUDE = new Set(["/welkom"]);

/**
 * path → last Sanity update (ISO) for CMS-backed routes, so the sitemap
 * carries a truthful <lastmod>. Static pages get none rather than a fake one.
 * Fetched once, lazily, via the public read API (same data the site builds from).
 * @type {Promise<Map<string, string>> | undefined}
 */
let lastmodMap;
async function getLastmodMap() {
  if (lastmodMap) return lastmodMap;
  lastmodMap = (async () => {
    /** @type {Map<string, string>} */
    const map = new Map();
    try {
      const query = `{
        "diensten": *[_type == "dienst"]{ "slug": slug.current, categorie, "u": _updatedAt },
        "team": *[_type == "teamlid" && actief == true]{ "slug": slug.current, "u": _updatedAt },
        "blog": *[_type == "blogPost"]{ "slug": slug.current, "u": _updatedAt },
        "locaties": *[_type == "locatie"]{ "slug": slug.current, "u": _updatedAt }
      }`;
      const res = await fetch(
        `https://${SANITY_PROJECT}.api.sanity.io/v2026-01-01/data/query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`,
      );
      if (!res.ok) return map;
      const { result } = await res.json();
      for (const d of result.diensten || []) {
        const base = d.categorie === "kine" ? "/kinesitherapie" : d.categorie === "training" ? "/training" : "/mpc";
        map.set(`${base}/${d.slug}`, d.u);
        if (base === "/mpc") map.set(`/en/mpc/${d.slug}`, d.u);
      }
      for (const t of result.team || []) map.set(`/team/${t.slug}`, t.u);
      for (const b of result.blog || []) map.set(`/blog/${b.slug}`, b.u);
      for (const l of result.locaties || []) map.set(`/locaties/${l.slug}`, l.u);
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
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      filter: (url) => !SITEMAP_EXCLUDE.has(new URL(url).pathname.replace(/\/$/, "") || "/"),
      // hreflang alternates in the sitemap. Only emitted for paths that exist
      // in both /… and /en/… (the integration checks the real URL list).
      i18n: { defaultLocale: "nl", locales: { nl: "nl-BE", en: "en" } },
      serialize: async (item) => {
        const path = new URL(item.url).pathname.replace(/\/$/, "") || "/";
        const lastmod = (await getLastmodMap()).get(path);
        if (lastmod) item.lastmod = lastmod;
        return item;
      },
    }),
  ],
});
