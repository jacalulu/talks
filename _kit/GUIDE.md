# Deck kit - how these talks are built

This folder is the reusable shell behind the decks on talks.jaclynkonzelmann.com.
`deck.html` is a complete, working deck with one example of every slide type.
A new talk starts by copying it.

## Start a new talk

1. Copy `_kit/deck.html` to `<slug>/index.html`. Slug is lowercase with dashes,
   for example `ai-conference-2026`.
2. Set the `<title>`, `og:title`, `og:description`, `og:url` in the head. Add an
   `og:image` (1200x630 JPEG at `<slug>/og-image.jpg`) once there is a title slide
   worth previewing.
3. Delete the example slides you do not need; duplicate the ones you do. Keep the
   speaker slide - it is her intro and works for any talk.
4. Gate it: in `middleware.js` add the folder to `TALKS` with an env var name and
   to `config.matcher`; add the env var on Vercel for production and preview
   (`printf 'PASSWORD' | npx vercel env add NAME production`); add a locked block
   to `index.html` (copy an existing one, change slug and event name); write
   `<slug>/card.html` (copy an existing one).
5. Push to `main`. Vercel deploys in about fifteen seconds. Verify with
   `_kit/tools/deploy-wait.sh <short-sha>` - never by grepping CLI output.

## The three arrays

Every slide is one `<section class="s ...">` inside `#deck`, and three arrays in the
main script must have exactly one entry per section, in order:

- `TONE` - `"cream"`, `"feature"`, `"image"` or `"title"`. Sets the ground colour and
  hides the ambient shapes on `title`.
- `NOTES` - `{cue, paras}` per slide. `cue` is the act and time range shown in the
  presenter bar.
- `HEADS` - the heading text used for the "Next:" preview. Use a custom label when two
  slides share a heading.

The HUD counter `<span id="cur">1</span> / N` is hard-coded; update N. If the arrays
and sections fall out of step the notes show on the wrong slides.

## Slide types

| class | use |
|---|---|
| `s-feature s-section s-cover` | cover: headline + sub, no event line |
| `s-title` | speaker slide with portrait and logo track |
| `s-feature s-section` | act divider with a number |
| `s-cream s-lead` | kick, headline, optional sub, optional `.dgm` |
| `s-cream s-lead s-dg` | lead with a diagram - compact scale so margins hold |
| `s-feature s-statement` | big quote `.q.q-lg`; payoff in `<span class="hl">` |
| `s-cream s-list` | numbered `.items` list; up to three items |
| `s-cream s-list s-tight` | four items |
| `s-cream s-duo s-shots` | two screenshots side by side; `.shots.solo` for one |
| `s-cream s-list s-instinct` | list left, screenshot right |
| `s-feature s-image` | full-bleed image with `.cap` caption |
| `s-cream s-duo` | two text columns |
| `s-feature s-close` | thank you |

Click builds: give elements `data-step="1"`, `data-step="2"`... on the slide. Items in
`.items` and `[data-step]` inside `.dgm` hide until their step; anything else needs its
own hide rule (see `.shot[data-step]`). The number of `[[CLICK]]` markers in the notes
must equal the highest step, in order.

Images: reference files in the talk folder (`shot.png`), not base64. Use originals at
1600 pixels or wider. Screenshots of tweets go fuzzy; get the article's image.

## Speaker notes

Notes are the verbatim script. The presenter cuts them into pages of about two lines
at sentence ends; the arrow key turns pages; the last page moves to the next slide.

- `[[CLICK]]` in the text fires the slide's next build on that press, right where the
  word is. A click at the very start of a page fires as the page turns.
- `LAND: ...` - a line to say word for word. Red bar, bold.
- `>> ...` - a director note. Italic, muted, attached to the page before it, never read.
- `**bold**` - bright highlight for the words to land. Added during rehearsal.
- Keep spoken notes under about 160 words a slide; split a heavier slide into two
  slides at a click, each with its own notes.

Presenter: `P` opens the window (sized to the screen), `N` the drawer, `T` the timer,
`+` and `-` the text size (remembered), `F` full screen. Home and End jump.

## Layout rules from the audit

- Content should stay at least about 10% of the frame height from the top and bottom
  and 7% of the width from the sides. Measure text ranges and diagram boxes relative
  to `.frame`; do not eyeball.
- Headlines: `s-lead` at 6.2cqw, compact variants at 5 to 5.2cqw. No headline over
  five lines.
- Smallest label 1.2cqw.
- Ambient shapes are 10cqw, avoid text ink automatically, and may hang half off the
  frame. Do not hand-place them.

## Verifying

- Switch slides with `location.hash='#N'; location.reload()`. The hash is read only
  on load. Multi-key presses across a slide change fail in the automated browser;
  one key per action, or dispatch `KeyboardEvent`s.
- `window.__pgdbg()` reports slide, page, click state. `window.__dbg()` reports shapes.
- Videos play fine but capture black in screenshots. Test with `readyState` or by
  drawing a frame to a canvas.
- Extract the main `<script>` and run `node --check` before every push.

## Brand and voice

Single dashes with spaces, never em dashes. Notes in her voice: short sentences,
plain words, one idea per line. Cover has no event line. Credit borrowed charts on the
slide (name, outlet, title, date).
