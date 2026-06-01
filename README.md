# Skills

Skills für opencode — eigene Skills und Referenz-Skills.

## Installation

```bash
npx skills@latest add marcobanzhaf/SKILLS
```

## Skills

### Engineering

Code-zentrierte Skills für tägliche Entwicklungsarbeit.

*(Noch keine Skills — Platzhalter für zukünftige Engineering-Skills)*

### Productivity

Allgemeine Workflow-Tools, nicht code-spezifisch.

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
