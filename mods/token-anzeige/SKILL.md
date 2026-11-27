---
name: token-anzeige
description: Mod für Claude Code, der Kontextfenster, Tokenverbrauch, geschätzte Kosten und die Nutzungslimits des Abos (5-Stunden-Fenster und Wochenlimit) über dem Prompt anzeigt und mit /verbrauch ein Panel mit Aufschlüsselung öffnet. Nutze diesen Skill, wenn der User wissen will, wie voll das Kontextfenster ist, wie viele Tokens verbraucht wurden, was die Sitzung kostet oder wie weit das Nutzungs- oder Wochenlimit ausgeschöpft ist, oder wenn die Verbrauchsanzeige ein- oder ausgeblendet werden soll.
---

# Token-Anzeige

Dieser Ordner ist ein Claude-Code-Mod (`.claude-plugin/plugin.json`, `hooks/register.tsx`). Installiert wird er mit `./update-mods.sh` im Repo-Root, über den Marketplace `ratfive-mods`; danach lädt Claude Code ihn in jeder Sitzung.

## Was der Mod zeigt

Über dem Prompt steht eine Zeile, die sich nach jeder Modellanfrage aktualisiert:

```
◆ Kontext ━━━━━━━━──────  62 %  124k/200k │ ⇡ 1,2 Mio. ⇣ 18k │ ≈ $1,84 +$0,12 │ 5 Std. 23 % · Woche 41,5 %
```

- Balken und Prozent: belegter Anteil des Kontextfensters, Farbverlauf grün → gelb → rot
- `⇡` / `⇣`: Eingabe-Tokens (ungecacht, Cache gelesen, Cache geschrieben) und Ausgabe-Tokens seit dem Laden des Mods, Subagenten eingeschlossen
- `≈ $…`: geschätzte Kosten der Sitzung wie bei `/cost`, dahinter die Kosten des laufenden Turns
- `5 Std.` / `Woche`: ausgeschöpfter Anteil des aktuellen Limits (5-Stunden-Fenster) und des Wochenlimits, wie die letzte API-Antwort sie meldet. Nur mit Abo; ohne Abo oder vor der ersten Antwort fehlt der Teil. Im Panel stehen beide mit Balken und Zeitpunkt des Resets

## Befehle

| Befehl | Wirkung |
| --- | --- |
| `/verbrauch` | Panel mit Kontextverlauf, Nutzungslimits, Tokens nach Art und Kosten öffnen |
| `/verbrauch aus` | Zeile über dem Prompt ausblenden |
| `/verbrauch an` | Zeile wieder einblenden |

## Wenn der User fragt

Fragt der User nach Kontext, Tokens, Kosten oder Limits, verweise auf die Zeile über dem Prompt und auf `/verbrauch`. Die Kosten sind eine Schätzung zu Listenpreisen, keine Rechnung; mit einem Abo fällt innerhalb des Plans nichts zusätzlich an.
