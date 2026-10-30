/* Moje Finanse 5.0 — Centrum finansowe */
(function(){
'use strict';
const VERSION='5.0.0',G=id=>document.getElementById(id),N=v=>+v||0,R2=v=>Math.round((N(v)+Number.EPSILON)*100)/100;
const PLN=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(N(v));
const FULL=['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nowDate=()=>new Date(),monthKey=(y,m)=>String(y)+'-'+String(m+1).padStart(2,'0');
function parseMonth(k){let [y,m]=String(k||'').split('-').map(Number);return{y:y||nowDate().getFullYear(),m:Math.max(0,(m||1)-1)}}
function ensure(){
 if(typeof S==='undefined')return false;
 S.finance||={};let f=S.finance;
 f.expenses||=[];f.goals||=[];f.assets||=[];f.informalDebts||=[];f.calendarEvents||=[];
 f.control51||={};let c=f.control51;
 c.month||=f.analysisMonth||f.selectedMonth||monthKey(nowDate().getFullYear(),nowDate().getMonth());
 c.close||={};c.wealthHistory||={};
 c.priority||={emergency:30,debt:40,goals:20,other:10};
 c.crisis||={salaryPct:70,companyPct:25,costPct:10,months:3};
 if(c.bufferPct==null)c.bufferPct=15;
 return true
}
function setVersion(){
 document.title='Moje Finanse '+VERSION;
 let h=document.querySelector('.top small');if(h)h.innerHTML='<span id="headerYear">'+(typeof S!=='undefined'?S.selectedYear:'')+'</span> • wersja '+VERSION;
 document.documentElement.dataset.appVersion=VERSION
}
function withYear(y,fn){let old=S.selectedYear;try{S.selectedYear=y;window.mfTaxSync41?.(y);if(typeof Y==='function')Y();return fn()}finally{S.selectedYear=old;window.mfTaxSync41?.(old)}}
function salaryRows(y){try{return withYear(y,()=>typeof sal==='function'?(sal().rows||[]):[])}catch{return[]}}
function companyRow(y,m){return S.years?.[String(y)]?.company?.[m]||{}}
function companyActual(r){return !!((r.salesLines&&r.salesLines.length)||(r.costLines&&r.costLines.length)||N(r.revenue)||N(r.costs)||N(r.vat)||N(r.vatOut)||N(r.vatIn)||N(r.zus)||N(r.health)||N(r.tax))}
function companySummary(r){
 if(typeof window.mfCompanySummary44==='function')return window.mfCompanySummary44(r||{});
 let rev=N(r?.revenue),cost=N(r?.costs),vat=(N(r?.vatOut)||N(r?.vatIn))?N(r?.vatOut)-N(r?.vatIn):N(r?.vat);
 let rg=N(r?.revenueGross)||rev+Math.max(0,N(r?.vatOut)),cg=N(r?.costsGross)||cost+Math.max(0,N(r?.vatIn)),zus=N(r?.zus),health=N(r?.health),tax=N(r?.tax);
 return{sales:{net:rev,gross:rg,vat:N(r?.vatOut)},costs:{net:cost,gross:cg,vat:N(r?.vatIn)},zus,health,tax,vatSaldo:vat,taxable:rev-cost-zus,cash:rg-cg-Math.max(0,vat)-zus-health-tax}
}
function companyForecast(y,m){
 let rows=S.years?.[String(y)]?.company||[],actual=rows.map((r,i)=>({i,r,s:companySummary(r)})).filter(x=>companyActual(x.r)&&x.i<m);
 if(!actual.length)actual=rows.map((r,i)=>({i,r,s:companySummary(r)})).filter(x=>companyActual(x.r));
 if(!actual.length)return{cash:0,salesNet:0,salesGross:0,costs:0};
 let avg=k=>actual.reduce((a,x)=>a+N(k(x.s)),0)/actual.length;
 return{cash:avg(s=>s.cash),salesNet:avg(s=>s.sales?.net),salesGross:avg(s=>s.sales?.gross),costs:avg(s=>s.costs?.net)}
}
function inMonth(e,k){if(e?.active===false)return false;if(e?.kind==='once')return e.month===k;return(!e?.from||k>=e.from)&&(!e?.to||k<=e.to)}
function expenses(k){return(S.finance.expenses||[]).filter(e=>inMonth(e,k))}
function expenseSplit(k){return expenses(k).reduce((a,e)=>{if(e.kind==='once')a.once+=N(e.amount);else a.recurring+=N(e.amount);a.total+=N(e.amount);return a},{recurring:0,once:0,total:0})}
function loanPoint(l){try{return typeof window.loanCurrentPoint15==='function'?window.loanCurrentPoint15(l):{balance:N(l.balance)}}catch{return{balance:N(l.balance)}}}
function loanMonth(l,k){
 try{
  let t=typeof window.loanTimeline15==='function'?window.loanTimeline15(l,true):null;
  let r=t?.rows?.find(x=>monthKey(x.date.getFullYear(),x.date.getMonth())===k);
  if(r)return{amount:N(r.regular)+N(r.extra),actual:r.kind==='actual',paid:r.kind==='actual',date:r.date};
 }catch{}
 let h=(l.history||[]).find(x=>x.month===k);if(h)return{amount:(h.paid?N(h.regularPaid||l.payment):0)+N(h.extra),actual:true,paid:!!h.paid};
 return null
}
function loanSpend(k){return(S.loans||[]).reduce((a,l)=>a+N(loanMonth(l,k)?.amount),0)}
function informalRemaining(d){return Math.max(0,N(d.amount)-(d.payments||[]).reduce((a,p)=>a+N(p.amount),0))}
function ppkActual(){
 let total=N(S.finance.ppkOpening),years=Object.keys(S.years||{}).map(Number).filter(Boolean).sort((a,b)=>a-b);
 years.forEach(y=>{salaryRows(y).forEach(r=>{if(r.actual)total+=N(r.pe)+N(r.er)})});return total
}
function liabilitiesCapital(){
 let bank=(S.loans||[]).reduce((a,l)=>a+N(loanPoint(l).balance),0),informal=(S.finance.informalDebts||[]).reduce((a,d)=>a+informalRemaining(d),0);
 return{bank,informal,total:bank+informal}
}
function wealthNow(){
 let assets=(S.finance.assets||[]).reduce((a,x)=>a+N(x.value),0),ppk=ppkActual(),debt=liabilitiesCapital();
 return{assets,ppk,debt:debt.total,bankDebt:debt.bank,informalDebt:debt.informal,net:R2(assets+ppk-debt.total)}
}
function monthIncome(k){
 let {y,m}=parseMonth(k),sr=salaryRows(y)[m]||{},cr=companyRow(y,m),cs=companySummary(cr),cf=companyForecast(y,m);
 let salary=N(sr.total),company=companyActual(cr)?N(cs.cash):N(cf.cash),actualSalary=!!sr.actual,actualCompany=companyActual(cr);
 return{salary,company,total:salary+company,actualSalary,actualCompany,salaryForecast:!actualSalary,companyForecast:!actualCompany}
}
function minIncome(k){
 let ex=expenseSplit(k),lo=loanSpend(k),goals=(S.finance.goals||[]).reduce((a,g)=>a+N(g.monthly),0),buffer=Math.max(0,N(S.finance.control51.bufferPct));
 let essential=ex.recurring+lo,planned=essential+goals,comfort=planned*(1+buffer/100);
 return{recurring:ex.recurring,loans:lo,goals,essential:R2(essential),planned:R2(planned),comfort:R2(comfort),buffer}
}
function pitEstimate(k,taxable){
 taxable=Math.max(0,N(taxable));if(!taxable)return 0;
 let {y,m}=parseMonth(k),threshold=N(S.settings?.threshold)||120000,prior=0;
 try{let t=window.mfCombinedTax44?.(y);prior=N(t?.rows?.[Math.max(0,m-1)]?.combined)}catch{}
 let low=Math.max(0,Math.min(taxable,threshold-prior)),high=Math.max(0,taxable-low);
 return R2(low*.12+high*.32)
}
function taxReserve(k){
 let {y,m}=parseMonth(k),r=companyRow(y,m),s=companySummary(r),actual=companyActual(r),pit=N(s.tax)>0?N(s.tax):pitEstimate(k,s.taxable),vat=Math.max(0,N(s.vatSaldo)),zus=N(s.zus),health=N(s.health),total=R2(vat+pit+zus+health);
 let safe=R2(Math.max(0,N(s.sales?.gross)-N(s.costs?.gross)-total));
 return{actual,vat,pit,zus,health,total,safe,taxable:N(s.taxable),salesGross:N(s.sales?.gross),costGross:N(s.costs?.gross),pitIsActual:N(s.tax)>0}
}
function upcoming(k){
 let {y,m}=parseMonth(k),today=nowDate(),startDay=(today.getFullYear()===y&&today.getMonth()===m)?today.getDate():1,items=[];
 expenses(k).forEach(e=>{let day=Math.max(1,Math.min(31,N(e.day)||1));if(day>=startDay)items.push({day,name:e.name||'Wydatek',amount:N(e.amount),kind:e.kind==='once'?'jednorazowy':'stały'})});
 (S.loans||[]).forEach(l=>{let p=loanMonth(l,k);if(!p)return;let day=Math.max(1,Math.min(31,N(l.dueDay)||1));if(day>=startDay&&!p.paid)items.push({day,name:'Rata '+(l.name||'kredytu'),amount:N(p.amount),kind:'kredyt'})});
 return items.sort((a,b)=>a.day-b.day)
}
function closeState(k){
 let c=S.finance.control51.close[k]||(S.finance.control51.close[k]={}),{y,m}=parseMonth(k),sr=salaryRows(y)[m]||{},cr=companyRow(y,m),tr=taxReserve(k),loans=(S.loans||[]).map(l=>loanMonth(l,k)).filter(Boolean),loansAuto=!loans.length||loans.every(x=>x.paid);
 return{raw:c,checks:[
  {id:'salary',label:'Etat sprawdzony',auto:!!sr.actual,done:!!sr.actual||!!c.salary},
  {id:'company',label:'Firma sprawdzona',auto:companyActual(cr),done:companyActual(cr)||!!c.company},
  {id:'taxes',label:'VAT / PIT / ZUS sprawdzone',auto:tr.total===0,done:tr.total===0||!!c.taxes},
  {id:'loans',label:'Raty kredytów sprawdzone',auto:loansAuto,done:loansAuto||!!c.loans},
  {id:'expenses',label:'Wydatki sprawdzone',auto:false,done:!!c.expenses},
  {id:'accounting',label:'Dokumenty firmy / księgowa sprawdzone',auto:false,done:!!c.accounting}
 ]}
}
function snapshotWealth(k){
 let w=wealthNow();S.finance.control51.wealthHistory[k]={...w,stamp:new Date().toISOString()};return w
}
function debtTarget(){
 let loans=(S.loans||[]).filter(l=>N(loanPoint(l).balance)>0).sort((a,b)=>N(b.rate)-N(a.rate));
 return loans[0]?.name||'najdroższy kredyt'
}
function urgentGoal(){
 let now=nowDate(),goals=(S.finance.goals||[]).filter(g=>N(g.target)>N(g.current));
 goals.sort((a,b)=>{let da=a.due?new Date(a.due+'-01').getTime():Infinity,db=b.due?new Date(b.due+'-01').getTime():Infinity;return da-db});
 return goals[0]?.name||'cel finansowy'
}
function crisis(k){
 let cfg=S.finance.control51.crisis,inc=monthIncome(k),mi=minIncome(k),salary=N(inc.salary)*N(cfg.salaryPct)/100,company=N(inc.company)*N(cfg.companyPct)/100,costs=mi.recurring*(1+N(cfg.costPct)/100)+mi.loans+mi.goals,monthly=R2(salary+company-costs),months=Math.max(1,N(cfg.months)||3),total=R2(monthly*months),cover=monthly<0?N(S.finance.emergencySavings)/Math.abs(monthly):Infinity;
 return{salary,company,costs,monthly,months,total,cover}
}
function priority(k){
 let inc=monthIncome(k),mi=minIncome(k),surplus=Math.max(0,R2(inc.total-mi.planned)),p=S.finance.control51.priority,total=N(p.emergency)+N(p.debt)+N(p.goals)+N(p.other)||100,norm=x=>N(x)/total;
 return{surplus,emergency:R2(surplus*norm(p.emergency)),debt:R2(surplus*norm(p.debt)),goals:R2(surplus*norm(p.goals)),other:R2(surplus*norm(p.other))}
}
function renderToday51(k){
 let host=G('home');if(!host)return;let old=G('today51');if(old)old.remove();
 let inc=monthIncome(k),mi=minIncome(k),tr=taxReserve(k),up=upcoming(k),next=up[0],sum=up.reduce((a,x)=>a+N(x.amount),0),box=document.createElement('div');
 box.id='today51';box.className='card controlToday51';
 box.innerHTML='<div class="title">Dzisiaj — finansowy radar <button class="btn" onclick="show(\'control\')">Centrum finansowe ›</button></div><div class="controlKpis51"><div><small>NAJBLIŻSZA PŁATNOŚĆ</small><b>'+(next?String(next.day).padStart(2,'0')+' • '+esc(next.name):'brak')+'</b><span>'+(next?PLN(next.amount):'')+'</span></div><div><small>POZOSTAŁE PŁATNOŚCI MIESIĄCA</small><b>'+PLN(sum)+'</b></div><div><small>REZERWA FIRMY</small><b>'+PLN(tr.total)+'</b><span>VAT + PIT + ZUS + zdrowotna</span></div><div><small>MINIMUM MIESIĘCZNE</small><b>'+PLN(mi.essential)+'</b><span>stałe + raty</span></div><div><small>PROGNOZA DOCHODU</small><b>'+PLN(inc.total)+'</b><span>etat + realny wynik firmy</span></div></div>';
 let hero=host.querySelector('.hero');if(hero)hero.insertAdjacentElement('afterend',box);else host.prepend(box)
}
function renderTaxReserve51(k){
 let tr=taxReserve(k);
 return '<section class="card"><div class="title">Rezerwy firmy — '+k+' <span class="pill">ile odłożyć</span></div><div class="controlGrid51"><div><small>VAT</small><b>'+PLN(tr.vat)+'</b></div><div><small>PIT '+(tr.pitIsActual?'WPISANY':'EST.')+'</small><b>'+PLN(tr.pit)+'</b></div><div><small>ZUS SPOŁECZNE</small><b>'+PLN(tr.zus)+'</b></div><div><small>ZDROWOTNA</small><b>'+PLN(tr.health)+'</b></div><div class="controlEm51"><small>RAZEM REZERWA</small><b>'+PLN(tr.total)+'</b></div><div><small>BEZPIECZNIE ZOSTAJE Z WPŁYWÓW FIRMY</small><b>'+PLN(tr.safe)+'</b></div></div><p class="muted">PIT oznaczony „est.” jest rezerwą orientacyjną wyliczoną z podstawy firmy i aktualnego wykorzystania progu. Wpisany faktyczny PIT ma pierwszeństwo.</p></section>'
}
function renderClose51(k){
 let s=closeState(k),done=s.checks.filter(x=>x.done).length;
 return '<section class="card"><div class="title">Zamknięcie miesiąca — '+k+' <span class="pill">'+done+'/'+s.checks.length+'</span></div><div class="closeList51">'+s.checks.map(x=>'<button class="closeItem51 '+(x.done?'done':'')+'" onclick="toggleClose51(\''+k+'\',\''+x.id+'\')" '+(x.auto?'disabled':'')+'><span>'+(x.done?'✓':'○')+'</span><b>'+esc(x.label)+'</b><small>'+(x.auto?'automatycznie':'kliknij po sprawdzeniu')+'</small></button>').join('')+'</div><div class="actions"><button class="btn primary" onclick="closeMonth51(\''+k+'\')" '+(done===s.checks.length?'':'disabled')+'>'+(s.raw.closed?'✓ Miesiąc zamknięty':'Zamknij miesiąc i zapisz historię majątku')+'</button></div>'+(s.raw.closed?'<p class="muted">Zamknięto: '+new Date(s.raw.closedAt).toLocaleString('pl-PL')+'</p>':'')+'</section>'
}
function renderMinimum51(k){
 let x=minIncome(k),inc=monthIncome(k);
 return '<section class="card"><div class="title">Minimalny potrzebny dochód <button class="btn" onclick="minimumSettings51()">Ustaw bufor</button></div><div class="controlGrid51"><div><small>PRÓG BEZPIECZEŃSTWA</small><b>'+PLN(x.essential)+'</b><span>stałe + raty</span></div><div><small>Z CELAMI</small><b>'+PLN(x.planned)+'</b><span>+ miesięczne wpłaty na cele</span></div><div class="controlEm51"><small>KOMFORT</small><b>'+PLN(x.comfort)+'</b><span>+ '+x.buffer.toFixed(0)+'% bufora</span></div><div><small>PROGNOZOWANY DOCHÓD</small><b>'+PLN(inc.total)+'</b><span class="'+(inc.total>=x.comfort?'green':'red')+'">'+(inc.total>=x.comfort?'powyżej komfortu':'poniżej komfortu')+'</span></div></div></section>'
}
function renderCrisis51(k){
 let x=crisis(k),c=S.finance.control51.crisis;
 return '<section class="card"><div class="title">Scenariusz kryzysowy <button class="btn" onclick="crisisSettings51()">Ustawienia</button></div><div class="controlGrid51"><div><small>ETAT ZOSTAJE</small><b>'+N(c.salaryPct).toFixed(0)+'%</b></div><div><small>FIRMA ZOSTAJE</small><b>'+N(c.companyPct).toFixed(0)+'%</b></div><div><small>KOSZTY STAŁE</small><b>+'+N(c.costPct).toFixed(0)+'%</b></div><div><small>HORYZONT</small><b>'+x.months+' mies.</b></div><div class="controlEm51"><small>WYNIK / MIES.</small><b class="'+(x.monthly>=0?'green':'red')+'">'+PLN(x.monthly)+'</b></div><div><small>PODUSZKA PRZY DEFICYCIE</small><b>'+(isFinite(x.cover)?x.cover.toFixed(1)+' mies.':'bez deficytu')+'</b></div></div></section>'
}
function renderPriority51(k){
 let x=priority(k),p=S.finance.control51.priority;
 return '<section class="card"><div class="title">Priorytet nadwyżki <button class="btn" onclick="prioritySettings51()">Ustaw proporcje</button></div><p class="muted">Na podstawie prognozowanej nadwyżki po stałych kosztach, ratach i wpłatach na cele: <b>'+PLN(x.surplus)+'</b>.</p><div class="allocation51"><div><span>Poduszka</span><b>'+PLN(x.emergency)+'</b><small>'+N(p.emergency).toFixed(0)+'%</small></div><div><span>Nadpłata: '+esc(debtTarget())+'</span><b>'+PLN(x.debt)+'</b><small>'+N(p.debt).toFixed(0)+'%</small></div><div><span>Cel: '+esc(urgentGoal())+'</span><b>'+PLN(x.goals)+'</b><small>'+N(p.goals).toFixed(0)+'%</small></div><div><span>Pozostałe</span><b>'+PLN(x.other)+'</b><small>'+N(p.other).toFixed(0)+'%</small></div></div></section>'
}
function renderUpcoming51(k){
 let rows=upcoming(k);
 return '<section class="card"><div class="title">Plan płatności do końca miesiąca</div>'+(rows.length?rows.map(x=>'<div class="row"><span><b>'+String(x.day).padStart(2,'0')+'</b> • '+esc(x.name)+' <small>'+esc(x.kind)+'</small></span><b>'+PLN(x.amount)+'</b></div>').join(''):'<p class="muted">Brak kolejnych zaplanowanych płatności w tym miesiącu.</p>')+'</section>'
}
function renderControl51(){
 let host=G('controlBody51');if(!host||!ensure())return;let k=S.finance.control51.month,{y,m}=parseMonth(k);
 host.innerHTML='<div class="card miniNav"><button class="btn" onclick="shiftControl51(-1)">‹</button><b>'+FULL[m]+' '+y+'</b><button class="btn" onclick="shiftControl51(1)">›</button></div>'+renderTaxReserve51(k)+renderClose51(k)+renderMinimum51(k)+renderCrisis51(k)+renderPriority51(k)+renderUpcoming51(k)
}
window.shiftControl51=function(d){let {y,m}=parseMonth(S.finance.control51.month),x=new Date(y,m+d,1,12);S.finance.control51.month=monthKey(x.getFullYear(),x.getMonth());save();renderControl51()};
window.toggleClose51=function(k,id){let c=S.finance.control51.close[k]||(S.finance.control51.close[k]={});c[id]=!c[id];save();renderControl51()};
window.closeMonth51=function(k){
 let s=closeState(k);if(s.checks.some(x=>!x.done))return alert('Najpierw oznacz wszystkie pozycje jako sprawdzone.');
 let c=s.raw;c.closed=true;c.closedAt=new Date().toISOString();snapshotWealth(k);save();renderControl51();renderWealthHistory51()
};
window.minimumSettings51=function(){let c=S.finance.control51;open('<h2>Próg komfortu</h2><p class="muted">Bufor jest dodawany do stałych kosztów, rat i miesięcznych wpłat na cele.</p><label>Bufor %<input id="minBuf51" type="number" min="0" step="1" value="'+N(c.bufferPct)+'"></label><button class="btn primary" onclick="saveMinimum51()">Zapisz</button>')};
window.saveMinimum51=function(){S.finance.control51.bufferPct=Math.max(0,N(G('minBuf51')?.value));save();closeModal();renderControl51()};
window.crisisSettings51=function(){let c=S.finance.control51.crisis;open('<h2>Scenariusz kryzysowy</h2><div class="form"><label>Ile zostaje z etatu %<input id="crSal51" type="number" min="0" max="100" value="'+N(c.salaryPct)+'"></label><label>Ile zostaje z firmy %<input id="crCom51" type="number" min="0" max="100" value="'+N(c.companyPct)+'"></label><label>Wzrost kosztów stałych %<input id="crCost51" type="number" min="0" value="'+N(c.costPct)+'"></label><label>Liczba miesięcy<input id="crMonths51" type="number" min="1" max="24" value="'+N(c.months)+'"></label></div><button class="btn primary" onclick="saveCrisis51()">Zapisz</button>')};
window.saveCrisis51=function(){let c=S.finance.control51.crisis;c.salaryPct=Math.max(0,Math.min(100,N(G('crSal51')?.value)));c.companyPct=Math.max(0,Math.min(100,N(G('crCom51')?.value)));c.costPct=Math.max(0,N(G('crCost51')?.value));c.months=Math.max(1,N(G('crMonths51')?.value)||3);save();closeModal();renderControl51()};
window.prioritySettings51=function(){let p=S.finance.control51.priority;open('<h2>Podział nadwyżki</h2><p class="muted">Wartości nie muszą sumować się do 100 — aplikacja przeliczy proporcje.</p><div class="form"><label>Poduszka<input id="prEm51" type="number" min="0" value="'+N(p.emergency)+'"></label><label>Nadpłata kredytów<input id="prDebt51" type="number" min="0" value="'+N(p.debt)+'"></label><label>Cele<input id="prGoals51" type="number" min="0" value="'+N(p.goals)+'"></label><label>Pozostałe<input id="prOther51" type="number" min="0" value="'+N(p.other)+'"></label></div><button class="btn primary" onclick="savePriority51()">Zapisz</button>')};
window.savePriority51=function(){let p=S.finance.control51.priority;p.emergency=Math.max(0,N(G('prEm51')?.value));p.debt=Math.max(0,N(G('prDebt51')?.value));p.goals=Math.max(0,N(G('prGoals51')?.value));p.other=Math.max(0,N(G('prOther51')?.value));save();closeModal();renderControl51()};

function wealthSvg51(hist){
 let entries=Object.entries(hist||{}).sort((a,b)=>a[0].localeCompare(b[0])).slice(-24);if(!entries.length)return'<p class="muted">Historia pojawi się po zapisaniu stanu lub zamknięciu miesiąca.</p>';
 let W=720,H=210,L=58,R=18,T=18,B=170,vals=entries.map(x=>N(x[1].net)),min=Math.min(0,...vals),max=Math.max(1,...vals),span=max-min||1,x=i=>L+i*((W-L-R)/Math.max(1,entries.length-1)),y=v=>B-(v-min)/span*(B-T),pts=entries.map((e,i)=>x(i)+','+y(N(e[1].net))).join(' ');
 let grid='';for(let i=0;i<=4;i++){let v=min+span*i/4,yy=y(v);grid+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+yy+'" y2="'+yy+'" stroke="#e3e9f1" stroke-dasharray="3 5"/><text x="'+(L-7)+'" y="'+(yy+3)+'" text-anchor="end" font-size="8" fill="#77869a">'+Math.round(v/1000)+' tys.</text>'}
 let labels=entries.map((e,i)=>'<text x="'+x(i)+'" y="194" text-anchor="middle" font-size="8" fill="#77869a">'+e[0].slice(5).replace('-','.')+'</text>').join('');
 return'<div class="wealthChart51"><svg viewBox="0 0 '+W+' '+H+'">'+grid+'<polyline points="'+pts+'" fill="none" stroke="#315f9f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>'+entries.map((e,i)=>'<circle cx="'+x(i)+'" cy="'+y(N(e[1].net))+'" r="3.5" fill="#fff" stroke="#315f9f" stroke-width="2"><title>'+e[0]+': '+PLN(e[1].net)+'</title></circle>').join('')+labels+'</svg></div>'
}
function renderWealthHistory51(){
 let host=G('wealthBody');if(!host||!ensure())return;G('wealthHistory51')?.remove();let box=document.createElement('div');box.id='wealthHistory51';box.className='card';let k=S.finance.control51.month,w=wealthNow();
 box.innerHTML='<div class="title">Historia wartości netto <button class="btn" onclick="saveWealthSnapshot51()">Zapisz stan '+k+'</button></div><div class="grid"><div class="tile"><small>AKTYWA + PPK</small><b>'+PLN(w.assets+w.ppk)+'</b></div><div class="tile"><small>ZADŁUŻENIE KAPITAŁOWE</small><b>'+PLN(w.debt)+'</b></div><div class="tile"><small>WARTOŚĆ NETTO</small><b>'+PLN(w.net)+'</b></div></div>'+wealthSvg51(S.finance.control51.wealthHistory);host.appendChild(box)
}
window.saveWealthSnapshot51=function(){snapshotWealth(S.finance.control51.month);save();renderWealthHistory51()};

function goalAnalysis51(){
 let host=G('goalsBody');if(!host||!ensure())return;G('goalAnalysis51')?.remove();let box=document.createElement('div');box.id='goalAnalysis51';box.className='card',now=nowDate(),rows=S.finance.goals||[];
 box.innerHTML='<div class="title">Ocena tempa realizacji</div>'+(rows.length?rows.map(g=>{let remain=Math.max(0,N(g.target)-N(g.current)),monthly=N(g.monthly),months=monthly>0?Math.ceil(remain/monthly):Infinity,dueMonths=null;if(g.due){let [yy,mm]=g.due.split('-').map(Number);dueMonths=Math.max(0,(yy-now.getFullYear())*12+(mm-1-now.getMonth()))}let need=dueMonths>0?remain/dueMonths:0,coverage=need>0?monthly/need*100:monthly>0?100:0,status=coverage>=100?'na dobrej drodze':coverage>=75?'blisko wymaganego tempa':'tempo za niskie';return'<div class="goalPace51"><div><b>'+esc(g.name)+'</b><small>'+status+'</small></div><strong>'+Math.min(999,coverage).toFixed(0)+'%</strong><span>pokrycia wymaganego tempa</span><span>'+(isFinite(months)?'~ '+months+' mies. do celu':'brak miesięcznej wpłaty')+'</span></div>'}).join(''):'<p class="muted">Brak celów do analizy.</p>');host.appendChild(box)
}
function businessTrend51(){
 let host=G('businessPlusBody');if(!host||!ensure())return;G('businessTrend51')?.remove();let y=S.selectedYear,rows=(S.years?.[String(y)]?.company||[]).map((r,i)=>({i,r,s:companySummary(r)})).filter(x=>companyActual(x.r)),box=document.createElement('div');box.id='businessTrend51';box.className='card';
 if(!rows.length){box.innerHTML='<div class="title">Firma — trend 3 / 6 / 12 miesięcy</div><p class="muted">Uzupełnij co najmniej jeden miesiąc firmy.</p>';host.prepend(box);return}
 let last=rows.at(-1),avg=(n,k)=>{let a=rows.slice(-n);return a.length?a.reduce((s,x)=>s+N(k(x.s)),0)/a.length:0},avg3=avg(3,s=>s.sales?.net),avg6=avg(6,s=>s.sales?.net),avg12=avg(12,s=>s.sales?.net),cash6=avg(6,s=>s.cash),cost6=avg(6,s=>s.costs?.net),delta=avg6?((N(last.s.sales?.net)-avg6)/avg6*100):0,max=Math.max(1,...rows.map(x=>N(x.s.sales?.net)));
 box.innerHTML='<div class="title">Firma — trend 3 / 6 / 12 miesięcy</div><div class="controlGrid51"><div><small>OSTATNI MIESIĄC NETTO</small><b>'+PLN(last.s.sales?.net)+'</b><span class="'+(delta>=0?'green':'red')+'">'+(delta>=0?'+':'')+delta.toFixed(1)+'% vs średnia 6 mies.</span></div><div><small>ŚREDNIA 3 MIES.</small><b>'+PLN(avg3)+'</b></div><div><small>ŚREDNIA 6 MIES.</small><b>'+PLN(avg6)+'</b></div><div><small>ŚREDNIA 12 MIES.</small><b>'+PLN(avg12)+'</b></div><div><small>KOSZTY NETTO — ŚR. 6</small><b>'+PLN(cost6)+'</b></div><div><small>REALNIE ZOSTAJE — ŚR. 6</small><b>'+PLN(cash6)+'</b></div></div><div class="bizTrendBars51">'+rows.map(x=>'<div title="'+FULL[x.i]+': '+PLN(x.s.sales?.net)+'"><i style="height:'+Math.max(3,N(x.s.sales?.net)/max*90)+'px"></i><small>'+FULL[x.i].slice(0,3)+'</small></div>').join('')+'</div>';host.prepend(box)
}
function loanRemainingCost51(l){try{let t=window.loanTimeline15?.(l,true),interest=(t?.forecast||[]).reduce((a,r)=>a+N(r.interest),0),capital=N(loanPoint(l).balance);return{capital,interest,total:capital+interest,months:(t?.forecast||[]).length}}catch{return{capital:N(l.balance),interest:0,total:N(l.balance),months:N(l.months)}}}
function payment(rate,months,balance){let r=N(rate)/1200,n=Math.max(1,N(months)),b=N(balance);return r?b*r/(1-Math.pow(1+r,-n)):b/n}
function renderRefiResult51(){
 let loan=S.loans?.[N(G('refLoan51')?.value)||0];if(!loan)return;let balance=N(loanPoint(loan).balance),rate=N(G('refRate51')?.value),months=Math.max(1,N(G('refMonths51')?.value)),fee=N(G('refFee51')?.value),pay=payment(rate,months,balance),total=pay*months+fee,current=loanRemainingCost51(loan),saving=current.total-total,out=G('refResult51');
 if(out)out.innerHTML='<div class="controlGrid51"><div><small>OBECNIE DO ZAPŁATY</small><b>'+PLN(current.total)+'</b><span>kapitał + odsetki</span></div><div><small>NOWA RATA</small><b>'+PLN(pay)+'</b></div><div><small>NOWY KOSZT ŁĄCZNY</small><b>'+PLN(total)+'</b><span>z prowizją</span></div><div class="controlEm51"><small>RÓŻNICA</small><b class="'+(saving>=0?'green':'red')+'">'+(saving>=0?'oszczędność ':'drożej ')+PLN(Math.abs(saving))+'</b></div></div>'
}
function loanCenter51(){
 let host=G('loanList');if(!host||!ensure())return;G('loanCenter51')?.remove();let box=document.createElement('div');box.id='loanCenter51';box.className='card loanCenter51',loans=S.loans||[];
 box.innerHTML='<div class="title">Centrum kredytowe 2.0 <span class="pill">refinansowanie / konsolidacja</span></div>'+(loans.length?'<div class="form refiForm51"><label>Kredyt<select id="refLoan51" onchange="refiLoad51()">'+loans.map((l,i)=>'<option value="'+i+'">'+esc(l.name)+'</option>').join('')+'</select></label><label>Nowe oprocentowanie %<input id="refRate51" type="number" step="0.01" oninput="renderRefiResult51()"></label><label>Nowy okres — mies.<input id="refMonths51" type="number" step="1" oninput="renderRefiResult51()"></label><label>Prowizja / koszt startowy<input id="refFee51" type="number" step="0.01" value="0" oninput="renderRefiResult51()"></label></div><div id="refResult51"></div><p class="muted">Symulator nie zmienia parametrów kredytu. Porównuje pozostały kapitał i prognozowane odsetki z nowym harmonogramem.</p>':'<p class="muted">Dodaj kredyt, aby uruchomić symulator.</p>');
 host.appendChild(box);if(loans.length)window.refiLoad51()
}
window.renderRefiResult51=renderRefiResult51;
window.refiLoad51=function(){let l=S.loans?.[N(G('refLoan51')?.value)||0];if(!l)return;G('refRate51').value=N(l.rate).toFixed(2);G('refMonths51').value=Math.max(1,N(l.months)||loanRemainingCost51(l).months||1);G('refFee51').value='0';renderRefiResult51()};

function renderAll51(){
 if(!ensure())return;setVersion();let k=S.finance.control51.month;renderControl51();renderToday51(k);renderWealthHistory51();goalAnalysis51();businessTrend51();loanCenter51()
}
const oldRender=window.render;if(typeof oldRender==='function'&&!oldRender.__mf51){let fn=function(){let out=oldRender();renderAll51();return out};fn.__mf51=true;window.render=fn}
const oldShow=window.show;if(typeof oldShow==='function'&&!oldShow.__mf51){let fn=function(v){let out=oldShow(v);setVersion();if(v==='control')renderControl51();if(v==='home')renderToday51(S.finance.control51.month);if(v==='wealth')renderWealthHistory51();if(v==='goals')goalAnalysis51();if(v==='businessplus')businessTrend51();if(v==='loans')loanCenter51();return out};fn.__mf51=true;window.show=fn}
window.renderControl51=renderControl51;
let st=document.createElement('style');st.textContent='.controlKpis51,.controlGrid51{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.controlKpis51>div,.controlGrid51>div{padding:12px;border-radius:12px;background:#f5f8fc;border:1px solid #e7edf5}.controlKpis51 small,.controlGrid51 small{display:block;color:#7b899d;font-size:9px;font-weight:700;letter-spacing:.035em}.controlKpis51 b,.controlGrid51 b{display:block;margin-top:5px;color:#2e496e;font-variant-numeric:tabular-nums}.controlKpis51 span,.controlGrid51 span{display:block;margin-top:4px;color:#8290a3;font-size:10px}.controlEm51{background:#eef4ff!important;border-color:#dbe7f6!important}.closeList51{display:grid;gap:7px}.closeItem51{display:grid;grid-template-columns:24px 1fr auto;gap:8px;align-items:center;width:100%;border:1px solid #e3e9f2;background:#fff;border-radius:11px;padding:10px 12px;text-align:left;color:#53657d}.closeItem51.done{background:#eef8f2;border-color:#d5eadc}.closeItem51 small{color:#8a97a8}.closeItem51:disabled{opacity:.9}.allocation51{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.allocation51>div{padding:12px;border:1px solid #e4eaf2;border-radius:12px}.allocation51 span,.allocation51 small{display:block;color:#7c899c}.allocation51 b{display:block;margin:5px 0;color:#315275}.wealthChart51{overflow:auto}.wealthChart51 svg{display:block;min-width:620px;width:100%}.goalPace51{display:grid;grid-template-columns:1fr auto;gap:4px 12px;padding:12px 0;border-bottom:1px solid #e7edf4}.goalPace51 small,.goalPace51 span{color:#7d8b9e;font-size:11px}.goalPace51 strong{color:#315f9f}.bizTrendBars51{display:flex;align-items:end;gap:8px;height:120px;margin-top:14px;padding:10px;border-top:1px solid #e6ebf2;overflow-x:auto}.bizTrendBars51>div{display:grid;align-items:end;justify-items:center;min-width:34px;height:105px}.bizTrendBars51 i{display:block;width:18px;background:#7e68c6;border-radius:5px 5px 2px 2px}.bizTrendBars51 small{font-size:8px;color:#8492a4}.loanCenter51{margin-top:14px}.refiForm51{grid-template-columns:repeat(4,minmax(0,1fr))}.controlToday51{margin-top:12px}@media(max-width:760px){.controlKpis51,.controlGrid51{grid-template-columns:repeat(2,minmax(0,1fr))}.refiForm51{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:520px){.controlKpis51,.controlGrid51,.allocation51,.refiForm51{grid-template-columns:1fr}.closeItem51{grid-template-columns:22px 1fr}.closeItem51 small{grid-column:2}}';document.head.appendChild(st);
})();
