import { DocumentsIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { EN_FIELDSET, SLUG_DESCRIPTION } from "./helpers";

const CATEGORIEEN = [
  { title: "Kinesitherapie (Olympia)", value: "kine" },
  { title: "Training (Olympia)", value: "training" },
  { title: "MPC — Training", value: "mpc-training" },
  { title: "MPC — Sportrevalidatie", value: "mpc-rehab" },
  { title: "MPC — Groepslessen", value: "mpc-groep" },
] as const;

export default defineType({
  name: "dienst",
  title: "Dienst",
  type: "document",
  icon: DocumentsIcon,
  description:
    "Behandeling of training met een eigen pagina. Titel, tekst en foto hier; de layout blijft in de code. Een nieuwe dienst verschijnt automatisch in het menu onder haar categorie. Snel starten? Open een gelijkaardige dienst en kies ‘Dupliceren als nieuw concept’.",
  groups: [
    { name: "inhoud", title: "Dienst", default: true },
    { name: "seo", title: "SEO" },
  ],
  fieldsets: [EN_FIELDSET],
  fields: [
    defineField({ name: "titel", title: "Titel (NL)", type: "string", group: "inhoud", validation: (Rule) => Rule.required() }),
    defineField({ name: "titelEn", title: "Titel (EN)", type: "string", group: "inhoud", fieldset: "en" }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      group: "inhoud",
      options: { source: "titel" },
      description: SLUG_DESCRIPTION,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "categorie",
      title: "Categorie",
      type: "string",
      group: "inhoud",
      options: { list: [...CATEGORIEEN] },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "intro", title: "Korte intro", type: "text", rows: 2, group: "inhoud" }),
    defineField({ name: "slogan", title: "Slogan (optioneel)", type: "string", group: "inhoud" }),
    defineField({ name: "body", title: "Volledige tekst (NL)", type: "text", rows: 8, group: "inhoud" }),
    defineField({ name: "bodyEn", title: "Volledige tekst (EN)", type: "text", rows: 8, group: "inhoud", fieldset: "en" }),
    defineField({ name: "afbeelding", title: "Hoofdafbeelding", type: "image", group: "inhoud", options: { hotspot: true } }),
    defineField({
      name: "galerij",
      title: "Fotogalerij",
      type: "array",
      group: "inhoud",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({ name: "ctaLabel", title: "CTA-tekst", type: "string", group: "inhoud" }),
    defineField({ name: "ctaUrl", title: "CTA-link", type: "string", group: "inhoud" }),
    defineField({
      name: "gekoppeldeTeamleden",
      title: "Begeleid door",
      type: "array",
      group: "inhoud",
      of: [{ type: "reference", to: [{ type: "teamlid" }] }],
    }),
    defineField({
      name: "prijs",
      title: "Prijs (prijsitem)",
      type: "reference",
      group: "inhoud",
      to: [{ type: "prijsitem" }],
      description:
        "Koppel het tarief dat bij deze dienst hoort. Wordt als prijs meegegeven in de structured data (zo kan Google/AI 'wat kost dry needling in Hasselt' beantwoorden). Niet ingevuld = we zoeken automatisch op naam.",
    }),
    defineField({ name: "volgorde", title: "Volgorde", type: "number", initialValue: 0, group: "inhoud" }),
    defineField({
      name: "toonInMenu",
      title: "Tonen in het menu",
      type: "boolean",
      group: "inhoud",
      initialValue: true,
      description:
        "Uit = de pagina blijft bestaan, maar verdwijnt uit het menu én uit de prijslijst. Zo pauzer je een rubriek (bv. acupunctuur) zonder de pagina te wissen.",
    }),
    defineField({
      name: "menuLabel",
      title: "Korte naam voor het menu (optioneel)",
      type: "string",
      group: "inhoud",
      description: "Leeg = de titel. Handig als de titel te lang is voor het uitklapmenu, bv. ‘Pre- en postnataal’.",
      validation: (Rule) => Rule.max(32).warning("Hou het kort, anders past het niet in het menu."),
    }),
    defineField({ name: "menuLabelEn", title: "Korte naam voor het menu (EN)", type: "string", group: "inhoud", fieldset: "en" }),
    defineField({
      name: "seoTitle",
      title: "SEO-titel (NL)",
      type: "string",
      group: "seo",
      validation: (Rule) => [Rule.max(70), Rule.max(60).warning("Google kapt titels boven ±60 tekens af.")],
    }),
    defineField({
      name: "seoDescription",
      title: "SEO-omschrijving (NL)",
      type: "text",
      group: "seo",
      rows: 2,
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: "seoTitleEn",
      title: "SEO-titel (EN)",
      type: "string",
      group: "seo",
      fieldset: "en",
      description: "Leeg = automatisch 'Titel (EN) in Hasselt | Movenda' (of Performance Centre voor MPC).",
      validation: (Rule) => [Rule.max(70), Rule.max(60).warning("Google kapt titels boven ±60 tekens af.")],
    }),
    defineField({
      name: "seoDescriptionEn",
      title: "SEO-omschrijving (EN)",
      type: "text",
      group: "seo",
      fieldset: "en",
      rows: 2,
      description: "Leeg = eerste zin(nen) van de Engelse tekst.",
      validation: (Rule) => Rule.max(160),
    }),
  ],
  orderings: [{ title: "Volgorde", name: "volgordeAsc", by: [{ field: "volgorde", direction: "asc" }] }],
  preview: {
    select: { title: "titel", categorie: "categorie", media: "afbeelding" },
    prepare({ title, categorie, media }) {
      const cat = CATEGORIEEN.find((item) => item.value === categorie)?.title || categorie;
      return { title, subtitle: cat, media };
    },
  },
});
