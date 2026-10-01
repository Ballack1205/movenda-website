import { DocumentTextIcon } from "@sanity/icons";
import { defineField, defineType, type ConditionalPropertyCallbackContext } from "sanity";
import { EN_FIELDSET } from "./helpers";
import { maxItems, maxTekens, verplicht, GOOGLE_OMSCHRIJVING, googleTitel } from "./regels";

// Copy of the fixed pages (home, over, kine, …). One document per page, fixed
// `key`, never created or deleted from the Studio. Julie edits the H1, intro,
// hero photo, SEO and the text blocks that used to be hardcoded in Astro.
// Layout stays in code; which blocks a page shows follows from its key.

export const PAGINAS = [
  { key: "home", title: "Homepage", path: "/" },
  { key: "over", title: "Ons verhaal", path: "/over-ons/ons-verhaal" },
  { key: "onze-visie", title: "Onze visie", path: "/over-ons/onze-visie" },
  { key: "kinesitherapie", title: "Kinesitherapie (overzicht)", path: "/kinesitherapie" },
  { key: "training", title: "Training (overzicht)", path: "/training" },
  { key: "performance", title: "Performance (overzicht)", path: "/performance" },
  { key: "b2b", title: "B2B (overzicht)", path: "/b2b" },
  { key: "mpc", title: "MPC (overzicht)", path: "/mpc" },
  { key: "mpc-visie", title: "MPC — Visie", path: "/mpc/visie" },
  { key: "contact", title: "Contact", path: "/contact" },
  { key: "jobs", title: "Vacatures", path: "/jobs" },
  { key: "team", title: "Team", path: "/team" },
  { key: "groepslessen", title: "Groepslessen (GX)", path: "/groepslessen" },
  { key: "kine-abonnement", title: "Kiné-abonnement", path: "/kine-abonnement" },
  { key: "prijzen", title: "Prijzen (Movenda)", path: "/prijzen" },
  { key: "performance-prijzen", title: "Prijzen (Performance Centre)", path: "/performance/prijzen" },
  { key: "faq", title: "FAQ", path: "/faq" },
  { key: "blog", title: "Blog (overzicht)", path: "/blog" },
  { key: "events", title: "Events (overzicht)", path: "/events" },
  { key: "welkom", title: "Welkom (QR-formulier)", path: "/welkom" },
] as const;

export type PaginaKey = (typeof PAGINAS)[number]["key"];

// Field only shown on the listed pages.
const only =
  (...keys: PaginaKey[]) =>
  ({ document }: ConditionalPropertyCallbackContext) =>
    !keys.includes(((document as { key?: string } | undefined)?.key || "") as PaginaKey);

const ONDERTITEL: PaginaKey[] = ["home", "kinesitherapie", "performance", "b2b", "groepslessen", "kine-abonnement", "performance-prijzen", "blog"];

// NL field + its EN twin, only on the listed pages.
const tekstVeld = (name: string, title: string, keys: PaginaKey[], kort = false) =>
  kort
    ? [
        defineField({ name, title: `${title} (NL)`, type: "string", group: "blokken", hidden: only(...keys) }),
        defineField({ name: `${name}En`, title: `${title} (EN)`, type: "string", group: "blokken", fieldset: "en", hidden: only(...keys) }),
      ]
    : [
        defineField({ name, title: `${title} (NL)`, type: "text", rows: 3, group: "blokken", hidden: only(...keys) }),
        defineField({ name: `${name}En`, title: `${title} (EN)`, type: "text", rows: 3, group: "blokken", fieldset: "en", hidden: only(...keys) }),
      ];

const blok = {
  type: "object",
  name: "blok",
  fields: [
    defineField({ name: "kop", title: "Kop (NL)", type: "string", validation: verplicht }),
    defineField({ name: "tekst", title: "Tekst (NL)", type: "text", rows: 4, validation: verplicht }),
    defineField({ name: "kopEn", title: "Kop (EN)", type: "string" }),
    defineField({ name: "tekstEn", title: "Tekst (EN)", type: "text", rows: 4 }),
  ],
  preview: {
    select: { title: "kop", subtitle: "tekst" },
  },
} as const;

export default defineType({
  name: "pagina",
  title: "Pagina",
  type: "document",
  icon: DocumentTextIcon,
  description:
    "Titel, intro, foto en vaste teksten van deze pagina. De lijstjes (diensten, team, prijzen…) komen uit hun eigen records.",
  groups: [
    { name: "inhoud", title: "Tekst & foto", default: true },
    { name: "blokken", title: "Blokken" },
    { name: "seo", title: "SEO" },
  ],
  fieldsets: [EN_FIELDSET],
  fields: [
    defineField({
      name: "key",
      title: "Pagina",
      type: "string",
      readOnly: true,
      group: "inhoud",
      options: { list: PAGINAS.map((p) => ({ title: p.title, value: p.key })) },
      validation: verplicht,
    }),
    defineField({
      name: "ondertitel",
      title: "Kleine regel boven de titel (NL)",
      type: "string",
      group: "inhoud",
      hidden: only(...ONDERTITEL),
      description: "Bv. 'Kinesitherapie en personal training in Hasselt'.",
    }),
    defineField({ name: "ondertitelEn", title: "Kleine regel boven de titel (EN)", type: "string", group: "inhoud", fieldset: "en", hidden: only(...ONDERTITEL) }),
    defineField({ name: "titel", title: "Titel (H1, NL)", type: "string", group: "inhoud", validation: verplicht }),
    defineField({ name: "titelEn", title: "Titel (H1, EN)", type: "string", group: "inhoud", fieldset: "en" }),
    defineField({
      name: "slogan",
      title: "Slogan onder de titel (NL)",
      type: "string",
      group: "inhoud",
      hidden: only("groepslessen", "welkom"),
    }),
    defineField({ name: "sloganEn", title: "Slogan onder de titel (EN)", type: "string", group: "inhoud", fieldset: "en", hidden: only("groepslessen", "welkom") }),
    defineField({
      name: "intro",
      title: "Introtekst (NL)",
      type: "text",
      rows: 8,
      group: "inhoud",
      description:
        "Een lege regel = nieuwe alinea. Link: [tekst](https://…). Automatisch ingevuld: {kinesisten} en {trainers} (homepage), {aantal} (team), {basishonorarium} (prijzen), {email} (FAQ), {telefoon} (welkom).",
    }),
    defineField({ name: "introEn", title: "Introtekst (EN)", type: "text", rows: 8, group: "inhoud", fieldset: "en" }),
    defineField({
      name: "foto",
      title: "Hoofdfoto",
      type: "image",
      group: "inhoud",
      options: { hotspot: true },
      hidden: only("home", "over", "onze-visie", "kinesitherapie", "training", "mpc"),
      description: "Grote foto bovenaan. Leeg = de huidige foto van de site blijft staan. Kies een focuspunt op de persoon.",
    }),
    defineField({
      name: "fotoAlt",
      title: "Beschrijving van de foto (voor schermlezers en Google)",
      type: "string",
      group: "inhoud",
      hidden: only("home", "over", "onze-visie", "kinesitherapie", "training", "mpc"),
    }),
    defineField({
      name: "heroVideo",
      title: "Video bovenaan (in plaats van de foto)",
      type: "file",
      group: "inhoud",
      hidden: only("mpc"),
      options: { accept: "video/mp4,video/webm" },
      description:
        "Korte sfeervideo die geluidloos in een lus speelt op de plek van de hoofdfoto. Richtlijn: 10 à 20 seconden, liggend (16:9 of 4:3), maximaal 8 MB, geen geluid nodig. De hoofdfoto blijft het stilstaande beeld tot de video geladen is en voor bezoekers die bewegend beeld uitschakelen. Leeg = alleen de foto.",
    }),
    defineField({
      name: "fotoSecundair",
      title: "Tweede foto (verder op de pagina)",
      type: "cmsFoto",
      group: "inhoud",
      hidden: only("kinesitherapie", "training", "mpc"),
      description: "De foto naast de lijst met behandelingen of trainingen. Leeg = de huidige foto van de site blijft staan.",
    }),
    defineField({
      name: "bannerFoto",
      title: "Foto achter de slogan-banner",
      type: "cmsFoto",
      group: "inhoud",
      hidden: only("home"),
      description:
        "Brede sfeerfoto achter de slogan (‘Life has its ups and downs…’), tussen de partnerbalk en de drie pijlers. Kies een liggende foto en een focuspunt; er komt een donkerblauwe waas over. Leeg = de huidige foto blijft staan.",
    }),

    // --- Blocks per page -------------------------------------------------
    defineField({
      name: "blokken",
      title: "Tekstblokken onder de intro",
      type: "array",
      of: [blok],
      group: "blokken",
      hidden: only("over", "onze-visie", "kinesitherapie", "performance", "b2b", "groepslessen"),
      description: "Kop en tekst. Een regel die begint met '- ' wordt een opsomming.",
    }),
    defineField({
      name: "kenmerken",
      title: "Principes (maximaal zes kaartjes)",
      type: "array",
      of: [blok],
      group: "blokken",
      hidden: only("onze-visie"),
      validation: maxItems(6),
    }),
    defineField({
      name: "stappenTitel",
      title: "Titel boven de stappen (NL)",
      type: "string",
      group: "blokken",
      hidden: true,
    }),
    defineField({ name: "stappenTitelEn", title: "Titel boven de stappen (EN)", type: "string", group: "blokken", fieldset: "en", hidden: true }),
    defineField({ name: "stappenIntro", title: "Tekst boven de stappen (NL)", type: "text", rows: 3, group: "blokken", hidden: true }),
    defineField({ name: "stappenIntroEn", title: "Tekst boven de stappen (EN)", type: "text", rows: 3, group: "blokken", fieldset: "en", hidden: true }),
    defineField({
      name: "stappen",
      title: "Stappen van een eerste bezoek",
      type: "array",
      of: [blok],
      group: "blokken",
      hidden: true,
      description: "De nummering komt automatisch.",
    }),
    defineField({
      name: "pijlers",
      title: "Drie pijlers (Training, Sportrevalidatie, Groepslessen)",
      type: "array",
      of: [blok],
      group: "blokken",
      hidden: only("mpc"),
      validation: maxItems(3),
      description: "Alleen de titel en de korte tekst. De foto's en links komen automatisch uit de diensten.",
    }),
    defineField({
      name: "verwijsopties",
      title: "Contactformulier — ‘Hoe ben je bij ons terechtgekomen?’",
      type: "array",
      group: "blokken",
      hidden: only("contact"),
      description:
        "De keuzes in het contactformulier, in deze volgorde. Per keuze kies je of er een vervolgvraag komt (naam van de verwijzer, naam van de club, welk event, of een vrij tekstvak). Leeg = de standaardlijst van de oude website.",
      of: [
        {
          type: "object",
          name: "verwijsoptie",
          fields: [
            defineField({ name: "label", title: "Keuze (NL)", type: "string", validation: verplicht }),
            defineField({ name: "labelEn", title: "Keuze (EN)", type: "string" }),
            defineField({
              name: "vervolg",
              title: "Vervolgvraag",
              type: "string",
              initialValue: "geen",
              options: {
                list: [
                  { title: "Geen", value: "geen" },
                  { title: "Naam van de verwijzer (arts, specialist…)", value: "naam" },
                  { title: "Naam van de club", value: "club" },
                  { title: "Welk event of welke activiteit?", value: "event" },
                  { title: "Vrij tekstvak (extra info)", value: "tekst" },
                ],
                layout: "radio",
              },
            }),
          ],
          preview: {
            select: { title: "label", vervolg: "vervolg" },
            prepare({ title, vervolg }) {
              const labels: Record<string, string> = { naam: "→ naam", club: "→ club", event: "→ event", tekst: "→ tekst" };
              return { title, subtitle: labels[vervolg as string] || "" };
            },
          },
        },
      ],
    }),
    defineField({
      name: "legeTekst",
      title: "Tekst als de lijst leeg is (NL)",
      type: "text",
      rows: 3,
      group: "blokken",
      hidden: only("jobs", "blog", "events"),
      description: "Verschijnt als er geen vacatures, blogposts of events zijn. Bij vacatures wordt de eerste regel vet en komt het e-mailadres automatisch uit Site-instellingen.",
    }),
    defineField({ name: "legeTekstEn", title: "Tekst als de lijst leeg is (EN)", type: "text", rows: 3, group: "blokken", fieldset: "en", hidden: only("jobs", "blog", "events") }),
    ...tekstVeld("afsluiter", "Afsluitende zin onderaan", ["over", "onze-visie"], true),
    ...tekstVeld("extraTekst", "Tekst onder de blokken", ["groepslessen"]),
    ...tekstVeld("prijsNotitie", "Tekst bij de prijzen", ["groepslessen"]),
    ...tekstVeld("formulierIntro", "Tekst boven het inschrijfformulier", ["groepslessen"]),
    ...tekstVeld("terugbetalingTitel", "Terugbetaling — titel", ["prijzen"], true),
    ...tekstVeld("terugbetalingTekst", "Terugbetaling — uitleg", ["prijzen"]),
    ...tekstVeld("perTherapeutTitel", "Tarieven per therapeut of coach — titel", ["prijzen", "performance-prijzen"], true),
    ...tekstVeld("perTherapeutTekst", "Tarieven per therapeut — uitleg", ["prijzen"]),
    defineField({
      name: "ctaTekst",
      title: "Tekst op de knop onderaan (NL)",
      type: "string",
      group: "blokken",
      hidden: only("mpc-visie"),
    }),
    defineField({ name: "ctaTekstEn", title: "Tekst op de knop onderaan (EN)", type: "string", group: "blokken", fieldset: "en", hidden: only("mpc-visie") }),

    // --- SEO -----------------------------------------------------------
    defineField({
      name: "seoTitle",
      title: "SEO-titel (NL)",
      type: "string",
      group: "seo",
      description: "De titel in het browsertabblad en in Google. Hou het onder 60 tekens.",
      validation: googleTitel,
    }),
    defineField({ name: "seoDescription", title: "SEO-omschrijving (NL)", type: "text", rows: 2, group: "seo", validation: maxTekens(160, GOOGLE_OMSCHRIJVING) }),
    defineField({ name: "seoTitleEn", title: "SEO-titel (EN)", type: "string", group: "seo", fieldset: "en", validation: googleTitel }),
    defineField({ name: "seoDescriptionEn", title: "SEO-omschrijving (EN)", type: "text", rows: 2, group: "seo", fieldset: "en", validation: maxTekens(160, GOOGLE_OMSCHRIJVING) }),
  ],
  preview: {
    select: { key: "key", titel: "titel", media: "foto" },
    prepare({ key, titel, media }) {
      const page = PAGINAS.find((p) => p.key === key);
      return { title: page?.title || key || "Pagina", subtitle: titel, media };
    },
  },
});
