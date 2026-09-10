import { defineField, defineType } from "sanity";

export default defineType({
  name: "blogPost",
  title: "Blogpost",
  type: "document",
  fields: [
    defineField({ name: "titel", title: "Titel (NL)", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "titelEn", title: "Titel (EN)", type: "string" }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "titel" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "excerpt", title: "Korte samenvatting (voor overzicht en SEO)", type: "text", rows: 2 }),
    defineField({
      name: "cover",
      title: "Coverfoto",
      type: "image",
      options: { hotspot: true },
      description:
        "Foto bovenaan het artikel en op het overzicht. Leeg laten mag — het team zet dan een fallback-foto klaar.",
    }),
    defineField({
      name: "coverFit",
      title: "Cover bijsnijden",
      type: "string",
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
      of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "bodyEn",
      title: "Inhoud (EN)",
      type: "array",
      of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "auteur",
      title: "Auteur",
      type: "reference",
      to: [{ type: "teamlid" }],
    }),
    defineField({
      name: "publicatiedatum",
      title: "Publicatiedatum",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Rugpijn", value: "rugpijn" },
          { title: "Nekpijn", value: "nekpijn" },
          { title: "Sportblessures", value: "sportblessures" },
          { title: "Training", value: "training" },
          { title: "Herstel", value: "herstel" },
          { title: "Preventie", value: "preventie" },
          { title: "Hitte", value: "hitte" },
          { title: "Mentale training", value: "mentale-training" },
        ],
        layout: "tags",
      },
      description:
        "Kies uit de lijst. Zelfde tags koppelen artikelen onderaan (‘Meer lezen’). Tag-pagina’s komen later.",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO-titel",
      type: "string",
      description: "Leeg = artikeltitel + ' | Movenda blog'. Hou het onder 60 tekens, anders kapt Google af.",
      validation: (Rule) => [Rule.max(70), Rule.max(60).warning("Google kapt titels boven ±60 tekens af.")],
    }),
    defineField({ name: "seoDescription", title: "SEO-omschrijving", type: "text", rows: 2, validation: (Rule) => Rule.max(160) }),
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
