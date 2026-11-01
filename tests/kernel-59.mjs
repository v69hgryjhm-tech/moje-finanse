import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const src=fs.readFileSync('v59kernel.js','utf8');
const html=fs.readFileSync('index.html','utf8');
new Function(src);

let ready=null, salary=0, accounting=0, business=0, loans=0, legacy=0;
const mk=()=>({classList:{toggle(){},contains(){return false}},dataset:{}});
const ctx={
 console,performance:{now:()=>0},scrollTo(){},
 document:{
  title:'',
  documentElement:{dataset:{}},
  querySelector(sel){if(sel==='.view.active')return{id:'home'};if(sel==='.top small')return{innerHTML:''};return null},
  querySelectorAll(){return [mk(),mk()]},
  getElementById(){return null}
 },
 S:{selectedYear:2026},
 render(){legacy++},show(){},
 renderSalaryLocal37(){salary++},
 renderAccounting50(){accounting++},
 renderBusinessPlus44(){business++},
 loans(){loans++},
 addEventListener(name,fn){if(name==='finance-modules-ready')ready=fn}
};
ctx.window=ctx;vm.createContext(ctx);vm.runInContext(src,ctx);
assert.ok(ready,'Kernel nie instaluje się po finance-modules-ready');
ready();

ctx.show('salary');assert.equal(salary,1);assert.equal(legacy,0);
ctx.show('accounting');assert.equal(accounting,1);assert.equal(legacy,0);
ctx.show('businessplus');assert.equal(business,1);assert.equal(legacy,0);
ctx.show('loans');assert.equal(loans,1);assert.equal(legacy,0);

assert.match(html,/v59kernel\.js\?v=5810/);
assert.doesNotMatch(html,/v58performance\.js/);
assert.match(html,/Moje Finanse 5\.8\.1/);
assert.ok(!fs.readFileSync('v14b2.js','utf8').trimEnd().endsWith('render();'),'v14b2 nadal robi wczesny render');

console.log('PASS — 5.8: centralny kernel renderuje tylko aktywny widok, v58 jest odpięty, a wczesny render usunięty.');
