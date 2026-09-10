import { defineField, defineType } from "sanity";

export default defineType({
  name: "lesrooster",
  title: "Lesrooster (MPC)",
  type: "document",
  fields: [
    defineField({ name: "les", title: "Les", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "dag",
      title: "Dag",
      type: "string",
      options: {
        list: ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "van", title: "Van (uu:mm)", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "tot", title: "Tot (uu:mm)", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "coach", title: "Coach", type: "reference", to: [{ type: "teamlid" }] }),
    defineField({ name: "dienst", title: "Gekoppelde dienst", type: "reference", to: [{ type: "dienst" }] }),
    defineField({ name: "volgorde", title: "Volgorde", type: "number", initialValue: 0 }),
  ],
  preview: {
    select: { title: "les", dag: "dag", van: "van", tot: "tot" },
    prepare({ title, dag, van, tot }) {
      return { title, subtitle: `${dag} ${van}–${tot}` };
    },
  },
});
