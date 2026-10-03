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
  isB2bDienst,
  getDiensten,
  getLocaties,
  getSiteSettings,
  getSportaanbod,
  localizeInternalHref,
  uiTekst,
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
  /** Section label, same style as Train and Test en analyse. A heading with an href stays a link. */
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
    .filter((d) => cats.includes(d.categorie) && d.toonInMenu !== false && !isB2bDienst(d))
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
function briefNav(diensten: Dienst[], lang: Lang, contact: NavLink, settings: SiteSettings): NavModel {
  const p = (href: string) => localizeInternalHref(href, lang);
  const w = (key: string) => uiTekst(settings, "menu", key, lang);
  const rehabHref = p("/performance/sportrevalidatie");
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
    { href: rehabHref, label: w("sportkine") },
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
      { slug: "personal-training", categorie: "mpc-training", label: w("personalTraining") },
      { slug: "performance-training", categorie: "mpc-training", label: w("performanceCoaching") },
      { slug: "high-performance-coaching", categorie: "mpc-training", label: w("highPerformance") },
      { slug: "duotraining", categorie: "mpc-training", label: w("duoTraining") },
      { slug: "boxing-1-on-1", categorie: "mpc-training", label: w("boxing") },
      { slug: "pre-en-postnatale-training", categorie: "training" },
    ],
    lang,
  );
  const test = linksBySlugs(
    diensten,
    [
      { slug: "sportspecifieke-screening", categorie: "training", label: w("performanceScreening") },
      { slug: "inspanningstesten", categorie: "training" },
      { slug: "loopanalyse-ontracx", categorie: "mpc-training", label: w("loopanalyse") },
      { slug: "vald-screening", categorie: "mpc-training", label: w("vald") },
    ],
    lang,
  );
  // Julie, 2 Oct: of the B2B formats, only 1 (Corporate Coaching) and 2 (training at work) go online.
  const b2b: NavLink[] = [
    { href: p("/b2b"), label: w("corporate") },
    ...linksBySlugs(
      diensten,
      [{ slug: "on-site-workouts", categorie: "mpc-groep", label: w("trainingWerk") }],
      lang,
    ),
  ];
  const gx = [
    ...linksBySlugs(
      diensten,
      [
        { slug: "full-body", categorie: "mpc-groep" },
        { slug: "hiit", categorie: "mpc-groep" },
        { slug: "powerplus", categorie: "mpc-groep" },
        { slug: "boxing", categorie: "mpc-groep" },
        { slug: "skifit", categorie: "mpc-groep" },
        { slug: "running", categorie: "mpc-groep" },
        { slug: "core", categorie: "mpc-groep" },
        { slug: "mxgp", categorie: "mpc-groep" },
      ],
      lang,
    ),
    { href: p("/groepslessen"), label: w("lessenrooster") },
  ];
  const keuzehulp = `${p("/team")}#keuzehulp`;
  const afspraak: NavItem = {
    href: keuzehulp,
    label: w("afspraak"),
    button: true,
  };

  return {
    items: [
      {
        href: p("/kinesitherapie"),
        label: w("aanbod"),
        side: "start",
        groups: [
          { label: w("kinesitherapie"), href: p("/kinesitherapie"), children: kine },
          {
            label: w("performance"),
            href: p("/performance"),
            children: [
              { href: "", label: w("train"), heading: true },
              ...train,
              { href: "", label: w("test"), heading: true },
              ...test,
              { href: rehabHref, label: w("revalidatie"), heading: true },
            ],
          },
          { label: w("gx"), href: p("/groepslessen"), children: gx },
          { label: w("b2b"), href: p("/b2b"), children: b2b },
          {
            label: w("olympia"),
            href: p("/locaties/olympia"),
            children: [
              { href: p("/kine-abonnement"), label: w("kineAbonnement") },
              {
                href: "https://www.oly.be",
                label: w("overLocatie"),
                external: true,
              },
            ],
          },
        ],
      },
      {
        href: p("/team"),
        label: w("team"),
      },
      {
        href: p("/over-ons/ons-verhaal"),
        label: w("overOns"),
        children: [
          { href: p("/over-ons/ons-verhaal"), label: w("onsVerhaal") },
          { href: p("/over-ons/onze-visie"), label: w("onzeVisie") },
          { href: p("/team"), label: w("team") },
          { href: p("/events"), label: w("events") },
          { href: p("/prijzen"), label: w("prijzen") },
          { href: p("/faq"), label: w("faq") },
          { href: p("/jobs"), label: w("vacatures") },
        ],
      },
      contact,
      afspraak,
    ],
    cta: afspraak,
    contact,
  };
}

/** Same Aanbod lists the header uses, so overview pages do not keep a second copy. */
export async function getBriefAanbod(lang: Lang): Promise<NavGroup[]> {
  const { diensten, settings } = await loadNavData();
  const contact: NavLink = {
    href: lang === "en" ? "/en/contact" : "/contact",
    label: uiTekst(settings, "menu", "contact", lang),
  };
  return briefNav(diensten, lang, contact, settings).items[0]?.groups ?? [];
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

  const w = (key: string) => uiTekst(settings, "menu", key, lang);
  const contact: NavLink = {
    href: lang === "en" ? "/en/contact" : "/contact",
    label: w("contact"),
  };

  const { booking } = settings;
  const cta: NavCta =
    booking.enabled && booking.url
      ? {
          href: booking.url,
          label: lang === "en" ? booking.labelEn?.trim() || "Book an appointment" : booking.label,
          external: true,
        }
      : contact;
  // When booking is the CTA, Contact goes back into the list as a plain link.
  const contactItem: NavItem[] = cta === contact ? [] : [contact];

  if (THEME === "lab") {
    const model = briefNav(diensten, lang, contact, settings);
    return { ...model, phone };
  }

  if (brand === "mpc") {
    if (lang === "en") {
      return {
        items: [
          {
            href: "/en/performance#training",
            label: w("training"),
            children: [
              { href: "/en/performance#training", label: w("alleTraining") },
              ...dienstLinks(diensten, "mpc-training", "en"),
            ],
          },
          {
            href: "/en/performance#sportrevalidatie",
            label: w("sportrevalidatie"),
            children: [
              { href: "/en/performance#sportrevalidatie", label: w("alleSportrevalidatie") },
              ...dienstLinks(diensten, "mpc-rehab", "en"),
            ],
          },
          {
            href: "/en/groepslessen",
            label: w("groepslessen"),
            children: [
              { href: "/en/groepslessen", label: w("lesroosterAlle") },
              ...dienstLinks(diensten, "mpc-groep", "en"),
            ],
          },
          { href: "/en/performance/prijzen", label: w("prijzen") },
          { href: "/en/team", label: w("team") },
          {
            href: "/en/performance/visie",
            label: w("overMpc"),
            children: [
              { href: "/en/performance/visie", label: w("visie") },
              { href: "/en/performance#faq", label: w("faq") },
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
          href: "/performance#training",
          label: w("training"),
          children: [
            { href: "/performance#training", label: w("alleTraining") },
            ...dienstLinks(diensten, "mpc-training", "nl"),
          ],
        },
        {
          href: "/performance#sportrevalidatie",
          label: w("sportrevalidatie"),
          children: [
            { href: "/performance#sportrevalidatie", label: w("alleSportrevalidatie") },
            ...dienstLinks(diensten, "mpc-rehab", "nl"),
          ],
        },
        {
          href: "/groepslessen",
          label: w("groepslessen"),
          children: [
            { href: "/groepslessen", label: w("lesroosterAlle") },
            ...dienstLinks(diensten, "mpc-groep", "nl"),
          ],
        },
        { href: "/performance/prijzen", label: w("prijzen") },
        { href: "/team", label: w("team") },
        {
          href: "/performance/visie",
          label: w("overMpc"),
          children: [
            { href: "/performance/visie", label: w("visie") },
            { href: "/performance#faq", label: w("veelgesteldeVragen") },
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
          label: w("kinesitherapie"),
          children: [
            { href: "/en/kinesitherapie", label: w("alleBehandelingen") },
            ...dienstLinks(diensten, "kine", "en"),
          ],
        },
        {
          href: "/en/training",
          label: w("training"),
          children: [{ href: "/en/training", label: w("alleTrainingen") }, ...dienstLinks(diensten, "training", "en")],
        },
        { href: "/en/team", label: w("team") },
        { href: "/en/prijzen", label: w("prijzen") },
        {
          href: "/en/over-ons/ons-verhaal",
          label: w("overOns"),
          children: [
            { href: "/en/over-ons/ons-verhaal", label: w("onsVerhaal") },
            { href: "/en/over-ons/onze-visie", label: w("onzeVisie") },
            { href: "/en/faq", label: w("faq") },
            { href: "/en/blog", label: w("blog") },
            { href: "/en/jobs", label: w("vacatures") },
            ...sportaanbodLinks(sportaanbod, "en"),
          ],
        },
        { href: "/en/performance", label: "MPC", emphasize: true },
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
        label: w("kinesitherapie"),
        children: [
          { href: "/kinesitherapie", label: w("alleBehandelingen") },
          ...dienstLinks(diensten, "kine", "nl"),
        ],
      },
      {
        href: "/training",
        label: w("training"),
        children: [{ href: "/training", label: w("alleTrainingen") }, ...dienstLinks(diensten, "training", "nl")],
      },
      { href: "/team", label: w("team") },
      { href: "/prijzen", label: w("prijzen") },
      {
        href: "/over-ons/ons-verhaal",
        label: w("overOns"),
        children: [
          { href: "/over-ons/ons-verhaal", label: w("onsVerhaal") },
          { href: "/over-ons/onze-visie", label: w("onzeVisie") },
          { href: "/faq", label: w("veelgesteldeVragen") },
          { href: "/blog", label: w("blog") },
          { href: "/jobs", label: w("vacatures") },
          ...sportaanbodLinks(sportaanbod, "nl"),
        ],
      },
      { href: "/performance", label: "MPC", emphasize: true },
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
  // Section anchors (/performance#training) are never "the current page": on /performance
  // every anchor would light up, and /performance/* pages would match them by prefix.
  if (href.includes("#")) return false;
  const target = normalizePath(href);
  const current = normalizePath(path);
  if (target === "/" || target === "/en") return target === current;
  return current === target || current.startsWith(target + "/");
}

/** Active if the item itself or one of its children matches the current page. */
export function isActiveItem(item: NavItem, path: string): boolean {
  if (isCurrentPath(item.href, path)) return true;
  if ((item.children || []).some((child) => child.href && isCurrentPath(child.href, path))) return true;
  return (item.groups || []).some(
    (group) =>
      isCurrentPath(group.href, path) ||
      group.children.some((child) => child.href && isCurrentPath(child.href, path)),
  );
}
