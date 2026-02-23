#!/usr/bin/env bash
set -euo pipefail

bun install
bun run build
gh extension install .
gh prx doctor || true

echo "Done. Try: gh prx context"
