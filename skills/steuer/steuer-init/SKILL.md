---
name: steuer-init
description: Einstiegspunkt für ein neues Steuer-Dokumentenarchiv. Fährt die komplette Kette an — `CLAUDE.md` mit der Archiv-Konvention schreiben, dann steuer-soul-pflegen (SOUL.md), steuer-struktur-anlegen (Jahres-/Anlagen-Ordner) und steuer-index-aktualisieren (INDEX.md) — sodass am Ende ein leeres, aber vollständig vorbereitetes Archiv steht, in das Dokumente einsortiert werden können. Nutze diesen Skill, wenn der User "ich will meine Steuererklärung vorbereiten", "richte mein Steuerarchiv ein", "fang mit der Steuer an", "/steuer-init" o. ä. sagt, oder ein Ordner mit losen Steuerunterlagen ohne jede Struktur vorliegt.
---

# Steuer-Archiv initialisieren

## Overview

Dieser Skill ist der **Einstiegspunkt** der Steuer-Suite und enthält bewusst
kaum eigene Logik. Seine Aufgabe ist die Reihenfolge: Erst muss feststehen, *wer*
der Nutzer steuerlich ist (`SOUL.md`), daraus folgt, *welche Anlagen* er braucht
(Ordnerstruktur), und erst dann kann irgendetwas einsortiert werden. Wer die
Reihenfolge umdreht, sortiert Dokumente in Ordner, die es nicht geben dürfte.

Die inhaltliche Arbeit machen die aufgerufenen Skills. Was hier steht, ist der
Ablauf und die Konvention, die alle anderen später wiederfinden müssen.

**Kein Steuerberater-Ersatz.** Die Suite bereitet Unterlagen vor und rechnet
Summen zusammen. Sie ersetzt keine steuerliche Beratung.

## Vorher prüfen: gibt es das Archiv schon?

- **`CLAUDE.md` oder `SOUL.md` im Zielordner vorhanden** → das Archiv ist bereits
  initialisiert. **Nicht** neu aufsetzen und nichts überschreiben. Stattdessen
  fragen, was eigentlich gebraucht wird, und direkt an den richtigen Skill
  übergeben: neues Steuerjahr → `steuer-struktur-anlegen`, geänderte
  Lebensumstände → `steuer-soul-pflegen`, lose Dokumente → 
  `steuer-dokument-einsortieren`.
- **Ordner enthält bereits Dokumente in einer eigenen Struktur** → diese Struktur
  lesen und in der `CLAUDE.md` dokumentieren, statt sie stillschweigend
  umzubauen. Ein Umbau bestehender Ablagen ist eine eigene Entscheidung des
  Users, kein Nebeneffekt von `steuer-init`.

## Workflow

1. **Archiv-Root und Steuerjahr klären.** Wo liegt das Archiv, für welches Jahr
   wird erklärt? Nicht ableitbar → fragen. Nicht das aktuelle Kalenderjahr
   annehmen; Erklärungen werden fast immer rückwirkend gemacht.
2. **`CLAUDE.md` im Archiv-Root schreiben** (Template unten). Sie ist der Träger
   der Konvention: Alle anderen Skills lesen sie, bevor sie Ordner- oder
   Namensentscheidungen treffen. Ohne sie fallen sie auf Vermutungen zurück.
3. **`steuer-soul-pflegen` aufrufen** → `SOUL.md`. Der Skill grillt den User zu
   seinen Lebensumständen (eine Frage nach der anderen) und leitet ab, was sich
   aus schon vorhandenen Dokumenten ablesen lässt. **Hier wird nicht abgekürzt** —
   jede Lücke in `SOUL.md` wird später zu einer fehlenden Anlage.
4. **`steuer-struktur-anlegen` aufrufen** → `<Jahr>/00_Quellen/`,
   `<Jahr>/NN_Anlage_*/` je Anlage, `<Jahr>/99_Privat/`, `raw/`.
5. **`steuer-index-aktualisieren` aufrufen** → `INDEX.md` über das ganze Archiv.
6. **Abschlussbericht:** Welche Anlagen wurden angelegt und warum (welcher Fakt aus
   `SOUL.md` hat sie ausgelöst), welche bewusst nicht. Danach der nächste Schritt
   für den User: Unterlagen nach `raw/` legen und
   `steuer-dokument-einsortieren` laufen lassen.

## `CLAUDE.md`-Template für das Archiv

Beim Schreiben an das konkrete Archiv anpassen (Jahre, tatsächlich angelegte
Anlagen), aber die Regeln inhaltlich beibehalten — die anderen Skills verlassen
sich darauf.

````markdown
# Steuer-Dokumentenarchiv

Gepflegt mit der `steuer-*`-Skill-Suite. Diese Datei ist die verbindliche
Konvention des Archivs; die Skills lesen sie, bevor sie Ordner- oder
Namensentscheidungen treffen.

## Struktur

```
<Archiv>/
├── CLAUDE.md      # diese Datei
├── SOUL.md        # steuerliches Personenprofil, jahresübergreifend
├── INDEX.md       # Struktur-Index über das ganze Archiv
├── raw/           # Eingang für neue Dokumente, jahresübergreifend
└── <Jahr>/
    ├── 00_Quellen/<Institution>/     # Rohquellen + Dokumente mit Mehrfachbezug
    ├── NN_Anlage_*/                  # je Steuer-Anlage
    │   ├── _UEBERSICHT.md            # Summen mit Belegverweis
    │   └── <Institution>/            # Belege dieser Anlage, nach Absender
    └── 99_Privat/                    # steuerlich irrelevant, wird nie summiert
```

## Regeln

1. **Vom Agenten gepflegte Dateien sind GROSS geschrieben** (`CLAUDE.md`,
   `SOUL.md`, `INDEX.md`, `_UEBERSICHT.md`) und dadurch von den eigentlichen
   Dokumenten unterscheidbar. Umlaute darin als `UE`/`OE`/`AE` (Cloud-Sync).
2. **Dokumente heißen `Datum_Absender_Betreff.pdf`** (`2025-01-31_GEOMAR_
   Lohnsteuerbescheinigung.pdf`). Umlaute bleiben erhalten, Leerzeichen im
   Betreff werden zu Bindestrichen. Volles Datum `YYYY-MM-DD`, bei
   Sammeldokumenten ohne einheitliches Tagesdatum nur `YYYY`.
3. **Ablageort nach Anlagenbezug:**
   - Bezug zu **genau einer** Anlage → `<Jahr>/NN_Anlage_X/<Institution>/`
   - Bezug zu **mehreren** Anlagen oder Rohquelle (Kontoauszug, PayPal-Export)
     → `<Jahr>/00_Quellen/<Institution>/`. Die `_UEBERSICHT.md` der betroffenen
     Anlagen verweist per relativem Pfad darauf. **Nie duplizieren.**
   - Steuerlich irrelevant → `<Jahr>/99_Privat/`
4. **Maßgeblich für das Jahr ist das Leistungs-/Bezugsjahr**, nicht das
   Ausstellungsdatum. Eine Bescheinigung vom Januar 2026 über das Jahr 2025
   gehört nach `2025/`.
5. **Anlagen-Nummern sind fix, nicht fortlaufend.** Lücken (`10_`, `30_`, `99_`)
   sind gewollt: Anlage N heißt in jedem Jahr `10_Anlage_N`. Die kanonische
   Nummernvergabe steht in der `REFERENCE.md` von `steuer-struktur-anlegen`.
6. **Jede Struktur-Änderung schlägt sich im selben Arbeitsschritt in `INDEX.md`
   nieder** (via `steuer-index-aktualisieren`), sonst driftet die Übersicht.
7. **Jede Zahl in einer `_UEBERSICHT.md` trägt ihren Beleg** (Datei + Seite).
   Nicht sicher Lesbares wird `OFFEN` — nie geschätzt.
8. **Keine sensiblen Identifikatoren** (Steuer-ID, IBAN, Geburtsdatum,
   RV-Nummer) in `SOUL.md`, `INDEX.md` oder `_UEBERSICHT.md` übernehmen. Sie
   stehen in den Quelldokumenten und müssen nicht dupliziert werden.

## Workflow

| Situation | Skill |
|---|---|
| Neue Unterlagen liegen in `raw/` | `steuer-dokument-einsortieren` |
| Kontoauszug/PayPal-Export einordnen | `steuer-transaktionen-kategorisieren` |
| Neues Steuerjahr beginnt | `steuer-struktur-anlegen` |
| Lebensumstände haben sich geändert | `steuer-soul-pflegen` |
| Summen sollen neu gezogen werden | `steuer-uebersicht` |
````

## Anti-Patterns

- **NICHT** ein bereits initialisiertes Archiv neu aufsetzen oder eine bestehende
  `CLAUDE.md`/`SOUL.md` überschreiben — prüfen, dann an den passenden Skill
  übergeben.
- **NICHT** eine bestehende, gewachsene Ablage stillschweigend auf die
  Anlagen-Struktur umbauen. Erst fragen.
- **NICHT** die Reihenfolge drehen. Ohne `SOUL.md` keine Struktur, ohne Struktur
  kein Einsortieren.
- **NICHT** die Grill-Fragen zu den Lebensumständen selbst stellen — das ist
  `steuer-soul-pflegen`. Zwei Stellen mit Grill-Logik driften auseinander.
- **NICHT** Dokumente einsortieren. `steuer-init` bereitet nur das leere Archiv
  vor; das Einsortieren ist ein eigener, expliziter Schritt.
- **NICHT** das Steuerjahr raten.
