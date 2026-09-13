import { HelpCircleIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { EN_FIELDSET } from "./helpers";

const CATEGORIEEN = [
  { title: "Behandelingen", value: "behandelingen" },
  { title: "Afspraken", value: "afspraken" },
  { title: "Praktisch", value: "praktisch" },
  { title: "Prijzen & terugbetaling", value: "prijzen" },
] as const;

const SITES = [
  { title: "Movenda (Olympia)", value: "movenda" },
  { title: "MPC", value: "mpc" },
  { title: "Beide", value: "beide" },
] as const;

export default defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  icon: HelpCircleIcon,
  description: "Vraag + antwoord. Kies op welke site (Olympia, MPC of beide) de vraag verschijnt.",
  fieldsets: [EN_FIELDSET],
  fields: [
    defineField({ name: "vraag", title: "Vraag (NL)", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "vraagEn", title: "Vraag (EN)", type: "string", fieldset: "en" }),
    defineField({ name: "antwoord", title: "Antwoord (NL)", type: "text", rows: 4, validation: (Rule) => Rule.required() }),
    defineField({ name: "antwoordEn", title: "Antwoord (EN)", type: "text", rows: 4, fieldset: "en" }),
    defineField({
      name: "categorie",
      title: "Categorie",
      type: "string",
      options: { list: [...CATEGORIEEN] },
    }),
    defineField({
      name: "site",
      title: "Tonen op",
      type: "string",
      options: { list: [...SITES] },
      initialValue: "movenda",
    }),
    defineField({ name: "volgorde", title: "Volgorde", type: "number", initialValue: 0 }),
  ],
  orderings: [
    { title: "Volgorde", name: "volgordeAsc", by: [{ field: "volgorde", direction: "asc" }] },
  ],
  preview: {
    select: { title: "vraag", categorie: "categorie", site: "site" },
    prepare({ title, categorie, site }) {
      const cat = CATEGORIEEN.find((item) => item.value === categorie)?.title || categorie;
      const waar = SITES.find((item) => item.value === site)?.title || site;
      return { title, subtitle: [cat, waar].filter(Boolean).join(" · ") };
    },
  },
});
