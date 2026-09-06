/* Moje Finanse 2.7 — PPK przypisane do konkretnego miesiąca */
(function(){
const G=id=>document.getElementById(id),num=v=>+v||0;
const money=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(num(v));
const nullable=v=>v==null||v===''?null:+v;

function fg27(g,y,empOverride=null,erOverride=null){
  g=num(g);
  let social=g*.1371,
      health=(g-social)*.09,
      pe=empOverride==null?g*num(S.settings.ppkEmp)/100:Math.max(0,num(empOverride)),
      er=erOverride==null?g*num(S.settings.ppkEr)/100:Math.max(0,num(erOverride)),
      base=Math.max(0,g-social-num(S.settings.kup)+er),
      pit=Math.max(0,tax(y+base)-tax(y));
  return{g,net:Math.max(0,g-social-health-pit-pe),base,pe,er};
}
function fn27(net,y,empOverride=null,erOverride=null){
  net=num(net);if(!net)return fg27(0,y,empOverride,erOverride);
  let lo=0,hi=net*2.7+4000;
  for(let i=0;i<55;i++){let mid=(lo+hi)/2;fg27(mid,y,empOverride,erOverride).net<net?lo=mid:hi=mid}
  return fg27((lo+hi)/2,y,empOverride,erOverride);
}
function sal27(){
  let cumulative=0;
  let rows=Y().salary.map((r,i)=>{
    let actual=num(r.net)+num(r.bonus)>0;
    let total=actual?num(r.net)+num(r.bonus):avg(hist('salary','',S.selectedYear,i));
    let emp=actual&&r.ppkEmployee!=null?nullable(r.ppkEmployee):null;
    let er=actual&&r.ppkEmployer!=null?nullable(r.ppkEmployer):null;
    let p=fn27(total,cumulative,emp,er);cumulative+=p.base;
    return{...p,total,n:actual?num(r.net):total,b:actual?num(r.bonus):0,actual,y:cumulative,ppkEmployeeEntered:emp,ppkEmployerEntered:er};
  });
  let actualRows=rows.filter(x=>x.actual);
  return{rows,avg:avg(actualRows.map(x=>x.total)),count:actualRows.length,last:Math.max(-1,...rows.map((r,i)=>r.actual?i:-1))};
}

function months27(p){
  let a=Y().salary,root=G('months');if(!root)return;
  root.innerHTML=p.rows.map((r,i)=>{
    let m=a[i],locked=m.locked;
    let emp=m.ppkEmployee==null?'':m.ppkEmployee,er=m.ppkEmployer==null?'':m.ppkEmployer;
    return `<div class="month ppkMonth27"><div class="mh"><b>${M[i]} ${S.selectedYear}</b><div><span class="status ${r.actual?'actual':''}">${r.actual?'wpisana':'prognoza'}</span> <button class="lock" onclick="toggleS(${i})">${locked?'🔒 Edytuj':'🔓 Zablokuj'}</button></div></div><div class="fields ppkFields27"><label>NETTO<input id="n${i}" type="number" step="0.01" value="${r.actual?num(m.net):Math.round(r.n*100)/100}" ${locked?'readonly':''}></label><label>Premia NETTO<input id="b${i}" type="number" step="0.01" value="${r.actual?num(m.bonus):0}" ${locked?'readonly':''}></label><label>PPK Ty — kwota<input id="ppe${i}" type="number" step="0.01" min="0" value="${emp}" placeholder="auto ${r.pe.toFixed(2)}" ${locked?'readonly':''}></label><label>PPK firma — kwota<input id="ppr${i}" type="number" step="0.01" min="0" value="${er}" placeholder="auto ${r.er.toFixed(2)}" ${locked?'readonly':''}></label><label>BRUTTO est.<input readonly value="${r.g.toFixed(2)}"></label></div><div class="ppkApplied27"><span>PPK zastosowane w tym miesiącu</span><b>Ty ${money(r.pe)} • firma ${money(r.er)}</b></div><small>PPK jest liczone dla tego miesiąca osobno • PIT narastająco ${F(r.y)}</small>${locked?'':`<div class="actions"><button class="btn primary" onclick="saveS(${i})">Zapisz miesiąc</button></div>`}</div>`;
  }).join('');
  let card=root.closest('.card');
  if(card&&!card.querySelector('.ppkInfo27')){
    let info=document.createElement('div');info.className='ppkInfo27';info.innerHTML='<b>PPK jest teraz miesięczne.</b><span>W każdym miesiącu możesz wpisać rzeczywistą kwotę PPK pracownika i pracodawcy. Puste pole oznacza wyliczenie według domyślnych procentów tylko dla tego miesiąca / prognozy.</span>';root.before(info);
  }
}

window.fg=fg27;window.fn=fn27;window.sal=sal27;window.months=months27;
window.saveS=function(i){
  let a=Y().salary,r=a[i];
  r.net=G('n'+i).value===''?null:+G('n'+i).value;
  r.bonus=G('b'+i).value===''?null:+G('b'+i).value;
  r.ppkEmployee=nullable(G('ppe'+i).value);
  r.ppkEmployer=nullable(G('ppr'+i).value);
  r.locked=true;save();render();
};

function relabelSettings(){
  let e=G('ppkEmp'),r=G('ppkEr');
  if(e&&e.closest('label'))e.closest('label').childNodes[0].textContent='PPK domyślnie — pracownik %';
  if(r&&r.closest('label'))r.closest('label').childNodes[0].textContent='PPK domyślnie — pracodawca %';
}
function setVersion(){let h=document.querySelector('.top small');if(h)h.innerHTML=`<span id="headerYear">${S.selectedYear}</span> • wersja 2.7.0`;document.title='Moje Finanse 2.7.0'}
function apply27(){try{let p=sal27();months27(p);relabelSettings();setVersion()}catch(e){console.error('PPK miesięczne 2.7',e)}}

const prev=window.render;
if(typeof prev==='function')window.render=function(){prev();apply27()};
setTimeout(apply27,180);
})();