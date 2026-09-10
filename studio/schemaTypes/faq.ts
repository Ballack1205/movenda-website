import { defineField, defineType } from "sanity";

export default defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({ name: "vraag", title: "Vraag (NL)", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "vraagEn", title: "Vraag (EN)", type: "string" }),
    defineField({ name: "antwoord", title: "Antwoord (NL)", type: "text", rows: 4, validation: (Rule) => Rule.required() }),
    defineField({ name: "antwoordEn", title: "Antwoord (EN)", type: "text", rows: 4 }),
    defineField({
      name: "categorie",
      title: "Categorie",
      type: "string",
      options: {
        list: [
          { title: "Behandelingen", value: "behandelingen" },
          { title: "Afspraken", value: "afspraken" },
          { title: "Praktisch", value: "praktisch" },
          { title: "Prijzen & terugbetaling", value: "prijzen" },
        ],
      },
    }),
    defineField({ name: "volgorde", title: "Volgorde", type: "number", initialValue: 0 }),
  ],
  orderings: [
    { title: "Volgorde", name: "volgordeAsc", by: [{ field: "volgorde", direction: "asc" }] },
  ],
});
