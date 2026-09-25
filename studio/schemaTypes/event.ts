import { CalendarIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { EN_FIELDSET, SLUG_DESCRIPTION } from "./helpers";

export default defineType({
  name: "event",
  title: "Event",
  type: "document",
  icon: CalendarIcon,
  description: "Een event op /events. Afgelopen events blijven zichtbaar. Zet ‘Tonen op de homepage’ aan voor de strook op de home.",
  fieldsets: [EN_FIELDSET],
  fields: [
    defineField({ name: "titel", title: "Titel (NL)", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "titelEn", title: "Titel (EN)", type: "string", fieldset: "en" }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "titel" },
      description: SLUG_DESCRIPTION,
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "datum", title: "Datum", type: "date", validation: (Rule) => Rule.required() }),
    defineField({ name: "locatie", title: "Locatie", type: "string" }),
    defineField({ name: "foto", title: "Foto", type: "image", options: { hotspot: true } }),
    defineField({ name: "tekst", title: "Tekst (NL)", type: "text", rows: 4 }),
    defineField({ name: "tekstEn", title: "Tekst (EN)", type: "text", rows: 4, fieldset: "en" }),
    defineField({
      name: "tonenOpHome",
      title: "Tonen op de homepage",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "actief", title: "Publiceren", type: "boolean", initialValue: true }),
  ],
  orderings: [{ title: "Datum", name: "datumDesc", by: [{ field: "datum", direction: "desc" }] }],
  preview: {
    select: { title: "titel", subtitle: "datum", media: "foto" },
  },
});
