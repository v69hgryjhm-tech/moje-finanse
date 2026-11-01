/* Moje Finanse 5.8 — centralny kernel renderowania */
(function(){
'use strict';
const VERSION='5.8.1',G=id=>document.getElementById(id);
const legacyRender=window.render,legacyShow=window.show;
const perf=window.__mfKernel59||(window.__mfKernel59={renders:0,navigations:0,fallbacks:0,lastView:'home',lastMs:0});
function setVersion59(){document.title='Moje Finanse '+VERSION;let h=document.querySelector('.top small');if(h)h.innerHTML='<span id="headerYear">'+(typeof S!=='undefined'?S.selectedYear:'')+'</span> • wersja '+VERSION;document.documentElement.dataset.appVersion=VERSION}
function safe59(name,fn){try{return fn?.()}catch(e){try{console.error('[MF 5.8] '+name,e)}catch{}return null}}
function active59(){return document.querySelector('.view.active')?.id||perf.lastView||'home'}
function activate59(v){document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id===v));document.querySelectorAll('.nav button[data-v]').forEach(x=>x.classList.toggle('active',x.dataset.v===v));perf.lastView=v;try{scrollTo(0,0)}catch{}}
function renderHome59(){safe59('Mission Control',()=>window.mfMission57?.render?.());if(G('home')?.classList.contains('showLegacy57')){perf.fallbacks++;safe59('legacy home details',legacyRender)}}
function renderSalary59(){safe59('Etat',()=>window.renderSalaryLocal37?.())}
function renderCompany59(){safe59('Firma',()=>window.company?.(window.comp?.()));safe59('Firma tax summary',()=>window.renderCompanySummary44?.())}
function renderBusiness59(){
 safe59('Firma+',()=>window.renderBusinessPlus44?.());
 safe59('Firma tax',()=>window.renderCompanySummary44?.());
 safe59('Produkty/limity',()=>window.renderSuite41?.());
 safe59('Trend firmy',()=>window.mfControl51?.renderBusiness?.());
 safe59('Command firma',()=>window.mfCommand53?.renderBusiness?.());
 safe59('Portfolio MOHE',()=>window.mfLab55?.renderBusiness?.());
 safe59('Capacity MOHE',()=>window.mfAutopilot56?.renderBusiness?.())
}
function renderControl59(){
 safe59('Control base',()=>window.renderControl51?.());
 safe59('Control planner',()=>window.mfPlanner52?.renderControl?.());
 safe59('Control command',()=>window.mfCommand53?.renderControl?.());
 safe59('Control ops',()=>window.mfOps54?.renderControl?.());
 safe59('Control lab',()=>window.mfLab55?.renderControl?.());
 safe59('Control autopilot',()=>window.mfAutopilot56?.renderControl?.())
}
function renderLoans59(){
 safe59('Kredyty base',()=>window.loans?.());
 safe59('Kredyty UX',()=>window.mfUx47?.enhanceLoans?.());
 safe59('Kredyty control',()=>window.mfControl51?.renderLoans?.());
 safe59('Kredyty planner',()=>window.mfPlanner52?.renderLoans?.())
}
function renderSettings59(){
 safe59('Ustawienia diag',()=>window.renderDiagnostics42?.());
 safe59('Suite settings',()=>window.renderSuite41?.());
 safe59('Command settings',()=>window.mfCommand53?.renderSettings?.());
 safe59('Lab settings',()=>window.mfLab55?.renderSettings?.());
 safe59('Autopilot settings',()=>window.mfAutopilot56?.renderSettings?.());
 safe59('UX settings',()=>window.mfUx47?.renderSmoke?.());
 renderKernelDiag59()
}
function renderKernelDiag59(){
 let h=G('settings');if(!h)return;G('kernel59')?.remove();let b=document.createElement('div');b.id='kernel59';b.className='card';
 b.innerHTML='<div class="title">Kernel aplikacji <span class="pill green">5.8 • CENTRALNY</span></div><div class="row"><span>Rendery aktywnego widoku</span><b>'+perf.renders+'</b></div><div class="row"><span>Nawigacje</span><b>'+perf.navigations+'</b></div><div class="row"><span>Fallback starego renderu</span><b>'+perf.fallbacks+'</b></div><div class="row"><span>Ostatni render</span><b>'+perf.lastMs.toFixed(0)+' ms</b></div><p class="muted">Normalna praca aplikacji korzysta z jednego routera. Stary pełny render jest używany tylko awaryjnie lub do rozwiniętych szczegółów starego Startu.</p>';h.appendChild(b)
}
function renderView59(v){
 setVersion59();let start=(performance?.now?.()??Date.now());perf.renders++;
 switch(v){
  case 'home':renderHome59();break;
  case 'salary':renderSalary59();break;
  case 'company':renderCompany59();break;
  case 'businessplus':renderBusiness59();break;
  case 'accounting':safe59('Dla księgowej',()=>window.renderAccounting50?.());break;
  case 'control':renderControl59();break;
  case 'monthly':safe59('Pulpit miesiąca',()=>window.renderMonthly42?.());break;
  case 'loans':renderLoans59();break;
  case 'tax':safe59('Podatki',()=>{window.taxChart?.(window.sal?.());window.renderTaxOnly44?.()});break;
  case 'wealth':safe59('Majątek',()=>{window.renderWealth42?.();window.renderSuite41?.();window.mfControl51?.renderWealth?.();window.mfLab55?.renderWealth?.()});break;
  case 'goals':safe59('Cele',()=>{window.renderGoals42?.();window.mfControl51?.renderGoals?.()});break;
  case 'emergency':safe59('Poduszka',()=>window.renderEmergency42?.());break;
  case 'actions':safe59('Plan działania',()=>window.mfOps54?.renderActions?.());break;
  case 'calendar':safe59('Kalendarz',()=>{window.renderCalendar42?.();window.mfOps54?.renderCalendar?.()});break;
  case 'budget':safe59('Wydatki',()=>{window.renderBudget34?.();window.renderSuite41?.();window.mfOps54?.renderBudget?.()});break;
  case 'debt':safe59('Zadłużenie',()=>{window.renderDebt34?.();window.renderSuite41?.()});break;
  case 'scenario':safe59('Scenariusz legacy',()=>window.renderScenario34?.());break;
  case 'lab':safe59('Laboratorium',()=>window.mfLab55?.renderLab?.());break;
  case 'investments':safe59('Inwestycje',()=>window.mfLab55?.renderInvestments?.());break;
  case 'review':safe59('Review',()=>window.mfLab55?.renderReview?.());break;
  case 'autopilot':safe59('Autopilot',()=>window.mfAutopilot56?.renderAutopilot?.());break;
  case 'capacity':safe59('Capacity',()=>window.mfAutopilot56?.renderCapacity?.());break;
  case 'watch':safe59('Watchlista',()=>window.mfAutopilot56?.renderWatch?.());break;
  case 'settings':renderSettings59();break;
  default:perf.fallbacks++;safe59('fallback '+v,legacyRender)
 }
 perf.lastMs=(performance?.now?.()??Date.now())-start
}
function install59(){
 window.render=function(){return renderView59(active59())};
 window.show=function(v){perf.navigations++;activate59(v);renderView59(v);return v};
 window.render.__mfKernel59=true;window.show.__mfKernel59=true;setVersion59()
}
window.mfKernel59={renderView:renderView59,stats:perf,legacyRender,legacyShow,install:install59};
window.addEventListener('finance-modules-ready',install59,{once:true});
})();