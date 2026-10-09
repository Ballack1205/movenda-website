import { CalendarIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";
import { EN_FIELDSET, SLUG_DESCRIPTION } from "./helpers";
import { verplicht, webadres } from "./regels";

export default defineType({
  name: "event",
  title: "Event",
  type: "document",
  icon: CalendarIcon,
  description: "Een event op /events. Afgelopen events blijven zichtbaar. Zet ‘Tonen op de homepage’ aan voor de strook op de home.",
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
      title: "Instagram-video",
      type: "string",
      validation: webadres,
      description:
        "Link naar de Reel of post (kopieer die uit Instagram). De site toont die in plaats van een geüpload bestand. Een klik opent Instagram, dus je hoeft de video niet opnieuw te bewerken of te uploaden.",
    }),
    defineField({
      name: "video",
      title: "Video-bestand",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      description:
        "Alleen als er geen Instagram-link is. Mp4 of webm, liggend (16:9), maximaal 20 MB. De foto hierboven is het stilstaande beeld.",
    }),
    defineField({ name: "tekst", title: "Tekst (NL)", type: "richText", description: "Elke alinea is een nieuwe regel (Enter). Vet, cursief en links kies je in de balk." }),
    defineField({ name: "tekstEn", title: "Tekst (EN)", type: "richText", fieldset: "en" }),
    defineField({
      name: "link",
      title: "Link voor meer info",
      type: "string",
      description: "Waar de knop bij dit event naartoe gaat, bv. /ddh-ready (een actiepagina) of https://… Leeg = geen knop.",
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
