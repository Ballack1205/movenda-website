# AGENTS.md — Movenda website (not PROVA)

Working agreement for any agent in this folder.

## This project vs PROVA

- **This repo:** public Movenda marketing website(s).
- **PROVA** (`/Users/ballackopenclaw/Documents/Prova`): clinical product. Same client, different codebase.
- Do **not** edit PROVA from here unless the founder explicitly asks in that turn.
- Do **not** browse, query, or mutate Movenda **patient** data in PROVA / Supabase. Public marketing pages only.

## People

- **Julie** — Movenda contact. She will maintain the site. Design the CMS so *she* can add/edit a teammate, hours, and similar copy without git, Cursor, or us.
- Founders (PROVA side) — stack, IA, deploy.
- Do not assume other therapists will log into the CMS.

## Product facts

- Two locations, two legal entities (two BTW numbers).
- Patients have no account on PROVA; this marketing site is how people find the practice and book/contact.
- Language of the practice is Dutch. MPC’s current site is English — treat that as a problem, not a requirement.
- Julie has learned some Squarespace. Freedom was given to **fully code or pick another framework**. Recommended pick: Astro + Sanity (`STACK.md`). She must still be able to edit without Squarespace.

## Hard rules

1. No patient PII, no PROVA impersonation, no “just check Movenda in the app.”
2. No new paid SaaS / npm / hosting spend without founder OK. Sanity free tier is enough to start; say so if a paid plan is needed.
3. Do not apply schema/migrations or touch `movenda.be` DNS/Squarespace unless asked.
4. Prefer editing existing files in **this** folder over creating extra docs.
5. **Julie can edit structured content.** Never hardcode the team list, prices, or hours in components. If a change is “add a person / change a price”, it belongs in the CMS.
6. Julie does **not** need a visual page builder. We own layout; she owns records (team, FAQ, blog, locations).
7. Stack is in `STACK.md`. Do not silently switch to Nuxt/Webflow/WordPress. Override only if Julie or the founder asks.

## Language

- Code + comments: English.
- Public site copy: Dutch unless the founder asks for bilingual.
- Founder-facing notes may be Dutch or English; match the user.
