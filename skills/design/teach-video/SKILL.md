---
name: teach-video
description: Ein Erklärvideo (60–120 s, MP4) als Lerneinheit in einem /teach-Kursordner. Stimme und Musik über Higgsfield, Motion Graphics aus Code, lokal gerendert.
disable-model-invocation: true
argument-hint: "Thema oder Kursordner"
---

# Teach-Video

Du unterrichtest wie mit `/teach`, nur ist die Lerneinheit ein **Erklärvideo** statt einer HTML-Lektion. Der User wählt pro Einheit selbst, ob er `/teach` (HTML) oder `/teach-video` (Video) aufruft. Beide teilen sich denselben Kursordner und denselben Lernstand.

## Grundlagen aus zwei Skills

Lies vor dem ersten Schritt zwei Dateien vollständig. Sie liegen als Geschwister dieses Skills (`../teach/`, `../motion-video/`, meist unter `~/.agents/skills/`):

- `teach/SKILL.md` mit den dort verlinkten `*-FORMAT.md`. Daraus gilt alles: Kursordner, Mission, Lernstand (Zone der nächsten Entwicklung), Quellen mit Belegen, Wissen vor Können, Abrufen statt Wiedererkennen, Lerneinträge nur bei Belegen, Referenzdokumente, `NOTES.md`, Communities. Wo dort **Lektion** steht, ist hier das **Video** gemeint.
- `motion-video/SKILL.md`, Abschnitte „Was ein gutes Ergebnis ausmacht“ und „Stimme“. Den Abschnitt zum Weg und `praeferenzen.md` überspringst du: Der Weg dieses Skills steht fest (unten).

## Was ein Lernvideo hier ist

- **Eine Kernidee** mit einem konkreten Beispiel aus dem Mission-Projekt, 60–120 s, also etwa 150–250 gesprochene Wörter.
- **Aufbau:** Wiederholungsfrage aus einer früheren Einheit (entfällt bei der ersten) → Frage, worum es geht → Kernidee am Beispiel → 1–2 Abruffragen mit Denkpause, dann die Auflösung → Abschlusstafel mit Kernsatz und Primärquelle.
- **Bild:** Motion Graphics aus Code im Look des Kurses: Farben und Schriften aus `assets/course.css` des Kursordners, falls vorhanden, sonst die Vorgabe in `assets/template.html`. Fachbegriffe und Code erscheinen synchron zum gesprochenen Wort. Vollständige Untertitel gibt es nicht. KI-Bilder nur, wenn das Thema Gegenständliches zeigen muss (Haltung, Gerät), dann über Higgsfield mit Kostenschätzung vorab.
- **Sprache:** wie im Kurs (`NOTES.md`), Fachbegriffe und Code im Original. Zum Sprechen geschrieben, Code-Namen so, wie man sie sagt.
- **Format:** 1920×1080, 30 fps.

## Ablage im Kursordner

```
videos/NNNN-<name>.mp4         fertiges Video (eigene Nummernfolge, unabhängig von lessons/)
videos/NNNN-<name>.md          Sprechertext, Quellen mit Links, Abruffragen mit Antworten, Hinweis auf Rückfragen
videos/src/NNNN-<name>/        skript.txt, voice.mp3, voice-final.wav, music.mp3, words.json/.js,
                               kit.js, seite.html, cues.json, bild.mp4: genug, um ohne neue Kosten neu zu rendern
```

## Ablauf

1. **Kursordner und Thema.** Wie bei `/teach`: Mission lesen oder erfragen, Lernstand aus `learning-records/` ableiten, Thema der Einheit festlegen. Quellen recherchieren und in `RESOURCES.md` pflegen. Fertig, wenn Kernidee, Beispiel und Primärquelle feststehen und jede Behauptung im geplanten Text eine Quelle hat.
2. **Werkzeuge.** `bash scripts/setup.sh` aus diesem Skill-Ordner. Fertig bei der Zeile `teach-video bereit: <Ordner>`. Bei `FEHLT:` dem User den genannten Befehl nennen.
3. **Sprechertext.** Schreib `skript.txt`: reiner Text, keine Regieanweisungen, keine eckigen Klammern. Zeig ihn im Chat mit Wortzahl und geschätzter Dauer (≈ 2,3 Wörter/s). **Der User gibt ihn frei**, erst danach entstehen Kosten. Fertig bei ausdrücklicher Freigabe.
4. **Stimme und Budget**, siehe [Higgsfield](#higgsfield). Steht in `NOTES.md` des Kurses schon `teach-video: voice_id … budget …`, nimm beides ohne Rückfrage. Sonst: Kostenschätzung für Proben, Stimme und Musik nennen, Freigabe holen, 2–3 Stimmproben mit einem kurzen Satz aus dem Skript erzeugen (mit Fachbegriffen), User wählt, `voice_id`, Modell und freigegebenes Budget pro Video in `NOTES.md` schreiben. Liegt eine Schätzung über dem Budget, vorher fragen.
5. **Ton erzeugen.** Stimme (das ganze Skript in einem Stück) und Musik parallel erzeugen, als `voice.mp3` und `music.mp3` in `videos/src/NNNN-<name>/` laden.
6. **Zeitstempel.** `<TEACH_VIDEO_HOME>/venv/bin/python scripts/align.py voice.mp3 skript.txt <src> --pause "<letzte Wörter der Abruffrage>=4"` (eine `--pause` je Abruffrage). Fertig, wenn keine WARNUNG zur Wortzahl kommt. Kommt eine, die Aufnahme gegen das Skript prüfen.
7. **Seite bauen.** `assets/kit.js` und `assets/template.html` (als `seite.html`) in den src-Ordner kopieren und die Szenen schreiben. Die Kit-API steht oben in `kit.js`. Jede Zeit kommt aus `Kit.at('wort')`, jede Szene hat ihre eigene visuelle Idee, der Hintergrund bewegt sich durchgehend. `cues.json` für die Effekte schreiben (Format in `scripts/mix.mjs`): Effekte nur auf Akzenten wie Szenenwechsel, Enthüllung oder Antwort, nicht bei jedem Wort.
8. **Prüfen vor dem Rendern.** `node scripts/render.mjs seite.html kontakt.png --stills auto` (Zeiten in `VIDEO.stills`, mindestens ein Bild pro Szene) und den Kontaktbogen ansehen. Fertig, wenn kein Text abgeschnitten ist, sich nichts überlappt, alles lesbar ist und jede Szene das zeigt, was in dem Moment gesprochen wird.
9. **Rendern und mischen.** `node scripts/render.mjs seite.html bild.mp4`, dann `node scripts/mix.mjs --video bild.mp4 --words words.json --voice voice-final.wav --music music.mp3 --cues cues.json --out <kurs>/videos/NNNN-<name>.mp4`. Fertig, wenn die letzte Zeile I ≈ -16 LUFS und True Peak ≤ -1 dBFS meldet.
10. **Abschluss.** Die Begleitdatei `videos/NNNN-<name>.md` schreiben. Einen vorhandenen Spickzettel in `reference/` um neue Begriffe ergänzen. Das Video mit `open` öffnen. Die tatsächlichen Higgsfield-Kosten nennen. Dann die Abruffragen aus dem Video im Chat stellen. Ein Lerneintrag entsteht erst, wenn der User sie richtig beantwortet: Ansehen ist Abdeckung, kein Lernen.

## Higgsfield

- **Stimme:** `generate_audio` mit `model: "elevenlabs_v4"`, `prompt` = Skript, `dialogue: [{ text: <Skript>, voice_type, voice_id }]`. Stimmen aus `list_voices` (die Liste nennt keine Sprache, deshalb entscheiden die Proben). Klingt die deutsche Aussprache bei keiner Stimme gut, `qwen_audio_tts` mit `language: "de"` vergleichen (Parameter per `models_explore` `get`).
- **Musik:** `elevenlabs_music_v2` mit `prompt` (ruhig, instrumental, Tempo zum Thema), `duration` = Videodauer + 3 s (Videodauer = 1 s Vorlauf + Stimme + Denkpausen + 2 s Ausklang), `force_instrumental: true`. Sie bleibt leise unter der Stimme, das regelt `mix.mjs`.
- **Effekte:** kommen aus dem `default_kit` des Skills `sound-effects` (CC0, kostenlos), nicht von Higgsfield.
- **Kosten:** Vor jeder Erzeugung `estimate_audio_cost` mit denselben Parametern aufrufen, danach `params: { ref: <quote_ref> }` erzeugen. Fragt das Tool nach `use_unlim`, entscheidet der User.
- **Herunterladen:** `jobs_wait` liefert je Job eine `result_url`. Mit `curl -fsSL -o <datei> "<result_url>"` laden. Die URL wird nie selbst zusammengebaut.

## Werkzeuge in diesem Skill

| Datei | Zweck |
|---|---|
| `scripts/setup.sh` | Einrichtung von faster-whisper und playwright in `$TEACH_VIDEO_HOME` (Standard `~/.cache/teach-video`), außerhalb des Skill-Ordners, damit Updates nichts löschen |
| `scripts/align.py` | Wort-Zeitstempel in Videozeit und Denkpausen, erzeugt `voice-final.wav` und `words.js` |
| `scripts/render.mjs` | Seite → stummes MP4 oder Kontaktbogen |
| `scripts/mix.mjs` | Stimme, Musik (abgesenkt unter der Stimme) und Effekte → fertiges MP4 auf -16 LUFS, mit Messung am Ergebnis |
| `assets/kit.js` | Zeitleiste für die Seite: `Kit.at`, `Kit.fade`, `Kit.type`, Vorschau im Browser |
| `assets/template.html` | Startseite mit Einstieg, Abruffrage samt Denkpause und Abschlusstafel |
