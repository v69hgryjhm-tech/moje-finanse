/* Moje Finanse 4.0.2 — awaryjny start i diagnostyka */
(function(){
'use strict';
function G(id){return document.getElementById(id)}
function unlock(){
  document.documentElement.dataset.mfLoading='0';
  var l=G('mf40loader'); if(l) l.hidden=true;
  var app=document.querySelector('.app'),nav=document.querySelector('.nav');
  if(app) app.style.visibility='visible';
  if(nav) nav.style.visibility='visible';
}
function showError(msg){
  unlock();
  var box=G('mf40booterror');
  if(!box){box=document.createElement('div');box.id='mf40booterror';box.style.cssText='position:fixed;left:12px;right:12px;top:12px;z-index:100000;background:#fff3f4;color:#8b2430;border:1px solid #efc5ca;border-radius:14px;padding:12px;font:12px system-ui;box-shadow:0 8px 24px rgba(0,0,0,.12)';document.body.appendChild(box)}
  box.textContent='Błąd startu 4.0: '+msg;
}
window.addEventListener('error',function(e){showError(e.message||'nieznany błąd JavaScript')});
window.addEventListener('unhandledrejection',function(e){showError((e.reason&&e.reason.message)||String(e.reason||'błąd asynchroniczny'))});
function rescue(){
  var l=G('mf40loader');
  if(!l || l.hidden) return;
  try{ if(typeof window.render==='function') window.render(); }catch(e){ showError(e.message||String(e)); return; }
  unlock();
}
setTimeout(rescue,900);
setTimeout(rescue,2200);
})();
