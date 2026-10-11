# DAY//NIGHT™ V23 — GO LIVE

Pentru instalarea completă, deschide mai întâi:

**`START-HERE-FULL-LIVE.md`**

Acolo este fluxul complet, pas cu pas, pentru:

1. GitHub repository;
2. GitHub Pages;
3. `daynightgroup.ro`;
4. Cloudflare DNS + HTTPS;
5. Cloudflare Worker;
6. Resend;
7. Turnstile;
8. `site-config.js`;
9. rate limiting;
10. formular real de contact;
11. Admin / Content Studio;
12. logo-uri și assets;
13. Google Search Console;
14. QC live;
15. criteriul PRODUCTION CLOSED.

Checklist rapid: **`LIVE-DEPLOY-CHECKLIST.txt`**.

## Configurația publică ce trebuie completată

Fișier: `site-config.js`

```js
window.DAYNIGHT_CONFIG = Object.freeze({
  contactEndpoint: "https://URL-WORKER/contact",
  turnstileSiteKey: "SITE_KEY_PUBLICA_TURNSTILE",
  githubRepoUrl: "https://github.com/OWNER/REPO"
});
```

Nu pune chei secrete în acest fișier.

## Domeniu final

`https://daynightgroup.ro`

## Contact final

`management@daynightgroup.ro`

## Admin

`https://daynightgroup.ro/admin.html`

## Brand reference

`https://daynightgroup.ro/brand.html`

## V23 preflight

Before each production deploy, run:

```bash
python scripts/qc_validate.py
node --check app.js
node --check backend/src/index.js
```

After deployment open `/diagnostics.html`. A production handoff should have no **FAIL** entries. Contact-related **WARN** entries are expected only before the Worker/Turnstile public configuration is connected.
