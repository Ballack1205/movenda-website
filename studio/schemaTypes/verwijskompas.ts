import { HelpCircleIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType, type PreviewConfig } from "sanity";
import { VerwijskompasInvoer } from "../components/VerwijskompasInvoer";
import { verplicht, webadres } from "./regels";

// The referral compass on /team. Julie edits the choices, who is assigned,
// and the Crossuite booking link. Layout and routing stay in the site.

const collegaRef = defineArrayMember({
  type: "reference",
  weak: true,
  to: [{ type: "teamlid" }],
});

const collegas = defineField({
  name: "collegas",
  title: "Collega's",
  type: "array",
  of: [collegaRef],
  description:
    "Zoek de voornaam en klik om toe te voegen. Weghalen doe je met het kruisje. Staat er hieronder een boekingslink, dan ziet de bezoeker de namen niet — alleen Boek online. Het aantal telt wel mee.",
});

const boekUrl = defineField({
  name: "boekUrl",
  title: "Link om te boeken",
  type: "string",
  description: "De Crossuite-link voor deze keuze. Leeg = geen knop Boek online.",
  validation: webadres,
});

function eindigtNergens(value: { vervolg?: string; collegas?: unknown[]; boekUrl?: string } | undefined) {
  if (!value) return false;
  if (value.vervolg === "regio" || value.vervolg === "sport") return false;
  const heeftCollegas = Array.isArray(value.collegas) && value.collegas.length > 0;
  return !heeftCollegas && !value.boekUrl?.trim();
}

const legeStap = (value: { vervolg?: string; collegas?: unknown[]; boekUrl?: string } | undefined) =>
  eindigtNergens(value)
    ? "Kies minstens één collega of plak een boekingslink. Anders komt de bezoeker op een lege stap."
    : true;

// Closed rows are what Julie scans. Show the first names, not only "Boek online".
const NAAM_SELECT = Object.fromEntries(
  Array.from({ length: 12 }, (_, i) => [`c${i}`, `collegas.${i}.voornaam`]),
);

const rijPreview: PreviewConfig = {
  select: { title: "label", vervolg: "vervolg", boekUrl: "boekUrl", ...NAAM_SELECT },
  prepare: (selection) => {
    const title = selection.title || "Nieuwe keuze";
    if (selection.vervolg === "regio") return { title, subtitle: "Daarna: waar zit de klacht?" };
    if (selection.vervolg === "sport") return { title, subtitle: "Daarna: welke sport?" };
    const namen = Array.from({ length: 12 }, (_, i) => selection[`c${i}`]).filter((naam): naam is string => Boolean(naam));
    const wie = namen.length ? namen.join(", ") : "Nog niemand";
    return { title, subtitle: selection.boekUrl ? `${wie} · Boek online` : wie };
  },
};

const klacht = defineArrayMember({
  type: "object",
  name: "verwijskompasKlacht",
  title: "Keuze",
  fields: [
    defineField({
      name: "label",
      title: "Wat de bezoeker ziet",
      type: "string",
      description: "Bv. “Na een operatie” of “Sportblessure”.",
      validation: verplicht,
    }),
    defineField({
      name: "vervolg",
      title: "Wat gebeurt er na deze keuze?",
      type: "string",
      initialValue: "collegas",
      options: {
        list: [
          { title: "Toon collega's (en eventueel Boek online)", value: "collegas" },
          { title: "Ga verder: waar zit de klacht?", value: "regio" },
          { title: "Ga verder: welke sport?", value: "sport" },
        ],
        layout: "radio",
      },
      validation: verplicht,
    }),
    { ...collegas, hidden: ({ parent }) => parent?.vervolg === "regio" || parent?.vervolg === "sport" },
    { ...boekUrl, hidden: ({ parent }) => parent?.vervolg === "regio" || parent?.vervolg === "sport" },
  ],
  preview: rijPreview,
  validation: (Rule) => Rule.custom((value) => legeStap(value)),
});

const optie = defineArrayMember({
  type: "object",
  name: "verwijskompasOptie",
  title: "Keuze",
  fields: [
    defineField({
      name: "label",
      title: "Wat de bezoeker ziet",
      type: "string",
      validation: verplicht,
    }),
    collegas,
    boekUrl,
  ],
  preview: rijPreview,
  validation: (Rule) => Rule.custom((value) => legeStap(value)),
});

const lijst = (name: string, title: string, description: string, group: string, of: ReturnType<typeof defineArrayMember>[]) =>
  defineField({
    name,
    title,
    description: `${description} Sleep een rij om de volgorde te veranderen. Bovenaan staat eerst in het kompas.`,
    type: "array",
    group,
    of,
  });

export default defineType({
  name: "verwijskompas",
  title: "Verwijskompas",
  type: "document",
  icon: HelpCircleIcon,
  components: { input: VerwijskompasInvoer },
  groups: [
    { name: "kine", title: "Kine: waarvoor", default: true },
    { name: "regio", title: "Kine: regio" },
    { name: "sport", title: "Kine: sport" },
    { name: "training", title: "Training" },
  ],
  fields: [
    lijst(
      "klachten",
      "Waarvoor kom je?",
      "De eerste vraag als iemand Kinesitherapie kiest.",
      "kine",
      [klacht],
    ),
    lijst(
      "regios",
      "Waar zit de klacht?",
      "Komt na keuzes die verder gaan naar een regio (rug, knie, …).",
      "regio",
      [optie],
    ),
    lijst(
      "sporten",
      "Welke sport?",
      "Komt na keuzes die verder gaan naar een sport.",
      "sport",
      [optie],
    ),
    lijst(
      "training",
      "Training & coaching",
      "De keuzes als iemand Training & coaching kiest. Elke rij is meteen een resultaat.",
      "training",
      [optie],
    ),
  ],
  preview: {
    prepare: () => ({ title: "Verwijskompas" }),
  },
});
