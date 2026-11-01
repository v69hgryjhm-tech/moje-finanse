/* Moje Finanse 5.8.1 — okres pracy vs miesiąc wypłaty */
(function(){
'use strict';
const N=v=>+v||0;
function key(y,m){let d=new Date(y,m,1,12);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
function parse(k){let [y,m]=String(k||'').split('-').map(Number);return{y:y||new Date().getFullYear(),m:Math.max(0,(m||1)-1)}}
function payKey(y,i){return key(y,i)}
function defaultWorkKey(y,i){return key(y,i-1)}
function workKeyForRow(y,i,row){return row?.workMonth||defaultWorkKey(y,i)}
function ensureAll(){
 if(typeof S==='undefined')return;
 Object.keys(S.years||{}).forEach(yy=>{
  const y=+yy,rows=S.years[yy]?.salary||[];
  rows.forEach((r,i)=>{if(r&&r.workMonth==null)r.workMonth=defaultWorkKey(y,i)})
 })
}
function findPaymentForWork(workKey){
 const out=[];
 Object.keys(S.years||{}).sort().forEach(yy=>{
  const y=+yy,rows=S.years[yy]?.salary||[];
  rows.forEach((r,i)=>{if(workKeyForRow(y,i,r)===workKey)out.push({paymentKey:payKey(y,i),workKey,row:r,y,i})})
 });
 return out
}
function salaryResultForPayment(paymentKey){
 const {y,m}=parse(paymentKey),old=S.selectedYear;
 try{S.selectedYear=y;window.mfTaxSync41?.(y);Y();return window.sal?.().rows?.[m]||null}
 catch{return null}
 finally{S.selectedYear=old;window.mfTaxSync41?.(old)}
}
function salaryForWork(workKey){
 const hits=findPaymentForWork(workKey);
 if(!hits.length)return null;
 const x=hits[hits.length-1],result=salaryResultForPayment(x.paymentKey);
 return{...x,result}
}
function actualWorkYear(y){
 let rows=[];
 for(let m=0;m<12;m++){
  let wk=key(y,m),x=salaryForWork(wk);
  rows.push({workKey:wk,paymentKey:x?.paymentKey||key(y,m+1),row:x?.row||null,result:x?.result||null,actual:!!x?.result?.actual,total:N(x?.result?.total)})
 }
 return rows
}
function workSummary(y){
 const rows=actualWorkYear(y),actual=rows.filter(x=>x.actual);
 return{rows,actual,total:actual.reduce((a,x)=>a+N(x.total),0),count:actual.length,avg:actual.length?actual.reduce((a,x)=>a+N(x.total),0)/actual.length:0}
}
function label(k){let {y,m}=parse(k);return ['styczeń','luty','marzec','kwiecień','maj','czerwiec','lipiec','sierpień','wrzesień','październik','listopad','grudzień'][m]+' '+y}
function decorateSalaryCards(){
 if(typeof S==='undefined')return;
 const y=S.selectedYear,rows=S.years?.[String(y)]?.salary||[],cards=[...document.querySelectorAll('#months .month')];
 cards.forEach((card,i)=>{
  let r=rows[i]||{},wk=workKeyForRow(y,i,r),head=card.querySelector('.mh b');
  if(head)head.innerHTML='<span>Wypłata: '+label(payKey(y,i))+'</span><small class="salaryPeriod61">za pracę: '+label(wk)+'</small>';
  let fields=card.querySelector('.fields');if(fields&&!card.querySelector('.workMonthField61')){
   let l=document.createElement('label');l.className='workMonthField61';l.innerHTML='WYNAGRODZENIE ZA MIESIĄC<input id="workMonth61_'+i+'" type="month" value="'+wk+'" '+(r.locked?'readonly':'')+'>';
   fields.prepend(l)
  } else {
   let inp=card.querySelector('#workMonth61_'+i);if(inp){inp.value=wk;inp.readOnly=!!r.locked}
  }
 })
}
window.saveSalaryWorkMonth61=function(i){
 const r=Y().salary[i],v=document.getElementById('workMonth61_'+i)?.value;
 if(v&&/^\d{4}-(0[1-9]|1[0-2])$/.test(v))r.workMonth=v;
 save();window.renderSalaryLocal37?.()
};
function attachSave(){
 const old=window.saveS;if(typeof old==='function'&&!old.__workMonth61){
  const fn=function(i){let r=Y().salary[i],v=document.getElementById('workMonth61_'+i)?.value;if(v)r.workMonth=v;return old(i)};
  fn.__workMonth61=true;window.saveS=fn
 }
}
function renderWorkSummary61(){
 const sec=document.getElementById('salary');if(!sec)return;
 let box=document.getElementById('workSummary61');if(!box){box=document.createElement('div');box.id='workSummary61';let anchor=document.getElementById('salarySummary28');anchor?.insertAdjacentElement('afterend',box)}
 if(!box)return;
 let x=workSummary(S.selectedYear),last=x.actual.at(-1);
 box.innerHTML='<div class="card"><div class="title">Etat — miesiące pracy <span class="pill">oddzielone od daty wypłaty</span></div><div class="grid"><div class="tile"><small>ZAROBIONE ZA '+S.selectedYear+'</small><b>'+new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN'}).format(x.total)+'</b></div><div class="tile"><small>MIESIĄCE Z DANYMI</small><b>'+x.count+'/12</b></div><div class="tile"><small>ŚREDNIA ZA MIESIĄC PRACY</small><b>'+new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN'}).format(x.avg)+'</b></div><div class="tile"><small>OSTATNI ROZLICZONY OKRES PRACY</small><b>'+(last?label(last.workKey):'—')+'</b><span>'+(last?'wypłata '+label(last.paymentKey):'')+'</span></div></div><p class="muted">Cashflow i PIT liczą miesiąc faktycznej wypłaty. Ten panel pokazuje, za jaki miesiąc pracy wynagrodzenie zostało wypracowane.</p></div>'
}
function refresh(){ensureAll();attachSave();decorateSalaryCards();renderWorkSummary61()}
window.mfSalaryPeriod61={payKey,defaultWorkKey,workKeyForRow,salaryForWork,actualWorkYear,workSummary,label,refresh};
window.renderSalaryPeriod61=refresh;
window.addEventListener('finance-modules-ready',()=>{ensureAll();attachSave()},{once:true});
let st=document.createElement('style');st.textContent='.salaryPeriod61{display:block;margin-top:2px;font-size:10px;color:#7a8799;font-weight:500}.workMonthField61{background:#f2f7ff;border-radius:9px;padding:6px}.workMonthField61 input{font-weight:700}';document.head.appendChild(st);
})();