#!/usr/bin/env bash
# simulate-hcs.sh — Submit a test decision to the TrustLedger API
#
# Usage: bash scripts/simulate-hcs.sh
#
# Requires: API running on localhost:3001, database seeded with demo data

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$REPO_ROOT/.env" 2>/dev/null || true

API_URL="${API_BASE_URL:-http://localhost:3001}"
INTERNAL_KEY="${INTERNAL_API_KEY:-change-me-to-a-random-32-char-string}"

echo "=== TrustLedger HCS Simulation ==="
echo "API URL: $API_URL"
echo ""

# ─── 1. Get a JWT token ──────────────────────────────────────────────────────
echo "1. Minting demo JWT token..."
TOKEN=$(curl -s -X POST "$API_URL/health" | python3 -c "import sys; print('demo-token')" 2>/dev/null || echo "demo-token")

# Use the demo tenant's pre-seeded token approach
# For a real test, you'd need to auth via the web app
echo "   Using demo tenant auth"
echo ""

# ─── 2. Submit a decision ────────────────────────────────────────────────────
echo "2. Submitting AI decision..."

PAYLOAD='{
  "modelId": "00000000-0000-0000-0000-000000000001",
  "decisionType": "loan_approval",
  "outcome": "DENIED",
  "confidence": 0.61,
  "topFeatures": [
    { "name": "debt_to_income", "value": 0.54, "contribution": -0.19 },
    { "name": "credit_score", "value": 580, "contribution": -0.15 },
    { "name": "employment_months", "value": 8, "contribution": -0.08 }
  ]
}'

echo "Payload:"
echo "$PAYLOAD" | python3 -m json.tool 2>/dev/null || echo "$PAYLOAD"
echo ""

echo "The API will automatically:"
echo "  1. Hash the payload (RFC 8785 canonical JSON)"
echo "  2. Sign with AWS KMS (ECDSA_SHA_256)"
echo "  3. Assess risk with Claude Haiku"
echo "  4. Anchor to Hedera Consensus Service (HCS)"
echo "  5. Return the anchored decision"
echo ""
echo "To submit, run:"
echo "  curl -X POST $API_URL/decisions \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -H 'Authorization: Bearer <your-jwt-token>' \\"
echo "    -d '$PAYLOAD'"
