# Skills

Eigene Skills für Claude, opencode und andere Coding-Agents.

## Installation

```bash
npx skills@latest add RATFIVE/SKILLS
```

## Skills

### Engineering

Code-zentrierte Skills für tägliche Entwicklungsarbeit.

- **[gh-issues-batch](skills/engineering/gh-issues-batch/SKILL.md)** — Alle offenen GitHub Issues in einem Rutsch implementieren: parallele Subagents, TDD, Playwright-Verifikation, Caveman-Simplification.

### Productivity

Allgemeine Workflow-Tools, nicht code-spezifisch.

- **[notes-to-issues](skills/productivity/notes-to-issues/SKILL.md)** — Roh-Aufgaben aus `notes.md` durch `/grill-with-docs` → `/to-prd` → `/to-issue` Pipeline zu GitHub Issues verarbeiten.

### Steuer

Skills für die jährliche Steuererklärung: Dokumentenarchive pflegen und Transaktionen steuerlich einordnen.

- **[steuer-dokument-einsortieren](skills/steuer/steuer-dokument-einsortieren/SKILL.md)** — Lose/generisch benannte PDFs (Behörden-, Arbeitgeber-, Versicherungspost) lesen, nach `Datum_Absender_Betreff.pdf` umbenennen und in den passenden Institutions-Ordner einsortieren.
- **[steuer-transaktionen-kategorisieren](skills/steuer/steuer-transaktionen-kategorisieren/SKILL.md)** — Transaktionsexport (PayPal, Kontoauszug, …) steuerlich kategorisieren; eindeutige Buchungen automatisch, unklare Positionen einzeln per `grilling` mit dem User klären.
- **[steuer-index-aktualisieren](skills/steuer/steuer-index-aktualisieren/SKILL.md)** — `index.md`-Übersicht eines Dokumentenarchivs diff-basiert aktuell halten; wird von den beiden anderen Steuer-Skills aufgerufen.

## Struktur

```
skills/
├── engineering/        # Code-zentrierte Skills
│   └── gh-issues-batch/
│       └── SKILL.md
├── productivity/       # Allgemeine Workflow-Tools
│   └── notes-to-issues/
│       └── SKILL.md
└── steuer/             # Steuererklärung: Dokumente & Transaktionen
    ├── steuer-dokument-einsortieren/
    │   └── SKILL.md
    ├── steuer-transaktionen-kategorisieren/
    │   └── SKILL.md
    └── steuer-index-aktualisieren/
        └── SKILL.md
```

Jeder Skill besteht aus einem Ordner mit `SKILL.md` (erforderlich) und optionalen `REFERENCE.md`, `EXAMPLES.md` oder `scripts/`.
