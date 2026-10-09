// One-off migration: plain-text fields → rich text (Portable Text blocks), for
// the fields that now use the `richText` type in the Studio schema.
// A blank line becomes a new paragraph, exactly as the site split it before.
//
// RUN THIS BEFORE JULIE EDITS: until a field is converted, the Studio shows
// its old plain text as an invalid value (the website keeps rendering it fine).
//
// Usage:
//   SANITY_WRITE_TOKEN=... node scripts/migrate-richtext.mjs [--dry-run] [--only teamlid,dienst]
//
// Safe to re-run: only string values are converted; blocks are left alone.
// Published documents and drafts are both patched. The old strings are not
// kept, so make a dataset export first:  npx sanity dataset export production
import { createClient } from "@sanity/client";

const dryRun = process.argv.includes("--dry-run");
const onlyArg = process.argv.indexOf("--only");
const only = onlyArg > -1 ? process.argv[onlyArg + 1].split(",") : null;
const token = process.env.SANITY_WRITE_TOKEN;
if (!token && !dryRun) {
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

// document type → fields. A path may go through objects (a.b) and arrays (items[].tekst).
// Keep in sync with the `richText` fields in studio/schemaTypes.
//
// Deliberately NOT here (still plain text): dienst.body (a small label format:
// "Voor wie:", "Duur:", "Gerelateerd:"), pagina texts ({placeholders} and "- "
// lists), faq.antwoord ([tekst](/pad) links), locatie texts. See HANDOFF.md.
const FIELDS = {
  teamlid: ["bio", "bioEn", "motivatie", "motivatieEn"],
  event: ["tekst", "tekstEn"],
  vacature: ["omschrijving", "omschrijvingEn"],
  actiepagina: ["intro", "introEn", "secties[].tekst", "secties[].tekstEn", "secties[].items[].tekst", "secties[].items[].tekstEn"],
};

let counter = 0;
const key = () => `b${Date.now().toString(36)}${(counter++).toString(36)}`;

function toBlocks(text) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => ({
      _type: "block",
      _key: key(),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: key(), text: p, marks: [] }],
    }));
}

/** Convert the value at `segments` inside `node`; returns the new node and whether anything changed. */
function convert(node, segments) {
  if (node == null) return { node, changed: false };
  const [head, ...rest] = segments;
  const isArray = head.endsWith("[]");
  const key = isArray ? head.slice(0, -2) : head;
  const value = node[key];
  if (value == null) return { node, changed: false };

  if (rest.length === 0) {
    if (typeof value !== "string") return { node, changed: false };
    return { node: { ...node, [key]: toBlocks(value) }, changed: true };
  }
  if (isArray) {
    if (!Array.isArray(value)) return { node, changed: false };
    let changed = false;
    const next = value.map((child) => {
      const r = convert(child, rest);
      changed ||= r.changed;
      return r.node;
    });
    return changed ? { node: { ...node, [key]: next }, changed } : { node, changed };
  }
  const r = convert(value, rest);
  return r.changed ? { node: { ...node, [key]: r.node }, changed: true } : { node, changed: false };
}

let patched = 0;
for (const [type, paths] of Object.entries(FIELDS)) {
  if (only && !only.includes(type)) continue;
  const docs = await client.fetch(`*[_type == $type]`, { type });
  for (const doc of docs) {
    let current = doc;
    const touched = new Set();
    for (const path of paths) {
      const segments = path.split(".").flatMap((part) => {
        // "secties[].tekst" -> ["secties[]", "tekst"]
        const m = part.match(/^(\w+\[\])\.?(.*)$/);
        return m ? [m[1], ...(m[2] ? [m[2]] : [])] : [part];
      });
      const r = convert(current, segments);
      if (r.changed) {
        current = r.node;
        touched.add(segments[0].replace("[]", ""));
      }
    }
    if (touched.size === 0) continue;
    const set = Object.fromEntries([...touched].map((k) => [k, current[k]]));
    console.log(`${doc._id}: ${[...touched].join(", ")}`);
    if (!dryRun) await client.patch(doc._id).set(set).commit();
    patched += 1;
  }
}
console.log(`${dryRun ? "Dry run: " : ""}${patched} documenten ${dryRun ? "zouden worden" : "zijn"} omgezet.`);
