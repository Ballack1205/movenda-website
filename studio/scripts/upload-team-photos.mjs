// One-off script: uploads the real teamlid photos (pulled from movenda.be /
// mpc.movenda.be, see seed-assets/team/) to Sanity as image assets, then
// inserts the resulting asset IDs into web/src/content/team.json as
// `fotoAssetId` (surgical text edit, so the file's existing formatting is
// preserved). seed.mjs reads that field and attaches the image to each
// teamlid document. Safe to re-run: re-uploads and overwrites the mapping.
//
// Usage:
//   SANITY_WRITE_TOKEN=... node scripts/upload-team-photos.mjs
import { createClient } from "@sanity/client";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const teamJsonPath = path.join(__dirname, "../../web/src/content/team.json");
const photosDir = path.join(__dirname, "seed-assets/team");

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

const team = JSON.parse(readFileSync(teamJsonPath, "utf-8"));
let raw = readFileSync(teamJsonPath, "utf-8");

for (const lid of team) {
  const filePath = path.join(photosDir, `${lid.slug}.jpg`);
  let buffer;
  try {
    buffer = readFileSync(filePath);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.log(`No photo for ${lid.slug}, skipping.`);
      continue;
    }
    throw err;
  }

  const asset = await client.assets.upload("image", buffer, {
    filename: `${lid.slug}.jpg`,
  });
  console.log(`Uploaded ${lid.slug} -> ${asset._id}`);

  const slugLine = `"slug": "${lid.slug}",`;
  const idx = raw.indexOf(slugLine);
  if (idx === -1) {
    console.warn(`Could not find slug line for ${lid.slug} in team.json — skipping text patch.`);
    continue;
  }
  if (raw.includes(`"fotoAssetId"`) && raw.slice(idx, idx + 400).includes(`"fotoAssetId"`)) {
    // Already has a fotoAssetId nearby (re-run) — replace it instead of duplicating.
    raw = raw.replace(
      new RegExp(`("slug": "${lid.slug}",\\n\\s*"fotoAssetId": ")[^"]*(")`),
      `$1${asset._id}$2`,
    );
  } else {
    raw = raw.replace(slugLine, `${slugLine}\n    "fotoAssetId": "${asset._id}",`);
  }
}

writeFileSync(teamJsonPath, raw);
console.log("Updated team.json with fotoAssetId references.");
