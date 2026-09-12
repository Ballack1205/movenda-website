// JSON-LD node builders. Every page ships ONE <script type="application/ld+json">
// with an @graph (assembled in Layout.astro): Organization + both locations
// are always present, pages add their own nodes (Person, Service, ...) and
// point at the shared ones via @id. Kept separate from components so Astro
// pages and API routes (llms-full.txt) can reuse them.
//
// See DECISIONS.md for why there is no AggregateRating here — reviews are
// shown as a badge linking to Google, not as self-reported schema.
import {
  dienstSeoDescriptionEn,
  type BlogPost,
  type Dienst,
  type Faq,
  type Locatie,
  type Prijsitem,
  type SiteSettings,
  type Teamlid,
} from "./content";
import { SITE_URL, absoluteUrl } from "./site";
import { withLang, type Lang } from "./i18n";

export type JsonLdNode = Record<string, unknown>;

// ---------------------------------------------------------------------------
// @id helpers — stable, resolvable identifiers so nodes can reference each other.
// ---------------------------------------------------------------------------
export const ids = {
  organization: () => `${SITE_URL}/#organization`,
  website: () => `${SITE_URL}/#website`,
  locatie: (slug: string) => `${SITE_URL}/locaties/${slug}#locatie`,
  person: (slug: string) => `${SITE_URL}/team/${slug}#person`,
  service: (path: string) => `${SITE_URL}${path}#service`,
  blogPosting: (slug: string) => `${SITE_URL}/blog/${slug}#article`,
};

const DAY_OF_WEEK: Record<string, string> = {
  maandag: "Monday",
  dinsdag: "Tuesday",
  woensdag: "Wednesday",
  donderdag: "Thursday",
  vrijdag: "Friday",
  zaterdag: "Saturday",
  zondag: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

/** "Maandag" (Julie's Dutch label in Sanity) → schema.org "Monday". */
export function schemaDayOfWeek(dag: string): string | undefined {
  return DAY_OF_WEEK[dag.trim().toLowerCase()];
}

/** "Kuringersteenweg 242, 3500 Hasselt" → structured PostalAddress parts. */
export function parseAdres(adres: string): { streetAddress: string; postalCode?: string; addressLocality?: string } {
  const match = adres.match(/^(.*?),\s*(\d{4})\s+(.+)$/);
  if (!match) return { streetAddress: adres };
  return { streetAddress: match[1].trim(), postalCode: match[2], addressLocality: match[3].trim() };
}

function compact<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)),
  ) as T;
}

function unique(values: (string | undefined)[]): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))];
}

function imageObject(url: string | undefined, extra: Record<string, unknown> = {}) {
  const abs = absoluteUrl(url);
  return abs ? compact({ "@type": "ImageObject", url: abs, ...extra }) : undefined;
}

// ---------------------------------------------------------------------------
// Shared nodes (on every page)
// ---------------------------------------------------------------------------

export function organizationNode(settings: SiteSettings, locaties: Locatie[]): JsonLdNode {
  const olympia = locaties.find((l) => l.slug === "olympia");
  return compact({
    "@type": ["Organization", "MedicalOrganization"],
    "@id": ids.organization(),
    name: settings.siteNaam || "Movenda",
    alternateName: "Groepspraktijk Movenda",
    description: settings.tagline || undefined,
    url: `${SITE_URL}/`,
    logo: imageObject("/brand/logo-square.png", { width: 512, height: 512 }),
    image: absoluteUrl("/og-default.jpg"),
    email: settings.email,
    telephone: olympia?.telefoon,
    sameAs: unique([
      settings.socials.instagram,
      settings.socials.facebook,
      settings.socials.linkedin,
      ...locaties.flatMap((l) => [l.instagram, l.facebook, l.googleBusinessUrl]),
    ]),
    // Both legal entities/vestigingen hang under the one brand.
    location: locaties.map((l) => ({ "@id": ids.locatie(l.slug) })),
    areaServed: { "@type": "City", name: "Hasselt" },
  });
}

export function websiteNode(settings: SiteSettings): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": ids.website(),
    name: settings.siteNaam || "Movenda",
    url: `${SITE_URL}/`,
    inLanguage: ["nl-BE", "en"],
    publisher: { "@id": ids.organization() },
  };
}

export function localBusinessNode(locatie: Locatie): JsonLdNode {
  const isMpc = locatie.brand === "mpc";
  const adres = parseAdres(locatie.adres);
  return compact({
    "@type": isMpc ? ["SportsActivityLocation", "HealthAndBeautyBusiness"] : "MedicalBusiness",
    "@id": ids.locatie(locatie.slug),
    name: locatie.naam,
    description: locatie.type,
    url: `${SITE_URL}/locaties/${locatie.slug}`,
    image: absoluteUrl(
      locatie.foto
        ? locatie.foto.startsWith("http")
          ? `${locatie.foto}?w=1200&h=630&fit=crop&auto=format`
          : locatie.foto
        : "/og-default.jpg",
    ),
    address: compact({
      "@type": "PostalAddress",
      streetAddress: adres.streetAddress,
      postalCode: adres.postalCode,
      addressLocality: adres.addressLocality,
      addressRegion: "Limburg",
      addressCountry: "BE",
    }),
    geo: {
      "@type": "GeoCoordinates",
      latitude: locatie.geo.lat,
      longitude: locatie.geo.lng,
    },
    hasMap: locatie.googleBusinessUrl || locatie.mapsUrl,
    telephone: locatie.telefoon,
    email: locatie.email,
    vatID: locatie.btw,
    priceRange: "€€",
    currenciesAccepted: "EUR",
    medicalSpecialty: isMpc ? undefined : "https://schema.org/Physiotherapy",
    sameAs: unique([locatie.googleBusinessUrl, locatie.instagram, locatie.facebook]),
    parentOrganization: { "@id": ids.organization() },
    openingHoursSpecification: locatie.uren
      .map((u) => {
        const dayOfWeek = schemaDayOfWeek(u.dag);
        if (!dayOfWeek) return undefined;
        return { "@type": "OpeningHoursSpecification", dayOfWeek, opens: u.van, closes: u.tot };
      })
      .filter(Boolean),
  });
}

/** Organization + WebSite + both locations: the base graph Layout adds to every page. */
export function baseGraph(settings: SiteSettings, locaties: Locatie[]): JsonLdNode[] {
  return [organizationNode(settings, locaties), websiteNode(settings), ...locaties.map(localBusinessNode)];
}

// ---------------------------------------------------------------------------
// Page-specific nodes
// ---------------------------------------------------------------------------

export function personNode(teamlid: Teamlid, lang: "nl" | "en" = "nl"): JsonLdNode {
  return compact({
    "@type": "Person",
    "@id": ids.person(teamlid.slug),
    name: `${teamlid.voornaam} ${teamlid.naam}`,
    givenName: teamlid.voornaam,
    familyName: teamlid.naam,
    jobTitle: lang === "en" ? teamlid.rolEn || teamlid.rol : teamlid.rol,
    description: lang === "en" ? teamlid.bioEn || teamlid.bio : teamlid.bio,
    email: teamlid.email,
    url: `${SITE_URL}${withLang(`/team/${teamlid.slug}`, lang)}`,
    image: imageObject(teamlid.foto ? `${teamlid.foto}?w=900&h=1350&fit=max&auto=format` : undefined),
    knowsAbout: teamlid.specialisaties,
    worksFor: { "@id": ids.organization() },
    workLocation: teamlid.locaties.map((slug) => ({ "@id": ids.locatie(slug) })),
    memberOf: teamlid.clubs.map((c) => compact({ "@type": "SportsOrganization", name: c.naam, url: c.url })),
  });
}

/** /team overview: an ItemList pointing at each Person page. */
export function teamListNode(team: Teamlid[], path: string, lang: "nl" | "en" = "nl"): JsonLdNode {
  return {
    "@type": "ItemList",
    "@id": `${SITE_URL}${path}#team`,
    name: lang === "en" ? "Movenda team" : "Team Movenda",
    numberOfItems: team.length,
    itemListElement: team.map((lid, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}${withLang(`/team/${lid.slug}`, lang)}`,
      item: compact({
        "@type": "Person",
        "@id": ids.person(lid.slug),
        name: `${lid.voornaam} ${lid.naam}`,
        jobTitle: lang === "en" ? lid.rolEn || lid.rol : lid.rol,
        url: `${SITE_URL}${withLang(`/team/${lid.slug}`, lang)}`,
        image: absoluteUrl(lid.foto ? `${lid.foto}?w=600&h=900&fit=max&auto=format` : undefined),
      }),
    })),
  };
}

export interface ServiceNodeOptions {
  path: string;
  lang?: "nl" | "en";
  prijs?: Prijsitem;
  team?: Teamlid[];
}

export function serviceNode(dienst: Dienst, locatie: Locatie, opts: ServiceNodeOptions): JsonLdNode {
  const lang = opts.lang || "nl";
  const naam = lang === "en" ? dienst.titelEn || dienst.titel : dienst.titel;
  const url = `${SITE_URL}${opts.path}`;
  const prijs = opts.prijs;
  return compact({
    "@type": "Service",
    "@id": ids.service(opts.path),
    name: naam,
    serviceType: naam.replace(/ Hasselt$/, ""),
    description: lang === "en" ? dienstSeoDescriptionEn(dienst) : dienst.seoDescription,
    url,
    inLanguage: lang === "en" ? "en" : "nl-BE",
    image: absoluteUrl(dienst.afbeelding ? dienst.afbeelding.startsWith("http") ? `${dienst.afbeelding}?w=1200&h=630&fit=crop&auto=format` : dienst.afbeelding : undefined),
    provider: { "@id": ids.locatie(locatie.slug) },
    areaServed: [
      { "@type": "City", name: "Hasselt" },
      { "@type": "AdministrativeArea", name: "Limburg" },
    ],
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: `${SITE_URL}${lang === "en" ? "/en" : ""}/contact`,
      servicePhone: locatie.telefoon,
    },
    offers: prijs
      ? compact({
          "@type": "Offer",
          price: prijs.bedrag,
          priceCurrency: "EUR",
          url,
          description: [prijs.naam, prijs.eenheid ? `per ${prijs.eenheid}` : undefined, prijs.vanaf ? "(vanaf)" : undefined, prijs.notitie]
            .filter(Boolean)
            .join(" "),
          availability: "https://schema.org/InStock",
          offeredBy: { "@id": ids.locatie(locatie.slug) },
        })
      : undefined,
    // Who actually delivers it — E-E-A-T signal for a medical service. Minimal
    // inline Person so the graph stays self-contained; the full node lives on /team/{slug}.
    performer: opts.team?.map((lid) =>
      compact({
        "@type": "Person",
        "@id": ids.person(lid.slug),
        name: `${lid.voornaam} ${lid.naam}`,
        jobTitle: lang === "en" ? lid.rolEn || lid.rol : lid.rol,
        url: `${SITE_URL}${withLang(`/team/${lid.slug}`, lang)}`,
      }),
    ),
  });
}

export function faqPageNode(faqs: Faq[], path: string): JsonLdNode {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}${path}#faq`,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.vraag,
      acceptedAnswer: { "@type": "Answer", text: faq.antwoord },
    })),
  };
}

/** Sanity image → fixed 1200×630 crop; local paths pass through. */
function blogImage(src?: string) {
  if (!src) return undefined;
  return absoluteUrl(src.startsWith("http") ? `${src}?w=1200&h=630&fit=crop&auto=format` : src);
}

export function blogPostingNode(post: BlogPost, lang: Lang = "nl"): JsonLdNode {
  const url = `${SITE_URL}${withLang(`/blog/${post.slug}`, lang)}`;
  const headline = lang === "en" ? post.titelEn || post.titel : post.titel;
  const description = lang === "en" ? post.excerptEn || post.excerpt : post.excerpt;
  return compact({
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline,
    description,
    inLanguage: lang === "en" ? "en" : "nl-BE",
    datePublished: post.publicatiedatum,
    dateModified: post.updatedAt || post.publicatiedatum,
    image: blogImage(post.cover),
    keywords: post.tags?.join(", "),
    author: post.auteurNaam
      ? compact({
          "@type": "Person",
          "@id": post.auteurSlug ? ids.person(post.auteurSlug) : undefined,
          name: post.auteurNaam,
          url: post.auteurSlug ? `${SITE_URL}${withLang(`/team/${post.auteurSlug}`, lang)}` : undefined,
        })
      : { "@id": ids.organization() },
    publisher: { "@id": ids.organization() },
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: { "@type": "Blog", "@id": `${SITE_URL}${withLang("/blog", lang)}#blog` },
    encoding: {
      "@type": "MediaObject",
      encodingFormat: "text/markdown",
      contentUrl: `${SITE_URL}/blog/${post.slug}.md`,
    },
  });
}

export function blogListNode(posts: BlogPost[], lang: Lang = "nl"): JsonLdNode {
  const url = `${SITE_URL}${withLang("/blog", lang)}`;
  return {
    "@type": "Blog",
    "@id": `${url}#blog`,
    name: "Movenda blog",
    description:
      lang === "en"
        ? "Practical tips on physiotherapy, training and recovery."
        : "Praktische tips over kinesitherapie, training en herstel.",
    url,
    inLanguage: lang === "en" ? "en" : "nl-BE",
    publisher: { "@id": ids.organization() },
    blogPost: posts.map((post) =>
      compact({
        "@type": "BlogPosting",
        "@id": `${SITE_URL}${withLang(`/blog/${post.slug}`, lang)}#article`,
        headline: lang === "en" ? post.titelEn || post.titel : post.titel,
        description: lang === "en" ? post.excerptEn || post.excerpt : post.excerpt,
        datePublished: post.publicatiedatum,
        dateModified: post.updatedAt || post.publicatiedatum,
        url: `${SITE_URL}${withLang(`/blog/${post.slug}`, lang)}`,
        image: blogImage(post.cover),
      }),
    ),
  };
}

export function breadcrumbNode(items: { name: string; path: string }[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

// ---------------------------------------------------------------------------
// Back-compat aliases — pages still call these names. They now return @graph
// nodes (no @context); Layout wraps everything into one @graph.
// ---------------------------------------------------------------------------
export const personSchema = personNode;
export const faqPageSchema = (faqs: Faq[], path = "/faq") => faqPageNode(faqs, path);
export const blogPostingSchema = blogPostingNode;
export const blogListSchema = blogListNode;
export const breadcrumbSchema = breadcrumbNode;
export const localBusinessSchema = localBusinessNode;
export function serviceSchema(dienst: Dienst, locatie: Locatie, path?: string): JsonLdNode {
  return serviceNode(dienst, locatie, { path: path || `/mpc/${dienst.slug}` });
}

/** Wrap nodes into a single JSON-LD document, deduplicated by @id (later wins). */
export function toGraph(nodes: JsonLdNode[]): Record<string, unknown> {
  const seen = new Map<string, JsonLdNode>();
  const anonymous: JsonLdNode[] = [];
  for (const raw of nodes) {
    if (!raw) continue;
    const { "@context": _ctx, ...node } = raw as JsonLdNode & { "@context"?: unknown };
    const id = node["@id"];
    if (typeof id === "string") seen.set(id, node);
    else anonymous.push(node);
  }
  return { "@context": "https://schema.org", "@graph": [...seen.values(), ...anonymous] };
}
