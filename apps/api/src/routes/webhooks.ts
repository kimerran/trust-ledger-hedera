import { Router } from 'express';

const router = Router();

// ─── Webhooks ────────────────────────────────────────────────────────────────
// Previously used for Chainlink CRE callbacks. HCS anchoring now happens
// directly within the POST /decisions route, so no webhook is needed.
// This route is kept as a placeholder for future external integrations.

router.post('/health', (_req, res) => {
  res.json({ success: true, message: 'Webhooks endpoint is healthy' });
});

export default router;
