/* Moje Finanse 3.5 — Etat: wyliczenia zgodne z listą płac, PPK miesięczne, zaokrąglenia ZUS/PIT */
(function(){
const G=id=>document.getElementById(id),num=v=>+v||0;
const money=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(num(v));
const nullable=v=>v==null||v===''?null:+v;
const r2=v=>Math.round((num(v)+Number.EPSILON)*100)/100;
const rpln=v=>Math.round(num(v));
const legacyEmp=()=>S.settings?.ppkEmp!=null?Math.max(0,num(S.settings.ppkEmp)):2;
const legacyEr=()=>S.settings?.ppkEr!=null?Math.max(0,num(S.settings.ppkEr)):1.5;
function pctFor(row,key,def){return row&&row[key]!=null?Math.max(0,num(row[key])):def}
function rawTax(base){let t=num(S.settings.threshold)||120000;return base<=t?base*.12:t*.12+(base-t)*.32}
function pitAdvance(prevBase,monthBase,monthIndex){
  let annualReduction=Math.max(0,num(S.settings.reduction));
  let monthlyReduction=annualReduction/12;
  let prevDue=rpln(Math.max(0,rawTax(prevBase)-monthlyReduction*monthIndex));
  let currDue=rpln(Math.max(0,rawTax(prevBase+monthBase)-monthlyReduction*(monthIndex+1)));
  return Math.max(0,currDue-prevDue);
}
function fg35(g,prevBase,empPct=legacyEmp(),erPct=legacyEr(),monthIndex=0){
  g=r2(g);
  let ep=Math.max(0,num(empPct)),rp=Math.max(0,num(erPct));
  // Składki pracownika są liczone i zaokrąglane osobno jak na liście płac.
  let pension=r2(g*.0976),disability=r2(g*.015),sickness=r2(g*.0245);
  let social=r2(pension+disability+sickness);
  let healthBase=r2(g-social);
  let health=r2(healthBase*.09);
  let pe=r2(g*ep/100);
  let er=r2(g*rp/100);
  // Wpłata pracodawcy do PPK jest przychodem podatkowym, ale nie zwiększa brutto do ZUS.
  let kup=Math.max(0,num(S.settings.kup));
  let base=rpln(Math.max(0,g-social-kup+er));
  let pit=pitAdvance(Math.max(0,num(prevBase)),base,monthIndex);
  let netBeforePpk=r2(Math.max(0,g-social-health-pit));
  let net=r2(Math.max(0,netBeforePpk-pe));
  return{g,net,netBeforePpk,base,pe,er,pit,ppkEmpPct:ep,ppkErPct:rp,pension,disability,sickness,social,healthBase,health,kup};
}
function fn35(net,prevBase,empPct=legacyEmp(),erPct=legacyEr(),monthIndex=0){
  net=r2(net);
  if(!net)return fg35(0,prevBase,empPct,erPct,monthIndex);
  let lo=0,hi=net*2.8+5000,best=null;
  for(let i=0;i<70;i++){
    let mid=(lo+hi)/2,p=fg35(mid,prevBase,empPct,erPct,monthIndex);
    if(!best||Math.abs(p.net-net)<Math.abs(best.net-net))best=p;
    p.net<net?lo=mid:hi=mid;
  }
  // Po zaokrągleniach listy płac kilka sąsiednich wartości brutto może dawać to samo netto.
  // Sprawdzamy centy wokół wyniku i wybieramy najbliższe netto.
  let center=r2((lo+hi)/2);
  for(let c=-8;c<=8;c++){
    let p=fg35(center+c/100,prevBase,empPct,erPct,monthIndex);
    if(!best||Math.abs(p.net-net)<Math.abs(best.net-net)||(Math.abs(p.net-net)===Math.abs(best.net-net)&&Math.abs(p.g-center)<Math.abs(best.g-center)))best=p;
    if(p.net===net){best=p;break}
  }
  return best||fg35(center,prevBase,empPct,erPct,monthIndex);
}
function sal35(){
  let cumulativeBase=0,lastEmp=legacyEmp(),lastEr=legacyEr();
  let rows=Y().salary.map((r,i)=>{
    let actual=num(r.net)+num(r.bonus)>0;
    let total=actual?r2(num(r.net)+num(r.bonus)):r2(avg(hist('salary','',S.selectedYear,i)));
    let emp=pctFor(r,'ppkEmployeePct',lastEmp),er=pctFor(r,'ppkEmployerPct',lastEr);
    if(actual){lastEmp=emp;lastEr=er}
    let p=fn35(total,cumulativeBase,emp,er,i);
    cumulativeBase+=p.base;
    return{...p,total,n:actual?num(r.net):total,b:actual?num(r.bonus):0,actual,y:cumulativeBase,i};
  });
  let actualRows=rows.filter(x=>x.actual);
  return{rows,avg:avg(actualRows.map(x=>x.total)),count:actualRows.length,last:Math.max(-1,...rows.map((r,i)=>r.actual?i:-1))};
}
function totals(rows,actual){return rows.filter(r=>r.actual===actual).reduce((a,r)=>{a.net+=num(r.total);a.gross+=num(r.g);a.pe+=num(r.pe);a.er+=num(r.er);a.pit+=num(r.pit);return a},{net:0,gross:0,pe:0,er:0,pit:0})}
function employerCost(r){let acc=num(S.finance?.employerAccidentPct||1.67)/100;return num(r.g)*(1+.0976+.065+acc+.0245+.001)+num(r.er)}
function renderSummary35(p){
  let sec=G('salary');if(!sec)return;let old=G('salarySummary28');if(!old){old=document.createElement('div');old.id='salarySummary28';G('months')?.closest('.card')?.before(old)}
  let act=totals(p.rows,true),fc=totals(p.rows,false),costAct=p.rows.filter(r=>r.actual).reduce((a,r)=>a+employerCost(r),0),lastActual=p.rows.filter(r=>r.actual).at(-1),pitBase=lastActual?num(lastActual.y):0;
  old.innerHTML=`<div class="card salaryTop28"><div class="salaryTopHead28"><div><small>ETAT — DANE RZECZYWISTE ${S.selectedYear}</small><h2>${money(act.net)}</h2><span>netto faktycznie otrzymane na konto, już po potrąceniu PPK</span></div><span class="factBadge28">FAKT</span></div><div class="salaryKpis28"><div><small>BRUTTO EST.</small><b>${money(act.gross)}</b></div><div><small>PPK TY</small><b>${money(act.pe)}</b></div><div><small>PPK FIRMA</small><b>${money(act.er)}</b></div><div><small>PIT EST.</small><b>${money(act.pit)}</b></div><div><small>KOSZT PRACODAWCY</small><b>${money(costAct)}</b></div><div><small>PODSTAWA PIT NARASTAJĄCO</small><b>${money(pitBase)}</b></div></div><div class="forecastStrip28"><span>PROGNOZA DO KOŃCA ROKU</span><b>netto +${money(fc.net)} • brutto +${money(fc.gross)} • PPK Ty +${money(fc.pe)} • PPK firma +${money(fc.er)}</b><small>Prognoza jest oddzielona i nie zwiększa liczb rzeczywistych powyżej.</small></div></div>`;
}
function months35(p){
  let a=Y().salary,root=G('months');if(!root)return;
  root.innerHTML=p.rows.map((r,i)=>{let m=a[i],locked=m.locked,emp=pctFor(m,'ppkEmployeePct',r.ppkEmpPct),er=pctFor(m,'ppkEmployerPct',r.ppkErPct),cls=r.actual?'actualMonth28':'forecastMonth28';
    return `<div class="month ppkMonth27 ${cls}"><div class="mh"><b>${M[i]} ${S.selectedYear}</b><div><span class="status ${r.actual?'actual':''}">${r.actual?'wpisana':'PROGNOZA'}</span> <button class="lock" onclick="toggleS(${i})">${locked?'🔒 Edytuj':'🔓 Zablokuj'}</button></div></div><div class="fields ppkFields27"><label>NETTO NA KONTO (po PPK)<input id="n${i}" type="number" step="0.01" value="${r.actual?num(m.net):r.n.toFixed(2)}" ${locked?'readonly':''}></label><label>Premia NETTO<input id="b${i}" type="number" step="0.01" value="${r.actual?num(m.bonus):0}" ${locked?'readonly':''}></label><label>PPK Ty %<input id="ppe${i}" type="number" step="0.1" min="0" max="10" value="${emp}" ${locked?'readonly':''}></label><label>PPK firma %<input id="ppr${i}" type="number" step="0.1" min="0" max="10" value="${er}" ${locked?'readonly':''}></label><label>BRUTTO est.<input readonly value="${r.g.toFixed(2)}"></label></div><div class="ppkApplied27"><span>${r.actual?'Rozliczenie miesiąca':'PPK użyte w prognozie'}</span><b>Netto przed PPK ${money(r.netBeforePpk)} − PPK Ty ${money(r.pe)} = na konto ${money(r.net)}</b><small>ZUS ${money(r.social)} • zdrowotna ${money(r.health)} • PIT ${money(r.pit)} • PPK firma ${r.ppkErPct.toFixed(2)}% = ${money(r.er)}</small></div><small>${r.actual?'Dane rzeczywiste':'Prognoza — poza sumą faktyczną'} • podstawa PIT miesiąca ${money(r.base)} • narastająco ${money(r.y)} • KUP ${money(r.kup)}</small>${locked?'':`<div class="actions"><button class="btn primary" onclick="saveS(${i})">Zapisz miesiąc</button></div>`}</div>`}).join('');
  let card=root.closest('.card'),info=card?.querySelector('.ppkInfo27');if(!info&&card){info=document.createElement('div');info.className='ppkInfo27';root.before(info)}
  if(info)info.innerHTML='<b>NETTO oznacza kwotę, która faktycznie wpłynęła na konto — już po potrąceniu PPK pracownika.</b><span>Wyliczenie brutto uwzględnia osobne zaokrąglenia składek ZUS do groszy, zdrowotnej do groszy, podstawy PIT do pełnych złotych i zaliczki PIT do pełnych złotych — tak jak na liście płac.</span>';
}
function renderPpk35(p){
  let sec=G('salary');if(!sec)return;let box=G('ppkYear28');if(!box){box=document.createElement('div');box.id='ppkYear28';G('months')?.closest('.card')?.after(box)}
  let act=totals(p.rows,true),fc=totals(p.rows,false),allMax=Math.max(1,...p.rows.map(r=>num(r.pe)+num(r.er)));
  box.innerHTML=`<div class="card"><div class="title">PPK narastająco <span class="pill">fakt vs prognoza</span></div><div class="salaryKpis28"><div><small>WPŁACONO — TY</small><b>${money(act.pe)}</b></div><div><small>WPŁACONO — FIRMA</small><b>${money(act.er)}</b></div><div><small>RAZEM RZECZYWISTE</small><b class="green">${money(act.pe+act.er)}</b></div><div><small>PROGNOZA DALSZYCH WPŁAT</small><b>${money(fc.pe+fc.er)}</b></div></div><div class="ppkBars28">${p.rows.map(r=>`<div class="${r.actual?'':'forecast'}"><i style="height:${Math.max(3,(num(r.pe)+num(r.er))/allMax*80)}px"></i><small>${M[r.i]}</small></div>`).join('')}</div><div class="legend"><span>pełne = rzeczywiste</span><span>przerywane = prognoza</span></div></div>`;
}
function cleanSettings35(){['ppkEmp','ppkEr'].forEach(id=>{let l=G(id)?.closest('label');if(l)l.style.display='none'});let card=G('threshold')?.closest('.card');if(card){let t=card.querySelector('.title');if(t)t.textContent='Etat / podatki'}}
function ensurePayrollProfile35(){
  S.finance||={};
  if(!S.finance.payrollProfile202607){
    // Na dostarczonej liście płac KUP wynosi 300 zł. Jeśli aplikacja nadal miała stary domyślny 250 zł, korygujemy profil.
    if(num(S.settings?.kup)===250)S.settings.kup=300;
    S.finance.payrollProfile202607=true;
    if(typeof save==='function')save();
  }
}
window.fg=fg35;window.fn=fn35;window.sal=sal35;window.months=months35;
window.saveS=function(i){let r=Y().salary[i];r.net=G('n'+i).value===''?null:+G('n'+i).value;r.bonus=G('b'+i).value===''?null:+G('b'+i).value;r.ppkEmployeePct=nullable(G('ppe'+i).value);r.ppkEmployerPct=nullable(G('ppr'+i).value);delete r.ppkEmployee;delete r.ppkEmployer;r.locked=true;save();render()};
function apply35(){try{ensurePayrollProfile35();let p=sal35();renderSummary35(p);months35(p);renderPpk35(p);cleanSettings35()}catch(e){console.error('Etat 3.5',e)}}
const prev=window.render;if(typeof prev==='function')window.render=function(){prev();apply35()};
setTimeout(apply35,220);
})();