# Handoff — Movenda public websites

**Date of audit:** 2026-09-10  
**Source chat:** PROVA Cursor session (unrelated to the clinical app). Founder asked what the two sites are made of and how they score on SEO, then asked for this handoff so a **new Cursor project** can continue.

**This folder:** `/Users/ballackopenclaw/Documents/Movenda-website`  
**Not this folder:** `/Users/ballackopenclaw/Documents/Prova`

---

## 1. Ask

Movenda wants a **new website**. They currently run two:

1. https://www.movenda.be/ — kinesitherapie + personal training (Olympia, Hasselt)
2. https://www.mpc.movenda.be/ — Movenda Performance Centre (Lammerweg, Kuringen)

The founder said “mcp.movenda”; the live hostname is **`mpc.movenda.be`** (MPC = Movenda Performance Centre).

**Contact:** **Julie** (Movenda). She has learned some Squarespace and must stay able to edit the site herself — at minimum **add a new teammate** (photo, name, role, which location) without a developer.

**Stack:** freedom was given to fully code or choose another framework. Recommendation is locked in `STACK.md`: **Astro + Sanity**. Confirm the editor with Julie before `npm create`. IA / one-site / language still need answers (§8).

---

## 2. What they are (two practices)

### Movenda — Olympia

- Groepspraktijk kinesitherapie + personal training
- Sportcentrum Olympia, **Kuringersteenweg 242, 3500 Hasselt**
- Tel **+32 483 65 44 89** · info@movenda.be
- Hours: Ma–Do 08:00–21:00, Vr 08:00–19:00, Za 08:30–13:00
- Team copy on the site: ~11–13 kinesisten, 5 personal trainers (numbers differ by page — reconcile)
- BTW **BE 0643.626.573** · IBAN BE77 7370 4468 7842
- Services: manuele therapie, oefentherapie, dry needling, acupunctuur, auriculotherapie, cupping, taping, pre/postnataal, lymfedrainage, cardiovasculair, inspanningstesten, PT / duo / sportspecifiek

### MPC — Performance Centre

- Performance training + sportrevalidatie, data-driven
- **Lammerweg 33, 3511 Kuringen**
- Tel **+32 480 68 94 36** · same info@movenda.be
- Hours: Monday–Sunday 07:00–22:00, appointment only
- BTW **BE 0803.487.226** · IBAN BE43 7330 7357 1601
- Services: performance, sportrehab, small group (max 8), PT, boxing, HIIT, full body, PowerPlus, running, SkiFit, corporate coaching, dry needling, cupping, taping, data analysis

Nav already cross-links: movenda.be has **MPC**; mpc.movenda.be has **Movenda**.

---

## 3. What they are made of

Both are **Squarespace 7.1 / Fluid Engine**, **two separate Squarespace sites** (two site IDs), not one site with a subdomain.

| | movenda.be | mpc.movenda.be |
|---|---|---|
| Server header | `Squarespace` | `Squarespace` |
| Theme comment | `azalea-vanilla-rdt4` | `bell-glockenspiel-es4a` |
| Squarespace site id | `640da507a1be9229e8ad83af` | `64dc92456992cb6fb69f1ab9` |
| HTML `lang` | `nl-BE` | `en-US` |
| Fonts | Poppins + Esteban (Squarespace) | Poppins + **Adobe Typekit** |
| Analytics | GA4 **`G-WCV2RJG010`** + Google Tag Manager | none detected |
| Widgets | **Elfsight** | — |
| Forms | native Squarespace | native Squarespace |
| Cookie banner | not in HTML | not in HTML |
| DNS | Cloudflare NS (`laura` / `dan`) → CNAME `ext-cust.squarespace.com` | same Squarespace anycast IPs |
| Registrar | Vimexx (`.be` registered 2015-10-09) | subdomain of movenda.be |

Page weight on homepage (Lighthouse network):

- movenda.be: **~4.0 MB**, 72 requests, 926 DOM nodes, HTML ~346 KB
- mpc.movenda.be: **~7.3 MB**, 84 requests, 789 DOM nodes, HTML ~495 KB

Third parties (movenda): Squarespace, GTM, GA, sqspcdn, Elfsight, squarespace-cdn images.  
Third parties (MPC): Squarespace, Typekit, sqspcdn, huge image CDN payload.

---

## 4. Information architecture (live)

### movenda.be — sitemap 50 URLs

**Core pages (29):**  
`/home`, `/over`, `/join`, `/contact`, `/faqs`, `/training`, `/kine`, `/manuele`, `/dryneedling`, `/acupunctuur`, `/auriculotherapie`, `/pre-en-post-natale`, `/cardiovasculaire`, `/cupping`, `/taping`, `/prijskine`, `/oefentherapie`, `/personal-training`, `/duo-training`, `/sportspecifieke-screening`, `/sportspecifieke-training`, `/inspanningstesten`, `/pre-en-post-natale-training`, `/prijspt`, `/prijzen`, `/team`, `/contactqr`, `/lymfedrainage`, `/appointments-2-2-2`

**Blog (5 posts, last `2026-07-02`):** heat / desk neck / mental training / sportblessures / rugpijn  
Plus 15 tag/category URLs (thin).

Nav (homepage): Kinesitherapie, Training, Over, Team, FAQs, Contact, Prijzen, MPC, Blog + Olympia sportaanbod dropdown.

### mpc.movenda.be — sitemap 23 URLs, no blog

`/home`, `/performance`, **`/vison`** (typo), `/contact`, `/team`, `/faqs`, `/sportrehab`, `/personal-training`, `/duotraining`, `/boxing1`, `/dry-needling`, `/data-analysis`, `/cupping`, `/taping`, `/hiit`, `/full-body`, `/corporatecoaching`, `/boxing2`, `/sgt`, `/powerplus`, `/skifit`, `/running`, `/prices`

Nav: Home, Training, Rehabilitation, Small group training, Corporate coaching, Vision, Team, FAQs, Contact, Movenda, Prices.

---

## 5. Scores (re-runnable)

**Method:** Google PageSpeed Insights API was quota-blocked (`429`). Local **Lighthouse 12.6.0** via Chrome headless, **mobile** (what Google uses for ranking), 2026-09-10.

```bash
npx lighthouse@12.6.0 "https://www.movenda.be/" \
  --chrome-flags="--headless --no-sandbox --disable-gpu" \
  --only-categories=performance,accessibility,best-practices,seo \
  --form-factor=mobile --output=json --output-path=./audit-movenda.json
```

| Category | movenda.be | mpc.movenda.be |
|---|---|---|
| **SEO** | **100** | **92** |
| Accessibility | 93 | 98 |
| Best practices | 100 | 100 |
| **Performance** | **56** | **51** |

**Core Web Vitals (lab, mobile):**

| Metric | movenda.be | mpc.movenda.be |
|---|---|---|
| FCP | 6.7 s | 8.0 s |
| LCP | 15.6 s | 12.5 s |
| TBT | 180 ms | 290 ms |
| CLS | 0 | 0 |
| TTI | 15.9 s | 12.9 s |
| TTFB | 30 ms | 40 ms |

MPC SEO 92 is almost only generic **“Learn More”** links to `/performance`, `/Rehabilitation`, `/sgt`, `/personal-training`.

Lighthouse SEO 100 = title + meta + canonical + robots + HTTPS + alts exist. **It is not a ranking score.**

---

## 6. On-page SEO (actual ranking problems)

### movenda.be — stronger

- Dutch, keyworded titles (`Kinesist Hasselt`, `Kinesitherapie Hasselt`).
- Service landings + a small blog. Google already surfaces those pages.
- Homepage: title 55 chars (OK), **meta description 270 chars** (too long; Google ~155).
- `/kine` title 95 chars (too long), description **353** chars.
- `/over` title 109 chars.
- `/team` and `/prijzen`: **no H1**.
- JSON-LD: `WebSite` only — **no LocalBusiness / MedicalBusiness / address / geo / openingHours**.
- Images have alt. Skip link present.
- OG image is `http://` not `https://`. Twitter card = `summary` (not large).
- Sitemap includes `/home` **and** `/` (duplicate homepage). Ugly leftover slug: `/appointments-2-2-2`.
- Tag pages in sitemap add thin content.

### mpc.movenda.be — weaker

- Entire site **English** for a Flemish local practice. People search `sportrevalidatie Hasselt`, `personal training Kuringen`, not “sports rehabilitation Hasselt”.
- `LocalBusiness` JSON-LD is **empty** (`address: ""`, no name, no telephone).
- `/contact` title = `Contact`, **no meta description**.
- `/prices` title = `Prices`, **no meta description**, no H1.
- `/team` no H1.
- Slug typo **`/vison`**.
- `/home` + `/` duplicate.
- Copy issues: “protentional”, “Sportrehabilitation”, “recreative”, “data analyses”.
- Four “Learn More” CTAs.
- No blog, no Dutch landing pages.

### Shared / strategic

- Two sites **cannibalize** Hasselt + training / rehab keywords.
- No `hreflang` between them (and they are not language variants — they are locations).
- Two brands, two BTW numbers, one email.
- No cookie consent despite GA4 + Elfsight on movenda.be (GDPR risk; flag, don’t “fix live” unless asked).

---

## 7. Recommended product direction

The rebuild win is **not** a prettier Squarespace theme. It is:

1. **One website**, two locations, Dutch-first.
2. Clear IA: Home → Kine Olympia / MPC / Team / Prijzen / Contact / Blog.
3. Real local schema for **both** addresses (`MedicalBusiness` / `LocalBusiness` + `geo` + hours + telephone).
4. Unique titles/H1s per service page; kill tag URLs and `/home` duplicates.
5. Performance budget: homepage well under 2 MB, LCP < 2.5 s on mobile.
6. **Julie edits records, we own layout.** CMS collections for team, locations, FAQs, blog, prices — not hardcoded Vue/Astro arrays. See `STACK.md`.
7. Do **not** stay on Squarespace just because Julie knows it. A dedicated “Team → Nieuw” form is easier than Fluid Engine. Fallback: one cleaned-up Squarespace only if she rejects a CMS after a demo.

Do not couple this site to PROVA (no patient login, no assignment links in MVP of the marketing site) unless the founder explicitly wants a “patient fills questionnaire” CTA that deep-links to a public token flow.

---

## 8. Open questions

Already decided (2026-09-10, founder):

- **Julie** is the Movenda contact and the person who edits the site.
- She must add a teammate (and similar content) **herself**.
- We **may leave Squarespace** and fully code / pick a framework. Chosen direction: **Astro + Sanity** (`STACK.md`).

Still ask Julie / founder before building:

1. **One site or keep two domains?** (Recommended: one site, `movenda.be`, MPC as `/mpc` or a location hub. `mpc.movenda.be` → 301s.)
2. **Dutch only, or NL + EN?** (Recommended: Dutch default.)
3. **Confirm Sanity Studio** after a 5-minute “add a teammate” walkthrough. If she hates it → fallback one Squarespace or Webflow Editor.
4. **Booking:** phone + form only, or embed a scheduler (which one do they use today)?
5. **Jobs page `/join` — keep?**
6. **Blog — keep and grow, or drop?** (If keep: Julie writes posts in Sanity, not git.)
7. **Corporate coaching / Olympia sportaanbod** — still in scope?
8. **Brand:** one visual system or keep MPC as a darker “performance” sub-brand?
9. **Budget / timeline / who designs?**

---

## 9. Suggested next tasks (in this repo)

Do these in order. Stop after 1 until questions are answered.

1. **Julie confirms `STACK.md`** (Astro + Sanity vs fallback).
2. **Rest of §8** → `DECISIONS.md` when answered.
3. **Page inventory + 301 map** — every live URL → new URL or retire. Include `/vison`, `/appointments-2-2-2`, `/home`, tag URLs.
4. **IA + SEO spec** + Sanity content model (Team first, then locations, FAQs, blog).
5. **Build** — scaffold here, not in Prova. Studio must be usable by Julie on day one of preview.

---

## 10. How to re-audit

```bash
# headers + HTML
curl -sI https://www.movenda.be/
curl -sL https://www.movenda.be/robots.txt
curl -sL https://www.movenda.be/sitemap.xml
curl -sI https://www.mpc.movenda.be/
curl -sL https://www.mpc.movenda.be/robots.txt
curl -sL https://www.mpc.movenda.be/sitemap.xml

# Lighthouse (Chrome required)
npx lighthouse@12.6.0 "https://www.movenda.be/" --form-factor=mobile \
  --only-categories=performance,accessibility,best-practices,seo --output=html --output-path=./movenda.html
npx lighthouse@12.6.0 "https://www.mpc.movenda.be/" --form-factor=mobile \
  --only-categories=performance,accessibility,best-practices,seo --output=html --output-path=./mpc.html
```

PageSpeed web UI (if API quota is dead):  
https://pagespeed.web.dev/analysis?url=https://www.movenda.be/  
https://pagespeed.web.dev/analysis?url=https://www.mpc.movenda.be/

---

## 11. Key page titles (audit sample)

| URL | Title | Meta | H1 |
|---|---|---|---|
| movenda.be/ | Movenda Hasselt: kinesitherapie & personal training | 270 chars | Movenda |
| /kine | Kinesist Hasselt: … (95 chars) | 353 chars | Kinesitherapie Hasselt |
| /contact | Contact & Afspraak … \| Kinesitherapie Hasselt \| Movenda | 188 | Contacteer ons |
| /team | Ons team \| … Hasselt \| Movenda | 157 | **missing** |
| /prijzen | Tarieven en terugbetaling … | 157 | **missing** |
| /over | Over Movenda \| … (109 chars) | 142 | Movenda Hasselt |
| mpc.movenda.be/ | Performance training & sports rehabilitation in Hasselt \| Movenda | 197 | Performance training Hasselt |
| /contact | Contact | **empty** | Contact |
| /prices | Prices | **empty** | **missing** |
| /vison | The Movenda Performance Center Vision | 145 | Our Vision |
| /sportrehab | Sports injury rehabilitation Hasselt \| … | 124 | Sportrehabilitation |

---

## 12. Constraints for the next agent

- Do not open or change `/Users/ballackopenclaw/Documents/Prova` unless the user says so in that turn.
- Do not use PROVA admin / Supabase / Movenda patient rows “to get copy or team names.” Use the public sites.
- Do not buy domains, touch live DNS, or log into Squarespace unless asked.
- Do not add a second doc under a `docs/` tree without a reason — keep this handoff as the source of truth until decisions exist.
- Conventional commits if/when this repo gets real code.

---

## 13. Done looks like (later)

A single Dutch-first Movenda site that:

- ranks for local kine + PT + MPC queries without two competing domains
- has valid local schema for both addresses
- loads fast on a phone
- lets someone book or contact in one sitting
- 301s the old Squarespace URLs
- lets **Julie** add a teammate in the CMS and see it live without us
