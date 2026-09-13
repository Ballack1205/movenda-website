export type Lang = "nl" | "en";

/** Prefix an internal path for the given language (`/` → `/en`). External URLs pass through. */
export function withLang(path: string, lang: Lang): string {
  if (lang !== "en") return path;
  if (/^(https?:|tel:|mailto:)/i.test(path)) return path;
  if (path.startsWith("/en")) return path;
  if (path === "/") return "/en";
  return `/en${path}`;
}

/** The same page in the other language, for hreflang + the header switcher. */
export function otherLangPath(path: string, lang: Lang): string {
  if (lang === "en") {
    if (path === "/en") return "/";
    return path.replace(/^\/en/, "") || "/";
  }
  if (path === "/") return "/en";
  return `/en${path}`;
}

export function localizeHref(href: string | undefined, lang: Lang, fallback = "/contact"): string {
  return withLang(href || fallback, lang);
}

const DAYS_EN: Record<string, string> = {
  Maandag: "Monday",
  Dinsdag: "Tuesday",
  Woensdag: "Wednesday",
  Donderdag: "Thursday",
  Vrijdag: "Friday",
  Zaterdag: "Saturday",
  Zondag: "Sunday",
};

export function weekday(dag: string, lang: Lang): string {
  if (lang !== "en") return dag;
  return DAYS_EN[dag] || dag;
}

export const WEEKDAYS_NL = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"] as const;

export function locatieType(type: string, lang: Lang): string {
  if (lang !== "en") return type;
  return type
    .replace(/Kinesitherapie/gi, "Physiotherapy")
    .replace(/sportrevalidatie/gi, "sports rehabilitation");
}

export function byAppointment(note: string | undefined, lang: Lang): string | undefined {
  if (!note) return undefined;
  if (lang !== "en") return note;
  return /enkel op afspraak/i.test(note) ? "By appointment only" : note;
}

export function locatieRoute(slug: string, nl: string | undefined, lang: Lang): string | undefined {
  if (!nl) return undefined;
  if (lang !== "en") return nl;
  if (slug === "olympia") {
    return "First visit? Take the sports entrance on the left of the building, where Movenda is on the window. Check in at the info desk and say you are here for physiotherapy. You will get an access card and a staff member will show you upstairs. Upstairs, open the gate with the access card and walk around the corner to the second desk. You can wait in the waiting room there.";
  }
  return nl;
}

export function floorNote(note: string | undefined, lang: Lang): string | undefined {
  if (!note) return undefined;
  if (lang !== "en") return note;
  if (/verdieping\s*-1/i.test(note)) return "PowerPlus takes place on floor −1.";
  return note;
}

/** English copy for prices/reimbursement when the CMS field is still Dutch-only. */
export const PRIJZEN_INFO_EN = {
  intro:
    "Our fees are indexed annually and follow the recommendations of Axxon, the professional association for physiotherapists. All our therapists are deconventioned (not bound by the official RIZIV rates).",
  basishonorarium:
    "Our base fee is {amount}. The exact rate depends on the treating therapist, specialisation and experience.",
  nomenclatuur: "Nomenclature",
  categorie: "Category",
  omschrijving: "Description",
  ereloon: "Fee",
  terugbetaling: "Reimbursement",
  standaard: "Standard insured",
  vt: "Increased reimbursement (VT/BIM)",
  annulatie: "Cancellation:",
  mpcIntro:
    "Training, sports rehabilitation and group classes in Kuringen. Prices exclusive of VAT, by appointment only.",
  mpcCta: "See MPC prices →",
  terugbetalingBody:
    "After each session you receive a certificate of provided care. You claim reimbursement from your health insurance fund yourself (via the app or at the office).",
  terugbetalingStandaard: "±€18 to €20 per session",
  terugbetalingVt: "More favourable rates — ask your health insurance fund",
  voorwaarden:
    "Reimbursement conditions: you need a doctor's prescription. Treatment must start within 2 months of the prescription date. A maximum of 18 sessions per condition per calendar year are reimbursed. For chronic or severe conditions this can be higher — check with your doctor or health insurance fund.",
  annulatiebeleid:
    "Please cancel at least 24 hours in advance by phone or email. Later cancellation or a no-show: we charge the full session.",
};

const NOMEN_CAT_EN: Record<string, string> = {
  Courant: "Standard (courant)",
  "F-acuut": "F-acute",
  "F-chronisch": "F-chronic",
  "E-pathologie": "E-pathology",
};

const NOMEN_OMS_EN: Record<string, string> = {
  "1e beurt & verslag": "1st session & report",
  "2e t.e.m. 18e beurt": "2nd to 18th session",
  Verslag: "Report",
  "1e t.e.m. 60e beurt": "1st to 60th session",
};

export function nomenCategorie(categorie: string, lang: Lang): string {
  if (lang !== "en") return categorie;
  return NOMEN_CAT_EN[categorie] || categorie;
}

export function nomenOmschrijving(omschrijving: string, lang: Lang): string {
  if (lang !== "en") return omschrijving;
  return NOMEN_OMS_EN[omschrijving] || omschrijving;
}

export function legalCourt(rpr: string | undefined, lang: Lang): string | undefined {
  if (!rpr) return undefined;
  if (lang !== "en") return rpr;
  return rpr.replace(/Antwerpen/g, "Antwerp").replace(/afdeling/gi, "division");
}

export function partnerBandTitle(title: string | undefined, lang: Lang): string {
  const fallback = lang === "en" ? "Our partners" : "Onze partners";
  if (!title) return fallback;
  if (lang !== "en") return title;
  if (/onze partners/i.test(title)) return "Our partners";
  return title;
}

export const KEUZEHULP_EN = {
  titel: "Who's the right fit?",
  intro: "Pick what applies to you — one choice per question is enough. This is a guide, not medical advice.",
  vragen: {
    klacht: "How can we help?",
    regio: "Where is the complaint?",
    sport: "Which sport do you practise?",
    doelgroep: "What fits you?",
  },
  geenMatchTekst:
    "No exact match, but these colleagues are closest to your question. Unsure? Call us — we'll point you to the right person.",
};

export type FaqCopy = { vraag: string; antwoord: string };

export function faqCopy(faq: { vraag: string; vraagEn?: string; antwoord: string; antwoordEn?: string }, lang: Lang): FaqCopy {
  return {
    vraag: lang === "en" ? faq.vraagEn || faq.vraag : faq.vraag,
    antwoord: lang === "en" ? faq.antwoordEn || faq.antwoord : faq.antwoord,
  };
}
