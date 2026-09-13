// Seeds the fixed-page copy (home, over, kine, …) from web/src/content/paginas.json
// so Julie starts from the live texts instead of empty forms.
//
// Safe to re-run: deterministic _id (pagina-<key>). Fields Julie already
// changed in the Studio are kept; only empty fields are filled in. Photos are
// never touched.
//
// Usage:
//   npx sanity exec scripts/seed-paginas.mjs --with-user-token
//   SANITY_WRITE_TOKEN=... node scripts/seed-paginas.mjs
import { readFile } from "node:fs/promises";
import { createClient } from "@sanity/client";
import { getCliClient } from "sanity/cli";

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
  await readFile(new URL("../../web/src/content/paginas.json", import.meta.url), "utf8"),
);

const BLOCK_FIELDS = ["blokken", "kenmerken", "stappen", "pijlers"];

function withKeys(list, prefix) {
  return list.map((item, i) => ({ _type: "blok", _key: `${prefix}-${i + 1}`, ...item }));
}

let created = 0;
let patched = 0;

for (const [key, fields] of Object.entries(seed)) {
  const id = `pagina-${key}`;
  const existing = await client.getDocument(id).catch(() => null);

  const doc = { _id: id, _type: "pagina", key };
  for (const [field, value] of Object.entries(fields)) {
    doc[field] = BLOCK_FIELDS.includes(field) ? withKeys(value, field) : value;
  }

  if (!existing) {
    await client.createOrReplace(doc);
    created += 1;
    continue;
  }

  // Only fill fields that are still empty so Julie's edits survive a re-run.
  const patch = {};
  for (const [field, value] of Object.entries(doc)) {
    if (field.startsWith("_") || field === "key") continue;
    const current = existing[field];
    const empty = current === undefined || current === null || current === "" || (Array.isArray(current) && current.length === 0);
    if (empty) patch[field] = value;
  }
  if (Object.keys(patch).length > 0) {
    await client.patch(id).set(patch).commit();
    patched += 1;
  }
}

console.log(`Pagina's: ${created} aangemaakt, ${patched} aangevuld. Studio → Pagina's (teksten & foto's).`);
