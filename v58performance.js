/* Moje Finanse 5.7 — szybka nawigacja i pomiar renderów */
(function(){
'use strict';
const G=id=>document.getElementById(id);
const stats=window.__mfPerf58||(window.__mfPerf58={navigations:0,fullRenders:0,lastFullMs:0,lastView:'home',installed:false});
function activate58(v){
 document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id===v));
 document.querySelectorAll('.nav button[data-v]').forEach(x=>x.classList.toggle('active',x.dataset.v===v));
 try{scrollTo(0,0)}catch{}
 stats.lastView=v
}
function safe58(name,fn){
 try{return fn?.()}catch(e){try{console.error('[MF perf] '+name,e)}catch{};return null}
}
function renderTarget58(v){
 switch(v){
  case 'home': return safe58('home',()=>window.mfMission57?.render?.());
  case 'businessplus':
   safe58('Firma+',()=>window.renderBusinessPlus44?.());
   safe58('Portfolio MOHE',()=>window.renderBusiness55?.());
   return safe58('Capacity card',()=>window.mfAutopilot56?.renderBusiness?.());
  case 'accounting': return safe58('Dla księgowej',()=>window.renderAccounting50?.());
  case 'monthly': return safe58('Pulpit miesiąca',()=>window.renderMonthly42?.());
  case 'wealth':
   safe58('Majątek',()=>window.renderWealth42?.());
   return safe58('Prognoza majątku',()=>window.mfLab55?.renderWealth?.());
  case 'goals': return safe58('Cele',()=>window.renderGoals42?.());
  case 'calendar':
   safe58('Kalendarz',()=>window.renderCalendar42?.());
   return safe58('Koszty roczne',()=>window.mfOps54?.renderCalendar?.());
  case 'emergency': return safe58('Poduszka',()=>window.renderEmergency42?.());
  case 'actions': return safe58('Plan działania',()=>window.mfOps54?.renderActions?.());
  case 'budget':
   safe58('Budżet bazowy',()=>window.renderBudget?.());
   return safe58('Budżet operacyjny',()=>window.mfOps54?.renderBudget?.());
  case 'lab': return safe58('Laboratorium',()=>window.mfLab55?.renderLab?.());
  case 'investments': return safe58('Inwestycje',()=>window.mfLab55?.renderInvestments?.());
  case 'review': return safe58('Review',()=>window.mfLab55?.renderReview?.());
  case 'autopilot': return safe58('Autopilot',()=>window.mfAutopilot56?.renderAutopilot?.());
  case 'capacity': return safe58('Capacity',()=>window.mfAutopilot56?.renderCapacity?.());
  case 'watch': return safe58('Watchlista',()=>window.mfAutopilot56?.renderWatch?.());
  case 'settings':
   safe58('Diagnostyka',()=>window.renderDiagnostics42?.());
   safe58('Ustawienia Autopilota',()=>window.mfAutopilot56?.renderSettings?.());
   return renderPerf58();
  case 'control':
   return window.render?.();
  default:
   return null
 }
}
function renderPerf58(){
 const h=G('settings');if(!h)return;G('perf58')?.remove();
 const box=document.createElement('div');box.id='perf58';box.className='card';
 box.innerHTML='<div class="title">Wydajność aplikacji <span class="pill green">TRYB SZYBKI</span></div><div class="row"><span>Nawigacje bez pełnego renderu</span><b>'+stats.navigations+'</b></div><div class="row"><span>Pełne rendery od uruchomienia</span><b>'+stats.fullRenders+'</b></div><div class="row"><span>Ostatni pełny render</span><b>'+stats.lastFullMs.toFixed(0)+' ms</b></div><p class="muted">Przejście między większością ekranów nie uruchamia już pełnego przeliczenia całej aplikacji. Pełny render pozostaje przy zmianach danych, roku i w Centrum dowodzenia.</p>';
 h.appendChild(box)
}
function install58(){
 if(stats.installed)return;
 const full=window.render,legacyShow=window.show;
 if(typeof full!=='function'||typeof legacyShow!=='function')return;
 stats.installed=true;
 window.mfLegacyShow58=legacyShow;
 window.mfFullRender58=full;
 window.render=function(){
  stats.fullRenders++;
  const start=(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now();
  try{return full()}finally{
   const end=(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now();
   stats.lastFullMs=end-start
  }
 };
 window.render.__mfPerf58=true;
 window.show=function(v){
  stats.navigations++;
  activate58(v);
  renderTarget58(v);
  return v
 };
 window.show.__mfPerf58=true
}
window.addEventListener('finance-modules-ready',install58,{once:true});
window.mfPerf58={stats,install:install58,renderTarget:renderTarget58,full:()=>window.render?.()};
})();