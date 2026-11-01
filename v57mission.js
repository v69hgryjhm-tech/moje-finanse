/* Moje Finanse 5.6 — Mission Control / briefing startowy */
(function(){
'use strict';
const VERSION='5.8.3',G=id=>document.getElementById(id),N=v=>+v||0,CL=(v,a,b)=>Math.max(a,Math.min(b,v));
const PLN=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:0,maximumFractionDigits:0}).format(N(v));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const MN=['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru'];
const planner=()=>window.mfPlanner52||null,control=()=>window.mfControl51||null,command=()=>window.mfCommand53||null,ops=()=>window.mfOps54||null,auto=()=>window.mfAutopilot56||null;
function key(y,m){return String(y)+'-'+String(m+1).padStart(2,'0')}
function nowKey(){let d=new Date();return key(d.getFullYear(),d.getMonth())}
function parseKey(k){let [y,m]=String(k||'').split('-').map(Number);return{y:y||new Date().getFullYear(),m:Math.max(0,(m||1)-1)}}
function addMonths(k,n){let {y,m}=parseKey(k),d=new Date(y,m+n,1,12);return key(d.getFullYear(),d.getMonth())}
function greeting57(){let h=new Date().getHours();return h<18?'Dzień dobry':'Dobry wieczór'}
function ensure57(){if(typeof S==='undefined')return false;S.finance||={};S.finance.mission57||={};return true}
function setVersion57(){document.title='Moje Finanse '+VERSION;let h=document.querySelector('.top small');if(h)h.innerHTML='<span id="headerYear">'+(typeof S!=='undefined'?S.selectedYear:'')+'</span> • wersja '+VERSION;document.documentElement.dataset.appVersion=VERSION}
function loanBalance57(l){try{return N(window.loanCurrentPoint15?.(l)?.balance)}catch{return N(l?.balance)}}
function monthPlan57(k){return planner()?.monthPlan?.(k)||null}
function financial57(k){return command()?.financialScore?.(k)||null}
function company57(){return command()?.companyBreakEven?.()||null}
function privateStatus57(k){
 let p=monthPlan57(k);if(!p)return{score:0,label:'brak danych',free:0,debt:0,cushion:0};
 let income=N(p.inc.total),essential=N(p.mi.essential),loans=N(p.mi.loans),saved=N(S.finance.emergencySavings),free=N(p.free);
 let coverage=income>0?income/Math.max(1,N(p.mi.planned)):0,cushion=essential>0?saved/essential:0,debtShare=income>0?loans/income:0;
 let score=Math.round(CL((coverage-.75)/.45,0,1)*30+CL((.50-debtShare)/.35,0,1)*25+CL(cushion/6,0,1)*25+CL((free+essential*.25)/Math.max(1,essential*.5),0,1)*20);
 return{score:CL(score,0,100),label:score>=80?'bardzo dobra':score>=65?'dobra':score>=50?'stabilna':score>=35?'ostrożna':'napięta',free,debt:(S.loans||[]).reduce((a,l)=>a+loanBalance57(l),0),cushion}
}
function companyStatus57(){
 let b=company57();if(!b?.ok)return{known:false,score:null,label:'brak danych',sales:0,safe:0,margin:0};
 let ratio=N(b.safe)>0?N(b.sales)/N(b.safe):0,margin=N(b.sales)-N(b.safe),score=Math.round(CL(ratio/1.25,0,1)*100);
 return{known:true,score,label:ratio>=1.2?'mocna':ratio>=1?'bezpieczna':ratio>=.8?'blisko progu':'poniżej progu',sales:N(b.sales),safe:N(b.safe),margin}
}
function actionRows57(k){let rows=ops()?.actionPlan?.(k)||[],done=S.finance.ops54?.actionDone?.[k]||{};return rows.filter(x=>!done[x.id]).slice(0,3)}
window.missionToggleAction57=function(k,id){try{window.toggleAction54?.(k,id)}catch{}renderMission57()};
function alerts57(k){let y=parseKey(k).y;try{return(command()?.commandAlerts?.(k,y)||[]).slice(0,3)}catch{return[]}}
function activeExpense57(e,k){if(e?.active===false)return false;if(e?.kind==='once')return e.month===k;return(!e?.from||k>=e.from)&&(!e?.to||k<=e.to)}
function dateSafe57(y,m,day){let last=new Date(y,m+1,0).getDate();return new Date(y,m,Math.max(1,Math.min(last,N(day)||1)),12)}
function upcoming30_57(){
 let today=new Date(),start=new Date(today.getFullYear(),today.getMonth(),today.getDate(),0),end=new Date(start);end.setDate(end.getDate()+29);
 let out=[],seen=new Set(),add=(d,name,amount,kind)=>{if(!(d instanceof Date)||isNaN(d)||d<start||d>end)return;let sig=d.toISOString().slice(0,10)+'|'+name+'|'+amount;if(seen.has(sig))return;seen.add(sig);out.push({date:d,name,amount:N(amount),kind})};
 for(let offset=0;offset<2;offset++){
  let d=new Date(start.getFullYear(),start.getMonth()+offset,1,12),y=d.getFullYear(),m=d.getMonth(),k=key(y,m);
  (S.finance.expenses||[]).filter(e=>activeExpense57(e,k)).forEach(e=>add(dateSafe57(y,m,e.day),e.name||'Wydatek',e.amount,e.kind==='once'?'jednorazowe':'stałe'));
  (S.loans||[]).forEach(l=>{let hist=(l.history||[]).find(h=>h.month===k);if(hist?.paid)return;add(dateSafe57(y,m,l.dueDay),'Rata: '+(l.name||'Kredyt'),l.payment,'kredyt')});
  (S.finance.calendarEvents||[]).filter(e=>e.month===k).forEach(e=>add(dateSafe57(y,m,e.day),e.name||'Wydarzenie',e.amount,'kalendarz'));
  (S.finance.ops54?.annualCosts||[]).filter(c=>c.active!==false&&N(c.month)===m+1&&(c.repeat!==false||N(c.year)===y)).forEach(c=>add(dateSafe57(y,m,1),c.name||'Koszt roczny',c.amount,'roczne'))
 }
 return out.sort((a,b)=>a.date-b.date).slice(0,8)
}
function allocation57(k){try{return auto()?.allocation?.(k)||null}catch{return null}}
function changeRows57(k){
 let cur=monthPlan57(k),prev=monthPlan57(addMonths(k,-1));if(!cur||!prev)return[];
 const row=(name,a,b,inverse=false)=>{let d=N(a)-N(b),pct=N(b)?d/Math.abs(N(b))*100:0,good=inverse?d<=0:d>=0;return{name,a:N(a),d,pct,good}};
 return[row('Dochód',cur.inc.total,prev.inc.total),row('MOHE',cur.inc.company,prev.inc.company),row('Nadwyżka',cur.free,prev.free),row('Minimum + raty',cur.mi.essential,prev.mi.essential,true)].sort((a,b)=>Math.abs(b.pct)-Math.abs(a.pct)).slice(0,3)
}
function overallStatus57(k){
 let s=financial57(k),p=monthPlan57(k),cs=companyStatus57(),al=alerts57(k),score=Math.round(N(s?.total)),state=s?.state||'brak pełnych danych';
 let headline=score>=80?'Sytuacja wygląda bardzo dobrze.':score>=65?'Sytuacja jest dobra.':score>=50?'Sytuacja jest stabilna.':score>=35?'Kilka obszarów wymaga uwagi.':'Finanse wymagają dziś większej uwagi.',note='';
 if(p)note='Prognoza nadwyżki tego miesiąca: '+PLN(p.free)+'. ';
 if(cs.known)note+='MOHE jest '+(cs.margin>=0?PLN(cs.margin)+' powyżej':'około '+PLN(Math.abs(cs.margin))+' poniżej')+' bezpiecznego progu. ';
 if(al[0]?.title)note+='Najważniejszy sygnał: '+al[0].title+'.';
 return{score,state,headline,note}
}
function scoreBadge57(score){let s=CL(N(score),0,100),cls=s>=75?'good':s>=50?'mid':'bad';return'<div class="missionScore57 '+cls+'"><b>'+Math.round(s)+'</b><span>/100</span></div>'}
function tasksHtml57(k){
 let rows=actionRows57(k);
 return'<section class="missionCard57"><div class="missionTitle57"><div><small>NAJWAŻNIEJSZE TERAZ</small><b>3 rzeczy do zrobienia</b></div><button class="btn" onclick="show(\'actions\')">Pełny plan ›</button></div>'+(rows.length?'<div class="missionTasks57">'+rows.map((x,i)=>'<div><button onclick="missionToggleAction57(\''+k+'\',\''+esc(x.id)+'\')">○</button><span class="missionPriority57 p'+x.priority+'">'+(i+1)+'</span><div><b>'+x.title+'</b><small>'+x.text+'</small></div>'+(x.amount?'<strong>'+PLN(x.amount)+'</strong>':'')+'</div>').join('')+'</div>':'<div class="missionEmpty57">✓ Brak pilnych niewykonanych zadań. Możesz przejść do planowania kolejnych kroków.</div>')+'</section>'
}
function domainsHtml57(k){
 let ps=privateStatus57(k),cs=companyStatus57();
 return'<div class="missionDomains57"><section class="missionCard57 domain57"><div class="missionTitle57"><div><small>JA / FINANSE PRYWATNE</small><b>'+esc(ps.label)+'</b></div>'+scoreBadge57(ps.score)+'</div><div class="domainKpis57"><div><span>Nadwyżka miesiąca</span><b class="'+(ps.free>=0?'green':'red')+'">'+PLN(ps.free)+'</b></div><div><span>Saldo kredytów</span><b>'+PLN(ps.debt)+'</b></div><div><span>Poduszka</span><b>'+ps.cushion.toFixed(1)+' mies.</b></div></div><button class="missionLink57" onclick="show(\'control\')">Otwórz finanse prywatne ›</button></section><section class="missionCard57 domain57"><div class="missionTitle57"><div><small>MOHE / FIRMA</small><b>'+esc(cs.label)+'</b></div>'+(cs.known?scoreBadge57(cs.score):'<span class="pill">uzupełnij dane</span>')+'</div><div class="domainKpis57"><div><span>Ostatnia sprzedaż netto</span><b>'+PLN(cs.sales)+'</b></div><div><span>Bezpieczny próg</span><b>'+PLN(cs.safe)+'</b></div><div><span>Margines</span><b class="'+(cs.margin>=0?'green':'red')+'">'+PLN(cs.margin)+'</b></div></div><button class="missionLink57" onclick="show(\'businessplus\')">Otwórz MOHE ›</button></section></div>'
}
function upcomingHtml57(){
 let rows=upcoming30_57(),today=new Date();
 return'<section class="missionCard57"><div class="missionTitle57"><div><small>NASTĘPNE 30 DNI</small><b>Co nadchodzi</b></div><button class="btn" onclick="show(\'calendar\')">Kalendarz ›</button></div>'+(rows.length?'<div class="missionUpcoming57">'+rows.map(x=>{let days=Math.ceil((x.date-new Date(today.getFullYear(),today.getMonth(),today.getDate()))/86400000);return'<div><div class="date57"><b>'+x.date.getDate()+'</b><small>'+MN[x.date.getMonth()]+'</small></div><div><b>'+esc(x.name)+'</b><small>'+(days===0?'dzisiaj':days===1?'jutro':'za '+days+' dni')+' • '+esc(x.kind)+'</small></div><strong>'+PLN(x.amount)+'</strong></div>'}).join('')+'</div>':'<div class="missionEmpty57">Brak zapisanych płatności i wydarzeń na najbliższe 30 dni.</div>')+'</section>'
}
function allocationHtml57(k){
 let x=allocation57(k);if(!x)return'<section class="missionCard57"><div class="missionTitle57"><div><small>AUTOPILOT</small><b>Brak danych do rekomendacji</b></div></div></section>';
 const labels={emergency:'Poduszka',debt:'Kredyt',invest:'Inwestycje',goals:'Cele',business:'MOHE'};
 return'<section class="missionCard57 autopilot57"><div class="missionTitle57"><div><small>AUTOPILOT — REKOMENDACJA MIESIĄCA</small><b>'+esc(x.strategy?.label||'Strategia')+'</b></div><button class="btn primary" onclick="show(\'autopilot\')">Dlaczego tak? ›</button></div><div class="autoLead57"><div><span>Prognozowana nadwyżka</span><b>'+PLN(x.raw)+'</b></div><div><span>Po rezerwie rocznej do podziału</span><b>'+PLN(x.available)+'</b></div></div>'+(x.available>0?'<div class="autoSplit57">'+Object.entries(x.out||{}).map(([k2,v])=>'<div><small>'+labels[k2]+'</small><b>'+PLN(v)+'</b><i style="width:'+Math.round(N(x.weights?.[k2])*100)+'%"></i></div>').join('')+'</div>':'<p class="muted">W tym miesiącu Autopilot nie proponuje dodatkowej alokacji kapitału.</p>')+'</section>'
}
function changesHtml57(k){
 let rows=changeRows57(k);
 return'<section class="missionCard57"><div class="missionTitle57"><div><small>OD OSTATNIEGO MIESIĄCA</small><b>Co się zmieniło?</b></div><button class="btn" onclick="show(\'review\')">Review ›</button></div>'+(rows.length?'<div class="missionChanges57">'+rows.map(x=>'<div><small>'+x.name+'</small><b>'+PLN(x.a)+'</b><span class="'+(x.good?'green':'red')+'">'+(x.d>=0?'+':'')+PLN(x.d)+' • '+(x.pct>=0?'+':'')+x.pct.toFixed(1)+'%</span></div>').join('')+'</div>':'<div class="missionEmpty57">Potrzebne są dane z co najmniej dwóch miesięcy.</div>')+'</section>'
}
function renderMission57(){
 let home=G('home');if(!home||!ensure57())return;
 let host=G('missionHome57');if(!host){host=document.createElement('div');host.id='missionHome57';home.prepend(host)}
 home.classList.add('missionMode57');
 let k=nowKey(),st=overallStatus57(k),d=new Date(),tasks=actionRows57(k),alerts=alerts57(k);
 host.innerHTML='<div class="missionHero57"><div class="missionHeroCopy57"><small>'+greeting57()+' • '+d.toLocaleDateString('pl-PL',{weekday:'long',day:'numeric',month:'long'})+'</small><h2>'+esc(st.headline)+'</h2><p>'+esc(st.note)+'</p><div class="missionHeroActions57"><button class="btn primary" onclick="show(\'control\')">🧭 Centrum dowodzenia</button><button class="btn" onclick="show(\'autopilot\')">🤖 Autopilot</button></div></div><div class="missionOverall57">'+scoreBadge57(st.score)+'<div><small>KONDYCJA CAŁOŚCI</small><b>'+esc(st.state)+'</b><span>'+tasks.length+' zadań • '+alerts.length+' aktywnych sygnałów</span></div></div></div>'+tasksHtml57(k)+domainsHtml57(k)+upcomingHtml57()+allocationHtml57(k)+changesHtml57(k)+'<section class="missionDetails57"><button class="btn" onclick="toggleLegacyHome57()"><span id="legacyToggleText57">Pokaż szczegóły finansowe</span> ↓</button><small>Kafelki, wykresy, etat, firma i kredyty z dotychczasowego Startu.</small></section>';
 updateLegacyButton57()
}
window.toggleLegacyHome57=function(){let home=G('home');if(!home)return;let opening=!home.classList.contains('showLegacy57');home.classList.toggle('showLegacy57');if(opening)try{window.mfKernel59?.renderLegacyHome?.()}catch(e){console.error('Legacy home details',e)}updateLegacyButton57()};
function updateLegacyButton57(){let h=G('home'),t=G('legacyToggleText57');if(t)t.textContent=h?.classList.contains('showLegacy57')?'Ukryj szczegóły finansowe':'Pokaż szczegóły finansowe'}
function install57(){
 let s=window.show;if(typeof s==='function'&&!s.__mission57){let fn=function(v){let out;try{out=s(v)}catch(e){try{console.error('[Mission 5.6] show',e)}catch{}}finally{setVersion57();if(v==='home')renderMission57()}return out};fn.__mission57=true;window.show=fn}
 let r=window.render;if(typeof r==='function'&&!r.__mission57){let fn=function(){let out;try{out=r()}catch(e){try{console.error('[Mission 5.6] render',e)}catch{}}finally{setVersion57();renderMission57()}return out};fn.__mission57=true;window.render=fn}
}
window.mfMission57={render:renderMission57,upcoming30:upcoming30_57,privateStatus:privateStatus57,companyStatus:companyStatus57};
window.addEventListener('finance-modules-ready',()=>{install57()},{once:true});
})();
