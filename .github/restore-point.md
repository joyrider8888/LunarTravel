# LunarTravel Restore Point

**Updated:** 2026-09-05
**Status:** Codebase converted from Next.js/React/TypeScript to plain static HTML/CSS/JS. No build step required.

## Resume Here (2026-09-05, codebase conversion)

- Converted the entire site from Next.js App Router (React/TypeScript) to plain static HTML, CSS and JS, at the user's request. No git repo exists here, so the full prior Next.js source was preserved rather than deleted.
- **New root structure:**
  - `index.html` — homepage
  - `fleet/index.html`, `coverage/index.html`, `enquire/index.html` — routes, using folder + `index.html` so clean URLs (`/fleet/`, `/coverage/`, `/enquire/`) keep working on any static server that serves directory index files
  - `404.html` — not-found page
  - `css/styles.css` — copied verbatim from the old `app/globals.css` (pure CSS, needed no changes)
  - `js/main.js` — present but intentionally inert; no page previously had working JS behavior (menu button and forms were always non-functional markup) so nothing needed porting
  - `media/` — all image assets, copied from the old `public/media/`
- **`legacy/` folder** holds the entire previous implementation untouched: `app/`, `public/`, `out/`, `.next/`, `package.json`, `package-lock.json`, `node_modules/`, `next.config.ts`, `tsconfig.json`, `next-env.d.ts`. Kept for reference/rollback since there's no version control. Safe to delete later if the user confirms they no longer need it.
- Verified the new static site by serving the project root with `npx serve . -l 4174` and driving it with Playwright MCP: `/`, `/fleet/`, `/coverage/`, `/enquire/` all load with identical visual output to the Next.js version (confirmed via screenshot comparison), nav links work, and `/nope` correctly serves `404.html` with a 404 status. Only console noise is the harmless missing `favicon.ico`, same as before.
- README.md rewritten to describe the new structure and how to run it (any static server, or VS Code Live Server on `index.html`).
- Note: while moving files, `mv` (bash) hit `Permission denied` on `app/` and `out/` because a leftover background `npm run dev` / `serve` process still had them open — killing those background tasks first, then using PowerShell's `Move-Item`, resolved it. Worth remembering if a future move/delete in this project mysteriously fails on Windows: check for a lingering dev-server task first.

## Resume Here (2026-09-05, Claude Code session — Next.js era, now superseded)

- Reviewed the full project structure (`app/layout.tsx`, `app/page.tsx`, `app/fleet`, `app/coverage`, `app/enquire`) — confirmed this is already a static-export Next.js site (`next.config.ts`: `output: 'export'`) with working page routing via `next/link` and no form validation/submit wiring anywhere (forms are intentionally inert markup).
- Verified the static export by running `npm run build` then serving `out/` with `npx serve out -l 4173`, driven with Playwright MCP: `/`, `/fleet`, `/coverage`, `/enquire` all load correctly, nav/links work, no console errors besides a harmless missing `favicon.ico`.
- **Bug found and fixed:** the header logo rendered as a solid white block. Root cause was `app/globals.css` `.logo { filter: brightness(0) invert(1); }` — that filter flattens any image to solid white, which only works for a transparent-background logo. `public/media/logo.png` has an opaque dark card background, so the whole image collapsed to white. Fix: removed the filter, added a small `border-radius` so the logo's square dark card sits naturally in the header. Rebuilt and confirmed visually via Playwright screenshot — logo (car icon + "LUNAR TRAVEL" wordmark) now displays correctly.
- Project is intentionally **not** a git repository (user's choice, confirmed 2026-09-05) — this markdown file is the only persistence/restore mechanism between sessions. Do not `git init` this project unless the user explicitly asks again.
- Playwright MCP for Claude Code (this tool) is confirmed attached and working this session — no reconfiguration needed.

## Resume Here (prior session — fleet imagery)

All four LunarTravel stills (hero, BMW, SUV, Mercedes V-Class van) are now enhanced and wired into `app/page.tsx` and `app/fleet/page.tsx`. If more image enhancement work comes up later, reuse this method:

1. Playwright MCP is attached and working in this session. The user signed back in to Gemini manually when a fresh unauthenticated browser profile loaded; if a new session hits the same signed-out state, ask the user to sign in again before continuing.
2. Shared Gemini conversation: `https://gemini.google.com/app/856bb504f4857219?hl=en_GB`.
3. Fleet source stills are multi-panel screen-recording collages (interior/exterior shot + title-card band + second shot + on-screen timestamp), not clean single frames. Gemini reliably rejects/mishandles the raw collage (returns a wrong, blank, or badly recomposed crop). The working method: use Python/PIL to crop out one clean sub-panel first (drop any caption text and the corner timestamp), save it as `public/media/<name>-standalone.png`, then upload that crop to Gemini with a single-frame prompt that explicitly names the aspect ratio and forbids cropping/recomposing.
4. Even with a clean standalone crop, Gemini can still recompose/zoom the frame (this happened repeatedly with `fleet-van-standalone.png`, cutting off the wheels and bumper). If a result changes the framing, use "Redo" → "Try again" once or twice; if it keeps failing, send an explicit follow-up message naming exactly what was cropped out and restating the aspect ratio and "no zooming/panning/cropping/recomposition" — this fixed it on the third attempt for the van.
5. Download each accepted result via the page's "Download full-sized image" button — Playwright MCP saves it into this project's `.playwright-mcp/` folder as a `Gemini-Generated-Image-*.jpeg`. Copy/rename it into `public/media/<name>-enhanced.png` (kept as literal JPEG bytes with a `.png` extension, matching the existing BMW asset) and wire it into both `app/page.tsx` and `app/fleet/page.tsx`.
6. Do not use the earlier Gemini collage download; it contains multiple labeled panels and is not suitable as a site asset.
7. `fleet-bmw.png`: raw collage upload failed review (returned a narrow interior collage/blank panel). Cropped a clean lower-frame working crop, enhanced successfully, saved as `public/media/fleet-bmw-enhanced.png`.
8. `fleet-suv.png`: raw collage upload also failed review (returned an unrelated monochrome sunroof crop). Cropped a clean dashboard sub-frame at `public/media/fleet-suv-standalone.png` (removes the "CABIN INTERIOR AND DETAIL" caption), re-prompted, accepted result saved as `public/media/fleet-suv-enhanced.png`. This also replaced a broken leftover asset, `public/media/mercedes-glc-200d-enhanced.png` (an accidental UI screenshot, not a real enhancement) — deleted, both page files repointed to `fleet-suv-enhanced.png`.
9. `fleet-van.png`: cropped a clean parked three-quarter-view sub-frame at `public/media/fleet-van-standalone.png`. First two enhancement attempts recomposed/zoomed the frame, cropping out the wheels and front bumper — rejected. A corrective follow-up prompt (naming the exact problem, restating the 527:366 aspect ratio, forbidding zoom/pan/crop/recompose) produced an accepted result, saved as `public/media/fleet-van-enhanced.png` and wired into both page files.
10. Production build verified clean: `npm.cmd run build` compiles, type-checks, and statically exports all 5 routes with no errors.

## Tooling Note (2026-09-05)

- The Gemini browser automation from earlier sessions was done via a Playwright MCP server configured in VS Code's global Copilot MCP config (`C:\Users\njabu\AppData\Roaming\Code\User\mcp.json`), not in Claude Code.
- Claude Code (this tool) had no Playwright MCP server registered, so a fresh Claude Code session could not drive the browser. Fixed by running `claude mcp add playwright -s local -- npx @playwright/mcp@latest` in this project, which writes to the project's local scope in `~/.claude.json`.
- MCP servers only attach at session start, so a restart was required after adding it.

## Completed

- Next.js/React/TypeScript project is implemented.
- Routes `/`, `/fleet`, `/coverage`, and `/enquire` exist.
- Hero video remains excluded by design.
- Gemini produced a clean standalone hero enhancement.
- Verified hero asset: `public/media/hero-gemini-enhanced.jpg`.
- Hero background now references `hero-gemini-enhanced.jpg` in `app/globals.css`.
- BMW fleet enhancement is approved as `public/media/fleet-bmw-enhanced.png` and wired into `/` and `/fleet`.
- The approved BMW asset was validated as a readable `1241x864` image; app diagnostics are clean for both touched route files.
- Project memory and the project-local memory skill are enabled.

## Current Media

- Source images: `hero.png`, `fleet-bmw.png`, `fleet-suv.png`, `fleet-van.png`.
- Existing enhanced assets include `hero-enhanced.jpg` and `mercedes-glc-200d-enhanced.png`.
- The first multi-image Gemini result was downloaded as a collage and must not replace the source files.
- A later single-image BMW generation was inspected and rejected; `fleet-bmw.png` remains the unchanged source asset.
- `fleet-bmw-standalone.png` is the clean extracted source used for the accepted enhancement.

## Validation

- `get_errors` reported no errors for `app/globals.css` or `app/page.tsx` after the hero change.
- PowerShell blocked `npm run build` through the script wrapper.
- Use `npm.cmd run build` for the next production-build attempt; the previous run started Next.js compilation but did not return a final status.
- The latest `npm.cmd run build` and `cmd`-wrapped retry also started Next.js but returned no final status; no Node process remained running afterward.
- Static preview was previously available at `http://127.0.0.1:3000`.

## Important Constraints

- Preserve the editorial, spacious, restrained LunarTravel visual language.
- Prefer supplied reference assets before generating new imagery.
- Keep the homepage section order and dedicated routes intact.
- Validate responsive layout, keyboard access, form labels, alt text, and reduced motion before shipping.
- Never store credentials, tokens, or private authentication details in this file.
