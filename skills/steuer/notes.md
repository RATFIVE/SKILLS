# Steuer Aufbau


# Ordnerstruktur
root/raw: Hier werden die Rohdateien abgelegt (pdf, png, jpg, etc.)
root/00_Quellen_Kontoauszüge: Hier werden die Kontoauszüge oder PayPal Abrechnungen abgelegt
root/01_Anlage_...
root/02_Anlage_...
...
99_Privat: Hier werden private Unterlagen abgelegt, die nicht für die Steuererklärung relevant sind.


# **Skill** steuer-init
Zu Beginn wird mit einer grilling session mit wie `/grill-with-docs` für die Steuererklärung gestartet. Dieser skill heißt `/steuer-init`. In diesem skill soll alle Steuererklärungsrelevante Fragen an den User gestellt. 

Die Fragen sollen eien detailierte Abfrage der persönlichen Situation des Users um die Steuererklärung optimal vorbereiten zu können. Daraus wird dann eine `SOUL.md` Datei erstellt, die ein Profil des Users enthält. Diese Datei wird dann in der root abgelegt.

Es wird eine `index.md` Datei in root erstellt mit dem **Skill**  `steuer-index-aktualisieren`. Die `index.md` ist die Single Source of Truth für die Struktur eines Dokumentenarchivs (Ordner pro Institution, Dateibeschreibungen). Jede Struktur-Änderung — neue Datei einsortiert, Datei umbenannt, Ordner verschoben — muss sich **im selben Arbeitsschritt** in `index.md` niederschlagen, sonst driftet die Übersicht auseinander und wird nutzlos.

# **Skill**  steuer-soul
Anhand von der `SOUL.md` Datei soll ermittelt werden welche Anlagen, Formulare und Unterlagen für die Steuererklärung benötigt werden. Falls unklarheiten sind soll wieder eine grilling session. durchgeführt werden mit  `/grill-with-docs` [Link zu den Formularen](https://www.steuern.de/steuerformulare) 
Anhand der SOUL.md soll dann die Ordnerstruktur erstellt werden.

# **Skill** steuer-dokument-einsortieren
Mit diesem Skill werden die Dokumente in root/raw gelesen und nach Datum-Quelle-Inhalt umbenannt falls dies noch nicht geschehen ist. Danach werden die Dokumente in die entsprechenden Ordner verschoben.

# **Skill** steuer-transaktionen-kategorisieren
Transaktionsexporte (PayPal-Jahresübersicht, Kontoauszug, Kreditkartenabrechnung, …) enthalten eine Mischung aus eindeutig privaten, eindeutig geschäftlichen und unklaren Buchungen. Dieser Skill sortiert die eindeutigen Fälle automatisch vor und klärt nur die unklaren Positionen einzeln mit dem User — statt entweder alles zu erraten oder den User mit der kompletten Rohliste zu konfrontieren.


# **Skill** steuer-index-aktualisieren
Es wird eine `index.md` Datei in root erstellt. `index.md` ist die Single Source of Truth für die Struktur eines Dokumentenarchivs (Ordner pro Institution, Dateibeschreibungen). Jede Struktur-Änderung — neue Datei einsortiert, Datei umbenannt, Ordner verschoben — muss sich **im selben Arbeitsschritt** in `index.md` niederschlagen, sonst driftet die Übersicht auseinander und wird nutzlos.

# **Skill** _uebersicht.md
In jedem Ordner wird eine `_uebersicht.md` Datei erstellt, die den Inhalt des Ordners beschreibt. Diese Datei wird automatisch aktualisiert, wenn Dateien hinzugefügt oder entfernt werden.
In dieser Datei werden z.B. Summen von Ausgaben, Einnamen etc. pro steuerrelevante Kategorie berechnet und aufgelistet. Sie wiederspiegelt den Inhalt von allen Dateien in diesem Ordner in Mardown Form.

