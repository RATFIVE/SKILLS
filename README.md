# Skills

Eigene Skills für Claude, opencode und andere Coding-Agents.

## Installation & Updates

Ein Befehl installiert und aktualisiert *alle* Skills — die eigenen und die fremden:

```bash
./update-skills.sh
```

Das Script synchronisiert die in ihm eingetragenen Quellen und meldet am Ende Skills,
die in keiner Quelle mehr vorkommen (z. B. weil sie upstream umbenannt wurden). Gelöscht
wird nie automatisch.

| Quelle | Was von dort kommt |
| --- | --- |
| `RATFIVE/SKILLS` | dieses Repo |
| [`mattpocock/skills`](https://github.com/mattpocock/skills) | `engineering/` + `productivity/` |

Eine weitere Quelle hinzufügen: eine Zeile im `SOURCES`-Array in [update-skills.sh](update-skills.sh).
Ein Eintrag darf ein ganzes Repo, ein Kategorie-Ordner oder ein einzelner Skill sein.

Nur dieses Repo installieren, ohne Script:

```bash
npx skills@latest add RATFIVE/SKILLS
```

## Skills

### Engineering

Code-zentrierte Skills für tägliche Entwicklungsarbeit.

- **[gh-issues-batch](skills/engineering/gh-issues-batch/SKILL.md)** — Alle offenen GitHub Issues in einem Rutsch implementieren: parallele Subagents, TDD, Playwright-Verifikation, Caveman-Simplification.

### Design

- **[frontend-design-guide](skills/design/frontend-design-guide/SKILL.md)** — Frontend-Oberflächen mit echter gestalterischer Absicht bauen statt im generischen Web-Look.

### Productivity

Allgemeine Workflow-Tools, nicht code-spezifisch.

- **[notes-to-issues](skills/productivity/notes-to-issues/SKILL.md)** — Roh-Aufgaben aus `notes.md` durch `/grill-with-docs` → `/to-spec` → `/to-tickets` Pipeline zu GitHub Issues verarbeiten.
- **[caveman](skills/productivity/caveman/SKILL.md)** — Ultra-komprimierter Antwortmodus: Füllwörter raus, technische Substanz bleibt. Wird von `gh-issues-batch` zur Code-Vereinfachung aufgerufen.

### Steuer

Eine zusammenhängende Suite, die ein Steuer-Dokumentenarchiv von Null aufbaut und pflegt: Personenprofil erheben → daraus die nötigen Steuer-Anlagen ableiten → Dokumente einsortieren → Summen mit Belegverweis ziehen.

Einstiegspunkt ist **`steuer-init`**; die übrigen Skills rufen sich gegenseitig auf.

```
/steuer-init
  ├─ steuer-soul-pflegen        → SOUL.md    (wer bin ich steuerlich?)
  ├─ steuer-struktur-anlegen    → <Jahr>/NN_Anlage_*/   (welche Anlagen brauche ich?)
  └─ steuer-index-aktualisieren → INDEX.md

/steuer-dokument-einsortieren   → sortiert raw/ in die Anlagen
  ├─ steuer-uebersicht          → _UEBERSICHT.md (Summen mit Beleg)
  └─ steuer-index-aktualisieren → INDEX.md
```

- **[steuer-init](skills/steuer/steuer-init/SKILL.md)** — Einstiegspunkt für ein neues Archiv: schreibt die `CLAUDE.md` mit der Archiv-Konvention und fährt die Kette aus Profil, Struktur und Index an.
- **[steuer-soul-pflegen](skills/steuer/steuer-soul-pflegen/SKILL.md)** — `SOUL.md` mit allen für die Steuererklärung relevanten persönlichen Lebensumständen (jahresübergreifend, mit Zeiträumen) erstellen/aktualisieren; ableitbare Fakten aus dem Archiv, den Rest per `grilling` erfragen.
- **[steuer-struktur-anlegen](skills/steuer/steuer-struktur-anlegen/SKILL.md)** — Leitet aus `SOUL.md` ab, welche Anlagen (N, S, KAP, Vorsorgeaufwand, …) tatsächlich gebraucht werden, und legt die Jahres-/Anlagen-Ordner an. Das Mapping „Lebensumstand → Anlage" steht in seiner [REFERENCE.md](skills/steuer/steuer-struktur-anlegen/REFERENCE.md).
- **[steuer-dokument-einsortieren](skills/steuer/steuer-dokument-einsortieren/SKILL.md)** — Lose/generisch benannte PDFs lesen, nach `Datum_Absender_Betreff.pdf` umbenennen und in die passende Anlage des richtigen Steuerjahres einsortieren; Dokumente mit Mehrfach-Anlagenbezug nach `00_Quellen/`, ohne sie zu duplizieren.
- **[steuer-transaktionen-kategorisieren](skills/steuer/steuer-transaktionen-kategorisieren/SKILL.md)** — Transaktionsexport (PayPal, Kontoauszug, …) steuerlich kategorisieren; eindeutige Buchungen automatisch, unklare Positionen einzeln per `grilling` mit dem User klären.
- **[steuer-uebersicht](skills/steuer/steuer-uebersicht/SKILL.md)** — `_UEBERSICHT.md` pro Anlage: die Beträge aus den Belegen, jeweils mit Datei und Seite als Herkunft, plus Summen pro Kategorie. Nicht sicher Lesbares wird `OFFEN` markiert statt geraten.
- **[steuer-index-aktualisieren](skills/steuer/steuer-index-aktualisieren/SKILL.md)** — `INDEX.md`-Übersicht eines Dokumentenarchivs diff-basiert aktuell halten; wird von den anderen Steuer-Skills aufgerufen.

> Vorsortierung, keine steuerliche Beratung.

## Struktur

```
update-skills.sh        # installiert/aktualisiert alle Skills aus allen Quellen
skills/
├── design/             # Gestaltung
│   └── frontend-design-guide/
│       └── SKILL.md
├── engineering/        # Code-zentrierte Skills
│   └── gh-issues-batch/
│       └── SKILL.md
├── productivity/       # Allgemeine Workflow-Tools
│   ├── notes-to-issues/
│   │   └── SKILL.md
│   └── caveman/
│       └── SKILL.md
└── steuer/             # Steuererklärung: Archiv aufbauen, Dokumente, Summen
    ├── steuer-init/
    │   └── SKILL.md
    ├── steuer-soul-pflegen/
    │   └── SKILL.md
    ├── steuer-struktur-anlegen/
    │   ├── SKILL.md
    │   └── REFERENCE.md          # Lebensumstand → Anlage → Ordner
    ├── steuer-dokument-einsortieren/
    │   └── SKILL.md
    ├── steuer-transaktionen-kategorisieren/
    │   └── SKILL.md
    ├── steuer-uebersicht/
    │   └── SKILL.md
    └── steuer-index-aktualisieren/
        └── SKILL.md
```

Jeder Skill besteht aus einem Ordner mit `SKILL.md` (erforderlich) und optionalen `REFERENCE.md`, `EXAMPLES.md` oder `scripts/`.

## Herkunft

`skills/productivity/caveman` stammt ursprünglich aus [mattpocock/skills](https://github.com/mattpocock/skills)
(MIT, Copyright © Matt Pocock) und wurde hier übernommen, nachdem er dort entfernt wurde —
`gh-issues-batch` ruft ihn produktiv auf.

Alle übrigen fremden Skills werden **nicht** kopiert, sondern von `update-skills.sh` direkt
aus ihrer Originalquelle installiert.
