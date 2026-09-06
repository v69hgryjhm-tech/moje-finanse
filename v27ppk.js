/* Moje Finanse 2.9 — Etat: fakty, prognoza i miesięczne PPK procentowo */
(function(){
const G=id=>document.getElementById(id),num=v=>+v||0;
const money=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(num(v));
const nullable=v=>v==null||v===''?null:+v;
const legacyEmp=()=>S.settings?.ppkEmp!=null?Math.max(0,num(S.settings.ppkEmp)):2;
const legacyEr=()=>S.settings?.ppkEr!=null?Math.max(0,num(S.settings.ppkEr)):1.5;
function pctFor(row,key,def){return row&&row[key]!=null?Math.max(0,num(row[key])):def}
function fg29(g,y,empPct=legacyEmp(),erPct=legacyEr()){
  g=num(g);let ep=Math.max(0,num(empPct)),rp=Math.max(0,num(erPct)),social=g*.1371,health=(g-social)*.09,pe=g*ep/100,er=g*rp/100,base=Math.max(0,g-social-num(S.settings.kup)+er),pit=Math.max(0,tax(y+base)-tax(y));
  return{g,net:Math.max(0,g-social-health-pit-pe),base,pe,er,ppkEmpPct:ep,ppkErPct:rp};
}
function fn29(net,y,empPct=legacyEmp(),erPct=legacyEr()){
  net=num(net);if(!net)return fg29(0,y,empPct,erPct);let lo=0,hi=net*2.7+4000;
  for(let i=0;i<55;i++){let mid=(lo+hi)/2;fg29(mid,y,empPct,erPct).net<net?lo=mid:hi=mid}
  return fg29((lo+hi)/2,y,empPct,erPct);
}
function sal29(){
  let cumulative=0,lastEmp=legacyEmp(),lastEr=legacyEr();
  let rows=Y().salary.map((r,i)=>{
    let actual=num(r.net)+num(r.bonus)>0,total=actual?num(r.net)+num(r.bonus):avg(hist('salary','',S.selectedYear,i));
    let emp=pctFor(r,'ppkEmployeePct',lastEmp),er=pctFor(r,'ppkEmployerPct',lastEr);
    if(actual){lastEmp=emp;lastEr=er}
    let p=fn29(total,cumulative,emp,er);cumulative+=p.base;
    return{...p,total,n:actual?num(r.net):total,b:actual?num(r.bonus):0,actual,y:cumulative,i};
  });
  let actualRows=rows.filter(x=>x.actual);
  return{rows,avg:avg(actualRows.map(x=>x.total)),count:actualRows.length,last:Math.max(-1,...rows.map((r,i)=>r.actual?i:-1))};
}
function totals(rows,actual){return rows.filter(r=>r.actual===actual).reduce((a,r)=>{a.net+=num(r.total);a.gross+=num(r.g);a.pe+=num(r.pe);a.er+=num(r.er);return a},{net:0,gross:0,pe:0,er:0})}
function employerCost(r){let acc=num(S.finance?.employerAccidentPct||1.67)/100;return num(r.g)*(1+.0976+.065+acc+.0245+.001)+num(r.er)}
function renderSummary29(p){
  let sec=G('salary');if(!sec)return;let old=G('salarySummary28');if(!old){old=document.createElement('div');old.id='salarySummary28';G('months')?.closest('.card')?.before(old)}
  let act=totals(p.rows,true),fc=totals(p.rows,false),costAct=p.rows.filter(r=>r.actual).reduce((a,r)=>a+employerCost(r),0),lastActual=p.rows.filter(r=>r.actual).at(-1),pitBase=lastActual?num(lastActual.y):0;
  old.innerHTML=`<div class="card salaryTop28"><div class="salaryTopHead28"><div><small>ETAT — DANE RZECZYWISTE ${S.selectedYear}</small><h2>${money(act.net)}</h2><span>netto faktycznie wpisane</span></div><span class="factBadge28">FAKT</span></div><div class="salaryKpis28"><div><small>BRUTTO EST.</small><b>${money(act.gross)}</b></div><div><small>PPK TY</small><b>${money(act.pe)}</b></div><div><small>PPK FIRMA</small><b>${money(act.er)}</b></div><div><small>KOSZT PRACODAWCY</small><b>${money(costAct)}</b></div><div><small>PODSTAWA PIT NARASTAJĄCO</small><b>${money(pitBase)}</b></div></div><div class="forecastStrip28"><span>PROGNOZA DO KOŃCA ROKU</span><b>netto +${money(fc.net)} • brutto +${money(fc.gross)} • PPK Ty +${money(fc.pe)} • PPK firma +${money(fc.er)}</b><small>Prognoza jest oddzielona i nie zwiększa liczb rzeczywistych powyżej.</small></div></div>`;
}
function months29(p){
  let a=Y().salary,root=G('months');if(!root)return;
  root.innerHTML=p.rows.map((r,i)=>{let m=a[i],locked=m.locked,emp=pctFor(m,'ppkEmployeePct',r.ppkEmpPct),er=pctFor(m,'ppkEmployerPct',r.ppkErPct),cls=r.actual?'actualMonth28':'forecastMonth28';
    return `<div class="month ppkMonth27 ${cls}"><div class="mh"><b>${M[i]} ${S.selectedYear}</b><div><span class="status ${r.actual?'actual':''}">${r.actual?'wpisana':'PROGNOZA'}</span> <button class="lock" onclick="toggleS(${i})">${locked?'🔒 Edytuj':'🔓 Zablokuj'}</button></div></div><div class="fields ppkFields27"><label>NETTO<input id="n${i}" type="number" step="0.01" value="${r.actual?num(m.net):Math.round(r.n*100)/100}" ${locked?'readonly':''}></label><label>Premia NETTO<input id="b${i}" type="number" step="0.01" value="${r.actual?num(m.bonus):0}" ${locked?'readonly':''}></label><label>PPK Ty %<input id="ppe${i}" type="number" step="0.1" min="0" max="10" value="${emp}" ${locked?'readonly':''}></label><label>PPK firma %<input id="ppr${i}" type="number" step="0.1" min="0" max="10" value="${er}" ${locked?'readonly':''}></label><label>BRUTTO est.<input readonly value="${r.g.toFixed(2)}"></label></div><div class="ppkApplied27"><span>${r.actual?'PPK w tym miesiącu':'PPK użyte w prognozie'}</span><b>Ty ${r.ppkEmpPct.toFixed(2)}% = ${money(r.pe)} • firma ${r.ppkErPct.toFixed(2)}% = ${money(r.er)}</b></div><small>${r.actual?'Dane rzeczywiste':'Prognoza — poza sumą faktyczną'} • PIT narastająco ${money(r.y)}</small>${locked?'':`<div class="actions"><button class="btn primary" onclick="saveS(${i})">Zapisz miesiąc</button></div>`}</div>`}).join('');
  let card=root.closest('.card'),info=card?.querySelector('.ppkInfo27');if(!info&&card){info=document.createElement('div');info.className='ppkInfo27';root.before(info)}
  if(info)info.innerHTML='<b>Wpisujesz netto, premię i procenty PPK dla konkretnego miesiąca.</b><span>Kwoty PPK, brutto i PIT liczą się automatycznie. Dotychczasowy globalny procent służy tylko jako wartość startowa dla miesięcy, które nie mają jeszcze własnego ustawienia.</span>';
}
function renderPpk29(p){
  let sec=G('salary');if(!sec)return;let box=G('ppkYear28');if(!box){box=document.createElement('div');box.id='ppkYear28';G('months')?.closest('.card')?.after(box)}
  let act=totals(p.rows,true),fc=totals(p.rows,false),allMax=Math.max(1,...p.rows.map(r=>num(r.pe)+num(r.er)));
  box.innerHTML=`<div class="card"><div class="title">PPK narastająco <span class="pill">fakt vs prognoza</span></div><div class="salaryKpis28"><div><small>WPŁACONO — TY</small><b>${money(act.pe)}</b></div><div><small>WPŁACONO — FIRMA</small><b>${money(act.er)}</b></div><div><small>RAZEM RZECZYWISTE</small><b class="green">${money(act.pe+act.er)}</b></div><div><small>PROGNOZA DALSZYCH WPŁAT</small><b>${money(fc.pe+fc.er)}</b></div></div><div class="ppkBars28">${p.rows.map(r=>`<div class="${r.actual?'':'forecast'}"><i style="height:${Math.max(3,(num(r.pe)+num(r.er))/allMax*80)}px"></i><small>${M[r.i]}</small></div>`).join('')}</div><div class="legend"><span>pełne = rzeczywiste</span><span>przerywane = prognoza</span></div></div>`;
}
function cleanSettings29(){['ppkEmp','ppkEr'].forEach(id=>{let l=G(id)?.closest('label');if(l)l.style.display='none'});let card=G('threshold')?.closest('.card');if(card){let t=card.querySelector('.title');if(t)t.textContent='Etat / podatki'}}
window.fg=fg29;window.fn=fn29;window.sal=sal29;window.months=months29;
window.saveS=function(i){let r=Y().salary[i];r.net=G('n'+i).value===''?null:+G('n'+i).value;r.bonus=G('b'+i).value===''?null:+G('b'+i).value;r.ppkEmployeePct=nullable(G('ppe'+i).value);r.ppkEmployerPct=nullable(G('ppr'+i).value);delete r.ppkEmployee;delete r.ppkEmployer;r.locked=true;save();render()};
function apply29(){try{let p=sal29();renderSummary29(p);months29(p);renderPpk29(p);cleanSettings29()}catch(e){console.error('Etat 2.9',e)}}
const prev=window.render;if(typeof prev==='function')window.render=function(){prev();apply29()};
setTimeout(apply29,220);
})();