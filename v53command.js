/* Moje Finanse 5.2 — Centrum dowodzenia */
(function(){
'use strict';
const VERSION='5.5.0',G=id=>document.getElementById(id),N=v=>+v||0,CL=(v,a,b)=>Math.max(a,Math.min(b,v));
const PLN=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(N(v));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const MN=['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru'];
const planner=()=>window.mfPlanner52||null,control=()=>window.mfControl51||null;
function key(y,m){return String(y)+'-'+String(m+1).padStart(2,'0')}
function nowKey(){let d=new Date();return key(d.getFullYear(),d.getMonth())}
function parseKey(k){let [y,m]=String(k||'').split('-').map(Number);return{y:y||new Date().getFullYear(),m:Math.max(0,(m||1)-1)}}
function setVersion53(){
 document.title='Moje Finanse '+VERSION;
 let h=document.querySelector('.top small');
 if(h)h.innerHTML='<span id="headerYear">'+(typeof S!=='undefined'?S.selectedYear:'')+'</span> • wersja '+VERSION;
 document.documentElement.dataset.appVersion=VERSION
}
function companyActual(r){return !!((r?.salesLines&&r.salesLines.length)||(r?.costLines&&r.costLines.length)||N(r?.revenue)||N(r?.costs)||N(r?.vat)||N(r?.vatOut)||N(r?.vatIn)||N(r?.zus)||N(r?.health)||N(r?.tax))}
function companySummary(r){
 try{return window.mfCompanySummary44?.(r||{})||{}}catch{return{}}
}
function actualCompanyHistory(){
 let out=[];
 Object.keys(S?.years||{}).map(Number).filter(Boolean).sort((a,b)=>a-b).forEach(y=>{
  (S.years[String(y)]?.company||[]).forEach((r,m)=>{
   if(companyActual(r))out.push({y,m,k:key(y,m),r,s:companySummary(r)})
  })
 });
 return out
}
function loanBalance(l){try{return N(window.loanCurrentPoint15?.(l)?.balance)}catch{return N(l?.balance)}}
function goalPaceScore(){
 let goals=S?.finance?.goals||[],now=new Date(),vals=[];
 goals.forEach(g=>{
  let remain=Math.max(0,N(g.target)-N(g.current));if(!remain)return;
  let monthly=N(g.monthly),need=0;
  if(g.due){let [yy,mm]=String(g.due).split('-').map(Number),months=Math.max(1,(yy-now.getFullYear())*12+(mm-1-now.getMonth()));need=remain/months}
  if(need>0)vals.push(CL(monthly/need,0,1.25)); else if(monthly>0)vals.push(1); else vals.push(0)
 });
 if(!vals.length)return{score:10,max:15,label:'brak aktywnych celów'};
 let avg=vals.reduce((a,b)=>a+b,0)/vals.length;
 return{score:Math.round(CL(avg,0,1)*15),max:15,label:Math.round(avg*100)+'% tempa'}
}
function dataQuality(k){
 let a=control(),inc=a?.monthIncome(k)||{},issues=[],points=0;
 if(inc.actualSalary){points+=2}else issues.push('etat za miesiąc jest prognozą');
 if(inc.actualCompany){points+=2}else issues.push('firma za miesiąc jest prognozą');
 let recurring=(planner()?.recurringExpenses?.(k)||[]);if(recurring.length){points+=2}else issues.push('brak stałych kosztów');
 let loans=S?.loans||[];if(!loans.length||loans.every(l=>loanBalance(l)>=0&&N(l.payment)>=0)){points+=2}else issues.push('sprawdź parametry kredytów');
 let close=a?.closeState?.(k);if(close&&close.checks.filter(x=>x.done).length>=Math.ceil(close.checks.length/2))points+=2;else issues.push('miesiąc nie jest jeszcze sprawdzony');
 return{score:points,max:10,issues}
}
function forecastMonths(start,count){
 let p=planner(),{y,m}=parseKey(start),rows=[];
 if(!p)return rows;
 for(let i=0;i<count;i++){let d=new Date(y,m+i,1,12),x=p.monthPlan(key(d.getFullYear(),d.getMonth()));if(x)rows.push(x)}
 return rows
}
function financialScore(k){
 let p=planner(),h=p?.health?.(k);if(!h)return null;
 let coverage=CL((h.cover-.70)/.50,0,1),flow=Math.round(coverage*25);
 let debt=h.inc.total>0?h.mi.loans/h.inc.total:0,debtScore=Math.round(CL((.50-debt)/.30,0,1)*20);
 let saved=N(S?.finance?.emergencySavings),cush=h.mi.essential>0?saved/h.mi.essential:0,cushScore=saved>0?Math.round(CL(cush/6,0,1)*20):8;
 let gp=goalPaceScore(),quality=dataQuality(k);
 let next=forecastMonths(k,3),positive=next.filter(x=>x.free>=0).length,stability=Math.round(positive/Math.max(1,next.length)*10);
 let total=CL(flow+debtScore+cushScore+gp.score+quality.score+stability,0,100);
 let state=total>=85?'bardzo dobra':total>=70?'dobra':total>=55?'średnia':total>=40?'ostrożna':'napięta';
 return{total,state,parts:[
  {name:'Pokrycie planu',score:flow,max:25,detail:Math.round(h.cover*100)+'%'},
  {name:'Obciążenie długiem',score:debtScore,max:20,detail:Math.round(debt*100)+'% dochodu'},
  {name:'Poduszka',score:cushScore,max:20,detail:saved>0?cush.toFixed(1)+' mies.':'nieuzupełniona'},
  {name:'Tempo celów',score:gp.score,max:15,detail:gp.label},
  {name:'Jakość danych',score:quality.score,max:10,detail:quality.issues.length?quality.issues.length+' braków':'komplet'},
  {name:'Stabilność 3 mies.',score:stability,max:10,detail:positive+'/'+next.length+' mies. na plusie'}
 ],quality}
}
function annualForecast(y){
 let p=planner(),rows=[];if(!p)return null;
 for(let m=0;m<12;m++){let x=p.monthPlan(key(y,m));if(x)rows.push(x)}
 let sum=rows.reduce((a,x)=>{
  a.income+=N(x.inc.total);a.salary+=N(x.inc.salary);a.company+=N(x.inc.company);a.required+=N(x.mi.planned);a.essential+=N(x.mi.essential);a.goals+=N(x.mi.goals);a.loans+=N(x.mi.loans);a.reserve+=N(x.tr.total);a.free+=N(x.free);if(x.free<0){a.negative++;if(!a.worst||x.free<a.worst.free)a.worst=x}return a
 },{income:0,salary:0,company:0,required:0,essential:0,goals:0,loans:0,reserve:0,free:0,negative:0,worst:null});
 return{year:y,rows,...sum}
}
function companyBreakEven(){
 let hist=actualCompanyHistory().slice(-6);if(!hist.length)return{ok:false};
 let avg=k=>hist.reduce((a,x)=>a+N(k(x.s)),0)/hist.length;
 let costs=avg(s=>s.costs?.net),zus=avg(s=>s.zus),health=avg(s=>s.health),floor=costs+zus+health,safe=floor/0.85;
 let last=hist.at(-1),sales=N(last.s.sales?.net),margin=sales-floor,ratio=floor>0?sales/floor:0;
 return{ok:true,count:hist.length,costs,zus,health,floor,safe,last,sales,margin,ratio}
}
function commandAlerts(k,y){
 let base=(planner()?.alerts?.(k)||[]).map(x=>({...x,scope:'teraz'})),annual=annualForecast(y),list=[...base];
 if(annual?.negative>0){
  let w=annual.worst,p=parseKey(w.k);
  list.push({level:'red',title:'Radar 12 miesięcy wykrywa miesiące na minusie',text:annual.negative+' mies. z ujemną nadwyżką. Najsłabszy: '+MN[p.m]+' '+p.y+' ('+PLN(w.free)+').',action:"show('control')",button:'Radar 12 mies.',scope:'rok'})
 }
 let be=companyBreakEven();
 if(be.ok&&be.sales<be.floor)list.push({level:'orange',title:'Firma poniżej progu rentowności',text:'Ostatnia sprzedaż netto '+PLN(be.sales)+' przy progu operacyjnym około '+PLN(be.floor)+'.',action:"show('businessplus')",button:'Firma+',scope:'firma'});
 let q=dataQuality(k);if(q.issues.length>=3)list.push({level:'orange',title:'Dashboard ma braki danych',text:q.issues.slice(0,3).join(' • ')+'.',action:"show('control')",button:'Sprawdź dane',scope:'dane'});
 let debt=(S?.loans||[]).filter(l=>loanBalance(l)>0),high=debt.sort((a,b)=>N(b.rate)-N(a.rate))[0];
 if(high&&N(high.rate)>=9)list.push({level:'orange',title:'Drogi kredyt wymaga uwagi',text:esc(high.name||'Kredyt')+': '+N(high.rate).toFixed(2)+'% i saldo '+PLN(loanBalance(high))+'.',action:"show('loans')",button:'Kredyty',scope:'dług'});
 const rank={red:0,orange:1,blue:2,green:3};
 return list.sort((a,b)=>(rank[a.level]??9)-(rank[b.level]??9)).slice(0,8)
}
function scoreRing53(score){
 let deg=CL(N(score),0,100)*3.6;
 return '<div class="scoreRing53" style="--score:'+deg+'deg"><div><strong>'+Math.round(score)+'</strong><small>/100</small></div></div>'
}
function radarBars53(rows){
 let max=Math.max(1,...rows.map(x=>Math.abs(N(x.free))));
 return '<div class="radar53">'+rows.map(x=>{let p=parseKey(x.k),v=N(x.free),h=Math.max(5,Math.abs(v)/max*80);return'<div class="radarCol53" title="'+MN[p.m]+' '+p.y+': '+PLN(v)+'"><div class="radarBarWrap53"><i class="'+(v>=0?'pos':'neg')+'" style="height:'+h+'px"></i></div><small>'+MN[p.m]+'</small><b class="'+(v>=0?'green':'red')+'">'+(Math.abs(v)>=1000?(v/1000).toFixed(1)+'k':Math.round(v))+'</b></div>'}).join('')+'</div>'
}
function forecastCard53(y){
 let x=annualForecast(y);if(!x)return'';
 return '<section class="card commandForecast53"><div class="title">Forecast '+y+' <span class="pill">'+(x.negative?x.negative+' mies. na minusie':'bez ujemnych miesięcy')+'</span></div><div class="commandGrid53"><div><small>DOCHÓD ŁĄCZNIE</small><b>'+PLN(x.income)+'</b><span>etat '+PLN(x.salary)+' • firma '+PLN(x.company)+'</span></div><div><small>MINIMUM + CELE</small><b>'+PLN(x.required)+'</b><span>w tym raty '+PLN(x.loans)+'</span></div><div><small>REZERWY FIRMY</small><b>'+PLN(x.reserve)+'</b><span>informacyjnie — wynik firmy już je uwzględnia</span></div><div class="em53"><small>PROGNOZOWANA NADWYŻKA</small><b class="'+(x.free>=0?'green':'red')+'">'+PLN(x.free)+'</b></div></div></section>'
}
function scoreCard53(k){
 let x=financialScore(k);if(!x)return'';
 return '<section class="card commandScore53"><div class="title">Kondycja finansowa <span class="pill">'+esc(x.state)+'</span></div><div class="scoreLayout53">'+scoreRing53(x.total)+'<div class="scoreParts53">'+x.parts.map(p=>'<div><span>'+esc(p.name)+'</span><div class="scoreTrack53"><i style="width:'+(p.max?CL(p.score/p.max*100,0,100):0)+'%"></i></div><b>'+p.score+'/'+p.max+'</b><small>'+esc(p.detail)+'</small></div>').join('')+'</div></div></section>'
}
function breakEvenCard53(compact=false){
 let x=companyBreakEven();
 if(!x.ok)return '<section class="card"><div class="title">Próg rentowności firmy</div><p class="muted">Uzupełnij przynajmniej jeden miesiąc firmy, aby policzyć próg.</p></section>';
 return '<section class="card breakEven53"><div class="title">Próg rentowności firmy <span class="pill">średnia '+x.count+' mies.</span></div><div class="commandGrid53"><div><small>PRÓG OPERACYJNY NETTO</small><b>'+PLN(x.floor)+'</b><span>koszty netto + ZUS + zdrowotna</span></div><div><small>BEZPIECZNY CEL SPRZEDAŻY</small><b>'+PLN(x.safe)+'</b><span>próg + 15% bufora operacyjnego</span></div><div><small>OSTATNIA SPRZEDAŻ NETTO</small><b>'+PLN(x.sales)+'</b><span>'+esc(MN[x.last.m]+' '+x.last.y)+'</span></div><div class="em53"><small>MARGINES NAD PROGIEM</small><b class="'+(x.margin>=0?'green':'red')+'">'+PLN(x.margin)+'</b></div></div>'+(compact?'':'<p class="muted">To operacyjny próg bezpieczeństwa, nie księgowy rachunek rentowności produktu. VAT jest pomijany, a PIT nie zwiększa progu przy zerowym zysku.</p>')+'</section>'
}
function alertCenter53(k,y){
 let rows=commandAlerts(k,y),reds=rows.filter(x=>x.level==='red').length,oranges=rows.filter(x=>x.level==='orange').length;
 return '<section class="card"><div class="title">Centrum alertów <span class="pill">'+reds+' krytyczne • '+oranges+' uwagi</span></div><div class="commandAlerts53">'+rows.map(x=>'<div class="commandAlert53 '+x.level+'"><div><small>'+esc(x.scope||'system')+'</small><b>'+x.title+'</b><span>'+x.text+'</span></div><button class="btn" onclick="'+x.action+'">'+x.button+'</button></div>').join('')+'</div></section>'
}
function radarCard53(y){
 let x=annualForecast(y);if(!x)return'';
 return '<section class="card"><div class="title">Radar 12 miesięcy <span class="pill">nadwyżka po minimum i celach</span></div>'+radarBars53(x.rows)+'<div class="radarSummary53"><span>Rok: <b>'+PLN(x.free)+'</b></span><span>Miesiące na minusie: <b class="'+(x.negative?'red':'green')+'">'+x.negative+'</b></span></div></section>'
}
function commandHero53(k,y){
 let s=financialScore(k),f=annualForecast(y),be=companyBreakEven(),als=commandAlerts(k,y),critical=als.filter(x=>x.level==='red'||x.level==='orange').length;
 return '<div class="commandHero53"><div class="commandScoreMini53">'+scoreRing53(s?.total||0)+'<div><small>KONDYCJA</small><b>'+esc(s?.state||'brak danych')+'</b><span>kliknij niżej po szczegóły</span></div></div><div><small>FORECAST '+y+'</small><b class="'+(N(f?.free)>=0?'green':'red')+'">'+PLN(f?.free)+'</b><span>prognozowana nadwyżka</span></div><div><small>ALERTY</small><b>'+critical+'</b><span>wymagające uwagi</span></div><div><small>FIRMA — PRÓG</small><b>'+(be.ok?PLN(be.floor):'brak danych')+'</b><span>sprzedaż netto / mies.</span></div></div>'
}
function renderHome53(){
 let host=G('home');if(!host||!planner()||typeof S==='undefined')return;
 G('commandHome53')?.remove();
 let k=nowKey(),y=S.selectedYear||new Date().getFullYear(),box=document.createElement('div');box.id='commandHome53';box.className='commandHome53';
 box.innerHTML='<section class="card commandTop53"><div class="title">Centrum dowodzenia <button class="btn primary" onclick="show(\'control\')">Otwórz pełny kokpit ›</button></div>'+commandHero53(k,y)+'</section>';
 let hero=host.querySelector('.hero');if(hero)hero.insertAdjacentElement('afterend',box);else host.prepend(box)
}
function renderControl53(){
 let host=G('controlBody51');if(!host||!planner()||typeof S==='undefined')return;
 G('commandControl53')?.remove();
 let k=S.finance?.control51?.month||nowKey(),{y}=parseKey(k),box=document.createElement('div');box.id='commandControl53';box.className='commandControl53';
 box.innerHTML='<section class="card commandTop53"><div class="title">Kokpit zarządczy <span class="pill">centrum dowodzenia 5.2</span></div>'+commandHero53(k,y)+'</section>'+scoreCard53(k)+forecastCard53(y)+radarCard53(y)+alertCenter53(k,y)+breakEvenCard53(false);
 host.prepend(box)
}
function renderBusiness53(){
 let host=G('businessPlusBody');if(!host||typeof S==='undefined')return;G('businessBreakEven53')?.remove();
 let wrap=document.createElement('div');wrap.id='businessBreakEven53';wrap.innerHTML=breakEvenCard53(false);host.prepend(wrap)
}
function renderSettings53(){
 let settings=G('settings');if(!settings)return;G('commandSettings53')?.remove();
 let card=document.createElement('div');card.id='commandSettings53';card.className='card';
 card.innerHTML='<div class="title">Centrum dowodzenia 5.2</div><p class="muted">Kondycja 0–100, forecast roku, radar 12 miesięcy, alerty i próg rentowności firmy. Wszystko liczone z istniejących danych — bez obowiązkowego stanu konta i gotówki.</p><button class="btn primary" onclick="show(\'control\')">🧭 Otwórz Centrum dowodzenia</button>';
 settings.prepend(card)
}
function renderAll53(){if(typeof S==='undefined'||!planner())return;setVersion53();renderHome53();renderControl53();renderBusiness53();renderSettings53()}
const oldRender=window.render;if(typeof oldRender==='function'&&!oldRender.__mf53){let fn=function(){let out=oldRender();renderAll53();return out};fn.__mf53=true;window.render=fn}
const oldShow=window.show;if(typeof oldShow==='function'&&!oldShow.__mf53){let fn=function(v){let out=oldShow(v);setVersion53();if(v==='home')renderHome53();if(v==='control')renderControl53();if(v==='businessplus')renderBusiness53();if(v==='settings')renderSettings53();return out};fn.__mf53=true;window.show=fn}
window.mfCommand53={financialScore,annualForecast,companyBreakEven,commandAlerts,dataQuality,forecastMonths};
let st=document.createElement('style');st.textContent='.commandHome53{margin-top:12px}.commandTop53{border:1px solid #d9e4f3;background:linear-gradient(180deg,#fbfdff,#f5f9ff)}.commandHero53{display:grid;grid-template-columns:1.45fr repeat(3,1fr);gap:9px}.commandHero53>div{padding:12px;border:1px solid #e0e7f0;border-radius:12px;background:#fff}.commandHero53>div>small,.commandGrid53 small{display:block;color:#7c899b;font-size:9px;font-weight:800;letter-spacing:.035em}.commandHero53>div>b,.commandGrid53 b{display:block;margin-top:5px;color:#2f5075}.commandHero53>div>span,.commandGrid53 span{display:block;margin-top:4px;color:#7c899b;font-size:10px}.commandScoreMini53{display:flex!important;align-items:center;gap:11px}.scoreRing53{--score:0deg;position:relative;width:86px;height:86px;min-width:86px;border-radius:50%;background:conic-gradient(#315f9f var(--score),#e6ecf3 0);display:grid;place-items:center}.scoreRing53:after{content:"";position:absolute;inset:8px;background:#fff;border-radius:50%}.scoreRing53>div{position:relative;z-index:1;text-align:center}.scoreRing53 strong{display:block;font-size:24px;color:#294c73;line-height:1}.scoreRing53 small{font-size:9px;color:#8290a2}.scoreLayout53{display:grid;grid-template-columns:110px 1fr;gap:18px;align-items:center}.scoreParts53{display:grid;gap:8px}.scoreParts53>div{display:grid;grid-template-columns:150px 1fr 42px 110px;gap:8px;align-items:center;font-size:10px}.scoreParts53 span{color:#596b81;font-weight:700}.scoreParts53 b{text-align:right;color:#315274}.scoreParts53 small{color:#8290a3}.scoreTrack53{height:7px;background:#e8edf3;border-radius:99px;overflow:hidden}.scoreTrack53 i{display:block;height:100%;background:#5c82b4;border-radius:99px}.commandGrid53{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.commandGrid53>div{padding:12px;border:1px solid #e3e9f1;border-radius:12px;background:#f8fafc}.commandGrid53 .em53{background:#eef4ff;border-color:#dbe7f6}.commandAlerts53{display:grid;gap:8px}.commandAlert53{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:11px 12px;border:1px solid #e2e8f0;border-left-width:4px;border-radius:12px}.commandAlert53 small{display:block;text-transform:uppercase;font-size:8px;font-weight:800;color:#8592a4}.commandAlert53 b,.commandAlert53 span{display:block}.commandAlert53 b{margin-top:2px;color:#38536f}.commandAlert53 span{margin-top:3px;color:#758297;font-size:10px}.commandAlert53.red{border-left-color:#d95c6b;background:#fffafa}.commandAlert53.orange{border-left-color:#d89b36;background:#fffdf7}.commandAlert53.blue{border-left-color:#5b88c5}.commandAlert53.green{border-left-color:#57a57c}.radar53{display:flex;align-items:end;gap:7px;height:145px;overflow-x:auto;padding:8px 4px 3px}.radarCol53{display:grid;grid-template-rows:90px 14px 14px;justify-items:center;min-width:43px;align-items:end}.radarBarWrap53{height:86px;display:flex;align-items:end}.radarBarWrap53 i{display:block;width:22px;border-radius:5px 5px 2px 2px}.radarBarWrap53 i.pos{background:#65a984}.radarBarWrap53 i.neg{background:#d96b77}.radarCol53 small{font-size:8px;color:#78879a}.radarCol53 b{font-size:8px}.radarSummary53{display:flex;gap:18px;flex-wrap:wrap;padding-top:8px;border-top:1px solid #e7ecf2;color:#718096;font-size:10px}.breakEven53 .commandGrid53{margin-top:4px}@media(max-width:820px){.commandHero53{grid-template-columns:repeat(2,minmax(0,1fr))}.commandGrid53{grid-template-columns:repeat(2,minmax(0,1fr))}.scoreParts53>div{grid-template-columns:120px 1fr 38px}.scoreParts53 small{grid-column:1/-1}}@media(max-width:560px){.commandHero53{grid-template-columns:1fr 1fr}.commandScoreMini53{grid-column:1/-1}.commandGrid53{grid-template-columns:1fr 1fr}.scoreLayout53{grid-template-columns:1fr}.scoreLayout53>.scoreRing53{justify-self:center}.scoreParts53>div{grid-template-columns:110px 1fr 36px}.commandAlert53{grid-template-columns:1fr}.commandAlert53 .btn{justify-self:start}.radarCol53{min-width:39px}}';document.head.appendChild(st);
})();
