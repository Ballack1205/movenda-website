import { defineField, defineType } from "sanity";

export default defineType({
  name: "teamlid",
  title: "Teamlid",
  type: "document",
  fields: [
    defineField({
      name: "voornaam",
      title: "Voornaam",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "naam",
      title: "Naam",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: (doc: any) => `${doc.voornaam}-${doc.naam}` },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "foto",
      title: "Foto",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "rol",
      title: "Rol (NL)",
      type: "string",
      description: "Bv. 'Kinesitherapeut' of 'Personal trainer'.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "rolEn",
      title: "Rol (EN)",
      type: "string",
      description: "Engelse vertaling. Leeg = valt terug op NL.",
    }),
    defineField({
      name: "locaties",
      title: "Locatie(s)",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Movenda Olympia", value: "olympia" },
          { title: "Movenda Performance Centre", value: "mpc" },
        ],
      },
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "specialisaties",
      title: "Specialisaties",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "bio",
      title: "Korte bio (NL)",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "bioEn",
      title: "Korte bio (EN)",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "email",
      title: "E-mailadres",
      type: "string",
    }),
    defineField({
      name: "volgorde",
      title: "Volgorde",
      type: "number",
      description: "Lager nummer = hoger op de teampagina.",
    }),
    defineField({
      name: "actief",
      title: "Actief (zichtbaar op de site)",
      type: "boolean",
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: "voornaam", subtitle: "rol", media: "foto" },
    prepare({ title, subtitle, media }) {
      return { title, subtitle, media };
    },
  },
});
