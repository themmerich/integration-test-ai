# Testplan Kreditübersicht

Stand: 2026-10-06 · Gegenstand: Startseite des Frontends (Kreditübersicht in der App-Shell) · Basis:
`main` nach PR #7

## Inhalt

- [1 Zweck und Umfang](#1-zweck-und-umfang)
- [2 Teststrategie nach der Testing Trophy](#2-teststrategie-nach-der-testing-trophy)
- [3 Testumgebung und Konventionen](#3-testumgebung-und-konventionen)
- [4 Testdaten und erwartete Werte](#4-testdaten-und-erwartete-werte)
- [5 Ausgangslage und Zielbild](#5-ausgangslage-und-zielbild)
- [6 Statische Prüfungen](#6-statische-prüfungen)
- [7 Unit-Tests](#7-unit-tests)
- [8 Integrationstests](#8-integrationstests)
- [9 E2E-Tests](#9-e2e-tests)
- [10 Abdeckungsmatrix](#10-abdeckungsmatrix)
- [11 Umsetzungsreihenfolge](#11-umsetzungsreihenfolge)
- [12 Abnahmekriterien](#12-abnahmekriterien)
- [13 Risiken und offene Entscheidungen](#13-risiken-und-offene-entscheidungen)

## 1 Zweck und Umfang

Der Plan legt fest, welche Funktionen der Startseite getestet werden, auf welcher Ebene, mit welchen
Daten und mit welchem erwarteten Ergebnis. Er ist die Grundlage, um die bestehenden Tests umzubauen
und Lücken zu schließen.

Im Umfang:

- App-Shell: Seitenleiste mit Menügruppe, Topbar, mobiles Menü, Routing auf `/`
- Suchformular: Kreditnehmer, Kreditart, Status, Auszahlungszeitraum, Betrag von/bis, Suchen,
  Zurücksetzen
- Toolbar: Spaltenauswahl, globale Suche, CSV-Export
- Tabelle: zehn Spalten, Formatierung, Sortierung, Spaltenbreite, Paginator, Leermeldung
- Übersetzungen Englisch und Deutsch
- Barrierefreiheit und Tastaturbedienung der Seite

Nicht im Umfang:

- Backend: Die Seite nutzt statische Beispieldaten und ruft keine API auf. Das Backend hat nur den
  Test `BackendApplicationTests`, der den Spring-Kontext startet. Er bleibt unverändert.
- Lasttests und Performance-Messungen
- Visuelle Regressionstests (Screenshot-Vergleiche)
- Browser außer Chromium

## 2 Teststrategie nach der Testing Trophy

Die [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) von
Kent C. Dodds ordnet Tests in vier Ebenen. Unten liegen statische Prüfungen, darüber Unit-Tests, dann
Integrationstests als breiteste Schicht und oben wenige E2E-Tests. Je höher die Ebene, desto mehr
Vertrauen gibt ein Test, desto langsamer und teurer ist er aber auch. Die meisten Tests gehören
deshalb in die Integrationsebene: Sie prüfen Verhalten so, wie Nutzer es erleben, laufen aber ohne
Browser in Millisekunden.

| Ebene       | Werkzeug im Projekt                                                        | Typische Laufzeit | Prüft                                                                          |
| ----------- | -------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------ |
| Statisch    | TypeScript mit strikten Template-Checks, ESLint, Sheriff, Prettier         | Sekunden          | Typfehler, Stilregeln, Modulgrenzen                                            |
| Unit        | Vitest ohne TestBed                                                        | < 10 ms je Test   | reine Funktionen und Daten                                                     |
| Integration | Vitest mit TestBed, echte Kindkomponenten und PrimeNG, Transloco-Testmodul | 50–500 ms je Test | Komponenten im Zusammenspiel, bedient über das DOM                             |
| E2E         | Playwright (Chromium) gegen den Production-Build                           | 1–3 s je Test     | durchgehende Abläufe, alles was echtes Layout, Overlays oder Downloads braucht |

Entscheidungsregel für neue Tests:

1. Lässt sich der Fall als Funktion ohne Angular prüfen, wird er ein Unit-Test.
2. Braucht er gerenderte Komponenten, aber kein echtes Layout, keine echten Overlays, keinen Download
   und keinen Viewport, wird er ein Integrationstest.
3. Nur was dann noch übrig bleibt, wird ein E2E-Test. Dazu kommt ein durchgehender Hauptablauf als
   Rauchtest.

## 3 Testumgebung und Konventionen

### Befehle

Alle Befehle laufen in `frontend/`, außer `verify.mjs`.

```bash
pnpm test                 # Unit- und Integrationstests (Vitest), einmaliger Lauf
pnpm test:watch           # dasselbe im Watch-Modus, läuft bei Dateiänderungen erneut
pnpm test:coverage        # einmaliger Lauf mit Coverage, HTML-Bericht in coverage/frontend/index.html
pnpm e2e                  # E2E gegen Dev-Server (startet ihn oder nutzt einen laufenden auf :4200)
pnpm build                # Production-Build, Voraussetzung für den CI-Modus
CI=1 pnpm e2e             # E2E wie in der CI: gegen dist/, Port 4200 muss frei sein
```

```bash
node scripts/verify.mjs   # aus dem Repo-Root: Lint, Format, Unit, Build, Backend
```

### CI

Der Workflow `.github/workflows/ci.yml` läuft bei jedem Pull Request. Job „Frontend“: Lint, Format,
Vitest mit Coverage, Build, Playwright gegen den Production-Build. Die Coverage-Werte stehen in der
Zusammenfassung des CI-Laufs, der HTML-Bericht hängt als Artefakt `coverage-report` daran. Fällt die
Coverage für Zeilen oder Zweige unter 80 % (`frontend/vitest-base.config.ts`), schlägt der Job fehl. Job „Backend“: Gradle-Build mit Testcontainers.
Beide Jobs sind Pflicht-Checks für `main`. Playwright wiederholt fehlgeschlagene Tests in der CI bis zu
zweimal und zeichnet beim ersten Wiederholen einen Trace auf.

### Konventionen

- Spezifikationen liegen neben der getesteten Datei und heißen `*.spec.ts`. E2E-Tests liegen in
  `frontend/e2e/`.
- Ein `it`/`test` prüft ein Verhalten. Namen beschreiben das Verhalten aus Nutzersicht.
- Elemente werden über Rolle, Label oder Text gefunden (`getByRole`, `getByLabel`), nicht über
  CSS-Klassen. Ausnahme: Zeilen der Tabelle (`tbody tr`), weil PrimeNG ihnen keine eigene Rolle gibt.
- Bei Buttons mit Icon steht das Icon-Zeichen im Namen. `exact: true` passt dann nicht; stattdessen
  einen Namen wählen, der nicht in anderen Buttons vorkommt.
- Kein `waitForTimeout` in E2E-Tests. Gewartet wird über `expect(...)` mit automatischem Wiederholen.
- Integrationstests nutzen Fake-Timer (`vi.useFakeTimers()`), um die 300 ms `filterDelay` der globalen
  Suche zu überspringen.
- Integrationstests nutzen `TranslocoTestingModule` mit den echten Übersetzungsdateien
  (`public/i18n/en.json` und `de.json` importieren), damit fehlende Schlüssel auffallen.
- Gemockt wird nur, was außerhalb der Seite liegt. Heute ist das nur `URL.createObjectURL` für den
  CSV-Export in jsdom.

## 4 Testdaten und erwartete Werte

Alle Tests arbeiten mit den zwölf Beispielkrediten aus
`frontend/src/app/loans/data-access/sample-loans.ts`. Die erwarteten Werte unten sind aus diesen Daten
berechnet. Ändern sich die Daten, müssen die Werte hier und in den Tests angepasst werden.

| ID  | Kreditnehmer         | Art      | Betrag  | Restschuld | Zins   | Laufzeit | Ausgezahlt | Status    |
| --- | -------------------- | -------- | ------- | ---------- | ------ | -------- | ---------- | --------- |
| 1   | Anna Schmidt         | mortgage | 320.000 | 287.450    | 3,65 % | 300      | 2024-02-15 | active    |
| 2   | Markus Weber         | car      | 28.500  | 14.210     | 5,49 % | 60       | 2024-03-01 | active    |
| 3   | Bäckerei Müller GmbH | business | 150.000 | 98.300     | 4,75 % | 120      | 2024-04-10 | overdue   |
| 4   | Laura Fischer        | consumer | 12.000  | 0          | 6,89 % | 36       | 2021-05-20 | repaid    |
| 5   | Jonas Becker         | mortgage | 450.000 | 450.000    | 3,42 % | 360      | 2025-01-02 | requested |
| 6   | Sophie Wagner        | consumer | 8.500   | 5.920      | 7,29 % | 48       | 2024-06-18 | active    |
| 7   | Hofmann IT Services  | business | 75.000  | 61.850     | 5,12 % | 84       | 2024-08-05 | active    |
| 8   | Lukas Schulz         | car      | 41.900  | 39.400     | 4,99 % | 72       | 2024-09-12 | overdue   |
| 9   | Elena Koch           | mortgage | 275.000 | 263.100    | 3,89 % | 240      | 2024-10-01 | active    |
| 10  | Tim Richter          | consumer | 5.000   | 5.000      | 7,99 % | 24       | 2025-02-14 | requested |
| 11  | Klein & Partner KG   | business | 220.000 | 0          | 4,25 % | 60       | 2019-11-30 | repaid    |
| 12  | Mia Neumann          | car      | 19.800  | 11.340     | 5,79 % | 48       | 2023-07-22 | active    |

Erwartete Ergebnisse, auf die sich die Testfälle beziehen:

| Kürzel | Eingabe                                             | Treffer | Kreditnehmer                                                                            |
| ------ | --------------------------------------------------- | ------- | --------------------------------------------------------------------------------------- |
| R1     | Kreditnehmer „a“, Status Active                     | 6       | Anna Schmidt, Markus Weber, Sophie Wagner, Hofmann IT Services, Elena Koch, Mia Neumann |
| R2     | Kreditnehmer „Weber“                                | 1       | Markus Weber                                                                            |
| R3     | Betrag von 100.000 bis 300.000                      | 3       | Bäckerei Müller GmbH, Elena Koch, Klein & Partner KG                                    |
| R4     | Betrag von 320.000                                  | 2       | Anna Schmidt, Jonas Becker                                                              |
| R5     | Zeitraum 2024-01-01 bis 2024-06-30                  | 4       | Anna Schmidt, Markus Weber, Bäckerei Müller GmbH, Sophie Wagner                         |
| R6     | Zeitraum nur 2024-02-15                             | 1       | Anna Schmidt                                                                            |
| R7     | Kreditart Car loan und Consumer loan, Status Active | 3       | Markus Weber, Sophie Wagner, Mia Neumann                                                |
| R8     | globale Suche „mortgage“ (Englisch)                 | 3       | Anna Schmidt, Jonas Becker, Elena Koch                                                  |
| R9     | globale Suche „Baufinanzierung“ (Deutsch)           | 3       | wie R8                                                                                  |
| R10    | Formular Status Active, dann globale Suche „car“    | 2       | Markus Weber, Mia Neumann                                                               |
| R11    | Kreditnehmer „nobody“ oder globale Suche „nobody“   | 0       | –                                                                                       |
| R12    | ohne Filter, Seite 2                                | 2       | Klein & Partner KG, Mia Neumann                                                         |

Erwartete erste Zeile beim Sortieren (aufsteigend / absteigend):

| Spalte               | Aufsteigend                     | Absteigend                |
| -------------------- | ------------------------------- | ------------------------- |
| Kreditnehmer         | Anna Schmidt                    | Tim Richter               |
| Kreditbetrag         | Tim Richter (5.000)             | Jonas Becker (450.000)    |
| Zinssatz             | Jonas Becker (3,42 %)           | Tim Richter (7,99 %)      |
| Laufzeit             | Tim Richter (24)                | Jonas Becker (360)        |
| Ausgezahlt am        | Klein & Partner KG (2019-11-30) | Tim Richter (2025-02-14)  |
| Kreditart (Englisch) | eine Zeile mit „Business loan“  | eine Zeile mit „Mortgage“ |

## 5 Ausgangslage und Zielbild

| Ebene       | Heute                                                          | Ziel                        |
| ----------- | -------------------------------------------------------------- | --------------------------- |
| Unit        | U1–U11 umgesetzt: 19 Tests in 4 Dateien, dazu 2 Tests zu `App` | 11 Fälle                    |
| Integration | 5 Tests, die nur prüfen, ob etwas gerendert wird               | 20 Fälle, breiteste Schicht |
| E2E         | 17 Tests, davon 10 mit fachlichen Varianten                    | 9 Fälle                     |

Heute steckt fast das ganze Verhalten der Seite in E2E-Tests. Das macht die Suite langsam und
anfällig für Timing-Fehler. Ein Beispiel: Der CSV-Test aus PR #2 schlug in der CI fehl, weil der
Export vor dem Ablauf der `filterDelay` startete. Die fachlichen Varianten wandern deshalb in die
Integrationsebene. In der E2E-Ebene bleiben ein Hauptablauf und browserabhängige Fälle.

## 6 Statische Prüfungen

Bereits eingerichtet und in CI und Stop-Hook aktiv:

- TypeScript mit strikter Typprüfung, auch in Templates. Die Option steht nicht ausdrücklich in
  `tsconfig.json`, greift aber: Der Build hat in PR #2 und #4 Typfehler in Templates gemeldet.
- ESLint mit Angular-Regeln, abgeleitet aus den Style Guides
- Sheriff für die Modulgrenzen `src/app/<scope>/<type>`
- Prettier

Es fehlt nichts. Zwei Stellen umgehen die Typprüfung bewusst und sind im Code kommentiert. Sie werden
durch Laufzeittests abgesichert:

| Stelle                                             | Grund                                                        | Abgesichert durch |
| -------------------------------------------------- | ------------------------------------------------------------ | ----------------- |
| `$any(filterForm.disbursementPeriod)` im Formular  | PrimeNG 22 RC typisiert `min`/`max` des DatePickers als Zahl | I2, E4            |
| untypisierte Zeilenvariable `let-loan` der Tabelle | PrimeNG-Templates liefern keinen Typ                         | I15               |

## 7 Unit-Tests

Datei, wenn nicht anders angegeben: `frontend/src/app/loans/domain/loan-filter.spec.ts`.

### U1 Leerer Filter lässt jeden Kredit durch

- Status: vorhanden · Priorität: hoch
- Schritte: `matchesLoanFilter(loan, emptyLoanFilter)` aufrufen.
- Erwartet: `true`.

### U2 Kreditnehmer als Teilstring

- Status: vorhanden · Priorität: hoch
- Schritte: Filter mit `borrower: ' schmi '` und mit `borrower: 'Weber'` gegen Anna Schmidt prüfen.
- Erwartet: Der erste Aufruf liefert `true` (Groß- und Kleinschreibung egal, Leerzeichen am Rand
  ignoriert), der zweite `false`.

### U3 Kreditart und Status

- Status: vorhanden · Priorität: hoch
- Schritte: Filter mit `types: ['car', 'mortgage']`, mit `types: ['car']` und mit
  `statuses: ['overdue']` gegen Anna Schmidt prüfen.
- Erwartet: `true`, `false`, `false`. Eine leere Liste schränkt nicht ein (durch U1 abgedeckt).

### U4 Betrag inklusive Grenzen

- Status: vorhanden · Priorität: hoch
- Schritte: Anna Schmidt (320.000) mit `minAmount` und `maxAmount` = 320.000, mit `minAmount` 320.001
  und mit `maxAmount` 319.999 prüfen.
- Erwartet: `true`, `false`, `false`.

### U5 Auszahlungszeitraum inklusive Grenzen

- Status: vorhanden · Priorität: hoch
- Schritte: Anna Schmidt (2024-02-15) mit Von und Bis = 2024-02-15, mit Von 2024-02-16 und mit Bis
  2024-02-14 prüfen.
- Erwartet: `true`, `false`, `false`.

### U6 Mehrere Kriterien werden mit UND verknüpft

- Status: vorhanden · Priorität: hoch
- Schritte: vier eigene Testkredite (car/active, consumer/active, car/overdue, mortgage/active) mit
  Kreditart `car` und `consumer` und Status `active` filtern. Der Test nutzt bewusst nicht die
  Beispieldaten: Sheriff erlaubt `domain` keinen Zugriff auf `data-access`, und ein Unit-Test soll
  nicht von Mockdaten abhängen.
- Erwartet: nur die beiden Kredite car/active und consumer/active. Der Kredit, der nur eines der
  Kriterien erfüllt (car/overdue), fällt heraus.

### U7 Widersprüchlicher Betragsbereich

- Status: vorhanden · Priorität: mittel
- Schritte: Filter mit `minAmount` 300.000 und `maxAmount` 100.000 auf einen Kredit über 300.000 und
  einen dazwischen anwenden.
- Erwartet: leeres Ergebnis, kein Fehler.

### U8 Zeilenaufbereitung `toLoanRow`

- Datei: `frontend/src/app/loans/feature/loan-columns.spec.ts`
- Status: vorhanden · Priorität: hoch
- Schritte: einen Kredit mit den echten Übersetzungen aus `en.json` und `de.json` aufbereiten, dann
  einmal für jeden Status.
- Erwartet: `typeLabel` und `statusLabel` kommen aus der jeweiligen Übersetzung. Die Tag-Farbe ist
  `info` für Requested, `success` für Active, `danger` für Overdue und `secondary` für Repaid. Die
  übrigen Felder bleiben unverändert. Die Übersetzungen werden dem Typ `LoanTranslations` zugewiesen;
  fehlt in einer Sprache ein Label für eine Kreditart oder einen Status, bricht schon der Build ab.

### U9 Spaltendefinition

- Datei: `frontend/src/app/loans/feature/loan-columns.spec.ts`
- Status: vorhanden · Priorität: niedrig
- Schritte: `loanColumns` auswerten.
- Erwartet: zehn Spalten in der Reihenfolge Kredit-Nr., Kreditnehmer, Kreditart, Kreditbetrag,
  Restschuld, Zinssatz, Laufzeit, Monatsrate, Ausgezahlt am, Status. Schlüssel sind eindeutig. Genau
  die Spalten mit Format Währung, Prozent oder Zahl haben `isNumeric: true`. Kreditart und Status
  zeigen auf die übersetzten Felder `typeLabel` und `statusLabel`.

### U10 Plausibilität der Beispieldaten

- Datei: `frontend/src/app/loans/data-access/sample-loans.spec.ts`
- Status: vorhanden · Priorität: niedrig
- Schritte: alle Beispielkredite prüfen.
- Erwartet: zwölf Einträge, IDs und Kreditnummern eindeutig, Restschuld nie größer als Kreditbetrag,
  bei Status `repaid` ist die Restschuld 0, Datumsangaben im Format `YYYY-MM-DD` und gültig.

### U11 Übersetzungsdateien vollständig

- Datei: `frontend/src/app/i18n.spec.ts`
- Status: vorhanden · Priorität: mittel
- Schritte: `public/i18n/en.json` und `de.json` importieren, verschachtelte Schlüssel flach machen und
  vergleichen.
- Erwartet: identische Schlüssel in beiden Dateien, jeder Wert ist ein nicht leerer Text. Dass es für
  jede Kreditart und jeden Status ein Label gibt, prüft der Compiler über U8.

## 8 Integrationstests

Aufbau aller Fälle: Komponente per `TestBed` erzeugen, `TranslocoTestingModule` mit den echten
Übersetzungen, bei Bedarf `provideRouter`. Bedient wird über das DOM (Eingaben, Klicks, Enter). Geprüft
wird, was im DOM steht oder was die Komponente ausgibt.

### 8.1 Suchformular `LoanFilterForm`

Datei: `frontend/src/app/loans/feature/loan-filter-form.spec.ts` (neu)

#### I1 Suchen gibt den Filter aus

- Status: neu · Priorität: hoch
- Schritte: Kreditnehmer „Weber“ eintippen, Betrag von 10.000 eingeben, „Search“ klicken. Danach
  Kreditnehmer ändern und im Textfeld Enter drücken.
- Erwartet: `filterChange` gibt beim Klick `{ borrower: 'Weber', minAmount: 10000, … }` mit sonst
  leeren Feldern aus, bei Enter erneut mit dem neuen Namen. Vor dem Klick wird nichts ausgegeben.

#### I2 Datumsbereich als lokales Datum

- Status: neu · Priorität: hoch
- Schritte: Zeitraum 2024-01-01 bis 2024-06-30 setzen und suchen. Danach nur 2024-02-15 als Start
  setzen und suchen. Test in einer Zeitzone östlich von UTC laufen lassen (zum Beispiel
  `TZ=Europe/Berlin`).
- Erwartet: `disbursedFrom: '2024-01-01'`, `disbursedTo: '2024-06-30'`. Beim zweiten Mal Von und Bis
  `'2024-02-15'`. Kein Datum ist um einen Tag verschoben.

#### I3 Zurücksetzen

- Status: verschieben (aus E2E „resets the form and shows all loans again“) · Priorität: hoch
- Schritte: alle Felder füllen, „Reset“ klicken.
- Erwartet: alle Felder sind leer, die Mehrfachauswahlen zeigen „Any“, `filterChange` gibt
  `emptyLoanFilter` aus.

#### I4 Übersetzte Optionen

- Status: neu · Priorität: mittel
- Schritte: Optionen der Mehrfachauswahl Kreditart und Status auslesen, dann Sprache auf Deutsch
  stellen.
- Erwartet: Englisch: Mortgage, Consumer loan, Car loan, Business loan sowie Requested, Active,
  Overdue, Repaid. Deutsch: Baufinanzierung, Ratenkredit, Autokredit, Firmenkredit sowie Beantragt,
  Aktiv, Im Verzug, Getilgt. Feldbeschriftungen wechseln mit.

### 8.2 Kreditseite `LoansPage`

Datei: `frontend/src/app/loans/feature/loans-page.spec.ts`

#### I5 Spalten mit Breitengriff

- Status: vorhanden · Priorität: mittel
- Erwartet: zehn Spaltenköpfe, jeder mit Griff zum Ändern der Breite.

#### I6 Erste Seite

- Status: vorhanden · Priorität: hoch
- Erwartet: zehn Zeilen, erste Zeile Anna Schmidt, Kreditart „Mortgage“, Status „Active“.

#### I7 Formularsuche nach Kreditnehmer und Status

- Status: verschieben (aus E2E „restricts the table by borrower and status“) · Priorität: hoch
- Schritte: Kreditnehmer „a“, Status Active, suchen.
- Erwartet: Ergebnis R1, also sechs Zeilen inklusive Mia Neumann, die vorher auf Seite 2 stand. Kein
  Kredit mit Status Overdue.

#### I8 Betrags- und Zeitraumfilter

- Status: verschieben (aus E2E „restricts the table by amount range“ und „… by disbursement period“) ·
  Priorität: hoch
- Schritte: nacheinander R3, R4 und R5 einstellen und suchen.
- Erwartet: drei, zwei und vier Zeilen mit den Namen aus der Tabelle in Abschnitt 4.

#### I9 Paginator passt zur Trefferzahl

- Status: verschieben (aus E2E „shows only as many pages …“ und „returns to the first page …“) ·
  Priorität: hoch (Regressionstest für den PrimeNG-RC-Fehler aus PR #5)
- Schritte: ohne Filter die Seiten zählen, auf Seite 2 wechseln (R12), dann R2 suchen, dann R11
  suchen, dann Formular leeren und suchen.
- Erwartet: zwei Seiten, Seite 2 mit zwei Zeilen. Nach R2 eine Seite mit Markus Weber, aktive Seite
  ist 1. Nach R11 kein Seitenknopf. Danach wieder zwei Seiten und Seite 1 aktiv.

#### I10 Leermeldung

- Status: verschieben (aus beiden E2E-Tests zur Leermeldung), Spaltenbreite neu · Priorität: hoch
- Schritte: R11 über das Formular, danach über die globale Suche. Zusätzlich zwei Spalten ausblenden
  und erneut R11 auslösen.
- Erwartet: genau eine Zeile mit „No loans found.“, auf Deutsch „Keine Kredite gefunden.“. Die Zelle
  hat `colspan` gleich der Zahl sichtbarer Spalten (10, nach dem Ausblenden 8).

#### I11 Globale Suche

- Status: verschieben (aus E2E „filters rows with the global search“), Deutsch neu · Priorität: hoch
- Schritte: „mortgage“ eingeben, Fake-Timer um 300 ms vorstellen. Dann Sprache Deutsch, Suche
  leeren, „Baufinanzierung“ eingeben. Dann „KR-2024-0007“ eingeben.
- Erwartet: R8, R9, danach nur Hofmann IT Services. Vor Ablauf der 300 ms ändert sich nichts.

#### I12 Formular und globale Suche zusammen

- Status: neu · Priorität: hoch
- Schritte: Formular Status Active suchen, dann global „car“. Danach Formular zurücksetzen.
- Erwartet: R10 mit zwei Zeilen und einer Seite. Nach dem Zurücksetzen gilt nur noch „car“: drei
  Zeilen (Markus Weber, Lukas Schulz, Mia Neumann), die Suchbox behält ihren Text.

#### I13 Spaltenauswahl

- Status: verschieben (aus E2E „hides a column via the column toggle“) · Priorität: mittel
- Schritte: Kreditnehmer und Restschuld abwählen, dann Kreditnehmer wieder anwählen.
- Erwartet: Anzeige „8 columns“, acht Spaltenköpfe und acht Zellen je Zeile, Reihenfolge der übrigen
  unverändert. Nach dem Wiederanwählen steht Kreditnehmer wieder an Position 2, nicht am Ende.

#### I14 Sortierung

- Status: verschieben (aus E2E „sorts by borrower“), weitere Spalten neu · Priorität: mittel
- Schritte: je Spalte aus der Sortiertabelle in Abschnitt 4 einmal und zweimal auf den Kopf klicken.
- Erwartet: erste Zeile wie in der Tabelle angegeben. Zahlen werden numerisch sortiert (5.000 vor
  28.500), Datum chronologisch, Kreditart nach dem übersetzten Text.

#### I15 Formatierung der Zellen

- Status: neu · Priorität: mittel
- Schritte: erste Zeile auslesen.
- Erwartet: Kredit-Nr. `KR-2024-0001` in Festbreitenschrift, Betrag `€320,000.00`, Restschuld
  `€287,450.00`, Zins `3.65%`, Laufzeit `300`, Rate `€1,624.80`, Datum `Feb 15, 2024`, Status als Tag
  „Active“ mit Farbe `success`. Zahlenspalten sind rechtsbündig.

#### I16 CSV-Inhalt

- Status: neu auf dieser Ebene (Download selbst bleibt in E2) · Priorität: hoch
- Schritte: `URL.createObjectURL` stubben. R8 einstellen, Spalte Restschuld ausblenden, „CSV“ klicken,
  übergebenen Blob als Text lesen.
- Erwartet: vier Zeilen (Kopf und drei Kredite), neun Spalten ohne Restschuld, Spaltenköpfe in der
  aktiven Sprache, Kreditart als übersetzter Text. Zahlen und Datum stehen unformatiert drin
  (`0.0365`, `2024-02-15`).

#### I17 Sprachwechsel zur Laufzeit

- Status: neu · Priorität: mittel
- Schritte: Seite auf Englisch rendern, über `TranslocoService.setActiveLang('de')` umschalten.
- Erwartet: Titel „Kredite“, Spaltenköpfe deutsch, Kreditart und Status deutsch, Toolbar und Formular
  deutsch. Ein gesetzter Filter bleibt bestehen.

### 8.3 Shell und Routing

#### I18 Menü

- Datei: `frontend/src/app/layout/feature/app-layout.spec.ts`
- Status: vorhanden · Priorität: mittel
- Erwartet: Gruppe „Lending“ mit genau einem Link „Loan overview“ auf `/`.

#### I19 Startseite in der Shell

- Datei: `frontend/src/app/app.routes.spec.ts` (neu)
- Status: neu · Priorität: hoch
- Schritte: mit `RouterTestingHarness` die echten `routes` laden und `/` aufrufen.
- Erwartet: Die Shell ist gerendert, im `<main>` steht die Kreditseite mit Tabelle.

#### I20 Aktiver Menüeintrag

- Datei: `frontend/src/app/app.routes.spec.ts` (neu)
- Status: verschieben (aus E2E „marks the current page in the sidebar“) · Priorität: mittel
- Schritte: wie I19.
- Erwartet: Der Link „Loan overview“ hat `aria-current="page"` und die Klasse für den aktiven
  Zustand.

## 9 E2E-Tests

Dateien: `frontend/e2e/loans.spec.ts` und `frontend/e2e/app-layout.spec.ts`. Alle Fälle laufen in der
CI gegen den Production-Build.

### E1 Startseite lädt sauber

- Status: teils vorhanden · Priorität: hoch
- Schritte: `/` öffnen, Konsole und Netzwerk mitschneiden.
- Erwartet: Shell und Tabelle mit zehn Spalten sichtbar, keine Fehler in der Konsole, keine Anfrage an
  `/api`.

### E2 Hauptablauf

- Status: umbauen (ersetzt mehrere Einzeltests) · Priorität: hoch
- Schritte: im Formular Status Active suchen, global „car“ eingeben, auf die erwartete Trefferzahl
  warten, nach Kreditnehmer sortieren, „CSV“ klicken.
- Erwartet: zwei Zeilen (R10), erste Zeile Markus Weber. Download `loans.csv` mit Kopfzeile und zwei
  Datenzeilen in der angezeigten Reihenfolge.

### E3 Spaltenbreite ziehen

- Status: vorhanden · Priorität: mittel
- Schritte: Rand der Spalte Kreditart um 80 px nach rechts ziehen.
- Erwartet: Spalte ist mindestens 40 px breiter, die Tabelle wird breiter statt die Nachbarspalte zu
  verkleinern.

### E4 Datumsbereich wählen

- Status: Tippen vorhanden, Kalender neu · Priorität: mittel
- Schritte: einmal den Zeitraum per Tastatur `01/01/2024 - 06/30/2024` tippen und suchen. Einmal den
  Kalender öffnen, über die Monats- und Jahresauswahl im Kalenderkopf zu Februar 2024 wechseln, den
  1. und den 29. anklicken und suchen.
- Erwartet: beim Tippen vier Zeilen (R5). Bei der Kalenderauswahl eine Zeile, Anna Schmidt
  (ausgezahlt 2024-02-15). Das Feld zeigt danach `02/01/2024 - 02/29/2024`.

### E5 Mehrfachauswahl bedienen

- Status: teils vorhanden · Priorität: mittel
- Schritte: Status-Auswahl mit der Maus öffnen, Active anklicken, mit Escape schließen. Danach
  Kreditart per Tastatur öffnen (Fokus, Pfeil nach unten), Option mit Leertaste wählen, Escape.
- Erwartet: Auswahl wird übernommen und im Feld angezeigt, Panel schließt, Fokus bleibt im Feld.

### E6 Tastaturbedienung

- Status: neu · Priorität: hoch
- Schritte: nur mit Tab, Shift+Tab, Enter und Leertaste durch Formular, Toolbar, Spaltenköpfe und
  Paginator gehen.
- Erwartet: Jedes Bedienelement ist erreichbar und hat einen sichtbaren Fokus. Enter im Formular
  sucht, Enter auf einem Spaltenkopf sortiert, Enter auf einer Seitenzahl blättert.

### E7 Menügruppe einklappen

- Status: vorhanden · Priorität: niedrig
- Erwartet: Klick auf „Lending“ blendet „Loan overview“ aus, ein zweiter Klick wieder ein.

### E8 Mobile Ansicht

- Status: Öffnen vorhanden, Rest neu · Priorität: mittel
- Schritte: Viewport 390 × 844. Menüknopf klicken, dann neben die Seitenleiste tippen. Tabelle seitlich
  scrollen.
- Erwartet: Seitenleiste erscheint und verschwindet wieder. Die Tabelle lässt sich horizontal
  scrollen, die Seite selbst hat keinen horizontalen Scrollbalken.

### E9 Automatische Barrierefreiheitsprüfung

- Status: neu, Abhängigkeit `@axe-core/playwright` fehlt · Priorität: mittel
- Schritte: Seite ohne Filter, mit geöffnetem Formular und mit Leermeldung prüfen.
- Erwartet: null axe-Verstöße bei den Regeln für WCAG 2.x AA, wie im A11y-Style-Guide gefordert.
  Verursacht PrimeNG selbst einen Verstoß, wird er im Test einzeln und mit Begründung ausgenommen und
  als Fehler an PrimeNG gemeldet.

Nach der Umstellung entfallen diese heutigen E2E-Tests, weil ihr Inhalt in Integrationstests oder in
E2 steckt: „sorts by borrower“, „filters rows with the global search“, „hides a column via the column
toggle“, „exports the filtered rows as CSV“ (in E2 aufgegangen), „restricts the table by borrower and
status“, „restricts the table by amount range“, „resets the form …“, „shows only as many pages …“,
„returns to the first page …“, beide Tests zur Leermeldung und „marks the current page in the
sidebar“.

## 10 Abdeckungsmatrix

| Funktion                      | Unit    | Integration | E2E        |
| ----------------------------- | ------- | ----------- | ---------- |
| Filterlogik                   | U1–U7   | I7, I8      | E2         |
| Suchformular bedienen         | –       | I1–I4       | E4, E5     |
| Datumsumrechnung              | –       | I2          | E4         |
| Paginator                     | –       | I9          | –          |
| Leermeldung                   | –       | I10         | E9         |
| Globale Suche                 | –       | I11, I12    | E2         |
| Spaltenauswahl                | U9      | I13, I16    | –          |
| Sortierung                    | –       | I14         | E2         |
| Formatierung                  | U8      | I15         | –          |
| CSV-Export                    | –       | I16         | E2         |
| Spaltenbreite                 | –       | I5          | E3         |
| Übersetzungen                 | U8, U11 | I4, I17     | –          |
| Shell, Menü, Routing          | –       | I18–I20     | E1, E7, E8 |
| Tastatur und Barrierefreiheit | –       | –           | E5, E6, E9 |
| Beispieldaten                 | U10     | –           | –          |

## 11 Umsetzungsreihenfolge

1. Unit-Tests U6–U11 ergänzen. Sie sind schnell geschrieben und decken Daten und Übersetzungen ab.
2. Integrationstests für das Formular (I1–I4) und die Seite (I7–I17) schreiben. Dabei klären, wie
   sich die PrimeNG-Overlays in jsdom bedienen lassen (siehe Risiken).
3. Routing-Tests I19 und I20.
4. E2E umbauen: E2 als Hauptablauf, E1 erweitern, abgelöste Einzeltests löschen. Erst löschen, wenn
   der Ersatz grün ist.
5. E4 (Kalender), E6 und E8 ergänzen.
6. `@axe-core/playwright` als Dev-Abhängigkeit aufnehmen und E9 schreiben.

Jeder Schritt ist ein eigener Pull Request.

## 12 Abnahmekriterien

Der Plan gilt als umgesetzt, wenn:

- alle Fälle mit Priorität hoch und mittel existieren und grün sind,
- die E2E-Suite in der CI ohne Wiederholungen grün läuft, geprüft mit
  `CI=1 pnpm exec playwright test --repeat-each=5 --retries=0`,
- die Unit- und Integrationstests zusammen unter zehn Sekunden laufen,
- für jeden neu gefundenen Fehler zuerst ein Test entsteht, der ihn zeigt, und erst dann der Fix.

## 13 Risiken und offene Entscheidungen

| Thema                                   | Auswirkung                                                                                                    | Umgang                                                                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| PrimeNG-Overlays in jsdom               | Mehrfachauswahl und Kalender öffnen ihr Panel per Overlay. Ob das in jsdom zuverlässig klappt, ist ungeprüft. | Erst ausprobieren. Klappt es nicht, Werte in Integrationstests über eine Testhilfe setzen und die Bedienung nur in E4/E5 prüfen. |
| PrimeNG 22 ist ein Release Candidate    | Zwei Umgehungen im Code (`$any` am Datumsfeld, `totalRecords`). Ein Update kann Verhalten ändern.             | I2, I9 und I15 schlagen dann an. Nach einem stabilen Release prüfen, ob die Umgehungen entfallen können.                         |
| Unbekannte URLs                         | Heute leere Seite, weil keine Wildcard-Route existiert.                                                       | Entscheidung offen. Mit Weiterleitung auf `/` kommt ein Fall in 8.3 dazu.                                                        |
| Kein Sprachumschalter in der Oberfläche | Deutsch ist nur über den Service erreichbar.                                                                  | I4 und I17 schalten über `TranslocoService`. Mit Umschalter kommt ein E2E-Fall dazu.                                             |
| Gemischte Zahlen- und Datumsformate     | Tabelle englisch, Betragsfeld nach Browsersprache, Datumsfeld `mm/dd/yyyy`.                                   | Erwartete Werte in I15 und E4 hängen davon ab. Bei einer Umstellung auf deutsche Formate anpassen.                               |
| Zeitzone                                | Die Datumsumrechnung ist nur östlich von UTC fehleranfällig.                                                  | I2 mit fester Zeitzone laufen lassen.                                                                                            |
| Backend ohne API                        | Sobald Daten per HTTP kommen, ändern sich Testdaten und Mocks.                                                | Dann Repository-, Controller- und HTTP-Tests ergänzen und diesen Plan überarbeiten.                                              |
