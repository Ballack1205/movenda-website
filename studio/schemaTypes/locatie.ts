import { defineField, defineType } from "sanity";

export default defineType({
  name: "locatie",
  title: "Locatie",
  type: "document",
  fields: [
    defineField({ name: "naam", title: "Naam", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "naam" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "brand",
      title: "Huisstijl",
      type: "string",
      options: { list: [{ title: "Movenda (licht)", value: "movenda" }, { title: "MPC (donker)", value: "mpc" }] },
    }),
    defineField({ name: "type", title: "Type / ondertitel", type: "string" }),
    defineField({ name: "adres", title: "Adres", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "geo",
      title: "GPS-coördinaten",
      type: "geopoint",
      description: "Belangrijk voor lokale SEO (LocalBusiness schema).",
    }),
    defineField({ name: "telefoon", title: "Telefoon", type: "string" }),
    defineField({ name: "email", title: "E-mail", type: "string" }),
    defineField({
      name: "uren",
      title: "Openingsuren",
      type: "array",
      of: [
        {
          type: "object",
          name: "openingsuur",
          fields: [
            { name: "dag", type: "string", title: "Dag" },
            { name: "van", type: "string", title: "Van (uu:mm)" },
            { name: "tot", type: "string", title: "Tot (uu:mm)" },
          ],
        },
      ],
    }),
    defineField({ name: "urenNote", title: "Extra noot bij openingsuren", type: "string" }),
    defineField({ name: "btw", title: "BTW-nummer", type: "string" }),
    defineField({ name: "iban", title: "IBAN", type: "string" }),
    defineField({ name: "bic", title: "BIC", type: "string" }),
    defineField({ name: "mapsUrl", title: "Google Maps-link", type: "url" }),
    defineField({
      name: "googleBusinessUrl",
      title: "Google Bedrijfsprofiel-URL (deze vestiging)",
      type: "url",
      description:
        "De vaste link naar jullie Google-vermelding (Google Maps → Delen → 'Link kopiëren', of de g.page/maps.app.goo.gl-link uit het Bedrijfsprofiel). Koppelt deze vestiging in de structured data aan Google Maps; belangrijk voor lokale SEO en AI-zoekmachines.",
    }),
    defineField({ name: "routebeschrijving", title: "Routebeschrijving eerste bezoek", type: "text", rows: 4 }),
    defineField({ name: "rpr", title: "RPR", type: "string" }),
    defineField({ name: "instagram", title: "Instagram-URL (deze vestiging)", type: "url" }),
    defineField({ name: "facebook", title: "Facebook-URL (deze vestiging)", type: "url" }),
    defineField({ name: "verdiepingNote", title: "Verdieping / extra locatie-noot", type: "string" }),
  ],
});
