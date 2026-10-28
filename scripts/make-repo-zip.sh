#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════
#  Build a clean, repo-ready zip of آرشام پوینت (Arsham Point)
#  Excludes runtime data, deps, build artifacts, sandbox files.
#  Output: /home/z/my-project/download/arsham-point.zip
# ═══════════════════════════════════════════════════════════
set -euo pipefail
ROOT=/home/z/my-project
STAGE="$ROOT/.repo-stage/arsham-point"
OUT="$ROOT/download/arsham-point.zip"

rm -rf "$ROOT/.repo-stage"
mkdir -p "$STAGE" "$ROOT/download"

# ── app directories ──
cp -r "$ROOT/src"      "$STAGE/src"
cp -r "$ROOT/prisma"   "$STAGE/prisma"
cp -r "$ROOT/supabase" "$STAGE/supabase"
cp -r "$ROOT/public"   "$STAGE/public"
mkdir -p "$STAGE/scripts"
cp "$ROOT/scripts/seed-demo.ts" "$STAGE/scripts/seed-demo.ts"

# ── root config & docs ──
for f in package.json bun.lock next.config.ts tsconfig.json \
         postcss.config.mjs tailwind.config.ts components.json \
         eslint.config.mjs .env.example .gitignore \
         README.md README-DEPLOY.md; do
  cp "$ROOT/$f" "$STAGE/$f"
done

# ── zip (top-level folder included) ──
rm -f "$OUT"
if command -v zip >/dev/null 2>&1; then
  (cd "$ROOT/.repo-stage" && zip -rq9 "$OUT" arsham-point)
else
  (cd "$ROOT/.repo-stage" && python3 -m zipfile -c "$OUT" arsham-point)
fi
rm -rf "$ROOT/.repo-stage"

echo "── zip created: $OUT"
du -h "$OUT" | cut -f1 | xargs -I{} echo "   size: {}"
if command -v zip >/dev/null 2>&1; then
  unzip -l "$OUT" | tail -1
else
  python3 -m zipfile -l "$OUT" | wc -l | xargs -I{} echo "   entries: {}"
fi
