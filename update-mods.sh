#!/usr/bin/env bash
#
# update-mods.sh — installiert und aktualisiert die Mods aus diesem Repository.
#
#   ./update-mods.sh
#
# Mods sind Claude-Code-Plugins und laufen nur in Claude Code. Sie kommen deshalb
# nicht über update-skills.sh (skills-CLI), sondern über die Plugin-Verwaltung von
# Claude Code: Dieses Repo ist ein Marketplace (.claude-plugin/marketplace.json),
# jeder Mod darin ein Eintrag.
#
# Neuen Mod hinzufügen: Ordner unter mods/ anlegen, in marketplace.json eintragen,
# committen, pushen, Script laufen lassen.
# Mod geändert: version in seiner .claude-plugin/plugin.json erhöhen, sonst sieht
# Claude Code kein Update.
#
# Wie update-skills.sh installiert und aktualisiert das Script, löscht aber nie.
# Installierte Mods, die nicht mehr im Marketplace stehen, meldet es am Ende.

set -euo pipefail

SOURCE="RATFIVE/SKILLS"
MARKETPLACE="ratfive-mods"

bold=$(tput bold 2>/dev/null || true)
dim=$(tput dim 2>/dev/null || true)
red=$(tput setaf 1 2>/dev/null || true)
green=$(tput setaf 2 2>/dev/null || true)
yellow=$(tput setaf 3 2>/dev/null || true)
reset=$(tput sgr0 2>/dev/null || true)

if ! command -v claude >/dev/null 2>&1; then
  echo "${red}claude nicht gefunden — Mods brauchen Claude Code.${reset}"
  exit 1
fi

# Kleiner JSON-Helfer: liest stdin, wertet einen JS-Ausdruck über `j` aus.
json() { node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);$1})"; }

# ── Marketplace ───────────────────────────────────────────────────────────────

echo "${bold}Mods synchronisieren${reset} ${dim}→ ${SOURCE} (${MARKETPLACE})${reset}"
echo

if claude plugin marketplace list --json | json "process.exit(j.some(m=>m.name==='$MARKETPLACE')?0:1)"; then
  claude plugin marketplace update "$MARKETPLACE"
else
  claude plugin marketplace add "$SOURCE"
fi
echo

# ── Installieren / aktualisieren ──────────────────────────────────────────────

state=$(claude plugin list --available --json)

available=$(printf '%s' "$state" | json "
  for (const p of j.available) if (p.marketplaceName==='$MARKETPLACE') console.log(p.name)")
installed=$(printf '%s' "$state" | json "
  for (const p of j.installed) if (p.id.endsWith('@$MARKETPLACE')) console.log(p.id.split('@')[0])")

if [ -z "$available$installed" ]; then
  echo "${yellow}Marketplace ${MARKETPLACE} listet keine Mods — nichts zu tun.${reset}"
  exit 0
fi

# --available listet nur, was noch nicht installiert ist: Soll = beides zusammen.
expected=$(printf '%s\n%s\n' "$available" "$installed" | grep -v '^$' | sort -u)

while IFS= read -r mod; do
  echo "${bold}▸ ${mod}${reset}"
  if printf '%s\n' "$installed" | grep -qx "$mod"; then
    claude plugin update "${mod}@${MARKETPLACE}"
  else
    claude plugin install "${mod}@${MARKETPLACE}"
  fi
  echo
done <<<"$expected"

# ── Verwaiste Mods melden ─────────────────────────────────────────────────────
#
# Installiert, aber nicht mehr im Marketplace: Nach dem Update steht im Cache des
# Marketplaces die aktuelle marketplace.json, gegen die wird geprüft.

listed=$(claude plugin marketplace list --json | json "
  const m = j.find(m=>m.name==='$MARKETPLACE');
  const f = require('fs').readFileSync(m.installLocation+'/.claude-plugin/marketplace.json','utf8');
  for (const p of JSON.parse(f).plugins) console.log(p.name)" 2>/dev/null || true)

if [ -z "$listed" ]; then
  echo "${yellow}marketplace.json nicht lesbar — Prüfung auf verwaiste Mods übersprungen.${reset}"
  exit 0
fi

orphans=$(comm -23 <(printf '%s\n' "$installed" | grep -v '^$' | sort -u) <(printf '%s\n' "$listed" | sort -u))

if [ -z "$orphans" ]; then
  echo "${green}✓${reset} $(printf '%s\n' "$listed" | grep -cv '^$') Mods aktuell, keine verwaisten."
  echo "${dim}Laufende Sitzungen: /reload-plugins eingeben.${reset}"
  exit 0
fi

echo "${yellow}⚠ Verwaist${reset} — installiert, aber nicht mehr in marketplace.json:"
echo
while IFS= read -r mod; do
  [ -n "$mod" ] && echo "    ${red}${mod}${reset}"
done <<<"$orphans"
echo
echo "${dim}Entfernen:${reset} $(for m in $orphans; do printf 'claude plugin uninstall %s@%s; ' "$m" "$MARKETPLACE"; done)"
