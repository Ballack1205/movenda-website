import { CalendarIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

const DAGEN = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];

export default defineType({
  name: "lesrooster",
  title: "Lesrooster (MPC)",
  type: "document",
  icon: CalendarIcon,
  description:
    "Groepslessen op MPC. Eén document per lesmoment. Verschijnt op /mpc/groepslessen. Coach en dienst koppelen is optioneel.",
  fields: [
    defineField({ name: "les", title: "Les", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "dag",
      title: "Dag",
      type: "string",
      options: { list: DAGEN },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "van",
      title: "Van (uu:mm)",
      type: "string",
      placeholder: "09:30",
      validation: (Rule) =>
        Rule.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: "tijd", invert: false }).error("Gebruik uu:mm, bv. 09:30."),
    }),
    defineField({
      name: "tot",
      title: "Tot (uu:mm)",
      type: "string",
      placeholder: "10:30",
      validation: (Rule) =>
        Rule.required().regex(/^([01]\d|2[0-3]):[0-5]\d$/, { name: "tijd", invert: false }).error("Gebruik uu:mm, bv. 10:30."),
    }),
    defineField({ name: "coach", title: "Coach", type: "reference", to: [{ type: "teamlid" }] }),
    defineField({ name: "dienst", title: "Gekoppelde dienst", type: "reference", to: [{ type: "dienst" }] }),
    defineField({
      name: "volgorde",
      title: "Volgorde",
      type: "number",
      initialValue: 0,
      description: "Lager nummer = eerder in de tabel die dag.",
    }),
  ],
  orderings: [
    { title: "Dag, uur", name: "dagVan", by: [{ field: "dag", direction: "asc" }, { field: "van", direction: "asc" }] },
  ],
  preview: {
    select: { title: "les", dag: "dag", van: "van", tot: "tot", coach: "coach.voornaam" },
    prepare({ title, dag, van, tot, coach }) {
      return { title, subtitle: [dag, van && tot ? `${van}–${tot}` : null, coach].filter(Boolean).join(" · ") };
    },
  },
});
