import { SearchIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { EN_FIELDSET } from "./helpers";

// Singleton: copy and question labels for the "Wie past bij mij?" chooser on
// /team. The answer options live in Keuzehulp-tags; which therapist matches
// which option lives on the Teamlid. Layout and scoring stay in code.
export default defineType({
  name: "keuzehulp",
  title: "Keuzehulp (Wie past bij mij?)",
  type: "document",
  icon: SearchIcon,
  description: "Teksten van de filter op de teampagina. De keuzes zelf staan onder Keuze-opties.",
  fieldsets: [EN_FIELDSET],
  fields: [
    defineField({ name: "actief", title: "Keuzehulp tonen op de teampagina", type: "boolean", initialValue: true }),
    defineField({
      name: "kompasWeergave",
      title: "Verwijskompas — welke versie",
      type: "object",
      description:
        "Per schermgrootte kiezen: de huidige stappen (vraag per vraag) of de visuele kaart. De stappen blijven altijd beschikbaar als backup.",
      options: { columns: 2 },
      fields: [
        defineField({
          name: "mobiel",
          title: "Mobiel",
          type: "string",
          initialValue: "stappen",
          options: {
            layout: "radio",
            list: [
              { title: "Huidige stappen", value: "stappen" },
              { title: "Visuele kaart", value: "visual" },
            ],
          },
        }),
        defineField({
          name: "desktop",
          title: "Desktop",
          type: "string",
          initialValue: "visual",
          options: {
            layout: "radio",
            list: [
              { title: "Huidige stappen", value: "stappen" },
              { title: "Visuele kaart", value: "visual" },
            ],
          },
        }),
      ],
    }),
    defineField({ name: "titel", title: "Titel", type: "string", initialValue: "Wie past bij mij?" }),
    defineField({ name: "titelEn", title: "Titel (EN)", type: "string", fieldset: "en" }),
    defineField({
      name: "intro",
      title: "Introtekst",
      type: "text",
      rows: 2,
      description: "Eén of twee zinnen. Vermeld dat het geen medisch advies is.",
    }),
    defineField({
      name: "introEn",
      title: "Introtekst (EN)",
      type: "text",
      rows: 2,
      fieldset: "en",
    }),
    defineField({
      name: "vragen",
      title: "Vraagteksten",
      type: "object",
      description: "De vraag boven elke rij keuzes. De keuzes zelf beheer je onder Keuzehulp-tags.",
      fieldsets: [EN_FIELDSET],
      fields: [
        defineField({ name: "klacht", title: "Klacht of doel", type: "string", initialValue: "Waarmee kunnen we je helpen?" }),
        defineField({ name: "regio", title: "Lichaamsregio", type: "string", initialValue: "Waar zit de klacht?" }),
        defineField({ name: "sport", title: "Sport", type: "string", initialValue: "Welke sport beoefen je?" }),
        defineField({ name: "doelgroep", title: "Doelgroep", type: "string", initialValue: "Wat past bij jou?" }),
        defineField({ name: "klachtEn", title: "Klacht of doel (EN)", type: "string", fieldset: "en" }),
        defineField({ name: "regioEn", title: "Lichaamsregio (EN)", type: "string", fieldset: "en" }),
        defineField({ name: "sportEn", title: "Sport (EN)", type: "string", fieldset: "en" }),
        defineField({ name: "doelgroepEn", title: "Doelgroep (EN)", type: "string", fieldset: "en" }),
      ],
    }),
    defineField({
      name: "geenMatchTekst",
      title: "Tekst als niemand precies past",
      type: "text",
      rows: 2,
      initialValue:
        "Geen exacte match, maar dit zijn de collega's die het dichtst bij je vraag zitten. Twijfel je? Bel ons — we verwijzen je door naar de juiste persoon.",
    }),
    defineField({
      name: "geenMatchTekstEn",
      title: "Tekst als niemand precies past (EN)",
      type: "text",
      rows: 2,
      fieldset: "en",
    }),
  ],
  preview: { prepare: () => ({ title: "Keuzehulp — Wie past bij mij?" }) },
});
