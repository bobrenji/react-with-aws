#!/usr/bin/env bash
# Claude Code PostToolUse hook: format the file just edited/written.
# Reads the hook event JSON on stdin. Non-blocking (always exits 0).
set -euo pipefail

file="$(cat | jq -r '.tool_input.file_path // empty')"
[ -n "$file" ] || exit 0

root="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel)}"
"$root/scripts/format-file.sh" "$file" || true
exit 0
