#!/usr/bin/env bash
# Enable the repo's git hooks. Run once per clone.
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
git config core.hooksPath .githooks
chmod +x .githooks/* scripts/*.sh .claude/hooks/*.sh 2>/dev/null || true
echo "✔ core.hooksPath set to .githooks — pre-commit lint/format is active."
