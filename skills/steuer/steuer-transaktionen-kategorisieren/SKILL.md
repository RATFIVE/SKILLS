---
name: steuer-transaktionen-kategorisieren
description: Kategorisiert eine Transaktionsliste (PayPal-Export, Kontoauszug o. ä.) steuerlich in Betriebsausgabe/Privat/weitere projektspezifische Kategorien. Eindeutige Buchungen werden automatisch zugeordnet, unklare Positionen einzeln über den grilling-Skill mit dem User geklärt. Erzeugt/pflegt eine `<Jahr>_Steuerrelevante-<Quelle>-Ausgaben.md`-Datei und ruft danach steuer-index-aktualisieren auf. Nutze diesen Skill, wenn der User Transaktionen/Kontoauszüge/PayPal-Exporte steuerlich einordnen, "kategorisiere die Ausgaben", "geh die Transaktionen durch" o. ä. für ein Steuer-/Dokumentenarchiv sagt.
---

# Steuer-Transaktionen kategorisieren

## Overview

Transaktionsexporte (PayPal-Jahresübersicht, Kontoauszug, Kreditkartenabrechnung, …) enthalten eine Mischung aus eindeutig privaten, eindeutig geschäftlichen und unklaren Buchungen. Dieser Skill sortiert die eindeutigen Fälle automatisch vor und klärt nur die unklaren Positionen einzeln mit dem User — statt entweder alles zu erraten oder den User mit der kompletten Rohliste zu konfrontieren.

## Kategorien bestimmen

- **Erster Lauf in einem Projekt** (noch keine `*_Steuerrelevante-*.md`-Datei vorhanden): den User kurz fragen, welche Kategorien gelten sollen. Default-Vorschlag: `Betriebsausgabe` / `Privat`, plus Hinweis, dass weitere projektspezifische Kategorien sinnvoll sein können (z. B. `Studienkosten`, wenn parallel zu einem Gewerbe auch ein Studium läuft), falls die Zwei-Kategorien-Aufteilung zu grob wäre.
- **Folgeläufe:** existierende `*_Steuerrelevante-*.md`-Dateien im Projekt nach ihren Kategorienspalten durchsuchen und dieselben Kategorien wiederverwenden, damit über mehrere Jahre/Quellen konsistent kategorisiert wird. Nicht erneut fragen, außer der User will die Kategorien explizit ändern.

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
6. **Ablageort:** im Ordner der Quelle selbst (z. B. Kontoauszug der Bank X → Ordner der Bank X), nicht in einem thematisch anderen Ordner. Lässt sich die Quelle keinem bestehenden Institutions-Ordner eindeutig zuordnen, den User fragen, wo die Datei liegen soll.
7. **`steuer-index-aktualisieren` aufrufen**, falls eine neue Datei entstanden ist oder sich die Ordnerstruktur geändert hat.

## Sensible Inhalte

- Keine vollständigen IBANs, Kontonummern oder Kartennummern aus der Quelle in die Ergebnis-Datei übernehmen — nur Datum, Betrag, Kategorie, Name.
- Der Hinweis „Dies ist eine Vorsortierung, keine steuerliche Beratung" gehört an den Anfang jeder erzeugten Datei.

## Anti-Patterns

- **NICHT** bei unklarem Verwendungszweck raten, statt zu grillen — jede "?"-Position bekommt eine echte Rückfrage.
- **NICHT** mehrere offene Positionen in einer Frage bündeln. `grilling` ist strikt eine Frage nach der anderen.
- **NICHT** beim ersten Lauf eigenmächtig Kategorien erfinden, ohne den User kurz zu fragen.
- **NICHT** Antworten sammeln und die Datei erst ganz am Ende in einem Rutsch aktualisieren — nach jeder geklärten Position sofort patchen, damit der Zwischenstand jederzeit stimmt.
- **NICHT** vollständige Kontodaten/IBANs in die Ergebnis-Datei oder in Zwischenausgaben kopieren.
