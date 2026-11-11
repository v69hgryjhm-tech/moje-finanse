import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync('v57mission.js','utf8');
const css=fs.readFileSync('v57mission.css','utf8');
const html=fs.readFileSync('index.html','utf8');

new Function(src);

for(const token of [
  'renderMission57',
  'actionRows57',
  'privateStatus57',
  'companyStatus57',
  'upcoming30_57',
  'allocation57',
  'changeRows57',
  'toggleLegacyHome57'
]){
  assert.ok(src.includes(token),'Brak elementu Mission Control: '+token);
}

assert.match(html,/v57mission\.css\?v=5900/);
assert.match(html,/v57mission\.js\?v=5900/);
assert.match(html,/Moje Finanse 5\.9\.0/);
assert.ok(css.includes('#home.missionMode57:not(.showLegacy57)>:not(#missionHome57)'),'Stary Start nie jest domyślnie ukrywany');
assert.ok(src.includes('Pokaż szczegóły finansowe'),'Brak rozwijania starego Startu');
assert.ok(src.includes('3 rzeczy do zrobienia'),'Brak priorytetów na Start');
assert.ok(src.includes('JA / FINANSE PRYWATNE'),'Brak strefy prywatnej');
assert.ok(src.includes('MOHE / FIRMA'),'Brak strefy firmy');
assert.ok(src.includes('NASTĘPNE 30 DNI'),'Brak osi 30 dni');
assert.ok(src.includes('AUTOPILOT — REKOMENDACJA MIESIĄCA'),'Brak rekomendacji Autopilota');
assert.ok(!src.includes('accountBalance'),'Mission Control nie powinien wymagać stanu konta');
assert.ok(!src.includes('cashBalance'),'Mission Control nie powinien wymagać gotówki');
assert.match(fs.readFileSync('v14a.js','utf8'),/moje-finanse-v14/);

console.log('PASS — 5.6: Mission Control, briefing, priorytety, prywatne vs MOHE, 30 dni, Autopilot i rozwijany stary Start są podpięte.');
