import { defineField, defineType } from "sanity";

// A photo Julie may upload to replace one of the bundled marketing photos
// (second photo on an overview page, slogan banner, homepage pijler…).
// Always optional: no upload = the site keeps its current photo. The site
// reads it through CMS_FOTO_PROJECTION in web/src/lib/content.ts.
export default defineType({
  name: "cmsFoto",
  title: "Foto",
  type: "object",
  options: { collapsible: true, collapsed: false },
  fields: [
    defineField({
      name: "afbeelding",
      title: "Foto",
      type: "image",
      options: { hotspot: true },
      description: "Kies na het uploaden een focuspunt (hotspot), zodat de foto op smalle schermen goed wordt bijgesneden.",
    }),
    defineField({
      name: "alt",
      title: "Beschrijving voor schermlezers en Google",
      type: "string",
      description: "Kort: wat en wie staat erop. Bv. 'Personal trainer begeleidt een klant bij Movenda'.",
    }),
  ],
  preview: {
    select: { media: "afbeelding", title: "alt" },
    prepare({ media, title }) {
      return { media, title: title || "Foto" };
    },
  },
});
