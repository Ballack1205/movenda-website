import { defineField, defineType } from "sanity";

export default defineType({
  name: "popup",
  title: "Pop-up",
  type: "document",
  description:
    "Venster dat bezoekers zien bij het openen van de site (zoals de Social Run op de oude site). Zet 'Actief' aan om te tonen. Slechts de laatst bewerkte actieve pop-up verschijnt.",
  fields: [
    defineField({
      name: "actief",
      title: "Actief (tonen op de website)",
      type: "boolean",
      description: "Zet uit na het event, of vul een einddatum in hieronder.",
      initialValue: false,
    }),
    defineField({
      name: "titel",
      title: "Titel (NL)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "titelEn", title: "Titel (EN)", type: "string" }),
    defineField({
      name: "afbeelding",
      title: "Foto bovenaan",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "inhoud",
      title: "Tekst (NL)",
      type: "array",
      of: [{ type: "block" }],
      description: "Datum, plaats, opsommingen… Vet en lijstjes werken hier.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "inhoudEn",
      title: "Tekst (EN)",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "knopTekst",
      title: "Tekst op de knop (NL)",
      type: "string",
      initialValue: "Schrijf je in!",
    }),
    defineField({ name: "knopTekstEn", title: "Tekst op de knop (EN)", type: "string" }),
    defineField({
      name: "actie",
      title: "Wat doet de knop?",
      type: "string",
      options: {
        list: [
          { title: "Gaat naar een formulier-link (Google Form) — aanbevolen", value: "link" },
          { title: "Opent een inschrijfformulier op de site", value: "formulier" },
        ],
        layout: "radio",
      },
      initialValue: "link",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "knopUrl",
      title: "Formulier-URL",
      type: "url",
      description:
        "Plak hier de Google Form-link, bv. https://forms.gle/… De knop opent die in een nieuw tabblad.",
      hidden: ({ parent }) => parent?.actie !== "link",
      validation: (Rule) =>
        Rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }).custom(
          (value, context) => {
            const actie = (context.parent as { actie?: string } | undefined)?.actie;
            if (actie === "link" && !value) return "Plak de formulier-URL (Google Form of andere pagina).";
            return true;
          },
        ),
    }),
    defineField({
      name: "extraVragen",
      title: "Extra vragen op het formulier",
      description: "Naam, e-mail en telefoon staan er al op. Voeg hier bv. 'Welke afstand?' toe.",
      type: "array",
      hidden: ({ parent }) => parent?.actie !== "formulier",
      of: [
        {
          type: "object",
          name: "vraag",
          fields: [
            defineField({ name: "label", title: "Vraag", type: "string", validation: (Rule) => Rule.required() }),
            defineField({
              name: "type",
              title: "Type",
              type: "string",
              options: {
                list: [
                  { title: "Tekstveld", value: "tekst" },
                  { title: "Keuzelijst", value: "keuze" },
                ],
              },
              initialValue: "tekst",
            }),
            defineField({
              name: "opties",
              title: "Keuzes",
              type: "array",
              of: [{ type: "string" }],
              hidden: ({ parent }) => parent?.type !== "keuze",
            }),
            defineField({
              name: "verplicht",
              title: "Verplicht",
              type: "boolean",
              initialValue: true,
            }),
          ],
          preview: {
            select: { title: "label", type: "type" },
            prepare({ title, type }) {
              return { title, subtitle: type === "keuze" ? "Keuzelijst" : "Tekstveld" };
            },
          },
        },
      ],
    }),
    defineField({
      name: "toonOp",
      title: "Tonen op",
      type: "string",
      options: {
        list: [
          { title: "Heel de site", value: "overal" },
          { title: "Alleen homepage", value: "home" },
          { title: "Alleen MPC-pagina's", value: "mpc" },
        ],
      },
      initialValue: "overal",
    }),
    defineField({
      name: "geldigVan",
      title: "Tonen vanaf (optioneel)",
      type: "datetime",
    }),
    defineField({
      name: "geldigTot",
      title: "Tonen tot (optioneel)",
      type: "datetime",
      description: "Daarna verdwijnt de pop-up vanzelf, ook zonder opnieuw te publiceren.",
    }),
    defineField({
      name: "eenKeerPerBezoeker",
      title: "Na sluiten niet meer tonen",
      type: "boolean",
      description: "Aanbevolen. Uit = elke keer dat iemand de site opent.",
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: "titel", actief: "actief", media: "afbeelding" },
    prepare({ title, actief, media }) {
      return {
        title,
        subtitle: actief ? "Actief — zichtbaar op de site" : "Uit — niet zichtbaar",
        media,
      };
    },
  },
});
