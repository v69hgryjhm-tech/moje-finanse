/* Moje Finanse 3.4 — zgodność startowa; stare renderery v25 zostały wycofane */
(function(){
function ready(){
  document.documentElement.classList.add('app-ready');
  document.documentElement.dataset.appVersion='3.4.0';
  document.title='Moje Finanse 3.4.0';
  let h=document.querySelector('.top small');
  if(h)h.innerHTML=`<span id="headerYear">${typeof S!=='undefined'?S.selectedYear:''}</span> • wersja 3.4.0`;
}
window.addEventListener('finance-modules-ready',()=>setTimeout(ready,100),{once:true});
setTimeout(ready,1800);
})();