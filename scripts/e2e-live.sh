#!/usr/bin/env bash
set -euo pipefail

echo "Running live readonly e2e checks..."

export GH_PRX_E2E_REPO="${GH_PRX_E2E_REPO:-oven-sh/bun}"
export GH_PRX_E2E_CWD="${GH_PRX_E2E_CWD:-$(pwd)}"

echo "Target repo: $GH_PRX_E2E_REPO"
echo "Working dir: $GH_PRX_E2E_CWD"

gh auth status >/dev/null

bun test test/e2e/live-smoke.test.ts

echo "Live readonly e2e checks passed."
