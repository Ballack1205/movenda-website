import { defineField, defineType } from "sanity";

// One answer option in the "Wie past bij mij?" chooser on /team. Julie
// manages the vocabulary here (add/rename/reorder); therapists are tagged
// with these via Teamlid → Keuzehulp-tags. Renaming a tag updates every
// therapist at once because they reference this document.
export const KEUZEHULP_CATEGORIEEN = [
  { title: "Klacht of doel", value: "klacht" },
  { title: "Lichaamsregio", value: "regio" },
  { title: "Sport", value: "sport" },
  { title: "Doelgroep", value: "doelgroep" },
] as const;

export default defineType({
  name: "keuzehulpTag",
  title: "Keuzehulp-tag",
  type: "document",
  fields: [
    defineField({
      name: "label",
      title: "Label (zoals bezoekers het zien)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "categorie",
      title: "Vraag waar deze tag bij hoort",
      type: "string",
      options: { list: [...KEUZEHULP_CATEGORIEEN], layout: "radio" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "volgorde",
      title: "Volgorde",
      type: "number",
      description: "Lager nummer = eerder in de lijst. Leeg = alfabetisch achteraan.",
    }),
    defineField({
      name: "actief",
      title: "Tonen in de keuzehulp",
      type: "boolean",
      initialValue: true,
      description: "Uit = tag blijft bestaan op teamleden maar wordt niet als keuze getoond.",
    }),
  ],
  orderings: [
    {
      title: "Categorie, volgorde",
      name: "categorieVolgorde",
      by: [
        { field: "categorie", direction: "asc" },
        { field: "volgorde", direction: "asc" },
        { field: "label", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "label", categorie: "categorie", actief: "actief" },
    prepare({ title, categorie, actief }) {
      const cat = KEUZEHULP_CATEGORIEEN.find((c) => c.value === categorie)?.title || categorie;
      return { title, subtitle: `${cat}${actief === false ? " · verborgen" : ""}` };
    },
  },
});
