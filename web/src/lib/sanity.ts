import { createClient } from "@sanity/client";

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || "k73l2by8";
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || "production";

// Read-only client, no token needed: the "production" dataset's read
// visibility is public (writes still require a token/login in the
// Studio). Every field this site queries is already public marketing
// copy (team bios, addresses, opening hours) — the same content that was
// publicly visible on movenda.be / mpc.movenda.be before. Do not add
// fields that shouldn't be publicly readable without revisiting this.
export const sanity = createClient({
  projectId,
  dataset,
  apiVersion: "2026-01-01",
  // API CDN (`apicdn.sanity.io`). Same public dataset, ~60 s delay after a
  // write. The live API (`useCdn: false`) counts against the 250k/month Free
  // quota; the CDN does not. Seed/migrate scripts keep `useCdn: false`.
  // After Publish, Render rebuilds via webhook — that is later than 60 s.
  useCdn: true,
});
