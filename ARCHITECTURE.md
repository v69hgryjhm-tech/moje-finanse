# Moje Finanse — aktywna architektura

Aktualna gałąź produkcyjna: **5.0.0**.

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
12. `v43boot.js` — pojedynczy start i odsłonięcie gotowego interfejsu.

## Dane
Główny klucz localStorage pozostaje bez zmian: `moje-finanse-v14`.

Nie zmieniać tego klucza bez jawnej migracji danych. Centrum finansowe zapisuje nowe dane wyłącznie wewnątrz `S.finance.control51`, więc starsze dane pozostają kompatybilne.

## Założenia 5.0
- aplikacja nie wymaga podawania stanu konta ani gotówki,
- moduł „Dzisiaj” korzysta z terminów, dochodów, rat, podatków i kosztów już zapisanych w aplikacji,
- historia majątku jest zapisywana ręcznie albo przy zamknięciu miesiąca,
- rezerwa PIT bez wpisanej faktycznej kwoty jest oznaczona jako estymacja,
- symulator refinansowania niczego nie zapisuje do kredytu — służy wyłącznie do porównania.

## Zasady rozwoju
- nie dodawać dynamicznego ładowania kolejnych wersji plików,
- nie dodawać startowych `setTimeout()` do kolejnych rendererów,
- każda nowa funkcja ma korzystać z istniejącego modelu danych albo mieć migrację,
- po zmianach uruchamiamy wszystkie testy GitHub Actions i sprawdzamy Pages,
- nie zmieniamy znaczenia istniejących danych bez testu regresyjnego.
