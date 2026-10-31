import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync('v52planner.js','utf8');
const html=fs.readFileSync('index.html','utf8');

new Function(src);

for(const token of [
  'monthPlan',
  'plan90',
  'health',
  'alerts',
  'bestDecision',
  'recurringExpenses',
  'overpayRows52',
  'renderHome52',
  'renderControl52',
  'renderLoan52'
]){
  assert.ok(src.includes(token),'Brak funkcji/modułu: '+token);
}

assert.match(html,/v52planner\.js\?v=5500/);
assert.match(html,/Moje Finanse 5\.5\.0/);
assert.ok(!src.includes('accountBalance'),'Planer nie powinien wymagać stanu konta');
assert.ok(!src.includes('cashBalance'),'Planer nie powinien wymagać stanu gotówki');
assert.match(fs.readFileSync('v14a.js','utf8'),/moje-finanse-v14/);

console.log('PASS — Planer 5.1: plan 90 dni, alerty, kondycja, koszty i symulacje bez stanu konta/gotówki.');
