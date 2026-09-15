import { ComposeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { EN_FIELDSET, SLUG_DESCRIPTION } from "./helpers";

const BLOG_TAGS = [
  { title: "Rugpijn", value: "rugpijn" },
  { title: "Nekpijn", value: "nekpijn" },
  { title: "Sportblessures", value: "sportblessures" },
  { title: "Training", value: "training" },
  { title: "Herstel", value: "herstel" },
  { title: "Preventie", value: "preventie" },
  { title: "Hitte", value: "hitte" },
  { title: "Mentale training", value: "mentale-training" },
] as const;

const BLOG_TAG_VALUES = new Set<string>(BLOG_TAGS.map((tag) => tag.value));

export default defineType({
  name: "blogPost",
  title: "Blogpost",
  type: "document",
  icon: ComposeIcon,
  description:
    "Nieuw artikel = Nieuw document. Titel, tekst, coverfoto, datum, publiceren. De site herbouwt daarna vanzelf. Vertrekken van een bestaand artikel? Open het en kies ‘Dupliceren als nieuw concept’ (pijltje naast Publiceren of ⋮ bovenaan).",
  groups: [
    { name: "inhoud", title: "Artikel", default: true },
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
    defineField({ name: "excerpt", title: "Korte samenvatting (NL)", type: "text", rows: 2, group: "inhoud" }),
    defineField({ name: "excerptEn", title: "Korte samenvatting (EN)", type: "text", rows: 2, group: "inhoud", fieldset: "en" }),
    defineField({
      name: "cover",
      title: "Coverfoto",
      type: "image",
      group: "inhoud",
      options: { hotspot: true },
      description:
        "Foto bovenaan het artikel en op het overzicht. Leeg laten mag — het team zet dan een fallback-foto klaar.",
    }),
    defineField({
      name: "coverFit",
      title: "Cover bijsnijden",
      type: "string",
      group: "inhoud",
      options: {
        list: [
          { title: "Invullen (foto)", value: "cover" },
          { title: "Volledig tonen (screenshot)", value: "contain" },
        ],
        layout: "radio",
      },
      initialValue: "cover",
      description: "Kies ‘Volledig tonen’ voor een screenshot of infographic die niet mag worden afgesneden.",
    }),
    defineField({
      name: "body",
      title: "Inhoud (NL)",
      type: "array",
      group: "inhoud",
      of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "bodyEn",
      title: "Inhoud (EN)",
      type: "array",
      group: "inhoud",
      fieldset: "en",
      of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "auteur",
      title: "Auteur",
      type: "reference",
      group: "inhoud",
      to: [{ type: "teamlid" }],
    }),
    defineField({
      name: "publicatiedatum",
      title: "Publicatiedatum",
      type: "date",
      group: "inhoud",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      group: "inhoud",
      of: [{ type: "string" }],
      options: {
        list: [...BLOG_TAGS],
        layout: "tags",
      },
      description:
        "Kies uit de lijst. Zelfde tags koppelen artikelen onderaan (‘Meer lezen’). Tag-pagina’s komen later.",
      validation: (Rule) =>
        Rule.custom((tags) => {
          if (!tags) return true;
          const unknown = tags.filter((tag): tag is string => typeof tag === "string" && !BLOG_TAG_VALUES.has(tag));
          return unknown.length ? `Onbekende tag(s): ${unknown.join(", ")}. Kies tags uit de lijst.` : true;
        }),
    }),
    defineField({
      name: "gerelateerdeDiensten",
      title: "Gaat over deze behandelingen / trainingen",
      type: "array",
      group: "inhoud",
      of: [{ type: "reference", to: [{ type: "dienst" }] }],
      validation: (Rule) => Rule.max(3).unique(),
      description:
        "Koppel 1 à 3 diensten. Onder het artikel komen dan knoppen naar die pagina’s, en op de dienstpagina verschijnt dit artikel onder ‘Lees ook’. Zo helpt elke blog de behandelpagina’s hoger in Google (bv. een artikel over dry needling → dienst Dry needling).",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO-titel",
      type: "string",
      group: "seo",
      description: "Leeg = artikeltitel + ' | Movenda blog'. Hou het onder 60 tekens, anders kapt Google af.",
      validation: (Rule) => [Rule.max(70), Rule.max(60).warning("Google kapt titels boven ±60 tekens af.")],
    }),
    defineField({
      name: "seoDescription",
      title: "SEO-omschrijving",
      type: "text",
      group: "seo",
      rows: 2,
      validation: (Rule) => Rule.max(160),
    }),
  ],
  orderings: [
    { title: "Nieuwste eerst", name: "publicatiedatumDesc", by: [{ field: "publicatiedatum", direction: "desc" }] },
  ],
  preview: {
    select: { title: "titel", date: "publicatiedatum", media: "cover" },
    prepare({ title, date, media }) {
      return { title, subtitle: date, media };
    },
  },
});
