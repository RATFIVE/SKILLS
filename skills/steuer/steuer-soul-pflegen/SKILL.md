---
name: steuer-soul-pflegen
description: Erstellt oder aktualisiert eine `SOUL.md` im Archiv-Root, die alle für die Steuererklärung relevanten persönlichen Lebensumstände bündelt (Familienstand, Studium/Ausbildung, Beschäftigungsverhältnisse, Gewerbe, Krankenversicherung, Kapitalerträge, Sonderausgaben) — teils aus dem bestehenden Dokumentenarchiv abgeleitet, teils über gezielte Rückfragen. Ruft danach steuer-index-aktualisieren auf. Nutze diesen Skill, wenn der User "erstelle/aktualisiere mein Profil", "SOUL.md", "grill mich zur Steuererklärung" o. ä. für ein Steuer-/Dokumentenarchiv sagt, oder wenn ein anderer Skill eine steuerrelevante persönliche Tatsache (Familienstand, Studienstatus, Kleinunternehmerregelung o. ä.) braucht, die noch nicht in SOUL.md steht.
---

# Steuer-SOUL pflegen

## Overview

`SOUL.md` ist das Gegenstück zu `index.md`: Während `index.md` beschreibt,
welche Dokumente wo liegen, beschreibt `SOUL.md`, wer der Nutzer steuerlich
ist — Lebensumstände, die sich teils aus den Dokumenten ablesen lassen
(Arbeitgeber, Beschäftigungszeiträume, Konfession, Adresse), teils nur der
Nutzer selbst kennt (Familienstand, Studienverlauf, Kleinunternehmerregelung,
Pendelstrecke, weitere Sonderausgaben). Der Skill kombiniert beides:
Archiv-Recherche für ableitbare Fakten, `grilling` für den Rest.

## Bestehenden Stand einlesen

- Existiert bereits eine `SOUL.md`? Erst lesen, nie den Inhalt annehmen. Bei
  einem Folgelauf (neues Steuerjahr, geänderte Lebensumstände) nur
  fehlende/veraltete Abschnitte ergänzen bzw. patchen — nicht von Null
  anfangen und nicht bereits geklärte Fakten erneut erfragen, außer sie sind
  erkennbar überholt (z. B. neuer Studienstatus, neuer Arbeitgeber).
- Kein `SOUL.md` vorhanden → kompletter Ersterstellungs-Durchlauf (siehe
  Workflow).

## Workflow

1. **Archiv nach ableitbaren Fakten durchsuchen.** `index.md` lesen (nicht
   raten), dann gezielt die Dokumenttypen öffnen, die typischerweise diese
   Fakten tragen: Lohnsteuerbescheinigungen/Entgeltabrechnungen (Arbeitgeber,
   Beschäftigungszeitraum, Konfession/Kirchensteuermerkmal, Steuerklasse,
   Kinderfreibetrag), Anmeldebestätigungen (Krankenkasse, Altersvorsorge,
   Wohnadresse), Gewerbe-Anmeldungen/-Ummeldungen (Tätigkeiten, Zeiträume,
   Betriebssitz), Jahressteuerbescheinigungen (Kapitalerträge). Gescannte
   PDFs mit dem Read-Tool visuell lesen (analog `steuer-dokument-einsortieren`),
   nicht pauschal jede Datei im Archiv öffnen.
2. **Lücken identifizieren.** Was lässt sich aus den Dokumenten nicht
   ableiten? Typisch: Familienstand/Kinder (wenn nicht eindeutig aus
   Steuerklasse ablesbar), Studienverlauf (Erst- vs. Zweitausbildung —
   entscheidet über Sonderausgaben- vs. Werbungskosten-Behandlung von
   Studienkosten), Kleinunternehmerregelung bei einem Gewerbe,
   Pendelstrecke/Verkehrsmittel, weitere Sonderausgaben (private
   Versicherungen, Spenden), außergewöhnliche Belastungen.
3. **Lücken über `grilling` klären.** Eine Frage nach der anderen, mit
   begründeter Empfehlung, auf Antwort warten, bevor die nächste Frage
   kommt — keine Sammel-Fragebögen.
4. **`SOUL.md` schreiben oder patchen.** Abschnitte: Persönliches Profil,
   Studium/Ausbildung, Beschäftigungsverhältnisse, ggf. Gewerbe,
   Krankenversicherung, Kapitalerträge, Sonderausgaben/außergewöhnliche
   Belastungen, Offene Punkte. Jede Aussage wo möglich mit einem relativen
   Pfad auf die Belegdatei versehen. Bei Folgeläufen gezielt patchen statt
   komplett neu zu schreiben (Full-Rewrite nur, wenn `SOUL.md` noch nicht
   existiert oder sichtbar veraltet/driftet).
5. **`steuer-index-aktualisieren` aufrufen**, wenn `SOUL.md` neu angelegt
   wurde (neuer Eintrag in `index.md` nötig). Bei reinem Inhalts-Update einer
   bereits gelisteten `SOUL.md` ohne Struktur-Änderung nicht nötig.

## Als Frage-Ressource für andere Skills

`SOUL.md` beantwortet steuerrelevante Personenfragen, die bei anderen
Aufgaben im selben Archiv auftauchen (z. B. bei
`steuer-transaktionen-kategorisieren`: "war das Studium zu dem Zeitpunkt
schon abgeschlossen?"). Vor einer Rückfrage an den User erst `SOUL.md`
konsultieren — steht die Antwort schon drin, nicht erneut fragen. Fehlt sie,
normal grillen und das Ergebnis in `SOUL.md` nachtragen, damit es beim
nächsten Mal nicht erneut fehlt.

## Sensible Inhalte

Keine Steuer-ID, Geburtsdatum, Rentenversicherungsnummer, IBANs oder
sonstigen eindeutigen Identifikatoren in `SOUL.md` übernehmen, auch wenn sie
in den Quelldokumenten stehen — nur Sachverhalte (z. B. "evangelisch,
kirchensteuerpflichtig" statt Steuer-ID). Diese Identifikatoren stehen
bereits in den referenzierten Quelldateien und müssen nicht dupliziert
werden.

## Anti-Patterns

- **NICHT** Fakten raten, die nicht sicher aus einem Dokument hervorgehen —
  im Zweifel grillen statt annehmen.
- **NICHT** bei jedem Aufruf komplett neu grillen, wenn eine bestehende
  `SOUL.md` die Antwort schon enthält.
- **NICHT** mehrere offene Punkte in einer `grilling`-Frage bündeln.
- **NICHT** sensible IDs (Steuer-ID, Geburtsdatum, RV-Nummer, IBANs) in
  `SOUL.md` schreiben.
- **NICHT** `steuer-index-aktualisieren` vergessen, wenn `SOUL.md` neu
  entsteht.
- **NICHT** Aussagen ohne Belegverweis stehen lassen, wenn ein Beleg im
  Archiv existiert.
