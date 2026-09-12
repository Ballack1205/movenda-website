import { defineField, defineType } from "sanity";

export default defineType({
  name: "getuigenis",
  title: "Getuigenis",
  type: "document",
  description:
    "Citaten van cliënten in de carousel op de site. Nieuw = Nieuw document. Vul quote, naam en (liefst) een foto in, publiceer. Zet Actief uit om te verbergen zonder te verwijderen.",
  fields: [
    defineField({
      name: "tekst",
      title: "Quote (NL)",
      type: "text",
      rows: 4,
      description: "De woorden van de cliënt, zonder aanhalingstekens — die zet de site er zelf bij.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tekstEn",
      title: "Quote (EN)",
      type: "text",
      rows: 4,
      description: "Engelse vertaling. Leeg = de Nederlandse quote op /en.",
    }),
    defineField({
      name: "naam",
      title: "Naam",
      type: "string",
      description: "Zoals op de site, bv. 'Vanhees G.' Initialen zijn prima (privacy).",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "naam" },
      description: "Technisch, voor de volgorde in de code. Meestal niet aanpassen.",
    }),
    defineField({
      name: "foto",
      title: "Foto",
      type: "image",
      options: { hotspot: true },
      description:
        "Portret van de cliënt (of een sfeerbeeld van de training). Zonder foto toont de carousel een nette placeholder tot je er een uploadt.",
    }),
    defineField({
      name: "rol",
      title: "Context",
      type: "string",
      description: "Kort, onder de naam. Bv. 'Personal training', 'Kinesitherapie', 'Performance'.",
    }),
    defineField({
      name: "locatie",
      title: "Locatie",
      type: "string",
      description: "Bepaalt op welke pagina de quote in de carousel staat.",
      options: {
        list: [
          { title: "Olympia (homepage, prijzen)", value: "olympia" },
          { title: "MPC", value: "mpc" },
          { title: "Beide", value: "beide" },
        ],
      },
      initialValue: "olympia",
    }),
    defineField({
      name: "volgorde",
      title: "Volgorde",
      type: "number",
      description: "Lager nummer = eerder in de carousel.",
      initialValue: 0,
    }),
    defineField({
      name: "actief",
      title: "Tonen op de site",
      type: "boolean",
      description: "Zet uit om deze getuigenis tijdelijk te verbergen.",
      initialValue: true,
    }),
  ],
  orderings: [{ title: "Volgorde", name: "volgordeAsc", by: [{ field: "volgorde", direction: "asc" }] }],
  preview: {
    select: { title: "naam", tekst: "tekst", locatie: "locatie", actief: "actief", media: "foto" },
    prepare({ title, tekst, locatie, actief, media }) {
      const site = { olympia: "Olympia", mpc: "MPC", beide: "Olympia + MPC" }[locatie as string] || "—";
      const snippet = typeof tekst === "string" ? tekst.replace(/\s+/g, " ").slice(0, 48) : "";
      const subtitle = [site, actief === false ? "verborgen" : null, snippet]
        .filter(Boolean)
        .join(" · ");
      return { title: title || "Getuigenis", subtitle, media };
    },
  },
});
