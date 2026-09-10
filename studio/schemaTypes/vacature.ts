import { defineField, defineType } from "sanity";

// Currently empty in production: the old /join page never had real vacancy
// content (it was still Squarespace demo copy). Julie adds real vacancies
// here when there's an actual opening; the /jobs page shows a graceful
// "geen vacatures op dit moment" state when this list is empty.
export default defineType({
  name: "vacature",
  title: "Vacature",
  type: "document",
  fields: [
    defineField({ name: "titel", title: "Functietitel", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "titel" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "locatie",
      title: "Locatie",
      type: "reference",
      to: [{ type: "locatie" }],
    }),
    defineField({ name: "omschrijving", title: "Omschrijving", type: "text", rows: 8, validation: (Rule) => Rule.required() }),
    defineField({ name: "contactEmail", title: "Solliciteren via e-mail", type: "string", initialValue: "info@movenda.be" }),
    defineField({ name: "actief", title: "Actief (tonen op de site)", type: "boolean", initialValue: true }),
  ],
});
