# Decisions — Movenda website rebuild

Answers to `HANDOFF.md` §8, confirmed by the founder on 2026-09-10. This file is the source of truth once a question is answered; `HANDOFF.md` stays as the original audit.

**Context: this is currently a pitch.** Movenda is still comparing agencies/options. Everything below is being built first as a preview on a neutral Render URL (`noindex`, not linked from `movenda.be`). DNS cutover and the 301 map only happen after Movenda chooses us.

| # | Question | Decision |
|---|---|---|
| 1 | One site or two domains? | **One site** on `movenda.be`. MPC becomes a section (`/mpc`) with its own dark sub-brand, not a separate domain. `mpc.movenda.be` will 301 to `/mpc/*` after go-live. |
| 2 | Language | **Dutch default** at `/`, **English** at `/en/` with `hreflang`. MPC content (currently English-only) gets translated to Dutch as the primary version. A Studio action ("Vertaal naar Engels") assists Julie in generating the `/en/` copy; missing English fields fall back to Dutch rather than 404. |
| 3 | CMS editor | **Sanity**, confirmed by founder. Hosted Studio, Dutch UI. Fallback if Julie rejects it after the demo: one cleaned-up Squarespace site. |
| 4 | Booking | **Phone + contact form** for now (`info@movenda.be`). A booking button is *built and wired but shipped OFF by default* (`siteSettings.booking.enabled = false`). Movenda turns it on later once they pick a scheduler (Progenda / Doctena / Introlution / other). |
| 5 | `/join` jobs page | **Keep**, rebuilt as `/jobs`. |
| 6 | Blog | **Keep and grow.** Migrate the 5 existing posts; Julie writes new ones in Sanity, not git. |
| 7 | Corporate coaching / Olympia sportaanbod | **Keep**, both in scope. |
| 8 | Brand | **One site, MPC as a dark "performance" sub-brand** — same component system, different color tokens/theme for `/mpc/*`. |
| 9 | Budget / timeline / design | No external design; we design in code from the current logo/colors. Timeline: pitch preview first (Fase 1), full build after they choose us. |

## Hosting

- **Render Static Site** (Hobby/free) for the pitch preview and, if chosen, production. DNS for `movenda.be` already lives on Cloudflare nameservers — moving hosting later to Cloudflare Pages is a small change (~30 min) if ever needed, but not required: Render supports custom domains + free TLS directly.
- Preview URL: `https://movenda-preview.onrender.com` (or Render-assigned name), served with `X-Robots-Tag: noindex, nofollow` until Movenda confirms and we go live on `movenda.be`.

## Google Business Profile / reviews

- Movenda has **30+ five-star Google reviews**. These are shown as a visible badge (score, count, link to reviews, "write a review" link) on the homepage, both location pages, and contact — sourced from `siteSettings.googleReviews` (per location), edited by Julie, not a paid reviews API.
- No `AggregateRating` JSON-LD is added for the site's own `LocalBusiness` markup (Google no longer shows self-reported aggregate ratings as a rich result for local businesses; the real signal lives on the Google Business Profile itself).

## Analytics

- Existing GA4 property `G-WCV2RJG010` is reused, gated behind a consent banner (Consent Mode v2). Elfsight is dropped.

## Not yet decided / to confirm with Julie

- Exact scheduler tool for the booking button, once Movenda picks a CMS/dev partner.
- Final go/no-go on Sanity after the Fase 1 "add a teammate" demo.
