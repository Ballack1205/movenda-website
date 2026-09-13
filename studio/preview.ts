// "Open preview" in the document menu — Julie can jump to the live page
// she is editing. Preview host is the pitch site until go-live.

const PREVIEW_URL = (process.env.SANITY_STUDIO_PREVIEW_URL || "https://movenda-preview.onrender.com").replace(
  /\/+$/,
  "",
);

type PreviewDoc = {
  _type?: string;
  slug?: { current?: string } | string;
  categorie?: string;
  locatie?: string;
  key?: string;
};

const PAGINA_PATHS: Record<string, string> = {
  home: "/",
  over: "/over",
  kinesitherapie: "/kinesitherapie",
  training: "/training",
  mpc: "/mpc",
  "mpc-visie": "/mpc/visie",
  contact: "/contact",
  jobs: "/jobs",
};

function slugOf(doc: PreviewDoc): string | undefined {
  if (!doc.slug) return undefined;
  return typeof doc.slug === "string" ? doc.slug : doc.slug.current;
}

function dienstPath(categorie?: string, slug?: string): string {
  if (!slug) {
    if (categorie === "kine") return "/kinesitherapie";
    if (categorie === "training") return "/training";
    return "/mpc";
  }
  if (categorie === "kine") return `/kinesitherapie/${slug}`;
  if (categorie === "training") return `/training/${slug}`;
  return `/mpc/${slug}`;
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
    case "faq":
      return `${PREVIEW_URL}/faq`;
    case "prijsitem":
      return document.categorie === "kine" || document.categorie === "training"
        ? `${PREVIEW_URL}/prijzen`
        : `${PREVIEW_URL}/mpc/prijzen`;
    case "vacature":
      return `${PREVIEW_URL}/jobs`;
    case "getuigenis":
      return document.locatie === "mpc" ? `${PREVIEW_URL}/mpc` : `${PREVIEW_URL}/`;
    case "sportaanbodItem":
      return `${PREVIEW_URL}/training`;
    case "lesrooster":
      return `${PREVIEW_URL}/mpc/groepslessen`;
    case "keuzehulp":
    case "keuzehulpTag":
    case "specialisatie":
      return `${PREVIEW_URL}/team`;
    case "popup":
    case "siteSettings":
    case "partner":
      return PREVIEW_URL;
    default:
      return undefined;
  }
}
