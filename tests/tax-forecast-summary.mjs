import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const src=fs.readFileSync('v44tax.js','utf8');
const helper=src.slice(src.indexOf('function taxOverviewHtml44('),src.indexOf('function chartSvg('));
const fmt=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(v);
const ctx={PLN:fmt};vm.createContext(ctx);vm.runInContext(helper,ctx);
for(const [final,actual,forecast,threshold] of [[98000,80000,18000,120000],[135000,100000,35000,120000],[0,0,0,120000]]){
 const html=ctx.taxOverviewHtml44(final,actual,forecast,threshold);
 assert.ok(html.includes('<strong>'+fmt(final)+'</strong>'));
 assert.ok(html.includes('<span>Dane wpisane</span><b>'+fmt(actual)));
 assert.ok(html.includes('<span>Dodatkowa prognoza</span><b>'+fmt(forecast)));
 assert.ok(html.includes(fmt(Math.abs(threshold-final))));
 assert.equal(actual+forecast,final);
}
const chart=src.slice(src.indexOf('function chartSvg('),src.indexOf('function renderTax44('));
assert.ok(!chart.includes('stroke-dasharray'));
assert.equal((chart.match(/<polyline /g)||[]).length,3);
console.log('PASS — suma roczna, dane wpisane i prognoza, przekroczenie progu oraz uproszczony wykres.');
