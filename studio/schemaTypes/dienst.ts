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
    defineField({
      name: "prijs",
      title: "Prijs (prijsitem)",
      type: "reference",
      to: [{ type: "prijsitem" }],
      description:
        "Koppel het tarief dat bij deze dienst hoort. Wordt als prijs meegegeven in de structured data (zo kan Google/AI 'wat kost dry needling in Hasselt' beantwoorden). Niet ingevuld = we zoeken automatisch op naam.",
    }),
    defineField({ name: "volgorde", title: "Volgorde", type: "number", initialValue: 0 }),
    defineField({
      name: "seoTitle",
      title: "SEO-titel (NL)",
      type: "string",
      validation: (Rule) => [Rule.max(70), Rule.max(60).warning("Google kapt titels boven ±60 tekens af.")],
    }),
    defineField({
      name: "seoDescription",
      title: "SEO-omschrijving (NL)",
      type: "text",
      rows: 2,
      validation: (Rule) => Rule.max(160),
    }),
    defineField({
      name: "seoTitleEn",
      title: "SEO-titel (EN)",
      type: "string",
      description: "Leeg = automatisch 'Titel (EN) in Hasselt | Movenda' (of Performance Centre voor MPC).",
      validation: (Rule) => [Rule.max(70), Rule.max(60).warning("Google kapt titels boven ±60 tekens af.")],
    }),
    defineField({
      name: "seoDescriptionEn",
      title: "SEO-omschrijving (EN)",
      type: "text",
      rows: 2,
      description: "Leeg = eerste zin(nen) van de Engelse tekst.",
      validation: (Rule) => Rule.max(160),
    }),
  ],
  orderings: [{ title: "Volgorde", name: "volgordeAsc", by: [{ field: "volgorde", direction: "asc" }] }],
  preview: {
    select: { title: "titel", subtitle: "categorie" },
  },
});
