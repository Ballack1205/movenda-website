import { EarthGlobeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { EN_FIELDSET } from "./helpers";

// Empty in production for now: the old /olympia page had unrelated
// template copy (not real Movenda/Sportcentrum Olympia content), so there
// was nothing genuine to migrate. Julie fills this in once we know exactly
// which extra Sportcentrum Olympia activities should be listed here.
export default defineType({
  name: "sportaanbodItem",
  title: "Olympia sportaanbod",
  type: "document",
  icon: EarthGlobeIcon,
  description: "Extra activiteiten in Sportcentrum Olympia. Lege lijst = het blok blijft weg tot je items toevoegt.",
  fieldsets: [EN_FIELDSET],
  fields: [
    defineField({ name: "naam", title: "Naam (NL)", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "naamEn", title: "Naam (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "tekst", title: "Korte omschrijving (NL)", type: "text", rows: 2 }),
    defineField({ name: "tekstEn", title: "Korte omschrijving (EN)", type: "text", rows: 2, fieldset: "en" }),
    defineField({ name: "link", title: "Link (optioneel)", type: "url" }),
    defineField({ name: "volgorde", title: "Volgorde", type: "number", initialValue: 0 }),
  ],
  orderings: [
    { title: "Volgorde", name: "volgordeAsc", by: [{ field: "volgorde", direction: "asc" }] },
  ],
});
