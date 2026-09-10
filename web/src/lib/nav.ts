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
  dienstKorteTitel,
  getDiensten,
  getLocaties,
  getSiteSettings,
  getSportaanbod,
  type Dienst,
  type DienstCategorie,
  type Locatie,
  type SiteSettings,
  type SportaanbodItem,
} from "./content";

export type Brand = "movenda" | "mpc";
export type Lang = "nl" | "en";

export interface NavLink {
  href: string;
  label: string;
  external?: boolean;
}

export interface NavItem extends NavLink {
  /** Brand switch link (Movenda ↔ MPC): rendered bold. */
  emphasize?: boolean;
  /** Dropdown entries. The first entry should be the overview page. */
  children?: NavLink[];
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

// One fetch per build, not one per page: Header renders on every page and
// the Sanity client has no cache (useCdn: false).
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
  return diensten
    .filter((d) => cats.includes(d.categorie))
    .sort((a, b) => cats.indexOf(a.categorie) - cats.indexOf(b.categorie) || a.volgorde - b.volgorde)
    .map((d) => ({ href: dienstHref(d, lang), label: dienstKorteTitel(d, lang) }));
}

function sportaanbodLinks(items: SportaanbodItem[]): NavLink[] {
  return items
    .filter((item): item is SportaanbodItem & { link: string } => !!item.link)
    .map((item) => ({ href: item.link, label: item.naam, external: true }));
}

export async function getNavModel(brand: Brand, lang: Lang): Promise<NavModel> {
  const { diensten, locaties, settings, sportaanbod } = await loadNavData();
  const locatie = locaties.find((l) => l.slug === (brand === "mpc" ? "mpc" : "olympia"));
  const phone = locatie?.telefoon;

  const contact: NavLink =
    lang === "en" ? { href: "/en/contact", label: "Contact" } : { href: "/contact", label: "Contact" };

  const { booking } = settings;
  const cta: NavCta =
    booking.enabled && booking.url ? { href: booking.url, label: booking.label, external: true } : contact;
  // When booking is the CTA, Contact goes back into the list as a plain link.
  const contactItem: NavItem[] = cta === contact ? [] : [contact];

  if (brand === "mpc") {
    if (lang === "en") {
      return {
        items: [
          {
            href: "/en/mpc",
            label: "Services",
            children: [
              { href: "/en/mpc", label: "Movenda Performance Centre" },
              ...dienstLinks(diensten, ["mpc-training", "mpc-rehab", "mpc-groep"], "en"),
            ],
          },
          { href: "/en/team", label: "Team" },
          { href: "/en", label: "Movenda", emphasize: true },
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
        { href: "/", label: "Movenda", emphasize: true },
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
        { href: "/en/team", label: "Team" },
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
          ...sportaanbodLinks(sportaanbod),
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
  return (item.children || []).some((child) => isCurrentPath(child.href, path));
}
