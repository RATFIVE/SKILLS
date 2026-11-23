/* kit.js: kleine Zeitleiste für Lernvideos, die render.mjs Bild für Bild abfilmt.
   Die Seite beschreibt jeden Zustand als Funktion der Zeit t; es gibt keine laufenden Animationen.

   Kit.video({ duration, w: 1920, h: 1080, stills: { name: [t, ...] } })
       setzt window.VIDEO und window.seek. Ohne ?render in der Adresse spielt die Seite als Vorschau
       ab (Leertaste: Pause, Pfeiltasten: ±2 s, voice-final.flac im selben Ordner läuft mit).
   Kit.scene(t => { ... })      registriert eine Szene; seek(t) ruft alle Szenen mit t auf.
   Kit.at('runs-on')            Videozeit (s), zu der das Wort gesprochen wird (aus window.WORDS).
   Kit.at('jobs laufen', 2)     zweites Vorkommen; mehrere Wörter = aufeinanderfolgende Wörter.
   Kit.end('runs-on')           Ende dieses Wortes.
       Wörter werden ohne Groß/klein, Satzzeichen und Backticks verglichen. Unbekannte Wörter werfen
       einen Fehler, damit falsche Anker beim Rendern auffallen statt still auf 0 zu landen.
   Kit.p(t, start, dauer, ease)  Fortschritt 0..1 (ease: Kit.out Standard, Kit.inOut, Kit.lin).
   Kit.fade(el, t, ein, aus, { d: 0.35, y: 24 })  ein- und ausblenden mit leichtem Hochgleiten.
   Kit.type(el, text, t, start, zeichenProSek)    Schreibmaschine.
   Kit.on(el, cls, t, start, ende)                CSS-Klasse im Zeitfenster setzen. */
(function () {
  var scenes = [];
  var W = window.WORDS || { voiceAt: 0, words: [] };
  var norm = function (s) { return String(s).toLowerCase().replace(/[`'"„“”‚‘’.,;:!?()\[\]{}«»…–—]/g, '').trim(); };
  var list = W.words.map(function (w) { return norm(w.w); });

  function find(query, n) {
    var q = String(query).split(/\s+/).map(norm).filter(Boolean);
    var hit = 0;
    for (var i = 0; i + q.length <= list.length; i++) {
      var ok = true;
      for (var k = 0; k < q.length; k++) if (list[i + k] !== q[k]) { ok = false; break; }
      if (ok && ++hit === (n || 1)) return { first: W.words[i], last: W.words[i + q.length - 1] };
    }
    throw new Error('Kit.at: "' + query + '" (' + (n || 1) + '.) nicht in WORDS gefunden');
  }

  var Kit = {
    lin: function (x) { return x; },
    out: function (x) { return 1 - Math.pow(1 - x, 3); },
    inOut: function (x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
    clamp: function (x, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a || 0, x)); },
    p: function (t, start, dur, ease) {
      var x = dur > 0 ? Kit.clamp((t - start) / dur) : (t >= start ? 1 : 0);
      return (ease || Kit.out)(x);
    },
    at: function (q, n) { return find(q, n).first.s; },
    end: function (q, n) { return find(q, n).last.e; },
    words: W,
    scene: function (fn) { scenes.push(fn); },
    fade: function (el, t, tin, tout, o) {
      o = o || {}; var d = o.d === undefined ? 0.35 : o.d, y = o.y === undefined ? 24 : o.y;
      var a = Kit.p(t, tin, d) * (tout === undefined ? 1 : 1 - Kit.p(t, tout, d));
      el.style.opacity = a;
      el.style.transform = 'translateY(' + ((1 - Kit.p(t, tin, d)) * y) + 'px)';
      el.style.visibility = a > 0.001 ? 'visible' : 'hidden';
      return a;
    },
    type: function (el, text, t, start, cps) {
      var k = Math.floor(Kit.clamp((t - start) * (cps || 28), 0, text.length));
      el.textContent = text.slice(0, k);
      return k >= text.length;
    },
    on: function (el, cls, t, start, end) {
      el.classList.toggle(cls, t >= start && (end === undefined || t < end));
    },
    video: function (v) {
      window.VIDEO = { w: v.w || 1920, h: v.h || 1080, duration: v.duration, stills: v.stills };
      window.seek = function (t) { for (var i = 0; i < scenes.length; i++) scenes[i](t); };
      if (/[?&]render/.test(location.search)) return;
      // Vorschau im Browser: auf Fenstergröße skalieren und abspielen
      var stage = document.querySelector('.stage');
      var fit = function () {
        var s = Math.min(innerWidth / window.VIDEO.w, innerHeight / window.VIDEO.h);
        if (stage) { stage.style.transformOrigin = '0 0'; stage.style.transform = 'scale(' + s + ')'; }
      };
      addEventListener('resize', fit); fit();
      var audio = new Audio('voice-final.flac'), t0 = performance.now(), off = 0, paused = false;
      var now = function () { return paused ? off : off + (performance.now() - t0) / 1000; };
      var sync = function () {
        audio.currentTime = Math.max(0, now() - W.voiceAt);
        if (!paused && now() >= W.voiceAt) audio.play().catch(function () {});
      };
      addEventListener('keydown', function (e) {
        if (e.code === 'Space') { off = now(); t0 = performance.now(); paused = !paused; paused ? audio.pause() : sync(); }
        if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') { off = Math.max(0, now() + (e.code === 'ArrowRight' ? 2 : -2)); t0 = performance.now(); sync(); }
      });
      var started = false;
      (function loop() {
        var t = now() % window.VIDEO.duration;
        if (!started && t >= W.voiceAt) { started = true; sync(); }
        window.seek(t);
        requestAnimationFrame(loop);
      })();
    }
  };
  window.Kit = Kit;
})();
