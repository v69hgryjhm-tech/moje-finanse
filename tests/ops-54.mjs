import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync('v54ops.js','utf8');
const html=fs.readFileSync('index.html','utf8');

new Function(src);

for(const token of [
  'actionPlan',
  'toggleAction54',
  'annualReserve',
  'dueReserveNow',
  'monthlyReportHtml54',
  'saveMonthReport54',
  'decisionModal54',
  'renderActions54',
  'renderControl54',
  'renderBudget54'
]){
  assert.ok(src.includes(token),'Brak funkcji/modułu: '+token);
}

assert.match(html,/v54ops\.js\?v=5300/);
assert.match(html,/Moje Finanse 5\.3\.0/);
assert.match(html,/Plan działania/);
assert.ok(!src.includes('accountBalance'),'Operacje nie powinny wymagać stanu konta');
assert.ok(!src.includes('cashBalance'),'Operacje nie powinny wymagać stanu gotówki');
assert.match(fs.readFileSync('v14a.js','utf8'),/moje-finanse-v14/);

console.log('PASS — Operacje 5.3: plan działania, rezerwy roczne, audyt kosztów, raport miesiąca i dziennik decyzji.');
