import { defineField, defineType } from "sanity";

// One photo-door on the lab homepage (SELF-style strip). Julie adds, removes
// and reorders these; the navy homepage still uses the fixed homePijlers.
export default defineType({
  name: "homeDeur",
  title: "Homepage-deur",
  type: "object",
  fields: [
    defineField({
      name: "korteNaam",
      title: "Korte naam op de foto",
      type: "string",
      description: "Bv. Kine, Training, Performance.",
      validation: (rule) => rule.required().max(24),
    }),
    defineField({
      name: "korteNaamEn",
      title: "Korte naam (EN)",
      type: "string",
    }),
    defineField({
      name: "regel",
      title: "Regel eronder (optioneel)",
      type: "string",
      description: "Bv. Olympia of Kuringen.",
    }),
    defineField({
      name: "regelEn",
      title: "Regel eronder (EN)",
      type: "string",
    }),
    defineField({
      name: "tekst",
      title: "Tekst bij hover (optioneel)",
      type: "text",
      rows: 3,
      description:
        "Korte zin die op desktop verschijnt als je over de foto hovert (zoals bij SELF). Leeg = de deur wordt minder breed bij hover.",
      validation: (rule) => rule.max(280),
    }),
    defineField({
      name: "tekstEn",
      title: "Tekst bij hover (EN)",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(280),
    }),
    defineField({
      name: "href",
      title: "Link",
      type: "string",
      description: "Pad op de site, beginnend met / — bv. /kinesitherapie of /mpc/groepslessen. Engels krijgt automatisch /en ervoor.",
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value) return "Vul een link in.";
          if (!value.startsWith("/")) return "Begin met / (bv. /training).";
          return true;
        }),
    }),
    defineField({
      name: "foto",
      title: "Foto",
      type: "cmsFoto",
      description: "Liggende of staande foto. Leeg = de standaardfoto van de site.",
    }),
  ],
  preview: {
    select: { title: "korteNaam", subtitle: "href", media: "foto.afbeelding" },
    prepare({ title, subtitle, media }) {
      return { title: title || "Deur", subtitle, media };
    },
  },
});
