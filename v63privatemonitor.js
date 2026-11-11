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


function commitmentRow63(e,i){
 return '<div class="commitRow63"><div><b>'+esc(e.name||'Zobowiązanie')+'</b><small>'+esc(e.category||'Inne')+(e.kind==='once'?' • jednorazowe':' • stałe')+'</small></div><strong>'+PLN(e.amount)+'</strong><button class="btn danger" onclick="removeExpense34('+i+')">Usuń</button></div>'
}
function renderCommitments63(){
 let h=G('budgetBody');if(!h||!ensure63())return;
 let rows=(S.finance.expenses||[]).filter(e=>e.active!==false),rec=rows.filter(e=>e.kind!=='once'),once=rows.filter(e=>e.kind==='once');
 h.innerHTML='<section class="card"><div class="title">Stałe zobowiązania <span class="pill">opcjonalne</span></div><p class="muted">Wpisuj tylko większe lub stałe pozycje, które chcesz mieć pod kontrolą. Nie wpisuj zakupów spożywczych, paliwa ani codziennych wydatków, jeśli nie chcesz.</p><div class="privateGrid63"><div><small>STAŁE / MIES.</small><b>'+PLN(rec.reduce((a,e)=>a+N(e.amount),0))+'</b></div><div><small>LICZBA STAŁYCH POZYCJI</small><b>'+rec.length+'</b></div><div><small>JEDNORAZOWE ZAPISANE</small><b>'+once.length+'</b></div><div><small>WPŁYW NA „ILE ZOSTAŁO”</small><b>brak</b><span>informacyjnie, nie do budżetowania</span></div></div><div class="actions"><button class="btn primary" onclick="expenseModal34(\\'recurring\\')">＋ Dodaj stałe zobowiązanie</button><button class="btn" onclick="expenseModal34(\\'once\\')">＋ Dodaj większy jednorazowy koszt</button></div>'+(rows.length?'<div class="commitList63">'+rows.map((e,i)=>commitmentRow63(e,S.finance.expenses.indexOf(e))).join('')+'</div>':'<div class="privateNote63"><b>Nie musisz nic tu dodawać.</b><span>Ten moduł jest tylko opcjonalnym rejestrem większych zobowiązań.</span></div>')+'</section>'
}

function monitoringScore63(k=nowKey()){
 let x=privateSnapshot(k),salaryScore=x.salary.amount>0?(x.salary.actual?30:22):0;
 let debtShare=x.salary.amount>0?x.loanMonthly/x.salary.amount:0,debtScore=Math.round(Math.max(0,Math.min(1,(.55-debtShare)/.40))*30);
 let loans=S.loans||[],loanQuality=!loans.length?20:Math.round(loans.filter(l=>N(l.payment)>=0&&N(l.balance)>=0&&N(l.dueDay)>0).length/loans.length*20);
 let goals=(S.finance.goals||[]),goalScore=goals.length?10:6;
 let company=window.mfCommand53?.companyBreakEven?.(),companyScore=company?.ok?10:5;
 let total=Math.max(0,Math.min(100,salaryScore+debtScore+loanQuality+goalScore+companyScore));
 return{total,state:total>=80?'dane wyglądają dobrze':total>=60?'monitoring kompletny':total>=40?'część danych do uzupełnienia':'mało danych',parts:[
  {name:'Etat',score:salaryScore,max:30,detail:x.salary.actual?'wpisana wypłata':'prognoza / brak wpisu'},
  {name:'Obciążenie ratami',score:debtScore,max:30,detail:x.salary.amount?Math.round(debtShare*100)+'% etatu':'brak odniesienia'},
  {name:'Dane kredytów',score:loanQuality,max:20,detail:loans.length?loans.length+' kredyt(y)':'brak kredytów'},
  {name:'Cele',score:goalScore,max:10,detail:goals.length?goals.length+' aktywne':'opcjonalne'},
  {name:'Firma',score:companyScore,max:10,detail:company?.ok?'dane dostępne':'brak pełnych danych'}
 ],quality:{issues:[]},monitoring:true}
}
function periodMonitoring63(y,q=0){
 let months=q?[3*(q-1),3*(q-1)+1,3*(q-1)+2]:[0,1,2,3,4,5,6,7,8,9,10,11],salary=0,company=0,actualSalary=0,loanPaid=0;
 months.forEach(m=>{
  let k=key(y,m),s=salaryFor(k);salary+=N(s.amount);if(s.actual)actualSalary++;
  try{let r=S.years?.[String(y)]?.company?.[m],cs=window.mfCompanySummary44?.(r||{});company+=N(cs?.profit)}catch{}
  (S.loans||[]).forEach(l=>{try{let rows=(window.loanTimeline15?.(l,false)?.actual||[]).filter(r=>key(r.date.getFullYear(),r.date.getMonth())===k);loanPaid+=rows.reduce((a,r)=>a+N(r.regularPaid)+N(r.extra),0)}catch{}})
 });
 return{salary,company,actualSalary,loanPaid,months:months.length,debt:(S.loans||[]).reduce((a,l)=>a+loanBalance(l),0)}
}
function renderReview63(){
 let h=G('reviewBody55');if(!h||!ensure63())return;
 let y=N(S.finance.lab55?.reviewYear)||S.selectedYear||new Date().getFullYear(),q=N(S.finance.lab55?.reviewQuarter)||1,cur=periodMonitoring63(y,q),prev=periodMonitoring63(q===1?y-1:y,q===1?4:q-1);
 let pct=(a,b)=>b?((a-b)/Math.abs(b))*100:0;
 h.innerHTML='<section class="card"><div class="title">Review — Q'+q+' '+y+' <span class="pill">monitoring</span></div><div class="privateGrid63"><div><small>ETAT</small><b>'+PLN(cur.salary)+'</b><span>'+cur.actualSalary+'/'+cur.months+' mies. z wpisaną wypłatą</span></div><div><small>MOHE — WYNIK</small><b>'+PLN(cur.company)+'</b><span>'+(pct(cur.company,prev.company)>=0?'+':'')+pct(cur.company,prev.company).toFixed(1)+'% vs poprzedni kwartał</span></div><div><small>WPŁATY DO KREDYTÓW</small><b>'+PLN(cur.loanPaid)+'</b><span>raty + nadpłaty wykonane</span></div><div><small>AKTUALNE SALDO KREDYTÓW</small><b>'+PLN(cur.debt)+'</b></div></div><p class="muted">Review nie ocenia prywatnych wydatków ani „miesięcy na plusie”, bo aplikacja nie prowadzi pełnego budżetu domowego.</p><div class="actions"><button class="btn" onclick="reviewShiftYear55(-1)">‹ Rok</button><button class="btn" onclick="reviewQuarter55('+(q===1?4:q-1)+')">‹ Kwartał</button><button class="btn" onclick="reviewQuarter55('+(q===4?1:q+1)+')">Kwartał ›</button><button class="btn" onclick="reviewShiftYear55(1)">Rok ›</button></div></section>'
}
function watchMetric63(type){
 let x=privateSnapshot(nowKey()),company=window.mfCommand53?.companyBreakEven?.(),inv=0;try{inv=N(window.mfLab55?.investmentSummary?.().value)}catch{}
 return({debt:x.debt,company:N(company?.sales),invest:inv,refi:N(S.finance.auto56?.bestRefiOffer),salary:x.salary.amount})[type]||0
}
function renderWatch63(){
 let h=G('watchBody56');if(!h||!ensure63())return,rows=(S.finance.auto56?.watchlist||[]).filter(w=>['debt','company','invest','refi','salary'].includes(w.type));
 h.innerHTML='<section class="card"><div class="title">Watchlista decyzji <span class="pill">realne mierniki</span></div><p class="muted">Warunki oparte tylko na danych, które rzeczywiście prowadzisz. Stare warunki „poduszka” i „nadwyżka” nie sterują już decyzjami.</p>'+(rows.length?'<div class="watchRows56">'+rows.map(w=>{let cur=watchMetric63(w.type),hit=w.dir==='lte'?cur<=N(w.threshold):cur>=N(w.threshold);return'<div class="'+(hit?'hit56':'')+'"><div><small>'+esc(({debt:'Saldo kredytów',company:'Sprzedaż MOHE',invest:'Portfel inwestycyjny',refi:'Oferta refinansowania %',salary:'Etat — wpływ'})[w.type])+'</small><b>'+esc(w.name)+'</b><span>aktualnie '+(w.type==='refi'?cur.toFixed(2):PLN(cur))+'</span></div><strong>'+(hit?'✓ SPEŁNIONY':'oczekuje')+'</strong><em>'+esc(w.action||'')+'</em></div>').join('')+'</div>':'<div class="privateNote63"><b>Brak aktywnych warunków opartych na realnych miernikach.</b><span>Możemy później dodać np. próg salda kredytu, wartość inwestycji albo wynik MOHE.</span></div>')+'</section>'
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
  window.mfCommand53.financialScore=monitoringScore63;
  window.mfCommand53.renderHome=()=>{};
  window.mfCommand53.renderControl=()=>{};
 }
 if(window.mfOps54){
  window.mfOps54.renderActions=renderActions63;
  window.mfOps54.renderControl=()=>{};
 }
 if(window.mfAutopilot56){
  window.mfAutopilot56.renderAutopilot=renderAutopilot63;
  window.mfAutopilot56.renderWatch=renderWatch63;
  window.mfAutopilot56.renderHome=()=>{};
  window.mfAutopilot56.renderControl=()=>{};
 }
 if(window.mfLab55)window.mfLab55.renderReview=renderReview63;
 window.renderPrivateMonitor63=renderPrivateMonitor63;
 window.renderMonthlyMonitor63=renderMonthlyMonitor63;
 window.renderCommitments63=renderCommitments63;
}
window.mfPrivate63={snapshot:privateSnapshot,monitoringScore:monitoringScore63,renderControl:renderPrivateMonitor63,renderMonthly:renderMonthlyMonitor63,renderCommitments:renderCommitments63,renderActions:renderActions63,renderAutopilot:renderAutopilot63,renderMission:renderMissionPrivate63,renderReview:renderReview63,renderWatch:renderWatch63,install:install63};
window.addEventListener('finance-modules-ready',install63,{once:true});
let st=document.createElement('style');st.textContent='.privateGrid63{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:12px}.privateGrid63>div{padding:12px;border:1px solid #e4eaf2;border-radius:12px;background:#f7f9fc}.privateGrid63 small,.privateGrid63 span{display:block;color:#7c899c;font-size:9px}.privateGrid63 b{display:block;margin:5px 0;color:#315275}.privateNote63{margin-top:12px;padding:12px;border-radius:11px;background:#f4f7fb}.privateNote63 b,.privateNote63 span{display:block}.privateNote63 span{margin-top:4px;color:#77869a;font-size:10px}.monitorActions63{display:grid;gap:8px;margin-top:10px}.monitorActions63 button{display:grid;grid-template-columns:28px 1fr;gap:9px;align-items:center;text-align:left;border:1px solid #e4eaf2;background:#fff;border-radius:11px;padding:10px;cursor:pointer}.monitorActions63 button>span{width:24px;height:24px;display:grid;place-items:center;border-radius:8px;background:#edf3fa;color:#315f9f;font-weight:800}.monitorActions63 b,.monitorActions63 small{display:block}.monitorActions63 small{margin-top:3px;color:#7d899b}.commitList63{margin-top:12px}.commitRow63{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;padding:10px 0;border-top:1px solid #e7ecf2}.commitRow63 b,.commitRow63 small{display:block}.commitRow63 small{margin-top:3px;color:#8290a2;font-size:9px}.commitRow63 strong{color:#315274}@media(max-width:760px){.privateGrid63{grid-template-columns:1fr 1fr}}@media(max-width:520px){.privateGrid63{grid-template-columns:1fr}}';document.head.appendChild(st);
})();