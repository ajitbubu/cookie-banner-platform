# TODOS

Tracked work deferred from reviews. Surfaced by `/plan-ceo-review` (2026-06-14, outside-voice gaps).

## P1 — compliance-critical (address during build)

### Consent retention / deletion / DSAR path
- **What:** Lifecycle for stored consent records: retention window, automatic deletion, and on-request erasure (GDPR data-subject access/deletion).
- **Why:** You store consent + IP/geo centrally. GDPR requires retention limits and erasure on request. A compliance product that can't delete a record on request is itself non-compliant.
- **Context:** `consent_events` is append-only (good for proof) — reconcile append-only with erasure (e.g. crypto-shredding, or tombstone + purge job). Decide retention default (design doc says consent lifetime + 24-month audit window).
- **Effort:** M (human) → S (CC). **Priority:** P1. **Blocks:** going live with real EU client data.

### Jurisdiction coverage definition
- **What:** Define which regimes "compliant" means (GDPR/ePrivacy opt-in, CCPA/CPRA opt-out, others) and encode the per-region banner behavior.
- **Why:** "Compliant" is meaningless without naming jurisdictions. Opt-in vs opt-out defaults differ by region; clients will demand specific markets.
- **Context:** SDK already has GPC + a regulation-mode baseline noted in the design doc. Multi-jurisdiction is the harder axis than multi-tenant.
- **Effort:** L → M. **Priority:** P1. **Depends on:** consent-core (the patchable logic from T1).

### Client offboarding
- **What:** Defined exit: a departed client's SDK still phones home; decide whether to keep ingesting, disable via origin-allowlist removal (banner breaks silently), and how their stored consent data is handed over/deleted.
- **Why:** Baked bundles keep calling your ingest after the relationship ends. You either ingest for a non-customer or break their site silently. Both are bad.
- **Context:** Tie to origin-allowlist (3A) and retention/DSAR. Offboarding should export their data + cleanly stop ingest.
- **Effort:** M → S. **Priority:** P1.

## P2 — integrity & operations

### Proof tamper-evidence
- **What:** Make the consent log evidentiary: append-only enforced at DB grant level, plus a tamper-evidence path (hash chain / signing / WORM) before calling it "proof."
- **Why:** "Proof" only matters if a record is immutable and admissible. Append-only-by-convention isn't enough if challenged.
- **Context:** Design doc defers crypto-signing to v2; until then market it as a "consent log," not tamper-evident "proof."
- **Effort:** M → S. **Priority:** P2.

### Ingest-loss measurement
- **What:** Instrument and report the real consent-beacon delivery rate; adblockers/Brave/uBlock/ITP/CSP silently drop a fraction of POSTs to a custom endpoint.
- **Why:** The buffer (2A) doesn't help if the request never leaves the browser. An unmeasured loss rate undermines the monitoring/proof claim.
- **Context:** Use `navigator.sendBeacon`, a first-party subpath where possible, and a sampling/health signal to estimate loss. Prove reliability on ONE real client before onboarding many.
- **Effort:** M → S. **Priority:** P2.

### Scanner categorization upkeep
- **What:** A process to keep the scanner's cookie/tracker categorization current as vendors and laws change.
- **Why:** A home-built scanner is point-in-time; the maintained database is the main reason buying (Cookiebot) usually wins. Unstaffed upkeep = drifting accuracy.
- **Context:** Seed from Open Cookie Database; decide a refresh cadence/source. This is recurring, unglamorous, and currently unowned.
- **Effort:** L (ongoing) → M. **Priority:** P2.

## Noted (decided, not a TODO)
- Build-vs-buy: raised in CEO review; founder chose to build on conviction without the N-model (T2=B). Recorded, not tracked.
