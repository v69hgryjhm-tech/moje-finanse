/* Moje Finanse 4.4 — Firma+ od kwot brutto i stawek VAT */
(function(){
'use strict';
const G=id=>document.getElementById(id);
const N=v=>+v||0;
const R2=v=>Math.round((N(v)+Number.EPSILON)*100)/100;
const PLN=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(N(v));
const FULL=['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
const RATES=[23,8,5,0,'zw'];

function ensure(){
 if(typeof S==='undefined')return false;
 S.years||={};
 if(!S.years[String(S.selectedYear)]&&typeof Y==='function')Y();
 return true;
}
function inferRate(net,vat){
 net=N(net);vat=N(vat);
 if(net<=0||vat<=0)return 0;
 const raw=vat/net*100;
 let best=23,dist=Infinity;
 [23,8,5,0].forEach(r=>{const d=Math.abs(raw-r);if(d<dist){dist=d;best=r}});
 return best;
}
function calcLine(line){
 const gross=Math.max(0,N(line&&line.gross));
 const rate=line&&line.vatRate!=null?line.vatRate:23;
 const rn=(rate==='zw'||rate==='ZW')?0:N(rate);
 if(rn===0)return{gross:R2(gross),net:R2(gross),vat:0,rate};
 const net=R2(gross/(1+rn/100));
 return{gross:R2(gross),net,vat:R2(gross-net),rate:rn};
}
function ensureLines(r){
 if(!Array.isArray(r.salesLines)){
  r.salesLines=[];
  let net=N(r.revenue),vat=N(r.vatOut);
  if(!vat&&N(r.vat)>0)vat=N(r.vat);
  if(net||vat)r.salesLines.push({gross:R2(net+vat),vatRate:inferRate(net,vat),migrated:true});
 }
 if(!Array.isArray(r.costLines)){
  r.costLines=[];
  let net=N(r.costs),vat=N(r.vatIn);
  if(!vat&&N(r.vat)<0)vat=Math.abs(N(r.vat));
  if(net||vat)r.costLines.push({gross:R2(net+vat),vatRate:inferRate(net,vat),migrated:true});
 }
}
function sumLines(lines){
 return (lines||[]).reduce((a,l)=>{
  const c=calcLine(l);
  a.gross=R2(a.gross+c.gross);a.net=R2(a.net+c.net);a.vat=R2(a.vat+c.vat);
  return a;
 },{gross:0,net:0,vat:0});
}
function summary(r){
 ensureLines(r);
 const sales=sumLines(r.salesLines),costs=sumLines(r.costLines);
 const zus=N(r.zus),health=N(r.health),tax=N(r.tax);
 const vatSaldo=R2(sales.vat-costs.vat);
 const vatPay=Math.max(0,vatSaldo);
 const taxable=R2(sales.net-costs.net-zus);
 const cash=R2(sales.gross-costs.gross-vatPay-zus-health-tax);
 return{sales,costs,zus,health,tax,vatSaldo,vatPay,taxable,cash};
}
function sync(r){
 const s=summary(r);
 r.revenueGross=s.sales.gross;r.revenue=s.sales.net;r.vatOut=s.sales.vat;
 r.costsGross=s.costs.gross;r.costs=s.costs.net;r.vatIn=s.costs.vat;
 r.vat=s.vatSaldo;
 return s;
}
function rowFor(y,i){
 let yr=S.years[String(y)];
 if(!yr&&typeof Y==='function'){
  const old=S.selectedYear;S.selectedYear=y;yr=Y();S.selectedYear=old;
 }
 yr.company||=Array.from({length:12},()=>({}));
 const r=yr.company[i]||(yr.company[i]={});
 ensureLines(r);
 return r;
}
function vatSelect(rate,i,kind,j){
 return '<select id="b44rate_'+i+'_'+kind+'_'+j+'" onchange="recalcBusiness44('+i+')">'+
  RATES.map(r=>'<option value="'+r+'" '+(String(rate)===String(r)?'selected':'')+'>'+(r==='zw'?'zw.':r+'%')+'</option>').join('')+
 '</select>';
}
function lineHtml(line,i,kind,j){
 const c=calcLine(line),title=kind==='s'?'Sprzedaż brutto':'Koszt brutto';
 return '<div class="bizLine44" data-kind="'+kind+'">'+
  '<div class="bizLineFields44"><label>'+title+'<input id="b44gross_'+i+'_'+kind+'_'+j+'" type="number" min="0" step="0.01" value="'+(line.gross??'')+'" oninput="recalcBusiness44('+i+')"></label>'+
  '<label>VAT'+vatSelect(line.vatRate??23,i,kind,j)+'</label>'+
  '<button class="btn danger bizRemove44" onclick="removeBusinessLine44('+i+',\''+kind+'\','+j+')">Usuń</button></div>'+
  '<div class="bizLineCalc44"><span>netto bez VAT <b id="b44net_'+i+'_'+kind+'_'+j+'">'+PLN(c.net)+'</b></span><span>VAT <b id="b44vat_'+i+'_'+kind+'_'+j+'">'+PLN(c.vat)+'</b></span></div></div>';
}
function captureLines(i,kind){
 const root=G('bp44_'+i),out=[];
 if(!root)return out;
 root.querySelectorAll('.bizLine44[data-kind="'+kind+'"]').forEach((el,j)=>{
  const gross=N(G('b44gross_'+i+'_'+kind+'_'+j)?.value);
  const raw=G('b44rate_'+i+'_'+kind+'_'+j)?.value;
  out.push({gross,vatRate:raw==='zw'?'zw':N(raw)});
 });
 return out;
}
function captureMonth(i){
 const r=rowFor(S.selectedYear,i);
 r.salesLines=captureLines(i,'s');
 r.costLines=captureLines(i,'c');
 r.zus=N(G('b44zus_'+i)?.value);
 r.health=N(G('b44health_'+i)?.value);
 r.tax=N(G('b44tax_'+i)?.value);
 return r;
}
function domSummary(i){
 return summary({
  salesLines:captureLines(i,'s'),
  costLines:captureLines(i,'c'),
  zus:N(G('b44zus_'+i)?.value),
  health:N(G('b44health_'+i)?.value),
  tax:N(G('b44tax_'+i)?.value)
 });
}
function setText(id,text){const e=G(id);if(e)e.textContent=text}
window.recalcBusiness44=function(i){
 const root=G('bp44_'+i);if(!root)return;
 ['s','c'].forEach(kind=>{
  root.querySelectorAll('.bizLine44[data-kind="'+kind+'"]').forEach((el,j)=>{
   const raw=G('b44rate_'+i+'_'+kind+'_'+j)?.value;
   const c=calcLine({gross:N(G('b44gross_'+i+'_'+kind+'_'+j)?.value),vatRate:raw==='zw'?'zw':N(raw)});
   setText('b44net_'+i+'_'+kind+'_'+j,PLN(c.net));
   setText('b44vat_'+i+'_'+kind+'_'+j,PLN(c.vat));
  });
 });
 const s=domSummary(i);
 setText('b44sg_'+i,PLN(s.sales.gross));setText('b44sn_'+i,PLN(s.sales.net));setText('b44vo_'+i,PLN(s.sales.vat));
 setText('b44cg_'+i,PLN(s.costs.gross));setText('b44cn_'+i,PLN(s.costs.net));setText('b44vi_'+i,PLN(s.costs.vat));
 setText('b44vs_'+i,(s.vatSaldo>=0?'do zapłaty ':'nadwyżka ')+PLN(Math.abs(s.vatSaldo)));
 setText('b44pit_'+i,PLN(s.taxable));setText('b44cash_'+i,PLN(s.cash));
 const cash=G('b44cash_'+i);if(cash)cash.className=s.cash<0?'red':'green';
};
window.addBusinessLine44=function(i,kind){
 const r=captureMonth(i),arr=kind==='s'?r.salesLines:r.costLines;
 arr.push({gross:0,vatRate:23});sync(r);save();renderBusinessPlus44();
};
window.removeBusinessLine44=function(i,kind,j){
 const r=captureMonth(i),arr=kind==='s'?r.salesLines:r.costLines;
 arr.splice(j,1);sync(r);save();renderBusinessPlus44();
};
window.saveBusinessMonth44=function(i){
 const r=captureMonth(i);sync(r);r.locked=true;save();
 if(typeof render==='function')render();else renderBusinessPlus44();
};
window.changeBusinessYear44=function(d){
 S.selectedYear+=d;if(typeof Y==='function')Y();window.mfTaxSync41?.(S.selectedYear);save();
 if(typeof render==='function')render();else renderBusinessPlus44();
};
function card(r,i){
 const s=summary(r);
 const collapsed=r.uiCollapsed44!==false;
 const migrated=[...(r.salesLines||[]),...(r.costLines||[])].some(x=>x.migrated);
 return '<div class="bizMonth bizMonth44 '+(collapsed?'bizCollapsed44':'')+'" id="bp44_'+i+'">'+
  '<div class="mh"><b>'+FULL[i]+' '+S.selectedYear+'</b><div class="bizMonthActions44"><span class="status '+((r.salesLines?.length||r.costLines?.length||r.zus||r.health||r.tax)?'actual':'')+'">'+((r.salesLines?.length||r.costLines?.length||r.zus||r.health||r.tax)?'wpisane':'puste')+'</span><button type="button" class="btn" aria-expanded="'+!collapsed+'" aria-controls="bizBody44_'+i+'" onclick="toggleBusinessMonth44('+i+')">'+(collapsed?'Rozwiń ▾':'Zwiń ▴')+'</button></div></div>'+
  '<div class="bizCompact44"><span>Sprzedaż netto bez VAT <b>'+PLN(s.sales.net)+'</b></span><span>Po kosztach i podatkach <b>'+PLN(s.cash)+'</b></span></div><div class="bizBody44" id="bizBody44_'+i+'">'+
  (migrated?'<p class="bizWarn44">Dane z poprzedniej wersji zostały wstępnie przeliczone. Sprawdź stawkę VAT przed zapisaniem miesiąca.</p>':'')+
  '<div class="bizSection44"><div class="bizSectionHead44"><b>Sprzedaż</b><button class="btn" onclick="addBusinessLine44('+i+',\'s\')">＋ pozycja</button></div>'+
   ((r.salesLines||[]).length?r.salesLines.map((l,j)=>lineHtml(l,i,'s',j)).join(''):'<p class="muted">Brak sprzedaży.</p>')+'</div>'+
  '<div class="bizSection44"><div class="bizSectionHead44"><b>Koszty</b><button class="btn" onclick="addBusinessLine44('+i+',\'c\')">＋ pozycja</button></div>'+
   ((r.costLines||[]).length?r.costLines.map((l,j)=>lineHtml(l,i,'c',j)).join(''):'<p class="muted">Brak kosztów.</p>')+'</div>'+
  '<div class="bizSummary44"><div><small>SPRZEDAŻ BRUTTO</small><b id="b44sg_'+i+'">'+PLN(s.sales.gross)+'</b><span>netto bez VAT <b id="b44sn_'+i+'">'+PLN(s.sales.net)+'</b> • VAT <b id="b44vo_'+i+'">'+PLN(s.sales.vat)+'</b></span></div>'+
  '<div><small>KOSZTY BRUTTO</small><b id="b44cg_'+i+'">'+PLN(s.costs.gross)+'</b><span>netto bez VAT <b id="b44cn_'+i+'">'+PLN(s.costs.net)+'</b> • VAT <b id="b44vi_'+i+'">'+PLN(s.costs.vat)+'</b></span></div></div>'+
  '<div class="form bizCharges44"><label>ZUS społeczne<input id="b44zus_'+i+'" type="number" min="0" step="0.01" value="'+(r.zus??'')+'" oninput="recalcBusiness44('+i+')"></label>'+
  '<label>Składka zdrowotna<input id="b44health_'+i+'" type="number" min="0" step="0.01" value="'+(r.health??'')+'" oninput="recalcBusiness44('+i+')"></label>'+
  '<label>PIT faktycznie zapłacony<input id="b44tax_'+i+'" type="number" min="0" step="0.01" value="'+(r.tax??'')+'" oninput="recalcBusiness44('+i+')"></label></div>'+
  '<div class="bizResultGrid44"><div><small>VAT</small><b id="b44vs_'+i+'">'+(s.vatSaldo>=0?'do zapłaty ':'nadwyżka ')+PLN(Math.abs(s.vatSaldo))+'</b></div>'+
  '<div><small>DOCHÓD DO PIT — PO KOSZTACH I ZUS</small><b id="b44pit_'+i+'">'+PLN(s.taxable)+'</b></div>'+
  '<div><small>ZOSTAJE PO KOSZTACH, VAT, ZUS I PIT</small><b id="b44cash_'+i+'" class="'+(s.cash<0?'red':'green')+'">'+PLN(s.cash)+'</b></div></div>'+
  '<button class="btn primary" onclick="saveBusinessMonth44('+i+')">Zapisz '+FULL[i]+'</button></div></div>';
}
function renderBusinessPlus44(){
 if(!ensure())return;
 const host=G('businessPlusBody');if(!host)return;
 const y=S.selectedYear,rows=Array.from({length:12},(_,i)=>rowFor(y,i));
 const total=rows.reduce((a,r)=>{const s=summary(r);a.sg+=s.sales.gross;a.sn+=s.sales.net;a.vo+=s.sales.vat;a.cg+=s.costs.gross;a.cn+=s.costs.net;a.vi+=s.costs.vat;a.taxable+=s.taxable;a.cash+=s.cash;return a},{sg:0,sn:0,vo:0,cg:0,cn:0,vi:0,taxable:0,cash:0});
 const vat=R2(total.vo-total.vi);
 host.innerHTML='<div class="sectionHead"><div class="yearNav"><button class="btn" onclick="changeBusinessYear44(-1)">‹</button><b>'+y+'</b><button class="btn" onclick="changeBusinessYear44(1)">›</button></div></div>'+
 '<div class="card businessIntro44"><b>Firma liczona od kwot brutto</b><p>Wpisujesz kwotę brutto i stawkę VAT. Netto oraz VAT liczą się automatycznie.</p><small>Stawki: 23%, 8%, 5%, 0% i zwolnienie.</small></div>'+
 '<div class="businessOverview44"><section><h3>Sprzedaż i VAT — wpisane</h3><div class="businessOverviewRows44"><div><span>Sprzedaż brutto</span><b>'+PLN(total.sg)+'</b></div><div><span>Sprzedaż netto bez VAT</span><b>'+PLN(total.sn)+'</b></div><div><span>VAT — '+(vat>=0?'do zapłaty':'nadwyżka')+'</span><b>'+PLN(Math.abs(vat))+'</b></div></div></section><section><h3>Wynik firmy — wpisane</h3><div class="businessOverviewRows44"><div><span>Koszty netto bez VAT</span><b>'+PLN(total.cn)+'</b></div><div><span>Dochód do PIT — po kosztach i ZUS</span><b>'+PLN(Math.max(0,total.taxable))+'</b></div><div class="businessCashTotal44"><span>Zostaje po kosztach, VAT, ZUS i PIT</span><b>'+PLN(total.cash)+'</b></div></div></section></div>'+
 '<div class="card"><div class="title">Firma+ — pozycje brutto miesiąc po miesiącu</div><p class="muted">Każdy miesiąc może mieć wiele pozycji sprzedaży i kosztów z różnymi stawkami VAT.</p><div class="businessGrid businessGrid44">'+rows.map((r,i)=>card(r,i)).join('')+'</div></div>';
 rows.forEach((r,i)=>window.recalcBusiness44(i));
}
window.toggleBusinessMonth44=function(i){const r=captureMonth(i);sync(r);r.uiCollapsed44=r.uiCollapsed44===false;save();renderBusinessPlus44()};
window.renderBusinessPlus44=renderBusinessPlus44;
window.mfCompanySummary44=summary;
window.mfCompanySync44=sync;

const oldRender=window.render;
if(typeof oldRender==='function'&&!oldRender.__biz44){
 const fn=function(){const out=oldRender();renderBusinessPlus44();return out};fn.__biz44=true;window.render=fn;
}
const oldShow=window.show;
if(typeof oldShow==='function'&&!oldShow.__biz44){
 const fn=function(v){const out=oldShow(v);if(v==='businessplus')renderBusinessPlus44();return out};fn.__biz44=true;window.show=fn;
}

const st=document.createElement('style');
st.textContent='.businessIntro44{margin-bottom:12px}.businessIntro44 p{margin:6px 0}.businessGrid44{align-items:start}.bizMonth44{padding:12px}.bizSection44{margin:12px 0;padding-top:10px;border-top:1px solid #e9edf3}.bizSectionHead44{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}.bizLine44{padding:9px;border:1px solid #e5eaf1;border-radius:12px;margin:7px 0;background:#fff}.bizLineFields44{display:grid;grid-template-columns:minmax(120px,1fr) 92px auto;gap:7px;align-items:end}.bizLineCalc44{display:flex;gap:14px;margin-top:6px;color:#748197;font-size:11px}.bizRemove44{height:40px}.bizSummary44{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}.bizSummary44>div,.bizResultGrid44>div{background:#f4f7fb;border-radius:11px;padding:9px}.bizSummary44 small,.bizResultGrid44 small{display:block;color:#7a8799;font-size:9px}.bizSummary44 span{display:block;color:#7a8799;font-size:10px;margin-top:4px}.bizCharges44{grid-template-columns:repeat(3,1fr)}.bizResultGrid44{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}.bizWarn44{padding:8px;border-radius:9px;background:#fff6df;color:#7a5b18;font-size:11px}@media(max-width:560px){.bizLineFields44{grid-template-columns:1fr 90px}.bizRemove44{grid-column:1/-1}.bizSummary44,.bizResultGrid44,.bizCharges44{grid-template-columns:1fr}}';
document.head.appendChild(st);
})();