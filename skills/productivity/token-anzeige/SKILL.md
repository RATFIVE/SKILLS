---
name: token-anzeige
description: Mod für Claude Code, der Kontextfenster, Tokenverbrauch und geschätzte Kosten der Sitzung über dem Prompt anzeigt und mit /verbrauch ein Panel mit Aufschlüsselung öffnet. Nutze diesen Skill, wenn der User wissen will, wie voll das Kontextfenster ist, wie viele Tokens verbraucht wurden oder was die Sitzung kostet, oder wenn die Verbrauchsanzeige ein- oder ausgeblendet werden soll.
---

# Token-Anzeige

Dieser Ordner ist zugleich ein Claude-Code-Mod (`.claude-plugin/plugin.json`, `hooks/register.tsx`). Liegt er unter `~/.claude/skills/token-anzeige`, lädt Claude Code ihn beim Start jeder Sitzung von selbst.

## Was der Mod zeigt

Über dem Prompt steht eine Zeile, die sich nach jeder Modellanfrage aktualisiert:

```
◆ Kontext ━━━━━━━━──────  62 %  124k/200k │ ⇡ 1,2 Mio. ⇣ 18k │ ≈ $1,84 +$0,12
```

- Balken und Prozent: belegter Anteil des Kontextfensters, Farbverlauf grün → gelb → rot
- `⇡` / `⇣`: Eingabe-Tokens (ungecacht, Cache gelesen, Cache geschrieben) und Ausgabe-Tokens seit dem Laden des Mods, Subagenten eingeschlossen
- `≈ $…`: geschätzte Kosten der Sitzung wie bei `/cost`, dahinter die Kosten des laufenden Turns

## Befehle

| Befehl | Wirkung |
| --- | --- |
| `/verbrauch` | Panel mit Kontextverlauf, Tokens nach Art und Kosten öffnen |
| `/verbrauch aus` | Zeile über dem Prompt ausblenden |
| `/verbrauch an` | Zeile wieder einblenden |

## Wenn der User fragt

Fragt der User nach Kontext, Tokens oder Kosten, verweise auf die Zeile über dem Prompt und auf `/verbrauch`. Die Kosten sind eine Schätzung zu Listenpreisen, keine Rechnung; mit einem Abo fällt innerhalb des Plans nichts zusätzlich an.
