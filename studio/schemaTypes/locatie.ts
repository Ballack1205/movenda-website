import { defineField, defineType, type ConditionalPropertyCallbackContext } from "sanity";
import { EN_FIELDSET } from "./helpers";
import { verplicht, webadres } from "./regels";

function notOlympia({ document }: ConditionalPropertyCallbackContext) {
  const slug = (document as { slug?: { current?: string } | string } | undefined)?.slug;
  const current = typeof slug === "string" ? slug : slug?.current;
  return current !== "olympia";
}

const zin = {
  type: "object",
  name: "olympiaZin",
  fieldsets: [EN_FIELDSET],
  fields: [
    defineField({ name: "tekst", title: "Zin (NL)", type: "string", validation: verplicht }),
    defineField({ name: "tekstEn", title: "Zin (EN)", type: "string", fieldset: "en" }),
    defineField({
      name: "href",
      title: "Link (optioneel)",
      type: "string",
      description: "Alleen invullen als deze zin een link moet zijn, bv. de openingsuren van Olympia.",
    }),
  ],
  preview: { select: { title: "tekst" } },
} as const;

const aanbodItem = {
  type: "object",
  name: "olympiaAanbod",
  fieldsets: [EN_FIELDSET],
  fields: [
    defineField({ name: "titel", title: "Titel (NL)", type: "string", validation: verplicht }),
    defineField({ name: "titelEn", title: "Titel (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "tekst", title: "Korte tekst (NL)", type: "text", rows: 2, validation: verplicht }),
    defineField({ name: "tekstEn", title: "Korte tekst (EN)", type: "text", rows: 2, fieldset: "en" }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      description: "Pad op de site, bv. /kinesitherapie, of een volledige link.",
      validation: verplicht,
    }),
  ],
  preview: { select: { title: "titel", subtitle: "tekst" } },
} as const;

export default defineType({
  name: "locatie",
  title: "Locatie",
  type: "document",
  fields: [
    defineField({ name: "naam", title: "Naam", type: "string", validation: verplicht }),
    defineField({
      name: "korteNaam",
      title: "Korte naam",
      type: "string",
      description: "Bv. 'Olympia' of 'Performance Centre'. Gebruikt op teamkaarten en -pagina's waar de volledige naam te lang is. Leeg = volledige naam.",
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "naam" },
      validation: verplicht,
    }),
    defineField({
      name: "brand",
      title: "Huisstijl",
      type: "string",
      options: { list: [{ title: "Movenda (licht)", value: "movenda" }, { title: "MPC (donker)", value: "mpc" }] },
    }),
    defineField({ name: "type", title: "Type / ondertitel", type: "string" }),
    defineField({ name: "typeEn", title: "Type / ondertitel (EN)", type: "string" }),
    defineField({ name: "adres", title: "Adres", type: "string", validation: verplicht }),
    defineField({
      name: "geo",
      title: "GPS-coördinaten",
      type: "geopoint",
      description: "Belangrijk voor lokale SEO (LocalBusiness schema).",
    }),
    defineField({ name: "telefoon", title: "Telefoon", type: "string" }),
    defineField({ name: "email", title: "E-mail", type: "string" }),
    defineField({
      name: "uren",
      title: "Openingsuren",
      type: "array",
      of: [
        {
          type: "object",
          name: "openingsuur",
          fields: [
            { name: "dag", type: "string", title: "Dag" },
            { name: "van", type: "string", title: "Van (uu:mm)" },
            { name: "tot", type: "string", title: "Tot (uu:mm)" },
          ],
        },
      ],
    }),
    defineField({ name: "urenNote", title: "Extra noot bij openingsuren", type: "string" }),
    defineField({ name: "urenNoteEn", title: "Extra noot bij openingsuren (EN)", type: "string" }),
    defineField({ name: "btw", title: "BTW-nummer", type: "string" }),
    defineField({ name: "iban", title: "IBAN", type: "string" }),
    defineField({ name: "bic", title: "BIC", type: "string" }),
    defineField({ name: "mapsUrl", title: "Google Maps-link", type: "string", validation: webadres }),
    defineField({
      name: "googleBusinessUrl",
      title: "Google Bedrijfsprofiel-URL (deze vestiging)",
      type: "string",
      validation: webadres,
      description:
        "De vaste link naar jullie Google-vermelding (Google Maps → Delen → 'Link kopiëren', of de g.page/maps.app.goo.gl-link uit het Bedrijfsprofiel). Koppelt deze vestiging in de structured data aan Google Maps; belangrijk voor lokale SEO en AI-zoekmachines.",
    }),
    defineField({ name: "routebeschrijving", title: "Routebeschrijving eerste bezoek", type: "text", rows: 4 }),
    defineField({ name: "routebeschrijvingEn", title: "Routebeschrijving eerste bezoek (EN)", type: "text", rows: 4 }),
    defineField({
      name: "foto",
      title: "Foto van het gebouw / de ingang",
      type: "image",
      options: { hotspot: true },
      description:
        "Foto bij de routebeschrijving op Contact en de locatiepagina (bij Olympia: de sportieve ingang). Zonder upload toont de site de foto van de oude website.",
    }),
    defineField({ name: "rpr", title: "RPR", type: "string" }),
    defineField({ name: "instagram", title: "Instagram-URL (deze vestiging)", type: "string", validation: webadres }),
    defineField({ name: "facebook", title: "Facebook-URL (deze vestiging)", type: "string", validation: webadres }),
    defineField({ name: "verdiepingNote", title: "Verdieping / extra locatie-noot", type: "string" }),
    defineField({
      name: "olympiaPagina",
      title: "Tekst op de locatiepagina",
      type: "object",
      hidden: notOlympia,
      description:
        "De marketingtekst op de Olympia-pagina. Adres, uren en route staan hierboven. Een leeg veld toont de zin die er nu staat.",
      options: { collapsible: true, collapsed: false },
      fieldsets: [EN_FIELDSET],
      fields: [
        defineField({ name: "kicker", title: "Bovenkop (NL)", type: "string" }),
        defineField({ name: "kickerEn", title: "Bovenkop (EN)", type: "string", fieldset: "en" }),
        defineField({ name: "titel", title: "Titel (NL)", type: "string" }),
        defineField({ name: "titelEn", title: "Titel (EN)", type: "string", fieldset: "en" }),
        defineField({ name: "intro", title: "Intro (NL)", type: "text", rows: 3 }),
        defineField({ name: "introEn", title: "Intro (EN)", type: "text", rows: 3, fieldset: "en" }),
        defineField({
          name: "hoofdfoto",
          title: "Hoofdfoto",
          type: "image",
          options: { hotspot: true },
          description: "Staande foto rechts naast de titel, dezelfde plek als op Kinesitherapie. Leeg = de huidige foto van de site.",
        }),
        defineField({
          name: "hoofdfotoAlt",
          title: "Beschrijving van de hoofdfoto",
          type: "string",
          description: "Voor schermlezers en Google. De ingangsfoto bij de route blijft het veld hierboven.",
        }),
        defineField({ name: "cta", title: "Knop “Plan je afspraak” (NL)", type: "string" }),
        defineField({ name: "ctaEn", title: "Knop “Plan je afspraak” (EN)", type: "string", fieldset: "en" }),
        defineField({ name: "ctaHref", title: "Link van die knop", type: "string", description: "Leeg = /team#keuzehulp." }),
        defineField({ name: "aanbodLink", title: "Link “Bekijk het aanbod” (NL)", type: "string" }),
        defineField({ name: "aanbodLinkEn", title: "Link “Bekijk het aanbod” (EN)", type: "string", fieldset: "en" }),
        defineField({ name: "aboKicker", title: "Abonnement — titel (NL)", type: "string", description: "Bv. ‘Kiné-fitnessabonnement’." }),
        defineField({ name: "aboKickerEn", title: "Abonnement — titel (EN)", type: "string", fieldset: "en" }),
        defineField({ name: "aboTitel", title: "Abonnement — ondertitel (NL)", type: "string", description: "Kleinere zin onder de titel." }),
        defineField({ name: "aboTitelEn", title: "Abonnement — ondertitel (EN)", type: "string", fieldset: "en" }),
        defineField({ name: "aboTekst", title: "Abonnement — tekst (NL)", type: "text", rows: 3 }),
        defineField({ name: "aboTekstEn", title: "Abonnement — tekst (EN)", type: "text", rows: 3, fieldset: "en" }),
        defineField({
          name: "aboPunten",
          title: "Abonnement — opsomming",
          type: "array",
          of: [zin],
          description: "De openingsuren-regel heeft een link. Laat het linkveld leeg voor een gewone zin.",
        }),
        defineField({ name: "aboMeer", title: "“Meer info?” (NL)", type: "string" }),
        defineField({ name: "aboMeerEn", title: "“Meer info?” (EN)", type: "string", fieldset: "en" }),
        defineField({ name: "aboMeerNa", title: "Tekst na het e-mailadres (NL)", type: "string" }),
        defineField({ name: "aboMeerNaEn", title: "Tekst na het e-mailadres (EN)", type: "string", fieldset: "en" }),
        defineField({ name: "aboCta", title: "Knop naar het tarief (NL)", type: "string" }),
        defineField({ name: "aboCtaEn", title: "Knop naar het tarief (EN)", type: "string", fieldset: "en" }),
        defineField({ name: "aboCtaHref", title: "Link van die knop", type: "string", description: "Leeg = /kine-abonnement." }),
        defineField({ name: "aanbodTitel", title: "Kop “Overig aanbod” (NL)", type: "string" }),
        defineField({ name: "aanbodTitelEn", title: "Kop “Overig aanbod” (EN)", type: "string", fieldset: "en" }),
        defineField({ name: "aanbodMeer", title: "“Meer →” (NL)", type: "string" }),
        defineField({ name: "aanbodMeerEn", title: "“Meer →” (EN)", type: "string", fieldset: "en" }),
        defineField({ name: "olympiaLink", title: "Linktekst Olympia Hasselt", type: "string" }),
        defineField({ name: "olympiaUrl", title: "Link naar Olympia", type: "string" }),
        defineField({
          name: "aanbod",
          title: "Aanbod",
          type: "array",
          of: [aanbodItem],
          description: "De regels onder “Overig aanbod”. Leeg = de vijf huidige regels.",
        }),
        defineField({ name: "waaromTitel", title: "Kop “Waarom Olympia” (NL)", type: "string" }),
        defineField({ name: "waaromTitelEn", title: "Kop “Waarom Olympia” (EN)", type: "string", fieldset: "en" }),
        defineField({
          name: "waarom",
          title: "Waarom Olympia",
          type: "array",
          of: [zin],
        }),
        defineField({ name: "praktischTitel", title: "Kop “Praktisch” (NL)", type: "string" }),
        defineField({ name: "praktischTitelEn", title: "Kop “Praktisch” (EN)", type: "string", fieldset: "en" }),
        defineField({ name: "seoTitel", title: "SEO-titel (NL)", type: "string" }),
        defineField({ name: "seoTitelEn", title: "SEO-titel (EN)", type: "string", fieldset: "en" }),
        defineField({ name: "seoBeschrijving", title: "SEO-omschrijving (NL)", type: "text", rows: 2 }),
        defineField({ name: "seoBeschrijvingEn", title: "SEO-omschrijving (EN)", type: "text", rows: 2, fieldset: "en" }),
      ],
    }),
  ],
  preview: {
    select: { title: "naam", subtitle: "adres", media: "foto" },
  },
});
