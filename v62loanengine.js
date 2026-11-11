/* Moje Finanse 5.8.5 — poprawny silnik rat i nadpłat */
(function(){
'use strict';
const DAY=86400000,N=v=>+v||0;
function parseDate(s){let d=new Date((s||TODAY)+'T12:00:00');return isNaN(d)?new Date(TODAY+'T12:00:00'):d}
function iso(d){return d.toISOString().slice(0,10)}
function ym(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
function dueDate(y,m,day){let last=new Date(y,m+1,0).getDate();return new Date(y,m,Math.min(Math.max(1,N(day)||1),last),12)}
function dueIso(month,day){let [y,m]=String(month).split('-').map(Number);return iso(dueDate(y,m-1,day))}
function days(a,b){return Math.max(0,Math.round((b-a)/DAY))}
function firstDue(l){let b=parseDate(l.asOfDate),d=dueDate(b.getFullYear(),b.getMonth(),l.dueDay||b.getDate());if(d<=b)d=dueDate(b.getFullYear(),b.getMonth()+1,l.dueDay||b.getDate());return d}
function paymentFor(balance,rate,months){if(months<=0)return balance;let r=N(rate)/1200;if(!r)return balance/months;return balance*r/(1-Math.pow(1+r,-months))}
function remainingMonths(l,b){if(N(l.months)>0)return Math.max(1,N(l.months));if(l.loanType==='zero')return Math.max(1,Math.ceil(b/Math.max(1,N(l.payment))));let r=N(l.rate)/1200,p=N(l.payment),n=0;if(p<=b*r)return 600;while(b>.01&&n<600){b=Math.max(0,b-(p-b*r));n++}return Math.max(1,n)}
function normalizeHistory62(l){
 let changed=false;
 l.history=Array.isArray(l.history)?l.history:[];
 l.history=l.history.map(h=>{
  let month=h.month||String(h.paymentDate||TODAY).slice(0,7),paid=typeof h.paid==='boolean'?h.paid:N(h.regularPaid||h.paid)>0,over=typeof h.isOverpayment==='boolean'?h.isOverpayment:N(h.extra)>0;
  let regularPaymentDate=h.regularPaymentDate||(paid?(over?dueIso(month,l.dueDay):h.paymentDate||dueIso(month,l.dueDay)):'');
  let extraPaymentDate=h.extraPaymentDate||(over?(h.paymentDate||TODAY):'');
  if(h.regularPaymentDate!==regularPaymentDate||h.extraPaymentDate!==extraPaymentDate)changed=true;
  return{...h,month,paid,regularPaid:N(h.regularPaid!=null?h.regularPaid:(paid?l.payment:0)),isOverpayment:over,extra:N(h.extra),regularPaymentDate,extraPaymentDate,paymentDate:h.paymentDate||(over?extraPaymentDate:regularPaymentDate),balanceAfter:h.balanceAfter===''||h.balanceAfter==null?null:N(h.balanceAfter)}
 });
 if(changed)try{save()}catch{}
}
function timeline62(l,plan){
 normalizeHistory62(l);
 let balance=N(l.balance),base=parseDate(l.asOfDate),last=base,accrued=0,rows=[],remaining=remainingMonths(l,balance);
 let paidMonths=new Set();
 const events=[];
 (l.history||[]).forEach((h,hi)=>{
  if(h.isOverpayment&&N(h.extra)>0)events.push({type:'extra',date:parseDate(h.extraPaymentDate||h.paymentDate),month:h.month,amount:N(h.extra),h,hi});
  if(h.paid&&N(h.regularPaid)>0){events.push({type:'regular',date:parseDate(h.regularPaymentDate||dueIso(h.month,l.dueDay)),month:h.month,amount:N(h.regularPaid),h,hi});paidMonths.add(h.month)}
 });
 events.sort((a,b)=>a.date-b.date||(a.type==='regular'?1:-1));
 events.forEach((e,idx)=>{
  if(e.date<base)return;
  let dd=days(last,e.date),accr=l.loanType==='zero'?0:balance*(N(l.rate)/100)/365*dd;accrued+=accr;
  let interestPaid=0,principal=0,extra=0;
  if(e.type==='regular'){
    interestPaid=Math.min(e.amount,accrued);accrued=Math.max(0,accrued-interestPaid);
    principal=Math.min(balance,Math.max(0,e.amount-interestPaid));balance=Math.max(0,balance-principal);remaining=Math.max(0,remaining-1)
  }else{extra=Math.min(balance,e.amount);balance=Math.max(0,balance-extra)}
  let sameHistFuture=events.slice(idx+1).some(x=>x.h===e.h);
  if(!sameHistFuture&&e.h.balanceAfter!=null)balance=Math.max(0,N(e.h.balanceAfter));
  rows.push({month:e.month||ym(e.date),date:new Date(e.date),kind:'actual',eventType:e.type,planned:N(l.payment),paid:e.type==='regular',regularPaid:e.type==='regular'?e.amount:0,extra,interest:interestPaid,interestAccrued:accr,principal,balance,days:dd});
  last=new Date(e.date)
 });
 let d=firstDue(l),guard=0;
 while(paidMonths.has(ym(d))&&guard++<600)d=dueDate(d.getFullYear(),d.getMonth()+1,l.dueDay);
 let oneOff=false,regular=N(l.payment),futureGuard=0;
 while(balance>.01&&futureGuard<600){
  if(d<last){d=dueDate(d.getFullYear(),d.getMonth()+1,l.dueDay);futureGuard++;continue}
  if(l.overpayMode==='reduce_payment'&&remaining>0)regular=paymentFor(balance,N(l.rate),remaining);
  let dd=days(last,d),accr=l.loanType==='zero'?0:balance*(N(l.rate)/100)/365*dd;accrued+=accr;
  let planned=Math.min(balance+accrued,regular||N(l.payment)),interestPaid=Math.min(planned,accrued);accrued=Math.max(0,accrued-interestPaid);
  let principal=Math.min(balance,Math.max(0,planned-interestPaid));balance=Math.max(0,balance-principal);
  let extra=plan?Math.max(0,N(l.extraMonthly)):0;if(plan&&!oneOff&&N(l.oneOff)>0){extra+=N(l.oneOff);oneOff=true}
  extra=Math.min(balance,extra);balance=Math.max(0,balance-extra);
  rows.push({month:ym(d),date:new Date(d),kind:'forecast',eventType:'regular',planned,paid:false,regularPaid:0,extra,interest:interestPaid,interestAccrued:accr,principal,balance,days:dd});
  remaining=Math.max(0,remaining-1);last=new Date(d);d=dueDate(d.getFullYear(),d.getMonth()+1,l.dueDay);futureGuard++
 }
 return{rows,actual:rows.filter(r=>r.kind==='actual'),forecast:rows.filter(r=>r.kind==='forecast')}
}
function currentPoint62(l){let a=timeline62(l,false).actual;return a.length?{balance:a.at(-1).balance,date:a.at(-1).date}:{balance:N(l.balance),date:parseDate(l.asOfDate)}}
function totals62(l){let a=timeline62(l,false).actual;return{paid:a.reduce((s,r)=>s+N(r.regularPaid)+N(r.extra),0),extra:a.reduce((s,r)=>s+N(r.extra),0),interest:a.reduce((s,r)=>s+N(r.interest),0),principal:a.reduce((s,r)=>s+N(r.principal)+N(r.extra),0)}}
function G(id){return document.getElementById(id)}
window.ledgerToggle=function(i,month){
 let l=S.loans[i],paid=G('paid_'+i+'_'+month)?.checked,over=G('over_'+i+'_'+month)?.checked,rd=G('rdate_'+i+'_'+month),ed=G('edate_'+i+'_'+month),pr=G('preg_'+i+'_'+month),px=G('pex_'+i+'_'+month);
 if(rd)rd.disabled=!paid;if(ed)ed.disabled=!over;if(pr){pr.disabled=!paid;if(paid&&!N(pr.value))pr.value=l.payment}if(px){px.disabled=!over;if(!over)px.value=0}
 if(over&&ed&&!ed.value)ed.value=TODAY;if(paid&&rd&&!rd.value)rd.value=dueIso(month,l.dueDay);
 window.ledgerSave(i,month)
};
window.ledgerSave=function(i,month){
 let l=S.loans[i],paid=!!G('paid_'+i+'_'+month)?.checked,over=!!G('over_'+i+'_'+month)?.checked,reg=paid?N(G('preg_'+i+'_'+month)?.value):0,extra=over?N(G('pex_'+i+'_'+month)?.value):0;
 let regularPaymentDate=paid?(G('rdate_'+i+'_'+month)?.value||dueIso(month,l.dueDay)):'',extraPaymentDate=over?(G('edate_'+i+'_'+month)?.value||TODAY):'';
 let ix=(l.history||[]).findIndex(h=>h.month===month);
 if(!paid&&!over){if(ix>=0)l.history.splice(ix,1)}
 else{
  let old=ix>=0?l.history[ix]:{},h={...old,month,paid,regularPaid:reg,isOverpayment:over,extra,regularPaymentDate,extraPaymentDate,paymentDate:over?extraPaymentDate:regularPaymentDate,balanceAfter:null};
  if(ix>=0)l.history[ix]=h;else l.history.push(h);l.history.sort((a,b)=>a.month.localeCompare(b.month))
 }
 save();window.renderLoanCardLazy61?.(i)
};
(S.loans||[]).forEach(normalizeHistory62);
window.loanTimeline15=timeline62;window.loanCurrentPoint15=currentPoint62;window.loanTotals15=totals62;window.mfLoanEngine62={timeline:timeline62,currentPoint:currentPoint62,totals:totals62,normalize:normalizeHistory62,dueIso};
})();