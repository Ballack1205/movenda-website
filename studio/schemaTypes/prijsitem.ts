import { defineField, defineType } from "sanity";

// Which page/section a price appears in follows from the category alone — no
// name matching. Adding "Kickboxing — 10 lessen" under "MPC — groepslessen"
// puts it in the Groepslessen table on /mpc/prijzen and in the memberships on
// /mpc/groepslessen, whatever the name says.
export const PRIJS_CATEGORIEEN = [
  { title: "Kinesitherapie (Olympia) — /prijzen", value: "kine" },
  { title: "Personal training (Olympia) — /prijzen", value: "training" },
  { title: "MPC — training", value: "mpc-training" },
  { title: "MPC — sportrevalidatie", value: "mpc-rehab" },
  { title: "MPC — groepslessen (ook op /mpc/groepslessen)", value: "mpc-groep" },
  { title: "MPC — screening & data", value: "screening" },
] as const;

export default defineType({
  name: "prijsitem",
  title: "Prijs",
  type: "document",
  fields: [
    defineField({ name: "naam", title: "Behandeling / formule (NL)", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "naamEn",
      title: "Behandeling / formule (EN)",
      type: "string",
      description: "Voor de Engelse site. Leeg = toont de Nederlandse naam.",
    }),
    defineField({
      name: "categorie",
      title: "Categorie (bepaalt op welke pagina en in welke tabel de prijs staat)",
      type: "string",
      options: { list: [...PRIJS_CATEGORIEEN] },
      validation: (Rule) => Rule.required(),
    }),
    defineField({ name: "bedrag", title: "Bedrag (€)", type: "number", validation: (Rule) => Rule.required() }),
    defineField({ name: "eenheid", title: "Eenheid (bv. '30 min')", type: "string" }),
    defineField({ name: "vanaf", title: "\"Vanaf\"-prijs (kan variëren per therapeut)", type: "boolean", initialValue: true }),
    defineField({ name: "opAanvraag", title: "Prijs op aanvraag (negeert bedrag)", type: "boolean", initialValue: false }),
    defineField({
      name: "notitie",
      title: "Publieke noot (NL)",
      type: "string",
      description:
        "Kleine tekst onder de naam, bv. 'incl. opvolging' of 'HIIT, Full Body, Core'. Niet nodig: 'ex BTW' of 'enkel op afspraak' — dat staat al boven de MPC-prijstabel (Site-instellingen → Prijzen). Interne opmerkingen horen hieronder.",
    }),
    defineField({
      name: "notitieEn",
      title: "Publieke noot (EN)",
      type: "string",
      description: "Leeg = toont de Nederlandse noot.",
    }),
    defineField({
      name: "interneNotitie",
      title: "Interne notitie",
      type: "text",
      rows: 2,
      description: "Alleen zichtbaar in Sanity; wordt nooit naar de publieke website gestuurd.",
    }),
    defineField({ name: "volgorde", title: "Volgorde", type: "number", initialValue: 0 }),
  ],
  orderings: [
    { title: "Categorie, volgorde", name: "categorieVolgorde", by: [{ field: "categorie", direction: "asc" }, { field: "volgorde", direction: "asc" }] },
    { title: "Volgorde", name: "volgordeAsc", by: [{ field: "volgorde", direction: "asc" }] },
  ],
  preview: {
    select: { title: "naam", categorie: "categorie", bedrag: "bedrag", opAanvraag: "opAanvraag" },
    prepare({ title, categorie, bedrag, opAanvraag }) {
      const cat = PRIJS_CATEGORIEEN.find((c) => c.value === categorie)?.title.split(" — ")[0] || categorie;
      return { title, subtitle: `${cat} — ${opAanvraag ? "op aanvraag" : `€${bedrag}`}` };
    },
  },
});
