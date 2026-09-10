import { defineField, defineType } from "sanity";

// One "pijler" block on the homepage (Kinesitherapie / Personal training /
// MPC). Julie owns the copy and the "waarvoor kom je" list; the technique
// list on the right is pulled automatically from the diensten records.
export default defineType({
  name: "homePijler",
  title: "Homepage-pijler",
  type: "object",
  fields: [
    defineField({ name: "titel", title: "Titel", type: "string" }),
    defineField({ name: "titelEn", title: "Titel (EN)", type: "string" }),
    defineField({
      name: "tekst",
      title: "Korte tekst",
      type: "text",
      rows: 4,
      description: "2 à 3 zinnen: wat maakt jullie aanpak anders? (bv. 30 min één-op-één).",
    }),
    defineField({ name: "tekstEn", title: "Korte tekst (EN)", type: "text", rows: 4 }),
    defineField({
      name: "lijstTitel",
      title: "Titel linkerlijst",
      type: "string",
      description: "Bv. 'Waarvoor kom je bij ons' of 'Voor wie'.",
    }),
    defineField({ name: "lijstTitelEn", title: "Titel linkerlijst (EN)", type: "string" }),
    defineField({
      name: "lijst",
      title: "Linkerlijst (klachten of doelgroepen)",
      type: "array",
      of: [{ type: "string" }],
      description: "Max. 6 items. De rechterlijst met technieken komt automatisch uit 'Diensten'.",
      validation: (rule) => rule.max(6),
    }),
    defineField({ name: "lijstEn", title: "Linkerlijst (EN)", type: "array", of: [{ type: "string" }] }),
  ],
  options: { collapsible: true, collapsed: true },
});
