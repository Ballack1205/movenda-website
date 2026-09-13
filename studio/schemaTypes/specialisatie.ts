import { defineField, defineType } from "sanity";

// One specialisation a teamlid can carry ("Manuele therapie", "Boxing coaching").
// Julie manages the vocabulary here; therapists pick from it via
// Teamlid → Specialisaties. Renaming or translating one updates every
// therapist at once, and the optional dienst link turns the tag into a link
// to that service page.
export default defineType({
  name: "specialisatie",
  title: "Specialisatie",
  type: "document",
  fields: [
    defineField({
      name: "naam",
      title: "Naam (NL)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "naamEn",
      title: "Naam (EN)",
      type: "string",
      description: "Leeg = de Engelse site toont de Nederlandse naam.",
    }),
    defineField({
      name: "dienst",
      title: "Hoort bij dienst",
      type: "reference",
      to: [{ type: "dienst" }],
      description:
        "Optioneel. Gekozen = de specialisatie wordt op de teampagina een link naar deze dienstpagina.",
    }),
  ],
  orderings: [{ title: "Naam", name: "naamAsc", by: [{ field: "naam", direction: "asc" }] }],
  preview: {
    select: { title: "naam", naamEn: "naamEn", dienst: "dienst.titel" },
    prepare({ title, naamEn, dienst }) {
      const parts = [naamEn ? `EN: ${naamEn}` : "geen EN", dienst ? `→ ${dienst}` : undefined].filter(Boolean);
      return { title, subtitle: parts.join(" · ") };
    },
  },
});
