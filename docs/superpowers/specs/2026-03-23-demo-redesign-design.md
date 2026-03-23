# TrustLedger Demo App — UI Redesign Spec

**Date:** 2026-03-23
**Scope:** `apps/demo` only
**Status:** Approved

---

## Decisions

| Area | Choice | Rationale |
|------|--------|-----------|
| Color palette | Teal Refined | Keep existing brand, improve contrast and warmth |
| Pipeline indicator | Pill Badges | Readable at a glance, modern, horizontally compact |
| Step cards | Soft Shadow | Lifted feel, inline step badge, clear hierarchy |

---

## Color Tokens (`apps/demo/app/globals.css`)

Replace current CSS variables with refined teal values. All changes stay within the existing HSL token system.

| Token | Current | New | Note |
|-------|---------|-----|------|
| `--background` | `0 0% 100%` | `166 60% 97%` | Very light teal tint |
| `--card` | `0 0% 100%` | `0 0% 100%` | Pure white (unchanged) |
| `--primary` | `177 94% 21%` | `177 94% 19%` | Slightly deeper `#0D5752` |
| `--border` | `176 20% 90%` | `176 35% 83%` | More visible `#B2DFDB` |
| `--input` | `176 20% 90%` | `176 35% 83%` | Match `--border` (textarea border uses this token) |
| `--muted` | `176 20% 95%` | `166 60% 94%` | Warmer teal tint `#E0F2F1` |
| `--muted-foreground` | `177 23% 53%` | `177 30% 50%` | Better contrast `#5F9EA0` |
| `--ring` | `177 94% 21%` | `177 94% 19%` | Matches primary |

Add semantic utility classes via Tailwind config or inline for:
- `text-success` → `#10B981` (emerald, completed pipeline stages)
- `border-success` → `#86EFAC`
- `bg-success-subtle` → `#DCFCE7`

---

## Layout (`apps/demo/app/layout.tsx`)

- **Nav:** White bg, `border-b border-[#B2DFDB]`. Height stays `h-14`.
- **"DEMO" label:** Change from plain `text-muted-foreground` span to a pill badge: `bg-[#E0F2F1] text-[#0D5752] text-[10px] font-semibold px-2 py-0.5 rounded-full ml-2`.
- **Body background:** `bg-[#F0FAFA]` (matches `--background` token above).
- **Main container:** Keep `max-w-4xl mx-auto px-4 py-8`.

---

## PipelineIndicator (`apps/demo/components/StepIndicator.tsx`)

Full replacement of the circle-number approach with pill badges.

### Structure
```
[✓ AI Decision] — [✓ Hash & Sign] — [● On-Chain] — [Verify] — [Proof]
                    Step 3 of 5 — HCS Anchor
```

### Pill states
| State | Classes |
|-------|---------|
| Done | `bg-emerald-100 border border-emerald-300 text-emerald-700 font-semibold` + `✓` prefix |
| Active | `bg-[#0D5752] text-white font-semibold shadow-[0_2px_8px_rgba(13,87,82,0.35)]` + `●` prefix |
| Pending | `bg-[#E0F2F1] border border-[#B2DFDB] text-[#80A89E]` |

### Connector
Thin `h-px w-3 bg-[#B2DFDB] flex-shrink-0` line between pills.

### Subtitle
Below the pill row: `text-[10px] text-[#5F9EA0] text-center mt-2`
Text: `Step {activeStage + 1} of 5 — {PIPELINE_STAGES[activeStage].label}` (1-based; only rendered when `activeStage >= 0`).

### Props (unchanged)
```ts
interface PipelineIndicatorProps {
  completedStages: number;  // 0–5
  activeStage: number;      // -1 if none
}
```

---

## Step Cards

### Card component wrapper (all Step*.tsx files)

Apply to the outer `<Card>` in each step:
```
className="border border-[#E0F2F1] rounded-xl shadow-[0_4px_16px_rgba(13,87,82,0.10)]"
```

### CardHeader treatment

Each step card header gets:
1. A small step label above the title: `<p className="text-[10px] font-bold uppercase tracking-widest text-[#5F9EA0] mb-1">Step {n} of 5</p>`
2. Title row: inline flex with a rounded step badge + title text
   - Badge: `w-6 h-6 rounded-md bg-[#0D5752] text-white flex items-center justify-center text-xs font-bold shrink-0`
   - Title: `text-[#0D5752] font-bold` (unchanged size)
3. Description: `text-[#5F9EA0]` (same as current `text-muted-foreground` once token updated)

### Info callout boxes

Replace hardcoded color classes with consistent teal callouts in all step files that contain them:

| Current | New | Appears in |
|---------|-----|------------|
| `bg-muted/50` info boxes | `bg-[#E0F2F1] border border-[#B2DFDB] text-[#0D5752]` | StepWelcome, StepAnchor, StepVerify |
| Blue info box | Same teal treatment | StepAnchor |
| Red error box | Keep `bg-red-50 border-red-200 text-red-800` | Wizard.tsx |
| Green success box | Keep `bg-green-50 border-green-200 text-green-800` | StepProof |
| Yellow partial-verify box | Keep `bg-yellow-50 border-yellow-200 text-yellow-800` | StepVerify |

### Textarea input (StepSubmit)

The editable JSON textarea uses `bg-muted/30`. Change to `bg-[#F0FAFA]` to align with the new background token.

### Buttons

Primary button already uses `bg-primary`. Add `shadow-[0_2px_6px_rgba(13,87,82,0.3)]` for the main CTA buttons in each step (Submit, Verify, Fetch Proof, Begin Demo).

---

## VerificationLayerCard (`apps/demo/components/VerificationLayerCard.tsx`)

Replace "PASS" / "FAIL" text label with:
- Left accent border: `border-l-4` — `border-emerald-500` (pass) or `border-red-400` (fail)
- Icon + label row: `✓ Layer 1: Hash Match` in emerald, `✗ Layer 3: HCS Anchor` in red
- Remove `border-2` outer border variant; use `border border-[#E0F2F1]` uniformly + the left accent

---

## CodeBlock (`apps/demo/components/CodeBlock.tsx`)

- Remove the `copyButton` prop entirely. The copy button always renders.
- The header bar renders whenever `title` is provided. The copy button lives inside the header. Change the existing conditional from `{(title || copyButton) && ...}` to `{title && ...}`.
- All current `<CodeBlock>` call sites pass a `title`, so this is safe.
- Header bar: `bg-[#E0F2F1] text-[#0D5752]` instead of `bg-muted text-muted-foreground`
- Code area background: `bg-[#F0FAFA]` instead of `bg-muted/50`
- Language tag: keep but style as `text-[#80A89E]`

---

## UnderTheHood (`apps/demo/components/UnderTheHood.tsx`)

- Replace `▲` / `▼` chars with a `<svg>` chevron that rotates `180deg` when open (use `transition-transform duration-200`)
- Hover state on toggle button: `hover:bg-[#F0FAFA]`
- Border: `border-[#B2DFDB]` instead of plain `border`

---

## PipelineDiagram (`apps/demo/components/PipelineDiagram.tsx`)

Used only in StepWelcome. Apply same pill badge style as PipelineIndicator for visual consistency. All stages shown as pending pills (no active/done state on the welcome diagram).

Remove the `activeStep` prop from `PipelineDiagramProps` — it is no longer used after the pill rewrite. The component always renders all pills in pending state.

---

## Files Changed

| File | Change type |
|------|-------------|
| `apps/demo/app/globals.css` | Token values updated |
| `apps/demo/app/layout.tsx` | DEMO pill badge, nav border color |
| `apps/demo/components/StepIndicator.tsx` | Full rewrite to pill badges |
| `apps/demo/components/PipelineDiagram.tsx` | Update to pill badge style |
| `apps/demo/components/VerificationLayerCard.tsx` | Left accent border, icon labels |
| `apps/demo/components/CodeBlock.tsx` | Always-on copy button, teal header |
| `apps/demo/components/UnderTheHood.tsx` | SVG chevron, hover bg |
| `apps/demo/components/steps/StepWelcome.tsx` | Card header treatment, callout colors |
| `apps/demo/components/steps/StepSubmit.tsx` | Card header treatment |
| `apps/demo/components/steps/StepAnchor.tsx` | Card header treatment, callout colors |
| `apps/demo/components/steps/StepVerify.tsx` | Card header treatment, callout colors |
| `apps/demo/components/steps/StepProof.tsx` | Card header treatment |

---

## Out of Scope

- `apps/web` — separate effort, to follow after demo is approved
- No new dependencies (no icon library, no syntax highlighter)
- No dark mode changes
- No functional/logic changes — pure visual layer
