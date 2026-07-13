#!/usr/bin/env bash
#
# update-skills.sh — installiert und aktualisiert alle Skills aus allen Quellen.
#
#   ./update-skills.sh
#
# Neue Quelle hinzufügen: eine Zeile in SOURCES eintragen. Ein Eintrag kann ein
# ganzes Repo, ein Kategorie-Ordner oder ein einzelner Skill sein.
#
# Das Script installiert und aktualisiert, aber löscht nie. Skills, die in keiner
# Quelle mehr vorkommen (weil sie upstream umbenannt oder entfernt wurden), meldet
# es am Ende — entfernen musst du sie selbst.

set -euo pipefail

SOURCES=(
  "RATFIVE/SKILLS"
  "https://github.com/mattpocock/skills/tree/main/skills/engineering"
  "https://github.com/mattpocock/skills/tree/main/skills/productivity"
)

AGENTS=(claude-code opencode)

LOCK="$HOME/.agents/.skill-lock.json"

bold=$(tput bold 2>/dev/null || true)
dim=$(tput dim 2>/dev/null || true)
red=$(tput setaf 1 2>/dev/null || true)
green=$(tput setaf 2 2>/dev/null || true)
yellow=$(tput setaf 3 2>/dev/null || true)
reset=$(tput sgr0 2>/dev/null || true)

# ── Sync ──────────────────────────────────────────────────────────────────────

agent_flags=()
for agent in "${AGENTS[@]}"; do
  agent_flags+=(-a "$agent")
done

echo "${bold}Skills synchronisieren${reset} ${dim}→ ${AGENTS[*]}${reset}"
echo

for source in "${SOURCES[@]}"; do
  echo "${bold}▸ ${source}${reset}"
  npx --yes skills@latest add "$source" --skill '*' --global --yes "${agent_flags[@]}"
  echo
done

# ── Verwaiste Skills melden ───────────────────────────────────────────────────
#
# Soll-Zustand: jeder SKILL.md-Ordner in den Quellen oben.
# Ist-Zustand:  jeder Eintrag im Lock-File der skills-CLI.
# Was im Ist, aber nicht im Soll steht, wird von keiner Quelle mehr versorgt.

if ! command -v gh >/dev/null 2>&1; then
  echo "${yellow}gh nicht gefunden — Prüfung auf verwaiste Skills übersprungen.${reset}"
  exit 0
fi

# Skill-Namen einer Quelle: alle SKILL.md unter ihrem Pfad, Ordnername = Skill-Name.
skills_in_source() {
  local source="$1" repo prefix

  if [[ "$source" =~ ^https://github\.com/([^/]+)/([^/]+)/tree/[^/]+/(.+)$ ]]; then
    repo="${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
    prefix="${BASH_REMATCH[3]}/"
  elif [[ "$source" =~ ^https://github\.com/([^/]+)/([^/]+)/?$ ]]; then
    repo="${BASH_REMATCH[1]}/${BASH_REMATCH[2]}"
    prefix=""
  else
    repo="$source"
    prefix=""
  fi

  # ([^/]*/)* erlaubt beliebig viele Zwischenebenen — auch null, wenn die Quelle
  # direkt auf einen Skill zeigt (…/find-skills/SKILL.md).
  gh api "repos/${repo}/git/trees/HEAD?recursive=1" --jq '.tree[].path' 2>/dev/null |
    { grep -E "^${prefix}([^/]*/)*SKILL\.md$" || true; } |
    while IFS= read -r path; do
      basename "$(dirname "$path")"
    done
}

expected=""
for source in "${SOURCES[@]}"; do
  expected+="$(skills_in_source "$source")"$'\n'
done

# Leere Soll-Liste hieße: jeder installierte Skill gilt als verwaist. Das ist fast
# immer ein API-Fehler, kein echter Befund — dann lieber nichts melden.
if [ -z "$(printf '%s' "$expected" | tr -d '[:space:]')" ]; then
  echo "${yellow}Quellen liefern keine Skill-Liste (GitHub-API?) — Prüfung übersprungen.${reset}"
  exit 0
fi

installed=$(node -e "
  const fs = require('fs');
  const lock = JSON.parse(fs.readFileSync('$LOCK', 'utf8'));
  console.log(Object.keys(lock.skills || {}).join('\n'));
" 2>/dev/null || true)

orphans=$(comm -23 \
  <(printf '%s' "$installed" | sort -u) \
  <(printf '%s' "$expected" | grep -v '^$' | sort -u))

if [ -z "$orphans" ]; then
  count=$(printf '%s' "$installed" | grep -cv '^$' || true)
  echo "${green}✓${reset} ${count} Skills aktuell, keine verwaisten."
  exit 0
fi

echo "${yellow}⚠ Verwaist${reset} — installiert, aber in keiner Quelle mehr vorhanden:"
echo
while IFS= read -r skill; do
  [ -n "$skill" ] && echo "    ${red}${skill}${reset}"
done <<<"$orphans"
echo
echo "${dim}Diese Skills bekommen keine Updates mehr. Upstream umbenannt oder gelöscht.${reset}"
echo "${dim}Entfernen:${reset} npx skills remove --global $(printf '%s ' $orphans)"
echo "${dim}Behalten? Dann in ein eigenes skills/-Verzeichnis dieses Repos übernehmen.${reset}"
