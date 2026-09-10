// Seeds the live Social Run pop-up so the preview matches movenda.be.
// Safe to re-run: deterministic _id. Does not touch other documents.
//
// Usage:
//   npx sanity exec scripts/seed-popup.mjs --with-user-token
//   SANITY_WRITE_TOKEN=... node scripts/seed-popup.mjs
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

function span(key, text, marks = []) {
  return { _type: "span", _key: key, text, marks };
}

function paragraph(key, children) {
  return {
    _type: "block",
    _key: key,
    style: "normal",
    markDefs: [],
    children,
  };
}

function bullet(key, text) {
  return {
    _type: "block",
    _key: key,
    style: "normal",
    listItem: "bullet",
    level: 1,
    markDefs: [],
    children: [span(`${key}-s`, text)],
  };
}

const inhoud = [
  paragraph("intro", [
    span("i1", "Op "),
    span("i2", "Zaterdag 12 september", ["strong"]),
    span("i3", " organiseren we opnieuw onze "),
    span("i4", "Social Run", ["strong"]),
    span("i5", ". 📍 MPC – Lammerweg 33, Hasselt"),
  ]),
  paragraph("kies", [span("k1", "Kies jouw uitdaging:", ["strong"])]),
  bullet("d1", "3 × 1 km Power Run (Hyrox-style)"),
  bullet("d2", "5 km Run (tempo 5:45 of 6:30 min/km)"),
  bullet("d3", "10 km Run (tempo 5:30 of 6:30 min/km)"),
  paragraph("tempo", [
    span("t1", "De vermelde tempo's zijn een richtlijn. ", ["strong"]),
    span(
      "t2",
      "We lopen volgens het samen uit, samen thuis-principe, zodat iedereen op zijn of haar eigen niveau kan genieten.",
    ),
  ]),
  bullet("e1", "Kids corner met springkasteel en begeleiding"),
  bullet("e2", "Post run shake & snack voorzien"),
];

const existing = await client.getDocument("popup-social-run-2026-09-12").catch(() => null);

await client.createOrReplace({
  _id: "popup-social-run-2026-09-12",
  _type: "popup",
  actief: true,
  titel: "Together we Move - Let's run!",
  inhoud,
  knopTekst: "Schrijf je in!",
  actie: "link",
  knopUrl: "https://forms.gle/U6Bdm1SGXpcUYPfQA",
  extraVragen: [
    {
      _type: "vraag",
      _key: "afstand",
      label: "Welke afstand?",
      type: "keuze",
      verplicht: true,
      opties: [
        "3 × 1 km Power Run (Hyrox-style)",
        "5 km Run (tempo 5:45 of 6:30 min/km)",
        "10 km Run (tempo 5:30 of 6:30 min/km)",
      ],
    },
  ],
  toonOp: "overal",
  geldigTot: "2026-09-12T22:00:00.000Z",
  eenKeerPerBezoeker: true,
  ...(existing?.afbeelding ? { afbeelding: existing.afbeelding } : {}),
});

console.log("Seeded Social Run pop-up. Open https://movenda.sanity.studio → Pop-ups to edit or turn off.");
