// Data-access layer for all site content — now backed by the live Sanity
// dataset (project k73l2by8 / production). Pages and components must
// always import from this file, never query Sanity directly: this is the
// one place that changes if the schema evolves, and it's what keeps Julie
// able to edit records in the Studio without anyone touching this repo.
//
// The local JSON in web/src/content/*.json is no longer read at runtime —
// it now only serves as the source for studio/scripts/seed.mjs (the
// one-off script that populated the real Sanity data from the old
// movenda.be / mpc.movenda.be copy).

import { sanity } from "./sanity";

export type LocatieSlug = "olympia" | "mpc";

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
}

export interface Dienst {
  slug: string;
  categorie: "kine" | "training" | "mpc";
  titel: string;
  titelEn?: string;
  intro: string;
  body: string;
  bodyEn?: string;
  seoTitle: string;
  seoDescription: string;
  gekoppeldeTeamleden: string[];
}

export interface GoogleReviews {
  rating: number;
  count: string;
  reviewUrl: string;
  writeReviewUrl: string;
  note?: string;
}

export interface PrijzenInfo {
  basishonorarium?: number;
  intro?: string;
  terugbetalingStandaard?: string;
  terugbetalingVt?: string;
  voorwaarden?: string;
}

export interface SiteSettings {
  siteNaam: string;
  tagline: string;
  telefoonOlympia: string;
  telefoonMpc: string;
  email: string;
  booking: { enabled: boolean; url: string; label: string };
  googleReviews: Record<LocatieSlug, GoogleReviews>;
  analytics: { enabled: boolean; ga4Id: string };
  socials: { instagram: string; facebook: string; linkedin: string };
  prijzenInfo: PrijzenInfo;
}

export interface Faq {
  vraag: string;
  vraagEn?: string;
  antwoord: string;
  antwoordEn?: string;
  categorie?: string;
  volgorde: number;
}

export interface Prijsitem {
  naam: string;
  categorie: "kine" | "training";
  bedrag: number;
  eenheid?: string;
  vanaf: boolean;
  opAanvraag: boolean;
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

const teamlidProjection = `{
  "slug": slug.current,
  voornaam, naam, rol, rolEn, locaties, specialisaties, email, bio, bioEn,
  volgorde, actief,
  "foto": foto.asset->url
}`;

const locatieProjection = `{
  "slug": slug.current,
  naam, brand, type, adres,
  "geo": { "lat": geo.lat, "lng": geo.lng },
  telefoon, email, uren, urenNote, btw, iban, bic, mapsUrl
}`;

const dienstProjection = `{
  "slug": slug.current,
  categorie, titel, titelEn, intro, body, bodyEn, seoTitle, seoDescription,
  "gekoppeldeTeamleden": gekoppeldeTeamleden[]->slug.current
}`;

export async function getTeamleden(): Promise<Teamlid[]> {
  return sanity.fetch(
    `*[_type == "teamlid" && actief == true] | order(volgorde asc) ${teamlidProjection}`,
  );
}

export async function getTeamlidBySlug(slug: string): Promise<Teamlid | undefined> {
  return sanity.fetch(
    `*[_type == "teamlid" && slug.current == $slug][0] ${teamlidProjection}`,
    { slug },
  );
}

export async function getTeamledenByLocatie(locatie: LocatieSlug): Promise<Teamlid[]> {
  const team = await getTeamleden();
  return team.filter((t) => t.locaties.includes(locatie));
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
  return sanity.fetch(`*[_type == "dienst"] ${dienstProjection}`);
}

export async function getDienstenByCategorie(categorie: Dienst["categorie"]): Promise<Dienst[]> {
  return sanity.fetch(`*[_type == "dienst" && categorie == $categorie] ${dienstProjection}`, {
    categorie,
  });
}

export async function getDienstBySlug(slug: string): Promise<Dienst | undefined> {
  return sanity.fetch(`*[_type == "dienst" && slug.current == $slug][0] ${dienstProjection}`, {
    slug,
  });
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const settings = await sanity.fetch(
    `*[_id == "siteSettings"][0]{ siteNaam, tagline, email, socials, booking, googleReviews, analytics, prijzenInfo }`,
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
    analytics: settings?.analytics || { enabled: false, ga4Id: "" },
    socials: settings?.socials || { instagram: "", facebook: "", linkedin: "" },
    prijzenInfo: settings?.prijzenInfo || {},
  };
}

export async function getFaqs(): Promise<Faq[]> {
  return sanity.fetch(
    `*[_type == "faq"] | order(volgorde asc) { vraag, vraagEn, antwoord, antwoordEn, categorie, volgorde }`,
  );
}

export async function getPrijzen(): Promise<Prijsitem[]> {
  return sanity.fetch(
    `*[_type == "prijsitem"] | order(volgorde asc) { naam, categorie, bedrag, eenheid, vanaf, opAanvraag, volgorde }`,
  );
}

export async function getPrijzenByCategorie(categorie: Prijsitem["categorie"]): Promise<Prijsitem[]> {
  const prijzen = await getPrijzen();
  return prijzen.filter((p) => p.categorie === categorie);
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
