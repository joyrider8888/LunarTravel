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
privacy/index.html   /privacy  — privacy policy
cookies/index.html   /cookies  — cookie policy
404.html             not-found page
robots.txt, sitemap.xml  search engine files
middleware.js        password check for /admin/ (Vercel Routing Middleware)
css/styles.css       all site styling
js/main.js           shared script: mobile menu, enquiry form validation and draft carry-over, cookie notice
media/               images (logo, hero, fleet photos)
legacy/              the previous Next.js/React/TypeScript implementation, kept for reference
```

The enquiry form validates in the browser and keeps what was typed, but sending is not connected yet (planned for v1.2): on submit it shows the email and phone fallback.

The hero intentionally uses still imagery only. `Thami.mp4` is not part of the implementation.

## Admin password

`/admin/` is protected by `middleware.js` using HTTP Basic auth. Set `ADMIN_PASSWORD_SHA256` in Vercel to the SHA-256 hex fingerprint of the password (`printf '%s' 'the-password' | sha256sum`). The password itself is never stored in the repository. If the variable is missing, `/admin/` stays closed.

## Live enquiries

`api/enquiry.js` receives the enquiry form. It sends nothing until settings exist in Vercel: `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` (run `supabase/enquiries.sql` once) to store enquiries, and/or `RESEND_API_KEY`, `ENQUIRY_TO` and `ENQUIRY_FROM` to email the team. With neither, the form shows the email and phone fallback.
