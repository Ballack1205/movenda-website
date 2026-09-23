# Decisions — Movenda website rebuild

Answers to `HANDOFF.md` §8, confirmed by the founder on 2026-09-10. This file is the source of truth once a question is answered; `HANDOFF.md` stays as the original audit.

**Context: this is currently a pitch.** Movenda is still comparing agencies/options. Everything below is being built first as a preview on a neutral Render URL (`noindex`, not linked from `movenda.be`). DNS cutover and the 301 map only happen after Movenda chooses us.

| # | Question | Decision |
|---|---|---|
| 1 | One site or two domains? | **One site** on `movenda.be`. MPC becomes a section (`/mpc`) with its own dark sub-brand, not a separate domain. `mpc.movenda.be` will 301 to `/mpc/*` after go-live. |
| 2 | Language | **Dutch default** at `/`, **English** at `/en/` with `hreflang`. Every public NL page has an English counterpart (same path under `/en/`). Missing English CMS fields still fall back to Dutch rather than 404. |
| 3 | CMS editor | **Sanity**, confirmed by founder. Hosted Studio, Dutch UI. Fallback if Julie rejects it after the demo: one cleaned-up Squarespace site. |
| 4 | Booking | **Phone + contact form** for now (`info@movenda.be`). A booking button is *built and wired but shipped OFF by default* (`siteSettings.booking.enabled = false`). Movenda turns it on later once they pick a scheduler (Progenda / Doctena / Introlution / other). |
| 5 | `/join` jobs page | **Keep**, rebuilt as `/jobs`. |
| 6 | Blog | **Keep and grow.** Migrate the 5 existing posts; Julie writes new ones in Sanity, not git. |
| 7 | Corporate coaching / Olympia sportaanbod | **Keep**, both in scope. |
| 8 | Brand | **One site, MPC as a dark "performance" sub-brand** — same component system, different color tokens/theme for `/mpc/*`. *(Update 2026-09-10: inspected the real movenda.be/mpc.movenda.be — there is no separate dark/orange MPC scheme on the live sites; MPC uses the exact same navy/blue palette as Movenda. Reverted `/mpc/*` to the shared palette to match the real house style; see `web/src/styles/global.css`.)* |
| 9 | Budget / timeline / design | No external design; we design in code from the current logo/colors. Timeline: pitch preview first (Fase 1), full build after they choose us. |

## Sanity API quota (2026-09-15)

The site is static: visitors never hit Sanity. The Free 250k **live API** quota was burned by `useCdn: false` plus uncached `getSiteSettings()` (3 calls) on every page during `astro dev` and every Render build. The web client now uses the API CDN (`useCdn: true`) and memoizes each query once per process. Seed/migrate scripts stay on the live API. Local `astro dev` shows CMS edits after a restart (or ~60 s CDN delay).

## Hosting

- **Render Static Site** (Hobby/free) for the pitch preview and, if chosen, production. DNS for `movenda.be` already lives on Cloudflare nameservers — moving hosting later to Cloudflare Pages is a small change (~30 min) if ever needed, but not required: Render supports custom domains + free TLS directly.
- Preview URL: `https://movenda-preview.onrender.com` (or Render-assigned name), served with `X-Robots-Tag: noindex, nofollow` until Movenda confirms and we go live on `movenda.be`.

### Three hosts, one repo (2026-09-21)

| Host | Theme | Index | Role |
|---|---|---|---|
| `movenda-preview.onrender.com` | `PUBLIC_THEME=current` | noindex | QR in the offer PDF. Do not close. Do not point at lab. |
| `movenda-mpc.onrender.com` → later `mpc.movenda.be` | `current`, then `lab` after OK | **noindex until Friday 25 Sep 2026 + explicit OK** | MPC only. `PUBLIC_HOST_MODE=mpc`. Movenda links → `https://www.movenda.be`. Dashboard: https://dashboard.render.com/static/srv-daof86rtqb8s73f3s1j0 |
| `movenda-lab.onrender.com` | `PUBLIC_THEME=lab` | noindex | Frozen LAB/Brick look. Git branch `archive/lab-look`, not `main`. Dashboard: https://dashboard.render.com/static/srv-daof86ugekts73c27peg |

Switches live in `web/src/lib/site.ts`: `PUBLIC_THEME`, `PUBLIC_HOST_MODE`, `PUBLIC_NOINDEX`, `PUBLIC_SITE_URL`, `PUBLIC_MOVENDA_URL`.

### LAB look frozen; Movenda spec is a separate host (2026-09-23)

Movenda sent a written spec for the new site. That spec is not the LAB/Brick exploration. One repo, no second copy of `web/`, no DNS change on `movenda.be`.

| What | Where | Rule |
|---|---|---|
| Navy site (QR in the offer) | `main` → `movenda-preview.onrender.com`, `PUBLIC_THEME=current` | Do not restyle. |
| LAB look we built | Branch `archive/lab-look`. Local: `git switch archive/lab-look`, then `npm run dev:lab --workspace web`. URL: `https://movenda-lab.onrender.com` (Render service tracks that branch, `PUBLIC_THEME=lab`, noindex) | Frozen backup. Do not build the spec on this branch. |
| Movenda's spec | Not started. When the doc is in the repo: new branch from `main`, new theme value, new static site `movenda-brief` at `https://movenda-brief.onrender.com`. Same Sanity. | Do not create that service before the doc is here. Do not attach a `movenda.be` subdomain. |

`movenda-mpc` stays `PUBLIC_THEME=current` on `main`. Do not point it at `archive/lab-look`.

**DNS (Cloudflare, mpc only):** CNAME `mpc` → `<movenda-mpc>.onrender.com`. Leave `movenda.be` / `www` on Squarespace. After the CNAME exists, set `PUBLIC_SITE_URL=https://mpc.movenda.be` on the MPC service and attach the custom domain in Render (TLS).

**Index flip (not before Friday 25 Sep 2026):** `PUBLIC_NOINDEX=false` on `movenda-mpc` and remove `X-Robots-Tag`. Only after Jonas confirms that day. No automatic flip.

**Theme switch:** superseded 2026-09-23. Do not set `PUBLIC_THEME=lab` on `movenda-mpc`. The LAB look stays on `movenda-lab` / `archive/lab-look`. The next look follows Movenda's written spec, on its own branch and host. QR preview stays `current`.

**Later cutover of www.movenda.be:** `PUBLIC_HOST_MODE=full`, `PUBLIC_SITE_URL=https://www.movenda.be` (or `https://movenda.be`), attach apex + www to the same service, `PUBLIC_NOINDEX=false`. Then 301 `mpc.movenda.be/*` → `https://www.movenda.be/mpc/*`. Squarespace can be cancelled after a watch period. Do **not** move `movenda.be` DNS until that meeting.

### Restyle meeting (blok 2)

Blok 1 covers “MPC back online on the look behind the QR”. A full LAB/Brick restyle for both brands is more than the 10 hours in blok 2. Agenda: moodboard (LAB Antwerp + The Brick), which pages must match first, what fits in 10 hours, what is extra at €50/h. Do not promise the whole restyle inside blok 2.

## SEO / structured data / AI (2026-09-10)

- **Switches:** `PUBLIC_SITE_URL` + `PUBLIC_NOINDEX` drive canonical, hreflang, OG, the JSON-LD `@id`s, `robots.txt` (generated by `src/pages/robots.txt.ts`, no static file), `llms.txt` and the sitemap. `PUBLIC_THEME` (`current` \| `lab`) and `PUBLIC_HOST_MODE` (`full` \| `mpc`) are the layout/host switches. `src/lib/site.ts` is the only place that reads them.
- **Go-live checklist (full movenda.be, later):** set `PUBLIC_SITE_URL=https://movenda.be`, `PUBLIC_HOST_MODE=full`, `PUBLIC_NOINDEX=false`, remove the `X-Robots-Tag` header from `render.yaml`, redeploy. Theme flip is a separate `PUBLIC_THEME=lab` if they have approved the look.
- **URLs have no trailing slash** (`trailingSlash: "never"`); sitemap, canonical and JSON-LD agree.
- **JSON-LD:** one `@graph` per page (built in `Layout.astro`): `Organization` (+`sameAs` from siteSettings socials and per-location Instagram/Facebook/Google Business Profile), `WebSite`, both locations (`MedicalBusiness`/`Physiotherapy` and `SportsActivityLocation`, structured address, `openingHoursSpecification` with English `dayOfWeek`), plus per page `Person` (photo, `knowsAbout`), `Service` (`provider` → location `@id`, `offers` from the linked or name-matched prijsitem, `performer` → team), `BlogPosting`, `FAQPage`, `BreadcrumbList`, `ItemList` on `/team`. Still no `AggregateRating` (see Google Business Profile / reviews).
- **Julie's inputs:** Locatie → "Google Bedrijfsprofiel-URL" (both locations, strongest `sameAs`); Dienst → "Prijs (prijsitem)" reference and EN SEO title/description for MPC services. All optional; sensible fallbacks apply.
- **AI crawlers:** answer engines (OAI-SearchBot, PerplexityBot, ClaudeBot, …) are explicitly allowed once live. Training-only bots (GPTBot, Google-Extended, CCBot, …) are allowed by default; flip `BLOCK_AI_TRAINING` in `robots.txt.ts` if Movenda decides otherwise. `/llms.txt` (index) and `/llms-full.txt` (services, prices, hours, team, FAQ — regenerated from Sanity every build) are linked from robots.txt.
- `/welkom` (QR/placemat landing) is `noindex` and excluded from the sitemap.

## Google Business Profile / reviews

- Movenda has **30+ five-star Google reviews**. A visible badge (score, count, link to reviews, "write a review" link) is shown on the homepage, both location pages, and contact — sourced from `siteSettings.googleReviews` (per location), edited by Julie, not a paid reviews API.
- No `AggregateRating` JSON-LD is added for the site's own `LocalBusiness` markup (Google no longer shows self-reported aggregate ratings as a rich result for local businesses; the real signal lives on the Google Business Profile itself).
- **Update (2026-09-13):** the curated getuigenissen carousel is hand-picked photo quotes, not a substitute for real reviews, and the placeholder rows ("Naam volgt") were leaking through on the Dutch homepage — fixed in `getGetuigenissen()` to filter placeholders in every language, not just English. The founder also asked for the **real, live Google reviews** the old movenda.be showed. That was the **Elfsight "Google Reviews" widget** (`elfsight-app-4574da10-a0e4-4c28-9f62-93e57d02ef76`, same Elfsight plan already reused for the Instagram feed — no new SaaS). Re-added as `GoogleReviewsFeed.astro`, homepage only, directly below the getuigenissen carousel (`siteSettings.googleReviewsFeed`, Julie can hide it or swap the widget ID). This reverses the 2026-09-10 call above to skip it.

## Analytics

- Existing GA4 property `G-WCV2RJG010` is reused, gated behind a consent banner (Consent Mode v2). Elfsight is dropped.
- **Strict consent (2026-09-10):** `gtag.js` is only injected after the visitor clicks "Oké"; before that nothing is loaded and no cookie is set. Choice is stored in `localStorage["movenda-consent"]` and can be changed via the footer link "Cookievoorkeuren". Banner is a small bottom-left card, equal-weight Oké / Liever niet, no overlay, no scroll-lock.
- **Test mode:** `siteSettings.analytics.mode` (Studio radio: Test / Live). Currently **enabled + test**: banner and events run, nothing is sent to Google; events print as `[analytics:test]` in the browser console. Flip to Live at go-live.
- **Umami** (cookieless) is wired as an optional second tool (`analytics.umami`), off until Movenda creates a free umami.is account and pastes the Website ID. No consent needed for it.
- One tracking helper: `window.mvTrack(name, params)` → GA4 (if consented) + Umami. Events: `form_submit` (contact/newsletter/popup), `contact_click` (phone/email/route), `booking_click`, `map_load`.
- Google Maps embed on `/contact` is click-to-load, so the site is cookie-free by default.
- `/privacy` + `/en/privacy` (legal copy in code, entities/BTW pulled from Locatie records) linked from the footer. Draft — have Movenda's accountant/legal contact read it before go-live.

## Content takeover (2026-09-10)

All 45 content pages from `movenda.be` + `mpc.movenda.be` are now records in Sanity (diensten, partners, lesrooster, getuigenissen, per-therapist tariffs, keuzehulp tags) plus matching Astro routes. Julie edits records; we own layout.

Defaults confirmed with the founder in the takeover plan:

- Newsletter: block on the homepage; signups go through the existing Render contact API to a Resend audience (`RESEND_AUDIENCE_ID`). No Brevo (would be new SaaS).
- Keuzehulp: 3-step filter on `/team#keuzehulp` using CMS tags (same routing data as the old Verwijskompas SVG).
- ~~Elfsight Google Reviews widget is not rebuilt; reviews stay a Google badge + getuigenissen.~~ Reversed 2026-09-13 — see "Google Business Profile / reviews" above.
- Instagram feed on `/` (above the newsletter): same Elfsight widget as the old Squarespace home (`7108de0f-f7f4-4dfd-990f-443ab8e68566`, account `@sportpraktijk_movenda`). Julie can hide it or change the widget ID in Site-instellingen. Existing Elfsight plan, not new SaaS. Lazy-loaded when the block is in view.
- Partner logos may be reused (already public on movenda.be).
- SkiFit / Running: only the existing `/sgt` blurb + rooster + prijs — no invented copy.
- Price conflicts flagged on the prijsitem `notitie` for Julie (Duo €70 vs €105; PowerPlus 9:30–10:30 vs rooster 9:30–11:30; MPC PT €74 vs Olympia €70).

### Partnerbalk (2026-09-10)

The partner logos are a **moving band** (marquee): one row that scrolls continuously on `/`, `/over` and `/mpc`. It pauses when a visitor hovers or tabs into it, and falls back to a static wrapping row for `prefers-reduced-motion` or when Julie switches the animation off. Pure CSS, no JavaScript, so it costs nothing in Lighthouse.

Julie owns the whole thing from the Studio:

- **Partners & logo's** — one document per partner (logo, website, type, Movenda/MPC/both, order, show-in-band toggle). This list was previously invisible in the Studio; it is now a top-level item.
- **Site-instellingen → Partnerbalk** — the heading above the band (Movenda and MPC separately), the speed (rustig / normaal / snel) and an on/off switch for the movement itself.

A partner without a logo shows as a styled name instead of an empty gap, so the band never breaks while logos are still missing.

### Old URL → new route (301)

Listed in `render.yaml`. `/over` is a real page (do **not** redirect it to `/`). `/join` stays `/jobs` (decision #5). Host-level `mpc.movenda.be` → `/mpc/*` waits for the Fase 4 DNS cutover.

| Old | New |
|---|---|
| `/kine` | `/kinesitherapie` |
| `/manuele` | `/kinesitherapie/manuele-therapie` |
| `/oefentherapie` | `/kinesitherapie/oefentherapie` |
| `/pre-en-post-natale` | `/kinesitherapie/pre-en-postnatale-kinesitherapie` |
| `/lymfedrainage` | `/kinesitherapie/lymfedrainage` |
| `/dryneedling` | `/kinesitherapie/dry-needling` |
| `/acupunctuur` | `/kinesitherapie/acupunctuur` |
| `/auriculotherapie` | `/kinesitherapie/auriculotherapie` |
| `/cardiovasculaire` | `/kinesitherapie/cardiovasculaire-revalidatie` |
| `/cupping` | `/kinesitherapie/cupping` |
| `/taping` | `/kinesitherapie/taping` |
| `/olympia` | `/training` |
| `/personal-training` | `/training/personal-training` |
| `/duo-training` | `/training/duotraining` |
| `/sportspecifieke-screening` | `/training/sportspecifieke-screening` |
| `/sportspecifieke-training` | `/training/sportspecifieke-training` |
| `/inspanningstesten` | `/training/inspanningstesten` |
| `/pre-en-post-natale-training` | `/training/pre-en-postnatale-training` |
| `/prijskine`, `/prijspt`, `/prices` | `/prijzen` |
| `/faqs`, `/veelgestelde-vragen` | `/faq` |
| `/contactqr` | `/welkom` |
| `/appointments-2-2-2` | `/team` |
| `/join` | `/jobs` |
| `/vison` | `/mpc/visie` |
| `/sgt` | `/mpc/groepslessen` |
| `/boxing1`, `/boxing2` | `/mpc/boxing` |
| `/performance` | `/mpc/performance-training` |
| `/sportrehab` | `/mpc/sportrevalidatie` |
| `/data-analysis` | `/mpc/data-analyse` |
| `/hiit` | `/mpc/hiit` |
| `/full-body` | `/mpc/full-body` |
| `/corporatecoaching` | `/mpc/corporate-coaching` |
| `/powerplus` | `/mpc/powerplus` |
| `/skifit` | `/mpc/skifit` |
| `/running` | `/mpc/running` |
| `/dry-needling` | `/mpc/dry-needling` |
| `/duotraining` | `/mpc/duotraining` |

## Julie's feedback round (2026-09-15)

Processed after the first meeting with Julie; all live in the Studio and on the preview.

- **Every photo is CMS-editable.** New optional fields, each falling back to the bundled marketing photo when empty: Pagina's → *Tweede foto* (kine/training/mpc overview), *Foto achter de slogan-banner* (home), Site-instellingen → Homepage → drie pijlers → *Foto*, Site-instellingen → *Standaard deelafbeelding* (og:image). The MPC teaser card on the homepage reuses the MPC page hero photo. Shared object type `cmsFoto` (image + alt); rendered by `web/src/components/CmsFoto.astro`.
- **MPC hero video.** Pagina's → MPC → *Video bovenaan*: a muted looping mp4/webm on top of the hero photo (`HeroVideo.astro`). The photo stays the LCP element and poster; `prefers-reduced-motion` or a refused autoplay simply shows the photo. Julie's phone clip (portrait, 12 s) was re-encoded to 540×960, no audio, 1.5 MB and uploaded. A landscape clip would suit the desktop box better — asked.
- **Blog ↔ dienst links for SEO.** Blogpost → *Gaat over deze behandelingen* (1–3 dienst references). Article shows "Meer over deze behandeling" buttons; dienst pages show "Lees ook" (linked posts first, then posts that mention the dienst name); `BlogPosting.about` → the `Service` `@id`. Tag pages `/blog/tag/[tag]` (+ `/en/`) exist for every tag with at least one post; tag pills on articles link to them.
- **Contact form.** "Hoe ben je bij ons terechtgekomen?" moved directly under phone/location and made required. Options and their follow-up type (naam / club / event / vrije tekst / geen) are editable in Pagina's → Contact → Blokken; seeded with the exact list of the old Squarespace form. Field names unchanged, so `api/server.js` was not touched.
- **Menu control.** Dienst → *Tonen in het menu* and *Korte naam voor het menu* (NL/EN). Adding a dienst already put it in its category dropdown automatically; the groups themselves stay code (AGENTS.md rule 6).
- **Duplicate.** For record types (blogPost, dienst, faq, vacature, popup, getuigenis, prijsitem, lesrooster, teamlid, partner) the built-in duplicate action sits directly under Publiceren as "Dupliceren als nieuw concept" and also in the pane ⋮ menu. Singletons keep it hidden.
- **Search Console.** Site-instellingen → Analytics → *Google Search Console — verificatiecode* renders `<meta name="google-site-verification">`; only needed if DNS verification is not used.
- Costs, keyword→page map and the post-meeting action list: `PITCH.md` §9–11.

## Not yet decided / to confirm with Julie

- Exact scheduler tool for the booking button, once Movenda picks a CMS/dev partner.
- Final go/no-go on Sanity after the Fase 1 "add a teammate" demo.
- Price conflicts marked on MPC/Olympia `prijsitem.notitie` (Duo, PowerPlus hours, PT locatieverschil).
- Exact Google Business Profile URLs (`place_id`) for the review badges.
- Ten partners show as a styled name instead of a logo and need the real file uploaded on their document: AF Corse, Hubo Limburg United, Excelsior Tennis, MyMindWorks, STVV, Tennisclub Tenkie, VKM Godsheide, UHasselt, Drieskens & Dubois, Royal Crown.

### Own logos never go in the partner band (2026-09-10)

The band is for third parties only. `AF Corse` was carrying **Movenda's own M mark** (the navy version of `web/public/brand/logo-m.png`, stored under the misleading filename `partner-af-corse.png`). Removed from the document and deleted from the media library so it cannot be picked again; AF Corse now shows as text until their real logo arrives.

`Hubo Limburg United` (basketball) was showing the *Hubo Handbal* shield from the same shared asset, so its logo was removed too — it shows as text until the right file arrives. The asset itself is now titled "Hubo Handbal (schild)" in the media library so it cannot be mistaken for the basketball club again.

Root cause was `studio/scripts/upload-dienst-media.mjs`: it matched a logo by the **first word** of the partner name, so "AF Corse" searched for `af` and matched Movenda's own file, and "Hubo Limburg United" matched on `hubo` and took the Handbal shield. The matcher now compares against the filename only, ignores words under 4 characters, requires two matching words when the name has them, skips anything that looks like a Movenda/MPC mark, and never overwrites a logo that is already set.
