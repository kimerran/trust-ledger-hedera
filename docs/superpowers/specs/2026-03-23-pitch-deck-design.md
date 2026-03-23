# TrustLedger Pitch Deck — Design Spec

**Date:** 2026-03-23
**Status:** Approved
**Output:** `docs/pitch-deck/trustledger-pitch-deck.pdf`

---

## Context

Seed-stage investor pitch deck for TrustLedger. Audience: VCs and angel investors. Goal: communicate the problem, solution, and vision clearly enough to earn a follow-up meeting. No specific ask amount — "raising a seed round." Solo founder. Pre-launch, vision stage.

---

## Decisions

| Area | Choice | Rationale |
|------|--------|-----------|
| Generation method | HTML → Puppeteer PDF | Full CSS design control, brand-consistent, fully local |
| Visual style | Dark Tech | Near-black + teal glow; signals enterprise security credibility |
| Slide count | 10 | Classic seed deck arc — no padding, no filler |
| Aspect ratio | 16:9 | Standard presentation format; renders cleanly as PDF |
| Font | System sans-serif stack | No external font dependency; clean on all platforms |

---

## Design System

### Colors
| Token | Value | Use |
|-------|-------|-----|
| Background | `#0A0F0E` | Slide background |
| Surface | `#111816` | Secondary panels, stat boxes |
| Primary accent | `#5ECFBF` | Headings, dividers, bullet dots, glows |
| Accent muted | `rgba(94,207,191,0.15)` | Subtle surface fills |
| Border | `rgba(94,207,191,0.15)` | Card/box borders |
| Text primary | `#FFFFFF` | Slide titles |
| Text secondary | `rgba(255,255,255,0.65)` | Body copy |
| Text muted | `rgba(255,255,255,0.35)` | Labels, captions, slide numbers |

### Typography
- Slide number label: `8px`, teal, `letter-spacing: 2px`, `text-transform: uppercase`, `font-weight: 600`
- Slide title: `20–24px`, white, `font-weight: 800`, `letter-spacing: -0.5px`
- Body copy: `9–10px`, secondary white, `line-height: 1.6`
- Stat values: `14–16px`, teal, `font-weight: 800`

### Layout
- Slide size: `1280 × 720px` (16:9)
- Slide padding: `28px 36px`
- Glow effect: `radial-gradient` top-right `rgba(94,207,191,0.12)`, 180px diameter
- Divider: `32px × 2px`, `linear-gradient(90deg, #5ECFBF, transparent)`

### Recurring elements
- **Slide number label** top-left on every content slide (e.g. `01 / Problem`)
- **Slide footer** bottom-right: small muted label with slide name
- **Teal glow** top-right on every slide (CSS `position: absolute` radial gradient)
- **Logo mark** on cover: bordered square with teal inner square

---

## Slide Structure

### Slide 1 — Cover
- TrustLedger logo mark + wordmark
- Headline: "The compliance layer for enterprise AI."
- Sub-tagline: "Cryptographic audit trails · Hedera blockchain · AWS KMS"
- Footer: "Seed Round" pill badge + year

### Slide 2 — The Problem
- Label: `01 / Problem`
- Title: "AI makes decisions. Nobody can prove what happened."
- 3 bullet points:
  1. Volume of AI-driven decisions in regulated industries with no verifiable trail
  2. EU AI Act (2025), SEC AI guidance, NIST AI RMF — regulatory pressure is live
  3. When a decision is challenged, there's no tamper-proof evidence to defend it
- 3 stat boxes at the bottom (market size, EU AI Act year, "0 crypto-anchored solutions")

### Slide 3 — The Solution
- Label: `02 / Solution`
- Title: "TrustLedger: an immutable audit trail for every AI decision."
- 3 value proposition bullets:
  1. Every AI decision hashed, signed (AWS KMS), and anchored on Hedera HCS
  2. Three-layer verification: hash integrity + signature + HCS sequence number
  3. Public verifiability — any party can verify independently, no trust required
- Small "live product" callout box at bottom

### Slide 4 — How It Works
- Label: `03 / How It Works`
- Title: "Three layers. One tamper-proof record."
- 4-step pipeline: AI Decision → Hash + Sign → HCS Anchor → Verify
- Each step: icon, bold label, 1-sentence description
- Bottom callout: "Zero trust required — verification is fully independent and cryptographically guaranteed"

### Slide 5 — Why Now
- Label: `04 / Why Now`
- Title: "Regulation caught up. Enterprises must act now."
- **3-column layout** (one column per regulation):
  - EU AI Act (2025): mandatory explainability for high-risk AI
  - SEC AI Guidance: investment AI must maintain records
  - NIST AI RMF: risk management framework adopted by US agencies
- Each column: regulation name as header, 1–2 sentence description, year badge
- Closing line below columns: "The compliance window is open — enterprises are looking for solutions today"

### Slide 6 — Market
- Label: `05 / Market`
- Title: "A large market with no dominant player."
- **3-column layout** (TAM / SAM / SOM as stat-style cards — consistent with Slide 2 stat boxes):
  - TAM: AI governance & compliance software ($X B, source TBD)
  - SAM: Enterprises in regulated industries (finance, healthcare, insurance) using AI
  - SOM: Early beachhead — mid-market compliance-focused companies
- Each column: label, large teal number/value, 1-sentence description
- Note: market size figures to be filled in by founder before distribution

### Slide 7 — Product
- Label: `06 / Product`
- Title: "Built and working today."
- Two-column layout:
  - Left: bullet list of capabilities (real-time dashboard, 3-layer verification, public verify URL, retention policies, HCS anchoring)
  - Right: styled text block simulating a terminal/dashboard readout — placeholder text showing a decision record (decision ID, risk score, HCS sequence number, status: VERIFIED). Founder does not need to fill this in; it is illustrative.
- Bottom: "Try it: [demo URL]" (placeholder — founder to fill)

### Slide 8 — Business Model
- Label: `07 / Business Model`
- Title: "SaaS pricing that scales with usage."
- 2–3 tier cards:
  - Starter: per-decision pricing (pay-as-you-go)
  - Professional: monthly seat license + audit exports
  - Enterprise: custom retention policies + dedicated HCS topic + SLA
- Bottom note: "Land with compliance teams, expand to all AI workloads"

### Slide 9 — Founder
- Label: `08 / Founder`
- Title: "[Founder Name]"
- 2–3 credibility bullets (placeholder — founder to fill)
- "Why me" closing line: 1 sentence on unique insight or background
- Note: solo founder; deck compensates with strong product evidence

### Slide 10 — The Ask
- Label: `09 / The Ask`
- Title: "Raising a seed round."
- Use of funds: 4 bullets (product development, go-to-market, infrastructure, first hire)
- Contact block at bottom: name, email, website
- Optional: Hedera/AWS partner logos if applicable

---

## Implementation

### File structure
```
docs/pitch-deck/
  generate.js          # Puppeteer script: renders slides.html → PDF
  slides.html          # All 10 slides as a single HTML file
  trustledger-pitch-deck.pdf  # Final output (gitignored)
```

### Generation approach
- `slides.html` contains all 10 slides as `<div class="slide">` blocks
- CSS uses `@page { size: 1280px 720px; margin: 0; }` and `page-break-after: always`
- Puppeteer launches headless Chrome, loads the file, exports PDF
- `page.pdf()` must be called with `{ width: '1280px', height: '720px', printBackground: true }` — the explicit width/height overrides any OS default and ensures the CSS `@page` size is honoured across Puppeteer versions
- Script: `node docs/pitch-deck/generate.js` → outputs PDF

### Dependencies
- `puppeteer` (Node) — added to a **standalone `docs/pitch-deck/package.json`** to avoid touching the monorepo workspace config. Run `npm install` inside `docs/pitch-deck/` before generating.
- No other dependencies — all design is pure CSS, no external fonts or images

### Placeholders (founder to fill before sending)
- Market size figures (Slide 6 TAM/SAM/SOM)
- Founder name and bio bullets (Slide 9)
- Demo URL (Slide 7)
- Contact details (Slide 10)

---

## Out of Scope

- Animations or transitions (PDF is static)
- Dark/light mode toggle
- Interactive HTML version
- Speaker notes
- Custom typeface (avoids font loading complexity)
