import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const src=fs.readFileSync('v44tax.js','utf8');
const helper=src.slice(src.indexOf('function taxOverviewHtml44('),src.indexOf('function chartSvg('));
const fmt=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(v);
const ctx={PLN:fmt,S:{selectedYear:2026}};vm.createContext(ctx);vm.runInContext(helper,ctx);
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

const engine=src.slice(src.indexOf('function combined('),src.indexOf('window.mfCombinedTax44='));
let employment=Array.from({length:12},(_,i)=>({base:i<10?9000:10000,actual:i<10}));
const runtime={S:{years:{2026:{company:[]}},settings:{threshold:120000}},Date,N:v=>+v||0,R2:v=>Math.round(v*100)/100,rowActual:()=>false,companySummary:()=>({taxable:0}),employmentRows:()=>employment};
vm.createContext(runtime);vm.runInContext(engine,runtime);
let projection=runtime.combined(2026);
assert.equal(projection.rows[11].combined,110000);
assert.equal(projection.rows[11].employmentActual,90000);
assert.equal(projection.rows[11].employmentForecast,20000);
employment[0].base=50000;
projection=runtime.combined(2026);
assert.equal(projection.rows[11].combined,151000);
assert.ok(projection.rows.some(r=>r.combined>=projection.threshold));
const chartCtx={N:v=>+v||0,SHORT:Array.from({length:12},(_,i)=>String(i+1))};
vm.createContext(chartCtx);
vm.runInContext(src.slice(src.indexOf('function niceStep('),src.indexOf('function employmentReconciliation44('))+chart,chartCtx);
assert.ok(chartCtx.chartSvg(projection).includes('200 tys.'));
assert.ok(chartCtx.chartSvg(projection).includes('31.12 — 151 tys.'));
console.log('PASS — year-end projection reacts to edited entries and chart axis expands above threshold.');
