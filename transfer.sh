#!/usr/bin/env bash
# transfer.sh — Copy Chrome extension files from WSL to Windows desktop
#   ./transfer.sh          one-shot copy
#   ./transfer.sh --watch  watch for changes and copy on every modification
set -euo pipefail

WIN_USER="David"
DEST="/mnt/c/Users/${WIN_USER}/Desktop/Notion-Equation-Converter"
SRC="$(cd "$(dirname "$0")" && pwd)"
FILES=(manifest.json content.js popup.html popup.js icon.png)

# ── one-shot copy ────────────────────────────────────────────────────────────
copy_all() {
  mkdir -p "${DEST}"
  for f in "${FILES[@]}"; do
    if [[ -f "${SRC}/${f}" ]]; then
      cp -v "${SRC}/${f}" "${DEST}/${f}"
    else
      echo "WARNING: ${f} not found, skipping"
    fi
  done
}

# ── watch mode ───────────────────────────────────────────────────────────────
watch_mode() {
  local -A mtimes

  # seed initial timestamps
  for f in "${FILES[@]}"; do
    mtimes["${f}"]=$(stat -c %Y "${SRC}/${f}" 2>/dev/null || echo 0)
  done

  echo "Watching ${#FILES[@]} files in ${SRC} ..."
  echo "Changes will be copied to ${DEST}"
  echo "Press Ctrl+C to stop."
  echo ""

  while true; do
    for f in "${FILES[@]}"; do
      local src_path="${SRC}/${f}"
      [[ -f "${src_path}" ]] || continue
      local new_mtime
      new_mtime=$(stat -c %Y "${src_path}" 2>/dev/null || echo 0)
      if [[ "${new_mtime}" != "${mtimes[${f}]:-0}" ]]; then
        cp -v "${src_path}" "${DEST}/${f}"
        mtimes["${f}"]="${new_mtime}"
      fi
    done
    sleep 2
  done
}

# ── main ─────────────────────────────────────────────────────────────────────
mkdir -p "${DEST}"

if [[ "${1:-}" == "--watch" ]] || [[ "${1:-}" == "-w" ]]; then
  copy_all   # initial copy
  watch_mode
else
  copy_all
fi

echo ""
echo "Done. Files at: ${DEST}"
echo "Load unpacked from chrome://extensions/ (Developer mode on)"
