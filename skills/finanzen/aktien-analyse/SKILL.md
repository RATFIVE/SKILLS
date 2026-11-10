---
name: aktien-analyse
description: Multi-Agent-Aktienanalyse für einen Ticker. Analysten für Technik, News, Fundamentaldaten und Makro, danach eine Bull/Bear-Debatte mit Risk-Check und am Ende eine BUY/SELL/HOLD-Entscheidung mit Entry, Stop und Positionsgröße, abgelegt als Markdown-Berichte. Nutze diesen Skill nur auf ausdrückliche Anfrage, wenn der User „aktien-analyse" mit einem Ticker schreibt (z. B. „aktien-analyse NVDA") oder für eine bestimmte Aktie eine Multi-Agent-Analyse, eine Bull/Bear-Debatte oder eine Kaufentscheidung mit Entry und Stop verlangt. Für beiläufige Fragen zu einer Aktie reicht eine normale Antwort.
license: MIT
---

# Aktien-Analyse

Eine Pipeline aus zehn Rollen, die für einen Ticker zu einer handelbaren Entscheidung kommt. Jede Rolle sieht nur ihre Eingaben. Dadurch bleibt die Debatte echt: der Bear antwortet auf den Bull, der Risk-Analyst sucht, was beide übersehen haben. Alle Rollen-Briefings stehen in [ROLLEN.md](ROLLEN.md); lies die Datei vor Schritt 4 vollständig.

`<SKILL_DIR>` ist der Ordner dieser SKILL.md.

## Ablauf

Lege pro Schritt ein Todo an und arbeite sie in dieser Reihenfolge ab.

### 1. Eingaben lesen

- **Ticker** (Pflicht, genau einer). Fehlt er, frag danach. Nennt der User mehrere, frag, mit welchem du anfangen sollst.
- **Position** (optional): `position=3%` und `einstand=190`. Ohne Angabe gilt `$POSITION` = „keine".
- `$DATUM` = heutiges Datum im Format `JJJJ-MM-TT`.

### 2. Umgebung und Lauf-Ordner bestimmen

| Umgebung | Erkennbar an | `$BASE` |
| --- | --- | --- |
| Rechner des Users (Claude Code CLI, Code-Tab) | Home-Verzeichnis des Users erreichbar, meist macOS | `~/trading-analysen` |
| Cowork mit verbundenem Ordner | ein vom User verbundener Ordner | `<verbundener Ordner>/trading-analysen` |
| Chat-Sandbox, Cowork ohne Ordner | keins von beidem | ein Arbeitsordner in der Sandbox |

`$RUN` = `$BASE/<TICKER>_<DATUM>/` mit den Unterordnern `data/` und `reports/`. Existiert der Ordner schon, hänge `_2`, `_3` … an.

Prüfe außerdem, ob du Subagents starten kannst (Agent- oder Task-Tool). Davon hängen Schritt 4 und 6 ab.

### 3. Daten holen

Mit `uv`, falls vorhanden, sonst mit `python3` (das Skript installiert yfinance und pandas dann selbst per pip):

```bash
uv run --script <SKILL_DIR>/scripts/fetch_market_data.py --ticker $TICKER --type all --date $DATUM --out-dir $RUN/data
python3 <SKILL_DIR>/scripts/fetch_market_data.py --ticker $TICKER --type all --date $DATUM --out-dir $RUN/data
```

Das Skript schreibt `technical.json`, `news.json`, `fundamentals.json`, `macro.json` und meldet pro Typ `ok`, `error` oder `invalid_ticker`. Werte den Exit-Code aus:

- **0**: weiter mit Schritt 4.
- **2, ungültiger Ticker**: dem User melden und mit einem korrigierten Ticker neu starten. Börsensuffixe beachten, z. B. `SAP.DE`, `NESN.SW`.
- **1, einzelne Typen fehlen**, oder **3, nichts erreichbar** (Netz gesperrt): **Websuche als Notlösung**. Hol die fehlenden Teile per Websuche (aktueller Kurs, 52-Wochen-Spanne, Kennzahlen, Analystenziele, aktuelle Schlagzeilen, Makro-Meldungen) und schreib sie in die passende JSON-Datei, mit `"quelle": "websuche"` und Quellen-URLs. Technische Indikatoren (RSI, MACD, Bollinger, ATR) lassen sich so nicht berechnen; trag `null` ein.
- **Abbruch**, wenn danach weder ein aktueller Kurs noch Fundamentaldaten vorliegen. Sag dem User, dass die Sandbox die Datenquellen blockiert, und empfiehl den Code-Tab der Desktop-App: dort läuft der Skill lokal auf seinem Rechner.

Fertig, wenn jede der vier Dateien entweder echte Daten oder einen Websuche-Ersatz enthält.

### 4. Phase 1: vier Analysten

Rollen 1–4 aus [ROLLEN.md](ROLLEN.md).

- **Mit Subagents**: alle vier gleichzeitig starten. Jeder bekommt sein Rollen-Briefing wörtlich, den absoluten Pfad seiner Eingabedatei und seiner Ausgabedatei, `$TICKER` und `$DATUM`.
- **Ohne Subagents**: die vier Rollen nacheinander selbst übernehmen. Für jede Rolle nur ihre Eingabedatei lesen und den Bericht schreiben, bevor die nächste beginnt.

Fertig, wenn `reports/01_technik.md` bis `04_makro.md` existieren und jeder Bericht mit seiner Signalzeile endet.

### 5. Faktencheck

Gleich jede Zahl in den vier Berichten mit den JSON-Dateien ab: Kurs, Indikatoren, Kennzahlen, Quartalsposten, Kursziele. Abgeleitete Werte (Verschuldungsgrad, PEG, Nettocash, Kurspotenzial) müssen den Feldern unter `derived` in `fundamentals.json` entsprechen. Korrigiere falsche Zahlen direkt im Bericht. Trag jede Korrektur in `reports/05_faktencheck.md` ein, mit Bericht, falschem Wert, richtigem Wert und Quelle; ohne Korrekturen steht dort „Keine Abweichungen".

Fertig, wenn jede Zahl der vier Berichte geprüft ist und `05_faktencheck.md` existiert.

### 6. Phase 2: Debatte

Rollen 6, 7, 8 aus [ROLLEN.md](ROLLEN.md), **strikt nacheinander**: Bull, dann Bear mit dem fertigen Bull-Bericht, dann Risk mit beiden. Mit Subagents bekommt jede Rolle einen eigenen Subagent mit Briefing und Dateipfaden; ohne Subagents übernimmst du sie nacheinander selbst, jede nur mit ihren Eingaben.

Prüfe danach die Zahlen in `06_bull.md` bis `08_risiko.md` gegen die Phase-1-Berichte und korrigiere Abweichungen wie in Schritt 5 (Einträge in `05_faktencheck.md` ergänzen).

Fertig, wenn die drei Berichte existieren, mit Signalzeile enden und geprüft sind.

### 7. Phase 3–5: Entscheidung

Rollen 9, 10, 11 aus [ROLLEN.md](ROLLEN.md), im Hauptkontext, nacheinander. `$POSITION` fließt in alle drei ein.

Fertig, wenn `09_research_manager.md`, `10_trader.md` und `ENTSCHEIDUNG.md` existieren.

### 8. Ergebnis ausliefern

- Zeig dem User `ENTSCHEIDUNG.md` im Chat, darunter eine Tabelle mit den sieben Signalzeilen (Technik, Sentiment, Fundamental, Makro, Bull, Bear, Risk) und, falls vorhanden, die Korrekturen aus dem Faktencheck in einem Satz.
- **Lokal und in Cowork mit Ordner**: nenn den Pfad von `$RUN`.
- **Chat-Sandbox**: fass alle Berichte in Reihenfolge zu einer Datei `ANALYSE_<TICKER>_<DATUM>.md` zusammen (Entscheidung zuerst) und stell sie als Download bereit.
- Wurde die Websuche-Notlösung genutzt, sag, welche Daten daher stammen und welche Indikatoren fehlen.
- Letzte Zeile: „Das ist eine LLM-Analyse auf Basis öffentlicher Daten, keine Anlageberatung."
