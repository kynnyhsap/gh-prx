#!/usr/bin/env bash
set -euo pipefail

echo "Running live e2e checks..."

gh auth status >/dev/null

if [[ -n "${GH_AGENT_TEST_PR:-}" ]]; then
  gh prx context "$GH_AGENT_TEST_PR" --format json >/dev/null
  gh prx threads list "$GH_AGENT_TEST_PR" --unresolved --format json >/dev/null
  gh prx ci status "$GH_AGENT_TEST_PR" --format json >/dev/null
else
  gh prx context --format json >/dev/null
  gh prx threads list --unresolved --format json >/dev/null
  gh prx ci status --format json >/dev/null
fi

if [[ -n "${GH_AGENT_TEST_RUN:-}" ]]; then
  gh prx ci annotations "$GH_AGENT_TEST_RUN" --format json >/dev/null || true
  gh prx ci logs "$GH_AGENT_TEST_RUN" --failed --tail 50 --format text >/dev/null || true
fi

echo "Live e2e checks passed."
