import type { BlogPost, Dienst, SiteEvent, Teamlid } from "./content";
import { dienstHref } from "./content";
import type { SearchItem } from "./search";

type Lang = "nl" | "en";

function clip(value: string | undefined, max = 180): string {
  return (value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function page(lang: Lang, path: string): string {
  return lang === "en" ? (path === "/" ? "/en" : `/en${path}`) : path;
}

function titleOf(dienst: Dienst, lang: Lang): string {
  const raw = lang === "en" ? dienst.menuLabelEn || dienst.titelEn || dienst.titel : dienst.menuLabel || dienst.titel;
  return raw.replace(/\s+(in\s+)?Hasselt$/i, "").trim();
}

export function buildSearchIndex(input: {
  lang: Lang;
  diensten: Dienst[];
  team: Teamlid[];
  posts: BlogPost[];
  events: SiteEvent[];
}): SearchItem[] {
  const { lang, diensten, team, posts, events } = input;
  const en = lang === "en";
  const items: SearchItem[] = [
    {
      title: en ? "Physiotherapy" : "Kinesitherapie",
      href: page(lang, "/kinesitherapie"),
      keys: "kine kine fysio physiotherapy kinesitherapie hasselt",
      text: "",
      kind: "page",
    },
    {
      title: "Performance Centre",
      href: page(lang, "/mpc"),
      keys: "mpc performance centre center kuringen lammerweg",
      text: "",
      kind: "page",
    },
    {
      title: en ? "Olympia Hasselt" : "Olympia",
      href: page(lang, "/locaties/olympia"),
      keys: "olympia hasselt kuringersteenweg locatie",
      text: "",
      kind: "page",
    },
    {
      title: en ? "Prices" : "Prijzen",
      href: page(lang, "/prijzen"),
      keys: en ? "prices fees tariff" : "prijzen tarieven terugbetaling",
      text: "",
      kind: "page",
    },
    {
      title: "Team",
      href: page(lang, "/team"),
      keys: en ? "team therapists specialists" : "team therapeuten specialisten",
      text: "",
      kind: "page",
    },
    {
      title: "Contact",
      href: page(lang, "/contact"),
      keys: en ? "contact appointment email phone" : "contact afspraak mail telefoon",
      text: "",
      kind: "page",
    },
    {
      title: "Events",
      href: page(lang, "/events"),
      keys: "events agenda",
      text: "",
      kind: "page",
    },
    {
      title: en ? "Insights" : "Insights/Blog",
      href: page(lang, "/blog"),
      keys: "blog insights artikels articles",
      text: "",
      kind: "page",
    },
    {
      title: en ? "Group classes" : "Groepslessen",
      href: page(lang, "/mpc/groepslessen"),
      keys: "gx groepslessen group classes rooster timetable",
      text: "",
      kind: "page",
    },
    {
      title: en ? "Physio membership" : "Kiné-abonnement",
      href: page(lang, "/kine-abonnement"),
      keys: "kine kine fitness abo abonnement olympia milon",
      text: en ? "40 euro per month fitness membership" : "40 euro per maand fitnessabonnement",
      kind: "page",
    },
  ];

  const seen = new Set<string>();
  const ordered = [...diensten].sort((a, b) => {
    const rank = (categorie: string) => (categorie === "mpc-training" || categorie === "mpc-groep" || categorie === "mpc-rehab" ? 0 : 1);
    return rank(a.categorie) - rank(b.categorie);
  });
  for (const dienst of ordered) {
    if (seen.has(dienst.slug)) continue;
    seen.add(dienst.slug);
    const title = titleOf(dienst, lang);
    items.push({
      title,
      href: dienstHref(dienst, lang),
      keys: `${dienst.slug.replace(/-/g, " ")} ${dienst.menuLabel || ""} ${dienst.menuLabelEn || ""}`,
      text: clip(`${en ? dienst.sloganEn || dienst.slogan || "" : dienst.slogan || ""} ${dienst.intro || ""}`),
      kind: "dienst",
    });
  }

  for (const lid of team) {
    if (lid.actief === false) continue;
    const specs = (lid.specialisaties || []).map((item) => (en ? item.naamEn || item.naam : item.naam)).join(" ");
    items.push({
      title: `${lid.voornaam} ${lid.naam}`,
      href: page(lang, `/team/${lid.slug}`),
      keys: specs,
      text: en ? lid.rolEn || lid.rol : lid.rol,
      kind: "team",
    });
  }

  for (const post of posts) {
    items.push({
      title: en ? post.titelEn || post.titel : post.titel,
      href: page(lang, `/blog/${post.slug}`),
      keys: (post.tags || []).join(" "),
      text: clip(en ? post.excerptEn || post.excerpt : post.excerpt),
      kind: "blog",
    });
  }

  for (const event of events) {
    items.push({
      title: en ? event.titelEn || event.titel : event.titel,
      href: page(lang, "/events"),
      keys: event.locatie || "",
      text: clip(en ? event.tekstEn || event.tekst : event.tekst),
      kind: "event",
    });
  }

  return items;
}
