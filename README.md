# Skills

Skills für opencode — eigene Skills und Referenz-Skills.

## Installation

```bash
npx skills@latest add marcobanzhaf/SKILLS
```

## Skills

### Engineering

Code-zentrierte Skills für tägliche Entwicklungsarbeit.

- **[gh-issues-batch](skills/engineering/gh-issues-batch/SKILL.md)** — Alle offenen GitHub Issues in einem Rutsch implementieren: parallele Subagents, TDD, Playwright-Verifikation, Caveman-Simplification.

### Productivity

Allgemeine Workflow-Tools, nicht code-spezifisch.

- **[notes-to-issues](skills/productivity/notes-to-issues/SKILL.md)** — Roh-Aufgaben aus `notes.md` durch `/grill-with-docs` → `/to-prd` → `/to-issue` Pipeline zu GitHub Issues verarbeiten.
- **[write-a-skill](skills/productivity/write-a-skill/SKILL.md)** — Neue Skills mit korrekter Struktur, progressive disclosure und gebündelten Ressourcen erstellen.

## Struktur

```
skills/
├── engineering/        # Code-zentrierte Skills
│   └── README.md
├── productivity/       # Allgemeine Workflow-Tools
│   ├── README.md
│   └── write-a-skill/
│       └── SKILL.md
└── misc/               # Selten genutzte Skills (optional)
```

Jeder Skill besteht aus einem Ordner mit `SKILL.md` (erforderlich) und optionalen `REFERENCE.md`, `EXAMPLES.md` oder `scripts/`.
