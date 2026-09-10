import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteSettings",
  title: "Site-instellingen",
  type: "document",
  // Singleton: only one document of this type should exist. Enforce this
  // in the Studio's structure.ts / desk structure (hide "create new").
  fields: [
    defineField({ name: "siteNaam", title: "Sitenaam", type: "string", initialValue: "Movenda" }),
    defineField({ name: "tagline", title: "Tagline", type: "string" }),
    defineField({ name: "email", title: "Algemeen e-mailadres", type: "string" }),
    defineField({
      name: "socials",
      title: "Social media",
      type: "object",
      fields: [
        defineField({ name: "instagram", title: "Instagram-URL", type: "url" }),
        defineField({ name: "facebook", title: "Facebook-URL", type: "url" }),
        defineField({ name: "linkedin", title: "LinkedIn-URL", type: "url" }),
      ],
    }),
    defineField({
      name: "booking",
      title: "Boekknop",
      type: "object",
      description: "Staat standaard UIT. Zet 'enabled' aan zodra jullie een agenda-tool kiezen.",
      fields: [
        defineField({ name: "enabled", title: "Boekknop tonen op de site", type: "boolean", initialValue: false }),
        defineField({ name: "url", title: "Link naar de agenda-tool", type: "url" }),
        defineField({ name: "label", title: "Tekst op de knop", type: "string", initialValue: "Maak een afspraak" }),
      ],
    }),
    defineField({
      name: "googleReviews",
      title: "Google reviews",
      type: "object",
      fields: [
        defineField({ name: "olympia", title: "Olympia", type: "googleReviewInfo" }),
        defineField({ name: "mpc", title: "MPC", type: "googleReviewInfo" }),
      ],
    }),
    defineField({
      name: "analytics",
      title: "Analytics",
      type: "object",
      fields: [
        defineField({ name: "enabled", title: "Analytics actief (na cookie-toestemming)", type: "boolean", initialValue: false }),
        defineField({ name: "ga4Id", title: "GA4 Measurement ID", type: "string" }),
      ],
    }),
    defineField({
      name: "prijzenInfo",
      title: "Prijzen-pagina — algemene info",
      type: "object",
      fields: [
        defineField({ name: "basishonorarium", title: "Basishonorarium (€)", type: "number" }),
        defineField({ name: "intro", title: "Introtekst boven de tabellen", type: "text", rows: 3 }),
        defineField({ name: "terugbetalingStandaard", title: "Terugbetaling — standaard verzekerde", type: "string" }),
        defineField({ name: "terugbetalingVt", title: "Terugbetaling — verhoogde tegemoetkoming (VT/BIM)", type: "string" }),
        defineField({ name: "voorwaarden", title: "Voorwaarden voor terugbetaling", type: "text", rows: 4 }),
      ],
    }),
  ],
});
