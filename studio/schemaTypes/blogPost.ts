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
    defineField({ name: "tags", title: "Tags", type: "array", of: [{ type: "string" }] }),
    defineField({ name: "seoTitle", title: "SEO-titel", type: "string", validation: (Rule) => Rule.max(60) }),
    defineField({ name: "seoDescription", title: "SEO-omschrijving", type: "text", rows: 2, validation: (Rule) => Rule.max(160) }),
  ],
  orderings: [
    { title: "Nieuwste eerst", name: "publicatiedatumDesc", by: [{ field: "publicatiedatum", direction: "desc" }] },
  ],
  preview: {
    select: { title: "titel", date: "publicatiedatum" },
    prepare({ title, date }) {
      return { title, subtitle: date };
    },
  },
});
