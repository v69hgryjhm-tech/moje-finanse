/* Moje Finanse 3.4 — stabilne moduły i końcowy start aplikacji */
(function(){
const VERSION='5.8.2';
const G=id=>document.getElementById(id),N=v=>+v||0;
const PLN=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(N(v));
const FULL=['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
const nowKey=()=>typeof TODAY==='string'?TODAY.slice(0,7):new Date().toISOString().slice(0,7);
const key=(y,m)=>`${y}-${String(m+1).padStart(2,'0')}`;
const parse=k=>{let [y,m]=String(k||nowKey()).split('-').map(Number);return{y:y||new Date().getFullYear(),m:(m||1)-1}};
const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function setVersion(){document.title='Moje Finanse '+VERSION;let h=document.querySelector('.top small');if(h)h.innerHTML=`<span id="headerYear">${typeof S!=='undefined'?S.selectedYear:''}</span> • wersja ${VERSION}`;document.documentElement.dataset.appVersion=VERSION}
function ensure(){if(typeof S==='undefined')return false;S.finance||={};S.finance.expenses||=[];S.finance.calendarEvents||=[];S.finance.scenario||={salaryPct:0,companyPct:0,expensePct:0,extraDebt:0};S.finance.informalDebts||=[];S.finance.analysisMonth||=S.finance.selectedMonth||nowKey();S.finance.expenses.forEach(e=>{if(!e.kind)e.kind='recurring';if(e.active==null)e.active=true});return true}
function isExpenseInMonth(e,k){if(e.active===false)return false;if(e.kind==='once')return e.month===k;return (!e.from||k>=e.from)&&(!e.to||k<=e.to)}
function expRows(k){return (S.finance.expenses||[]).filter(e=>isExpenseInMonth(e,k))}
function recurringRows(){return (S.finance.expenses||[]).filter(e=>e.active!==false&&e.kind!=='once')}
function oneTimeRows(k){return (S.finance.expenses||[]).filter(e=>e.active!==false&&e.kind==='once'&&e.month===k)}
function expTotal(k){return expRows(k).reduce((a,e)=>a+N(e.amount),0)}
function salary(y,m){try{let old=S.selectedYear;S.selectedYear=y;Y();let r=sal().rows[m]||{};S.selectedYear=old;Y();return{net:N(r.total),gross:N(r.g),actual:!!r.actual}}catch{let r=S.years?.[String(y)]?.salary?.[m]||{},net=N(r.net)+N(r.bonus);return{net,gross:N(r.gross),actual:net>0}}}
function company(y,m){let r=S.years?.[String(y)]?.company?.[m]||{},rev=N(r.revenue),cost=N(r.costs),zus=N(r.zus),health=N(r.health),tax=N(r.tax),vat=(N(r.vatOut)||N(r.vatIn))?N(r.vatOut)-N(r.vatIn):N(r.vat);return{profit:rev-cost-zus-health-tax-vat,actual:!!(rev||cost||zus||health||tax||vat)}}
function loanSpend(k){return (S.loans||[]).reduce((a,l)=>{let h=(l.history||[]).find(x=>x.month===k);if(h){let reg=typeof h.paid==='boolean'?(h.paid?N(h.regularPaid||l.payment):0):N(h.regularPaid!=null?h.regularPaid:h.paid),ex=h.isOverpayment===false?0:N(h.extra);return a+reg+ex}if(k<(l.asOfDate||'0000-00-00').slice(0,7))return a;return a+N(l.payment)+N(l.extraMonthly)},0)}
function balance(l){try{return N(loanPoint(l).balance)}catch{return N(l.balance)}}
function flow(k){let {y,m}=parse(k),s=salary(y,m),c=company(y,m),e=expTotal(k),lo=loanSpend(k),income=(s.actual?s.net:0)+(c.actual?Math.max(0,c.profit):0);return{k,y,m,s,c,e,lo,income,free:income-e-lo}}
function addMonth(k,d){let {y,m}=parse(k),x=new Date(y,m+d,1,12);return key(x.getFullYear(),x.getMonth())}
function nav(k,fn){let {y,m}=parse(k);return `<div class="card miniNav"><button class="btn" onclick="${fn}(-1)">‹</button><b>${FULL[m]} ${y}</b><button class="btn" onclick="${fn}(1)">›</button></div>`}
function expenseRow(e,i,suffix=''){
 const recurring=e.kind!=='once',type=recurring?'Stały':'Jednorazowy',day=e.day?'dzień '+e.day:'bez terminu';
 return `<div class="expenseItem34">
   <div class="expenseIcon34">${recurring?'↻':'1×'}</div>
   <div class="expenseMain34">
     <b>${esc(e.name)}</b>
     <div class="expenseMeta34">
       <span class="expenseBadge34 category">${esc(e.category||'Inne')}</span>
       <span class="expenseBadge34 ${recurring?'recurring':'once'}">${type}</span>
       <span>${day}${suffix}</span>
     </div>
   </div>
   <div class="expenseAmount34"><b>${PLN(e.amount)}</b><small>/ mies.</small></div>
   <button class="expenseDelete34" title="Usuń" onclick="removeExpense34(${i})">×</button>
 </div>`
}
function renderBudget(){if(!ensure())return;let h=G('budgetBody');if(!h)return;let k=S.finance.analysisMonth||nowKey(),rec=recurringRows(),once=oneTimeRows(k),total=expTotal(k),recMonth=rec.filter(e=>isExpenseInMonth(e,k)).reduce((a,e)=>a+N(e.amount),0),onceTotal=once.reduce((a,e)=>a+N(e.amount),0),monthName=FULL[parse(k).m];
 h.innerHTML=`${nav(k,'shiftFinanceAnalysis34')}
 <div class="budgetSummary34">
   <div class="primary"><small>PLANOWANE WYDATKI • ${monthName.toUpperCase()}</small><b>${PLN(total)}</b><span>${rec.length+once.length} pozycji</span></div>
   <div><small>STAŁE</small><b>${PLN(recMonth)}</b></div>
   <div><small>JEDNORAZOWE</small><b>${PLN(onceTotal)}</b></div>
 </div>
 <div class="card budgetSection34">
   <div class="budgetSectionHead34"><div><small>POWTARZALNE</small><b>Wydatki stałe</b><span>Automatycznie uwzględniane co miesiąc.</span></div><button class="btn primary" onclick="expenseModal34('recurring')">＋ Dodaj</button></div>
   <div class="expenseList34">${rec.length?rec.map(e=>expenseRow(e,S.finance.expenses.indexOf(e),e.from?' • od '+e.from:'')).join(''):'<div class="budgetEmpty34">Brak stałych wydatków.</div>'}</div>
 </div>
 <div class="card budgetSection34">
   <div class="budgetSectionHead34"><div><small>TYLKO TEN MIESIĄC</small><b>Jednorazowe • ${monthName}</b><span>Zakupy i koszty, które nie powtarzają się automatycznie.</span></div><button class="btn" onclick="expenseModal34('once')">＋ Dodaj</button></div>
   <div class="expenseList34">${once.length?once.map(e=>expenseRow(e,S.finance.expenses.indexOf(e),'')).join(''):'<div class="budgetEmpty34">Brak jednorazowych wydatków w tym miesiącu.</div>'}</div>
 </div>`
}
window.expenseTypeChange34=function(){let t=G('exKind34')?.value,once=G('exMonthWrap34'),from=G('exFromWrap34');if(once)once.style.display=t==='once'?'block':'none';if(from)from.style.display=t==='recurring'?'block':'none'};
window.expenseModal34=function(kind='recurring'){if(!ensure())return;let k=S.finance.analysisMonth||nowKey();open(`<h2>Dodaj wydatek</h2><div class="form"><label>Typ<select id="exKind34" onchange="expenseTypeChange34()"><option value="recurring" ${kind==='recurring'?'selected':''}>Stały — co miesiąc</option><option value="once" ${kind==='once'?'selected':''}>Jednorazowy — tylko jeden miesiąc</option></select></label><label>Nazwa<input id="exName34" placeholder="np. Telefon, paliwo, OC"></label><label>Kwota<input id="exAmount34" type="number" step="0.01"></label><label>Kategoria<input id="exCategory34" placeholder="np. Dom, Auto, Subskrypcje"></label><label>Dzień miesiąca<input id="exDay34" type="number" min="1" max="31" value="1"></label><label id="exMonthWrap34">Miesiąc<input id="exMonth34" type="month" value="${k}"></label><label id="exFromWrap34">Powtarzaj od miesiąca<input id="exFrom34" type="month" value="${k}"></label></div><div class="actions"><button class="btn" onclick="closeModal()">Anuluj</button><button class="btn primary" onclick="saveExpense34()">Zapisz</button></div>`);setTimeout(expenseTypeChange34,0)};
window.saveExpense34=function(){if(!ensure())return;let kind=G('exKind34')?.value||'recurring',name=G('exName34')?.value?.trim(),amount=N(G('exAmount34')?.value),day=Math.max(1,Math.min(31,N(G('exDay34')?.value)||1));if(!name)return alert('Podaj nazwę wydatku.');if(amount<=0)return alert('Podaj kwotę większą od zera.');let e={kind,name,amount,category:G('exCategory34')?.value?.trim()||'Inne',day,active:true};if(kind==='once')e.month=G('exMonth34')?.value||S.finance.analysisMonth||nowKey();else e.from=G('exFrom34')?.value||nowKey();S.finance.expenses.push(e);save();closeModal();renderBudget();window.renderMonthly42?.();window.renderCalendar42?.()};
window.removeExpense34=function(i){if(!S.finance.expenses?.[i])return;if(confirm('Usunąć ten wydatek?')){S.finance.expenses.splice(i,1);save();renderBudget();window.renderCalendar42?.();window.renderMonthly42?.()}};
function renderCalendar(){if(!ensure())return;let h=G('calendarBody');if(!h)return;let k=S.finance.analysisMonth||nowKey(),{y,m}=parse(k),days=new Date(y,m+1,0).getDate(),off=(new Date(y,m,1).getDay()+6)%7,E={};let add=(d,t,a,c)=>{d=Math.max(1,Math.min(days,N(d)||1));(E[d]||=[]).push({t,a,c})};expRows(k).forEach(e=>add(e.day,e.name,e.amount,e.kind==='once'?'custom':'expense'));(S.loans||[]).forEach(l=>{if(k>=(l.asOfDate||'0000-00-00').slice(0,7))add(l.dueDay,l.name,l.payment,'loan')});(S.finance.calendarEvents||[]).filter(e=>e.month===k).forEach(e=>add(e.day,e.name,e.amount,'custom'));let cells='';for(let i=0;i<off;i++)cells+='<div class="calDay empty"></div>';for(let d=1;d<=days;d++)cells+=`<div class="calDay"><b>${d}</b>${(E[d]||[]).map(e=>`<span class="calEvent ${e.c}">${esc(e.t)}${N(e.a)?' • '+PLN(e.a):''}</span>`).join('')}</div>`;h.innerHTML=`${nav(k,'shiftFinanceAnalysis34')}<div class="card"><div class="title">Terminy <button class="btn primary" onclick="window.calendarEventModal21?.()">＋ Wydarzenie</button></div><div class="calWeek"><span>Pn</span><span>Wt</span><span>Śr</span><span>Cz</span><span>Pt</span><span>So</span><span>Nd</span></div><div class="calendarGrid">${cells}</div></div>`}
function renderScenario(){if(!ensure())return;let h=G('scenarioBody');if(!h)return;let sc=S.finance.scenario,start=S.finance.analysisMonth||nowKey(),rows=[];for(let i=0;i<12;i++){let k=addMonth(start,i),d=flow(k),base=d.free,alt=(d.s.actual?d.s.net:0)*(1+N(sc.salaryPct)/100)+(d.c.actual?Math.max(0,d.c.profit):0)*(1+N(sc.companyPct)/100)-d.e*(1+N(sc.expensePct)/100)-d.lo-N(sc.extraDebt);rows.push({k,base,alt})}let b=rows.reduce((a,r)=>a+r.base,0),a=rows.reduce((s,r)=>s+r.alt,0);h.innerHTML=`<div class="grid"><div class="tile"><small>BAZA 12 MIES.</small><b>${PLN(b)}</b></div><div class="tile"><small>SCENARIUSZ</small><b class="${a>=b?'green':'red'}">${PLN(a)}</b></div><div class="tile"><small>RÓŻNICA</small><b class="${a>=b?'green':'red'}">${PLN(a-b)}</b></div></div><div class="card"><div class="form"><label>Zmiana etatu %<input id="scSalary34" type="number" step="0.1" value="${N(sc.salaryPct)}"></label><label>Zmiana firmy %<input id="scCompany34" type="number" step="0.1" value="${N(sc.companyPct)}"></label><label>Zmiana kosztów %<input id="scExpense34" type="number" step="0.1" value="${N(sc.expensePct)}"></label><label>Dodatkowa nadpłata / mies.<input id="scDebt34" type="number" step="0.01" value="${N(sc.extraDebt)}"></label></div><button class="btn primary" onclick="saveScenario34()">Przelicz</button></div><div class="card"><div class="title">12 miesięcy</div>${rows.map(r=>`<div class="v25Row"><span>${r.k}</span><span>bazowo <b>${PLN(r.base)}</b> → scenariusz <b class="${r.alt>=r.base?'green':'red'}">${PLN(r.alt)}</b></span></div>`).join('')}</div>`}
window.saveScenario34=function(){ensure();S.finance.scenario={salaryPct:N(G('scSalary34')?.value),companyPct:N(G('scCompany34')?.value),expensePct:N(G('scExpense34')?.value),extraDebt:N(G('scDebt34')?.value)};save();renderScenario()};
function informalRemaining(d){return Math.max(0,N(d.amount)-(d.payments||[]).reduce((a,p)=>a+N(p.amount),0))}
function informalPaid(d){return Math.max(0,N(d.amount)-informalRemaining(d))}
function informalHtml(){let ds=S.finance.informalDebts||[],total=ds.reduce((a,d)=>a+informalRemaining(d),0);return `<div class="card"><div class="title">Do oddania — bez odsetek i bez terminu <button class="btn primary" onclick="informalDebtModal34()">＋ Dodaj</button></div><p class="muted">Nie tworzy rat ani terminu i nie trafia do kalendarza.</p><div class="row"><span>Łącznie pozostało</span><b>${PLN(total)}</b></div>${ds.length?ds.map((d,i)=>{let rem=informalRemaining(d),paid=informalPaid(d),p=N(d.amount)?Math.min(100,paid/N(d.amount)*100):0;return `<div class="card" style="margin-top:10px"><div class="title"><span>${esc(d.name||'Zobowiązanie')}</span><span>${PLN(rem)} pozostało</span></div>${d.note?`<p class="muted">${esc(d.note)}</p>`:''}<div class="progress"><i style="width:${p}%"></i></div><div class="row"><span>Oddano ${PLN(paid)} z ${PLN(d.amount)}</span><b>${p.toFixed(1)}%</b></div><div class="actions"><button class="btn primary" onclick="informalPaymentModal34(${i})">＋ Zapisz oddanie</button><button class="btn danger" onclick="removeInformalDebt34(${i})">Usuń</button></div>${(d.payments||[]).length?`<div class="ledger">${[...(d.payments||[])].reverse().map(p=>`<div class="ledgerRow"><div><b>${esc(p.date||'')}</b><small>${PLN(p.amount)}${p.note?' • '+esc(p.note):''}</small></div></div>`).join('')}</div>`:''}</div>`}).join(''):'<p class="muted">Nie masz jeszcze takich zobowiązań.</p>'}</div>`}
function renderDebt(){if(!ensure())return;let h=G('debtBody');if(!h)return;let loans=S.loans||[],k=S.finance.analysisMonth||nowKey(),d=flow(k),bankDebt=loans.reduce((a,l)=>a+balance(l),0),informal=(S.finance.informalDebts||[]).reduce((a,x)=>a+informalRemaining(x),0),debt=bankDebt+informal,payment=loans.reduce((a,l)=>a+N(l.payment)+N(l.extraMonthly),0),ratio=d.income>0?payment/d.income*100:0,weighted=bankDebt?loans.reduce((a,l)=>a+balance(l)*N(l.rate),0)/bankDebt:0,avalanche=[...loans].sort((a,b)=>N(b.rate)-N(a.rate)),snowball=[...loans].sort((a,b)=>balance(a)-balance(b));h.innerHTML=`<div class="grid"><div class="tile"><small>ŁĄCZNE ZADŁUŻENIE</small><b>${PLN(debt)}</b><span>kredyty ${PLN(bankDebt)} + bezterminowe ${PLN(informal)}</span></div><div class="tile"><small>RATY / MIES.</small><b>${PLN(payment)}</b></div><div class="tile"><small>RATY / DOCHÓD</small><b>${ratio.toFixed(1)}%</b></div><div class="tile"><small>ŚR. OPROCENTOWANIE KREDYTÓW</small><b>${weighted.toFixed(2)}%</b></div></div>${informalHtml()}<div class="two"><div class="card"><div class="title">Avalanche — najwyższe oprocentowanie</div>${avalanche.length?avalanche.map((l,i)=>`<div class="v25Row"><span>${i+1}. ${esc(l.name)}<small>${N(l.rate).toFixed(2)}%</small></span><b>${PLN(balance(l))}</b></div>`).join(''):'<p class="muted">Brak kredytów.</p>'}</div><div class="card"><div class="title">Snowball — najmniejsze saldo</div>${snowball.length?snowball.map((l,i)=>`<div class="v25Row"><span>${i+1}. ${esc(l.name)}<small>rata ${PLN(l.payment)}</small></span><b>${PLN(balance(l))}</b></div>`).join(''):'<p class="muted">Brak kredytów.</p>'}</div></div>`}
window.informalDebtModal34=function(){open(`<h2>Dodaj kwotę do oddania</h2><p class="muted">Bez odsetek, rat i terminu.</p><div class="form"><label>Komu / nazwa<input id="idName34"></label><label>Kwota<input id="idAmount34" type="number" step="0.01"></label><label>Notatka<input id="idNote34"></label></div><div class="actions"><button class="btn" onclick="closeModal()">Anuluj</button><button class="btn primary" onclick="saveInformalDebt34()">Zapisz</button></div>`)};
window.saveInformalDebt34=function(){ensure();let amount=N(G('idAmount34')?.value);if(amount<=0)return alert('Podaj kwotę większą od zera.');S.finance.informalDebts.push({name:G('idName34')?.value||'Do oddania',amount,note:G('idNote34')?.value||'',payments:[]});save();closeModal();renderDebt()};
window.informalPaymentModal34=function(i){let d=S.finance.informalDebts?.[i];if(!d)return;open(`<h2>Oddanie — ${esc(d.name)}</h2><p class="muted">Pozostało ${PLN(informalRemaining(d))}</p><div class="form"><label>Data<input id="idPayDate34" type="date" value="${typeof TODAY==='string'?TODAY:new Date().toISOString().slice(0,10)}"></label><label>Kwota<input id="idPayAmount34" type="number" step="0.01"></label><label>Notatka<input id="idPayNote34"></label></div><div class="actions"><button class="btn" onclick="closeModal()">Anuluj</button><button class="btn primary" onclick="saveInformalPayment34(${i})">Zapisz</button></div>`)};
window.saveInformalPayment34=function(i){let d=S.finance.informalDebts?.[i],amount=N(G('idPayAmount34')?.value);if(!d||amount<=0)return alert('Podaj kwotę.');amount=Math.min(amount,informalRemaining(d));d.payments||=[];d.payments.push({date:G('idPayDate34')?.value||'',amount,note:G('idPayNote34')?.value||''});save();closeModal();renderDebt()};
window.removeInformalDebt34=function(i){if(confirm('Usunąć to zobowiązanie?')){S.finance.informalDebts.splice(i,1);save();renderDebt()}};
window.shiftFinanceAnalysis34=function(d){ensure();S.finance.analysisMonth=addMonth(S.finance.analysisMonth||nowKey(),d);save();renderBudget();window.renderCalendar42?.();renderScenario();renderDebt()};
window.openLoanFromHome34=function(i){if(!S.loans?.[i])return;S.loans[i].uiCollapsed=false;save();show('loans');setTimeout(()=>{let card=[...document.querySelectorAll('#loanList .loan')][i];if(card){card.scrollIntoView({behavior:'smooth',block:'start'});card.classList.add('loanFocus34');setTimeout(()=>card.classList.remove('loanFocus34'),1400)}},50)};
function wireLoanHome(){let home=G('loanHome');if(!home||home.dataset.loanLinks34)return;home.dataset.loanLinks34='1';home.addEventListener('click',e=>{let row=e.target.closest('.row');if(!row)return;let rows=[...home.querySelectorAll(':scope > .row')],i=rows.indexOf(row);if(i>=0)openLoanFromHome34(i)});home.style.cursor='pointer'}
function renderAll(){renderBudget();renderScenario();renderDebt();wireLoanHome()}
window.renderBudget34=renderBudget;window.renderCalendar34=renderCalendar;window.renderScenario34=renderScenario;window.renderDebt34=renderDebt;
const oldShow=window.show;if(typeof oldShow==='function')window.show=function(v){oldShow(v);setVersion();if(v==='budget')renderBudget();if(v==='calendar')window.renderCalendar42?.();if(v==='scenario')renderScenario();if(v==='debt')renderDebt();if(v==='home')wireLoanHome()};
const oldRender=window.render;if(typeof oldRender==='function')window.render=function(){oldRender();setVersion();renderAll()};
let budgetStyle34=document.createElement('style');budgetStyle34.textContent=`
#budgetBody{display:grid;gap:12px}
.budgetSummary34{display:grid;grid-template-columns:1.4fr .8fr .8fr;gap:10px}
.budgetSummary34>div{background:#fff;border:1px solid #e5eaf1;border-radius:16px;padding:14px 16px;display:flex;flex-direction:column;gap:3px}
.budgetSummary34 .primary{background:linear-gradient(135deg,#f6f9fd,#eef4fb)}
.budgetSummary34 small{font-size:8px;letter-spacing:.06em;color:#8793a4;font-weight:800}
.budgetSummary34 b{font-size:20px;color:#29496b}
.budgetSummary34 span{font-size:9px;color:#8793a4}
.budgetSection34{padding:0;overflow:hidden}
.budgetSectionHead34{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:15px 16px;border-bottom:1px solid #edf1f5}
.budgetSectionHead34 small{display:block;font-size:8px;color:#8b97a6;font-weight:800;letter-spacing:.06em}
.budgetSectionHead34 b{display:block;margin:2px 0;color:#304c6d;font-size:14px}
.budgetSectionHead34 span{font-size:9px;color:#8995a5}
.expenseList34{padding:2px 16px 8px}
.expenseItem34{display:grid;grid-template-columns:36px minmax(0,1fr) 120px 28px;gap:10px;align-items:center;padding:12px 0;border-bottom:1px solid #edf1f5}
.expenseItem34:last-child{border-bottom:0}
.expenseIcon34{width:32px;height:32px;border-radius:10px;background:#eef4fa;color:#42658c;display:grid;place-items:center;font-size:11px;font-weight:900}
.expenseMain34>b{display:block;color:#304c6d;font-size:11px}
.expenseMeta34{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:4px;color:#8a96a5;font-size:8px}
.expenseBadge34{padding:3px 6px;border-radius:999px;background:#f1f4f8;color:#617188;font-weight:700}
.expenseBadge34.recurring{background:#eef8f2;color:#347253}
.expenseBadge34.once{background:#fff3e5;color:#986317}
.expenseBadge34.category{background:#eef3fa;color:#466786}
.expenseAmount34{text-align:right}
.expenseAmount34 b{display:block;color:#2f4e70;font-size:12px}
.expenseAmount34 small{font-size:8px;color:#909baa}
.expenseDelete34{border:0;background:transparent;color:#b8c1cc;width:28px;height:28px;border-radius:8px;font-size:17px;cursor:pointer}
.expenseDelete34:hover{background:#fff0f1;color:#c54752}
.budgetEmpty34{padding:18px 0;color:#8b97a6;font-size:10px}
@media(max-width:700px){.budgetSummary34{grid-template-columns:1fr 1fr}.budgetSummary34 .primary{grid-column:1/-1}.expenseItem34{grid-template-columns:34px minmax(0,1fr) auto}.expenseDelete34{grid-column:3;grid-row:1}.expenseAmount34{grid-column:2/4;text-align:left}.budgetSectionHead34{align-items:flex-start}.budgetSectionHead34 .btn{white-space:nowrap}}
`;document.head.appendChild(budgetStyle34);
window.renderStable34=renderAll;
window.prepareStable34=function(){ensure();setVersion();};
})();