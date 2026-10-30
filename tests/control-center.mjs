import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync('v51control.js','utf8');
const html=fs.readFileSync('index.html','utf8');

new Function(src);

for(const token of [
  'taxReserve',
  'closeMonth51',
  'wealthHistory',
  'crisis',
  'priority',
  'goalAnalysis51',
  'businessTrend51',
  'loanCenter51',
  'renderToday51',
  'renderControl51'
]){
  assert.ok(src.includes(token),'Brak funkcji/modułu: '+token);
}

assert.match(html,/id="control"/);
assert.match(html,/id="controlBody51"/);
assert.match(html,/show\('control'\)/);
assert.match(html,/v51control\.js\?v=5000/);
assert.match(html,/Moje Finanse 5\.0\.0/);
assert.ok(!src.includes('accountBalance'),'Centrum nie powinno wymagać stanu konta');
assert.ok(!src.includes('cashBalance'),'Centrum nie powinno wymagać stanu gotówki');
assert.match(fs.readFileSync('v14a.js','utf8'),/moje-finanse-v14/);

console.log('PASS — Centrum finansowe 5.0: podatki, zamknięcie miesiąca, majątek, cele, firma, kredyty i scenariusze bez stanu konta/gotówki.');
