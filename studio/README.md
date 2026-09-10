# Movenda Studio (Sanity)

This is Julie's editor. She never opens this folder or the code — she uses
the hosted Studio URL (`https://movenda.sanity.studio` once deployed) and
logs in with her email.

## One-time setup (needs a human with a Sanity account)

Sanity login is an interactive browser flow, so this can't be scripted by
an agent. Whoever owns/creates the Movenda Sanity account runs:

```bash
cd studio
npx sanity login
npx sanity init --project-id <existing-id-or-create-new> --dataset production
```

Choose the **EU dataset region** when prompted (see `STACK.md` — GDPR note:
team photos/names are personal data).

Then:

```bash
cp .env.example .env   # fill in SANITY_STUDIO_PROJECT_ID
npm install
npm run dev             # local studio at http://localhost:3333
npm run deploy          # publishes to https://<your-studio-name>.sanity.studio
```

Give the deployed Studio URL + an Administrator/Editor invite to **Julie**.

## Schemas (`schemaTypes/`)

| Schema | Matches `web/src/lib/content.ts` shape |
|---|---|
| `teamlid` | `Teamlid` |
| `locatie` | `Locatie` (2 documents: Olympia, MPC — do not add more without asking) |
| `dienst` | `Dienst` |
| `siteSettings` | `SiteSettings` (singleton — booking off by default, Google reviews) |

Once real Sanity data exists, update `web/src/lib/content.ts` to query
`@sanity/client` with GROQ instead of reading the local JSON in
`web/src/content/`. No Astro page or component needs to change — they only
call the functions in `content.ts`.
