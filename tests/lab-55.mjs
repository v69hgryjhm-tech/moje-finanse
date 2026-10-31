import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync('v55lab.js','utf8');
const html=fs.readFileSync('index.html','utf8');

new Function(src);

for(const token of [
  'scenarioResult55',
  'renderLab55',
  'investmentSummary55',
  'renderInvestments55',
  'wealthProjection55',
  'renderWealth55',
  'periodData55',
  'renderReview55',
  'portfolioRows55',
  'renderBusiness55'
]){
  assert.ok(src.includes(token),'Brak funkcji/modułu 5.4: '+token);
}

for(const id of ['lab','investments','review','labBody55','investmentsBody55','reviewBody55']){
  assert.ok(html.includes('id="'+id+'"'),'Brak widoku/kontenera #'+id);
}

assert.match(html,/v55lab\.js\?v=5510/);
assert.match(html,/Moje Finanse 5\.5\.1/);
assert.match(html,/Laboratorium decyzji/);
assert.match(html,/Inwestycje i dywidendy/);
assert.match(html,/Review finansowy/);
assert.ok(!src.includes('accountBalance'),'5.4 nie powinno wymagać stanu konta');
assert.ok(!src.includes('cashBalance'),'5.4 nie powinno wymagać stanu gotówki');
assert.match(fs.readFileSync('v14a.js','utf8'),/moje-finanse-v14/);

console.log('PASS — 5.4: Laboratorium, inwestycje, review, prognoza majątku i portfolio MOHE są podpięte.');
