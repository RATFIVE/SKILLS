// mix.mjs: legt Stimme, Musik und Soundeffekte unter das stumme Video und normalisiert auf -16 LUFS.
//   node mix.mjs --video bild.mp4 --words words.json --voice voice-final.flac [--music music.mp3] [--cues cues.json]
//                [--music-db -20] --out video.mp4
// Die Stimme beginnt bei words.json.voiceAt Sekunden (von align.py gesetzt), dieselbe Zeitbasis wie die Seite.
// Musik wird geloopt oder gekürzt, ein- und ausgeblendet und unter der Stimme abgesenkt (Sidechain).
// cues.json: [{ "t": 2.0, "sound": "whoosh", "db": -8 }, ...]
//   sound = Name aus dem default_kit des Skills sound-effects (whoosh, click, pop, riser, impact, tick)
//           oder ein Dateipfad. db = Pegel des Effekts (Standard -8).
import { spawn, execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, v, i, all) => {
  if (v.startsWith('--')) acc.push([v.slice(2), all[i + 1]]); return acc; }, []));
for (const k of ['video', 'words', 'voice', 'out']) if (!args[k]) { console.error(`--${k} fehlt`); process.exit(1); }

const here = path.dirname(fileURLToPath(import.meta.url));
const sfxDirs = [process.env.SFX_DIR, path.resolve(here, '../../sound-effects/sfx'),
  path.join(os.homedir(), '.agents/skills/sound-effects/sfx'), path.join(os.homedir(), '.claude/skills/sound-effects/sfx')].filter(Boolean);
const sfxDir = sfxDirs.find(d => existsSync(path.join(d, 'manifest.json')));
function sound(name) {
  if (existsSync(name)) return name;
  if (!sfxDir) throw new Error(`Effekt "${name}": Skill sound-effects nicht gefunden (SFX_DIR setzen)`);
  const kit = path.join(sfxDir, 'kit', name + '.ogg');
  if (existsSync(kit)) return kit;
  throw new Error(`Effekt "${name}" nicht im default_kit (${path.join(sfxDir, 'kit')})`);
}

const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', args.video]).toString());
const voiceAt = JSON.parse(readFileSync(args.words, 'utf8')).voiceAt ?? 0;
const cues = args.cues ? JSON.parse(readFileSync(args.cues, 'utf8')) : [];
const musicDb = parseFloat(args['music-db'] ?? '-20');

const inputs = ['-i', args.video, '-i', args.voice];
const fmt = 'aformat=sample_rates=48000:channel_layouts=stereo';
const parts = [], mixIn = [];
parts.push(`[1:a]${fmt},adelay=${Math.round(voiceAt * 1000)}:all=1,apad[vp]`);
let n = 2;
if (args.music) {
  inputs.push('-stream_loop', '-1', '-i', args.music);
  parts.push(`[vp]asplit=2[v][vkey]`);
  parts.push(`[${n}:a]${fmt},atrim=0:${dur.toFixed(3)},volume=${musicDb}dB,afade=t=in:d=1.5,afade=t=out:st=${Math.max(0, dur - 2.5).toFixed(3)}:d=2.5[m0]`);
  parts.push(`[m0][vkey]sidechaincompress=threshold=0.02:ratio=6:attack=30:release=600[m]`);
  mixIn.push('[v]', '[m]'); n++;
} else { parts.push('[vp]anull[v]'); mixIn.push('[v]'); }
for (const c of cues) {
  inputs.push('-i', sound(c.sound));
  parts.push(`[${n}:a]${fmt},volume=${c.db ?? -8}dB,adelay=${Math.max(0, Math.round(c.t * 1000))}:all=1[s${n}]`);
  mixIn.push(`[s${n}]`); n++;
}
parts.push(`${mixIn.join('')}amix=inputs=${mixIn.length}:normalize=0:duration=longest,loudnorm=I=-16:TP=-1.5:LRA=11,${fmt}[aout]`);

const ff = (a) => new Promise((res, rej) => { const p = spawn('ffmpeg', a, { stdio: ['ignore', 'inherit', 'pipe'] });
  let err = ''; p.stderr.on('data', d => err += d); p.on('close', c => c ? rej(new Error(err.slice(-2000))) : res(err)); });
await ff(['-v', 'error', '-y', ...inputs, '-filter_complex', parts.join(';'), '-map', '0:v', '-map', '[aout]',
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', dur.toFixed(3), '-movflags', '+faststart', args.out]);

// Am fertigen MP4 messen, nicht am Zwischenstand
const meter = await ff(['-nostats', '-i', args.out, '-af', 'ebur128=peak=true', '-f', 'null', '-']);
const I = (meter.match(/I:\s+(-?[\d.]+) LUFS/g) || []).pop();
const TP = (meter.match(/Peak:\s+(-?[\d.]+) dBFS/g) || []).pop();
console.log(`Video mit Ton -> ${args.out}  (${dur.toFixed(1)} s, ${I || 'I: ?'}, True ${TP || 'Peak: ?'}, ${cues.length} Effekte)`);
