# DAY//NIGHT V23 - Handoff roadmap

## Phase 1 - Repository
1. Upload the V23 files to the GitHub repository root.
2. Enable GitHub Pages using GitHub Actions.
3. Run `Deploy DAY//NIGHT V23 to GitHub Pages`.
4. Fix any validation failure before continuing.

## Phase 2 - Domain
1. Keep `daynightgroup.ro` on Cloudflare nameservers.
2. Point the domain to GitHub Pages using the records GitHub requests.
3. Configure `daynightgroup.ro` as the custom domain.
4. Confirm HTTPS and the desired `www` redirect behavior.

## Phase 3 - Contact backend
1. Deploy `backend/` as a Cloudflare Worker.
2. Configure `RESEND_API_KEY` and `TURNSTILE_SECRET_KEY` as secrets.
3. Confirm `CONTACT_FROM`, `CONTACT_TO` and `ALLOWED_ORIGINS`.
4. Add the public Worker endpoint and public Turnstile site key to `site-config.js`.
5. Send a real contact test.

## Phase 4 - Owner self-service
1. Open `/admin.html`.
2. Save the GitHub repository URL.
3. Use the management workflows for Artists, Tracks, Socials, Projects/Collabs and Brand paths.
4. Check GitHub Actions after every change.
5. Run `/diagnostics.html` after deployment.

## Phase 5 - Search
1. Add `daynightgroup.ro` to Google Search Console.
2. Verify ownership by DNS.
3. Submit `/sitemap.xml`.

## Closure rule
Treat V23 as production live only after DNS, HTTPS, contact delivery, Admin -> commit -> deploy -> public update, and Diagnostics all pass on the real domain.
