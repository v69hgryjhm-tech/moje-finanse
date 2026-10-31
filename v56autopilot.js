/* Moje Finanse 5.5 — Autopilot finansowy */
(function(){
'use strict';
const VERSION='5.5.1',G=id=>document.getElementById(id),N=v=>+v||0,CL=(v,a,b)=>Math.max(a,Math.min(b,v));
const PLN=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(N(v));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const MN=['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru'];
const planner=()=>window.mfPlanner52||null,control=()=>window.mfControl51||null,command=()=>window.mfCommand53||null,ops=()=>window.mfOps54||null,lab=()=>window.mfLab55||null;
function key(y,m){return String(y)+'-'+String(m+1).padStart(2,'0')}
function nowKey(){let d=new Date();return key(d.getFullYear(),d.getMonth())}
function parseKey(k){let [y,m]=String(k||'').split('-').map(Number);return{y:y||new Date().getFullYear(),m:Math.max(0,(m||1)-1)}}
function addMonths(k,n){let {y,m}=parseKey(k),d=new Date(y,m+n,1,12);return key(d.getFullYear(),d.getMonth())}
function fmtMonth(k){let p=parseKey(k);return MN[p.m]+' '+p.y}
function ensure56(){
 if(typeof S==='undefined')return false;
 S.finance||={};S.finance.auto56||={};let a=S.finance.auto56;
 a.strategy=a.strategy||'balanced';a.goalBudget=Math.max(0,N(a.goalBudget));a.shockAmount=Math.max(0,N(a.shockAmount)||5000);
 a.capacityPrinters=Math.max(1,Math.round(N(a.capacityPrinters)||1));a.capacityHours=Math.max(1,N(a.capacityHours)||100);
 a.bestRefiOffer=N(a.bestRefiOffer);a.watchlist=Array.isArray(a.watchlist)?a.watchlist:[];a.scoreHistory=a.scoreHistory||{};
 return true
}
function save56(){try{save()}catch{localStorage.setItem('moje-finanse-v14',JSON.stringify(S))}}
function setVersion56(){
 document.title='Moje Finanse '+VERSION;
 let h=document.querySelector('.top small');
 if(h)h.innerHTML='<span id="headerYear">'+(typeof S!=='undefined'?S.selectedYear:'')+'</span> • wersja '+VERSION;
 document.documentElement.dataset.appVersion=VERSION
}
const ERR56=window.__mf56RuntimeErrors||(window.__mf56RuntimeErrors=[]);
function error56(scope,e){
 let msg=String(e?.message||e||'Nieznany błąd'),row={scope,msg,stamp:new Date().toISOString()};
 ERR56.push(row);if(ERR56.length>30)ERR56.splice(0,ERR56.length-30);
 try{console.error('[MF 5.5] '+scope,e)}catch{}
 return row
}
function fallback56(id,title,e){
 let h=G(id);if(!h)return;
 h.innerHTML='<section class="card runtimeError56"><div class="title">⚠ '+esc(title)+'</div><p>Moduł nie wyrenderował się poprawnie, ale błąd został odizolowany i nie blokuje reszty aplikacji.</p><code>'+esc(String(e?.message||e||'Nieznany błąd'))+'</code><div class="actions"><button class="btn primary" onclick="repairViews56()">Spróbuj ponownie</button><button class="btn" onclick="show(\'settings\')">Diagnostyka</button></div></section>'
}
function safe56(scope,fn,fallbackId='',fallbackTitle='Moduł'){
 try{return fn()}catch(e){error56(scope,e);if(fallbackId)fallback56(fallbackId,fallbackTitle,e);return null}
}
function filled56(id,title){
 let h=G(id);if(!h)return false;
 if(String(h.innerHTML||'').trim())return true;
 let e=new Error('Renderer zakończył się bez zawartości');
 error56('pusty kontener '+id,e);fallback56(id,title,e);return false
}
function loanBalance56(l){try{return N(window.loanCurrentPoint15?.(l)?.balance)}catch{return N(l?.balance)}}
function strategy56(){
 const map={
  balanced:{label:'Zbalansowany',emergency:.25,debt:.35,invest:.20,goals:.10,business:.10},
  safety:{label:'Bezpieczeństwo',emergency:.55,debt:.20,invest:.10,goals:.10,business:.05},
  debt:{label:'Dług najpierw',emergency:.15,debt:.65,invest:.10,goals:.05,business:.05},
  wealth:{label:'Majątek',emergency:.15,debt:.20,invest:.45,goals:.15,business:.05},
  growth:{label:'Rozwój MOHE',emergency:.15,debt:.20,invest:.20,goals:.10,business:.35}
 };
 return map[S.finance.auto56.strategy]||map.balanced
}
window.setStrategy56=function(v){ensure56();S.finance.auto56.strategy=v;save56();renderAutopilot56();renderControl56();renderHome56()};
function allocation56(k){
 let p=planner()?.monthPlan?.(k);if(!p)return null;
 let raw=Math.max(0,N(p.free)),reserve=Math.min(raw,Math.max(0,N(ops()?.dueReserveNow?.(k)?.total))),available=Math.max(0,raw-reserve),s=strategy56();
 let weights={emergency:s.emergency,debt:s.debt,invest:s.invest,goals:s.goals,business:s.business};
 let saved=N(S.finance.emergencySavings),gap=Math.max(0,N(p.mi.essential)*3-saved),hasDebt=(S.loans||[]).some(l=>loanBalance56(l)>0),hasGoals=(S.finance.goals||[]).some(g=>N(g.target)>N(g.current));
 if(!gap){weights.debt+=weights.emergency*.55;weights.invest+=weights.emergency*.45;weights.emergency=0}
 if(!hasDebt){weights.invest+=weights.debt*.65;weights.goals+=weights.debt*.35;weights.debt=0}
 if(!hasGoals){weights.invest+=weights.goals;weights.goals=0}
 let sum=Object.values(weights).reduce((a,b)=>a+b,0)||1;Object.keys(weights).forEach(x=>weights[x]/=sum);
 let out={};Object.keys(weights).forEach(x=>out[x]=available*weights[x]);
 return{k,raw,reserve,available,strategy:s,weights,out,emergencyGap:gap}
}
function allocCard56(k){
 let x=allocation56(k);if(!x)return'';
 let labels={emergency:'Poduszka',debt:'Nadpłata długu',invest:'Inwestycje',goals:'Cele',business:'Rozwój MOHE'};
 return '<section class="card"><div class="title">Autopilot — podział nadwyżki <span class="pill">'+esc(x.strategy.label)+'</span></div><div class="strategyBtns56">'+[
  ['balanced','Zbalansowany'],['safety','Bezpieczeństwo'],['debt','Dług'],['wealth','Majątek'],['growth','MOHE']
 ].map(z=>'<button class="btn '+(S.finance.auto56.strategy===z[0]?'primary':'')+'" onclick="setStrategy56(\''+z[0]+'\')">'+z[1]+'</button>').join('')+'</div><div class="allocTop56"><div><small>NADWYŻKA</small><b>'+PLN(x.raw)+'</b></div><div><small>REZERWA ROCZNA</small><b>'+PLN(x.reserve)+'</b></div><div><small>DO PODZIAŁU</small><b>'+PLN(x.available)+'</b></div></div>'+(x.available?'<div class="allocGrid56">'+Object.keys(x.out).map(k2=>'<div><small>'+labels[k2]+'</small><b>'+PLN(x.out[k2])+'</b><span>'+Math.round(x.weights[k2]*100)+'%</span></div>').join('')+'</div>':'<p class="muted">Brak dodatniej nadwyżki do automatycznej alokacji. Autopilot nie proponuje finansowania celów deficytem.</p>')+'<p class="muted">To rekomendacja planistyczna — aplikacja nie wykonuje żadnych przelewów ani nie zmienia sald.</p></section>'
}
function stress56(k){
 let p=planner()?.monthPlan?.(k);if(!p)return[];
 let salary=N(p.inc.salary),company=N(p.inc.company),essential=N(p.mi.essential),saved=N(S.finance.emergencySavings),shock=N(S.finance.auto56.shockAmount);
 const calc=(name,income,cost,oneOff=0)=>{
  let liquid=Math.max(0,saved-oneOff),def=Math.max(0,cost-income),runway=def>0?liquid/def:Infinity,margin=income-cost;
  return{name,income,cost,oneOff,margin,runway,liquid}
 };
 return[
  calc('Etat -20%',salary*.8+company,essential),
  calc('Utrata etatu',company,essential),
  calc('Firma -30%',salary+company*.7,essential),
  calc('Firma -50%',salary+company*.5,essential),
  calc('Koszty +20%',salary+company,essential*1.2),
  calc('Duży wydatek',salary+company,essential,shock),
  calc('Kryzys łączony',salary*.7+company*.5,essential*1.15,shock)
 ]
}
function saveStress56(){S.finance.auto56.shockAmount=Math.max(0,N(G('shock56')?.value));save56();renderStress56()}
window.saveStress56=saveStress56;
function stressHtml56(k){
 let rows=stress56(k);
 return '<section class="card"><div class="title">Stress Test 360° <span class="pill">odporność finansowa</span></div><div class="form stressForm56"><label>Duży nieplanowany wydatek<input id="shock56" type="number" step="500" value="'+N(S.finance.auto56.shockAmount)+'"></label><button class="btn" onclick="saveStress56()">Przelicz</button></div><div class="stressTable56"><div class="stressHead56"><span>Scenariusz</span><span>Dochód</span><span>Minimum</span><span>Margines</span><span>Runway poduszki</span></div>'+rows.map(r=>'<div class="stressRow56"><b>'+esc(r.name)+'</b><span>'+PLN(r.income)+'</span><span>'+PLN(r.cost)+(r.oneOff?' + '+PLN(r.oneOff):'')+'</span><strong class="'+(r.margin>=0?'green':'red')+'">'+PLN(r.margin)+'</strong><em class="'+(r.runway>=6?'good56':r.runway>=3?'mid56':'bad56')+'">'+(Number.isFinite(r.runway)?r.runway.toFixed(1)+' mies.':'bez deficytu')+'</em></div>').join('')+'</div></section>'
}
function debtSim56(extra){
 let loans=(S.loans||[]).map(l=>({name:l.name||'Kredyt',balance:loanBalance56(l),rate:N(l.rate),payment:Math.max(0,N(l.payment))})).filter(x=>x.balance>.01);
 if(!loans.length)return{months:0,interest:0,totalDebt:0,end:null};
 let totalDebt=loans.reduce((a,x)=>a+x.balance,0),budget=loans.reduce((a,x)=>a+x.payment,0)+Math.max(0,N(extra)),interest=0,month=0,now=new Date();
 while(loans.some(x=>x.balance>.01)&&month<600){
  month++;
  loans.forEach(x=>{if(x.balance>.01){let i=x.balance*x.rate/1200;interest+=i;x.balance+=i}});
  let used=0;
  loans.forEach(x=>{if(x.balance>.01){let pay=Math.min(x.balance,x.payment);x.balance-=pay;used+=pay}});
  let rem=Math.max(0,budget-used);
  while(rem>.01){
   let active=loans.filter(x=>x.balance>.01).sort((a,b)=>b.rate-a.rate||b.balance-a.balance);if(!active.length)break;
   let t=active[0],pay=Math.min(t.balance,rem);t.balance-=pay;rem-=pay
  }
 }
 let end=new Date(now.getFullYear(),now.getMonth()+month,1);
 return{months:month,interest,totalDebt,end,budget}
}
function debtFreedomHtml56(){
 let extras=[0,300,500,1000],rows=extras.map(x=>({extra:x,...debtSim56(x)})),base=rows[0],informal=(S.finance.informalDebts||[]).reduce((a,d)=>a+Math.max(0,N(d.amount)-(d.payments||[]).reduce((s,p)=>s+N(p.amount),0)),0);
 return '<section class="card"><div class="title">Droga do zera długu <span class="pill">metoda avalanche</span></div><p class="muted">Symulacja utrzymuje łączny miesięczny budżet spłaty i po zamknięciu kredytu przekierowuje zwolnioną ratę na najdroższy aktywny kredyt. Nie zmienia prawdziwych harmonogramów.</p><div class="debtFreedom56">'+rows.map(r=>'<div><small>'+(r.extra?'+'+PLN(r.extra)+' / MIES.':'OBECNY BUDŻET')+'</small><b>'+(r.months?new Date(r.end).toLocaleDateString('pl-PL',{month:'short',year:'numeric'}):'brak długu')+'</b><span>'+r.months+' mies. • odsetki '+PLN(r.interest)+'</span>'+(r.extra&&base.months?'<strong>'+Math.max(0,base.months-r.months)+' mies. szybciej • '+PLN(Math.max(0,base.interest-r.interest))+' mniej odsetek</strong>':'')+'</div>').join('')+'</div>'+(informal?'<p class="muted">Poza symulacją bankową pozostaje '+PLN(informal)+' zobowiązań 0% / bez terminu.</p>':'')+'</section>'
}
function timeline56(){
 let start=nowKey(),rows=[],loanEnds={};
 (S.loans||[]).forEach(l=>{try{let t=window.loanTimeline15?.(l,true),d=t?.rows?.at(-1)?.date;if(d)loanEnds[key(d.getFullYear(),d.getMonth())]=(loanEnds[key(d.getFullYear(),d.getMonth())]||[]).concat({name:l.name||'Kredyt',payment:N(l.payment)})}catch{}});
 for(let i=0;i<36;i++){
  let k=addMonths(start,i),p=planner()?.monthPlan?.(k),{y,m}=parseKey(k),events=[];
  (S.finance.goals||[]).forEach(g=>{if(g.due===k)events.push('🎯 termin celu: '+(g.name||'Cel'))});
  (S.finance.calendarEvents||[]).forEach(e=>{if(e.month===k)events.push('🗓 '+(e.name||'Wydarzenie')+(N(e.amount)?' '+PLN(e.amount):''))});
  (S.finance.ops54?.annualCosts||[]).forEach(c=>{if(c.active===false)return;let due=N(c.month)===m+1&&(c.repeat!==false||N(c.year)===y);if(due)events.push('📌 '+(c.name||'Koszt roczny')+' '+PLN(c.amount))});
  (S.finance.expenses||[]).forEach(e=>{if(e.kind==='once'&&e.month===k)events.push('🧾 '+(e.name||'Wydatek')+' '+PLN(e.amount))});
  (loanEnds[k]||[]).forEach(x=>events.push('✅ koniec kredytu: '+x.name+' • uwalnia '+PLN(x.payment)+'/m'));
  rows.push({k,free:N(p?.free),reserve:N(p?.tr?.total),events})
 }
 return rows
}
function timelineHtml56(){
 let rows=timeline56();
 return '<section class="card"><div class="title">Timeline finansowy — 36 miesięcy <span class="pill">co nadchodzi</span></div><div class="timeline56">'+rows.map((r,i)=>'<div class="timelineRow56 '+(r.events.length?'hasEvent':'')+'"><div><small>'+(i+1)+'</small><b>'+fmtMonth(r.k)+'</b></div><span class="'+(r.free>=0?'green':'red')+'">nadwyżka '+PLN(r.free)+'</span><span>rezerwa firmy '+PLN(r.reserve)+'</span><div class="timelineEvents56">'+(r.events.length?r.events.map(e=>'<em>'+esc(e)+'</em>').join(''):'<small>bez dodatkowych zdarzeń</small>')+'</div></div>').join('')+'</div></section>'
}
function changes56(k){
 let cur=planner()?.monthPlan?.(k),prev=planner()?.monthPlan?.(addMonths(k,-1));if(!cur||!prev)return[];
 let score=command()?.financialScore?.(k),scorePrev=command()?.financialScore?.(addMonths(k,-1));
 return[
  {name:'Dochód',cur:N(cur.inc.total),prev:N(prev.inc.total),money:true},
  {name:'Firma',cur:N(cur.inc.company),prev:N(prev.inc.company),money:true},
  {name:'Koszty stałe + raty',cur:N(cur.mi.essential),prev:N(prev.mi.essential),money:true,inverse:true},
  {name:'Nadwyżka',cur:N(cur.free),prev:N(prev.free),money:true},
  {name:'Raty',cur:N(cur.mi.loans),prev:N(prev.mi.loans),money:true,inverse:true},
  {name:'Score',cur:N(score?.total),prev:N(scorePrev?.total),money:false}
 ]
}
function changesHtml56(k){
 let rows=changes56(k);
 return '<section class="card"><div class="title">Co zmieniło się od poprzedniego miesiąca?</div><div class="changeGrid56">'+rows.map(x=>{let d=x.cur-x.prev,p=x.prev?d/Math.abs(x.prev)*100:0,good=x.inverse?d<=0:d>=0;return'<div><small>'+x.name+'</small><b>'+(x.money?PLN(x.cur):x.cur.toFixed(0)+'/100')+'</b><span class="'+(good?'green':'red')+'">'+(d>=0?'+':'')+(x.money?PLN(d):d.toFixed(0))+(x.money&&x.prev?' • '+(p>=0?'+':'')+p.toFixed(1)+'%':'')+'</span></div>'}).join('')+'</div></section>'
}
function goalOptimizer56(k){
 let p=planner()?.monthPlan?.(k),budget=N(S.finance.auto56.goalBudget)||Math.max(0,N(p?.free)*.25),now=new Date(),goals=[];
 (S.finance.goals||[]).forEach((g,i)=>{
  let remain=Math.max(0,N(g.target)-N(g.current));if(!remain)return;
  let months=60;if(g.due){let [yy,mm]=String(g.due).split('-').map(Number);months=Math.max(1,(yy-now.getFullYear())*12+(mm-1-now.getMonth()))}
  let need=remain/months,current=N(g.monthly),gap=Math.max(0,need-current),urgency=gap*(1+1/months);
  goals.push({i,g,remain,months,need,current,gap,urgency,extra:0})
 });
 let left=budget;goals.sort((a,b)=>b.urgency-a.urgency);
 for(const x of goals){let take=Math.min(left,x.gap||left);x.extra=take;left-=take;if(left<=.01)break}
 if(left>0&&goals.length){goals.sort((a,b)=>a.months-b.months);goals[0].extra+=left;left=0}
 return{budget,goals,left}
}
window.saveGoalBudget56=function(){S.finance.auto56.goalBudget=Math.max(0,N(G('goalBudget56')?.value));save56();renderAutopilot56()};
function goalsHtml56(k){
 let x=goalOptimizer56(k);
 return '<section class="card"><div class="title">Optymalizator celów</div><div class="form inline56"><label>Budżet dodatkowy / mies.<input id="goalBudget56" type="number" step="50" value="'+N(S.finance.auto56.goalBudget)+'" placeholder="0 = 25% nadwyżki"></label><button class="btn" onclick="saveGoalBudget56()">Przelicz</button></div><div class="goalOpt56">'+(x.goals.length?x.goals.map(z=>'<div><div><small>'+esc(z.g.name||'Cel')+' • '+z.months+' mies.</small><b>brakuje '+PLN(z.remain)+'</b></div><span>obecnie '+PLN(z.current)+'/m</span><span>potrzeba '+PLN(z.need)+'/m</span><strong class="'+(z.extra>0?'green':'')+'">+ '+PLN(z.extra)+'/m → razem '+PLN(z.current+z.extra)+'</strong></div>').join(''):'<p class="muted">Brak aktywnych celów.</p>')+'</div><p class="muted">Budżet „0” oznacza automatycznie 25% dodatniej nadwyżki bieżącego miesiąca.</p></section>'
}
function taxCenter56(y){
 let rows=[];for(let m=0;m<12;m++){let k=key(y,m),x=control()?.taxReserve?.(k);if(x)rows.push({k,...x})}
 let sum=rows.reduce((a,x)=>{a.vat+=N(x.vat);a.pit+=N(x.pit);a.zus+=N(x.zus);a.health+=N(x.health);a.total+=N(x.total);return a},{vat:0,pit:0,zus:0,health:0,total:0}),peak=[...rows].sort((a,b)=>N(b.total)-N(a.total))[0];
 return{rows,sum,peak}
}
function taxHtml56(y){
 let x=taxCenter56(y),max=Math.max(1,...x.rows.map(r=>N(r.total)));
 return '<section class="card"><div class="title">Centrum podatkowe 2.0 — '+y+' <span class="pill">planowanie rezerw</span></div><div class="taxKpis56"><div><small>VAT</small><b>'+PLN(x.sum.vat)+'</b></div><div><small>PIT</small><b>'+PLN(x.sum.pit)+'</b></div><div><small>ZUS + ZDROWOTNA</small><b>'+PLN(x.sum.zus+x.sum.health)+'</b></div><div><small>REZERWY ŁĄCZNIE</small><b>'+PLN(x.sum.total)+'</b></div></div><div class="taxBars56">'+x.rows.map(r=>'<div title="'+fmtMonth(r.k)+' '+PLN(r.total)+'"><i style="height:'+Math.max(4,N(r.total)/max*76)+'px"></i><small>'+MN[parseKey(r.k).m]+'</small><b>'+PLN(r.total)+'</b></div>').join('')+'</div><p class="muted">Najwyższa miesięczna rezerwa: '+(x.peak?fmtMonth(x.peak.k)+' • '+PLN(x.peak.total):'—')+'. To warstwa planistyczna oparta na danych aplikacji, nie deklaracja podatkowa.</p></section>'
}
function productEcon56(p){let cost=['material','parts','energy','packaging','shipping','fees','ads','other'].reduce((a,k)=>a+N(p[k]),0),profit=N(p.price)-cost;return{cost,profit}}
function capacityModal56(i){
 let p=S.finance.products?.[i];if(!p)return;
 open('<h2>Capacity — '+esc(p.name||'Produkt')+'</h2><div class="form"><label>Czas druku / szt. (h)<input id="cp56h" type="number" step="0.1" value="'+N(p.printHours56)+'"></label><label>Maks. popyt / mies. (szt.)<input id="cp56d" type="number" step="1" value="'+N(p.maxDemand56)+'" placeholder="0 = użyj średniej sprzedaży"></label></div><button class="btn primary" onclick="saveCapacityMeta56('+i+')">Zapisz</button>')
}
window.capacityModal56=capacityModal56;
window.saveCapacityMeta56=function(i){let p=S.finance.products?.[i];if(!p)return;p.printHours56=Math.max(0,N(G('cp56h')?.value));p.maxDemand56=Math.max(0,N(G('cp56d')?.value));save56();closeModal();renderCapacity56();window.renderBusiness55?.()};
window.saveCapacitySettings56=function(){S.finance.auto56.capacityPrinters=Math.max(1,Math.round(N(G('printers56')?.value)||1));S.finance.auto56.capacityHours=Math.max(1,N(G('hours56')?.value)||100);save56();renderCapacity56()};
function capacityPlan56(){
 let total=N(S.finance.auto56.capacityPrinters)*N(S.finance.auto56.capacityHours),left=total,rows=(S.finance.products||[]).map((p,i)=>{let e=productEcon56(p),hours=N(p.printHours56),rate=hours>0?e.profit/hours:0,demand=N(p.maxDemand56)||N(p.monthlyUnits55)||Infinity;return{p,i,...e,hours,rate,demand,units:0,used:0,profitCap:0}}).filter(x=>x.hours>0&&x.profit>0).sort((a,b)=>b.rate-a.rate);
 for(const x of rows){let cap=Math.floor(left/x.hours),units=Math.min(cap,Number.isFinite(x.demand)?Math.floor(x.demand):cap);x.units=Math.max(0,units);x.used=x.units*x.hours;x.profitCap=x.units*x.profit;left-=x.used;if(left<.01)left=0}
 return{total,left,rows,profit:rows.reduce((a,x)=>a+x.profitCap,0),used:total-left}
}
function capacityHtml56(){
 let x=capacityPlan56();
 return '<section class="card"><div class="title">MOHE Capacity Planner <span class="pill">drukarki → zysk</span></div><div class="form capacityForm56"><label>Liczba drukarek<input id="printers56" type="number" min="1" value="'+N(S.finance.auto56.capacityPrinters)+'"></label><label>Wolne godziny / drukarkę / mies.<input id="hours56" type="number" step="10" value="'+N(S.finance.auto56.capacityHours)+'"></label><button class="btn primary" onclick="saveCapacitySettings56()">Przelicz</button></div><div class="capacityKpis56"><div><small>DOSTĘPNE</small><b>'+x.total.toFixed(1)+' h</b></div><div><small>WYKORZYSTANE</small><b>'+x.used.toFixed(1)+' h</b></div><div><small>WOLNE</small><b>'+x.left.toFixed(1)+' h</b></div><div><small>POTENCJAŁ ZYSKU</small><b>'+PLN(x.profit)+'</b></div></div><div class="capacityRows56">'+((S.finance.products||[]).length?(S.finance.products||[]).map((p,i)=>{let e=productEcon56(p),h=N(p.printHours56),row=x.rows.find(r=>r.i===i);return'<div><div><small>'+esc(p.category55||'MOHE')+'</small><b>'+esc(p.name||'Produkt')+'</b></div><span>zysk/szt. '+PLN(e.profit)+'</span><span>'+(h?h.toFixed(1)+' h druku':'brak czasu druku')+'</span><strong>'+(row?row.units+' szt. → '+PLN(row.profitCap):'—')+'</strong><button class="btn" onclick="capacityModal56('+i+')">Parametry</button></div>'}).join(''):'<p class="muted">Dodaj produkty w Firma+.</p>')+'</div><p class="muted">Planner rozdziela dostępne godziny od produktu o najwyższym zysku na godzinę druku, z limitem popytu jeśli go podasz. To plan potencjału, nie prognoza sprzedaży.</p></section>'
}
function watchMetric56(type){
 let k=nowKey(),p=planner()?.monthPlan?.(k),score=command()?.financialScore?.(k),essential=N(p?.mi?.essential),saved=N(S.finance.emergencySavings),debt=(S.loans||[]).reduce((a,l)=>a+loanBalance56(l),0),inv=N(lab()?.investmentSummary?.().value),sales=N(p?.inc?.company),refi=N(S.finance.auto56.bestRefiOffer);
 let map={score:N(score?.total),emergency:essential?saved/essential:0,company:sales,free:N(p?.free),debt,invest:inv,refi};
 return map[type]??0
}
function watchReached56(w){let v=watchMetric56(w.type);return w.dir==='lte'?v<=N(w.threshold):v>=N(w.threshold)}
function watchLabel56(type){return({score:'Score 0–100',emergency:'Poduszka — mies.',company:'Wynik firmy / mies.',free:'Nadwyżka / mies.',debt:'Łączne saldo kredytów',invest:'Portfel inwestycyjny',refi:'Najlepsza oferta refinansowania %'})[type]||type}
function watchModal56(){
 open('<h2>Nowy warunek</h2><div class="form"><label>Nazwa<input id="wt56n" placeholder="np. Zwiększ inwestowanie"></label><label>Wskaźnik<select id="wt56t"><option value="score">Score 0–100</option><option value="emergency">Poduszka — miesiące</option><option value="company">Wynik firmy / mies.</option><option value="free">Nadwyżka / mies.</option><option value="debt">Łączne saldo kredytów</option><option value="invest">Portfel inwestycyjny</option><option value="refi">Najlepsza oferta refinansowania %</option></select></label><label>Warunek<select id="wt56d"><option value="gte">co najmniej / ≥</option><option value="lte">maksymalnie / ≤</option></select></label><label>Próg<input id="wt56v" type="number" step="0.1"></label><label>Co zrobić po spełnieniu?<input id="wt56a" placeholder="np. zwiększ ETF do 500 zł/m"></label></div><button class="btn primary" onclick="saveWatch56()">Zapisz</button>')
}
window.watchModal56=watchModal56;
window.saveWatch56=function(){ensure56();S.finance.auto56.watchlist.push({id:Date.now(),name:G('wt56n')?.value?.trim()||'Warunek',type:G('wt56t')?.value||'score',dir:G('wt56d')?.value||'gte',threshold:N(G('wt56v')?.value),action:G('wt56a')?.value?.trim()||'',active:true});save56();closeModal();renderWatch56()};
window.removeWatch56=function(id){S.finance.auto56.watchlist=S.finance.auto56.watchlist.filter(x=>x.id!==id);save56();renderWatch56()};
window.saveRefiOffer56=function(){S.finance.auto56.bestRefiOffer=Math.max(0,N(G('refiOffer56')?.value));save56();renderWatch56()};
function watchHtml56(){
 let rows=S.finance.auto56.watchlist||[];
 return '<section class="card"><div class="title">Watchlista decyzji <button class="btn primary" onclick="watchModal56()">＋ Warunek</button></div><div class="form inline56"><label>Najlepsza znana oferta refinansowania %<input id="refiOffer56" type="number" step="0.01" value="'+N(S.finance.auto56.bestRefiOffer)+'"></label><button class="btn" onclick="saveRefiOffer56()">Zapisz</button></div>'+(rows.length?'<div class="watchRows56">'+rows.map(w=>{let cur=watchMetric56(w.type),hit=watchReached56(w);return'<div class="'+(hit?'hit56':'')+'"><div><small>'+esc(watchLabel56(w.type))+'</small><b>'+esc(w.name)+'</b><span>aktualnie '+(w.type==='score'?cur.toFixed(0):w.type==='emergency'||w.type==='refi'?cur.toFixed(2):PLN(cur))+' • próg '+(w.dir==='lte'?'≤':'≥')+' '+N(w.threshold)+'</span></div><strong>'+(hit?'✓ WARUNEK SPEŁNIONY':'oczekuje')+'</strong><em>'+esc(w.action||'brak zapisanej akcji')+'</em><button class="btn danger" onclick="removeWatch56('+w.id+')">Usuń</button></div>'}).join('')+'</div>':'<p class="muted">Dodaj warunki, przy których chcesz podjąć decyzję — np. zwiększyć inwestowanie po zbudowaniu 6 mies. poduszki.</p>')+'</section>'
}
function snapshotScore56(){
 let k=nowKey(),s=command()?.financialScore?.(k);if(!s)return;
 let v=Math.round(N(s.total));if(S.finance.auto56.scoreHistory[k]!==v){S.finance.auto56.scoreHistory[k]=v;save56()}
}
function scoreHistory56(){
 let map={...(S.finance.auto56.scoreHistory||{})};
 Object.entries(S.finance.ops54?.monthReports||{}).forEach(([k,r])=>{if(r?.score!=null)map[k]=N(r.score)});
 return Object.entries(map).map(([k,v])=>({k,v:N(v)})).sort((a,b)=>a.k.localeCompare(b.k)).slice(-24)
}
function scoreHtml56(){
 let rows=scoreHistory56(),max=100;
 return '<section class="card"><div class="title">Historia kondycji 0–100 <span class="pill">'+rows.length+' zapisów</span></div>'+(rows.length?'<div class="scoreHistory56">'+rows.map(r=>'<div><i style="height:'+Math.max(4,r.v/max*90)+'px"></i><small>'+MN[parseKey(r.k).m]+' '+String(parseKey(r.k).y).slice(-2)+'</small><b>'+r.v+'</b></div>').join('')+'</div>':'<p class="muted">Historia zacznie się budować od bieżącej wersji oraz zapisanych raportów miesiąca.</p>')+'</section>'
}
function renderAutopilot56(){
 let h=G('autopilotBody56');if(!h||!ensure56())return;let k=nowKey(),y=S.selectedYear||new Date().getFullYear();
 snapshotScore56();
 h.innerHTML=allocCard56(k)+changesHtml56(k)+stressHtml56(k)+debtFreedomHtml56()+timelineHtml56()+goalsHtml56(k)+taxHtml56(y)+scoreHtml56()
}
function renderCapacity56(){let h=G('capacityBody56');if(!h||!ensure56())return;h.innerHTML=capacityHtml56()}
function renderWatch56(){let h=G('watchBody56');if(!h||!ensure56())return;h.innerHTML=watchHtml56()}
function renderControl56(){
 let h=G('controlBody51');if(!h||!ensure56())return;G('autoControl56')?.remove();let k=S.finance.control51?.month||nowKey(),x=allocation56(k),st=stress56(k),worst=[...st].sort((a,b)=>(Number.isFinite(a.runway)?a.runway:999)-(Number.isFinite(b.runway)?b.runway:999))[0],hit=(S.finance.auto56.watchlist||[]).filter(w=>watchReached56(w)).length,box=document.createElement('div');box.id='autoControl56';box.className='card';
 box.innerHTML='<div class="title">Autopilot 5.5 <button class="btn primary" onclick="show(\'autopilot\')">Otwórz Autopilot ›</button></div><div class="autoKpis56"><div><small>DO PODZIAŁU</small><b>'+PLN(x?.available)+'</b></div><div><small>STRATEGIA</small><b>'+esc(x?.strategy?.label||'—')+'</b></div><div><small>NAJSŁABSZY STRESS TEST</small><b>'+(worst&&Number.isFinite(worst.runway)?worst.runway.toFixed(1)+' mies.':'bez deficytu')+'</b></div><div><small>WARUNKI SPEŁNIONE</small><b>'+hit+'</b></div></div>';
 h.appendChild(box)
}
function renderHome56(){
 let h=G('home');if(!h||!ensure56())return;G('autoHome56')?.remove();let k=nowKey(),x=allocation56(k),debt=debtSim56(500),hit=(S.finance.auto56.watchlist||[]).filter(w=>watchReached56(w)).length,box=document.createElement('div');box.id='autoHome56';box.className='card';
 box.innerHTML='<div class="title">Autopilot finansowy <span class="pill green">5.5 AKTYWNY</span><button class="btn primary" onclick="show(\'autopilot\')">Centrum Autopilota ›</button></div><div class="autoKpis56"><div><small>DO PODZIAŁU</small><b>'+PLN(x?.available)+'</b></div><div><small>STRATEGIA</small><b>'+esc(x?.strategy?.label||'—')+'</b></div><div><small>+500 ZŁ DO DŁUGU</small><b>'+(debt.months?debt.months+' mies. do zera':'brak długu')+'</b></div><div><small>WATCHLISTA</small><b>'+hit+' spełnione</b></div></div>';
 let lab=G('labHome55')||G('opsHome54');if(lab)lab.insertAdjacentElement('afterend',box);else h.prepend(box)
}
function renderBusiness56(){
 let h=G('businessPlusBody');if(!h||!ensure56())return;G('capacityBusiness56')?.remove();let x=capacityPlan56(),box=document.createElement('div');box.id='capacityBusiness56';box.className='card';
 box.innerHTML='<div class="title">MOHE — Capacity <button class="btn" onclick="show(\'capacity\')">Pełny planner ›</button></div><div class="autoKpis56"><div><small>DOSTĘPNE GODZINY</small><b>'+x.total.toFixed(0)+' h</b></div><div><small>WYKORZYSTANE</small><b>'+x.used.toFixed(0)+' h</b></div><div><small>POTENCJAŁ ZYSKU</small><b>'+PLN(x.profit)+'</b></div><div><small>TOP PRODUKT</small><b>'+esc(x.rows[0]?.p?.name||'uzupełnij czasy')+'</b></div></div>';
 h.prepend(box)
}
function renderSettings56(){
 let h=G('settings');if(!h||!ensure56())return;G('autoSettings56')?.remove();let box=document.createElement('div');box.id='autoSettings56';box.className='card',errs=ERR56.slice(-5);
 let checks=[
  ['Autopilot',!!G('autopilotBody56')],
  ['MOHE Capacity',!!G('capacityBody56')],
  ['Watchlista',!!G('watchBody56')],
  ['Silnik planera',!!planner()],
  ['Centrum dowodzenia',!!command()],
  ['Operacje 5.3',!!ops()],
  ['Strategia 5.4',!!lab()]
 ];
 box.innerHTML='<div class="title">Autopilot finansowy — 5.5 <span class="pill '+(errs.length?'red':'green')+'">'+(errs.length?errs.length+' błędów runtime':'AKTYWNY')+'</span></div><div class="deployStatus56">'+checks.map(x=>'<span class="'+(x[1]?'':'bad')+'">'+(x[1]?'✓':'⚠')+' '+x[0]+'</span>').join('')+'</div><p class="muted">Runtime: '+VERSION+' • każdy nowy renderer jest izolowany, więc błąd jednego modułu nie powinien już powodować pustego innego ekranu.</p>'+(errs.length?'<div class="runtimeLog56">'+errs.map(e=>'<div><b>'+esc(e.scope)+'</b><code>'+esc(e.msg)+'</code></div>').join('')+'</div>':'')+'<div class="moduleLinks"><button class="btn primary" onclick="show(\'autopilot\')">🤖 Autopilot</button><button class="btn" onclick="show(\'capacity\')">🏭 MOHE Capacity</button><button class="btn" onclick="show(\'watch\')">👁 Watchlista</button><button class="btn" onclick="repairViews56()">🔧 Przerenderuj moduły</button></div>';
 h.prepend(box)
}
function renderAll56(){
 if(!safe56('ensure56',ensure56))return;
 safe56('version',setVersion56);
 safe56('score snapshot',snapshotScore56);
 safe56('Start 5.5',renderHome56);
 safe56('Centrum 5.5',renderControl56);
 safe56('Autopilot',renderAutopilot56,'autopilotBody56','Autopilot finansowy');filled56('autopilotBody56','Autopilot finansowy');
 safe56('Capacity',renderCapacity56,'capacityBody56','MOHE Capacity Planner');filled56('capacityBody56','MOHE Capacity Planner');
 safe56('Watchlista',renderWatch56,'watchBody56','Watchlista decyzji');filled56('watchBody56','Watchlista decyzji');
 safe56('Firma Capacity',renderBusiness56);
 safe56('Ustawienia 5.5',renderSettings56)
}
window.repairViews56=function(){safe56('ręczna naprawa',renderAll56)};
const oldRender=window.render;
if(typeof oldRender==='function'&&!oldRender.__mf56){
 let fn=function(){
  let out;
  try{out=oldRender()}catch(e){error56('starszy łańcuch render()',e)}
  finally{renderAll56()}
  return out
 };
 fn.__mf56=true;window.render=fn
}
const oldShow=window.show;
if(typeof oldShow==='function'&&!oldShow.__mf56){
 let fn=function(v){
  let out;
  try{out=oldShow(v)}catch(e){error56('starszy łańcuch show('+v+')',e)}
  finally{
   safe56('version/show',setVersion56);
   const map={
    home:()=>renderHome56(),
    control:()=>renderControl56(),
    autopilot:()=>renderAutopilot56(),
    capacity:()=>renderCapacity56(),
    watch:()=>renderWatch56(),
    businessplus:()=>renderBusiness56(),
    settings:()=>renderSettings56()
   };
   if(map[v]){
    const fb=v==='autopilot'?['autopilotBody56','Autopilot finansowy']:v==='capacity'?['capacityBody56','MOHE Capacity Planner']:v==='watch'?['watchBody56','Watchlista decyzji']:['',''];
    safe56('show '+v,map[v],fb[0],fb[1])
   }
  }
  return out
 };
 fn.__mf56=true;window.show=fn
}
function installFinalGuard56(){
 let s=window.show;
 if(typeof s==='function'&&!s.__mf56final){
  let fn=function(v){
   let out;
   try{out=s(v)}catch(e){error56('FINAL show('+v+')',e)}
   finally{
    safe56('FINAL version',setVersion56);
    if(v==='autopilot'){safe56('FINAL Autopilot',renderAutopilot56,'autopilotBody56','Autopilot finansowy');filled56('autopilotBody56','Autopilot finansowy')}
    if(v==='capacity'){safe56('FINAL Capacity',renderCapacity56,'capacityBody56','MOHE Capacity Planner');filled56('capacityBody56','MOHE Capacity Planner')}
    if(v==='watch'){safe56('FINAL Watchlista',renderWatch56,'watchBody56','Watchlista decyzji');filled56('watchBody56','Watchlista decyzji')}
    if(v==='settings')safe56('FINAL Ustawienia',renderSettings56)
   }
   return out
  };fn.__mf56final=true;window.show=fn
 }
 let r=window.render;
 if(typeof r==='function'&&!r.__mf56final){
  let fn=function(){let out;try{out=r()}catch(e){error56('FINAL render()',e)}finally{safe56('FINAL renderAll 5.5',renderAll56)}return out};fn.__mf56final=true;window.render=fn
 }
}
window.addEventListener('finance-modules-ready',()=>{installFinalGuard56();safe56('start 5.5',renderAll56)},{once:true});
window.mfAutopilot56={allocation:allocation56,stress:stress56,debtSim:debtSim56,timeline:timeline56,goalOptimizer:goalOptimizer56,taxCenter:taxCenter56,capacityPlan:capacityPlan56,watchMetric:watchMetric56,scoreHistory:scoreHistory56,runtimeErrors:ERR56,repair:window.repairViews56};
let st=document.createElement('style');st.textContent='.strategyBtns56{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}.allocTop56,.allocGrid56,.autoKpis56,.taxKpis56,.capacityKpis56,.changeGrid56{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.allocGrid56{grid-template-columns:repeat(5,minmax(0,1fr));margin-top:9px}.allocTop56>div,.allocGrid56>div,.autoKpis56>div,.taxKpis56>div,.capacityKpis56>div,.changeGrid56>div{padding:11px;border:1px solid #e3e9f1;border-radius:11px;background:#f8fafc}.allocTop56 small,.allocGrid56 small,.autoKpis56 small,.taxKpis56 small,.capacityKpis56 small,.changeGrid56 small{display:block;font-size:8px;color:#7d899b;font-weight:800}.allocTop56 b,.allocGrid56 b,.autoKpis56 b,.taxKpis56 b,.capacityKpis56 b,.changeGrid56 b{display:block;margin-top:4px;color:#315274}.allocGrid56 span,.changeGrid56 span{display:block;margin-top:3px;font-size:9px;color:#7d899b}.stressForm56,.capacityForm56,.inline56{display:flex;gap:8px;align-items:end;flex-wrap:wrap}.stressTable56{overflow-x:auto}.stressHead56,.stressRow56{display:grid;grid-template-columns:1.2fr repeat(4,1fr);gap:8px;align-items:center;min-width:650px;padding:9px;border-bottom:1px solid #e7ecf2;font-size:10px}.stressHead56{background:#f4f7fb;color:#7d899b;font-size:8px;font-weight:800}.stressRow56 em{font-style:normal;font-weight:800}.good56{color:#2e7a50}.mid56{color:#9a6a14}.bad56{color:#b24450}.debtFreedom56{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.debtFreedom56>div{padding:12px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc}.debtFreedom56 small,.debtFreedom56 span,.debtFreedom56 strong{display:block}.debtFreedom56 small{font-size:8px;color:#7f8c9e;font-weight:800}.debtFreedom56 b{display:block;margin:5px 0;color:#315274}.debtFreedom56 span{font-size:9px;color:#768498}.debtFreedom56 strong{margin-top:5px;font-size:9px;color:#2f7851}.timeline56{max-height:620px;overflow:auto;border:1px solid #e5eaf1;border-radius:12px}.timelineRow56{display:grid;grid-template-columns:85px 120px 120px 1fr;gap:9px;align-items:center;padding:9px 10px;border-bottom:1px solid #e8edf3;font-size:9px}.timelineRow56.hasEvent{background:#fbfdff}.timelineRow56 small{color:#8692a2}.timelineEvents56{display:flex;gap:5px;flex-wrap:wrap}.timelineEvents56 em{font-style:normal;background:#edf3fa;border-radius:99px;padding:4px 7px;color:#4f6885}.goalOpt56>div{display:grid;grid-template-columns:1.3fr repeat(3,1fr);gap:8px;align-items:center;padding:9px 0;border-bottom:1px solid #e8edf3;font-size:10px}.goalOpt56 small{display:block;color:#7e8b9c}.taxBars56{display:flex;gap:7px;align-items:end;height:125px;overflow-x:auto;margin-top:10px}.taxBars56>div{min-width:44px;display:grid;grid-template-rows:80px 13px 18px;justify-items:center;align-items:end}.taxBars56 i{display:block;width:22px;background:#5b82b5;border-radius:5px 5px 2px 2px}.taxBars56 small,.taxBars56 b{font-size:8px;color:#738196}.capacityRows56>div{display:grid;grid-template-columns:1.3fr repeat(3,.8fr) auto;gap:8px;align-items:center;padding:9px 0;border-bottom:1px solid #e7ecf2;font-size:10px}.capacityRows56 small{display:block;color:#8491a3}.watchRows56>div{display:grid;grid-template-columns:1.2fr .8fr 1fr auto;gap:9px;align-items:center;padding:10px;border:1px solid #e2e8f0;border-radius:11px;margin-top:8px}.watchRows56 .hit56{background:#eef8f2;border-color:#cfe7d7}.watchRows56 small,.watchRows56 span{display:block;color:#7d899b;font-size:9px}.watchRows56 em{font-style:normal;font-size:9px;color:#596c83}.scoreHistory56{display:flex;gap:7px;height:135px;align-items:end;overflow-x:auto}.scoreHistory56>div{display:grid;grid-template-rows:95px 14px 14px;min-width:38px;justify-items:center;align-items:end}.scoreHistory56 i{width:20px;background:#5b82b5;border-radius:5px 5px 2px 2px}.scoreHistory56 small,.scoreHistory56 b{font-size:8px;color:#6f7e91}.deployStatus56{display:flex;gap:5px;flex-wrap:wrap;margin:8px 0}.deployStatus56 span{padding:5px 7px;border-radius:99px;background:#eaf6ef;color:#33714f;font-size:8px;font-weight:800}.deployStatus56 span.bad{background:#fdebed;color:#9d3440}.runtimeError56{border-color:#e6a6ad;background:#fffafb}.runtimeError56 code{display:block;white-space:pre-wrap;padding:9px;border-radius:9px;background:#f7eef0;color:#8b3f48;margin:8px 0}.runtimeLog56{display:grid;gap:6px;margin:8px 0}.runtimeLog56>div{padding:8px;border:1px solid #ecd6d9;border-radius:9px;background:#fffafb}.runtimeLog56 b,.runtimeLog56 code{display:block}.runtimeLog56 code{margin-top:3px;font-size:9px;white-space:pre-wrap;color:#874650}@media(max-width:900px){.allocGrid56{grid-template-columns:repeat(3,minmax(0,1fr))}.debtFreedom56{grid-template-columns:repeat(2,minmax(0,1fr))}.timelineRow56{grid-template-columns:75px 100px 100px 1fr}.goalOpt56>div{grid-template-columns:1fr 1fr}.capacityRows56>div{grid-template-columns:1.2fr .8fr .8fr}.capacityRows56>div .btn{grid-column:1/-1;justify-self:start}.watchRows56>div{grid-template-columns:1fr 1fr}.watchRows56>div .btn{justify-self:start}}@media(max-width:600px){.allocTop56,.autoKpis56,.taxKpis56,.capacityKpis56,.changeGrid56{grid-template-columns:1fr 1fr}.allocGrid56{grid-template-columns:1fr 1fr}.debtFreedom56{grid-template-columns:1fr 1fr}.timelineRow56{grid-template-columns:68px 1fr}.timelineRow56>span{grid-column:2}.timelineEvents56{grid-column:1/-1}.goalOpt56>div{grid-template-columns:1fr}.watchRows56>div{grid-template-columns:1fr}.capacityRows56>div{grid-template-columns:1fr 1fr}}';document.head.appendChild(st);
})();
