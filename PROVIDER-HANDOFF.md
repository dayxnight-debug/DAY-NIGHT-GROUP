# Provider handoff - V23

This package is designed so DAY//NIGHT can continue operating the website without Maxilu Studio for routine content changes.

## What the owner can change
- Artists, order, roles, bios, symbols and social links.
- Artist light/dark logo paths.
- Tracks, artwork, platform, release date and listening URL.
- Official and artist social accounts.
- Projects and collaborations, including YouTube and external links.
- Main and artist brand asset paths.

## Where
- `/admin.html` - launch authenticated GitHub workflows.
- `content.json` - single public content source.
- `/brand.html` - internal brand reference.
- `/diagnostics.html` - public runtime/configuration preflight.

## What remains external
The website does not store passwords, GitHub tokens, Resend API keys or Turnstile secret keys. Those remain inside the owner's GitHub and Cloudflare accounts.

## Support boundary
Static code, content workflows, Worker source, validation scripts, deployment workflow, documentation and recovery checks are included. External account activation and final live service verification must be completed by an authorized account owner.
