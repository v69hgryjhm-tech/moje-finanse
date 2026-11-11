import fs from 'node:fs';
import assert from 'node:assert/strict';

const lazy=fs.readFileSync('v61loanslazy.js','utf8');
const loan17=fs.readFileSync('v17loan.js','utf8');
const kernel=fs.readFileSync('v59kernel.js','utf8');
const html=fs.readFileSync('index.html','utf8');

new Function(lazy);
new Function(loan17);

assert.match(html,/v61loanslazy\.js\?v=5840/);
assert.match(html,/Moje Finanse 5\.8\.4/);

assert.ok(lazy.includes('uiOpen61'),'Brak stanu rozwinięcia konkretnego kredytu');
assert.ok(lazy.includes('renderLoanCardLazy61'),'Brak lokalnego renderera pojedynczej karty');
assert.ok(lazy.includes('requestAnimationFrame(()=>renderLoanCardLazy61(i))'),'Rozwinięcie nie jest odroczone/lokalne');
assert.ok(lazy.includes('actualStats61'),'Lekka lista nie ma własnych lekkich statystyk historii');

const summaryStart=lazy.indexOf('function summary61');
const summaryEnd=lazy.indexOf('function renderLoanCardLazy61');
const summary=lazy.slice(summaryStart,summaryEnd);
assert.ok(!summary.includes('timeline('),'Zwinięta karta nadal liczy pełny timeline');

assert.ok(loan17.includes('uiScheduleOpen?cards'),'Harmonogram nie jest lazy');
assert.ok(loan17.includes('toggleLoanSchedule17'),'Brak osobnego otwierania harmonogramu');
assert.ok(loan17.includes('renderLoanCard17=loanCard'),'Brak eksportu renderera pojedynczego kredytu');

assert.ok(kernel.includes("safe59('Kredyty lazy'"),'Kernel nie korzysta z lekkiego renderera Kredytów');
assert.ok(!kernel.includes("safe59('Kredyty planner'"),'Kernel nadal odpala ciężką analizę planera przy wejściu w Kredyty');
assert.ok(!kernel.includes("safe59('Kredyty control'"),'Kernel nadal odpala ciężką analizę control przy wejściu w Kredyty');

console.log('PASS — 5.8.4: Kredyty używają lekkiej listy, lokalnego rozwijania i lazy harmonogramu.');
