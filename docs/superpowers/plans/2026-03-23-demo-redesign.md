# Demo App UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Visually redesign the `apps/demo` Next.js wizard app with a refined teal palette, pill-badge pipeline indicator, soft-shadow step cards, and polished shared components — no functional or logic changes.

**Architecture:** Pure CSS/className changes across 12 files. Color tokens updated first in `globals.css` so all `--muted`, `--border`, `--primary` usages inherit the new palette automatically. Shared utility components (CodeBlock, UnderTheHood) updated next so step files that use them benefit immediately. Step files updated last.

**Tech Stack:** Next.js 14, Tailwind CSS, shadcn/ui Card/Badge primitives, Roboto (Google Fonts, unchanged)

---

## File Map

| File | Change |
|------|--------|
| `apps/demo/app/globals.css` | Update HSL token values |
| `apps/demo/app/layout.tsx` | DEMO pill badge, teal nav border |
| `apps/demo/components/StepIndicator.tsx` | Full rewrite: circles → pill badges |
| `apps/demo/components/PipelineDiagram.tsx` | Full rewrite: circles → all-pending pill badges, remove `activeStep` prop |
| `apps/demo/components/CodeBlock.tsx` | Always-on copy button, teal header, remove `copyButton` prop |
| `apps/demo/components/UnderTheHood.tsx` | SVG chevron, teal border, hover bg |
| `apps/demo/components/VerificationLayerCard.tsx` | Left accent border, ✓/✗ icon labels |
| `apps/demo/components/steps/StepWelcome.tsx` | Card shadow, teal callout boxes, CTA button shadow |
| `apps/demo/components/steps/StepSubmit.tsx` | Card shadow, step badge header, textarea bg, button shadow |
| `apps/demo/components/steps/StepAnchor.tsx` | Card shadow, step badge header, teal callouts, button shadow |
| `apps/demo/components/steps/StepVerify.tsx` | Card shadow, step badge header, teal callout, button shadow |
| `apps/demo/components/steps/StepProof.tsx` | Card shadow, step badge header, button shadow |

---

## Task 1: Color Tokens

**Files:**
- Modify: `apps/demo/app/globals.css`

- [ ] **Step 1: Update `:root` token values**

Replace the entire `:root` block with refined teal values:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
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

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 2: Verify in browser**

Open http://localhost:3002. The page background should now have a very subtle teal tint instead of plain white. Cards remain white. Nav border becomes slightly more visible teal.

- [ ] **Step 3: Commit**

```bash
git add apps/demo/app/globals.css
git commit -m "style(demo): refine teal color tokens for warmer palette"
```

---

## Task 2: Layout Nav

**Files:**
- Modify: `apps/demo/app/layout.tsx`

- [ ] **Step 1: Update nav and DEMO label**

Replace the file content:

```tsx
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';

const roboto = Roboto({ subsets: ['latin'], weight: ['300', '400', '500', '700'] });

export const metadata: Metadata = {
  title: 'TrustLedger Demo',
  description: 'Interactive walkthrough of the AI decision audit trail pipeline',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <nav className="border-b border-[#B2DFDB] bg-white">
          <div className="container flex h-14 items-center px-4">
            <span className="text-lg font-bold tracking-tight text-[#0D5752]">
              TrustLedger
            </span>
            <span className="ml-2 bg-[#E0F2F1] text-[#0D5752] text-[10px] font-semibold px-2 py-0.5 rounded-full">
              DEMO
            </span>
          </div>
        </nav>
        <main className="container mx-auto max-w-4xl px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify in browser**

Nav should show "TrustLedger" in dark teal with a small pill badge "DEMO" in teal. Nav bottom border is a visible teal line.

- [ ] **Step 3: Commit**

```bash
git add apps/demo/app/layout.tsx
git commit -m "style(demo): refine nav with teal border and DEMO pill badge"
```

---

## Task 3: Pipeline Components

**Files:**
- Modify: `apps/demo/components/StepIndicator.tsx`
- Modify: `apps/demo/components/PipelineDiagram.tsx`

- [ ] **Step 1: Rewrite StepIndicator to pill badges**

Replace the entire file:

```tsx
'use client';

const PIPELINE_STAGES = [
  { label: 'AI Decision', sub: 'Model output' },
  { label: 'Hash & Sign', sub: 'KMS signature' },
  { label: 'On-Chain', sub: 'Blockchain anchor' },
  { label: 'Verify', sub: '3-layer check' },
  { label: 'Proof', sub: 'Audit artifact' },
] as const;

interface PipelineIndicatorProps {
  /** How many pipeline stages are complete (0–5) */
  completedStages: number;
  /** Which stage is currently active (-1 if none) */
  activeStage: number;
}

export function PipelineIndicator({ completedStages, activeStage }: PipelineIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center flex-wrap">
        {PIPELINE_STAGES.map((stage, i) => {
          const done = i < completedStages;
          const active = i === activeStage;

          const pillClass = done
            ? 'bg-emerald-100 border border-emerald-300 text-emerald-700 font-semibold'
            : active
              ? 'bg-[#0D5752] text-white font-semibold shadow-[0_2px_8px_rgba(13,87,82,0.35)]'
              : 'bg-[#E0F2F1] border border-[#B2DFDB] text-[#80A89E]';

          const prefix = done ? '✓ ' : active ? '● ' : '';

          return (
            <div key={stage.label} className="flex items-center">
              <span className={`rounded-full px-3 py-1 text-xs whitespace-nowrap transition-all ${pillClass}`}>
                {prefix}{stage.label}
              </span>
              {i < PIPELINE_STAGES.length - 1 && (
                <div className="h-px w-3 bg-[#B2DFDB] flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
      {activeStage >= 0 && (
        <p className="text-[10px] text-[#5F9EA0] text-center mt-2">
          Step {activeStage + 1} of 5 — {PIPELINE_STAGES[activeStage].label}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Rewrite PipelineDiagram to all-pending pills**

Replace the entire file (removes unused `activeStep` prop):

```tsx
'use client';

const stages = [
  { label: 'AI Decision', desc: 'Model output' },
  { label: 'Hash & Sign', desc: 'KMS signature' },
  { label: 'On-Chain', desc: 'Blockchain anchor' },
  { label: 'Verify', desc: '3-layer check' },
  { label: 'Proof', desc: 'Audit artifact' },
];

export function PipelineDiagram() {
  return (
    <div className="flex items-center flex-wrap py-2">
      {stages.map((stage, i) => (
        <div key={stage.label} className="flex items-center">
          <span className="rounded-full px-3 py-1 text-xs bg-[#E0F2F1] border border-[#B2DFDB] text-[#80A89E] whitespace-nowrap">
            {stage.label}
          </span>
          {i < stages.length - 1 && (
            <div className="h-px w-3 bg-[#B2DFDB] flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser**

Navigate to http://localhost:3002. The top progress indicator should show pill badges. Step 0 (Welcome) shows all pills in pending ghost style. Click "Begin Demo" — step 1 active pill should be solid teal.

- [ ] **Step 4: Commit**

```bash
git add apps/demo/components/StepIndicator.tsx apps/demo/components/PipelineDiagram.tsx
git commit -m "style(demo): rewrite pipeline indicators as pill badges"
```

---

## Task 4: Shared Utility Components

**Files:**
- Modify: `apps/demo/components/CodeBlock.tsx`
- Modify: `apps/demo/components/UnderTheHood.tsx`

- [ ] **Step 1: Update CodeBlock**

Replace the entire file (removes `copyButton` prop, always shows copy button in teal header):

```tsx
'use client';

import { useState } from 'react';

interface CodeBlockProps {
  title?: string;
  language?: string;
  children: string;
}

export function CodeBlock({ title, language = 'json', children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-md border border-[#B2DFDB] overflow-hidden">
      {title && (
        <div className="px-3 py-1.5 border-b border-[#B2DFDB] bg-[#E0F2F1] text-[#0D5752] text-xs font-medium flex items-center justify-between">
          <span>
            {title}{language && <span className="text-[#80A89E] ml-1">({language})</span>}
          </span>
          <button
            onClick={handleCopy}
            className="px-2 py-0.5 rounded text-[10px] font-medium border border-[#B2DFDB] bg-white hover:bg-[#F0FAFA] transition-colors cursor-pointer"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      )}
      <pre className="p-3 overflow-x-auto text-xs leading-relaxed bg-[#F0FAFA]">
        <code>{children}</code>
      </pre>
    </div>
  );
}
```

- [ ] **Step 2: Update UnderTheHood**

Replace the entire file (SVG chevron replaces ▲▼ chars, teal border and hover):

```tsx
'use client';

import { useState } from 'react';

interface UnderTheHoodProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function UnderTheHood({ children, defaultOpen = false }: UnderTheHoodProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mt-4 border border-[#B2DFDB] rounded-md">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-[#5F9EA0] hover:text-[#0D5752] hover:bg-[#F0FAFA] transition-colors rounded-md"
      >
        <span>Under the Hood</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#B2DFDB] pt-3">
          {children}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify in browser**

Click into any step that shows a CodeBlock (e.g. step 1 after submitting). The code block header should be teal-tinted with a Copy button always visible. "Under the Hood" toggle should show a chevron icon that rotates on open.

- [ ] **Step 4: Commit**

```bash
git add apps/demo/components/CodeBlock.tsx apps/demo/components/UnderTheHood.tsx
git commit -m "style(demo): teal code block header, SVG chevron for UnderTheHood"
```

---

## Task 5: VerificationLayerCard

**Files:**
- Modify: `apps/demo/components/VerificationLayerCard.tsx`

- [ ] **Step 1: Update to left accent border with icon labels**

Replace the entire file:

```tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';

interface VerificationLayerCardProps {
  title: string;
  pass: boolean;
  details: Record<string, string | number | boolean | null>;
}

export function VerificationLayerCard({ title, pass, details }: VerificationLayerCardProps) {
  return (
    <Card className="border border-[#E0F2F1] overflow-hidden">
      <div className={`border-l-4 ${pass ? 'border-l-emerald-500' : 'border-l-red-400'}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-sm font-bold ${pass ? 'text-emerald-600' : 'text-red-500'}`}>
              {pass ? '✓' : '✗'}
            </span>
            <span className="font-semibold text-sm">{title}</span>
          </div>
          <dl className="space-y-1">
            {Object.entries(details)
              .filter(([, value]) => value != null)
              .map(([key, value]) => (
                <div key={key} className="flex gap-2 text-xs">
                  <dt className="text-muted-foreground min-w-[100px]">{key}:</dt>
                  <dd className="font-mono break-all">{String(value)}</dd>
                </div>
              ))}
          </dl>
        </CardContent>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to step 3 (Verify) and run verification. Each layer card should show a green left border + ✓ for passing layers, red left border + ✗ for failing ones.

- [ ] **Step 3: Commit**

```bash
git add apps/demo/components/VerificationLayerCard.tsx
git commit -m "style(demo): left accent border and icon labels for verification layer cards"
```

---

## Task 6: StepWelcome + StepSubmit

**Files:**
- Modify: `apps/demo/components/steps/StepWelcome.tsx`
- Modify: `apps/demo/components/steps/StepSubmit.tsx`

- [ ] **Step 1: Update StepWelcome**

Replace the entire file:

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PipelineDiagram } from '@/components/PipelineDiagram';

interface StepWelcomeProps {
  onBegin: () => void;
  isLoading: boolean;
}

export function StepWelcome({ onBegin, isLoading }: StepWelcomeProps) {
  return (
    <Card className="border border-[#E0F2F1] rounded-xl shadow-[0_4px_16px_rgba(13,87,82,0.10)]">
      <CardHeader>
        <CardTitle className="text-[#0D5752]">AI Decision Audit Trail</CardTitle>
        <CardDescription className="text-[#5F9EA0]">
          Walk through the full TrustLedger pipeline step by step. You&apos;ll submit an AI
          decision, anchor it on Hedera, verify it with 3 independent layers, and download a
          tamper-proof audit proof.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <PipelineDiagram />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2 p-4 rounded-md bg-[#E0F2F1] border border-[#B2DFDB]">
            <p className="font-semibold text-[#0D5752]">What you&apos;ll see:</p>
            <ul className="space-y-1 text-[#5F9EA0] list-disc list-inside">
              <li>Canonical hash computation (RFC 8785)</li>
              <li>KMS digital signature (AWS)</li>
              <li>Blockchain anchoring via Hedera Consensus Service</li>
              <li>Three-layer independent verification</li>
              <li>Downloadable audit proof artifact</li>
            </ul>
          </div>
          <div className="space-y-2 p-4 rounded-md bg-[#E0F2F1] border border-[#B2DFDB]">
            <p className="font-semibold text-[#0D5752]">Prerequisites:</p>
            <ul className="space-y-1 text-[#5F9EA0] list-disc list-inside">
              <li>API running on localhost:3001</li>
              <li>Database seeded with demo data</li>
              <li>Docker services running (Postgres + Redis)</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            size="lg"
            onClick={onBegin}
            disabled={isLoading}
            className="shadow-[0_2px_6px_rgba(13,87,82,0.3)]"
          >
            {isLoading ? 'Initializing...' : 'Begin Demo'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Update StepSubmit**

Replace the entire file:

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CodeBlock } from '@/components/CodeBlock';
import { StatusBadge } from '@/components/StatusBadge';
import { UnderTheHood } from '@/components/UnderTheHood';
import type { Decision } from '@trustledger/shared';

interface StepSubmitProps {
  token: string;
  decision: Decision | null;
  editedJson: string;
  onEditJson: (json: string) => void;
  onSubmit: () => void;
  onNext: () => void;
  isLoading: boolean;
}

export function StepSubmit({ token, decision, editedJson, onEditJson, onSubmit, onNext, isLoading }: StepSubmitProps) {
  return (
    <Card className="border border-[#E0F2F1] rounded-xl shadow-[0_4px_16px_rgba(13,87,82,0.10)]">
      <CardHeader>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#5F9EA0] mb-1">Step 1 of 5</p>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#0D5752] text-white flex items-center justify-center text-xs font-bold shrink-0">
            1
          </div>
          <CardTitle className="text-[#0D5752]">Submit AI Decision</CardTitle>
        </div>
        <CardDescription className="text-[#5F9EA0]">
          Send an AI model&apos;s decision to the TrustLedger API. The API computes a canonical hash
          (RFC 8785 JSON) and signs it with KMS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!decision ? (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Decision Payload (editable)</label>
              <textarea
                className="w-full h-64 p-3 rounded-md border border-[#B2DFDB] bg-[#F0FAFA] font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                value={editedJson}
                onChange={(e) => onEditJson(e.target.value)}
              />
            </div>
            <Button
              onClick={onSubmit}
              disabled={isLoading}
              className="shadow-[0_2px_6px_rgba(13,87,82,0.3)]"
            >
              {isLoading ? 'Submitting...' : 'POST /decisions'}
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <StatusBadge status={decision.status} />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <span className="text-xs text-muted-foreground">Decision ID</span>
                <p className="font-mono text-sm break-all">{decision.id}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Input Hash</span>
                <p className="font-mono text-xs break-all">{decision.inputHash}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Signature</span>
                <p className="font-mono text-xs break-all truncate">{decision.signature ?? 'N/A'}</p>
              </div>
            </div>

            <UnderTheHood>
              <CodeBlock title="POST /decisions — Request">
                {editedJson}
              </CodeBlock>
              <CodeBlock title="Response">
                {JSON.stringify({ success: true, data: decision }, null, 2)}
              </CodeBlock>
            </UnderTheHood>

            <div className="flex justify-end pt-2">
              <Button
                onClick={onNext}
                className="shadow-[0_2px_6px_rgba(13,87,82,0.3)]"
              >
                Next: On-Chain Anchor
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Verify in browser**

Welcome step: info boxes should be teal-tinted. Begin Demo button has a subtle teal shadow. After clicking Begin Demo, step 1 card should show the step badge "1" in teal square beside the title, "Step 1 of 5" label above. Textarea has teal border and light teal background.

- [ ] **Step 4: Commit**

```bash
git add apps/demo/components/steps/StepWelcome.tsx apps/demo/components/steps/StepSubmit.tsx
git commit -m "style(demo): card shadow, step badge header, and teal callouts for welcome and submit steps"
```

---

## Task 7: StepAnchor + StepVerify + StepProof

**Files:**
- Modify: `apps/demo/components/steps/StepAnchor.tsx`
- Modify: `apps/demo/components/steps/StepVerify.tsx`
- Modify: `apps/demo/components/steps/StepProof.tsx`

- [ ] **Step 1: Update StepAnchor**

Replace the entire file:

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CodeBlock } from '@/components/CodeBlock';
import { UnderTheHood } from '@/components/UnderTheHood';

interface StepAnchorProps {
  decisionId: string;
  inputHash: string;
  signature: string;
  decisionPayload: string;
  onNext: () => void;
}

export function StepAnchor({ decisionId, inputHash, signature, decisionPayload, onNext }: StepAnchorProps) {
  const hcsMessage = {
    v: 1,
    type: 'DECISION_ANCHOR',
    decisionId,
    hash: inputHash,
    signature: signature?.slice(0, 32) + '...',
    modelId: '00000000-0000-0000-0000-000000000001',
    riskLevel: 'MEDIUM',
    riskSummary: 'Risk assessment performed by Claude Haiku',
    timestamp: new Date().toISOString(),
  };

  return (
    <Card className="border border-[#E0F2F1] rounded-xl shadow-[0_4px_16px_rgba(13,87,82,0.10)]">
      <CardHeader>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#5F9EA0] mb-1">Step 2 of 5</p>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#0D5752] text-white flex items-center justify-center text-xs font-bold shrink-0">
            2
          </div>
          <CardTitle className="text-[#0D5752]">HCS Anchor</CardTitle>
        </div>
        <CardDescription className="text-[#5F9EA0]">
          The API automatically anchors every decision to the Hedera Consensus Service (HCS).
          When you submitted the decision in Step 1, the API signed it with AWS KMS, ran an LLM
          risk assessment via Claude, and submitted the proof to an HCS topic — all in one request.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-md bg-[#E0F2F1] border border-[#B2DFDB] text-sm space-y-3">
          <p className="font-medium text-[#0D5752]">Anchor Pipeline (executed automatically):</p>
          <ol className="list-decimal list-inside space-y-1 text-[#5F9EA0]">
            <li>Canonicalize payload (RFC 8785) and compute SHA-256 hash</li>
            <li>Sign with AWS KMS (<code className="text-xs">ECDSA_SHA_256</code>)</li>
            <li>Risk assessment via Claude Haiku</li>
            <li>Submit proof message to Hedera Consensus Service (HCS)</li>
            <li>Update database with HCS topic ID, sequence number, and transaction ID</li>
          </ol>
        </div>

        <UnderTheHood defaultOpen>
          <CodeBlock title="HCS Message (submitted to Hedera topic)" language="json">
            {JSON.stringify(hcsMessage, null, 2)}
          </CodeBlock>
        </UnderTheHood>

        <div className="p-3 rounded-md bg-[#E0F2F1] border border-[#B2DFDB] text-sm text-[#0D5752]">
          The HCS message is immutable and ordered by Hedera consensus. It can be independently
          verified by querying the Hedera Mirror Node REST API.
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={onNext}
            className="shadow-[0_2px_6px_rgba(13,87,82,0.3)]"
          >
            Next: Verify
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Update StepVerify**

Replace the entire file:

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VerificationLayerCard } from '@/components/VerificationLayerCard';
import { UnderTheHood } from '@/components/UnderTheHood';
import { CodeBlock } from '@/components/CodeBlock';
import type { VerificationResult } from '@trustledger/shared';

interface StepVerifyProps {
  decisionId: string;
  verification: VerificationResult | null;
  onVerify: () => void;
  onNext: () => void;
  isLoading: boolean;
}

const overallVariant: Record<string, 'success' | 'warning' | 'destructive'> = {
  PASS: 'success',
  PARTIAL: 'warning',
  FAIL: 'destructive',
};

export function StepVerify({ decisionId, verification, onVerify, onNext, isLoading }: StepVerifyProps) {
  return (
    <Card className="border border-[#E0F2F1] rounded-xl shadow-[0_4px_16px_rgba(13,87,82,0.10)]">
      <CardHeader>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#5F9EA0] mb-1">Step 3 of 5</p>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#0D5752] text-white flex items-center justify-center text-xs font-bold shrink-0">
            3
          </div>
          <CardTitle className="text-[#0D5752]">Three-Layer Verification</CardTitle>
        </div>
        <CardDescription className="text-[#5F9EA0]">
          Independently verify the decision&apos;s integrity through three layers: hash recompute,
          KMS signature verification, and HCS anchor lookup via the Hedera Mirror Node.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!verification ? (
          <>
            <div className="p-4 rounded-md bg-[#E0F2F1] border border-[#B2DFDB] text-sm space-y-2">
              <p className="font-medium text-[#0D5752]">Three verification layers:</p>
              <ol className="list-decimal list-inside space-y-1 text-[#5F9EA0]">
                <li><strong>Hash Match</strong> — Recompute canonical hash from input features and compare</li>
                <li><strong>Signature Valid</strong> — Verify KMS ECDSA signature against stored hash</li>
                <li><strong>HCS Anchor</strong> — Query Hedera Mirror Node for the anchored message</li>
              </ol>
            </div>
            <Button
              onClick={onVerify}
              disabled={isLoading}
              className="shadow-[0_2px_6px_rgba(13,87,82,0.3)]"
            >
              {isLoading ? 'Verifying...' : `GET /decisions/${decisionId}/verify`}
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-muted-foreground">Overall:</span>
              <Badge variant={overallVariant[verification.overall] ?? 'destructive'}>
                {verification.overall}
              </Badge>
            </div>

            {verification.overall === 'PARTIAL' && (
              <div className="p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-800 dark:text-yellow-200">
                Layer 3 (HCS anchor) shows FAIL because the mock HCS message doesn&apos;t exist on
                the Hedera Mirror Node. With real Hedera credentials configured, all three layers pass.
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <VerificationLayerCard
                title="Layer 1: Hash Match"
                pass={verification.layers.hashMatch.pass}
                details={{
                  computed: verification.layers.hashMatch.computed,
                }}
              />
              <VerificationLayerCard
                title="Layer 2: Signature Valid"
                pass={verification.layers.signatureValid.pass}
                details={{
                  algorithm: verification.layers.signatureValid.algorithm,
                }}
              />
              <VerificationLayerCard
                title="Layer 3: HCS Anchor"
                pass={verification.layers.onchainAnchor.pass}
                details={{
                  topicId: verification.layers.onchainAnchor.topicId,
                  sequenceNumber: verification.layers.onchainAnchor.sequenceNumber,
                  chain: verification.layers.onchainAnchor.chain,
                }}
              />
            </div>

            <UnderTheHood>
              <CodeBlock title={`GET /decisions/${decisionId}/verify — Response`}>
                {JSON.stringify({ success: true, data: verification }, null, 2)}
              </CodeBlock>
            </UnderTheHood>

            <div className="flex justify-end pt-2">
              <Button
                onClick={onNext}
                className="shadow-[0_2px_6px_rgba(13,87,82,0.3)]"
              >
                Next: Proof &amp; Summary
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Update StepProof**

Replace the entire file:

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CodeBlock } from '@/components/CodeBlock';
import { UnderTheHood } from '@/components/UnderTheHood';

interface StepProofProps {
  decisionId: string;
  proof: Record<string, unknown> | null;
  onFetchProof: () => void;
  onStartOver: () => void;
  isLoading: boolean;
}

export function StepProof({ decisionId, proof, onFetchProof, onStartOver, isLoading }: StepProofProps) {
  const handleDownload = () => {
    if (!proof) return;
    const blob = new Blob([JSON.stringify(proof, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trustledger-proof-${decisionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border border-[#E0F2F1] rounded-xl shadow-[0_4px_16px_rgba(13,87,82,0.10)]">
      <CardHeader>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#5F9EA0] mb-1">Step 5 of 5</p>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#0D5752] text-white flex items-center justify-center text-xs font-bold shrink-0">
            5
          </div>
          <CardTitle className="text-[#0D5752]">Proof &amp; Summary</CardTitle>
        </div>
        <CardDescription className="text-[#5F9EA0]">
          Fetch the complete audit proof artifact — a self-contained JSON document that any auditor
          can use to independently verify this decision.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!proof ? (
          <Button
            onClick={onFetchProof}
            disabled={isLoading}
            className="shadow-[0_2px_6px_rgba(13,87,82,0.3)]"
          >
            {isLoading ? 'Fetching proof...' : `GET /decisions/${decisionId}/proof`}
          </Button>
        ) : (
          <>
            <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm space-y-2">
              <p className="font-semibold text-green-800 dark:text-green-200">
                Demo Complete
              </p>
              <p className="text-green-700 dark:text-green-300">
                The full audit trail has been created: decision submitted, hash computed, KMS signed,
                anchored on-chain (simulated), and independently verified. The proof artifact below
                can be provided to any auditor.
              </p>
            </div>

            <CodeBlock title="Audit Proof Artifact">
              {JSON.stringify(proof, null, 2)}
            </CodeBlock>

            <UnderTheHood>
              <CodeBlock title={`GET /decisions/${decisionId}/proof — Response`}>
                {JSON.stringify({ success: true, data: proof }, null, 2)}
              </CodeBlock>
            </UnderTheHood>

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={onStartOver}>
                Start Over
              </Button>
              <Button
                onClick={handleDownload}
                className="shadow-[0_2px_6px_rgba(13,87,82,0.3)]"
              >
                Download Proof JSON
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Verify full flow in browser**

Walk through all 5 steps at http://localhost:3002 and confirm:
- Every step card has the soft teal shadow + rounded-xl corners
- Every step card (1–4) shows "Step N of 5" label + teal numbered badge beside the title
- All info callout boxes are teal-tinted (not gray)
- CodeBlock copy button visible on all code sections
- UnderTheHood uses chevron icon
- Verify step shows ✓/✗ with left accent border on each layer card
- Proof step shows green completion box + download button

- [ ] **Step 5: Commit**

```bash
git add apps/demo/components/steps/StepAnchor.tsx apps/demo/components/steps/StepVerify.tsx apps/demo/components/steps/StepProof.tsx
git commit -m "style(demo): card shadow, step badge headers, teal callouts for anchor/verify/proof steps"
```
