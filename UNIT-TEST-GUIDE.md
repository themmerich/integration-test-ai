# Unit-Tests im Angular-Frontend

Unit-Test: eine Einheit isoliert prüfen, ohne etwas zu rendern. Kein `TestBed.createComponent`, kein
DOM, kein echtes HTTP, Laufzeit im Millisekundenbereich. `TestBed` ist nur für Dependency Injection
erlaubt. Werkzeug: Vitest (`pnpm test`). Ergänzt den [Testplan](TEST-PLAN.md).

## Geeignete Einheiten

- Funktionen in `domain` und `util`: Fachregeln, Filter, Berechnungen, Umrechnungen
- Hilfsfunktionen neben Komponenten: Mapping Modell → Anzeige, Wert → Label, Status → Farbe
- Pipes: `transform()` direkt aufrufen
- Validatoren: eigene Signal-Forms-Validatoren und Schema-Funktionen
- Services mit Logik: per `TestBed.inject()`, Abhängigkeiten gemockt
- Datenzugriff (`data-access`): URL, Parameter und Mapping über `provideHttpClientTesting()` und
  `HttpTestingController`
- Signal Stores: Methoden aufrufen, `computed()`-Werte und Zustand lesen
- funktionale Guards, Resolver und Interceptors: per `TestBed.runInInjectionContext()`
- RxJS-Ketten in Services: Ergebnis, Fehlerfall, Abbruch, mit Fake-Timern
- Konfiguration und statische Daten: Spaltendefinitionen, Menüeinträge, Mockdaten konsistent
- Übersetzungsdateien: gleiche Schlüssel in allen Sprachen, keine leeren Werte

## Fälle je Einheit

- Normalfall
- Grenzwerte: Minimum, Maximum, genau auf der Grenze, knapp daneben
- leere Eingaben: `''`, `[]`, `null`, `undefined`
- ein Element und viele Elemente
- ungültige oder widersprüchliche Eingaben: definiertes Ergebnis oder erwarteter Fehler
- Kombination mehrerer Bedingungen
- jeder Wert eines Union-Typs, jeder `switch`-Fall
- Frontend-typische Sonderfälle: Zeitzone bei `Date` (lokal vs. UTC), Rundung von Beträgen,
  Groß- und Kleinschreibung, Leerzeichen, Umlaute
- Signale: abgeleiteter Wert nach jeder relevanten Änderung der Quelle
- HTTP: Erfolg, Fehlerstatus, leere Antwort
- Eingaben bleiben unverändert (keine Mutation)
- Regression: für jeden gefundenen Fehler ein Test, der ihn zeigt

## Nicht in Unit-Tests

- Komponenten mit Template, Inputs, Outputs, Formularbindung → Integrationstest
- Direktiven mit Wirkung aufs DOM → Integrationstest
- Routing über mehrere Seiten → Integrationstest mit `RouterTestingHarness`
- Verhalten von Angular, PrimeNG oder Transloco selbst
- private oder `protected` Member von Komponenten
- triviale Getter, Setter, reine Weiterleitungen
- Layout, Overlays, Downloads, Viewport → E2E-Test

## Merkmale guter Unit-Tests

- Logik aus Komponenten in Funktionen oder Services auslagern, damit sie ohne Rendern testbar ist
- Sheriff-Grenzen gelten auch für Specs: Ein `domain`-Test importiert keine Mockdaten aus
  `data-access`
- deterministisch: `vi.useFakeTimers()` statt echter Wartezeit, kein `Math.random()`, kein `new Date()`
  ohne festen Wert
- Signale direkt lesen statt `subscribe`; kein `fixture.detectChanges()`, weil nichts gerendert wird
- ein Verhalten pro `it`, Name beschreibt das Verhalten
- eigene kleine Testdaten statt globaler Mockdaten
- konkrete Erwartungswerte, nicht mit derselben Logik berechnet
- Typen nutzen: Testdaten als `Loan`, `LoanTranslations` usw. typisieren, damit Lücken schon beim
  Kompilieren auffallen
- einmal absichtlich scheitern lassen, um zu sehen, dass der Test greift
