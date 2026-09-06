/* Moje Finanse 3.1 — strażnik wersji i porządek UI */
(function(){
const VERSION='3.1.0';
function apply(){
  document.title='Moje Finanse '+VERSION;
  let h=document.querySelector('.top small');
  if(h)h.innerHTML=`<span id="headerYear">${window.S?.selectedYear||''}</span> • wersja ${VERSION}`;
  document.documentElement.dataset.appVersion=VERSION;
  ['ppkEmp','ppkEr'].forEach(id=>{let el=document.getElementById(id),label=el?.closest('label');if(label)label.style.display='none'});
  let card=document.getElementById('threshold')?.closest('.card');if(card){let t=card.querySelector('.title');if(t)t.textContent='Etat / podatki'}
  let intro=document.querySelector('#salary .card > .muted');if(intro)intro.textContent='Odblokuj miesiąc, który uzupełniasz. Wpisujesz netto, premię netto oraz procent PPK pracownika i pracodawcy. Brutto i kwoty PPK liczą się automatycznie.';
}
const prev=window.render;if(typeof prev==='function')window.render=function(){prev();apply()};
document.addEventListener('DOMContentLoaded',()=>setTimeout(apply,0));setTimeout(apply,300);setTimeout(apply,900);
})();