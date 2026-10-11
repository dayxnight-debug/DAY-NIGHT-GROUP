# DAY//NIGHT™ V23 — START HERE: FULL LIVE STEP BY STEP

Acest ghid duce proiectul de la ZIP la `https://daynightgroup.ro`, cu site public, administrare, deploy automat, formular real de contact și Google Search Console.

> Nu pune parole, token-uri GitHub, chei Resend sau chei Turnstile în fișierele publice. Secret-ele se salvează numai în GitHub/Cloudflare, acolo unde este indicat.

## Ce îți trebuie înainte să începi

- acces la contul GitHub care va deține repository-ul;
- acces la Cloudflare pentru zona DNS `daynightgroup.ro`;
- acces la registrar doar dacă Cloudflare nu mai este nameserver activ (în prezent domeniul este deja delegat spre Cloudflare);
- cont Cloudflare Workers;
- cont Resend (sau un serviciu email compatibil, dar Worker-ul inclus este pregătit pentru Resend);
- acces la `management@daynightgroup.ro` pentru verificări;
- acces la Google Search Console.

---

# PASUL 1 — Creează repository-ul GitHub

1. Intră în GitHub.
2. Creează un repository nou, de exemplu `daynightgroup-site`.
3. Recomandare: **Private** este OK dacă planul/Pages permite în contul folosit; altfel folosește Public.
4. Nu inițializa repository-ul cu alte fișiere dacă urmează să încarci direct acest kit.
5. Descarcă/dezarhivează acest ZIP local.
6. Încarcă **conținutul folderului**, nu folderul părinte. La rădăcina repo-ului trebuie să vezi direct:
   - `index.html`
   - `artists.html`
   - `collabs.html`
   - `admin.html`
   - `content.json`
   - `.github/`
   - `assets/`
   - `backend/`
   - `CNAME`
7. Commit pe branch-ul `main`.

### Verificare

Repository-ul trebuie să aibă fișierul:

`/.github/workflows/deploy.yml`

Dacă `.github` lipsește, deploy-ul automat nu va exista.

---

# PASUL 2 — Activează GitHub Pages

1. Deschide repository-ul.
2. Intră la **Settings → Pages**.
3. La sursa de deploy selectează **GitHub Actions**.
4. Deschide tab-ul **Actions**.
5. Rulează manual workflow-ul:

`Deploy DAY//NIGHT V23 to GitHub Pages`

6. Așteaptă să apară verde / Success.
7. Deschide URL-ul temporar oferit de GitHub Pages și verifică Home + Artists + Collabs.

### Dacă workflow-ul nu pornește

În **Settings → Actions → General → Workflow permissions**, asigură-te că workflow-urile pot rula și au permisiunile necesare pentru Pages. Fișierul `deploy.yml` cere deja:

- `contents: read`
- `pages: write`
- `id-token: write`

---

# PASUL 3 — Leagă domeniul `daynightgroup.ro`

Fișierul `CNAME` din proiect conține deja domeniul țintă.

1. În **GitHub → Settings → Pages**, introdu la Custom Domain:

`daynightgroup.ro`

2. Salvează.
3. GitHub îți va arăta ce verificări DNS trebuie să treacă.
4. Nu șterge `CNAME` din repository.

---

# PASUL 4 — Configurează Cloudflare DNS

Domeniul folosește deja nameservere Cloudflare, deci lucrezi în zona DNS existentă.

În Cloudflare → `daynightgroup.ro` → **DNS → Records**:

## Apex / root

Pentru GitHub Pages, configurează root-ul conform valorilor afișate de GitHub Pages. În mod uzual GitHub documentează A/AAAA pentru apex și CNAME pentru `www`; folosește valorile curente afișate de GitHub dacă diferă.

## WWW

Adaugă `www` ca CNAME către hostname-ul GitHub Pages al repository-ului, apoi folosește redirect/canonical către varianta principală:

`https://daynightgroup.ro`

## Recomandare Cloudflare

- SSL/TLS activ;
- HTTPS activ;
- după ce certificatul este valid, forțează HTTP → HTTPS;
- nu crea redirect loop între `www` și non-`www`.

### Verificare

Trebuie să meargă:

- `https://daynightgroup.ro`
- `https://www.daynightgroup.ro`

Una dintre ele trebuie să redirecționeze către hostname-ul principal ales.

---

# PASUL 5 — Publică backend-ul de Contact în Cloudflare Workers

Backend-ul este în:

`/backend/`

## Metoda recomandată — Wrangler

Pe PC, cu Node.js instalat:

```bash
cd backend
npm install
npx wrangler login
```

Browserul va cere autorizarea contului Cloudflare.

Apoi setează secret-ele:

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put TURNSTILE_SECRET_KEY
```

Nu scrie valorile secretelor în fișiere.

Publică Worker-ul:

```bash
npm run deploy
```

La final vei primi URL-ul Worker-ului, de forma:

`https://daynight-contact.<account>.workers.dev`

### Test Worker

Deschide:

`https://URL-WORKER/health`

Trebuie să primești JSON cu `"ok": true`.

Endpoint-ul formularului va fi:

`https://URL-WORKER/contact`

---

# PASUL 6 — Configurează Resend pentru email real

Worker-ul trimite mesajele către:

`management@daynightgroup.ro`

și este configurat să folosească expeditorul:

`DAY NIGHT Website <contact@daynightgroup.ro>`

Pentru ca asta să funcționeze:

1. Adaugă `daynightgroup.ro` în Resend ca domeniu de trimitere.
2. Resend îți va da înregistrări DNS de verificare.
3. Adaugă acele înregistrări în Cloudflare DNS exact cum sunt furnizate.
4. Așteaptă statusul **Verified** în Resend.
5. Creează o API key pentru proiect.
6. Pune cheia doar în Worker cu:

```bash
npx wrangler secret put RESEND_API_KEY
```

7. Redeploy Worker-ul dacă este necesar.

### Test

După ce frontend-ul este conectat, trimite un mesaj real prin pagina Contact și confirmă că ajunge la:

`management@daynightgroup.ro`

și că Reply răspunde către emailul completat de vizitator.

---

# PASUL 7 — Configurează Cloudflare Turnstile

1. În Cloudflare creează un widget Turnstile pentru `daynightgroup.ro`.
2. Adaugă hostname-urile:
   - `daynightgroup.ro`
   - `www.daynightgroup.ro`
3. Vei primi:
   - **Site Key** — publică, intră în frontend;
   - **Secret Key** — privată, intră numai în Worker.
4. Secret Key:

```bash
cd backend
npx wrangler secret put TURNSTILE_SECRET_KEY
```

5. Site Key se pune în `site-config.js`.

---

# PASUL 8 — Completează `site-config.js`

Deschide fișierul din rădăcina proiectului:

`site-config.js`

Completează numai valorile publice:

```js
window.DAYNIGHT_CONFIG = Object.freeze({
  contactEndpoint: "https://URL-WORKER/contact",
  turnstileSiteKey: "SITE_KEY_PUBLICA_TURNSTILE",
  githubRepoUrl: "https://github.com/OWNER/REPO"
});
```

Nu pune aici:

- Resend API key;
- Turnstile secret key;
- GitHub token;
- parole.

Commit schimbarea pe `main`. GitHub Pages va redeploya automat.

---

# PASUL 9 — Rate limiting opțional, recomandat

Worker-ul include suport pentru Cloudflare KV cu binding-ul:

`RATE_KV`

Dacă îl configurezi, formularul limitează la aproximativ 5 încercări / IP / 10 minute.

1. Creează un KV Namespace în Cloudflare Workers.
2. Leagă namespace-ul de Worker cu binding name exact:

`RATE_KV`

3. Redeploy Worker-ul.

Fără KV, Turnstile + honeypot funcționează în continuare, dar limita persistentă pe IP nu este activă.

---

# PASUL 10 — Testează formularul complet

Pe site-ul live:

1. Intră la `/contact.html`.
2. Completează Name, Email, Subject, Message.
3. Rezolvă Turnstile.
4. Trimite.
5. Verifică mesajul de succes.
6. Verifică inbox-ul `management@daynightgroup.ro`.
7. Apasă Reply și confirmă că răspunsul merge către vizitator.
8. Testează și un caz invalid pentru a confirma mesajul de eroare.

Nu marca formularul ca final până nu trece acest test real.

---

# PASUL 11 — Configurează Admin / Content Studio

Intră la:

`https://daynightgroup.ro/admin.html`

1. În câmpul **GitHub repository URL** introdu:

`https://github.com/OWNER/REPO`

2. Apasă **SAVE REPOSITORY**.
3. Folosește butoanele:
   - Manage Artist
   - Manage Track
   - Manage Account
   - Manage Project
   - Manage Brand Paths
4. Acestea deschid GitHub Actions și cer autentificare GitHub.
5. Rulează workflow-ul cu datele dorite.
6. Workflow-ul modifică `content.json`.
7. Face commit pe `main`.
8. `deploy.yml` pornește automat.
9. Apasă **DEPLOY STATUS** și așteaptă Success.
10. Reîncarcă site-ul live.

### Test obligatoriu Admin

Fă un proiect temporar:

- ID: `test-live`
- Title: `TEST LIVE`

Deploy → verifică live → Delete → deploy → verifică că a dispărut.

După test, site-ul rămâne curat.

---

# PASUL 12 — Upload / replace logo-uri și artwork

Din GitHub repository:

1. Deschide folderul `assets/`.
2. Folosește **Add file → Upload files**.
3. Încarcă imaginea cu numele dorit.
4. Commit pe `main`.
5. În Admin rulează workflow-ul potrivit și setează calea, de exemplu:

`assets/nume-logo.png`

Pentru logo-uri day/night, păstrează întotdeauna contrastul:

- variantă închisă pe fundal deschis;
- variantă deschisă pe fundal închis.

Pagina `/brand.html` este referința pentru identitatea aprobată.

---

# PASUL 13 — Google Search Console

1. Deschide Google Search Console.
2. Adaugă proprietate de tip **Domain**:

`daynightgroup.ro`

3. Google va da un TXT record.
4. Adaugă TXT-ul în Cloudflare DNS.
5. Revino în Search Console și apasă Verify.
6. În secțiunea Sitemaps trimite:

`https://daynightgroup.ro/sitemap.xml`

7. Folosește URL Inspection pentru:

`https://daynightgroup.ro/`

și cere indexare dacă este disponibil.

---

# PASUL 14 — Test final de producție

Trebuie să treacă toate:

## Public

- Home se deschide pe HTTPS;
- About fără linia nedorită;
- Artists: XERØ 01, MIDNIGHT 02;
- logo-urile nu fug la hover;
- day/night schimbă corect toate logo-urile;
- social links funcționează;
- Socials încarcă Spotify / YouTube / SoundCloud;
- Collabs arată toate videoclipurile prin scroll normal;
- toate cele 4 video cards pot fi deschise;
- efectele reactive nu rup layout-ul;
- Contact livrează email real.

## Responsive

Testează cel puțin:

- 360 px;
- 390 px;
- 412 px;
- tablet;
- desktop 1920×1080.

## Admin

- repository URL salvat;
- add/edit/delete Artist;
- add/edit/delete Track;
- add/edit/delete Social;
- add/edit/delete Project/Collab;
- Brand path update;
- deploy status Success;
- schimbările apar live.

## Google

- HTTPS valid;
- `robots.txt` accesibil;
- `sitemap.xml` accesibil;
- Search Console Verified;
- sitemap Accepted/Success.

---

# PASUL 15 — Regula de închidere

Site-ul se marchează:

**DAY//NIGHT™ V23 — PRODUCTION CLOSED**

numai după ce:

1. domeniul este live;
2. HTTPS este valid;
3. contactul trimite email real;
4. Admin → content.json → deploy → site live a fost testat;
5. Search Console este verificat;
6. testele mobile și desktop au trecut.

După această etapă, orice funcție nouă intră într-un V24+, nu ca reparație la fundația V20.

---

# V23 FINAL PRE-FLIGHT

Before calling the website live:

1. Run `python scripts/qc_validate.py` from repository root.
2. Confirm the latest GitHub Pages deploy is green.
3. Open `https://daynightgroup.ro/diagnostics.html` and resolve every FAIL.
4. Test Artists in Light and Dark mode; dark/black marks belong on light backgrounds and light/white marks belong on dark backgrounds.
5. Check Home, About, Contact, Artists, Collabs and Socials at a narrow mobile width; no menu, title, logo, card, player or control may be cut off.
6. Send one real contact message and confirm delivery.
7. Make one harmless Admin content edit, deploy it, confirm it appears live, then revert it if it was only a test.
