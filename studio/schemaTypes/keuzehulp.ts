import { defineField, defineType } from "sanity";

// Singleton: copy and question labels for the "Wie past bij mij?" chooser on
// /team. The answer options live in Keuzehulp-tags; which therapist matches
// which option lives on the Teamlid. Layout and scoring stay in code.
export default defineType({
  name: "keuzehulp",
  title: "Keuzehulp (Wie past bij mij?)",
  type: "document",
  fields: [
    defineField({ name: "actief", title: "Keuzehulp tonen op de teampagina", type: "boolean", initialValue: true }),
    defineField({ name: "titel", title: "Titel", type: "string", initialValue: "Wie past bij mij?" }),
    defineField({
      name: "intro",
      title: "Introtekst",
      type: "text",
      rows: 2,
      description: "Eén of twee zinnen. Vermeld dat het geen medisch advies is.",
    }),
    defineField({
      name: "vragen",
      title: "Vraagteksten",
      type: "object",
      description: "De vraag boven elke rij keuzes. De keuzes zelf beheer je onder Keuzehulp-tags.",
      fields: [
        defineField({ name: "klacht", title: "Klacht of doel", type: "string", initialValue: "Waarmee kunnen we je helpen?" }),
        defineField({ name: "regio", title: "Lichaamsregio", type: "string", initialValue: "Waar zit de klacht?" }),
        defineField({ name: "sport", title: "Sport", type: "string", initialValue: "Welke sport beoefen je?" }),
        defineField({ name: "doelgroep", title: "Doelgroep", type: "string", initialValue: "Wat past bij jou?" }),
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
  ],
  preview: { prepare: () => ({ title: "Keuzehulp — Wie past bij mij?" }) },
});
