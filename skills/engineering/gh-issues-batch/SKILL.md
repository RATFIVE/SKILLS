---
name: gh-issues-batch
description: Implementiert alle offenen GitHub Issues eines Repositories vollautomatisch in einem Rutsch. Issues, die voneinander unabhängig sind, werden parallel über Subagents abgearbeitet; abhängige Issues laufen sequenziell. Jede Implementierung wird per `/tdd` test-getrieben entwickelt, über Playwright-MCP verifiziert, bei Fehlern mit `/diagnosing-bugs` analysiert und nach Caveman-Prinzipien (`/caveman`) vereinfacht. Erfolgreiche Implementierungen werden committet, der User bekommt erst nach Abschluss aller Issues eine Sammelmeldung. Nutze diesen Skill IMMER, wenn der User sagt "implementiere alle issues", "alle gh issues", "issues aus github abarbeiten", "batch implementation", "parallel issues bearbeiten", "alle offenen tickets" oder ähnliches — auch ohne explizite Nennung von Playwright/TDD/Caveman, da diese Werkzeuge zum Standard-Workflow gehören.
---
 
# GitHub Issues Batch Implementer
 
Vollautomatischer Abarbeitungs-Workflow für alle offenen GitHub Issues. Ziel ist *Hands-Off* Implementierung: User triggert, Claude meldet sich erst zurück, wenn alle Issues entweder gemerged sind oder als Blocker dokumentiert wurden.
 
## Kernprinzipien
 
1. **Keine Zwischenmeldungen.** Status nur intern als TodoList tracken. Erst am Ende ein Sammel-Report.
2. **Parallelität wo möglich.** Unabhängige Issues laufen gleichzeitig als Subagents. Nur dependent Issues laufen seriell.
3. **Test-First.** Kein Issue gilt als fertig, bevor Tests und Playwright-Verifikation grün sind.
4. **Atomare Commits.** Jedes erfolgreich implementierte Issue bekommt seinen eigenen Commit mit `Closes #<nr>` im Body.
5. **Failure isoliert.** Ein gescheitertes Issue bricht den Batch nicht ab — es wird übersprungen und am Ende reported.
## Workflow
 
### Phase 1: Issues sammeln & klassifizieren
 
```bash
gh issue list --state open --json number,title,body,labels,assignees --limit 200 > /tmp/issues.json
```
 
Lies die Issues und gruppiere sie:
 
- **Dependency-Map bauen:** Für jedes Issue prüfen, ob im Body `depends on #X`, `blocked by #X`, `after #X` oder ähnliche Marker stehen. Auch Label wie `blocked` oder `depends-on:X` beachten.
- **Touch-Map bauen:** Aus Issue-Body/Labels grob ableiten, welche Dateien/Module berührt werden. Issues, die laut Beschreibung an dieselben Dateien gehen, gelten als *konfliktgefährdet* und laufen seriell.
- **Pools bilden:** Issues ohne Abhängigkeiten und ohne File-Konflikte → "parallel-pool". Rest → "serial-queue", sortiert nach Topologie.
Wenn die Klassifikation unklar ist (z.B. komplexe Cross-Cutting-Concerns), im Zweifel **seriell**.
 
### Phase 2: Branch-Strategie
 
Pro Issue ein eigener Branch: `issue/<nummer>-<kebab-case-titel>`. Vom aktuellen branch aus erstellen. Bei parallelen Issues: jedes Subagent arbeitet auf seinem eigenen Branch in einem eigenen Worktree:
 
```bash
git worktree add ../wt-issue-<n> issue/<n>-<slug>
```
 
Worktrees verhindern dass parallele Subagents sich gegenseitig den Working-Tree zerschießen.
 
### Phase 3: Implementierung pro Issue
 
Für **jedes** Issue (egal ob parallel oder seriell) gilt derselbe innere Loop. Bei Parallelausführung wird der gesamte Loop in einen Subagent gepackt (Task tool), bei seriellen Issues läuft er im Hauptkontext.
 
Innerer Loop:
 
1. **Read & Plan.** Issue-Body lesen, Akzeptanzkriterien extrahieren, Implementierungsplan in 3-7 Schritten skizzieren.
2. **`/tdd` aufrufen.** Damit werden zuerst die Tests geschrieben, die die Akzeptanzkriterien abdecken. Tests sollen *rot* laufen.
3. **Implementieren.** Minimal-Code schreiben, der die Tests grün macht. *Noch* nicht refaktorieren.
4. **Unit-Tests laufen lassen.** Wenn rot → zurück zu Schritt 3. Maximal 5 Implementierungs-Iterationen, dann `/diagnosing-bugs`.
5. **`/caveman` aufrufen.** Code radikal vereinfachen — weniger Abstraktion, kürzere Funktionen, direkterer Pfad. Tests müssen grün bleiben.
6. **Playwright-MCP Verifikation.** Falls UI-Touchpoint vorhanden (Issue-Label `ui`, `frontend`, `e2e` oder UI-Komponenten im Diff): End-to-End-Flow über Playwright-MCP durchspielen. Screenshots vergleichen wo sinnvoll. Bei nicht-UI-Issues (z.B. CLI-Tool, Backend-Service): Playwright entfällt, stattdessen entsprechende Integration-Tests laufen lassen.
7. **Bei Fehler in 4 oder 6 → `/diagnosing-bugs`.** Diagnose-Output lesen, gezielten Fix einbauen, Loop ab Schritt 4 wiederholen. Maximal 3 Diagnose-Runden pro Issue, dann das Issue als "blocked" markieren und überspringen.
8. **Commit.** Bei Erfolg: alle Änderungen stagen und committen.
### Commit-Format
 
```
<type>(<scope>): <kurzbeschreibung>
 
<längere beschreibung was umgesetzt wurde>
 
Closes #<issue-nummer>
```
 
`<type>` aus: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`. `<scope>` aus dem Issue-Kontext ableiten (Modul, Komponente, etc.).
 
Beispiel:
```
feat(auth): JWT refresh token rotation
 
Implementiert Token-Rotation nach RFC 6749 Section 6. Refresh tokens
werden bei jedem Use invalidiert und durch neue ersetzt. Reuse-Detection
loggt Verdachtsfälle.
 
Closes #142
```
 
### Phase 4: Merge / Push (optional)
 
Default: **Branches lokal lassen, nicht pushen, keine PRs öffnen.** Das ist die sicherste Variante.
 
**Branch-Regel (hart):** Commits landen immer auf dem Branch, der beim Start aktiv war — niemals direkt auf `main`. Den aktiven Branch einmalig mit `git branch --show-current` ermitteln und alle Commits dorthin schreiben. Kein `git checkout main`, kein `git push` ohne explizite Anweisung des Users.
 
Wenn der User explizit "pushe alles" oder "öffne PRs" gesagt hat:
- `git push -u origin <branch>` pro Branch
- `gh pr create --fill --base main` pro Branch
Bei Unklarheit: nicht pushen und im Final-Report fragen.
 
## Parallelisierung — wie genau
 
Wenn der parallel-pool nicht leer ist, spawnt Claude für jedes Issue im Pool einen Subagent gleichzeitig im selben Turn. Jeder Subagent bekommt diese Instruction:
 
```
Du implementierst GitHub Issue #<NR> in einem isolierten Worktree.
 
Pfad: <worktree-pfad>
Branch: issue/<n>-<slug>
Issue-Body: <body>
Akzeptanzkriterien: <extrahiert>
 
Workflow:
1. Plan in 3-7 Schritten
2. /tdd → Tests rot
3. Implementierung → Tests grün
4. /caveman → vereinfachen, Tests müssen grün bleiben
5. Bei UI-Touchpoint: Playwright-MCP E2E-Verifikation
6. Bei Fehlern: /diagnosing-bugs, max. 3 Runden
7. Commit mit "Closes #<NR>" im Body
 
Liefere zurück: { "issue": <NR>, "status": "success"|"blocked", "commit_sha": "...", "blocker_reason": "..." }
```
 
Wichtig: pro Subagent ein eigener Worktree, sonst Race-Conditions auf dem Working-Tree.
 
Nach dem Sammeln aller parallelen Ergebnisse: serial-queue abarbeiten (im Hauptkontext, da diese Issues laut Klassifikation Konflikte haben könnten — z.B. Schema-Migrationen, geteilte Config-Dateien).
 
## Slash-Command-Nutzung
 
Diese Commands werden vorausgesetzt und gehören zum Standard-Setup:
 
- **`/tdd`** — Test-Driven-Development-Workflow. Schreibt zuerst failing Tests basierend auf Akzeptanzkriterien.
- **`/diagnosing-bugs`** — Fehleranalyse-Workflow. Liest Stack-Trace / Test-Output, identifiziert Root-Cause, schlägt gezielten Fix vor.
- **`/caveman`** — Code-Simplification-Workflow. "Make it dumb." Entfernt unnötige Abstraktion, kürzt Funktionen, reduziert Indirektion.
Diese Commands existieren im User-Setup. Falls einer fehlt: einmal beim ersten Issue feststellen, dann im Final-Report melden ("`/caveman` nicht verfügbar, Simplification übersprungen") und stattdessen den entsprechenden Schritt manuell durchführen.
 
## Wann den User doch unterbrechen
 
Trotz "no zwischenmeldungen"-Prinzip gibt es harte Stopp-Bedingungen:
 
- **Destruktive Operation nötig:** `git push --force`, Drop von Datenbank-Tabellen, Löschen von > 50 Dateien.
- **Secrets / Credentials gefragt:** Ein Issue verlangt API-Keys, Passwörter, Zugangsdaten die nicht da sind.
- **Mehr als 50% der Issues blocked:** Wenn nach den ersten 5 Issues schon 3 blocked sind, ist die Repo-Situation unklar — Stop und Report.
- **Repo nicht clean beim Start:** Uncommitted changes auf dem Start-Branch. Abbrechen, User soll erst aufräumen.
Bei diesen Bedingungen: Sofort stoppen, Bisher-Status reporten, auf User warten.
 
## Final Report
 
Nach Abschluss aller Issues — einmaliger zusammenfassender Bericht in dieser Struktur:
 
```
Batch abgeschlossen: <X> von <Y> Issues implementiert.
 
✓ Erfolgreich (parallel):
  #142  feat(auth): JWT refresh — commit abc1234
  #156  fix(api): pagination off-by-one — commit def5678
  ...
 
✓ Erfolgreich (seriell):
  #161  refactor(db): schema migration — commit 9ab0123
  ...
 
✗ Blocked:
  #173  E2E test schlägt fehl in Playwright, Element-Selector instabil
        nach 3 Diagnose-Runden. Manueller Blick nötig.
 
Branches lokal, nicht gepusht. Soll ich PRs öffnen?
```
 
Keine weiteren Erklärungen, kein Plauderton, kein Lob für sich selbst. Der User will den Status sehen, sonst nichts.
 
## Edge Cases
 
- **Keine offenen Issues:** Direkt melden "Keine offenen Issues — nichts zu tun." Kein Workflow starten.
- **`gh` nicht authentifiziert:** Erkennen am Fehler, User auffordern `gh auth login` zu laufen, abbrechen.
- **Issue ohne klare Akzeptanzkriterien:** Plan-Phase aus Issue-Titel + Body interpolieren, im Commit-Body dokumentieren wie interpretiert wurde. Nicht nachfragen.
- **Issue-Body verweist auf externe Spec (Figma, Notion):** Wenn nicht zugreifbar, beste Interpretation aus dem Issue-Text + Repo-Konventionen ableiten. Im Blocker-Report vermerken falls nötig.
- **Test-Suite läuft im Repo gar nicht:** Erst `npm test` / `pnpm test` / `pytest` / etc. einmal verifizieren bevor parallele Subagents losgeschickt werden. Wenn die Test-Suite kaputt ist, ist das ein Stopp-Grund.
## Anti-Patterns
 
- **NICHT** den User nach jedem Issue fragen ob er weitermachen will.
- **NICHT** "ich denke das ist eine gute Idee" — einfach machen.
- **NICHT** Commits mit "Co-Authored-By: Claude" — der User will saubere Commits ohne AI-Branding, außer er hat es explizit gewünscht.
- **NICHT** direkt auf `main` committen — immer auf dem aktiven Branch committen (`git branch --show-current` prüfen).
- **NICHT** pushen ohne explizite Anweisung des Users.
- **NICHT** `git push --force` ohne User-Bestätigung.
- **NICHT** PRs öffnen ohne explizite Anweisung.
- **NICHT** den Caveman-Schritt überspringen "weil der Code schon einfach ist" — `/caveman` aufrufen, der Command entscheidet.