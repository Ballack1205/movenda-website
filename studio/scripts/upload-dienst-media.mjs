// Pulls gallery photos + partner logos from the old public Squarespace
// sites and attaches them to the matching Sanity documents. Safe to re-run:
// uploads new assets and overwrites galerij / logo on the existing docs.
//
// Usage:
//   SANITY_WRITE_TOKEN=... node scripts/upload-dienst-media.mjs
import { createClient } from "@sanity/client";

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

const dienstPages = [
  { id: "dienst-kine-manuele-therapie", url: "https://www.movenda.be/manuele" },
  { id: "dienst-kine-oefentherapie", url: "https://www.movenda.be/oefentherapie" },
  { id: "dienst-kine-pre-en-postnatale-kinesitherapie", url: "https://www.movenda.be/pre-en-post-natale" },
  { id: "dienst-kine-lymfedrainage", url: "https://www.movenda.be/lymfedrainage" },
  { id: "dienst-kine-dry-needling", url: "https://www.movenda.be/dryneedling" },
  { id: "dienst-kine-acupunctuur", url: "https://www.movenda.be/acupunctuur" },
  { id: "dienst-kine-auriculotherapie", url: "https://www.movenda.be/auriculotherapie" },
  { id: "dienst-kine-cardiovasculaire-revalidatie", url: "https://www.movenda.be/cardiovasculaire" },
  { id: "dienst-kine-cupping", url: "https://www.movenda.be/cupping" },
  { id: "dienst-kine-taping", url: "https://www.movenda.be/taping" },
  { id: "dienst-training-personal-training", url: "https://www.movenda.be/personal-training" },
  { id: "dienst-training-duotraining", url: "https://www.movenda.be/duo-training" },
  { id: "dienst-training-sportspecifieke-screening", url: "https://www.movenda.be/sportspecifieke-screening" },
  { id: "dienst-training-sportspecifieke-training", url: "https://www.movenda.be/sportspecifieke-training" },
  { id: "dienst-training-inspanningstesten", url: "https://www.movenda.be/inspanningstesten" },
  { id: "dienst-training-pre-en-postnatale-training", url: "https://www.movenda.be/pre-en-post-natale-training" },
  { id: "dienst-mpc-training-performance-training", url: "https://www.mpc.movenda.be/performance" },
  { id: "dienst-mpc-training-data-analyse", url: "https://www.mpc.movenda.be/data-analysis" },
  { id: "dienst-mpc-training-personal-training", url: "https://www.mpc.movenda.be/personal-training" },
  { id: "dienst-mpc-training-duotraining", url: "https://www.mpc.movenda.be/duotraining" },
  { id: "dienst-mpc-groep-boxing", url: "https://www.mpc.movenda.be/boxing1" },
  { id: "dienst-mpc-rehab-sportrevalidatie", url: "https://www.mpc.movenda.be/sportrehab" },
  { id: "dienst-mpc-rehab-dry-needling", url: "https://www.mpc.movenda.be/dry-needling" },
  { id: "dienst-mpc-rehab-cupping", url: "https://www.mpc.movenda.be/cupping" },
  { id: "dienst-mpc-rehab-taping", url: "https://www.mpc.movenda.be/taping" },
  { id: "dienst-mpc-groep-hiit", url: "https://www.mpc.movenda.be/hiit" },
  { id: "dienst-mpc-groep-full-body", url: "https://www.mpc.movenda.be/full-body" },
  { id: "dienst-mpc-groep-powerplus", url: "https://www.mpc.movenda.be/powerplus" },
  { id: "dienst-mpc-groep-corporate-coaching", url: "https://www.mpc.movenda.be/corporatecoaching" },
  { id: "dienst-mpc-groep-kleine-groepstraining", url: "https://www.mpc.movenda.be/sgt" },
  { id: "dienst-mpc-groep-skifit", url: "https://www.mpc.movenda.be/skifit" },
  { id: "dienst-mpc-groep-running", url: "https://www.mpc.movenda.be/running" },
];

const partnerPages = [
  { id: "partner-olympia", url: "https://www.movenda.be/home", hint: "olympia" },
];

function extractImageUrls(html) {
  const urls = new Set();
  const re = /https?:\/\/images\.squarespace-cdn\.com\/[^"'\\\s]+/g;
  let match;
  while ((match = re.exec(html))) {
    let url = match[0]
      .replace(/&amp;/g, "&")
      .replace(/\\u002F/g, "/")
      .replace(/\\/g, "");
    url = url.split("?")[0];
    if (/\.(jpe?g|png|webp|gif)$/i.test(url) || url.includes("/content/")) {
      urls.add(url);
    }
  }
  return [...urls];
}

// Movenda's and MPC's own marks sit on the same homepage as the partner
// logos. They must never end up on a partner: the band is for third parties.
const ownBrandPatterns = [/movenda/, /\bmpc\b/, /logo[-_]?m\b/, /performance[-_+]?centre/];

// Matching used to take the first word of the name, so "AF Corse" searched for
// "af" and happily grabbed Movenda's own logo, and "Hubo Limburg United" got
// the Hubo Handbal shield. Rules now: compare against the filename only, drop
// words shorter than 4 characters, and when a name carries several usable
// words demand at least two of them so near-namesakes can't be confused.
function matchPartnerLogo(naam, urls) {
  const needles = naam
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4);
  if (!needles.length) return undefined;
  const required = Math.min(needles.length, 2);

  let best;
  for (const url of urls) {
    const filename = decodeURIComponent(url.split("?")[0].split("/").pop() || "")
      .toLowerCase()
      .replace(/\+/g, " ");
    if (ownBrandPatterns.some((re) => re.test(filename))) continue;
    const hits = needles.filter((n) => filename.includes(n)).length;
    if (hits < required) continue;
    if (!best || hits > best.hits) best = { url, hits };
  }
  return best?.url;
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 MovendaRebuild" } });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.text();
}

async function uploadUrl(url, filename) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 MovendaRebuild" } });
  if (!res.ok) throw new Error(`download ${url} → ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const asset = await client.assets.upload("image", buffer, { filename });
  return asset;
}

async function attachDienstGallery(id, urls) {
  const picked = urls.slice(0, 8);
  if (!picked.length) {
    console.log(`No images for ${id}`);
    return;
  }
  const assets = [];
  for (const [i, url] of picked.entries()) {
    try {
      const asset = await uploadUrl(url, `${id}-${i}.jpg`);
      assets.push(asset);
      console.log(`  uploaded ${asset._id}`);
    } catch (err) {
      console.warn(`  skip ${url}: ${err.message}`);
    }
  }
  if (!assets.length) return;
  await client
    .patch(id)
    .set({
      afbeelding: { _type: "image", asset: { _type: "reference", _ref: assets[0]._id } },
      galerij: assets.map((a, i) => ({
        _type: "image",
        _key: `g${i}`,
        asset: { _type: "reference", _ref: a._id },
      })),
    })
    .commit();
  console.log(`Patched ${id} with ${assets.length} images.`);
}

for (const page of dienstPages) {
  try {
    console.log(`Fetching ${page.url}`);
    const html = await fetchHtml(page.url);
    const urls = extractImageUrls(html).filter(
      (u) => !/logo|icon|favicon|wordmark|schedule|rooster/i.test(u),
    );
    await attachDienstGallery(page.id, urls);
  } catch (err) {
    console.warn(`Failed ${page.id}: ${err.message}`);
  }
}

try {
  console.log("Fetching homepage partner logos");
  const html = await fetchHtml("https://www.movenda.be/home");
  const urls = extractImageUrls(html);
  const partners = await client.fetch(`*[_type == "partner"]{_id, naam, "hasLogo": defined(logo)}`);
  for (const partner of partners) {
    // Never touch a logo a human curated (or deliberately removed and
    // re-uploaded) — this script is a one-off import, not the owner.
    if (partner.hasLogo) {
      console.log(`Logo ${partner.naam}: already set, skipped`);
      continue;
    }
    const match = matchPartnerLogo(partner.naam, urls);
    if (!match) {
      console.warn(`Logo ${partner.naam}: no confident match, upload it in the Studio`);
      continue;
    }
    try {
      const asset = await uploadUrl(match, `${partner._id}.png`);
      await client
        .patch(partner._id)
        .set({ logo: { _type: "image", asset: { _type: "reference", _ref: asset._id } } })
        .commit();
      console.log(`Logo ${partner.naam} → ${asset._id}`);
    } catch (err) {
      console.warn(`Logo ${partner.naam}: ${err.message}`);
    }
  }
} catch (err) {
  console.warn(`Partner logos failed: ${err.message}`);
}

console.log("Done.");
