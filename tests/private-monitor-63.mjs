import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync('v63privatemonitor.js','utf8');
const kernel=fs.readFileSync('v59kernel.js','utf8');
const html=fs.readFileSync('index.html','utf8');

new Function(src);

for(const token of [
  "privateMode='monitoring'",
  'renderPrivateMonitor63',
  'renderMonthlyMonitor63',
  'renderCommitments63',
  'renderAutopilot63',
  'renderReview63',
  'renderWatch63',
  'monitoringScore63'
]) assert.ok(src.includes(token),'Brak elementu monitoringu: '+token);

assert.match(html,/v63privatemonitor\.js\?v=5900/);
assert.match(html,/Moje Finanse 5\.9\.0/);
assert.ok(html.includes('Stałe zobowiązania <span class="pill">opcjonalne</span>'));
assert.ok(html.includes('id="emergency" class="view" hidden'));
assert.ok(!html.includes("onclick=\"show('emergency')\""),'Poduszka nadal jest dostępna w menu');

assert.ok(kernel.includes("case 'control':renderControl59()"));
assert.ok(kernel.includes("renderPrivateMonitor63"));
assert.ok(kernel.includes("renderMonthlyMonitor63"));
assert.ok(kernel.includes("renderCommitments63"));
assert.ok(!kernel.includes("safe59('Poduszka'"),'Kernel nadal aktywnie renderuje Poduszkę');

assert.ok(src.includes("Nie liczymy prywatnego „zostaje X zł”"));
assert.ok(src.includes('bez budżetu domowego'));
assert.ok(src.includes('Firma pozostaje liczona dokładnie'));
assert.ok(src.includes('window.mfCommand53.financialScore=monitoringScore63'));
assert.ok(src.includes('window.mfLab55.renderReview=renderReview63'));
assert.ok(src.includes('window.mfAutopilot56.renderWatch=renderWatch63'));

console.log('PASS — 5.9: prywatne finanse są monitoringiem bez pełnego budżetu, poduszki i sztucznej nadwyżki; firma pozostaje pełnym przepływem.');
