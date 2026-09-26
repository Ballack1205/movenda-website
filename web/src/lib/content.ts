// Data-access layer for all site content — backed by the live Sanity
// dataset (project k73l2by8 / production). Pages and components must
// always import from this file, never query Sanity directly.

import { sanity } from "./sanity";

// One in-flight result per process (one `astro build` or one `astro dev`).
// Without this, Layout + Footer + Analytics + badges each re-fetched
// siteSettings (3 calls) on every page and burned the Free API quota.
const onceCache = new Map<string, Promise<unknown>>();

function once<T>(key: string, load: () => Promise<T>): Promise<T> {
  let hit = onceCache.get(key);
  if (!hit) {
    hit = load();
    onceCache.set(key, hit);
  }
  return hit as Promise<T>;
}
import seedSettings from "../content/site-settings.json";
import seedFaqs from "../content/faqs.json";
import seedTeam from "../content/team.json";
import seedGetuigenissen from "../content/getuigenissen.json";
import seedBlog from "../content/blog.json";
import seedSportaanbod from "../content/sportaanbod.json";
import seedDiensten from "../content/diensten.json";
import seedPaginas from "../content/paginas.json";
import { resolveBlogMedia } from "./blog";
import type { Lang } from "./i18n";

export type LocatieSlug = "olympia" | "mpc";
export type DienstCategorie = "kine" | "training" | "mpc-training" | "mpc-rehab" | "mpc-groep";
/** Mirrors PRIJS_CATEGORIEEN in the Studio; the category alone decides which page/table a price lands in. */
export type PrijsCategorie = "kine" | "training" | "mpc-training" | "mpc-rehab" | "mpc-groep" | "screening";
export const MPC_PRIJS_CATEGORIEEN: PrijsCategorie[] = ["mpc-training", "mpc-rehab", "mpc-groep", "screening"];
export type FaqSite = "movenda" | "mpc" | "beide";

export interface Club {
  naam: string;
  url?: string;
}

export type Discipline = "kine" | "pt";

export interface Teamlid {
  slug: string;
  voornaam: string;
  naam: string;
  rol: string;
  rolEn?: string;
  /** "Telt mee als" in Studio: drives the homepage counts and the /team role filter. */
  disciplines: Discipline[];
  locaties: LocatieSlug[];
  /** References to specialisatie documents (Julie's vocabulary), in the order she picked them. */
  specialisaties: Specialisatie[];
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

export interface Specialisatie {
  id: string;
  naam: string;
  naamEn?: string;
  /** Dienst Julie linked in the Studio; the tag becomes a link to that page. */
  dienst?: Pick<Dienst, "slug" | "categorie">;
}

export function specialisatieNaam(s: Specialisatie, lang: Lang = "nl"): string {
  return lang === "en" ? s.naamEn || s.naam : s.naam;
}

export type KeuzehulpCategorie = "klacht" | "regio" | "sport" | "doelgroep";
export const KEUZEHULP_CATEGORIEEN: KeuzehulpCategorie[] = ["klacht", "regio", "sport", "doelgroep"];

export interface KeuzehulpTag {
  id: string;
  label: string;
  labelEn?: string;
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
  /** "Olympia" / "Performance Centre" — for team cards; falls back to naam without the brand prefix. */
  korteNaam: string;
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
  /** Exterior / entrance photo. Sanity URL or a /public path. */
  foto?: string;
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
  /** Julie's switch: false hides the dienst from the header dropdowns only (page stays live). */
  toonInMenu?: boolean;
  /** Short label for the header dropdown; falls back to the (shortened) title. */
  menuLabel?: string;
  menuLabelEn?: string;
  /** Explicitly linked prijsitem (Sanity reference); see findPrijsVoorDienst for the fallback. */
  /** Raw prijsitem Julie linked; exclBtw is resolved via getPrijzen() in findPrijsVoorDienst. */
  prijs?: Omit<Prijsitem, "exclBtw">;
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
  /** Photo next to the block; undefined = the bundled marketing photo. */
  foto?: CmsFoto;
}

/**
 * A photo Julie uploaded in the Studio to replace a bundled marketing photo.
 * `url` is the Sanity CDN URL; `hotspot` (0–1) is used as crop focal point.
 * Rendered by components/CmsFoto.astro, which falls back to the local asset.
 */
export interface CmsFoto {
  url: string;
  hotspot?: { x: number; y: number };
  alt?: string;
}

/** GROQ projection for a `{ afbeelding, alt }`-style object field → CmsFoto (null when no upload). */
export const CMS_FOTO_PROJECTION = `{ "url": afbeelding.asset->url, "hotspot": afbeelding.hotspot{ x, y }, alt }`;

function toCmsFoto(row: { url?: string | null; hotspot?: { x: number; y: number } | null; alt?: string | null } | null | undefined): CmsFoto | undefined {
  if (!row?.url) return undefined;
  return { url: row.url, hotspot: row.hotspot || undefined, alt: row.alt?.trim() || undefined };
}

export type HomePijlerKey = "kine" | "training" | "mpc";
export type HomePijlers = Record<HomePijlerKey, HomePijler>;

/** One lab homepage photo-door. Julie adds/reorders these in Site-instellingen. */
export interface HomeDeur {
  korteNaam: string;
  korteNaamEn?: string;
  regel?: string;
  regelEn?: string;
  tekst?: string;
  tekstEn?: string;
  href: string;
  foto?: CmsFoto;
}

export function localizeInternalHref(href: string, lang: Lang): string {
  if (lang !== "en") return href;
  if (!href.startsWith("/") || href.startsWith("/en")) return href;
  return `/en${href}`;
}

export function homeDeurNaam(deur: HomeDeur, lang: Lang): string {
  return (lang === "en" && deur.korteNaamEn) || deur.korteNaam;
}

export function homeDeurRegel(deur: HomeDeur, lang: Lang): string | undefined {
  const line = (lang === "en" && deur.regelEn) || deur.regel;
  return line?.trim() || undefined;
}

export function homeDeurTekst(deur: HomeDeur, lang: Lang): string | undefined {
  const body = (lang === "en" && deur.tekstEn) || deur.tekst;
  return body?.trim() || undefined;
}

/** Copy and proof numbers for the brief homepage. Numbers stay editable. */
export interface HomeBrief {
  merkKicker: string;
  merkTitel: string;
  merkTekst: string;
  merkStatement: string;
  merkCta: string;
  partnersKicker: string;
  partnersCta: string;
  aanbodKicker: string;
  aanbodTekst: string;
  locatiesTitel: string;
  hasseltProfiel: string;
  kuringenProfiel: string;
  teamKicker: string;
  teamTitel: string;
  teamTekst: string;
  teamCta: string;
  reviewsTitel: string;
  reviewsCta: string;
  insightsKicker: string;
  insightsTitel: string;
  insightsTekst: string;
  insightsCta: string;
  instagramTitel: string;
  instagramCta: string;
  slotTitel: string;
  slotTekst: string;
  slotAfspraak: string;
  slotContact: string;
  bewijs: { jaren: string };
}

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
    titelEn?: string;
    tekst?: string;
    tekstEn?: string;
    socialProof?: string;
    socialProofEn?: string;
  };
  instagramFeed: {
    enabled: boolean;
    titel?: string;
    widgetId: string;
  };
  googleReviewsFeed: {
    enabled: boolean;
    titel?: string;
    widgetId: string;
  };
  partnerband: PartnerbandSettings;
  homePijlers: HomePijlers;
  homeDeurenTitel: string;
  homeDeurenTitelEn?: string;
  homeDeuren: HomeDeur[];
  /** Five offer doors on the brief homepage. Julie edits the sentences. */
  homeAanbod: HomeDeur[];
  homeBrief: HomeBrief;
  /** Default share image (og:image) for pages without their own; undefined = /og-default.jpg. */
  ogAfbeelding?: string;
  /** Google Search Console "HTML tag" verification token (content attribute only). */
  googleSiteVerification?: string;
}

/** Existing Elfsight Instagram Feed on movenda.be ("Untitled Instagram Feed 2"). */
export const DEFAULT_INSTAGRAM_WIDGET_ID = "7108de0f-f7f4-4dfd-990f-443ab8e68566";

/** Existing Elfsight Google Reviews widget on movenda.be ("Untitled Google Reviews"). */
export const DEFAULT_GOOGLE_REVIEWS_WIDGET_ID = "4574da10-a0e4-4c28-9f62-93e57d02ef76";

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
  id: string;
  naam: string;
  naamEn?: string;
  categorie: PrijsCategorie;
  bedrag: number;
  eenheid?: string;
  vanaf: boolean;
  opAanvraag: boolean;
  notitie?: string;
  notitieEn?: string;
  volgorde: number;
  /** Resolved in getPrijzen(): MPC/screening price and Site-instellingen says MPC quotes ex VAT. */
  exclBtw: boolean;
}

export function prijsNaam(item: Pick<Prijsitem, "naam" | "naamEn">, lang: Lang = "nl"): string {
  return lang === "en" ? item.naamEn || item.naam : item.naam;
}

export function prijsNotitie(item: Pick<Prijsitem, "notitie" | "notitieEn">, lang: Lang = "nl"): string | undefined {
  return lang === "en" ? item.notitieEn || item.notitie : item.notitie;
}

/** MPC (and screening) prices are quoted ex VAT when Julie says so in Site-instellingen → Prijzen. */
function prijsIsExclBtw(item: Pick<Prijsitem, "categorie">, exBtwMpc: boolean | undefined): boolean {
  return exBtwMpc !== false && MPC_PRIJS_CATEGORIEEN.includes(item.categorie);
}

/** "incl. opvolging · excl. BTW" — the public note plus the VAT flag, per language. */
export function prijsNootVolledig(item: Prijsitem, lang: Lang = "nl"): string | undefined {
  const parts = [prijsNotitie(item, lang), item.exclBtw ? (lang === "en" ? "excl. VAT" : "excl. BTW") : undefined];
  return parts.filter(Boolean).join(" · ") || undefined;
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
  tekstEn?: string;
  naam: string;
  rol?: string;
  rolEn?: string;
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
  excerptEn?: string;
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
  /** Diensten Julie linked ("Gaat over deze behandelingen"): internal links blog ↔ dienst page. */
  diensten?: BlogPostDienst[];
}

export type BlogPostDienst = Pick<Dienst, "slug" | "categorie" | "titel" | "titelEn">;

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
  naamEn?: string;
  tekst?: string;
  tekstEn?: string;
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

export function formatPrijs(
  item: {
    bedrag: number;
    eenheid?: string;
    vanaf: boolean;
    opAanvraag: boolean;
  },
  lang: Lang = "nl",
): string {
  if (item.opAanvraag) return lang === "en" ? "On request" : "Op aanvraag";
  const prefix = item.vanaf ? (lang === "en" ? "From " : "Vanaf ") : "";
  const unit =
    lang === "en" && item.eenheid
      ? item.eenheid.replace(/\blessen\b/gi, "classes")
      : item.eenheid;
  const eenheid = unit ? ` / ${unit}` : "";
  return `${prefix}€${item.bedrag}${eenheid}`;
}

/** Card intro: English pages prefer the opening of bodyEn, then the Dutch intro. */
export function dienstIntro(dienst: Pick<Dienst, "intro" | "bodyEn" | "body">, lang: Lang = "nl"): string {
  if (lang === "en" && dienst.bodyEn) return truncateAtSentence(dienst.bodyEn, 180);
  return dienst.intro;
}

export function formatEuro(bedrag?: number): string | undefined {
  if (bedrag == null) return undefined;
  return `€${bedrag}`;
}

const teamlidProjection = `{
  "slug": slug.current,
  voornaam, naam, rol, rolEn, disciplines, locaties, email, bio, bioEn,
  volgorde, actief,
  "specialisaties": specialisaties[]->{ "id": _id, naam, naamEn, "dienst": dienst->{ "slug": slug.current, categorie } },
  "foto": foto.asset->url,
  tariefKine, tariefPt, tariefPtMpc, tariefPerformance,
  clubs,
  "keuzehulpTags": keuzehulpTags[]->{ "id": _id, label, labelEn, categorie, volgorde, actief },
  "updatedAt": _updatedAt
}`;

const locatieProjection = `{
  "slug": slug.current,
  naam, korteNaam, brand, type, adres,
  "geo": { "lat": geo.lat, "lng": geo.lng },
  telefoon, email, uren, urenNote, btw, iban, bic, mapsUrl, googleBusinessUrl,
  routebeschrijving, rpr, instagram, facebook, verdiepingNote,
  "foto": foto.asset->url,
  "updatedAt": _updatedAt
}`;

const prijsitemProjection = `{ "id": _id, naam, naamEn, categorie, bedrag, eenheid, vanaf, opAanvraag, notitie, notitieEn, volgorde }`;

const dienstProjection = `{
  "slug": slug.current,
  categorie, titel, titelEn, intro, slogan, body, bodyEn,
  ctaLabel, ctaUrl, seoTitle, seoDescription, seoTitleEn, seoDescriptionEn, volgorde,
  "toonInMenu": coalesce(toonInMenu, true), menuLabel, menuLabelEn,
  "gekoppeldeTeamleden": gekoppeldeTeamleden[]->slug.current,
  "afbeelding": afbeelding.asset->url,
  "galerij": galerij[].asset->url,
  "prijs": prijs->${prijsitemProjection},
  "updatedAt": _updatedAt
}`;

export async function getTeamleden(): Promise<Teamlid[]> {
  return once("teamleden", async () => {
    const rows = await sanity.fetch(
      `*[_type == "teamlid" && actief == true] | order(volgorde asc) ${teamlidProjection}`,
    );
    return (rows || []).map(normalizeTeamlid);
  });
}

export async function getTeamlidBySlug(slug: string): Promise<Teamlid | undefined> {
  return (await getTeamleden()).find((lid) => lid.slug === slug);
}

export async function getTeamledenByLocatie(locatie: LocatieSlug): Promise<Teamlid[]> {
  const team = await getTeamleden();
  return team.filter((t) => t.locaties.includes(locatie));
}

// Discipline is what Julie ticks under "Telt mee als" on the teamlid (kine / pt / both / none),
// not guessed from the role text. One definition, used by the homepage counts and the /team
// filter so they can never disagree.
export const isKinesist = (lid: Teamlid) => lid.disciplines.includes("kine");

/** Manual therapy shows every physiotherapist except these four. */
const MANUELE_UITZONDERING = new Set(["arne-daniels", "tanse-vanheusden", "an-janssen", "jana-albrechts"]);

export function teamVoorDienst(dienst: Pick<Dienst, "slug" | "gekoppeldeTeamleden">, team: Teamlid[]): Teamlid[] {
  if (dienst.slug === "manuele-therapie") {
    return team.filter((lid) => isKinesist(lid) && !MANUELE_UITZONDERING.has(lid.slug));
  }
  return team.filter((lid) => dienst.gekoppeldeTeamleden.includes(lid.slug));
}
export const isTrainer = (lid: Teamlid) => lid.disciplines.includes("pt");

/** Counts from Teamlid.disciplines ("Telt mee als"). Someone ticked as both counts in both. */
export function teamCounts(team: Teamlid[]): { kinesisten: number; trainers: number } {
  return {
    kinesisten: team.filter(isKinesist).length,
    trainers: team.filter(isTrainer).length,
  };
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
  return once("keuzehulp", loadKeuzehulp);
}

async function loadKeuzehulp(): Promise<Keuzehulp> {
  const [doc, tags] = await Promise.all([
    sanity.fetch(`*[_id == "keuzehulp"][0]{ actief, titel, intro, vragen, geenMatchTekst }`),
    sanity.fetch(
      `*[_type == "keuzehulpTag" && actief != false] | order(categorie asc, coalesce(volgorde, 9999) asc, label asc){ "id": _id, label, labelEn, categorie, volgorde, actief }`,
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
      "Kies wat op jou van toepassing is — je mag per vraag meerdere opties aanklikken. Dit is een hulpmiddel, geen medisch advies.",
    vragen: { ...KEUZEHULP_DEFAULT_VRAGEN, ...(doc?.vragen || {}) },
    geenMatchTekst:
      doc?.geenMatchTekst ||
      "Geen exacte match, maar dit zijn de collega's die het dichtst bij je vraag zitten. Twijfel je? Bel ons.",
    opties,
  };
}

const seedTeamBySlug = new Map(
  (seedTeam as { slug: string; bioEn?: string }[]).map((lid) => [lid.slug, lid]),
);

function normalizeTeamlid(row: Teamlid): Teamlid {
  const fromSeed = seedTeamBySlug.get(row.slug);
  return {
    ...row,
    bioEn: row.bioEn || fromSeed?.bioEn,
    clubs: row.clubs || [],
    keuzehulpTags: (row.keuzehulpTags || [])
      .filter((t): t is KeuzehulpTag => Boolean(t && t.id && t.label && t.categorie))
      .map((t) => ({ ...t, actief: t.actief !== false })),
    specialisaties: (row.specialisaties || []).filter(
      (s): s is Specialisatie => Boolean(s && s.id && s.naam),
    ),
    locaties: row.locaties || [],
    disciplines:
      row.slug === "koen-daniels" && !(row.disciplines || []).includes("kine")
        ? [...(row.disciplines || []), "kine" as Discipline]
        : row.disciplines || [],
  };
}

export function keuzehulpTagLabel(tag: Pick<KeuzehulpTag, "label" | "labelEn">, lang: Lang = "nl"): string {
  return lang === "en" ? tag.labelEn || tag.label : tag.label;
}

const locatieFotoFallback: Record<string, string> = {
  olympia: "/locaties/olympia-ingang.jpg",
  mpc: "/locaties/mpc-ingang.jpg",
};

function normalizeLocatie(row: Locatie): Locatie {
  const foto = row.foto || locatieFotoFallback[row.slug];
  // Public names are Movenda (Kuringersteenweg) and Performance Centre (Lammerweg).
  // The slug stays "olympia" so existing URLs and CMS records keep working.
  if (row.slug === "olympia") {
    return { ...row, naam: "Movenda", korteNaam: "Movenda", foto };
  }
  if (row.slug === "mpc") {
    return { ...row, korteNaam: "Performance Centre", foto };
  }
  return {
    ...row,
    korteNaam: row.korteNaam || row.naam.replace(/^Movenda\s+/i, ""),
    foto,
  };
}

/** "Olympia · Performance Centre" for a teamlid, from the Locatie records (not hardcoded). */
export function locatieKorteNamen(slugs: LocatieSlug[], locaties: Locatie[]): string[] {
  return locaties.filter((loc) => slugs.includes(loc.slug)).map((loc) => loc.korteNaam);
}

export async function getLocaties(): Promise<Locatie[]> {
  return once("locaties", async () => {
    const rows = await sanity.fetch(`*[_type == "locatie"] | order(slug.current asc) ${locatieProjection}`);
    return (rows || []).map(normalizeLocatie);
  });
}

export async function getLocatieBySlug(slug: LocatieSlug): Promise<Locatie | undefined> {
  return (await getLocaties()).find((loc) => loc.slug === slug);
}

export async function getDiensten(): Promise<Dienst[]> {
  return once("diensten", async () => {
    const rows = await sanity.fetch(`*[_type == "dienst"] | order(volgorde asc) ${dienstProjection}`);
    const live = (rows || []).map(normalizeDienst);
    const keys = new Set(live.map((d: Dienst) => `${d.categorie}:${d.slug}`));
    const extra = (seedDiensten as Dienst[])
      .filter((d) => !keys.has(`${d.categorie}:${d.slug}`))
      .map((d) => normalizeDienst({ ...d, galerij: d.galerij || [], gekoppeldeTeamleden: d.gekoppeldeTeamleden || [] }));
    return [...live, ...extra];
  });
}

export async function getDienstenByCategorie(
  categorie: DienstCategorie | "mpc" | DienstCategorie[],
): Promise<Dienst[]> {
  const cats =
    categorie === "mpc" ? MPC_CATEGORIES : Array.isArray(categorie) ? categorie : [categorie];
  return (await getDiensten()).filter((d) => cats.includes(d.categorie));
}

export async function getDienstBySlug(
  slug: string,
  categorie?: DienstCategorie | "mpc",
): Promise<Dienst | undefined> {
  const cats =
    categorie === "mpc" ? MPC_CATEGORIES : categorie ? [categorie] : undefined;
  const diensten = await getDiensten();
  return diensten.find((d) => d.slug === slug && (!cats || cats.includes(d.categorie)));
}

// Old-site covers for diensten the media upload missed (no Sanity image yet).
const dienstCoverFallback: Record<string, string> = {
  "kleine-groepstraining": "/dienst-covers/kleine-groepstraining.jpg",
  skifit: "/dienst-covers/skifit.jpg",
  running: "/dienst-covers/running.jpg",
};

const seedDienstByKey = new Map(
  (seedDiensten as Pick<Dienst, "slug" | "categorie" | "bodyEn" | "seoTitleEn" | "seoDescriptionEn">[]).map(
    (d) => [`${d.categorie}:${d.slug}`, d],
  ),
);

/** Prefer Julie's CMS English when it is complete; if Sanity still has the
 * short summary from the first EN pass, use the full seed translation. */
function pickFullerEn(cms?: string, seed?: string): string | undefined {
  const live = cms?.trim();
  const fallback = seed?.trim();
  if (!live) return fallback;
  if (!fallback) return live;
  if (fallback.length > live.length + 60) return fallback;
  return live;
}

function withoutTarieven(text?: string): string | undefined {
  if (!text) return text;
  return text.replace(/\n*Tarieven staan[^\n]*/gi, "").replace(/\n*Fees are on the[^\n]*/gi, "").trim();
}

function normalizeDienst(row: Dienst): Dienst {
  const fallback = dienstCoverFallback[row.slug];
  const fromSeed = seedDienstByKey.get(`${row.categorie}:${row.slug}`);
  return {
    ...row,
    body: withoutTarieven(pickFullerEn(row.body, (fromSeed as { body?: string } | undefined)?.body) || row.body) || row.body,
    bodyEn: withoutTarieven(pickFullerEn(row.bodyEn, fromSeed?.bodyEn)),
    seoTitleEn: row.seoTitleEn || fromSeed?.seoTitleEn,
    seoDescriptionEn: row.seoDescriptionEn || fromSeed?.seoDescriptionEn,
    afbeelding: row.afbeelding || fallback,
    galerij: row.galerij?.length ? row.galerij : fallback ? [fallback] : [],
    gekoppeldeTeamleden: row.gekoppeldeTeamleden || [],
    slogan: row.slogan?.trim() || (fromSeed as { slogan?: string } | undefined)?.slogan,
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return once("siteSettings", loadSiteSettings);
}

async function loadSiteSettings(): Promise<SiteSettings> {
  const settings = await sanity.fetch(
    `*[_id == "siteSettings"][0]{ siteNaam, tagline, email, socials, booking, googleReviews, analytics, prijzenInfo, slogans, nieuwsbrief, instagramFeed, googleReviewsFeed, partnerband,
      homePijlers{ kine{ ..., "foto": foto${CMS_FOTO_PROJECTION} }, training{ ..., "foto": foto${CMS_FOTO_PROJECTION} }, mpc{ ..., "foto": foto${CMS_FOTO_PROJECTION} } },
      homeDeurenTitel, homeDeurenTitelEn,
      homeDeuren[]{ korteNaam, korteNaamEn, regel, regelEn, tekst, tekstEn, href, "foto": foto${CMS_FOTO_PROJECTION} },
      homeAanbod[]{ korteNaam, korteNaamEn, regel, regelEn, tekst, tekstEn, href, "foto": foto${CMS_FOTO_PROJECTION} },
      homeBrief,
      teamfoto{ "url": afbeelding.asset->url, alt, bijschrift, "hotspot": afbeelding.hotspot{ x, y } },
      "ogAfbeelding": ogAfbeelding.asset->url }`,
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
    googleReviewsFeed: {
      enabled: settings?.googleReviewsFeed?.enabled !== false,
      titel:
        settings?.googleReviewsFeed?.titel ||
        seedSettings.googleReviewsFeed?.titel ||
        "Wat klanten zeggen op Google",
      widgetId:
        settings?.googleReviewsFeed?.widgetId ||
        seedSettings.googleReviewsFeed?.widgetId ||
        DEFAULT_GOOGLE_REVIEWS_WIDGET_ID,
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
    homeDeurenTitel: settings?.homeDeurenTitel || seedSettings.homeDeurenTitel || "Eén praktijk, drie wegen",
    homeDeurenTitelEn: settings?.homeDeurenTitelEn || seedSettings.homeDeurenTitelEn,
    homeDeuren: mergeHomeDeuren(settings?.homeDeuren, seedDeuren),
    homeAanbod: mergeHomeDeuren(settings?.homeAanbod, seedAanbod),
    homeBrief: mergeHomeBrief(settings?.homeBrief),
    ogAfbeelding: settings?.ogAfbeelding || undefined,
    // Lives under Analytics in the Studio (same tab as the GA4 id), top-level here.
    googleSiteVerification: (settings?.analytics?.googleSiteVerification as string | undefined)?.trim() || undefined,
  };
}

const seedDeuren = (seedSettings.homeDeuren ?? []) as HomeDeur[];
const seedAanbod = (seedSettings.homeAanbod ?? []) as HomeDeur[];
const seedBrief = seedSettings.homeBrief as HomeBrief;

function mergeHomeBrief(fromSanity?: Partial<HomeBrief> | null): HomeBrief {
  const text = (value: string | undefined, fallback: string) => value?.trim() || fallback;
  return {
    merkKicker: text(fromSanity?.merkKicker, seedBrief.merkKicker),
    merkTitel: text(fromSanity?.merkTitel, seedBrief.merkTitel),
    merkTekst: text(fromSanity?.merkTekst, seedBrief.merkTekst),
    merkStatement: text(fromSanity?.merkStatement, seedBrief.merkStatement),
    merkCta: text(fromSanity?.merkCta, seedBrief.merkCta),
    partnersKicker: text(fromSanity?.partnersKicker, seedBrief.partnersKicker),
    partnersCta: text(fromSanity?.partnersCta, seedBrief.partnersCta),
    aanbodKicker: text(fromSanity?.aanbodKicker, seedBrief.aanbodKicker),
    aanbodTekst: text(fromSanity?.aanbodTekst, seedBrief.aanbodTekst),
    locatiesTitel: text(fromSanity?.locatiesTitel, seedBrief.locatiesTitel),
    hasseltProfiel: text(fromSanity?.hasseltProfiel, seedBrief.hasseltProfiel),
    kuringenProfiel: text(fromSanity?.kuringenProfiel, seedBrief.kuringenProfiel),
    teamKicker: text(fromSanity?.teamKicker, seedBrief.teamKicker),
    teamTitel: text(fromSanity?.teamTitel, seedBrief.teamTitel),
    teamTekst: text(fromSanity?.teamTekst, seedBrief.teamTekst),
    teamCta: text(fromSanity?.teamCta, seedBrief.teamCta),
    reviewsTitel: text(fromSanity?.reviewsTitel, seedBrief.reviewsTitel),
    reviewsCta: text(fromSanity?.reviewsCta, seedBrief.reviewsCta),
    insightsKicker: text(fromSanity?.insightsKicker, seedBrief.insightsKicker),
    insightsTitel: text(fromSanity?.insightsTitel, seedBrief.insightsTitel),
    insightsTekst: text(fromSanity?.insightsTekst, seedBrief.insightsTekst),
    insightsCta: text(fromSanity?.insightsCta, seedBrief.insightsCta),
    instagramTitel: text(fromSanity?.instagramTitel, seedBrief.instagramTitel),
    instagramCta: text(fromSanity?.instagramCta, seedBrief.instagramCta),
    slotTitel: text(fromSanity?.slotTitel, seedBrief.slotTitel),
    slotTekst: text(fromSanity?.slotTekst, seedBrief.slotTekst),
    slotAfspraak: text(fromSanity?.slotAfspraak, seedBrief.slotAfspraak),
    slotContact: text(fromSanity?.slotContact, seedBrief.slotContact),
    bewijs: {
      jaren: text(fromSanity?.bewijs?.jaren, seedBrief.bewijs.jaren),
    },
  };
}

function mergeHomeDeuren(
  fromSanity: Array<Partial<HomeDeur> & { foto?: Parameters<typeof toCmsFoto>[0] }> | undefined,
  seedRows: HomeDeur[],
): HomeDeur[] {
  const rows = fromSanity?.length ? fromSanity : seedRows;
  return rows
    .map((row) => {
      const korteNaam = row.korteNaam?.trim();
      const href = row.href?.trim();
      if (!korteNaam || !href) return null;
      return {
        korteNaam,
        korteNaamEn: row.korteNaamEn?.trim() || undefined,
        regel: row.regel?.trim() || undefined,
        regelEn: row.regelEn?.trim() || undefined,
        tekst: row.tekst?.trim() || undefined,
        tekstEn: row.tekstEn?.trim() || undefined,
        href,
        foto: toCmsFoto(row.foto),
      } satisfies HomeDeur;
    })
    .filter((row): row is HomeDeur => row !== null);
}

// Until Julie fills in "Homepage — drie pijlers" in Sanity, the seed copy
// (the same texts as the old movenda.be homepage) is used field by field.
function mergePijler(
  key: HomePijlerKey,
  fromSanity?: Partial<Omit<HomePijler, "foto">> & { foto?: Parameters<typeof toCmsFoto>[0] },
): HomePijler {
  const seed = seedSettings.homePijlers[key] as HomePijler;
  return {
    foto: toCmsFoto(fromSanity?.foto),
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

// ---------------------------------------------------------------------------
// Fixed pages (home, over, kine, …): H1, intro, hero photo, SEO and the text
// blocks that used to be hardcoded in Astro. One `pagina` document per key.
// Sanity wins field by field; the seed JSON (the launch copy) fills the gaps.

export type PaginaKey = keyof typeof seedPaginas;

export interface PaginaBlok {
  kop: string;
  tekst: string;
  kopEn?: string;
  tekstEn?: string;
}

export interface Pagina {
  key: PaginaKey;
  ondertitel?: string;
  ondertitelEn?: string;
  titel: string;
  titelEn?: string;
  intro?: string;
  introEn?: string;
  /** Sanity CDN URL of the uploaded hero photo; undefined = use the bundled asset. */
  foto?: string;
  /** Hotspot Julie picked in the Studio (0–1), used as crop focal point. */
  fotoHotspot?: { x: number; y: number };
  fotoAlt?: string;
  /** Second photo further down the overview pages (kine, training, mpc); undefined = bundled asset. */
  fotoSecundair?: CmsFoto;
  /** Background photo of the slogan banner (home only); undefined = bundled asset. */
  bannerFoto?: CmsFoto;
  /** Muted looping hero video (mpc only): Sanity CDN URL of the uploaded mp4/webm. */
  heroVideo?: string;
  blokken: PaginaBlok[];
  kenmerken: PaginaBlok[];
  stappenTitel?: string;
  stappenTitelEn?: string;
  stappenIntro?: string;
  stappenIntroEn?: string;
  stappen: PaginaBlok[];
  pijlers: PaginaBlok[];
  legeTekst?: string;
  legeTekstEn?: string;
  ctaTekst?: string;
  ctaTekstEn?: string;
  /** Contact form: choices for "Hoe ben je bij ons terechtgekomen?" (contact page only). */
  verwijsopties: VerwijsOptie[];
  seoTitle?: string;
  seoDescription?: string;
  seoTitleEn?: string;
  seoDescriptionEn?: string;
}

/** Which follow-up question a referral choice triggers in the contact form. */
export type VerwijsVervolg = "geen" | "naam" | "club" | "event" | "tekst";

export interface VerwijsOptie {
  label: string;
  labelEn?: string;
  vervolg: VerwijsVervolg;
}

type PaginaSeed = Partial<Omit<Pagina, "key" | "foto" | "fotoSecundair" | "bannerFoto" | "heroVideo">>;
type CmsFotoRow = Parameters<typeof toCmsFoto>[0];
type PaginaRow = Partial<Omit<Pagina, "fotoSecundair" | "bannerFoto">> & {
  foto?: string;
  fotoHotspot?: { x: number; y: number } | null;
  fotoSecundair?: CmsFotoRow;
  bannerFoto?: CmsFotoRow;
  heroVideo?: string | null;
};

function mergeBlokken(cms: PaginaBlok[] | undefined, seed: PaginaBlok[] | undefined): PaginaBlok[] {
  return cms?.length ? cms : seed || [];
}

const VERWIJS_VERVOLG = new Set<VerwijsVervolg>(["geen", "naam", "club", "event", "tekst"]);

function normalizeVerwijsopties(items: Partial<VerwijsOptie>[] | undefined): VerwijsOptie[] {
  return (items || [])
    .filter((item): item is Partial<VerwijsOptie> & { label: string } => !!item.label?.trim())
    .map((item) => ({
      label: item.label.trim(),
      labelEn: item.labelEn?.trim() || undefined,
      vervolg: VERWIJS_VERVOLG.has(item.vervolg as VerwijsVervolg) ? (item.vervolg as VerwijsVervolg) : "geen",
    }));
}

/** New defaults from the seed (e.g. Sportcentrum Olympia) still show if the CMS list is an older copy. */
function withSeedVerwijsopties(
  live: VerwijsOptie[],
  seed: Partial<VerwijsOptie>[] | undefined,
): VerwijsOptie[] {
  const extras = normalizeVerwijsopties(seed).filter(
    (opt) => !live.some((item) => item.label.toLowerCase() === opt.label.toLowerCase()),
  );
  if (!extras.length) return live;
  const andere = live.findIndex((item) => /^andere$/i.test(item.label));
  if (andere >= 0) return [...live.slice(0, andere), ...extras, ...live.slice(andere)];
  const club = live.findIndex((item) => /sportclub/i.test(item.label));
  if (club >= 0) return [...live.slice(0, club + 1), ...extras, ...live.slice(club + 1)];
  return [...live, ...extras];
}

export async function getPagina(key: PaginaKey): Promise<Pagina> {
  return once(`pagina:${key}`, () => loadPagina(key));
}

async function loadPagina(key: PaginaKey): Promise<Pagina> {
  const seed = (seedPaginas as Record<string, PaginaSeed>)[key] || {};
  const row = (await sanity.fetch(
    `*[_type == "pagina" && key == $key][0]{
      ondertitel, ondertitelEn, titel, titelEn, intro, introEn,
      "foto": foto.asset->url, "fotoHotspot": foto.hotspot{ x, y }, fotoAlt,
      "fotoSecundair": fotoSecundair${CMS_FOTO_PROJECTION},
      "bannerFoto": bannerFoto${CMS_FOTO_PROJECTION},
      "heroVideo": heroVideo.asset->url,
      blokken, kenmerken, stappenTitel, stappenTitelEn, stappenIntro, stappenIntroEn, stappen, pijlers,
      legeTekst, legeTekstEn, ctaTekst, ctaTekstEn,
      verwijsopties[]{ label, labelEn, vervolg },
      seoTitle, seoDescription, seoTitleEn, seoDescriptionEn
    }`,
    { key },
  )) as PaginaRow | null;

  const pick = <K extends keyof PaginaSeed>(field: K): PaginaSeed[K] | undefined => {
    const live = row?.[field as keyof PaginaRow] as PaginaSeed[K] | undefined;
    if (typeof live === "string") return (live.trim() ? live : seed[field]) as PaginaSeed[K];
    return (live ?? seed[field]) as PaginaSeed[K] | undefined;
  };

  return {
    key,
    ondertitel: pick("ondertitel"),
    ondertitelEn: pick("ondertitelEn"),
    titel: pick("titel") || "",
    titelEn: pick("titelEn"),
    intro: pick("intro"),
    introEn: pick("introEn"),
    foto: row?.foto || undefined,
    fotoHotspot: row?.foto && row.fotoHotspot ? row.fotoHotspot : undefined,
    fotoAlt: pick("fotoAlt"),
    fotoSecundair: toCmsFoto(row?.fotoSecundair),
    bannerFoto: toCmsFoto(row?.bannerFoto),
    heroVideo: row?.heroVideo || undefined,
    blokken: mergeBlokken(row?.blokken, seed.blokken),
    kenmerken: mergeBlokken(row?.kenmerken, seed.kenmerken),
    stappenTitel: pick("stappenTitel"),
    stappenTitelEn: pick("stappenTitelEn"),
    stappenIntro: pick("stappenIntro"),
    stappenIntroEn: pick("stappenIntroEn"),
    stappen: mergeBlokken(row?.stappen, seed.stappen),
    pijlers: mergeBlokken(row?.pijlers, seed.pijlers),
    legeTekst: pick("legeTekst"),
    legeTekstEn: pick("legeTekstEn"),
    ctaTekst: pick("ctaTekst"),
    ctaTekstEn: pick("ctaTekstEn"),
    verwijsopties: withSeedVerwijsopties(
      normalizeVerwijsopties(row?.verwijsopties?.length ? row.verwijsopties : seed.verwijsopties),
      seed.verwijsopties,
    ),
    seoTitle: pick("seoTitle"),
    seoDescription: pick("seoDescription"),
    seoTitleEn: pick("seoTitleEn"),
    seoDescriptionEn: pick("seoDescriptionEn"),
  };
}

type PaginaTekstVeld =
  | "ondertitel"
  | "titel"
  | "intro"
  | "stappenTitel"
  | "stappenIntro"
  | "legeTekst"
  | "ctaTekst"
  | "seoTitle"
  | "seoDescription";

/** NL field, or its EN twin when present and lang is "en". */
export function paginaTekst(p: Pagina, field: PaginaTekstVeld, lang: Lang = "nl"): string {
  const nl = p[field] || "";
  if (lang !== "en") return nl;
  const en = p[`${field}En` as keyof Pagina];
  return typeof en === "string" && en.trim() ? en : nl;
}

/** Intro as paragraphs (blank line = new paragraph). Fills {kinesisten}/{trainers} from `vars`. */
export function paginaAlineas(
  p: Pagina,
  lang: Lang = "nl",
  vars: Record<string, string | number> = {},
): string[] {
  const raw = paginaTekst(p, "intro", lang);
  return raw
    .split(/\n\s*\n/)
    .map((s) => s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)).trim())
    .filter(Boolean);
}

export function paginaBlokKop(b: PaginaBlok, lang: Lang = "nl"): string {
  return lang === "en" ? b.kopEn || b.kop : b.kop;
}

export function paginaBlokTekst(b: PaginaBlok, lang: Lang = "nl"): string {
  return lang === "en" ? b.tekstEn || b.tekst : b.tekst;
}

/** Strip the SEO-only " Hasselt" suffix some dienst titles carry ("Manuele therapie Hasselt"). */
export function dienstKorteTitel(dienst: Pick<Dienst, "titel" | "titelEn">, lang: "nl" | "en" = "nl"): string {
  const titel = lang === "en" ? dienst.titelEn || dienst.titel : dienst.titel;
  return titel.replace(/ Hasselt$/, "");
}

/** Label in the header dropdown: Julie's "Korte naam voor het menu" wins, otherwise the short title. */
export function dienstMenuLabel(
  dienst: Pick<Dienst, "titel" | "titelEn" | "menuLabel" | "menuLabelEn">,
  lang: "nl" | "en" = "nl",
): string {
  const eigen = lang === "en" ? dienst.menuLabelEn || dienst.menuLabel : dienst.menuLabel;
  return eigen?.trim() || dienstKorteTitel(dienst, lang);
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
  const merged = await once("faqs", loadFaqs);
  if (!site) return merged;
  return merged.filter((faq) => !faq.site || faq.site === site || faq.site === "beide");
}

async function loadFaqs(): Promise<Faq[]> {
  const rows: Faq[] = await sanity.fetch(
    `*[_type == "faq"] | order(volgorde asc) { vraag, vraagEn, antwoord, antwoordEn, categorie, site, volgorde }`,
  );
  const seed = seedFaqs as Faq[];
  const byVolgorde = new Map(seed.map((f) => [`${f.site || "movenda"}-${f.volgorde}`, f]));
  const byVraag = new Map(seed.map((f) => [f.vraag, f]));
  return (rows || []).map((faq) => {
    const fromSeed =
      byVolgorde.get(`${faq.site || "movenda"}-${faq.volgorde}`) || byVraag.get(faq.vraag);
    return {
      ...faq,
      vraagEn: faq.vraagEn || fromSeed?.vraagEn,
      antwoordEn: faq.antwoordEn || fromSeed?.antwoordEn,
    };
  });
}

export async function getPrijzen(): Promise<Prijsitem[]> {
  return once("prijzen", async () => {
    const [rows, exBtwMpc] = await Promise.all([
      sanity.fetch(`*[_type == "prijsitem"] | order(volgorde asc) ${prijsitemProjection}`) as Promise<Prijsitem[]>,
      sanity.fetch(`*[_id == "siteSettings"][0].prijzenInfo.exBtwMpc`) as Promise<boolean | undefined>,
    ]);
    return (rows || []).map((row) => ({ ...row, exclBtw: prijsIsExclBtw(row, exBtwMpc) }));
  });
}

const prijsCategorieVoorDienst: Record<DienstCategorie, PrijsCategorie[]> = {
  kine: ["kine"],
  training: ["training", "screening"],
  "mpc-training": ["mpc-training", "screening"],
  "mpc-rehab": ["mpc-rehab"],
  "mpc-groep": ["mpc-groep"],
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
  // The dienst projection carries the raw prijsitem; take the resolved copy (exclBtw) from the list.
  if (linked) {
    if (linked.opAanvraag) return undefined;
    return prijzen.find((p) => p.id === linked.id) || { ...linked, exclBtw: false };
  }
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
 * English <title> for a dienst page. Julie's seoTitleEn wins; otherwise
 * "<Title EN> in Hasselt | {brand}". "in" keeps it distinct from the Dutch
 * "<Titel> Hasselt | …" for language-neutral names like Boxing. City is
 * dropped when that would push the title past 60 characters.
 */
export function dienstSeoTitleEn(dienst: Dienst): string {
  if (dienst.seoTitleEn) return dienst.seoTitleEn;
  const korte = dienstKorteTitel(dienst, "en");
  const brand = isMpcCategorie(dienst.categorie) ? "Movenda Performance Centre" : "Movenda";
  const withCity = `${korte} in Hasselt | ${brand}`;
  return withCity.length <= 60 ? withCity : `${korte} | ${brand}`;
}

export function dienstSeoDescriptionEn(dienst: Dienst): string {
  if (dienst.seoDescriptionEn) return dienst.seoDescriptionEn;
  if (dienst.bodyEn) return truncateAtSentence(dienst.bodyEn, 155);
  if (isMpcCategorie(dienst.categorie)) {
    return `${dienstKorteTitel(dienst, "en")} at the Movenda Performance Centre in Kuringen (Hasselt): data-driven, one-on-one coaching for recreational and professional athletes.`;
  }
  return truncateAtSentence(dienst.body || dienst.intro, 155);
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
  const rows = await once("partners", loadPartners);
  if (!tonenOp) return rows;
  return rows.filter((p) => p.tonenOp === tonenOp || p.tonenOp === "beide");
}

async function loadPartners(): Promise<Partner[]> {
  // Partners seeded before the "actief" toggle existed have no such field;
  // missing counts as active so nothing silently drops out of the band.
  const hidden = /tenkie|vkm[\s-]*godsheide/i;
  const rows: Partner[] = await sanity.fetch(
    `*[_type == "partner" && actief != false] | order(volgorde asc) {
      "slug": _id,
      naam, url, type, tonenOp, volgorde,
      "actief": actief != false,
      "logo": logo.asset->url
    }`,
  );
  return (rows || []).filter((partner) => !hidden.test(partner.naam) && !hidden.test(partner.slug));
}

export async function getLesrooster(): Promise<LesroosterItem[]> {
  return once("lesrooster", () => sanity.fetch(
    `*[_type == "lesrooster"] | order(volgorde asc) {
      les, dag, van, tot, volgorde,
      "coachNaam": coach->voornaam + " " + coach->naam,
      "coachSlug": coach->slug.current,
      "dienstSlug": dienst->slug.current,
      "dienstCategorie": dienst->categorie
    }`,
  ));
}

const seedGetuigenisBySlug = new Map(
  (seedGetuigenissen as { slug: string; tekstEn?: string }[]).map((g) => [g.slug, g]),
);

function isPlaceholderGetuigenis(item: Getuigenis): boolean {
  return (
    item.slug.startsWith("placeholder-") ||
    /getuigenis volgt nog/i.test(item.tekst) ||
    /this testimonial will follow/i.test(item.tekstEn || "")
  );
}

export async function getGetuigenissen(locatie?: LocatieSlug, lang: Lang = "nl"): Promise<Getuigenis[]> {
  const items = await once("getuigenissen", loadGetuigenissen);
  if (!locatie) return items;
  return items.filter((g) => !g.locatie || g.locatie === "beide" || g.locatie === locatie);
}

async function loadGetuigenissen(): Promise<Getuigenis[]> {
  const rows: Getuigenis[] = await sanity.fetch(
    `*[_type == "getuigenis" && actief != false] | order(volgorde asc) {
      "slug": coalesce(slug.current, _id),
      tekst, tekstEn, naam, rol, rolEn, locatie, volgorde,
      "foto": foto.asset->url,
      "actief": actief != false
    }`,
  );
  return (rows || [])
    .map((item) => ({
      ...item,
      tekstEn: item.tekstEn || seedGetuigenisBySlug.get(item.slug)?.tekstEn,
    }))
    // Placeholder getuigenissen ("Naam volgt", "Deze getuigenis volgt nog…") are
    // seed/CMS rows waiting on a real quote from Julie. They must never appear on
    // the live carousel in any language — showing them reads as fake reviews.
    .filter((item) => !isPlaceholderGetuigenis(item));
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
  titel, titelEn, excerpt, excerptEn,
  "cover": cover.asset->url,
  coverFit,
  body[] ${blogImageBlock},
  bodyEn[] ${blogImageBlock},
  "auteurNaam": auteur->voornaam + " " + auteur->naam,
  "auteurSlug": auteur->slug.current,
  publicatiedatum, tags, seoTitle, seoDescription,
  "diensten": gerelateerdeDiensten[]->{ "slug": slug.current, categorie, titel, titelEn },
  "updatedAt": _updatedAt
}`;

type SeedBlogBlock = { type: "p" | "h3"; text: string } | { type: "ul"; items: string[] };

const seedBlogBySlug = new Map(
  (seedBlog as { slug: string; titelEn?: string; excerptEn?: string; bodyEn?: SeedBlogBlock[] }[]).map(
    (post) => [post.slug, post],
  ),
);

function isEmptyPortable(blocks?: unknown[]): boolean {
  return !blocks || blocks.length === 0;
}

function seedToPortableText(sections?: SeedBlogBlock[]): unknown[] | undefined {
  if (!sections?.length) return undefined;
  return sections.flatMap((section, i) => {
    if (section.type === "ul") {
      return section.items.map((item, j) => ({
        _type: "block",
        _key: `seed-l${i}-${j}`,
        style: "normal",
        listItem: "bullet",
        level: 1,
        markDefs: [],
        children: [{ _type: "span", _key: `seed-l${i}-${j}-s`, text: item, marks: [] }],
      }));
    }
    return [
      {
        _type: "block",
        _key: `seed-b${i}`,
        style: section.type === "h3" ? "h3" : "normal",
        markDefs: [],
        children: [{ _type: "span", _key: `seed-b${i}-s`, text: section.text, marks: [] }],
      },
    ];
  });
}

function normalizeBlogPost(row: BlogPost): BlogPost {
  const fromSeed = seedBlogBySlug.get(row.slug);
  const bodyEn = isEmptyPortable(row.bodyEn) ? seedToPortableText(fromSeed?.bodyEn) : row.bodyEn;
  return {
    ...row,
    titelEn: row.titelEn || fromSeed?.titelEn,
    excerptEn: row.excerptEn || fromSeed?.excerptEn,
    bodyEn,
    ...resolveBlogMedia(row.slug, row),
  };
}

export interface SiteEvent {
  slug: string;
  titel: string;
  titelEn?: string;
  datum: string;
  locatie?: string;
  foto?: string;
  tekst?: string;
  tekstEn?: string;
  tonenOpHome: boolean;
}

const PLACEHOLDER_EVENT: SiteEvent = {
  slug: "dwars-door-hasselt",
  titel: "Dwars door Hasselt",
  titelEn: "Dwars door Hasselt",
  datum: "2027-03-01",
  locatie: "Hasselt",
  tekst: "Datum volgt. We zijn erbij.",
  tekstEn: "Date to follow. We'll be there.",
  tonenOpHome: true,
};

export async function getEvents(): Promise<SiteEvent[]> {
  return once("events", async () => {
    const rows = await sanity.fetch(
      `*[_type == "event" && actief != false] | order(datum desc) {
        "slug": slug.current, titel, titelEn, datum, locatie, tekst, tekstEn, tonenOpHome,
        "foto": foto.asset->url
      }`,
    );
    const live = (rows || []).filter((row: SiteEvent) => row.slug && row.titel && row.datum);
    return live.length > 0 ? live : [PLACEHOLDER_EVENT];
  });
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  return once("blogPosts", async () => {
    const rows: BlogPost[] = await sanity.fetch(
      `*[_type == "blogPost"] | order(publicatiedatum desc) ${blogPostProjection}`,
    );
    return (rows || []).map(normalizeBlogPost);
  });
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  return (await getBlogPosts()).find((post) => post.slug === slug);
}

/**
 * Blog posts for the "Lees ook" block on a dienst page. Posts Julie explicitly
 * linked to the dienst come first; when there are fewer than `limit`, posts
 * whose title/summary/tags mention the dienst name fill up (so "Dry needling"
 * picks up an older article about dry needling she never linked).
 */
export async function getBlogPostsVoorDienst(
  dienst: Pick<Dienst, "slug" | "categorie" | "titel">,
  limit = 3,
): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  const linked = posts.filter((post) =>
    post.diensten?.some((d) => d.slug === dienst.slug && d.categorie === dienst.categorie),
  );
  if (linked.length >= limit) return linked.slice(0, limit);

  const naam = dienstKorteTitel(dienst).toLowerCase();
  const stem = naam.replace(/(therapie|training|behandeling)$/i, "").trim();
  const needle = stem.length >= 5 ? stem : naam;
  const mentioned = posts.filter(
    (post) =>
      !linked.includes(post) &&
      [post.titel, post.excerpt || "", ...(post.tags || [])].join(" ").toLowerCase().includes(needle),
  );
  return [...linked, ...mentioned].slice(0, limit);
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
  return once("vacatures", () =>
    sanity.fetch(
      `*[_type == "vacature" && actief == true] { "slug": slug.current, titel, "locatieNaam": locatie->naam, omschrijving, contactEmail, actief }`,
    ),
  );
}

const seedSportaanbodByNaam = new Map(
  (seedSportaanbod as { naam: string; naamEn?: string; tekstEn?: string }[]).map((item) => [item.naam, item]),
);

export async function getSportaanbod(): Promise<SportaanbodItem[]> {
  return once("sportaanbod", loadSportaanbod);
}

async function loadSportaanbod(): Promise<SportaanbodItem[]> {
  const rows: SportaanbodItem[] = await sanity.fetch(
    `*[_type == "sportaanbodItem"] | order(volgorde asc) { naam, naamEn, tekst, tekstEn, link, volgorde }`,
  );
  return (rows || []).map((item) => {
    const fromSeed = seedSportaanbodByNaam.get(item.naam);
    return {
      ...item,
      naamEn: item.naamEn || fromSeed?.naamEn,
      tekstEn: item.tekstEn || fromSeed?.tekstEn,
    };
  });
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
  const popups = await once("popups", loadPopups);
  return popups.find((popup) => popupMatchesPath(popup.toonOp, path) && popupIsInWindow(popup));
}

async function loadPopups(): Promise<Popup[]> {
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
  return (rows || []).map((row) => ({
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
  }));
}

