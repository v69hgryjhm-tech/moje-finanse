/* Moje Finanse 4.7 — czytelność, edycja kredytów i dopracowanie wykresów */
(function(){
'use strict';
const VERSION='4.7.0';
const NS='http://www.w3.org/2000/svg';
const G=id=>document.getElementById(id),N=v=>+v||0;
const PLN=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(N(v));
function compact(v){v=N(v);if(v>=1000000)return (v/1000000).toLocaleString('pl-PL',{maximumFractionDigits:1})+' mln';if(v>=1000)return (v/1000).toLocaleString('pl-PL',{maximumFractionDigits:1})+' tys.';return Math.round(v)+' zł'}
function svgEl(name,attrs,text){let e=document.createElementNS(NS,name);Object.entries(attrs||{}).forEach(([k,v])=>e.setAttribute(k,v));if(text!=null)e.textContent=text;return e}
function setVersion(){document.title='Moje Finanse '+VERSION;let h=document.querySelector('.top small');if(h)h.innerHTML='<span id="headerYear">'+(typeof S!=='undefined'?S.selectedYear:'')+'</span> • wersja '+VERSION;document.documentElement.dataset.appVersion=VERSION}

function balanceNow(l){
 try{if(typeof loanPoint==='function')return N(loanPoint(l).balance)}catch{}
 return N(l?.balance)
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
 let first=svg.firstChild;svg.insertBefore(g,first);
}
function styleLoanOverview(){
 if(typeof S==='undefined')return;
 let svg=document.querySelector('#loanOverview .overviewChart svg');if(!svg)return;
 let max=(S.loans||[]).reduce((a,l)=>a+Math.max(balanceNow(l),N(l.originalBalance)),0);
 addBalanceGrid(svg,max,{left:52,right:24,top:32,bottom:147});
 let chart=document.querySelector('#loanOverview .overviewChart');
 if(chart&&!chart.querySelector('.ux47AxisNote')){
  let n=document.createElement('div');n.className='ux47AxisNote';n.innerHTML='<span>↑ saldo łączne</span><span>↓ raty w danym miesiącu</span>';chart.prepend(n)
 }
 let head=document.querySelector('#loanOverview .loanChartHead');
 if(head){
  let small=head.querySelector('small');if(small)small.textContent='Górny wykres: malejące saldo wszystkich kredytów. Dolne słupki: suma rat i nadpłat w miesiącu. Zielone znaczniki: planowane zakończenia.';
 }
}
function styleLoanCards(){
 if(typeof S==='undefined')return;
 document.querySelectorAll('#loanList .loan').forEach((card,i)=>{
  let l=S.loans?.[i],svg=card.querySelector('.loanUnifiedChart svg');if(!l||!svg)return;
  addBalanceGrid(svg,Math.max(N(l.originalBalance),N(l.balance),balanceNow(l),1),{left:54,right:28,top:20,bottom:145});
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
  if(actions&&!actions.querySelector('.editLoan47')){
    let b=document.createElement('button');b.className='btn editLoan47';b.type='button';b.innerHTML='✎ Edytuj';b.onclick=()=>window.toggleLoanEdit47(i);
    actions.insertBefore(b,actions.querySelector('.danger')||null);
  }
  let edit=card.querySelector('.loanEdit');
  if(edit){
    edit.classList.toggle('loanEditOpen47',!!l.uiEditOpen);
    edit.classList.toggle('loanEditClosed47',!l.uiEditOpen);
  }
  let b=actions?.querySelector('.editLoan47');if(b)b.textContent=l.uiEditOpen?'✕ Zamknij edycję':'✎ Edytuj';
 });
}
window.toggleLoanEdit47=function(i){
 let l=S?.loans?.[i];if(!l)return;l.uiEditOpen=!l.uiEditOpen;save();window.loans?.();
 if(l.uiEditOpen)setTimeout(()=>document.querySelectorAll('#loanList .loan')[i]?.querySelector('.loanEdit')?.scrollIntoView({behavior:'smooth',block:'nearest'}),0)
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
 add('Firma+',typeof window.renderBusinessPlus44==='function');
 add('Próg PIT',typeof window.mfCombinedTax44==='function');
 add('Wykres zarobków',!!G('earningsChart'));
 add('Wykres progu',!!G('taxSvg')&&!!G('homeTaxSvg'));
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
 let fn=function(v){let out=oldShow(v);navState47(v);if(v==='loans')enhanceLoans47();if(v==='settings')renderSmoke47();improveLabels();return out};fn.__ux47=true;window.show=fn
}
const oldRender=window.render;
if(typeof oldRender==='function'&&!oldRender.__ux47){
 let fn=function(){let out=oldRender();addFirmaShortcut();enhanceLoans47();renderSmoke47();improveLabels();return out};fn.__ux47=true;window.render=fn
}
let st=document.createElement('style');st.textContent=`
.nav button[data-v]{flex:1;min-width:0}.nav .plus{flex:0 0 48px}.nav{width:min(760px,calc(100% - 18px));padding:0 4px}.nav button[data-v]>span{white-space:nowrap}
.loanTitleActions{display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end}.loanEditClosed47{display:none!important}.loanEditOpen47{display:block!important}.editLoan47{background:#eef4ff;color:#315f9f}
.ux47AxisNote{display:flex;justify-content:space-between;gap:10px;padding:5px 9px 0;font-size:9px;color:#75839a;font-weight:700;letter-spacing:.02em}
#loanOverview .overviewChart,.loanUnifiedChart{background:linear-gradient(180deg,#fbfdff 0%,#fff 100%);box-shadow:inset 0 0 0 1px #e5ebf2}
#loanOverview .loanChartHead b,.loanChartHead b{font-size:13px}
@media(max-width:560px){.nav button[data-v]>span{font-size:8px}.nav{width:calc(100% - 12px)}.loanTitleActions{max-width:190px}.editLoan47{padding:7px 8px}}
`;document.head.appendChild(st);
addFirmaShortcut();setVersion();
})();