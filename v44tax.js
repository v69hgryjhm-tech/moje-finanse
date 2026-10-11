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
 const year=S.years?.[String(y)]||{},company=year.company||[],emp=employmentRows(y),fc=companyForecast(y);
 const actualZus=company.filter(rowActual).map(r=>N(r.zus)),avgZus=actualZus.length?actualZus.reduce((a,b)=>a+b,0)/actualZus.length:0;
 let businessCum=0,lastActual=-1,rows=[];
 for(let i=0;i<12;i++){
  const r=company[i]||{},actual=rowActual(r);
  let monthTaxable;
  if(actual){monthTaxable=companySummary(r).taxable;lastActual=Math.max(lastActual,i)}
  else monthTaxable=R2(N(fc[i]?.revenue)-N(fc[i]?.costs)-avgZus);
  businessCum=R2(businessCum+monthTaxable);
  const employment=N(emp[i]?.y);
  const business=Math.max(0,businessCum);
  rows.push({i,employment,business,combined:R2(employment+business),salaryActual:!!emp[i]?.actual,companyActual:actual,monthBusiness:monthTaxable});
 }
 return{rows,threshold:N(S.settings?.threshold)||120000,lastActual};
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
function chartSvg(d){
 const th=d.threshold,max=Math.max(th*1.15,...d.rows.map(r=>r.combined),1),step=niceStep(max),axis=Math.ceil(max/step)*step;
 const left=48,right=570,top=24,bottom=190,x=i=>left+i*((right-left)/11),y=v=>bottom-(N(v)/axis)*(bottom-top);
 let out='';
 for(let v=0;v<=axis+.001;v+=step){
  const yy=y(v);out+='<line x1="'+left+'" y1="'+yy+'" x2="'+right+'" y2="'+yy+'" stroke="#e4e9f0" stroke-width="1" stroke-dasharray="'+(v?'3 5':'0')+'"/>';
  out+='<text x="'+(left-7)+'" y="'+(yy+3)+'" text-anchor="end" fill="#7d899d" font-size="8.5">'+compact(v)+'</text>';
 }
 const ty=y(th),pts=d.rows.map(r=>x(r.i)+','+y(r.combined)).join(' ');
 out+='<line x1="'+left+'" y1="'+ty+'" x2="'+right+'" y2="'+ty+'" stroke="#df5963" stroke-width="2" stroke-dasharray="6 5"/>';
 out+='<polyline points="'+pts+'" fill="none" stroke="#3976dc" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>';
 out+=SHORT.map((m,i)=>'<text x="'+x(i)+'" y="208" text-anchor="middle" fill="#7d899d" font-size="9">'+m+'</text>').join('');
 return out;
}
function renderTax44(){
 if(typeof S==='undefined')return;
 const d=combined(S.selectedYear),svg=chartSvg(d),cross=d.rows.find(r=>r.combined>=d.threshold),final=d.rows[11]?.combined||0,emp=d.rows[11]?.employment||0,biz=d.rows[11]?.business||0;
 ['taxSvg','homeTaxSvg'].forEach(id=>{const e=G(id);if(e)e.innerHTML=svg});
 const msg=cross?'Łączna podstawa skali (etat + firma) może przekroczyć próg około '+FULL[cross.i]+'.':'Łączna podstawa skali nie powinna przekroczyć progu.';
 if(G('pitStatus'))G('pitStatus').textContent=msg;
 if(G('cross'))G('cross').textContent=msg+' Prognoza końca roku: '+PLN(final)+'.';
 const tax=G('tax');
 if(tax){
  let box=G('taxBusiness44');
  if(!box){box=document.createElement('div');box.id='taxBusiness44';box.className='card';tax.appendChild(box)}
  box.innerHTML='<div class="title">Podstawa do skali — etat + firma</div>'+
   '<div class="row"><span>Etat — podstawa opodatkowania</span><b>'+PLN(emp)+'</b></div>'+
   '<div class="row"><span>Firma — dochód do skali</span><b>'+PLN(biz)+'</b></div>'+
   '<div class="row"><span><b>Razem do progu</b></span><b>'+PLN(final)+'</b></div>'+
   '<p class="muted">Faktury wpisujesz w Firma+ brutto, ale VAT nie jest dochodem do PIT. Dla działalności na skali model liczy: sprzedaż netto − koszty netto − wpisane składki społeczne. Zdrowotna nie obniża podstawy skali.</p>';
 }
 const bp=G('businessPlusBody');
 if(bp){
  let box=G('businessTax44');
  if(!box){box=document.createElement('div');box.id='businessTax44';box.className='card';bp.insertBefore(box,bp.children[2]||null)}
  const remain=d.threshold-final;
  box.innerHTML='<div class="title">Próg PIT — wspólnie z etatem</div>'+
   '<div class="grid"><div class="tile"><small>ETAT DO SKALI</small><b>'+PLN(emp)+'</b></div><div class="tile"><small>FIRMA DO SKALI</small><b>'+PLN(biz)+'</b></div><div class="tile"><small>RAZEM</small><b>'+PLN(final)+'</b></div><div class="tile"><small>'+(remain>=0?'DO PROGU':'PONAD PRÓG')+'</small><b class="'+(remain<0?'red':'')+'">'+PLN(Math.abs(remain))+'</b></div></div>';
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