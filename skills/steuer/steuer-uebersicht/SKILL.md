---
name: steuer-uebersicht
description: Erzeugt und pflegt die `_UEBERSICHT.md` eines Anlagen-Ordners — eine Markdown-Spiegelung aller Dokumente im Ordner mit den steuerlich relevanten Beträgen, jeweils mit Beleg (Datei + Seite), sowie Summen pro Kategorie. Unsicher lesbare Werte werden als OFFEN markiert statt geraten. Läuft inkrementell nur über die berührten Ordner und wird von steuer-dokument-einsortieren am Ende aufgerufen. Nutze diesen Skill auch direkt, wenn der User "aktualisiere die Übersichten", "was sind die Summen für Anlage N", "_UEBERSICHT.md neu bauen" o. ä. sagt.
---

# Steuer-Übersicht pflegen

## Overview

`_UEBERSICHT.md` ist die Antwort auf die Frage „Was muss ich für diese Anlage ins
Formular eintragen — und woher kommt die Zahl?". Sie liegt in jedem
Anlagen-Ordner, listet dessen Dokumente in Markdown und zieht daraus die
steuerlich relevanten Beträge zu Summen pro Kategorie zusammen.

Damit ist sie die einzige Datei der Suite, die **Zahlen aus PDFs liest** — und
damit die einzige, die stillschweigend eine falsche Zahl in eine Steuererklärung
schleusen kann. Deshalb gilt hier eine härtere Regel als überall sonst:

> **Jede Zahl trägt ihren Beleg. Was nicht sicher lesbar ist, wird `OFFEN` —
> nie geschätzt, nie gerundet, nie aus dem Kontext erschlossen.**

Eine Summe, in die eine geratene Zahl einfließt, ist schlimmer als gar keine
Summe: Sie sieht korrekt aus.

## Arbeitsweise: inkrementell

Der Skill bekommt vom Aufrufer (meist `steuer-dokument-einsortieren`) einen Diff
— welche Dateien sind in welchen Ordnern dazugekommen. Daraus folgt:

- **Nur die berührten Ordner** anfassen. Ein Lauf, der drei PDFs nach
  `10_Anlage_N/` einsortiert hat, fasst `30_Anlage_KAP/` nicht an.
- **Nur die neuen Dateien lesen.** Bestehende Zeilen in `_UEBERSICHT.md` bleiben
  stehen; sie wurden bereits gelesen und ggf. vom User korrigiert. Erneutes
  Lesen kostet nur Zeit und überschreibt Korrekturen.
- **Summen komplett neu addieren**, aus den Zeilen der Tabelle — nicht den alten
  Summenwert plus Delta rechnen. Addition ist billig, ein mitgeschleppter
  Rundungs-/Übertragungsfehler teuer.

**Full-Rebuild** (alle Dateien des Ordners neu lesen) nur bei explizitem
Auftrag des Users, oder wenn `_UEBERSICHT.md` Dateien listet, die es nicht mehr
gibt bzw. Dateien im Ordner liegen, die sie nicht kennt (Drift, weil jemand
außerhalb der Skills verschoben hat).

## Workflow

1. **`CLAUDE.md` des Archivs lesen** (Konvention) und die vorhandene
   `_UEBERSICHT.md` des Ordners — nie den Stand annehmen.
2. **Neue Dokumente lesen.** Erst `pdftotext -f 1 -l 2 <datei> -`; leeres Ergebnis
   (Scan/Bild-PDF) → mit dem Read-Tool visuell lesen, bei vielen Seiten in Chunks
   über `pages`.
3. **Beträge extrahieren.** Pro Betrag festhalten: Position, Wert, Quelldatei,
   **Seitenzahl**. Was nicht zweifelsfrei lesbar ist → `OFFEN` mit kurzem Grund
   ("Scan unleserlich", "Feld mehrdeutig, könnte Brutto oder Netto sein").
4. **Fremdbelege aus `00_Quellen/` einbeziehen.** Dokumente mit Mehrfachbezug
   (Lohnsteuerbescheinigung, Kontoauszug) liegen nicht im Anlagen-Ordner. Die
   relevanten Zahlen trotzdem in die Summe ziehen und im Abschnitt
   „Fremdbelege" mit relativem Pfad ausweisen — siehe `REFERENCE.md` von
   `steuer-struktur-anlegen` für die Liste der wiederkehrenden Fälle.
5. **`_UEBERSICHT.md` schreiben/patchen** (Aufbau siehe unten).
6. **Summen neu berechnen.** Enthält eine Kategorie mindestens eine `OFFEN`-Zeile,
   wird ihre Summe sichtbar als unvollständig gekennzeichnet — nicht kommentarlos
   ohne den fehlenden Posten gebildet.
7. **Abschlussbericht** an den Aufrufer: berührte Ordner, neue Zeilen, und
   **alle `OFFEN`-Posten explizit auflisten**. Sie sind die einzige Stelle, an der
   der User noch handeln muss.

`99_Privat/` bekommt **keine** `_UEBERSICHT.md` und wird nie summiert.

## Aufbau von `_UEBERSICHT.md`

```markdown
# Übersicht – 10_Anlage_N (Nichtselbständige Arbeit)

Stand: 2026-07-13
Vorsortierung, keine steuerliche Beratung. Jede Zahl bitte gegen den Beleg prüfen.

## Summen

| Position | Betrag | Formular | Beleg |
|---|---|---|---|
| Bruttoarbeitslohn | 42.000,00 € | Anlage N, Zeile 6 | ../00_Quellen/GEOMAR/2025-01-31_GEOMAR_Lohnsteuerbescheinigung.pdf, S. 1 |
| Lohnsteuer | 6.230,00 € | Anlage N, Zeile 7 | ../00_Quellen/GEOMAR/2025-01-31_GEOMAR_Lohnsteuerbescheinigung.pdf, S. 1 |
| Arbeitsmittel | 249,00 € | Anlage N, Zeile 42 | GEOMAR/2025-03-04_Notebooksbilliger_Rechnung-Monitor.pdf, S. 1 |
| Entfernungspauschale | **OFFEN** | Anlage N, Zeile 31 | Fahrtkosten-Beleg unleserlich (schlechter Scan) |

⚠️ **Werbungskosten-Summe unvollständig** – 1 Position offen (Entfernungspauschale).
Bestätigte Werbungskosten: 249,00 €.

## Dokumente

- `GEOMAR/2025-03-04_Notebooksbilliger_Rechnung-Monitor.pdf` – Monitor, 249,00 € brutto, Kaufdatum 04.03.2025

## Fremdbelege (liegen in 00_Quellen/)

- `../00_Quellen/GEOMAR/2025-01-31_GEOMAR_Lohnsteuerbescheinigung.pdf`
  – liefert Bruttolohn und Lohnsteuer; die SV-Beiträge derselben Datei gehen in
  `40_Anlage_Vorsorgeaufwand/`.
```

Das Format ist ein Vorschlag, kein Gesetz — hat das Archiv (laut `CLAUDE.md`
oder bestehenden Dateien) bereits ein anderes etabliert, dieses beibehalten.
Nicht verhandelbar sind die drei Garantien: **Beleg pro Zahl**, **`OFFEN` statt
Schätzung**, **markierte Summe bei offenen Posten**.

## Sensible Inhalte

Beträge und Positionen gehören in `_UEBERSICHT.md` — sie ist ja genau dafür da.
**Nicht** übernommen werden IBANs, Kontonummern, Steuer-ID, Sozialversicherungs-
nummer und Geburtsdatum, auch wenn sie im Beleg stehen. Diese Angaben stehen
bereits in der referenzierten Quelldatei.

Beträge nicht in Commit-Messages, Tool-Ausgaben oder externe Systeme kopieren.

## Anti-Patterns

- **NICHT** eine Zahl schätzen, runden oder aus dem Kontext erschließen, wenn der
  Beleg sie nicht klar hergibt. `OFFEN` ist immer die richtige Antwort.
- **NICHT** eine Summe bilden, die eine `OFFEN`-Position stillschweigend
  überspringt — die Unvollständigkeit muss in der Datei stehen.
- **NICHT** eine Zahl ohne Datei **und Seitenzahl** eintragen. „Steht in der
  Lohnsteuerbescheinigung" ist kein Beleg.
- **NICHT** bei jedem Lauf alle Dokumente des Archivs neu lesen — inkrementell
  über die berührten Ordner, Full-Rebuild nur auf Ansage oder bei Drift.
- **NICHT** bestehende Zeilen überschreiben, die der User korrigiert haben
  könnte. Neue Dateien ergänzen, alte stehen lassen.
- **NICHT** Dokumente aus `00_Quellen/` in den Anlagen-Ordner kopieren, um sie
  „lokal" zu haben — sie werden referenziert, nicht dupliziert.
- **NICHT** `99_Privat/` summieren oder mit einer Übersicht versehen.
