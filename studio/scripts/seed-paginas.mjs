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

function withKeys(list, prefix, type = "blok") {
  return list.map((item, i) => ({ _type: type, _key: `${prefix}-${i + 1}`, ...item }));
}

function isEmpty(value) {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

function collectEmpty(prefix, seedObj, liveObj, set) {
  for (const [key, value] of Object.entries(seedObj || {})) {
    const path = prefix ? `${prefix}.${key}` : key;
    const live = liveObj?.[key];
    if (Array.isArray(value)) {
      if (isEmpty(live)) set[path] = value;
    } else if (value && typeof value === "object") {
      collectEmpty(path, value, live || {}, set);
    } else if (isEmpty(live) && value) {
      set[path] = value;
    }
  }
}

let created = 0;
let patched = 0;

for (const [key, fields] of Object.entries(seed)) {
  const id = `pagina-${key}`;
  const existing = await client.getDocument(id).catch(() => null);

  const doc = { _id: id, _type: "pagina", key };
  for (const [field, value] of Object.entries(fields)) {
    doc[field] =
      field === "cookies"
        ? withKeys(value, "cookie", "cookieRij")
        : BLOCK_FIELDS.includes(field)
          ? withKeys(value, field)
          : value;
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

// Site-instellingen: the homepage texts and the footer slogan, empty fields only.
// Julie's open draft gets the same fill so publishing it does not blank them again.
const settingsSeed = JSON.parse(
  await readFile(new URL("../../web/src/content/site-settings.json", import.meta.url), "utf8"),
);
for (const id of ["siteSettings", "drafts.siteSettings"]) {
  const doc = await client.getDocument(id).catch(() => null);
  if (!doc) continue;
  const set = {};
  for (const field of ["footerTagline", "footerTaglineEn"]) {
    if (!doc[field] && settingsSeed[field]) set[field] = settingsSeed[field];
  }
  const brief = doc.homeBrief || {};
  for (const [field, value] of Object.entries(settingsSeed.homeBrief || {})) {
    if (field === "bewijs") {
      for (const [sub, subValue] of Object.entries(value)) {
        if (!brief.bewijs?.[sub]) set[`homeBrief.bewijs.${sub}`] = subValue;
      }
    } else if (!brief[field] && value) {
      set[`homeBrief.${field}`] = value;
    }
  }
  const pijlerSeed = settingsSeed.homePijlers || {};
  for (const key of ["kine", "training", "mpc"]) {
    const live = doc.homePijlers?.[key] || {};
    const fromSeed = pijlerSeed[key] || {};
    for (const field of ["cta", "ctaEn"]) {
      if (!live[field] && fromSeed[field]) set[`homePijlers.${key}.${field}`] = fromSeed[field];
    }
  }
  const labelSet = {};
  collectEmpty("labels", settingsSeed.labels, doc.labels || {}, labelSet);
  Object.assign(set, labelSet);
  if (Object.keys(set).length === 0) continue;
  if (Object.keys(labelSet).length > 0) {
    await client.patch(id).setIfMissing({ labels: {} }).commit();
    await client
      .patch(id)
      .setIfMissing({
        "labels.menu": {},
        "labels.footer": {},
        "labels.formulier": {},
        "labels.cookies": {},
        "labels.locatie": {},
      })
      .commit();
  }
  await client.patch(id).setIfMissing({ homeBrief: {}, homePijlers: {} }).commit();
  await client.patch(id).setIfMissing({ "homeBrief.bewijs": {} }).commit();
  const pijlerMissing = {};
  for (const key of ["kine", "training", "mpc"]) {
    if (Object.keys(set).some((field) => field.startsWith(`homePijlers.${key}.`))) {
      pijlerMissing[`homePijlers.${key}`] = {};
    }
  }
  if (Object.keys(pijlerMissing).length > 0) {
    await client.patch(id).setIfMissing(pijlerMissing).commit();
  }
  await client.patch(id).set(set).commit();
  console.log(`${id}: ${Object.keys(set).length} velden aangevuld.`);
}

const olympiaSeed = JSON.parse(
  await readFile(new URL("../../web/src/content/olympia-pagina.json", import.meta.url), "utf8"),
);
const tag = (list, type) => list.map((item, i) => ({ _type: type, _key: `${type}-${i + 1}`, ...item }));
const olympiaDoc = {
  ...olympiaSeed,
  aboPunten: tag(olympiaSeed.aboPunten, "olympiaZin"),
  aanbod: tag(olympiaSeed.aanbod, "olympiaAanbod"),
  waarom: tag(olympiaSeed.waarom, "olympiaZin"),
};
for (const id of ["locatie-olympia", "drafts.locatie-olympia"]) {
  const doc = await client.getDocument(id).catch(() => null);
  if (!doc) {
    if (!id.startsWith("drafts.")) console.log(`${id}: niet gevonden, overgeslagen.`);
    continue;
  }
  const set = {};
  collectEmpty("olympiaPagina", olympiaDoc, doc.olympiaPagina || {}, set);
  if (Object.keys(set).length === 0) continue;
  await client.patch(id).setIfMissing({ olympiaPagina: {} }).commit();
  await client.patch(id).set(set).commit();
  console.log(`${id}: ${Object.keys(set).length} Olympia-teksten aangevuld.`);
}
