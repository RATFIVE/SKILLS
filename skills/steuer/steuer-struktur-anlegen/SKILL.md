---
name: steuer-struktur-anlegen
description: Leitet aus `SOUL.md` ab, welche Steuer-Anlagen (N, S, KAP, Vorsorgeaufwand, …) für ein Steuerjahr tatsächlich gebraucht werden, und legt dafür die Jahres-/Anlagen-Ordnerstruktur inklusive `_UEBERSICHT.md` an. Nutze diesen Skill, wenn der User "leg die Ordnerstruktur an", "welche Anlagen brauche ich", "Struktur für Steuerjahr 2026" o. ä. sagt, oder wenn ein neues Steuerjahr im Archiv beginnt. Wird von steuer-init als zweiter Schritt aufgerufen.
---

# Steuer-Struktur anlegen

## Overview

Welche Anlagen jemand ausfüllen muss, ergibt sich aus seinen Lebensumständen —
und die stehen in `SOUL.md`. Dieser Skill übersetzt das Personenprofil in eine
Ordnerstruktur: Angestelltenverhältnis → `10_Anlage_N/`, Gewerbe →
`21_Anlage_G/` + `22_Anlage_EUER/`, Depot → `30_Anlage_KAP/`. Danach hat jedes
Dokument, das später eintrudelt, einen offensichtlichen Zielort, und am Ende
ist jeder Ordner genau das, was in ein Formular abgetippt wird.

Der Skill legt **Ordner** an, keine Zahlen und keine Belege. Er entscheidet
nur, *welche* Anlagen relevant sind.

**Kein Steuerberater-Ersatz.** Das Ergebnis ist eine Vorsortierung. Eine Anlage,
die hier nicht auftaucht, kann trotzdem nötig sein — im Zweifel Steuerberater
oder Lohnsteuerhilfeverein.

## Voraussetzung

`SOUL.md` im Archiv-Root muss existieren und die relevanten Lebensumstände
enthalten. Fehlt sie oder ist sie erkennbar lückenhaft (keine Angaben zu
Beschäftigung, Studium, Gewerbe, Versicherung), **erst** `steuer-soul-pflegen`
aufrufen und dann hierher zurückkehren. Niemals Lebensumstände raten, um die
Struktur "irgendwie" anlegen zu können.

## Workflow

1. **`SOUL.md` lesen** (nie den Inhalt annehmen) und **`CLAUDE.md` des Archivs
   lesen**, falls vorhanden — dort steht die etablierte Konvention.
2. **Steuerjahr bestimmen.** Aus dem Auftrag des Users ("Struktur für 2026") oder
   dem Kontext. Nicht ableitbar → beim User nachfragen, nicht das aktuelle
   Kalenderjahr annehmen (Erklärungen werden fast immer rückwirkend gemacht).
3. **Relevante Anlagen ableiten.** `REFERENCE.md` in diesem Skill-Ordner öffnen
   und die Lebensumstände aus `SOUL.md` gegen die Mapping-Tabelle abgleichen.
   Dabei den **Zeitraum** prüfen: Ein Gewerbe, das erst 2026 angemeldet wurde,
   erzeugt keine `21_Anlage_G/` im Jahr 2025.
4. **Unklare Fälle über `grilling` klären.** Steht in `SOUL.md` ein Fakt, dessen
   steuerliche Konsequenz mehrdeutig ist (klassisch: Erst- vs. Zweitausbildung
   → Sonderausgaben oder Werbungskosten; Kleinunternehmerregelung → Anlage USt
   nötig oder nicht), eine Frage nach der anderen stellen, mit begründeter
   Empfehlung. Die Antwort anschließend in `SOUL.md` nachtragen lassen
   (`steuer-soul-pflegen`), damit sie im nächsten Jahr nicht erneut fehlt.
5. **Ordner anlegen.** Nummern **fest** aus `REFERENCE.md` übernehmen, nicht
   fortlaufend durchzählen. Lücken in der Nummerierung sind gewollt und normal
   (`10_`, `30_`, `40_`, `99_`) — so behält Anlage N über alle Jahre dieselbe
   Nummer, auch wenn ein Jahr später ein Gewerbe dazukommt.
6. **Je Anlagen-Ordner eine `_UEBERSICHT.md` anlegen** — zunächst als Stub mit
   Zweck der Anlage und leerer Summentabelle. Gefüllt wird sie später von
   `steuer-uebersicht`, sobald Dokumente einsortiert sind.
7. **`steuer-index-aktualisieren` aufrufen** mit der Liste der neu angelegten
   Ordner.
8. **Abschlussbericht:** Welche Anlagen wurden angelegt, jeweils mit dem Fakt aus
   `SOUL.md`, der sie ausgelöst hat. Dazu die Anlagen nennen, die **bewusst
   nicht** angelegt wurden, obwohl sie naheliegen könnten (z. B. "keine
   `60_Anlage_V/` — laut SOUL.md keine Vermietungseinkünfte"). Der User muss
   widersprechen können.

## Zielstruktur

```
<Archiv>/
├── CLAUDE.md                  # Konvention des Archivs
├── SOUL.md                    # Person, jahresübergreifend
├── INDEX.md                   # Struktur-Index über das ganze Archiv
├── raw/                       # Eingang, jahresübergreifend
└── <Jahr>/
    ├── 00_Quellen/            # Rohquellen + alles mit Mehrfach-Anlagenbezug
    │   └── <Institution>/
    ├── 10_Anlage_N/
    │   ├── _UEBERSICHT.md     # Summen mit Belegverweis
    │   └── <Institution>/
    ├── 40_Anlage_Vorsorgeaufwand/
    └── 99_Privat/             # steuerlich irrelevant, wird nie summiert
```

Innerhalb jedes Anlagen-Ordners bleibt die Institutions-Ebene erhalten
(`10_Anlage_N/GEOMAR/`), damit Dokumente derselben Quelle beieinander liegen.

## Folgejahre

Existiert das Archiv schon und nur ein neues Jahr kommt dazu: `SOUL.md` auf
Änderungen gegen das Vorjahr prüfen (neuer Arbeitgeber, Studium beendet, Gewerbe
abgemeldet) und die Struktur des Vorjahres als Ausgangspunkt nehmen — nicht blind
kopieren. Eine Anlage, deren auslösender Fakt im neuen Jahr weggefallen ist, wird
**nicht** mit angelegt.

## Anti-Patterns

- **NICHT** Anlagen anlegen, für die es in `SOUL.md` keinen auslösenden Fakt gibt
  — leere Anlagen-Ordner suggerieren fehlende Belege, wo gar keine hingehören.
- **NICHT** Lebensumstände raten, wenn `SOUL.md` schweigt — erst
  `steuer-soul-pflegen`.
- **NICHT** die Anlagen-Nummern fortlaufend vergeben. Die Nummern sind fix,
  Lücken sind gewollt.
- **NICHT** den Zeitraum ignorieren: Ein Fakt in `SOUL.md` gilt ab/bis einem
  Datum, nicht für jedes Jahr des Archivs.
- **NICHT** Dokumente einsortieren oder Summen berechnen — das ist Aufgabe von
  `steuer-dokument-einsortieren` bzw. `steuer-uebersicht`.
- **NICHT** den Abschlussbericht auf die angelegten Ordner beschränken — gerade
  die *nicht* angelegten Anlagen muss der User gegenlesen können.
