import type { APIRoute } from "astro";
import {
  dienstHref,
  dienstKorteTitel,
  findPrijsVoorDienst,
  formatPrijs,
  getBlogPosts,
  getDiensten,
  getFaqs,
  getLocaties,
  getPrijzen,
  getSiteSettings,
  getTeamleden,
  isMpcCategorie,
  type Dienst,
  type Prijsitem,
} from "../lib/content";
import { NOINDEX, SITE_URL } from "../lib/site";

// Plain-text "everything" file for AI assistants (llms.txt convention).
// Generated from Sanity at build time, so prices / hours / team never drift
// from what Julie maintains. Dutch is the source of truth; headings are
// English so non-Dutch agents can navigate.

function section(title: string, body: string): string {
  return `## ${title}\n\n${body.trim()}\n`;
}

function dienstBlock(dienst: Dienst, prijzen: Prijsitem[]): string {
  const prijs = findPrijsVoorDienst(dienst, prijzen);
  const lines = [`### ${dienstKorteTitel(dienst)}`, `URL: ${SITE_URL}${dienstHref(dienst)}`];
  if (dienst.titelEn) lines.push(`English name: ${dienst.titelEn.replace(/ Hasselt$/, "")}`);
  if (prijs) lines.push(`Price: ${formatPrijs(prijs)}${prijs.notitie ? ` (${prijs.notitie})` : ""}`);
  lines.push("", (dienst.intro || dienst.seoDescription || "").trim());
  if (dienst.body) lines.push("", dienst.body.trim());
  return lines.join("\n");
}

export const GET: APIRoute = async () => {
  const [settings, locaties, team, diensten, prijzen, faqs, posts] = await Promise.all([
    getSiteSettings(),
    getLocaties(),
    getTeamleden(),
    getDiensten(),
    getPrijzen(),
    getFaqs(),
    getBlogPosts(),
  ]);

  const olympiaDiensten = diensten.filter((d) => !isMpcCategorie(d.categorie));
  const mpcDiensten = diensten.filter((d) => isMpcCategorie(d.categorie));

  const locatieText = locaties
    .map((l) => {
      const uren = l.uren.map((u) => `  ${u.dag}: ${u.van}–${u.tot}`).join("\n");
      return [
        `### ${l.naam}`,
        `${l.type}`,
        `Address: ${l.adres}, Belgium`,
        `Phone: ${l.telefoon}`,
        `Email: ${l.email}`,
        `Page: ${SITE_URL}/locaties/${l.slug}`,
        l.googleBusinessUrl ? `Google Business Profile: ${l.googleBusinessUrl}` : undefined,
        `VAT: ${l.btw}`,
        "Opening hours (by appointment only):",
        uren,
        l.urenNote ? `Note: ${l.urenNote}` : undefined,
        l.routebeschrijving ? `Directions: ${l.routebeschrijving}` : undefined,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");

  const prijsText = (["kine", "training", "screening", "mpc"] as const)
    .map((cat) => {
      const items = prijzen.filter((p) => p.categorie === cat);
      if (!items.length) return undefined;
      const label = { kine: "Physiotherapy (Movenda Olympia)", training: "Training (Movenda Olympia)", screening: "Screening & testing", mpc: "Movenda Performance Centre (excl. VAT)" }[cat];
      return `### ${label}\n${items.map((p) => `- ${p.naam}: ${formatPrijs(p)}${p.notitie ? ` — ${p.notitie}` : ""}`).join("\n")}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const info = settings.prijzenInfo;
  const terugbetaling = [
    info.basishonorarium ? `Base fee physiotherapy: €${info.basishonorarium}.` : undefined,
    info.terugbetalingStandaard ? `Reimbursement (standard insured): ${info.terugbetalingStandaard}` : undefined,
    info.terugbetalingVt ? `Reimbursement (increased allowance / VT): ${info.terugbetalingVt}` : undefined,
    info.voorwaarden ? `Conditions: ${info.voorwaarden}` : undefined,
    info.annulatiebeleid ? `Cancellation policy: ${info.annulatiebeleid}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");

  const teamText = team
    .map((lid) => {
      const where = lid.locaties.map((s) => (s === "mpc" ? "MPC" : "Olympia")).join(", ");
      return [
        `### ${lid.voornaam} ${lid.naam} — ${lid.rol}`,
        `URL: ${SITE_URL}/team/${lid.slug}`,
        where ? `Works at: ${where}` : undefined,
        lid.specialisaties.length ? `Specialisations: ${lid.specialisaties.join(", ")}` : undefined,
        lid.clubs.length ? `Clubs: ${lid.clubs.map((c) => c.naam).join(", ")}` : undefined,
        "",
        lid.bio.trim(),
      ]
        .filter((line) => line !== undefined)
        .join("\n");
    })
    .join("\n\n");

  const faqText = faqs.map((f) => `Q: ${f.vraag}\nA: ${f.antwoord}`).join("\n\n");

  const blogText = posts
    .map((p) => `- ${p.titel} (${p.publicatiedatum}) — ${SITE_URL}/blog/${p.slug}.md${p.excerpt ? `\n  ${p.excerpt}` : ""}`)
    .join("\n");

  const body = [
    `# ${settings.siteNaam} — full reference`,
    "",
    `> ${settings.tagline || "Kinesitherapie, personal training & performance in Hasselt"}`,
    `> Canonical site: ${SITE_URL}. Language: Dutch (nl-BE); English pages under /en.`,
    NOINDEX ? "> Pre-launch preview — the permanent domain is movenda.be." : undefined,
    `> Generated from the practice's CMS on ${new Date().toISOString().slice(0, 10)}.`,
    "",
    section("Locations", locatieText),
    section("Services — Movenda Olympia (physiotherapy & training, Hasselt)", olympiaDiensten.map((d) => dienstBlock(d, prijzen)).join("\n\n")),
    section("Services — Movenda Performance Centre (Kuringen)", mpcDiensten.map((d) => dienstBlock(d, prijzen)).join("\n\n")),
    section("Prices", `${prijsText}\n\n${terugbetaling}\n\nFull price pages: ${SITE_URL}/prijzen and ${SITE_URL}/mpc/prijzen`),
    section("Team", teamText),
    section("Frequently asked questions", faqText || "See /faq."),
    section("Blog (Markdown versions)", blogText || "No posts yet."),
    section(
      "Contact & booking",
      `Contact form: ${SITE_URL}/contact. General email: ${settings.email}.${
        settings.booking.enabled && settings.booking.url ? ` Online booking: ${settings.booking.url}` : " Appointments by phone or via the contact form."
      }`,
    ),
  ]
    .filter((line) => line !== undefined)
    .join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
