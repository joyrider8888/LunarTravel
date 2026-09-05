# Lunar Travel

Editorial website for Lunar Travel — plain static HTML, CSS and JS. No build step, no framework.

## Run locally

Any static file server works, since pages live in folders with `index.html` (clean URLs need directory-index support):

```bash
npx serve .
```

Or use the VS Code "Live Server" extension on `index.html`.

## Structure

```
index.html          homepage
fleet/index.html     /fleet   — fleet presentation
coverage/index.html  /coverage — operating regions
enquire/index.html   /enquire  — trip enquiry form
404.html             not-found page
css/styles.css       all site styling
js/main.js           shared script (no active behavior yet)
media/               images (logo, hero, fleet photos)
legacy/              the previous Next.js/React/TypeScript implementation, kept for reference
```

Forms are intentionally static markup — no client-side validation or submit handling is wired up.

The hero intentionally uses still imagery only. `Thami.mp4` is not part of the implementation.
