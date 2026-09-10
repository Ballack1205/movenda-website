# Movenda Studio (Sanity)

**Live:** https://movenda.sanity.studio
**Organization:** Movenda (`o0yzdz4fi`) · **Project:** Movenda (`k73l2by8`) · **Dataset:** `production` (private)

This is Julie's editor. She never opens this folder or the code — she uses
the hosted Studio URL above and logs in with her email (or a Google/GitHub
account) once invited.

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

## Schemas (`schemaTypes/`)

| Schema | Matches `web/src/lib/content.ts` shape |
|---|---|
| `teamlid` | `Teamlid` |
| `locatie` | `Locatie` (2 documents: Olympia, MPC — do not add more without asking) |
| `dienst` | `Dienst` |
| `siteSettings` | `SiteSettings` (singleton — booking off by default, Google reviews) |
| `popup` | `Popup` (event overlays Julie can turn on/off; signup form or link) |
| `getuigenis` | `Getuigenis` (quote carousel: quote, naam, foto, locatie, volgorde, show/hide) |

Once real Sanity data exists, update `web/src/lib/content.ts` to query
`@sanity/client` with GROQ instead of reading the local JSON in
`web/src/content/`. No Astro page or component needs to change — they only
call the functions in `content.ts`.
