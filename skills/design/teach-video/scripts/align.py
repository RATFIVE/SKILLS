"""align.py: Wort-Zeitstempel aus der fertigen Sprachaufnahme.

    <venv>/bin/python align.py voice.mp3 skript.txt out_dir [--offset 1.0] [--pause "auf einem Runner?=4"]
                               [--model medium] [--lang de]

Schreibt out_dir/words.json und out_dir/words.js (window.WORDS = {...}) mit
{"voiceAt": offset, "voiceDuration": sek, "words": [{"w": "Wort", "s": start, "e": ende}, ...]}.
Alle Zeiten sind Videozeit: Die Stimme beginnt bei --offset Sekunden, und mix.mjs legt sie
genau dorthin. So gibt es nur eine Stelle, an der der Versatz steht.
--pause "<letzte Wörter vor der Pause>=<Sekunden>" (mehrfach möglich) fügt nach diesen Wörtern Stille
ein, z. B. als Denkpause nach einer Abruffrage; alle späteren Zeitstempel wandern mit.
Ergebnis immer: out_dir/voice-final.wav (die Stimme, die gemischt und in der Vorschau gespielt wird).
Der Sprechertext geht als initial_prompt hinein, damit Fachbegriffe (runs-on, needs …)
so geschrieben werden wie im Skript. Das Modell wird aus dem Hugging-Face-Cache genommen
und nur geladen, wenn es dort fehlt.
"""
import argparse
import warnings
warnings.filterwarnings("ignore", category=RuntimeWarning)
import re
import subprocess
import json
import os
import sys

from faster_whisper import WhisperModel

ap = argparse.ArgumentParser()
ap.add_argument("audio")
ap.add_argument("script")
ap.add_argument("out_dir")
ap.add_argument("--model", default="medium")
ap.add_argument("--lang", default="de")
ap.add_argument("--offset", type=float, default=1.0)
ap.add_argument("--pause", action="append", default=[])
a = ap.parse_args()

text = open(a.script, encoding="utf-8").read().strip()
model = WhisperModel(a.model, device="cpu", compute_type="int8")
segments, info = model.transcribe(
    a.audio,
    language=a.lang,
    word_timestamps=True,
    initial_prompt=text[:800],
    vad_filter=False,
    condition_on_previous_text=True,
)
words = []
for seg in segments:
    for w in seg.words or []:
        words.append({"w": w.word.strip(), "s": round(w.start + a.offset, 3), "e": round(w.end + a.offset, 3)})

if not words:
    sys.exit("FEHLER: keine Wörter erkannt")

os.makedirs(a.out_dir, exist_ok=True)


def norm(x):
    return re.sub(r"[`'\"„“”‚‘’.,;:!?()\[\]{}«»…–—]", "", x.lower()).strip()


# Pausen: Schnittpunkte in Stimm-Zeit bestimmen
cuts = []
for spec in a.pause:
    phrase, secs = spec.rsplit("=", 1)
    q = [norm(x) for x in phrase.split() if norm(x)]
    seq = [norm(w["w"]) for w in words]
    idx = next((i for i in range(len(seq) - len(q) + 1) if seq[i:i + len(q)] == q), None)
    if idx is None:
        sys.exit(f'FEHLER: Pause nach "{phrase}" – Wörter nicht in der Aufnahme gefunden')
    last = words[idx + len(q) - 1]
    nxt = words[idx + len(q)]["s"] if idx + len(q) < len(words) else last["e"]
    cuts.append(((last["e"] + nxt) / 2 - a.offset, float(secs)))
cuts.sort()

final = os.path.join(a.out_dir, "voice-final.wav")
if cuts:
    parts, labels, prev = [], [], 0.0
    for i, (c, secs) in enumerate(cuts):
        parts.append(f"[0:a]atrim={prev:.3f}:{c:.3f},asetpts=PTS-STARTPTS[a{i}]")
        parts.append(f"aevalsrc=0:d={secs}:s=48000:c=stereo[z{i}]")
        labels += [f"[a{i}]", f"[z{i}]"]
        prev = c
    parts.append(f"[0:a]atrim={prev:.3f},asetpts=PTS-STARTPTS[a{len(cuts)}]")
    labels.append(f"[a{len(cuts)}]")
    pre = [f"{l}aformat=sample_rates=48000:channel_layouts=stereo[f{j}]" for j, l in enumerate(labels)]
    graph = ";".join(parts + pre) + ";" + "".join(f"[f{j}]" for j in range(len(labels))) + f"concat=n={len(labels)}:v=0:a=1[out]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.audio, "-filter_complex", graph, "-map", "[out]", final], check=True)
    for w in words:
        shift = sum(secs for c, secs in cuts if w["s"] - a.offset > c)
        w["s"] = round(w["s"] + shift, 3)
        w["e"] = round(w["e"] + shift, 3)
else:
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.audio, "-ar", "48000", "-ac", "2", final], check=True)

data = {"voiceAt": a.offset, "voiceDuration": round(info.duration + sum(s for _, s in cuts), 3), "words": words}
with open(os.path.join(a.out_dir, "words.json"), "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)
with open(os.path.join(a.out_dir, "words.js"), "w", encoding="utf-8") as f:
    f.write("window.WORDS = " + json.dumps(data, ensure_ascii=False) + ";\n")

# Kurzer Abgleich mit dem Skript: grobe Abweichungen sichtbar machen
spoken = len(words)
written = len(text.split())
print(f"{spoken} Wörter erkannt (Skript: {written}), Dauer {info.duration:.1f} s -> {a.out_dir}/words.js")
if abs(spoken - written) > max(5, written * 0.1):
    print("WARNUNG: Wortzahl weicht deutlich vom Skript ab. Aufnahme anhören, bevor Animationen daran hängen.")
