# Consent Studio — cookie banner builder

A static, client-only visual builder for [cookie-banner-sdk](https://github.com/ajitbubu/cookie-sdk).
Edit theme / text / categories / GTM / positioning, **live-preview the real SDK** (rendered
in an iframe — true WYSIWYG, not a mockup), and export a ready-to-paste install snippet.
No backend, no accounts — banners are saved in your browser's localStorage.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

`npm test` (Vitest), `npm run typecheck`, `npm run build`.

## How it works

```
 Editor panels ──postMessage(config)──▶ preview iframe ──▶ real SDK (destroy+init)
 (theme/text/…)                          (origin-verified,     renders the banner
        │                                 consent reset each    you're editing)
        ▼ localStorage (versioned)        render, debounced)
 Export ──▶ config JSON · init snippet · GTM-ready <head> (bootstrap→GTM→SDK)
```

- **Live preview** is the actual shipped SDK in an isolated iframe — what you see is what
  ships. The harness clears consent before each render so the banner always shows; toggle
  "Returning" to preview the post-consent floating button.
- **Contrast badges** check WCAG AA on the *effective* colors as you pick them.
- **Export** produces the config JSON, a minimal `init()` snippet, and the full GTM-ready
  `<head>` block with the scripts in the correct order (bootstrap → GTM → SDK).
- **Multiple banners** with rename / delete / JSON import / download.

## SDK dependency

The builder consumes the SDK for both its TypeScript types (form typing) and the preview
bundle. Today it uses a local sibling checkout:

```json
"cookie-banner-sdk": "file:../cookie-banner-sdk"
```

So local dev needs `../cookie-banner-sdk` checked out and built (`npm run build` there).

**Before CI / deploy:** the `file:` dependency won't resolve on a CI runner (the SDK is a
separate repo). Switch it to a published package or a git URL once the SDK is available:

- npm (preferred): publish the SDK under a scoped name you own, e.g.
  `@ajitbubu/cookie-banner-sdk`, then `"@ajitbubu/cookie-banner-sdk": "^x.y.z"`.
  (The bare name `cookie-banner-sdk` is already taken on npm.)
- git: `"cookie-banner-sdk": "github:ajitbubu/cookie-sdk#<tag>"` (the SDK repo commits
  its `dist/`, so a git install works without a build step) — requires the latest SDK
  commits (positioning, theme vars, type exports) to be pushed first.

Then add a CI workflow (typecheck + test + build) and deploy the static `dist/` to
Vercel / Netlify / GitHub Pages.

## Status

Built: editor shell, all panels (Theme, Text, Categories, GTM, Positioning, Presets),
live preview, export, multi-banner management, versioned store. Not yet: CI + deploy
(blocked on the SDK dependency above), full a11y audit, AI-generated mockups.
