---
name: steuer-index-aktualisieren
description: Aktualisiert die `index.md`-Übersicht eines Dokumentenarchivs diff-basiert, wenn sich die Ordner-/Dateistruktur ändert (Datei verschoben, umbenannt, neuer Ordner angelegt). Wird von steuer-dokument-einsortieren und steuer-transaktionen-kategorisieren am Ende ihres Ablaufs aufgerufen. Nutze diesen Skill auch direkt, wenn der User "aktualisiere index.md", "index.md updaten" oder ähnliches für ein Steuer-/Dokumentenarchiv sagt.
---

# Steuer-Index aktualisieren

## Overview

`index.md` ist die Single Source of Truth für die Struktur eines Dokumentenarchivs (Ordner pro Institution, Dateibeschreibungen). Jede Struktur-Änderung — neue Datei einsortiert, Datei umbenannt, Ordner verschoben — muss sich **im selben Arbeitsschritt** in `index.md` niederschlagen, sonst driftet die Übersicht auseinander und wird nutzlos.

Dieser Skill wird meist nicht direkt vom User aufgerufen, sondern von `steuer-dokument-einsortieren` bzw. `steuer-transaktionen-kategorisieren` am Ende ihres Ablaufs mit einem Diff übergeben.

## Input

Der aufrufende Skill (oder der User) übergibt eine kurze Liste der Änderungen, z. B.:

```
- NEU: GEOMAR/2025_GEOMAR_Lohnunterlagen-....pdf (Sammeldokument, 21 Seiten)
- VERSCHOBEN: raw/Kontoauszüge.pdf → Kreissparkasse-Waiblingen/2025_..._Jahresübersicht.pdf
- NEUER ORDNER: VBL/
```

Ohne Diff (Direktaufruf ohne Angaben) → siehe „Full-Rebuild" unten.

## Workflow

1. **`index.md` lesen** — nie den aktuellen Stand raten, immer erst einlesen.
2. **Drift-Check:** Referenziert der Diff Ordner/Dateien, die in der aktuellen `index.md` gar nicht vorkommen, oder weicht die dokumentierte Struktur sichtbar vom Diff ab? → Full-Rebuild statt Patch (siehe unten).
3. **Diff-Modus (Normalfall):**
   - Betroffene Stelle(n) in der Tree-Übersicht (oberer Codeblock) und im zugehörigen `## <Ordner>/`-Abschnitt gezielt patchen.
   - Neuer Ordner → neue Zeile im Tree + neuer `##`-Abschnitt mit Kurzbeschreibung.
   - Verschobene/umbenannte Datei → alte Zeile entfernen, neue Zeile im Zielabschnitt einfügen.
   - Nichts an unbeteiligten Abschnitten verändern — auch keine Formulierungen "verbessern", die nicht Teil des Diffs sind.
   - `Stand: <heutiges Datum>` aktualisieren.
4. **Full-Rebuild-Modus (Fallback):**
   - Kompletten Ordnerbaum neu scannen, Tree-Diagramm und `##`-Abschnitte neu erzeugen.
   - Vorhandene, offensichtlich manuell verfasste Prosa/Hinweise (z. B. Abschnitte wie "Sonstiges", Duplikat-Hinweise, Warnungen zu abweichenden Rechnungsadressen) nach Möglichkeit aus der alten Version übernehmen statt zu verwerfen — nur die Struktur-Teile (Tree, Datei-Bullet-Listen) wirklich neu schreiben.
   - Auslöser: `index.md` existiert noch nicht, oder der Drift-Check in Schritt 2 hat angeschlagen.

## Konventionen für den Aufbau von `index.md`

Als Beispiel (nicht hart vorgegeben — an das jeweilige Projekt anpassen, falls dort schon ein anderes Format etabliert ist):

```
# Übersicht – Dokumentenablage <Jahr>

Stand: <Datum>

## Struktur

```
<Ordnerbaum als Codeblock, mit kurzem Kommentar pro Top-Level-Ordner>
```

## <Ordnername>/

<Ein bis zwei Sätze Kontext>

- `<Dateiname>` – <Kurzbeschreibung: was ist es, wichtige Kennzahlen/Daten>
```

## Sensible Inhalte

Bei Dateien mit Finanzdaten (Kontoauszüge, Steuerbescheinigungen, Transaktionsexporte): in `index.md` nur eine sachliche Kurzbeschreibung (Zeitraum, Seitenzahl, "enthält IBAN/vollständige Transaktionshistorie"), niemals konkrete Beträge, IBANs oder Buchungsdetails aus dem Dokument in die Übersicht kopieren.

## Anti-Patterns

- **NICHT** bei jedem Aufruf komplett neu schreiben, wenn ein gezielter Patch reicht — das verschluckt handgeschriebene Notizen und erzeugt unnötig große Diffs.
- **NICHT** unbeteiligte Abschnitte "nebenbei" umformulieren.
- **NICHT** Finanzdetails aus den Quelldokumenten in die Übersicht kopieren.
- **NICHT** einen Full-Rebuild ohne erkennbaren Auslöser (Drift oder fehlende Datei) durchführen.
