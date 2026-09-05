# LunarTravel Project Memory

## Current State

- Next.js 15.5.2 app using React 19 and TypeScript.
- Homepage and routes `/fleet`, `/coverage`, and `/enquire` are implemented.
- The hero uses still imagery; do not reintroduce video.
- All fleet imagery (hero, BMW, SUV, van) is now Gemini-enhanced and wired into the UI: `public/media/hero-gemini-enhanced.jpg`, `fleet-bmw-enhanced.png`, `fleet-suv-enhanced.png`, `fleet-van-enhanced.png`, referenced from both `app/page.tsx` and `app/fleet/page.tsx`.
- Static preview behavior is intentional for now. Enquiry submission and production validation are not wired yet.
- Supplied Lunar reference assets should be preferred before generating new imagery.
- Raw fleet source stills (`fleet-bmw.png`, `fleet-suv.png`, `fleet-van.png`) are multi-panel screen-recording collages, not clean photos — see the working method in `.github/restore-point.md` before touching them again.

## Completed Work

- Established the Next.js project structure and scripts.
- Added editorial homepage styling and route pages.
- Added supplied logo and vehicle imagery under `public/media`.
- Added workspace Copilot instructions and README.
- Verified the static preview routes load during the previous session.
- Enhanced all three fleet vehicle stills (BMW, SUV, van) via the shared Gemini conversation, replacing a broken leftover asset (`mercedes-glc-200d-enhanced.png`, an accidental UI screenshot) that had been wired in for the SUV.
- Verified `npm.cmd run build` completes cleanly with the new imagery wired in.

## Next Actions

1. Reload the preview and compare all fleet imagery against the supplied layout references.
2. Validate responsive layout, keyboard access, form labels, alt text, and reduced motion.
3. Decide whether `/enquire` should remain a static preview or receive real validation and submission handling.

## Working Notes

- Keep this file concise and update it when architecture, workflow, or next actions materially change.
- Record decisions and blockers here rather than detailed turn-by-turn chat history.
