import { CalendarIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { EN_FIELDSET, SLUG_DESCRIPTION } from "./helpers";
import { verplicht, webadres } from "./regels";

export default defineType({
  name: "event",
  title: "Event",
  type: "document",
  icon: CalendarIcon,
  description:
    "Een event op /events. De kaart blijft kort: alleen de eerste alinea. De volledige tekst, foto en Instagram staan op de pagina van dit event. Die pagina maakt de site zelf, je hoeft geen extra pagina aan te maken. Een actiepagina is alleen nodig voor een eigen landingspagina, zoals Dwars door Hasselt.",
  fieldsets: [EN_FIELDSET],
  fields: [
    defineField({ name: "titel", title: "Titel (NL)", type: "string", validation: verplicht }),
    defineField({ name: "titelEn", title: "Titel (EN)", type: "string", fieldset: "en" }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "titel" },
      description: SLUG_DESCRIPTION,
      validation: verplicht,
    }),
    defineField({ name: "datum", title: "Datum", type: "date", validation: verplicht }),
    defineField({ name: "locatie", title: "Locatie", type: "string" }),
    defineField({ name: "foto", title: "Foto", type: "image", options: { hotspot: true } }),
    defineField({
      name: "instagram",
      title: "Link bij de foto",
      type: "string",
      validation: webadres,
      description:
        "Reel, post of fotoalbum. Een klik op de foto opent deze link. De foto hierboven is het beeld dat bezoekers zien.",
    }),
    defineField({
      name: "instagramLabel",
      title: "Tekst onder de foto",
      type: "string",
      description: "Leeg = ‘Bekijk op Instagram’. Bijvoorbeeld ‘Bekijk de aftermovie’.",
    }),
    defineField({
      name: "instagramLabelEn",
      title: "Tekst onder de foto (EN)",
      type: "string",
      fieldset: "en",
      description: "Leeg = de Nederlandse tekst, of ‘Watch on Instagram’ als die ook leeg is.",
    }),
    defineField({
      name: "video",
      title: "Video-bestand",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      description:
        "Alleen als er geen Instagram-link is. Mp4 of webm, liggend (16:9), maximaal 20 MB. De foto hierboven is het stilstaande beeld.",
    }),
    defineField({
      name: "tekst",
      title: "Tekst (NL)",
      type: "richText",
      description:
        "De volledige tekst van dit event. Op het overzicht verschijnt alleen de eerste alinea. De rest staat op de pagina van dit event, die de site zelf aanmaakt.",
    }),
    defineField({ name: "tekstEn", title: "Tekst (EN)", type: "richText", fieldset: "en" }),
    defineField({
      name: "link",
      title: "Link voor meer info",
      type: "string",
      description:
        "Leeg laten is genoeg: de knop opent dan de pagina van dit event. Vul alleen een link in als de knop naar een actiepagina of externe site moet, bv. /ddh-ready.",
    }),
    defineField({ name: "linkLabel", title: "Tekst op de knop", type: "string", description: "Leeg = ‘Meer info’." }),
    defineField({
      name: "tonenOpHome",
      title: "Tonen op de homepage",
      type: "boolean",
      initialValue: false,
    }),
    defineField({ name: "actief", title: "Publiceren", type: "boolean", initialValue: true }),
  ],
  orderings: [{ title: "Datum", name: "datumDesc", by: [{ field: "datum", direction: "desc" }] }],
  preview: {
    select: { title: "titel", subtitle: "datum", media: "foto" },
  },
});
