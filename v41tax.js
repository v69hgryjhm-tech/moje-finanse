/* Moje Finanse 4.1 — ustawienia podatkowe per rok */
(function(){
'use strict';
const N=v=>+v||0,G=id=>document.getElementById(id),CY=new Date().getFullYear();
function ensure(){if(typeof S==='undefined')return false;S.finance||={};S.finance.taxByYear||={};return true}
function cfg(y){ensure();let all=S.finance.taxByYear,k=String(y),prev=all[String(y-1)];if(!all[k])all[k]={threshold:N(prev?.threshold)||N(S.settings?.threshold)||120000,reduction:prev?.reduction!=null?N(prev.reduction):N(S.settings?.reduction)||3600,kup:N(prev?.kup)||N(S.settings?.kup)||300,needsReview:!!prev};return all[k]}
function sync(y=S.selectedYear){if(!ensure())return;let c=cfg(+y);S.settings.threshold=c.threshold;S.settings.reduction=c.reduction;S.settings.kup=c.kup}
window.mfTaxCfg41=cfg;window.mfTaxSync41=sync;
function newYear(){if(!ensure())return;let f=S.finance;if(!f.lastAutoYear){f.lastAutoYear=CY;cfg(CY);return}if(f.lastAutoYear<CY){let c=cfg(CY);c.needsReview=true;f.lastAutoYear=CY;if(S.selectedYear<CY)S.selectedYear=CY;Y();sync(CY);save()}}
const oldChange=window.changeYear;window.changeYear=function(d){if(typeof S==='undefined')return;if(typeof oldChange==='function'){S.selectedYear+=d;Y();sync();save();if(typeof render==='function')render()}else{S.selectedYear+=d;Y();sync();save();window.render?.()};setTimeout(decorate,0)};
const oldSaveSettings=window.saveSettings;window.saveSettings=function(){if(!ensure())return;let c=cfg(S.selectedYear);c.threshold=N(G('threshold')?.value)||120000;c.reduction=N(G('reduction')?.value);c.kup=N(G('kup')?.value)||300;c.needsReview=false;sync();if(typeof oldSaveSettings==='function')oldSaveSettings();else{save();window.render?.()}setTimeout(decorate,0)};
function decorate(){if(!ensure())return;sync();let card=G('threshold')?.closest('.card'),c=cfg(S.selectedYear);if(!card)return;let t=card.querySelector('.title');if(t)t.innerHTML=`Etat / podatki — ${S.selectedYear}${c.needsReview?' <span class="pill" style="color:#9a6613">sprawdź na nowy rok</span>':''}`;['threshold','reduction','kup'].forEach(id=>{let e=G(id);if(e)e.value=id==='threshold'?c.threshold:id==='reduction'?c.reduction:c.kup});let note=card.querySelector('.taxYearNote41');if(!note){note=document.createElement('p');note.className='muted taxYearNote41';card.appendChild(note)}note.textContent='Parametry zapisują się osobno dla każdego roku. Zmiana 2027 nie zmieni wyliczeń 2026.'}
newYear();sync();window.addEventListener('finance-modules-ready',()=>{sync();setTimeout(decorate,30)});setTimeout(decorate,350);
})();