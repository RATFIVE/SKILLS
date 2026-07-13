---
name: steuer-index-aktualisieren
description: Aktualisiert die `INDEX.md`-Übersicht eines Steuer-Dokumentenarchivs diff-basiert, wenn sich die Ordner-/Dateistruktur ändert (Datei verschoben, umbenannt, neuer Anlagen-Ordner, neues Steuerjahr). Wird von steuer-dokument-einsortieren, steuer-transaktionen-kategorisieren und steuer-struktur-anlegen am Ende ihres Ablaufs aufgerufen. Nutze diesen Skill auch direkt, wenn der User "aktualisiere INDEX.md", "Index updaten" oder ähnliches für ein Steuer-/Dokumentenarchiv sagt.
---

# Steuer-Index aktualisieren

## Overview

`INDEX.md` ist die Single Source of Truth für die **Struktur** eines
Dokumentenarchivs: welches Steuerjahr, welche Anlagen, welche Institutionen,
welche Dateien. Jede Struktur-Änderung — neue Datei einsortiert, Datei
umbenannt, Ordner angelegt — muss sich **im selben Arbeitsschritt** in `INDEX.md`
niederschlagen, sonst driftet die Übersicht auseinander und wird nutzlos.

Abgrenzung zu den anderen Meta-Dateien des Archivs:

| Datei | Beantwortet |
|---|---|
| `INDEX.md` | **Wo liegt was?** — Struktur des ganzen Archivs |
| `_UEBERSICHT.md` | **Was steht drin?** — Beträge und Summen *einer* Anlage |
| `SOUL.md` | **Wer ist der Nutzer?** — steuerliche Lebensumstände |

`INDEX.md` enthält deshalb **keine Beträge** — die stehen in den
`_UEBERSICHT.md`-Dateien und würden hier nur doppelt gepflegt und auseinander
driften.

Dieser Skill wird meist nicht direkt vom User aufgerufen, sondern von
`steuer-dokument-einsortieren`, `steuer-transaktionen-kategorisieren` oder
`steuer-struktur-anlegen` am Ende ihres Ablaufs mit einem Diff übergeben.

## Input

Der aufrufende Skill (oder der User) übergibt eine kurze Liste der Änderungen,
z. B.:

```
- NEU: 2025/10_Anlage_N/GEOMAR/2025_GEOMAR_Lohnunterlagen-....pdf (Sammeldokument, 21 Seiten)
- VERSCHOBEN: raw/Kontoauszüge.pdf → 2025/00_Quellen/Kreissparkasse-Waiblingen/2025_..._Jahresübersicht.pdf
- NEUER ORDNER: 2025/40_Anlage_Vorsorgeaufwand/VBL/
```

Ohne Diff (Direktaufruf ohne Angaben) → siehe „Full-Rebuild" unten.

## Workflow

1. **`INDEX.md` lesen** — nie den aktuellen Stand raten, immer erst einlesen.
2. **Drift-Check:** Referenziert der Diff Ordner/Dateien, die in der aktuellen
   `INDEX.md` gar nicht vorkommen, oder weicht die dokumentierte Struktur sichtbar
   vom Diff ab? → Full-Rebuild statt Patch (siehe unten).
3. **Diff-Modus (Normalfall):**
   - Betroffene Stelle(n) in der Tree-Übersicht (oberer Codeblock) und im
     zugehörigen `### <Ordner>/`-Abschnitt gezielt patchen.
   - Neuer Ordner → neue Zeile im Tree + neuer Abschnitt mit Kurzbeschreibung.
   - Neues Steuerjahr → neuer `## <Jahr>`-Block.
   - Verschobene/umbenannte Datei → alte Zeile entfernen, neue Zeile im
     Zielabschnitt einfügen.
   - Nichts an unbeteiligten Abschnitten verändern — auch keine Formulierungen
     "verbessern", die nicht Teil des Diffs sind.
   - `Stand: <heutiges Datum>` aktualisieren.
4. **Full-Rebuild-Modus (Fallback):**
   - Kompletten Ordnerbaum neu scannen, Tree-Diagramm und Abschnitte neu erzeugen.
   - Vorhandene, offensichtlich manuell verfasste Prosa/Hinweise (z. B.
     Duplikat-Hinweise, Warnungen zu abweichenden Rechnungsadressen) nach
     Möglichkeit aus der alten Version übernehmen statt zu verwerfen — nur die
     Struktur-Teile (Tree, Datei-Bullet-Listen) wirklich neu schreiben.
   - Auslöser: `INDEX.md` existiert noch nicht, oder der Drift-Check in Schritt 2
     hat angeschlagen.

## Konventionen für den Aufbau von `INDEX.md`

Als Beispiel (nicht hart vorgegeben — an das jeweilige Archiv anpassen, falls dort
schon ein anderes Format etabliert ist):

````markdown
# Übersicht – Steuer-Dokumentenarchiv

Stand: 2026-07-13

## Struktur

```
<Ordnerbaum als Codeblock, mit kurzem Kommentar pro Top-Level-Ordner>
```

## 2025

### 00_Quellen/

Rohquellen und Dokumente mit Bezug zu mehreren Anlagen. Werden aus den
`_UEBERSICHT.md` der jeweiligen Anlagen referenziert, nicht dupliziert.

- `Kreissparkasse-Waiblingen/2025_KSK_Jahresübersicht.pdf` – Kontoauszüge 01–12/2025,
  14 Seiten, enthält IBAN und vollständige Transaktionshistorie
- `GEOMAR/2025-01-31_GEOMAR_Lohnsteuerbescheinigung.pdf` – liefert an
  `10_Anlage_N/` und `40_Anlage_Vorsorgeaufwand/`

### 10_Anlage_N/

Nichtselbständige Arbeit. Summen siehe `10_Anlage_N/_UEBERSICHT.md`.

- `GEOMAR/2025-03-04_Notebooksbilliger_Rechnung-Monitor.pdf` – Arbeitsmittel
````

Die `_UEBERSICHT.md`-Dateien selbst werden im Tree geführt, ihr Inhalt aber nicht
nach `INDEX.md` gespiegelt — stattdessen pro Anlage ein Verweis auf sie.

## Sensible Inhalte

Bei Dateien mit Finanzdaten (Kontoauszüge, Steuerbescheinigungen,
Transaktionsexporte): in `INDEX.md` nur eine sachliche Kurzbeschreibung (Zeitraum,
Seitenzahl, "enthält IBAN/vollständige Transaktionshistorie"), niemals konkrete
Beträge, IBANs oder Buchungsdetails aus dem Dokument in die Übersicht kopieren.

## Anti-Patterns

- **NICHT** bei jedem Aufruf komplett neu schreiben, wenn ein gezielter Patch
  reicht — das verschluckt handgeschriebene Notizen und erzeugt unnötig große
  Diffs.
- **NICHT** unbeteiligte Abschnitte "nebenbei" umformulieren.
- **NICHT** Beträge oder Summen nach `INDEX.md` spiegeln — dafür gibt es
  `_UEBERSICHT.md`. Zwei Orte für dieselbe Zahl driften garantiert auseinander.
- **NICHT** Finanzdetails aus den Quelldokumenten in die Übersicht kopieren.
- **NICHT** einen Full-Rebuild ohne erkennbaren Auslöser (Drift oder fehlende
  Datei) durchführen.
