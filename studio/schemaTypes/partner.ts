import { defineField, defineType } from "sanity";

export default defineType({
  name: "partner",
  title: "Partner",
  type: "document",
  description:
    "Clubs, bedrijven en scholen in de bewegende partnerbalk op de site. Enkel externe partners — het Movenda- en MPC-logo horen hier niet in. Nieuwe partner = nieuw document.",
  fields: [
    defineField({ name: "naam", title: "Naam", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
      description:
        "Het logo van de partner zelf, nooit het Movenda- of MPC-logo. PNG of SVG met doorzichtige achtergrond werkt het mooiste. Zonder logo tonen we de naam als tekst.",
    }),
    defineField({ name: "url", title: "Website", type: "url", description: "Optioneel. Het logo wordt dan aanklikbaar." }),
    defineField({
      name: "type",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Sportclub", value: "club" },
          { title: "Bedrijf", value: "corporate" },
          { title: "Onderwijs", value: "onderwijs" },
        ],
      },
    }),
    defineField({
      name: "tonenOp",
      title: "Tonen op",
      type: "string",
      description: "Op welke site hoort deze partner? Kies 'Beide' als hij overal mag staan.",
      options: {
        list: [
          { title: "Movenda", value: "movenda" },
          { title: "MPC", value: "mpc" },
          { title: "Beide", value: "beide" },
        ],
      },
      initialValue: "movenda",
    }),
    defineField({
      name: "volgorde",
      title: "Volgorde",
      type: "number",
      description: "Laagste getal draait vooraan in de balk.",
      initialValue: 0,
    }),
    defineField({
      name: "actief",
      title: "Tonen in de partnerbalk",
      type: "boolean",
      description: "Zet uit om deze partner tijdelijk te verbergen zonder hem te verwijderen.",
      initialValue: true,
    }),
  ],
  orderings: [{ title: "Volgorde", name: "volgordeAsc", by: [{ field: "volgorde", direction: "asc" }] }],
  preview: {
    select: { title: "naam", media: "logo", tonenOp: "tonenOp", volgorde: "volgorde", actief: "actief" },
    prepare({ title, media, tonenOp, volgorde, actief }) {
      const site = { movenda: "Movenda", mpc: "MPC", beide: "Movenda + MPC" }[tonenOp as string] || "—";
      const subtitle = [`#${volgorde ?? 0}`, site, actief === false ? "verborgen" : null]
        .filter(Boolean)
        .join(" · ");
      return { title, media, subtitle };
    },
  },
});
