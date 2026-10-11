# V23 QC tools

## Repository/static validation
Run from the repository root:

```bash
python scripts/qc_validate.py
node --check app.js
node --check site-config.js
node --check backend/src/index.js
```

The GitHub Pages deploy workflow runs these checks automatically.

## Optional browser smoke test
This checks all public/internal pages at 320, 390, 430, 768 and 1440 CSS px for horizontal overflow, page errors and artist logo theme switching.

Requirements: Python Playwright plus Chromium.

```bash
python -m http.server 8765
# second terminal
python scripts/browser_smoke.py
```

If Chromium is not Playwright-managed, set `CHROMIUM_PATH` first.
