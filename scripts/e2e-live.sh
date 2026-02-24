#!/usr/bin/env bash
set -euo pipefail

echo "Running live readonly e2e checks..."

if [[ -z "${GH_PRX_E2E_REPO:-}" || -z "${GH_PRX_E2E_CWD:-}" ]]; then
  echo "Set GH_PRX_E2E_REPO and GH_PRX_E2E_CWD to run against a real repository."
  echo "Example: GH_PRX_E2E_REPO=cli/cli GH_PRX_E2E_CWD=~/src/cli"
fi

gh auth status >/dev/null

bun test test/e2e/live-smoke.test.ts

echo "Live readonly e2e checks passed."
