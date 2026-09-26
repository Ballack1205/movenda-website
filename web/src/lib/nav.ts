// Primary navigation model for Header.astro.
//
// The *structure* (which groups exist, their order, the CTA) is code — we
// own layout (AGENTS.md rule 6). The *contents* of the Kinesitherapie /
// Training / MPC dropdowns come from the CMS diensten, so when Julie adds a
// behandeling in Sanity it appears in the menu on the next build without a
// code change. Sportaanbod Olympia (external partner links) is CMS-driven
// too and lives under "Over ons" instead of taking a top-level slot.

import {
  dienstHref,
  dienstMenuLabel,
  getDiensten,
  getLocaties,
  getSiteSettings,
  getSportaanbod,
  localizeInternalHref,
  type Dienst,
  type DienstCategorie,
  type Locatie,
  type SiteSettings,
  type SportaanbodItem,
} from "./content";
import { movendaHomeHref, THEME } from "./site";

export type Brand = "movenda" | "mpc";
export type Lang = "nl" | "en";

export interface NavLink {
  href: string;
  label: string;
  external?: boolean;
  /** Column label inside a mega menu. Not a link. */
  heading?: boolean;
}

export interface NavGroup {
  label: string;
  href: string;
  children: NavLink[];
}

export interface NavItem extends NavLink {
  /** Brand switch link (Movenda ↔ MPC): rendered bold. */
  emphasize?: boolean;
  /** Dropdown entries. The first entry should be the overview page. */
  children?: NavLink[];
  /** Wide menu: one column per domain. Lab/brief header only. */
  groups?: NavGroup[];
  /** Lab/brief header: sits left of the logo. */
  side?: "start";
  /** Lab/brief header: the strong Afspraak control. */
  button?: boolean;
}

export type NavCta = NavLink;

export interface NavModel {
  items: NavItem[];
  /** Primary action on the right of the bar. Booking when enabled, otherwise Contact. */
  cta: NavCta;
  /** Shown in the mobile/tablet panel. */
  phone?: string;
  /** Contact link for the panel footer when the CTA is the booking button. */
  contact: NavLink;
}

interface NavData {
  diensten: Dienst[];
  locaties: Locatie[];
  settings: SiteSettings;
  sportaanbod: SportaanbodItem[];
}

// One fetch per build, not one per page. content.ts also memoizes the
// underlying lists; this keeps Header from awaiting four getters on every route.
let navDataPromise: Promise<NavData> | undefined;

function loadNavData(): Promise<NavData> {
  if (!navDataPromise) {
    navDataPromise = Promise.all([getDiensten(), getLocaties(), getSiteSettings(), getSportaanbod()]).then(
      ([diensten, locaties, settings, sportaanbod]) => ({ diensten, locaties, settings, sportaanbod }),
    );
  }
  return navDataPromise;
}

function dienstLinks(diensten: Dienst[], categorie: DienstCategorie | DienstCategorie[], lang: Lang): NavLink[] {
  const cats = Array.isArray(categorie) ? categorie : [categorie];
  // Category order as passed in, then Julie's volgorde within a category.
  // "Tonen in het menu" off (Studio → Diensten) hides a dienst here only; its page stays live.
  return diensten
    .filter((d) => cats.includes(d.categorie) && d.toonInMenu !== false)
    .sort((a, b) => cats.indexOf(a.categorie) - cats.indexOf(b.categorie) || a.volgorde - b.volgorde)
    .map((d) => ({ href: dienstHref(d, lang), label: dienstMenuLabel(d, lang) }));
}

function linksBySlugs(
  diensten: Dienst[],
  picks: { slug: string; categorie: DienstCategorie; label?: string }[],
  lang: Lang,
): NavLink[] {
  return picks.flatMap((pick) => {
    const dienst = diensten.find((d) => d.slug === pick.slug && d.categorie === pick.categorie);
    if (!dienst || dienst.toonInMenu === false) return [];
    return [{ href: dienstHref(dienst, lang), label: pick.label || dienstMenuLabel(dienst, lang) }];
  });
}

/** Julie's header (lab/brief). Only pages that already exist. Rehab is one URL. */
function briefNav(diensten: Dienst[], lang: Lang, contact: NavLink): NavModel {
  const p = (href: string) => localizeInternalHref(href, lang);
  const en = lang === "en";
  const rehabHref = p("/mpc/sportrevalidatie");
  const kine: NavLink[] = [
    ...linksBySlugs(
      diensten,
      [
        { slug: "manuele-therapie", categorie: "kine" },
        { slug: "oefentherapie", categorie: "kine" },
        { slug: "algemene-kinesitherapie", categorie: "kine" },
      ],
      lang,
    ),
    { href: rehabHref, label: en ? "Sports physiotherapy and rehab" : "Sportkinesitherapie en revalidatie" },
    ...linksBySlugs(
      diensten,
      [
        { slug: "pre-en-postnatale-kinesitherapie", categorie: "kine" },
        { slug: "bekkenbodemtherapie", categorie: "kine" },
        { slug: "lymfedrainage", categorie: "kine" },
        { slug: "acupunctuur", categorie: "kine" },
        { slug: "dry-needling", categorie: "kine" },
        { slug: "cupping", categorie: "kine" },
        { slug: "auriculotherapie", categorie: "kine" },
        { slug: "cardiovasculaire-revalidatie", categorie: "kine" },
        { slug: "taping", categorie: "kine" },
        { slug: "barefoot", categorie: "kine" },
      ],
      lang,
    ),
  ];
  const train = linksBySlugs(
    diensten,
    [
      { slug: "performance-training", categorie: "mpc-training", label: en ? "Performance coaching" : "Performance Coaching" },
      { slug: "personal-training", categorie: "mpc-training" },
      { slug: "duotraining", categorie: "mpc-training", label: en ? "Duo training" : "Duo Training" },
      { slug: "boxing-1-on-1", categorie: "mpc-training", label: "Boxing 1-on-1" },
      { slug: "pre-en-postnatale-training", categorie: "training" },
    ],
    lang,
  );
  const test = linksBySlugs(
    diensten,
    [
      { slug: "sportspecifieke-screening", categorie: "training", label: en ? "Performance screening" : "Performance Screening" },
      { slug: "inspanningstesten", categorie: "training" },
      { slug: "loopanalyse-ontracx", categorie: "mpc-training", label: "Loopanalyse met OnTracx" },
      { slug: "vald-screening", categorie: "mpc-training", label: "VALD Screening" },
      { slug: "data-analyse", categorie: "mpc-training", label: "Data Analysis" },
      { slug: "monitoring-whoop", categorie: "mpc-training", label: "Monitoring met Whoop" },
    ],
    lang,
  );
  const gx = [
    ...linksBySlugs(
      diensten,
      [
        { slug: "full-body", categorie: "mpc-groep" },
        { slug: "hiit", categorie: "mpc-groep" },
        { slug: "powerplus", categorie: "mpc-groep" },
        { slug: "boxing", categorie: "mpc-groep" },
        { slug: "skifit", categorie: "mpc-groep" },
        { slug: "kleine-groepstraining", categorie: "mpc-groep" },
      ],
      lang,
    ),
    { href: p("/mpc/groepslessen"), label: en ? "Timetable" : "Lessenrooster" },
  ];
  const keuzehulp = `${p("/team")}#keuzehulp`;
  const afspraak: NavItem = {
    href: keuzehulp,
    label: en ? "Book" : "Afspraak",
    button: true,
  };

  return {
    items: [
      {
        href: p("/kinesitherapie"),
        label: en ? "Offer" : "Aanbod",
        side: "start",
        groups: [
          { label: en ? "Physiotherapy" : "Kinesitherapie", href: p("/kinesitherapie"), children: kine },
          {
            label: "Performance",
            href: p("/mpc"),
            children: [
              { href: "", label: "Train", heading: true },
              ...train,
              { href: "", label: en ? "Test and analysis" : "Test en analyse", heading: true },
              ...test,
              { href: rehabHref, label: en ? "Rehab" : "Revalidatie" },
            ],
          },
          { label: "GX", href: p("/mpc/groepslessen"), children: gx },
          { label: "B2B", href: p("/mpc/corporate-coaching"), children: [] },
          {
            label: "Olympia",
            href: p("/locaties/olympia"),
            children: [
              { href: p("/kine-abonnement"), label: en ? "Physio membership" : "Kiné-abonnement" },
              {
                href: "https://www.oly.be",
                label: en ? "About this location" : "Over deze locatie",
                external: true,
              },
            ],
          },
        ],
      },
      {
        href: p("/team"),
        label: "Team",
      },
      {
        href: p("/over"),
        label: en ? "About us" : "Over ons",
        children: [
          { href: p("/over"), label: en ? "Our story" : "Ons verhaal" },
          { href: p("/mpc/visie"), label: en ? "Our vision" : "Onze visie" },
          { href: p("/team"), label: "Team" },
          { href: p("/events"), label: "Events" },
          { href: p("/prijzen"), label: en ? "Prices" : "Prijzen" },
          { href: p("/faq"), label: "FAQ" },
          { href: p("/jobs"), label: en ? "Jobs" : "Vacatures" },
        ],
      },
      contact,
      afspraak,
    ],
    cta: afspraak,
    contact,
  };
}

function sportaanbodLinks(items: SportaanbodItem[], lang: Lang = "nl"): NavLink[] {
  return items
    .filter((item): item is SportaanbodItem & { link: string } => !!item.link)
    .map((item) => ({
      href: item.link,
      label: lang === "en" ? item.naamEn || item.naam : item.naam,
      external: true,
    }));
}

export async function getNavModel(brand: Brand, lang: Lang): Promise<NavModel> {
  const { diensten, locaties, settings, sportaanbod } = await loadNavData();
  const locatie = locaties.find((l) => l.slug === (brand === "mpc" ? "mpc" : "olympia"));
  const phone = locatie?.telefoon;

  const contact: NavLink =
    lang === "en" ? { href: "/en/contact", label: "Contact" } : { href: "/contact", label: "Contact" };

  const { booking } = settings;
  const cta: NavCta =
    booking.enabled && booking.url
      ? { href: booking.url, label: lang === "en" ? "Book an appointment" : booking.label, external: true }
      : contact;
  // When booking is the CTA, Contact goes back into the list as a plain link.
  const contactItem: NavItem[] = cta === contact ? [] : [contact];

  if (THEME === "lab") {
    const model = briefNav(diensten, lang, contact);
    return { ...model, phone };
  }

  if (brand === "mpc") {
    if (lang === "en") {
      return {
        items: [
          {
            href: "/en/mpc#training",
            label: "Training",
            children: [
              { href: "/en/mpc#training", label: "All training" },
              ...dienstLinks(diensten, "mpc-training", "en"),
            ],
          },
          {
            href: "/en/mpc#sportrevalidatie",
            label: "Sports rehabilitation",
            children: [
              { href: "/en/mpc#sportrevalidatie", label: "All sports rehabilitation" },
              ...dienstLinks(diensten, "mpc-rehab", "en"),
            ],
          },
          {
            href: "/en/mpc/groepslessen",
            label: "Group classes",
            children: [
              { href: "/en/mpc/groepslessen", label: "Timetable & all classes" },
              ...dienstLinks(diensten, "mpc-groep", "en"),
            ],
          },
          { href: "/en/mpc/prijzen", label: "Prices" },
          { href: "/en/team", label: "Team" },
          {
            href: "/en/mpc/visie",
            label: "About MPC",
            children: [
              { href: "/en/mpc/visie", label: "Vision" },
              { href: "/en/mpc#faq", label: "FAQ" },
            ],
          },
          (() => {
            const href = movendaHomeHref("en");
            return { href, label: "Movenda", emphasize: true, external: /^https?:/.test(href) };
          })(),
          ...contactItem,
        ],
        cta,
        phone,
        contact,
      };
    }
    return {
      items: [
        {
          href: "/mpc#training",
          label: "Training",
          children: [
            { href: "/mpc#training", label: "Alle training" },
            ...dienstLinks(diensten, "mpc-training", "nl"),
          ],
        },
        {
          href: "/mpc#sportrevalidatie",
          label: "Sportrevalidatie",
          children: [
            { href: "/mpc#sportrevalidatie", label: "Alle sportrevalidatie" },
            ...dienstLinks(diensten, "mpc-rehab", "nl"),
          ],
        },
        {
          href: "/mpc/groepslessen",
          label: "Groepslessen",
          children: [
            { href: "/mpc/groepslessen", label: "Lesrooster & alle lessen" },
            ...dienstLinks(diensten, "mpc-groep", "nl"),
          ],
        },
        { href: "/mpc/prijzen", label: "Prijzen" },
        { href: "/team", label: "Team" },
        {
          href: "/mpc/visie",
          label: "Over MPC",
          children: [
            { href: "/mpc/visie", label: "Visie" },
            { href: "/mpc#faq", label: "Veelgestelde vragen" },
          ],
        },
        (() => {
          const href = movendaHomeHref("nl");
          return { href, label: "Movenda", emphasize: true, external: /^https?:/.test(href) };
        })(),
        ...contactItem,
      ],
      cta,
      phone,
      contact,
    };
  }

  if (lang === "en") {
    return {
      items: [
        {
          href: "/en/kinesitherapie",
          label: "Physiotherapy",
          children: [
            { href: "/en/kinesitherapie", label: "All treatments" },
            ...dienstLinks(diensten, "kine", "en"),
          ],
        },
        {
          href: "/en/training",
          label: "Training",
          children: [{ href: "/en/training", label: "All training" }, ...dienstLinks(diensten, "training", "en")],
        },
        { href: "/en/team", label: "Team" },
        { href: "/en/prijzen", label: "Prices" },
        {
          href: "/en/over",
          label: "About us",
          children: [
            { href: "/en/over", label: "About Movenda" },
            { href: "/en/faq", label: "FAQ" },
            { href: "/en/blog", label: "Blog" },
            { href: "/en/jobs", label: "Jobs" },
            ...sportaanbodLinks(sportaanbod, "en"),
          ],
        },
        { href: "/en/mpc", label: "MPC", emphasize: true },
        ...contactItem,
      ],
      cta,
      phone,
      contact,
    };
  }

  return {
    items: [
      {
        href: "/kinesitherapie",
        label: "Kinesitherapie",
        children: [
          { href: "/kinesitherapie", label: "Alle behandelingen" },
          ...dienstLinks(diensten, "kine", "nl"),
        ],
      },
      {
        href: "/training",
        label: "Training",
        children: [{ href: "/training", label: "Alle trainingen" }, ...dienstLinks(diensten, "training", "nl")],
      },
      { href: "/team", label: "Team" },
      { href: "/prijzen", label: "Prijzen" },
      {
        href: "/over",
        label: "Over ons",
        children: [
          { href: "/over", label: "Over Movenda" },
          { href: "/faq", label: "Veelgestelde vragen" },
          { href: "/blog", label: "Blog" },
          { href: "/jobs", label: "Vacatures" },
          ...sportaanbodLinks(sportaanbod, "nl"),
        ],
      },
      { href: "/mpc", label: "MPC", emphasize: true },
      ...contactItem,
    ],
    cta,
    phone,
    contact,
  };
}

/** Path without query, no trailing slash (site uses trailingSlash: "never"). */
function normalizePath(href: string): string {
  const clean = href.split("?")[0];
  return clean.length > 1 ? clean.replace(/\/$/, "") : clean;
}

/**
 * Is `href` the current page or an ancestor of it? Root ("/" and "/en") only
 * match exactly, otherwise every page would light up "Home".
 */
export function isCurrentPath(href: string, path: string): boolean {
  if (/^https?:/.test(href)) return false;
  // Section anchors (/mpc#training) are never "the current page": on /mpc
  // every anchor would light up, and /mpc/* pages would match them by prefix.
  if (href.includes("#")) return false;
  const target = normalizePath(href);
  const current = normalizePath(path);
  if (target === "/" || target === "/en") return target === current;
  return current === target || current.startsWith(target + "/");
}

/** Active if the item itself or one of its children matches the current page. */
export function isActiveItem(item: NavItem, path: string): boolean {
  if (isCurrentPath(item.href, path)) return true;
  if ((item.children || []).some((child) => !child.heading && isCurrentPath(child.href, path))) return true;
  return (item.groups || []).some(
    (group) =>
      isCurrentPath(group.href, path) ||
      group.children.some((child) => !child.heading && isCurrentPath(child.href, path)),
  );
}
