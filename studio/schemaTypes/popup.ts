import { RocketIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { EN_FIELDSET } from "./helpers";

export default defineType({
  name: "popup",
  title: "Pop-up",
  type: "document",
  icon: RocketIcon,
  description:
    "Venster dat bezoekers zien bij het openen van de site (zoals de Social Run op de oude site). Zet 'Actief' aan om te tonen. Slechts de laatst bewerkte actieve pop-up verschijnt.",
  groups: [
    { name: "inhoud", title: "Inhoud", default: true },
    { name: "gedrag", title: "Wanneer & waar" },
  ],
  fieldsets: [EN_FIELDSET],
  fields: [
    defineField({
      name: "actief",
      title: "Actief (tonen op de website)",
      type: "boolean",
      group: "gedrag",
      description:
        "Hoofdschakelaar. Uit = pop-up blijft in het CMS maar is nergens zichtbaar, ook niet binnen de datums hieronder.",
      initialValue: false,
    }),
    defineField({
      name: "titel",
      title: "Titel (NL)",
      type: "string",
      group: "inhoud",
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "titelEn", title: "Titel (EN)", type: "string", group: "inhoud", fieldset: "en" }),
    defineField({
      name: "afbeelding",
      title: "Foto bovenaan",
      type: "image",
      group: "inhoud",
      options: { hotspot: true },
    }),
    defineField({
      name: "inhoud",
      title: "Tekst (NL)",
      type: "array",
      group: "inhoud",
      of: [{ type: "block" }],
      description: "Datum, plaats, opsommingen… Vet en lijstjes werken hier.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "inhoudEn",
      title: "Tekst (EN)",
      type: "array",
      group: "inhoud",
      fieldset: "en",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "knopTekst",
      title: "Tekst op de knop (NL)",
      type: "string",
      group: "inhoud",
      initialValue: "Schrijf je in!",
    }),
    defineField({ name: "knopTekstEn", title: "Tekst op de knop (EN)", type: "string", group: "inhoud", fieldset: "en" }),
    defineField({
      name: "actie",
      title: "Wat doet de knop?",
      type: "string",
      group: "inhoud",
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
      group: "inhoud",
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
      group: "inhoud",
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
      group: "gedrag",
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
      group: "gedrag",
      description: "Leeg = meteen, zolang Actief aan staat.",
    }),
    defineField({
      name: "geldigTot",
      title: "Tonen tot (optioneel)",
      type: "datetime",
      group: "gedrag",
      description:
        "Automatisch: na dit moment verdwijnt de pop-up vanzelf, ook zonder opnieuw te publiceren. Actief mag aan blijven staan.",
    }),
    defineField({
      name: "eenKeerPerBezoeker",
      title: "Na sluiten niet meer tonen",
      type: "boolean",
      group: "gedrag",
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
