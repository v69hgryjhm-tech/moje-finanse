# Moje Finanse — aktywna architektura

Aktualna gałąź produkcyjna: **4.8.1**.

## Punkt wejścia
- `fresh-260.html` — bezpieczny redirect z cache-busterem
- `index.html` — jedyny właściwy interfejs aplikacji
- `manifest.json` — PWA

## Aktywne moduły JavaScript
Ładowane w kolejności z `index.html`:
1. `v14a.js` — stan, storage, lata, podstawowe obliczenia
2. `v14b1.js`, `v14b2.js` — bazowe renderery
3. `v15loan.js` — silnik kredytów
4. `v16chart.js`, `v17loan.js`, `v18chart.js`, `v19loan.js` — wykresy i UI kredytów
5. `v23salary.js` — pasek wynagrodzenia
6. `v24raise.js` — symulator podwyżki
7. `v26forecast.js` — prognozy i wykres łącznych zarobków
8. `v27ppk.js` — miesięczne PPK
9. `v41tax.js` — parametry podatkowe per rok
10. `v37payroll.js` — kadry, absencje, L4, urlop, prognoza brutto
11. `v41suite.js`, `v33uxfix.js`, `v42insights.js` — moduły finansowe i stabilne renderery
12. `v44business.js` — Firma+ brutto + VAT
13. `v44tax.js` — wspólny próg PIT etat + firma
14. `v47ux.js` — końcowe UX, Firma+ w nawigacji, edycja kredytów, dopracowanie wykresów i test aplikacji
15. `v43boot.js` — pojedynczy start i odsłonięcie gotowego interfejsu

## Dane
Główny klucz localStorage pozostaje bez zmian: `moje-finanse-v14`.

Nie zmieniać tego klucza przy aktualizacjach bez jawnej migracji danych.

## Zasady rozwoju
- nie dodawać ponownie dynamicznego ładowania kolejnych wersji plików,
- nie dodawać startowych `setTimeout()` do kolejnych rendererów,
- każda nowa funkcja ma korzystać z istniejącego modelu danych albo mieć migrację,
- stare, nieaktywne moduły usuwamy z gałęzi głównej; historia Git pozostaje ich archiwum,
- po zmianach sprawdzamy składnię wszystkich aktywnych plików JS i status GitHub Pages.
