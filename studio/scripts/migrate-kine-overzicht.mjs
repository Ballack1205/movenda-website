// Moves the physiotherapy overview link from /kinesitherapie to
// /movenda-kinesitherapie in published CMS copy. Treatment URLs
// (/kinesitherapie/<slug>) stay put. Also replaces the previous default
// SEO title, description and photo alt when Julie has not edited them.
//
// Does not run unless you pass a write token. Safe to re-run.
//
//   SANITY_WRITE_TOKEN=... node scripts/migrate-kine-overzicht.mjs --dry-run
//   SANITY_WRITE_TOKEN=... node scripts/migrate-kine-overzicht.mjs
import { createClient } from "@sanity/client";

const dryRun = process.argv.includes("--dry-run");
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

const TYPES = ["siteSettings", "faq", "locatie", "pagina", "dienst", "event", "actiepagina", "blogPost"];

const PREVIOUS_META = {
  home: {
    seoTitle: "Kinesitherapie, personal en performance training Hasselt | Movenda",
    seoDescription: "Sportpraktijk Movenda brengt kinesitherapie, training en performance samen.",
    seoTitleEn: "Physiotherapy, personal and performance training Hasselt | Movenda",
    seoDescriptionEn: "Sportpraktijk Movenda brings physiotherapy, training and performance together.",
  },
  kinesitherapie: {
    seoTitle: "Kinesitherapie Hasselt | Movenda",
    seoDescription: "Gespecialiseerde kinesitherapie en actieve revalidatie in Hasselt, afgestemd op jouw klacht en jouw doel.",
    seoTitleEn: "Physiotherapy Hasselt | Movenda",
    seoDescriptionEn: "Specialised physiotherapy and active rehabilitation in Hasselt, matched to your complaint and your goal.",
    fotoAlt: "Manuele therapie behandeling bij Movenda",
  },
};

const NEXT_META = {
  home: {
    seoTitle: "Kinesist Hasselt | Kinesitherapie & training | Movenda",
    seoDescription: "Kinesist in Hasselt en Kuringen: kinesitherapie, revalidatie en training, 30 min één-op-één. Maak een afspraak.",
    seoTitleEn: "Physiotherapist Hasselt | Physiotherapy & training | Movenda",
    seoDescriptionEn: "Physiotherapist in Hasselt and Kuringen: physiotherapy, rehabilitation and training, 30 minutes one-on-one. Book an appointment.",
  },
  kinesitherapie: {
    seoTitle: "Aanbod kinesitherapie | Movenda Hasselt",
    seoDescription: "Aanbod kinesitherapie bij Movenda in Hasselt: manuele therapie, oefentherapie, sportkinesitherapie en meer.",
    seoTitleEn: "Physiotherapy treatments | Movenda Hasselt",
    seoDescriptionEn: "Physiotherapy treatments at Movenda in Hasselt: manual therapy, exercise therapy, sports physiotherapy and more.",
    fotoAlt: "Kinesist in Hasselt geeft een manuele behandeling bij Movenda",
  },
};

function rewriteText(value) {
  return value.replace(
    /(https?:\/\/(?:www\.)?movenda\.be)?(\/en)?\/kinesitherapie(?!\/[a-z0-9-])\/?/gi,
    (_match, origin = "", prefix = "") => `${origin}${prefix}/movenda-kinesitherapie`,
  );
}

function rewriteNode(node) {
  if (typeof node === "string") return rewriteText(node);
  if (Array.isArray(node)) return node.map(rewriteNode);
  if (node && typeof node === "object") {
    const out = {};
    for (const [key, value] of Object.entries(node)) out[key] = rewriteNode(value);
    return out;
  }
  return node;
}

function metaPatch(doc) {
  if (doc._type !== "pagina") return {};
  const previous = PREVIOUS_META[doc.key];
  const next = NEXT_META[doc.key];
  if (!previous || !next) return {};
  const patch = {};
  for (const field of Object.keys(previous)) {
    if (typeof doc[field] === "string" && doc[field].trim() === previous[field]) patch[field] = next[field];
  }
  return patch;
}

const SKIP = new Set(["_id", "_type", "_rev", "_createdAt", "_updatedAt", "_system"]);

const docs = await client.fetch(`*[_type in $types]`, { types: TYPES });
let changed = 0;

for (const doc of docs) {
  const rewritten = rewriteNode(doc);
  const set = { ...metaPatch(doc) };
  for (const key of Object.keys(rewritten)) {
    if (SKIP.has(key)) continue;
    if (JSON.stringify(rewritten[key]) !== JSON.stringify(doc[key])) set[key] = rewritten[key];
  }
  const fields = Object.keys(set);
  if (!fields.length) continue;
  changed += 1;
  console.log(`${dryRun ? "[dry-run] " : ""}${doc._id}: ${fields.join(", ")}`);
  if (!dryRun) await client.patch(doc._id).set(set).commit();
}

console.log(`${dryRun ? "Would update" : "Updated"} ${changed} document(s).`);
