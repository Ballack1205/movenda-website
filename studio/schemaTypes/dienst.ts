import { defineField, defineType } from "sanity";

export default defineType({
  name: "dienst",
  title: "Dienst",
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
    defineField({
      name: "categorie",
      title: "Categorie",
      type: "string",
      options: {
        list: [
          { title: "Kinesitherapie (Olympia)", value: "kine" },
          { title: "Training (Olympia)", value: "training" },
          { title: "MPC — Training", value: "mpc-training" },
          { title: "MPC — Sportrevalidatie", value: "mpc-rehab" },
          { title: "MPC — Groepslessen", value: "mpc-groep" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "intro", title: "Korte intro", type: "text", rows: 2 }),
    defineField({ name: "slogan", title: "Slogan (optioneel)", type: "string" }),
    defineField({ name: "body", title: "Volledige tekst (NL)", type: "text", rows: 8 }),
    defineField({ name: "bodyEn", title: "Volledige tekst (EN)", type: "text", rows: 8 }),
    defineField({ name: "afbeelding", title: "Hoofdafbeelding", type: "image", options: { hotspot: true } }),
    defineField({
      name: "galerij",
      title: "Fotogalerij",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({ name: "ctaLabel", title: "CTA-tekst", type: "string" }),
    defineField({ name: "ctaUrl", title: "CTA-link", type: "string" }),
    defineField({
      name: "gekoppeldeTeamleden",
      title: "Begeleid door",
      type: "array",
      of: [{ type: "reference", to: [{ type: "teamlid" }] }],
    }),
    defineField({ name: "volgorde", title: "Volgorde", type: "number", initialValue: 0 }),
    defineField({ name: "seoTitle", title: "SEO-titel", type: "string", validation: (Rule) => Rule.max(70) }),
    defineField({ name: "seoDescription", title: "SEO-omschrijving", type: "text", rows: 2, validation: (Rule) => Rule.max(160) }),
  ],
  orderings: [{ title: "Volgorde", name: "volgordeAsc", by: [{ field: "volgorde", direction: "asc" }] }],
  preview: {
    select: { title: "titel", subtitle: "categorie" },
  },
});
