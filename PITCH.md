# Pitch: nieuwe Movenda-website

Voor het gesprek met Movenda. Dit is een **werkdocument**, geen slide-deck — gebruik het als script/cheat sheet tijdens het gesprek en laat live de preview zien in plaats van screenshots.

⚠️ **De preview staat bewust op `noindex`** (niet vindbaar via Google, niet gelinkt vanaf `movenda.be`). Stuur de link gerust naar Movenda, maar niet breder verspreiden tot ze kiezen.

---

## 1. Live links

| Wat | URL |
|---|---|
| Preview-site | https://movenda-preview.onrender.com |
| CMS (Sanity Studio) | https://movenda.sanity.studio |
| Homepage Movenda-brand | https://movenda-preview.onrender.com/ |
| MPC (dark sub-brand) | https://movenda-preview.onrender.com/mpc |
| Team (19 medewerkers, al ingevuld) | https://movenda-preview.onrender.com/team |
| Locaties (Olympia + MPC) | https://movenda-preview.onrender.com/locaties/olympia |
| Contact | https://movenda-preview.onrender.com/contact |

---

## 2. De 30-seconden pitch

> "We hebben in korte tijd een volledig werkende, moderne versie van jullie website gebouwd — met echte content, echte medewerkers, echte locaties. Geen mockup: dit draait live, is razendsnel, en jullie kunnen zelf — zonder ons, zonder code — een nieuwe collega toevoegen of een tekst aanpassen en het staat binnen een minuut live. We laten het je nu meteen zien."

Dan: open de Studio, voeg live een teamlid toe, laat zien dat het binnen ~1 minuut op de preview-site verschijnt. Dát is de wow-moment — niet de site zelf, maar dat **zij** de controle hebben.

---

## 3. Het probleem vandaag (waarom dit relevant is)

- **MPC is nu Engelstalig**, terwijl de praktijk Nederlandstalig is en cliënten Nederlandstalig zoeken — dat kost hen zichtbaarheid in Google én vertrouwen bij bezoekers.
- **Twee locaties, twee merken (Olympia/kine + MPC/performance), twee BTW-nummers** — nu waarschijnlijk niet consistent naast elkaar gepresenteerd, wat verwarrend is voor nieuwe patiënten én voor Google (NAP-consistentie beïnvloedt lokale SEO).
- **+30 vijfsterrenreviews op Google die nergens op de site zelf zichtbaar zijn** — het sterkste marketingbewijs dat ze hebben, wordt nu weggegooid.
- **Wijzigingen aan het team, tarieven, uren vereisen waarschijnlijk een developer/agency** — trager, duurder, en Julie kan het niet zelf.
- **Geen gestructureerde data (schema.org)** — zoekmachines en AI-samenvattingen (ChatGPT, Google AI Overviews, Perplexity) kunnen moeilijker correct begrijpen wie Movenda is, waar, en wat ze aanbieden.

## 4. Wat we al gebouwd hebben (Fase 1 — deze preview)

- **Volledig eigen CMS (Sanity)**: Julie (of wie dan ook) voegt teamleden, locaties en diensten toe via een Nederlandstalig scherm — geen code, geen Cursor, geen git nodig.
- **Live auto-publish**: Publish in de Studio → automatisch een nieuwe build op Render → live binnen ~1-2 minuten. Zonder ons.
- **Eén site, twee merken**: Movenda (licht/teal) en MPC (donker/oranje "performance" sub-merk) delen dezelfde component-basis maar zien er duidelijk anders uit — via één `brand`-instelling per pagina, geen dubbele codebase.
- **Google-reviewbadge**: 30+ ⭐5.0 zichtbaar op home, locatiepagina's en contact, met link naar de echte Google-reviews.
- **Boekknop klaar, maar uit**: `siteSettings.booking.enabled` staat op `false`. Zodra Movenda een scheduler kiest (Progenda/Doctena/...), zetten we 'm met één klik aan.
- **SEO-fundament**: JSON-LD structured data per pagina (Organization, LocalBusiness per locatie, Person per teamlid, Service per dienst, Breadcrumbs) — geen zelf-gerapporteerde `AggregateRating` (dat toont Google sowieso niet meer als rich result; het echte signaal blijft het Google Bedrijfsprofiel zelf).
- **Razendsnel & mobile-first**: self-hosted lettertype, geen zware page-builder, statische site.

## 5. Harde cijfers (Lighthouse, mobiel, live op de preview-URL)

| Categorie | Score |
|---|---|
| Performance | **99/100** |
| Accessibility | **100/100** |
| Best Practices | **100/100** |
| SEO | 66/100 * |

\* *De enige gemiste SEO-check is "Page is blocked from indexing" — dat is opzettelijk (`noindex`) omdat dit een privé-pitch-preview is die nog niet vindbaar mag zijn. Zet dat uit bij lancering en dit is ook 100/100.*

Vergelijk dat gerust live met hun huidige site via [PageSpeed Insights](https://pagespeed.web.dev/) tijdens het gesprek — dat argument overtuigt zichzelf.

## 6. Live demo-script (volgorde voor het gesprek)

1. **Open de preview-homepage** op je telefoon (niet laptop) — laat zien hoe snel en clean het laadt.
2. **Klik naar `/mpc`** — toon het donkere sub-merk, zelfde site, andere uitstraling.
3. **Klik naar `/team`** — 19 medewerkers, echte foto's/bio's (al ingevuld).
4. **Wissel naar de Studio** (`movenda.sanity.studio`) → **Teamleden → Nieuw** → vul een naam/rol in → **Publish**.
5. **Wacht ~1 minuut, herlaad `/team`** → nieuw teamlid staat er live tussen. *(dit is het overtuigingsmoment)*
6. **Toon de reviewbadge** op de homepage/contact-pagina.
7. **Sluit af met de boekknop**: "staat klaar, zetten we aan zodra jullie een scheduler kiezen."

## 7. Verwachte vragen + antwoorden

- **"Wat kost dit ons?"** → Sanity CMS: gratis tier (ruim voldoende voor deze schaal). Render hosting: gratis tier om te starten, kleine maandelijkse kost pas nodig bij veel verkeer. Geen verrassingskosten zonder overleg.
- **"Wat als Julie het CMS niet fijn vindt?"** → Fallback is een opgeruimde Squarespace-site; geen lock-in, we beslissen dat pas na een demo met haar.
- **"Waar staat onze data?"** → Sanity's standaardregio (niet EU-gegarandeerd op het gratis plan) — puur marketingcontent, geen patiëntgegevens. Dit checken we voor livegang als jullie strikte EU-opslag willen.
- **"Hoelang tot volledige lancering?"** → Deze preview is Fase 1 (kernpagina's, echte content). Fase 2-4: blog, vacatures, prijzen, FAQ, EN-vertaling, contactformulier-backend, volledige 301-redirects, DNS-omzetting. Doorlooptijd hangt af van scope-keuzes, maar de basis staat al.
- **"Waarom Render en niet [X]?"** → Al gekoppeld in onze tools, gratis tier, geen vendor lock-in — verhuizen naar Cloudflare Pages later kan in ~30 min als dat ooit nodig is.
- **"Blijft onze huidige site intussen online?"** → Ja, er verandert niets aan `movenda.be` of de DNS tot jullie expliciet akkoord geven.

## 8. Na een "ja" — wat volgt (niet meer nodig voor de pitch zelf)

- Blog migreren (5 bestaande posts) + Julie kan zelf nieuwe posts schrijven in de Studio.
- `/jobs`, `/prijzen`, `/faq` pagina's.
- Engelse vertaling (`/en/`) met een "Vertaal"-actie in de Studio.
- Contactformulier-backend (Resend), GA4 consent-banner + conversie-events.
- Volledige 301-redirect-map + DNS-omzetting naar `movenda.be`.
- Sanity-webhook uitbreiden zodra meer content-types live gaan (blog, vacatures, ...).
