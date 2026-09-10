// Data-access layer for all site content.
//
// IMPORTANT: pages and components must always import from this file,
// never from ../content/*.json directly. Today this reads local JSON
// (real copy pulled from the live movenda.be / mpc.movenda.be sites for
// the pitch preview). Once Sanity is live, only the bodies of these
// functions change to GROQ queries against @sanity/client — the shapes
// below already match the planned Sanity schemas 1:1, and no page or
// component needs to change. This is what keeps Julie able to edit
// records without touching this repo.

import teamJson from "../content/team.json";
import locatiesJson from "../content/locaties.json";
import dienstenJson from "../content/diensten.json";
import siteSettingsJson from "../content/site-settings.json";

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

export function getTeamleden(): Teamlid[] {
  return (teamJson as Teamlid[])
    .filter((t) => t.actief)
    .sort((a, b) => a.volgorde - b.volgorde);
}

export function getTeamlidBySlug(slug: string): Teamlid | undefined {
  return getTeamleden().find((t) => t.slug === slug);
}

export function getTeamledenByLocatie(locatie: LocatieSlug): Teamlid[] {
  return getTeamleden().filter((t) => t.locaties.includes(locatie));
}

export function getLocaties(): Locatie[] {
  return locatiesJson as Locatie[];
}

export function getLocatieBySlug(slug: LocatieSlug): Locatie | undefined {
  return getLocaties().find((l) => l.slug === slug);
}

export function getDiensten(): Dienst[] {
  return dienstenJson as Dienst[];
}

export function getDienstenByCategorie(categorie: Dienst["categorie"]): Dienst[] {
  return getDiensten().filter((d) => d.categorie === categorie);
}

export function getDienstBySlug(slug: string): Dienst | undefined {
  return getDiensten().find((d) => d.slug === slug);
}

export function getSiteSettings(): SiteSettings {
  return siteSettingsJson as SiteSettings;
}
