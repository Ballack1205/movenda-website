# Stack choice — Movenda website

**Status:** recommended. Confirm with **Julie** (5-minute editor walkthrough) before scaffolding.  
**Date:** 2026-09-10

## Constraints that pick the stack

1. **Julie edits the site.** She has learned some Squarespace. The test: she can add a new teammate (photo, name, role, Olympia and/or MPC) and publish, without Slack / git / us.
2. **We may fully code or pick another framework.** Squarespace is not required. Leaving it is fine if her editor stays easy.
3. Current Squarespace is slow (Lighthouse mobile ~50–56) and split across two sites. A rebuild should fix that.
4. Brochure site, Dutch-first, two locations. Not PROVA. No patient data.
5. EU: keep personal data (names, photos) in the EU where the vendor allows it.

Hardcode-the-team in components = **rejected**. That fails Julie’s job.

---

## Decision

| Layer | Pick | Why |
|---|---|---|
| Site (we build) | **Astro** | Fast static HTML, excellent SEO, no Nuxt/PROVA baggage, cheap to host |
| CMS (Julie uses) | **Sanity** | Form-based: Team → Nieuw → fields → Publish. Easier than Squarespace layout for “add a person” |
| Hosting | **Render (Static Site)** | Already connected in Cursor; free Hobby tier is enough at this traffic; deploy hook rebuilds on Sanity publish; custom domain + free TLS when `movenda.be` is repointed. Cloudflare Pages remains a documented fallback (DNS is already on Cloudflare) if Render's free bandwidth (5 GB/mo) is ever outgrown. |
| Studio host | Sanity hosted studio (`*.sanity.studio`) | Julie bookmarks one URL, logs in with email |
| Forms (contact) | Astro + serverless (e.g. Resend) or Netlify/Cloudflare Forms | Decide when booking is known |
| Images | Sanity image pipeline + Astro | Crop once, serve right sizes (fixes 4–7 MB homepages) |

**Julie never opens the repo.** We never ask her to “just edit this Vue file.”

**We never ask Julie to design pages.** Nav, sections, styling stay in code. She edits **records**.

---

## Julie’s editor (this is the product)

Day-one Sanity collections:

| Collection | What Julie does |
|---|---|
| **Teamlid** | Add/edit/archive. Fields: photo, voornaam, naam, rol, locatie(s), specialisaties, korte bio, volgorde, actief ja/nee |
| **Locatie** | Address, tel, hours, BTW (rarely) |
| **FAQ** | Question / answer |
| **Blog** (if kept) | Title, body, image, publish date |
| **Prijzen** | Label + amount + note (kine vs PT vs MPC) |
| **Partners & logo's** | Add/edit a partner in the moving logo band: logo, website, Movenda/MPC/both, order, show/hide. Heading, speed and on/off live in Site-instellingen → Partnerbalk |
| **Pop-up** | Create/edit the overlay visitors see when they open the site (photo, copy, signup form or link). Toggle actief to show/hide — same job as Squarespace’s promotional pop-up |

Studio copy in **Dutch**. One “Teamlid” list, filterable by locatie. Unpublished = hidden on the site.

Publish → webhook → site rebuild (~1 min). Tell Julie that so she does not think it is broken.

---

## Why not the other options

| Option | Verdict | Reason |
|---|---|---|
| **Stay Squarespace** (one cleaned-up site) | Fallback only | Julie already knows it, but we keep the speed/SEO/two-site mess. Use only if she rejects Sanity after a demo. |
| **Webflow** | No | Same “visual CMS” class as Squarespace; she must relearn; monthly cost; we get less code control than Astro. |
| **Framer** | No | Design-tool CMS. Fine for a landing page, weak for 40 service URLs + 301s + schema. |
| **WordPress** | No | She can edit, we inherit plugins, updates, and spam. Not worth it for a clinic brochure. |
| **Nuxt 4** (like PROVA) | No | We already live in that stack. A marketing site does not need it; slower default than Astro. |
| **Astro + Markdown/git** | No | Julie would need git or a PR. Fails the teammate test. |
| **Next.js** | No | Heavier than Astro for this. |
| **Sanity + Next** | Overkill | Same CMS, worse fit for a static brochure. |

---

## Cost (order of magnitude)

- Astro + Cloudflare Pages: **€0** at this traffic.
- Sanity: **free tier** is enough for team + FAQ + a small blog. Paid only if they want history/roles later.
- Domain stays `movenda.be` (already theirs).
- Leave both Squarespace subscriptions after cutover.

New paid vendor = founder OK first (`AGENTS.md`).

---

## EU / GDPR note

Team photos and names are personal data. Prefer **Sanity EU dataset** (or confirm region before go-live). Movenda wants GA4, so there is a minimal consent banner (strict: nothing loads before "Oké"); Umami (cookieless) is available as an extra. See `DECISIONS.md` → Analytics.

---

## Confirm with Julie (script)

> We build the new site in code so it is fast and Google-friendly. You get a simple admin (not Squarespace): a list of teamleden. You click Nieuw, upload a photo, fill name and location, publish. About a minute later it is on the site. You do not drag blocks or touch layout. If that feels worse than Squarespace after we show you, we stay on Squarespace.

If she says yes → scaffold Astro + Sanity in this folder.  
If she says no → one Squarespace, Dutch, both locations, we still do IA/SEO/301s inside Squarespace.

---

## After confirm — first build slice

1. Astro app + Sanity schema for **Teamlid** + **Locatie** only.
2. `/team` page driven by CMS.
3. Give Julie a studio login on a preview URL.
4. Then IA, other pages, 301s.
