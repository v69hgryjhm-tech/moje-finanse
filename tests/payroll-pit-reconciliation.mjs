import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const nodes=new Map([['salary',{}],['salarySummary28',{}]]);
const ctx={console,Intl,Date,S:{selectedYear:2026,settings:{threshold:120000,reduction:3600,kup:300,ppkEmp:2,ppkEr:1.5},finance:{payrollProfile202607:true},years:{2026:{salary:Array.from({length:12},()=>({net:null,bonus:null,locked:true}))}}},save(){},avg:a=>a.length?a.reduce((s,n)=>s+n,0)/a.length:0,hist:()=>[5000],document:{getElementById:id=>nodes.get(id)||null,createElement:()=>({}),querySelectorAll:()=>[],head:{appendChild(){}}}};
ctx.window=ctx;ctx.Y=()=>ctx.S.years[ctx.S.selectedYear];
ctx.S.years[2026].salary[0].net=5000;
ctx.S.years[2026].salary[2].net=6000;
vm.createContext(ctx);
const ppk=fs.readFileSync('v27ppk.js','utf8').replace('window.fg=fg35;','window.testApply35=apply35;window.fg=fg35;');
vm.runInContext(ppk,ctx);vm.runInContext(fs.readFileSync('v37payroll.js','utf8'),ctx);
const tax=fs.readFileSync('v44tax.js','utf8'),helper=tax.slice(tax.indexOf('function employmentReconciliation44'),tax.indexOf('function employmentReconciliationHtml44'));
vm.runInContext("const N=v=>+v||0,R2=v=>Math.round((N(v)+Number.EPSILON)*100)/100;"+helper,ctx);
const rows=ctx.sal().rows;
for(const actual of [true,false]){
 const t=ctx.employmentReconciliation44(rows,actual);
 const expected=rows.filter(r=>r.actual===actual).reduce((a,r)=>a+r.base,0);
 assert.equal(t.base,expected);
 assert.ok(Math.abs(t.gross-t.social-t.kup+t.ppk+t.rounding-t.base)<0.001);
}
ctx.testApply35();
const fmt=n=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
const actual=ctx.employmentReconciliation44(rows,true);
assert.ok(nodes.get('salarySummary28').innerHTML.includes(fmt(actual.gross)));
assert.ok(nodes.get('salarySummary28').innerHTML.includes('PODSTAWA PIT — TYLKO WPISANE</small><b>'+fmt(actual.base)));
assert.notEqual(actual.base,rows[2].y,'Luka w miesiącach nie może doliczać prognozy do wpisanej podstawy');
console.log('PASS — wspólny silnik brutto i PIT, rozbicie odliczeń oraz oddzielenie prognozy pustych miesięcy.');
