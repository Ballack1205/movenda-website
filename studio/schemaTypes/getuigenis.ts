import { defineField, defineType } from "sanity";

export default defineType({
  name: "getuigenis",
  title: "Getuigenis",
  type: "document",
  fields: [
    defineField({ name: "tekst", title: "Tekst", type: "text", rows: 4, validation: (Rule) => Rule.required() }),
    defineField({ name: "naam", title: "Naam", type: "string" }),
    defineField({
      name: "locatie",
      title: "Locatie",
      type: "string",
      options: {
        list: [
          { title: "Olympia", value: "olympia" },
          { title: "MPC", value: "mpc" },
          { title: "Beide", value: "beide" },
        ],
      },
    }),
    defineField({ name: "volgorde", title: "Volgorde", type: "number", initialValue: 0 }),
  ],
});
