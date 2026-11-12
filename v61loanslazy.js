/* Moje Finanse 5.8.4 — lekkie kredyty / lazy rendering */
(function(){
'use strict';
const G=id=>document.getElementById(id),N=v=>+v||0;
const PLN=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN'}).format(N(v));
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function parseDate61(s){let d=new Date(String(s||'').length===7?String(s)+'-01':s);return isNaN(d)?new Date():d}
function actualStats61(l){
 let balance=N(l.balance),last=parseDate61(l.asOfDate),paid=0,extraPaid=0,interestPaid=0,principalPaid=0;
 let hist=[...(l.history||[])].sort((a,b)=>(a.paymentDate||a.month||'').localeCompare(b.paymentDate||b.month||''));
 for(const h of hist){
  let d=parseDate61(h.paymentDate||((h.month||'')+'-'+String(l.dueDay||1).padStart(2,'0')));if(d<last)continue;
  let days=Math.max(0,Math.round((d-last)/86400000)),interest=l.loanType==='zero'?0:balance*(N(l.rate)/100)/365*days,reg=h.paid?N(h.regularPaid):0,ex=h.isOverpayment?N(h.extra):0;
  let toInterest=Math.min(reg,interest),principal=Math.max(0,reg-toInterest),unpaid=Math.max(0,interest-toInterest);
  balance=Math.max(0,balance-principal-ex+unpaid);if(h.balanceAfter!=null)balance=Math.max(0,N(h.balanceAfter));
  paid+=reg+ex;extraPaid+=ex;interestPaid+=toInterest;principalPaid+=principal+ex;last=d
 }
 return{balance,date:last,paid,extra:extraPaid,interest:interestPaid,principal:principalPaid}
}
function point(l){try{return window.loanCurrentPoint15?.(l)||{balance:N(l.balance),date:parseDate61(l.asOfDate)}}catch{return{balance:N(l.balance),date:parseDate61(l.asOfDate)}}}
function totals(l){try{return window.loanTotals15?.(l)||actualStats61(l)}catch{return actualStats61(l)}}
function timeline(l,plan=true){try{return window.loanTimeline15?.(l,plan)}catch{return null}}
function isOpen(i){return !!S.loans?.[i]?.uiOpen61}
function summary61(l,i){
 const q=point(l),tot=totals(l),bal=N(q?.balance??l.balance),orig=Math.max(N(l.originalBalance),bal,1),pc=Math.max(0,Math.min(100,(orig-bal)/orig*100));
 return '<div class="card loan loanSummary61" id="loanLazy61_'+i+'"><div class="loanTitle"><div><small>'+(l.loanType==='zero'?'RATY 0%':'KREDYT OPROCENTOWANY')+'</small><h3>'+esc(l.name||'Kredyt')+'</h3></div><div class="loanTitleActions"><button class="btn editLoan47" onclick="editLoanModal47('+i+')">✎ Edytuj</button><button class="btn collapseBtn" onclick="toggleLoanLazy61('+i+')">Rozwiń ▾</button><button class="btn danger" onclick="delLoan('+i+')">Usuń</button></div></div><div class="loanKpis loanKpisCompact61"><div class="loanKpi"><small>AKTUALNE SALDO</small><b>'+PLN(bal)+'</b></div><div class="loanKpi"><small>RATA UMOWNA</small><b>'+PLN(l.payment)+'</b></div><div class="loanKpi"><small>WPŁACONO</small><b>'+PLN(tot?.paid)+'</b></div><div class="loanKpi"><small>OPROCENTOWANIE</small><b>'+N(l.rate).toFixed(2)+'%</b></div></div><div class="loanProgress"><div><span>Postęp spłaty</span><b>'+pc.toFixed(1)+'%</b></div><div class="progress"><i style="width:'+pc+'%"></i></div></div></div>'
}
function renderLoanCardLazy61(i){
 const host=G('loanLazy61_'+i);if(!host||!S.loans?.[i])return;
 if(!isOpen(i)){host.outerHTML=summary61(S.loans[i],i);return}
 const total=S.loans.reduce((a,l)=>a+N(l.payment),0),html=window.renderLoanCard17?.(S.loans[i],i,total);
 if(!html){host.innerHTML='<div class="notice">Nie udało się wyrenderować szczegółów kredytu.</div>';return}
 host.outerHTML=html;
 const cards=[...document.querySelectorAll('#loanList .loan')],card=cards.find((x,idx)=>idx===i);
 if(card){
   card.id='loanLazy61_'+i;
   let btn=card.querySelector('.collapseBtn');
   if(!btn){
     let title=card.querySelector('.loanTitle'),actions=title?.querySelector('.loanTitleActions');
     if(!actions&&title){actions=document.createElement('div');actions.className='loanTitleActions';title.appendChild(actions)}
     if(actions){btn=document.createElement('button');btn.className='btn collapseBtn';actions.prepend(btn)}
   }
   if(btn){btn.textContent='Zwiń ▴';btn.onclick=()=>toggleLoanLazy61(i)}
   if(actions&&!actions.querySelector('.editLoan47')){let eb=document.createElement('button');eb.className='btn editLoan47';eb.type='button';eb.textContent='✎ Edytuj';eb.onclick=()=>window.editLoanModal47?.(i);actions.insertBefore(eb,actions.querySelector('.danger')||null)}
   let inline=card.querySelector('.loanEdit');if(inline)inline.style.display='none'
 }
}
window.renderLoanCardLazy61=renderLoanCardLazy61;
window.toggleLoanLazy61=function(i){
 let l=S.loans?.[i];if(!l)return;
 l.uiOpen61=!l.uiOpen61;save();
 requestAnimationFrame(()=>renderLoanCardLazy61(i))
};
function loanDate61(v){let d=v instanceof Date?new Date(v):parseDate61(v);return isNaN(d)?new Date():d}
function monthEnd61(base,add){let d=new Date(base.getFullYear(),base.getMonth()+add+1,0);d.setHours(23,59,59,999);return d}
function overviewSeries61(){
 const now=new Date(),months=Array.from({length:12},(_,i)=>monthEnd61(now,i));
 return months.map(d=>({d,balance:S.loans.reduce((sum,l)=>{
   let rows=timeline(l,true)?.rows||timeline(l,true)||[];
   rows=Array.isArray(rows)?rows:[];
   let prev=rows.filter(r=>loanDate61(r.date||r.paymentDate||r.month)<=d).at(-1);
   return sum+N(prev?.balance??point(l)?.balance??l.balance)
 },0)}))
}
function chart61(data){
 const w=720,h=190,left=48,right=700,top=24,bottom=145,max=Math.max(1,...data.map(x=>x.balance)),min=Math.min(...data.map(x=>x.balance)),span=Math.max(1,max-min),x=i=>left+i*((right-left)/(data.length-1||1)),y=v=>top+(1-(v-min)/span)*(bottom-top);
 const pts=data.map((r,i)=>x(i)+','+y(r.balance)).join(' ');
 const area=left+','+bottom+' '+pts+' '+right+','+bottom;
 const labels=data.map((r,i)=>i%2===0||i===data.length-1?'<text x="'+x(i)+'" y="171" text-anchor="middle" fill="#73819a" font-size="9">'+r.d.toLocaleDateString('pl-PL',{month:'short',year:'2-digit'})+'</text>':'').join('');
 const end=data.at(-1);
 return '<svg viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none"><line x1="'+left+'" y1="'+bottom+'" x2="'+right+'" y2="'+bottom+'" stroke="#dfe5ec"/><polygon points="'+area+'" fill="#38b96a" opacity=".08"/><polyline points="'+pts+'" fill="none" stroke="#38b96a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="'+x(data.length-1)+'" cy="'+y(end.balance)+'" r="5" fill="#38b96a" stroke="#fff" stroke-width="2"/>'+labels+'</svg>'
}
function nearestPayments61(){
 const now=new Date();now.setHours(0,0,0,0);let rows=[];
 S.loans.forEach(l=>{
   let t=timeline(l,true),arr=t?.rows||t||[];if(!Array.isArray(arr))return;
   arr.filter(r=>loanDate61(r.date||r.paymentDate||r.month)>=now).slice(0,3).forEach(r=>rows.push({name:l.name||'Kredyt',date:loanDate61(r.date||r.paymentDate||r.month),amount:N(r.planned??r.payment??r.regular??l.payment)}))
 });
 return rows.sort((a,b)=>a.date-b.date).slice(0,5)
}
function renderOverviewLite61(){
 let host=G('loanList'),old=G('loanOverview');if(old)old.remove();if(!host||!S.loans?.length)return;
 const totalBal=S.loans.reduce((a,l)=>a+N(point(l)?.balance??l.balance),0),payments=S.loans.reduce((a,l)=>a+N(l.payment),0),paid=S.loans.reduce((a,l)=>a+N(totals(l)?.paid),0),series=overviewSeries61(),nearest=nearestPayments61();
 let box=document.createElement('div');box.id='loanOverview';box.className='card loanOverviewLite61';
 box.innerHTML='<div class="title">Kredyty — szybki podgląd <span class="pill">lekki widok</span></div>'+
 '<div class="loanOverviewKpis"><div><small>ŁĄCZNE SALDO</small><b>'+PLN(totalBal)+'</b></div><div><small>RATY / MIES.</small><b>'+PLN(payments)+'</b></div><div><small>WPŁACONO</small><b>'+PLN(paid)+'</b></div><div><small>LICZBA KREDYTÓW</small><b>'+S.loans.length+'</b></div></div>'+
 '<div class="loanOverviewSplit61"><section class="loanOverviewPanel61"><div class="loanOverviewHead61"><div><b>Saldo kredytów w czasie</b><small>prognoza najbliższych 12 miesięcy</small></div></div><div class="loanOverviewChart61">'+chart61(series)+'</div></section>'+
 '<section class="loanOverviewPanel61"><div class="loanOverviewHead61"><div><b>Najbliższe raty</b><small>co, gdzie i kiedy</small></div></div><div class="loanNext61">'+(nearest.length?nearest.map(r=>'<div><span><b>'+esc(r.name)+'</b><small>'+r.date.toLocaleDateString('pl-PL',{day:'2-digit',month:'short',year:'numeric'})+'</small></span><strong>'+PLN(r.amount)+'</strong></div>').join(''):'<p class="muted">Brak przyszłych rat w harmonogramie.</p>')+'</div></section></div>';
 host.parentNode.insertBefore(box,host)
}
function renderLoansLazy61(){
 const host=G('loanList');if(!host)return;
 renderOverviewLite61();
 host.innerHTML=(S.loans||[]).map((l,i)=>isOpen(i)?'<div class="card loan loanLoading61" id="loanLazy61_'+i+'"><b>'+esc(l.name||'Kredyt')+'</b><small>Ładowanie szczegółów…</small></div>':summary61(l,i)).join('');
 (S.loans||[]).forEach((l,i)=>{if(isOpen(i))requestAnimationFrame(()=>renderLoanCardLazy61(i))})
}
window.renderLoansLazy61=renderLoansLazy61;
window.loans=renderLoansLazy61;
let st=document.createElement('style');st.textContent='.loanSummary61{padding:14px}.loanKpisCompact61{grid-template-columns:repeat(4,minmax(0,1fr));margin-top:10px}.loanLoading61{padding:18px}.loanLoading61 small{display:block;margin-top:4px;color:var(--muted)}.loanOverviewLite61{margin-bottom:12px}.loanOverviewSplit61{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(280px,.75fr);gap:12px;margin-top:12px}.loanOverviewPanel61{border:1px solid var(--line);border-radius:14px;padding:12px;background:#fff}.loanOverviewHead61 b,.loanOverviewHead61 small{display:block}.loanOverviewHead61 small{margin-top:3px;color:var(--muted);font-size:9px}.loanOverviewChart61{margin-top:6px;overflow:hidden}.loanOverviewChart61 svg{display:block;width:100%;height:185px}.loanNext61{margin-top:6px}.loanNext61>div{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)}.loanNext61>div:last-child{border-bottom:0}.loanNext61 span b,.loanNext61 span small{display:block}.loanNext61 span small{margin-top:2px;color:var(--muted);font-size:9px}.loanNext61 strong{white-space:nowrap}.loanNext61 .muted{margin:10px 0 0}.loanScheduleClosed17{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:13px;border:1px solid var(--line);border-radius:12px;background:#f7f9fc}.loanScheduleClosed17 b,.loanScheduleClosed17 small{display:block}.loanDatesSplit62{grid-template-columns:1fr 1fr 1fr 1fr}.loanScheduleClosed17 small{margin-top:3px;color:var(--muted);font-size:9px}@media(max-width:760px){.loanOverviewSplit61{grid-template-columns:1fr}.loanOverviewChart61 svg{height:165px}.loanKpisCompact61{grid-template-columns:1fr 1fr}.loanDatesSplit62{grid-template-columns:1fr 1fr}.loanScheduleClosed17{align-items:flex-start;flex-direction:column}}';document.head.appendChild(st);
})();