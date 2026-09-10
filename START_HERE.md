# START HERE — Movenda website rebuild

You are **not** in the PROVA repo. This folder is a separate project for **Movenda’s public marketing websites**.

Read this file first. Then `STACK.md` (chosen direction), `HANDOFF.md` (audit), and `AGENTS.md` (rules).

**Contact at Movenda: Julie.** She edits the live site herself. The canonical task is *add a new teammate* (photo, name, role, location) without calling a developer. She already knows a bit of Squarespace — do not take that away unless the replacement editor is *simpler* than Squarespace for that job.

**Stack (recommended):** Astro (we code) + Sanity (Julie edits). See `STACK.md`. Confirm the editor with Julie before scaffolding.

## What Movenda asked

They have **two** public sites today and want **a new website**. This folder is the place to plan and later build that.

| Site | URL | Role |
|---|---|---|
| Movenda (kine + PT) | https://www.movenda.be/ | Groepspraktijk in Sportcentrum Olympia, Hasselt |
| MPC (Performance Centre) | https://www.mpc.movenda.be/ | Second location, Lammerweg 33, Kuringen |

It is **MPC**, not MCP.

## Current stack (both sites)

- **Squarespace 7.1** (Fluid Engine), two separate Squarespace sites
- DNS: Cloudflare nameservers → `ext-cust.squarespace.com`
- Domain `movenda.be` via Vimexx, registered 2015

This is a **marketing site** (team, services, prices, contact, blog). It is **not** the PROVA clinician app and must not be wired to patient data.

## Lighthouse mobile (2026-09-10)

| | movenda.be | mpc.movenda.be |
|---|---|---|
| SEO (technical checklist) | 100 | 92 |
| Accessibility | 93 | 98 |
| Best practices | 100 | 100 |
| Performance | 56 | 51 |

SEO 100 ≠ they rank well. Performance is the real score problem (4–7 MB homepages). See `HANDOFF.md`.

## Your first job

1. Show Julie (or the founder) `STACK.md` — especially the “add a teammate” flow. Get a yes on Astro + Sanity, or an explicit override (stay Squarespace / Webflow).
2. Remaining open questions are in `HANDOFF.md` §8 (one site, language, booking, blog). Julie-edits + leave-Squarespace-if-better are **already decided**.
3. Next: IA + 301 map + Sanity content model (Team first).
4. Scaffold **in this folder**, not in `Documents/Prova`.
