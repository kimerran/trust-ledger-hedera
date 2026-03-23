# TrustLedger

> Tamper-proof audit trails for AI decisions in regulated industries — powered by Hedera Consensus Service (HCS), AWS KMS, and Claude AI.

**Hedera Hello Future Apex Hackathon — Open Track + AWS Bounty**

---

## What It Does

TrustLedger creates cryptographic, immutable audit trails for consequential AI decisions in finance, healthcare, and insurance. When an AI model makes a decision (loan approval, diagnosis recommendation, claims adjudication), TrustLedger:

1. **Captures** the model version, input data hash, reasoning chain, and output
2. **Signs** each record with AWS KMS-managed keys (ECDSA_SHA_256)
3. **Assesses risk** via Claude Haiku LLM
4. **Anchors** the proof immutably on Hedera Consensus Service (HCS)
5. **Enforces** configurable retention policies via smart contracts on Hedera EVM
6. **Verifies** any decision through a three-layer independent verification system

## Architecture

```
User/AI System → POST /decisions (Express API)
                       ↓
              Anchor Pipeline (in-process)
               ├── Hash payload (RFC 8785 canonical JSON)
               ├── Sign with AWS KMS (ECDSA_SHA_256)
               ├── LLM risk assess (Claude Haiku)
               └── Submit to Hedera Consensus Service (HCS)
                       ↓
                 Next.js Dashboard
                 + Public Proof Page
```

### Three-Layer Verification

Every decision can be independently verified through three layers:

1. **Hash Match** — Recomputes the RFC 8785 canonical JSON hash and compares to stored value
2. **KMS Signature** — Verifies the ECDSA_SHA_256 signature against the hash using AWS KMS (dev: deterministic local ECDSA key derived from `DEPLOYER_PRIVATE_KEY`)
3. **HCS Anchor** — Confirms the message exists on Hedera via the Mirror Node REST API

### Hedera Integration

| Service | Usage |
|---|---|
| **Hedera Consensus Service (HCS)** | Primary immutable audit trail — each decision is submitted as an ordered, timestamped HCS message |
| **Hedera EVM** | Smart contracts for configurable retention policies (`RetentionPolicy.sol`) |
| **Mirror Node REST API** | Verification layer — independently confirms HCS messages exist |

### AWS Integration

| Service | Usage |
|---|---|
| **AWS KMS** | ECDSA_SHA_256 signing of every decision hash — provides cryptographic non-repudiation |

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Start local services (PostgreSQL + Redis)
docker-compose up -d

# 3. Configure environment
cp .env.example .env
# Edit .env with your values (see Environment Variables section)

# 4. Run database migrations
pnpm --filter api db:migrate

# 5. Seed demo data
pnpm --filter api db:seed

# 6. Start all services
pnpm dev
# → web: http://localhost:3000
# → api: http://localhost:3001
# → demo: http://localhost:3002
```

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker
- Foundry (`foundryup`) — for smart contract development
- Hedera Testnet account — free at [portal.hedera.com](https://portal.hedera.com)

## Environment Variables

Copy `.env.example` to `.env` and fill in the values. Key variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `HEDERA_ACCOUNT_ID` | Hedera account ID (e.g. `0.0.12345`) |
| `HEDERA_PRIVATE_KEY` | Hedera account private key (DER encoded) |
| `HEDERA_NETWORK` | `testnet` or `mainnet` |
| `HCS_TOPIC_ID` | HCS topic ID for anchoring (e.g. `0.0.67890`) |
| `HEDERA_EVM_RPC_URL` | Hedera JSON-RPC relay (e.g. `https://testnet.hashio.io/api`) |
| `AWS_REGION` | AWS region for KMS |
| `AWS_ACCESS_KEY_ID` | AWS credentials for KMS |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials for KMS |
| `KMS_KEY_ARN` | Full ARN of the KMS signing key |
| `ANTHROPIC_API_KEY` | Claude Haiku for risk assessment |
| `DEPLOYER_PRIVATE_KEY` | EVM private key for contract deployment and dev KMS key |
| `NEXTAUTH_SECRET` | NextAuth.js session encryption |

> **Never commit `.env` or hardcode secrets in source files.**

### Creating an HCS Topic

Before running in production, create an HCS topic:

```bash
# Using the Hedera JS SDK (or via the portal)
# The API can also create topics programmatically via hcsService.createTopic()
```

## Package Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in watch mode |
| `pnpm build` | Build all apps for production |
| `pnpm test` | Run all tests |
| `pnpm --filter api dev` | Start only the backend |
| `pnpm --filter web dev` | Start only the frontend |
| `pnpm --filter demo dev` | Start only the demo wizard |
| `pnpm --filter api db:generate` | Generate Drizzle migration |
| `pnpm --filter api db:migrate` | Apply migrations |
| `pnpm --filter api db:seed` | Seed demo data |
| `cd contracts && forge test -vvv` | Run Solidity tests |

---

## Smart Contracts (Hedera EVM)

| Contract | Purpose |
|---|---|
| `AuditAnchor.sol` | Immutable on-chain storage of decision hashes + signatures (supplementary to HCS) |
| `RetentionPolicy.sol` | On-chain retention rules per tenant — configurable data retention periods |

```bash
# Deploy to Hedera Testnet EVM
cd contracts
forge build
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $HEDERA_EVM_RPC_URL \
  --broadcast
```

> `Deploy.s.sol` reads `DEPLOYER_PRIVATE_KEY` from environment via `vm.envUint()`.

---

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | None | Health check |
| `POST` | `/decisions` | JWT | Submit an AI decision (auto-anchors to HCS) |
| `GET` | `/decisions` | JWT | List decisions (tenant-scoped) |
| `GET` | `/decisions/:id` | JWT | Get a single decision |
| `GET` | `/decisions/:id/verify` | JWT | Three-layer verification |
| `GET` | `/decisions/:id/proof` | JWT | Download cryptographic proof JSON |
| `GET` | `/decisions/public/:id/verify` | None | Public verification (no auth) |
| `GET` | `/models` | JWT | List registered AI models |
| `POST` | `/models` | JWT | Register a new AI model |
| `GET` | `/workflow-runs` | JWT | List workflow runs |
| `GET` | `/events` | JWT | SSE stream of live events |

### Decision Lifecycle

```
POST /decisions
  → PENDING (persisted)
  → SIGNED (KMS signature applied)
  → ANCHORED (HCS message submitted + risk assessed)
  → VERIFIED (three-layer verification passed)
```

### Public Proof Page

Each decision has a shareable public proof URL:
```
http://localhost:3000/verify/<decision-id>
```
No authentication required. Displays all three verification layers with pass/fail status.

---

## HCS Message Format

Each decision anchored to HCS contains:

```json
{
  "v": 1,
  "type": "DECISION_ANCHOR",
  "decisionId": "01HXK...",
  "hash": "sha256:abc...",
  "signature": "base64...",
  "kmsKeyArn": "arn:aws:kms:...",
  "modelId": "uuid",
  "decisionType": "loan_approval",
  "outcome": "APPROVED",
  "riskLevel": "LOW",
  "riskSummary": "Low risk — high credit score and stable employment.",
  "timestamp": "2026-03-11T..."
}
```

---

## Demo App

The demo wizard at `http://localhost:3002` walks through the full flow:

1. **Welcome** — Mint a demo JWT token
2. **Submit** — Edit and submit an AI decision payload (editable JSON)
3. **Anchor** — View the HCS anchoring details (automatic)
4. **Verify** — Run three-layer verification on the submitted decision
5. **Proof** — View and download the cryptographic proof

---

## Project Structure

```
trust-ledger-hedera/
├── apps/
│   ├── api/          Express API (port 3001) — KMS signing, HCS anchoring, verification
│   ├── web/          Next.js dashboard (port 3000) — compliance monitoring
│   └── demo/         Demo wizard app (port 3002) — interactive walkthrough
├── packages/
│   └── shared/       Shared types + hashDecision utility
├── contracts/        Foundry — AuditAnchor.sol, RetentionPolicy.sol (Hedera EVM)
├── scripts/          Database and utility scripts
├── docker-compose.yml
└── .env.example
```

### Key Backend Services

| Service | File | Purpose |
|---|---|---|
| `hcsService` | `apps/api/src/services/hcsService.ts` | HCS topic management, message submission, Mirror Node verification |
| `anchorService` | `apps/api/src/services/anchorService.ts` | Orchestrates risk assessment + HCS anchoring |
| `kmsService` | `apps/api/src/services/kmsService.ts` | AWS KMS signing and verification |
| `verificationService` | `apps/api/src/services/verificationService.ts` | Three-layer verification (hash, signature, HCS) |

---

## License

MIT
