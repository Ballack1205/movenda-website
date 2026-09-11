// One-off migration: free-text keuzehulp fields on teamlid (klachten / regio /
// sporten / doelgroepen) → a controlled vocabulary of keuzehulpTag documents
// referenced from teamlid.keuzehulpTags, plus the keuzehulp copy singleton.
//
// Usage:
//   SANITY_WRITE_TOKEN=... node scripts/migrate-keuzehulp.mjs [--dry-run]
//
// Safe to re-run: tags use deterministic _id's (createOrReplace), the
// singleton is createIfNotExists (Julie's edits win), teamlid patches only set
// keuzehulpTags — the old string fields are left untouched (hidden in Studio).
import { createClient } from "@sanity/client";

const dryRun = process.argv.includes("--dry-run");
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

// ---------------------------------------------------------------------------
// Vocabulary. Key = stable id suffix, label = what visitors see. Order here
// is the display order. Derived from what the therapists were tagged with on
// the old site, de-duplicated and moved to the right question (e.g. "Lopers"
// was a doelgroep, "Lopen" a sport — now one sport tag).
// ---------------------------------------------------------------------------
const VOCAB = {
  klacht: [
    ["pijn-blessure", "Pijn of blessure"],
    ["na-operatie", "Herstel na operatie"],
    ["complex-terugkerend", "Complexe of terugkerende klacht"],
    ["preventie", "Blessurepreventie"],
    ["oefentherapie", "Actieve oefentherapie"],
    ["dry-needling", "Dry needling"],
    ["osteopathie", "Osteopathie"],
    ["hoofdpijn", "Hoofdpijn"],
    ["stress", "Stressgerelateerde klachten"],
    ["zwangerschap-bekkenbodem", "Zwangerschap & bekkenbodem"],
    ["lymfedrainage", "Lymfedrainage / oedeem"],
    ["inspanningstest", "Inspanningstest / lactaatmeting"],
    ["loopanalyse", "Loopanalyse / looptest"],
    ["personal-training", "Personal training"],
    ["performance", "Beter presteren in mijn sport"],
  ],
  regio: [
    ["nek-bovenrug", "Nek & bovenrug"],
    ["lage-rug", "Lage rug"],
    ["schouder", "Schouder"],
    ["pols-hand", "Pols & hand"],
    ["heup", "Heup"],
    ["knie", "Knie"],
    ["knie-kruisband", "Knie (kruisband / ACL)"],
    ["voet-enkel", "Voet & enkel"],
    ["bekken", "Bekken"],
    ["kaak", "Kaak"],
  ],
  sport: [
    ["lopen", "Lopen"],
    ["fietsen", "Fietsen"],
    ["fitness", "Fitness & krachttraining"],
    ["hyrox", "Hyrox"],
    ["voetbal", "Voetbal"],
    ["basket", "Basketbal"],
    ["balsporten", "Andere balsporten"],
    ["tennis-padel", "Tennis & padel"],
    ["gymnastiek", "Gymnastiek"],
    ["boksen", "Boksen"],
    ["motorcross-bmx", "Motorcross & BMX"],
    ["autosport", "Autosport"],
  ],
  doelgroep: [
    ["recreatief", "Recreatieve sporter"],
    ["topsport", "Topsporter"],
    ["jeugd", "Kinderen & jongeren"],
    ["zwanger", "Zwanger of pas bevallen"],
    ["vrouwen", "Vrouwen"],
    ["ondernemers", "Ondernemers & drukke agenda"],
    ["bedrijven", "Bedrijven (corporate)"],
  ],
};

// Which tags each therapist gets. Keyed by voornaam (unique in the dataset).
// Mapped 1:1 from the old free-text tags; a few obvious gaps filled from the
// bios/specialisaties (e.g. Josje's pols, Stijn's loopblessures). Julie
// refines this in Studio afterwards — this is a starting point, not gospel.
const ASSIGN = {
  Andres: ["klacht:pijn-blessure", "klacht:na-operatie", "klacht:complex-terugkerend", "klacht:oefentherapie", "klacht:dry-needling", "klacht:personal-training", "regio:nek-bovenrug", "regio:schouder", "doelgroep:recreatief", "doelgroep:ondernemers"],
  Cedriek: ["klacht:performance", "sport:voetbal", "doelgroep:topsport"],
  Josje: ["klacht:pijn-blessure", "klacht:complex-terugkerend", "klacht:dry-needling", "klacht:personal-training", "regio:schouder", "regio:pols-hand", "sport:gymnastiek", "sport:lopen", "sport:hyrox", "doelgroep:recreatief"],
  Koen: ["klacht:pijn-blessure", "klacht:na-operatie", "klacht:complex-terugkerend", "klacht:personal-training", "regio:lage-rug", "regio:nek-bovenrug", "regio:schouder", "regio:knie", "regio:heup", "regio:voet-enkel", "doelgroep:ondernemers", "doelgroep:recreatief"],
  Jens: ["klacht:pijn-blessure", "klacht:dry-needling", "klacht:oefentherapie", "klacht:inspanningstest", "klacht:loopanalyse", "klacht:performance", "klacht:personal-training", "sport:lopen", "sport:motorcross-bmx", "sport:autosport", "doelgroep:topsport", "doelgroep:recreatief"],
  Pieter: ["klacht:pijn-blessure", "klacht:preventie", "klacht:dry-needling", "klacht:personal-training", "sport:voetbal", "doelgroep:topsport", "doelgroep:recreatief"],
  Simon: ["klacht:pijn-blessure", "klacht:personal-training", "regio:schouder", "regio:knie", "regio:knie-kruisband", "regio:heup", "regio:voet-enkel", "sport:tennis-padel", "doelgroep:jeugd", "doelgroep:recreatief"],
  Tanse: ["klacht:zwangerschap-bekkenbodem", "regio:bekken", "doelgroep:zwanger", "doelgroep:vrouwen"],
  Miel: ["klacht:pijn-blessure", "klacht:osteopathie", "klacht:hoofdpijn", "klacht:stress", "klacht:personal-training", "regio:lage-rug", "regio:knie", "regio:heup", "regio:voet-enkel", "regio:bekken", "sport:voetbal", "doelgroep:recreatief"],
  Maarten: ["klacht:pijn-blessure", "klacht:personal-training", "regio:knie", "regio:heup", "regio:voet-enkel", "sport:fitness", "sport:voetbal", "sport:balsporten", "doelgroep:recreatief"],
  Arne: ["klacht:pijn-blessure", "klacht:na-operatie", "klacht:oefentherapie", "klacht:performance", "sport:basket", "sport:autosport", "doelgroep:topsport", "doelgroep:recreatief"],
  Charlotte: ["klacht:personal-training", "sport:fitness", "doelgroep:ondernemers", "doelgroep:vrouwen", "doelgroep:bedrijven", "doelgroep:recreatief"],
  Yannick: ["klacht:performance", "doelgroep:topsport", "doelgroep:bedrijven"],
  Jana: ["klacht:pijn-blessure", "klacht:preventie", "klacht:personal-training", "klacht:performance", "doelgroep:jeugd", "doelgroep:recreatief"],
  Quinten: ["klacht:personal-training", "sport:basket", "doelgroep:recreatief", "doelgroep:jeugd"],
  Dimitri: ["klacht:personal-training", "sport:boksen", "doelgroep:recreatief"],
  Stijn: ["klacht:pijn-blessure", "klacht:preventie", "klacht:dry-needling", "klacht:inspanningstest", "klacht:loopanalyse", "regio:kaak", "sport:lopen", "sport:fietsen", "sport:tennis-padel", "doelgroep:jeugd", "doelgroep:recreatief"],
  An: ["klacht:lymfedrainage", "klacht:na-operatie"],
  // Julie: office manager, not a therapist — no tags, so she never shows up as a match.
};

const tagId = (cat, key) => `keuzehulpTag-${cat}-${key}`;

async function main() {
  const validIds = new Set();
  const tx = client.transaction();

  for (const [categorie, entries] of Object.entries(VOCAB)) {
    entries.forEach(([key, label], i) => {
      const _id = tagId(categorie, key);
      validIds.add(_id);
      tx.createOrReplace({ _id, _type: "keuzehulpTag", label, categorie, volgorde: (i + 1) * 10, actief: true });
    });
  }

  tx.createIfNotExists({
    _id: "keuzehulp",
    _type: "keuzehulp",
    actief: true,
    titel: "Wie past bij mij?",
    intro:
      "Kies wat op jou van toepassing is — één keuze per vraag is genoeg. We tonen de collega's die het best passen. Dit is een hulpmiddel, geen medisch advies.",
    vragen: {
      klacht: "Waarmee kunnen we je helpen?",
      regio: "Waar zit de klacht?",
      sport: "Welke sport beoefen je?",
      doelgroep: "Wat past bij jou?",
    },
    geenMatchTekst:
      "Geen exacte match, maar dit zijn de collega's die het dichtst bij je vraag zitten. Twijfel je? Bel ons — we verwijzen je door naar de juiste persoon.",
  });

  const team = await client.fetch(`*[_type == "teamlid"]{ _id, voornaam }`);
  const seen = new Set();
  for (const lid of team) {
    const wanted = ASSIGN[lid.voornaam];
    if (!wanted) {
      console.log(`- ${lid.voornaam}: geen tags (bewust)`);
      continue;
    }
    seen.add(lid.voornaam);
    const refs = wanted.map((pair) => {
      const [cat, key] = pair.split(":");
      const _ref = tagId(cat, key);
      if (!validIds.has(_ref)) throw new Error(`Unknown tag ${pair} for ${lid.voornaam}`);
      return { _type: "reference", _ref, _key: `${cat}-${key}` };
    });
    tx.patch(lid._id, (p) => p.set({ keuzehulpTags: refs }));
    console.log(`- ${lid.voornaam}: ${refs.length} tags`);
  }
  for (const name of Object.keys(ASSIGN)) {
    if (!seen.has(name)) console.warn(`! ${name} staat in ASSIGN maar niet in Sanity`);
  }

  if (dryRun) {
    console.log("\n--dry-run: niets weggeschreven.");
    return;
  }
  const result = await tx.commit();
  console.log(`\nKlaar: ${result.results.length} mutaties.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
