// One-off migration (Sept 2026): move things the site used to *guess* from free
// text into explicit CMS fields Julie can edit.
//
//   1. prijsitem   "mpc" category → mpc-training / mpc-rehab / mpc-groep;
//                  "ex BTW" / "enkel op afspraak" stripped from the public note
//                  (the page intro already says it); naamEn / notitieEn filled.
//   2. teamlid     specialisaties: free strings → references to `specialisatie`
//                  documents (NL, EN, optional dienst link).
//   3. keuzehulpTag  labelEn filled for every tag.
//   4. getuigenis  rolEn filled.
//   5. siteSettings  nieuwsbrief titelEn / tekstEn / socialProofEn filled.
//   6. locatie     korteNaam filled.
//
// Usage:
//   SANITY_WRITE_TOKEN=... node scripts/migrate-cms-velden.mjs [--dry-run]
//
// Safe to re-run: EN fields are only set when empty (Julie's edits win),
// specialisatie docs are createIfNotExists, teamlid patches skip members whose
// specialisaties are already references.
import { createClient } from "@sanity/client";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, "../../web/src/content");
const readJson = (name) => JSON.parse(readFileSync(path.join(contentDir, name), "utf-8"));

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

const slugify = (input) =>
  String(input)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const log = (...args) => console.log(dryRun ? "[dry-run]" : "", ...args);

async function commit(tx, label) {
  if (!dryRun) await tx.commit({ autoGenerateArrayKeys: true });
  log(label);
}

// ---------------------------------------------------------------------------
// 1. Prijzen
// ---------------------------------------------------------------------------
async function migratePrijzen() {
  const seed = readJson("prijzen.json");
  const seedById = new Map(
    seed.map((item) => {
      const idCategorie = item.categorie.startsWith("mpc-") ? "mpc" : item.categorie;
      return [`prijsitem-${idCategorie}-${slugify(item.naam)}`, item];
    }),
  );
  // Same buckets the page used to derive from the name — only as a fallback
  // for prices Julie created herself that the seed file does not know.
  const GROEP = /10 lessen|small group|boxing|corporate/i;
  const REHAB = /sportrevalidatie|manuele|oefentherapie|pre- en postnatale/i;
  const stripNote = (note) =>
    (note || "")
      .split("·")
      .map((p) => p.trim())
      .filter((p) => p && !/^ex BTW( bij MPC)?$/i.test(p) && !/^enkel op afspraak$/i.test(p) && !/^Julie:/i.test(p))
      .join(" · ") || undefined;

  const docs = await client.fetch(`*[_type == "prijsitem"]{ _id, naam, naamEn, categorie, notitie, notitieEn }`);
  const tx = client.transaction();
  let n = 0;
  for (const doc of docs) {
    const fromSeed = seedById.get(doc._id);
    const set = {};
    const unset = [];
    let categorie = doc.categorie;
    if (categorie === "mpc") {
      categorie =
        fromSeed?.categorie ||
        (GROEP.test(doc.naam) ? "mpc-groep" : REHAB.test(doc.naam) ? "mpc-rehab" : "mpc-training");
      set.categorie = categorie;
    }
    const note = stripNote(doc.notitie);
    if (note !== (doc.notitie || undefined)) {
      if (note) set.notitie = note;
      else unset.push("notitie");
    }
    if (!doc.naamEn && fromSeed?.naamEn) set.naamEn = fromSeed.naamEn;
    if (!doc.notitieEn && note && fromSeed?.notitieEn && fromSeed.notitie === note) set.notitieEn = fromSeed.notitieEn;
    if (Object.keys(set).length || unset.length) {
      log(`prijs ${doc._id}:`, JSON.stringify({ set, unset }));
      if (Object.keys(set).length) tx.patch(doc._id, (patch) => patch.set(set));
      if (unset.length) tx.patch(doc._id, (patch) => patch.unset(unset));
      n++;
    }
  }
  if (n) await commit(tx, `Patched ${n} prijzen.`);
  else log("Prijzen already migrated.");
}

// ---------------------------------------------------------------------------
// 2. Specialisaties
// ---------------------------------------------------------------------------
const specialisatieId = (naam) => `specialisatie-${slugify(naam)}`;

async function migrateSpecialisaties() {
  const vocab = readJson("specialisaties.json");
  const dienstIds = new Set((await client.fetch(`*[_type == "dienst"]._id`)) || []);

  const tx = client.transaction();
  for (const s of vocab) {
    const [categorie, slug] = (s.dienst || "").split("/");
    const dienstId = s.dienst ? `dienst-${categorie}-${slug}` : undefined;
    if (dienstId && !dienstIds.has(dienstId)) console.warn(`  ! dienst ${dienstId} not found for "${s.naam}" — linking skipped`);
    tx.createIfNotExists({
      _id: specialisatieId(s.naam),
      _type: "specialisatie",
      naam: s.naam,
      naamEn: s.naamEn,
      ...(dienstId && dienstIds.has(dienstId) ? { dienst: { _type: "reference", _ref: dienstId } } : {}),
    });
  }
  await commit(tx, `Ensured ${vocab.length} specialisatie documents.`);

  const known = new Set(vocab.map((s) => s.naam));
  const team = await client.fetch(`*[_type == "teamlid"]{ _id, voornaam, specialisaties }`);
  const tx2 = client.transaction();
  let n = 0;
  for (const lid of team) {
    const items = lid.specialisaties || [];
    const strings = items.filter((s) => typeof s === "string");
    if (!strings.length) continue; // already references (or empty)
    for (const naam of strings) {
      if (!known.has(naam)) {
        console.warn(`  ! "${naam}" (${lid.voornaam}) not in specialisaties.json — created without EN name`);
        tx2.createIfNotExists({ _id: specialisatieId(naam), _type: "specialisatie", naam });
      }
    }
    const refs = strings.map((naam) => ({ _type: "reference", _ref: specialisatieId(naam), _key: slugify(naam) }));
    log(`teamlid ${lid._id}: ${strings.length} strings → references`);
    tx2.patch(lid._id, (p) => p.set({ specialisaties: refs }));
    n++;
  }
  if (n) await commit(tx2, `Patched ${n} teamleden.`);
  else log("Teamlid specialisaties already references.");
}

// ---------------------------------------------------------------------------
// 3. Keuzehulp-tags
// ---------------------------------------------------------------------------
const TAG_EN = {
  "Bedrijven (corporate)": "Companies (corporate)",
  "Kinderen & jongeren": "Children & teenagers",
  "Ondernemers & drukke agenda": "Entrepreneurs & busy schedules",
  "Recreatieve sporter": "Recreational athlete",
  Topsporter: "Elite athlete",
  Vrouwen: "Women",
  "Zwanger of pas bevallen": "Pregnant or recently given birth",
  "Complexe of terugkerende klacht": "Complex or recurring complaint",
  "Dry needling": "Dry needling",
  Hoofdpijn: "Headache",
  "Inspanningstest / lactaatmeting": "Exercise test / lactate measurement",
  "Loopanalyse / looptest": "Running analysis / running test",
  "Lymfedrainage / oedeem": "Lymphatic drainage / oedema",
  "Herstel na operatie": "Recovery after surgery",
  "Actieve oefentherapie": "Active exercise therapy",
  Osteopathie: "Osteopathy",
  "Beter presteren in mijn sport": "Perform better in my sport",
  "Personal training": "Personal training",
  "Pijn of blessure": "Pain or injury",
  Blessurepreventie: "Injury prevention",
  "Stressgerelateerde klachten": "Stress-related complaints",
  "Zwangerschap & bekkenbodem": "Pregnancy & pelvic floor",
  Bekken: "Pelvis",
  Heup: "Hip",
  Kaak: "Jaw",
  Knie: "Knee",
  "Knie (kruisband / ACL)": "Knee (cruciate ligament / ACL)",
  "Lage rug": "Lower back",
  "Nek & bovenrug": "Neck & upper back",
  "Pols & hand": "Wrist & hand",
  Schouder: "Shoulder",
  "Voet & enkel": "Foot & ankle",
  Autosport: "Motorsport",
  "Andere balsporten": "Other ball sports",
  Basketbal: "Basketball",
  Boksen: "Boxing",
  Fietsen: "Cycling",
  "Fitness & krachttraining": "Fitness & strength training",
  Gymnastiek: "Gymnastics",
  Hyrox: "Hyrox",
  Lopen: "Running",
  "Motorcross & BMX": "Motocross & BMX",
  "Tennis & padel": "Tennis & padel",
  Voetbal: "Football",
};

async function migrateKeuzehulpTags() {
  const tags = await client.fetch(`*[_type == "keuzehulpTag"]{ _id, label, labelEn }`);
  const tx = client.transaction();
  let n = 0;
  for (const tag of tags) {
    if (tag.labelEn) continue;
    const en = TAG_EN[tag.label];
    if (!en) {
      console.warn(`  ! no EN for keuzehulp-tag "${tag.label}" — Julie can fill it in the Studio`);
      continue;
    }
    tx.patch(tag._id, (p) => p.set({ labelEn: en }));
    n++;
  }
  if (n) await commit(tx, `Filled labelEn on ${n} keuzehulp-tags.`);
  else log("Keuzehulp-tags already have labelEn.");
}

// ---------------------------------------------------------------------------
// 4. Getuigenissen
// ---------------------------------------------------------------------------
const ROL_EN = { Kinesitherapie: "Physiotherapy", Performance: "Performance", "Personal training": "Personal training" };

async function migrateGetuigenissen() {
  const items = await client.fetch(`*[_type == "getuigenis"]{ _id, rol, rolEn }`);
  const tx = client.transaction();
  let n = 0;
  for (const g of items) {
    if (g.rolEn || !g.rol) continue;
    const en = ROL_EN[g.rol];
    if (!en) {
      console.warn(`  ! no EN for getuigenis context "${g.rol}"`);
      continue;
    }
    tx.patch(g._id, (p) => p.set({ rolEn: en }));
    n++;
  }
  if (n) await commit(tx, `Filled rolEn on ${n} getuigenissen.`);
  else log("Getuigenissen already have rolEn.");
}

// ---------------------------------------------------------------------------
// 5. Nieuwsbrief EN  6. Locatie korteNaam
// ---------------------------------------------------------------------------
async function migrateSettingsAndLocaties() {
  const seed = readJson("site-settings.json").nieuwsbrief;
  const nb = (await client.fetch(`*[_id == "siteSettings"][0].nieuwsbrief`)) || {};
  const set = {};
  for (const key of ["titelEn", "tekstEn", "socialProofEn"]) {
    if (!nb[key] && seed[key]) set[`nieuwsbrief.${key}`] = seed[key];
  }
  if (Object.keys(set).length) {
    log("siteSettings:", JSON.stringify(set));
    if (!dryRun) await client.patch("siteSettings").set(set).commit();
  } else log("Nieuwsbrief EN already filled.");

  const korte = Object.fromEntries(readJson("locaties.json").map((l) => [l.slug, l.korteNaam]));
  const locaties = await client.fetch(`*[_type == "locatie"]{ _id, "slug": slug.current, korteNaam }`);
  for (const loc of locaties) {
    if (loc.korteNaam || !korte[loc.slug]) continue;
    log(`locatie ${loc.slug}: korteNaam = ${korte[loc.slug]}`);
    if (!dryRun) await client.patch(loc._id).set({ korteNaam: korte[loc.slug] }).commit();
  }
}

await migratePrijzen();
await migrateSpecialisaties();
await migrateKeuzehulpTags();
await migrateGetuigenissen();
await migrateSettingsAndLocaties();
console.log(dryRun ? "Dry run complete — nothing written." : "Migration complete.");
