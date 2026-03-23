#!/usr/bin/env bash
# railway-env-push.sh — Push local .env variables to Railway services
#
# Usage: bash scripts/railway-env-push.sh
#
# Prerequisites:
#   - railway CLI installed and logged in (railway login)
#   - Project linked (railway link)
#   - Services created: api, web, demo

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: .env file not found at $ENV_FILE"
  exit 1
fi

# Read .env into an associative array (skip comments and empty lines)
declare -A VARS
while IFS='=' read -r key value; do
  [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
  VARS["$key"]="$value"
done < "$ENV_FILE"

# ─── API service vars ─────────────────────────────────────────────────────────
echo "=== Pushing vars to: api ==="
railway variables set --service api \
  NODE_ENV=production \
  AWS_REGION="${VARS[AWS_REGION]}" \
  AWS_ACCESS_KEY_ID="${VARS[AWS_ACCESS_KEY_ID]}" \
  AWS_SECRET_ACCESS_KEY="${VARS[AWS_SECRET_ACCESS_KEY]}" \
  KMS_KEY_ARN="${VARS[KMS_KEY_ARN]}" \
  ANTHROPIC_API_KEY="${VARS[ANTHROPIC_API_KEY]}" \
  HEDERA_ACCOUNT_ID="${VARS[HEDERA_ACCOUNT_ID]}" \
  HEDERA_PRIVATE_KEY="${VARS[HEDERA_PRIVATE_KEY]}" \
  HEDERA_NETWORK="${VARS[HEDERA_NETWORK]}" \
  HCS_TOPIC_ID="${VARS[HCS_TOPIC_ID]}" \
  HEDERA_EVM_RPC_URL="${VARS[HEDERA_EVM_RPC_URL]}" \
  DEPLOYER_PRIVATE_KEY="${VARS[DEPLOYER_PRIVATE_KEY]}" \
  INTERNAL_API_KEY="${VARS[INTERNAL_API_KEY]}" \
  NEXTAUTH_SECRET="${VARS[NEXTAUTH_SECRET]}" \
  LOG_LEVEL=info

echo "  Done."

# ─── Web service vars ─────────────────────────────────────────────────────────
echo ""
echo "=== Pushing vars to: web ==="
echo "  NOTE: After this script, set NEXT_PUBLIC_API_URL and NEXTAUTH_URL"
echo "        in the Railway dashboard once you know the API and web service URLs."
railway variables set --service web \
  NODE_ENV=production \
  NEXTAUTH_SECRET="${VARS[NEXTAUTH_SECRET]}" \
  AUTH_SECRET="${VARS[NEXTAUTH_SECRET]}"

echo "  Done."

# ─── Demo service vars ────────────────────────────────────────────────────────
echo ""
echo "=== Pushing vars to: demo ==="
echo "  NOTE: After this script, set API_BASE_URL in the Railway dashboard"
echo "        once you know the API service URL."
railway variables set --service demo \
  NODE_ENV=production \
  NEXTAUTH_SECRET="${VARS[NEXTAUTH_SECRET]}" \
  AUTH_SECRET="${VARS[NEXTAUTH_SECRET]}" \
  INTERNAL_API_KEY="${VARS[INTERNAL_API_KEY]}"

echo "  Done."

echo ""
echo "=== All vars pushed. ==="
echo ""
echo "Next steps (in Railway dashboard):"
echo "  1. web  → set NEXT_PUBLIC_API_URL=https://<api-service>.railway.app"
echo "            set NEXTAUTH_URL=https://<web-service>.railway.app"
echo "  2. demo → set API_BASE_URL=https://<api-service>.railway.app"
echo "  3. Trigger deploys for all three services."
