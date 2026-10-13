# talks.jaclynkonzelmann.com

Static site of Jaclyn Konzelmann's talk decks. Plain HTML, no build. Hosted on Vercel
(project `talks`, scope `jacalulus-projects`), deploys on push to `main`.

- Each talk is a folder with `index.html` (the deck) and media. `index.html` at the root is
  the public index; add each talk there as a plain entry, newest first. Every talk is public.
- `vercel.json` sets `trailingSlash` so a deck opened without the slash redirects to it
  (decks use relative asset paths).
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
- `robots.txt` and `sitemap.xml` live at the root. When you add a talk, add its folder to
  `sitemap.xml` in the same push.
