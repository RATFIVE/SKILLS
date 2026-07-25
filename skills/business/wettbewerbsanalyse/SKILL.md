---
name: wettbewerbsanalyse
description: Erstellt eine Wettbewerbsanalyse für eine Geschäftsidee und liefert sie als HTML-Report. Nutze diesen Skill, wenn der User eine Wettbewerbsanalyse, Konkurrenzanalyse, Marktanalyse oder Wettbewerbsumfeld-Analyse will, eine Geschäftsidee gegen den Markt prüfen lassen möchte, oder eines der Canvas-Frameworks Bullseye, Business Model Canvas, Business Model Fit, Petal Diagram, Product Market Fit, Value Proposition oder Kundenprofil ausgefüllt haben will.
---

# Wettbewerbsanalyse

Eine Wettbewerbsanalyse beantwortet nicht „wer macht dasselbe?", sondern **„womit löst der Kunde sein Problem heute?"** — inklusive der Optionen „nichts tun", „selbst recherchieren" und „ein generisches Werkzeug benutzen". Wer nur Anbieter mit identischem Produkt auflistet, übersieht die Alternativen, die tatsächlich die Zahlung verhindern.

Der Report ist ein Entscheidungsdokument, kein Marktüberblick. Jede Sektion muss einer Entscheidung dienen, die der User treffen muss.

## Ablauf

Arbeite die Schritte in dieser Reihenfolge ab. Lege pro Schritt ein Todo an.

### 1. Quellen erfassen

Lies die Projektbeschreibung (`notes.md`, `README`, Konzeptdokumente) **und** alle vorhandenen Canvas-Dateien — auch Bilder, per Read-Tool.

Prüfe bei jedem Canvas-Bild, ob es **ausgefüllt** oder eine **leere Methodenvorlage** ist. Leere Vorlagen liefern nur die Feldstruktur, die du füllen musst; ausgefüllte Canvas sind Behauptungen des Users, die du gegen die Recherche prüfst. Generische Platzhaltertexte in einem angeblich ausgefüllten Canvas („freelancers", „intuitive experience", „skilled teams") zählen als leer — und sind selbst ein Befund.

**Fertig, wenn:** jede Datei im Canvas-Ordner gelesen und als ausgefüllt / leer / generisch eingeordnet ist.

### 2. Fakten recherchieren, nicht erfragen

Recherchiere selbst, was recherchierbar ist. Frage den User nichts, was im Web oder Dateisystem steht.

Pflichtmaterial:
- **Wettbewerber je Petal-Feld**, mindestens fünf mit **konkretem Preis** — ohne Preise ist keine Positionierung möglich
- **Marktzahlen**: Anbieterzahl, Marktvolumen, Adoptionsrate
- **Regulatorische Grenzen** der Branche und einschlägige Gerichtsentscheidungen — der häufigste Show-Stopper, den Gründer übersehen
- **Substitute**: kostenlose Werkzeuge, Selbsthilfe, Verbände, Versicherungen, „nichts tun"
- **Datenquellen-Prüfung**: Wird ein geplanter technischer Kern durch offene Daten oder eine öffentliche API wertlos? Das entscheidet über den Burggraben.

Bevorzuge Primärquellen (Behörden, Gesetzestexte, Preisseiten der Anbieter). Vergleichsartikel von Wettbewerbern sind brauchbar, aber als parteiisch zu kennzeichnen.

**Fertig, wenn:** jedes Petal-Feld mit namentlichen Anbietern belegt ist und jeder direkte Wettbewerber einen Preis oder ein ausdrückliches „Preis nicht veröffentlicht" hat.

### 3. Offene Entscheidungen über `grilling` klären

Bleibt nach der Recherche etwas offen, das den Report inhaltlich verändern würde, dann nutze den Skill `grilling` für die Rückfragen — eine Frage pro Runde, jeweils mit deiner Empfehlung.

(Der User kennt das als `/grill-me`; jener Skill ist nur handinvokierbar und startet ebenfalls `grilling`.)

Fragen gehören hierhin, wenn verschiedene Antworten zu materiell verschiedenen Reports führen: Zielgruppen-Priorität, Preismodell, geografischer Markt, Risikobereitschaft bei regulatorischen Grauzonen. Fakten gehören nie hierhin.

Kann eine nicht-interaktive Session keine Antwort abwarten: arbeite die Fragen selbst mit Empfehlung durch, markiere sie im Report ausdrücklich als **offene Entscheidung** und sage dem User im Fazit, dass sie noch nicht getroffen ist.

**Fertig, wenn:** jede offene Entscheidung entweder beantwortet oder im Report als offen gekennzeichnet ist.

### 4. Die sechs Frameworks füllen

| Framework | Liefert | Muss enthalten |
|---|---|---|
| **Petal Diagram** | Wettbewerbsfelder | 5 Felder à 3–5 namentliche Anbieter; die Idee sitzt im Zentrum |
| **Value Proposition** | Angebotsseite | Produkte, Pain Relievers, Gain Creators |
| **Kundenprofil** | Kundenseite | Jobs, Pains, Gains — je Zielperson ein eigenes Profil |
| **Product Market Fit** | Abgleich beider Seiten | Kundensegment, Charakteristika, Probleme, Kanäle, UX gegen Produkt, Alternativen, Features, Kanalwert, Kennzahlen |
| **Business Model Canvas** | Geschäftsmodell | 9 Felder mit Namen und Zahlen, nicht mit Kategorien |
| **Bullseye** | Traction-Kanäle | Alle Kanäle bewertet, 3 zum sofortigen Test, Verworfene mit Begründung |

Regel für alle: **konkrete Namen, Preise und Zahlen statt Kategorien.** „Kanzleien" ist kein Kundensegment, „Arbeitnehmer nach Kündigung" ist eines.

**Fertig, wenn:** kein Feld einen Platzhalter oder eine Kategorie ohne Namen enthält.

### 5. HTML-Report bauen

Nutze den Skill `frontend-design-guide` für die visuelle Umsetzung. Diagramm-Geometrie und CSS-Rezepte stehen in [REFERENCE.md](REFERENCE.md) — lies die Datei, bevor du Petal Diagram oder Positionierungsmatrix baust.

Der Report besteht aus diesen Teilen, in dieser Reihenfolge:

1. **Titel** mit einer These als Überschrift — die Kernaussage, nicht „Wettbewerbsanalyse für X"
2. **Kernbefund** — was funktioniert, was nicht, welcher Ausweg. Vor allen Details, in eigener Fläche abgesetzt
3. **Marktbild** — 3–5 Kennzahlen
4. **Petal Diagram** — die fünf Wettbewerbsfelder als Grafik
5. **Anbietertabelle** — Name, Preis, Segment (direkt / indirekt / B2B), Modell. Sortiert nach Bedrohlichkeit
6. **Positionierungsmatrix** — zwei Achsen, die in dieser Branche über Zahlungsbereitschaft entscheiden; die eigene Idee sichtbar hervorgehoben
7. **Harte Fragen** — 8–12 Stück, je mit Schweregrad, „warum das wehtut" und einer Empfehlung
8. **Product Market Fit** — ausgefüllt, als Diskussionsgrundlage gekennzeichnet
9. **Bullseye** — Kanäle bewertet mit Testen / Später / Verwerfen
10. **Nächste Schritte** — nummeriert, das Billigste und Entscheidendste zuerst
11. **Hinweis** — geschäftliche Einschätzung, keine Rechts- oder Steuerberatung; Preisstand nennen
12. **Quellen** — nummeriert, als klickbare Links, parteiische Quellen gekennzeichnet

Schweregrade der harten Fragen: **Show-Stopper** (entscheidet, ob überhaupt gebaut wird), **Hoch** (entscheidet, was gebaut wird), **Mittel** (entscheidet, wie gebaut wird). Show-Stopper stehen oben.

Dateiname `wettbewerbsanalyse.html`, abgelegt neben den Canvas-Quellen.

**Fertig, wenn:** alle zwölf Teile vorhanden sind und jede harte Frage einen Schweregrad und eine Empfehlung hat.

### 6. Im Browser verifizieren

Playwright blockiert `file:`. Starte einen lokalen Server im Report-Ordner (`python3 -m http.server <port> --bind 127.0.0.1`), öffne die Datei und prüfe:

- Konsole fehlerfrei (fehlendes Favicon ignorieren)
- Diagramme per Element-Screenshot einzeln geprüft: keine Textüberdeckung, Achsenpfeile in der richtigen Richtung
- Mobil bei 390 px: `document.body.scrollWidth === window.innerWidth`

Nach Änderungen mit Cache-Buster neu laden (`?v=2`), sonst siehst du die alte Fassung. Danach Server beenden und temporäre Screenshots aus dem Repo löschen.

**Fertig, wenn:** Desktop und Mobil geprüft sind und das Repo außer dem Report keine neuen Dateien enthält.

## Häufige Fehler

| Fehler | Warum er den Report entwertet |
|---|---|
| Nur direkte Wettbewerber betrachten | Die Zahlung verhindern meist Substitute und „nichts tun" |
| Wettbewerber ohne Preise auflisten | Ohne Preise gibt es keine Positionierung und keine Aussage |
| Regulatorik erst am Ende prüfen | Ein Show-Stopper macht alle anderen Sektionen wertlos |
| Den geplanten Tech-Stack als Burggraben nehmen | Offene Daten und APIs entwerten technische Vorarbeit dauernd |
| Ein Canvas mit Kategorien füllen | „KMU" trifft keine Entscheidung; ein benanntes Segment schon |
| Befunde weichspülen | Der Report ist wertlos, wenn er den Show-Stopper nicht Show-Stopper nennt |
| Alle Kanäle empfehlen | Bullseye verlangt drei zum Test und begründetes Verwerfen |

## Umgang mit unbequemen Befunden

Benenne Show-Stopper deutlich und belege sie mit Quelle. Liefere zu jedem einen gangbaren Ausweg — der Report soll die Idee schärfen, nicht beerdigen. Wenn der User einen Befund nach der Diskussion verwirft, ist das seine Entscheidung: vermerke sie und arbeite weiter.
