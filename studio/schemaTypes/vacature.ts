import { CaseIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { SLUG_DESCRIPTION } from "./helpers";

// Currently empty in production: the old /join page never had real vacancy
// content (it was still Squarespace demo copy). Julie adds real vacancies
// here when there's an actual opening; the /jobs page shows a graceful
// "geen vacatures op dit moment" state when this list is empty.
export default defineType({
  name: "vacature",
  title: "Vacature",
  type: "document",
  icon: CaseIcon,
  description:
    "Lege lijst = de site toont 'geen vacatures op dit moment'. Nieuw = Nieuw document, publiceren. Zet Actief uit om een vacature te sluiten zonder te verwijderen.",
  fields: [
    defineField({ name: "titel", title: "Functietitel", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "titel" },
      description: SLUG_DESCRIPTION,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "locatie",
      title: "Locatie",
      type: "reference",
      to: [{ type: "locatie" }],
    }),
    defineField({ name: "omschrijving", title: "Omschrijving", type: "text", rows: 8, validation: (Rule) => Rule.required() }),
    defineField({
      name: "contactEmail",
      title: "Solliciteren via e-mail",
      type: "string",
      initialValue: "info@movenda.be",
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: "actief",
      title: "Actief (tonen op de site)",
      type: "boolean",
      initialValue: true,
      description: "Uit = niet meer op /jobs, blijft bewaard.",
    }),
  ],
  preview: {
    select: { title: "titel", locatie: "locatie.naam", actief: "actief" },
    prepare({ title, locatie, actief }) {
      return {
        title,
        subtitle: [locatie, actief === false ? "verborgen" : "zichtbaar"].filter(Boolean).join(" · "),
      };
    },
  },
});
