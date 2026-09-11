// Data-access layer for all site content — backed by the live Sanity
// dataset (project k73l2by8 / production). Pages and components must
// always import from this file, never query Sanity directly.

import { sanity } from "./sanity";
import seedSettings from "../content/site-settings.json";
import { resolveBlogMedia } from "./blog";

export type LocatieSlug = "olympia" | "mpc";
export type DienstCategorie = "kine" | "training" | "mpc-training" | "mpc-rehab" | "mpc-groep";
export type PrijsCategorie = "kine" | "training" | "mpc" | "screening";
export type FaqSite = "movenda" | "mpc" | "beide";

export interface Club {
  naam: string;
  url?: string;
}

export interface Teamlid {
  slug: string;
  voornaam: string;
  naam: string;
  rol: string;
  rolEn?: string;
  locaties: LocatieSlug[];
  specialisaties: string[];
  email: string;
  bio: string;
  bioEn?: string;
  volgorde: number;
  actief: boolean;
  foto?: string;
  tariefKine?: number;
  tariefPt?: number;
  tariefPtMpc?: number;
  tariefPerformance?: number;
  clubs: Club[];
  /** Keuzehulp ("Wie past bij mij?") tags this person matches on. */
  keuzehulpTags: KeuzehulpTag[];
  /** Sanity _updatedAt (ISO) — sitemap lastmod. */
  updatedAt?: string;
}

export type KeuzehulpCategorie = "klacht" | "regio" | "sport" | "doelgroep";
export const KEUZEHULP_CATEGORIEEN: KeuzehulpCategorie[] = ["klacht", "regio", "sport", "doelgroep"];

export interface KeuzehulpTag {
  id: string;
  label: string;
  categorie: KeuzehulpCategorie;
  volgorde?: number;
  actief: boolean;
}

export interface Keuzehulp {
  actief: boolean;
  titel: string;
  intro: string;
  vragen: Record<KeuzehulpCategorie, string>;
  geenMatchTekst: string;
  /** Active tags, grouped per question, in display order. */
  opties: Record<KeuzehulpCategorie, KeuzehulpTag[]>;
}

export interface Openingsuur {
  dag: string;
  van: string;
  tot: string;
}

export interface Locatie {
  slug: LocatieSlug;
  naam: string;
  brand: "movenda" | "mpc";
  type: string;
  adres: string;
  geo: { lat: number; lng: number };
  geoApprox?: boolean;
  telefoon: string;
  email: string;
  uren: Openingsuur[];
  urenNote?: string;
  btw: string;
  iban: string;
  bic?: string;
  mapsUrl: string;
  /** Google Business Profile link (sameAs in JSON-LD). Julie fills this in Sanity. */
  googleBusinessUrl?: string;
  routebeschrijving?: string;
  rpr?: string;
  instagram?: string;
  facebook?: string;
  verdiepingNote?: string;
  updatedAt?: string;
}

export interface Dienst {
  slug: string;
  categorie: DienstCategorie;
  titel: string;
  titelEn?: string;
  intro: string;
  slogan?: string;
  body: string;
  bodyEn?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  seoTitle: string;
  seoDescription: string;
  seoTitleEn?: string;
  seoDescriptionEn?: string;
  gekoppeldeTeamleden: string[];
  afbeelding?: string;
  galerij: string[];
  volgorde: number;
  /** Explicitly linked prijsitem (Sanity reference); see findPrijsVoorDienst for the fallback. */
  prijs?: Prijsitem;
  updatedAt?: string;
}

export interface GoogleReviews {
  rating: number;
  count: string;
  reviewUrl: string;
  writeReviewUrl: string;
  note?: string;
}

export interface NomenItem {
  categorie: string;
  omschrijving: string;
  bedrag: string;
}

export interface PrijzenInfo {
  basishonorarium?: number;
  intro?: string;
  terugbetalingStandaard?: string;
  terugbetalingVt?: string;
  voorwaarden?: string;
  exBtwMpc?: boolean;
  annulatiebeleid?: string;
  nomenclatuur?: NomenItem[];
}

/**
 * Analytics config, edited by Julie in siteSettings -> Analytics.
 * - `mode: "test"` keeps the full consent flow working but never loads
 *   gtag.js or Umami; events are logged to the browser console instead.
 * - GA4 only runs after explicit consent (Consent Mode v2, strict).
 * - Umami is cookieless and runs without consent when enabled.
 */
export interface AnalyticsSettings {
  enabled: boolean;
  mode: "test" | "live";
  ga4Id: string;
  umami: { enabled: boolean; websiteId: string; scriptUrl: string };
}

export const DEFAULT_ANALYTICS: AnalyticsSettings = {
  enabled: false,
  mode: "test",
  ga4Id: "",
  umami: { enabled: false, websiteId: "", scriptUrl: "https://cloud.umami.is/script.js" },
};

/**
 * One homepage "pijler" (Kinesitherapie / Personal training / MPC). Julie
 * edits the copy and the left-hand list in siteSettings -> Homepage; the
 * technique list next to it is derived from the diensten records.
 */
export interface HomePijler {
  titel: string;
  titelEn?: string;
  tekst: string;
  tekstEn?: string;
  lijstTitel: string;
  lijstTitelEn?: string;
  lijst: string[];
  lijstEn?: string[];
}

export type HomePijlerKey = "kine" | "training" | "mpc";
export type HomePijlers = Record<HomePijlerKey, HomePijler>;

/** Wide group photo of the whole team (Site-instellingen → Groepsfoto team). `url` is a
 * Sanity CDN URL when Julie uploaded one; undefined means "use the local fallback asset". */
export interface Teamfoto {
  url?: string;
  alt: string;
  bijschrift?: string;
  /** Sanity hotspot (0–1), used as the crop focal point on narrow screens. */
  hotspot?: { x: number; y: number };
}

export interface SiteSettings {
  siteNaam: string;
  tagline: string;
  telefoonOlympia: string;
  telefoonMpc: string;
  email: string;
  booking: { enabled: boolean; url: string; label: string };
  teamfoto: Teamfoto;
  googleReviews: Record<LocatieSlug, GoogleReviews>;
  analytics: AnalyticsSettings;
  socials: { instagram: string; facebook: string; linkedin: string };
  prijzenInfo: PrijzenInfo;
  slogans: {
    home?: string;
    kine?: string;
    mpc?: string;
    prijzenKine?: string;
    prijzenPt?: string;
  };
  nieuwsbrief: {
    enabled: boolean;
    titel?: string;
    tekst?: string;
    socialProof?: string;
  };
  instagramFeed: {
    enabled: boolean;
    titel?: string;
    widgetId: string;
  };
  partnerband: PartnerbandSettings;
  homePijlers: HomePijlers;
}

/** Existing Elfsight Instagram Feed on movenda.be ("Untitled Instagram Feed 2"). */
export const DEFAULT_INSTAGRAM_WIDGET_ID = "7108de0f-f7f4-4dfd-990f-443ab8e68566";

export interface Faq {
  vraag: string;
  vraagEn?: string;
  antwoord: string;
  antwoordEn?: string;
  categorie?: string;
  site?: FaqSite;
  volgorde: number;
}

export interface Prijsitem {
  naam: string;
  categorie: PrijsCategorie;
  bedrag: number;
  eenheid?: string;
  vanaf: boolean;
  opAanvraag: boolean;
  notitie?: string;
  volgorde: number;
}

export interface Partner {
  slug: string;
  naam: string;
  url?: string;
  logo?: string;
  type: "club" | "corporate" | "onderwijs";
  tonenOp: "movenda" | "mpc" | "beide";
  volgorde: number;
  actief: boolean;
}

export type PartnerbandSnelheid = "rustig" | "normaal" | "snel";

export interface PartnerbandSettings {
  titel: string;
  titelMpc: string;
  snelheid: PartnerbandSnelheid;
  animatie: boolean;
}

export interface LesroosterItem {
  les: string;
  dag: string;
  van: string;
  tot: string;
  coachNaam?: string;
  coachSlug?: string;
  dienstSlug?: string;
  dienstCategorie?: DienstCategorie;
  volgorde: number;
}

export interface Getuigenis {
  slug: string;
  tekst: string;
  naam: string;
  rol?: string;
  locatie?: LocatieSlug | "beide";
  foto?: string;
  volgorde: number;
  actief: boolean;
}

export interface BlogPost {
  slug: string;
  titel: string;
  titelEn?: string;
  excerpt?: string;
  cover?: string;
  /** Extra practice photos shown in the article when Sanity has no inline images yet. */
  photos?: string[];
  /** Screenshot-style covers should not be cropped. */
  coverFit?: "cover" | "contain";
  body: unknown[];
  bodyEn?: unknown[];
  auteurNaam?: string;
  auteurSlug?: string;
  publicatiedatum: string;
  updatedAt?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface Vacature {
  slug: string;
  titel: string;
  locatieNaam?: string;
  omschrijving: string;
  contactEmail: string;
  actief: boolean;
}

export interface SportaanbodItem {
  naam: string;
  tekst?: string;
  link?: string;
  volgorde: number;
}

export type PopupActie = "formulier" | "link";
export type PopupTonenOp = "overal" | "home" | "mpc";

export interface PopupVraag {
  label: string;
  type: "tekst" | "keuze";
  opties: string[];
  verplicht: boolean;
}

export interface Popup {
  id: string;
  actief: boolean;
  titel: string;
  titelEn?: string;
  afbeelding?: string;
  inhoud: unknown[];
  inhoudEn?: unknown[];
  knopTekst: string;
  knopTekstEn?: string;
  actie: PopupActie;
  knopUrl?: string;
  extraVragen: PopupVraag[];
  toonOp: PopupTonenOp;
  geldigVan?: string;
  geldigTot?: string;
  eenKeerPerBezoeker: boolean;
}

const MPC_CATEGORIES: DienstCategorie[] = ["mpc-training", "mpc-rehab", "mpc-groep"];

export function isMpcCategorie(categorie: DienstCategorie): boolean {
  return MPC_CATEGORIES.includes(categorie);
}

export function dienstHref(dienst: Pick<Dienst, "slug" | "categorie">, lang: "nl" | "en" = "nl"): string {
  const prefix = lang === "en" ? "/en" : "";
  if (dienst.categorie === "kine") return `${prefix}/kinesitherapie/${dienst.slug}`;
  if (dienst.categorie === "training") return `${prefix}/training/${dienst.slug}`;
  return `${prefix}/mpc/${dienst.slug}`;
}

export function formatPrijs(item: {
  bedrag: number;
  eenheid?: string;
  vanaf: boolean;
  opAanvraag: boolean;
}): string {
  if (item.opAanvraag) return "Op aanvraag";
  const prefix = item.vanaf ? "Vanaf " : "";
  const eenheid = item.eenheid ? ` / ${item.eenheid}` : "";
  return `${prefix}€${item.bedrag}${eenheid}`;
}

export function formatEuro(bedrag?: number): string | undefined {
  if (bedrag == null) return undefined;
  return `€${bedrag}`;
}

const teamlidProjection = `{
  "slug": slug.current,
  voornaam, naam, rol, rolEn, locaties, specialisaties, email, bio, bioEn,
  volgorde, actief,
  "foto": foto.asset->url,
  tariefKine, tariefPt, tariefPtMpc, tariefPerformance,
  clubs,
  "keuzehulpTags": keuzehulpTags[]->{ "id": _id, label, categorie, volgorde, actief },
  "updatedAt": _updatedAt
}`;

const locatieProjection = `{
  "slug": slug.current,
  naam, brand, type, adres,
  "geo": { "lat": geo.lat, "lng": geo.lng },
  telefoon, email, uren, urenNote, btw, iban, bic, mapsUrl, googleBusinessUrl,
  routebeschrijving, rpr, instagram, facebook, verdiepingNote,
  "updatedAt": _updatedAt
}`;

const prijsitemProjection = `{ naam, categorie, bedrag, eenheid, vanaf, opAanvraag, notitie, volgorde }`;

const dienstProjection = `{
  "slug": slug.current,
  categorie, titel, titelEn, intro, slogan, body, bodyEn,
  ctaLabel, ctaUrl, seoTitle, seoDescription, seoTitleEn, seoDescriptionEn, volgorde,
  "gekoppeldeTeamleden": gekoppeldeTeamleden[]->slug.current,
  "afbeelding": afbeelding.asset->url,
  "galerij": galerij[].asset->url,
  "prijs": prijs->${prijsitemProjection},
  "updatedAt": _updatedAt
}`;

export async function getTeamleden(): Promise<Teamlid[]> {
  const rows = await sanity.fetch(
    `*[_type == "teamlid" && actief == true] | order(volgorde asc) ${teamlidProjection}`,
  );
  return (rows || []).map(normalizeTeamlid);
}

export async function getTeamlidBySlug(slug: string): Promise<Teamlid | undefined> {
  const row = await sanity.fetch(
    `*[_type == "teamlid" && slug.current == $slug][0] ${teamlidProjection}`,
    { slug },
  );
  return row ? normalizeTeamlid(row) : undefined;
}

export async function getTeamledenByLocatie(locatie: LocatieSlug): Promise<Teamlid[]> {
  const team = await getTeamleden();
  return team.filter((t) => t.locaties.includes(locatie));
}

const KEUZEHULP_DEFAULT_VRAGEN: Record<KeuzehulpCategorie, string> = {
  klacht: "Waarmee kunnen we je helpen?",
  regio: "Waar zit de klacht?",
  sport: "Welke sport beoefen je?",
  doelgroep: "Wat past bij jou?",
};

/** Copy + answer options for "Wie past bij mij?" on /team. Options are the
 * active keuzehulpTag documents; which therapist matches which option comes
 * from Teamlid.keuzehulpTags. Scoring/layout live in the page. */
export async function getKeuzehulp(): Promise<Keuzehulp> {
  const [doc, tags] = await Promise.all([
    sanity.fetch(`*[_id == "keuzehulp"][0]{ actief, titel, intro, vragen, geenMatchTekst }`),
    sanity.fetch(
      `*[_type == "keuzehulpTag" && actief != false] | order(categorie asc, coalesce(volgorde, 9999) asc, label asc){ "id": _id, label, categorie, volgorde, actief }`,
    ) as Promise<KeuzehulpTag[]>,
  ]);
  const opties = { klacht: [], regio: [], sport: [], doelgroep: [] } as Record<KeuzehulpCategorie, KeuzehulpTag[]>;
  for (const tag of tags || []) {
    if (tag.categorie in opties) opties[tag.categorie].push({ ...tag, actief: true });
  }
  return {
    actief: doc?.actief !== false,
    titel: doc?.titel || "Wie past bij mij?",
    intro:
      doc?.intro ||
      "Kies wat op jou van toepassing is — één keuze per vraag is genoeg. Dit is een hulpmiddel, geen medisch advies.",
    vragen: { ...KEUZEHULP_DEFAULT_VRAGEN, ...(doc?.vragen || {}) },
    geenMatchTekst:
      doc?.geenMatchTekst ||
      "Geen exacte match, maar dit zijn de collega's die het dichtst bij je vraag zitten. Twijfel je? Bel ons.",
    opties,
  };
}

function normalizeTeamlid(row: Teamlid): Teamlid {
  return {
    ...row,
    clubs: row.clubs || [],
    keuzehulpTags: (row.keuzehulpTags || [])
      .filter((t): t is KeuzehulpTag => Boolean(t && t.id && t.label && t.categorie))
      .map((t) => ({ ...t, actief: t.actief !== false })),
    specialisaties: row.specialisaties || [],
    locaties: row.locaties || [],
  };
}

export async function getLocaties(): Promise<Locatie[]> {
  return sanity.fetch(`*[_type == "locatie"] | order(slug.current asc) ${locatieProjection}`);
}

export async function getLocatieBySlug(slug: LocatieSlug): Promise<Locatie | undefined> {
  return sanity.fetch(`*[_type == "locatie" && slug.current == $slug][0] ${locatieProjection}`, {
    slug,
  });
}

export async function getDiensten(): Promise<Dienst[]> {
  const rows = await sanity.fetch(`*[_type == "dienst"] | order(volgorde asc) ${dienstProjection}`);
  return (rows || []).map(normalizeDienst);
}

export async function getDienstenByCategorie(
  categorie: DienstCategorie | "mpc" | DienstCategorie[],
): Promise<Dienst[]> {
  const cats =
    categorie === "mpc" ? MPC_CATEGORIES : Array.isArray(categorie) ? categorie : [categorie];
  const rows = await sanity.fetch(
    `*[_type == "dienst" && categorie in $cats] | order(volgorde asc) ${dienstProjection}`,
    { cats },
  );
  return (rows || []).map(normalizeDienst);
}

export async function getDienstBySlug(
  slug: string,
  categorie?: DienstCategorie | "mpc",
): Promise<Dienst | undefined> {
  const cats =
    categorie === "mpc" ? MPC_CATEGORIES : categorie ? [categorie] : undefined;
  const row = cats
    ? await sanity.fetch(
        `*[_type == "dienst" && slug.current == $slug && categorie in $cats][0] ${dienstProjection}`,
        { slug, cats },
      )
    : await sanity.fetch(`*[_type == "dienst" && slug.current == $slug][0] ${dienstProjection}`, {
        slug,
      });
  return row ? normalizeDienst(row) : undefined;
}

// Old-site covers for diensten the media upload missed (no Sanity image yet).
const dienstCoverFallback: Record<string, string> = {
  "kleine-groepstraining": "/dienst-covers/kleine-groepstraining.jpg",
  skifit: "/dienst-covers/skifit.jpg",
  running: "/dienst-covers/running.jpg",
};

function normalizeDienst(row: Dienst): Dienst {
  const fallback = dienstCoverFallback[row.slug];
  return {
    ...row,
    afbeelding: row.afbeelding || fallback,
    galerij: row.galerij?.length ? row.galerij : fallback ? [fallback] : [],
    gekoppeldeTeamleden: row.gekoppeldeTeamleden || [],
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await sanity.fetch(
    `*[_id == "siteSettings"][0]{ siteNaam, tagline, email, socials, booking, googleReviews, analytics, prijzenInfo, slogans, nieuwsbrief, instagramFeed, partnerband, homePijlers,
      teamfoto{ "url": afbeelding.asset->url, alt, bijschrift, "hotspot": afbeelding.hotspot{ x, y } } }`,
  );
  const olympia = await getLocatieBySlug("olympia");
  const mpc = await getLocatieBySlug("mpc");
  return {
    siteNaam: settings?.siteNaam || "Movenda",
    tagline: settings?.tagline || "",
    telefoonOlympia: olympia?.telefoon || "",
    telefoonMpc: mpc?.telefoon || "",
    email: settings?.email || "info@movenda.be",
    booking: settings?.booking || { enabled: false, url: "", label: "Maak een afspraak" },
    // Own upload wins entirely (incl. an empty caption). Without an upload the
    // seed texts + the local fallback photo (assets/marketing/team.jpg) are used.
    teamfoto: settings?.teamfoto?.url
      ? {
          url: settings.teamfoto.url,
          alt: settings.teamfoto.alt || seedSettings.teamfoto.alt,
          bijschrift: settings.teamfoto.bijschrift || undefined,
          hotspot: settings.teamfoto.hotspot || undefined,
        }
      : {
          alt: settings?.teamfoto?.alt || seedSettings.teamfoto.alt,
          bijschrift: settings?.teamfoto?.bijschrift || seedSettings.teamfoto.bijschrift,
        },
    googleReviews: settings?.googleReviews || {
      olympia: { rating: 0, count: "", reviewUrl: "", writeReviewUrl: "" },
      mpc: { rating: 0, count: "", reviewUrl: "", writeReviewUrl: "" },
    },
    analytics: {
      ...DEFAULT_ANALYTICS,
      ...(settings?.analytics || {}),
      mode: settings?.analytics?.mode === "live" ? "live" : "test",
      umami: { ...DEFAULT_ANALYTICS.umami, ...(settings?.analytics?.umami || {}) },
    },
    socials: settings?.socials || { instagram: "", facebook: "", linkedin: "" },
    prijzenInfo: settings?.prijzenInfo || {},
    slogans: settings?.slogans || {},
    nieuwsbrief: settings?.nieuwsbrief || { enabled: false },
    instagramFeed: {
      enabled: settings?.instagramFeed?.enabled !== false,
      titel: settings?.instagramFeed?.titel || seedSettings.instagramFeed?.titel || "Volg ons",
      widgetId:
        settings?.instagramFeed?.widgetId ||
        seedSettings.instagramFeed?.widgetId ||
        DEFAULT_INSTAGRAM_WIDGET_ID,
    },
    partnerband: {
      titel: settings?.partnerband?.titel || "Onze partners",
      titelMpc: settings?.partnerband?.titelMpc || "Corporate partners",
      snelheid: settings?.partnerband?.snelheid || "normaal",
      animatie: settings?.partnerband?.animatie !== false,
    },
    homePijlers: {
      kine: mergePijler("kine", settings?.homePijlers?.kine),
      training: mergePijler("training", settings?.homePijlers?.training),
      mpc: mergePijler("mpc", settings?.homePijlers?.mpc),
    },
  };
}

// Until Julie fills in "Homepage — drie pijlers" in Sanity, the seed copy
// (the same texts as the old movenda.be homepage) is used field by field.
function mergePijler(key: HomePijlerKey, fromSanity?: Partial<HomePijler>): HomePijler {
  const seed = seedSettings.homePijlers[key] as HomePijler;
  return {
    titel: fromSanity?.titel || seed.titel,
    titelEn: fromSanity?.titelEn || seed.titelEn,
    tekst: fromSanity?.tekst || seed.tekst,
    tekstEn: fromSanity?.tekstEn || seed.tekstEn,
    lijstTitel: fromSanity?.lijstTitel || seed.lijstTitel,
    lijstTitelEn: fromSanity?.lijstTitelEn || seed.lijstTitelEn,
    lijst: fromSanity?.lijst?.length ? fromSanity.lijst : seed.lijst,
    lijstEn: fromSanity?.lijstEn?.length ? fromSanity.lijstEn : seed.lijstEn,
  };
}

/** Strip the SEO-only " Hasselt" suffix some dienst titles carry ("Manuele therapie Hasselt"). */
export function dienstKorteTitel(dienst: Pick<Dienst, "titel" | "titelEn">, lang: "nl" | "en" = "nl"): string {
  const titel = lang === "en" ? dienst.titelEn || dienst.titel : dienst.titel;
  return titel.replace(/ Hasselt$/, "");
}

/**
 * Diensten to show for one homepage pijler: MPC drops titles that already
 * appear under kine/training (dry needling, cupping, PT, ...) so the same
 * word never shows twice on the homepage, and MPC is ordered training →
 * rehab → groep so the flagship services come first.
 */
export function homePijlerDiensten(
  key: HomePijlerKey,
  all: { kine: Dienst[]; training: Dienst[]; mpc: Dienst[] },
): Dienst[] {
  if (key !== "mpc") return all[key];
  const seen = new Set(
    [...all.kine, ...all.training].map((d) => dienstKorteTitel(d).toLowerCase()),
  );
  const rank: Record<string, number> = { "mpc-training": 0, "mpc-rehab": 1, "mpc-groep": 2 };
  return all.mpc
    .filter((d) => !seen.has(dienstKorteTitel(d).toLowerCase()))
    .sort((a, b) => (rank[a.categorie] ?? 9) - (rank[b.categorie] ?? 9) || a.volgorde - b.volgorde);
}

export async function getFaqs(site?: Exclude<FaqSite, "beide">): Promise<Faq[]> {
  const rows: Faq[] = await sanity.fetch(
    `*[_type == "faq"] | order(volgorde asc) { vraag, vraagEn, antwoord, antwoordEn, categorie, site, volgorde }`,
  );
  if (!site) return rows || [];
  return (rows || []).filter((faq) => !faq.site || faq.site === site || faq.site === "beide");
}

export async function getPrijzen(): Promise<Prijsitem[]> {
  return sanity.fetch(`*[_type == "prijsitem"] | order(volgorde asc) ${prijsitemProjection}`);
}

const prijsCategorieVoorDienst: Record<DienstCategorie, PrijsCategorie[]> = {
  kine: ["kine"],
  training: ["training", "screening"],
  "mpc-training": ["mpc", "screening"],
  "mpc-rehab": ["mpc"],
  "mpc-groep": ["mpc"],
};

function normalizeNaam(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/ hasselt$/, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Price to attach to a dienst page (JSON-LD Offer, llms-full.txt). Prefers the
 * prijsitem Julie linked in Sanity; otherwise the first prijsitem in a matching
 * price category whose name starts with the dienst title ("Dry needling" →
 * "Dry Needling (30 min)"). Returns undefined for "op aanvraag" and no match,
 * so we never publish a wrong price.
 */
export function findPrijsVoorDienst(dienst: Dienst, prijzen: Prijsitem[]): Prijsitem | undefined {
  const linked = dienst.prijs;
  if (linked) return linked.opAanvraag ? undefined : linked;
  const naam = normalizeNaam(dienstKorteTitel(dienst));
  if (!naam) return undefined;
  const cats = prijsCategorieVoorDienst[dienst.categorie] || [];
  const match = prijzen.find((p) => {
    if (!cats.includes(p.categorie) || p.opAanvraag) return false;
    const pn = normalizeNaam(p.naam);
    return pn === naam || pn.startsWith(`${naam} `) || pn.startsWith(`${naam}/`);
  });
  return match;
}

/** Cut text at the last sentence boundary before `max` chars; falls back to a word cut with an ellipsis. */
export function truncateAtSentence(text: string | undefined, max = 155): string {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const head = clean.slice(0, max);
  const sentenceEnd = Math.max(head.lastIndexOf(". "), head.lastIndexOf("! "), head.lastIndexOf("? "));
  if (sentenceEnd > max * 0.4) return head.slice(0, sentenceEnd + 1);
  return `${head.slice(0, head.lastIndexOf(" "))}…`;
}

/**
 * English <title> for an MPC dienst page. Julie's seoTitleEn wins; otherwise
 * "<Title EN> in Hasselt | Movenda Performance Centre" ("in" keeps it distinct
 * from the Dutch "<Titel> Hasselt | …" for language-neutral names like Boxing),
 * dropping the city when that would push the title past 60 characters.
 */
export function dienstSeoTitleEn(dienst: Dienst): string {
  if (dienst.seoTitleEn) return dienst.seoTitleEn;
  const korte = dienstKorteTitel(dienst, "en");
  const brand = "Movenda Performance Centre";
  const withCity = `${korte} in Hasselt | ${brand}`;
  return withCity.length <= 60 ? withCity : `${korte} | ${brand}`;
}

export function dienstSeoDescriptionEn(dienst: Dienst): string {
  if (dienst.seoDescriptionEn) return dienst.seoDescriptionEn;
  if (dienst.bodyEn) return truncateAtSentence(dienst.bodyEn, 155);
  return `${dienstKorteTitel(dienst, "en")} at the Movenda Performance Centre in Kuringen (Hasselt): data-driven, one-on-one coaching for recreational and professional athletes.`;
}

/** "Kinesitherapeut & kinesitherapeut KRC Genk" → "Kinesitherapeut" (for <title>s that must stay short). */
export function rolKort(rol: string): string {
  return rol.split(/\s+(?:&|en|\/)\s+/)[0].trim();
}

export async function getPrijzenByCategorie(categorie: PrijsCategorie): Promise<Prijsitem[]> {
  const prijzen = await getPrijzen();
  return prijzen.filter((p) => p.categorie === categorie);
}

export async function getPartners(tonenOp?: "movenda" | "mpc"): Promise<Partner[]> {
  // Partners seeded before the "actief" toggle existed have no such field;
  // missing counts as active so nothing silently drops out of the band.
  const rows: Partner[] = await sanity.fetch(
    `*[_type == "partner" && actief != false] | order(volgorde asc) {
      "slug": _id,
      naam, url, type, tonenOp, volgorde,
      "actief": actief != false,
      "logo": logo.asset->url
    }`,
  );
  if (!tonenOp) return rows || [];
  return (rows || []).filter((p) => p.tonenOp === tonenOp || p.tonenOp === "beide");
}

export async function getLesrooster(): Promise<LesroosterItem[]> {
  return sanity.fetch(
    `*[_type == "lesrooster"] | order(volgorde asc) {
      les, dag, van, tot, volgorde,
      "coachNaam": coach->voornaam + " " + coach->naam,
      "coachSlug": coach->slug.current,
      "dienstSlug": dienst->slug.current,
      "dienstCategorie": dienst->categorie
    }`,
  );
}

export async function getGetuigenissen(locatie?: LocatieSlug): Promise<Getuigenis[]> {
  const rows: Getuigenis[] = await sanity.fetch(
    `*[_type == "getuigenis" && actief != false] | order(volgorde asc) {
      "slug": coalesce(slug.current, _id),
      tekst, naam, rol, locatie, volgorde,
      "foto": foto.asset->url,
      "actief": actief != false
    }`,
  );
  const items = rows || [];
  if (!locatie) return items;
  return items.filter((g) => !g.locatie || g.locatie === "beide" || g.locatie === locatie);
}

const blogImageBlock = `{
  ...,
  _type == "image" => {
    ...,
    "url": asset->url,
    "alt": coalesce(alt, asset->altText, "")
  }
}`;

const blogPostProjection = `{
  "slug": slug.current,
  titel, titelEn, excerpt,
  "cover": cover.asset->url,
  coverFit,
  body[] ${blogImageBlock},
  bodyEn[] ${blogImageBlock},
  "auteurNaam": auteur->voornaam + " " + auteur->naam,
  "auteurSlug": auteur->slug.current,
  publicatiedatum, tags, seoTitle, seoDescription,
  "updatedAt": _updatedAt
}`;

function normalizeBlogPost(row: BlogPost): BlogPost {
  return { ...row, ...resolveBlogMedia(row.slug, row) };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const rows: BlogPost[] = await sanity.fetch(
    `*[_type == "blogPost"] | order(publicatiedatum desc) ${blogPostProjection}`,
  );
  return (rows || []).map(normalizeBlogPost);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const row = await sanity.fetch(
    `*[_type == "blogPost" && slug.current == $slug][0] ${blogPostProjection}`,
    { slug },
  );
  return row ? normalizeBlogPost(row) : undefined;
}

export async function getRelatedBlogPosts(slug: string, limit = 3): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  const current = posts.find((post) => post.slug === slug);
  const others = posts.filter((post) => post.slug !== slug);
  if (!current?.tags?.length) return others.slice(0, limit);
  const tagged = others.filter((post) => post.tags?.some((tag) => current.tags!.includes(tag)));
  const rest = others.filter((post) => !tagged.includes(post));
  return [...tagged, ...rest].slice(0, limit);
}

export async function getVacatures(): Promise<Vacature[]> {
  return sanity.fetch(
    `*[_type == "vacature" && actief == true] { "slug": slug.current, titel, "locatieNaam": locatie->naam, omschrijving, contactEmail, actief }`,
  );
}

export async function getSportaanbod(): Promise<SportaanbodItem[]> {
  return sanity.fetch(`*[_type == "sportaanbodItem"] | order(volgorde asc) { naam, tekst, link, volgorde }`);
}

function popupMatchesPath(toonOp: PopupTonenOp, path: string): boolean {
  if (toonOp === "home") return path === "/" || path === "/en" || path === "/en/";
  if (toonOp === "mpc") return path.includes("/mpc");
  return true;
}

function popupIsInWindow(popup: Pick<Popup, "geldigVan" | "geldigTot">, now = Date.now()): boolean {
  if (popup.geldigVan && now < Date.parse(popup.geldigVan)) return false;
  if (popup.geldigTot && now > Date.parse(popup.geldigTot)) return false;
  return true;
}

export async function getActivePopup(path: string): Promise<Popup | undefined> {
  const rows: Popup[] = await sanity.fetch(
    `*[_type == "popup" && actief == true] | order(_updatedAt desc) {
      "id": _id,
      actief, titel, titelEn,
      "afbeelding": afbeelding.asset->url,
      inhoud, inhoudEn,
      knopTekst, knopTekstEn, actie, knopUrl,
      extraVragen[]{ label, type, opties, verplicht },
      toonOp, geldigVan, geldigTot, eenKeerPerBezoeker
    }`,
  );
  return (rows || [])
    .map((row) => ({
      ...row,
      knopTekst: row.knopTekst || "Schrijf je in!",
      actie: row.actie || "formulier",
      extraVragen: (row.extraVragen || []).map((vraag) => ({
        ...vraag,
        type: vraag.type || "tekst",
        opties: vraag.opties || [],
        verplicht: vraag.verplicht !== false,
      })),
      toonOp: row.toonOp || "overal",
      eenKeerPerBezoeker: row.eenKeerPerBezoeker !== false,
    }))
    .find((popup) => popupMatchesPath(popup.toonOp, path) && popupIsInWindow(popup));
}

export function matchSpecialisatieToDienst(tag: string, diensten: Dienst[]): Dienst | undefined {
  const needle = tag.toLowerCase();
  return diensten.find((d) => {
    const titel = d.titel.toLowerCase();
    const slug = d.slug.replace(/-/g, " ");
    return titel.includes(needle) || needle.includes(titel.replace(/ hasselt$/, "")) || slug.includes(needle);
  });
}
