// One-off migration: teamlid.expertise (plain text, one line per row, elements
// separated by " · ") → teamlid.expertiseRegels (lines of elements Julie can
// link from the Studio).
//
// By default every element becomes plain free text, so the profile pages look
// exactly as before (no new links appear). The English text is taken from
// expertiseEn when both texts have the same shape.
//
// With --link-specialisaties, elements that match the name of a specialisatie
// document (NL or EN, case-insensitive) become a reference to it instead, so
// they link to that specialisation's dienst page.
//
// Usage:
//   SANITY_WRITE_TOKEN=... node scripts/migrate-expertise.mjs [--dry-run] [--link-specialisaties]
//
// Safe to re-run: profiles that already have expertiseRegels are skipped. The
// old text fields are left untouched (Studio hides them once lines exist).
import { createClient } from "@sanity/client";

const dryRun = process.argv.includes("--dry-run");
const linkSpecs = process.argv.includes("--link-specialisaties");
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
  perspective: "raw", // include drafts.* as well (default is published only)
});

const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();
const parse = (text) =>
  (text || "")
    .split("\n")
    .map((line) => line.split("·").map((el) => el.trim()).filter(Boolean))
    .filter((line) => line.length > 0);

const specs = await client.fetch(`*[_type == "specialisatie" && !(_id in path("drafts.**"))]{ _id, naam, naamEn }`);
const byName = new Map();
for (const s of specs) {
  byName.set(norm(s.naam), s._id);
  if (s.naamEn) byName.set(norm(s.naamEn), s._id);
}

// Published and draft versions are both migrated, so an open draft does not hide the lines.
const docs = await client.fetch(
  `*[_type == "teamlid" && defined(expertise) && expertise != "" && !defined(expertiseRegels)]{ _id, voornaam, naam, expertise, expertiseEn }`,
);

let migrated = 0;
for (const doc of docs) {
  const nl = parse(doc.expertise);
  const en = parse(doc.expertiseEn);
  const sameShape = en.length === nl.length && en.every((line, i) => line.length === nl[i].length);

  const regels = nl.map((line, i) => ({
    _type: "expertiseRegel",
    _key: `r${i}`,
    elementen: line.map((tekst, j) => {
      const specId = linkSpecs ? byName.get(norm(tekst)) : undefined;
      if (specId) {
        return {
          _type: "expertiseSpecialisatie",
          _key: `r${i}e${j}`,
          specialisatie: { _type: "reference", _ref: specId },
        };
      }
      return {
        _type: "expertiseTekst",
        _key: `r${i}e${j}`,
        tekst,
        ...(sameShape && en[i][j] !== tekst ? { tekstEn: en[i][j] } : {}),
      };
    }),
  }));

  const gekoppeld = regels.flatMap((r) => r.elementen).filter((e) => e._type === "expertiseSpecialisatie").length;
  const totaal = regels.flatMap((r) => r.elementen).length;
  console.log(`${doc._id} (${doc.voornaam} ${doc.naam}): ${regels.length} regels, ${gekoppeld}/${totaal} aan specialisatie gekoppeld`);

  if (!dryRun) {
    await client.patch(doc._id).set({ expertiseRegels: regels }).commit();
  }
  migrated += 1;
}

console.log(`${dryRun ? "Dry run: " : ""}${migrated} teamleden ${dryRun ? "zouden worden" : "zijn"} gemigreerd.`);
