/* Moje Finanse 5.4 — laboratorium decyzji, inwestycje, review i portfolio MOHE */
(function(){
'use strict';
const VERSION='5.4.0',G=id=>document.getElementById(id),N=v=>+v||0,CL=(v,a,b)=>Math.max(a,Math.min(b,v));
const PLN=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(N(v));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const MN=['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru'];
const FULL=['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
const planner=()=>window.mfPlanner52||null,command=()=>window.mfCommand53||null,ops=()=>window.mfOps54||null;
function key(y,m){return String(y)+'-'+String(m+1).padStart(2,'0')}
function parseKey(k){let [y,m]=String(k||'').split('-').map(Number);return{y:y||new Date().getFullYear(),m:Math.max(0,(m||1)-1)}}
function ensure55(){
 if(typeof S==='undefined')return false;
 S.finance||={};S.finance.lab55||={};let o=S.finance.lab55;
 if(!Array.isArray(o.scenarios))o.scenarios=[];
 if(!o.scenariosInitialized){if(!o.scenarios.length)o.scenarios=[
  {name:'Bezpieczny',salaryDelta:0,companyPct:0,costDelta:-200,extraDebt:300,investMonthly:200,oneOff:0},
  {name:'Dług najpierw',salaryDelta:0,companyPct:0,costDelta:-300,extraDebt:700,investMonthly:0,oneOff:0},
  {name:'Rozwój',salaryDelta:0,companyPct:20,costDelta:200,extraDebt:300,investMonthly:300,oneOff:1000}
 ];o.scenariosInitialized=true;}
 o.dividendTargetMonthly=N(o.dividendTargetMonthly);
 o.defaultReturnPct=N(o.defaultReturnPct)||5;
 o.reviewYear=N(o.reviewYear)||S.selectedYear||new Date().getFullYear();
 o.reviewQuarter=CL(N(o.reviewQuarter)||Math.floor(new Date().getMonth()/3)+1,1,4);
 return true
}
function save55(){try{save()}catch{localStorage.setItem('moje-finanse-v14',JSON.stringify(S))}}
function setVersion55(){
 document.title='Moje Finanse '+VERSION;
 let h=document.querySelector('.top small');
 if(h)h.innerHTML='<span id="headerYear">'+(typeof S!=='undefined'?S.selectedYear:'')+'</span> • wersja '+VERSION;
 document.documentElement.dataset.appVersion=VERSION
}
function currentLoanBalance55(l){try{return N(window.loanCurrentPoint15?.(l)?.balance)}catch{return N(l?.balance)}}
function informalRemaining55(d){return Math.max(0,N(d.amount)-(d.payments||[]).reduce((a,p)=>a+N(p.amount),0))}
function loanTarget55(){
 return (S.loans||[]).filter(l=>currentLoanBalance55(l)>0).sort((a,b)=>N(b.rate)-N(a.rate)||currentLoanBalance55(b)-currentLoanBalance55(a))[0]||null
}
function loanPlan55(l,extra=0){
 try{
  let clone=JSON.parse(JSON.stringify(l));clone.extraMonthly=N(clone.extraMonthly)+N(extra);
  let t=window.loanTimeline15?.(clone,true),f=t?.forecast||[];
  return{months:f.length,interest:f.reduce((a,r)=>a+N(r.interest),0),end:f.at(-1)?.date||null}
 }catch{return null}
}
function scenarioResult55(s,y){
 let base=command()?.annualForecast?.(y);if(!base)return null;
 let incomeAdj=N(s.salaryDelta)*12+N(base.company)*N(s.companyPct)/100;
 let costAdj=N(s.costDelta)*12,income=N(base.income)+incomeAdj,required=Math.max(0,N(base.required)+costAdj);
 let freeBefore=income-required;
 let allocations=N(s.extraDebt)*12+N(s.investMonthly)*12+N(s.oneOff);
 let after=freeBefore-allocations;
 let loan=loanTarget55(),debt={monthsSaved:0,interestSaved:0};
 if(loan&&N(s.extraDebt)>0){let b=loanPlan55(loan,0),x=loanPlan55(loan,N(s.extraDebt));if(b&&x)debt={monthsSaved:Math.max(0,b.months-x.months),interestSaved:Math.max(0,b.interest-x.interest)}}
 return{scenario:s,base,income,required,freeBefore,after,allocations,debt,investAnnual:N(s.investMonthly)*12}
}
function scenarioModal55(i=null){
 ensure55();let s=i==null?{}:S.finance.lab55.scenarios[i]||{},v=k=>s[k]??0;
 open('<h2>'+(i==null?'Nowy scenariusz':'Edytuj scenariusz')+'</h2><p class="muted">Symulacja nie zmienia prawdziwych danych.</p><div class="form"><label>Nazwa<input id="sc55n" value="'+esc(s.name||'Scenariusz')+'"></label><label>Zmiana etatu netto / mies.<input id="sc55sal" type="number" step="50" value="'+v('salaryDelta')+'"></label><label>Zmiana wyniku firmy %<input id="sc55co" type="number" step="1" value="'+v('companyPct')+'"></label><label>Zmiana kosztów życia / mies.<input id="sc55cost" type="number" step="50" value="'+v('costDelta')+'"></label><label>Dodatkowa nadpłata długu / mies.<input id="sc55debt" type="number" step="50" value="'+v('extraDebt')+'"></label><label>Inwestycje / mies.<input id="sc55inv" type="number" step="50" value="'+v('investMonthly')+'"></label><label>Wydatek jednorazowy w roku<input id="sc55one" type="number" step="100" value="'+v('oneOff')+'"></label></div><div class="actions"><button class="btn" onclick="closeModal()">Anuluj</button><button class="btn primary" onclick="saveScenario55('+(i==null?'null':i)+')">Zapisz</button></div>')
}
window.scenarioModal55=scenarioModal55;
window.saveScenario55=function(i){
 ensure55();let s={name:G('sc55n')?.value?.trim()||'Scenariusz',salaryDelta:N(G('sc55sal')?.value),companyPct:N(G('sc55co')?.value),costDelta:N(G('sc55cost')?.value),extraDebt:Math.max(0,N(G('sc55debt')?.value)),investMonthly:Math.max(0,N(G('sc55inv')?.value)),oneOff:Math.max(0,N(G('sc55one')?.value))};
 if(i==null)S.finance.lab55.scenarios.push(s);else S.finance.lab55.scenarios[i]=s;save55();closeModal();renderLab55();renderControl55()
};
window.removeScenario55=function(i){if(confirm('Usunąć scenariusz?')){S.finance.lab55.scenarios.splice(i,1);save55();renderLab55()}};
function labHtml55(y){
 let rows=(S.finance.lab55.scenarios||[]).map((s,i)=>({i,r:scenarioResult55(s,y)})).filter(x=>x.r);
 let base=command()?.annualForecast?.(y);
 return '<section class="card"><div class="title">Porównanie scenariuszy — '+y+' <button class="btn primary" onclick="scenarioModal55()">＋ Scenariusz</button></div><p class="muted">„Po alokacjach” odejmuje dodatkowe nadpłaty, inwestycje i wydatek jednorazowy. Nadpłata i inwestycja są przesunięciem kapitału, nie konsumpcją — dlatego pokazujemy je osobno od bazowej nadwyżki.</p><div class="labBase55"><span>Baza roku</span><b>'+PLN(base?.free)+'</b><small>nadwyżka przed dodatkowymi decyzjami</small></div><div class="scenarioGrid55">'+rows.map(x=>{let r=x.r,s=r.scenario;return'<article class="scenarioCard55"><div class="scenarioTop55"><div><small>SCENARIUSZ</small><b>'+esc(s.name)+'</b></div><div><button class="btn" onclick="scenarioModal55('+x.i+')">Edytuj</button><button class="btn danger" onclick="removeScenario55('+x.i+')">×</button></div></div><div class="scenarioKpis55"><div><small>NADWYŻKA PRZED ALOKACJĄ</small><b class="'+(r.freeBefore>=0?'green':'red')+'">'+PLN(r.freeBefore)+'</b></div><div><small>PO ALOKACJACH</small><b class="'+(r.after>=0?'green':'red')+'">'+PLN(r.after)+'</b></div><div><small>INWESTYCJE / ROK</small><b>'+PLN(r.investAnnual)+'</b></div><div><small>NADPŁATA / ROK</small><b>'+PLN(N(s.extraDebt)*12)+'</b></div></div><div class="scenarioImpact55"><span>Etat: '+(N(s.salaryDelta)>=0?'+':'')+PLN(s.salaryDelta)+'/m</span><span>Firma: '+(N(s.companyPct)>=0?'+':'')+N(s.companyPct).toFixed(0)+'%</span><span>Koszty: '+(N(s.costDelta)>=0?'+':'')+PLN(s.costDelta)+'/m</span></div>'+(r.debt.monthsSaved?'<div class="scenarioDebt55"><b>Dług:</b> ~ '+r.debt.monthsSaved+' mies. szybciej • oszczędność odsetek '+PLN(r.debt.interestSaved)+'</div>':'')+'</article>'}).join('')+'</div></section>'
}
function renderLab55(){
 let h=G('labBody55');if(!h||!ensure55())return;let y=S.selectedYear||new Date().getFullYear();
 h.innerHTML=labHtml55(y)+wealthProjectionCard55()+reviewMini55(y)
}
function investmentAssets55(){
 return (S.finance.assets||[]).map((x,i)=>({x,i})).filter(q=>q.x?.type==='Inwestycje'||q.x?.investment55)
}
function investmentModal55(assetIndex=null){
 ensure55();let a=assetIndex==null?{}:S.finance.assets?.[assetIndex]||{},v=k=>a[k]??'';
 open('<h2>'+(assetIndex==null?'Nowa pozycja inwestycyjna':'Edytuj inwestycję')+'</h2><div class="form"><label>Nazwa<input id="iv55n" value="'+esc(a.name||'')+'"></label><label>Typ<select id="iv55t">'+['ETF','Akcje','Obligacje','Fundusz','Konto maklerskie','Inne'].map(t=>'<option '+(a.investmentType55===t?'selected':'')+'>'+t+'</option>').join('')+'</select></label><label>Obecna wartość<input id="iv55v" type="number" step="0.01" value="'+N(a.value)+'"></label><label>Miesięczna wpłata<input id="iv55m" type="number" step="10" value="'+N(a.monthly55)+'"></label><label>Stopa dywidendy %<input id="iv55y" type="number" step="0.1" value="'+N(a.dividendYield55)+'"></label><label>Oczekiwany wzrost ceny % / rok<input id="iv55g" type="number" step="0.1" value="'+(a.growthPct55==null?S.finance.lab55.defaultReturnPct:N(a.growthPct55))+'"></label><label>Reinwestuj dywidendy<select id="iv55r"><option value="yes" '+(a.reinvest55!==false?'selected':'')+'>Tak</option><option value="no" '+(a.reinvest55===false?'selected':'')+'>Nie</option></select></label></div><div class="actions"><button class="btn" onclick="closeModal()">Anuluj</button><button class="btn primary" onclick="saveInvestment55('+(assetIndex==null?'null':assetIndex)+')">Zapisz</button></div>')
}
window.investmentModal55=investmentModal55;
window.saveInvestment55=function(assetIndex){
 ensure55();let a={name:G('iv55n')?.value?.trim()||'Inwestycja',type:'Inwestycje',investment55:true,investmentType55:G('iv55t')?.value||'Inne',value:Math.max(0,N(G('iv55v')?.value)),monthly55:Math.max(0,N(G('iv55m')?.value)),dividendYield55:Math.max(0,N(G('iv55y')?.value)),growthPct55:N(G('iv55g')?.value),reinvest55:G('iv55r')?.value!=='no'};
 if(assetIndex==null)S.finance.assets.push(a);else S.finance.assets[assetIndex]={...S.finance.assets[assetIndex],...a};save55();closeModal();renderInvestments55();window.renderWealth42?.();renderWealth55()
};
window.removeInvestment55=function(i){if(confirm('Usunąć pozycję inwestycyjną z majątku?')){S.finance.assets.splice(i,1);save55();renderInvestments55();window.renderWealth42?.();renderWealth55()}};
function investmentFuture55(a,years){
 let v=N(a.value),monthly=N(a.monthly55),growth=a.growthPct55==null?N(S.finance.lab55.defaultReturnPct):N(a.growthPct55),annual=growth+(a.reinvest55!==false?N(a.dividendYield55):0),r=annual/100/12;
 for(let i=0;i<years*12;i++)v=v*(1+r)+monthly;
 return v
}
function investmentSummary55(){
 let rows=investmentAssets55(),value=0,monthly=0,dividend=0;
 rows.forEach(({x})=>{value+=N(x.value);monthly+=N(x.monthly55);dividend+=N(x.value)*N(x.dividendYield55)/100});
 return{rows,value,monthly,annualDividend:dividend,monthlyDividend:dividend/12,weightedYield:value?dividend/value*100:0}
}
function saveInvestmentTarget55(){
 ensure55();S.finance.lab55.dividendTargetMonthly=Math.max(0,N(G('divTarget55')?.value));S.finance.lab55.defaultReturnPct=N(G('retDefault55')?.value)||5;save55();renderInvestments55();renderWealth55()
}
window.saveInvestmentTarget55=saveInvestmentTarget55;
function investmentForecastTiles55(){
 let s=investmentSummary55(),years=[5,10,20];
 return years.map(y=>{
  let v=s.rows.reduce((a,q)=>a+investmentFuture55(q.x,y),0);
  let div=s.rows.reduce((a,q)=>a+investmentFuture55(q.x,y)*N(q.x.dividendYield55)/100,0);
  return'<div><small>'+y+' LAT</small><b>'+PLN(v)+'</b><span>dywidendy ~ '+PLN(div/12)+'/m</span></div>'
 }).join('')
}
function renderInvestments55(){
 let h=G('investmentsBody55');if(!h||!ensure55())return;let s=investmentSummary55(),target=N(S.finance.lab55.dividendTargetMonthly),capital=s.weightedYield>0?target*12/(s.weightedYield/100):0;
 h.innerHTML='<section class="card"><div class="title">Centrum inwestycji i dywidend <button class="btn primary" onclick="investmentModal55()">＋ Pozycja</button></div><div class="investHero55"><div><small>PORTFEL</small><b>'+PLN(s.value)+'</b></div><div><small>WPŁATY / MIES.</small><b>'+PLN(s.monthly)+'</b></div><div><small>DYWIDENDY EST. / ROK</small><b>'+PLN(s.annualDividend)+'</b></div><div><small>DYWIDENDY EST. / MIES.</small><b>'+PLN(s.monthlyDividend)+'</b></div></div><p class="muted">Dywidendy są uproszczoną symulacją przed podatkami. Prognoza wartości zakłada stałe parametry i — dla pozycji z włączoną opcją — reinwestowanie dywidend.</p></section><section class="card"><div class="title">Pozycje</div>'+(s.rows.length?s.rows.map(q=>{let a=q.x;return'<div class="investmentRow55"><div><small>'+esc(a.investmentType55||'Inwestycje')+'</small><b>'+esc(a.name||'Inwestycja')+'</b><span>wpłata '+PLN(a.monthly55)+'/m • dywidenda '+N(a.dividendYield55).toFixed(1)+'% • wzrost '+N(a.growthPct55).toFixed(1)+'%</span></div><strong>'+PLN(a.value)+'</strong><button class="btn" onclick="investmentModal55('+q.i+')">Edytuj</button><button class="btn danger" onclick="removeInvestment55('+q.i+')">Usuń</button></div>'}).join(''):'<p class="muted">Dodaj pierwszą pozycję. Zapisana tutaj wartość jest równocześnie aktywem typu „Inwestycje” w module Majątek.</p>')+'</section><section class="card"><div class="title">Cel dywidendowy</div><div class="form"><label>Cel dywidend / mies.<input id="divTarget55" type="number" step="50" value="'+target+'"></label><label>Domyślny zwrot dla pozycji bez danych %<input id="retDefault55" type="number" step="0.1" value="'+N(S.finance.lab55.defaultReturnPct)+'"></label></div><button class="btn primary" onclick="saveInvestmentTarget55()">Zapisz ustawienia</button><div class="investTarget55"><span>Średnia stopa dywidendy portfela</span><b>'+s.weightedYield.toFixed(2)+'%</b><span>Kapitał potrzebny do celu przy obecnej średniej stopie</span><b>'+(target&&capital?PLN(capital):'—')+'</b></div></section><section class="card"><div class="title">Symulacja portfela</div><div class="investForecast55">'+investmentForecastTiles55()+'</div></section>'
}
function ppkCurrent55(){
 let total=N(S.finance.ppkOpening),old=S.selectedYear,cy=new Date().getFullYear(),cm=new Date().getMonth(),monthly=[];
 try{
  Object.keys(S.years||{}).map(Number).filter(Boolean).sort((a,b)=>a-b).forEach(y=>{
   S.selectedYear=y;window.mfTaxSync41?.(y);Y();
   let rows=typeof sal==='function'?(sal().rows||[]):[];
   rows.forEach((r,i)=>{if(r.actual&&(y<cy||(y===cy&&i<=cm))){let v=N(r.pe)+N(r.er);total+=v;if(v>0)monthly.push(v)}})
  })
 }catch{}finally{S.selectedYear=old;window.mfTaxSync41?.(old)}
 return{total,monthly:monthly.length?monthly.slice(-12).reduce((a,b)=>a+b,0)/monthly.slice(-12).length:0}
}
function loanBalanceAt55(l,years){
 let horizon=new Date();horizon.setFullYear(horizon.getFullYear()+years);
 try{
  let t=window.loanTimeline15?.(l,true),rows=t?.rows||[],last=rows.at(-1);
  if(last&&last.date<=horizon)return 0;
  let r=rows.filter(x=>x.date<=horizon).at(-1);
  if(r)return N(r.balance)
 }catch{}
 return currentLoanBalance55(l)
}
function ppkFuture55(years){
 let p=ppkCurrent55(),v=p.total,r=(N(S.finance.ppkReturnPct)||5)/100/12;
 for(let i=0;i<years*12;i++)v=v*(1+r)+p.monthly;
 return v
}
function wealthProjection55(years){
 let assets=S.finance.assets||[],investSet=new Set(investmentAssets55().map(q=>q.i)),staticAssets=assets.reduce((a,x,i)=>a+(investSet.has(i)?0:N(x.value)),0);
 let inv=investmentAssets55().reduce((a,q)=>a+investmentFuture55(q.x,years),0),ppk=ppkFuture55(years);
 let loans=(S.loans||[]).reduce((a,l)=>a+loanBalanceAt55(l,years),0),informal=(S.finance.informalDebts||[]).reduce((a,d)=>a+informalRemaining55(d),0);
 return{years,staticAssets,investments:inv,ppk,loans,informal,net:staticAssets+inv+ppk-loans-informal}
}
function currentWealth55(){
 let assets=(S.finance.assets||[]).reduce((a,x)=>a+N(x.value),0),ppk=ppkCurrent55().total,loans=(S.loans||[]).reduce((a,l)=>a+currentLoanBalance55(l),0),informal=(S.finance.informalDebts||[]).reduce((a,d)=>a+informalRemaining55(d),0);
 return{assets,ppk,loans,informal,net:assets+ppk-loans-informal}
}
function wealthProjectionCard55(){
 let cur=currentWealth55(),rows=[5,10,20].map(wealthProjection55);
 return '<section class="card"><div class="title">Prognoza majątku 5 / 10 / 20 lat <span class="pill">symulacja</span></div><div class="wealthProj55"><div class="now55"><small>DZIŚ</small><b>'+PLN(cur.net)+'</b><span>aktywa + PPK − zobowiązania</span></div>'+rows.map(x=>'<div><small>'+x.years+' LAT</small><b>'+PLN(x.net)+'</b><span>inwestycje '+PLN(x.investments)+' • PPK '+PLN(x.ppk)+' • kredyty '+PLN(x.loans)+'</span></div>').join('')+'</div><p class="muted">Założenia: pozostałe aktywa mają stałą wartość, portfel rośnie według parametrów pozycji, PPK według ustawionej stopy, a kredyty według obecnych harmonogramów. To symulacja, nie prognoza gwarantowana.</p></section>'
}
function renderWealth55(){
 let h=G('wealthBody');if(!h||!ensure55())return;G('wealthProjection55')?.remove();let box=document.createElement('div');box.id='wealthProjection55';box.innerHTML=wealthProjectionCard55();h.appendChild(box)
}
function periodData55(y,q=0){
 let months=q?Array.from({length:3},(_,i)=>(q-1)*3+i):Array.from({length:12},(_,i)=>i),rows=[],cmd=command(),p=planner();
 months.forEach(m=>{let x=p?.monthPlan?.(key(y,m));if(x)rows.push(x)});
 let s=rows.reduce((a,x)=>{a.income+=N(x.inc.total);a.salary+=N(x.inc.salary);a.company+=N(x.inc.company);a.free+=N(x.free);a.required+=N(x.mi.planned);a.loans+=N(x.mi.loans);a.goals+=N(x.mi.goals);a.reserve+=N(x.tr.total);a.positive+=x.free>=0?1:0;let sc=cmd?.financialScore?.(x.k);if(sc){a.score+=N(sc.total);a.scoreN++}a.actual+=x.inc.actualSalary?1:0;a.actual+=x.inc.actualCompany?1:0;return a},{income:0,salary:0,company:0,free:0,required:0,loans:0,goals:0,reserve:0,positive:0,score:0,scoreN:0,actual:0});
 s.avgScore=s.scoreN?s.score/s.scoreN:0;s.rows=rows;s.label=q?'Q'+q+' '+y:String(y);return s
}
function reviewCompare55(cur,prev){
 let pct=(a,b)=>b?(a-b)/Math.abs(b)*100:0;
 return{income:pct(cur.income,prev.income),free:cur.free-prev.free,company:pct(cur.company,prev.company)}
}
function reviewCard55(y,q){
 let cur=periodData55(y,q),prev=q?(q===1?periodData55(y-1,4):periodData55(y,q-1)):periodData55(y-1,0),cmp=reviewCompare55(cur,prev);
 let weak=cur.rows.filter(x=>x.free<0),best=[...cur.rows].sort((a,b)=>N(b.free)-N(a.free))[0];
 return '<section class="card"><div class="title">'+(q?'Przegląd kwartalny':'Przegląd roczny')+' — '+cur.label+' <span class="pill">'+cur.positive+'/'+cur.rows.length+' mies. na plusie</span></div><div class="reviewKpis55"><div><small>DOCHÓD</small><b>'+PLN(cur.income)+'</b><span class="'+(cmp.income>=0?'green':'red')+'">'+(cmp.income>=0?'+':'')+cmp.income.toFixed(1)+'% vs poprzedni okres</span></div><div><small>NADWYŻKA</small><b class="'+(cur.free>=0?'green':'red')+'">'+PLN(cur.free)+'</b><span>zmiana '+PLN(cmp.free)+'</span></div><div><small>FIRMA</small><b>'+PLN(cur.company)+'</b><span class="'+(cmp.company>=0?'green':'red')+'">'+(cmp.company>=0?'+':'')+cmp.company.toFixed(1)+'%</span></div><div><small>ŚR. KONDYCJA</small><b>'+cur.avgScore.toFixed(0)+'/100</b><span>na podstawie miesięcy okresu</span></div></div><div class="reviewSummary55"><b>Wnioski automatyczne</b><span>'+(weak.length?'Ujemna nadwyżka występuje w '+weak.length+' mies.':'Wszystkie miesiące okresu mają dodatnią nadwyżkę')+'. '+(best?'Najmocniejszy miesiąc: '+MN[parseKey(best.k).m]+' ('+PLN(best.free)+'). ':'')+(cur.company>prev.company?'Wynik firmy jest wyższy niż w poprzednim okresie.':'Wynik firmy nie przewyższa poprzedniego okresu.')+'</span></div></section>'
}
function reviewMini55(y){return reviewCard55(y,0)}
window.reviewShiftYear55=function(d){ensure55();S.finance.lab55.reviewYear+=d;save55();renderReview55()};
window.reviewQuarter55=function(q){ensure55();S.finance.lab55.reviewQuarter=CL(N(q),1,4);save55();renderReview55()};
function renderReview55(){
 let h=G('reviewBody55');if(!h||!ensure55())return;let y=S.finance.lab55.reviewYear,q=S.finance.lab55.reviewQuarter;
 h.innerHTML='<div class="card miniNav"><button class="btn" onclick="reviewShiftYear55(-1)">‹</button><b>'+y+'</b><button class="btn" onclick="reviewShiftYear55(1)">›</button><span class="reviewQuarterBtns55">'+[1,2,3,4].map(x=>'<button class="btn '+(q===x?'primary':'')+'" onclick="reviewQuarter55('+x+')">Q'+x+'</button>').join('')+'</span></div>'+reviewCard55(y,q)+reviewCard55(y,0)
}
function productEconomics55(p){
 let cost=['material','parts','energy','packaging','shipping','fees','ads','other'].reduce((a,k)=>a+N(p[k]),0),profit=N(p.price)-cost,margin=N(p.price)?profit/N(p.price)*100:0,units=Math.max(0,N(p.monthlyUnits55)),mins=Math.max(0,N(p.laborMinutes55)),monthlyProfit=profit*units,hours=units*mins/60,profitHour=hours>0?monthlyProfit/hours:(mins>0?profit/(mins/60):0);
 return{cost,profit,margin,units,mins,monthlyProfit,hours,profitHour}
}
function portfolioRows55(){
 let ps=S.finance.products||[],raw=ps.map((p,i)=>({p,i,e:productEconomics55(p)})),maxProfit=Math.max(1,...raw.map(x=>Math.max(0,x.e.profit))),maxUnits=Math.max(1,...raw.map(x=>x.e.units)),maxMonthly=Math.max(1,...raw.map(x=>Math.max(0,x.e.monthlyProfit))),maxHour=Math.max(1,...raw.map(x=>Math.max(0,x.e.profitHour))),hasUnits=raw.some(x=>x.e.units>0),hasHours=raw.some(x=>x.e.mins>0);
 return raw.map(x=>{
  let parts=[{w:35,v:CL(x.e.margin/60,0,1)},{w:25,v:CL(Math.max(0,x.e.profit)/maxProfit,0,1)}];if(hasUnits){parts.push({w:25,v:CL(Math.max(0,x.e.monthlyProfit)/maxMonthly,0,1)},{w:5,v:CL(x.e.units/maxUnits,0,1)})}if(hasHours)parts.push({w:10,v:CL(Math.max(0,x.e.profitHour)/maxHour,0,1)});
  let weight=parts.reduce((a,z)=>a+z.w,0),score=weight?parts.reduce((a,z)=>a+z.w*z.v,0)/weight*100:0,rec=score>=80&&x.e.margin>=35?'SKALUJ':score>=65?'PROMUJ / TESTUJ':score>=45?'UTRZYMAJ':x.e.profit<=0?'STOP / PRZELICZ':'POPRAW';
  return{...x,score,rec,quality:(x.e.units>0?1:0)+(x.e.mins>0?1:0)}
 }).sort((a,b)=>b.score-a.score)
}
function portfolioMetaModal55(i){
 ensure55();let p=S.finance.products?.[i];if(!p)return;
 open('<h2>Dane portfelowe — '+esc(p.name||'Produkt')+'</h2><p class="muted">Uzupełnij średni wolumen i czas pracy, żeby ranking uwzględniał nie tylko marżę na sztuce.</p><div class="form"><label>Kategoria<input id="pm55c" value="'+esc(p.category55||'')+'" placeholder="np. Lampy"></label><label>Średnio sprzedanych szt. / mies.<input id="pm55u" type="number" step="1" value="'+N(p.monthlyUnits55)+'"></label><label>Twój czas pracy / szt. (min)<input id="pm55l" type="number" step="1" value="'+N(p.laborMinutes55)+'"></label></div><button class="btn primary" onclick="savePortfolioMeta55('+i+')">Zapisz</button>')
}
window.portfolioMetaModal55=portfolioMetaModal55;
window.savePortfolioMeta55=function(i){let p=S.finance.products?.[i];if(!p)return;p.category55=G('pm55c')?.value?.trim()||'';p.monthlyUnits55=Math.max(0,N(G('pm55u')?.value));p.laborMinutes55=Math.max(0,N(G('pm55l')?.value));save55();closeModal();renderBusiness55()};
function renderBusiness55(){
 let h=G('businessPlusBody');if(!h||!ensure55())return;G('productPortfolio55')?.remove();let rows=portfolioRows55(),box=document.createElement('div');box.id='productPortfolio55';box.className='card';
 let total=rows.reduce((a,x)=>a+N(x.e.monthlyProfit),0),hours=rows.reduce((a,x)=>a+N(x.e.hours),0);
 box.innerHTML='<div class="title">MOHE — ranking portfela produktów <span class="pill">marża • wolumen • czas</span></div><div class="portfolioKpis55"><div><small>POTENCJAŁ ZYSKU / MIES.</small><b>'+PLN(total)+'</b></div><div><small>CZAS / MIES.</small><b>'+hours.toFixed(1)+' h</b></div><div><small>ZYSK / H PRACY</small><b>'+(hours?PLN(total/hours):'—')+'</b></div><div><small>PRODUKTY</small><b>'+rows.length+'</b></div></div><p class="muted">„Potencjał” bazuje na wpisanej średniej liczbie sztuk. To analiza zarządcza — nie zastępuje rzeczywistego rejestru zamówień.</p>'+(rows.length?'<div class="portfolioTable55"><div class="portfolioHead55"><span># / produkt</span><span>marża</span><span>szt./m</span><span>zysk/m</span><span>zysk/h</span><span>score</span><span>decyzja</span></div>'+rows.map((x,r)=>'<div class="portfolioRow55"><div><small>#'+(r+1)+' • '+esc(x.p.category55||'bez kategorii')+'</small><b>'+esc(x.p.name||'Produkt')+'</b><button class="btn" onclick="portfolioMetaModal55('+x.i+')">Dane</button></div><span>'+x.e.margin.toFixed(1)+'%</span><span>'+(x.e.units||'—')+'</span><span>'+PLN(x.e.monthlyProfit)+'</span><span>'+(x.e.profitHour?PLN(x.e.profitHour):'—')+'</span><strong>'+x.score.toFixed(0)+'/100</strong><em class="rec55 r'+x.rec.charAt(0)+'">'+x.rec+'</em></div>').join('')+'</div>':'<p class="muted">Dodaj produkty w sekcji Rentowność produktów, aby zbudować ranking.</p>');
 h.prepend(box)
}
function renderControl55(){
 let h=G('controlBody51');if(!h||!ensure55())return;G('labControl55')?.remove();let y=S.selectedYear||new Date().getFullYear(),box=document.createElement('div');box.id='labControl55';
 box.innerHTML='<section class="card"><div class="title">Laboratorium decyzji <button class="btn primary" onclick="show(\'lab\')">Porównaj scenariusze ›</button></div><div class="labQuick55"><div><small>SCENARIUSZE</small><b>'+S.finance.lab55.scenarios.length+'</b></div><div><small>PORTFEL INWESTYCJI</small><b>'+PLN(investmentSummary55().value)+'</b></div><div><small>DYWIDENDY / MIES.</small><b>'+PLN(investmentSummary55().monthlyDividend)+'</b></div><div><small>MAJĄTEK 10 LAT</small><b>'+PLN(wealthProjection55(10).net)+'</b></div></div></section>'+reviewCard55(y,0);
 h.appendChild(box)
}
function renderHome55(){
 let h=G('home');if(!h||!ensure55())return;G('labHome55')?.remove();let inv=investmentSummary55(),w=wealthProjection55(10),box=document.createElement('div');box.id='labHome55';box.className='card';
 box.innerHTML='<div class="title">Długoterminowy radar <button class="btn" onclick="show(\'investments\')">Inwestycje ›</button><button class="btn" onclick="show(\'lab\')">Laboratorium ›</button></div><div class="labQuick55"><div><small>PORTFEL</small><b>'+PLN(inv.value)+'</b></div><div><small>WPŁATY / MIES.</small><b>'+PLN(inv.monthly)+'</b></div><div><small>DYWIDENDY / MIES.</small><b>'+PLN(inv.monthlyDividend)+'</b></div><div><small>MAJĄTEK 10 LAT</small><b>'+PLN(w.net)+'</b></div></div>';
 let op=G('opsHome54');if(op)op.insertAdjacentElement('afterend',box);else h.prepend(box)
}
function renderSettings55(){
 let h=G('settings');if(!h||!ensure55())return;G('labSettings55')?.remove();let box=document.createElement('div');box.id='labSettings55';box.className='card';
 box.innerHTML='<div class="title">Strategia i długi termin — 5.4</div><div class="moduleLinks"><button class="btn primary" onclick="show(\'lab\')">🧪 Laboratorium decyzji</button><button class="btn" onclick="show(\'investments\')">📊 Inwestycje i dywidendy</button><button class="btn" onclick="show(\'review\')">📋 Review kwartalny / roczny</button></div>';h.prepend(box)
}
function renderAll55(){if(!ensure55())return;setVersion55();renderHome55();renderControl55();renderLab55();renderInvestments55();renderReview55();renderWealth55();renderBusiness55();renderSettings55()}
const oldRender=window.render;if(typeof oldRender==='function'&&!oldRender.__mf55){let fn=function(){let out=oldRender();renderAll55();return out};fn.__mf55=true;window.render=fn}
const oldShow=window.show;if(typeof oldShow==='function'&&!oldShow.__mf55){let fn=function(v){let out=oldShow(v);setVersion55();if(v==='home')renderHome55();if(v==='control')renderControl55();if(v==='lab')renderLab55();if(v==='investments')renderInvestments55();if(v==='review')renderReview55();if(v==='wealth')renderWealth55();if(v==='businessplus')renderBusiness55();if(v==='settings')renderSettings55();return out};fn.__mf55=true;window.show=fn}
window.mfLab55={scenarioResult:scenarioResult55,investmentSummary:investmentSummary55,wealthProjection:wealthProjection55,periodData:periodData55,portfolioRows:portfolioRows55};
let st=document.createElement('style');st.textContent='.labBase55{display:grid;grid-template-columns:1fr auto;gap:4px 12px;padding:12px;border-radius:12px;background:#f3f6fa;margin-bottom:10px}.labBase55 small{grid-column:1/-1;color:#7a8799}.scenarioGrid55{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.scenarioCard55{border:1px solid #e2e8f0;border-radius:14px;padding:12px;background:#fff}.scenarioTop55{display:flex;justify-content:space-between;gap:10px;align-items:start}.scenarioTop55 small{display:block;font-size:8px;color:#8491a3;font-weight:800}.scenarioTop55 b{display:block;color:#334f70;font-size:15px}.scenarioKpis55{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px}.scenarioKpis55>div{background:#f8fafc;border-radius:9px;padding:8px}.scenarioKpis55 small{display:block;font-size:8px;color:#8491a3}.scenarioKpis55 b{display:block;margin-top:3px;color:#315274;font-size:12px}.scenarioImpact55{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}.scenarioImpact55 span{font-size:9px;background:#edf2f7;border-radius:99px;padding:4px 7px;color:#607188}.scenarioDebt55{margin-top:8px;font-size:10px;color:#5e7085}.investHero55,.investForecast55,.labQuick55,.portfolioKpis55,.reviewKpis55{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.investHero55>div,.investForecast55>div,.labQuick55>div,.portfolioKpis55>div,.reviewKpis55>div{padding:12px;border:1px solid #e3e9f1;border-radius:12px;background:#f8fafc}.investHero55 small,.investForecast55 small,.labQuick55 small,.portfolioKpis55 small,.reviewKpis55 small{display:block;font-size:9px;color:#7d899b;font-weight:800}.investHero55 b,.investForecast55 b,.labQuick55 b,.portfolioKpis55 b,.reviewKpis55 b{display:block;margin-top:5px;color:#315274}.investHero55 span,.investForecast55 span,.reviewKpis55 span{display:block;margin-top:4px;color:#7d899b;font-size:9px}.investmentRow55{display:grid;grid-template-columns:1fr auto auto auto;gap:9px;align-items:center;padding:10px 0;border-bottom:1px solid #e7ecf2}.investmentRow55 small,.investmentRow55 span{display:block;color:#7d899b;font-size:9px}.investmentRow55 b{display:block;color:#40556e}.investTarget55{display:grid;grid-template-columns:1fr auto;gap:8px;margin-top:12px;padding:12px;background:#f5f8fc;border-radius:12px}.wealthProj55{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.wealthProj55>div{padding:13px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc}.wealthProj55 .now55{background:#eef4ff;border-color:#dbe7f6}.wealthProj55 small,.wealthProj55 span{display:block;color:#7d899b;font-size:9px}.wealthProj55 b{display:block;margin:5px 0;color:#315274}.reviewSummary55{margin-top:10px;padding:12px;background:#f4f7fb;border-radius:12px}.reviewSummary55 b,.reviewSummary55 span{display:block}.reviewSummary55 span{margin-top:4px;color:#6f7f93;font-size:10px}.reviewQuarterBtns55{display:flex;gap:5px;margin-left:auto}.portfolioTable55{margin-top:10px;overflow-x:auto}.portfolioHead55,.portfolioRow55{display:grid;grid-template-columns:minmax(160px,1.5fr) repeat(5,minmax(65px,.7fr)) minmax(110px,.9fr);gap:8px;align-items:center;min-width:760px;padding:9px;border-bottom:1px solid #e7ecf2}.portfolioHead55{font-size:8px;color:#7e8b9c;font-weight:800;background:#f4f7fb}.portfolioRow55{font-size:10px}.portfolioRow55 small{display:block;color:#8793a3}.portfolioRow55 b{display:block;color:#40556e}.portfolioRow55 .btn{margin-top:4px;padding:4px 7px;font-size:9px}.portfolioRow55 em{font-style:normal;font-size:8px;font-weight:800;padding:5px 7px;border-radius:99px;background:#eef3f8;color:#49627e;text-align:center}.portfolioRow55 strong{color:#315274}@media(max-width:920px){.scenarioGrid55{grid-template-columns:1fr}.investHero55,.investForecast55,.labQuick55,.portfolioKpis55,.reviewKpis55,.wealthProj55{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.investmentRow55{grid-template-columns:1fr auto}.investmentRow55 .btn{justify-self:start}.investHero55,.investForecast55,.labQuick55,.portfolioKpis55,.reviewKpis55,.wealthProj55{grid-template-columns:1fr 1fr}.reviewQuarterBtns55{width:100%;margin-left:0;flex-wrap:wrap}.scenarioKpis55{grid-template-columns:1fr 1fr}}';document.head.appendChild(st);
})();
