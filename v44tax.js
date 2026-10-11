/* Moje Finanse 4.4 — wspólny próg PIT: etat + działalność na skali */
(function(){
'use strict';
const G=id=>document.getElementById(id),N=v=>+v||0,R2=v=>Math.round((N(v)+Number.EPSILON)*100)/100;
const PLN=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(N(v));
const FULL=['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
const SHORT=['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru'];

function rowActual(r){
 return !!((r?.salesLines?.length)||(r?.costLines?.length)||N(r?.revenue)||N(r?.costs)||N(r?.vat)||N(r?.vatOut)||N(r?.vatIn)||N(r?.zus)||N(r?.health)||N(r?.tax));
}
function companySummary(r){
 if(typeof window.mfCompanySummary44==='function')return window.mfCompanySummary44(r||{});
 const rev=N(r?.revenue),cost=N(r?.costs),zus=N(r?.zus);
 return{taxable:R2(rev-cost-zus),sales:{net:rev,gross:N(r?.revenueGross)||rev,vat:N(r?.vatOut)},costs:{net:cost,gross:N(r?.costsGross)||cost,vat:N(r?.vatIn)}};
}
function employmentRows(y){
 const old=S.selectedYear;let rows=[];
 try{S.selectedYear=y;window.mfTaxSync41?.(y);Y();rows=typeof sal==='function'?(sal().rows||[]):[]}catch(e){console.error('etat próg 4.4',e)}
 finally{S.selectedYear=old;window.mfTaxSync41?.(old)}
 return rows;
}
function companyForecast(y){
 const old=S.selectedYear;let rows=[];
 try{S.selectedYear=y;Y();rows=typeof comp==='function'?(comp().rows||[]):[]}catch(e){console.error('firma prognoza 4.4',e)}
 finally{S.selectedYear=old;window.mfTaxSync41?.(old)}
 return rows;
}
function combined(y){
 const year=S.years?.[String(y)]||{},company=year.company||[],emp=employmentRows(y);
 const actualBusiness=company.filter(rowActual).map(r=>N(companySummary(r).taxable));
 const avgTaxable=actualBusiness.length?actualBusiness.reduce((a,b)=>a+b,0)/actualBusiness.length:0;
 const now=new Date(),cy=now.getFullYear(),cm=now.getMonth();
 let empActual=0,empForecast=0,bizActual=0,bizForecast=0,lastActual=-1,rows=[];
 for(let i=0;i<12;i++){
  const er=emp[i]||{},base=N(er.base);
  if(er.actual)empActual=R2(empActual+base);else empForecast=R2(empForecast+base);
  const r=company[i]||{},actual=rowActual(r),future=y>cy||(y===cy&&i>=cm);
  let monthBusiness=0,companyForecasted=false;
  if(actual){monthBusiness=N(companySummary(r).taxable);bizActual=R2(bizActual+monthBusiness);lastActual=Math.max(lastActual,i)}
  else if(future&&actualBusiness.length){monthBusiness=avgTaxable;bizForecast=R2(bizForecast+monthBusiness);companyForecasted=true}
  const business=Math.max(0,R2(bizActual+bizForecast));
  const employment=R2(empActual+empForecast);
  rows.push({i,employment,employmentActual:empActual,employmentForecast:empForecast,business,businessActual:bizActual,businessForecast:bizForecast,combined:R2(employment+business),salaryActual:!!er.actual,companyActual:actual,companyForecasted,monthBusiness});
 }
 return{rows,threshold:N(S.settings?.threshold)||120000,lastActual,avgTaxable};
}
window.mfCombinedTax44=combined;

function niceStep(max,target=4){
 const raw=Math.max(1,N(max))/target,p=Math.pow(10,Math.floor(Math.log10(raw))),q=raw/p;
 const m=q<=1?1:q<=2?2:q<=2.5?2.5:q<=5?5:10;
 return m*p;
}
function compact(v){
 v=N(v);if(v>=1000000)return (v/1000000).toLocaleString('pl-PL',{maximumFractionDigits:1})+' mln';
 if(v>=1000)return (v/1000).toLocaleString('pl-PL',{maximumFractionDigits:1})+' tys.';
 return Math.round(v)+' zł';
}
function employmentReconciliation44(rows,actual){
 const totals=rows.filter(r=>!!r.actual===actual&&(N(r.g)||N(r.er)||N(r.base))).reduce((a,r)=>{a.gross+=N(r.g);a.social+=N(r.social);a.kup+=N(r.kup);a.ppk+=N(r.er);a.base+=N(r.base);return a},{gross:0,social:0,kup:0,ppk:0,base:0});
 Object.keys(totals).forEach(k=>totals[k]=R2(totals[k]));
 totals.rounding=R2(totals.base-(totals.gross-totals.social-totals.kup+totals.ppk));
 return totals;
}
function employmentReconciliationHtml44(rows){
 return '<details class="pitReconciliation44"><summary>Dlaczego brutto różni się od podstawy PIT?</summary>'+[true,false].map(actual=>{
 const a=employmentReconciliation44(rows,actual);
 return '<section><h3>Etat — '+(actual?'tylko wpisane':'dodatkowa prognoza')+'</h3><div class="row"><span>Brutto (szacunek)</span><b>'+PLN(a.gross)+'</b></div><div class="row"><span>− Składki społeczne pracownika</span><b>'+PLN(a.social)+'</b></div><div class="row"><span>− Koszty uzyskania przychodu</span><b>'+PLN(a.kup)+'</b></div><div class="row"><span>+ PPK pracodawcy</span><b>'+PLN(a.ppk)+'</b></div><div class="row"><span>Zaokrąglenia podstaw miesięcznych</span><b>'+(a.rounding<0?'− ':'+ ')+PLN(Math.abs(a.rounding))+'</b></div><div class="row pitReconciliationTotal44"><span>Podstawa PIT etatu</span><b>'+PLN(a.base)+'</b></div></section>';
 }).join('')+'<p class="muted">Brutto jest szacowane z wpisanego netto. To rozbicie wyjaśnia obliczenia aplikacji; dokładne kwoty rozliczenia wynikają z listy płac.</p></details>';
}
function taxOverviewHtml44(final,actual,forecast,threshold){
 const remaining=threshold-final;
 return '<div class="taxForecastHero44"><small>SUMA ROCZNA Z PROGNOZĄ — PODSTAWA PIT</small><strong>'+PLN(final)+'</strong><span>Etat + dochód firmy do PIT</span></div><div class="taxForecastParts44"><div><span>Dane wpisane</span><b>'+PLN(actual)+'</b></div><div><span>Dodatkowa prognoza</span><b>'+PLN(forecast)+'</b></div><div><span>Próg PIT</span><b>'+PLN(threshold)+'</b></div><div><span>'+(remaining>=0?'Pozostaje do progu':'Powyżej progu')+'</span><b>'+PLN(Math.abs(remaining))+'</b></div></div><div class="taxOverviewLegend44"><span><i class="total44"></i>Suma do progu</span><span><i class="employment44"></i>Etat</span><span><i class="business44"></i>Firma</span><span class="taxForecastKey44">Jasne tło — miesiące z prognozą</span></div>';
}
function chartSvg(d){
 const th=d.threshold,max=Math.max(th*1.18,...d.rows.map(r=>r.combined),1),step=niceStep(max),axis=Math.ceil(max/step)*step;
 const left=60,right=565,top=24,bottom=184,x=i=>left+i*((right-left)/11),y=v=>bottom-(N(v)/axis)*(bottom-top);
 const forecastStart=d.rows.find((r,i)=>N(r.employmentForecast)!==N(d.rows[i-1]?.employmentForecast)||N(r.businessForecast)!==N(d.rows[i-1]?.businessForecast))?.i;
 let out=forecastStart!=null?'<rect x="'+Math.max(left,x(forecastStart)-12)+'" y="'+(top-8)+'" width="'+(right-Math.max(left,x(forecastStart)-12))+'" height="'+(bottom-top+8)+'" rx="10" fill="#eff4fb"/>':'';
 out+='<rect x="'+left+'" y="'+(top-8)+'" width="'+(right-left)+'" height="'+(bottom-top+8)+'" rx="10" fill="transparent"/>';
 for(let v=0;v<=axis+.001;v+=step){
  const yy=y(v);out+='<line x1="'+left+'" y1="'+yy+'" x2="'+right+'" y2="'+yy+'" stroke="#e8edf4" stroke-width="1"/>';
  out+='<text x="'+(left-8)+'" y="'+(yy+3)+'" text-anchor="end" fill="#69778c" font-size="11" font-weight="600">'+compact(v)+'</text>';
 }
 const ty=y(th);
 const totalPts=d.rows.map(r=>x(r.i)+','+y(r.combined)).join(' ');
 const empPts=d.rows.map(r=>x(r.i)+','+y(r.employment)).join(' ');
 const bizPts=d.rows.map(r=>x(r.i)+','+y(r.business)).join(' ');
 const area=left+','+bottom+' '+totalPts+' '+right+','+bottom;
 out+='<polygon points="'+area+'" fill="#3976dc" opacity=".055"/>';
 out+='<line x1="'+left+'" y1="'+ty+'" x2="'+right+'" y2="'+ty+'" stroke="#d7838b" stroke-width="1.5"/>';
 out+='<text x="'+(right-4)+'" y="'+(ty-6)+'" text-anchor="end" fill="#c8414a" font-size="11" font-weight="700">próg '+compact(th)+'</text>';
 out+='<polyline points="'+empPts+'" fill="none" stroke="#56b68a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
 out+='<polyline points="'+bizPts+'" fill="none" stroke="#a58aca" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
 out+='<polyline points="'+totalPts+'" fill="none" stroke="#365f9b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';
 const last=d.rows.at(-1);if(last)out+='<circle cx="'+x(last.i)+'" cy="'+y(last.combined)+'" r="4.5" fill="#365f9b" stroke="#fff" stroke-width="2"/>';
 out+=SHORT.map((m,i)=>'<text x="'+x(i)+'" y="205" text-anchor="middle" fill="#6f7c91" font-size="9">'+m+'</text>').join('');
 return out;
}
function renderTax44(){
 if(typeof S==='undefined')return;
 const d=combined(S.selectedYear),svg=chartSvg(d),cross=d.rows.find(r=>r.combined>=d.threshold),last=d.rows[11]||{},final=N(last.combined),empAct=N(last.employmentActual),empFc=N(last.employmentForecast),bizAct=N(last.businessActual),bizFc=N(last.businessForecast);
 ['taxSvg','homeTaxSvg'].forEach(id=>{const e=G(id);if(e)e.innerHTML=svg});
 const msg=cross?'Łączna podstawa opodatkowania (etat + firma) może przekroczyć próg około '+FULL[cross.i]+'.':'Łączna podstawa opodatkowania nie powinna przekroczyć progu.';
 if(G('pitStatus'))G('pitStatus').textContent=msg;
 const homeSvg=G('homeTaxSvg');
 if(homeSvg){
  let panel=G('homeTaxOverview44');
  if(!panel){panel=document.createElement('div');panel.id='homeTaxOverview44';homeSvg.insertAdjacentElement('beforebegin',panel)}
  panel.innerHTML=taxOverviewHtml44(final,empAct+Math.max(0,bizAct),final-empAct-Math.max(0,bizAct),d.threshold)+employmentReconciliationHtml44(employmentRows(S.selectedYear));
 }

 if(G('cross'))G('cross').textContent=msg+' Prognoza końca roku: '+PLN(final)+'.';
 const legend=document.querySelector('#tax .chart .legend');if(legend)legend.innerHTML='<span><i style="display:inline-block;width:18px;border-top:4px solid #172238;margin-right:5px;vertical-align:middle"></i>razem do progu</span><span><i style="display:inline-block;width:18px;border-top:3px solid #38b96a;margin-right:5px;vertical-align:middle"></i>etat</span><span><i style="display:inline-block;width:18px;border-top:3px solid #9550d7;margin-right:5px;vertical-align:middle"></i>firma</span><span class="red">--- próg PIT</span><span>○ prognoza</span>'; const tax=G('tax');
 if(tax){
  let box=G('taxBusiness44');
  if(!box){box=document.createElement('div');box.id='taxBusiness44';box.className='card';tax.appendChild(box)}
  box.innerHTML='<div class="title">Podstawa do skali — etat + firma</div>'+
   '<div class="row"><span>Podstawa PIT etatu — wpisane</span><b>'+PLN(empAct)+'</b></div>'+
   '<div class="row"><span>Podstawa PIT etatu — prognoza do końca roku</span><b class="green">+ '+PLN(empFc)+'</b></div>'+
   '<div class="row"><span>Firma — wpisane</span><b>'+PLN(Math.max(0,bizAct))+'</b></div>'+
   '<div class="row"><span>Firma — prognoza</span><b>'+(bizFc>=0?'+ ':'− ')+PLN(Math.abs(bizFc))+'</b></div>'+
   '<div class="row"><span><b>Razem do progu — z prognozą</b></span><b>'+PLN(final)+'</b></div>'+
   employmentReconciliationHtml44(employmentRows(S.selectedYear))+'<p class="muted">Wykres pokazuje podstawę PIT, nie brutto ani netto na konto. Suma obejmuje podstawę etatu i dochód firmy do PIT. Jasne tło oznacza miesiące z prognozą.</p>';
 }
 const bp=G('businessPlusBody');
 if(bp){
  let box=G('businessTax44');
  if(!box){box=document.createElement('div');box.id='businessTax44';box.className='card';bp.insertBefore(box,bp.children[2]||null)}
  const remain=d.threshold-final;
  box.innerHTML='<div class="title">Próg PIT — wspólnie z etatem</div>'+
   '<div class="grid"><div class="tile"><small>ETAT WPISANE</small><b>'+PLN(empAct)+'</b></div><div class="tile"><small>ETAT PROGNOZA</small><b>'+PLN(empFc)+'</b></div><div class="tile"><small>FIRMA WPISANE</small><b>'+PLN(Math.max(0,bizAct))+'</b></div><div class="tile"><small>FIRMA PROGNOZA</small><b>'+PLN(bizFc)+'</b></div><div class="tile"><small>RAZEM Z PROGNOZĄ</small><b>'+PLN(final)+'</b></div><div class="tile"><small>'+(remain>=0?'DO PROGU':'PONAD PRÓG')+'</small><b class="'+(remain<0?'red':'')+'">'+PLN(Math.abs(remain))+'</b></div></div>';
 }
}
function renderCompanySummary44(){
 const host=G('companyMonths');if(!host||typeof S==='undefined')return;
 const y=S.selectedYear,d=combined(y),yr=S.years?.[String(y)]||{},rows=yr.company||[];
 host.innerHTML=Array.from({length:12},(_,i)=>{
  const r=rows[i]||{},s=companySummary(r),vat=R2(N(s.sales?.vat)-N(s.costs?.vat));
  return '<div class="month"><div class="mh"><b>'+FULL[i]+' '+y+'</b><span class="status '+(rowActual(r)?'actual':'')+'">'+(rowActual(r)?'wpisane':'puste')+'</span></div>'+
   '<div class="companyMonth"><div><small>Sprzedaż brutto</small><b>'+PLN(N(s.sales?.gross))+'</b></div><div><small>Sprzedaż netto</small><b>'+PLN(N(s.sales?.net))+'</b></div><div><small>VAT saldo</small><b>'+PLN(vat)+'</b></div></div>'+
   '<small>Dochód firmy do PIT: '+PLN(N(s.taxable))+' • razem do progu narastająco: '+PLN(d.rows[i]?.combined)+'</small>'+
   '<div class="actions"><button class="btn primary" onclick="show(\'businessplus\')">Edytuj w Firma+</button></div></div>';
 }).join('');
}
function apply44(){renderTax44();renderCompanySummary44()}
const oldRender=window.render;
if(typeof oldRender==='function'&&!oldRender.__tax44){
 const fn=function(){const out=oldRender();apply44();return out};fn.__tax44=true;window.render=fn;
}
const oldShow=window.show;
if(typeof oldShow==='function'&&!oldShow.__tax44){
 const fn=function(v){const out=oldShow(v);if(v==='home'||v==='tax'||v==='company'||v==='businessplus')apply44();return out};fn.__tax44=true;window.show=fn;
}
})();