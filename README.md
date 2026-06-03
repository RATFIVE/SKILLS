# Skills

Skills für opencode — eigene Skills und Referenz-Skills.

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

## Struktur

```
skills/
├── engineering/        # Code-zentrierte Skills
│   └── gh-issues-batch/
│       └── SKILL.md
└── productivity/       # Allgemeine Workflow-Tools
    └── notes-to-issues/
        └── SKILL.md
```

Jeder Skill besteht aus einem Ordner mit `SKILL.md` (erforderlich) und optionalen `REFERENCE.md`, `EXAMPLES.md` oder `scripts/`.
