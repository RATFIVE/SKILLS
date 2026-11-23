// render.mjs: macht aus einer seek(t)-Seite ein stummes MP4 (Ton kommt danach mit mix.mjs).
//   node render.mjs seite.html bild.mp4 [fps=30] [subframes=2] [workers=4]
//   node render.mjs seite.html kontakt.png --stills 0.5,1.2,3     (Kontaktbogen zum Prüfen)
//   node render.mjs seite.html kontakt.png --stills auto          (ein Bogen je Liste in window.VIDEO.stills)
// Die Seite stellt bereit: window.VIDEO = { w, h, duration, stills? } und window.seek(t).
// Sie wird mit ?render geladen. playwright kommt aus $TEACH_VIDEO_HOME/node (siehe setup.sh).
// Abgeleitet von einem Renderer aus dem Projekt TZ-Wartezimmer-TV.
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const home = process.env.TEACH_VIDEO_HOME || path.join(os.homedir(), '.cache', 'teach-video');
const { chromium } = createRequire(path.join(home, 'node', 'package.json'))('playwright');

const [, , html, out, a3 = '30', a4 = '2', a5 = '4'] = process.argv;
if (!html || !out) { console.log('usage: node render.mjs seite.html bild.mp4 [fps] [subframes] [workers]'); process.exit(1); }
const run = (args) => new Promise((res, rej) => { const p = spawn('ffmpeg', args, { stdio: 'inherit' }); p.on('close', c => c ? rej(new Error('ffmpeg ' + c)) : res()); });
const url = pathToFileURL(path.resolve(html)).href + '?render';
const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });

// Zuerst die Größe lesen, dann jede Seite genau in dieser Größe öffnen
const probe = await browser.newPage();
const errors = [];
probe.on('pageerror', e => errors.push(e.message));
await probe.goto(url);
await probe.waitForFunction(() => window.VIDEO && typeof window.seek === 'function', null, { timeout: 15000 })
  .catch(() => { console.error('FEHLER: window.VIDEO oder window.seek fehlt.', errors.join(' | ')); process.exit(1); });
const V = await probe.evaluate(() => window.VIDEO);
await probe.close();

async function openPage() {
  const page = await browser.newPage({ viewport: { width: V.w, height: V.h }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('Seitenfehler:', e.message));
  await page.goto(url);
  await page.waitForFunction(() => window.VIDEO && typeof window.seek === 'function');
  const bad = await page.evaluate(async () => {
    await Promise.all([...document.fonts].map(f => f.load().catch(() => {})));
    await document.fonts.ready;
    return [...document.fonts].filter(f => f.status !== 'loaded').map(f => f.family);
  });
  if (bad.length) console.warn('WARNUNG: Schriften nicht geladen (Ersatzschrift aktiv):', [...new Set(bad)].join(', '));
  return page;
}
const shot = async (page, t) => { await page.evaluate(t => window.seek(t), t); return page.screenshot({ type: 'jpeg', quality: 95 }); };

if (a3 === '--stills') {
  const page = await openPage();
  const sets = a4 === 'auto'
    ? Object.entries(V.stills || {}).map(([k, ts]) => [out.replace(/\.png$/, '') + `-${k}.png`, ts])
    : [[out, a4.split(',').map(Number)]];
  if (!sets.length) { console.error('window.VIDEO.stills fehlt: Zeiten angeben (--stills 1,2,3)'); process.exit(1); }
  for (const [file, times] of sets) {
    const dir = file + '.frames';
    mkdirSync(dir, { recursive: true });
    for (let i = 0; i < times.length; i++) writeFileSync(`${dir}/${String(i).padStart(3, '0')}.jpg`, await shot(page, times[i]));
    const cols = Math.min(3, times.length), rows = Math.ceil(times.length / cols);
    await run(['-v', 'error', '-y', '-framerate', '1', '-i', `${dir}/%03d.jpg`, '-vf', `scale=${Math.min(960, V.w)}:-1,tile=${cols}x${rows}:padding=6:color=gray`, '-frames:v', '1', file]);
    rmSync(dir, { recursive: true });
    console.log(`Kontaktbogen -> ${file}  (${times.map(t => t.toFixed(2)).join(', ')})`);
  }
  await browser.close(); process.exit(0);
}

const fps = +a3, sub = Math.max(1, +a4), workers = Math.max(1, +a5), N = Math.round(V.duration * fps);
const base = out.replace(/\.mp4$/, '');
// Bewegungsunschärfe: sub Teilbilder über eine halbe Bilddauer (180°-Verschluss), gemittelt
const vf = sub > 1 ? ['-vf', `tmix=frames=${sub},select='eq(mod(n\\,${sub})\\,${sub - 1})',setpts=N/(${fps}*TB)`] : [];
const t0 = Date.now(); let doneFrames = 0;
const per = Math.ceil(N / workers), segs = [];
await Promise.all(Array.from({ length: workers }, async (_, w) => {
  const a = w * per, b = Math.min(N, a + per); if (a >= b) return;
  const seg = `${base}_seg${w}.mp4`; segs[w] = seg;
  const page = await openPage();
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps * sub), '-i', '-', ...vf,
    '-r', String(fps), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', seg], { stdio: ['pipe', 'inherit', 'inherit'] });
  const closed = new Promise(r => ff.on('close', r));
  for (let f = a; f < b; f++) {
    for (let s = 0; s < sub; s++) {
      const buf = await shot(page, (f + (sub > 1 ? (s / sub) * 0.5 : 0)) / fps);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    }
    if (++doneFrames % 30 === 0) process.stdout.write(`\r${doneFrames}/${N} Bilder  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  ff.stdin.end(); await closed; await page.close();
}));
const list = base + '_segs.txt';
writeFileSync(list, segs.filter(Boolean).map(s => `file '${path.resolve(s)}'`).join('\n'));
await run(['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', out]);
segs.filter(Boolean).forEach(s => rmSync(s)); rmSync(list);
console.log(`\nBild -> ${out}  (${N} Bilder, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
await browser.close();
