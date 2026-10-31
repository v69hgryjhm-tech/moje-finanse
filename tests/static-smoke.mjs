import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const html=read('index.html');
const scripts=[...html.matchAll(/<script[^>]+src="([^"?]+)/g)].map(m=>m[1]);
const styles=[...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"?]+)/g)].map(m=>m[1]);
const failures=[];

for(const file of [...scripts,...styles,'manifest.json']){
  if(!fs.existsSync(path.join(root,file))) failures.push('Brak pliku: '+file);
}
let allJs='';
for(const file of scripts){
  const src=read(file); allJs+='\n'+src;
  try{ new Function(src); }
  catch(e){ failures.push('Błąd składni '+file+': '+e.message); }
}
try{ JSON.parse(read('manifest.json')); }catch(e){ failures.push('manifest.json: '+e.message); }

const requiredIds=['home','salary','loans','businessplus','control','lab','investments','review','autopilot','capacity','watch','tax','settings','earningsChart','homeTaxSvg','taxSvg','loanList','businessPlusBody','controlBody51','labBody55','investmentsBody55','reviewBody55','autopilotBody56','capacityBody56','watchBody56'];
for(const id of requiredIds){
  if(!html.includes('id="'+id+'"')) failures.push('Brak kontenera #'+id);
}
const requiredGlobals=['show','changeYear','lockAll','loanModal','saveSettings','exportData','importData'];
for(const fn of requiredGlobals){
  const ok=allJs.includes('function '+fn+'(')||allJs.includes('window.'+fn+'=')||allJs.includes('window.'+fn+' =');
  if(!ok) failures.push('Nie znaleziono globalnej funkcji '+fn);
}
const forbidden=['v35business.js','v36axis.js','v40app.js','v40planning.js','v40ui.js','v20finance.js','v21life.js'];
for(const file of forbidden) if(scripts.includes(file)) failures.push('Legacy nadal ładowany: '+file);

if(!html.includes('data-v="businessplus"')) failures.push('Brak Firma+ w dolnej nawigacji');
if(!html.includes('v47ux.js')) failures.push('Brak końcowej warstwy UX');
if(!html.includes('v51control.js')) failures.push('Brak Centrum finansowego 5.0');
if(!html.includes('v52planner.js')) failures.push('Brak planera finansowego 5.1');
if(!html.includes('v53command.js')) failures.push('Brak Centrum dowodzenia 5.2');
if(!html.includes('v54ops.js')) failures.push('Brak warstwy operacyjnej 5.3');
if(!html.includes('v55lab.js')) failures.push('Brak Laboratorium i strategii 5.4');
if(!html.includes('v56autopilot.js')) failures.push('Brak Autopilota 5.5');
if(!html.includes("show('control')")) failures.push('Brak wejścia do Centrum dowodzenia');
if(!html.includes('Moje Finanse 5.5.1')) failures.push('Nieprawidłowa wersja aplikacji');
if(!read('v14a.js').includes('moje-finanse-v14')) failures.push('Zmieniono główny klucz danych localStorage');

console.log('Aktywne JS:',scripts.length);
console.log('Aktywne CSS:',styles.length);
if(failures.length){
  console.error('\nFAIL');
  failures.forEach(x=>console.error(' - '+x));
  process.exit(1);
}
console.log('\nPASS — składnia, pliki, kontenery, podstawowe handlery i storage są spójne.');
