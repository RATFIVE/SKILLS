---
name: notes-to-issues
description: Verarbeitet die in `notes.md` gesammelten Aufgaben durch die komplette Pipeline `/grill-with-docs` → `/to-prd` → `/to-issue`, sodass aus Roh-Notizen am Ende veröffentlichte GitHub Issues werden. Nutze diesen Skill IMMER, wenn der User auf `notes.md` verweist und sagt "implementiere notes.md", "notes durch die pipeline", "notes zu issues", "@notes.md abarbeiten", "issues aus notes" oder ähnliches — auch wenn er nur einen Teil der Slash-Commands nennt, da `/grill-with-docs`, `/to-prd` und `/to-issue` zum Standard-Workflow gehören. Auch triggern, wenn der User einfach `@notes.md` ohne weitere Erklärung droppt. **Rückfragen jeglicher Art gehen IMMER zuerst durch `/grill-with-docs`** — niemals den User direkt befragen, wenn die Klärung aus `CONTEXT.md` / `docs/adr/` gezogen werden kann.
---
 
# Notes-to-Issues Pipeline
 
Vollautomatische Verarbeitung von Roh-Aufgaben aus `notes.md` zu veröffentlichten GitHub Issues. Ziel ist *eine* Anweisung des Users — Claude liefert am Ende die Issue-Links, ohne dazwischen rückzufragen.
 
## Kernprinzipien

1. **Eine Pipeline, drei Stationen.** Reihenfolge ist hart: `/grill-with-docs` → `/to-prd` → `/to-issue`. Kein Überspringen, keine Vertauschung.
2. **Keine Zwischenmeldungen.** Status nur intern als TodoList. Erst nach `/to-issue` ein einziger Sammel-Report mit den Issue-Links.
3. **Notes-File ist Single Source of Truth.** Alles, was verarbeitet wird, kommt aus `notes.md`. Keine eigenen Aufgaben dazu erfinden, keine "schlauen" Ergänzungen.
4. **PRD ist Zwischenergebnis, kein Deliverable.** Das PRD wird erzeugt, aber nicht groß zelebriert — es ist Input für `/to-issue`.
5. **Failure isoliert.** Wenn eine Stage scheitert, sauberer Stopp mit klarem Bericht, was bis wohin lief. Nicht "irgendwie weitermachen".
6. **Rückfragen IMMER über `/grill-with-docs`.** Jede Unklarheit — ob in Phase 1, in einem Stop-Kriterium, oder zwischendurch — wird zuerst gegen `CONTEXT.md` / `docs/adr/` gegrillt, bevor der User direkt befragt wird. Direktbefragung des Users ist nur erlaubt, wenn `/grill-with-docs` die Klärung nicht liefern kann. Das gilt für *jede* Rückfrage im gesamten Skill-Ablauf, auch außerhalb der Pipeline.
## Workflow
 
### Phase 1: Notes einlesen & sanity-check
 
```bash
test -f notes.md || { echo "notes.md fehlt"; exit 1; }
wc -l notes.md
```
 
Lies `notes.md` einmal komplett. Prüfe:
 
- **Ist die Datei leer?** → Sofort melden "notes.md ist leer — nichts zu tun." und stoppen.
- **Enthält sie überhaupt Aufgaben oder nur Stichworte?** → Bei reinen Stichworten (< 3 Wörter pro Zeile) trotzdem weitermachen, `/grill-with-docs` ist dafür da, sie auszuformulieren.
- **Sind Aufgaben grob abgrenzbar (Listen, Headings, Leerzeilen)?** → Falls ja, intern notieren, ob es eine oder mehrere logische Einheiten gibt. Das beeinflusst nicht den Pipeline-Aufruf, hilft aber später beim Final-Report.
Keine direkte Rückfrage an den User in dieser Phase. Wenn etwas unklar ist: zuerst `/grill-with-docs` laufen lassen, ob die Klärung aus `CONTEXT.md` / `docs/adr/` kommt. Nur wenn das Grillen nichts erbracht hat, den User direkt fragen. Datei-existiert-nicht ist davon ausgenommen, weil `/grill-with-docs` ohne die Datei nichts findet.
 
### Phase 2: `/grill-with-docs`
 
Pipeline-Stufe 1. Aufruf:
 
```
/grill-with-docs @notes.md
```
 
Erwartung: Der Command schleift die Aufgaben gegen die vorhandene Projekt-Doku, schärft Unklarheiten, ergänzt Kontext. Output ist eine refined Version der Aufgaben (entweder zurück in `notes.md`, in eine neue Datei oder als Inline-Output — je nachdem, wie `/grill-with-docs` konfiguriert ist).
 
Nach Rücklauf:
 
- **Erfolg:** Output zur Kenntnis nehmen, intern als "grilled" markieren, direkt zu Phase 3.
- **Command nicht gefunden / Fehler:** Sofort stoppen, im Report vermerken "`/grill-with-docs` nicht verfügbar oder fehlgeschlagen". Nicht versuchen, manuell zu grillen.
### Phase 3: `/to-prd`
 
Pipeline-Stufe 2. Aufruf:
 
```
/to-prd
```
 
(Erwartet typischerweise den geschliffenen Output aus Phase 2 als impliziten Input. Falls der Command einen expliziten Filepath braucht, den aus Phase 2 mitgeben.)
 
Erwartung: Der Command produziert ein PRD-Dokument (Markdown), das die Aufgaben strukturiert als Anforderungen formuliert.
 
Nach Rücklauf:
 
- **Erfolg:** PRD-Pfad / -Inhalt intern halten für Phase 4. Nicht dem User vorlegen, nicht "soll ich das so committen?" fragen.
- **Fehler:** Stoppen, Report mit "/to-prd fehlgeschlagen nach erfolgreichem /grill-with-docs". Den geschliffenen Output aus Phase 2 nicht verwerfen — im Report erwähnen, wo er liegt, damit der User später manuell weitermachen kann.
### Phase 4: `/to-issue`
 
Pipeline-Stufe 3. Aufruf:
 
```
/to-issue
```
 
Erwartung: Der Command nimmt das PRD aus Phase 3, schneidet es in einzelne GitHub Issues und veröffentlicht sie via `gh issue create` (oder vergleichbar) im aktuellen Repo.
 
Nach Rücklauf:
 
- **Erfolg:** Issue-Nummern und/oder URLs sammeln. Diese sind das einzige Deliverable, das den User wirklich interessiert.
- **Fehler:** Stoppen, Report mit "`/to-issue` fehlgeschlagen". Das PRD aus Phase 3 ist dann manuell publishbar — im Report den PRD-Pfad nennen.
### Phase 5: Final Report
 
Erst jetzt — nicht früher — Output an den User:
 
```
Pipeline durchgelaufen: <X> Issues aus notes.md veröffentlicht.
 
#142  feat(auth): JWT refresh           https://github.com/<org>/<repo>/issues/142
#143  fix(api): pagination off-by-one   https://github.com/<org>/<repo>/issues/143
#144  refactor(db): schema migration    https://github.com/<org>/<repo>/issues/144
 
PRD: <pfad-falls-persistiert>
```
 
Knapp. Keine Erklärungen, was die Pipeline gemacht hat — der User weiß das.
 
## `notes.md` nach erfolgreicher Pipeline
 
**Default:** `notes.md` nicht anfassen. Der User entscheidet selbst, ob er die abgearbeiteten Aufgaben löscht oder als History stehen lässt.
 
**Ausnahme:** Wenn der User explizit "notes.md leeren nach pipeline" oder ähnlich gesagt hat, am Ende:
 
```bash
: > notes.md
```
 
und im Report ergänzen "notes.md geleert."
 
Im Zweifel: nicht anfassen.
 
## Slash-Command-Nutzung
 
Diese Commands werden vorausgesetzt und gehören zum Standard-Setup:
 
- **`/grill-with-docs`** — Schärft Roh-Aufgaben gegen vorhandene Projektdokumentation.
- **`/to-prd`** — Wandelt geschliffene Aufgaben in ein strukturiertes PRD-Dokument.
- **`/to-issue`** — Schneidet ein PRD in einzelne GitHub Issues und published sie.
Falls einer der Commands fehlt: Pipeline an dieser Stelle abbrechen und im Report nennen. Nicht versuchen, den fehlenden Command manuell nachzubauen — der User hat die Commands aus einem Grund konfiguriert, und die manuelle Nachbildung würde unbemerkt andere Outputs erzeugen.
 
## Wann den User doch unterbrechen

**Grundregel:** Auch bei den folgenden Stop-Kriterien immer zuerst `/grill-with-docs` laufen lassen. Die Frage an den User ist die *letzte* Option, nicht die erste. Pro Stop-Kriterium:

- **`notes.md` existiert nicht** im aktuellen Workdir → `/grill-with-docs` versucht, die Datei anhand von Doku-Hinweisen zu lokalisieren. Findet es nichts: User fragen, wo die Datei liegt. (Ausnahme: Pfad-Findung ist nicht grill-bar.)
- **Repo nicht clean / kein Git-Repo** → `/grill-with-docs` gegen `CONTEXT.md` / `docs/adr/` laufen lassen, ob der erwartete Repo-Zustand (Branch, Working-Tree-Status, Auth-Setup) dokumentiert ist. Wenn ja, dem folgen statt zu fragen. Wenn nein: User fragen. `/to-issue` braucht ein Git-Repo mit `gh`-Zugang — das ist nicht grill-bar und muss gemeldet werden.
- **`gh` nicht authentifiziert** → `/grill-with-docs` versuchen, ob Auth-Setup-Notizen im Repo existieren (z. B. ADRs zu `gh` Login-Helfern). Wenn nein: User auffordern `gh auth login` zu laufen.
- **`notes.md` enthält offensichtlich Secrets** (API-Keys, Passwörter, Tokens — Pattern wie `sk_live_`, `ghp_`, `AKIA`, längere base64-Blocks): Stop, melden, **nicht** durch die Pipeline schieben. Sonst landet das Secret in Issues und damit potenziell öffentlich. (Hier ist Grillen Zeitverschwendung — der Secret-Fund ist offensichtlich.)
## Edge Cases
 
- **Pipeline aus `notes.md` mit nur einer einzigen Aufgabe:** Trotzdem volle Pipeline durchlaufen. `/to-issue` produziert dann eben nur 1 Issue, das ist OK.
- **`/grill-with-docs` produziert *nichts* (kein Output, leere Datei):** Behandeln wie Fehler in Phase 2 — stoppen, Report.
- **`/to-prd` produziert ein PRD mit 0 Anforderungen:** Behandeln wie Fehler in Phase 3 — stoppen, Report. Wahrscheinlich war `notes.md` zu vage.
- **Issues sollen in einem anderen Repo landen als dem aktuellen Workdir:** Nicht automatisch lösen. User hat den Skill in einem bestimmten Repo getriggert — das ist das Ziel-Repo. Wenn der User vorher explizit ein anderes Repo genannt hat, das berücksichtigen, sonst Default.
- **User wirft Pipeline ein zweites Mal an, ohne `notes.md` geändert zu haben:** Trotzdem volle Pipeline durchlaufen. Es ist nicht Aufgabe des Skills zu raten, ob der User das versehentlich macht — Duplikate sind möglich, der User hat es zweimal angewiesen.
## Anti-Patterns
 
- **NICHT** dem User das PRD aus Phase 3 vorlegen und fragen, ob es so okay ist. Die Pipeline ist fire-and-forget bis zum Final Report.
- **NICHT** Phase 1, 2 oder 3 mit eigenem Inhalt anreichern. Nichts dazudichten, was nicht in `notes.md` stand.
- **NICHT** versuchen, einzelne Phasen zu "verbessern" indem du den Slash-Command durch manuelle Bearbeitung ersetzt. Wenn ein Command fehlt: stoppen, melden, fertig.
- **NICHT** Issues mit "Generated by Claude" / "Co-Authored-By: Claude" o.ä. tagging, außer der User hat das explizit gewünscht.
- **NICHT** `notes.md` automatisch leeren oder löschen, außer explizit angewiesen.
- **NICHT** nach jeder Phase einen Zwischenstatus posten. Stille bis zum Final Report.
- **NICHT** den User direkt befragen, wenn die Antwort aus `CONTEXT.md` / `docs/adr/` kommen könnte — erst `/grill-with-docs` laufen lassen, dann entscheiden.
- **NICHT** direkt auf `main` committen — immer auf dem aktiven Branch committen (`git branch --show-current` prüfen). Kein `git push` ohne explizite Anweisung des Users.