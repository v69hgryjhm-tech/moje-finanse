/* Moje Finanse 3.0 — stabilny pulpit miesiąca */
(function(){
const G=id=>document.getElementById(id),N=v=>+v||0;
const PLN=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(N(v));
const FULL=['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
const key=(y,m)=>`${y}-${String(m+1).padStart(2,'0')}`;
const parse=k=>{let [y,m]=String(k).split('-').map(Number);return{y,m:m-1}};
function ensure(){S.finance||={};if(!S.finance.selectedMonth)S.finance.selectedMonth=key(S.selectedYear,new Date().getMonth())}
function salary(y,m){try{let old=S.selectedYear;S.selectedYear=y;Y();let r=sal().rows[m]||{};S.selectedYear=old;Y();return{net:N(r.total),gross:N(r.g),pe:N(r.pe),er:N(r.er),actual:!!r.actual}}catch(e){let r=S.years?.[String(y)]?.salary?.[m]||{};return{net:N(r.net)+N(r.bonus),gross:0,pe:0,er:0,actual:N(r.net)+N(r.bonus)>0}}}
function company(y,m){let r=S.years?.[String(y)]?.company?.[m]||{},rev=N(r.revenue),cost=N(r.costs),zus=N(r.zus),health=N(r.health),tax=N(r.tax),vat=(N(r.vatOut)||N(r.vatIn))?N(r.vatOut)-N(r.vatIn):N(r.vat);let actual=rev||cost||zus||health||tax||vat;return{profit:rev-cost-zus-health-tax-vat,actual:!!actual}}
function expenses(k){return (S.finance?.expenses||[]).filter(e=>e.active!==false&&(!e.from||k>=e.from)&&(!e.to||k<=e.to)).reduce((a,e)=>a+N(e.amount),0)}
function loanSpend(k){return (S.loans||[]).reduce((a,l)=>{let h=(l.history||[]).find(x=>x.month===k);if(h){let reg=typeof h.paid==='boolean'?(h.paid?N(h.regularPaid||l.payment):0):N(h.regularPaid!=null?h.regularPaid:h.paid),ex=h.isOverpayment===false?0:N(h.extra);return a+reg+ex}if(k<(l.asOfDate||'0000-00-00').slice(0,7))return a;return a+N(l.payment)+N(l.extraMonthly)},0)}
function render(){ensure();let host=G('monthlyBody');if(!host)return;let k=S.finance.selectedMonth,{y,m}=parse(k),s=salary(y,m),c=company(y,m),e=expenses(k),lo=loanSpend(k),actualIncome=(s.actual?s.net:0)+(c.actual?Math.max(0,c.profit):0),forecastIncome=(s.actual?0:s.net)+(c.actual?0:Math.max(0,c.profit)),freeActual=actualIncome-e-lo,freeForecast=actualIncome+forecastIncome-e-lo;
 host.innerHTML=`<div class="card miniNav"><button class="btn" onclick="shiftMonth30(-1)">‹</button><b>${FULL[m]} ${y}</b><button class="btn" onclick="shiftMonth30(1)">›</button></div>
 <div class="v25Kpis"><div><small>DOCHODY — FAKT</small><b class="green">${PLN(actualIncome)}</b></div><div><small>WYDATKI STAŁE</small><b>${PLN(e)}</b></div><div><small>KREDYTY</small><b>${PLN(lo)}</b></div><div><small>WOLNA GOTÓWKA — FAKT</small><b class="${freeActual<0?'red':'green'}">${PLN(freeActual)}</b></div></div>
 <div class="card"><div class="title">Przepływ pieniędzy</div><div class="v25Flow"><div><span>Etat ${s.actual?'• fakt':'• prognoza'}</span><b>${PLN(s.net)}</b></div><div><span>Firma ${c.actual?'• fakt':'• prognoza'}</span><b>${PLN(c.profit)}</b></div><div class="minus"><span>Wydatki</span><b>− ${PLN(e)}</b></div><div class="minus"><span>Raty</span><b>− ${PLN(lo)}</b></div><div class="result"><span>Zostaje — dane wpisane</span><b>${PLN(freeActual)}</b></div></div></div>
 ${forecastIncome?`<div class="card" style="border-style:dashed;opacity:.8"><div class="title">Prognoza — osobno</div><div class="row"><span>Prognozowany dodatkowy dochód</span><b>+ ${PLN(forecastIncome)}</b></div><div class="row"><span>Potencjalnie zostanie</span><b>${PLN(freeForecast)}</b></div><p class="muted">Prognoza nie jest doliczana do głównej kwoty faktycznej.</p></div>`:''}
 <div class="card"><div class="title">PPK w miesiącu</div><div class="row"><span>PPK Ty</span><b>${PLN(s.pe)}</b></div><div class="row"><span>PPK firma</span><b>${PLN(s.er)}</b></div><small class="muted">${s.actual?'Na podstawie wpisanych danych miesiąca.':'Wartości prognozowane dla niewpisanego miesiąca.'}</small></div>`;
}
window.shiftMonth30=function(d){ensure();let {y,m}=parse(S.finance.selectedMonth),x=new Date(y,m+d,1,12);S.finance.selectedMonth=key(x.getFullYear(),x.getMonth());save();render()};
window.renderMonthly30=render;
const oldShow=window.show;if(typeof oldShow==='function')window.show=function(v){oldShow(v);if(v==='monthly')setTimeout(render,0)};
setTimeout(render,150);
})();