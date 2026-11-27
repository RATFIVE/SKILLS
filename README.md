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
| [`Julian-Ivanov/website-bauen`](https://github.com/Julian-Ivanov/website-bauen) | `website-bauen` |
| [`Motionsites-AI/claude-skill`](https://github.com/Motionsites-AI/claude-skill) | `motionsites-web-builder` |
| [`Barty-Bart/motion-graphics`](https://github.com/Barty-Bart/motion-graphics) | `motion-broll`, `object-separation`, `explainer-default`, `explainer-engaging`, `explainer-high-energy`, `sound-effects` |
| [`cloudflare/security-audit-skill`](https://github.com/cloudflare/security-audit-skill) | `security-audit` |

Eine weitere Quelle hinzufügen: eine Zeile im `SOURCES`-Array in [update-skills.sh](update-skills.sh).
Ein Eintrag darf ein ganzes Repo, ein Kategorie-Ordner oder ein einzelner Skill sein.

Nur dieses Repo installieren, ohne Script:

```bash
npx skills@latest add RATFIVE/SKILLS
```

## Skills

### Engineering

Code-zentrierte Skills für tägliche Entwicklungsarbeit.

- **[gh-ticket-batch](skills/engineering/gh-ticket-batch/SKILL.md)** — Alle offenen GitHub-Tickets in einem Rutsch implementieren: ein Subagent pro Ticket (unabhängige parallel, abhängige nacheinander), TDD, Playwright-Verifikation, Caveman-Simplification.

### Design

- **[frontend-design-guide](skills/design/frontend-design-guide/SKILL.md)** — Frontend-Oberflächen mit echter gestalterischer Absicht bauen statt im generischen Web-Look.
- **[motion-video](skills/design/motion-video/SKILL.md)** — Kurze Erklärvideos, Werbespots und Teaser als MP4: JavaScript-Motion-Graphics mit freigestellten KI-Bildern (GPT Image), ElevenLabs-Sprecherstimme, Animationen per Wort-Zeitstempel auf dem gesprochenen Wort, Sounddesign auf -14 bis -16 LUFS. Rendert über Higgsfield Katana oder lokal mit HyperFrames (Bilder über kie.ai, fal.ai oder Higgsfield); der gewählte Weg wird in `praeferenzen.md` neben dem Skill gemerkt.
- **[teach-video](skills/design/teach-video/SKILL.md)** — `/teach` als Erklärvideo statt HTML-Lektion: 60–120 s, eine Kernidee am Beispiel aus der eigenen Mission, Abruffragen mit echter Denkpause, Abschlusstafel mit Primärquelle. Teilt sich Kursordner und Lernstand mit `/teach`. Stimme (ElevenLabs v4) und Musik über Higgsfield, Effekte aus `sound-effects`, Wort-Zeitstempel lokal mit faster-whisper, Motion Graphics aus Code, lokal gerendert mit Playwright und ffmpeg, gemischt auf -16 LUFS. Braucht die Skills `teach`, `motion-video` und `sound-effects`; die Werkzeuge richtet [scripts/setup.sh](skills/design/teach-video/scripts/setup.sh) in `~/.cache/teach-video` ein.

### Business

Skills für Geschäftsmodell- und Marktarbeit, nicht code-spezifisch.

- **[wettbewerbsanalyse](skills/business/wettbewerbsanalyse/SKILL.md)** — Geschäftsidee gegen den Markt prüfen und als HTML-Report ausliefern: Wettbewerber und Preise recherchieren, die sechs Canvas-Frameworks (Petal Diagram, Value Proposition, Kundenprofil, Product Market Fit, Business Model Canvas, Bullseye) füllen, harte Fragen mit Schweregrad stellen. Offene Entscheidungen gehen per `grilling` an den User. Diagramm-Geometrie in seiner [REFERENCE.md](skills/business/wettbewerbsanalyse/REFERENCE.md).

### Finanzen

- **[aktien-analyse](skills/finanzen/aktien-analyse/SKILL.md)** — Multi-Agent-Analyse für einen Aktien-Ticker: Technik-, News-, Fundamental- und Makro-Analyst, Faktencheck der Zahlen, Bull/Bear-Debatte mit Risk-Check, am Ende BUY/SELL/HOLD mit Entry, Stop und Positionsgröße. Daten per yfinance über [scripts/fetch_market_data.py](skills/finanzen/aktien-analyse/scripts/fetch_market_data.py); läuft mit Subagents (Claude Code, Code-Tab) und ohne (Chat), mit Websuche als Notlösung bei gesperrtem Netz. Rollen-Briefings in seiner [ROLLEN.md](skills/finanzen/aktien-analyse/ROLLEN.md).

> LLM-Analyse auf Basis öffentlicher Daten, keine Anlageberatung.

### Productivity

Allgemeine Workflow-Tools, nicht code-spezifisch.

- **[notes-to-tickets](skills/productivity/notes-to-tickets/SKILL.md)** — Roh-Aufgaben aus der explizit genannten `NOTES.md` oder `TODO.md` durch `/grill-with-docs` → `/to-spec` → `/to-tickets` Pipeline zu einem Spec-Issue mit Tickets verarbeiten (mit Checkpoints für Grilling, Test-Seams und Ticket-Schnitt).
- **[caveman](skills/productivity/caveman/SKILL.md)** — Ultra-komprimierter Antwortmodus: Füllwörter raus, technische Substanz bleibt. Wird von `gh-ticket-batch` zur Code-Vereinfachung aufgerufen.

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

## Mods

Mods verändern Claude Code selbst (Anzeigen, Panels, Befehle) statt nur Anweisungen mitzugeben. Jeder Mod liegt in `mods/<name>/` und ist zugleich ein Skill-Ordner mit `SKILL.md`: `update-skills.sh` installiert ihn deshalb wie jeden Skill nach `~/.claude/skills/<name>`, und von dort lädt Claude Code ihn in jeder Sitzung. Nach dem ersten Update einmal neu starten oder `/reload-plugins` eingeben.

- **[token-anzeige](mods/token-anzeige/SKILL.md)** — Über dem Prompt eine Zeile mit Kontextfenster (Farbverlauf-Balken und Prozent), verbrauchten Tokens und geschätzten Kosten der Sitzung; `/verbrauch` öffnet ein Panel mit Kontextverlauf, Tokens nach Art und Kosten des letzten Turns. `/verbrauch aus` bzw. `an` blendet die Zeile aus und ein.

## Struktur

```
update-skills.sh        # installiert/aktualisiert alle Skills und Mods aus allen Quellen
mods/                   # Claude-Code-Mods (zugleich Skill-Ordner)
└── token-anzeige/
    ├── SKILL.md
    ├── .claude-plugin/plugin.json
    ├── hooks/register.tsx        # der Mod
    ├── types/index.d.ts          # Typen der gespeicherten Werte
    └── tests/anzeige.test.tsx
skills/
├── business/           # Geschäftsmodell & Markt
│   └── wettbewerbsanalyse/
│       ├── SKILL.md
│       └── REFERENCE.md         # Petal-Geometrie, Positionierungsmatrix
├── design/             # Gestaltung
│   ├── frontend-design-guide/
│   │   └── SKILL.md
│   └── motion-video/
│       └── SKILL.md
├── engineering/        # Code-zentrierte Skills
│   └── gh-ticket-batch/
│       └── SKILL.md
├── finanzen/           # Aktien & Märkte
│   └── aktien-analyse/
│       ├── SKILL.md
│       ├── ROLLEN.md             # Briefings der zehn Rollen
│       └── scripts/
│           └── fetch_market_data.py
├── productivity/       # Allgemeine Workflow-Tools
│   ├── notes-to-tickets/
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
`gh-ticket-batch` ruft ihn produktiv auf.

`skills/finanzen/aktien-analyse` adaptiert Pipeline und Datenskript aus
[lucemia/trading-agents-plugin](https://github.com/lucemia/trading-agents-plugin)
(MIT, Copyright © 2026 David Chen).

Alle übrigen fremden Skills werden **nicht** kopiert, sondern von `update-skills.sh` direkt
aus ihrer Originalquelle installiert.
