import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const src=fs.readFileSync('v62loanengine.js','utf8');
new Function(src);

const loan={
 name:'Test',loanType:'interest',balance:30000,originalBalance:30000,payment:441.64,rate:8.9,months:90,
 extraMonthly:0,oneOff:0,asOfDate:'2026-10-27',dueDay:27,overpayMode:'shorten',
 history:[{month:'2026-11',paid:false,regularPaid:0,isOverpayment:true,extra:1000,extraPaymentDate:'2026-11-11'}]
};
const ctx={console,Date,Intl,TODAY:'2026-11-11',S:{loans:[loan]},save(){},document:{getElementById(){return null}}};
ctx.window=ctx;vm.createContext(ctx);vm.runInContext(src,ctx);

let t=ctx.loanTimeline15(loan,false);
assert.equal(t.actual.length,1);
assert.equal(t.actual[0].eventType,'extra');
assert.equal(t.actual[0].date.toISOString().slice(0,10),'2026-11-11');
assert.equal(Math.round(t.actual[0].balance*100)/100,29000);
assert.equal(t.actual[0].interest,0,'Nadpłata nie może udawać zapłaty odsetek');
assert.equal(t.forecast[0].date.toISOString().slice(0,10),'2026-11-27','Rata ma pozostać na 27.11');
assert.equal(t.forecast[0].month,'2026-11');
assert.ok(t.forecast[0].interest>220&&t.forecast[0].interest<225,'Odsetki powinny uwzględniać dwa salda przed i po nadpłacie');
assert.ok(t.forecast[0].principal>215&&t.forecast[0].principal<222,'Kapitał z raty powinien być rata minus prawidłowe odsetki');

loan.history=[{month:'2026-11',paid:true,regularPaid:441.64,isOverpayment:true,extra:1000,regularPaymentDate:'2026-11-27',extraPaymentDate:'2026-11-11'}];
t=ctx.loanTimeline15(loan,false);
assert.equal(t.actual.length,2);
assert.equal(t.actual[0].eventType,'extra');
assert.equal(t.actual[1].eventType,'regular');
assert.equal(t.actual[0].date.toISOString().slice(0,10),'2026-11-11');
assert.equal(t.actual[1].date.toISOString().slice(0,10),'2026-11-27');
const totals=ctx.loanTotals15(loan);
assert.equal(Math.round(totals.paid*100)/100,1441.64);
assert.equal(totals.extra,1000);
assert.ok(totals.interest>220&&totals.interest<225);
assert.ok(totals.principal>1215&&totals.principal<1222);
assert.ok(ctx.loanCurrentPoint15(loan).balance<29000);

const ui=fs.readFileSync('v17loan.js','utf8');
assert.ok(ui.includes('Data raty'));
assert.ok(ui.includes('Data nadpłaty'));
assert.ok(ui.includes('rdate_'));
assert.ok(ui.includes('edate_'));

const lazy=fs.readFileSync('v61loanslazy.js','utf8');
assert.ok(lazy.includes("editLoanModal47('+i+')"),'Każda zwinięta karta musi mieć Edytuj');
assert.ok(lazy.includes("eb.textContent='✎ Edytuj'"),'Każda rozwinięta karta musi dostać Edytuj');

console.log('PASS — rata i nadpłata mają osobne daty, kapitał/odsetki są liczone chronologicznie, a edycja jest na każdej karcie.');
