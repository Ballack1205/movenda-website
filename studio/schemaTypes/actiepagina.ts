import { BulbOutlineIcon } from "@sanity/icons";
import { EN_FIELDSET } from "./helpers";
import { defineArrayMember, defineField, defineType } from "sanity";

// Landing page for a campaign or event (Dwars door Hasselt Ready / Recovery).
// Lives at movenda.be/<slug>. Julie fills the texts and photos; the layout
// (black, same style as Ons verhaal) stays in code. A section without text,
// tips, box or photo is not shown, so she can prepare a page step by step.

// Top-level URLs that already belong to a fixed page of the site.
const BEZET = new Set([
  "b2b", "blog", "bookappointment", "contact", "en", "events", "faq", "groepslessen", "index", "jobs",
  "kine-abonnement", "kinesitherapie", "locaties", "movenda-kinesitherapie", "mpc", "over", "over-ons", "performance", "prijzen",
  "privacy", "team", "training", "voorwaarden", "welkom", "zoeken", "rss.xml", "llms.txt", "robots.txt",
]);

const item = defineArrayMember({
  type: "object",
  name: "actieItem",
  title: "Kaartje",
  fields: [
    defineField({ name: "label", title: "Kleine regel boven de kop", type: "string", description: "Bv. 'Voor de start'. Mag leeg." }),
    defineField({ name: "labelEn", title: "Kleine regel boven de kop (EN)", type: "string" }),
    defineField({ name: "kop", title: "Kop", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "kopEn", title: "Kop (EN)", type: "string" }),
    defineField({ name: "tekst", title: "Tekst", type: "text", rows: 4 }),
    defineField({ name: "tekstEn", title: "Tekst (EN)", type: "text", rows: 4 }),
    defineField({
      name: "video",
      title: "Video (link naar YouTube of Vimeo)",
      type: "url",
      description: "Bv. een oefening voor thuis. Plak de gewone link van de video; de site toont de speler.",
    }),
  ],
  preview: { select: { title: "kop", subtitle: "label" } },
});

const sectie = defineArrayMember({
  type: "object",
  name: "actieSectie",
  title: "Blok",
  fields: [
    defineField({ name: "kicker", title: "Kleine regel boven de titel", type: "string", description: "Bv. 'Na de finish stopt het niet.'" }),
    defineField({ name: "kickerEn", title: "Kleine regel boven de titel (EN)", type: "string" }),
    defineField({ name: "titel", title: "Titel", type: "string" }),
    defineField({ name: "titelEn", title: "Titel (EN)", type: "string" }),
    defineField({ name: "tekst", title: "Tekst", type: "text", rows: 6, description: "Een lege regel = nieuwe alinea." }),
    defineField({ name: "tekstEn", title: "Tekst (EN)", type: "text", rows: 6 }),
    defineField({
      name: "items",
      title: "Kaartjes (tips, stappen, oefeningen)",
      type: "array",
      of: [item],
    }),
    defineField({ name: "kaderTitel", title: "Kader: titel", type: "string", description: "Een opvallend vak, bv. 'Tip van onze kinesitherapeuten' of de praktische info." }),
    defineField({ name: "kaderTitelEn", title: "Kader: titel (EN)", type: "string" }),
    defineField({ name: "kaderTekst", title: "Kader: tekst", type: "text", rows: 4, description: "Elke regel wordt een aparte lijn." }),
    defineField({ name: "kaderTekstEn", title: "Kader: tekst (EN)", type: "text", rows: 4 }),
    defineField({ name: "foto", title: "Foto bij dit blok", type: "cmsFoto" }),
    defineField({ name: "knopLabel", title: "Knop: tekst", type: "string" }),
    defineField({ name: "knopLabelEn", title: "Knop: tekst (EN)", type: "string" }),
    defineField({ name: "knopUrl", title: "Knop: link", type: "string", description: "Bv. /team#keuzehulp, /contact of https://…" }),
    defineField({ name: "knop2Label", title: "Tweede knop: tekst", type: "string", description: "Mag leeg. Staat naast de eerste knop, bv. 'Stel je vraag'." }),
    defineField({ name: "knop2LabelEn", title: "Tweede knop: tekst (EN)", type: "string" }),
    defineField({ name: "knop2Url", title: "Tweede knop: link", type: "string", description: "Bv. /contact of mailto:info@movenda.be." }),
  ],
  preview: {
    select: { title: "titel", subtitle: "kicker" },
    prepare({ title, subtitle }) {
      return { title: title || subtitle || "Blok", subtitle: title ? subtitle : undefined };
    },
  },
});

export default defineType({
  name: "actiepagina",
  title: "Actiepagina",
  type: "document",
  icon: BulbOutlineIcon,
  description: "Een losse pagina voor een actie of event, bv. Dwars door Hasselt. Staat op movenda.be/<slug>, niet in het menu.",
  groups: [
    { name: "inhoud", title: "Bovenaan", default: true },
    { name: "blokken", title: "Blokken" },
    { name: "seo", title: "SEO" },
  ],
  fieldsets: [EN_FIELDSET],
  fields: [
    defineField({ name: "titel", title: "Titel (H1)", type: "string", group: "inhoud", validation: (Rule) => Rule.required() }),
    defineField({ name: "titelEn", title: "Titel (H1, EN)", type: "string", group: "inhoud", fieldset: "en" }),
    defineField({
      name: "slug",
      title: "Adres (movenda.be/…)",
      type: "slug",
      group: "inhoud",
      options: { source: "titel" },
      description: "Bv. ddh-ready. Dit adres staat op flyers of QR-codes: na publicatie niet meer wijzigen.",
      validation: (Rule) =>
        Rule.required().custom((value) =>
          value?.current && BEZET.has(value.current) ? "Dit adres is al van een andere pagina van de site." : true,
        ),
    }),
    defineField({ name: "kicker", title: "Kleine regel boven de titel", type: "string", group: "inhoud", description: "Bv. 'Dwars door Hasselt x Sportpraktijk Movenda'." }),
    defineField({ name: "kickerEn", title: "Kleine regel boven de titel (EN)", type: "string", group: "inhoud", fieldset: "en" }),
    defineField({ name: "slogan", title: "Slogan onder de titel", type: "string", group: "inhoud" }),
    defineField({ name: "sloganEn", title: "Slogan onder de titel (EN)", type: "string", group: "inhoud", fieldset: "en" }),
    defineField({ name: "intro", title: "Introtekst", type: "text", rows: 5, group: "inhoud", description: "Een lege regel = nieuwe alinea." }),
    defineField({ name: "introEn", title: "Introtekst (EN)", type: "text", rows: 5, group: "inhoud", fieldset: "en" }),
    defineField({ name: "datumRegel", title: "Datum en plaats", type: "string", group: "inhoud", description: "Bv. '11 oktober 2026 · Kolonel Dusartplein · Hasselt'." }),
    defineField({ name: "datumRegelEn", title: "Datum en plaats (EN)", type: "string", group: "inhoud", fieldset: "en" }),
    defineField({ name: "foto", title: "Grote foto bovenaan", type: "cmsFoto", group: "inhoud" }),
    defineField({ name: "logo", title: "Logo van de partner of het event", type: "image", group: "inhoud" }),
    defineField({ name: "logoNaam", title: "Naam bij het logo", type: "string", group: "inhoud", description: "Voor schermlezers, bv. 'Dwars door Hasselt'." }),
    defineField({ name: "logoUrl", title: "Link van het logo", type: "url", group: "inhoud" }),

    defineField({ name: "secties", title: "Blokken (van boven naar onder)", type: "array", of: [sectie], group: "blokken" }),
    defineField({
      name: "galerij",
      title: "Foto's (bewegende strook)",
      type: "array",
      of: [defineArrayMember({ type: "cmsFoto" })],
      group: "blokken",
      description: "Foto's van het event. Ze schuiven onderaan voorbij, zoals de partnerlogo's.",
    }),
    defineField({ name: "afsluiter", title: "Afsluitende zin onderaan", type: "text", rows: 2, group: "blokken", description: "Elke regel wordt een aparte lijn." }),
    defineField({ name: "afsluiterEn", title: "Afsluitende zin onderaan (EN)", type: "text", rows: 2, group: "blokken", fieldset: "en" }),

    defineField({
      name: "zichtbaarInGoogle",
      title: "Zichtbaar in Google",
      type: "boolean",
      group: "seo",
      initialValue: true,
      description: "Uit = de pagina werkt via de link of QR-code, maar Google toont ze niet. Handig zolang ze nog niet af is.",
    }),
    defineField({ name: "seoTitle", title: "Titel in Google", type: "string", group: "seo", validation: (Rule) => Rule.max(60).warning("Google kort titels boven 60 tekens af.") }),
    defineField({ name: "seoTitleEn", title: "Titel in Google (EN)", type: "string", group: "seo", fieldset: "en" }),
    defineField({ name: "seoDescription", title: "Omschrijving in Google", type: "text", rows: 3, group: "seo", validation: (Rule) => Rule.max(160).warning("Google kort omschrijvingen boven 160 tekens af.") }),
    defineField({ name: "seoDescriptionEn", title: "Omschrijving in Google (EN)", type: "text", rows: 3, group: "seo", fieldset: "en" }),
  ],
  preview: {
    select: { title: "titel", slug: "slug.current", media: "foto.afbeelding" },
    prepare({ title, slug, media }) {
      return { title, subtitle: slug ? `movenda.be/${slug}` : "Nog geen adres", media };
    },
  },
});
