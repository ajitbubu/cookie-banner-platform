# DESIGN.md — Consent platform design system

Extracted from the existing builder + the approved monitoring-dashboard design
(/design-html, 2026-06-15). Future `/design-*` runs calibrate against this.

## Principles
- Calm, data-dense, trustworthy. App-UI, not marketing. Subtraction default.
- One accent color; neutrals carry the layout. Thin borders over heavy shadows.
- White-label: the accent + logo are tenant-set tokens; never hardcode brand.

## Color tokens
| Token | Value | Use |
|-------|-------|-----|
| `--ink` | `#0f172a` | primary text |
| `--muted` | `#64748b` | secondary text, labels |
| `--line` | `#e2e8f0` | borders, dividers |
| `--surface` | `#f8fafc` | sidebar / inset surfaces |
| `--accent` | `#2563eb` | primary actions, active state, data fills — **white-label override** |
| `--ok` | `#16a34a` | healthy status |
| `--warn` | `#b45309` | stale / out-of-date status (AA on light) |
| bg | `#ffffff` | page background |

Banner (SDK) theme tokens are separate and per-client: `--cc-bg`, `--cc-fg`,
`--cc-accent`, `--cc-accent-fg`, `--cc-radius` (see src/presets.ts).

## Typography
- Family: **Inter** (400, 600), system sans fallback. No raw default stacks as the primary face.
- Body ≥ 16px. Labels 12-13px uppercase tracked for metric/section keys. H1 22px/600.
- Code/snippets: `ui-monospace, Menlo, monospace` on `--ink` background.

## Spacing & shape
- Spacing scale: 4 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 24 px.
- Radius: 8px (controls), 10px (cards), 50% (status dots), 10px pill (badges).
- Borders: 1px `--line`. Avoid drop-shadow cards; cards earn their existence.

## Component vocabulary
- **Metric tile**: bordered card, uppercase muted key + 26px/600 value.
- **Bar row**: 130px label · flex track (`#eef2f7`, 9px, radius 5) · solid `--accent` fill · right-aligned % .
- **Status dot + badge**: green/amber dot; pill badge (green "up to date" / amber "OUT OF DATE").
- **Primary button**: `--accent` bg, white text, radius 8, min-height 44.
- **Empty/first-run**: lead sentence + onboarding checklist + install snippet block + pulsing "waiting" indicator.

## Accessibility (required)
- Body contrast ≥ 4.5:1; data fills solid (no low-contrast tints).
- Interactive targets ≥ 44px; visible `:focus-visible` outlines (`--accent` or `--ink`).
- Semantic landmarks (`header`/`nav`/`main`), ARIA on charts, `prefers-reduced-motion` honored.

## Responsive
- Desktop-first operator tool. Breakpoints: ≤900px metrics 4→2 cols + charts stack; ≤680px sidebar stacks above main.
