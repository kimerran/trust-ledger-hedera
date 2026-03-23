# Deprecated — Chainlink CRE Workflow

This directory contains the previous Chainlink CRE (Compute Runtime Environment) workflow
that was used for decentralized on-chain anchoring on Ethereum Sepolia.

**This code is no longer active.** The application now uses:
- **Hedera Consensus Service (HCS)** for immutable audit trail anchoring
- **Direct API orchestration** instead of CRE DON execution

The anchoring pipeline now runs directly in the Express API via:
- `apps/api/src/services/hcsService.ts` — HCS message submission
- `apps/api/src/services/anchorService.ts` — Risk assessment + HCS orchestration

These files are kept for historical reference only.
