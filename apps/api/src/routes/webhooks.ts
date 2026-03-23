import { Router } from 'express';

const router = Router();

// ─── Webhooks ────────────────────────────────────────────────────────────────
// HCS anchoring happens directly within the POST /decisions route.
// This route is kept as a placeholder for future external integrations.

router.post('/health', (_req, res) => {
  res.json({ success: true, message: 'Webhooks endpoint is healthy' });
});

export default router;
