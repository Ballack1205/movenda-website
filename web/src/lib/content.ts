// Data-access layer for all site content — backed by the live Sanity
// dataset (project k73l2by8 / production). Pages and components must
// always import from this file, never query Sanity directly.

import { sanity } from "./sanity";

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
  klachten: string[];
  regio: string[];
  sporten: string[];
  doelgroepen: string[];
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
  routebeschrijving?: string;
  rpr?: string;
  instagram?: string;
  facebook?: string;
  verdiepingNote?: string;
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
  gekoppeldeTeamleden: string[];
  afbeelding?: string;
  galerij: string[];
  volgorde: number;
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

export interface SiteSettings {
  siteNaam: string;
  tagline: string;
  telefoonOlympia: string;
  telefoonMpc: string;
  email: string;
  booking: { enabled: boolean; url: string; label: string };
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
  partnerband: PartnerbandSettings;
}

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
  locatie?: string;
  volgorde: number;
}

export interface BlogPost {
  slug: string;
  titel: string;
  titelEn?: string;
  excerpt?: string;
  cover?: string;
  body: unknown[];
  bodyEn?: unknown[];
  auteurNaam?: string;
  publicatiedatum: string;
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
  clubs, klachten, regio, sporten, doelgroepen
}`;

const locatieProjection = `{
  "slug": slug.current,
  naam, brand, type, adres,
  "geo": { "lat": geo.lat, "lng": geo.lng },
  telefoon, email, uren, urenNote, btw, iban, bic, mapsUrl,
  routebeschrijving, rpr, instagram, facebook, verdiepingNote
}`;

const dienstProjection = `{
  "slug": slug.current,
  categorie, titel, titelEn, intro, slogan, body, bodyEn,
  ctaLabel, ctaUrl, seoTitle, seoDescription, volgorde,
  "gekoppeldeTeamleden": gekoppeldeTeamleden[]->slug.current,
  "afbeelding": afbeelding.asset->url,
  "galerij": galerij[].asset->url
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

function normalizeTeamlid(row: Teamlid): Teamlid {
  return {
    ...row,
    clubs: row.clubs || [],
    klachten: row.klachten || [],
    regio: row.regio || [],
    sporten: row.sporten || [],
    doelgroepen: row.doelgroepen || [],
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
    `*[_id == "siteSettings"][0]{ siteNaam, tagline, email, socials, booking, googleReviews, analytics, prijzenInfo, slogans, nieuwsbrief, partnerband }`,
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
    partnerband: {
      titel: settings?.partnerband?.titel || "Onze partners",
      titelMpc: settings?.partnerband?.titelMpc || "Corporate partners",
      snelheid: settings?.partnerband?.snelheid || "normaal",
      animatie: settings?.partnerband?.animatie !== false,
    },
  };
}

export async function getFaqs(site?: Exclude<FaqSite, "beide">): Promise<Faq[]> {
  const rows: Faq[] = await sanity.fetch(
    `*[_type == "faq"] | order(volgorde asc) { vraag, vraagEn, antwoord, antwoordEn, categorie, site, volgorde }`,
  );
  if (!site) return rows || [];
  return (rows || []).filter((faq) => !faq.site || faq.site === site || faq.site === "beide");
}

export async function getPrijzen(): Promise<Prijsitem[]> {
  return sanity.fetch(
    `*[_type == "prijsitem"] | order(volgorde asc) { naam, categorie, bedrag, eenheid, vanaf, opAanvraag, notitie, volgorde }`,
  );
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

export async function getGetuigenissen(): Promise<Getuigenis[]> {
  return sanity.fetch(
    `*[_type == "getuigenis"] | order(volgorde asc) {
      "slug": _id,
      tekst, naam, locatie, volgorde
    }`,
  );
}

const blogPostProjection = `{
  "slug": slug.current,
  titel, titelEn, excerpt,
  "cover": cover.asset->url,
  body, bodyEn,
  "auteurNaam": auteur->voornaam + " " + auteur->naam,
  publicatiedatum, tags, seoTitle, seoDescription
}`;

export async function getBlogPosts(): Promise<BlogPost[]> {
  return sanity.fetch(`*[_type == "blogPost"] | order(publicatiedatum desc) ${blogPostProjection}`);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  return sanity.fetch(
    `*[_type == "blogPost" && slug.current == $slug][0] ${blogPostProjection}`,
    { slug },
  );
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
    .find((popup) => popupMatchesPath(popup.toonOp, path));
}

export function matchSpecialisatieToDienst(tag: string, diensten: Dienst[]): Dienst | undefined {
  const needle = tag.toLowerCase();
  return diensten.find((d) => {
    const titel = d.titel.toLowerCase();
    const slug = d.slug.replace(/-/g, " ");
    return titel.includes(needle) || needle.includes(titel.replace(/ hasselt$/, "")) || slug.includes(needle);
  });
}
