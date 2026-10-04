import { UsersIcon } from "@sanity/icons";
import { LaunchIcon } from "@sanity/icons";
import { Button, Stack } from "@sanity/ui";
import { createElement } from "react";
import { defineField, defineType, type FieldProps } from "sanity";
import { PREVIEW_URL } from "../preview";
import { EN_FIELDSET, SLUG_DESCRIPTION } from "./helpers";
import { email, link, minItems, verplicht } from "./regels";

function opDeSite(path: string) {
  return {
    field: (props: FieldProps) =>
      createElement(
        Stack,
        { space: 2 },
        props.renderDefault(props),
        createElement(Button, {
          as: "a",
          href: `${PREVIEW_URL}${path}`,
          target: "_blank",
          rel: "noopener noreferrer",
          mode: "ghost",
          fontSize: 1,
          padding: 2,
          icon: LaunchIcon,
          text: "Bekijk op de site",
          style: { justifySelf: "start" },
        }),
      ),
  };
}

export default defineType({
  name: "teamlid",
  title: "Teamlid",
  type: "document",
  icon: UsersIcon,
  description:
    "Nieuw teamlid = Nieuw document. Foto, naam, rol, locatie(s) en publiceren. Zet 'Actief' uit om iemand te verbergen zonder te verwijderen.",
  groups: [
    { name: "wie", title: "Wie", default: true },
    { name: "bio", title: "Bio & contact" },
    { name: "tarieven", title: "Tarieven" },
    { name: "keuzehulp", title: "Keuzehulp" },
    { name: "site", title: "Op de site" },
  ],
  fieldsets: [EN_FIELDSET],
  fields: [
    defineField({
      name: "voornaam",
      title: "Voornaam",
      type: "string",
      group: "wie",
      validation: verplicht,
    }),
    defineField({
      name: "naam",
      title: "Naam",
      type: "string",
      group: "wie",
      validation: verplicht,
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      group: "wie",
      options: { source: (doc) => `${(doc as { voornaam?: string; naam?: string }).voornaam}-${(doc as { voornaam?: string; naam?: string }).naam}` },
      description: SLUG_DESCRIPTION,
      validation: verplicht,
    }),
    defineField({
      name: "foto",
      title: "Foto",
      type: "image",
      group: "wie",
      options: { hotspot: true },
      description: "Portret. Zet het focuspunt op het gezicht, zodat de kaart op telefoon goed bijsnijdt.",
    }),
    defineField({
      name: "rol",
      title: "Rol (NL)",
      type: "string",
      group: "wie",
      description: "Bv. 'Kinesitherapeut' of 'Personal trainer'.",
      validation: verplicht,
    }),
    defineField({
      name: "rolEn",
      title: "Rol (EN)",
      type: "string",
      group: "wie",
      fieldset: "en",
      description: "Engelse vertaling. Leeg = valt terug op NL.",
    }),
    defineField({
      name: "disciplines",
      title: "Telt mee als",
      type: "array",
      group: "wie",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Kinesist", value: "kine" },
          { title: "Trainer / coach", value: "pt" },
        ],
        layout: "grid",
      },
      description:
        "Bepaalt de aantallen op de homepage ('Met 13 kinesisten en 8 trainers en coaches …') en de knoppen Kinesisten / Trainers & coaches op de teampagina. Beide aanvinken mag. Niets aanvinken voor wie geen therapeut of trainer is (bv. office).",
    }),
    defineField({
      name: "locaties",
      title: "Locatie(s)",
      type: "array",
      group: "wie",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Movenda Olympia", value: "olympia" },
          { title: "Movenda Performance Centre", value: "mpc" },
        ],
        layout: "grid",
      },
      validation: minItems(1),
    }),
    defineField({
      name: "specialisaties",
      title: "Specialisaties",
      type: "array",
      group: "wie",
      of: [{ type: "reference", to: [{ type: "specialisatie" }] }],
      description:
        "Kies uit de lijst; de eerste vier staan op de teamkaart, allemaal op de detailpagina. Ontbreekt er een? Maak ze aan onder Specialisaties (daar staat ook de Engelse naam en de link naar een dienst).",
    }),
    defineField({
      name: "bio",
      title: "Korte bio (NL)",
      type: "text",
      group: "bio",
      rows: 4,
    }),
    defineField({
      name: "bioEn",
      title: "Korte bio (EN)",
      type: "text",
      group: "bio",
      fieldset: "en",
      rows: 4,
    }),
    defineField({
      name: "email",
      title: "E-mailadres",
      type: "string",
      group: "bio",
      validation: email("Of laat het leeg."),
    }),
    defineField({
      name: "tariefKine",
      title: "Tarief kinesitherapie (€ / 30 min)",
      type: "number",
      group: "tarieven",
      description: "Staat op Prijzen, in de lijst ‘Kinesitherapie’. Leeg = niet in die lijst.",
      components: opDeSite("/prijzen#tarief-kine"),
    }),
    defineField({
      name: "tariefPt",
      title: "Tarief personal training Olympia (€ / 60 min) — niet meer gebruikt",
      type: "number",
      group: "tarieven",
      hidden: ({ value }) => !value,
      readOnly: true,
      description: "Personal training staat niet meer apart voor Movenda op de site. Vul het MPC-tarief hieronder in.",
    }),
    defineField({
      name: "tariefPtMpc",
      title: "Tarief training & coaching (€ / 60 min, ex btw)",
      type: "number",
      group: "tarieven",
      description: "Staat op Prijzen, onder ‘Tarieven per therapeut & coach’ → Training & Coaching. Leeg = niet in die lijst.",
      components: opDeSite("/prijzen#tarief-pt"),
    }),
    defineField({
      name: "tariefPerformance",
      title: "Tarief high performance (€ / sessie)",
      type: "number",
      group: "tarieven",
      description: "Staat op Prijzen bij deze coach onder Training & Coaching, naast het personal-trainingtarief.",
      components: opDeSite("/prijzen#tarief-pt"),
    }),
    defineField({
      name: "clubs",
      title: "Clubs / partners",
      type: "array",
      group: "bio",
      of: [
        {
          type: "object",
          name: "club",
          fields: [
            { name: "naam", type: "string", title: "Naam" },
            { name: "url", type: "string", title: "Link", validation: link },
          ],
          preview: {
            select: { title: "naam", subtitle: "url" },
          },
        },
      ],
    }),
    defineField({
      name: "keuzehulpTags",
      title: "Keuzehulp — waarvoor kom je bij dit teamlid?",
      type: "array",
      group: "keuzehulp",
      of: [{ type: "reference", to: [{ type: "keuzehulpTag" }] }],
      description:
        "Kies de klachten, lichaamsregio's, sporten en doelgroepen waarvoor dit teamlid de juiste persoon is. Bezoekers filteren hierop in 'Wie past bij mij?' op de teampagina. Ontbreekt een optie? Maak ze aan onder Keuzehulp-tags.",
    }),
    // Old free-text keuzehulp fields — replaced by keuzehulpTags (references,
    // controlled vocabulary). Hidden but kept so no data is lost; the
    // migration script (scripts/migrate-keuzehulp.mjs) mapped them over.
    defineField({ name: "klachten", title: "Keuzehulp — klachten (oud)", type: "array", of: [{ type: "string" }], hidden: true }),
    defineField({ name: "regio", title: "Keuzehulp — lichaamsregio (oud)", type: "array", of: [{ type: "string" }], hidden: true }),
    defineField({ name: "sporten", title: "Keuzehulp — sporten (oud)", type: "array", of: [{ type: "string" }], hidden: true }),
    defineField({ name: "doelgroepen", title: "Keuzehulp — doelgroepen (oud)", type: "array", of: [{ type: "string" }], hidden: true }),
    defineField({
      name: "volgorde",
      title: "Volgorde",
      type: "number",
      group: "site",
      description: "Lager nummer = hoger op de teampagina.",
    }),
    defineField({
      name: "actief",
      title: "Actief (zichtbaar op de site)",
      type: "boolean",
      group: "site",
      description: "Uit = verdwijnt van de site, blijft bewaard in het CMS.",
      initialValue: true,
    }),
  ],
  orderings: [
    { title: "Volgorde", name: "volgordeAsc", by: [{ field: "volgorde", direction: "asc" }, { field: "naam", direction: "asc" }] },
    { title: "Naam", name: "naamAsc", by: [{ field: "naam", direction: "asc" }] },
  ],
  preview: {
    select: {
      voornaam: "voornaam",
      naam: "naam",
      rol: "rol",
      locaties: "locaties",
      actief: "actief",
      media: "foto",
    },
    prepare({ voornaam, naam, rol, locaties, actief, media }) {
      const places = (Array.isArray(locaties) ? locaties : [])
        .map((loc: string) => (loc === "mpc" ? "MPC" : loc === "olympia" ? "Olympia" : loc))
        .join(" + ");
      return {
        title: [voornaam, naam].filter(Boolean).join(" ") || "Teamlid",
        subtitle: [rol, places, actief === false ? "verborgen" : null].filter(Boolean).join(" · "),
        media,
      };
    },
  },
});
