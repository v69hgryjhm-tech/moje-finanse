/* Moje Finanse 4.7 — czytelność, edycja kredytów i dopracowanie wykresów */
(function(){
'use strict';
const VERSION='5.0.0';
const NS='http://www.w3.org/2000/svg';
const G=id=>document.getElementById(id),N=v=>+v||0;
const PLN=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(N(v));
function compact(v){v=N(v);if(v>=1000000)return (v/1000000).toLocaleString('pl-PL',{maximumFractionDigits:1})+' mln';if(v>=1000)return (v/1000).toLocaleString('pl-PL',{maximumFractionDigits:1})+' tys.';return Math.round(v)+' zł'}
function svgEl(name,attrs,text){let e=document.createElementNS(NS,name);Object.entries(attrs||{}).forEach(([k,v])=>e.setAttribute(k,v));if(text!=null)e.textContent=text;return e}
function setVersion(){document.title='Moje Finanse '+VERSION;let h=document.querySelector('.top small');if(h)h.innerHTML='<span id="headerYear">'+(typeof S!=='undefined'?S.selectedYear:'')+'</span> • wersja '+VERSION;document.documentElement.dataset.appVersion=VERSION}

function balanceNow(l){
 try{if(typeof window.loanCurrentPoint15==='function')return N(window.loanCurrentPoint15(l).balance)}catch{}
 try{if(typeof loanPoint==='function')return N(loanPoint(l).balance)}catch{}
 return N(l?.balance)
}
function loanPlan47(l,withPlan=true){try{return typeof window.loanTimeline15==='function'?window.loanTimeline15(l,withPlan):{rows:[],actual:[],forecast:[]}}catch{return{rows:[],actual:[],forecast:[]}}}
function loanCost47(l){
 let capital=balanceNow(l),plan=loanPlan47(l,true),base=loanPlan47(l,false);
 let interestPlan=plan.forecast.reduce((a,r)=>a+N(r.interest),0),interestBase=base.forecast.reduce((a,r)=>a+N(r.interest),0);
 return{capital,interestPlan,interestBase,total:capital+interestPlan,saving:Math.max(0,interestBase-interestPlan),end:plan.rows.at(-1)?.date||null,plan}
}
function allLoanCost47(){
 return (S?.loans||[]).reduce((a,l)=>{let x=loanCost47(l);a.capital+=x.capital;a.interest+=x.interestPlan;a.total+=x.total;a.saving+=x.saving;return a},{capital:0,interest:0,total:0,saving:0})
}
function monthKey47(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
function loanSeries47(){
 let loans=S?.loans||[];if(!loans.length)return null;
 let items=loans.map(l=>({l,c:loanCost47(l)}));
 let starts=items.map(x=>new Date((x.l.asOfDate||TODAY)+'T12:00:00').getTime()),ends=items.map(x=>(x.c.end||new Date()).getTime());
 let start=new Date(Math.min(...starts)),end=new Date(Math.max(...ends)),count=Math.max(1,(end.getFullYear()-start.getFullYear())*12+end.getMonth()-start.getMonth()+1),rows=[];
 for(let i=0;i<count;i++){
  let d=new Date(start.getFullYear(),start.getMonth()+i,1,12),capital=0,total=0;
  items.forEach(({l,c})=>{
   let plan=c.plan.rows||[],prev=plan.filter(r=>r.date<=d).at(-1),future=plan.filter(r=>r.date>d);
   let bal;
   if(d<new Date((l.asOfDate||TODAY)+'T12:00:00'))bal=N(l.balance);else if(prev)bal=N(prev.balance);else bal=balanceNow(l);
   if(plan.length&&d>(plan.at(-1)?.date||d))bal=0;
   let ints=future.reduce((a,r)=>a+N(r.interest),0);
   capital+=bal;total+=bal+ints;
  });
  rows.push({d,capital,total})
 }
 return{start,end,rows}
}
function monthlyPayments47(){
 const months=new Map();
 (S.loans||[]).forEach(l=>loanPlan47(l,true).rows.forEach(r=>{
  const key=monthKey47(r.date);let m=months.get(key)||{regular:0,extra:0,actual:0,forecast:0};
  const regular=r.kind==='actual'?N(r.regularPaid):N(r.planned),extra=N(r.extra);
  m.regular+=regular;m.extra+=extra;m[r.kind==='actual'?'actual':'forecast']+=regular+extra;months.set(key,m);
 }));
 return months;
}
function renderMonthlyPayments47(chart,svg,series,xs){
 if(!chart)return;
 chart.querySelector('.overviewPayments47')?.remove();
 const months=monthlyPayments47(),keys=[...months.keys()].sort();
 if(!keys.length)return;
 const parseKey=k=>{let [y,m]=k.split('-').map(Number);return new Date(y,m-1,1,12)};
 const first=parseKey(keys[0]),last=parseKey(keys.at(-1)),count=Math.max(1,(last.getFullYear()-first.getFullYear())*12+last.getMonth()-first.getMonth()+1),rows=[];
 for(let i=0;i<count;i++){
  const d=new Date(first.getFullYear(),first.getMonth()+i,1,12),m=months.get(monthKey47(d))||{regular:0,extra:0,actual:0,forecast:0};
  rows.push({d,...m,isForecast:N(m.forecast)>0&&N(m.actual)===0});
 }
 const sourceW=N((svg?.getAttribute('viewBox')||'0 0 760 248').split(/\s+/)[2])||760,w=Math.max(760,sourceW),left=54,right=28,top=48,bottom=132,plotW=w-left-right,stepX=count>1?plotW/(count-1):0,x=i=>count>1?left+i*stepX:left+plotW/2;
 const max=Math.max(1,...rows.map(r=>N(r.regular)+N(r.extra))),step=niceStep(max),axis=Math.ceil(max/step)*step,y=v=>bottom-N(v)/axis*(bottom-top);
 const section=document.createElement('div');section.className='overviewPayments47';section.style.width=w+'px';
 const title=document.createElement('div');title.className='paymentsTitle47';title.textContent='Raty i nadpłaty miesiąc po miesiącu — zł / miesiąc';section.appendChild(title);
 const plot=svgEl('svg',{viewBox:'0 0 '+w+' 178',width:w,height:178,role:'img','aria-label':'Raty i nadpłaty; każda data jest wyśrodkowana dokładnie pod odpowiadającym słupkiem'});
 for(let v=0;v<=axis+.001;v+=step){plot.appendChild(svgEl('line',{x1:left-10,x2:w-right,y1:y(v),y2:y(v),stroke:'#e7edf4'}));plot.appendChild(svgEl('text',{x:left-16,y:y(v)+3,'text-anchor':'end',fill:'#7b8a9f','font-size':9},compact(v)))}
 rows.forEach((r,i)=>{
  const xx=x(i),total=N(r.regular)+N(r.extra),bw=Math.max(12,Math.min(20,stepX*.52||18)),yr=y(r.regular),yt=y(total),group=svgEl('g',{});
  group.appendChild(svgEl('title',{},monthKey47(r.d)+': raty '+PLN(r.regular)+', nadpłaty '+PLN(r.extra)+', razem '+PLN(total)+(r.isForecast?' — prognoza':'')));
  if(N(r.regular)>0)group.appendChild(svgEl('rect',{x:xx-bw/2,y:yr,width:bw,height:bottom-yr,rx:3,fill:'#78a7e3',opacity:r.isForecast?0.58:1}));
  if(N(r.extra)>0)group.appendChild(svgEl('rect',{x:xx-bw/2,y:yt,width:bw,height:yr-yt,rx:3,fill:'#f2b554',opacity:r.isForecast?0.58:1}));
  if(total>0)group.appendChild(svgEl('text',{x:xx,y:Math.max(17,yt-7),transform:'rotate(-45 '+xx+' '+Math.max(17,yt-7)+')','text-anchor':'start',fill:'#49617e','font-size':8.2},PLN(total)));
  group.appendChild(svgEl('line',{x1:xx,x2:xx,y1:bottom,y2:bottom+4,stroke:'#cbd4e0','stroke-width':1}));
  group.appendChild(svgEl('text',{x:xx,y:154,'text-anchor':'middle',fill:'#65758c','font-size':8,'font-weight':'600'},String(r.d.getMonth()+1).padStart(2,'0')+'.'+String(r.d.getFullYear()).slice(-2)));
  plot.appendChild(group);
 });
 section.appendChild(plot);
 const legend=document.createElement('div');legend.className='paymentsLegend47';legend.innerHTML='<span><i></i>Raty</span><span><i class="extra47"></i>Nadpłaty</span><span>Jasne słupki — prognoza</span><span>Data pod słupkiem = miesiąc płatności</span>';section.appendChild(legend);
 chart.appendChild(section);
}

function niceStep(max,target=4){max=Math.max(1,N(max));let raw=max/target,p=Math.pow(10,Math.floor(Math.log10(raw))),q=raw/p,m=q<=1?1:q<=2?2:q<=2.5?2.5:q<=5?5:10;return m*p}
function addBalanceGrid(svg,max,opt={}){
 if(!svg)return;
 svg.querySelector('.ux47Grid')?.remove();
 let maxVal=Math.max(1,N(max)),step=niceStep(maxVal),axis=Math.ceil(maxVal/step)*step;
 let left=opt.left||54,right=opt.right||28,top=opt.top||20,bottom=opt.bottom||145;
 let vb=(svg.getAttribute('viewBox')||'0 0 760 270').split(/\s+/).map(Number),w=vb[2]||760;
 let g=svgEl('g',{class:'ux47Grid'});
 g.appendChild(svgEl('rect',{x:left-4,y:top-7,width:Math.max(0,w-left-right+4),height:bottom-top+14,rx:10,fill:'#f8fbff'}));
 for(let v=0;v<=axis+.001;v+=step){
  let y=bottom-(v/axis)*(bottom-top);
  g.appendChild(svgEl('line',{x1:left-2,x2:w-right,y1:y,y2:y,stroke:v===0?'#cfd7e2':'#dfe6ef','stroke-width':v===0?'1.2':'1','stroke-dasharray':v===0?'0':'3 5'}));
  g.appendChild(svgEl('text',{x:left-8,y:y+3,'text-anchor':'end',fill:'#6f7c91','font-size':'8.5','font-weight':'600'},compact(v)));
 }
 let first=svg.firstChild;svg.insertBefore(g,first);return{axis,left,right,top,bottom,w};
}
function styleLoanOverview(){
 if(typeof S==='undefined')return;
 let box=G('loanOverview'),svg=box?.querySelector('.overviewChart svg');if(!box||!svg)return;
 let costs=allLoanCost47(),series=loanSeries47(),main=[...svg.querySelectorAll(':scope > polyline')][0],points=(main?.getAttribute('points')||'').trim().split(/\s+/).filter(Boolean),xs=points.map(p=>N(p.split(',')[0]));
 let max=Math.max(costs.total,...(series?.rows||[]).map(r=>r.total),1),grid=addBalanceGrid(svg,max,{left:52,right:24,top:32,bottom:147})||{},axis=grid.axis||max,top=grid.top||32,bottom=grid.bottom||147,y=v=>bottom-(N(v)/axis)*(bottom-top);
 if(series&&xs.length){
  let rows=series.rows.slice(0,xs.length),capPts=rows.map((r,i)=>xs[i]+','+y(r.capital)).join(' '),fullPts=rows.map((r,i)=>xs[i]+','+y(r.total)).join(' ');
  if(main){main.setAttribute('points',capPts);main.setAttribute('stroke','#2457a6');main.setAttribute('stroke-width','4.4');main.setAttribute('filter','drop-shadow(0 2px 2px rgba(36,87,166,.14))')}
  svg.querySelector('.ux47FullCost')?.remove();
  let p=svgEl('polyline',{class:'ux47FullCost',points:fullPts,fill:'none',stroke:'#8b5cf6','stroke-width':'3.8','stroke-linecap':'round','stroke-linejoin':'round','stroke-dasharray':'8 5'});svg.appendChild(p);
 }
 
 let k=box.querySelector('.loanOverviewKpis');
 if(k)k.innerHTML='<div><small>KAPITAŁ DO SPŁATY</small><b>'+PLN(costs.capital)+'</b><span>bez przyszłych odsetek</span></div><div><small>ODSETKI DO KOŃCA</small><b>'+PLN(costs.interest)+'</b><span>wg obecnego planu</span></div><div class="ux47TotalPay"><small>ŁĄCZNIE DO ZAPŁATY</small><b>'+PLN(costs.total)+'</b><span>kapitał + przyszłe odsetki</span></div><div><small>NAJBLIŻSZE RATY — PROGNOZA</small><b>'+PLN((S.loans||[]).reduce((a,l)=>a+N(loanPlan47(l,true).forecast[0]?.planned),0))+'</b></div><div><small>WPŁACONO DOTĄD</small><b>'+PLN((S.loans||[]).reduce((a,l)=>{try{return a+N(window.loanTotals15?.(l)?.paid)}catch{return a}},0))+'</b></div><div><small>OSZCZ. NADPŁAT</small><b class="green">'+PLN(costs.saving)+'</b><span>mniej przyszłych odsetek</span></div>';
 let chart=box.querySelector('.overviewChart');
 if(chart&&!chart.querySelector('.ux47AxisNote')){let n=document.createElement('div');n.className='ux47AxisNote';n.innerHTML='<span>↑ kapitał / pełna kwota do zapłaty</span>';chart.prepend(n)}
 else if(chart?.querySelector('.ux47AxisNote'))chart.querySelector('.ux47AxisNote').innerHTML='<span>↑ kapitał / pełna kwota do zapłaty</span>';
 let head=box.querySelector('.loanChartHead');
 if(head){let title=head.querySelector('b'),small=head.querySelector('small');if(title)title.textContent='Wszystkie kredyty — kapitał i pełny koszt spłaty';if(small)small.textContent='Niebieska linia = pozostały kapitał. Fioletowa przerywana = kapitał + przyszłe odsetki. Raty i nadpłaty pokazuje osobny wykres poniżej.'}
 let legend=chart?.nextElementSibling;if(legend?.classList.contains('legend'))legend.innerHTML='<span><i class="lineSolid"></i> kapitał</span><span><i class="ux47PurpleLine"></i> łącznie do zapłaty</span><span class="green">--- zakończenie kredytu</span>';
 renderMonthlyPayments47(chart,svg,series,xs);
}
function styleLoanCards(){
 if(typeof S==='undefined')return;
 document.querySelectorAll('#loanList .loan').forEach((card,i)=>{
  let l=S.loans?.[i],svg=card.querySelector('.loanUnifiedChart svg');if(!l||!svg)return;
  addBalanceGrid(svg,Math.max(N(l.originalBalance),N(l.balance),balanceNow(l),1),{left:54,right:28,top:20,bottom:145});
  let lines=[...svg.querySelectorAll(':scope > polyline')];if(lines[0]){lines[0].setAttribute('stroke','#9aa5b5');lines[0].setAttribute('stroke-width','2.5')}if(lines[1]){lines[1].setAttribute('stroke','#2457a6');lines[1].setAttribute('stroke-width','4.8');lines[1].setAttribute('filter','drop-shadow(0 2px 2px rgba(36,87,166,.14))')}if(lines[2]){lines[2].setAttribute('stroke','#d94f62');lines[2].setAttribute('stroke-width','4.2')}
  let chart=card.querySelector('.loanUnifiedChart');
  if(chart&&!chart.querySelector('.ux47AxisNote')){
    let n=document.createElement('div');n.className='ux47AxisNote';n.innerHTML='<span>↑ saldo kredytu</span><span>↓ rata / nadpłata</span>';chart.prepend(n)
  }
  let head=card.querySelector('.loanChartHead small');
  if(head)head.textContent='Saldo ma własną skalę po lewej. Linie pokazują scenariusze spłaty, a dolne słupki — ratę i nadpłatę miesiąca.';
 });
}
function enhanceLoanEditing(){
 if(typeof S==='undefined')return;
 document.querySelectorAll('#loanList .loan').forEach((card,i)=>{
  let l=S.loans?.[i];if(!l)return;
  let actions=card.querySelector('.loanTitleActions');
  if(actions&&!actions.querySelector('.editLoan47')){let b=document.createElement('button');b.className='btn editLoan47';b.type='button';b.textContent='✎ Edytuj';b.onclick=()=>window.editLoanModal47(i);actions.insertBefore(b,actions.querySelector('.danger')||null)}
  let inline=card.querySelector('.loanEdit');if(inline)inline.style.display='none';
  let k=card.querySelector('.loanKpis');if(k&&!k.querySelector('.ux47FullKpi')){let x=loanCost47(l),d=document.createElement('div');d.className='loanKpi ux47FullKpi';d.innerHTML='<small>ŁĄCZNIE DO ZAPŁATY</small><b>'+PLN(x.total)+'</b><span>kapitał '+PLN(x.capital)+' + odsetki '+PLN(x.interestPlan)+'</span>';k.appendChild(d)}
 });
}
window.editLoanModal47=function(i){
 let l=S?.loans?.[i];if(!l)return;
 open('<h2>Edytuj kredyt</h2><p class="muted">Zmiany dotyczą parametrów bazowych kredytu. Historia faktycznie zapisanych rat i nadpłat pozostaje bez zmian.</p><div class="form loanModal47"><label>Nazwa<input id="e47_name" type="text" value="'+String(l.name||'').replace(/"/g,'&quot;')+'"></label><label>Typ<select id="e47_type"><option value="interest" '+(l.loanType==='interest'?'selected':'')+'>Oprocentowany</option><option value="zero" '+(l.loanType==='zero'?'selected':'')+'>Raty 0%</option></select></label><label>Kwota początkowa<input id="e47_orig" type="number" step="0.01" value="'+N(l.originalBalance)+'"></label><label>Saldo bazowe<input id="e47_bal" type="number" step="0.01" value="'+N(l.balance)+'"></label><label>Stan na dzień<input id="e47_date" type="date" value="'+(l.asOfDate||TODAY)+'"></label><label>Rata umowna<input id="e47_pay" type="number" step="0.01" value="'+N(l.payment)+'"></label><label>Oprocentowanie %<input id="e47_rate" type="number" step="0.01" value="'+N(l.rate)+'"></label><label>Pozostało rat<input id="e47_months" type="number" step="1" value="'+(N(l.months)||'')+'"></label><label>Dzień raty<input id="e47_due" type="number" min="1" max="31" value="'+N(l.dueDay)+'"></label><label>Sposób nadpłaty<select id="e47_mode"><option value="shorten" '+(l.overpayMode==='shorten'?'selected':'')+'>Skrócenie okresu</option><option value="reduce_payment" '+(l.overpayMode==='reduce_payment'?'selected':'')+'>Zmniejszenie raty</option></select></label><label>Nadpłata / miesiąc<input id="e47_extra" type="number" step="0.01" value="'+N(l.extraMonthly)+'"></label><label>Jednorazowa nadpłata<input id="e47_one" type="number" step="0.01" value="'+N(l.oneOff)+'"></label></div><div class="notice">Po zapisaniu aplikacja od razu przeliczy harmonogram, odsetki do końca i pełną kwotę pozostałą do zapłaty.</div><div class="actions"><button class="btn" onclick="closeModal()">Anuluj</button><button class="btn primary" onclick="saveLoanEdit47('+i+')">Zapisz zmiany</button></div>');
 let type=G('e47_type'),rate=G('e47_rate');if(type&&rate){let sync=()=>{rate.disabled=type.value==='zero';if(type.value==='zero')rate.value='0'};type.onchange=sync;sync()}
};
window.saveLoanEdit47=function(i){
 let l=S?.loans?.[i];if(!l)return;
 let bal=Math.max(0,N(G('e47_bal')?.value)),orig=Math.max(0,N(G('e47_orig')?.value));
 l.name=(G('e47_name')?.value||l.name||'Kredyt').trim();l.loanType=G('e47_type')?.value==='zero'?'zero':'interest';l.originalBalance=Math.max(orig,bal);l.balance=bal;l.asOfDate=G('e47_date')?.value||TODAY;l.payment=Math.max(0,N(G('e47_pay')?.value));l.rate=l.loanType==='zero'?0:Math.max(0,N(G('e47_rate')?.value));l.months=Math.max(0,Math.round(N(G('e47_months')?.value)));l.dueDay=Math.max(1,Math.min(31,Math.round(N(G('e47_due')?.value)||1)));l.overpayMode=G('e47_mode')?.value==='reduce_payment'?'reduce_payment':'shorten';l.extraMonthly=Math.max(0,N(G('e47_extra')?.value));l.oneOff=Math.max(0,N(G('e47_one')?.value));l.uiEditOpen=false;save();closeModal();window.render?.();window.show?.('loans')
};
function enhanceLoans47(){styleLoanOverview();styleLoanCards();enhanceLoanEditing()}

function navState47(v){
 document.querySelectorAll('.nav button[data-v]').forEach(b=>b.classList.toggle('active',b.dataset.v===v));
}
function addFirmaShortcut(){
 let nav=document.querySelector('.nav');if(!nav||nav.querySelector('[data-v="businessplus"]'))return;
 let salary=nav.querySelector('[data-v="salary"]');
 let btn=document.createElement('button');btn.dataset.v='businessplus';btn.innerHTML='▤<span>Firma+</span>';btn.onclick=()=>show('businessplus');
 salary?.insertAdjacentElement('afterend',btn);
}
function improveLabels(){
 let taxTitle=document.querySelector('#tax .chart .title');if(taxTitle)taxTitle.firstChild.textContent='Podstawa do progu PIT — narastająco ';
 let companyTitle=document.querySelector('#home .two .card:nth-child(2) .title');if(companyTitle&&companyTitle.firstChild)companyTitle.firstChild.textContent='Firma — sprzedaż i wynik ';
}
function runSmoke47(){
 let tests=[];
 const add=(name,ok,detail='')=>tests.push({name,ok:!!ok,detail});
 add('Stan aplikacji',typeof S!=='undefined');
 add('12 miesięcy etatu',Array.isArray(S?.years?.[String(S?.selectedYear)]?.salary)&&S.years[String(S.selectedYear)].salary.length===12);
 add('12 miesięcy firmy',Array.isArray(S?.years?.[String(S?.selectedYear)]?.company)&&S.years[String(S.selectedYear)].company.length===12);
 try{let p=typeof sal==='function'?sal():null;add('Silnik etatu',p?.rows?.length===12,p?.rows?.length+' / 12')}catch(e){add('Silnik etatu',false,e.message)}
 add('Kredyty',Array.isArray(S?.loans));
 add('Edycja kredytu',typeof window.editLoanModal47==='function'&&typeof window.saveLoanEdit47==='function');
 add('Pełny koszt kredytów',typeof window.loanTimeline15==='function');
 add('Firma+',typeof window.renderBusinessPlus44==='function');
 add('Próg PIT',typeof window.mfCombinedTax44==='function');
 add('12 kart etatu w DOM',document.querySelectorAll('#months .month').length===12,document.querySelectorAll('#months .month').length+' / 12');
 let ech=G('earningsChart'),ts=G('taxSvg');
 add('Wykres zarobków',!!(ech&&ech.querySelector('svg')),ech&&ech.querySelector('svg')?'SVG OK':'brak SVG');
 add('Wykres progu — 3 linie źródeł',!!(ts&&ts.querySelectorAll('polyline').length>=3),ts?ts.querySelectorAll('polyline').length+' linii':'brak SVG');
 add('Karty kredytów',!(S&&S.loans&&S.loans.length)||document.querySelectorAll('#loanList .loan').length===S.loans.length,document.querySelectorAll('#loanList .loan').length+' / '+((S&&S.loans&&S.loans.length)||0));
 add('Firma+ na pasku',!!document.querySelector('.nav [data-v="businessplus"]'));
 add('Zapis lokalny',(()=>{try{let k='mf47_smoke',v=String(Date.now());localStorage.setItem(k,v);let ok=localStorage.getItem(k)===v;localStorage.removeItem(k);return ok}catch{return false}})());
 return tests;
}
function renderSmoke47(){
 let settings=G('settings');if(!settings)return;
 let box=G('smoke47');if(!box){box=document.createElement('div');box.id='smoke47';box.className='card';settings.appendChild(box)}
 let t=runSmoke47(),ok=t.filter(x=>x.ok).length;
 box.innerHTML='<div class="title">Test aplikacji <span class="pill">'+ok+'/'+t.length+' OK</span></div>'+t.map(x=>'<div class="row"><span>'+(x.ok?'✓':'⚠')+' '+x.name+'</span><b class="'+(x.ok?'green':'red')+'">'+(x.detail|| (x.ok?'OK':'sprawdź'))+'</b></div>').join('')+'<p class="muted">To test startu, danych i głównych silników. Pełny test dotyku/Safari nadal wykonujemy na urządzeniu po wdrożeniu.</p>';
}
window.runSmoke47=runSmoke47;

const oldLoans=window.loans;
if(typeof oldLoans==='function'&&!oldLoans.__ux47){
 let fn=function(){let out=oldLoans();enhanceLoans47();return out};fn.__ux47=true;window.loans=fn
}
const oldShow=window.show;
if(typeof oldShow==='function'&&!oldShow.__ux47){
 let fn=function(v){let out=oldShow(v);setVersion();navState47(v);if(v==='loans')enhanceLoans47();if(v==='settings')renderSmoke47();improveLabels();return out};fn.__ux47=true;window.show=fn
}
const oldRender=window.render;
if(typeof oldRender==='function'&&!oldRender.__ux47){
 let fn=function(){let out=oldRender();setVersion();addFirmaShortcut();enhanceLoans47();renderSmoke47();improveLabels();return out};fn.__ux47=true;window.render=fn
}
let st=document.createElement('style');st.textContent=`
.nav button[data-v]{flex:1;min-width:0}.nav .plus{flex:0 0 48px}.nav{width:min(760px,calc(100% - 18px));padding:0 4px}.nav button[data-v]>span{white-space:nowrap}
.loanTitleActions{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end}.editLoan47{background:#eef4ff;color:#315f9f}#loanList .loanEdit{display:none!important}.ux47FullKpi{background:#f4efff!important;border:1px solid #e3d8ff}.ux47TotalPay{background:#f4efff!important;border:1px solid #e3d8ff}.ux47PurpleLine{display:inline-block;width:18px;border-top:3px dashed #8b5cf6;margin-right:5px;vertical-align:middle}.loanOverviewKpis{grid-template-columns:repeat(3,minmax(0,1fr))!important}.loanModal47{grid-template-columns:repeat(2,minmax(0,1fr))}
.ux47AxisNote{display:flex;justify-content:space-between;gap:10px;padding:5px 9px 0;font-size:9px;color:#75839a;font-weight:700;letter-spacing:.02em}
#loanOverview .overviewChart,.loanUnifiedChart{background:linear-gradient(180deg,#fbfdff 0%,#fff 100%);box-shadow:inset 0 0 0 1px #e5ebf2}
#loanOverview .loanChartHead b,.loanChartHead b{font-size:13px}
@media(max-width:760px){.loanOverviewKpis{grid-template-columns:repeat(2,minmax(0,1fr))!important}}@media(max-width:560px){.nav button[data-v]>span{font-size:8px}.nav{width:calc(100% - 12px)}.loanTitleActions{max-width:190px}.editLoan47{padding:7px 8px}.loanModal47{grid-template-columns:1fr}.loanOverviewKpis{grid-template-columns:1fr 1fr!important}}
`;document.head.appendChild(st);
addFirmaShortcut();setVersion();
})()