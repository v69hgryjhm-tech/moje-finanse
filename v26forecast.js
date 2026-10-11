/* Moje Finanse 3.2 — prognoza wizualnie oddzielona od danych rzeczywistych */
(function(){
const n=v=>+v||0;
const fmt=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(n(v));
function actualLoanPaid(year){return (S.loans||[]).reduce((sum,l)=>sum+(l.history||[]).reduce((a,h)=>{if(!(h.month||'').startsWith(String(year)+'-'))return a;let reg=typeof h.paid==='boolean'?(h.paid?n(h.regularPaid||l.payment):0):n(h.regularPaid!=null?h.regularPaid:h.paid);let ex=h.isOverpayment===false?0:n(h.extra);return a+reg+ex},0),0)}
function forecastLoanLeft(year){let total=0;(S.loans||[]).forEach(l=>{for(let m=0;m<12;m++){let k=year+'-'+String(m+1).padStart(2,'0'),base=(l.asOfDate||TODAY).slice(0,7);if(k<base)continue;if((l.history||[]).some(x=>x.month===k))continue;total+=n(l.payment)+n(l.extraMonthly)}});return total}
function snapshot(){
 let p=sal(),yr=Y(),sAct=0,sFc=0,gAct=0,gFc=0,crAct=0,crFc=0,ccAct=0,ccFc=0,cvAct=0,cvFc=0,cpAct=0,cpFc=0;
 let cy=new Date().getFullYear(),cm=new Date().getMonth(),year=S.selectedYear;
 let rawCompany=yr.company||[],actualRows=[];
 let companyMonths=rawCompany.map((rr,i)=>{
  let actual=!!((rr.salesLines&&rr.salesLines.length)||(rr.costLines&&rr.costLines.length)||n(rr.revenue)||n(rr.costs)||n(rr.vat)||n(rr.vatOut)||n(rr.vatIn)||n(rr.zus)||n(rr.health)||n(rr.tax));
  let s;
  if(typeof window.mfCompanySummary44==='function')s=window.mfCompanySummary44(rr);
  else{let rev=n(rr.revenue),cost=n(rr.costs),vat=(n(rr.vatOut)||n(rr.vatIn))?n(rr.vatOut)-n(rr.vatIn):n(rr.vat),rg=n(rr.revenueGross)||rev+Math.max(0,n(rr.vatOut)),cg=n(rr.costsGross)||cost+Math.max(0,n(rr.vatIn));s={sales:{net:rev,gross:rg,vat:n(rr.vatOut)},costs:{net:cost,gross:cg,vat:n(rr.vatIn)},vatSaldo:vat,cash:rg-cg-Math.max(0,vat)-n(rr.zus)-n(rr.health)-n(rr.tax)}}
  let row={actual,cash:n(s.cash),revenue:n(s.sales?.net),costs:n(s.costs?.net),vat:n(s.vatSaldo)};
  if(actual)actualRows.push(row);
  return row
 });
 let avgCash=actualRows.length?actualRows.reduce((a,r)=>a+r.cash,0)/actualRows.length:0,avgRev=actualRows.length?actualRows.reduce((a,r)=>a+r.revenue,0)/actualRows.length:0,avgCost=actualRows.length?actualRows.reduce((a,r)=>a+r.costs,0)/actualRows.length:0,avgVat=actualRows.length?actualRows.reduce((a,r)=>a+r.vat,0)/actualRows.length:0;
 for(let i=0;i<12;i++){
  let sr=yr.salary[i]||{},sa=n(sr.net)+n(sr.bonus)>0;
  if(sa){sAct+=n(p.rows[i].total);gAct+=n(p.rows[i].g)}else{sFc+=n(p.rows[i].total);gFc+=n(p.rows[i].g)}
  let m=companyMonths[i],future=year>cy||(year===cy&&i>=cm);
  if(m.actual){crAct+=m.revenue;ccAct+=m.costs;cvAct+=m.vat;cpAct+=m.cash}
  else if(future&&actualRows.length){m.forecast=true;m.cash=avgCash;m.revenue=avgRev;m.costs=avgCost;m.vat=avgVat;crFc+=avgRev;ccFc+=avgCost;cvFc+=avgVat;cpFc+=avgCash}
 }
 let loanAct=actualLoanPaid(S.selectedYear),loanFc=forecastLoanLeft(S.selectedYear),freeAct=sAct+cpAct-loanAct,freeFc=freeAct+sFc+cpFc-loanFc;
 return{p,yr,companyMonths,sAct,sFc,gAct,gFc,crAct,crFc,ccAct,ccFc,cvAct,cvFc,cpAct,cpFc,loanAct,loanFc,freeAct,freeFc}
}
function hint(el,text){if(!el)return;let old=el.parentElement.querySelector('.forecastHint26');if(old)old.remove();let s=document.createElement('span');s.className='forecastHint26';s.textContent=text;el.insertAdjacentElement('afterend',s)}
function apply(){if(typeof S==='undefined'||!document.getElementById('home'))return;let d=snapshot(),hero=document.querySelector('#home .hero');if(hero){let lab=hero.querySelector('small');if(lab)lab.textContent='WOLNA GOTÓWKA — TYLKO DANE WPISANE';let v=document.getElementById('freeYear');if(v)v.textContent=fmt(d.freeAct);let sub=document.getElementById('avgNet');if(sub){sub.className='forecastLine26';sub.textContent='prognoza końca roku ≈ '+fmt(d.freeFc)+' • nie jest doliczana do wyniku powyżej'}}
let net=document.getElementById('netTile'),gross=document.getElementById('grossTile'),company=document.getElementById('companyTile'),loan=document.getElementById('loanTile');if(net){net.textContent=fmt(d.sAct);net.previousElementSibling.textContent='ETAT NETTO — WPISANE';hint(net,'prognoza +'+fmt(d.sFc)+' → '+fmt(d.sAct+d.sFc))}if(gross){gross.textContent=fmt(d.gAct);gross.previousElementSibling.textContent='ETAT BRUTTO — WPISANE';hint(gross,'prognoza +'+fmt(d.gFc)+' → '+fmt(d.gAct+d.gFc))}if(company){company.textContent=fmt(d.cpAct);company.previousElementSibling.textContent='FIRMA — WPISANE';hint(company,'prognoza '+(d.cpFc>=0?'+':'')+fmt(d.cpFc)+' → '+fmt(d.cpAct+d.cpFc))}if(loan){loan.textContent=fmt(d.loanAct);loan.previousElementSibling.textContent='KREDYTY — FAKTYCZNIE WPŁACONE';hint(loan,'planowane do końca roku +'+fmt(d.loanFc))}
let rev=document.getElementById('companyRevenueHome'),cost=document.getElementById('companyCostsHome'),prof=document.getElementById('companyProfitHome'),vat=document.getElementById('companyVatHome');if(rev)rev.textContent=fmt(d.crAct);if(cost)cost.textContent=fmt(d.ccAct);if(prof)prof.textContent=fmt(d.cpAct);if(vat)vat.textContent=fmt(d.cvAct);let total=document.getElementById('allIncomeTotal');if(total){total.textContent=fmt(d.sAct+d.cpAct);let row=total.closest('.row');if(row?.firstElementChild)row.firstElementChild.textContent='Łączne zarobki — tylko wpisane';hint(total,'prognoza razem '+fmt(d.sAct+d.sFc+d.cpAct+d.cpFc))}renderBars26(d);renderEarnings26(d)}
function renderBars26(d){let h=document.getElementById('homeBars');if(!h)return;let vals=[['BRUTTO',d.gAct,d.gFc,'barGross'],['NETTO',d.sAct,d.sFc,'barNet'],['FIRMA',Math.max(0,d.cpAct),Math.max(0,d.cpFc),'barCompany'],['KREDYTY',d.loanAct,d.loanFc,'barLoans']],mx=Math.max(1,...vals.map(x=>x[1]+x[2]));h.innerHTML=vals.map(x=>{let ah=Math.max(x[1]?4:0,x[1]/mx*140),fh=Math.max(x[2]?3:0,x[2]/mx*140);return `<div class="kpiCol kpi26"><div class="kpiBarStack26"><div class="kpiForecast26 ${x[3]}" style="height:${fh}px"></div><div class="kpiActual26 ${x[3]}" style="height:${ah}px"></div></div><b>${fmt(x[1])}</b><small>${x[0]}</small><span>prognoza +${fmt(x[2])}</span></div>`}).join('')}
function nice26(max,target=4){let raw=Math.max(1,max)/target,p=Math.pow(10,Math.floor(Math.log10(raw))),q=raw/p,m=q<=1?1:q<=2?2:q<=2.5?2.5:q<=5?5:10;return m*p}
function compact26(v){v=n(v);if(v>=1000)return (v/1000).toLocaleString('pl-PL',{maximumFractionDigits:1})+' tys.';return Math.round(v)+' zł'}
function renderEarnings26(d){
 let h=document.getElementById('earningsChart');if(!h)return;
 let rows=d.p.rows.map((r,i)=>{let cm=d.companyMonths?.[i]||{},salary=Math.max(0,n(r.total)),company=n(cm.cash);return{salary,company,sa:!!r.actual,ca:!!cm.actual,cf:!!cm.forecast}});
 let max=Math.max(1,...rows.map(r=>r.salary+Math.max(0,r.company))),step=nice26(max),axis=Math.ceil(max/step)*step;
 let W=720,H=245,left=54,right=12,top=18,bottom=190,plotW=W-left-right,slot=plotW/12,barW=Math.min(32,slot*.62),y=v=>bottom-(v/axis)*(bottom-top);
 let svg='';
 for(let v=0;v<=axis+.001;v+=step){let yy=y(v);svg+='<line x1="'+left+'" y1="'+yy+'" x2="'+(W-right)+'" y2="'+yy+'" stroke="#e4e9f0" stroke-width="1" stroke-dasharray="'+(v?'3 5':'0')+'"/><text x="'+(left-7)+'" y="'+(yy+3)+'" text-anchor="end" fill="#7d899d" font-size="9">'+compact26(v)+'</text>'}
 rows.forEach((r,i)=>{
  let x=left+slot*i+slot/2,hs=(r.salary/axis)*(bottom-top),hc=(Math.max(0,r.company)/axis)*(bottom-top),ys=bottom-hs,yc=ys-hc,sc=r.sa?'#38b96a':'#b9dfc8',cc=r.ca?'#965bd6':'#d9c6ef';
  if(hs>0)svg+='<rect x="'+(x-barW/2)+'" y="'+ys+'" width="'+barW+'" height="'+Math.max(2,hs)+'" rx="4" fill="'+sc+'" '+(r.sa?'':'stroke="#7fb995" stroke-dasharray="3 2"')+'/>';
  if(hc>0)svg+='<rect x="'+(x-barW/2)+'" y="'+yc+'" width="'+barW+'" height="'+Math.max(2,hc)+'" rx="4" fill="'+cc+'" '+(r.ca?'':'stroke="#aa8bc9" stroke-dasharray="3 2"')+'/>';
  if(r.company<0)svg+='<text x="'+x+'" y="'+(bottom+12)+'" text-anchor="middle" fill="#d4474f" font-size="8">−'+compact26(Math.abs(r.company))+'</text>';
  svg+='<text x="'+x+'" y="211" text-anchor="middle" fill="#73819a" font-size="9">'+M[i]+'</text>';
  if(!r.sa||r.cf)svg+='<text x="'+x+'" y="225" text-anchor="middle" fill="#8a96a8" font-size="7">prog.</text>';
 });
 h.innerHTML='<svg viewBox="0 0 '+W+' '+H+'" width="100%" preserveAspectRatio="xMidYMid meet">'+svg+'</svg>';
 let lg=h.parentElement.querySelector('.legend');if(lg)lg.innerHTML='<span><i class="dot greenDot"></i> etat — wpisane</span><span><i style="display:inline-block;width:10px;height:10px;background:#b9dfc8;border:1px dashed #7fb995;border-radius:3px"></i> etat — prognoza</span><span><i style="display:inline-block;width:10px;height:10px;background:#965bd6;border-radius:3px"></i> firma — wpisane</span><span><i style="display:inline-block;width:10px;height:10px;background:#d9c6ef;border:1px dashed #aa8bc9;border-radius:3px"></i> firma — prognoza</span>'
}
const oldRender=window.render;if(typeof oldRender==='function'){window.render=function(){oldRender();apply()}}

})();