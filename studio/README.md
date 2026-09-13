# Movenda Studio (Sanity)

**Live:** https://movenda.sanity.studio
**Organization:** Movenda (`o0yzdz4fi`) · **Project:** Movenda (`k73l2by8`) · **Dataset:** `production` (private)

This is Julie's editor. She never opens this folder or the code — she uses
the hosted Studio URL above and logs in with her email (or a Google/GitHub
account) once invited.

The Studio is Dutch. Daily work (settings, pop-ups, team) sits at the top;
the MPC lesrooster is a first-class list. Long forms (teamlid, locatie,
site-instellingen, blog, dienst, pop-up) use tabs. English fields are
collapsed. The document menu has **Open preview** (pitch site until go-live).
Site-instellingen, keuzehulp and the two locaties cannot be deleted.

Seeded on 2026-09-10 with the real pitch-preview content (19 teamleden, 2
locaties, 2 diensten, site-instellingen) via `scripts/seed.mjs`, so the
"add a teammate" demo starts from real data instead of an empty project.

## Region note (GDPR, `STACK.md`)

The Sanity CLI does not expose a dataset-region flag, so this project was
created on Sanity's default region. If Movenda requires guaranteed
EU-only data residency before go-live, that's set at project creation via
the `manage.sanity.io` dashboard (or Sanity support) — ask before real
patient-adjacent data is entered. Team names/photos are the only personal
data involved so far, and staff can be asked for consent either way.

## Inviting Julie

1. Go to https://www.sanity.io/manage/personal/project/k73l2by8/members
2. Invite her email as **Administrator** (Free plan only has Admin/Viewer —
   there's no in-between "Editor" role, but Admin without project-settings
   access is the closest fit for a single-editor site like this).
3. Send her the Studio link: https://movenda.sanity.studio

## Local development (only needed by whoever maintains the schema code)

```bash
cd studio
npx sanity login        # interactive browser login
npm install
npm run dev              # local studio at http://localhost:3333
npm run deploy           # re-publishes https://movenda.sanity.studio after schema changes
```

`.env` (gitignored) already has the project id/dataset for this machine;
copy `.env.example` on a new machine and fill it in.

## Re-seeding content

```bash
SANITY_WRITE_TOKEN=<create a short-lived editor token in manage.sanity.io> \
  node scripts/seed.mjs
```

Safe to re-run — uses deterministic `_id`s (`teamlid-<slug>` etc.) so it
overwrites the same seeded docs and never touches documents Julie created
by hand.

Fixed-page copy (`pagina-<key>`, 8 docs) is seeded from
`web/src/content/paginas.json` with `npx sanity exec scripts/seed-paginas.mjs
--with-user-token`. That script only fills *empty* fields, so Julie's edits
survive a re-run. Add a page: extend `PAGINAS` in `schemaTypes/pagina.ts`,
add the key to `paginas.json` and `preview.ts`, re-run the seed.

## Schemas (`schemaTypes/`)

| Schema | Matches `web/src/lib/content.ts` shape |
|---|---|
| `teamlid` | `Teamlid` |
| `locatie` | `Locatie` (2 documents: Olympia, MPC — do not add more without asking) |
| `dienst` | `Dienst` |
| `siteSettings` | `SiteSettings` (singleton — booking off by default, Google reviews) |
| `popup` | `Popup` (event overlays Julie can turn on/off; signup form or link) |
| `getuigenis` | `Getuigenis` (quote carousel: quote, naam, foto, locatie, volgorde, show/hide) |
| `lesrooster` | `Lesrooster` (MPC group-class timetable; was missing from the old sidebar) |
| `pagina` | `Pagina` (H1, intro, hero photo, SEO + text blocks of the 8 fixed pages: home, over, kine, training, mpc, mpc-visie, contact, jobs. Not creatable/deletable from the Studio; fields hide per page) |

Once real Sanity data exists, update `web/src/lib/content.ts` to query
`@sanity/client` with GROQ instead of reading the local JSON in
`web/src/content/`. No Astro page or component needs to change — they only
call the functions in `content.ts`.
