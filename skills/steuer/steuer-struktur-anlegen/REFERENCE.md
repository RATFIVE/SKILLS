# Referenz: Lebensumstand → Anlage → Ordner

Mapping-Tabelle für `steuer-struktur-anlegen`. Sie beantwortet genau eine Frage:
**Welcher Fakt in `SOUL.md` erzwingt welche Anlage — und wie heißt deren Ordner?**

> **Keine steuerliche Beratung.** Diese Tabelle deckt die typischen Fälle einer
> privaten Einkommensteuererklärung ab, nicht die Sonderfälle (Auslandseinkünfte,
> Land- und Forstwirtschaft, Erbschaft, Photovoltaik-Sonderregelungen …). Bei
> Abweichungen: Steuerberater oder Lohnsteuerhilfeverein.
>
> Stand: Veranlagungszeiträume ab 2023. Amtliche Formulare:
> <https://www.steuern.de/steuerformulare> — nur bei konkretem Zweifel ziehen,
> nicht bei jedem Lauf.

## Namensregeln für die Ordner

- **Nummern sind fix**, nicht fortlaufend. Lücken (`10_`, `30_`, `99_`) sind
  gewollt: Anlage N heißt in jedem Jahr `10_Anlage_N`, auch wenn ein Jahr später
  ein Gewerbe dazukommt.
- **Zehnerblöcke gruppieren thematisch** — Einkünfte aus Arbeit (10er),
  Selbständigkeit (20er), Kapital (30er), Vorsorge/Sonderausgaben (40er) usw.
  Ein Sonderfall, der hier fehlt, bekommt eine freie Nummer im passenden Block.
- **Anlagen-Ordner sind ASCII**, ohne Umlaute und ß (`22_Anlage_EUER`,
  `71_Anlage_Aussergewoehnliche-Belastungen`). Grund: Der Skill muss sie über
  Jahre und über Cloud-Sync/Zip hinweg zuverlässig wiederfinden. **Dateinamen
  von Dokumenten behalten ihre Umlaute** — dort gilt weiter das Schema aus
  `steuer-dokument-einsortieren`.

## Mapping-Tabelle

| Fakt in `SOUL.md` | Anlage | Ordner | Typische Belege |
|---|---|---|---|
| *(immer)* | Hauptvordruck (ESt 1 A) | `01_Hauptvordruck/` | Steuerbescheid Vorjahr, Adress-/Kontonachweis |
| Angestellt, Lohn/Gehalt, Minijob, Werkstudent | Anlage N | `10_Anlage_N/` | Lohnsteuerbescheinigung, Entgeltabrechnungen, Fahrtkosten, Arbeitsmittel, Bewerbungskosten, Fortbildung |
| Freiberuflich tätig (Autor, Entwickler, Designer …) | Anlage S | `20_Anlage_S/` | Ausgangsrechnungen, Honorarabrechnungen |
| Gewerbe angemeldet | Anlage G | `21_Anlage_G/` | Gewerbeanmeldung, Gewinnermittlung |
| Gewinneinkünfte (Anlage S **oder** G) | Anlage EÜR | `22_Anlage_EUER/` | Einnahmen, Betriebsausgaben, Anlagenverzeichnis, AfA |
| Umsatzsteuerpflichtig (**nicht** Kleinunternehmer §19 UStG) | Umsatzsteuererklärung | `23_Umsatzsteuererklaerung/` | USt-Voranmeldungen, Rechnungen mit ausgewiesener USt |
| Gewerbeertrag über Freibetrag (24.500 €) | Gewerbesteuererklärung | `24_Gewerbesteuererklaerung/` | Gewerbesteuerbescheid, -vorauszahlungen |
| Depot, Zinsen, Dividenden, Krypto-Verkäufe | Anlage KAP | `30_Anlage_KAP/` | Jahressteuerbescheinigung, Verlustbescheinigung, NV-Bescheinigung |
| Kranken-/Pflege-/Renten-/Arbeitslosenversicherung | Anlage Vorsorgeaufwand | `40_Anlage_Vorsorgeaufwand/` | Beitragsbescheinigung Krankenkasse, Rentenversicherung, private Vorsorge |
| Spenden, Kirchensteuer, **Erst**ausbildung/-studium, Unterhalt an Ex-Partner | Anlage Sonderausgaben | `41_Anlage_Sonderausgaben/` | Spendenquittungen, Studiengebühren, Semesterbeiträge |
| Riester-/Rürup-Vertrag | Anlage AV | `42_Anlage_AV/` | Bescheinigung des Anbieters |
| Kind(er) im Haushalt | Anlage Kind | `50_Anlage_Kind/` | Kindergeldbescheid, Kita-/Betreuungskosten, Schulgeld |
| Vermietete Immobilie | Anlage V | `60_Anlage_V/` | Mietverträge, Nebenkostenabrechnungen, Handwerkerrechnungen, Darlehenszinsen |
| Rente / Pension | Anlage R | `61_Anlage_R/` | Rentenbezugsmitteilung |
| Private Veräußerungsgeschäfte, gelegentliche Einkünfte | Anlage SO | `62_Anlage_SO/` | Kauf-/Verkaufsbelege, Haltefristnachweise |
| Handwerker-/Reinigungs-/Gartenrechnungen, Nebenkosten | Anlage Haushaltsnahe Aufwendungen | `70_Anlage_Haushaltsnahe-Aufwendungen/` | Rechnungen **plus Überweisungsbeleg** (Barzahlung wird nicht anerkannt) |
| Krankheitskosten, Pflege, Behinderung, Bestattung | Anlage Außergewöhnliche Belastungen | `71_Anlage_Aussergewoehnliche-Belastungen/` | Arzt-/Klinikrechnungen, Rezepte, Schwerbehindertenausweis, Pflegegrad-Bescheid |
| *(Sonderfall, siehe unten)* | — | `00_Quellen/` | Kontoauszüge, PayPal-Export, Lohnsteuerbescheinigung |
| *(steuerlich irrelevant)* | — | `99_Privat/` | Alles, was kein Beleg ist |

## Die zwei Fallen, die ein Modell hier zuverlässig übersieht

**1. Erst- vs. Zweitausbildung.** Der teuerste Unterschied in der ganzen Tabelle:

- **Erstausbildung/-studium** → nur **Sonderausgaben** (`41_`), gedeckelt auf
  6.000 €/Jahr, **nicht vortragsfähig**. Ohne Einkommen im selben Jahr verpufft
  der Abzug ersatzlos.
- **Zweitausbildung** (Master nach Bachelor, Ausbildung nach abgeschlossener
  Erstausbildung, Studium nach Lehre) → **Werbungskosten** in `10_Anlage_N/`,
  unbegrenzt und als **Verlustvortrag** in spätere Jahre mitnehmbar.

Steht der Ausbildungsstatus nicht eindeutig in `SOUL.md`: grillen, nicht raten.

**2. Kleinunternehmerregelung (§19 UStG).** Nur wenn der User **nicht**
Kleinunternehmer ist, wird `23_Umsatzsteuererklaerung/` angelegt. Der Fakt steht
in `SOUL.md`; fehlt er, ist das eine Grill-Frage — kein Standardwert.

## Dokumente mit Mehrfachbezug → `00_Quellen/`

Ein Dokument, das Zahlen für **mehr als eine Anlage** liefert, wird nicht
dupliziert, sondern liegt genau einmal in `00_Quellen/<Institution>/`. Die
`_UEBERSICHT.md` der betroffenen Anlagen verweist per relativem Pfad darauf und
zieht die jeweils relevante Zahl in ihre eigene Summe.

Die wiederkehrenden Fälle:

| Dokument | Liefert an |
|---|---|
| Lohnsteuerbescheinigung | Anlage N (Bruttolohn, Lohnsteuer) **+** Vorsorgeaufwand (SV-Beiträge) **+** ggf. Sonderausgaben (Kirchensteuer) |
| Kontoauszug / PayPal-Jahresübersicht | EÜR (Betriebsausgaben) **+** Sonderausgaben (Spenden) **+** Haushaltsnahe Aufwendungen |
| Nebenkostenabrechnung | Haushaltsnahe Aufwendungen (selbstgenutzt) **+** Anlage V (vermietet) |
| Jahressteuerbescheinigung der Bank | Anlage KAP (Erträge) **+** Sonderausgaben (Kirchensteuer auf Kapitalerträge) |
