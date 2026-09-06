/* Moje Finanse 2.7.1 — PPK procentowo dla każdego miesiąca */
(function(){
const G=id=>document.getElementById(id),num=v=>+v||0;
const money=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(num(v));
const nullable=v=>v==null||v===''?null:+v;

function fg27(g,y,empPct=null,erPct=null){
  g=num(g);
  let ep=empPct==null?num(S.settings.ppkEmp):Math.max(0,num(empPct)),
      rp=erPct==null?num(S.settings.ppkEr):Math.max(0,num(erPct)),
      social=g*.1371,
      health=(g-social)*.09,
      pe=g*ep/100,
      er=g*rp/100,
      base=Math.max(0,g-social-num(S.settings.kup)+er),
      pit=Math.max(0,tax(y+base)-tax(y));
  return{g,net:Math.max(0,g-social-health-pit-pe),base,pe,er,ppkEmpPct:ep,ppkErPct:rp};
}
function fn27(net,y,empPct=null,erPct=null){
  net=num(net);if(!net)return fg27(0,y,empPct,erPct);
  let lo=0,hi=net*2.7+4000;
  for(let i=0;i<55;i++){let mid=(lo+hi)/2;fg27(mid,y,empPct,erPct).net<net?lo=mid:hi=mid}
  return fg27((lo+hi)/2,y,empPct,erPct);
}
function sal27(){
  let cumulative=0;
  let rows=Y().salary.map((r,i)=>{
    let actual=num(r.net)+num(r.bonus)>0;
    let total=actual?num(r.net)+num(r.bonus):avg(hist('salary','',S.selectedYear,i));
    let empPct=r.ppkEmployeePct!=null?nullable(r.ppkEmployeePct):null;
    let erPct=r.ppkEmployerPct!=null?nullable(r.ppkEmployerPct):null;
    let p=fn27(total,cumulative,empPct,erPct);cumulative+=p.base;
    return{...p,total,n:actual?num(r.net):total,b:actual?num(r.bonus):0,actual,y:cumulative};
  });
  let actualRows=rows.filter(x=>x.actual);
  return{rows,avg:avg(actualRows.map(x=>x.total)),count:actualRows.length,last:Math.max(-1,...rows.map((r,i)=>r.actual?i:-1))};
}

function months27(p){
  let a=Y().salary,root=G('months');if(!root)return;
  root.innerHTML=p.rows.map((r,i)=>{
    let m=a[i],locked=m.locked;
    let empPct=m.ppkEmployeePct==null?num(S.settings.ppkEmp):num(m.ppkEmployeePct),
        erPct=m.ppkEmployerPct==null?num(S.settings.ppkEr):num(m.ppkEmployerPct);
    return `<div class="month ppkMonth27"><div class="mh"><b>${M[i]} ${S.selectedYear}</b><div><span class="status ${r.actual?'actual':''}">${r.actual?'wpisana':'prognoza'}</span> <button class="lock" onclick="toggleS(${i})">${locked?'🔒 Edytuj':'🔓 Zablokuj'}</button></div></div><div class="fields ppkFields27"><label>NETTO<input id="n${i}" type="number" step="0.01" value="${r.actual?num(m.net):Math.round(r.n*100)/100}" ${locked?'readonly':''}></label><label>Premia NETTO<input id="b${i}" type="number" step="0.01" value="${r.actual?num(m.bonus):0}" ${locked?'readonly':''}></label><label>PPK Ty %<input id="ppe${i}" type="number" step="0.1" min="0" max="10" value="${empPct}" ${locked?'readonly':''}></label><label>PPK firma %<input id="ppr${i}" type="number" step="0.1" min="0" max="10" value="${erPct}" ${locked?'readonly':''}></label><label>BRUTTO est.<input readonly value="${r.g.toFixed(2)}"></label></div><div class="ppkApplied27"><span>PPK w tym miesiącu</span><b>Ty ${r.ppkEmpPct.toFixed(2)}% = ${money(r.pe)} • firma ${r.ppkErPct.toFixed(2)}% = ${money(r.er)}</b></div><small>Procent jest przypisany tylko do tego miesiąca • PIT narastająco ${F(r.y)}</small>${locked?'':`<div class="actions"><button class="btn primary" onclick="saveS(${i})">Zapisz miesiąc</button></div>`}</div>`;
  }).join('');
  let card=root.closest('.card');
  if(card&&!card.querySelector('.ppkInfo27')){
    let info=document.createElement('div');info.className='ppkInfo27';info.innerHTML='<b>PPK ustawiasz procentowo dla każdego miesiąca.</b><span>Nie musisz liczyć kwot ręcznie. Wpisujesz np. 2% dla siebie i 1,5% dla pracodawcy, a aplikacja sama wylicza kwoty z estymowanego brutto. Każdy miesiąc może mieć inne procenty.</span>';root.before(info);
  }
}

window.fg=fg27;window.fn=fn27;window.sal=sal27;window.months=months27;
window.saveS=function(i){
  let r=Y().salary[i];
  r.net=G('n'+i).value===''?null:+G('n'+i).value;
  r.bonus=G('b'+i).value===''?null:+G('b'+i).value;
  r.ppkEmployeePct=nullable(G('ppe'+i).value);
  r.ppkEmployerPct=nullable(G('ppr'+i).value);
  delete r.ppkEmployee;delete r.ppkEmployer;
  r.locked=true;save();render();
};

function relabelSettings(){
  let e=G('ppkEmp'),r=G('ppkEr');
  if(e&&e.closest('label'))e.closest('label').childNodes[0].textContent='PPK domyślnie — pracownik %';
  if(r&&r.closest('label'))r.closest('label').childNodes[0].textContent='PPK domyślnie — pracodawca %';
}
function setVersion(){let h=document.querySelector('.top small');if(h)h.innerHTML=`<span id="headerYear">${S.selectedYear}</span> • wersja 2.7.1`;document.title='Moje Finanse 2.7.1'}
function apply27(){try{months27(sal27());relabelSettings();setVersion()}catch(e){console.error('PPK miesięczne 2.7.1',e)}}
const prev=window.render;if(typeof prev==='function')window.render=function(){prev();apply27()};
setTimeout(apply27,180);
})();