import { defineField, defineType } from "sanity";

// Empty in production for now: the old /olympia page had unrelated
// template copy (not real Movenda/Sportcentrum Olympia content), so there
// was nothing genuine to migrate. Julie fills this in once we know exactly
// which extra Sportcentrum Olympia activities should be listed here.
export default defineType({
  name: "sportaanbodItem",
  title: "Olympia sportaanbod",
  type: "document",
  fields: [
    defineField({ name: "naam", title: "Naam", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "tekst", title: "Korte omschrijving", type: "text", rows: 2 }),
    defineField({ name: "link", title: "Link (optioneel)", type: "url" }),
    defineField({ name: "volgorde", title: "Volgorde", type: "number", initialValue: 0 }),
  ],
  orderings: [
    { title: "Volgorde", name: "volgordeAsc", by: [{ field: "volgorde", direction: "asc" }] },
  ],
});
