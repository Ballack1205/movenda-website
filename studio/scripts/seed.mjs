// One-off seed script: pushes the pitch-preview content (real copy pulled
// from movenda.be / mpc.movenda.be) into the actual Sanity dataset, so the
// "add a teammate" demo for Julie starts from real data instead of an
// empty project.
//
// Usage:
//   SANITY_WRITE_TOKEN=... node scripts/seed.mjs
//
// Safe to re-run: uses createOrReplace with deterministic _id's, so
// running it twice just overwrites the same seeded documents (it will
// NOT touch documents Julie has created by hand with auto-generated ids).
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, "../../web/src/content");

const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {
  console.error("Missing SANITY_WRITE_TOKEN env var. Aborting.");
  process.exit(1);
}

const client = createClient({
  projectId: "k73l2by8",
  dataset: "production",
  apiVersion: "2026-01-01",
  token,
  useCdn: false,
});

function readJson(name) {
  return JSON.parse(readFileSync(path.join(contentDir, name), "utf-8"));
}

function slugify(input) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function seedTeam() {
  const team = readJson("team.json");
  for (const lid of team) {
    await client.createOrReplace({
      _id: `teamlid-${lid.slug}`,
      _type: "teamlid",
      voornaam: lid.voornaam,
      naam: lid.naam,
      slug: { _type: "slug", current: lid.slug },
      rol: lid.rol,
      rolEn: lid.rolEn,
      locaties: lid.locaties,
      specialisaties: lid.specialisaties,
      bio: lid.bio,
      email: lid.email,
      volgorde: lid.volgorde,
      actief: lid.actief,
    });
  }
  console.log(`Seeded ${team.length} teamleden.`);
}

async function seedLocaties() {
  const locaties = readJson("locaties.json");
  for (const loc of locaties) {
    await client.createOrReplace({
      _id: `locatie-${loc.slug}`,
      _type: "locatie",
      naam: loc.naam,
      slug: { _type: "slug", current: loc.slug },
      brand: loc.brand,
      type: loc.type,
      adres: loc.adres,
      geo: { _type: "geopoint", lat: loc.geo.lat, lng: loc.geo.lng },
      telefoon: loc.telefoon,
      email: loc.email,
      uren: loc.uren.map((u) => ({ _type: "openingsuur", ...u, _key: slugify(u.dag) })),
      urenNote: loc.urenNote,
      btw: loc.btw,
      iban: loc.iban,
      bic: loc.bic,
      mapsUrl: loc.mapsUrl,
    });
  }
  console.log(`Seeded ${locaties.length} locaties.`);
}

async function seedDiensten() {
  const diensten = readJson("diensten.json");
  for (const dienst of diensten) {
    await client.createOrReplace({
      _id: `dienst-${dienst.slug}`,
      _type: "dienst",
      titel: dienst.titel,
      titelEn: dienst.titelEn,
      slug: { _type: "slug", current: dienst.slug },
      categorie: dienst.categorie,
      intro: dienst.intro,
      body: dienst.body,
      seoTitle: dienst.seoTitle,
      seoDescription: dienst.seoDescription,
      gekoppeldeTeamleden: dienst.gekoppeldeTeamleden.map((slug) => ({
        _type: "reference",
        _ref: `teamlid-${slug}`,
        _key: slugify(slug),
      })),
    });
  }
  console.log(`Seeded ${diensten.length} diensten.`);
}

async function seedSiteSettings() {
  const settings = readJson("site-settings.json");
  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    siteNaam: settings.siteNaam,
    tagline: settings.tagline,
    email: settings.email,
    booking: settings.booking,
    googleReviews: settings.googleReviews,
    analytics: settings.analytics,
  });
  console.log("Seeded site-instellingen.");
}

await seedTeam();
await seedLocaties();
await seedDiensten();
await seedSiteSettings();
console.log("Done. Open https://movenda.sanity.studio to see the data.");
