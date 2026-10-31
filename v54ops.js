/* Moje Finanse 5.3 — operacje: plan działania, rezerwy roczne, raporty i decyzje */
(function(){
'use strict';
const VERSION='5.5.0',G=id=>document.getElementById(id),N=v=>+v||0,CL=(v,a,b)=>Math.max(a,Math.min(b,v));
const PLN=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(N(v));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const FULL=['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
const planner=()=>window.mfPlanner52||null,control=()=>window.mfControl51||null,command=()=>window.mfCommand53||null;
function key(y,m){return String(y)+'-'+String(m+1).padStart(2,'0')}
function nowKey(){let d=new Date();return key(d.getFullYear(),d.getMonth())}
function parseKey(k){let [y,m]=String(k||'').split('-').map(Number);return{y:y||new Date().getFullYear(),m:Math.max(0,(m||1)-1)}}
function addMonths(k,n){let {y,m}=parseKey(k),d=new Date(y,m+n,1,12);return key(d.getFullYear(),d.getMonth())}
function ensure54(){
 if(typeof S==='undefined')return false;
 S.finance||={};S.finance.ops54||={};let o=S.finance.ops54;
 o.annualCosts||=[];o.actionDone||={};o.monthReports||={};o.decisions||=[];
 return true
}
function setVersion54(){
 document.title='Moje Finanse '+VERSION;
 let h=document.querySelector('.top small');
 if(h)h.innerHTML='<span id="headerYear">'+(typeof S!=='undefined'?S.selectedYear:'')+'</span> • wersja '+VERSION;
 document.documentElement.dataset.appVersion=VERSION
}
function save54(){try{save()}catch{localStorage.setItem('moje-finanse-v14',JSON.stringify(S))}}
function recurring(k){
 return (planner()?.recurringExpenses?.(k)||[]).filter(e=>e?.active!==false)
}
function annualSummary(k){
 let rows=recurring(k),monthly=rows.reduce((a,e)=>a+N(e.amount),0);
 return{rows,monthly,annual:monthly*12,top:[...rows].sort((a,b)=>N(b.amount)-N(a.amount)).slice(0,8)}
}
function annualCosts(){
 return S.finance.ops54.annualCosts.filter(x=>x.active!==false)
}
function annualReserve(){
 let rows=annualCosts(),yearTotal=rows.reduce((a,x)=>a+N(x.amount),0),monthly=yearTotal/12;
 return{rows,yearTotal,monthly}
}
function monthsUntilDue(x,fromK){
 let {y,m}=parseKey(fromK),ty=CL(N(x.month)||1,1,12),yy=N(x.year)||y;
 if(x.repeat!==false&&((yy<y)||(yy===y&&ty-1<m)))yy=y+1;
 let d=(yy-y)*12+(ty-1-m);return Math.max(1,d+1)
}
function dueReserveNow(k){
 let source=S.finance.ops54.annualCosts||[],rows=source.map((x,idx)=>({x,idx})).filter(q=>q.x.active!==false).map(q=>{
  let months=monthsUntilDue(q.x,k),needed=N(q.x.amount)/months;
  return{...q.x,idx:q.idx,months,needed}
 });
 return{rows,total:rows.reduce((a,x)=>a+x.needed,0)}
}
function loanTarget(){
 let loans=(S.loans||[]).filter(l=>{try{return N(window.loanCurrentPoint15?.(l)?.balance)>0}catch{return N(l.balance)>0}});
 return loans.sort((a,b)=>N(b.rate)-N(a.rate))[0]||null
}
function goalNeed(){
 let now=new Date(),best=null;
 (S.finance.goals||[]).forEach((g,i)=>{
  let remain=Math.max(0,N(g.target)-N(g.current));if(!remain)return;
  let need=0,months=0;
  if(g.due){let [yy,mm]=String(g.due).split('-').map(Number);months=Math.max(1,(yy-now.getFullYear())*12+(mm-1-now.getMonth()));need=remain/months}
  let gap=Math.max(0,need-N(g.monthly));
  if(gap>0&&(!best||gap>best.gap))best={i,g,remain,need,gap,months}
 });
 return best
}
function actionId(type,extra=''){return type+':'+String(extra||'').replace(/[^a-zA-Z0-9_-]/g,'_')}
function actionPlan(k){
 let a=control(),p=planner(),c=command();if(!a||!p)return[];
 let plan=p.monthPlan(k),score=c?.financialScore?.(k),items=[],today=new Date(),up=a.upcoming(k)||[];
 let add=(priority,type,title,text,amount=0,action='',button='',extra='')=>items.push({id:actionId(type,extra),priority,type,title,text,amount,action,button});
 if(plan.free<0)add(1,'deficit','Zamknij lukę miesiąca','Plan pokazuje deficyt '+PLN(Math.abs(plan.free))+'. Wstrzymaj wydatki uznaniowe albo zwiększ wpływy.',Math.abs(plan.free),"show('budget')",'Wydatki','month');
 let day=k===nowKey()?today.getDate():1,soon=up.filter(x=>x.day>=day&&x.day<=day+7);
 if(soon.length){let sum=soon.reduce((s,x)=>s+N(x.amount),0);add(1,'payments','Zabezpiecz płatności na 7 dni',soon.length+' pozycji do zapłaty na '+PLN(sum)+'.',sum,"show('calendar')",'Kalendarz','7d')}
 let tr=plan.tr;
 if(N(tr.total)>0)add(1,'tax','Utrzymaj rezerwę firmy','VAT + PIT + ZUS + zdrowotna: '+PLN(tr.total)+'.',tr.total,"show('control')",'Rezerwy','tax');
 let close=a.closeState(k),done=close.checks.filter(x=>x.done).length;
 if(k===nowKey()&&today.getDate()>=24&&done<close.checks.length)add(2,'close','Dokończ zamknięcie miesiąca','Sprawdzone '+done+' z '+close.checks.length+' punktów.',0,"show('control')",'Zamknięcie','close');
 let ar=dueReserveNow(k);
 if(ar.total>0)add(2,'annual','Odkładaj na koszty roczne','Aktualna sugerowana rezerwa: '+PLN(ar.total)+' / mies. na '+ar.rows.length+' pozycji.',ar.total,"show('budget')",'Rezerwy roczne','annual');
 let saved=N(S.finance.emergencySavings),essential=N(plan.mi.essential);
 if(essential>0&&saved<essential*3)add(2,'emergency','Wzmocnij poduszkę','Do poziomu 3 miesięcy minimum brakuje '+PLN(Math.max(0,essential*3-saved))+'.',Math.max(0,essential*3-saved),"show('emergency')",'Poduszka','3m');
 let loan=loanTarget();
 if(plan.free>0&&loan&&N(loan.rate)>=7){
  let alloc=p.bestDecision?.(k),suggest=Math.max(0,Math.min(plan.free*.5,plan.free));
  add(3,'debt','Rozważ nadpłatę najdroższego długu',(loan.name||'Kredyt')+' • '+N(loan.rate).toFixed(2)+'%. Sugerowana robocza kwota z nadwyżki: '+PLN(suggest)+'.',suggest,"show('loans')",'Kredyty',loan.name||'loan')
 }
 let gn=goalNeed();
 if(gn)add(3,'goal','Podnieś tempo celu: '+esc(gn.g.name),'Aby utrzymać termin, brakuje około '+PLN(gn.gap)+' miesięcznie względem obecnej wpłaty.',gn.gap,"show('goals')",'Cele',String(gn.i));
 let be=c?.companyBreakEven?.();
 if(be?.ok&&N(be.sales)<N(be.safe))add(3,'company','Podnieś sprzedaż firmy do bezpiecznego progu','Ostatnia sprzedaż netto: '+PLN(be.sales)+'. Bezpieczny cel: '+PLN(be.safe)+'.',Math.max(0,be.safe-be.sales),"show('businessplus')",'Firma+',be.last?.k||'company');
 if(score&&score.quality?.issues?.length)add(4,'data','Uzupełnij dane do dashboardu',score.quality.issues.join(' • ')+'.',0,"show('control')",'Sprawdź dane','quality');
 return items.sort((x,y)=>x.priority-y.priority||N(y.amount)-N(x.amount)).slice(0,12)
}
function isDone(k,id){return !!S.finance.ops54.actionDone?.[k]?.[id]}
window.toggleAction54=function(k,id){
 ensure54();let m=S.finance.ops54.actionDone[k]||(S.finance.ops54.actionDone[k]={});m[id]=!m[id];save54();renderActions54();renderControl54();renderHome54()
};
function actionHtml54(k,compact=false){
 let rows=actionPlan(k),done=rows.filter(x=>isDone(k,x.id)).length;
 return '<div class="opsHead54"><span>'+done+'/'+rows.length+' wykonane</span><div class="opsProgress54"><i style="width:'+(rows.length?done/rows.length*100:0)+'%"></i></div></div><div class="opsActions54">'+rows.map(x=>'<div class="opsAction54 p'+x.priority+' '+(isDone(k,x.id)?'done':'')+'"><button class="opsCheck54" onclick="toggleAction54(\''+k+'\',\''+esc(x.id)+'\')">'+(isDone(k,x.id)?'✓':'○')+'</button><div><small>PRIORYTET '+x.priority+'</small><b>'+x.title+'</b><span>'+x.text+'</span>'+(x.amount?'<strong>'+PLN(x.amount)+'</strong>':'')+'</div>'+(compact?'':('<button class="btn" onclick="'+x.action+'">'+x.button+'</button>'))+'</div>').join('')+'</div>'
}
function renderActions54(){
 let h=G('actionBody');if(!h||!ensure54())return;let k=S.finance.analysisMonth||S.finance.selectedMonth||nowKey();
 h.innerHTML='<div class="card miniNav"><button class="btn" onclick="shiftAnalysis42(-1)">‹</button><b>'+FULL[parseKey(k).m]+' '+parseKey(k).y+'</b><button class="btn" onclick="shiftAnalysis42(1)">›</button></div><section class="card"><div class="title">Plan działania <span class="pill">priorytety automatyczne</span></div><p class="muted">Lista powstaje z dochodów, rat, podatków, celów, kosztów rocznych, poduszki i firmy. Możesz odhaczać wykonane kroki.</p>'+actionHtml54(k,false)+'</section>'+monthlyReportHtml54(k)
}
function annualCostModal54(i=null){
 let x=i==null?{}:S.finance.ops54.annualCosts[i]||{},now=new Date();
 open('<h2>'+(i==null?'Nowy koszt roczny':'Edytuj koszt roczny')+'</h2><div class="form"><label>Nazwa<input id="ac54n" value="'+esc(x.name||'')+'"></label><label>Kwota roczna / jednorazowa<input id="ac54a" type="number" step="0.01" value="'+N(x.amount)+'"></label><label>Miesiąc płatności<select id="ac54m">'+Array.from({length:12},(_,m)=>'<option value="'+(m+1)+'" '+(N(x.month||now.getMonth()+1)===m+1?'selected':'')+'>'+FULL[m]+'</option>').join('')+'</select></label><label>Rok<input id="ac54y" type="number" value="'+N(x.year||now.getFullYear())+'"></label><label>Kategoria<input id="ac54c" value="'+esc(x.category||'Inne')+'"></label><label>Powtarzaj<select id="ac54r"><option value="yes" '+(x.repeat!==false?'selected':'')+'>Co roku</option><option value="no" '+(x.repeat===false?'selected':'')+'>Tylko raz</option></select></label></div><div class="actions"><button class="btn" onclick="closeModal()">Anuluj</button><button class="btn primary" onclick="saveAnnualCost54('+(i==null?'null':i)+')">Zapisz</button></div>')
}
window.annualCostModal54=annualCostModal54;
window.saveAnnualCost54=function(i){
 ensure54();let x={name:G('ac54n')?.value?.trim()||'Koszt roczny',amount:Math.max(0,N(G('ac54a')?.value)),month:CL(Math.round(N(G('ac54m')?.value)||1),1,12),year:Math.max(2000,Math.round(N(G('ac54y')?.value)||new Date().getFullYear())),category:G('ac54c')?.value?.trim()||'Inne',repeat:G('ac54r')?.value!=='no',active:true};
 if(i==null)S.finance.ops54.annualCosts.push(x);else S.finance.ops54.annualCosts[i]=x;save54();closeModal();renderBudget54();renderControl54();renderActions54()
};
window.removeAnnualCost54=function(i){if(confirm('Usunąć koszt roczny?')){S.finance.ops54.annualCosts.splice(i,1);save54();renderBudget54();renderControl54();renderActions54()}};
function annualCostHtml54(k){
 let ar=annualReserve(),due=dueReserveNow(k);
 return '<section class="card"><div class="title">Rezerwy na koszty roczne <button class="btn primary" onclick="annualCostModal54()">＋ Dodaj</button></div><div class="opsKpis54"><div><small>ROCZNE KOSZTY</small><b>'+PLN(ar.yearTotal)+'</b></div><div><small>ŚREDNIA REZERWA / MIES.</small><b>'+PLN(ar.monthly)+'</b></div><div><small>REZERWA WG TERMINÓW</small><b>'+PLN(due.total)+'</b></div><div><small>POZYCJE</small><b>'+ar.rows.length+'</b></div></div>'+(due.rows.length?'<div class="annualList54">'+due.rows.map((x,i)=>'<div class="row"><div><b>'+esc(x.name)+'</b><small>'+FULL[N(x.month)-1]+' '+(x.repeat!==false?'• co roku':x.year)+' • '+esc(x.category)+' • '+x.months+' mies. do terminu</small></div><div><b>'+PLN(x.amount)+'</b><small>odkładaj ~ '+PLN(x.needed)+'/m</small></div><button class="btn" onclick="annualCostModal54('+x.idx+')">Edytuj</button><button class="btn danger" onclick="removeAnnualCost54('+x.idx+')">Usuń</button></div>').join('')+'</div>':'<p class="muted">Dodaj np. OC, ubezpieczenie domu, podatek, serwis auta, opał, przegląd albo większy zakup cykliczny.</p>')+'</section>'
}
function recurringAuditHtml54(k){
 let a=annualSummary(k),inc=N(control()?.monthIncome?.(k)?.total),share=inc>0?a.monthly/inc*100:0;
 return '<section class="card"><div class="title">Stałe koszty i abonamenty — audyt roczny</div><div class="opsKpis54"><div><small>MIESIĘCZNIE</small><b>'+PLN(a.monthly)+'</b></div><div><small>ROCZNIE</small><b>'+PLN(a.annual)+'</b></div><div><small>UDZIAŁ W DOCHODZIE</small><b>'+share.toFixed(1)+'%</b></div><div><small>POZYCJE</small><b>'+a.rows.length+'</b></div></div>'+(a.top.length?'<div class="annualList54">'+a.top.map(x=>'<div class="row"><span>'+esc(x.name||'Koszt stały')+' <small>'+esc(x.category||'Inne')+'</small></span><b>'+PLN(x.amount)+'/m <small>'+PLN(N(x.amount)*12)+'/rok</small></b></div>').join('')+'</div>':'<p class="muted">Brak zapisanych stałych kosztów.</p>')+'</section>'
}
function renderBudget54(){
 let h=G('budgetBody');if(!h||!ensure54())return;G('opsBudget54')?.remove();let k=S.finance.analysisMonth||S.finance.selectedMonth||nowKey(),box=document.createElement('div');box.id='opsBudget54';box.innerHTML=annualCostHtml54(k)+recurringAuditHtml54(k);h.appendChild(box)
}
function reportData54(k){
 let p=planner()?.monthPlan?.(k),prev=planner()?.monthPlan?.(addMonths(k,-1)),score=command()?.financialScore?.(k),acts=actionPlan(k),done=acts.filter(x=>isDone(k,x.id)).length;
 if(!p)return null;
 let change=(a,b)=>b?((a-b)/Math.abs(b)*100):0;
 return{k,p,prev,score,actions:acts.length,done,incomeChange:prev?change(p.inc.total,prev.inc.total):0,freeChange:prev?N(p.free)-N(prev.free):0}
}
function monthlyReportHtml54(k){
 let r=reportData54(k);if(!r)return'';
 let {y,m}=parseKey(k),saved=S.finance.ops54.monthReports[k];
 return '<section class="card report54"><div class="title">Raport miesiąca — '+FULL[m]+' '+y+' <button class="btn" onclick="saveMonthReport54(\''+k+'\')">'+(saved?'Odśwież zapis':'Zapisz raport')+'</button></div><div class="opsKpis54"><div><small>DOCHÓD</small><b>'+PLN(r.p.inc.total)+'</b><span class="'+(r.incomeChange>=0?'green':'red')+'">'+(r.incomeChange>=0?'+':'')+r.incomeChange.toFixed(1)+'% m/m</span></div><div><small>NADWYŻKA</small><b class="'+(r.p.free>=0?'green':'red')+'">'+PLN(r.p.free)+'</b><span>zmiana '+PLN(r.freeChange)+'</span></div><div><small>KONDYCJA</small><b>'+Math.round(r.score?.total||0)+'/100</b><span>'+esc(r.score?.state||'—')+'</span></div><div><small>PLAN DZIAŁANIA</small><b>'+r.done+'/'+r.actions+'</b><span>wykonane</span></div></div><div class="reportNotes54"><b>Automatyczne podsumowanie</b><span>'+(r.p.free>=0?'Miesiąc ma dodatnią prognozowaną nadwyżkę.':'Miesiąc wymaga korekty, bo prognoza jest ujemna.')+' '+(r.incomeChange>=0?'Dochód jest wyższy niż miesiąc wcześniej.':'Dochód jest niższy niż miesiąc wcześniej.')+' '+(r.score?.total>=70?'Ogólna kondycja jest dobra.':'Wskaźnik kondycji wymaga uwagi.')+'</span></div>'+(saved?'<p class="muted">Ostatni zapis raportu: '+new Date(saved.stamp).toLocaleString('pl-PL')+'</p>':'')+'</section>'
}
window.saveMonthReport54=function(k){
 ensure54();let r=reportData54(k);if(!r)return;
 S.finance.ops54.monthReports[k]={stamp:new Date().toISOString(),income:N(r.p.inc.total),free:N(r.p.free),score:N(r.score?.total),actions:r.actions,done:r.done,taxReserve:N(r.p.tr.total),minimum:N(r.p.mi.planned)};save54();renderActions54();renderControl54()
};
function decisionModal54(){
 open('<h2>Zapisz decyzję finansową</h2><div class="form"><label>Decyzja<input id="dc54n" placeholder="np. Nadpłacam kredyt 500 zł/m"></label><label>Obszar<select id="dc54a"><option>Kredyty</option><option>Firma</option><option>Wydatki</option><option>Cele</option><option>Inwestycje</option><option>Podatki</option><option>Inne</option></select></label><label>Wpływ miesięczny (+/- zł)<input id="dc54v" type="number" step="0.01"></label><label>Data przeglądu<input id="dc54d" type="date"></label><label>Powód / założenie<textarea id="dc54r"></textarea></label></div><button class="btn primary" onclick="saveDecision54()">Zapisz decyzję</button>')
}
window.decisionModal54=decisionModal54;
window.saveDecision54=function(){
 ensure54();S.finance.ops54.decisions.unshift({id:Date.now(),stamp:new Date().toISOString(),name:G('dc54n')?.value?.trim()||'Decyzja',area:G('dc54a')?.value||'Inne',monthly:N(G('dc54v')?.value),review:G('dc54d')?.value||'',reason:G('dc54r')?.value?.trim()||''});S.finance.ops54.decisions=S.finance.ops54.decisions.slice(0,100);save54();closeModal();renderControl54()
};
window.removeDecision54=function(id){if(confirm('Usunąć decyzję?')){S.finance.ops54.decisions=S.finance.ops54.decisions.filter(x=>x.id!==id);save54();renderControl54()}};
function decisionHtml54(){
 let ds=S.finance.ops54.decisions||[],today=new Date().toISOString().slice(0,10),review=ds.filter(x=>x.review&&x.review<=today).length;
 return '<section class="card"><div class="title">Dziennik decyzji <button class="btn primary" onclick="decisionModal54()">＋ Decyzja</button><span class="pill">'+review+' do przeglądu</span></div>'+(ds.length?ds.slice(0,8).map(x=>'<div class="decisionRow54"><div><small>'+esc(x.area)+' • '+new Date(x.stamp).toLocaleDateString('pl-PL')+'</small><b>'+esc(x.name)+'</b><span>'+esc(x.reason||'bez notatki')+(x.review?' • przegląd '+esc(x.review):'')+'</span></div><strong class="'+(N(x.monthly)>=0?'green':'red')+'">'+(N(x.monthly)>=0?'+':'')+PLN(x.monthly)+'/m</strong><button class="btn danger" onclick="removeDecision54('+x.id+')">Usuń</button></div>').join(''):'<p class="muted">Zapisuj tu większe decyzje, żeby później sprawdzić, czy faktycznie pomogły.</p>')+'</section>'
}
function renderControl54(){
 let h=G('controlBody51');if(!h||!ensure54())return;G('opsControl54')?.remove();let k=S.finance.control51?.month||nowKey(),box=document.createElement('div');box.id='opsControl54';
 box.innerHTML='<section class="card opsPlan54"><div class="title">Plan działania — '+k+' <button class="btn" onclick="show(\'actions\')">Pełny plan ›</button></div>'+actionHtml54(k,true)+'</section>'+monthlyReportHtml54(k)+annualCostHtml54(k)+decisionHtml54();
 h.appendChild(box)
}
function renderHome54(){
 let h=G('home');if(!h||!ensure54())return;G('opsHome54')?.remove();let k=nowKey(),rows=actionPlan(k),urgent=rows.filter(x=>x.priority<=2&&!isDone(k,x.id)),box=document.createElement('div');box.id='opsHome54';box.className='card';
 box.innerHTML='<div class="title">Co masz zrobić teraz <button class="btn primary" onclick="show(\'actions\')">Plan działania ›</button></div>'+(urgent.length?urgent.slice(0,3).map(x=>'<div class="homeTask54"><span class="prio54 p'+x.priority+'">'+x.priority+'</span><div><b>'+x.title+'</b><small>'+x.text+'</small></div>'+(x.amount?'<strong>'+PLN(x.amount)+'</strong>':'')+'</div>').join(''):'<p class="muted">Brak pilnych pozycji priorytetu 1–2.</p>');
 let cmd=G('commandHome53');if(cmd)cmd.insertAdjacentElement('afterend',box);else h.prepend(box)
}
function renderCalendar54(){
 let h=G('calendarBody');if(!h||!ensure54())return;G('annualCalendar54')?.remove();let k=S.finance.analysisMonth||nowKey(),{y,m}=parseKey(k),rows=annualCosts().filter(x=>N(x.month)===m+1&&(x.repeat!==false||N(x.year)===y)),box=document.createElement('div');box.id='annualCalendar54';box.className='card';
 box.innerHTML='<div class="title">Koszty roczne w tym miesiącu</div>'+(rows.length?rows.map(x=>'<div class="row"><span>'+esc(x.name)+' <small>'+esc(x.category)+'</small></span><b>'+PLN(x.amount)+'</b></div>').join(''):'<p class="muted">Brak kosztów rocznych przypisanych do tego miesiąca.</p>');h.appendChild(box)
}
function renderSettings54(){
 let h=G('settings');if(!h||!ensure54())return;G('opsSettings54')?.remove();let box=document.createElement('div');box.id='opsSettings54';box.className='card';
 box.innerHTML='<div class="title">Warstwa operacyjna 5.3</div><p class="muted">Automatyczny plan działania, odhaczanie kroków, rezerwy na koszty roczne, audyt abonamentów, raport miesiąca i dziennik decyzji.</p><div class="actions"><button class="btn primary" onclick="show(\'actions\')">✅ Plan działania</button><button class="btn" onclick="show(\'control\')">🧭 Centrum dowodzenia</button><button class="btn" onclick="show(\'budget\')">🧾 Rezerwy roczne</button></div>';h.prepend(box)
}
function renderAll54(){if(!ensure54())return;setVersion54();renderHome54();renderControl54();renderActions54();renderBudget54();renderCalendar54();renderSettings54()}
const oldRender=window.render;if(typeof oldRender==='function'&&!oldRender.__mf54){let fn=function(){let out=oldRender();renderAll54();return out};fn.__mf54=true;window.render=fn}
const oldShow=window.show;if(typeof oldShow==='function'&&!oldShow.__mf54){let fn=function(v){let out=oldShow(v);setVersion54();if(v==='home')renderHome54();if(v==='control')renderControl54();if(v==='actions')renderActions54();if(v==='budget')renderBudget54();if(v==='calendar')renderCalendar54();if(v==='settings')renderSettings54();return out};fn.__mf54=true;window.show=fn}
window.mfOps54={actionPlan,annualSummary,annualReserve,dueReserveNow,reportData:reportData54};
let st=document.createElement('style');st.textContent='.opsHead54{display:flex;align-items:center;gap:10px;margin-bottom:10px;color:#77869a;font-size:10px}.opsProgress54{height:7px;background:#e8edf3;border-radius:99px;overflow:hidden;flex:1}.opsProgress54 i{display:block;height:100%;background:#5b87bf;border-radius:99px}.opsActions54{display:grid;gap:8px}.opsAction54{display:grid;grid-template-columns:30px 1fr auto;gap:10px;align-items:center;padding:11px;border:1px solid #e3e9f1;border-left-width:4px;border-radius:12px;background:#fff}.opsAction54.p1{border-left-color:#d95c6b}.opsAction54.p2{border-left-color:#d89b36}.opsAction54.p3{border-left-color:#5b88c5}.opsAction54.p4{border-left-color:#9aa7b8}.opsAction54.done{opacity:.55}.opsAction54.done b{text-decoration:line-through}.opsCheck54{border:0;background:#eef3f8;width:28px;height:28px;border-radius:50%;cursor:pointer;color:#315f9f;font-weight:800}.opsAction54 small,.opsAction54 span,.opsAction54 strong{display:block}.opsAction54 small{font-size:8px;color:#8793a3;font-weight:800}.opsAction54 b{color:#38536f}.opsAction54 span{margin-top:3px;color:#758297;font-size:10px}.opsAction54 strong{margin-top:5px;color:#315274}.opsKpis54{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.opsKpis54>div{padding:12px;border:1px solid #e3e9f1;border-radius:12px;background:#f8fafc}.opsKpis54 small,.opsKpis54 span{display:block;color:#7b899b;font-size:9px}.opsKpis54 b{display:block;margin-top:5px;color:#315274}.annualList54{margin-top:10px}.annualList54 .row>div small,.annualList54 .row>b small{display:block;color:#8591a2;font-size:9px}.reportNotes54{margin-top:10px;padding:12px;border-radius:12px;background:#f3f6fa;border:1px solid #e3e9f1}.reportNotes54 b,.reportNotes54 span{display:block}.reportNotes54 span{margin-top:4px;color:#718096;font-size:11px}.decisionRow54{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid #e7ecf2}.decisionRow54 small,.decisionRow54 span{display:block;color:#7d899a;font-size:9px}.decisionRow54 b{display:block;color:#40556e;margin:2px 0}.homeTask54{display:grid;grid-template-columns:28px 1fr auto;gap:9px;align-items:center;padding:9px 0;border-bottom:1px solid #e8edf3}.homeTask54 small{display:block;color:#79879a;margin-top:3px}.homeTask54 strong{color:#315274}.prio54{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;font-size:10px;font-weight:800;background:#eef3f8}.prio54.p1{background:#fdebed;color:#a33441}.prio54.p2{background:#fff3d8;color:#8b6418}@media(max-width:720px){.opsKpis54{grid-template-columns:repeat(2,minmax(0,1fr))}.opsAction54{grid-template-columns:28px 1fr}.opsAction54>.btn{grid-column:2;justify-self:start}.decisionRow54{grid-template-columns:1fr auto}.decisionRow54>.btn{grid-column:1/-1;justify-self:start}}@media(max-width:520px){.opsKpis54{grid-template-columns:1fr 1fr}.homeTask54{grid-template-columns:26px 1fr}.homeTask54 strong{grid-column:2}}';document.head.appendChild(st);
})();
