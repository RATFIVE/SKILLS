---
name: steuer-dokument-einsortieren
description: Liest den Inhalt loser, generisch benannter PDF-Dokumente (z. B. gescannte Behörden-, Arbeitgeber- oder Versicherungspost, Dumps in einem `raw/`-Ordner), benennt sie nach dem Schema `Datum_Absender_Betreff.pdf` um und sortiert sie in die passende Steuer-Anlage des jeweiligen Steuerjahres ein (`<Jahr>/NN_Anlage_X/<Institution>/`; Dokumente mit Mehrfach-Anlagenbezug nach `<Jahr>/00_Quellen/`). Ruft danach steuer-uebersicht und steuer-index-aktualisieren auf. Nutze diesen Skill, wenn der User "sortiere die Dokumente", "benenne die PDFs um", "räume den raw-Ordner auf" oder Vergleichbares für ein Steuer-/Dokumentenarchiv sagt.
---

# Steuer-Dokumente einsortieren

## Overview

Loses Zeug landet in einem Dokumentenarchiv meist mit nichtssagenden Dateinamen
(`BRN94DDF86BE974_001341.pdf`, Scanner-Exporte, `raw/*`). Dieser Skill liest den
tatsächlichen Inhalt, vergibt einen sprechenden Namen und legt die Datei bei der
Steuer-Anlage ab, in die sie später einfließt — danach ist sie über `INDEX.md`
auffindbar und ihre Beträge stehen in der `_UEBERSICHT.md` der Anlage.

## Konventionen ermitteln

Vor dem ersten Umbenennen: `CLAUDE.md` im Zielarchiv lesen (Namensschema,
Ordnerregeln, dokumentierte Ausnahmen) und `SOUL.md`, soweit für die
Anlagen-Zuordnung nötig. Existiert keine `CLAUDE.md` mit dokumentierten Regeln,
die Konvention aus der bestehenden Ordnerstruktur ableiten und **nicht**
stillschweigend eigene erfinden, die von vorhandenen Mustern abweichen.

Ist das Archiv noch gar nicht aufgesetzt (keine `CLAUDE.md`, keine
Anlagen-Ordner): erst `steuer-init` laufen lassen. Ohne `SOUL.md` ist nicht
entscheidbar, welche Anlagen es überhaupt geben darf.

## Zielstruktur

```
<Jahr>/00_Quellen/<Institution>/     # Rohquellen + Mehrfach-Anlagenbezug
<Jahr>/NN_Anlage_X/<Institution>/    # Bezug zu genau einer Anlage
<Jahr>/99_Privat/                    # steuerlich irrelevant
```

Die kanonische Anlagen-Nummerierung und das Mapping „Sachverhalt → Anlage" stehen
in der `REFERENCE.md` von `steuer-struktur-anlegen`. Dort steht auch die Liste der
wiederkehrenden Dokumente mit Mehrfachbezug.

## Workflow

1. **PDF-Inhalt lesen.**
   - Zuerst `pdftotext -f 1 -l 2 <datei> -` versuchen (schnell, funktioniert bei
     textbasierten PDFs).
   - Leeres Ergebnis (gescanntes/Bild-PDF) → mit dem Read-Tool direkt visuell
     lesen. Bei vielen Seiten (>~15) in Chunks über den `pages`-Parameter lesen,
     nicht in einem Rutsch.
   - Für Benennung und Zuordnung reichen meist die ersten 1–2 Seiten; nur bei
     mehrdeutigem Inhalt weitere Seiten prüfen.
2. **Absender, Datum, Betreff extrahieren.**
   - Volles Datum (`YYYY-MM-DD`), wenn das Dokument eins nennt.
   - Nur Jahres-Präfix (`YYYY`) bei Sammeldokumenten ohne einheitliches
     Tagesdatum (z. B. mehrere Monats-Abrechnungen in einer Datei).
3. **Steuerjahr bestimmen.** Maßgeblich ist das **Leistungs-/Bezugsjahr, nicht das
   Ausstellungsdatum**: Eine Beitragsbescheinigung vom 15.01.2026 über die
   Beiträge des Jahres 2025 gehört nach `2025/`. Ist das Bezugsjahr nicht
   eindeutig, die Datei zurückstellen statt zu raten.
4. **Anlage bestimmen** (der eigentliche Zuordnungsschritt):
   - **Genau eine Anlage** betroffen → `<Jahr>/NN_Anlage_X/<Institution>/`.
   - **Mehrere Anlagen** betroffen (Lohnsteuerbescheinigung → N *und*
     Vorsorgeaufwand) oder **Rohquelle** (Kontoauszug, PayPal-Jahresübersicht,
     Kreditkartenabrechnung) → `<Jahr>/00_Quellen/<Institution>/`. Die Datei wird
     **nie dupliziert**; die betroffenen Anlagen referenzieren sie aus ihrer
     `_UEBERSICHT.md`.
   - **Steuerlich irrelevant** → `<Jahr>/99_Privat/`.
   - **Passende Anlage existiert nicht im Archiv** → nicht einfach anlegen: Das
     heißt, dass `SOUL.md` den auslösenden Lebensumstand nicht kennt. Datei
     zurückstellen und im Abschlussbericht melden, damit `steuer-soul-pflegen` /
     `steuer-struktur-anlegen` nachziehen können.
5. **Umbenennen und verschieben.**
   - Schema: `Datum_Absender_Betreff.pdf`. Umlaute in Dateinamen erhalten,
     Leerzeichen im Betreff-Teil durch Bindestriche ersetzen. (Nur die
     Anlagen-**Ordner** sind ASCII.)
   - Bereits sinnvoll benannte Dateien **nicht** zwangsweise umbenennen — nur
     generisch benannte (Scanner-IDs, `raw/*`, durchnummerierte Exporte) brauchen
     einen neuen Namen.
6. **Batch ohne Einzel-Rückfrage durcharbeiten.** Erst am Ende eine kurze
   Zusammenfassung aller Umbenennungen/Verschiebungen ausgeben.
7. **`steuer-uebersicht` aufrufen** mit dem Diff — nur für die tatsächlich
   berührten Ordner, damit die Beträge der neuen Dokumente in die Summen der
   betroffenen Anlagen einfließen.
8. **`steuer-index-aktualisieren` aufrufen** mit der Liste der Änderungen
   (neu/verschoben/neuer Ordner).
9. Ist ein Quellordner (z. B. `raw/`) danach leer, kann er entfernt werden.

## Wann den User doch unterbrechen

Nur bei echter Mehrdeutigkeit nachfragen, nicht pro Datei präventiv:

- Inhalt trotz Lesen unklar/unleserlich (schlechter Scan, kein eindeutiger
  Absender erkennbar).
- Bezugsjahr nicht eindeutig bestimmbar.
- Anlagen-Zuordnung unklar, ohne klaren Favoriten — oder die passende Anlage
  existiert im Archiv gar nicht.
- Unklar, ob eine bereits vorhandene Datei ein Duplikat ist (nicht automatisch
  überschreiben oder löschen).

In diesen Fällen die betroffene Datei zurückstellen, den Rest des Batches trotzdem
fertig durcharbeiten, und die offenen Fälle in der Abschluss-Zusammenfassung
auflisten statt zu raten.

## Sensible Inhalte

Bei Dokumenten mit Finanzdaten (Kontoauszüge, Steuerbescheinigungen,
Gehaltsabrechnungen): Inhalte nicht wortwörtlich in Tool-Ausgaben,
Commit-Messages oder externe Systeme kopieren — nur so viel wiedergeben, wie für
Einsortierung/Zusammenfassung nötig ist.

## Anti-Patterns

- **NICHT** bei unklarem Absender, Bezugsjahr oder Anlagenbezug raten und trotzdem
  einsortieren — lieber zurückstellen und im Report nennen.
- **NICHT** ein Dokument mit Mehrfachbezug in mehrere Anlagen-Ordner kopieren. Es
  gehört genau einmal nach `00_Quellen/`.
- **NICHT** einen Anlagen-Ordner anlegen, den `steuer-struktur-anlegen` nicht
  vorgesehen hat — das ist ein Signal, dass `SOUL.md` unvollständig ist.
- **NICHT** nach dem Ausstellungsdatum ins Jahr einsortieren, wenn das
  Bezugsjahr ein anderes ist.
- **NICHT** bereits gut benannte Dateien ohne Grund umbenennen.
- **NICHT** eigene Ordner-/Namenskonventionen erfinden, wenn das Archiv (via
  `CLAUDE.md` oder bestehende Struktur) schon andere etabliert hat.
- **NICHT** `steuer-uebersicht` und `steuer-index-aktualisieren` vergessen — jede
  Struktur-Änderung geht am Ende durch beide.
- **NICHT** Quelldateien löschen, außer der Quellordner ist danach nachweislich
  leer.
