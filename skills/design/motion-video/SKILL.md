---
name: motion-video
description: Kurze Videos mit intensiven JavaScript-Motion-Graphics und eingebauten KI-Bildern, mit Sprecherstimme und Sounddesign. Nutzen für Erklärvideos, Werbespots, Produktvideos, Teaser und ähnliche animierte Clips.
---

# Motion-Video

## Ziel
Am Ende steht ein fertiges MP4, das genau das erreicht, was der Nutzer damit vorhat: etwas verständlich erklären, ein Produkt verkaufen oder Aufmerksamkeit für etwas wecken. Die Animation zeigt in jedem Moment das, was die Stimme gerade sagt.

## Was ein gutes Ergebnis ausmacht
- Es ist auf jeder Ebene Motion Graphics. Typografie, Interface-Elemente, Diagramme und Übergänge sind animiert, und auch der Hintergrund bewegt sich durchgehend. Ein Video, das nur aus Bildern mit Text darauf besteht, reicht nicht.
- KI-Bilder sind Bausteine in der Grafik: transparente Objekte und Figuren in einheitlichem Stil, die animiert und kombiniert werden. Sie sind keine Diashow aus Vollbildern.
- Jede Szene hat ihre eigene visuelle Idee. Dieselbe Abbildung taucht nicht immer wieder auf.
- Animationen sitzen exakt auf dem gesprochenen Wort. Das geht nur mit Wort-Zeitstempeln aus der fertigen Aufnahme.
- Der Text ist zum Sprechen geschrieben: vollständige, natürliche Sätze, kein Stakkato.
- Ein Erklärvideo beginnt mit der Frage, worum es überhaupt geht.
- Ein Werbespot holt die Leute in den ersten Sekunden ab, zeigt den Nutzen statt einer Feature-Liste und endet mit einer klaren Handlungsaufforderung.
- Sounddesign liegt auf den Akzenten. Die Lautheit ist plattformtauglich, also etwa -14 bis -16 LUFS.

## Zuerst: der Weg
Der Weg legt fest, womit gerendert wird und woher Bilder, Wort-Zeitstempel und Sounds kommen. Es gibt vier:
1. Higgsfield Katana: rendert in der Cloud-Sandbox von Higgsfield. Bilder, Whisper und Soundbibliothek kommen von dort. Braucht einen Higgsfield-Plan mit MCP-Zugang.
2. HyperFrames lokal, Bilder über kie.ai
3. HyperFrames lokal, Bilder über fal.ai
4. HyperFrames lokal, Bilder über die Higgsfield API

Schau als Erstes in die Datei `praeferenzen.md` im selben Ordner wie dieser Skill.
- Steht dort ein Weg, nimmst du ihn ohne Rückfrage und sagst in einem Satz, welchen du nimmst. Du wechselst nur, wenn der Nutzer es von sich aus will oder der Weg gerade nicht funktioniert, etwa weil der Connector fehlt oder der API-Schlüssel nicht gesetzt ist. Dann klärst du das mit ihm.
- Gibt es die Datei nicht oder steht dort kein Weg, ist der Weg die erste Frage an den Nutzer, noch vor allem anderen. Sag dazu, was gerade verbunden ist. Ist Higgsfield nicht verbunden, fällt Katana weg.

Am Ende eines Durchlaufs schreibst du den Weg, der tatsächlich benutzt wurde, in `praeferenzen.md`. Dort steht nur der Weg und beim lokalen Weg der Name der Umgebungsvariable für den API-Schlüssel, nie der Schlüssel selbst. Format, Länge, Stimme und alles andere speicherst du erstmal nicht. Das wird bei jedem Video neu gefragt. Außer, der Nutzer möchte, dass du dir bestimmte Präferenzen merkst.

## Was der Nutzer entscheidet
Danach klärst du, was du nicht ableiten kannst:
- Zweck und Zielgruppe
- Länge, Format und Sprache
- ob es Markenvorgaben gibt (Farben, Schriften, Logo)
- ob es eigene Bilder gibt, zum Beispiel Produktfotos oder ein Logo: Bei einem Werbespot wird das echte Produkt gezeigt, kein erfundenes
- die Stimme: Schlag drei bis vier passende Stimmen vor, jede mit direktem Link zur kostenlosen Hörprobe (die `preview_url` aus der ElevenLabs-Stimmenliste), und lass den Nutzer wählen. Kostenpflichtige Proben mit dem echten Skript erzeugst du nur, wenn der Nutzer das möchte, zum Beispiel um zwei Favoriten direkt zu vergleichen.

Das Skript wird abgenommen, bevor irgendetwas Kostenpflichtiges läuft. Den Rest entscheidest du selbst, also Look, Szenen, Bildmotive, Animationen, Tempo und Sound. Dabei richtest du dich nach Zweck und Zielgruppe.

## Bilder
Die Bilder kommen bei jedem Weg von GPT Image 2.5 in der Variante Flare mit `background: transparent`. Das gilt für neue Motive genauso wie für Bilder, die der Nutzer mitgibt: Das Original geht als Referenz hinein, heraus kommt dasselbe Motiv freigestellt. Wiederkehrende Figuren bleiben über ein Referenzbild konsistent.

## Stimme
Die Stimme läuft über ElevenLabs mit der v4 Engine (eleven_v4). Eine durchgehende Aufnahme für das ganze Skript klingt natürlicher als einzelne Sätze. Schick nur reinen Text ohne Regieanweisungen in eckigen Klammern, sonst werden sie unter Umständen laut mitgesprochen.

## Weg 1: Higgsfield Katana
Katana rendert in einer Cloud-Sandbox. Whisper für die Wort-Zeitstempel und eine lizenzfreie Soundbibliothek sind schon dabei, und außer den Bildern kostet nichts Credits.

Stolperfallen:
- Base64 über sandbox_exec wird abgelehnt, und ein Befehl darf höchstens 16.000 Zeichen lang sein. Dateien kommen so in die Sandbox: media_upload, lokal per curl PUT hochladen, media_confirm, dann in der Sandbox per URL abholen.
- Der Compositor gibt den Ton zu leise aus (rund -23 LUFS). Nach dem Render deshalb die Lautheit messen und normalisieren.
- Die Sandbox hängt gelegentlich (Rate-Limit oder "server not responding"). Kurz warten und dann erneut versuchen.

## Wege 2 bis 4: HyperFrames lokal
HyperFrames ist ein Open-Source-Framework von HeyGen, das HTML-Seiten mit JavaScript-Animation zu Video rendert. Es braucht Node und ffmpeg auf dem Rechner.

Den API-Schlüssel für den Bildanbieter legt der Nutzer selbst als Umgebungsvariable an. Bitte ihn nie, den Schlüssel in den Chat zu kopieren, und gib ihn nie aus.

## Kosten
Vor dem Start nennst du eine Schätzung, am Ende die tatsächlichen Kosten. Hol dir die Bildpreise vorher über den Kostencheck oder die Preisliste des Anbieters. Bezahlt werden die Bilder und die Stimme. Motion Graphics, Rendering und Sound kosten nichts.
