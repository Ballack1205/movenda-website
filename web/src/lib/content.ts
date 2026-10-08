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
import seedOlympiaPagina from "../content/olympia-pagina.json";
import seedFaqs from "../content/faqs.json";
import seedTeam from "../content/team.json";
import seedGetuigenissen from "../content/getuigenissen.json";
import seedBlog from "../content/blog.json";
import seedSportaanbod from "../content/sportaanbod.json";
import seedDiensten from "../content/diensten.json";
import seedPartners from "../content/partners.json";
import seedPaginas from "../content/paginas.json";
import { resolveBlogMedia } from "./blog";
import type { Lang } from "./i18n";
import { KEUZEHULP_EN, withLang } from "./i18n";

export type LocatieSlug = "olympia" | "mpc";
export type DienstCategorie = "kine" | "training" | "mpc-training" | "mpc-rehab" | "mpc-groep";
/** Mirrors PRIJS_CATEGORIEEN in the Studio; the category alone decides which page/table a price lands in. */
export type PrijsCategorie = "kine" | "training" | "mpc-training" | "mpc-rehab" | "mpc-groep" | "screening";
export const MPC_PRIJS_CATEGORIEEN: PrijsCategorie[] = ["training", "mpc-training", "mpc-rehab", "mpc-groep", "screening"];
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
  opleiding?: string;
  expertise?: string;
  expertiseEn?: string;
  motivatie?: string;
  motivatieEn?: string;
  quote?: string;
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
  titelEn?: string;
  intro: string;
  introEn?: string;
  vragen: Record<KeuzehulpCategorie, string>;
  vragenEn?: Record<KeuzehulpCategorie, string>;
  geenMatchTekst: string;
  geenMatchTekstEn?: string;
  /** Active tags, grouped per question, in display order. */
  opties: Record<KeuzehulpCategorie, KeuzehulpTag[]>;
  /** Which Verwijskompas view each screen size gets. */
  kompasWeergave: { mobiel: KompasWeergave; desktop: KompasWeergave };
}

export type KompasWeergave = "stappen" | "visual";

const asKompasWeergave = (value: unknown, fallback: KompasWeergave): KompasWeergave =>
  value === "stappen" || value === "visual" ? value : fallback;

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
  typeEn?: string;
  adres: string;
  geo: { lat: number; lng: number };
  geoApprox?: boolean;
  telefoon: string;
  email: string;
  uren: Openingsuur[];
  urenNote?: string;
  urenNoteEn?: string;
  btw: string;
  iban: string;
  bic?: string;
  mapsUrl: string;
  /** Google Business Profile link (sameAs in JSON-LD). Julie fills this in Sanity. */
  googleBusinessUrl?: string;
  routebeschrijving?: string;
  routebeschrijvingEn?: string;
  /** Exterior / entrance photo. Sanity URL or a /public path. */
  foto?: string;
  rpr?: string;
  instagram?: string;
  facebook?: string;
  verdiepingNote?: string;
  /** Marketing copy on /locaties/olympia. Empty fields fall back to the launch sentences. */
  olympiaPagina?: OlympiaPagina;
  updatedAt?: string;
}

export interface OlympiaZin {
  tekst: string;
  tekstEn?: string;
  href?: string;
}

export interface OlympiaAanbodItem {
  titel: string;
  titelEn?: string;
  tekst: string;
  tekstEn?: string;
  href: string;
}

export interface OlympiaPagina {
  kicker: string;
  kickerEn: string;
  titel: string;
  titelEn: string;
  intro: string;
  introEn: string;
  cta: string;
  ctaEn: string;
  ctaHref: string;
  aanbodLink: string;
  aanbodLinkEn: string;
  aboKicker: string;
  aboKickerEn: string;
  aboTitel: string;
  aboTitelEn: string;
  aboTekst: string;
  aboTekstEn: string;
  aboPunten: OlympiaZin[];
  aboMeer: string;
  aboMeerEn: string;
  aboMeerNa: string;
  aboMeerNaEn: string;
  aboCta: string;
  aboCtaEn: string;
  aboCtaHref: string;
  aanbodTitel: string;
  aanbodTitelEn: string;
  aanbodMeer: string;
  aanbodMeerEn: string;
  olympiaLink: string;
  olympiaLinkEn: string;
  olympiaUrl: string;
  aanbod: OlympiaAanbodItem[];
  waaromTitel: string;
  waaromTitelEn: string;
  waarom: OlympiaZin[];
  praktischTitel: string;
  praktischTitelEn: string;
  seoTitel: string;
  seoTitelEn: string;
  seoBeschrijving: string;
  seoBeschrijvingEn: string;
  hoofdfoto?: string;
  hoofdfotoHotspot?: { x: number; y: number };
  hoofdfotoAlt?: string;
}

export interface Dienst {
  slug: string;
  categorie: DienstCategorie;
  titel: string;
  titelEn?: string;
  intro: string;
  slogan?: string;
  sloganEn?: string;
  body: string;
  bodyEn?: string;
  ctaLabel?: string;
  ctaLabelEn?: string;
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
  introEn?: string;
  terugbetalingStandaard?: string;
  terugbetalingStandaardEn?: string;
  terugbetalingVt?: string;
  terugbetalingVtEn?: string;
  voorwaarden?: string;
  voorwaardenEn?: string;
  exBtwMpc?: boolean;
  annulatiebeleid?: string;
  annulatiebeleidEn?: string;
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
  /** Label on the link to this pillar's overview page. */
  cta?: string;
  ctaEn?: string;
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
  const rewritten = rewriteKineOverzichtHref(href);
  if (lang !== "en") return rewritten;
  if (!rewritten.startsWith("/") || rewritten.startsWith("/en")) return rewritten;
  return `/en${rewritten}`;
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
  merkKickerEn?: string;
  merkTitel: string;
  merkTitelEn?: string;
  merkTekst: string;
  merkTekstEn?: string;
  merkStatement: string;
  merkStatementEn?: string;
  merkCta: string;
  merkCtaEn?: string;
  partnersKicker: string;
  partnersKickerEn?: string;
  partnersCta: string;
  partnersCtaEn?: string;
  aanbodKicker: string;
  aanbodKickerEn?: string;
  aanbodTekst: string;
  aanbodTekstEn?: string;
  locatiesTitel: string;
  locatiesTitelEn?: string;
  hasseltNaam: string;
  hasseltNaamEn?: string;
  kuringenNaam: string;
  kuringenNaamEn?: string;
  hasseltProfiel: string;
  hasseltProfielEn?: string;
  kuringenProfiel: string;
  kuringenProfielEn?: string;
  eventsKicker: string;
  eventsKickerEn?: string;
  teamKicker: string;
  teamKickerEn?: string;
  teamTitel: string;
  teamTitelEn?: string;
  teamTekst: string;
  teamTekstEn?: string;
  teamCta: string;
  teamCtaEn?: string;
  reviewsTitel: string;
  reviewsTitelEn?: string;
  reviewsCta: string;
  reviewsCtaEn?: string;
  insightsKicker: string;
  insightsKickerEn?: string;
  insightsTitel: string;
  insightsTitelEn?: string;
  insightsTekst: string;
  insightsTekstEn?: string;
  insightsCta: string;
  insightsCtaEn?: string;
  instagramTitel: string;
  instagramTitelEn?: string;
  instagramCta: string;
  instagramCtaEn?: string;
  slotTitel: string;
  slotTitelEn?: string;
  slotTekst: string;
  slotTekstEn?: string;
  slotAfspraak: string;
  slotAfspraakEn?: string;
  slotContact: string;
  slotContactEn?: string;
  bewijs: {
    jaren: string;
    kinesistenLabel: string;
    kinesistenLabelEn?: string;
    trainersLabel: string;
    trainersLabelEn?: string;
    locatiesLabel: string;
    locatiesLabelEn?: string;
    jarenLabel: string;
    jarenLabelEn?: string;
  };
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
  footerTagline: string;
  footerTaglineEn: string;
  telefoonOlympia: string;
  telefoonMpc: string;
  email: string;
  booking: { enabled: boolean; url: string; label: string; labelEn?: string };
  teamfoto: Teamfoto;
  /** One Google profile for the whole practice. Key stays `olympia` in Sanity. */
  googleReviews: { olympia: GoogleReviews };
  analytics: AnalyticsSettings;
  socials: { instagram: string; facebook: string; linkedin: string };
  prijzenInfo: PrijzenInfo;
  slogans: {
    home?: string;
    homeEn?: string;
    kine?: string;
    kineEn?: string;
    mpc?: string;
    mpcEn?: string;
    prijzenKine?: string;
    prijzenKineEn?: string;
    prijzenPt?: string;
    prijzenPtEn?: string;
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
  labels: SiteLabels;
}

export type LabelGroep = "menu" | "footer" | "formulier" | "cookies" | "locatie";

export interface SiteLabels {
  menu: Record<string, string>;
  footer: Record<string, string>;
  formulier: Record<string, string>;
  cookies: Record<string, string>;
  locatie: Record<string, string>;
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
  lesEn?: string;
  dag: string;
  van: string;
  tot: string;
  coachNaam?: string;
  coachSlug?: string;
  dienstSlug?: string;
  dienstCategorie?: DienstCategorie;
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
  titelEn?: string;
  locatieNaam?: string;
  omschrijving: string;
  omschrijvingEn?: string;
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

export type PopupActie = "formulier" | "link" | "mail";
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
  /** "mail": mailto target. "formulier": where sign-ups go (read server-side, @movenda.be only). */
  mailAdres?: string;
  mailOnderwerp?: string;
  extraVragen: PopupVraag[];
  toonOp: PopupTonenOp;
  geldigVan?: string;
  geldigTot?: string;
  eenKeerPerBezoeker: boolean;
}

const MPC_CATEGORIES: DienstCategorie[] = ["mpc-training", "mpc-rehab", "mpc-groep"];

/** Group-class pages. Corporate coaching stays under /performance. */
const GROEP_LES_SLUGS = new Set([
  "boxing",
  "hiit",
  "full-body",
  "powerplus",
  "skifit",
  "running",
  "core",
  "mxgp",
]);

/** Retired overview. Its photo now lives on B2B teamtraining; old URLs go to the timetable. */
const RETIRED_SLUGS = new Set(["kleine-groepstraining"]);

/** B2B formulas live under /b2b, not under groepslessen or /performance. */
const B2B_SLUGS = new Set(["teamtraining", "on-site-workouts"]);

/** Older MPC copies. The kinesitherapie page is the canonical URL. */
const KINE_CANONICAL_SLUGS = new Set(["dry-needling", "cupping", "taping"]);

export function isMpcCategorie(categorie: DienstCategorie): boolean {
  return MPC_CATEGORIES.includes(categorie);
}

export function isGroepLes(dienst: Pick<Dienst, "slug" | "categorie">): boolean {
  return dienst.categorie === "mpc-groep" && GROEP_LES_SLUGS.has(dienst.slug);
}

export function isB2bDienst(dienst: Pick<Dienst, "slug">): boolean {
  return B2B_SLUGS.has(dienst.slug);
}

export function isRetiredDienst(dienst: Pick<Dienst, "slug">): boolean {
  return RETIRED_SLUGS.has(dienst.slug);
}

/**
 * Julie: no public /mpc path. Old links (Sanity doors, CTA urls) are rewritten
 * onto /performance and /groepslessen. /locaties/mpc stays the location slug.
 */
/**
 * The physiotherapy overview moved to /movenda-kinesitherapie so /kinesitherapie
 * can serve the homepage. Treatment pages stay at /kinesitherapie/<slug>.
 */
export function rewriteKineOverzichtHref(href: string): string {
  return href.replace(
    /(https?:\/\/(?:www\.)?movenda\.be)?(\/en)?\/kinesitherapie(?!\/[a-z0-9-])\/?/gi,
    (_match, origin = "", prefix = "") => `${origin}${prefix}/movenda-kinesitherapie`,
  );
}

export function rewriteMpcHref(href: string): string;
export function rewriteMpcHref(href: string | undefined): string | undefined;
export function rewriteMpcHref(href: string | undefined): string | undefined {
  if (!href) return href;
  const hashAt = href.indexOf("#");
  const hash = hashAt >= 0 ? href.slice(hashAt) : "";
  const path = hashAt >= 0 ? href.slice(0, hashAt) : href;
  const en = path.startsWith("/en/");
  const rest = en ? path.slice(3) : path;
  if (rest !== "/mpc" && !rest.startsWith("/mpc/")) return href;
  const prefix = en ? "/en" : "";
  if (rest === "/mpc" || rest === "/mpc/") return `${prefix}/performance${hash}`;
  if (rest === "/mpc/groepslessen") return `${prefix}/groepslessen${hash}`;
  const slug = rest.slice("/mpc/".length).replace(/\/$/, "");
  if (!slug || slug.includes("/")) return href;
  if (KINE_CANONICAL_SLUGS.has(slug)) return `${prefix}/kinesitherapie/${slug}${hash}`;
  if (RETIRED_SLUGS.has(slug)) return `${prefix}/groepslessen${hash}`;
  if (GROEP_LES_SLUGS.has(slug)) return `${prefix}/groepslessen/${slug}${hash}`;
  if (slug === "corporate-coaching") return `${prefix}/b2b${hash}`;
  if (B2B_SLUGS.has(slug)) return `${prefix}/b2b/${slug}${hash}`;
  return `${prefix}/performance/${slug}${hash}`;
}

export function dienstHref(dienst: Pick<Dienst, "slug" | "categorie">, lang: "nl" | "en" = "nl"): string {
  const prefix = lang === "en" ? "/en" : "";
  if (dienst.categorie === "kine" || KINE_CANONICAL_SLUGS.has(dienst.slug)) {
    return `${prefix}/kinesitherapie/${dienst.slug}`;
  }
  if (dienst.categorie === "training") return `${prefix}/training/${dienst.slug}`;
  if (dienst.slug === "corporate-coaching") return `${prefix}/b2b`;
  if (isRetiredDienst(dienst)) return `${prefix}/groepslessen`;
  if (isB2bDienst(dienst)) return `${prefix}/b2b/${dienst.slug}`;
  if (isGroepLes(dienst)) return `${prefix}/groepslessen/${dienst.slug}`;
  return `${prefix}/performance/${dienst.slug}`;
}

/** Every timetable row links somewhere, even when Sanity has no dienst slug. */
export function lesHref(
  les: { les: string; dienstSlug?: string; dienstCategorie?: string },
  diensten: Pick<Dienst, "slug" | "categorie" | "titel" | "menuLabel">[],
  lang: "nl" | "en" = "nl",
): string {
  if (les.dienstSlug && les.dienstCategorie) {
    return dienstHref({ slug: les.dienstSlug, categorie: les.dienstCategorie as DienstCategorie }, lang);
  }
  const name = les.les.trim().toLowerCase();
  const match = diensten.find(
    (d) => d.titel.toLowerCase() === name || d.menuLabel?.toLowerCase() === name || d.slug === name,
  );
  if (match) return dienstHref(match, lang);
  return lang === "en" ? "/en/groepslessen#inschrijven" : "/groepslessen#inschrijven";
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
  opleiding, expertise, expertiseEn, motivatie, motivatieEn, quote,
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
  naam, korteNaam, brand, type, typeEn, adres,
  "geo": { "lat": geo.lat, "lng": geo.lng },
  telefoon, email, uren, urenNote, urenNoteEn, btw, iban, bic, mapsUrl, googleBusinessUrl,
  routebeschrijving, routebeschrijvingEn, rpr, instagram, facebook, verdiepingNote,
  olympiaPagina{
    kicker, kickerEn, titel, titelEn, intro, introEn, cta, ctaEn, ctaHref,
    aanbodLink, aanbodLinkEn,
    aboKicker, aboKickerEn, aboTitel, aboTitelEn, aboTekst, aboTekstEn,
    aboPunten[]{ tekst, tekstEn, href },
    aboMeer, aboMeerEn, aboMeerNa, aboMeerNaEn, aboCta, aboCtaEn, aboCtaHref,
    aanbodTitel, aanbodTitelEn, aanbodMeer, aanbodMeerEn, olympiaLink, olympiaLinkEn, olympiaUrl,
    aanbod[]{ titel, titelEn, tekst, tekstEn, href },
    waaromTitel, waaromTitelEn, waarom[]{ tekst, tekstEn },
    praktischTitel, praktischTitelEn,
    seoTitel, seoTitelEn, seoBeschrijving, seoBeschrijvingEn,
    "hoofdfoto": hoofdfoto.asset->url,
    "hoofdfotoHotspot": hoofdfoto.hotspot{ x, y },
    hoofdfotoAlt
  },
  "foto": foto.asset->url,
  "updatedAt": _updatedAt
}`;

const prijsitemProjection = `{ "id": _id, naam, naamEn, categorie, bedrag, eenheid, vanaf, opAanvraag, notitie, notitieEn, volgorde }`;

const dienstProjection = `{
  "slug": slug.current,
  categorie, titel, titelEn, intro, slogan, body, bodyEn,
  ctaLabel, ctaUrl, seoTitle, seoDescription, seoTitleEn, seoDescriptionEn, volgorde,
  toonInMenu, menuLabel, menuLabelEn,
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

/** Therapists and coaches only: office staff tick nothing under "Telt mee als". */
export const aantalBehandelaars = (team: Teamlid[]) => team.filter((lid) => lid.disciplines.length > 0).length;

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
    sanity.fetch(`*[_id == "keuzehulp"][0]{ actief, titel, titelEn, intro, introEn, vragen, geenMatchTekst, geenMatchTekstEn, kompasWeergave }`),
    sanity.fetch(
      `*[_type == "keuzehulpTag" && actief != false] | order(categorie asc, coalesce(volgorde, 9999) asc, label asc){ "id": _id, label, labelEn, categorie, volgorde, actief }`,
    ) as Promise<KeuzehulpTag[]>,
  ]);
  const opties = { klacht: [], regio: [], sport: [], doelgroep: [] } as Record<KeuzehulpCategorie, KeuzehulpTag[]>;
  for (const tag of tags || []) {
    if (tag.categorie in opties) opties[tag.categorie].push({ ...tag, actief: true });
  }
  const vragen = doc?.vragen || {};
  return {
    actief: doc?.actief !== false,
    titel: doc?.titel || "Wie past bij mij?",
    titelEn: doc?.titelEn || KEUZEHULP_EN.titel,
    intro:
      doc?.intro ||
      "Kies wat op jou van toepassing is — je mag per vraag meerdere opties aanklikken. Dit is een hulpmiddel, geen medisch advies.",
    introEn: doc?.introEn || KEUZEHULP_EN.intro,
    vragen: { ...KEUZEHULP_DEFAULT_VRAGEN, ...vragen },
    vragenEn: {
      klacht: vragen.klachtEn || KEUZEHULP_EN.vragen.klacht,
      regio: vragen.regioEn || KEUZEHULP_EN.vragen.regio,
      sport: vragen.sportEn || KEUZEHULP_EN.vragen.sport,
      doelgroep: vragen.doelgroepEn || KEUZEHULP_EN.vragen.doelgroep,
    },
    geenMatchTekst:
      doc?.geenMatchTekst ||
      "Geen exacte match, maar dit zijn de collega's die het dichtst bij je vraag zitten. Twijfel je? Bel ons.",
    geenMatchTekstEn: doc?.geenMatchTekstEn || KEUZEHULP_EN.geenMatchTekst,
    opties,
    kompasWeergave: {
      mobiel: asKompasWeergave(doc?.kompasWeergave?.mobiel, "visual"),
      desktop: asKompasWeergave(doc?.kompasWeergave?.desktop, "visual"),
    },
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

function filled(value: string | undefined, fallback: string): string {
  return value?.trim() || fallback;
}

function mergeZinnen(live: OlympiaZin[] | undefined, seed: OlympiaZin[]): OlympiaZin[] {
  if (!live?.length) return seed;
  return live.map((item, index) => {
    const fromSeed = seed[index];
    return {
      tekst: filled(item.tekst, fromSeed?.tekst || ""),
      tekstEn: item.tekstEn?.trim() || fromSeed?.tekstEn,
      href: rewriteKineOverzichtHref(item.href?.trim() || fromSeed?.href || "") || undefined,
    };
  });
}

function mergeAanbod(live: OlympiaAanbodItem[] | undefined, seed: OlympiaAanbodItem[]): OlympiaAanbodItem[] {
  if (!live?.length) return seed;
  return live.map((item, index) => {
    const fromSeed = seed[index];
    return {
      titel: filled(item.titel, fromSeed?.titel || ""),
      titelEn: item.titelEn?.trim() || fromSeed?.titelEn,
      tekst: filled(item.tekst, fromSeed?.tekst || ""),
      tekstEn: item.tekstEn?.trim() || fromSeed?.tekstEn,
      href: rewriteKineOverzichtHref(filled(item.href, fromSeed?.href || "")),
    };
  });
}

const olympiaSeed = seedOlympiaPagina as OlympiaPagina;

function mergeOlympiaPagina(live?: Partial<OlympiaPagina> | null): OlympiaPagina {
  const seed = olympiaSeed;
  return {
    kicker: filled(live?.kicker, seed.kicker),
    kickerEn: filled(live?.kickerEn, seed.kickerEn),
    titel: filled(live?.titel, seed.titel),
    titelEn: filled(live?.titelEn, seed.titelEn),
    intro: filled(live?.intro, seed.intro),
    introEn: filled(live?.introEn, seed.introEn),
    cta: filled(live?.cta, seed.cta),
    ctaEn: filled(live?.ctaEn, seed.ctaEn),
    ctaHref: filled(live?.ctaHref, seed.ctaHref),
    aanbodLink: filled(live?.aanbodLink, seed.aanbodLink),
    aanbodLinkEn: filled(live?.aanbodLinkEn, seed.aanbodLinkEn),
    aboKicker: filled(live?.aboKicker, seed.aboKicker),
    aboKickerEn: filled(live?.aboKickerEn, seed.aboKickerEn),
    aboTitel: filled(live?.aboTitel, seed.aboTitel),
    aboTitelEn: filled(live?.aboTitelEn, seed.aboTitelEn),
    aboTekst: filled(live?.aboTekst, seed.aboTekst),
    aboTekstEn: filled(live?.aboTekstEn, seed.aboTekstEn),
    aboPunten: mergeZinnen(live?.aboPunten, seed.aboPunten),
    aboMeer: filled(live?.aboMeer, seed.aboMeer),
    aboMeerEn: filled(live?.aboMeerEn, seed.aboMeerEn),
    aboMeerNa: filled(live?.aboMeerNa, seed.aboMeerNa),
    aboMeerNaEn: filled(live?.aboMeerNaEn, seed.aboMeerNaEn),
    aboCta: filled(live?.aboCta, seed.aboCta),
    aboCtaEn: filled(live?.aboCtaEn, seed.aboCtaEn),
    aboCtaHref: filled(live?.aboCtaHref, seed.aboCtaHref),
    aanbodTitel: filled(live?.aanbodTitel, seed.aanbodTitel),
    aanbodTitelEn: filled(live?.aanbodTitelEn, seed.aanbodTitelEn),
    aanbodMeer: filled(live?.aanbodMeer, seed.aanbodMeer),
    aanbodMeerEn: filled(live?.aanbodMeerEn, seed.aanbodMeerEn),
    olympiaLink: filled(live?.olympiaLink, seed.olympiaLink),
    olympiaLinkEn: filled(live?.olympiaLinkEn, seed.olympiaLinkEn),
    olympiaUrl: filled(live?.olympiaUrl, seed.olympiaUrl),
    aanbod: mergeAanbod(live?.aanbod, seed.aanbod),
    waaromTitel: filled(live?.waaromTitel, seed.waaromTitel),
    waaromTitelEn: filled(live?.waaromTitelEn, seed.waaromTitelEn),
    waarom: mergeZinnen(live?.waarom, seed.waarom),
    praktischTitel: filled(live?.praktischTitel, seed.praktischTitel),
    praktischTitelEn: filled(live?.praktischTitelEn, seed.praktischTitelEn),
    seoTitel: filled(live?.seoTitel, seed.seoTitel),
    seoTitelEn: filled(live?.seoTitelEn, seed.seoTitelEn),
    seoBeschrijving: filled(live?.seoBeschrijving, seed.seoBeschrijving),
    seoBeschrijvingEn: filled(live?.seoBeschrijvingEn, seed.seoBeschrijvingEn),
    hoofdfoto: live?.hoofdfoto || undefined,
    hoofdfotoHotspot: live?.hoofdfoto && live.hoofdfotoHotspot ? live.hoofdfotoHotspot : undefined,
    hoofdfotoAlt: live?.hoofdfotoAlt?.trim() || undefined,
  };
}

/** Dutch field, or the English twin when it is filled in. */
export function olympiaTekst(pagina: OlympiaPagina, field: keyof OlympiaPagina, lang: Lang): string {
  const nl = pagina[field];
  if (lang !== "en" || typeof nl !== "string") return typeof nl === "string" ? nl : "";
  const en = pagina[`${String(field)}En` as keyof OlympiaPagina];
  return typeof en === "string" && en.trim() ? en : nl;
}

export function olympiaZin(zin: OlympiaZin, lang: Lang): string {
  return lang === "en" ? zin.tekstEn?.trim() || zin.tekst : zin.tekst;
}

function normalizeLocatie(row: Locatie): Locatie {
  const foto = row.foto || locatieFotoFallback[row.slug];
  // Public names are Movenda (Kuringersteenweg) and Performance Centre (Lammerweg).
  // The slug stays "olympia" so existing URLs and CMS records keep working.
  if (row.slug === "olympia") {
    return { ...row, naam: "Movenda", korteNaam: "Movenda", foto, olympiaPagina: mergeOlympiaPagina(row.olympiaPagina) };
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
  teamtraining: "/dienst-covers/kleine-groepstraining.jpg",
  skifit: "/dienst-covers/skifit.jpg",
  running: "/dienst-covers/running.jpg",
};

const seedDienstByKey = new Map((seedDiensten as Dienst[]).map((d) => [`${d.categorie}:${d.slug}`, d]));

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
  const seedBody = fromSeed?.body;
  const chosenBody = pickFullerEn(row.body, seedBody);
  const seedWon = Boolean(seedBody?.trim() && chosenBody === seedBody.trim());
  const fromDocument = seedWon && fromSeed
    ? {
        titel: fromSeed.titel,
        titelEn: fromSeed.titelEn,
        intro: fromSeed.intro,
        slogan: fromSeed.slogan,
        sloganEn: fromSeed.sloganEn,
        ctaLabel: fromSeed.ctaLabel,
        ctaLabelEn: fromSeed.ctaLabelEn,
        ctaUrl: fromSeed.ctaUrl,
        menuLabel: fromSeed.menuLabel,
        menuLabelEn: fromSeed.menuLabelEn,
        seoTitle: fromSeed.seoTitle,
        seoDescription: fromSeed.seoDescription,
        seoTitleEn: fromSeed.seoTitleEn,
        seoDescriptionEn: fromSeed.seoDescriptionEn,
      }
    : {};
  return {
    ...row,
    ...fromDocument,
    body: withoutTarieven(chosenBody || row.body) || row.body,
    bodyEn: withoutTarieven(pickFullerEn(row.bodyEn, fromSeed?.bodyEn)),
    seoTitleEn: (seedWon ? fromSeed?.seoTitleEn : undefined) || row.seoTitleEn || fromSeed?.seoTitleEn,
    seoDescriptionEn: (seedWon ? fromSeed?.seoDescriptionEn : undefined) || row.seoDescriptionEn || fromSeed?.seoDescriptionEn,
    afbeelding: row.afbeelding || fallback,
    galerij: row.galerij?.length ? row.galerij : fallback ? [fallback] : [],
    gekoppeldeTeamleden: row.gekoppeldeTeamleden || [],
    slogan: (seedWon ? fromSeed?.slogan : undefined) || row.slogan?.trim() || fromSeed?.slogan,
    sloganEn: (seedWon ? fromSeed?.sloganEn : undefined) || row.sloganEn || fromSeed?.sloganEn,
    // Sanity wins once Julie sets the checkbox. An empty field falls back to the seed,
    // so these three can start hidden and she can turn them back on in Studio.
    toonInMenu: row.toonInMenu ?? fromSeed?.toonInMenu ?? true,
    ctaUrl: rewriteKineOverzichtHref(
      rewriteMpcHref((seedWon ? fromSeed?.ctaUrl : undefined) || row.ctaUrl || fromSeed?.ctaUrl) || "",
    ) || undefined,
  };
}

const seedLabels = seedSettings.labels as SiteLabels;

function mergeLabelGroep(live: Record<string, string> | undefined, seed: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(seed)) {
    const fromLive = live?.[key];
    out[key] = typeof fromLive === "string" && fromLive.trim() ? fromLive : value;
  }
  return out;
}

function mergeLabels(live?: Partial<SiteLabels> | null): SiteLabels {
  return {
    menu: mergeLabelGroep(live?.menu, seedLabels.menu),
    footer: mergeLabelGroep(live?.footer, seedLabels.footer),
    formulier: mergeLabelGroep(live?.formulier, seedLabels.formulier),
    cookies: mergeLabelGroep(live?.cookies, seedLabels.cookies),
    locatie: mergeLabelGroep(live?.locatie, seedLabels.locatie),
  };
}

/** A shared button or menu word. Empty English falls back to Dutch. */
export function uiTekst(settings: SiteSettings, groep: LabelGroep, key: string, lang: Lang): string {
  const bag = settings.labels[groep];
  const nl = bag[key] || "";
  if (lang !== "en") return nl;
  return bag[`${key}En`]?.trim() || nl;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return once("siteSettings", loadSiteSettings);
}

async function loadSiteSettings(): Promise<SiteSettings> {
  const settings = await sanity.fetch(
    `*[_id == "siteSettings"][0]{ siteNaam, tagline, footerTagline, footerTaglineEn, email, socials, booking, googleReviews, analytics, prijzenInfo, slogans, nieuwsbrief, instagramFeed, googleReviewsFeed, partnerband,
      homePijlers{ kine{ ..., "foto": foto${CMS_FOTO_PROJECTION} }, training{ ..., "foto": foto${CMS_FOTO_PROJECTION} }, mpc{ ..., "foto": foto${CMS_FOTO_PROJECTION} } },
      homeDeurenTitel, homeDeurenTitelEn,
      homeDeuren[]{ korteNaam, korteNaamEn, regel, regelEn, tekst, tekstEn, href, "foto": foto${CMS_FOTO_PROJECTION} },
      homeAanbod[]{ korteNaam, korteNaamEn, regel, regelEn, tekst, tekstEn, href, "foto": foto${CMS_FOTO_PROJECTION} },
      homeBrief,
      labels,
      teamfoto{ "url": afbeelding.asset->url, alt, bijschrift, "hotspot": afbeelding.hotspot{ x, y } },
      "ogAfbeelding": ogAfbeelding.asset->url }`,
  );
  const olympia = await getLocatieBySlug("olympia");
  const mpc = await getLocatieBySlug("mpc");
  return {
    siteNaam: settings?.siteNaam || "Movenda",
    tagline: settings?.tagline || "",
    footerTagline: settings?.footerTagline?.trim() || seedSettings.footerTagline,
    footerTaglineEn: settings?.footerTaglineEn?.trim() || seedSettings.footerTaglineEn,
    telefoonOlympia: olympia?.telefoon || "",
    telefoonMpc: mpc?.telefoon || "",
    email: settings?.email || "info@movenda.be",
    booking: {
      ...(seedSettings.booking || { enabled: false, url: "", label: "Maak een afspraak" }),
      ...(settings?.booking || {}),
      labelEn: settings?.booking?.labelEn || seedSettings.booking?.labelEn,
    },
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
    googleReviews: {
      olympia: settings?.googleReviews?.olympia || {
        rating: 0,
        count: "",
        reviewUrl: "",
        writeReviewUrl: "",
      },
    },
    analytics: {
      ...DEFAULT_ANALYTICS,
      ...(settings?.analytics || {}),
      mode: settings?.analytics?.mode === "live" ? "live" : "test",
      umami: { ...DEFAULT_ANALYTICS.umami, ...(settings?.analytics?.umami || {}) },
    },
    socials: settings?.socials || { instagram: "", facebook: "", linkedin: "" },
    prijzenInfo: { ...(seedSettings.prijzenInfo || {}), ...(settings?.prijzenInfo || {}) },
    slogans: { ...(seedSettings.slogans || {}), ...(settings?.slogans || {}) },
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
        "Google Reviews",
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
    labels: mergeLabels(settings?.labels),
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
    merkKickerEn: text(fromSanity?.merkKickerEn, seedBrief.merkKickerEn || ""),
    merkTitel: text(fromSanity?.merkTitel, seedBrief.merkTitel),
    merkTitelEn: text(fromSanity?.merkTitelEn, seedBrief.merkTitelEn || ""),
    merkTekst: text(fromSanity?.merkTekst, seedBrief.merkTekst),
    merkTekstEn: text(fromSanity?.merkTekstEn, seedBrief.merkTekstEn || ""),
    merkStatement: text(fromSanity?.merkStatement, seedBrief.merkStatement),
    merkStatementEn: text(fromSanity?.merkStatementEn, seedBrief.merkStatementEn || ""),
    merkCta: text(fromSanity?.merkCta, seedBrief.merkCta),
    merkCtaEn: text(fromSanity?.merkCtaEn, seedBrief.merkCtaEn || ""),
    partnersKicker: text(fromSanity?.partnersKicker, seedBrief.partnersKicker),
    partnersKickerEn: text(fromSanity?.partnersKickerEn, seedBrief.partnersKickerEn || ""),
    partnersCta: text(fromSanity?.partnersCta, seedBrief.partnersCta),
    partnersCtaEn: text(fromSanity?.partnersCtaEn, seedBrief.partnersCtaEn || ""),
    aanbodKicker: text(fromSanity?.aanbodKicker, seedBrief.aanbodKicker),
    aanbodKickerEn: text(fromSanity?.aanbodKickerEn, seedBrief.aanbodKickerEn || ""),
    aanbodTekst: text(fromSanity?.aanbodTekst, seedBrief.aanbodTekst),
    aanbodTekstEn: text(fromSanity?.aanbodTekstEn, seedBrief.aanbodTekstEn || ""),
    locatiesTitel: text(fromSanity?.locatiesTitel, seedBrief.locatiesTitel),
    locatiesTitelEn: text(fromSanity?.locatiesTitelEn, seedBrief.locatiesTitelEn || ""),
    hasseltNaam: text(fromSanity?.hasseltNaam, seedBrief.hasseltNaam),
    hasseltNaamEn: text(fromSanity?.hasseltNaamEn, seedBrief.hasseltNaamEn || ""),
    kuringenNaam: text(fromSanity?.kuringenNaam, seedBrief.kuringenNaam),
    kuringenNaamEn: text(fromSanity?.kuringenNaamEn, seedBrief.kuringenNaamEn || ""),
    hasseltProfiel: text(fromSanity?.hasseltProfiel, seedBrief.hasseltProfiel),
    hasseltProfielEn: text(fromSanity?.hasseltProfielEn, seedBrief.hasseltProfielEn || ""),
    kuringenProfiel: text(fromSanity?.kuringenProfiel, seedBrief.kuringenProfiel),
    kuringenProfielEn: text(fromSanity?.kuringenProfielEn, seedBrief.kuringenProfielEn || ""),
    eventsKicker: text(fromSanity?.eventsKicker, seedBrief.eventsKicker),
    eventsKickerEn: text(fromSanity?.eventsKickerEn, seedBrief.eventsKickerEn || ""),
    teamKicker: text(fromSanity?.teamKicker, seedBrief.teamKicker),
    teamKickerEn: text(fromSanity?.teamKickerEn, seedBrief.teamKickerEn || ""),
    teamTitel: text(fromSanity?.teamTitel, seedBrief.teamTitel),
    teamTitelEn: text(fromSanity?.teamTitelEn, seedBrief.teamTitelEn || ""),
    teamTekst: text(fromSanity?.teamTekst, seedBrief.teamTekst),
    teamTekstEn: text(fromSanity?.teamTekstEn, seedBrief.teamTekstEn || ""),
    teamCta: text(fromSanity?.teamCta, seedBrief.teamCta),
    teamCtaEn: text(fromSanity?.teamCtaEn, seedBrief.teamCtaEn || ""),
    reviewsTitel: text(fromSanity?.reviewsTitel, seedBrief.reviewsTitel),
    reviewsTitelEn: text(fromSanity?.reviewsTitelEn, seedBrief.reviewsTitelEn || ""),
    reviewsCta: text(fromSanity?.reviewsCta, seedBrief.reviewsCta),
    reviewsCtaEn: text(fromSanity?.reviewsCtaEn, seedBrief.reviewsCtaEn || ""),
    insightsKicker: text(fromSanity?.insightsKicker, seedBrief.insightsKicker),
    insightsKickerEn: text(fromSanity?.insightsKickerEn, seedBrief.insightsKickerEn || ""),
    insightsTitel: text(fromSanity?.insightsTitel, seedBrief.insightsTitel),
    insightsTitelEn: text(fromSanity?.insightsTitelEn, seedBrief.insightsTitelEn || ""),
    insightsTekst: text(fromSanity?.insightsTekst, seedBrief.insightsTekst),
    insightsTekstEn: text(fromSanity?.insightsTekstEn, seedBrief.insightsTekstEn || ""),
    insightsCta: text(fromSanity?.insightsCta, seedBrief.insightsCta),
    insightsCtaEn: text(fromSanity?.insightsCtaEn, seedBrief.insightsCtaEn || ""),
    instagramTitel: text(fromSanity?.instagramTitel, seedBrief.instagramTitel),
    instagramTitelEn: text(fromSanity?.instagramTitelEn, seedBrief.instagramTitelEn || ""),
    instagramCta: text(fromSanity?.instagramCta, seedBrief.instagramCta),
    instagramCtaEn: text(fromSanity?.instagramCtaEn, seedBrief.instagramCtaEn || ""),
    slotTitel: text(fromSanity?.slotTitel, seedBrief.slotTitel),
    slotTitelEn: text(fromSanity?.slotTitelEn, seedBrief.slotTitelEn || ""),
    slotTekst: text(fromSanity?.slotTekst, seedBrief.slotTekst),
    slotTekstEn: text(fromSanity?.slotTekstEn, seedBrief.slotTekstEn || ""),
    slotAfspraak: text(fromSanity?.slotAfspraak, seedBrief.slotAfspraak),
    slotAfspraakEn: text(fromSanity?.slotAfspraakEn, seedBrief.slotAfspraakEn || ""),
    slotContact: text(fromSanity?.slotContact, seedBrief.slotContact),
    slotContactEn: text(fromSanity?.slotContactEn, seedBrief.slotContactEn || ""),
    bewijs: {
      jaren: text(fromSanity?.bewijs?.jaren, seedBrief.bewijs.jaren),
      kinesistenLabel: text(fromSanity?.bewijs?.kinesistenLabel, seedBrief.bewijs.kinesistenLabel),
      kinesistenLabelEn: text(fromSanity?.bewijs?.kinesistenLabelEn, seedBrief.bewijs.kinesistenLabelEn || ""),
      trainersLabel: text(fromSanity?.bewijs?.trainersLabel, seedBrief.bewijs.trainersLabel),
      trainersLabelEn: text(fromSanity?.bewijs?.trainersLabelEn, seedBrief.bewijs.trainersLabelEn || ""),
      locatiesLabel: text(fromSanity?.bewijs?.locatiesLabel, seedBrief.bewijs.locatiesLabel),
      locatiesLabelEn: text(fromSanity?.bewijs?.locatiesLabelEn, seedBrief.bewijs.locatiesLabelEn || ""),
      jarenLabel: text(fromSanity?.bewijs?.jarenLabel, seedBrief.bewijs.jarenLabel),
      jarenLabelEn: text(fromSanity?.bewijs?.jarenLabelEn, seedBrief.bewijs.jarenLabelEn || ""),
    },
  };
}

function mergeHomeDeuren(
  fromSanity: Array<Partial<HomeDeur> & { foto?: Parameters<typeof toCmsFoto>[0] }> | undefined,
  seedRows: HomeDeur[],
): HomeDeur[] {
  const rows = fromSanity?.length ? fromSanity : seedRows;
  return rows
    .map((row): HomeDeur | null => {
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
        href: rewriteKineOverzichtHref((rewriteMpcHref(href) || href).replace(/\/performance\/corporate-coaching$/, "/b2b")),
        foto: toCmsFoto(row.foto),
      };
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
    cta: fromSanity?.cta?.trim() || seed.cta,
    ctaEn: fromSanity?.ctaEn?.trim() || seed.ctaEn,
  };
}

/** Button under a homepage pillar. Dutch, or English when that field is filled in. */
export function homePijlerCta(pijler: HomePijler, lang: Lang): string {
  const nl = pijler.cta || "";
  if (lang !== "en") return nl;
  return pijler.ctaEn?.trim() || nl;
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

export interface CookieRij {
  naam: string;
  doel: string;
  doelEn?: string;
  termijn: string;
  termijnEn?: string;
  toestemming?: string;
  toestemmingEn?: string;
  /** ga4, umami, instagram, googleReviews, maps, or altijd. */
  tool?: string;
  dienstverlener?: string;
  dienstverlenerEn?: string;
}

export interface Pagina {
  key: PaginaKey;
  ondertitel?: string;
  ondertitelEn?: string;
  titel: string;
  titelEn?: string;
  intro?: string;
  introEn?: string;
  /** Location cards and team block under the three pillars (home only). */
  olympiaKaartTitel?: string;
  olympiaKaartTitelEn?: string;
  olympiaKaartTekst?: string;
  olympiaKaartTekstEn?: string;
  olympiaKaartCta?: string;
  olympiaKaartCtaEn?: string;
  mpcKaartTitel?: string;
  mpcKaartTitelEn?: string;
  mpcKaartTekst?: string;
  mpcKaartTekstEn?: string;
  mpcKaartCta?: string;
  mpcKaartCtaEn?: string;
  teamBlokTitel?: string;
  teamBlokTitelEn?: string;
  teamBlokTekst?: string;
  teamBlokTekstEn?: string;
  teamBlokCta?: string;
  teamBlokCtaEn?: string;
  belLabel?: string;
  belLabelEn?: string;
  contactLabel?: string;
  contactLabelEn?: string;
  /** Button under the intro of the overview pages (kine, performance, b2b). */
  knopLabel?: string;
  knopLabelEn?: string;
  knopUrl?: string;
  aanbodTitel?: string;
  aanbodTitelEn?: string;
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
  slogan?: string;
  sloganEn?: string;
  /** Heading above the intro (Ons verhaal, Onze visie). */
  introKop?: string;
  introKopEn?: string;
  /** Closing statement (Ons verhaal, Onze visie). */
  afsluiter?: string;
  afsluiterEn?: string;
  extraTekst?: string;
  extraTekstEn?: string;
  prijsNotitie?: string;
  prijsNotitieEn?: string;
  formulierIntro?: string;
  formulierIntroEn?: string;
  terugbetalingTitel?: string;
  terugbetalingTitelEn?: string;
  terugbetalingTekst?: string;
  terugbetalingTekstEn?: string;
  perTherapeutTitel?: string;
  perTherapeutTitelEn?: string;
  perTherapeutTekst?: string;
  perTherapeutTekstEn?: string;
  bijgewerkt?: string;
  bijgewerktEn?: string;
  cookiesKolomNaam?: string;
  cookiesKolomNaamEn?: string;
  cookiesKolomDoel?: string;
  cookiesKolomDoelEn?: string;
  cookiesKolomTermijn?: string;
  cookiesKolomTermijnEn?: string;
  cookiesKolomToestemming?: string;
  cookiesKolomToestemmingEn?: string;
  cookies: CookieRij[];
  wieTitel?: string;
  wieTitelEn?: string;
  annulatieTitel?: string;
  annulatieTitelEn?: string;
  privacyZin?: string;
  privacyZinEn?: string;
  /** Page-specific form sentences. Shared name/email live on site settings. */
  formulier: Record<string, string>;
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

function mergeCookies(cms: CookieRij[] | undefined, seed: CookieRij[] | undefined): CookieRij[] {
  if (!cms?.length) return seed || [];
  return cms.map((row) => {
    const fromSeed = seed?.find((item) => item.naam === row.naam);
    if (!fromSeed) return row;
    return {
      ...fromSeed,
      ...row,
      doelEn: row.doelEn?.trim() || fromSeed.doelEn,
      termijnEn: row.termijnEn?.trim() || fromSeed.termijnEn,
      toestemmingEn: row.toestemmingEn?.trim() || fromSeed.toestemmingEn,
      dienstverlener: row.dienstverlener?.trim() || fromSeed.dienstverlener,
      dienstverlenerEn: row.dienstverlenerEn?.trim() || fromSeed.dienstverlenerEn,
      tool: row.tool?.trim() || fromSeed.tool,
    };
  });
}

function mergeTekstMap(
  cms: Record<string, string> | undefined,
  seed: Record<string, string> | undefined,
): Record<string, string> {
  const out: Record<string, string> = {};
  const keys = new Set([...Object.keys(seed || {}), ...Object.keys(cms || {})]);
  for (const key of keys) {
    if (key.startsWith("_")) continue;
    const live = cms?.[key];
    out[key] = typeof live === "string" && live.trim() ? live : seed?.[key] || "";
  }
  return out;
}

function mergeBlokken(cms: PaginaBlok[] | undefined, seed: PaginaBlok[] | undefined): PaginaBlok[] {
  if (!cms?.length) return seed || [];
  return cms.map((blok) => {
    const fromSeed = seed?.find((item) => item.kop === blok.kop);
    if (!fromSeed) return blok;
    return {
      ...blok,
      kopEn: blok.kopEn?.trim() || fromSeed.kopEn,
      tekstEn: blok.tekstEn?.trim() || fromSeed.tekstEn,
    };
  });
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
      olympiaKaartTitel, olympiaKaartTitelEn, olympiaKaartTekst, olympiaKaartTekstEn, olympiaKaartCta, olympiaKaartCtaEn,
      mpcKaartTitel, mpcKaartTitelEn, mpcKaartTekst, mpcKaartTekstEn, mpcKaartCta, mpcKaartCtaEn,
      teamBlokTitel, teamBlokTitelEn, teamBlokTekst, teamBlokTekstEn, teamBlokCta, teamBlokCtaEn,
      "foto": foto.asset->url, "fotoHotspot": foto.hotspot{ x, y }, fotoAlt,
      "fotoSecundair": fotoSecundair${CMS_FOTO_PROJECTION},
      "bannerFoto": bannerFoto${CMS_FOTO_PROJECTION},
      "heroVideo": heroVideo.asset->url,
      blokken, kenmerken, stappenTitel, stappenTitelEn, stappenIntro, stappenIntroEn, stappen, pijlers,
      legeTekst, legeTekstEn, ctaTekst, ctaTekstEn,
      slogan, sloganEn, introKop, introKopEn, afsluiter, afsluiterEn, extraTekst, extraTekstEn, prijsNotitie, prijsNotitieEn, formulierIntro, formulierIntroEn,
      terugbetalingTitel, terugbetalingTitelEn, terugbetalingTekst, terugbetalingTekstEn,
      perTherapeutTitel, perTherapeutTitelEn, perTherapeutTekst, perTherapeutTekstEn,
      belLabel, belLabelEn, contactLabel, contactLabelEn,
      knopLabel, knopLabelEn, knopUrl, aanbodTitel, aanbodTitelEn,
      bijgewerkt, bijgewerktEn,
      cookiesKolomNaam, cookiesKolomNaamEn, cookiesKolomDoel, cookiesKolomDoelEn,
      cookiesKolomTermijn, cookiesKolomTermijnEn, cookiesKolomToestemming, cookiesKolomToestemmingEn,
      cookies[]{ naam, doel, doelEn, termijn, termijnEn, toestemming, toestemmingEn, tool, dienstverlener, dienstverlenerEn },
      wieTitel, wieTitelEn, annulatieTitel, annulatieTitelEn, privacyZin, privacyZinEn,
      formulier,
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

  // Swap the previous default metadata for the new seed when Julie has not
  // edited it. Visible page copy is never replaced this way.
  const previousMeta: Record<string, string> =
    key === "home"
      ? {
          seoTitle: "Kinesitherapie, personal en performance training Hasselt | Movenda",
          seoDescription: "Sportpraktijk Movenda brengt kinesitherapie, training en performance samen.",
          seoTitleEn: "Physiotherapy, personal and performance training Hasselt | Movenda",
          seoDescriptionEn: "Sportpraktijk Movenda brings physiotherapy, training and performance together.",
        }
      : key === "kinesitherapie"
        ? {
            seoTitle: "Kinesitherapie Hasselt | Movenda",
            seoDescription: "Gespecialiseerde kinesitherapie en actieve revalidatie in Hasselt, afgestemd op jouw klacht en jouw doel.",
            seoTitleEn: "Physiotherapy Hasselt | Movenda",
            seoDescriptionEn: "Specialised physiotherapy and active rehabilitation in Hasselt, matched to your complaint and your goal.",
            fotoAlt: "Manuele therapie behandeling bij Movenda",
          }
        : {};

  const pickMeta = <K extends keyof PaginaSeed>(field: K): PaginaSeed[K] | undefined => {
    const value = pick(field);
    const previous = previousMeta[field as string];
    if (typeof value === "string" && previous && value.trim() === previous) return seed[field];
    return value;
  };

  return {
    key,
    ondertitel: pick("ondertitel"),
    ondertitelEn: pick("ondertitelEn"),
    titel: pick("titel") || "",
    titelEn: pick("titelEn"),
    intro: pick("intro"),
    introEn: pick("introEn"),
    olympiaKaartTitel: pick("olympiaKaartTitel"),
    olympiaKaartTitelEn: pick("olympiaKaartTitelEn"),
    olympiaKaartTekst: pick("olympiaKaartTekst"),
    olympiaKaartTekstEn: pick("olympiaKaartTekstEn"),
    olympiaKaartCta: pick("olympiaKaartCta"),
    olympiaKaartCtaEn: pick("olympiaKaartCtaEn"),
    mpcKaartTitel: pick("mpcKaartTitel"),
    mpcKaartTitelEn: pick("mpcKaartTitelEn"),
    mpcKaartTekst: pick("mpcKaartTekst"),
    mpcKaartTekstEn: pick("mpcKaartTekstEn"),
    mpcKaartCta: pick("mpcKaartCta"),
    mpcKaartCtaEn: pick("mpcKaartCtaEn"),
    teamBlokTitel: pick("teamBlokTitel"),
    teamBlokTitelEn: pick("teamBlokTitelEn"),
    teamBlokTekst: pick("teamBlokTekst"),
    teamBlokTekstEn: pick("teamBlokTekstEn"),
    teamBlokCta: pick("teamBlokCta"),
    teamBlokCtaEn: pick("teamBlokCtaEn"),
    foto: row?.foto || undefined,
    fotoHotspot: row?.foto && row.fotoHotspot ? row.fotoHotspot : undefined,
    fotoAlt: pickMeta("fotoAlt"),
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
    slogan: pick("slogan"),
    sloganEn: pick("sloganEn"),
    introKop: pick("introKop"),
    introKopEn: pick("introKopEn"),
    afsluiter: pick("afsluiter"),
    afsluiterEn: pick("afsluiterEn"),
    extraTekst: pick("extraTekst"),
    extraTekstEn: pick("extraTekstEn"),
    prijsNotitie: pick("prijsNotitie"),
    prijsNotitieEn: pick("prijsNotitieEn"),
    formulierIntro: pick("formulierIntro"),
    formulierIntroEn: pick("formulierIntroEn"),
    terugbetalingTitel: pick("terugbetalingTitel"),
    terugbetalingTitelEn: pick("terugbetalingTitelEn"),
    terugbetalingTekst: pick("terugbetalingTekst"),
    terugbetalingTekstEn: pick("terugbetalingTekstEn"),
    perTherapeutTitel: pick("perTherapeutTitel"),
    perTherapeutTitelEn: pick("perTherapeutTitelEn"),
    perTherapeutTekst: pick("perTherapeutTekst"),
    perTherapeutTekstEn: pick("perTherapeutTekstEn"),
    belLabel: pick("belLabel"),
    belLabelEn: pick("belLabelEn"),
    contactLabel: pick("contactLabel"),
    contactLabelEn: pick("contactLabelEn"),
    knopLabel: pick("knopLabel"),
    knopLabelEn: pick("knopLabelEn"),
    knopUrl: (() => {
      const url = pick("knopUrl");
      return typeof url === "string" ? rewriteKineOverzichtHref(url) : url;
    })(),
    aanbodTitel: pick("aanbodTitel"),
    aanbodTitelEn: pick("aanbodTitelEn"),
    bijgewerkt: pick("bijgewerkt"),
    bijgewerktEn: pick("bijgewerktEn"),
    cookiesKolomNaam: pick("cookiesKolomNaam"),
    cookiesKolomNaamEn: pick("cookiesKolomNaamEn"),
    cookiesKolomDoel: pick("cookiesKolomDoel"),
    cookiesKolomDoelEn: pick("cookiesKolomDoelEn"),
    cookiesKolomTermijn: pick("cookiesKolomTermijn"),
    cookiesKolomTermijnEn: pick("cookiesKolomTermijnEn"),
    cookiesKolomToestemming: pick("cookiesKolomToestemming"),
    cookiesKolomToestemmingEn: pick("cookiesKolomToestemmingEn"),
    cookies: mergeCookies(row?.cookies, seed.cookies),
    wieTitel: pick("wieTitel"),
    wieTitelEn: pick("wieTitelEn"),
    annulatieTitel: pick("annulatieTitel"),
    annulatieTitelEn: pick("annulatieTitelEn"),
    privacyZin: pick("privacyZin"),
    privacyZinEn: pick("privacyZinEn"),
    formulier: mergeTekstMap(row?.formulier, seed.formulier),
    verwijsopties: withSeedVerwijsopties(
      normalizeVerwijsopties(row?.verwijsopties?.length ? row.verwijsopties : seed.verwijsopties),
      seed.verwijsopties,
    ),
    seoTitle: pickMeta("seoTitle"),
    seoDescription: pickMeta("seoDescription"),
    seoTitleEn: pickMeta("seoTitleEn"),
    seoDescriptionEn: pickMeta("seoDescriptionEn"),
  };
}

type PaginaTekstVeld =
  | "ondertitel"
  | "titel"
  | "intro"
  | "olympiaKaartTitel"
  | "olympiaKaartTekst"
  | "olympiaKaartCta"
  | "mpcKaartTitel"
  | "mpcKaartTekst"
  | "mpcKaartCta"
  | "teamBlokTitel"
  | "teamBlokTekst"
  | "teamBlokCta"
  | "stappenTitel"
  | "stappenIntro"
  | "legeTekst"
  | "ctaTekst"
  | "slogan"
  | "introKop"
  | "afsluiter"
  | "extraTekst"
  | "prijsNotitie"
  | "formulierIntro"
  | "terugbetalingTitel"
  | "terugbetalingTekst"
  | "perTherapeutTitel"
  | "perTherapeutTekst"
  | "belLabel"
  | "contactLabel"
  | "bijgewerkt"
  | "cookiesKolomNaam"
  | "cookiesKolomDoel"
  | "cookiesKolomTermijn"
  | "cookiesKolomToestemming"
  | "wieTitel"
  | "annulatieTitel"
  | "privacyZin"
  | "knopLabel"
  | "aanbodTitel"
  | "seoTitle"
  | "seoDescription";

/** A sentence from the page's own form copy. Empty English falls back to Dutch. */
export function formulierTekst(p: Pagina, key: string, lang: Lang = "nl"): string {
  const nl = p.formulier?.[key] || "";
  if (lang !== "en") return nl;
  const en = p.formulier?.[`${key}En`];
  return en?.trim() || nl;
}

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
  return paginaParagrafen(p, "intro", lang, vars);
}

/** Any text field as paragraphs (blank line = new paragraph), with {placeholders} filled from `vars`. */
export function paginaParagrafen(
  p: Pagina,
  field: PaginaTekstVeld,
  lang: Lang = "nl",
  vars: Record<string, string | number> = {},
): string[] {
  return paginaTekst(p, field, lang)
    .split(/\n\s*\n/)
    .map((s) => s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)).trim())
    .filter(Boolean);
}

/** Block text as paragraphs and bullet lists: a line starting with "- " is a list item. */
export function tekstChunks(tekst: string): { kind: "p" | "ul"; lines: string[] }[] {
  const out: { kind: "p" | "ul"; lines: string[] }[] = [];
  for (const raw of tekst.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const bullet = line.startsWith("- ") ? line.slice(2) : "";
    const last = out[out.length - 1];
    if (bullet && last?.kind === "ul") last.lines.push(bullet);
    else if (bullet) out.push({ kind: "ul", lines: [bullet] });
    else out.push({ kind: "p", lines: [line] });
  }
  return out;
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
      antwoord: rewriteKineOverzichtHref(faq.antwoord),
      antwoordEn: (faq.antwoordEn || fromSeed?.antwoordEn)
        ? rewriteKineOverzichtHref(faq.antwoordEn || fromSeed?.antwoordEn || "")
        : undefined,
    };
  });
}

export async function getPrijzen(): Promise<Prijsitem[]> {
  return once("prijzen", async () => {
    const [rows, exBtwMpc] = await Promise.all([
      sanity.fetch(`*[_type == "prijsitem"] | order(volgorde asc) ${prijsitemProjection}`) as Promise<Prijsitem[]>,
      sanity.fetch(`*[_id == "siteSettings"][0].prijzenInfo.exBtwMpc`) as Promise<boolean | undefined>,
    ]);
    const items = (rows || []).map((row) => ({ ...row, exclBtw: prijsIsExclBtw(row, exBtwMpc) }));
    const hidden = (await getDiensten())
      .filter((dienst) => dienst.toonInMenu === false)
      .flatMap((dienst) => [dienst.titel, dienst.titelEn].filter((naam): naam is string => !!naam))
      .map(normalizeNaam);
    return items.filter((item) => {
      const names = [normalizeNaam(item.naam), item.naamEn ? normalizeNaam(item.naamEn) : ""];
      return !hidden.some(
        (naam) => naam && names.some((pn) => pn === naam || (pn.startsWith(`${naam} `) && /^\d/.test(pn.slice(naam.length + 1)))),
      );
    });
  });
}

const prijsCategorieVoorDienst: Record<DienstCategorie, PrijsCategorie[]> = {
  kine: ["kine"],
  training: ["training", "screening"],
  "mpc-training": ["training", "screening"],
  "mpc-rehab": ["kine"],
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
  const live = (rows || []).filter((partner) => !hidden.test(partner.naam) && !hidden.test(partner.slug));
  const names = new Set(live.map((partner) => partner.naam.toLowerCase()));
  const extra = (seedPartners as Partner[]).filter(
    (partner) => partner.actief !== false && !names.has(partner.naam.toLowerCase()) && !hidden.test(partner.naam),
  );
  return [...live, ...extra];
}

export async function getLesrooster(): Promise<LesroosterItem[]> {
  return once("lesrooster", () => sanity.fetch(
    `*[_type == "lesrooster" && zichtbaar != false] | order(van asc) {
      les, lesEn, dag, van, tot,
      "coachNaam": coach->voornaam,
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
  fotoHotspot?: { x: number; y: number };
  /** Sanity CDN URL of an uploaded mp4/webm. Plays on the events page. */
  video?: string;
  tekst?: string;
  tekstEn?: string;
  /** "Meer info" target: an actiepagina (/ddh-ready) or an external URL. */
  link?: string;
  linkLabel?: string;
  tonenOpHome: boolean;
}

const PLACEHOLDER_EVENT: SiteEvent = {
  slug: "dwars-door-hasselt",
  titel: "Dwars door Hasselt",
  titelEn: "Dwars door Hasselt",
  datum: "2026-10-11",
  locatie: "Hasselt",
  tekst: "We zijn erbij.",
  tekstEn: "We'll be there.",
  tonenOpHome: true,
};

/** Where the title and date open: the event's own info link, or its page. */
export function eventInfoHref(event: SiteEvent, lang: Lang = "nl"): string {
  const link = event.link?.trim();
  if (link) {
    if (/^https?:/i.test(link)) return link;
    return withLang(link.startsWith("/") ? link : `/${link}`, lang);
  }
  return withLang(`/events/${event.slug}`, lang);
}

export async function getEvents(): Promise<SiteEvent[]> {
  return once("events", async () => {
    const rows = await sanity.fetch(
      `*[_type == "event" && actief != false] | order(datum desc) {
        "slug": slug.current, titel, titelEn, datum, locatie, tekst, tekstEn, link, linkLabel, tonenOpHome,
        "foto": foto.asset->url,
        "fotoHotspot": foto.hotspot{ x, y },
        "video": video.asset->url
      }`,
    );
    const live = (rows || []).filter((row: SiteEvent) => row.slug && row.titel && row.datum);
    return live.length > 0 ? live : [PLACEHOLDER_EVENT];
  });
}

export interface ActieItem {
  label?: string;
  labelEn?: string;
  kop: string;
  kopEn?: string;
  tekst?: string;
  tekstEn?: string;
  video?: string;
}

export interface ActieSectie {
  kicker?: string;
  kickerEn?: string;
  titel?: string;
  titelEn?: string;
  tekst?: string;
  tekstEn?: string;
  items: ActieItem[];
  kaderTitel?: string;
  kaderTitelEn?: string;
  kaderTekst?: string;
  kaderTekstEn?: string;
  foto?: CmsFoto;
  knopLabel?: string;
  knopLabelEn?: string;
  knopUrl?: string;
  knop2Label?: string;
  knop2LabelEn?: string;
  knop2Url?: string;
}

/** Campaign / event landing page at /<slug> (Dwars door Hasselt Ready, Recovery). */
export interface Actiepagina {
  slug: string;
  titel: string;
  titelEn?: string;
  kicker?: string;
  kickerEn?: string;
  slogan?: string;
  sloganEn?: string;
  intro?: string;
  introEn?: string;
  datumRegel?: string;
  datumRegelEn?: string;
  foto?: CmsFoto;
  logo?: string;
  logoNaam?: string;
  logoUrl?: string;
  secties: ActieSectie[];
  galerij: CmsFoto[];
  afsluiter?: string;
  afsluiterEn?: string;
  zichtbaarInGoogle: boolean;
  seoTitle?: string;
  seoTitleEn?: string;
  seoDescription?: string;
  seoDescriptionEn?: string;
}

/** A section is shown once Julie gave it more than a heading. */
export function actieSectieGevuld(s: ActieSectie): boolean {
  return Boolean(
    s.tekst?.trim() || s.items.length || s.kaderTekst?.trim() || s.foto || (s.knopLabel && s.knopUrl) || (s.knop2Label && s.knop2Url),
  );
}

function actieTekst(nl: string | undefined, en: string | undefined, lang: Lang): string | undefined {
  if (lang !== "en") return nl;
  return en?.trim() ? en : nl;
}

/** English campaign copy when Julie filled the EN fields; otherwise the Dutch text. */
export function localizeActie(pagina: Actiepagina, lang: Lang): Actiepagina {
  if (lang !== "en") return pagina;
  return {
    ...pagina,
    titel: actieTekst(pagina.titel, pagina.titelEn, lang) || pagina.titel,
    kicker: actieTekst(pagina.kicker, pagina.kickerEn, lang),
    slogan: actieTekst(pagina.slogan, pagina.sloganEn, lang),
    intro: actieTekst(pagina.intro, pagina.introEn, lang),
    datumRegel: actieTekst(pagina.datumRegel, pagina.datumRegelEn, lang),
    afsluiter: actieTekst(pagina.afsluiter, pagina.afsluiterEn, lang),
    seoTitle: actieTekst(pagina.seoTitle, pagina.seoTitleEn, lang),
    seoDescription: actieTekst(pagina.seoDescription, pagina.seoDescriptionEn, lang),
    secties: pagina.secties.map((s) => ({
      ...s,
      kicker: actieTekst(s.kicker, s.kickerEn, lang),
      titel: actieTekst(s.titel, s.titelEn, lang),
      tekst: actieTekst(s.tekst, s.tekstEn, lang),
      kaderTitel: actieTekst(s.kaderTitel, s.kaderTitelEn, lang),
      kaderTekst: actieTekst(s.kaderTekst, s.kaderTekstEn, lang),
      knopLabel: actieTekst(s.knopLabel, s.knopLabelEn, lang),
      knop2Label: actieTekst(s.knop2Label, s.knop2LabelEn, lang),
      items: s.items.map((item) => ({
        ...item,
        label: actieTekst(item.label, item.labelEn, lang),
        kop: actieTekst(item.kop, item.kopEn, lang) || item.kop,
        tekst: actieTekst(item.tekst, item.tekstEn, lang),
      })),
    })),
  };
}

export async function getActiepaginas(): Promise<Actiepagina[]> {
  return once("actiepaginas", async () => {
    const rows = await sanity.fetch(
      `*[_type == "actiepagina" && defined(slug.current) && !(_id in path("drafts.**"))] {
        "slug": slug.current, titel, titelEn, kicker, kickerEn, slogan, sloganEn, intro, introEn, datumRegel, datumRegelEn,
        "foto": foto${CMS_FOTO_PROJECTION},
        "logo": logo.asset->url, logoNaam, logoUrl,
        secties[]{ kicker, kickerEn, titel, titelEn, tekst, tekstEn, items[]{ label, labelEn, kop, kopEn, tekst, tekstEn, video }, kaderTitel, kaderTitelEn, kaderTekst, kaderTekstEn,
          "foto": foto${CMS_FOTO_PROJECTION}, knopLabel, knopLabelEn, knopUrl, knop2Label, knop2LabelEn, knop2Url },
        "galerij": galerij[]${CMS_FOTO_PROJECTION},
        afsluiter, afsluiterEn, zichtbaarInGoogle, seoTitle, seoTitleEn, seoDescription, seoDescriptionEn
      }`,
    );
    return (rows || [])
      .filter((row: { slug?: string; titel?: string }) => row.slug && row.titel)
      .map((row: Actiepagina & { foto?: unknown; secties?: (ActieSectie & { foto?: unknown })[] | null; galerij?: unknown[] | null }) => ({
        ...row,
        foto: toCmsFoto(row.foto as Parameters<typeof toCmsFoto>[0]),
        secties: (row.secties || []).map((s) => ({
          ...s,
          items: (s.items || []).filter((i) => i?.kop),
          foto: toCmsFoto(s.foto as Parameters<typeof toCmsFoto>[0]),
        })),
        galerij: (row.galerij || []).map((f) => toCmsFoto(f as Parameters<typeof toCmsFoto>[0])).filter((f): f is CmsFoto => Boolean(f)),
        zichtbaarInGoogle: row.zichtbaarInGoogle !== false,
      }));
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
      `*[_type == "vacature" && actief == true] { "slug": slug.current, titel, titelEn, "locatieNaam": locatie->naam, omschrijving, omschrijvingEn, contactEmail, actief }`,
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
  if (toonOp === "mpc") {
    return path.includes("/performance") || path.includes("/groepslessen") || path.includes("/mpc");
  }
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
      knopTekst, knopTekstEn, actie, knopUrl, mailAdres, mailOnderwerp,
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

