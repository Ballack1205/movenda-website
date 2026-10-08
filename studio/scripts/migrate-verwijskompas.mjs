// Copies the referral compass from web/src/content/verwijskompas.json into
// the verwijskompas singleton, so Julie can edit choices, colleagues and
// booking links in the Studio.
//
// Safe to re-run: createIfNotExists. If she already changed the document,
// this script leaves it alone.
//
// Usage:
//   npx sanity exec scripts/migrate-verwijskompas.mjs --with-user-token
//   SANITY_WRITE_TOKEN=... node scripts/migrate-verwijskompas.mjs
import { readFile } from "node:fs/promises";
import { createClient } from "@sanity/client";
import { getCliClient } from "sanity/cli";

const dryRun = process.argv.includes("--dry-run");

const client = process.env.SANITY_WRITE_TOKEN
  ? createClient({
      projectId: "k73l2by8",
      dataset: "production",
      apiVersion: "2026-01-01",
      token: process.env.SANITY_WRITE_TOKEN,
      useCdn: false,
    })
  : getCliClient({ apiVersion: "2026-01-01" });

const seed = JSON.parse(
  await readFile(new URL("../../web/src/content/verwijskompas.json", import.meta.url), "utf8"),
);

const team = await client.fetch(
  `*[_type == "teamlid" && !(_id in path("drafts.**"))]{ _id, "slug": slug.current }`,
);
const bySlug = new Map(team.map((lid) => [lid.slug, lid._id]));

const missing = new Set();

function collegas(keys = []) {
  return keys.map((key) => {
    const person = seed.people[key];
    if (!person) throw new Error(`Unknown compass person “${key}”`);
    const ref = bySlug.get(person.slug);
    if (!ref) {
      missing.add(person.slug);
      return null;
    }
    return { _key: key, _type: "reference", _ref: ref, _weak: true };
  }).filter(Boolean);
}

function opties(items, { withNext }) {
  return items.map((item) => {
    const vervolg = item.next === "regio" || item.next === "sport" ? item.next : "collegas";
    const doc = {
      _key: item.id,
      _type: withNext ? "verwijskompasKlacht" : "verwijskompasOptie",
      label: item.label,
    };
    if (withNext) doc.vervolg = vervolg;
    if (vervolg === "collegas") {
      const refs = collegas(item.people);
      if (refs.length) doc.collegas = refs;
      if (item.book) doc.boekUrl = item.book;
    }
    return doc;
  });
}

const document = {
  _id: "verwijskompas",
  _type: "verwijskompas",
  klachten: opties(seed.contexts, { withNext: true }),
  regios: opties(seed.regions, { withNext: false }),
  sporten: opties(seed.sports, { withNext: false }),
  training: opties(seed.training, { withNext: false }),
};

if (missing.size) {
  console.error(`No teamlid for: ${[...missing].join(", ")}`);
  process.exit(1);
}

const tellen = (list) => list.map((item) => `${item.label} (${item.collegas?.length || 0})`).join(", ");
console.log(`Kine ${document.klachten.length}: ${tellen(document.klachten)}`);
console.log(`Regio ${document.regios.length}`);
console.log(`Sport ${document.sporten.length}`);
console.log(`Training ${document.training.length}: ${tellen(document.training)}`);

if (dryRun) {
  console.log("Dry run — nothing written.");
  process.exit(0);
}

const existing = await client.getDocument("verwijskompas");
if (existing) {
  console.log("verwijskompas already exists. Left it unchanged so later edits stay.");
  process.exit(0);
}

await client.createIfNotExists(document);
const live = await client.getDocument("verwijskompas");
console.log(
  `Wrote verwijskompas: ${live.klachten.length} klachten, ${live.regios.length} regio's, ${live.sporten.length} sporten, ${live.training.length} training.`,
);
