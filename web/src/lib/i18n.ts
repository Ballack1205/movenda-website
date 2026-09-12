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

const PRIJS_NAAM_EN: Record<string, string> = {
  "Manuele therapie (30 min)": "Manual therapy (30 min)",
  "Oefentherapie (30 min)": "Exercise therapy (30 min)",
  "Dry Needling (30 min)": "Dry needling (30 min)",
  "Cupping / Taping (30 min)": "Cupping / taping (30 min)",
  "Cardiovasculaire revalidatie (30 min)": "Cardiovascular rehabilitation (30 min)",
  "Pre- en postnatale kinesitherapie (30 min)": "Pre- and postnatal physiotherapy (30 min)",
  "Acupunctuur (30 min)": "Acupuncture (30 min)",
  Inspanningstest: "Exercise test",
  "Personal Training (60 min)": "Personal training (60 min)",
  "Personal Training (90 min)": "Personal training (90 min)",
  "Duotraining (60 min)": "Duo training (60 min)",
  "Sportspecifieke screening + schema (90 min)": "Sport-specific screening + programme (90 min)",
  "Sportspecifieke training (60 min)": "Sport-specific training (60 min)",
  "Pre- en postnatale training (60 min)": "Pre- and postnatal training (60 min)",
  "Training aan huis": "Home training",
  "Sportrevalidatie (30 min)": "Sports rehabilitation (30 min)",
  "High Performance Training (60 min)": "High performance training (60 min)",
  "High Performance Specialization (60 min)": "High performance specialisation (60 min)",
  "Small group training — 10 lessen": "Small group training — 10 classes",
  "Boxing — 10 lessen": "Boxing — 10 classes",
  "Corporate coaching": "Corporate coaching",
  "Sportspecifieke screening (90 min)": "Sport-specific screening (90 min)",
  "Lactaatdrempel-screening": "Lactate threshold screening",
  "Data-analyse": "Data analysis",
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

export function prijsNaam(naam: string, lang: Lang): string {
  if (lang !== "en") return naam;
  return PRIJS_NAAM_EN[naam] || naam.replace(/\blessen\b/gi, "classes");
}

export function prijsNotitie(note: string | undefined, lang: Lang): string | undefined {
  if (!note) return undefined;
  if (lang !== "en") return note;
  return note
    .replace(/ex BTW/gi, "excl. VAT")
    .replace(/enkel op afspraak/gi, "by appointment only")
    .replace(/incl\. opvolging/gi, "incl. follow-up")
    .replace(/bij MPC/gi, "at MPC");
}

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

export const NEWSLETTER_EN = {
  titel: "Get tips to improve your health and performance",
  tekst:
    "We regularly share practical exercise tips, news from the practice, and everything about physiotherapy and performance training.",
  socialProof: "More than 2,000 people already subscribed",
};

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

const TAG_EN: Record<string, string> = {
  Rugpijn: "Back pain",
  Nekpijn: "Neck pain",
  Schouder: "Shoulder",
  Knie: "Knee",
  Enkel: "Ankle",
  Heup: "Hip",
  Pols: "Wrist",
  Elleboog: "Elbow",
  Kaak: "Jaw",
  Hoofdpijn: "Headache",
  Duizeligheid: "Dizziness",
  Sportblessure: "Sports injury",
  Sportblessures: "Sports injuries",
  Prenataal: "Prenatal",
  Postnataal: "Postnatal",
  "Pre- en postnataal": "Pre- and postnatal",
  Zwangerschap: "Pregnancy",
  "Manuele therapie": "Manual therapy",
  "Dry needling": "Dry needling",
  "Personal training": "Personal training",
  Performance: "Performance",
  Revalidatie: "Rehabilitation",
  Sportrevalidatie: "Sports rehabilitation",
  Kinderkinesitherapie: "Paediatric physiotherapy",
  Voetbal: "Football",
  Basketbal: "Basketball",
  Volleybal: "Volleyball",
  Tennis: "Tennis",
  Lopen: "Running",
  Wielrennen: "Cycling",
  Zwemmen: "Swimming",
  Atletiek: "Athletics",
  Veldrijden: "Cyclocross",
  Motorcross: "Motocross",
  Volwassene: "Adult",
  Kind: "Child",
  Senior: "Senior",
  Atleet: "Athlete",
  Topsport: "Elite sport",
  Kinesitherapie: "Physiotherapy",
  "Personal Training": "Personal training",
  "Dry Needling": "Dry needling",
  "Musculoskeletale revalidatie": "Musculoskeletal rehabilitation",
  "Advanced Dry Needling": "Advanced dry needling",
  "Schouder- en polsrevalidatie": "Shoulder and wrist rehabilitation",
  "Sportspecifieke Screening + Training": "Sport-specific screening + training",
  "Sportspecifieke training": "Sport-specific training",
  "Inspanningstesten met lactaatmeting": "Exercise tests with lactate measurement",
  "Pelvische reëducatie": "Pelvic rehabilitation",
  Vroedvrouw: "Midwife",
  "Osteopathie (i.o.)": "Osteopathy (in training)",
  "Physical coach Hubo Limburg United": "Physical coach Hubo Limburg United",
  "Full Body coaching": "Full-body coaching",
  "Physical coach HLU Academy": "Physical coach HLU Academy",
  "Boxing coaching": "Boxing coaching",
  "Kaakklachten (TMJ)": "Jaw complaints (TMJ)",
  "Sprint- en loopblessures": "Sprint and running injuries",
  "Manuele lymfedrainage": "Manual lymphatic drainage",
  Auriculotherapie: "Auriculotherapy",
  "Data-analyse": "Data analysis",
  "Performance coaching": "Performance coaching",
  "Pre- en postnatale revalidatie": "Pre- and postnatal rehabilitation",
  "Pre- en postnatale training": "Pre- and postnatal training",
  HIIT: "HIIT",
  Taping: "Taping",
};

export function tagLabel(label: string, lang: Lang): string {
  if (lang !== "en") return label;
  return TAG_EN[label] || label;
}

export type FaqCopy = { vraag: string; antwoord: string };

export function faqCopy(faq: { vraag: string; vraagEn?: string; antwoord: string; antwoordEn?: string }, lang: Lang): FaqCopy {
  return {
    vraag: lang === "en" ? faq.vraagEn || faq.vraag : faq.vraag,
    antwoord: lang === "en" ? faq.antwoordEn || faq.antwoord : faq.antwoord,
  };
}
