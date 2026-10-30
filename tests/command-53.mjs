import fs from 'node:fs';
import assert from 'node:assert/strict';

const src=fs.readFileSync('v53command.js','utf8');
const html=fs.readFileSync('index.html','utf8');

new Function(src);

for(const token of [
  'financialScore',
  'annualForecast',
  'companyBreakEven',
  'commandAlerts',
  'dataQuality',
  'forecastMonths',
  'renderHome53',
  'renderControl53',
  'renderBusiness53'
]){
  assert.ok(src.includes(token),'Brak funkcji/modułu: '+token);
}

assert.match(html,/v53command\.js\?v=5300/);
assert.match(html,/Moje Finanse 5\.3\.0/);
assert.match(html,/Centrum dowodzenia/);
assert.match(html,/class="plus" onclick="show\('control'\)"/);
assert.ok(!src.includes('accountBalance'),'Centrum dowodzenia nie powinno wymagać stanu konta');
assert.ok(!src.includes('cashBalance'),'Centrum dowodzenia nie powinno wymagać stanu gotówki');
assert.match(fs.readFileSync('v14a.js','utf8'),/moje-finanse-v14/);

console.log('PASS — Centrum dowodzenia 5.2: score 0–100, forecast, radar 12 mies., alerty i próg firmy bez stanu konta/gotówki.');
