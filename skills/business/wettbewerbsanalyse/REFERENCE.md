# Diagramme für den Wettbewerbsreport

Zwei Diagramme tragen den Report: Petal Diagram und Positionierungsmatrix. Beide sind in reinem CSS baubar. Die Geometrie unten ist durchgerechnet — wer sie freihändig schätzt, produziert Textüberdeckungen.

## Petal Diagram

Fünf Kreise um ein Zentrum, Steve-Blank-Anordnung. Bühne 620 × 620 px, Kreise 300 px Durchmesser, Versatz 155 px vom Mittelpunkt.

Positionen bei Winkeln −90°, −18°, 54°, 126°, 198° (`left`/`top` in Bühnenkoordinaten):

| Petal | left | top | Labelposition |
|---|---|---|---|
| 1 oben | 160 | 5 | `top:34px; left:67px` zentriert |
| 2 rechts oben | 307 | 112 | `top:70px; right:34px` rechtsbündig |
| 3 rechts unten | 251 | 285 | `bottom:56px; right:40px` rechtsbündig |
| 4 links unten | 69 | 285 | `bottom:56px; left:40px` |
| 5 links oben | 13 | 112 | `top:70px; left:34px` |

### Die drei Fallen

**1. Labels müssen in die Kreisfläche passen.** Ein Kreis mit Radius 150 und Mittelpunkt (150,150) erlaubt an der Höhe *y* nur die Breite `dx = √(150² − (y−150)²)`. Bei `y = 244` sind das ±117 px, also `x` von 33 bis 267 — ein Label bei `left:16` liegt dort **außerhalb** und wird vom eigenen Kreisrand durchschnitten. Rechne die unterste Textzeile jedes Labels gegen diese Formel.

**2. Labels dürfen den Zentrumskreis nicht berühren.** Das Zentrum (196 px, mittig) belegt Bühnenkoordinaten 212–408 in beiden Achsen. Rechne die Labelfläche in Bühnenkoordinaten um und halte Abstand.

**3. Übereinanderliegende Füllflächen überdecken Text.** Die später im DOM stehenden Petals malen ihre Füllung über den Text der früheren. Lösung: Kreise **nur als Umriss** (`background:transparent`), Atmosphäre über einen radialen Gradienten auf der Bühne. Zusätzlich `z-index:4` plus Papier-Halo per `text-shadow` auf dem Label, damit dünne Nachbarbögen die Glyphen nicht zerschneiden.

```css
.petal-stage{
  position:relative;width:620px;height:620px;margin:0 auto;
  background:radial-gradient(circle at 50% 50%, var(--accent-tint), transparent 62%);
}
.petal{position:absolute;width:300px;height:300px;border-radius:50%;
  border:1.5px solid var(--ink);background:transparent;}
.petal-body{position:absolute;width:166px;z-index:4;
  text-shadow:0 0 4px var(--paper),0 0 8px var(--paper);}
.petal-core{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
  width:196px;height:196px;border-radius:50%;z-index:3;
  display:flex;flex-direction:column;align-items:center;justify-content:center;}
```

### Mobiler Fallback

Unter 700 px wird aus der Bühne eine Kartenliste — Kreise sind auf Telefonbreite unlesbar:

```css
@media (max-width:700px){
  .petal-stage{width:auto;height:auto;display:flex;flex-direction:column;
    gap:1px;background:var(--rule);border:1px solid var(--rule);}
  .petal{position:static;width:auto;height:auto;border:none;border-radius:0;
    background:var(--paper);padding:20px;}
  .petal-body{position:static !important;width:auto !important;text-align:left !important;}
  .petal-core{position:static;transform:none;width:auto;height:auto;
    border-radius:0;order:-1;align-items:flex-start;}
}
```

## Positionierungsmatrix

Zwei Achsen, die in der jeweiligen Branche über Zahlungsbereitschaft entscheiden. Preis allein ist selten die zweite Achse — die stärkere Wahl ist meist eine Vertrauens- oder Verbindlichkeitsdimension (haftet jemand? trägt es vor Gericht? ist das Ergebnis garantiert?).

Aufbau: Container mit `aspect-ratio:1.75/1`, Achsenkreuz per zwei `linear-gradient`, Punkte absolut in Prozent, eigene Idee farblich und in der Schriftstärke hervorgehoben.

```css
.map{position:relative;border:1px solid var(--ink);aspect-ratio:1.75/1;min-height:440px;
  background:
    linear-gradient(to right, transparent calc(50% - .5px), var(--rule) 50%, transparent calc(50% + .5px)),
    linear-gradient(to bottom, transparent calc(50% - .5px), var(--rule) 50%, transparent calc(50% + .5px));}
.dot{position:absolute;transform:translate(-50%,-50%);display:flex;align-items:center;gap:7px;}
.dot::before{content:"";width:9px;height:9px;border-radius:50%;background:var(--ink-soft);flex:none;}
```

### Die vier Fallen

**1. Achsenpfeile zeigen leicht falsch.** Links unten gehört `← günstig`, rechts unten `teuer →`. Ein Pfeil, der vom Rand ins Feld zeigt, liest sich umgekehrt und dreht die Aussage des Diagramms.

**2. Achsenbeschriftung kollidiert mit markierten Zonen.** Setze die beiden y-Beschriftungen nicht beide links: `y1` links oben, `y2` rechts unten, x-Beschriftungen unten links und rechts. Zonen enden mindestens 8 % vor dem Rand.

**3. Der überfüllte Quadrant braucht ein Label.** Markiere ihn gestrichelt und benenne die Aussage — „überfüllte Zone · kaum Zahlungsbereitschaft". Ohne Beschriftung bleibt die Kernaussage der Matrix unausgesprochen.

**4. Leere Quadranten sind ein Befund, kein Fehler.** Ein leeres Feld ist entweder die Marktlücke oder der Beweis, dass dort niemand Geld verdient. Sage im Fließtext unter der Matrix, welches von beidem zutrifft.

## Verifikation

Prüfe jedes Diagramm mit einem **Element-Screenshot** (`.petal-stage`, `.map`), nicht nur im Ganzseiten-Screenshot — dort sind Textüberdeckungen bei starker Verkleinerung unsichtbar. Ganzseiten-Screenshots sehr langer Seiten zeigen gelegentlich Inhalte doppelt; das ist ein Stitching-Artefakt des Browsers. Verifiziere per `document.querySelectorAll(...).length`, statt der Optik zu glauben.
