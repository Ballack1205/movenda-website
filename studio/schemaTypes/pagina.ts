import { DocumentTextIcon } from "@sanity/icons";
import { defineField, defineType, type ConditionalPropertyCallbackContext } from "sanity";
import { EN_FIELDSET } from "./helpers";

// Copy of the fixed pages (home, over, kine, …). One document per page, fixed
// `key`, never created or deleted from the Studio. Julie edits the H1, intro,
// hero photo, SEO and the text blocks that used to be hardcoded in Astro.
// Layout stays in code; which blocks a page shows follows from its key.

export const PAGINAS = [
  { key: "home", title: "Homepage", path: "/" },
  { key: "over", title: "Over ons", path: "/over" },
  { key: "kinesitherapie", title: "Kinesitherapie (overzicht)", path: "/kinesitherapie" },
  { key: "training", title: "Training (overzicht)", path: "/training" },
  { key: "mpc", title: "MPC (overzicht)", path: "/mpc" },
  { key: "mpc-visie", title: "MPC — Visie", path: "/mpc/visie" },
  { key: "contact", title: "Contact", path: "/contact" },
  { key: "jobs", title: "Vacatures", path: "/jobs" },
] as const;

export type PaginaKey = (typeof PAGINAS)[number]["key"];

// Field only shown on the listed pages.
const only =
  (...keys: PaginaKey[]) =>
  ({ document }: ConditionalPropertyCallbackContext) =>
    !keys.includes(((document as { key?: string } | undefined)?.key || "") as PaginaKey);

const blok = {
  type: "object",
  name: "blok",
  fields: [
    defineField({ name: "kop", title: "Kop (NL)", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "tekst", title: "Tekst (NL)", type: "text", rows: 4, validation: (Rule) => Rule.required() }),
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "ondertitel",
      title: "Kleine regel boven de titel (NL)",
      type: "string",
      group: "inhoud",
      hidden: only("home"),
      description: "Bv. 'Kinesitherapie en personal training in Hasselt'.",
    }),
    defineField({ name: "ondertitelEn", title: "Kleine regel boven de titel (EN)", type: "string", group: "inhoud", fieldset: "en", hidden: only("home") }),
    defineField({ name: "titel", title: "Titel (H1, NL)", type: "string", group: "inhoud", validation: (Rule) => Rule.required() }),
    defineField({ name: "titelEn", title: "Titel (H1, EN)", type: "string", group: "inhoud", fieldset: "en" }),
    defineField({
      name: "intro",
      title: "Introtekst (NL)",
      type: "text",
      rows: 8,
      group: "inhoud",
      description:
        "Een lege regel = nieuwe alinea. Op de homepage mag je {kinesisten} en {trainers} gebruiken; de site vult de aantallen in.",
    }),
    defineField({ name: "introEn", title: "Introtekst (EN)", type: "text", rows: 8, group: "inhoud", fieldset: "en" }),
    defineField({
      name: "foto",
      title: "Hoofdfoto",
      type: "image",
      group: "inhoud",
      options: { hotspot: true },
      hidden: only("home", "over", "kinesitherapie", "training", "mpc"),
      description: "Grote foto bovenaan. Leeg = de huidige foto van de site blijft staan. Kies een focuspunt op de persoon.",
    }),
    defineField({
      name: "fotoAlt",
      title: "Beschrijving van de foto (voor schermlezers en Google)",
      type: "string",
      group: "inhoud",
      hidden: only("home", "over", "kinesitherapie", "training", "mpc"),
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
      title: "Uitklapblokken (Movenda Rehabilitation, Training, MPC, Partnerships…)",
      type: "array",
      of: [blok],
      group: "blokken",
      hidden: only("over"),
    }),
    defineField({
      name: "kenmerken",
      title: "Kenmerken (zes korte kaartjes)",
      type: "array",
      of: [blok],
      group: "blokken",
      hidden: only("over"),
      validation: (Rule) => Rule.max(6),
    }),
    defineField({
      name: "stappenTitel",
      title: "Titel boven de stappen (NL)",
      type: "string",
      group: "blokken",
      hidden: only("over"),
    }),
    defineField({ name: "stappenTitelEn", title: "Titel boven de stappen (EN)", type: "string", group: "blokken", fieldset: "en", hidden: only("over") }),
    defineField({ name: "stappenIntro", title: "Tekst boven de stappen (NL)", type: "text", rows: 3, group: "blokken", hidden: only("over") }),
    defineField({ name: "stappenIntroEn", title: "Tekst boven de stappen (EN)", type: "text", rows: 3, group: "blokken", fieldset: "en", hidden: only("over") }),
    defineField({
      name: "stappen",
      title: "Stappen van een eerste bezoek",
      type: "array",
      of: [blok],
      group: "blokken",
      hidden: only("over"),
      description: "De nummering komt automatisch.",
    }),
    defineField({
      name: "pijlers",
      title: "Drie pijlers (Training, Sportrevalidatie, Groepslessen)",
      type: "array",
      of: [blok],
      group: "blokken",
      hidden: only("mpc"),
      validation: (Rule) => Rule.max(3),
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
            defineField({ name: "label", title: "Keuze (NL)", type: "string", validation: (Rule) => Rule.required() }),
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
      title: "Tekst als er geen vacatures zijn (NL)",
      type: "text",
      rows: 3,
      group: "blokken",
      hidden: only("jobs"),
      description: "De eerste regel wordt vet. Het e-mailadres komt automatisch uit Site-instellingen.",
    }),
    defineField({ name: "legeTekstEn", title: "Tekst als er geen vacatures zijn (EN)", type: "text", rows: 3, group: "blokken", fieldset: "en", hidden: only("jobs") }),
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
      validation: (Rule) => [Rule.max(70), Rule.max(60).warning("Google kapt titels boven ±60 tekens af.")],
    }),
    defineField({ name: "seoDescription", title: "SEO-omschrijving (NL)", type: "text", rows: 2, group: "seo", validation: (Rule) => Rule.max(160) }),
    defineField({ name: "seoTitleEn", title: "SEO-titel (EN)", type: "string", group: "seo", fieldset: "en", validation: (Rule) => [Rule.max(70), Rule.max(60).warning("Google kapt titels boven ±60 tekens af.")] }),
    defineField({ name: "seoDescriptionEn", title: "SEO-omschrijving (EN)", type: "text", rows: 2, group: "seo", fieldset: "en", validation: (Rule) => Rule.max(160) }),
  ],
  preview: {
    select: { key: "key", titel: "titel", media: "foto" },
    prepare({ key, titel, media }) {
      const page = PAGINAS.find((p) => p.key === key);
      return { title: page?.title || key || "Pagina", subtitle: titel, media };
    },
  },
});
