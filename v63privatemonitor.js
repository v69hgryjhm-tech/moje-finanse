/* Moje Finanse 5.9 — prywatne finanse jako monitoring, nie budżet domowy */
(function(){
'use strict';
const VERSION='5.9.0',G=id=>document.getElementById(id),N=v=>+v||0;
const PLN=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:0,maximumFractionDigits:0}).format(N(v));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function key(y,m){return String(y)+'-'+String(m+1).padStart(2,'0')}
function nowKey(){let d=new Date();return key(d.getFullYear(),d.getMonth())}
function parse(k){let [y,m]=String(k||'').split('-').map(Number);return{y:y||new Date().getFullYear(),m:Math.max(0,(m||1)-1)}}
function ensure63(){if(typeof S==='undefined')return false;S.finance||={};S.finance.privateMode='monitoring';return true}
function loanBalance(l){try{return N(window.loanCurrentPoint15?.(l)?.balance)}catch{return N(l?.balance)}}
function loanMonth(l,k){
 try{
  let rows=(window.loanTimeline15?.(l,true)?.rows||[]).filter(r=>key(r.date.getFullYear(),r.date.getMonth())===k);
  return rows.reduce((a,r)=>a+N(r.kind==='actual'?r.regularPaid:r.planned)+N(r.extra),0)
 }catch{return N(l?.payment)}
}
function salaryFor(k){
 let {y,m}=parse(k),old=S.selectedYear;
 try{S.selectedYear=y;window.mfTaxSync41?.(y);Y();let r=window.sal?.().rows?.[m];return{amount:N(r?.total),actual:!!r?.actual}}
 catch{return{amount:0,actual:false}}
 finally{S.selectedYear=old;window.mfTaxSync41?.(old)}
}
function privateSnapshot(k=nowKey()){
 let salary=salaryFor(k),loans=(S.loans||[]),loanMonthly=loans.reduce((a,l)=>a+loanMonth(l,k),0),debt=loans.reduce((a,l)=>a+loanBalance(l),0);
 let ppk=0;try{ppk=N(window.ppkTotalActual?.())}catch{}
 let goals=(S.finance.goals||[]).reduce((a,g)=>a+N(g.current),0);
 return{k,salary,loanMonthly,debt,ppk,goals,recurring:(S.finance.expenses||[]).filter(e=>e.active!==false&&e.kind!=='once').reduce((a,e)=>a+N(e.amount),0)}
}
function renderPrivateMonitor63(){
 let h=G('controlBody51');if(!h||!ensure63())return;
 ['privateMonitor63','autoControl56','plannerControl52','commandControl53'].forEach(id=>G(id)?.remove());
 let k=S.finance.control51?.month||nowKey(),x=privateSnapshot(k),box=document.createElement('section');box.id='privateMonitor63';box.className='card privateMonitor63';
 box.innerHTML='<div class="title">Finanse prywatne — monitoring <span class="pill green">bez budżetu domowego</span></div><p class="muted">Aplikacja nie zakłada, że wpisujesz każdy zakup. Dlatego nie liczy „ile zostało do wydania” ani prywatnej nadwyżki. Pokazuje tylko dane, które faktycznie prowadzisz.</p><div class="privateGrid63"><div><small>ETAT — WPŁYW / PROGNOZA</small><b>'+PLN(x.salary.amount)+'</b><span>'+(x.salary.actual?'wpisana wypłata':'prognoza')+'</span></div><div><small>RATY I NADPŁATY W MIESIĄCU</small><b>'+PLN(x.loanMonthly)+'</b><span>z harmonogramów kredytów</span></div><div><small>SALDO KREDYTÓW</small><b>'+PLN(x.debt)+'</b><span>stan kapitału</span></div><div><small>ZAPISANE STAŁE ZOBOWIĄZANIA</small><b>'+PLN(x.recurring)+'</b><span>opcjonalne — tylko to, co chcesz śledzić</span></div></div><div class="privateNote63"><b>Nie liczymy prywatnego „zostaje X zł”.</b><span>Codzienne zakupy, jedzenie, paliwo i inne zmienne wydatki nie muszą być wpisywane do aplikacji.</span></div>';
 h.prepend(box)
}
function renderMonthlyMonitor63(){
 let h=G('monthlyBody');if(!h||!ensure63())return;
 let k=S.finance.selectedMonth||nowKey(),x=privateSnapshot(k);
 h.innerHTML='<div class="card"><div class="title">Pulpit prywatny — '+esc(k)+' <span class="pill">monitoring</span></div><div class="privateGrid63"><div><small>ETAT</small><b>'+PLN(x.salary.amount)+'</b><span>'+(x.salary.actual?'wpisane':'prognoza')+'</span></div><div><small>KREDYTY W MIESIĄCU</small><b>'+PLN(x.loanMonthly)+'</b></div><div><small>SALDO KREDYTÓW</small><b>'+PLN(x.debt)+'</b></div><div><small>STAŁE ZOBOWIĄZANIA — WPISANE</small><b>'+PLN(x.recurring)+'</b></div></div><p class="muted">To nie jest budżet domowy. Brak codziennych wydatków jest zamierzony i nie obniża żadnego wyniku ani score.</p></div>'
}
function renderActions63(){
 let h=G('actionBody');if(!h||!ensure63())return;
 let k=nowKey(),x=privateSnapshot(k),items=[];
 let up=window.mfControl51?.upcoming?.(k)||[],today=new Date().getDate(),soon=up.filter(z=>z.day>=today&&z.day<=today+7);
 if(soon.length)items.push({p:1,title:'Najbliższe zapisane płatności',text:soon.length+' pozycji w ciągu 7 dni na '+PLN(soon.reduce((a,z)=>a+N(z.amount),0)),go:"show('calendar')"});
 let loans=(S.loans||[]).filter(l=>loanBalance(l)>0).sort((a,b)=>N(b.rate)-N(a.rate));if(loans[0]&&N(loans[0].rate)>=7)items.push({p:2,title:'Kredyt do obserwacji',text:esc(loans[0].name)+' • '+N(loans[0].rate).toFixed(2)+'% • saldo '+PLN(loanBalance(loans[0])),go:"show('loans')"});
 let goals=(S.finance.goals||[]).filter(g=>N(g.target)>N(g.current));if(goals.length)items.push({p:3,title:'Cele finansowe',text:goals.length+' aktywne cele — aktualizuj tylko wtedy, kiedy faktycznie coś odłożysz.',go:"show('goals')"});
 h.innerHTML='<div class="card"><div class="title">Plan działania <span class="pill">tylko dane prowadzone</span></div><p class="muted">Brak zadań typu „zmniejsz wydatki” lub „dołóż do poduszki”, bo aplikacja nie zna pełnego budżetu domowego.</p>'+(items.length?'<div class="monitorActions63">'+items.map(z=>'<button onclick="'+z.go+'"><span>'+z.p+'</span><div><b>'+z.title+'</b><small>'+z.text+'</small></div></button>').join('')+'</div>':'<div class="privateNote63"><b>Brak pilnych działań.</b><span>Nie generuję sztucznych zadań na podstawie niepełnych wydatków prywatnych.</span></div>')+'</div>'
}
function renderAutopilot63(){
 let h=G('autopilotBody56');if(!h||!ensure63())return;
 let loans=(S.loans||[]).filter(l=>loanBalance(l)>0).sort((a,b)=>N(b.rate)-N(a.rate)),top=loans[0];
 h.innerHTML='<section class="card"><div class="title">Autopilot prywatny <span class="pill">decyzje, nie podział pensji</span></div><p class="muted">Autopilot nie rozdziela już prywatnej pensji na „poduszkę / inwestycje / cele”, ponieważ aplikacja nie zna wszystkich Twoich wydatków. Zamiast tego pokazuje decyzje oparte na danych, które faktycznie prowadzisz.</p><div class="privateGrid63"><div><small>NAJWYŻSZE OPROCENTOWANIE</small><b>'+(top?N(top.rate).toFixed(2)+'%':'—')+'</b><span>'+(top?esc(top.name):'brak kredytów')+'</span></div><div><small>ŁĄCZNE SALDO KREDYTÓW</small><b>'+PLN(loans.reduce((a,l)=>a+loanBalance(l),0))+'</b></div><div><small>AKTYWNE CELE</small><b>'+((S.finance.goals||[]).filter(g=>N(g.target)>N(g.current)).length)+'</b></div><div><small>INWESTYCJE / PPK</small><b>śledź stan</b><span>bez narzucania miesięcznej kwoty</span></div></div></section>'
}
function renderMissionPrivate63(){
 let host=G('missionHome57');if(!host||!ensure63())return false;
 let k=nowKey(),x=privateSnapshot(k),company=window.mfCommand53?.companyBreakEven?.(),companyOk=company?.ok;
 host.innerHTML='<div class="missionHero57"><div class="missionHeroCopy57"><small>Centrum dowodzenia • monitoring</small><h2>Etat, firma i zobowiązania — bez liczenia każdej złotówki.</h2><p>Prywatnie śledzę wpływy, kredyty i majątek. Firma nadal jest liczona dokładnie, bo tam prowadzisz sprzedaż i koszty.</p><div class="missionHeroActions57"><button class="btn primary" onclick="show(\\'control\\')">🧭 Finanse prywatne</button><button class="btn" onclick="show(\\'businessplus\\')">🏢 MOHE</button></div></div></div><div class="missionDomains57"><section class="missionCard57 domain57"><div class="missionTitle57"><div><small>JA / FINANSE PRYWATNE</small><b>monitoring uproszczony</b></div></div><div class="domainKpis57"><div><span>Etat — miesiąc</span><b>'+PLN(x.salary.amount)+'</b></div><div><span>Saldo kredytów</span><b>'+PLN(x.debt)+'</b></div><div><span>Raty / nadpłaty</span><b>'+PLN(x.loanMonthly)+'</b></div></div><p class="muted">Nie pokazuję „ile zostało”, bo nie wpisujesz wszystkich codziennych wydatków.</p><button class="missionLink57" onclick="show(\\'control\\')">Otwórz monitoring prywatny ›</button></section><section class="missionCard57 domain57"><div class="missionTitle57"><div><small>MOHE / FIRMA</small><b>'+(companyOk?'pełny przepływ':'uzupełnij dane')+'</b></div></div><div class="domainKpis57"><div><span>Sprzedaż netto</span><b>'+PLN(company?.sales)+'</b></div><div><span>Bezpieczny próg</span><b>'+PLN(company?.safe)+'</b></div><div><span>Margines</span><b class="'+(N(company?.margin)>=0?'green':'red')+'">'+PLN(company?.margin)+'</b></div></div><p class="muted">Firma pozostaje liczona dokładnie: sprzedaż, koszty, podatki i wynik.</p><button class="missionLink57" onclick="show(\\'businessplus\\')">Otwórz MOHE ›</button></section></div><section class="missionCard57"><div class="missionTitle57"><div><small>CO WARTO SPRAWDZIĆ</small><b>Zapisane zobowiązania i terminy</b></div><button class="btn" onclick="show(\\'calendar\\')">Kalendarz ›</button></div><p class="muted">Aplikacja przypomina o kredytach, podatkach firmy i zapisanych większych płatnościach — nie o codziennych zakupach.</p></section>';
 return true
}
function hideEmergency63(){
 let s=G('emergency');if(s)s.hidden=true;
 document.querySelectorAll('[onclick*="show(\\'emergency\\')"]').forEach(b=>b.style.display='none');
}
function install63(){
 ensure63();hideEmergency63();
 if(window.mfMission57)window.mfMission57.render=()=>renderMissionPrivate63();
 if(window.mfPlanner52){
  window.mfPlanner52.renderHome=()=>{};
  window.mfPlanner52.renderControl=()=>{};
 }
 if(window.mfCommand53){
  window.mfCommand53.renderHome=()=>{};
  window.mfCommand53.renderControl=()=>{};
 }
 if(window.mfOps54){
  window.mfOps54.renderActions=renderActions63;
  window.mfOps54.renderControl=()=>{};
 }
 if(window.mfAutopilot56){
  window.mfAutopilot56.renderAutopilot=renderAutopilot63;
  window.mfAutopilot56.renderHome=()=>{};
  window.mfAutopilot56.renderControl=()=>{};
 }
 window.renderPrivateMonitor63=renderPrivateMonitor63;
 window.renderMonthlyMonitor63=renderMonthlyMonitor63;
}
window.mfPrivate63={snapshot:privateSnapshot,renderControl:renderPrivateMonitor63,renderMonthly:renderMonthlyMonitor63,renderActions:renderActions63,renderAutopilot:renderAutopilot63,renderMission:renderMissionPrivate63,install:install63};
window.addEventListener('finance-modules-ready',install63,{once:true});
let st=document.createElement('style');st.textContent='.privateGrid63{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:12px}.privateGrid63>div{padding:12px;border:1px solid #e4eaf2;border-radius:12px;background:#f7f9fc}.privateGrid63 small,.privateGrid63 span{display:block;color:#7c899c;font-size:9px}.privateGrid63 b{display:block;margin:5px 0;color:#315275}.privateNote63{margin-top:12px;padding:12px;border-radius:11px;background:#f4f7fb}.privateNote63 b,.privateNote63 span{display:block}.privateNote63 span{margin-top:4px;color:#77869a;font-size:10px}.monitorActions63{display:grid;gap:8px;margin-top:10px}.monitorActions63 button{display:grid;grid-template-columns:28px 1fr;gap:9px;align-items:center;text-align:left;border:1px solid #e4eaf2;background:#fff;border-radius:11px;padding:10px;cursor:pointer}.monitorActions63 button>span{width:24px;height:24px;display:grid;place-items:center;border-radius:8px;background:#edf3fa;color:#315f9f;font-weight:800}.monitorActions63 b,.monitorActions63 small{display:block}.monitorActions63 small{margin-top:3px;color:#7d899b}@media(max-width:760px){.privateGrid63{grid-template-columns:1fr 1fr}}@media(max-width:520px){.privateGrid63{grid-template-columns:1fr}}';document.head.appendChild(st);
})();