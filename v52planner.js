/* Moje Finanse 5.1 — plan 90 dni, kondycja, alerty i decyzje */
(function(){
'use strict';
const VERSION='5.3.0',G=id=>document.getElementById(id),N=v=>+v||0;
const PLN=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(N(v));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const MONTHS=['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru'];
const api=()=>window.mfControl51||null;
function monthKey(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
function addMonths(k,n){let p=String(k||'').split('-').map(Number),d=new Date(p[0]||new Date().getFullYear(),Math.max(0,(p[1]||1)-1)+n,1,12);return monthKey(d)}
function parseMonth(k){let p=String(k||'').split('-').map(Number);return{y:p[0]||new Date().getFullYear(),m:Math.max(0,(p[1]||1)-1)}}
function currentKey(){return monthKey(new Date())}
function setVersion52(){
 document.title='Moje Finanse '+VERSION;
 let h=document.querySelector('.top small');
 if(h)h.innerHTML='<span id="headerYear">'+(typeof S!=='undefined'?S.selectedYear:'')+'</span> • wersja '+VERSION;
 document.documentElement.dataset.appVersion=VERSION
}
function monthPlan(k){
 let a=api();if(!a)return null;
 let inc=a.monthIncome(k),mi=a.minIncome(k),tr=a.taxReserve(k),free=N(inc.total)-N(mi.planned);
 return{k,inc,mi,tr,free,cover:mi.planned>0?inc.total/mi.planned:inc.total>0?99:0}
}
function plan90(start){
 let rows=[];for(let i=0;i<3;i++){let x=monthPlan(addMonths(start,i));if(x)rows.push(x)}return rows
}
function recurringExpenses(k){
 let f=S?.finance||{},arr=f.expenses||[];
 return arr.filter(e=>{
  if(e?.active===false||e?.kind==='once')return false;
  return(!e?.from||k>=e.from)&&(!e?.to||k<=e.to)
 }).sort((a,b)=>N(b.amount)-N(a.amount))
}
function loanBalance(l){
 try{return N(window.loanCurrentPoint15?.(l)?.balance)}catch{return N(l?.balance)}
}
function targetLoan(){
 return (S?.loans||[]).filter(l=>loanBalance(l)>0).sort((a,b)=>N(b.rate)-N(a.rate)||loanBalance(b)-loanBalance(a))[0]||null
}
function cushionMonths(k){
 let mi=api()?.minIncome(k),saved=N(S?.finance?.emergencySavings);
 return mi&&mi.essential>0&&saved>0?saved/mi.essential:null
}
function health(k){
 let p=monthPlan(k);if(!p)return null;
 let debtShare=p.inc.total>0?p.mi.loans/p.inc.total:0,cush=cushionMonths(k),close=api().closeState(k),done=close.checks.filter(x=>x.done).length,total=close.checks.length;
 let state='stabilna',tone='green';
 if(!p.inc.total){state='uzupełnij dane';tone='muted'}
 else if(p.free<0){state='napięta';tone='red'}
 else if(debtShare>.40||(cush!=null&&cush<1)){state='ostrożna';tone='orange'}
 return{...p,debtShare,cush,closeDone:done,closeTotal:total,state,tone}
}
function goalAlert(){
 let goals=S?.finance?.goals||[],now=new Date(),bad=null;
 goals.forEach(g=>{
  let remain=Math.max(0,N(g.target)-N(g.current)),monthly=N(g.monthly);
  if(!remain||!g.due)return;
  let p=String(g.due).split('-').map(Number),months=Math.max(1,(p[0]-now.getFullYear())*12+(p[1]-1-now.getMonth()));
  let need=remain/months,coverage=need>0?monthly/need:1;
  if(coverage<.75&&(!bad||coverage<bad.coverage))bad={name:g.name||'Cel',coverage,need,monthly}
 });
 return bad
}
function alerts(k){
 let h=health(k),list=[],now=new Date(),up=api()?.upcoming(k)||[];
 if(!h)return list;
 if(h.free<0)list.push({level:'red',title:'Plan miesiąca jest na minusie',text:'Brakuje '+PLN(Math.abs(h.free))+' do pokrycia stałych kosztów, rat i zaplanowanych wpłat na cele.',action:"show('budget')",button:'Sprawdź wydatki'});
 let day=(k===currentKey()?now.getDate():1),soon=up.filter(x=>x.day>=day&&x.day<=day+7),soonSum=soon.reduce((a,x)=>a+N(x.amount),0);
 if(soon.length)list.push({level:'blue',title:'Płatności w najbliższych 7 dniach',text:soon.length+' pozycji na '+PLN(soonSum)+'. Najbliżej: '+esc(soon[0].name)+'.',action:"show('control')",button:'Zobacz plan'});
 if(h.debtShare>.35)list.push({level:'orange',title:'Raty mają duży udział w dochodzie',text:'Planowane raty to '+(h.debtShare*100).toFixed(0)+'% prognozowanego dochodu miesiąca.',action:"show('loans')",button:'Przejdź do kredytów'});
 let tr=h.tr;if(N(tr.total)>0)list.push({level:'blue',title:'Rezerwa firmy do uwzględnienia',text:'VAT + PIT + ZUS + zdrowotna: '+PLN(tr.total)+'. Jest pokazana osobno od wyniku firmy.',action:"show('control')",button:'Szczegóły'});
 let ga=goalAlert();if(ga)list.push({level:'orange',title:'Cel ma zbyt wolne tempo',text:esc(ga.name)+': obecna wpłata pokrywa tylko '+Math.max(0,ga.coverage*100).toFixed(0)+'% tempa potrzebnego do terminu.',action:"show('goals')",button:'Otwórz cele'});
 if(now.getDate()>=25&&h.closeDone<h.closeTotal&&k===currentKey())list.push({level:'orange',title:'Miesiąc nie jest jeszcze zamknięty',text:'Sprawdzone '+h.closeDone+' z '+h.closeTotal+' punktów zamknięcia miesiąca.',action:"show('control')",button:'Dokończ miesiąc'});
 if(!list.length)list.push({level:'green',title:'Brak pilnych ostrzeżeń',text:'Na podstawie zapisanych dochodów, rat, kosztów i terminów plan miesiąca wygląda spokojnie.',action:"show('control')",button:'Otwórz centrum'});
 return list.slice(0,4)
}
function bestDecision(k){
 let h=health(k);if(!h)return null;
 if(h.free<=0)return{title:'Najpierw domknij miesiąc',text:'Nie dziel nadwyżki. Najpierw zredukuj lukę '+PLN(Math.abs(h.free))+'.',kind:'red'};
 let loan=targetLoan(),cush=h.cush;
 if(cush!=null&&cush<3)return{title:'Najpierw wzmocnij poduszkę',text:'Obecna poduszka pokrywa ok. '+cush.toFixed(1)+' mies. minimum. Do 3 miesięcy brakuje około '+PLN(Math.max(0,h.mi.essential*3-N(S.finance.emergencySavings)))+'.',kind:'blue'};
 if(loan&&N(loan.rate)>=7)return{title:'Najmocniejszy kandydat: nadpłata długu',text:esc(loan.name||'Kredyt')+' ma oprocentowanie '+N(loan.rate).toFixed(2)+'%. Wysoka część nadwyżki może iść na jego nadpłatę.',kind:'blue'};
 let ga=goalAlert();if(ga)return{title:'Przyspiesz najpilniejszy cel',text:esc(ga.name)+' wymaga około '+PLN(ga.need)+' miesięcznie, aby utrzymać termin.',kind:'blue'};
 return{title:'Podziel nadwyżkę według planu',text:'Prognozowana nadwyżka: '+PLN(h.free)+'. Użyj ustawionych proporcji między poduszkę, dług, cele i pozostałe potrzeby.',kind:'green'}
}
function planTable52(start,compact){
 let rows=plan90(start);
 return '<div class="plan90Table52 '+(compact?'compact52':'')+'"><div class="plan90Head52"><span>Miesiąc</span><span>Dochód</span><span>Minimum + cele</span><span>Rezerwa firmy</span><span>Nadwyżka</span></div>'+rows.map(x=>{let p=parseMonth(x.k);return'<div class="plan90Row52"><b>'+MONTHS[p.m]+' '+p.y+'</b><span>'+PLN(x.inc.total)+'</span><span>'+PLN(x.mi.planned)+'</span><span>'+PLN(x.tr.total)+'</span><strong class="'+(x.free>=0?'green':'red')+'">'+PLN(x.free)+'</strong></div>'}).join('')+'</div>'
}
function renderHome52(){
 let host=G('home'),a=api();if(!host||!a||typeof S==='undefined')return;
 G('homePlan52')?.remove();G('homeAlerts52')?.remove();
 let k=currentKey(),h=health(k),decision=bestDecision(k),plan=document.createElement('div');plan.id='homePlan52';plan.className='card';
 plan.innerHTML='<div class="title">Plan 90 dni <button class="btn" onclick="show(\'control\')">Pełne Centrum ›</button></div>'+planTable52(k,true);
 let alertBox=document.createElement('div');alertBox.id='homeAlerts52';alertBox.className='card';
 alertBox.innerHTML='<div class="title">Alerty i decyzje <span class="pill">'+(h?esc(h.state):'—')+'</span></div><div class="alertList52">'+alerts(k).map(x=>'<div class="alert52 '+x.level+'"><div><b>'+x.title+'</b><span>'+x.text+'</span></div><button class="btn" onclick="'+x.action+'">'+x.button+'</button></div>').join('')+'</div>'+(decision?'<div class="decision52 '+decision.kind+'"><small>NAJWAŻNIEJSZA DECYZJA</small><b>'+decision.title+'</b><span>'+decision.text+'</span></div>':'');
 let anchor=G('today51')||host.querySelector('.hero');
 if(anchor){anchor.insertAdjacentElement('afterend',plan);plan.insertAdjacentElement('afterend',alertBox)}else{host.prepend(alertBox);host.prepend(plan)}
}
function healthCard52(k){
 let h=health(k);if(!h)return'';
 return '<section class="card"><div class="title">Kondycja miesiąca <span class="pill '+h.tone+'">'+esc(h.state)+'</span></div><div class="healthGrid52"><div><small>POKRYCIE PLANU</small><b>'+Math.min(999,h.cover*100).toFixed(0)+'%</b><span>dochód / minimum + cele</span></div><div><small>UDZIAŁ RAT</small><b>'+Math.min(999,h.debtShare*100).toFixed(0)+'%</b><span>raty / dochód</span></div><div><small>PODUSZKA</small><b>'+(h.cush==null?'brak danych':h.cush.toFixed(1)+' mies.')+'</b><span>bez obowiązkowego salda konta</span></div><div><small>ZAMKNIĘCIE</small><b>'+h.closeDone+'/'+h.closeTotal+'</b><span>sprawdzonych punktów</span></div></div></section>'
}
function fixedAudit52(k){
 let arr=recurringExpenses(k),sum=arr.reduce((a,e)=>a+N(e.amount),0),inc=N(api()?.monthIncome(k)?.total),ratio=inc>0?sum/inc:0;
 return '<section class="card"><div class="title">Audyt stałych kosztów <button class="btn" onclick="show(\'budget\')">Edytuj wydatki ›</button></div><div class="controlGrid51"><div><small>STAŁE KOSZTY</small><b>'+PLN(sum)+'</b></div><div><small>UDZIAŁ W DOCHODZIE</small><b>'+Math.min(999,ratio*100).toFixed(0)+'%</b></div><div><small>LICZBA POZYCJI</small><b>'+arr.length+'</b></div></div>'+(arr.length?'<div class="fixedList52">'+arr.slice(0,5).map(e=>'<div class="row"><span>'+esc(e.name||'Wydatek stały')+'</span><b>'+PLN(e.amount)+'</b></div>').join('')+'</div>':'<p class="muted">Nie masz jeszcze zapisanych stałych kosztów.</p>')+'</section>'
}
function renderControl52(){
 let host=G('controlBody51'),a=api();if(!host||!a||typeof S==='undefined')return;
 G('controlPlus52')?.remove();let k=S.finance?.control51?.month||currentKey(),decision=bestDecision(k),box=document.createElement('div');box.id='controlPlus52';
 box.innerHTML=healthCard52(k)+'<section class="card"><div class="title">Plan 90 dni <span class="pill">bez salda konta</span></div>'+planTable52(k,false)+'<p class="muted">Nadwyżka = prognozowany dochód minus koszty stałe, raty i zaplanowane wpłaty na cele. Rezerwa firmy jest pokazana osobno, ponieważ realny wynik firmy już uwzględnia podatki i składki.</p></section>'+fixedAudit52(k)+(decision?'<section class="card"><div class="title">Rekomendowana kolejność działania</div><div class="decision52 '+decision.kind+'"><small>TERAZ</small><b>'+decision.title+'</b><span>'+decision.text+'</span></div><div class="quickLinks52"><button class="btn" onclick="show(\'budget\')">Wydatki</button><button class="btn" onclick="show(\'loans\')">Kredyty</button><button class="btn" onclick="show(\'goals\')">Cele</button><button class="btn" onclick="show(\'emergency\')">Poduszka</button></div></section>':'');
 host.appendChild(box)
}
function loanPlan(l){
 try{let t=window.loanTimeline15?.(l,true),f=t?.forecast||[];return{months:f.length,interest:f.reduce((a,r)=>a+N(r.interest),0)}}catch{return null}
}
function overpayRows52(l){
 let base=loanPlan(l);if(!base)return[];
 return[100,300,500].map(extra=>{
  let clone;
  try{clone=JSON.parse(JSON.stringify(l))}catch{return null}
  clone.extraMonthly=N(clone.extraMonthly)+extra;
  let x=loanPlan(clone);if(!x)return null;
  return{extra,monthsSaved:Math.max(0,base.months-x.months),interestSaved:Math.max(0,base.interest-x.interest)}
 }).filter(Boolean)
}
function renderLoan52(){
 let host=G('loanList');if(!host||typeof S==='undefined')return;G('loanOverpay52')?.remove();
 let loan=targetLoan(),box=document.createElement('div');box.id='loanOverpay52';box.className='card';
 if(!loan){box.innerHTML='<div class="title">Szybka symulacja nadpłat</div><p class="muted">Dodaj aktywny kredyt, aby porównać nadpłaty.</p>';host.appendChild(box);return}
 let rows=overpayRows52(loan);
 box.innerHTML='<div class="title">Szybka symulacja nadpłat <span class="pill">'+esc(loan.name||'Kredyt')+' • '+N(loan.rate).toFixed(2)+'%</span></div><p class="muted">Porównanie zakłada stałą dodatkową nadpłatę co miesiąc i korzysta z tego samego silnika harmonogramu co karta kredytu.</p>'+(rows.length?'<div class="overpayGrid52">'+rows.map(x=>'<div><small>+'+PLN(x.extra)+' / MIES.</small><b>'+x.monthsSaved+' mies. szybciej</b><span>mniej odsetek: '+PLN(x.interestSaved)+'</span></div>').join('')+'</div>':'<p class="muted">Dla tego kredytu nie udało się zbudować symulacji.</p>');
 host.appendChild(box)
}
function renderAll52(){if(typeof S==='undefined'||!api())return;setVersion52();renderHome52();renderControl52();renderLoan52()}
const oldRender=window.render;if(typeof oldRender==='function'&&!oldRender.__mf52){let fn=function(){let out=oldRender();renderAll52();return out};fn.__mf52=true;window.render=fn}
const oldShow=window.show;if(typeof oldShow==='function'&&!oldShow.__mf52){let fn=function(v){let out=oldShow(v);setVersion52();if(v==='home')renderHome52();if(v==='control')renderControl52();if(v==='loans')renderLoan52();return out};fn.__mf52=true;window.show=fn}
window.mfPlanner52={monthPlan,plan90,health,alerts,bestDecision,recurringExpenses,overpayRows:overpayRows52};
let st=document.createElement('style');st.textContent='.plan90Table52{display:grid;gap:0;border:1px solid #e5eaf1;border-radius:12px;overflow:hidden}.plan90Head52,.plan90Row52{display:grid;grid-template-columns:1.05fr repeat(4,1fr);gap:8px;align-items:center;padding:9px 11px}.plan90Head52{background:#f3f6fa;color:#7b899b;font-size:9px;font-weight:800;letter-spacing:.03em}.plan90Row52{border-top:1px solid #e8edf3;font-size:11px}.plan90Row52 span,.plan90Row52 strong{text-align:right;font-variant-numeric:tabular-nums}.alertList52{display:grid;gap:8px}.alert52{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:11px 12px;border:1px solid #e5eaf1;border-radius:12px;background:#fff}.alert52 b,.alert52 span,.decision52 b,.decision52 span{display:block}.alert52 span,.decision52 span{margin-top:3px;color:#738196;font-size:11px}.alert52.red{border-left:4px solid #d95c6b}.alert52.orange{border-left:4px solid #d89b36}.alert52.blue{border-left:4px solid #5b88c5}.alert52.green{border-left:4px solid #57a57c}.decision52{margin-top:12px;padding:13px 14px;border-radius:12px;background:#f1f6fd;border:1px solid #dce8f7}.decision52.red{background:#fff2f3;border-color:#f0d5d9}.decision52.green{background:#eef8f2;border-color:#d5eadc}.decision52 small{display:block;color:#718198;font-size:9px;font-weight:800;letter-spacing:.05em}.decision52 b{margin-top:4px;color:#2e496e}.healthGrid52,.overpayGrid52{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.healthGrid52>div,.overpayGrid52>div{padding:12px;border:1px solid #e3e9f1;border-radius:12px;background:#f8fafc}.healthGrid52 small,.overpayGrid52 small{display:block;color:#7d899a;font-size:9px;font-weight:800}.healthGrid52 b,.overpayGrid52 b{display:block;margin-top:5px;color:#315274}.healthGrid52 span,.overpayGrid52 span{display:block;margin-top:4px;color:#7c899b;font-size:10px}.fixedList52{margin-top:8px}.quickLinks52{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.pill.orange{background:#fff5df;color:#9a6a14}.compact52 .plan90Head52,.compact52 .plan90Row52{padding:8px 9px}@media(max-width:720px){.healthGrid52,.overpayGrid52{grid-template-columns:repeat(2,minmax(0,1fr))}.plan90Head52,.plan90Row52{grid-template-columns:1fr 1fr 1fr}.plan90Head52 span:nth-child(4),.plan90Row52 span:nth-child(4){display:none}.plan90Head52 span:nth-child(3),.plan90Row52 span:nth-child(3){display:none}}@media(max-width:520px){.alert52{grid-template-columns:1fr}.alert52 .btn{justify-self:start}.healthGrid52,.overpayGrid52{grid-template-columns:1fr 1fr}.plan90Head52,.plan90Row52{font-size:10px}}';document.head.appendChild(st);
})();
