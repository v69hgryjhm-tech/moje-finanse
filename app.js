const KEY="moje-finanse-v02";
const defaults={salary:6000,business:0,other:0,vat:0,tax:0,taxMode:"Skala podatkowa",t1:12,t2:32,tAmount:120000,loans:[
{name:"Kredyt hipoteczny",balance:320000,payment:2150,rate:7.2,months:214},
{name:"Kredyt samochodowy",balance:42000,payment:1050,rate:8.1,months:28}]};
let d=JSON.parse(localStorage.getItem(KEY)||"null")||defaults;
const $=id=>document.getElementById(id);
const fmt=n=>new Intl.NumberFormat("pl-PL",{maximumFractionDigits:0}).format(Math.round(n))+" zł";
const pct=(a,b)=>Math.round((a/(b||1))*100);
function save(){localStorage.setItem(KEY,JSON.stringify(d));render()}
function render(){
 let salary=d.salary*12,biz=d.business*12,other=d.other*12,revenue=salary+biz+other;
 let tax=d.tax*12,vat=d.vat*12,loan=d.loans.reduce((s,l)=>s+l.payment*12,0),net=Math.max(0,revenue-tax-vat-loan);
 $("revenue").textContent=fmt(revenue);$("tax").textContent=fmt(tax);$("vat").textContent=fmt(vat);$("loanCost").textContent=fmt(loan);
 $("net").textContent=fmt(net);$("monthly").textContent=fmt(net/12)+" / mies.";$("forecastValue").textContent=fmt(net);
 [["salary",salary],["business",biz],["other",other]].forEach(([k,v])=>{$(k==="other"?"otherIncome":k).textContent=fmt(v);$(k+"Pct").textContent=pct(v,revenue)+"%";$(k+"Bar").style.width=pct(v,revenue)+"%"});
 $("taxPct").textContent=pct(tax,revenue)+"%";$("vatPct").textContent=pct(vat,revenue)+"%";$("loanPct").textContent=pct(loan,revenue)+"%";$("freePct").textContent=pct(net,revenue)+"%";$("ringLabel").textContent=pct(net,revenue)+"%";
 $("taxModeLabel").textContent=d.taxMode;$("thresholdLabel").textContent=d.taxMode==="Ryczałt"?"stawka zależna od działalności":d.t1+"% / "+d.t2+"%";
 renderLoans();renderMonths();
}
function renderLoans(){
 $("loans").innerHTML=d.loans.length?d.loans.map((l,i)=>`<div class="loan"><div class="ico">🏦</div><main><b>${esc(l.name)}</b><small>Pozostało: ${fmt(l.balance)} • ${l.rate.toFixed(2)}%</small></main><aside><b>${fmt(l.payment)}</b><small>${l.months} rat</small></aside><button onclick="removeLoan(${i})">×</button></div>`).join(""):"<p class='hint'>Nie masz jeszcze dodanych kredytów.</p>";
}
function renderMonths(){
 let m=["Sty","Lut","Mar","Kwi","Maj","Cze","Lip","Sie","Wrz","Paź","Lis","Gru"],monthly=(d.salary+d.business+d.other-d.tax-d.vat-d.loans.reduce((s,l)=>s+l.payment,0));
 $("monthList").innerHTML=m.map((x,i)=>`<div class="break"><span>${x}</span><b>${fmt(monthly)}</b></div>`).join("");
}
function esc(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
$("incomeForm").onsubmit=e=>{e.preventDefault();d.salary=+$("salaryIn").value||0;d.business=+$("businessIn").value||0;d.other=+$("otherIn").value||0;d.vat=+$("vatIn").value||0;d.tax=+$("taxIn").value||0;incomeDialog.close();save()};
$("loanForm").onsubmit=e=>{e.preventDefault();d.loans.push({name:$("loanName").value,balance:+$("loanBalance").value,payment:+$("loanPayment").value,rate:+$("loanRate").value,months:+$("loanMonths").value});loanDialog.close();e.target.reset();save()};
$("taxForm").onsubmit=e=>{e.preventDefault();d.taxMode=$("taxMode").value;d.t1=+$("threshold1").value||12;d.t2=+$("threshold2").value||32;d.tAmount=+$("thresholdAmount").value||120000;taxDialog.close();save()};
window.removeLoan=i=>{if(confirm("Usunąć kredyt?")){d.loans.splice(i,1);save()}};
window.simulate=()=>{calculateSimulation();simDialog.showModal()};
window.calculateSimulation=()=>{
 let extra=+$("extra").value||0,html="";
 d.loans.forEach(l=>{
   let r=l.rate/100/12,p=l.payment+extra,b=l.balance,n=r?Math.log(p/(p-b*r))/Math.log(1+r):b/p;
   if(!isFinite(n)||n<0)n=l.months;n=Math.min(l.months,Math.ceil(n));
   let saved=l.months-n,oldInt=Math.max(0,l.payment*l.months-l.balance),newInt=Math.max(0,p*n-l.balance);
   html+=`<b>${esc(l.name)}</b><br>+${fmt(extra)}/mies. → około <b>${n} rat</b> zamiast ${l.months}<br>Około <b>${saved} rat mniej</b> • oszczędność odsetek ≈ <b>${fmt(oldInt-newInt)}</b><hr>`;
 });$("simResult").innerHTML=html||"Dodaj kredyt.";
};
window.openMonthly=()=>monthDialog.showModal();
window.openSettings=()=>taxDialog.showModal();
window.scrollToId=id=>$(id).scrollIntoView({behavior:"smooth"});
$("editIncome")?.addEventListener("click",()=>{});
function fill(){
 $("salaryIn").value=d.salary;$("businessIn").value=d.business;$("otherIn").value=d.other;$("vatIn").value=d.vat;$("taxIn").value=d.tax;
 $("taxMode").value=d.taxMode;$("threshold1").value=d.t1;$("threshold2").value=d.t2;$("thresholdAmount").value=d.tAmount;
}
document.querySelectorAll("dialog").forEach(x=>x.addEventListener("click",e=>{if(e.target===x)x.close()}));
incomeDialog.addEventListener("show",fill);taxDialog.addEventListener("show",fill);
render();
