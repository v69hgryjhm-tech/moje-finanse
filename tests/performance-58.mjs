import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const src=fs.readFileSync('v58performance.js','utf8');
const html=fs.readFileSync('index.html','utf8');
new Function(src);

let ready=null,fullCalls=0,missionCalls=0,accountingCalls=0,businessCalls=0;
const node=()=>({classList:{toggle(){}},dataset:{}});
const ctx={
 console,
 performance:{now:()=>0},
 scrollTo(){},
 document:{
  querySelectorAll(){return [node(),node()]},
  getElementById(){return null},
  createElement(){return {className:'',innerHTML:'',appendChild(){}}}
 },
 render(){fullCalls++},
 show(){throw new Error('stare show nie powinno być używane po instalacji trybu szybkiego')},
 mfMission57:{render(){missionCalls++}},
 renderAccounting50(){accountingCalls++},
 renderBusinessPlus44(){businessCalls++},
 addEventListener(name,fn){if(name==='finance-modules-ready')ready=fn}
};
ctx.window=ctx;
vm.createContext(ctx);
vm.runInContext(src,ctx);
assert.ok(ready,'Brak instalacji trybu szybkiego');
ready();

ctx.show('home');
assert.equal(fullCalls,0,'Start nie powinien robić pełnego renderu');
assert.equal(missionCalls,1);

ctx.show('accounting');
assert.equal(fullCalls,0,'Dla księgowej nie powinno robić pełnego renderu');
assert.equal(accountingCalls,1);

ctx.show('businessplus');
assert.equal(fullCalls,0,'Firma+ nie powinno robić pełnego renderu');
assert.equal(businessCalls,1);

ctx.show('control');
assert.equal(fullCalls,1,'Centrum dowodzenia może wymusić pełny render');
assert.equal(ctx.__mfPerf58.navigations,4);
assert.equal(ctx.__mfPerf58.fullRenders,1);

assert.match(html,/v58performance\.js\?v=5700/);
assert.match(html,/Moje Finanse 5\.7\.0/);

const v41=fs.readFileSync('v41suite.js','utf8');
const v42=fs.readFileSync('v42insights.js','utf8');
const v56=fs.readFileSync('v56autopilot.js','utf8');
const v57=fs.readFileSync('v57mission.js','utf8');
assert.ok(!v41.includes("window.show=fn}inject()}"),'v41 nadal renderuje się dodatkowo przy starcie');
assert.ok(!v42.includes("window.show=fn}renderAll42()}"),'v42 nadal renderuje się dodatkowo przy starcie');
assert.ok(!v56.includes("installFinalGuard56();safe56('start 5.5',renderAll56)"),'Autopilot nadal robi dodatkowy pełny render przy starcie');
assert.ok(!v57.includes("{install57();renderMission57()}"),'Mission Control nadal robi dodatkowy render przy starcie');

console.log('PASS — 5.7: szybka nawigacja omija pełny render, a startup nie wykonuje zbędnych renderów warstwowych.');
