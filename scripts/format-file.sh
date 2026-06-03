#!/usr/bin/env bash
# Format + lint-fix a single file using the tooling of the package that owns it.
# Usage: scripts/format-file.sh <path-to-file>
# Exit non-zero ONLY when ESLint reports errors it could not auto-fix.
set -euo pipefail

file="${1:-}"
[ -n "$file" ] && [ -f "$file" ] || exit 0

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
abs="$(cd "$(dirname "$file")" && pwd)/$(basename "$file")"

# Only touch files inside packages/<app>/
case "$abs" in
  "$repo_root"/packages/*) ;;
  *) exit 0 ;;
esac

rel="${abs#"$repo_root"/}"                                   # packages/container/src/App.js
app_dir="$repo_root/$(printf '%s' "$rel" | cut -d/ -f1-2)"   # <root>/packages/container
[ -d "$app_dir" ] || exit 0
rel_to_app="${abs#"$app_dir"/}"                              # src/App.js

status=0

# Prettier: format anything it understands; skip unsupported types silently.
if [ -x "$app_dir/node_modules/.bin/prettier" ]; then
  ( cd "$app_dir" && node_modules/.bin/prettier --write --ignore-unknown "$rel_to_app" ) || true
fi

# ESLint --fix: JS-family files only; its exit code gates the commit.
case "$rel_to_app" in
  *.js|*.jsx|*.mjs|*.cjs)
    if [ -x "$app_dir/node_modules/.bin/eslint" ]; then
      ( cd "$app_dir" && node_modules/.bin/eslint --fix "$rel_to_app" ) || status=$?
    fi
    ;;
esac

exit $status
