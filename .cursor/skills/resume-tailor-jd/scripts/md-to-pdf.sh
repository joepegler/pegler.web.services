#!/usr/bin/env bash
set -euo pipefail

# Converts pegler-web-services resume or cover letter markdown to PDF via pandoc HTML + Chrome print.
# Usage: ./md-to-pdf.sh path/to/resume.SLUG.md
#        ./md-to-pdf.sh path/to/cover-letter.SLUG.md
# Outputs: same basename .html and .pdf in the same directory as the markdown file.

MD="${1:-}"
if [[ -z "$MD" || ! -f "$MD" ]]; then
  echo "Usage: $0 <markdown-file>.md  (e.g. resume.*.md or cover-letter.*.md)" >&2
  exit 1
fi

ABS_MD="$(cd "$(dirname "$MD")" && pwd)/$(basename "$MD")"
DIR="$(dirname "$ABS_MD")"
BASE="$(basename "$MD" .md)"
HTML="$DIR/$BASE.html"
PDF="$DIR/$BASE.pdf"

if [[ "$BASE" == cover-letter* ]]; then
  DOC_TITLE="Cover letter"
else
  DOC_TITLE="Résumé"
fi

if ! command -v pandoc >/dev/null 2>&1; then
  echo "pandoc not found on PATH." >&2
  exit 1
fi

# Chrome or Chromium: set CHROME to full path if not on PATH
CHROME="${CHROME:-}"
if [[ -z "$CHROME" ]]; then
  if [[ "$(uname)" == "Darwin" ]]; then
    CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  elif cmd="$(command -v google-chrome 2>/dev/null)"; then
    CHROME="$cmd"
  elif cmd="$(command -v chromium 2>/dev/null)"; then
    CHROME="$cmd"
  elif cmd="$(command -v chromium-browser 2>/dev/null)"; then
    CHROME="$cmd"
  fi
fi

chrome_resolves() {
  [[ -n "$CHROME" ]] || return 1
  [[ -x "$CHROME" ]] && return 0
  command -v "$CHROME" >/dev/null 2>&1
}

if ! chrome_resolves; then
  echo "Chrome/Chromium not found. Set CHROME to the browser executable." >&2
  exit 1
fi

if [[ ! -x "$CHROME" ]]; then
  CHROME="$(command -v "$CHROME")"
fi

pandoc "$ABS_MD" -o "$HTML" \
  --standalone \
  --metadata title="$DOC_TITLE" \
  -c https://cdn.jsdelivr.net/npm/github-markdown-css@5/github-markdown.min.css

TMP_HEAD=$(mktemp)
cat <<'STYLE' >>"$TMP_HEAD"
  <style>
    body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 780px;
      margin: 0 auto;
      padding: 24px;
      font-size: 11pt;
      line-height: 1.45;
    }
    .markdown-body {
      font-size: inherit;
    }
    header#title-block-header {
      display: none;
    }
    @media print {
      a {
        color: #000;
      }
    }
  </style>

STYLE

# Inject styles before </head>, add markdown-body class to body
if command -v python3 >/dev/null 2>&1; then
  python3 <<PY
from pathlib import Path
html = Path("$HTML").read_text(encoding="utf-8")
extra = Path("$TMP_HEAD").read_text(encoding="utf-8")
if "</head>" not in html:
    raise SystemExit("pandoc output missing </head>")
html = html.replace("</head>", extra + "\\n</head>", 1)
html = html.replace("<body>", '<body class="markdown-body">', 1)
Path("$HTML").write_text(html, encoding="utf-8")
PY
else
  echo "python3 required to patch HTML (or patch manually)." >&2
  rm -f "$TMP_HEAD"
  exit 1
fi

rm -f "$TMP_HEAD"

FILE_URL="file://$HTML"

if [[ "$(uname)" == "Darwin" ]]; then
  "$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="$PDF" "$FILE_URL"
else
  "$CHROME" --headless=new --disable-gpu --no-sandbox --disable-dev-shm-usage \
    --no-pdf-header-footer --print-to-pdf="$PDF" "$FILE_URL"
fi

echo "Wrote $PDF"
