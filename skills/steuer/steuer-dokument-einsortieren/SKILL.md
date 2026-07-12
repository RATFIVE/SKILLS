---
name: steuer-dokument-einsortieren
description: Liest den Inhalt loser, generisch benannter PDF-Dokumente (z. B. gescannte Behörden-, Arbeitgeber- oder Versicherungspost, Dumps in einem `raw/`-Ordner) und benennt sie nach dem Schema `Datum_Absender_Betreff.pdf` um, sortiert sie in den passenden Institutions-Ordner eines Dokumentenarchivs ein und ruft danach steuer-index-aktualisieren auf. Nutze diesen Skill, wenn der User "sortiere die Dokumente", "benenne die PDFs um", "räume den raw-Ordner auf" oder Vergleichbares für ein Steuer-/Dokumentenarchiv sagt.
---

# Steuer-Dokumente einsortieren

## Overview

Loses Zeug landet in einem Dokumentenarchiv meist mit nichtssagenden Dateinamen (`BRN94DDF86BE974_001341.pdf`, Scanner-Exporte, `raw/*`). Dieser Skill liest den tatsächlichen Inhalt, vergibt einen sprechenden Namen und legt die Datei im richtigen Institutions-Ordner ab — danach ist sie über `index.md` auffindbar.

## Konventionen ermitteln

Vor dem ersten Umbenennen: existierende `CLAUDE.md` im Zielprojekt lesen (Namensschema, Ordnerregeln, dokumentierte Ausnahmen wie ein verschachtelter Bereich für ein Gewerbe). Gibt es keine `CLAUDE.md` bzw. keine dort dokumentierten Regeln, aus der bestehenden Ordnerstruktur ableiten (ein Ordner pro Institution/Absender ist der sinnvolle Standard) und **nicht** stillschweigend eigene Konventionen erfinden, die von bereits vorhandenen Mustern abweichen.

## Workflow

1. **PDF-Inhalt lesen.**
   - Zuerst `pdftotext -f 1 -l 2 <datei> -` versuchen (schnell, funktioniert bei textbasierten PDFs).
   - Leeres Ergebnis (gescanntes/Bild-PDF) → mit dem Read-Tool direkt visuell lesen. Bei vielen Seiten (>~15) in Chunks über den `pages`-Parameter lesen, nicht in einem Rutsch.
   - Für die Benennung reichen meist die ersten 1–2 Seiten; nur bei mehrdeutigem Inhalt weitere Seiten prüfen.
2. **Absender, Datum, Betreff extrahieren.**
   - Volles Datum (`YYYY-MM-DD`), wenn das Dokument eins nennt.
   - Nur Jahres-Präfix (`YYYY`) bei Sammeldokumenten ohne einheitliches Tagesdatum (z. B. mehrere Monats-Abrechnungen in einer Datei).
3. **Zielordner bestimmen.**
   - Gegen bestehende Ordner im Archiv abgleichen (auch bei leicht abweichender Schreibweise des Absenders).
   - Dokumentierte Ausnahmen aus `CLAUDE.md` beachten (z. B. ein Themenbereich, der als Unterordner statt Top-Level geführt wird).
   - Kein passender Ordner vorhanden → neuen Ordner anlegen, nicht in einen unpassenden Sammelordner packen.
4. **Umbenennen und verschieben.**
   - Schema: `Datum_Absender_Betreff.pdf`. Umlaute erhalten, Leerzeichen im Betreff-Teil durch Bindestriche ersetzen.
   - Bereits sinnvoll benannte Dateien **nicht** zwangsweise umbenennen — nur generisch benannte (Scanner-IDs, `raw/*`, durchnummerierte Exporte) brauchen einen neuen Namen.
5. **Batch ohne Einzel-Rückfrage durcharbeiten.** Erst am Ende eine kurze Zusammenfassung aller Umbenennungen/Verschiebungen ausgeben.
6. **`steuer-index-aktualisieren` aufrufen** mit der Liste der vorgenommenen Änderungen (neu/verschoben/neuer Ordner).
7. Ist ein Quellordner (z. B. `raw/`) danach leer, kann er entfernt werden.

## Wann den User doch unterbrechen

Nur bei echter Mehrdeutigkeit nachfragen, nicht pro Datei präventiv:

- Inhalt trotz Lesen unklar/unleserlich (schlechter Scan, kein eindeutiger Absender erkennbar).
- Absender passt possibly zu mehreren bestehenden Ordnern, ohne klaren Favoriten.
- Unklar, ob eine bereits vorhandene Datei ein Duplikat ist (nicht automatisch überschreiben oder löschen).

In diesen Fällen die betroffene Datei zurückstellen, den Rest des Batches trotzdem fertig durcharbeiten, und die offenen Fälle in der Abschluss-Zusammenfassung auflisten statt zu raten.

## Sensible Inhalte

Bei Dokumenten mit Finanzdaten (Kontoauszüge, Steuerbescheinigungen, Gehaltsabrechnungen): Inhalte nicht wortwörtlich in Tool-Ausgaben, Commit-Messages oder externe Systeme kopieren — nur so viel wiedergeben, wie für Einsortierung/Zusammenfassung nötig ist.

## Anti-Patterns

- **NICHT** bei unklarem Absender raten und trotzdem einsortieren — lieber zurückstellen und im Report nennen.
- **NICHT** bereits gut benannte Dateien ohne Grund umbenennen.
- **NICHT** eigene Ordner-/Namenskonventionen erfinden, wenn das Projekt schon andere etabliert hat.
- **NICHT** `index.md` vergessen — jede Struktur-Änderung geht am Ende durch `steuer-index-aktualisieren`.
- **NICHT** Quelldateien löschen, außer der Quellordner ist danach nachweislich leer.
