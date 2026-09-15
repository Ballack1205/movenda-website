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
- **Echte huisstijl, uit de live site gehaald**: navy/blauw kleurenpalet (`#274d87` nav, `#1470af` primary, `#074b78` footer) en Poppins voor koppen — 1-op-1 overgenomen van movenda.be, i.p.v. zelfverzonnen kleuren. Movenda en MPC delen dezelfde huisstijl (geen apart donker/oranje MPC-thema — dat bestaat niet op de echte site) via één component-basis, geen dubbele codebase.
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

## 9. Kosten (vraag van Julie, meeting 15/09)

**Jaarlijks terugkerend (na go-live)**

| Post | Kost | Opmerking |
|---|---|---|
| Domein `movenda.be` | ± €15–25 / jaar | Loopt vandaag al (registrar blijft; enkel de DNS-records wijzigen). |
| Hosting website — Render Static Site | €0 | Gratis tier; statische site, geen server. Bandbreedte ruim voldoende voor een praktijk. |
| Contactformulier-API — Render Web Service | €0 **of** ± US$7 / maand (± €80 / jaar) | Gratis tier "slaapt" na 15 min: het eerste formulier van de dag duurt dan 30–50 s. Aanbevolen: Starter-plan zodat verzenden altijd meteen lukt. |
| Sanity CMS | €0 | Gratis plan volstaat voor Julie + ons (records, foto's, één korte video). Betaald plan pas nodig bij versiegeschiedenis/rollen of veel meer media — melden we vooraf. |
| E-mail verzenden (Resend) | €0 | Gratis tier: ruim genoeg voor contact- en nieuwsbriefinschrijvingen. |
| Elfsight (Instagram- en Google-reviews-widget) | bestaand abonnement | Hergebruikt van de oude site; geen nieuwe kost. Kan later weg als jullie dat willen. |
| Google Analytics 4, Search Console, Bedrijfsprofiel | €0 | |
| Squarespace | **−** huidig abonnement | Valt weg na go-live (opzeggen ná de DNS-omzetting, niet ervoor). |

Netto: ± €100 / jaar met de aanbevolen always-on contact-API, ± €20 / jaar zonder. Geen nieuwe betaalde dienst zonder jullie akkoord (zie `AGENTS.md`).

**Eenmalig — "er boenk op" en live**

Inschatting in uren; het bedrag = uren × jouw uurtarief (bewust niet in dit document).

| Blok | Uren (schatting) | Inhoud |
|---|---|---|
| Content & foto's | 6–8 | Alle nieuwe foto's/video plaatsen, alt-teksten, EN-vertalingen nalezen, prijzenconflicten afklaren met Julie. |
| Keuzehulp "Wie past bij mij?" | 4–8 | Julie's Claude-boom omzetten naar CMS-vragen/-antwoorden (afhankelijk van hoe vertakt hij is). |
| SEO-afwerking | 3–4 | Keyword-check per pagina (zie §10), Search Console koppelen, sitemap indienen, Bedrijfsprofiel-links, eerste blog↔dienst-koppelingen. |
| Go-live | 3–4 | `PUBLIC_SITE_URL`/`PUBLIC_NOINDEX` omzetten, `X-Robots-Tag` weg, 301-map in Render, `mpc.movenda.be` → `/mpc/*`, DNS op Cloudflare, TLS, analytics op Live, controle. |
| Julie-onboarding | 2 | Uitnodiging Studio, korte NL-handleiding, één sessie samen. |
| Buffer | 4 | Onvoorziene feedback na livegang. |
| **Totaal** | **22–30 u** | |

Later, apart te begroten (pas na go-live): inschrijvingen voor groepslessen (8–16 u zonder externe tool), paginaovergangen/effecten (4–6 u), boekknop koppelen aan een agenda-tool (2 u + kost van die tool).

## 10. Zoekwoorden → pagina (voor Julie)

Elke pagina "draagt" één zoekterm. Titel en omschrijving staan in Sanity (SEO-tab); zo staan ze nu.

| Zoekterm | Pagina | Status |
|---|---|---|
| kinesitherapie hasselt | `/kinesitherapie` | ✅ "Kinesitherapie Hasselt \| Movenda" |
| **kinesist hasselt** | `/kinesitherapie` | ⚠️ "kinesist" staat enkel in de omschrijving. Tip: SEO-titel → "Kinesist in Hasselt \| Kinesitherapie bij Movenda" en het woord "kinesist(en)" in de intro. |
| dry needling hasselt | `/kinesitherapie/dry-needling` | ✅ "Dry needling Hasselt \| Movenda" |
| dry needling (sporters) | `/mpc/dry-needling` | ⚠️ Zelfde term als hierboven → twee pagina's concurreren. Tip: MPC-titel "Dry needling voor sporters \| MPC Kuringen" en tekst richten op sportrevalidatie. |
| manuele therapie hasselt | `/kinesitherapie/manuele-therapie` | ✅ |
| personal training hasselt | `/training` en `/training/personal-training` | ✅ (overzicht + dienst) |
| sportrevalidatie hasselt | `/mpc/sportrevalidatie` | ✅ |
| performance training hasselt | `/mpc` + `/mpc/performance-training` | ✅ |
| groepslessen hasselt / hiit hasselt | `/mpc/groepslessen`, `/mpc/hiit` | ✅ |
| pre- en postnatale kine hasselt | `/kinesitherapie/pre-en-postnatale-kinesitherapie` | ✅ |

Hoe de blog meehelpt (nieuw sinds 15/09):
- Bij elk artikel: **"Gaat over deze behandelingen"** → kies 1–3 diensten. Het artikel linkt dan naar die dienstpagina's en de dienstpagina toont het artikel onder **"Lees ook"**. Dat is precies het soort interne link dat Google gebruikt om te beslissen welke pagina relevant is voor "dry needling hasselt".
- Tags maken nu automatisch onderwerp-pagina's (`/blog/tag/rugpijn`, `/blog/tag/sportblessures`, …).
- Vuistregel voor nieuwe artikels: één zoekterm per artikel, die term in titel + eerste alinea, en koppel de dienst. Bv. "Wat is dry needling en wanneer helpt het?" → dienst Dry needling.

## 11. Actiepunten na de meeting van 15/09

Voor Julie / Movenda:
- [ ] **Google Analytics 4**: property `G-WCV2RJG010` → Beheer → Toegangsbeheer → Jonas toevoegen als *Beheerder*.
- [ ] **Google Search Console**: `movenda.be` (domein-property) → Instellingen → Gebruikers → Jonas als *Eigenaar*. Bestaat er geen property, dan maken we die na go-live (verificatiecode kan in Site-instellingen → Analytics).
- [ ] **Google Bedrijfsprofiel**: Jonas als beheerder op beide vestigingen (nodig voor de review-links en `place_id`).
- [ ] Keuzehulp-boom (HTML, gemaakt met Claude) doorsturen.
- [ ] Liggende video (16:9) voor de MPC-hero als die er is — de huidige staande clip staat erop, maar wordt op desktop gecentreerd bijgesneden.
- [ ] Logo's van de 10 partners die nu als tekst staan (zie `DECISIONS.md`).

Voor ons:
- [x] Feedback verwerkt (foto's, video, dupliceren, contactvraag, menu, SEO-links) — Studio opnieuw uitgerold.
- [ ] Julie uitnodigen in Sanity als **Editor** (`sanity.io/manage` → project Movenda → Members → Invite) + korte NL-handleiding meesturen.
- [ ] Na ontvangst keuzehulp-boom: inschatting + bouwen.
- [ ] Eenmalig bedrag invullen (uren × tarief, §9) en aan Julie bezorgen.
