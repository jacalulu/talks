# talks.jaclynkonzelmann.com

Static site of Jaclyn Konzelmann's talk decks. Plain HTML, no build. Hosted on Vercel
(project `talks`, scope `jacalulus-projects`), deploys on push to `main`.

- Each talk is a folder with `index.html` (the deck), `card.html` (its entry on the
  index) and media. `index.html` at the root is the public index.
- `middleware.js` gates unreleased talks, one password each, from Vercel env vars.
- `_kit/` is the reusable deck shell and `_kit/GUIDE.md` explains how decks are
  built, how notes work, and how to verify. Read it before touching a deck.
- Decks are hand-edited HTML. Keep `TONE`, `NOTES`, `HEADS` and the HUD counter in
  step with the sections. Syntax-check the main script with `node --check` before
  pushing.
- Verify deploys with `_kit/tools/deploy-wait.sh <sha>`, not by scraping CLI output.
- On this Mac use `/Library/Developer/CommandLineTools/usr/bin/git`; the default git
  shim is broken.
- Style: single dashes with spaces, never em dashes.
- `CLAUDE-CODE-HANDOFF.md` is the original publishing brief and is not tracked.
