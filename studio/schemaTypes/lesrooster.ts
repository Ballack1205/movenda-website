import { CalendarIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { tijd, verplicht } from "./regels";

export const DAGEN = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];

export default defineType({
  name: "lesrooster",
  title: "Les (lesrooster MPC)",
  type: "document",
  icon: CalendarIcon,
  description:
    "Eén document per lesmoment. Verschijnt in het lesrooster op /groepslessen, per dag gesorteerd op uur. Seizoensles even niet geven? Zet ‘Op de site’ uit in plaats van te verwijderen.",
  fields: [
    defineField({
      name: "les",
      title: "Naam van de les",
      type: "string",
      description: "Zoals op het rooster, bv. ‘Boxing’ of ‘Boxen jeugd’.",
      validation: verplicht,
    }),
    defineField({
      name: "dag",
      title: "Dag",
      type: "string",
      options: { list: DAGEN, layout: "radio", direction: "horizontal" },
      validation: verplicht,
    }),
    defineField({
      name: "van",
      title: "Van (uu:mm)",
      type: "string",
      placeholder: "09:30",
      validation: (Rule) => [verplicht(Rule), tijd("09:30")(Rule)],
    }),
    defineField({
      name: "tot",
      title: "Tot (uu:mm)",
      type: "string",
      placeholder: "10:30",
      validation: (Rule) => [verplicht(Rule), tijd("10:30")(Rule)],
    }),
    defineField({
      name: "coach",
      title: "Coach",
      type: "reference",
      to: [{ type: "teamlid" }],
      options: { filter: "actief != false" },
      description: "Staat achter de les op het rooster, bv. ‘Boxing — Dimitri’.",
    }),
    defineField({
      name: "zichtbaar",
      title: "Op de site",
      type: "boolean",
      initialValue: true,
      description: "Uit = deze les staat tijdelijk niet op het rooster. Volgend seizoen gewoon weer aanzetten.",
    }),
    defineField({
      name: "dienst",
      title: "Gekoppelde dienst (optioneel)",
      type: "reference",
      to: [{ type: "dienst" }],
      description: "Maakt de les op het rooster klikbaar naar de pagina van die groepsles.",
    }),
    defineField({ name: "lesEn", title: "Naam van de les (EN)", type: "string", description: "Leeg = de Nederlandse naam." }),
    defineField({ name: "volgorde", type: "number", hidden: true }),
  ],
  initialValue: { zichtbaar: true },
  orderings: [
    { title: "Uur", name: "van", by: [{ field: "van", direction: "asc" }] },
  ],
  preview: {
    select: { title: "les", dag: "dag", van: "van", tot: "tot", coach: "coach.voornaam", zichtbaar: "zichtbaar" },
    prepare({ title, dag, van, tot, coach, zichtbaar }) {
      return {
        title: zichtbaar === false ? `${title} (niet op de site)` : title,
        subtitle: [dag, van && tot ? `${van}–${tot}` : null, coach].filter(Boolean).join(" · "),
      };
    },
  },
});
