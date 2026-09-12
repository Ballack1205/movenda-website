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
      name: "teamfoto",
      title: "Groepsfoto team",
      type: "object",
      description:
        "Brede foto van het hele team, getoond bovenaan de Team-pagina. Kies bij het uploaden een focuspunt (hotspot) op de gezichten, zodat de foto op smalle schermen goed wordt bijgesneden. Zonder foto gebruikt de site de groepsfoto van de oude website.",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "afbeelding",
          title: "Foto",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({
          name: "alt",
          title: "Beschrijving voor schermlezers",
          type: "string",
          description: "Kort: wie staat erop en waar. Bv. 'Het team van Movenda in Sportcentrum Olympia'.",
        }),
        defineField({
          name: "bijschrift",
          title: "Bijschrift onder de foto (optioneel)",
          type: "string",
          description: "Bv. 'Team Movenda, zomer 2025'. Leeg laten = geen bijschrift.",
        }),
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
      description:
        "Google Analytics start pas nadat een bezoeker op 'Oké' klikt in de cookiebalk. Umami is cookieloos en telt altijd anoniem mee (geen toestemming nodig).",
      fields: [
        defineField({ name: "enabled", title: "Analytics actief", type: "boolean", initialValue: false }),
        defineField({
          name: "mode",
          title: "Modus",
          type: "string",
          description:
            "Testmodus: de cookiebalk en events werken, maar er wordt niets naar Google of Umami gestuurd (events verschijnen enkel in de browserconsole). Zet op Live bij de go-live.",
          options: {
            list: [
              { title: "Test (niets wordt verstuurd)", value: "test" },
              { title: "Live", value: "live" },
            ],
            layout: "radio",
          },
          initialValue: "test",
        }),
        defineField({ name: "ga4Id", title: "Google Analytics 4 — Measurement ID (G-XXXX)", type: "string" }),
        defineField({
          name: "umami",
          title: "Umami (cookieloos)",
          type: "object",
          description:
            "Privacyvriendelijk alternatief/aanvulling zonder cookies. Maak een gratis account op umami.is, voeg de website toe en plak hier het Website ID.",
          options: { collapsible: true, collapsed: true },
          fields: [
            defineField({ name: "enabled", title: "Umami actief", type: "boolean", initialValue: false }),
            defineField({ name: "websiteId", title: "Website ID", type: "string" }),
            defineField({
              name: "scriptUrl",
              title: "Script-URL",
              type: "url",
              description: "Standaard https://cloud.umami.is/script.js (EU-regio: https://eu.umami.is/script.js). Enkel wijzigen bij self-hosting.",
              initialValue: "https://cloud.umami.is/script.js",
            }),
          ],
        }),
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
        defineField({ name: "exBtwMpc", title: "MPC-prijzen exclusief BTW", type: "boolean", initialValue: true }),
        defineField({ name: "annulatiebeleid", title: "Annulatiebeleid", type: "text", rows: 3 }),
        defineField({
          name: "nomenclatuur",
          title: "Nomenclatuurtabel (kine)",
          type: "array",
          of: [
            {
              type: "object",
              name: "nomenItem",
              fields: [
                { name: "categorie", type: "string", title: "Categorie" },
                { name: "omschrijving", type: "string", title: "Omschrijving" },
                { name: "bedrag", type: "string", title: "Ereloon" },
              ],
            },
          ],
        }),
      ],
    }),
    defineField({
      name: "slogans",
      title: "Slogans",
      description:
        "Korte one-liners op de site. Nederlands is de hoofdtaal; de Engelse velden verschijnen alleen op de /en-pagina's (leeg = Nederlandse tekst).",
      type: "object",
      fields: [
        defineField({ name: "home", title: "Homepage (NL)", type: "string", description: "Banner met foto onder de partnerlogo's. Elke zin komt op een eigen regel." }),
        defineField({ name: "homeEn", title: "Homepage (EN)", type: "string" }),
        defineField({ name: "kine", title: "Kinesitherapie", type: "string" }),
        defineField({ name: "mpc", title: "MPC (NL)", type: "string" }),
        defineField({ name: "mpcEn", title: "MPC (EN)", type: "string" }),
        defineField({ name: "prijzenKine", title: "Prijzen kine", type: "string" }),
        defineField({ name: "prijzenPt", title: "Prijzen PT", type: "string" }),
      ],
    }),
    defineField({
      name: "homePijlers",
      title: "Homepage — drie pijlers",
      description:
        "De drie blokken onder de hero op de homepage. Per pijler: titel, korte tekst en de lijst 'waarvoor kom je / voor wie'. De technieken ernaast komen automatisch uit 'Diensten'.",
      type: "object",
      fields: [
        defineField({ name: "kine", title: "Kinesitherapie", type: "homePijler" }),
        defineField({ name: "training", title: "Personal training", type: "homePijler" }),
        defineField({ name: "mpc", title: "Movenda Performance Centre", type: "homePijler" }),
      ],
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: "partnerband",
      title: "Partnerbalk",
      description: "De bewegende logobalk. De partners zelf beheer je onder 'Partners & logo's'.",
      type: "object",
      fields: [
        defineField({ name: "titel", title: "Titel boven de balk (Movenda)", type: "string", initialValue: "Onze partners" }),
        defineField({ name: "titelMpc", title: "Titel boven de balk (MPC)", type: "string", initialValue: "Corporate partners" }),
        defineField({
          name: "snelheid",
          title: "Snelheid",
          type: "string",
          options: {
            list: [
              { title: "Rustig", value: "rustig" },
              { title: "Normaal", value: "normaal" },
              { title: "Snel", value: "snel" },
            ],
            layout: "radio",
          },
          initialValue: "normaal",
        }),
        defineField({
          name: "animatie",
          title: "Logo's laten bewegen",
          type: "boolean",
          description: "Uit = alle logo's stilstaand naast elkaar.",
          initialValue: true,
        }),
      ],
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: "instagramFeed",
      title: "Instagram-blok (homepage)",
      description:
        "De feed boven de nieuwsbrief, dezelfde Elfsight-widget als op de oude site. Uit = blok verborgen. Het widget-ID hoef je alleen te wijzigen als Elfsight een nieuwe code geeft.",
      type: "object",
      fields: [
        defineField({ name: "enabled", title: "Tonen op de homepage", type: "boolean", initialValue: true }),
        defineField({
          name: "titel",
          title: "Titel boven de feed",
          type: "string",
          initialValue: "Volg ons",
        }),
        defineField({
          name: "widgetId",
          title: "Elfsight widget-ID",
          type: "string",
          description: "Het ID uit de embed-code (elfsight-app-…). Leeg = standaard Movenda-feed.",
        }),
      ],
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: "nieuwsbrief",
      title: "Nieuwsbriefblok",
      type: "object",
      fields: [
        defineField({ name: "enabled", title: "Tonen", type: "boolean", initialValue: true }),
        defineField({ name: "titel", title: "Titel", type: "string" }),
        defineField({ name: "tekst", title: "Tekst", type: "text", rows: 2 }),
        defineField({ name: "socialProof", title: "Social proof (bv. 2.000+)", type: "string" }),
      ],
    }),
  ],
});
