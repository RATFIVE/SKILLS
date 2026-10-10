---
name: gh-ticket-batch
description: Implementiert alle offenen GitHub-Tickets (Issues) eines Repositories vollautomatisch in einem Rutsch. Jedes Ticket läuft in einem eigenen Subagent — unabhängige Tickets gleichzeitig, abhängige nacheinander. Jede Implementierung wird per `/tdd` test-getrieben entwickelt, über Playwright-MCP verifiziert, bei Fehlern mit `/diagnosing-bugs` analysiert und nach Caveman-Prinzipien (`/caveman`) vereinfacht. Erfolgreiche Implementierungen werden committet, der User bekommt erst nach Abschluss aller Tickets eine Sammelmeldung. Nutze diesen Skill IMMER, wenn der User sagt "implementiere alle tickets", "implementiere alle issues", "alle gh issues", "tickets aus github abarbeiten", "batch implementation", "parallel tickets bearbeiten", "alle offenen tickets" oder ähnliches — auch ohne explizite Nennung von Playwright/TDD/Caveman, da diese Werkzeuge zum Standard-Workflow gehören.
---
 
# GitHub Ticket Batch Implementer
 
Vollautomatischer Abarbeitungs-Workflow für alle offenen GitHub-Tickets. Ziel ist *Hands-Off* Implementierung: User triggert, Claude meldet sich erst zurück, wenn alle Tickets entweder implementiert oder als Blocker dokumentiert wurden.
 
## Kernprinzipien
 
1. **Keine Zwischenmeldungen.** Status nur intern als TodoList tracken. Erst am Ende ein Sammel-Report.
2. **Ein Ticket = ein Subagent.** Jedes Ticket wird von genau einem eigenen Subagent implementiert, nie im Hauptkontext. Der Hauptkontext ist nur *Orchestrator*: klassifizieren, Subagents dispatchen, Ergebnisse sammeln, reporten.
3. **Parallel wo möglich, nacheinander wo nötig.** Unabhängige Tickets (parallel-pool) laufen gleichzeitig. Abhängige Tickets (serial-queue) laufen ebenfalls je in einem eigenen Subagent, aber strikt nacheinander: der nächste startet erst, wenn der vorherige sein Ergebnis geliefert hat.
4. **Test-First.** Kein Ticket gilt als fertig, bevor Tests und Playwright-Verifikation grün sind.
5. **Atomare Commits.** Jedes erfolgreich implementierte Ticket bekommt seinen eigenen Commit mit `Closes #<nr>` im Body.
6. **Failure isoliert.** Ein gescheitertes Ticket bricht den Batch nicht ab — es wird übersprungen und am Ende reported.
## Workflow
 
### Phase 1: Tickets sammeln & klassifizieren
 
```bash
gh issue list --state open --json number,title,body,labels,assignees --limit 200 > /tmp/tickets.json
```
 
Lies die Tickets und gruppiere sie:
 
- **Dependency-Map bauen:** Für jedes Ticket prüfen, ob im Body `depends on #X`, `blocked by #X`, `after #X` oder ähnliche Marker stehen. Auch Label wie `blocked` oder `depends-on:X` beachten.
- **Touch-Map bauen:** Aus Ticket-Body/Labels grob ableiten, welche Dateien/Module berührt werden. Tickets, die laut Beschreibung an dieselben Dateien gehen, gelten als *konfliktgefährdet* und laufen nacheinander.
- **Pools bilden:** Tickets ohne Abhängigkeiten und ohne File-Konflikte → **parallel-pool**. Rest → **serial-queue**, topologisch sortiert (Vorgänger vor Nachfolger).
Wenn die Klassifikation unklar ist (z.B. komplexe Cross-Cutting-Concerns), im Zweifel **serial-queue**.
 
### Phase 2: Branch-Strategie
 
Pro Ticket ein eigener Branch: `issue/<nummer>-<kebab-case-titel>`. Basis ist der Start-Branch — bei Tickets der serial-queue mit Abhängigkeit stattdessen der Branch des direkten Vorgängers, damit der Nachfolger auf dessen Commit aufbaut.
 
Jeder Subagent arbeitet in einem eigenen Worktree:
 
```bash
git worktree add ../wt-issue-<n> -b issue/<n>-<slug> <basis-branch>
```
 
Worktrees verhindern, dass parallele Subagents sich gegenseitig den Working-Tree zerschießen, und halten den Hauptkontext-Checkout sauber.
 
### Phase 3: Subagents dispatchen
 
Der Hauptkontext implementiert selbst nichts. Er dispatcht in dieser Reihenfolge:
 
1. **parallel-pool:** Für *jedes* Ticket im Pool einen Subagent spawnen — alle im selben Turn (mehrere Agent-Aufrufe in einer Nachricht), damit sie gleichzeitig laufen. Auf alle Ergebnisse warten.
2. **serial-queue:** Tickets in topologischer Reihenfolge abarbeiten, pro Ticket genau ein Subagent, im Vordergrund (`run_in_background: false`). Erst wenn dessen Ergebnis da ist, den Worktree für das nächste Ticket anlegen und den nächsten Subagent starten. Ist ein Vorgänger `blocked`, gelten alle davon abhängigen Tickets ebenfalls als `blocked` (Grund: "Vorgänger #X blocked") und werden nicht gestartet.
Fertig ist Phase 3, wenn für jedes Ticket ein Ergebnis-Objekt vorliegt.
 
### Subagent-Prompt
 
Jeder Subagent — egal ob parallel oder seriell — bekommt dieselbe Instruction:
 
```
Du implementierst GitHub-Ticket #<NR> in einem isolierten Worktree.
 
Pfad: <worktree-pfad>
Branch: issue/<n>-<slug>
Ticket-Body: <body>
Akzeptanzkriterien: <extrahiert>
Vorgänger-Tickets (bereits im Branch enthalten): <liste oder "keine">
 
Workflow:
1. Plan in 3-7 Schritten. Ohne klare Akzeptanzkriterien: aus Titel + Body interpolieren, Interpretation im Commit-Body dokumentieren.
2. /tdd → Tests schreiben, die die Akzeptanzkriterien abdecken, Tests rot
3. Minimal-Implementierung → Tests grün. Max. 5 Iterationen, danach /diagnosing-bugs
4. /caveman → vereinfachen, Tests müssen grün bleiben
5. Bei UI-Touchpoint (Label ui/frontend/e2e oder UI-Komponenten im Diff): Playwright-MCP E2E-Verifikation. Sonst: Integration-Tests
6. Fehler in 3 oder 5: /diagnosing-bugs, gezielter Fix, ab Schritt 3 wiederholen. Max. 3 Diagnose-Runden, dann status "blocked"
7. Commit mit "Closes #<NR>" im Body (Commit-Format siehe unten)
 
Liefere zurück: { "issue": <NR>, "status": "success"|"blocked", "commit_sha": "...", "blocker_reason": "..." }
```
 
Hänge das Commit-Format aus dem nächsten Abschnitt an den Prompt an.
 
### Commit-Format
 
```
<type>(<scope>): <kurzbeschreibung>
 
<längere beschreibung was umgesetzt wurde>
 
Closes #<ticket-nummer>
```
 
`<type>` aus: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`. `<scope>` aus dem Ticket-Kontext ableiten (Modul, Komponente, etc.).
 
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
 
**Branch-Regel (hart):** Den Start-Branch einmalig mit `git branch --show-current` ermitteln. Alle Ticket-Branches zweigen davon (oder von ihrem Vorgänger) ab; auf `main` selbst wird nie committet. Kein `git checkout main`, kein `git push` ohne explizite Anweisung des Users.
 
Wenn der User explizit "pushe alles" oder "öffne PRs" gesagt hat:
- `git push -u origin <branch>` pro Branch
- `gh pr create --fill --base main` pro Branch
Bei Unklarheit: nicht pushen und im Final-Report fragen.
 
## Slash-Command-Nutzung
 
Diese Commands werden vorausgesetzt und gehören zum Standard-Setup:
 
- **`/tdd`** — Test-Driven-Development-Workflow. Schreibt zuerst failing Tests basierend auf Akzeptanzkriterien.
- **`/diagnosing-bugs`** — Fehleranalyse-Workflow. Liest Stack-Trace / Test-Output, identifiziert Root-Cause, schlägt gezielten Fix vor.
- **`/caveman`** — Code-Simplification-Workflow. "Make it dumb." Entfernt unnötige Abstraktion, kürzt Funktionen, reduziert Indirektion.
Diese Commands existieren im User-Setup. Falls einer fehlt: der Subagent führt den Schritt manuell durch und meldet es in `blocker_reason`; im Final-Report einmal vermerken ("`/caveman` nicht verfügbar, Simplification manuell").
 
## Wann den User doch unterbrechen
 
Trotz "no zwischenmeldungen"-Prinzip gibt es harte Stopp-Bedingungen:
 
- **Destruktive Operation nötig:** `git push --force`, Drop von Datenbank-Tabellen, Löschen von > 50 Dateien.
- **Secrets / Credentials gefragt:** Ein Ticket verlangt API-Keys, Passwörter, Zugangsdaten die nicht da sind.
- **Mehr als 50% der Tickets blocked:** Wenn nach den ersten 5 Tickets schon 3 blocked sind, ist die Repo-Situation unklar — Stop und Report.
- **Repo nicht clean beim Start:** Uncommitted changes auf dem Start-Branch. Abbrechen, User soll erst aufräumen.
Bei diesen Bedingungen: Sofort stoppen, Bisher-Status reporten, auf User warten.
 
## Final Report
 
Nach Abschluss aller Tickets — einmaliger zusammenfassender Bericht in dieser Struktur:
 
```
Batch abgeschlossen: <X> von <Y> Tickets implementiert.
 
✓ Erfolgreich (parallel):
  #142  feat(auth): JWT refresh — commit abc1234
  #156  fix(api): pagination off-by-one — commit def5678
  ...
 
✓ Erfolgreich (nacheinander):
  #161  refactor(db): schema migration — commit 9ab0123
  ...
 
✗ Blocked:
  #173  E2E test schlägt fehl in Playwright, Element-Selector instabil
        nach 3 Diagnose-Runden. Manueller Blick nötig.
  #175  Vorgänger #173 blocked.
 
Branches lokal, nicht gepusht. Soll ich PRs öffnen?
```
 
Keine weiteren Erklärungen, kein Plauderton, kein Lob für sich selbst. Der User will den Status sehen, sonst nichts.
 
## Edge Cases
 
- **Keine offenen Tickets:** Direkt melden "Keine offenen Tickets — nichts zu tun." Kein Workflow starten.
- **`gh` nicht authentifiziert:** Erkennen am Fehler, User auffordern `gh auth login` zu laufen, abbrechen.
- **Ticket-Body verweist auf externe Spec (Figma, Notion):** Wenn nicht zugreifbar, beste Interpretation aus dem Ticket-Text + Repo-Konventionen ableiten. Im Blocker-Report vermerken falls nötig.
- **Test-Suite läuft im Repo gar nicht:** Erst `npm test` / `pnpm test` / `pytest` / etc. einmal im Hauptkontext verifizieren, bevor der erste Subagent losgeschickt wird. Wenn die Test-Suite kaputt ist, ist das ein Stopp-Grund.
## Anti-Patterns
 
- **NICHT** den User nach jedem Ticket fragen ob er weitermachen will.
- **NICHT** "ich denke das ist eine gute Idee" — einfach machen.
- **NICHT** ein Ticket im Hauptkontext implementieren — auch serielle Tickets laufen in ihrem eigenen Subagent.
- **NICHT** mehrere Tickets in einen Subagent packen.
- **NICHT** Commits mit "Co-Authored-By: Claude" — der User will saubere Commits ohne AI-Branding, außer er hat es explizit gewünscht.
- **NICHT** direkt auf `main` committen.
- **NICHT** pushen ohne explizite Anweisung des Users.
- **NICHT** `git push --force` ohne User-Bestätigung.
- **NICHT** PRs öffnen ohne explizite Anweisung.
- **NICHT** den Caveman-Schritt überspringen "weil der Code schon einfach ist" — `/caveman` aufrufen, der Command entscheidet.
