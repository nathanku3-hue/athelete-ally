#!/usr/bin/env bash

# Run strict ESLint config only on changed files.
# Fails the build if any changed TS/TSX/JS/JSX file violates strict rules.

set -euo pipefail

echo "🔎 Strict ESLint (changed files only)"

# Ensure we have the repo metadata
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
  echo "Not inside a git repo" >&2; exit 0; # non-blocking
}

# Find merge base for comparison
BASE_REF="${GITHUB_BASE_REF:-}"
BASE_SHA=""
if [[ -n "$BASE_REF" ]]; then
  echo "Base ref from PR: $BASE_REF"
  git fetch --no-tags --depth=1 origin "$BASE_REF" || true
  BASE_SHA=$(git merge-base HEAD "origin/$BASE_REF" || true)
fi

# Fallbacks
if [[ -z "$BASE_SHA" ]]; then
  # Try the previous commit on the current branch
  BASE_SHA=$(git rev-parse HEAD^ 2>/dev/null || echo "")
fi

if [[ -z "$BASE_SHA" ]]; then
  echo "⚠️ Unable to determine base revision; skipping strict ESLint"; exit 0
fi

echo "Comparing changes against $BASE_SHA"

# Collect changed files with relevant extensions
mapfile -t FILES < <(git diff --name-only --diff-filter=AMR "$BASE_SHA"...HEAD \
  | grep -E '\.(ts|tsx|js|jsx)$' \
  | grep -Ev '(^|/)node_modules/|(^|/)dist/|(^|/)build/|(^|/)\.next/')

if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "No relevant changed files; skipping strict ESLint"
  exit 0
fi

echo "Found ${#FILES[@]} changed file(s) to lint strictly"

# Run strict ESLint config on changed files
npx eslint -c config/linting/eslint.config.strict.mjs --max-warnings=0 "${FILES[@]}"

echo "✅ Strict ESLint passed on changed files"

