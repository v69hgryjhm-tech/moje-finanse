# Moje Finanse — aktywna architektura

Aktualna gałąź produkcyjna: **5.5.1**.

## Punkt wejścia
- `fresh-260.html` — bezpieczny redirect z cache-busterem
- `index.html` — jedyny właściwy interfejs aplikacji
- `manifest.json` — PWA

## Aktywne moduły JavaScript
Ładowane w kolejności z `index.html`:
1. `v14a.js` — stan, localStorage, lata i podstawowe obliczenia.
2. `v14b1.js`, `v14b2.js` — bazowe renderery.
3. `v15loan.js` — silnik harmonogramów kredytów.
4. `v16chart.js`, `v17loan.js`, `v18chart.js`, `v19loan.js` — wykresy i interfejs kredytów.
5. `v23salary.js`, `v24raise.js`, `v26forecast.js`, `v27ppk.js`, `v37payroll.js` — etat, prognozy, PPK, kadry i podwyżki.
6. `v41tax.js`, `v44tax.js` — parametry podatkowe i wspólny próg PIT.
7. `v41suite.js`, `v33uxfix.js`, `v42insights.js` — budżet, cele, majątek, scenariusze i stabilne renderery.
8. `v44business.js` — Firma+ brutto + VAT.
9. `v47ux.js` — końcowy UX, edycja kredytów i czytelność wykresów.
10. `v50accounting.js` — rejestr i eksport danych dla księgowej.
11. `v51control.js` — Centrum finansowe 5.0: rezerwy podatkowe, zamknięcie miesiąca, minimalny dochód, scenariusz kryzysowy, podział nadwyżki, historia majątku, tempo celów, trendy firmy i refinansowanie kredytów.
12. `v52planner.js` — warstwa planowania 5.1: plan 90 dni, alerty i decyzje, kondycja miesiąca, audyt stałych kosztów oraz szybkie symulacje nadpłat.
13. `v53command.js` — Centrum dowodzenia 5.2: kondycja 0–100, forecast roku, radar 12 miesięcy, centralne alerty, jakość danych i próg rentowności firmy.
14. `v54ops.js` — warstwa operacyjna 5.3: automatyczny plan działania, odhaczanie kroków, rezerwy roczne, audyt kosztów stałych, raport miesiąca i dziennik decyzji.
15. `v55lab.js` — strategia 5.4: Laboratorium decyzji, inwestycje i dywidendy, review kwartalny/roczny, prognoza majątku 5/10/20 lat oraz ranking portfela produktów MOHE.
16. `v56autopilot.js` — Autopilot 5.5: silnik alokacji nadwyżki, Stress Test 360°, droga do zera długu, timeline 36 miesięcy, zmiany m/m, optymalizator celów, podatki 2.0, MOHE Capacity Planner, watchlista warunkowa i historia score.
17. `v43boot.js` — pojedynczy start i odsłonięcie gotowego interfejsu.

## Dane
Główny klucz localStorage pozostaje bez zmian: `moje-finanse-v14`.

Nie zmieniać tego klucza bez jawnej migracji danych. Centrum finansowe zapisuje nowe dane wyłącznie wewnątrz `S.finance.control51`, więc starsze dane pozostają kompatybilne.

## Założenia 5.5
- aplikacja nie wymaga podawania stanu konta ani gotówki,
- moduł „Dzisiaj” korzysta z terminów, dochodów, rat, podatków i kosztów już zapisanych w aplikacji,
- historia majątku jest zapisywana ręcznie albo przy zamknięciu miesiąca,
- rezerwa PIT bez wpisanej faktycznej kwoty jest oznaczona jako estymacja,
- symulator refinansowania niczego nie zapisuje do kredytu — służy wyłącznie do porównania.
- Kondycja 0–100 jest wskaźnikiem zarządczym, nie oceną kredytową; opiera się na pokryciu planu, długu, poduszce, celach, jakości danych i stabilności kolejnych miesięcy.
- próg rentowności firmy jest operacyjnym progiem sprzedaży netto opartym na ostatnich rzeczywistych miesiącach firmy.
- Plan działania generuje zadania z istniejących danych i pozwala je odhaczać bez zmiany źródłowych transakcji.
- koszty roczne są dodatkową warstwą planistyczną i nie są automatycznie księgowane jako wydatek miesięczny.

## Zasady rozwoju
- nie dodawać dynamicznego ładowania kolejnych wersji plików,
- nie dodawać startowych `setTimeout()` do kolejnych rendererów,
- każda nowa funkcja ma korzystać z istniejącego modelu danych albo mieć migrację,
- po zmianach uruchamiamy wszystkie testy GitHub Actions i sprawdzamy Pages,
- nie zmieniamy znaczenia istniejących danych bez testu regresyjnego.

- scenariusze 5.4 są wyłącznie symulacjami i nie zmieniają danych źródłowych,
- pozycje tworzone w Centrum inwestycji są zapisywane jako aktywa typu „Inwestycje”, dzięki czemu są widoczne także w Majątku,
- prognoza majątku zakłada stałą wartość pozostałych aktywów, harmonogramy obecnych kredytów oraz parametry inwestycji i PPK,
- ranking MOHE nie udaje danych sprzedażowych: wolumen i czas pracy muszą być uzupełnione, aby wejść do oceny portfela.

- Autopilot 5.5 jest silnikiem rekomendacji — nie wykonuje przelewów i nie zmienia automatycznie danych źródłowych,
- Stress Test 360° używa zapisanej poduszki i miesięcznego minimum (stałe + raty),
- symulacja zera długu stosuje metodę avalanche i utrzymuje łączny miesięczny budżet spłaty, przekierowując uwolnione raty na najdroższy aktywny kredyt,
- Capacity Planner MOHE wymaga czasu druku produktu; limit popytu jest opcjonalny i bez niego używa średniego wolumenu produktu,
- watchlista warunkowa bazuje na danych lokalnych; zewnętrzną ofertę refinansowania użytkownik wpisuje ręcznie.
