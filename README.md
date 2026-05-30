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
bundle. It installs the SDK straight from GitHub:

```json
"cookie-banner-sdk": "git+https://github.com/ajitbubu/cookie-sdk.git"
```

The SDK repo commits its `dist/` (and `files: ["dist"]` includes it), so a plain
`npm install` gets the prebuilt bundle + types — **no local sibling, no build step,
no npm login.** A fresh clone of this repo builds on its own.

**CI / HTTPS note:** npm canonicalizes the lockfile entry to `git+ssh://git@github.com/...`
(a known npm quirk for github URLs). On a dev box with GitHub SSH configured this is
transparent. On a pure-HTTPS CI runner (no SSH key), add one line before `npm ci`:

```bash
git config --global url."https://github.com/".insteadOf "git@github.com:"
```

(cookie-sdk is public, so HTTPS clones anonymously.) To pin a specific SDK version, append
`#<tag-or-sha>` to the URL.

When the SDK is eventually published to npm (under a scoped name like
`@ajitbubu/cookie-banner-sdk` — the bare name is taken), switch the dependency to the
semver range and drop the git URL.

## Status

Built: editor shell, all panels (Theme, Text, Categories, GTM, Positioning, Presets),
live preview, export, multi-banner management, versioned store. SDK sourced from GitHub
(builds from a clean clone). Not yet: CI + static deploy, full a11y audit, AI mockups,
deferred code-review polish (returning-preview defaults, NaN-guard, live-update perf).
