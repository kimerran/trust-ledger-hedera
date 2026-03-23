# Web App Teal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the same teal visual redesign from `apps/demo` to `apps/web` — same color tokens, soft-shadow cards, teal nav, and improved component styling. Pure visual layer, zero functional changes.

**Architecture:** Same HSL token system as demo. Token update in globals.css propagates most changes automatically; explicit class overrides needed for soft shadows, left-accent borders in VerificationLayers, and page heading colors. No new dependencies.

**Tech Stack:** Next.js 14, Tailwind CSS, shadcn/ui, HSL CSS custom properties.

---

## Design Reference

All color values come from the approved demo redesign spec at `docs/superpowers/specs/2026-03-23-demo-redesign-design.md`.

Key values used throughout:
- `#0D5752` — primary teal (headings, badges, active states)
- `#E0F2F1` — muted teal (callout backgrounds, card borders)
- `#B2DFDB` — border teal
- `#5F9EA0` — muted foreground (secondary text)
- `#F0FAFA` — background tint (body, code areas, inputs)
- Soft shadow: `shadow-[0_4px_16px_rgba(13,87,82,0.10)]`
- Button shadow: `shadow-[0_2px_6px_rgba(13,87,82,0.3)]`

---

## Files Changed

| File | Change |
|------|--------|
| `apps/web/app/globals.css` | Token values updated (same as demo) |
| `apps/web/app/layout.tsx` | Nav border color, logo teal color |
| `apps/web/components/StatsBar.tsx` | Soft shadow on stat cards |
| `apps/web/components/LiveFeed.tsx` | Teal border on event rows |
| `apps/web/components/AuditTable.tsx` | Filter input teal border/bg |
| `apps/web/components/VerificationLayers.tsx` | Left accent border per row, remove PASS/FAIL badge |
| `apps/web/app/dashboard/page.tsx` | Heading teal, Live Feed card shadow |
| `apps/web/app/audit/page.tsx` | Heading teal |
| `apps/web/app/models/page.tsx` | Heading teal, card shadow |
| `apps/web/app/login/page.tsx` | Card shadow, button shadow |
| `apps/web/app/verify/[id]/page.tsx` | "What is this?" callout teal, card shadow |
| `apps/web/app/audit/[id]/page.tsx` | Card shadows, LLM callout teal, params pre bg |

---

## Task 1: Color Tokens

**Files:**
- Modify: `apps/web/app/globals.css`

- [ ] **Step 1: Update the 7 light-mode HSL tokens**

Replace the existing `:root` block with:

```css
:root {
  --background: 166 60% 97%;
  --foreground: 0 0% 5%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 5%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 5%;
  --primary: 177 94% 19%;
  --primary-foreground: 0 0% 100%;
  --secondary: 176 30% 95%;
  --secondary-foreground: 176 62% 18%;
  --muted: 166 60% 94%;
  --muted-foreground: 177 30% 50%;
  --accent: 176 30% 93%;
  --accent-foreground: 165 77% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 100%;
  --border: 176 35% 83%;
  --input: 176 35% 83%;
  --ring: 177 94% 19%;
  --radius: 0.5rem;
}
```

Dark mode tokens are unchanged — leave `.dark` block as-is.

- [ ] **Step 2: Build to verify no errors**

```bash
cd /path/to/repo && pnpm --filter web build
```

Expected: `✓ Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/globals.css
git commit -m "style(web): refine teal color tokens for warmer palette"
```

---

## Task 2: Nav Layout

**Files:**
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Apply teal border and logo color to nav**

Current nav:
```tsx
<nav className="border-b">
  <div className="container flex h-16 items-center gap-6">
    <a href="/dashboard" className="font-semibold text-lg">
      TrustLedger
    </a>
```

Change to:
```tsx
<nav className="border-b border-[#B2DFDB] bg-white">
  <div className="container flex h-16 items-center gap-6">
    <a href="/dashboard" className="font-bold text-lg text-[#0D5752]">
      TrustLedger
    </a>
```

No other changes to layout.tsx.

- [ ] **Step 2: Build to verify**

```bash
pnpm --filter web build
```

Expected: `✓ Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/layout.tsx
git commit -m "style(web): teal nav border and logo color"
```

---

## Task 3: StatsBar and LiveFeed

**Files:**
- Modify: `apps/web/components/StatsBar.tsx`
- Modify: `apps/web/components/LiveFeed.tsx`

### StatsBar

- [ ] **Step 1: Add soft shadow to stat cards**

In `StatsBar.tsx`, find:
```tsx
<Card key={s.label}>
```

Change to:
```tsx
<Card key={s.label} className="border border-[#E0F2F1] shadow-[0_4px_16px_rgba(13,87,82,0.10)]">
```

No other changes.

### LiveFeed

- [ ] **Step 2: Update event row border color**

In `LiveFeed.tsx`, find:
```tsx
<li key={i} className="flex items-start gap-3 text-sm border-b pb-2">
```

Change to:
```tsx
<li key={i} className="flex items-start gap-3 text-sm border-b border-[#E0F2F1] pb-2">
```

- [ ] **Step 3: Build to verify**

```bash
pnpm --filter web build
```

Expected: `✓ Compiled successfully`

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/StatsBar.tsx apps/web/components/LiveFeed.tsx
git commit -m "style(web): soft shadow stat cards, teal event row border"
```

---

## Task 4: AuditTable

**Files:**
- Modify: `apps/web/components/AuditTable.tsx`

- [ ] **Step 1: Update filter input to teal styling**

In `AuditTable.tsx`, find the `<input>` element with `className`:
```tsx
className="w-full max-w-sm px-3 py-2 rounded-md border bg-background text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
```

Change to:
```tsx
className="w-full max-w-sm px-3 py-2 rounded-md border border-[#B2DFDB] bg-[#F0FAFA] text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
```

No other changes to AuditTable.tsx — table rows use token-driven classes that update automatically.

- [ ] **Step 2: Build to verify**

```bash
pnpm --filter web build
```

Expected: `✓ Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/AuditTable.tsx
git commit -m "style(web): teal border and bg on audit table filter input"
```

---

## Task 5: VerificationLayers

**Files:**
- Modify: `apps/web/components/VerificationLayers.tsx`

This is the most significant component change. Replace the `LayerRow` PASS/FAIL badge with a left accent border treatment, matching the pattern used in the demo's `VerificationLayerCard`.

- [ ] **Step 1: Rewrite LayerRow to use left accent border**

Current `LayerRow`:
```tsx
function LayerRow({
  label,
  pass,
  detail,
}: {
  label: string;
  pass: boolean;
  detail: string;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <span className={`mt-0.5 text-lg ${pass ? 'text-green-500' : 'text-red-500'}`}>
        {pass ? '\u2713' : '\u2717'}
      </span>
      <div className="flex-1">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground font-mono mt-0.5 break-all">{detail}</p>
      </div>
      <Badge variant={pass ? 'success' : 'destructive'}>{pass ? 'PASS' : 'FAIL'}</Badge>
    </div>
  );
}
```

Replace with:
```tsx
function LayerRow({
  label,
  pass,
  detail,
}: {
  label: string;
  pass: boolean;
  detail: string;
}) {
  return (
    <div className={`flex items-start gap-3 py-3 border-b border-[#E0F2F1] last:border-0 pl-3 border-l-4 ${pass ? 'border-l-emerald-500' : 'border-l-red-400'}`}>
      <span className={`mt-0.5 font-bold text-sm ${pass ? 'text-emerald-600' : 'text-red-500'}`}>
        {pass ? '\u2713' : '\u2717'}
      </span>
      <div className="flex-1">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground font-mono mt-0.5 break-all">{detail}</p>
      </div>
    </div>
  );
}
```

Note: The `Badge` import may still be needed for the overall result badge in `VerificationLayers`. Do NOT remove the Badge import.

- [ ] **Step 2: Update the outer Card border**

In `VerificationLayers`, find:
```tsx
<Card>
```

Change to:
```tsx
<Card className="border border-[#E0F2F1] shadow-[0_4px_16px_rgba(13,87,82,0.10)] overflow-hidden">
```

- [ ] **Step 3: Build to verify**

```bash
pnpm --filter web build
```

Expected: `✓ Compiled successfully`

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/VerificationLayers.tsx
git commit -m "style(web): left accent border on verification layer rows"
```

---

## Task 6: Login and Public Verify Pages

**Files:**
- Modify: `apps/web/app/login/page.tsx`
- Modify: `apps/web/app/verify/[id]/page.tsx`

### Login page

- [ ] **Step 1: Add soft shadow to login card**

In `login/page.tsx`, find:
```tsx
<Card className="w-full max-w-sm">
```

Change to:
```tsx
<Card className="w-full max-w-sm border border-[#E0F2F1] shadow-[0_4px_16px_rgba(13,87,82,0.10)]">
```

- [ ] **Step 2: Add shadow to sign-in button**

Find:
```tsx
<Button type="submit" disabled={loading} className="w-full">
```

Change to:
```tsx
<Button type="submit" disabled={loading} className="w-full shadow-[0_2px_6px_rgba(13,87,82,0.3)]">
```

### Public Verify page

- [ ] **Step 3: Update "What is this?" card to teal callout**

In `verify/[id]/page.tsx`, find:
```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-base">What is this?</CardTitle>
  </CardHeader>
  <CardContent className="text-sm text-muted-foreground">
```

Change to:
```tsx
<Card className="bg-[#E0F2F1] border border-[#B2DFDB]">
  <CardHeader>
    <CardTitle className="text-base text-[#0D5752]">What is this?</CardTitle>
  </CardHeader>
  <CardContent className="text-sm text-[#0D5752]">
```

- [ ] **Step 4: Build to verify**

```bash
pnpm --filter web build
```

Expected: `✓ Compiled successfully`

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/login/page.tsx apps/web/app/verify/[id]/page.tsx
git commit -m "style(web): soft shadow login card, teal callout on public verify page"
```

---

## Task 7: Dashboard, Audit List, and Models Pages

**Files:**
- Modify: `apps/web/app/dashboard/page.tsx`
- Modify: `apps/web/app/audit/page.tsx`
- Modify: `apps/web/app/models/page.tsx`

### Dashboard

- [ ] **Step 1: Teal heading and card shadow on Live Feed card**

In `dashboard/page.tsx`, find:
```tsx
<h1 className="text-3xl font-bold">Dashboard</h1>
```
Change to:
```tsx
<h1 className="text-3xl font-bold text-[#0D5752]">Dashboard</h1>
```

Find:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Live Event Feed</CardTitle>
  </CardHeader>
```
Change to:
```tsx
<Card className="border border-[#E0F2F1] shadow-[0_4px_16px_rgba(13,87,82,0.10)]">
  <CardHeader>
    <CardTitle className="text-[#0D5752]">Live Event Feed</CardTitle>
  </CardHeader>
```

### Audit list

- [ ] **Step 2: Teal heading on audit page**

In `audit/page.tsx`, find:
```tsx
<h1 className="text-3xl font-bold">Audit Log</h1>
```
Change to:
```tsx
<h1 className="text-3xl font-bold text-[#0D5752]">Audit Log</h1>
```

### Models

- [ ] **Step 3: Teal heading and card shadow on models page**

In `models/page.tsx`, find:
```tsx
<h1 className="text-3xl font-bold">Model Registry</h1>
```
Change to:
```tsx
<h1 className="text-3xl font-bold text-[#0D5752]">Model Registry</h1>
```

Find:
```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-base">Registered Models</CardTitle>
  </CardHeader>
```
Change to:
```tsx
<Card className="border border-[#E0F2F1] shadow-[0_4px_16px_rgba(13,87,82,0.10)]">
  <CardHeader>
    <CardTitle className="text-base text-[#0D5752]">Registered Models</CardTitle>
  </CardHeader>
```

- [ ] **Step 4: Build to verify**

```bash
pnpm --filter web build
```

Expected: `✓ Compiled successfully`

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/dashboard/page.tsx apps/web/app/audit/page.tsx apps/web/app/models/page.tsx
git commit -m "style(web): teal headings and card shadows on dashboard, audit, models"
```

---

## Task 8: Audit Drilldown Page

**Files:**
- Modify: `apps/web/app/audit/[id]/page.tsx`

This page has the most cards and the LLM Risk Assessment callout box.

- [ ] **Step 1: Teal heading**

Find:
```tsx
<h1 className="text-2xl font-bold mt-2 font-mono">{decision.id}</h1>
```
Change to:
```tsx
<h1 className="text-2xl font-bold mt-2 font-mono text-[#0D5752]">{decision.id}</h1>
```

- [ ] **Step 2: Soft shadow on Decision Details and Cryptographic Proof cards**

There are two `<Card>` elements in the `<div className="grid gap-4 sm:grid-cols-2">`. Both get the same treatment:

```tsx
<Card className="border border-[#E0F2F1] shadow-[0_4px_16px_rgba(13,87,82,0.10)]">
```

- [ ] **Step 3: Restyle the LLM Risk Assessment callout to teal**

Current:
```tsx
<Card className="border-primary/30 bg-primary/[0.03]">
  <CardHeader className="flex flex-row items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="text-lg">{'\u2726'}</span>
      <CardTitle className="text-base">LLM Risk Assessment</CardTitle>
    </div>
    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
      Powered by Claude Haiku
    </span>
```

Change to:
```tsx
<Card className="bg-[#E0F2F1] border border-[#B2DFDB]">
  <CardHeader className="flex flex-row items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="text-lg text-[#0D5752]">{'\u2726'}</span>
      <CardTitle className="text-base text-[#0D5752]">LLM Risk Assessment</CardTitle>
    </div>
    <span className="text-[10px] text-[#5F9EA0] bg-white/60 px-2 py-0.5 rounded-full">
      Powered by Claude Haiku
    </span>
```

- [ ] **Step 4: Update Parameters card**

Find:
```tsx
<Card>
  <CardHeader>
    <CardTitle className="text-base">Parameters</CardTitle>
  </CardHeader>
  <CardContent>
    <pre className="text-xs overflow-auto">
```

Change to:
```tsx
<Card className="border border-[#E0F2F1] shadow-[0_4px_16px_rgba(13,87,82,0.10)]">
  <CardHeader>
    <CardTitle className="text-base text-[#0D5752]">Parameters</CardTitle>
  </CardHeader>
  <CardContent>
    <pre className="text-xs overflow-auto bg-[#F0FAFA] rounded-md p-3">
```

- [ ] **Step 5: Build to verify**

```bash
pnpm --filter web build
```

Expected: `✓ Compiled successfully`

- [ ] **Step 6: Commit**

```bash
git add apps/web/app/audit/[id]/page.tsx
git commit -m "style(web): card shadows, teal LLM callout, and teal headings on audit drilldown"
```

---

## Final Verification

After all 8 tasks:

```bash
pnpm --filter web build
```

Expected: `✓ Compiled successfully` with all 8 routes generated cleanly.

Visual spot-check at http://localhost:3000:
- [ ] Login page: card has soft teal shadow
- [ ] Dashboard: teal heading, stat cards with shadow, live feed card teal
- [ ] Audit list: teal heading, filter input with teal border
- [ ] Audit drilldown: teal heading, all cards shadowed, LLM callout in teal
- [ ] Models: teal heading, table card shadowed
- [ ] Public verify (/verify/[id]): "What is this?" in teal callout box
- [ ] VerificationLayers: left accent border (emerald for pass, red for fail), no PASS/FAIL badge
