/* Moje Finanse 3.4.2 — adaptacyjne osie Y dla wykresów */
(function(){
const NS='http://www.w3.org/2000/svg';
const N=v=>+v||0;
function compact(v){v=N(v);if(v>=1000000)return (v/1000000).toLocaleString('pl-PL',{maximumFractionDigits:v%1000000?1:0})+' mln';if(v>=1000)return (v/1000).toLocaleString('pl-PL',{maximumFractionDigits:v%1000?1:0})+' tys.';return Math.round(v).toLocaleString('pl-PL')+' zł'}
function niceStep(max,target=4){max=Math.max(1,N(max));let raw=max/target,pow=Math.pow(10,Math.floor(Math.log10(raw))),q=raw/pow,m=q<=1?1:q<=2?2:q<=2.5?2.5:q<=5?5:10;return m*pow}
function axisMax(max){let step=niceStep(max);return Math.max(step,Math.ceil(max/step)*step)}
function svgEl(name,attrs,text){let e=document.createElementNS(NS,name);for(let k in attrs)e.setAttribute(k,attrs[k]);if(text!=null)e.textContent=text;return e}
function addAxis(svg,opt){if(!svg)return;svg.querySelector('.adaptiveAxis36')?.remove();let vb=(svg.getAttribute('viewBox')||'0 0 600 220').split(/\s+/).map(Number),w=vb[2]||600,max=axisMax(opt.max),step=niceStep(max),g=svgEl('g',{class:'adaptiveAxis36'});for(let v=0;v<=max+.001;v+=step){let y=opt.bottom-(v/max)*(opt.bottom-opt.top);let line=svgEl('line',{x1:opt.left,x2:w-opt.right,y1:y,y2:y,stroke:'#e4e9f0','stroke-width':'1','stroke-dasharray':v===0?'0':'3 5'});let label=svgEl('text',{x:opt.left-7,y:y+3,'text-anchor':'end',fill:'#7d899d','font-size':'8.5'},compact(v));g.append(line,label)}svg.insertBefore(g,svg.firstChild)}
function loanOverview(){let svg=document.querySelector('#loanOverview .overviewChart svg');if(!svg||typeof S==='undefined')return;let max=(S.loans||[]).reduce((a,l)=>a+Math.max(N(l.balance),N(l.originalBalance)),0);if(!max)return;addAxis(svg,{max,left:40,right:20,top:32,bottom:147})}
function loanCards(){if(typeof S==='undefined')return;document.querySelectorAll('#loanList .loan').forEach((card,i)=>{let svg=card.querySelector('.loanUnifiedChart svg'),l=S.loans?.[i];if(!svg||!l)return;let max=Math.max(N(l.originalBalance),N(l.balance),1);addAxis(svg,{max,left:54,right:28,top:20,bottom:145})})}
function taxAxes(){if(typeof sal!=='function'||typeof S==='undefined')return;let p;try{p=sal()}catch{return}let th=N(S.settings?.threshold)||120000,max=Math.max(th*1.15,N(p.rows?.[11]?.y),1);['homeTaxSvg','taxSvg'].forEach(id=>{let svg=document.getElementById(id);if(svg)addAxis(svg,{max,left:30,right:30,top:25,bottom:190})})}
function apply(){setTimeout(()=>{loanOverview();loanCards();taxAxes()},0)}
const oldLoans=window.loans;if(typeof oldLoans==='function')window.loans=function(){oldLoans();apply()};
const oldRender=window.render;if(typeof oldRender==='function')window.render=function(){oldRender();apply()};
window.addAdaptiveAxes36=apply;
window.addEventListener('finance-modules-ready',apply);
setTimeout(apply,450);
})();