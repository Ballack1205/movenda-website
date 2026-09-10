// Seeds getuigenissen (Vanhees + placeholders + MPC quote).
// Safe to re-run: deterministic _id. Keeps a foto Julie already uploaded.
//
// Usage:
//   SANITY_WRITE_TOKEN=... node scripts/seed-getuigenissen.mjs
//   npx sanity exec scripts/seed-getuigenissen.mjs --with-user-token
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const items = JSON.parse(
  readFileSync(path.join(__dirname, "../../web/src/content/getuigenissen.json"), "utf-8"),
);

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
