// One-off seed script: pushes pitch-preview content (real copy from
// movenda.be / mpc.movenda.be) into the Sanity dataset.
//
// Usage:
//   SANITY_WRITE_TOKEN=... node scripts/seed.mjs
//
// Safe to re-run: createOrReplace with deterministic _id's.
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
  return String(input)
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
      tariefKine: lid.tariefKine,
      tariefPt: lid.tariefPt,
      tariefPtMpc: lid.tariefPtMpc,
      tariefPerformance: lid.tariefPerformance,
      clubs: (lid.clubs || []).map((c) => ({
        _type: "club",
        _key: slugify(c.naam),
        naam: c.naam,
        url: c.url,
      })),
      klachten: lid.klachten || [],
      regio: lid.regio || [],
      sporten: lid.sporten || [],
      doelgroepen: lid.doelgroepen || [],
      ...(lid.fotoAssetId
        ? { foto: { _type: "image", asset: { _type: "reference", _ref: lid.fotoAssetId } } }
        : {}),
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
      routebeschrijving: loc.routebeschrijving,
      rpr: loc.rpr,
      instagram: loc.instagram,
      facebook: loc.facebook,
      verdiepingNote: loc.verdiepingNote,
    });
  }
  console.log(`Seeded ${locaties.length} locaties.`);
}

async function seedDiensten() {
  const diensten = readJson("diensten.json");
  for (const dienst of diensten) {
    const id = `dienst-${dienst.categorie}-${dienst.slug}`;
    const existing = await client.getDocument(id).catch(() => null);
    await client.createOrReplace({
      _id: id,
      _type: "dienst",
      titel: dienst.titel,
      titelEn: dienst.titelEn,
      slug: { _type: "slug", current: dienst.slug },
      categorie: dienst.categorie,
      intro: dienst.intro,
      slogan: dienst.slogan || undefined,
      body: dienst.body,
      bodyEn: dienst.bodyEn,
      ctaLabel: dienst.ctaLabel,
      ctaUrl: dienst.ctaUrl,
      volgorde: dienst.volgorde,
      seoTitle: dienst.seoTitle,
      seoDescription: dienst.seoDescription,
      gekoppeldeTeamleden: (dienst.gekoppeldeTeamleden || []).map((slug) => ({
        _type: "reference",
        _ref: `teamlid-${slug}`,
        _key: slugify(slug),
      })),
      ...(existing?.afbeelding ? { afbeelding: existing.afbeelding } : {}),
      ...(existing?.galerij ? { galerij: existing.galerij } : {}),
    });
  }
  console.log(`Seeded ${diensten.length} diensten.`);
}

async function seedSiteSettings() {
  const settings = readJson("site-settings.json");
  const { googleReviews, prijzenInfo, slogans, nieuwsbrief, partnerband, homePijlers, ...rest } =
    settings;
  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    siteNaam: rest.siteNaam,
    tagline: rest.tagline,
    email: rest.email,
    socials: rest.socials,
    booking: rest.booking,
    googleReviews: {
      olympia: {
        rating: googleReviews.olympia.rating,
        count: googleReviews.olympia.count,
        reviewUrl: googleReviews.olympia.reviewUrl,
        writeReviewUrl: googleReviews.olympia.writeReviewUrl,
      },
      mpc: {
        rating: googleReviews.mpc.rating,
        count: googleReviews.mpc.count,
        reviewUrl: googleReviews.mpc.reviewUrl,
        writeReviewUrl: googleReviews.mpc.writeReviewUrl,
      },
    },
    analytics: rest.analytics,
    prijzenInfo: {
      ...prijzenInfo,
      nomenclatuur: (prijzenInfo.nomenclatuur || []).map((n, i) => ({
        _type: "nomenItem",
        _key: `n${i}`,
        ...n,
      })),
    },
    slogans,
    nieuwsbrief,
    partnerband,
    homePijlers,
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
      vraagEn: faq.vraagEn,
      antwoord: faq.antwoord,
      antwoordEn: faq.antwoordEn,
      categorie: faq.categorie,
      site: faq.site || "movenda",
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
      notitie: item.notitie,
      volgorde: item.volgorde,
    });
  }
  console.log(`Seeded ${prijzen.length} prijzen.`);
}

async function seedPartners() {
  const partners = readJson("partners.json");
  for (const p of partners) {
    const id = `partner-${p.slug}`;
    const existing = await client.getDocument(id).catch(() => null);
    await client.createOrReplace({
      _id: id,
      _type: "partner",
      naam: p.naam,
      url: p.url,
      type: p.type,
      tonenOp: p.tonenOp,
      volgorde: p.volgorde,
      // Keep what Julie set in the Studio: an uploaded logo and a partner she
      // hid are hers, not the seed file's.
      actief: existing?.actief !== false,
      ...(existing?.logo ? { logo: existing.logo } : {}),
    });
  }
  console.log(`Seeded ${partners.length} partners.`);
}

async function seedLesrooster() {
  const rows = readJson("lesrooster.json");
  for (const row of rows) {
    await client.createOrReplace({
      _id: `lesrooster-${slugify(row.dag)}-${slugify(row.les)}-${slugify(row.van)}`,
      _type: "lesrooster",
      les: row.les,
      dag: row.dag,
      van: row.van,
      tot: row.tot,
      volgorde: row.volgorde,
      ...(row.coachSlug
        ? { coach: { _type: "reference", _ref: `teamlid-${row.coachSlug}` } }
        : {}),
      ...(row.dienstSlug
        ? {
            dienst: {
              _type: "reference",
              _ref: `dienst-${row.dienstCategorie}-${row.dienstSlug}`,
            },
          }
        : {}),
    });
  }
  console.log(`Seeded ${rows.length} lesrooster-rijen.`);
}

async function seedGetuigenissen() {
  const items = readJson("getuigenissen.json");
  for (const g of items) {
    const id = `getuigenis-${g.slug}`;
    const existing = await client.getDocument(id).catch(() => null);
    await client.createOrReplace({
      _id: id,
      _type: "getuigenis",
      tekst: g.tekst,
      naam: g.naam,
      rol: g.rol,
      locatie: g.locatie,
      volgorde: g.volgorde,
      slug: { _type: "slug", current: g.slug },
      actief: existing?.actief !== false,
      ...(existing?.foto ? { foto: existing.foto } : {}),
    });
  }
  console.log(`Seeded ${items.length} getuigenissen.`);
}

async function seedSportaanbod() {
  const items = readJson("sportaanbod.json");
  for (const item of items) {
    await client.createOrReplace({
      _id: `sportaanbod-${slugify(item.naam)}`,
      _type: "sportaanbodItem",
      naam: item.naam,
      tekst: item.tekst,
      link: item.link,
      volgorde: item.volgorde,
    });
  }
  console.log(`Seeded ${items.length} sportaanbod-items.`);
}

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
await seedPartners();
await seedLesrooster();
await seedGetuigenissen();
await seedSportaanbod();
await seedBlogPosts();
console.log("Done. Open https://movenda.sanity.studio to see the data.");
