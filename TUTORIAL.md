# Tutorial: Skills

Wann ich welchen Skill benutze, in welcher Reihenfolge, und wie ein Aufruf aussieht. Hier stehen alle Skills, die `update-skills.sh` installiert, also die eigenen aus diesem Repo und die fremden. Fremde Skills haben einen Quellen-Vermerk in Klammern.

Ein paar Dinge vorab:

- Skills mit dem Vermerk **nur per `/name`** startet Claude nicht von selbst (`disable-model-invocation: true`). Die muss ich ausdrücklich aufrufen.
- Alle anderen greift Claude auch ohne Slash auf, wenn die Anfrage passt, z. B. „debug das mal“ für `diagnosing-bugs`.
- Jede Kategorie beginnt mit dem typischen Ablauf. Die Skills darunter stehen in dieser Reihenfolge.
- Wenn ich nicht weiß, welcher Skill passt: `/ask-matt` fragen (siehe [Selten und Setup](#selten-und-setup)).

## Inhalt

1. [Engineering](#engineering)
2. [Productivity](#productivity)
3. [Design: Websites und Oberflächen](#design-websites-und-oberflächen)
4. [Design: Videos](#design-videos)
5. [Business](#business)
6. [Finanzen](#finanzen)
7. [Steuer](#steuer)
8. [Selten und Setup](#selten-und-setup)
9. [Mods](#mods)

---

## Engineering

Der Hauptweg von der Idee bis zum Merge:

```
setup-matt-pocock-skills   (einmal pro Repo)
        │
grill-with-docs  ──(Frage nur mit Code klärbar?)──  handoff → prototype → handoff
        │
   kleine Sache? ──ja──→ implement (direkt hier)
        │ nein
     to-spec → to-tickets
        │
   implement (pro Ticket, /clear dazwischen)
   oder implement-spec (alle Tickets in einem Lauf)
   oder gh-ticket-batch (alle offenen GitHub-Issues)
        │
   (intern: tdd → code-review)
        │
       pr → retro
```

Seiteneinstiege: `triage` für fremde Issues, `diagnosing-bugs` für Fehler, `wayfinder` für riesige Vorhaben. Für die Pflege des Codes gibt es `improve-codebase-architecture`, `codebase-design`, `domain-modeling`, `senior-developer` und `security-audit`.

Wenn die Aufgaben schon als Liste in einer `NOTES.md` oder `TODO.md` stehen, nimmt [`notes-to-tickets`](#notes-to-tickets) die ersten drei Schritte ab.

### `grill-with-docs` (mattpocock) · nur per `/grill-with-docs`

**Wann:** Ich habe eine Idee für ein Feature und sitze in einem Repo. Claude stellt Fragen in Runden, bis der Plan steht, und schreibt dabei neue Begriffe in `GLOSSARY.md` und Entscheidungen als ADR nach `docs/adr/`.

**Beispiel:**
```
/grill-with-docs Ich will, dass Nutzer ihre Einkaufsliste mit anderen teilen können.
```

**Ergebnis:** Ein geklärter Plan im Gesprächsverlauf, dazu aktualisiertes Glossar und ggf. ADRs.

**Davor / Danach:** Davor ggf. `research`. Danach `to-spec`, bei kleinen Sachen direkt `implement`. Bis `to-tickets` im selben Kontext bleiben, nicht `/clear`en.

### `prototype` (mattpocock)

**Wann:** Eine Frage aus dem Grilling lässt sich nicht auf dem Papier beantworten: Fühlt sich dieses Zustandsmodell richtig an? Wie soll die Oberfläche aussehen? Dann ein Wegwerf-Programm, das genau diese eine Frage klärt.

**Beispiel:**
```
Bau mir einen Prototyp, um zu sehen, ob das Teilen per Link oder per Einladung besser bedienbar ist.
```

**Ergebnis:** Kleiner Prototyp auf einem Branch `prototype/<name>`, der später als Quelle im Ticket verlinkt wird.

**Davor / Danach:** Mit `handoff` raus in eine frische Sitzung, Prototyp bauen, mit `handoff` zurück und im ursprünglichen Gespräch weitermachen.

### `to-spec` (mattpocock) · nur per `/to-spec`

**Wann:** Direkt nach dem Grilling, wenn die Arbeit größer als eine Sitzung ist. Kein neues Interview, nur Zusammenfassen des Besprochenen.

**Beispiel:**
```
/to-spec
```

**Ergebnis:** Ein Spec-Issue im Issue-Tracker (GitHub oder lokal).

**Davor / Danach:** Davor `grill-with-docs` oder `wayfinder`. Danach `to-tickets`.

### `to-tickets` (mattpocock) · nur per `/to-tickets`

**Wann:** Die Spec soll in einzelne, nacheinander baubare Tickets zerlegt werden. Jedes Ticket ist ein dünner Durchstich (Tracer Bullet) und sagt, von welchen anderen es blockiert wird.

**Beispiel:**
```
/to-tickets
```

**Ergebnis:** Mehrere Tickets mit „blocked by“-Angaben, auf GitHub als echte Verknüpfungen, lokal als eine Datei pro Ticket unter `.scratch/<feature>/issues/`.

**Davor / Danach:** Davor `to-spec`. Danach `implement`, `implement-spec` oder `gh-ticket-batch`. Diese Tickets nicht mehr durch `triage` schicken.

### `implement` (mattpocock) · nur per `/implement`

**Wann:** Ein Ticket umsetzen, oder eine kleine Sache direkt nach dem Grilling. Läuft intern über `tdd` und endet mit `code-review`.

**Beispiel:**
```
/implement #143
```

**Ergebnis:** Implementierung mit Tests und Review für dieses eine Ticket.

**Davor / Danach:** Bei mehreren Tickets zwischen jedem `/clear`, das Ticket enthält alles Nötige. Danach `pr`.

### `implement-spec` (mattpocock) · nur per `/implement-spec`

**Wann:** Alle Tickets einer Spec in einem Lauf bauen lassen, statt jedes selbst anzustoßen. Liest die Tickets als Abhängigkeitsgraph und lässt bereite Tickets parallel von Subagents umsetzen.

**Beispiel:**
```
/implement-spec #142
```

**Ergebnis:** Alles landet auf einem Integrations-Branch, am Ende ein gemeinsames `code-review`.

**Davor / Danach:** Davor `to-tickets`. Danach `pr`.

### `gh-ticket-batch` (eigener Skill)

**Wann:** Alle offenen GitHub-Issues eines Repos auf einmal abarbeiten. Ein Subagent pro Ticket, unabhängige parallel, abhängige nacheinander. Jeder arbeitet mit `tdd`, prüft im Browser per Playwright, debuggt mit `diagnosing-bugs` und vereinfacht nach `caveman`-Art.

**Beispiel:**
```
Implementiere alle offenen Tickets.
```

**Ergebnis:** Ein Commit pro erfolgreichem Ticket, am Ende eine Sammelmeldung. Unterbrochen wird nur, wenn z. B. Zugangsdaten fehlen.

**Davor / Danach:** Davor `notes-to-tickets` oder `to-tickets`. Unterschied zu `implement-spec`: arbeitet alle offenen Issues ab, nicht nur die einer Spec.

### `tdd` (mattpocock)

**Wann:** Etwas test-first bauen, eine Rot-Grün-Scheibe nach der anderen. Steckt in `implement` und `gh-ticket-batch`, geht aber auch allein, wenn ich ohne Spec ein konkretes Verhalten bauen will.

**Beispiel:**
```
/tdd Der Login soll nach fünf Fehlversuchen für 15 Minuten sperren.
```

**Ergebnis:** Tests und Code, schrittweise entstanden.

**Davor / Danach:** Danach `code-review`.

### `code-review` (mattpocock)

**Wann:** Änderungen seit einem festen Punkt prüfen (Commit, Branch, Tag). Zwei Blickwinkel parallel: Hält sich der Code an die Standards des Repos? Macht er, was das Issue verlangt hat?

**Beispiel:**
```
Review alles seit main.
```

**Ergebnis:** Zwei Berichte nebeneinander, Standards und Spec.

**Davor / Danach:** Läuft automatisch am Ende von `implement`. Danach `pr`.

### `pr` (mattpocock)

**Wann:** Claude schreibt eine Pull-Request-Beschreibung. Greift automatisch, ich muss es nicht aufrufen.

**Beispiel:**
```
Mach einen PR für den Branch auf.
```

**Ergebnis:** PR-Text mit der kleinsten aussagekräftigen Visualisierung, Vorher/Nachher-Beleg und der Einschätzung, ob die Änderung leicht rückgängig zu machen ist.

**Davor / Danach:** Danach `retro`.

### `retro` (mattpocock) · nur per `/retro`

**Wann:** Nach einem Build, besonders wenn es holprig lief. Schaut auf die Sitzung zurück und schlägt Änderungen an der Umgebung vor: automatische Checks, Coding-Standards, `CLAUDE.md`, Werkzeuge. Den Code selbst fasst es nicht an.

**Beispiel:**
```
/retro
```

**Ergebnis:** Liste mit Vorschlägen. Wiederkehrende mechanische Fehler werden zu Checks, Ermessensfragen zu Standards.

**Davor / Danach:** In derselben Sitzung laufen lassen, vor dem `/clear`.

### `triage` (mattpocock) · nur per `/triage`

**Wann:** Fremde Bug-Reports und Feature-Wünsche stapeln sich. Triage sortiert sie, prüft sie, grillt bei Bedarf nach und schreibt daraus Issues, die ein Agent umsetzen kann. Nur für Issues, die ich nicht selbst mit `to-tickets` erzeugt habe.

**Beispiel:**
```
/triage
```

**Ergebnis:** Kategorisierte Issues mit Labels und klaren Arbeitsaufträgen.

**Davor / Danach:** Davor `setup-matt-pocock-skills` (für die Labels). Danach `implement`.

### `diagnosing-bugs` (mattpocock)

**Wann:** Etwas ist kaputt, wirft Fehler, ist langsam oder flackert mal so, mal so. Der Skill baut zuerst einen Befehl, der genau diesen Fehler reproduzierbar rot werden lässt, und fängt erst dann mit Theorien an.

**Beispiel:**
```
Debug das: Der Export bricht bei Listen mit mehr als 100 Einträgen ab.
```

**Ergebnis:** Ursache, Fix und ein Regressionstest.

**Davor / Danach:** Danach `retro` (was hätte den Bug verhindert?). Wenn sich der Bug nicht sauber absichern lässt, `improve-codebase-architecture`.

### `wayfinder` (mattpocock) · nur per `/wayfinder`

**Wann:** Ein riesiges, noch nebliges Vorhaben, das in keine Sitzung passt, z. B. ein neues Projekt von Null. Legt eine Karte aus Entscheidungs-Tickets im Tracker an und klärt sie nacheinander. Liefert Entscheidungen, keinen Code. Für normale Features zu schwer.

**Beispiel:**
```
/wayfinder Ich will eine eigene App für die Familienplanung bauen, mit Kalender, Einkauf und Aufgaben.
```

**Ergebnis:** Verknüpfte Entscheidungs-Tickets, bis der Weg klar ist.

**Davor / Danach:** Danach `to-spec`, nicht direkt `implement`.

### `improve-codebase-architecture` (mattpocock) · nur per `/improve-codebase-architecture`

**Wann:** Wenn ich mal Luft habe und den Code für Agents besser bedienbar machen will. Sucht Stellen, an denen sich Module „vertiefen“ lassen (viel Verhalten hinter kleiner Schnittstelle).

**Beispiel:**
```
/improve-codebase-architecture
```

**Ergebnis:** HTML-Bericht mit Kandidaten. Den gewählten grillt der Skill mit mir durch.

**Davor / Danach:** Danach `codebase-design` für den Entwurf, dann zurück in den Hauptweg bei `grill-with-docs`.

### `codebase-design` (mattpocock)

**Wann:** Die Schnittstelle eines Moduls entwerfen oder verbessern, eine Naht (Seam) für Tests finden. Liefert das gemeinsame Vokabular (Modul, Schnittstelle, Tiefe, Seam, Adapter), das auch `tdd` und `improve-codebase-architecture` benutzen.

**Beispiel:**
```
Wie schneide ich das Zahlungsmodul so, dass ich es ohne echten Stripe-Zugang testen kann?
```

**Ergebnis:** Entwurf für Schnittstelle und Seams.

**Davor / Danach:** Meist nach `improve-codebase-architecture`.

### `domain-modeling` (mattpocock)

**Wann:** Die Begriffe im Projekt sind unscharf, ein Wort hat drei Bedeutungen, oder eine schwer umkehrbare Entscheidung soll als ADR festgehalten werden. `grill-with-docs` benutzt es intern.

**Beispiel:**
```
„Konto“ meint bei uns mal den Login, mal das Bankkonto, mal den Haushalt. Lass uns das auseinanderziehen.
```

**Ergebnis:** Saubere Einträge in `GLOSSARY.md`, ggf. ein ADR.

### `senior-developer` (eigener Skill, im Repo unter `productivity/`)

**Wann:** Ich will Rat wie von einem erfahrenen Entwickler: Projektstruktur, welches Pattern oder welche Bibliothek, warum Code langsam oder fragil ist, wie aus einem Notebook oder Skript wartbarer Produktivcode wird. Erklärt mit Begründung statt nur Lösung.

**Beispiel:**
```
/senior-developer Mein Scraper ist ein 600-Zeilen-Skript. Wie mache ich daraus etwas Wartbares?
```

**Ergebnis:** Erklärung, Vorschlag zur Struktur, ggf. Review mit Gegenargumenten.

**Davor / Danach:** Steht für sich. Konkrete Umsetzung danach über den Hauptweg.

### `security-audit` (cloudflare)

**Wann:** Sicherheitsfragen, gezielter Blick auf eine Stelle oder ein vollständiges Audit bzw. Pentest einer Codebasis, API oder eines CLI-Tools. Den kompletten Ablauf mit Bericht gibt es nur, wenn ich ausdrücklich ein Audit verlange.

**Beispiel:**
```
Mach ein Security-Audit der API in src/server/ und schreib einen Bericht.
```

**Ergebnis:** Fundliste mit Schweregrad, bei vollem Audit als Bericht.

**Davor / Danach:** Gut vor einem Livegang, z. B. vor Phase 7 von `website-bauen`.

---

## Productivity

Allgemeine Werkzeuge, nicht an Code gebunden.

```
Gedanken schärfen:     grilling  ←  grill-me (ohne Repo) / grill-with-docs (mit Repo)
Notizen zu Tickets:    notes-to-tickets  →  gh-ticket-batch
Lesen auslagern:       research  →  grill-with-docs
Wissen von anderen:    to-questionnaire  →  grill-with-docs / to-spec
Sitzung wechseln:      handoff
Lernen:                teach  (→ teach-video)
Im Gespräch:           wait-what, caveman
```

### `grill-me` (mattpocock) · nur per `/grill-me`

**Wann:** Einen Plan, eine Entscheidung oder einen Text durchgrillen lassen, ohne dass etwas gespeichert wird. Für alles ohne Repo dahinter. Im Repo ist `grill-with-docs` besser, weil es Glossar und ADRs mitschreibt.

**Beispiel:**
```
/grill-me Ich überlege, meinen Job zu kündigen und mich mit Webdesign selbständig zu machen.
```

**Ergebnis:** Fragen in Runden, jeweils mit Empfehlung, bis alles geklärt ist.

**Davor / Danach:** Danach je nach Thema z. B. `wettbewerbsanalyse` oder `to-questionnaire`.

### `grilling` (mattpocock)

**Wann:** Das Interview-Grundgerüst, das `grill-me`, `grill-with-docs`, `triage`, `wayfinder`, `wettbewerbsanalyse` und die Steuer-Skills intern nutzen. Direkt nur, wenn ich das reine Interview ohne Drumherum will. Claude greift es auch auf, wenn ich „grill mich“ sage.

**Beispiel:**
```
Grill mich zu meinem Plan, das Backend von Express auf Hono umzustellen.
```

**Ergebnis:** Nummerierte Fragen pro Runde, Fakten sucht Claude selbst, Entscheidungen bleiben bei mir.

### `notes-to-tickets` (eigener Skill)

**Wann:** In einer `NOTES.md` oder `TODO.md` stehen rohe Aufgaben, und daraus sollen fertige Tickets werden. Fährt `grill-with-docs` → `to-spec` → `to-tickets` in einem Durchgang, mit Rückfragen nur an den drei Checkpoints.

**Beispiel:**
```
@TODO.md zu Tickets
```

**Ergebnis:** Ein Spec-Issue und die veröffentlichten Tickets mit Abhängigkeiten, am Ende eine Liste mit Links.

**Davor / Danach:** Davor einmal `setup-matt-pocock-skills`. Danach `gh-ticket-batch` oder `implement-spec`.

### `research` (mattpocock)

**Wann:** Eine Frage soll gegen Primärquellen (offizielle Doku, Spezifikationen) recherchiert werden, während ich weiterarbeite. Läuft als Hintergrund-Agent.

**Beispiel:**
```
Recherchier, wie Passkeys mit WebAuthn in Safari und Firefox aktuell unterstützt werden.
```

**Ergebnis:** Markdown-Datei mit Quellen im Repo.

**Davor / Danach:** Danach `grill-with-docs` mit der Datei als Grundlage.

### `to-questionnaire` (mattpocock) · nur per `/to-questionnaire`

**Wann:** Die Antwort, die mir fehlt, liegt bei jemand anderem (Kunde, Kollege, Steuerberater). Der Skill fragt mich, an wen es geht und was ich zurück brauche, und baut daraus einen Fragebogen.

**Beispiel:**
```
/to-questionnaire Ich brauche vom Kunden die Infos für den Shop: Versand, Zahlungsarten, Retouren.
```

**Ergebnis:** Fragebogen zum Weiterschicken.

**Davor / Danach:** Die Antworten gehen danach in `grill-with-docs` oder `to-spec`.

### `handoff` (mattpocock) · nur per `/handoff`

**Wann:** Die Arbeit soll in einer anderen Sitzung, einem anderen Ordner, einem anderen Tool oder bei jemand anderem weitergehen. Für einen normalen Neustart im selben Ordner reicht meist `/compact`.

**Beispiel:**
```
/handoff Prototyp für das Teilen-Feature in ../teilen-prototyp bauen
```

**Ergebnis:** Markdown-Datei, mit der eine frische Sitzung direkt weitermachen kann.

**Davor / Danach:** Typisch vor und nach `prototype`.

### `teach` (mattpocock) · nur per `/teach`

**Wann:** Ein Thema über mehrere Sitzungen lernen. Der aktuelle Ordner wird zum Kursordner mit `MISSION.md`, Lektionen als HTML, Spickzetteln, Quellenliste und Lernstand.

**Beispiel:**
```
/teach Ich will Rust lernen, um meine Python-CLI-Tools schneller zu machen.
```

**Ergebnis:** Erst Fragen zur Motivation, dann Lektionen in `lessons/0001-….html` mit Quellen und Abfragen.

**Davor / Danach:** Danach `teach-video`, wenn eine Einheit als Video statt HTML kommen soll.

### `wait-what` (mattpocock) · nur per `/wait-what`

**Wann:** Claudes letzte Antwort war unverständlich, zu viel Fachjargon, Kontext fehlt. Funktioniert mitten in jedem anderen Skill.

**Beispiel:**
```
/wait-what
```

**Ergebnis:** Dieselbe Aussage nochmal, einfach erklärt, mit den Begriffen aus `GLOSSARY.md`.

### `caveman` (eigener Skill)

**Wann:** Ich will knappe Antworten und weniger Token. Füllwörter fliegen raus, der technische Inhalt bleibt. `gh-ticket-batch` nutzt den Gedanken auch für einfacheren Code.

**Beispiel:**
```
/caveman
```

**Ergebnis:** Antworten im Telegrammstil, bis ich es wieder abschalte („normal mode“).

---

## Design: Websites und Oberflächen

```
Ganze Website mit Marke, Texten, SEO und Livegang:   website-bauen
Schnell eine filmreife Landingpage:                  motionsites-web-builder
Einzelne Oberfläche mit eigenem Look:                frontend-design-guide
```

Davor oft `wettbewerbsanalyse` (wer sind die Konkurrenten, wie positioniere ich mich), danach oft ein Video aus [Design: Videos](#design-videos).

### `website-bauen` (Julian-Ivanov)

**Wann:** Eine Website komplett neu bauen oder grundlegend überarbeiten, auch ohne Namen und Logo. Führt durch neun Phasen: Einrichten, Fundament (Marke), Recherche, Texte, Design-Richtung, Bauen, Prüfen, Livegang (SEO, GEO, Cookies, AGB, Rechtstexte), Danach (Search Console). Nach den Phasen 1, 2, 3, 4 und 6 muss ich abnehmen.

**Beispiel:**
```
/website-bauen start
```
später in einem neuen Chat:
```
/website-bauen weiter
```

**Ergebnis:** Pro Phase Dateien wie `PRODUCT.md`, `texte.md`, `DESIGN.md`, am Ende die Seite online. Der Stand steht in `WEBSITE-STATUS.md`.

**Davor / Danach:** Davor `wettbewerbsanalyse`. Vor Phase 7 kann `security-audit` sinnvoll sein. Weitere Argumente: `status`, `phase 3`.

### `motionsites-web-builder` (Motionsites-AI)

**Wann:** Schnell eine Landingpage, einen Hero-Bereich oder ein Portfolio mit Kino-Optik. Nimmt eine echte Vorlage von motionsites.ai als Ausgangspunkt, baut sie für mich um, macht Screenshots und bessert nach. Liefert auf Wunsch auch nur einen Prompt für Lovable, Bolt oder v0.

**Beispiel:**
```
Bau mir eine Landingpage für mein Fotostudio, dunkel, mit Video im Hintergrund.
```
```
Schreib mir einen Prompt für Lovable für eine Landingpage meiner Yoga-App.
```

**Ergebnis:** Eine eigenständige `index.html` (CSS und JS eingebettet) plus Screenshots für Desktop und Mobil, oder ein fertiger Prompt.

**Davor / Danach:** Statt `website-bauen`, wenn ich keinen ganzen Prozess will.

### `frontend-design-guide` (eigener Skill)

**Wann:** Irgendeine Oberfläche bauen oder verschönern (Dashboard, Komponente, Slides, Poster, Layout), die nicht nach Standard-Web aussehen soll. Greift oft von selbst, auch ohne das Wort „Design“. `wettbewerbsanalyse` nutzt ihn für den Report.

**Beispiel:**
```
Bau mir ein Dashboard für meine Haushaltsausgaben, ruhig und gut lesbar, als einzelne HTML-Datei.
```

**Ergebnis:** HTML-Entwurf mit durchdachter Typografie, Farben und Abständen.

---

## Design: Videos

```
Produkt-Demo (45–90 s, ruhig):          explainer-default
Durchgehende Kamerafahrt (10–30 s):     explainer-engaging
Hype-Teaser (12–20 s, schnell):         explainer-high-energy
Erklärvideo mit Stimme und KI-Bildern:  motion-video
Grafiken über ein Sprecher-Video:       object-separation (optional) → motion-broll
Lernvideo für einen /teach-Kurs:        teach-video
Ton für jedes Video danach:             sound-effects
```

### `explainer-default` (Barty-Bart)

**Wann:** Saubere Produkt-Demo für eine Software: heller Hintergrund, kurze zentrierte Sätze, die Oberfläche des Produkts wird nachgebaut und in Benutzung gezeigt, am Ende das Logo.

**Beispiel:**
```
Mach ein Demo-Video für meine Notiz-App, so 60 Sekunden, zeig das Suchen und das Teilen.
```

**Ergebnis:** MP4 mit Musik, aus Code gerendert.

**Davor / Danach:** Danach bei Bedarf `sound-effects`.

### `explainer-engaging` (Barty-Bart)

**Wann:** Kurzes Erklärvideo in einer einzigen Einstellung. Ein Element (Ball, Cursor, Datei) wandert durch die Stationen des Ablaufs, die Kamera folgt, am Ende zoomt sie raus und zeigt den ganzen Weg. Eignet sich auch als Loop.

**Beispiel:**
```
Mach ein 20-Sekunden-Video, in dem eine Rechnung durch meinen Workflow wandert: Upload, Erkennung, Buchung, Export.
```

**Ergebnis:** MP4 mit Ton.

### `explainer-high-energy` (Barty-Bart)

**Wann:** Teaser oder Launch-Clip mit schnellen Schnitten im Takt, bewegter Schrift und HUD-Rahmen.

**Beispiel:**
```
Mach einen 15-Sekunden-Hype-Teaser für den Launch meiner App.
```

**Ergebnis:** MP4 mit synthetisch erzeugter Musik.

### `motion-video` (eigener Skill)

**Wann:** Erklärvideo, Werbespot oder Teaser mit viel Animation, freigestellten KI-Bildern, Sprecherstimme und Sounddesign. Animationen sitzen auf dem gesprochenen Wort. Rendert über Higgsfield Katana oder lokal mit HyperFrames. Der gewählte Weg wird in `praeferenzen.md` neben dem Skill gemerkt. Für den lokalen Weg muss der API-Schlüssel des Bildanbieters als Umgebungsvariable gesetzt sein.

**Beispiel:**
```
Mach ein 45-Sekunden-Erklärvideo, wie meine Steuer-Skills funktionieren, mit deutscher Sprecherstimme.
```

**Ergebnis:** MP4, Lautheit bei etwa -14 bis -16 LUFS. Vorher fragt der Skill Format, Länge und Stimme ab und nennt die Kosten.

**Davor / Danach:** Danach bei Bedarf `sound-effects`.

### `object-separation` (Barty-Bart)

**Wann:** Eine Person, ein Produkt oder eine Hand im Video vom Hintergrund trennen, lokal mit SAM 2. Prüft zuerst den Rechner, um die passende Modellgröße zu wählen.

**Beispiel:**
```
Stell mich in talk.mp4 frei.
```

**Ergebnis:** Dasselbe Video mit grün markiertem Motiv plus Masken pro Frame.

**Davor / Danach:** Danach `motion-broll`, wenn Grafiken hinter die Person sollen.

### `motion-broll` (Barty-Bart)

**Wann:** Zu einem Sprecher-Video (am besten mit Transkript) Motion-Graphics als B-Roll erzeugen, getaktet auf die Worte. Stil: ein Element, das sich verwandelt und nie schneidet.

**Beispiel:**
```
Hier ist talk.mp4 mit transkript.txt. Mach B-Roll für die Stellen, an denen ich die drei Schritte erkläre.
```

**Ergebnis:** Animierte Einblendungen, passend zum Gesagten.

**Davor / Danach:** Davor ggf. `object-separation`. Danach `sound-effects`.

### `teach-video` (eigener Skill) · nur per `/teach-video`

**Wann:** Eine `/teach`-Einheit als Erklärvideo statt HTML-Lektion: 60–120 Sekunden, eine Kernidee an einem Beispiel aus meiner Mission, Abfragen mit Denkpause, Schlusstafel mit Primärquelle. Nutzt Kursordner und Lernstand von `teach`, Stimme und Musik über Higgsfield, Effekte aus `sound-effects`. Die Werkzeuge richtet `scripts/setup.sh` im Skill-Ordner ein.

**Beispiel:**
```
/teach-video Ownership in Rust
```

**Ergebnis:** `videos/NNNN-<name>.mp4` im Kursordner plus Begleitdatei mit Sprechertext, Quellen und Abfragen. Danach stellt Claude die Abfragen im Chat, ein Lerneintrag entsteht erst bei richtigen Antworten.

**Davor / Danach:** Davor `teach` (Kursordner mit `MISSION.md`). Braucht `motion-video` und `sound-effects` installiert.

### `sound-effects` (Barty-Bart)

**Wann:** Ein fertiges Motion-Graphics-Video klingt nach billigen Pieptönen oder hat gar keinen Ton. Der Skill legt Schnitte auf den Takt, setzt pro Einsatz einen echten Effekt aus einer CC0-Bibliothek und mischt auf -16 LUFS.

**Beispiel:**
```
Mach einen Sound-Pass über promo.mp4.
```

**Ergebnis:** Neu gemischtes MP4 plus fünf Zeitstempel, die ich selbst anhören soll.

**Davor / Danach:** Letzter Schritt nach jedem der Video-Skills oben.

---

## Business

```
Idee  →  wettbewerbsanalyse  →  website-bauen / motionsites-web-builder  →  Video
```

### `wettbewerbsanalyse` (eigener Skill)

**Wann:** Eine Geschäftsidee gegen den Markt prüfen. Liest die Projektbeschreibung (`NOTES.md`, README, Konzepte, Bilder), recherchiert Wettbewerber und Preise selbst, klärt offene Entscheidungen per `grilling` und füllt sechs Canvas-Frameworks: Petal Diagram, Value Proposition, Kundenprofil, Product Market Fit, Business Model Canvas, Bullseye. Stellt auch unbequeme Fragen mit Schweregrad.

**Beispiel:**
```
Mach eine Wettbewerbsanalyse für meine Idee in notes.md.
```

**Ergebnis:** `wettbewerbsanalyse.html` in `docs/` (oder im Projektordner), im Browser geprüft.

**Davor / Danach:** Davor ggf. `grill-me`, um die Idee selbst zu schärfen. Danach `website-bauen`.

---

## Finanzen

### `aktien-analyse` (eigener Skill)

**Wann:** Für einen bestimmten Ticker eine handelbare Entscheidung. Zehn Rollen nacheinander: vier Analysten (Technik, News, Fundamentaldaten, Makro), Faktencheck der Zahlen, Bull/Bear-Debatte, Risk-Check, Research Manager, Trader und am Ende die Entscheidung. Daten kommen per yfinance. Startet nur auf ausdrücklichen Wunsch, für beiläufige Aktienfragen reicht eine normale Antwort.

**Beispiel:**
```
aktien-analyse NVDA
```
mit bestehender Position:
```
aktien-analyse ASML, ich habe 20 Stück zu 640 €.
```

**Ergebnis:** Ordner `<TICKER>_<DATUM>/` mit `data/` und `reports/01_technik.md` bis `10_trader.md`, dazu `ENTSCHEIDUNG.md` mit BUY/SELL/HOLD, Entry, Stop und Positionsgröße. Im Chat kommt die Entscheidung mit einer Tabelle aller Signale.

> LLM-Analyse auf Basis öffentlicher Daten, keine Anlageberatung.

---

## Steuer

Zusammenhängende Suite für ein Steuer-Dokumentenarchiv. Einstieg ist immer `steuer-init`, die anderen Skills rufen sich gegenseitig auf.

```
Einmalig:
/steuer-init
  ├─ steuer-soul-pflegen        → SOUL.md
  ├─ steuer-struktur-anlegen    → <Jahr>/NN_Anlage_*/
  └─ steuer-index-aktualisieren → INDEX.md

Laufend, wenn neue Unterlagen kommen:
steuer-dokument-einsortieren          (PDFs aus raw/)
steuer-transaktionen-kategorisieren   (PayPal-Export, Kontoauszug)
  ├─ steuer-uebersicht          → _UEBERSICHT.md pro Anlage
  └─ steuer-index-aktualisieren → INDEX.md

Neues Steuerjahr:
steuer-soul-pflegen (Änderungen?) → steuer-struktur-anlegen
```

> Vorsortierung, keine steuerliche Beratung.

### `steuer-init` (eigener Skill)

**Wann:** Ganz am Anfang, wenn es noch kein Archiv gibt oder nur einen Ordner mit losen Unterlagen.

**Beispiel:**
```
/steuer-init
```

**Ergebnis:** `CLAUDE.md` mit den Archiv-Regeln, `SOUL.md`, die Jahres- und Anlagen-Ordner und `INDEX.md`. Das Archiv ist leer, aber bereit.

**Davor / Danach:** Danach Unterlagen nach `raw/` legen und `steuer-dokument-einsortieren`.

### `steuer-soul-pflegen` (eigener Skill)

**Wann:** Die steuerlich wichtigen Lebensumstände festhalten oder ändern: Familienstand, Studium, Jobs, Gewerbe, Krankenversicherung, Kapitalerträge, Sonderausgaben. Was sich aus dem Archiv ablesen lässt, liest der Skill selbst, den Rest fragt er per `grilling`.

**Beispiel:**
```
Aktualisier meine SOUL.md, ich hab seit März einen Minijob neben dem Studium.
```

**Ergebnis:** Aktuelle `SOUL.md` mit Zeiträumen, jahresübergreifend.

**Davor / Danach:** Wird von `steuer-init` aufgerufen. Danach bei neuen Umständen `steuer-struktur-anlegen`.

### `steuer-struktur-anlegen` (eigener Skill)

**Wann:** Für ein Steuerjahr festlegen, welche Anlagen (N, S, KAP, Vorsorgeaufwand …) gebraucht werden, und die Ordner anlegen. Typisch beim Start eines neuen Steuerjahres.

**Beispiel:**
```
Leg die Struktur für das Steuerjahr 2026 an.
```

**Ergebnis:** `2026/NN_Anlage_X/` mit je einer `_UEBERSICHT.md`. Welche Lebenslage zu welcher Anlage führt, steht in seiner `REFERENCE.md`.

**Davor / Danach:** Davor `steuer-soul-pflegen`. Danach `steuer-index-aktualisieren` (läuft automatisch).

### `steuer-dokument-einsortieren` (eigener Skill)

**Wann:** Neue PDFs mit nichtssagenden Namen liegen herum (Scans von Behörden, Arbeitgeber, Versicherung).

**Beispiel:**
```
Sortier die Dokumente in raw/ ein.
```

**Ergebnis:** PDFs umbenannt nach `Datum_Absender_Betreff.pdf` und abgelegt in `<Jahr>/NN_Anlage_X/<Institution>/`. Dokumente, die mehrere Anlagen betreffen, landen einmal in `<Jahr>/00_Quellen/`. Danach laufen `steuer-uebersicht` und `steuer-index-aktualisieren`.

**Davor / Danach:** Davor `steuer-init`.

### `steuer-transaktionen-kategorisieren` (eigener Skill)

**Wann:** Ein PayPal-Export oder Kontoauszug soll steuerlich eingeordnet werden (Betriebsausgabe, privat, weitere Kategorien). Eindeutiges ordnet der Skill selbst zu, unklare Buchungen fragt er einzeln ab.

**Beispiel:**
```
Geh die Transaktionen in raw/paypal-2026.csv durch.
```

**Ergebnis:** `<Jahr>_Steuerrelevante-PayPal-Ausgaben.md` in `<Jahr>/00_Quellen/PayPal/`, danach aktualisierte Übersichten und Index.

**Davor / Danach:** Davor `steuer-init`. Ob etwas Betriebsausgabe sein kann, hängt an `SOUL.md` (z. B. Gewerbe).

### `steuer-uebersicht` (eigener Skill)

**Wann:** Ich will die Summen einer Anlage sehen, oder eine `_UEBERSICHT.md` ist veraltet. Läuft sonst automatisch nach dem Einsortieren.

**Beispiel:**
```
Was sind die Summen für Anlage N 2026?
```

**Ergebnis:** `_UEBERSICHT.md` mit jedem Betrag samt Datei und Seite als Beleg und Summen pro Kategorie. Unsicher lesbare Werte stehen als `OFFEN` drin statt geraten.

### `steuer-index-aktualisieren` (eigener Skill)

**Wann:** Fast nie direkt, die anderen Steuer-Skills rufen ihn am Ende auf. Direkt nur, wenn ich von Hand Dateien verschoben habe.

**Beispiel:**
```
Aktualisier die INDEX.md.
```

**Ergebnis:** `INDEX.md`, nur an den geänderten Stellen angepasst.

---

## Selten und Setup

| Skill | Wofür | Aufruf |
| --- | --- | --- |
| `setup-matt-pocock-skills` (mattpocock) | Einmal pro Repo vor dem ersten Engineering-Ablauf: Issue-Tracker, Triage-Labels und Doku-Ordner einrichten. `notes-to-tickets` bricht ohne das ab. | `/setup-matt-pocock-skills` |
| `ask-matt` (mattpocock) | Fragen, welcher Skill oder Ablauf gerade passt. Kennt allerdings nur die mattpocock-Skills. | `/ask-matt Ich hab einen Haufen Bug-Reports, wo fange ich an?` |
| `wizard` (mattpocock) | Bash-Assistent für Schritte, die nur ich machen kann (Zugangsdaten, CI-Secrets, Klicks in fremden Dashboards). Greift automatisch, wenn Claude an so eine Stelle kommt. | „Bau mir einen Wizard für das Einrichten der Stripe-Keys.“ |
| `writing-for-agents` (mattpocock) | Regeln zum Schreiben von Skills, `CLAUDE.md` und `AGENTS.md`. Greift automatisch beim Bearbeiten solcher Dateien. | „Schreib mir einen Skill für …“ |

---

## Mods

Mods ändern Claude Code selbst statt nur Anweisungen mitzugeben. Sie werden nicht von `update-skills.sh` installiert, sondern von:

```bash
./update-mods.sh
```

### `token-anzeige` (eigener Mod)

**Wann:** Ich will sehen, wie voll das Kontextfenster ist, wie viele Tokens verbraucht sind, was die Sitzung ungefähr kostet und wie weit das 5-Stunden- und das Wochenlimit ausgeschöpft sind.

**Beispiel:**
```
/verbrauch
/verbrauch aus
/verbrauch an
```

**Ergebnis:** Eine Zeile über dem Prompt, die sich nach jeder Anfrage aktualisiert. `/verbrauch` öffnet ein Panel mit Kontextverlauf, Limits samt Reset-Zeitpunkt, Tokens nach Art und Kosten des letzten Turns. Die Kosten sind eine Schätzung zu Listenpreisen, mit Abo fällt nichts extra an.

**Davor / Danach:** Hilft bei der Entscheidung, wann `/compact` oder `/clear` fällig ist, z. B. bevor eine Sitzung vor `to-tickets` zu voll wird.
