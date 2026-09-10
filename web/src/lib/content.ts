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

export interface SiteSettings {
  siteNaam: string;
  tagline: string;
  telefoonOlympia: string;
  telefoonMpc: string;
  email: string;
  booking: { enabled: boolean; url: string; label: string };
  googleReviews: Record<LocatieSlug, GoogleReviews>;
  analytics: { enabled: boolean; ga4Id: string };
  socials: { instagram: string; facebook: string };
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
  categorie, titel, titelEn, intro, body, seoTitle, seoDescription,
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
    `*[_id == "siteSettings"][0]{ siteNaam, tagline, email, booking, googleReviews, analytics }`,
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
    socials: { instagram: "", facebook: "" },
  };
}
