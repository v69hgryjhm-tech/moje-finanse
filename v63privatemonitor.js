/* Moje Finanse 5.9 — prywatne finanse jako monitoring, nie budżet domowy */
(function(){
'use strict';
const VERSION='5.9.2';
const G=id=>document.getElementById(id);
const N=v=>+v||0;
const PLN=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:0,maximumFractionDigits:0}).format(N(v));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function key(y,m){return String(y)+'-'+String(m+1).padStart(2,'0')}
function nowKey(){let d=new Date();return key(d.getFullYear(),d.getMonth())}
function parseKey(k){let [y,m]=String(k||'').split('-').map(Number);return{y:y||new Date().getFullYear(),m:Math.max(0,(m||1)-1)}}
function ensure63(){if(typeof S==='undefined')return false;S.finance||={};S.finance.privateMode='monitoring';return true}
function salaryFor(k){
 let {y,m}=parseKey(k),old=S.selectedYear;
 try{S.selectedYear=y;window.mfTaxSync41?.(y);Y();let r=window.sal?.().rows?.[m];return{amount:N(r?.total),actual:!!r?.actual}}
 catch{return{amount:0,actual:false}}
 finally{S.selectedYear=old;window.mfTaxSync41?.(old)}
}
function loanBalance(l){try{return N(window.loanCurrentPoint15?.(l)?.balance)}catch{return N(l?.balance)}}
function loanMonth(l,k){
 try{
  let rows=(window.loanTimeline15?.(l,true)?.rows||[]).filter(r=>key(r.date.getFullYear(),r.date.getMonth())===k);
  return rows.reduce((a,r)=>a+N(r.kind==='actual'?r.regularPaid:r.planned)+N(r.extra),0)
 }catch{return N(l?.payment)}
}
function privateSnapshot(k=nowKey()){
 let salary=salaryFor(k),loans=S.loans||[];
 return{
  k,salary,
  loanMonthly:loans.reduce((a,l)=>a+loanMonth(l,k),0),
  debt:loans.reduce((a,l)=>a+loanBalance(l),0),
  recurring:(S.finance.expenses||[]).filter(e=>e.active!==false&&e.kind!=='once').reduce((a,e)=>a+N(e.amount),0)
 }
}
function grid63(x){
 return '<div class="privateGrid63">'
  +'<div><small>ETAT — WPŁYW / PROGNOZA</small><b>'+PLN(x.salary.amount)+'</b><span>'+(x.salary.actual?'wpisana wypłata':'prognoza')+'</span></div>'
  +'<div><small>RATY I NADPŁATY W MIESIĄCU</small><b>'+PLN(x.loanMonthly)+'</b><span>z harmonogramów kredytów</span></div>'
  +'<div><small>SALDO KREDYTÓW</small><b>'+PLN(x.debt)+'</b><span>stan kapitału</span></div>'
  +'<div><small>ZAPISANE STAŁE ZOBOWIĄZANIA</small><b>'+PLN(x.recurring)+'</b><span>opcjonalne</span></div>'
  +'</div>'
}
function renderPrivateMonitor63(){
 let h=G('controlBody51');if(!h||!ensure63())return;
 let x=privateSnapshot(S.finance.control51?.month||nowKey());
 h.innerHTML='<section class="card privateMonitor63"><div class="title">Finanse prywatne — monitoring <span class="pill green">bez budżetu domowego</span></div>'
  +'<p class="muted">Aplikacja nie zakłada, że wpisujesz każdy zakup. Nie liczy więc prywatnego „ile zostało do wydania”.</p>'
  +grid63(x)
  +'<div class="privateNote63"><b>Nie liczymy prywatnego „zostaje X zł”.</b><span>Codzienne zakupy, jedzenie, paliwo i inne zmienne wydatki nie muszą być wpisywane.</span></div></section>'
}
function renderMonthlyMonitor63(){
 let h=G('monthlyBody');if(!h||!ensure63())return;
 let k=S.finance.selectedMonth||nowKey(),x=privateSnapshot(k);
 h.innerHTML='<section class="card"><div class="title">Pulpit miesiąca — '+esc(k)+' <span class="pill">monitoring</span></div>'
  +grid63(x)
  +'<p class="muted">To nie jest budżet domowy. Brak codziennych wydatków jest zamierzony i nie obniża żadnego wyniku.</p></section>'
}
function renderActions63(){
 let h=G('actionBody');if(!h||!ensure63())return;
 let k=nowKey(),items=[],today=new Date().getDate(),up=window.mfControl51?.upcoming?.(k)||[];
 let soon=up.filter(z=>z.day>=today&&z.day<=today+7);
 if(soon.length)items.push({p:1,title:'Najbliższe zapisane płatności',text:soon.length+' pozycji w ciągu 7 dni na '+PLN(soon.reduce((a,z)=>a+N(z.amount),0)),go:'calendar'});
 let loans=(S.loans||[]).filter(l=>loanBalance(l)>0).sort((a,b)=>N(b.rate)-N(a.rate));
 if(loans[0]&&N(loans[0].rate)>=7)items.push({p:2,title:'Kredyt do obserwacji',text:esc(loans[0].name)+' • '+N(loans[0].rate).toFixed(2)+'% • saldo '+PLN(loanBalance(loans[0])),go:'loans'});
 let goals=(S.finance.goals||[]).filter(g=>N(g.target)>N(g.current));
 if(goals.length)items.push({p:3,title:'Cele finansowe',text:goals.length+' aktywne cele — aktualizuj tylko po faktycznej wpłacie.',go:'goals'});
 h.innerHTML='<section class="card"><div class="title">Plan działania <span class="pill">tylko dane prowadzone</span></div>'
  +'<p class="muted">Brak zadań typu „zmniejsz wydatki” i brak obowiązkowej poduszki, bo aplikacja nie zna pełnego budżetu domowego.</p>'
  +(items.length?'<div class="monitorActions63">'+items.map(z=>'<button data-go="'+z.go+'"><span>'+z.p+'</span><div><b>'+z.title+'</b><small>'+z.text+'</small></div></button>').join('')+'</div>':'<div class="privateNote63"><b>Brak pilnych działań.</b><span>Nie generuję sztucznych zadań z niepełnych wydatków.</span></div>')
  +'</section>';
 h.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go))
}
function renderAutopilot63(){
 let h=G('autopilotBody56');if(!h||!ensure63())return;
 let loans=(S.loans||[]).filter(l=>loanBalance(l)>0).sort((a,b)=>N(b.rate)-N(a.rate)),top=loans[0];
 h.innerHTML='<section class="card"><div class="title">Autopilot prywatny <span class="pill">decyzje, nie podział pensji</span></div>'
  +'<p class="muted">Autopilot nie rozdziela prywatnej pensji na poduszkę, inwestycje i cele. Pokazuje tylko decyzje oparte na danych, które faktycznie prowadzisz.</p>'
  +'<div class="privateGrid63">'
  +'<div><small>NAJWYŻSZE OPROCENTOWANIE</small><b>'+(top?N(top.rate).toFixed(2)+'%':'—')+'</b><span>'+(top?esc(top.name):'brak kredytów')+'</span></div>'
  +'<div><small>ŁĄCZNE SALDO KREDYTÓW</small><b>'+PLN(loans.reduce((a,l)=>a+loanBalance(l),0))+'</b></div>'
  +'<div><small>AKTYWNE CELE</small><b>'+((S.finance.goals||[]).filter(g=>N(g.target)>N(g.current)).length)+'</b></div>'
  +'<div><small>INWESTYCJE / PPK</small><b>śledź stan</b><span>bez narzucania miesięcznej kwoty</span></div>'
  +'</div></section>'
}
function companySnapshot63(){
 try{return window.mfCommand53?.companyBreakEven?.()||{}}catch{return{}}
}
function renderMissionPrivate63(){
 let home=G('home');if(!home||!ensure63())return;
 home.classList.add('missionMode57','showLegacy57');
 let host=G('missionHome57');if(!host){host=document.createElement('div');host.id='missionHome57';home.prepend(host)}
 let x=privateSnapshot(nowKey()),c=companySnapshot63();
 host.innerHTML='<div class="missionHero57"><div class="missionHeroCopy57"><small>Centrum dowodzenia • monitoring</small><h2>Etat, firma i zobowiązania — bez liczenia każdej złotówki.</h2>'
  +'<p>Prywatnie śledzę wpływy, kredyty i majątek. Firma nadal jest liczona dokładnie, bo tam prowadzisz sprzedaż i koszty.</p>'
  +'<div class="missionHeroActions57"><button id="goPrivate63" class="btn primary">🧭 Finanse prywatne</button><button id="goBusiness63" class="btn">🏢 MOHE</button></div></div></div>'
  +'<div class="missionDomains57"><section class="missionCard57 domain57"><div class="missionTitle57"><div><small>JA / FINANSE PRYWATNE</small><b>monitoring uproszczony</b></div></div>'
  +'<div class="domainKpis57"><div><span>Etat — miesiąc</span><b>'+PLN(x.salary.amount)+'</b></div><div><span>Saldo kredytów</span><b>'+PLN(x.debt)+'</b></div><div><span>Raty / nadpłaty</span><b>'+PLN(x.loanMonthly)+'</b></div></div>'
  +'<p class="muted">Nie pokazuję „ile zostało”, bo nie wpisujesz wszystkich codziennych wydatków.</p></section>'
  +'<section class="missionCard57 domain57"><div class="missionTitle57"><div><small>MOHE / FIRMA</small><b>'+(c.ok?'pełny przepływ':'uzupełnij dane')+'</b></div></div>'
  +'<div class="domainKpis57"><div><span>Sprzedaż netto</span><b>'+PLN(c.sales)+'</b></div><div><span>Bezpieczny próg</span><b>'+PLN(c.safe)+'</b></div><div><span>Margines</span><b class="'+(N(c.margin)>=0?'green':'red')+'">'+PLN(c.margin)+'</b></div></div>'
  +'<p class="muted">Firma pozostaje liczona dokładnie: sprzedaż, koszty, podatki i wynik.</p></section></div>';
 G('goPrivate63').onclick=()=>show('control');G('goBusiness63').onclick=()=>show('businessplus')
}
function commitmentRow63(e,i){
 return '<div class="commitRow63"><div><b>'+esc(e.name||'Zobowiązanie')+'</b><small>'+esc(e.category||'Inne')+(e.kind==='once'?' • jednorazowe':' • stałe')+'</small></div><strong>'+PLN(e.amount)+'</strong><button class="btn danger" data-remove="'+i+'">Usuń</button></div>'
}
function renderCommitments63(){
 let h=G('budgetBody');if(!h||!ensure63())return;
 let rows=(S.finance.expenses||[]).filter(e=>e.active!==false),rec=rows.filter(e=>e.kind!=='once'),once=rows.filter(e=>e.kind==='once');
 h.innerHTML='<section class="card"><div class="title">Stałe zobowiązania <span class="pill">opcjonalne</span></div>'
  +'<p class="muted">Wpisuj tylko większe lub stałe pozycje, które chcesz mieć pod kontrolą. Codziennych zakupów nie musisz prowadzić.</p>'
  +'<div class="privateGrid63"><div><small>STAŁE / MIES.</small><b>'+PLN(rec.reduce((a,e)=>a+N(e.amount),0))+'</b></div><div><small>LICZBA STAŁYCH</small><b>'+rec.length+'</b></div><div><small>JEDNORAZOWE ZAPISANE</small><b>'+once.length+'</b></div><div><small>WPŁYW NA „ILE ZOSTAŁO”</small><b>brak</b><span>tylko monitoring</span></div></div>'
  +'<div class="actions"><button id="addRecurring63" class="btn primary">＋ Dodaj stałe zobowiązanie</button><button id="addOnce63" class="btn">＋ Dodaj większy jednorazowy koszt</button></div>'
  +(rows.length?'<div class="commitList63">'+rows.map(e=>commitmentRow63(e,S.finance.expenses.indexOf(e))).join('')+'</div>':'<div class="privateNote63"><b>Nie musisz nic tu dodawać.</b><span>To tylko opcjonalny rejestr większych zobowiązań.</span></div>')
  +'</section>';
 G('addRecurring63').onclick=()=>window.expenseModal34?.('recurring');G('addOnce63').onclick=()=>window.expenseModal34?.('once');
 h.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>removeCommitment63(+b.dataset.remove))
}
function saveCommitment63(){
 let kind=G('exKind34')?.value||'recurring',name=G('exName34')?.value?.trim(),amount=N(G('exAmount34')?.value),day=Math.max(1,Math.min(31,N(G('exDay34')?.value)||1));
 if(!name)return alert('Podaj nazwę zobowiązania.');if(amount<=0)return alert('Podaj kwotę większą od zera.');
 let e={kind,name,amount,category:G('exCategory34')?.value?.trim()||'Inne',day,active:true};
 if(kind==='once')e.month=G('exMonth34')?.value||S.finance.analysisMonth||nowKey();else e.from=G('exFrom34')?.value||nowKey();
 S.finance.expenses.push(e);save();closeModal();renderCommitments63();window.renderCalendar42?.()
}
function removeCommitment63(i){if(!S.finance.expenses?.[i])return;if(confirm('Usunąć to zobowiązanie?')){S.finance.expenses.splice(i,1);save();renderCommitments63();window.renderCalendar42?.()}}
function monitoringScore63(k=nowKey()){
 let x=privateSnapshot(k),salaryScore=x.salary.amount>0?(x.salary.actual?35:25):0,debtShare=x.salary.amount>0?x.loanMonthly/x.salary.amount:0;
 let debtScore=Math.round(Math.max(0,Math.min(1,(.55-debtShare)/.40))*35),loans=S.loans||[],loanScore=!loans.length?20:Math.round(loans.filter(l=>N(l.payment)>=0&&N(l.balance)>=0&&N(l.dueDay)>0).length/loans.length*20);
 let company=companySnapshot63(),companyScore=company.ok?10:5,total=Math.max(0,Math.min(100,salaryScore+debtScore+loanScore+companyScore));
 return{total,state:total>=80?'dane wyglądają dobrze':total>=60?'monitoring kompletny':total>=40?'część danych do uzupełnienia':'mało danych',parts:[],quality:{issues:[]},monitoring:true}
}
function periodMonitoring63(y,q){
 let months=[3*(q-1),3*(q-1)+1,3*(q-1)+2],salary=0,company=0,actualSalary=0,loanPaid=0;
 months.forEach(m=>{
  let k=key(y,m),s=salaryFor(k);salary+=s.amount;if(s.actual)actualSalary++;
  try{company+=N(window.mfCompanySummary44?.(S.years?.[String(y)]?.company?.[m]||{})?.profit)}catch{}
  (S.loans||[]).forEach(l=>{try{let rs=(window.loanTimeline15?.(l,false)?.actual||[]).filter(r=>key(r.date.getFullYear(),r.date.getMonth())===k);loanPaid+=rs.reduce((a,r)=>a+N(r.regularPaid)+N(r.extra),0)}catch{}})
 });
 return{salary,company,actualSalary,loanPaid,debt:(S.loans||[]).reduce((a,l)=>a+loanBalance(l),0)}
}
function renderReview63(){
 let h=G('reviewBody55');if(!h||!ensure63())return;
 S.finance.lab55||={};let y=N(S.finance.lab55.reviewYear)||S.selectedYear||new Date().getFullYear(),q=Math.max(1,Math.min(4,N(S.finance.lab55.reviewQuarter)||1)),cur=periodMonitoring63(y,q),prev=periodMonitoring63(q===1?y-1:y,q===1?4:q-1);
 let pct=(a,b)=>b?((a-b)/Math.abs(b))*100:0;
 h.innerHTML='<section class="card"><div class="title">Review — Q'+q+' '+y+' <span class="pill">monitoring</span></div>'
  +'<div class="privateGrid63"><div><small>ETAT</small><b>'+PLN(cur.salary)+'</b><span>'+cur.actualSalary+'/3 mies. z wpisaną wypłatą</span></div>'
  +'<div><small>MOHE — WYNIK</small><b>'+PLN(cur.company)+'</b><span>'+(pct(cur.company,prev.company)>=0?'+':'')+pct(cur.company,prev.company).toFixed(1)+'% vs poprzedni kwartał</span></div>'
  +'<div><small>WPŁATY DO KREDYTÓW</small><b>'+PLN(cur.loanPaid)+'</b><span>raty + nadpłaty wykonane</span></div><div><small>AKTUALNE SALDO KREDYTÓW</small><b>'+PLN(cur.debt)+'</b></div></div>'
  +'<p class="muted">Review nie ocenia prywatnych wydatków ani „miesięcy na plusie”.</p>'
  +'<div class="actions"><button id="prevQ63" class="btn">‹ Kwartał</button><button id="nextQ63" class="btn">Kwartał ›</button></div></section>';
 G('prevQ63').onclick=()=>{if(q===1){S.finance.lab55.reviewYear=y-1;S.finance.lab55.reviewQuarter=4}else S.finance.lab55.reviewQuarter=q-1;save();renderReview63()};
 G('nextQ63').onclick=()=>{if(q===4){S.finance.lab55.reviewYear=y+1;S.finance.lab55.reviewQuarter=1}else S.finance.lab55.reviewQuarter=q+1;save();renderReview63()}
}
function renderWatch63(){
 let h=G('watchBody56');if(!h||!ensure63())return;
 let rows=(S.finance.auto56?.watchlist||[]).filter(w=>['debt','company','invest','refi','salary'].includes(w.type));
 h.innerHTML='<section class="card"><div class="title">Watchlista decyzji <span class="pill">realne mierniki</span></div><p class="muted">Stare warunki „poduszka” i „nadwyżka” nie sterują już decyzjami.</p>'
  +(rows.length?'<p>'+rows.length+' aktywnych warunków opartych na realnych danych.</p>':'<div class="privateNote63"><b>Brak aktywnych warunków.</b><span>Możemy później dodać próg salda kredytu, inwestycji albo wyniku MOHE.</span></div>')+'</section>'
}
function install63(){
 if(!ensure63())return;
 let e=G('emergency');if(e)e.hidden=true;
 if(window.mfMission57)window.mfMission57.render=renderMissionPrivate63;
 if(window.mfPlanner52){window.mfPlanner52.renderHome=()=>{};window.mfPlanner52.renderControl=()=>{}}
 if(window.mfCommand53){window.mfCommand53.financialScore=monitoringScore63;window.mfCommand53.renderHome=()=>{};window.mfCommand53.renderControl=()=>{}}
 if(window.mfOps54){window.mfOps54.renderActions=renderActions63;window.mfOps54.renderControl=()=>{}}
 if(window.mfAutopilot56){window.mfAutopilot56.renderAutopilot=renderAutopilot63;window.mfAutopilot56.renderWatch=renderWatch63;window.mfAutopilot56.renderHome=()=>{};window.mfAutopilot56.renderControl=()=>{}}
 if(window.mfLab55)window.mfLab55.renderReview=renderReview63;
 window.renderPrivateMonitor63=renderPrivateMonitor63;window.renderMonthlyMonitor63=renderMonthlyMonitor63;window.renderCommitments63=renderCommitments63;
 window.saveExpense34=saveCommitment63;window.removeExpense34=removeCommitment63
}
window.mfPrivate63={snapshot:privateSnapshot,monitoringScore:monitoringScore63,renderControl:renderPrivateMonitor63,renderMonthly:renderMonthlyMonitor63,renderCommitments:renderCommitments63,renderActions:renderActions63,renderAutopilot:renderAutopilot63,renderMission:renderMissionPrivate63,renderReview:renderReview63,renderWatch:renderWatch63,install:install63};
window.addEventListener('finance-modules-ready',install63,{once:true});
let st=document.createElement('style');
st.textContent='.privateGrid63{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:12px}.privateGrid63>div{padding:12px;border:1px solid #e4eaf2;border-radius:12px;background:#f7f9fc}.privateGrid63 small,.privateGrid63 span{display:block;color:#7c899c;font-size:9px}.privateGrid63 b{display:block;margin:5px 0;color:#315275}.privateNote63{margin-top:12px;padding:12px;border-radius:11px;background:#f4f7fb}.privateNote63 b,.privateNote63 span{display:block}.privateNote63 span{margin-top:4px;color:#77869a;font-size:10px}.monitorActions63{display:grid;gap:8px;margin-top:10px}.monitorActions63 button{display:grid;grid-template-columns:28px 1fr;gap:9px;align-items:center;text-align:left;border:1px solid #e4eaf2;background:#fff;border-radius:11px;padding:10px;cursor:pointer}.monitorActions63 button>span{width:24px;height:24px;display:grid;place-items:center;border-radius:8px;background:#edf3fa;color:#315f9f;font-weight:800}.monitorActions63 b,.monitorActions63 small{display:block}.monitorActions63 small{margin-top:3px;color:#7d899b}.commitList63{margin-top:12px}.commitRow63{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;padding:10px 0;border-top:1px solid #e7ecf2}.commitRow63 b,.commitRow63 small{display:block}.commitRow63 small{margin-top:3px;color:#8290a2;font-size:9px}.commitRow63 strong{color:#315274}@media(max-width:760px){.privateGrid63{grid-template-columns:1fr 1fr}}@media(max-width:520px){.privateGrid63{grid-template-columns:1fr}.commitRow63{grid-template-columns:1fr auto}.commitRow63 .btn{grid-column:1/-1;justify-self:start}}';
document.head.appendChild(st);
})();