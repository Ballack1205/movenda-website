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
    prijzenInfo: settings.prijzenInfo,
  });
  console.log("Seeded site-instellingen.");
}

async function seedFaqs() {
  const faqs = readJson("faqs.json");
  for (const faq of faqs) {
    await client.createOrReplace({
      _id: `faq-${slugify(faq.vraag)}`,
      _type: "faq",
      vraag: faq.vraag,
      antwoord: faq.antwoord,
      categorie: faq.categorie,
      volgorde: faq.volgorde,
    });
  }
  console.log(`Seeded ${faqs.length} FAQ's.`);
}

async function seedPrijzen() {
  const prijzen = readJson("prijzen.json");
  for (const item of prijzen) {
    await client.createOrReplace({
      _id: `prijsitem-${item.categorie}-${slugify(item.naam)}`,
      _type: "prijsitem",
      naam: item.naam,
      categorie: item.categorie,
      bedrag: item.bedrag,
      eenheid: item.eenheid || undefined,
      vanaf: item.vanaf,
      opAanvraag: item.opAanvraag,
      volgorde: item.volgorde,
    });
  }
  console.log(`Seeded ${prijzen.length} prijzen.`);
}

// Converts the simplified { type, text/items } shape in blog.json into real
// Sanity Portable Text blocks (what the "body" field of blogPost expects).
function toPortableText(sections) {
  return sections.flatMap((section, i) => {
    if (section.type === "ul") {
      return section.items.map((item, j) => ({
        _type: "block",
        _key: `l${i}-${j}`,
        style: "normal",
        listItem: "bullet",
        level: 1,
        children: [{ _type: "span", _key: `l${i}-${j}-s`, text: item }],
      }));
    }
    const style = section.type === "h3" ? "h3" : "normal";
    return [
      {
        _type: "block",
        _key: `b${i}`,
        style,
        children: [{ _type: "span", _key: `b${i}-s`, text: section.text }],
      },
    ];
  });
}

async function seedBlogPosts() {
  const posts = readJson("blog.json");
  for (const post of posts) {
    await client.createOrReplace({
      _id: `blogPost-${post.slug}`,
      _type: "blogPost",
      titel: post.titel,
      slug: { _type: "slug", current: post.slug },
      excerpt: post.excerpt,
      body: toPortableText(post.body),
      auteur: post.auteurSlug
        ? { _type: "reference", _ref: `teamlid-${post.auteurSlug}` }
        : undefined,
      publicatiedatum: post.publicatiedatum,
      tags: post.tags,
      seoTitle: post.seoTitle,
    });
  }
  console.log(`Seeded ${posts.length} blogposts.`);
}

await seedTeam();
await seedLocaties();
await seedDiensten();
await seedSiteSettings();
await seedFaqs();
await seedPrijzen();
await seedBlogPosts();
console.log("Done. Open https://movenda.sanity.studio to see the data.");
