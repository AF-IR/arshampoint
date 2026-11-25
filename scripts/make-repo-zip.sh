#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════
#  Build a clean, repo-ready zip of آرشام پوینت (Arsham Point)
#  Excludes runtime data, deps, build artifacts, sandbox files.
#  Output: /home/z/my-project/download/arsham-point.zip
# ═══════════════════════════════════════════════════════════
set -euo pipefail
ROOT=/home/z/my-project
STAGE="$ROOT/.repo-stage/arsham-point"
BASE="$ROOT/download/arsham-point"
OUT="$BASE.zip"
TAROUT="$BASE.tar.gz"

rm -rf "$ROOT/.repo-stage"
mkdir -p "$STAGE" "$ROOT/download"

# ── همه فایل‌های git-tracked (کد، تست‌ها، مستندات) — به‌جز داده اجرایی ──
# منبع truth خودِ git است تا زیپ همیشه با آخرین کامیت هم‌گام بماند؛
# db/ (SQLite دمو با داده‌های اجرایی) به‌طور عمدی مستثنا می‌شود.
while IFS= read -r -d '' f; do
  [ -f "$ROOT/$f" ] || continue
  case "$f" in
    db/*|upload/*|tool-results/*) continue ;;
    .env.example) ;;   # قالب متغیرهای محیطی — بخشی از ریپو است و می‌ماند
    .env*) continue ;; # هر env واقعی دیگر (secretها) حذف می‌شود
  esac
  mkdir -p "$STAGE/$(dirname "$f")"
  cp "$ROOT/$f" "$STAGE/$f"
done < <(git -C "$ROOT" ls-files -z)

# ── zip + tar.gz (هر دو فرمت؛ top-level folder included) ──
rm -f "$OUT" "$TAROUT"
if command -v zip >/dev/null 2>&1; then
  (cd "$ROOT/.repo-stage" && zip -rq9 "$OUT" arsham-point)
else
  (cd "$ROOT/.repo-stage" && python3 -m zipfile -c "$OUT" arsham-point)
fi
(cd "$ROOT/.repo-stage" && tar -czf "$TAROUT" arsham-point)
rm -rf "$ROOT/.repo-stage"

echo "── zip created: $OUT"
du -h "$OUT" | cut -f1 | xargs -I{} echo "   size: {}"
if command -v zip >/dev/null 2>&1; then
  unzip -l "$OUT" | tail -1
else
  python3 -m zipfile -l "$OUT" | wc -l | xargs -I{} echo "   entries: {}"
fi
echo "── tar.gz created: $TAROUT"
du -h "$TAROUT" | cut -f1 | xargs -I{} echo "   size: {}"
tar -tzf "$TAROUT" | wc -l | xargs -I{} echo "   tar entries: {}"
