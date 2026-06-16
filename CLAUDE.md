# CLAUDE.md — cookie-banner-platform (Consent Studio)

## What this is
A client-only React + Vite visual builder for cookie consent banners ("Consent Studio").
You edit theme / text / categories / GTM / positioning / templates, **live-preview the real
SDK** in an origin-verified iframe, and export an install snippet. No backend, no accounts;
banners persist in `localStorage`.

This builder is **one piece of a larger platform vision** (internal client-delivery, not a
sold SaaS): build a banner here → generate a per-client SDK snippet → install on the client
site → consent events stream to a central monitoring dashboard. See the planning artifacts:
- Design doc: `~/.gstack/projects/ajitbubu-cookie-banner-platform/ajitsahu-main-design-*.md`
  (reframed to internal delivery; SaaS pricing/GTM sections superseded)
- `TODOS.md` (6 tracked compliance gaps: retention/DSAR, jurisdictions, offboarding, proof
  tamper-evidence, ingest-loss measurement, scanner upkeep)
- `DESIGN.md` (the shared design-token system)

### Locked platform decisions (from CEO + eng review)
- Per-client **generated SDK bundle** = thin stub: **baked styling/config + a hosted,
  versioned consent CORE** loaded from CDN, so compliance fixes patch all client sites at
  once (decision T1). The stub also declares the ingest endpoint.
- Consent ingestion: SDK **buffers + retries with an idempotency key** (no silent loss; 2A).
- Ingest endpoint: **per-site Origin allowlist + rate-limit + server-derived IP/geo** (3A).
- Dashboard reads **lightweight rollups** (`consent_daily`); raw `consent_events` kept,
  append-only + RLS, for proof export (4A).
- Build order (foundation-first): banner inventory + SDK → scanner → backend/ingest/dashboard.

## Run / test / build
```bash
npm install
npm run dev        # http://localhost:5173 (Vite, hot-reload)
npm run test       # vitest run
npm run typecheck  # tsc --noEmit  (the real gate)
npm run build      # tsc --noEmit && vite build
npm run preview
```
Note: `npm run lint` is wired to `eslint src` but **eslint is not installed** in devDeps —
lint does not run today. Typecheck + tests are the gate.

## Testing
- Framework: **vitest** (happy-dom). Tests live in `test/*.test.ts`.
- Prefer pure, testable functions (e.g. `src/templates.ts` `applyTemplate`, `src/lib/export.ts`)
  with unit tests over logic embedded in components.

## Architecture / conventions
- TypeScript strict; React 18; Tailwind CSS 4 (via `@tailwindcss/vite`, no PostCSS config).
- The SDK is a GitHub dependency: `@ajitbubu/cookie-banner-sdk` ← `github:ajitbubu/cookie-sdk`.
  Its types are the source of truth for the config model (`CookieConsentConfig`,
  `CategoryKey`, `CookieDef`). Import types from the package; never redeclare them.
- State: `src/store/banners.ts` — versioned localStorage envelope, autosave, fail-safe load.
- Panels: `src/panels/*` edit slices of the config; `App.tsx` owns state + section nav.
- Preview: `src/preview/*` — real SDK in an iframe via origin-verified `postMessage` + `update()`.
- Export: `src/lib/export.ts` — init snippet, GTM `<head>` block, config JSON, and the
  **platform** thin-stub snippet (`toPlatformSnippet`). `ExportModal.tsx` is the UI.
- Templates: `src/templates.ts` + `src/panels/TemplatesPanel.tsx` — the banner inventory;
  `applyTemplate` is non-destructive to cookie lists.
- The SDK has **no banner-layout field** (only `position`: top/bottom + button corner).
  Layout variants (bar/box/modal/slide-in) would require changes in the `cookie-sdk` repo.

## Skill routing
When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.
- Product ideas/brainstorming → /office-hours
- Strategy/scope → /plan-ceo-review
- Architecture → /plan-eng-review
- Design system/plan review → /design-consultation or /plan-design-review
- Bugs/errors → /investigate
- QA/testing site behavior → /qa or /qa-only
- Code review/diff check → /review
- Visual polish → /design-review
- Ship/deploy/PR → /ship or /land-and-deploy
