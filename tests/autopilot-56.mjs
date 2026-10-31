import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync('v56autopilot.js','utf8');
const html=fs.readFileSync('index.html','utf8');

new Function(src);

for(const token of [
  'allocation56',
  'stress56',
  'debtSim56',
  'timeline56',
  'changes56',
  'goalOptimizer56',
  'taxCenter56',
  'capacityPlan56',
  'watchMetric56',
  'scoreHistory56',
  'renderAutopilot56',
  'renderCapacity56',
  'renderWatch56'
]){
  assert.ok(src.includes(token),'Brak funkcji Autopilota: '+token);
}

for(const id of ['autopilot','capacity','watch','autopilotBody56','capacityBody56','watchBody56']){
  assert.ok(html.includes('id="'+id+'"'),'Brak widoku/kontenera #'+id);
}

assert.match(html,/v56autopilot\.js\?v=5500/);
assert.match(html,/Moje Finanse 5\.5\.0/);
assert.match(html,/Autopilot finansowy/);
assert.match(html,/MOHE Capacity Planner/);
assert.match(html,/Watchlista decyzji/);
assert.ok(src.includes('Timeline finansowy — 36 miesięcy'));
assert.ok(src.includes('Stress Test 360°'));
assert.ok(src.includes('Centrum podatkowe 2.0'));
assert.ok(src.includes('Droga do zera długu'));
assert.ok(!src.includes('accountBalance'),'Autopilot nie powinien wymagać stanu konta');
assert.ok(!src.includes('cashBalance'),'Autopilot nie powinien wymagać stanu gotówki');
assert.match(fs.readFileSync('v14a.js','utf8'),/moje-finanse-v14/);

console.log('PASS — 5.5: Autopilot, Stress Test, zero długu, timeline 36, cele, podatki 2.0, Capacity, watchlista i score history są podpięte.');
