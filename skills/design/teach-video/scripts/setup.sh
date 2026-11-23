#!/usr/bin/env bash
# setup.sh: richtet die Werkzeuge für teach-video ein. Mehrfach aufrufbar; tut nichts, was schon da ist.
#   bash setup.sh            -> prüft und installiert, letzte Zeile "teach-video bereit: <Ordner>"
# Alles landet außerhalb des Skill-Ordners in $TEACH_VIDEO_HOME (Standard ~/.cache/teach-video),
# damit ein Skill-Update nichts löscht:
#   venv/   Python mit faster-whisper (Wort-Zeitstempel)
#   node/   playwright (Rendern der Seite)
set -euo pipefail

HOME_DIR="${TEACH_VIDEO_HOME:-$HOME/.cache/teach-video}"
PLAYWRIGHT_VERSION="1.65.1"
mkdir -p "$HOME_DIR"

need() { command -v "$1" >/dev/null 2>&1 || { echo "FEHLT: $1 ($2)"; exit 1; }; }
need ffmpeg "z. B. brew install ffmpeg"
need ffprobe "kommt mit ffmpeg"
need node "Node 18 oder neuer"
need npm "kommt mit Node"

# Python mit faster-whisper. Sehr neue Python-Versionen haben oft noch keine fertigen Pakete
# für av/ctranslate2, deshalb werden mehrere Kandidaten der Reihe nach probiert.
if ! "$HOME_DIR/venv/bin/python" -c "import faster_whisper" >/dev/null 2>&1; then
  ok=""
  for py in python3.12 python3.11 python3.13 python3.10 python3.14 /usr/bin/python3 python3; do
    command -v "$py" >/dev/null 2>&1 || continue
    echo "versuche $py ($("$py" --version 2>&1)) ..."
    rm -rf "$HOME_DIR/venv"
    "$py" -m venv "$HOME_DIR/venv" || continue
    if "$HOME_DIR/venv/bin/pip" install -q --upgrade pip >/dev/null 2>&1 &&
       "$HOME_DIR/venv/bin/pip" install -q faster-whisper >/dev/null 2>&1 &&
       "$HOME_DIR/venv/bin/python" -c "import faster_whisper" >/dev/null 2>&1; then
      ok="$py"; break
    fi
  done
  [ -n "$ok" ] || { echo "FEHLER: faster-whisper ließ sich mit keinem Python installieren"; exit 1; }
  echo "faster-whisper installiert mit $ok"
fi

# playwright, gepinnt, plus passendes Chromium (wird nur geladen, wenn es fehlt)
if [ ! -f "$HOME_DIR/node/node_modules/playwright/package.json" ] ||
   ! grep -q "\"version\": \"$PLAYWRIGHT_VERSION\"" "$HOME_DIR/node/node_modules/playwright/package.json"; then
  mkdir -p "$HOME_DIR/node"
  printf '{ "private": true, "type": "module", "dependencies": { "playwright": "%s" } }\n' "$PLAYWRIGHT_VERSION" > "$HOME_DIR/node/package.json"
  (cd "$HOME_DIR/node" && npm install --silent --no-audit --no-fund)
fi
(cd "$HOME_DIR/node" && npx --no-install playwright install chromium >/dev/null)

echo "teach-video bereit: $HOME_DIR"
