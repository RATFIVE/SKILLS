---
name: steuer-transaktionen-kategorisieren
description: Kategorisiert eine Transaktionsliste (PayPal-Export, Kontoauszug o. ä.) steuerlich in Betriebsausgabe/Privat/weitere projektspezifische Kategorien. Eindeutige Buchungen werden automatisch zugeordnet, unklare Positionen einzeln über den grilling-Skill mit dem User geklärt. Erzeugt/pflegt eine `<Jahr>_Steuerrelevante-<Quelle>-Ausgaben.md`-Datei in `<Jahr>/00_Quellen/<Institution>/` und ruft danach steuer-uebersicht und steuer-index-aktualisieren auf. Nutze diesen Skill, wenn der User Transaktionen/Kontoauszüge/PayPal-Exporte steuerlich einordnen, "kategorisiere die Ausgaben", "geh die Transaktionen durch" o. ä. für ein Steuer-/Dokumentenarchiv sagt.
---

# Steuer-Transaktionen kategorisieren

## Overview

Transaktionsexporte (PayPal-Jahresübersicht, Kontoauszug, Kreditkartenabrechnung, …) enthalten eine Mischung aus eindeutig privaten, eindeutig geschäftlichen und unklaren Buchungen. Dieser Skill sortiert die eindeutigen Fälle automatisch vor und klärt nur die unklaren Positionen einzeln mit dem User — statt entweder alles zu erraten oder den User mit der kompletten Rohliste zu konfrontieren.

## Kategorien bestimmen

Eine Transaktionsquelle ist per Definition ein Dokument mit **Mehrfach-Anlagenbezug**
(dieselbe Kontoauszugs-PDF liefert Betriebsausgaben an die EÜR, Spenden an die
Sonderausgaben und Handwerkerrechnungen an die haushaltsnahen Aufwendungen).
Deshalb gilt: **Die Kategorien entsprechen den Anlagen-Ordnern des Steuerjahres.**

- **Erster Lauf in einem Archiv** (noch keine `*_Steuerrelevante-*.md`-Datei
  vorhanden): Kategorien aus den tatsächlich vorhandenen `<Jahr>/NN_Anlage_*/`-
  Ordnern ableiten (z. B. `Betriebsausgabe (22_Anlage_EUER)`,
  `Spende (41_Anlage_Sonderausgaben)`, `Haushaltsnah (70_…)`) — plus immer
  `Privat`. Diesen Vorschlag dem User einmal kurz zur Bestätigung vorlegen, statt
  ihn ungefragt zu setzen.
- **Folgeläufe:** existierende `*_Steuerrelevante-*.md`-Dateien im Archiv nach
  ihren Kategorienspalten durchsuchen und dieselben Kategorien wiederverwenden,
  damit über mehrere Jahre/Quellen konsistent kategorisiert wird. Nicht erneut
  fragen, außer der User will die Kategorien explizit ändern.
- Taucht eine Kategorie auf, für die es **keinen Anlagen-Ordner gibt**, ist das ein
  Signal, dass `SOUL.md` unvollständig ist (ein Lebensumstand fehlt). Im
  Abschlussbericht melden, nicht eigenmächtig einen Anlagen-Ordner anlegen.

## Workflow

1. **Quelle einlesen** (PDF/CSV-Transaktionsexport).
2. **Eindeutig irrelevante Buchungen rausfiltern**, bevor überhaupt kategorisiert wird: Handzahlungen an/von Privatpersonen, reine Konto-Auf-/Abbuchungen, offensichtlich private Ausgaben ohne jeden Klärungsbedarf (Streaming-Abos, Gaming, Lieferdienste, Event-Tickets, Glücksspiel, Kurzstrecken-Sharing). Vollständig zurückerstattete Buchungen ebenfalls rausrechnen. Diese Ausschlüsse kurz im Intro-Absatz der Ergebnis-Datei zusammenfassen, nicht einzeln in der Tabelle auflisten.
3. **Verbleibende Buchungen vorsortieren:**
   - Eindeutig zuordenbar (bekannter Gewerbe-Vendor, wiederkehrendes Abo mit klarem Zweck) → direkt in die passende Kategorie.
   - Alles andere → als offene/"?"-Position markieren.
4. **Ergebnis-Datei anlegen/aktualisieren**, Dateiname `<Jahr>_Steuerrelevante-<Quelle>-Ausgaben.md`, mit:
   - Haupttabelle (Datum, Betrag, Kategorie, Name) für die bestätigten/zu prüfenden Positionen.
   - Eine eigene Tabelle je Nicht-Haupt-Kategorie (z. B. „Private Ausgaben (aus zu prüfen aussortiert)", „Studienkosten") für Positionen, die im Klärungsprozess dorthin verschoben wurden.
   - Zusammenfassungstabelle mit Summe pro Kategorie.
   - Fußnoten für aggregierte/wiederkehrende Buchungen (z. B. 12 monatliche Abo-Abbuchungen als eine Zeile plus Einzelaufstellung in der Fußnote).
5. **Offene Positionen einzeln klären.** Für jede "?"-Position den `grilling`-Skill nutzen: eine Frage nach der anderen, mit eigener Einschätzung/Empfehlung, auf Antwort warten. Nach jeder Antwort **sofort** patchen — Zeile in die richtige Kategorie/Tabelle verschieben, betroffene Summen neu berechnen — statt Antworten zu sammeln und am Ende in einem großen Rutsch zu verarbeiten.
   - Bei Beträgen, die sich klar in Teilbeträge mit unterschiedlichem Zweck aufteilen lassen (z. B. eine aggregierte Buchung, die teils Gewerbe, teils privat ist), die Aufteilung anhand der vom User genannten Kriterien nachvollziehen und in der Fußnote dokumentieren.
6. **Ablageort:** neben der Quelle, also in `<Jahr>/00_Quellen/<Institution>/` (Kontoauszug der Bank X → Ordner der Bank X unter `00_Quellen/`). Die Ergebnis-Datei gehört **nicht** in einen Anlagen-Ordner, auch wenn die Mehrheit der Buchungen in eine einzige Anlage fällt — sie speist per Definition mehrere Anlagen. Maßgeblich für `<Jahr>` ist der Buchungszeitraum der Transaktionen.
7. **`steuer-uebersicht` aufrufen** für die Anlagen-Ordner, deren Kategorien in der Ergebnis-Datei vorkommen. Der Skill zieht die Kategorie-Summen als Fremdbeleg (relativer Pfad auf die `*_Steuerrelevante-*.md`) in die jeweilige `_UEBERSICHT.md`. Das ist der Schritt, der die Kategorisierung überhaupt in der Steuererklärung ankommen lässt — ohne ihn liegt eine hübsche Tabelle herum, die niemand liest.
8. **`steuer-index-aktualisieren` aufrufen**, falls eine neue Datei entstanden ist oder sich die Ordnerstruktur geändert hat.

## Sensible Inhalte

- Keine vollständigen IBANs, Kontonummern oder Kartennummern aus der Quelle in die Ergebnis-Datei übernehmen — nur Datum, Betrag, Kategorie, Name.
- Der Hinweis „Dies ist eine Vorsortierung, keine steuerliche Beratung" gehört an den Anfang jeder erzeugten Datei.

## Anti-Patterns

- **NICHT** bei unklarem Verwendungszweck raten, statt zu grillen — jede "?"-Position bekommt eine echte Rückfrage.
- **NICHT** mehrere offene Positionen in einer Frage bündeln. `grilling` ist strikt eine Frage nach der anderen.
- **NICHT** beim ersten Lauf eigenmächtig Kategorien erfinden, ohne den User kurz zu fragen.
- **NICHT** Antworten sammeln und die Datei erst ganz am Ende in einem Rutsch aktualisieren — nach jeder geklärten Position sofort patchen, damit der Zwischenstand jederzeit stimmt.
- **NICHT** vollständige Kontodaten/IBANs in die Ergebnis-Datei oder in Zwischenausgaben kopieren.
- **NICHT** die Ergebnis-Datei in einen Anlagen-Ordner legen. Sie speist mehrere Anlagen und gehört deshalb nach `00_Quellen/`.
- **NICHT** `steuer-uebersicht` überspringen — sonst landen die kategorisierten Summen nie in einer Anlage.
- **NICHT** eigenmächtig einen Anlagen-Ordner anlegen, wenn eine Kategorie keinen hat. Das gehört gemeldet, nicht behoben.
