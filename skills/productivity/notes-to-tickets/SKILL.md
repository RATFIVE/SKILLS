---
name: notes-to-tickets
description: Verarbeitet die in `notes.md` bzw. `NOTES.md` gesammelten Aufgaben durch die komplette Pipeline `/grill-with-docs` → `/to-spec` → `/to-tickets`, sodass aus Roh-Notizen am Ende ein Spec-Issue und veröffentlichte Tickets im Issue-Tracker werden. Nutze diesen Skill IMMER, wenn der User auf `notes.md` oder `NOTES.md` verweist und sagt "implementiere notes.md", "implementiere NOTES.md", "notes durch die pipeline", "notes zu issues", "notes zu tickets", "@notes.md abarbeiten", "@NOTES.md abarbeiten", "issues aus notes", "tickets aus notes" oder ähnliches — auch wenn er nur einen Teil der Slash-Commands nennt, da `/grill-with-docs`, `/to-spec` und `/to-tickets` zum Standard-Workflow gehören. Auch triggern, wenn der User einfach `@notes.md` oder `@NOTES.md` ohne weitere Erklärung droppt. **Rückfragen laufen über die Checkpoints der Pipeline** — erst das Grilling, dann die Checkpoints von `/to-spec` und `/to-tickets`; dazwischen keine eigenen Fragen.
---
 
# Notes-to-Tickets Pipeline
 
Verarbeitung von Roh-Aufgaben aus der Notes-Datei zu veröffentlichten Tickets im Issue-Tracker. Der User gibt *eine* Anweisung, beantwortet die Fragen an den Checkpoints der Pipeline — und bekommt am Ende die Issue-Links.

**Notes-Datei:** `notes.md` und `NOTES.md` sind gleichwertig. Gemeint ist immer die Datei, die im Projekt tatsächlich existiert. Im Folgenden steht `$NOTES` für ihren echten Dateinamen.

**Pipeline-Skills von Matt Pocock:** `/grill-with-docs`, `/to-spec` und `/to-tickets` stammen aus [mattpocock/skills](https://github.com/mattpocock/skills) und sind mit `disable-model-invocation: true` markiert — das Skill-Tool kann sie nicht aufrufen. Stattdessen ihre `SKILL.md` lesen und den Anweisungen darin exakt folgen:

```bash
SKILLS=~/.agents/skills   # Fallback: ~/.claude/skills
cat $SKILLS/to-spec/SKILL.md
```

`/grill-with-docs` selbst sagt nur: Skill-Tool zweimal aufrufen, für `grilling` und `domain-modeling`. Das direkt so tun.
 
## Kernprinzipien

1. **Eine Pipeline, drei Stationen.** Reihenfolge ist hart: `/grill-with-docs` → `/to-spec` → `/to-tickets`. Kein Überspringen, keine Vertauschung.
2. **Checkpoints sind gewollt.** Die Pipeline hält genau an diesen Stellen an und fragt den User:
   - im **Grilling** von `/grill-with-docs` (Interview zu Plan und Domäne),
   - bei `/to-spec`, wenn die **Test-Seams** bestätigt werden,
   - bei `/to-tickets`, wenn der **Ticket-Schnitt** (Granularität, Blocking-Edges) freigegeben wird.
   Darüber hinaus keine eigenen Zwischenfragen und keine Statusmeldungen. Status nur intern als TodoList.
3. **Notes-Datei ist Single Source of Truth.** Alles, was verarbeitet wird, kommt aus der Notes-Datei und den Antworten im Grilling. Keine eigenen Aufgaben dazu erfinden, keine "schlauen" Ergänzungen.
4. **Spec ist Zwischenergebnis, kein Deliverable.** `/to-spec` veröffentlicht den Spec als Issue — er ist Parent und Input für `/to-tickets`, wird aber nicht groß zelebriert.
5. **Failure isoliert.** Wenn eine Stage scheitert, sauberer Stopp mit klarem Bericht, was bis wohin lief. Nicht "irgendwie weitermachen".
6. **Doku vor Frage.** Bevor im Grilling eine Frage an den User geht: prüfen, ob `GLOSSARY.md` oder `docs/adr/` sie schon beantworten. Nur fragen, was die Doku nicht hergibt.

## Workflow
 
### Phase 1: Notes einlesen & sanity-check
 
```bash
NOTES=$(ls | grep -ixF 'notes.md')   # echter Dateiname: notes.md oder NOTES.md
[ -n "$NOTES" ] || { echo "notes.md / NOTES.md fehlt"; exit 1; }
wc -l $NOTES
```

Liefert `grep` zwei Treffer (beide Varianten existieren, nur auf case-sensitiven Dateisystemen möglich): beide Dateien lesen und als eine gemeinsame Notes-Quelle behandeln.

Lies `$NOTES` einmal komplett. Prüfe:
 
- **Ist die Datei leer?** → Sofort melden "$NOTES ist leer — nichts zu tun." und stoppen.
- **Enthält sie überhaupt Aufgaben oder nur Stichworte?** → Bei reinen Stichworten (< 3 Wörter pro Zeile) trotzdem weitermachen, das Grilling ist dafür da, sie auszuformulieren.
- **Sind Aufgaben grob abgrenzbar (Listen, Headings, Leerzeilen)?** → Falls ja, intern notieren, ob es eine oder mehrere logische Einheiten gibt. Das beeinflusst nicht den Pipeline-Aufruf, hilft aber später beim Final-Report.

Prüfe außerdem, ob das Repo für Matts Skills eingerichtet ist:

```bash
test -f docs/agents/issue-tracker.md || echo "Repo nicht eingerichtet"
```

Die Datei schreibt `/setup-matt-pocock-skills`. Sie legt fest, wohin Specs und Tickets gehen (GitHub, GitLab oder lokale Dateien unter `.scratch/`). Fehlt sie, stoppen und den User bitten, `/setup-matt-pocock-skills` laufen zu lassen — ohne diese Konfiguration wissen `/to-spec` und `/to-tickets` nicht, wohin sie veröffentlichen.
 
### Phase 2: `/grill-with-docs` — Checkpoint 1

Pipeline-Stufe 1. Skill-Tool zweimal aufrufen, für `grilling` und `domain-modeling`, mit dem Inhalt von `$NOTES` als Plan, der gegrillt wird.

Erwartung: Ein Interview mit dem User, das die Aufgaben gegen die Projekt-Doku (`GLOSSARY.md`, `docs/adr/`) schärft. Neue Begriffe landen im Glossar, neue Architekturentscheidungen als ADR. Am Ende steht ein geklärter Plan im Gesprächskontext.
 
Nach Rücklauf:
 
- **Erfolg:** Intern als "grilled" markieren, direkt zu Phase 3.
- **Skill nicht gefunden / Fehler:** Sofort stoppen, im Report vermerken "`/grill-with-docs` nicht verfügbar oder fehlgeschlagen". Nicht versuchen, ohne die Skills zu grillen.

### Phase 3: `/to-spec` — Checkpoint 2

Pipeline-Stufe 2. `to-spec/SKILL.md` lesen und befolgen.

Erwartung: Der Skill synthetisiert den Spec aus dem Gesprächskontext (kein neues Interview), lässt den User die **Test-Seams** bestätigen und veröffentlicht den Spec als Issue im konfigurierten Tracker mit dem Label `ready-for-agent`.
 
Nach Rücklauf:
 
- **Erfolg:** Spec-Issue (Nummer/URL) intern halten für Phase 4.
- **Fehler:** Stoppen, Report mit "`/to-spec` fehlgeschlagen nach erfolgreichem `/grill-with-docs`". Die Ergebnisse des Grillings (Glossar-/ADR-Änderungen) bleiben bestehen — im Report erwähnen, damit der User später manuell weitermachen kann.

### Phase 4: `/to-tickets` — Checkpoint 3

Pipeline-Stufe 3. `to-tickets/SKILL.md` lesen und befolgen, mit dem Spec-Issue aus Phase 3 als Referenz.

Erwartung: Der Skill schneidet den Spec in Tracer-Bullet-Tickets mit Blocking-Edges, legt dem User den **Ticket-Schnitt** zur Freigabe vor und veröffentlicht die Tickets danach — bei einem echten Tracker als Sub-Issues des Spec-Issues, lokal als Dateien unter `.scratch/<feature-slug>/issues/`.
 
Nach Rücklauf:
 
- **Erfolg:** Ticket-Nummern und/oder URLs bzw. Pfade sammeln. Diese sind das Deliverable, das den User wirklich interessiert.
- **Fehler:** Stoppen, Report mit "`/to-tickets` fehlgeschlagen". Das Spec-Issue aus Phase 3 bleibt bestehen — im Report verlinken.

### Phase 5: Final Report
 
Erst jetzt Output an den User:
 
```
Pipeline durchgelaufen: <X> Tickets aus $NOTES veröffentlicht.

Spec: #141  https://github.com/<org>/<repo>/issues/141

#142  JWT refresh                 (blocked by: —)     https://github.com/<org>/<repo>/issues/142
#143  Pagination off-by-one       (blocked by: #142)  https://github.com/<org>/<repo>/issues/143
#144  Schema migration            (blocked by: —)     https://github.com/<org>/<repo>/issues/144
```
 
Knapp. Keine Erklärungen, was die Pipeline gemacht hat — der User weiß das.
 
## Notes-Datei nach erfolgreicher Pipeline
 
**Default:** `$NOTES` nicht anfassen. Der User entscheidet selbst, ob er die abgearbeiteten Aufgaben löscht oder als History stehen lässt.
 
**Ausnahme:** Wenn der User explizit "notes leeren nach pipeline" oder ähnlich gesagt hat, am Ende:
 
```bash
: > $NOTES
```
 
und im Report ergänzen "$NOTES geleert."
 
Im Zweifel: nicht anfassen.
 
## Pipeline-Skills
 
Diese Skills aus [mattpocock/skills](https://github.com/mattpocock/skills) werden vorausgesetzt (installiert über `update-skills.sh`):
 
- **`/grill-with-docs`** — Interview, das einen Plan schärft und dabei Glossar (`GLOSSARY.md`) und ADRs (`docs/adr/`) pflegt. Ruft `grilling` + `domain-modeling` auf.
- **`/to-spec`** — Synthetisiert aus dem Gespräch einen Spec und veröffentlicht ihn als Issue.
- **`/to-tickets`** — Schneidet einen Spec in Tracer-Bullet-Tickets mit Blocking-Edges und veröffentlicht sie.
- **`/setup-matt-pocock-skills`** — Einmalige Einrichtung pro Repo: Issue-Tracker und Triage-Labels.

Falls einer der Skills fehlt: Pipeline an dieser Stelle abbrechen und im Report nennen. Nicht versuchen, den fehlenden Skill aus dem Gedächtnis nachzubauen — die manuelle Nachbildung würde unbemerkt andere Outputs erzeugen. Hinweis an den User: `./update-skills.sh` laufen lassen.
 
## Wann den User außerhalb der Checkpoints unterbrechen

Nur bei diesen Stop-Kriterien. Vorher prüfen, ob `GLOSSARY.md` / `docs/adr/` die Antwort schon liefern:

- **Weder `notes.md` noch `NOTES.md` existiert** im aktuellen Workdir → User fragen, wo die Datei liegt.
- **Repo nicht für Matts Skills eingerichtet** → User bitten, `/setup-matt-pocock-skills` laufen zu lassen.
- **Repo nicht clean / kein Git-Repo** → Ist der erwartete Repo-Zustand (Branch, Working-Tree-Status) in `docs/adr/` dokumentiert, dem folgen. Sonst User fragen.
- **`gh` nicht authentifiziert** (bei GitHub als Tracker) → User auffordern, `gh auth login` zu laufen.
- **Die Notes-Datei enthält offensichtlich Secrets** (API-Keys, Passwörter, Tokens — Pattern wie `sk_live_`, `ghp_`, `AKIA`, längere base64-Blocks): Stop, melden, **nicht** durch die Pipeline schieben. Sonst landet das Secret in Issues und damit potenziell öffentlich.

## Edge Cases
 
- **Pipeline aus der Notes-Datei mit nur einer einzigen Aufgabe:** Trotzdem volle Pipeline durchlaufen. `/to-tickets` produziert dann eben nur 1 Ticket, das ist OK.
- **Grilling bringt nichts Neues (Plan war schon klar):** Kein Fehler — direkt weiter zu Phase 3.
- **`/to-spec` produziert einen Spec ohne User Stories:** Behandeln wie Fehler in Phase 3 — stoppen, Report. Wahrscheinlich war die Notes-Datei zu vage und das Grilling zu kurz.
- **User lehnt den Ticket-Schnitt mehrfach ab:** Gehört zu Checkpoint 3 — iterieren, bis der User freigibt. Kein Abbruch.
- **Issues sollen in einem anderen Repo landen als dem aktuellen Workdir:** Nicht automatisch lösen. User hat den Skill in einem bestimmten Repo getriggert — das ist das Ziel-Repo. Wenn der User vorher explizit ein anderes Repo genannt hat, das berücksichtigen, sonst Default.
- **User wirft Pipeline ein zweites Mal an, ohne die Notes-Datei geändert zu haben:** Trotzdem volle Pipeline durchlaufen. Es ist nicht Aufgabe des Skills zu raten, ob der User das versehentlich macht — Duplikate sind möglich, der User hat es zweimal angewiesen.

## Anti-Patterns
 
- **NICHT** zusätzlich zu den drei Checkpoints eigene Fragen stellen ("soll ich den Spec so veröffentlichen?"). Die Checkpoints der Pipeline-Skills reichen.
- **NICHT** die Checkpoints überspringen — weder das Grilling noch die Seam-Bestätigung noch die Freigabe des Ticket-Schnitts.
- **NICHT** Phase 2, 3 oder 4 mit eigenem Inhalt anreichern. Nichts dazudichten, was weder in der Notes-Datei stand noch im Grilling geklärt wurde.
- **NICHT** einen Pipeline-Skill aus dem Gedächtnis nachbauen. Immer die aktuelle `SKILL.md` lesen — Matt ändert die Skills regelmäßig.
- **NICHT** Issues mit "Generated by Claude" / "Co-Authored-By: Claude" o.ä. tagging, außer der User hat das explizit gewünscht.
- **NICHT** die Notes-Datei automatisch leeren oder löschen, außer explizit angewiesen.
- **NICHT** nach jeder Phase einen Zwischenstatus posten. Außerhalb der Checkpoints Stille bis zum Final Report.
- **NICHT** direkt auf `main` committen (z. B. Glossar-/ADR-Änderungen aus dem Grilling) — immer auf dem aktiven Branch committen (`git branch --show-current` prüfen). Kein `git push` ohne explizite Anweisung des Users.
