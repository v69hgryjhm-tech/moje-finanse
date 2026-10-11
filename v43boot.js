/* Moje Finanse 4.3 — pojedynczy, stabilny start aplikacji */
(function(){
'use strict';
const VERSION='4.6.1';
let revealed=false, quietTimer=null, hardTimer=null, observer=null;

function setVersion(){
  document.title='Moje Finanse '+VERSION;
  const h=document.querySelector('.top small');
  if(h)h.innerHTML='<span id="headerYear">'+(typeof S!=='undefined'?S.selectedYear:'')+'</span> • wersja '+VERSION;
  document.documentElement.dataset.appVersion=VERSION;
}
function reveal(){
  if(revealed)return;
  revealed=true;
  if(quietTimer)clearTimeout(quietTimer);
  if(hardTimer)clearTimeout(hardTimer);
  if(observer)observer.disconnect();
  setVersion();
  document.documentElement.classList.add('app-ready');
  document.documentElement.classList.remove('app-loading');
}
function waitForQuiet(){
  if(revealed)return;
  if(quietTimer)clearTimeout(quietTimer);
  quietTimer=setTimeout(()=>requestAnimationFrame(()=>requestAnimationFrame(reveal)),180);
}
function boot(){
  const app=document.querySelector('.app');
  if(app&&typeof MutationObserver!=='undefined'){
    observer=new MutationObserver(waitForQuiet);
    observer.observe(app,{subtree:true,childList:true,attributes:true,characterData:true});
  }
  hardTimer=setTimeout(reveal,2200);
  try{
    window.prepareStable34?.();
    window.dispatchEvent(new Event('finance-modules-ready'));
    if(typeof render==='function')render();
  }catch(e){
    console.error('Błąd końcowego startu aplikacji',e);
  }
  waitForQuiet();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();