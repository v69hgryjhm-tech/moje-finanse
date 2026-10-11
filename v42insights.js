/* Moje Finanse 4.2 — audyt, brakujące moduły i analizy finansowe */
(function(){
'use strict';
const VERSION='4.8.2',G=id=>document.getElementById(id),N=v=>+v||0,R2=v=>Math.round((N(v)+Number.EPSILON)*100)/100;
const PLN=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(N(v));
const FULL=['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>typeof TODAY==='string'?TODAY:new Date().toISOString().slice(0,10);
let salaryCache=new Map(),companyCache=new Map();
function clearCalcCache(){salaryCache=new Map();companyCache=new Map()}
const key=(y,m)=>`${y}-${String(m+1).padStart(2,'0')}`;
const parse=k=>{let [y,m]=String(k||today().slice(0,7)).split('-').map(Number);return{y:y||new Date().getFullYear(),m:Math.max(0,(m||1)-1)}};
function addMonth(k,d){let {y,m}=parse(k),x=new Date(y,m+d,1,12);return key(x.getFullYear(),x.getMonth())}
function ensure(){if(typeof S==='undefined')return false;S.finance||={};let f=S.finance;f.assets||=[];f.goals||=[];f.expenses||=[];f.informalDebts||=[];f.calendarEvents||=[];f.selectedMonth||=today().slice(0,7);f.analysisMonth||=f.selectedMonth;f.emergencySavings=N(f.emergencySavings);f.emergencyTargetMonths=N(f.emergencyTargetMonths)||6;f.ppkOpening=N(f.ppkOpening);return true}
function setVersion(){document.title='Moje Finanse '+VERSION;let h=document.querySelector('.top small');if(h)h.innerHTML=`<span id="headerYear">${typeof S!=='undefined'?S.selectedYear:''}</span> • wersja ${VERSION}`;document.documentElement.dataset.appVersion=VERSION}
function inMonth(e,k){if(e?.active===false)return false;if(e?.kind==='once')return e.month===k;return(!e?.from||k>=e.from)&&(!e?.to||k<=e.to)}
function expenseRows(k){return(S.finance.expenses||[]).filter(e=>inMonth(e,k))}
function expenseSplit(k){let recurring=0,once=0;expenseRows(k).forEach(e=>{if(e.kind==='once')once+=N(e.amount);else recurring+=N(e.amount)});return{recurring,once,total:recurring+once}}
function currentBalance(l){try{return N(loanPoint(l).balance)}catch{return N(l?.balance)}}
function informalRemaining(d){return Math.max(0,N(d.amount)-(d.payments||[]).reduce((a,p)=>a+N(p.amount),0))}
function loanMonth(l,k){
 let h=(l.history||[]).find(x=>x.month===k);
 if(h){let reg=typeof h.paid==='boolean'?(h.paid?N(h.regularPaid||l.payment):0):N(h.regularPaid!=null?h.regularPaid:h.paid),extra=h.isOverpayment===false?0:N(h.extra);return{amount:reg+extra,done:!!h.paid,actual:true}}
 try{if(typeof sched==='function'){let rows=sched(l,N(l.extraMonthly),N(l.oneOff)).rows||[],r=rows.find(x=>x.date&&key(x.date.getFullYear(),x.date.getMonth())===k);if(r)return{amount:N(r.regular)+N(r.extra),done:false,actual:r.kind==='actual'};return null}}catch{}
 if(k<(l.asOfDate||'0000-00-00').slice(0,7)||currentBalance(l)<=0)return null;
 return{amount:N(l.payment)+N(l.extraMonthly),done:false,actual:false}
}
function loanSpend(k){return(S.loans||[]).reduce((sum,l)=>{let p=loanMonth(l,k);return sum+(p?N(p.amount):0)},0)}
function salaryAt(y,m){
 if(!salaryCache.has(y)){
  let old=S.selectedYear,rows=[];
  try{S.selectedYear=y;window.mfTaxSync41?.(y);Y();rows=typeof sal==='function'?(sal().rows||[]):[]}catch{rows=[]}finally{S.selectedYear=old;window.mfTaxSync41?.(old)}
  salaryCache.set(y,rows)
 }
 return salaryCache.get(y)?.[m]||{total:0,g:0,pe:0,er:0,actual:false}
}
function companyAt(y,m){
 let raw=S.years?.[String(y)]?.company?.[m]||{},rev=N(raw.revenue),cost=N(raw.costs),vat=(N(raw.vatOut)||N(raw.vatIn))?N(raw.vatOut)-N(raw.vatIn):N(raw.vat),zus=N(raw.zus),health=N(raw.health),tax=N(raw.tax),actual=!!(rev||cost||vat||zus||health||tax);
 let ar=(S.years?.[String(y)]?.company||[]).filter(r=>N(r.revenue)||N(r.costs)||N(r.vat)||N(r.vatOut)||N(r.vatIn)||N(r.zus)||N(r.health)||N(r.tax)),avgCharges=ar.length?ar.reduce((a,r)=>a+N(r.zus)+N(r.health)+N(r.tax),0)/ar.length:0;
 if(actual){let rg=N(raw.revenueGross)||rev+Math.max(0,N(raw.vatOut)),cg=N(raw.costsGross)||cost+Math.max(0,N(raw.vatIn)),profit=rg-cg-Math.max(0,vat)-zus-health-tax;return{actual,rev,cost,vat,zus,health,tax,profit}};
 if(!companyCache.has(y)){let old=S.selectedYear,rows=[];try{S.selectedYear=y;Y();rows=typeof comp==='function'?(comp().rows||[]):[]}catch{rows=[]}finally{S.selectedYear=old;window.mfTaxSync41?.(old)}companyCache.set(y,rows)}
 let forecast=companyCache.get(y)?.[m]||{revenue:0,costs:0,vat:0};rev=N(forecast.revenue);cost=N(forecast.costs);vat=N(forecast.vat);
 return{actual:false,rev,cost,vat,zus:0,health:0,tax:0,profit:rev-cost-avgCharges}
}
function monthData(k){
 let {y,m}=parse(k),s=salaryAt(y,m),c=companyAt(y,m),e=expenseSplit(k),lo=loanSpend(k),actualIncome=(s.actual?N(s.total):0)+(c.actual?N(c.profit):0),forecastIncome=(s.actual?0:N(s.total))+(c.actual?0:N(c.profit)),totalIncome=actualIncome+forecastIncome;
 return{k,y,m,s,c,e,lo,actualIncome,forecastIncome,totalIncome,freeActual:actualIncome-e.total-lo,freeForecast:totalIncome-e.total-lo}
}
function ppkTotalActual(){
 let total=N(S.finance.ppkOpening),cy=new Date().getFullYear(),cm=new Date().getMonth();
 Object.keys(S.years||{}).sort().forEach(yy=>{let y=+yy;if(y>cy)return;let old=S.selectedYear;try{S.selectedYear=y;window.mfTaxSync41?.(y);Y();let rows=typeof sal==='function'?sal().rows:[];rows.forEach((r,i)=>{if(r.actual&&(y<cy||i<=cm))total+=N(r.pe)+N(r.er)})}catch{}finally{S.selectedYear=old;window.mfTaxSync41?.(old)}});return total
}
function liabilities(){let bank=(S.loans||[]).reduce((a,l)=>a+currentBalance(l),0),informal=(S.finance.informalDebts||[]).reduce((a,d)=>a+informalRemaining(d),0);return{bank,informal,total:bank+informal}}
function renderWealth42(){
 let h=G('wealthBody');if(!h||!ensure())return;let assets=S.finance.assets||[],a=assets.reduce((s,x)=>s+N(x.value),0),ppk=ppkTotalActual(),d=liabilities(),net=a+ppk-d.total;
 h.innerHTML=`<div class="wealthHero"><small>WARTOŚĆ NETTO — PEŁNY OBRAZ</small><h2>${PLN(net)}</h2><span>aktywa ${PLN(a)} + PPK ${PLN(ppk)} − zobowiązania ${PLN(d.total)}</span></div>
 <div class="grid"><div class="tile"><small>AKTYWA</small><b>${PLN(a)}</b></div><div class="tile"><small>PPK EST.</small><b>${PLN(ppk)}</b></div><div class="tile"><small>KREDYTY</small><b>${PLN(d.bank)}</b></div><div class="tile"><small>0% / BEZ TERMINU</small><b>${PLN(d.informal)}</b></div></div>
 <div class="card"><div class="title">Majątek <button class="btn primary" onclick="assetModal42()">＋ Dodaj aktywo</button></div>${assets.length?assets.map((x,i)=>`<div class="budgetRow"><div><b>${esc(x.name)}</b><small>${esc(x.type||'Inne')}</small></div><b>${PLN(x.value)}</b><button class="btn danger" onclick="removeAsset42(${i})">Usuń</button></div>`).join(''):'<p class="muted">Dodaj gotówkę, konta, inwestycje, auto lub nieruchomość.</p>'}</div>
 <div id="wealthDebt41" class="card"><div class="title">Zobowiązania poza kredytami</div><div class="row"><span>Do oddania 0%, bez terminu</span><b>${PLN(d.informal)}</b></div></div>
 <div class="card"><div class="title">PPK — stan do majątku</div><div class="row"><span>Saldo bazowe</span><b>${PLN(S.finance.ppkOpening)}</b></div><div class="row"><span>+ rzeczywiste wpłaty z aplikacji</span><b>${PLN(Math.max(0,ppk-N(S.finance.ppkOpening)))}</b></div><button class="btn" onclick="ppkBaseModal42()">Zmień saldo bazowe</button></div>`}
window.assetModal42=function(){open(`<h2>Dodaj aktywo</h2><div class="form"><label>Nazwa<input id="a42n"></label><label>Typ<select id="a42t"><option>Gotówka</option><option>Konto</option><option>Oszczędności</option><option>Inwestycje</option><option>Auto</option><option>Nieruchomość</option><option>Sprzęt</option><option>Inne</option></select></label><label>Wartość<input id="a42v" type="number" step="0.01"></label></div><div class="actions"><button class="btn" onclick="closeModal()">Anuluj</button><button class="btn primary" onclick="saveAsset42()">Zapisz</button></div>`)};
window.saveAsset42=function(){let v=N(G('a42v')?.value);S.finance.assets.push({name:G('a42n')?.value?.trim()||'Aktywo',type:G('a42t')?.value||'Inne',value:v});save();closeModal();renderWealth42();renderRadar42()};
window.removeAsset42=function(i){if(confirm('Usunąć aktywo?')){S.finance.assets.splice(i,1);save();renderWealth42();renderRadar42()}};
window.ppkBaseModal42=function(){open(`<h2>Saldo bazowe PPK</h2><p class="muted">To kwota startowa. Aplikacja dodaje do niej rzeczywiste wpłaty PPK z zapisanych wypłat.</p><label>Saldo bazowe<input id="ppk42base" type="number" step="0.01" value="${N(S.finance.ppkOpening)}"></label><button class="btn primary" onclick="savePpkBase42()">Zapisz</button>`)};
window.savePpkBase42=function(){S.finance.ppkOpening=N(G('ppk42base')?.value);save();closeModal();renderWealth42()};

function renderGoals42(){
 let h=G('goalsBody');if(!h||!ensure())return;let gs=S.finance.goals||[],now=new Date();
 h.innerHTML=`<div class="card"><div class="title">Cele finansowe <button class="btn primary" onclick="goalModal42()">＋ Dodaj cel</button></div>${gs.length?gs.map((g,i)=>{let target=Math.max(1,N(g.target)),cur=N(g.current),remain=Math.max(0,target-cur),pct=Math.min(100,cur/target*100),months=N(g.monthly)>0?Math.ceil(remain/N(g.monthly)):null,dueMonths=null;if(g.due){let [yy,mm]=g.due.split('-').map(Number);dueMonths=Math.max(0,(yy-now.getFullYear())*12+(mm-1-now.getMonth()))}let need=dueMonths>0?remain/dueMonths:null,status=need!=null?(N(g.monthly)>=need?'tempo wystarcza':'trzeba odkładać więcej'):'';return`<div class="goalCard"><div class="goalTop"><div><b>${esc(g.name)}</b><small>${g.due?'termin '+g.due:''}</small></div><strong>${pct.toFixed(0)}%</strong></div><div class="progress"><i style="width:${pct}%"></i></div><div class="goalStats"><span>${PLN(cur)} / ${PLN(target)}</span><span>brakuje ${PLN(remain)}</span><span>${months!=null?'~ '+months+' mies. przy '+PLN(g.monthly)+'/m':''}</span></div>${need!=null?`<div class="radar42 ${N(g.monthly)>=need?'ok':'warn'}"><b>${status}</b><span>aby zdążyć: około ${PLN(need)}/mies.</span></div>`:''}<div class="actions"><button class="btn" onclick="updateGoal42(${i})">Aktualizuj</button><button class="btn danger" onclick="removeGoal42(${i})">Usuń</button></div></div>`}).join(''):'<p class="muted">Dodaj np. poduszkę, mieszkanie, auto albo sprzęt.</p>'}</div>`
}
window.goalModal42=function(){open(`<h2>Nowy cel</h2><div class="form"><label>Nazwa<input id="g42n"></label><label>Kwota celu<input id="g42t" type="number"></label><label>Już odłożone<input id="g42c" type="number"></label><label>Miesięczna wpłata<input id="g42m" type="number"></label><label>Termin<input id="g42d" type="month"></label></div><button class="btn primary" onclick="saveGoal42()">Zapisz</button>`)};
window.saveGoal42=function(){S.finance.goals.push({name:G('g42n')?.value?.trim()||'Cel',target:N(G('g42t')?.value),current:N(G('g42c')?.value),monthly:N(G('g42m')?.value),due:G('g42d')?.value||''});save();closeModal();renderGoals42()};
window.updateGoal42=function(i){let g=S.finance.goals[i];open(`<h2>${esc(g.name)}</h2><div class="form"><label>Aktualnie odłożone<input id="g42u" type="number" value="${N(g.current)}"></label><label>Miesięczna wpłata<input id="g42um" type="number" value="${N(g.monthly)}"></label></div><button class="btn primary" onclick="saveGoalUpdate42(${i})">Zapisz</button>`)};
window.saveGoalUpdate42=function(i){let g=S.finance.goals[i];g.current=N(G('g42u')?.value);g.monthly=N(G('g42um')?.value);save();closeModal();renderGoals42()};
window.removeGoal42=function(i){if(confirm('Usunąć cel?')){S.finance.goals.splice(i,1);save();renderGoals42()}};

function renderEmergency42(){
 let h=G('emergencyBody');if(!h||!ensure())return;let k=S.finance.analysisMonth||S.finance.selectedMonth||today().slice(0,7),d=monthData(k),monthly=Math.max(0,d.e.recurring+d.lo),saved=N(S.finance.emergencySavings),months=Math.max(1,N(S.finance.emergencyTargetMonths)||6),target=monthly*months,covered=monthly?saved/monthly:0,stressMonthly=(d.e.recurring*1.1+d.lo),stressCovered=stressMonthly?saved/stressMonthly:0,p=target?Math.min(100,saved/target*100):0;
 h.innerHTML=`<div class="wealthHero"><small>PODUSZKA FINANSOWA</small><h2>${covered.toFixed(1)} mies.</h2><span>${PLN(saved)} / cel ${PLN(target)}</span></div><div class="card"><div class="progress"><i style="width:${p}%"></i></div><div class="goalStats"><span>stałe + raty ${PLN(monthly)}/m</span><span>cel ${months} mies.</span><span>brakuje ${PLN(Math.max(0,target-saved))}</span></div><div class="radar42 ${covered>=months?'ok':covered>=3?'mid':'warn'}"><b>Stress test kosztów +10%</b><span>poduszka wystarczy na około ${stressCovered.toFixed(1)} mies.</span></div><div class="form"><label>Płynne oszczędności<input id="em42s" type="number" step="0.01" value="${saved}"></label><label>Cel — miesiące<input id="em42m" type="number" min="1" value="${months}"></label></div><button class="btn primary" onclick="saveEmergency42()">Zapisz</button></div>`
}
window.saveEmergency42=function(){S.finance.emergencySavings=N(G('em42s')?.value);S.finance.emergencyTargetMonths=Math.max(1,N(G('em42m')?.value)||6);save();renderEmergency42();renderRadar42()};

function renderActions42(){
 let h=G('actionBody');if(!h||!ensure())return;
 let k=S.finance.analysisMonth||S.finance.selectedMonth||today().slice(0,7),d=monthData(k),items=[];
 expenseRows(k).forEach(e=>items.push({day:Math.max(1,N(e.day)||1),text:e.name,amount:N(e.amount),done:false,kind:e.kind==='once'?'jednorazowy':'stały'}));
 (S.loans||[]).forEach(l=>{let p=loanMonth(l,k);if(p)items.push({day:Math.max(1,N(l.dueDay)||1),text:'Rata '+l.name,amount:N(p.amount),done:!!p.done,kind:'kredyt'})});
 items.sort((x,y)=>x.day-y.day);
 h.innerHTML=`<div class="card"><div class="title">${FULL[d.m]} ${d.y} — plan płatności</div><div class="grid"><div class="tile"><small>WYDATKI</small><b>${PLN(d.e.total)}</b></div><div class="tile"><small>RATY</small><b>${PLN(d.lo)}</b></div><div class="tile"><small>PO PLANIE — FAKT</small><b class="${d.freeActual<0?'red':'green'}">${PLN(d.freeActual)}</b></div><div class="tile"><small>PO PLANIE — Z PROGNOZĄ</small><b class="${d.freeForecast<0?'red':'green'}">${PLN(d.freeForecast)}</b></div></div></div><div class="card">${items.length?items.map(x=>`<div class="action42 ${x.done?'done':''}"><b>${String(x.day).padStart(2,'0')}</b><div><strong>${esc(x.text)}</strong><small>${x.kind}${x.done?' • opłacone':''}</small></div><b>${PLN(x.amount)}</b></div>`).join(''):'<p class="muted">Brak zaplanowanych pozycji.</p>'}</div>`
}
function renderCalendar42(){
 let h=G('calendarBody');if(!h||!ensure())return;
 let k=S.finance.analysisMonth||S.finance.selectedMonth||today().slice(0,7),{y,m}=parse(k),days=new Date(y,m+1,0).getDate(),offset=(new Date(y,m,1).getDay()+6)%7,events={};
 let add=(d,label,kind,amount,done=false)=>{d=Math.max(1,Math.min(days,N(d)||1));(events[d]||=[]).push({label,kind,amount,done})};
 expenseRows(k).forEach(e=>add(e.day||1,e.name,e.kind==='once'?'custom':'expense',e.amount,false));
 (S.loans||[]).forEach(l=>{let p=loanMonth(l,k);if(p)add(l.dueDay||1,l.name,'loan',p.amount,p.done)});
 (S.finance.calendarEvents||[]).filter(e=>e.month===k).forEach(e=>add(e.day,e.name,'custom',e.amount,false));
 let cells='';for(let i=0;i<offset;i++)cells+='<div class="calDay empty"></div>';for(let d=1;d<=days;d++)cells+=`<div class="calDay"><b>${d}</b>${(events[d]||[]).map(e=>`<span class="calEvent ${e.kind}" style="${e.done?'opacity:.5;text-decoration:line-through':''}">${esc(e.label)}${N(e.amount)?' • '+PLN(e.amount):''}</span>`).join('')}</div>`;
 h.innerHTML=`<div class="card miniNav"><button class="btn" onclick="shiftAnalysis42(-1)">‹</button><b>${FULL[m]} ${y}</b><button class="btn" onclick="shiftAnalysis42(1)">›</button><button class="btn primary" onclick="calendarEventModal42()">＋ Wydarzenie</button></div><div class="card"><div class="calWeek"><span>Pn</span><span>Wt</span><span>Śr</span><span>Cz</span><span>Pt</span><span>So</span><span>Nd</span></div><div class="calendarGrid">${cells}</div></div>`
}
window.shiftAnalysis42=function(d){S.finance.analysisMonth=addMonth(S.finance.analysisMonth||today().slice(0,7),d);save();renderCalendar42();renderActions42();renderEmergency42()};
window.calendarEventModal42=function(){let k=S.finance.analysisMonth||today().slice(0,7);open(`<h2>Wydarzenie finansowe</h2><div class="form"><label>Miesiąc<input id="ce42m" type="month" value="${k}"></label><label>Dzień<input id="ce42d" type="number" min="1" max="31" value="1"></label><label>Nazwa<input id="ce42n"></label><label>Kwota opcjonalna<input id="ce42a" type="number" step="0.01"></label></div><div class="actions"><button class="btn" onclick="closeModal()">Anuluj</button><button class="btn primary" onclick="saveCalendarEvent42()">Zapisz</button></div>`)};
window.saveCalendarEvent42=function(){let name=G('ce42n')?.value?.trim()||'Wydarzenie';S.finance.calendarEvents.push({month:G('ce42m')?.value||S.finance.analysisMonth,day:Math.max(1,Math.min(31,N(G('ce42d')?.value)||1)),name,amount:N(G('ce42a')?.value)});save();closeModal();renderCalendar42()};

function trendRows(k,count=6){let a=[];for(let i=count-1;i>=0;i--){let mk=addMonth(k,-i),d=monthData(mk);a.push(d)}return a}
function renderMonthly42(){
 let h=G('monthlyBody');if(!h||!ensure())return;let k=S.finance.selectedMonth||today().slice(0,7),d=monthData(k),trend=trendRows(k,6),incomeBase=d.totalIncome,burden=incomeBase>0?(d.e.recurring+d.lo)/incomeBase*100:0,freeRate=incomeBase>0?d.freeForecast/incomeBase*100:0;
 h.innerHTML=`<div class="card miniNav"><button class="btn" onclick="shiftMonth42(-1)">‹</button><b>${FULL[d.m]} ${d.y}</b><button class="btn" onclick="shiftMonth42(1)">›</button></div><div class="v25Kpis"><div><small>DOCHODY — FAKT</small><b class="green">${PLN(d.actualIncome)}</b></div><div><small>STAŁE</small><b>${PLN(d.e.recurring)}</b></div><div><small>JEDNORAZOWE</small><b>${PLN(d.e.once)}</b></div><div><small>KREDYTY</small><b>${PLN(d.lo)}</b></div></div>
 <div class="card"><div class="title">Przepływ miesiąca <span class="pill">fakt i prognoza osobno</span></div><div class="row"><span>Etat ${d.s.actual?'• fakt':'• prognoza'}</span><b>${PLN(d.s.total)}</b></div><div class="row"><span>Firma ${d.c.actual?'• fakt':'• prognoza'}</span><b>${PLN(d.c.profit)}</b></div><div class="row"><span>Wydatki razem</span><b>− ${PLN(d.e.total)}</b></div><div class="row"><span>Raty + planowane nadpłaty</span><b>− ${PLN(d.lo)}</b></div><div class="row"><span><b>Zostaje — tylko fakt</b></span><b class="${d.freeActual<0?'red':'green'}">${PLN(d.freeActual)}</b></div>${d.forecastIncome?`<div class="forecastBox42"><small>PROGNOZOWANY DODATKOWY DOCHÓD</small><b>+ ${PLN(d.forecastIncome)}</b><span>z prognozą zostanie ${PLN(d.freeForecast)}</span></div>`:''}</div>
 <div class="grid"><div class="tile"><small>STAŁE OBCIĄŻENIA / DOCHÓD</small><b>${burden.toFixed(1)}%</b></div><div class="tile"><small>WOLNA GOTÓWKA / DOCHÓD</small><b class="${freeRate<0?'red':'green'}">${freeRate.toFixed(1)}%</b></div></div>
 <div class="card"><div class="title">Trend 6 miesięcy</div>${trend.map(x=>`<div class="trend42"><span>${FULL[x.m].slice(0,3)} ${String(x.y).slice(-2)}</span><i><b style="width:${Math.max(0,Math.min(100,(x.totalIncome?Math.max(0,x.freeForecast)/x.totalIncome*100:0)))}%"></b></i><strong class="${x.freeForecast<0?'red':'green'}">${PLN(x.freeForecast)}</strong></div>`).join('')}</div>`
}
window.shiftMonth42=function(d){clearCalcCache();S.finance.selectedMonth=addMonth(S.finance.selectedMonth||today().slice(0,7),d);S.finance.analysisMonth=S.finance.selectedMonth;save();renderMonthly42();renderActions42();renderEmergency42();renderRadar42()};

function recentActualMonths(count=3){let out=[],cy=S.selectedYear;for(let i=11;i>=0&&out.length<count;i--){let d=monthData(key(cy,i));if(d.s.actual||d.c.actual)out.push(d)}return out.reverse()}
function renderRadar42(){
 let home=G('home');if(!home||!ensure())return;let id='radarHome42',box=G(id);if(!box){box=document.createElement('div');box.id=id;box.className='card';let anchor=home.querySelector('.hero');anchor?.insertAdjacentElement('afterend',box)}
 if(!box)return;let rs=recentActualMonths(3),avgIncome=rs.length?rs.reduce((a,d)=>a+d.actualIncome,0)/rs.length:0,avgObl=rs.length?rs.reduce((a,d)=>a+d.e.recurring+d.lo,0)/rs.length:0,avgFree=avgIncome-avgObl,ratio=avgIncome>0?avgObl/avgIncome*100:0,debt=liabilities().total,saved=N(S.finance.emergencySavings),runway=avgObl>0?saved/avgObl:0,status=ratio<=50?'duży margines':ratio<=70?'umiarkowany margines':'wysokie obciążenia';
 box.innerHTML=`<div class="title">Finansowy radar <span class="pill">ostatnie ${rs.length||0} wpisane mies.</span></div><div class="grid"><div class="tile"><small>ŚR. DOCHÓD FAKT</small><b>${PLN(avgIncome)}</b></div><div class="tile"><small>STAŁE + RATY</small><b>${PLN(avgObl)}</b></div><div class="tile"><small>MARGINES / MIES.</small><b class="${avgFree<0?'red':'green'}">${PLN(avgFree)}</b></div><div class="tile"><small>OBCIĄŻENIA / DOCHÓD</small><b>${ratio.toFixed(1)}%</b></div></div><div class="radar42 ${ratio<=50?'ok':ratio<=70?'mid':'warn'}"><b>${status}</b><span>poduszka: ${runway.toFixed(1)} mies. stałych obciążeń • łączne zadłużenie ${PLN(debt)}</span></div>`
}

function renderDiagnostics42(){
 let sec=G('settings');if(!sec||!ensure())return;let id='diag42',box=G(id);if(!box){box=document.createElement('div');box.id=id;box.className='card';sec.appendChild(box)}
 let tests=[],add=(n,ok,txt)=>tests.push({n,ok:!!ok,txt});
 let yr=S.years?.[String(S.selectedYear)];add('12 miesięcy etatu',yr?.salary?.length===12,yr?.salary?.length+' / 12');add('12 miesięcy firmy',yr?.company?.length===12,yr?.company?.length+' / 12');
 try{let p=sal();add('Silnik etatu',p?.rows?.length===12,(p?.rows?.length||0)+' / 12')}catch(e){add('Silnik etatu',false,'błąd')}
 try{let c=comp();add('Silnik firmy',c?.rows?.length===12,(c?.rows?.length||0)+' / 12')}catch(e){add('Silnik firmy',false,'błąd')}
 add('Wydatki',Array.isArray(S.finance.expenses),String(S.finance.expenses?.length||0));add('Kredyty',Array.isArray(S.loans),String(S.loans?.length||0));
 add('Podatki per rok',!!S.finance.taxByYear?.[String(S.selectedYear)],S.finance.taxByYear?.[String(S.selectedYear)]?'OK':'brak profilu');
 let badExp=(S.finance.expenses||[]).filter(e=>N(e.amount)<0||(!e.name)).length;add('Spójność wydatków',badExp===0,badExp?'problemy: '+badExp:'OK');
 let badLoans=(S.loans||[]).filter(l=>currentBalance(l)<0||N(l.payment)<0).length;add('Spójność kredytów',badLoans===0,badLoans?'problemy: '+badLoans:'OK');
 try{let t='mf42-test',v=String(Date.now());localStorage.setItem(t,v);let ok=localStorage.getItem(t)===v;localStorage.removeItem(t);add('Zapis lokalny',ok,ok?'OK':'błąd')}catch{add('Zapis lokalny',false,'błąd')}
 let ok=tests.filter(x=>x.ok).length;box.innerHTML=`<div class="title">Diagnostyka aplikacji <span class="pill">${ok}/${tests.length} OK</span></div>${tests.map(t=>`<div class="row"><span>${t.ok?'✓':'⚠'} ${t.n}</span><b class="${t.ok?'green':'red'}">${esc(t.txt)}</b></div>`).join('')}<p class="muted">Test sprawdza strukturę danych, główne silniki i zapis lokalny. Nie zastępuje testu interakcji w Safari/iOS.</p>`
}
function renderAll42(){if(!ensure())return;clearCalcCache();setVersion();renderWealth42();renderGoals42();renderEmergency42();renderActions42();renderMonthly42();renderCalendar42();renderRadar42();renderDiagnostics42()}
function hook(){if(!ensure())return;let r=window.render;if(typeof r==='function'&&!r.__mf42){let fn=function(){let out=r();renderAll42();return out};fn.__mf42=true;window.render=fn}let s=window.show;if(typeof s==='function'&&!s.__mf42){let fn=function(v){let out=s(v);renderAll42();return out};fn.__mf42=true;window.show=fn}renderAll42()}
let st=document.createElement('style');st.textContent=`.forecastBox42{margin-top:10px;padding:12px;border:1px dashed #aebbd0;border-radius:12px;background:#f8faff}.forecastBox42 small,.forecastBox42 span{display:block;color:#6e7c91}.forecastBox42 b{display:block;font-size:20px;margin:4px 0}.radar42{margin-top:10px;padding:10px 12px;border-radius:12px;background:#f5f7fb;display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap}.radar42.ok{background:#e8f7ee;color:#247548}.radar42.mid{background:#fff6df;color:#7a5b18}.radar42.warn{background:#fdebed;color:#9d3440}.trend42{display:grid;grid-template-columns:62px 1fr auto;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid #edf1f6}.trend42 i{height:8px;border-radius:99px;background:#e8edf4;overflow:hidden}.trend42 i b{display:block;height:100%;background:#31b86a;border-radius:99px}.action42{display:grid;grid-template-columns:34px 1fr auto;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid #edf1f6}.action42 small{display:block;color:#77849a}.action42.done{opacity:.55}.action42.done strong{text-decoration:line-through}@media(max-width:560px){.radar42{display:block}.radar42 span{display:block;margin-top:4px}.trend42{grid-template-columns:54px 1fr auto}}`;document.head.appendChild(st);
window.renderWealth42=renderWealth42;window.renderGoals42=renderGoals42;window.renderEmergency42=renderEmergency42;window.renderActions42=renderActions42;window.renderMonthly42=renderMonthly42;window.renderCalendar42=renderCalendar42;window.renderRadar42=renderRadar42;window.renderDiagnostics42=renderDiagnostics42;
window.addEventListener('finance-modules-ready',hook,{once:true});
})();
