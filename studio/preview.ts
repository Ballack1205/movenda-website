// "Bekijk op de site" above every document form and in the document menu —
// Julie can jump to the live page she is editing. Preview host is the brief
// site until go-live.
import { PAGINAS } from "./schemaTypes/pagina";

export const PREVIEW_URL = (process.env.SANITY_STUDIO_PREVIEW_URL || "https://movenda-brief.onrender.com").replace(
  /\/+$/,
  "",
);

// Where the live preview (Sanity Presentation) runs: a separate Render service
// that renders from drafts. See `npm run preview:live` in web/.
export const LIVE_PREVIEW_URL = (
  process.env.SANITY_STUDIO_LIVE_PREVIEW_URL || "https://movenda-live-preview.onrender.com"
).replace(/\/+$/, "");

type PreviewDoc = {
  _type?: string;
  slug?: { current?: string } | string;
  categorie?: string;
  locatie?: string;
  key?: string;
};

const PAGINA_PATHS: Record<string, string> = {
  ...Object.fromEntries(PAGINAS.map((p) => [p.key, p.path])),
  mpc: "/performance",
  "mpc-visie": "/over-ons/onze-visie",
};

function slugOf(doc: PreviewDoc): string | undefined {
  if (!doc.slug) return undefined;
  return typeof doc.slug === "string" ? doc.slug : doc.slug.current;
}

function dienstPath(categorie?: string, slug?: string): string {
  if (!slug) {
    if (categorie === "kine") return "/movenda-kinesitherapie";
    if (categorie === "training") return "/training";
    if (categorie === "mpc-groep") return "/groepslessen";
    return "/performance";
  }
  if (categorie === "kine") return `/kinesitherapie/${slug}`;
  if (categorie === "training") return `/training/${slug}`;
  // The site redirects /mpc/<slug> to its real home (/performance, /groepslessen or /b2b).
  return `/mpc/${slug}`;
}

/** The page a document lives on, as a path (`/team/jens-hendrickx`), or undefined. */
export function resolvePreviewPath(document: PreviewDoc): string | undefined {
  const url = resolvePreviewUrl(document);
  return url ? url.slice(PREVIEW_URL.length) || "/" : undefined;
}

export function resolvePreviewUrl(document: PreviewDoc): string | undefined {
  const slug = slugOf(document);
  const type = document._type;
  if (!type) return undefined;

  switch (type) {
    case "pagina":
      return `${PREVIEW_URL}${PAGINA_PATHS[document.key || ""] ?? "/"}`;
    case "teamlid":
      return slug ? `${PREVIEW_URL}/team/${slug}` : `${PREVIEW_URL}/team`;
    case "blogPost":
      return slug ? `${PREVIEW_URL}/blog/${slug}` : `${PREVIEW_URL}/blog`;
    case "locatie":
      return slug ? `${PREVIEW_URL}/locaties/${slug}` : `${PREVIEW_URL}/contact`;
    case "dienst":
      return `${PREVIEW_URL}${dienstPath(document.categorie, slug)}`;
    case "actiepagina":
      return slug ? `${PREVIEW_URL}/${slug}` : PREVIEW_URL;
    case "faq":
      return `${PREVIEW_URL}/faq`;
    case "event":
      return slug ? `${PREVIEW_URL}/events/${slug}` : `${PREVIEW_URL}/events`;
    case "prijsitem":
      return `${PREVIEW_URL}/prijzen`;
    case "vacature":
      return `${PREVIEW_URL}/jobs`;
    case "getuigenis":
      return document.locatie === "mpc" ? `${PREVIEW_URL}/performance` : `${PREVIEW_URL}/`;
    case "sportaanbodItem":
      return `${PREVIEW_URL}/training`;
    case "lesrooster":
      return `${PREVIEW_URL}/groepslessen`;
    case "keuzehulp":
    case "keuzehulpTag":
    case "verwijskompas":
    case "specialisatie":
      return `${PREVIEW_URL}/team#keuzehulp`;
    case "popup":
    case "siteSettings":
    case "partner":
    case "homePijler":
    case "homeDeur":
    case "googleReviewInfo":
      return `${PREVIEW_URL}/`;
    default:
      return undefined;
  }
}
