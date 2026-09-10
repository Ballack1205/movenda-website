import { defineField, defineType } from "sanity";

export default defineType({
  name: "prijsitem",
  title: "Prijs",
  type: "document",
  fields: [
    defineField({ name: "naam", title: "Behandeling / formule", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "categorie",
      title: "Categorie",
      type: "string",
      options: {
        list: [
          { title: "Kinesitherapie", value: "kine" },
          { title: "Personal Training", value: "training" },
          { title: "MPC", value: "mpc" },
          { title: "Screening / testen", value: "screening" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "bedrag", title: "Bedrag (€)", type: "number", validation: (Rule) => Rule.required() }),
    defineField({ name: "eenheid", title: "Eenheid (bv. '30 min')", type: "string" }),
    defineField({ name: "vanaf", title: "\"Vanaf\"-prijs (kan variëren per therapeut)", type: "boolean", initialValue: true }),
    defineField({ name: "opAanvraag", title: "Prijs op aanvraag (negeert bedrag)", type: "boolean", initialValue: false }),
    defineField({ name: "notitie", title: "Noot (bv. ex BTW, 10 lessen)", type: "string" }),
    defineField({ name: "volgorde", title: "Volgorde", type: "number", initialValue: 0 }),
  ],
  orderings: [
    { title: "Volgorde", name: "volgordeAsc", by: [{ field: "volgorde", direction: "asc" }] },
  ],
  preview: {
    select: { title: "naam", subtitle: "categorie", bedrag: "bedrag" },
    prepare({ title, subtitle, bedrag }) {
      return { title, subtitle: `${subtitle} — €${bedrag}` };
    },
  },
});
