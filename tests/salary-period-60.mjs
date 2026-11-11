import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const src=fs.readFileSync('v60salaryperiod.js','utf8');
const html=fs.readFileSync('index.html','utf8');
new Function(src);

const blank=()=>Array.from({length:12},()=>({net:null,bonus:null,locked:true}));
const years={
  2026:{salary:blank()},
  2027:{salary:blank()}
};
// Styczeń 2027 = wypłata za grudzień 2026.
years[2027].salary[0]={net:7000,bonus:0,locked:true};

let ready=null,saves=0;
const ctx={
  console,Intl,Date,
  S:{selectedYear:2026,years,finance:{}},
  save(){saves++},
  Y(){return ctx.S.years[String(ctx.S.selectedYear)]},
  sal(){
    const rows=ctx.S.years[String(ctx.S.selectedYear)].salary.map((r,i)=>({
      total:(+r.net||0)+(+r.bonus||0),
      actual:((+r.net||0)+(+r.bonus||0))>0,
      i
    }));
    return{rows};
  },
  document:{
    getElementById(){return null},
    querySelectorAll(){return[]},
    createElement(){return {style:{},appendChild(){}}},
    head:{appendChild(){}}
  },
  addEventListener(name,fn){if(name==='finance-modules-ready')ready=fn}
};
ctx.window=ctx;
vm.createContext(ctx);
vm.runInContext(src,ctx);

assert.ok(ready,'Brak inicjalizacji warstwy okresu pracy');
ready();

assert.equal(ctx.mfSalaryPeriod61.defaultWorkKey(2027,0),'2026-12');
assert.equal(years[2027].salary[0].workMonth,'2026-12','Migracja powinna przypisać styczeń do grudnia');
assert.ok(saves>0,'Migracja powinna zostać zapisana');

const dec=ctx.mfSalaryPeriod61.salaryForWork('2026-12');
assert.equal(dec.paymentKey,'2027-01');
assert.equal(dec.workKey,'2026-12');
assert.equal(dec.result.total,7000);
assert.equal(dec.result.actual,true);

const sum2026=ctx.mfSalaryPeriod61.workSummary(2026);
assert.equal(sum2026.rows[11].workKey,'2026-12');
assert.equal(sum2026.rows[11].paymentKey,'2027-01');
assert.equal(sum2026.rows[11].actual,true);
assert.equal(sum2026.rows[11].total,7000);
assert.equal(sum2026.total,7000);

// Cashflow pozostaje w miesiącu wypłaty — bazowy model nadal trzyma rekord w styczniu 2027.
assert.equal(years[2026].salary[11].net,null);
assert.equal(years[2027].salary[0].net,7000);

assert.match(html,/v60salaryperiod\.js\?v=5840/);
assert.match(html,/Moje Finanse 5\.8\.4/);
assert.ok(src.includes('Cashflow i PIT liczą miesiąc faktycznej wypłaty'));

console.log('PASS — 5.8.4: styczeń 2027 może być wypłatą za grudzień 2026 bez przesuwania cashflow i PIT.');
