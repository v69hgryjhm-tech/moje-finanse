/* Moje Finanse 5.7 — wspólny rejestr księgowy + sprzedaż wielopozycyjna */
(function(){
'use strict';
const G=id=>document.getElementById(id),N=v=>+v||0,R2=v=>Math.round((N(v)+Number.EPSILON)*100)/100;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN'}).format(N(v));
let month='',saleDraft=null;

function selected(){if(!month)month=S.selectedYear+'-'+String(new Date().getMonth()+1).padStart(2,'0');return month}
function row(){
 const [y,m]=selected().split('-').map(Number);
 if(!S.years[y]){let old=S.selectedYear;S.selectedYear=y;Y();S.selectedYear=old}
 const r=S.years[y].company[m-1];window.mfCompanySummary44(r);return r
}
function lines(kind){return row()[kind==='s'?'salesLines':'costLines']}
function saleGroups(){
 const src=lines('s'),map=new Map();
 src.forEach((l,index)=>{
  const c=window.mfCompanyLine44(l),key=l.saleGroupId||('legacy-'+index),qty=Math.max(.001,N(l.quantity)||1),unit=l.unitGross!=null?N(l.unitGross):R2(c.gross/qty);
  if(!map.has(key))map.set(key,{key,saleGroupId:l.saleGroupId||'',sourceIndexes:[],date:l.date||'',firstName:l.firstName||'',lastName:l.lastName||'',invoice:l.invoice||'',notes:l.notes||'',items:[],gross:0,net:0,vat:0});
  const g=map.get(key);g.sourceIndexes.push(index);g.items.push({sourceIndex:index,product:l.product||'',quantity:qty,unitGross:unit,vatRate:l.vatRate??c.rate,gross:c.gross,net:c.net,vat:c.vat});
  g.gross=R2(g.gross+c.gross);g.net=R2(g.net+c.net);g.vat=R2(g.vat+c.vat)
 });
 return [...map.values()].sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||Math.min(...a.sourceIndexes)-Math.min(...b.sourceIndexes))
}
function report(){
 const r=row(),summary=window.mfCompanySummary44(r);
 const list=kind=>lines(kind).map((l,index)=>({...l,index,...window.mfCompanyLine44(l)})).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||a.index-b.index);
 return{month:selected(),sales:list('s'),salesGroups:saleGroups(),purchases:list('c'),summary}
}
function field(id,label,value='',type='text'){return'<label>'+label+'<input id="ac_'+id+'" type="'+type+'" value="'+esc(value)+'" '+(type==='number'?'min="0" step="0.01"':'')+'></label>'}
function vatSelect50(id,value){return'<select id="'+id+'">'+[23,8,5,0,'zw'].map(v=>'<option value="'+v+'" '+(String(v)===String(value??23)?'selected':'')+'>'+(v==='zw'?'zwolnione':v+'%')+'</option>').join('')+'</select>'}

window.accountMonth50=function(v){if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(v))return;month=v;renderAccounting50()};

function saleItemHtml50(it,i){
 return'<div class="acSaleItem50" data-item="'+i+'"><div class="acSaleItemNo50">'+(i+1)+'</div><label>Produkt / usługa<input id="ac_si_product_'+i+'" value="'+esc(it.product||'')+'"></label><label>Ilość<input id="ac_si_qty_'+i+'" type="number" min="0.001" step="1" value="'+(N(it.quantity)||1)+'"></label><label>Cena jedn. brutto<input id="ac_si_unit_'+i+'" type="number" min="0" step="0.01" value="'+(it.unitGross??'')+'"></label><label>VAT'+vatSelect50('ac_si_vat_'+i,it.vatRate??23)+'</label><div class="acSaleCalc50" id="ac_si_calc_'+i+'"></div><button type="button" class="btn danger" onclick="accountRemoveSaleItem50('+i+')">Usuń</button></div>'
}
function currentSaleGroup50(index){
 const groups=saleGroups();return index>=0?groups[index]:null
}
window.accountEditSale50=function(index=-1){
 const g=currentSaleGroup50(index);
 saleDraft=g?{editKey:g.key,sourceIndexes:[...g.sourceIndexes],date:g.date,firstName:g.firstName,lastName:g.lastName,invoice:g.invoice,notes:g.notes,items:g.items.map(x=>({product:x.product,quantity:x.quantity,unitGross:x.unitGross,vatRate:x.vatRate}))}:{editKey:'',sourceIndexes:[],date:selected()+'-01',firstName:'',lastName:'',invoice:'',notes:'',items:[{product:'',quantity:1,unitGross:'',vatRate:23}]};
 renderSaleEditor50()
};
function captureSaleDraft50(){
 if(!saleDraft)return;
 const get=id=>G(id)?.value??'';
 saleDraft.date=get('ac_sale_date');saleDraft.firstName=get('ac_sale_firstName').trim();saleDraft.lastName=get('ac_sale_lastName').trim();saleDraft.invoice=get('ac_sale_invoice').trim();saleDraft.notes=get('ac_sale_notes').trim();
 saleDraft.items=saleDraft.items.map((it,i)=>({product:get('ac_si_product_'+i).trim(),quantity:Math.max(.001,N(get('ac_si_qty_'+i))||1),unitGross:Math.max(0,N(get('ac_si_unit_'+i))),vatRate:get('ac_si_vat_'+i)==='zw'?'zw':N(get('ac_si_vat_'+i))}))
}
function renderSaleEditor50(){
 const p=G('accountEditor50');if(!p||!saleDraft)return;
 p.innerHTML='<div class="card acEditor50 acSaleEditor50"><div class="title">'+(saleDraft.sourceIndexes.length?'Edytuj sprzedaż / dane do faktury':'Dodaj sprzedaż / dane do faktury')+' <span class="pill">'+saleDraft.items.length+' poz.</span></div><div class="acSaleCustomer50">'+field('sale_date','Data sprzedaży',saleDraft.date,'date')+field('sale_firstName','Imię',saleDraft.firstName)+field('sale_lastName','Nazwisko',saleDraft.lastName)+field('sale_invoice','Numer faktury (jeśli dotyczy)',saleDraft.invoice)+field('sale_notes','Uwagi / kanał sprzedaży',saleDraft.notes)+'</div><div class="acSaleItemsHead50"><b>Pozycje sprzedaży</b><button type="button" class="btn" onclick="accountAddSaleItem50()">＋ Dodaj pozycję</button></div><div id="acSaleItems50">'+saleDraft.items.map(saleItemHtml50).join('')+'</div><div class="acSaleTotal50" id="acSaleTotal50"></div><p id="acError50" role="alert"></p><div class="acActions50"><button type="button" class="btn primary" onclick="accountSaveSale50()">Zapisz sprzedaż</button><button type="button" class="btn" onclick="document.getElementById(\'accountEditor50\').innerHTML=\'\'">Anuluj</button></div></div>';
 const root=G('accountEditor50');root.oninput=previewSale50;root.onchange=previewSale50;previewSale50();p.scrollIntoView({behavior:'smooth',block:'start'})
}
window.accountAddSaleItem50=function(){captureSaleDraft50();saleDraft.items.push({product:'',quantity:1,unitGross:'',vatRate:23});renderSaleEditor50()};
window.accountRemoveSaleItem50=function(i){captureSaleDraft50();if(saleDraft.items.length<=1)return;saleDraft.items.splice(i,1);renderSaleEditor50()};
function previewSale50(){
 if(!saleDraft)return;
 let tg=0,tn=0,tv=0;
 saleDraft.items.forEach((it,i)=>{
  let qty=Math.max(.001,N(G('ac_si_qty_'+i)?.value)||1),unit=Math.max(0,N(G('ac_si_unit_'+i)?.value)),rate=G('ac_si_vat_'+i)?.value??23,gross=R2(qty*unit),c=window.mfCompanyLine44({gross,vatRate:rate==='zw'?'zw':N(rate)});
  tg=R2(tg+c.gross);tn=R2(tn+c.net);tv=R2(tv+c.vat);let h=G('ac_si_calc_'+i);if(h)h.innerHTML='<span>Razem <b>'+money(c.gross)+'</b></span><span>netto '+money(c.net)+'</span><span>VAT '+money(c.vat)+'</span>'
 });
 let h=G('acSaleTotal50');if(h)h.innerHTML='<div><span>Brutto</span><b>'+money(tg)+'</b></div><div><span>Netto</span><b>'+money(tn)+'</b></div><div><span>VAT</span><b>'+money(tv)+'</b></div>'
}
window.accountSaveSale50=function(){
 captureSaleDraft50();const err=G('acError50');
 if(!saleDraft.date||saleDraft.date.slice(0,7)!==selected()){if(err)err.textContent='Data sprzedaży musi należeć do wybranego miesiąca.';return}
 const bad=saleDraft.items.some(x=>!x.product||N(x.quantity)<=0||N(x.unitGross)<=0);
 if(bad){if(err)err.textContent='Każda pozycja musi mieć nazwę, ilość większą od zera i cenę jednostkową brutto.';return}
 const arr=lines('s'),gid=saleDraft.editKey&&!saleDraft.editKey.startsWith('legacy-')?saleDraft.editKey:'sg-'+Date.now().toString(36);
 let insertAt=arr.length;
 if(saleDraft.sourceIndexes.length){insertAt=Math.min(...saleDraft.sourceIndexes);[...saleDraft.sourceIndexes].sort((a,b)=>b-a).forEach(i=>arr.splice(i,1))}
 const rows=saleDraft.items.map(it=>({saleGroupId:gid,product:it.product,quantity:N(it.quantity),unitGross:R2(it.unitGross),gross:R2(N(it.quantity)*N(it.unitGross)),vatRate:it.vatRate,date:saleDraft.date,firstName:saleDraft.firstName,lastName:saleDraft.lastName,invoice:saleDraft.invoice,notes:saleDraft.notes,migrated:false}));
 arr.splice(insertAt,0,...rows);window.mfCompanySync44(row());save();saleDraft=null;renderAccounting50()
};
window.accountRemoveSaleGroup50=function(index){
 const g=currentSaleGroup50(index);if(!g||!confirm('Usunąć całą sprzedaż tego klienta / faktury również z Firma+?'))return;
 const arr=lines('s');[...g.sourceIndexes].sort((a,b)=>b-a).forEach(i=>arr.splice(i,1));window.mfCompanySync44(row());save();renderAccounting50()
};

window.accountEdit50=function(kind,index=-1){
 if(kind==='s'){
  if(index<0)return window.accountEditSale50(-1);
  const gi=saleGroups().findIndex(g=>g.sourceIndexes.includes(index));return window.accountEditSale50(gi)
 }
 const l=index<0?{}:lines(kind)[index],p=G('accountEditor50');
 p.innerHTML='<div class="card acEditor50"><h3>'+(index<0?'Dodaj':'Edytuj')+' fakturę zakupową</h3><form id="accountForm50"><div class="acFields50">'+field('date','Data otrzymania',l.date||selected()+'-01','date')+field('supplier','Nazwa sprzedawcy',l.supplier)+field('ksef','Numer KSeF',l.ksef)+field('invoice','Numer faktury',l.invoice)+field('gross','Kwota brutto',l.gross??'','number')+'<label>Stawka VAT'+vatSelect50('ac_vatRate',l.vatRate??23)+'</label>'+field('notes','Uwagi',l.notes)+'</div><p id="acPreview50" class="acPreview50"></p><p id="acError50" role="alert"></p><div class="acActions50"><button type="submit" class="btn primary">Zapisz pozycję</button><button type="button" class="btn" onclick="document.getElementById(\'accountEditor50\').innerHTML=\'\'">Anuluj</button></div></form></div>';
 const form=G('accountForm50');form.oninput=()=>{const c=window.mfCompanyLine44({gross:G('ac_gross').value,vatRate:G('ac_vatRate').value});G('acPreview50').textContent='Netto bez VAT: '+money(c.net)+' • VAT: '+money(c.vat)};form.oninput();form.onsubmit=e=>{e.preventDefault();window.accountSave50(kind,index)};p.scrollIntoView({behavior:'smooth',block:'start'})
};
window.accountSave50=function(kind,index){
 if(kind==='s')return;
 const get=k=>G('ac_'+k)?.value.trim()||'',date=get('date'),gross=Number(get('gross'));
 if(!date||date.slice(0,7)!==selected()||!Number.isFinite(gross)||gross<=0||!get('supplier')){G('acError50').textContent='Podaj sprzedawcę, kwotę większą od zera i datę z wybranego miesiąca.';return}
 const arr=lines(kind),l={...(index<0?{}:arr[index]),gross,vatRate:get('vatRate')==='zw'?'zw':Number(get('vatRate')),date,invoice:get('invoice'),notes:get('notes'),migrated:false,supplier:get('supplier'),ksef:get('ksef')};
 if(index<0)arr.push(l);else arr[index]=l;window.mfCompanySync44(row());save();renderAccounting50()
};
window.accountRemove50=function(kind,index){
 if(kind==='s'){const gi=saleGroups().findIndex(g=>g.sourceIndexes.includes(index));return window.accountRemoveSaleGroup50(gi)}
 if(!confirm('Usunąć tę pozycję również z Firma+?'))return;lines(kind).splice(index,1);window.mfCompanySync44(row());save();renderAccounting50()
};

function saleTable50(groups,actions=true){
 const headers=['Lp','Klient / faktura','Pozycje','Data','Brutto','VAT','Netto','Uwagi'];
 let html='<div class="acTableScroll50"><table class="acTable50 acSalesTable50"><thead><tr>'+headers.map(h=>'<th>'+h+'</th>').join('')+(actions?'<th>Akcje</th>':'')+'</tr></thead><tbody>';
 groups.forEach((g,i)=>{
  const client=[g.firstName,g.lastName].filter(Boolean).join(' ')||'Klient',items=g.items.map(it=>'<div class="acItemCell50"><b>'+esc(it.product||'Uzupełnij opis')+'</b><span>'+N(it.quantity)+' × '+money(it.unitGross)+' • '+(it.vatRate==='zw'?'zw.':it.vatRate+'% VAT')+'</span></div>').join('');
  html+='<tr><td>'+(i+1)+'</td><td><b>'+esc(client)+'</b><small>'+esc(g.invoice||'bez numeru faktury')+'</small></td><td>'+items+'</td><td>'+esc(g.date||'Uzupełnij datę')+'</td><td>'+money(g.gross)+'</td><td>'+money(g.vat)+'</td><td>'+money(g.net)+'</td><td>'+esc(g.notes||'')+'</td>'+(actions?'<td><button class="btn" onclick="accountEditSale50('+i+')">Edytuj</button> <button class="btn danger" onclick="accountRemoveSaleGroup50('+i+')">Usuń</button></td>':'')+'</tr>'
 });
 if(!groups.length)html+='<tr><td colspan="'+(headers.length+(actions?1:0))+'">Brak sprzedaży w tym miesiącu.</td></tr>';
 return html+'</tbody></table></div>'
}
function purchaseTable50(list,actions=true){
 const headers=['Lp','Nazwa sprzedawcy','Nr KSeF','Nr faktury','Data otrzymania','Netto bez VAT','Brutto','VAT'];let html='<div class="acTableScroll50"><table class="acTable50"><thead><tr>'+headers.map(h=>'<th>'+h+'</th>').join('')+(actions?'<th>Akcje</th>':'')+'</tr></thead><tbody>';
 list.forEach((l,i)=>{const cells=[i+1,l.supplier||'Uzupełnij dostawcę',l.ksef,l.invoice,l.date||'Uzupełnij datę',money(l.net),money(l.gross),money(l.vat)];html+='<tr>'+cells.map(c=>'<td>'+esc(c)+'</td>').join('')+(actions?'<td><button class="btn" onclick="accountEdit50(\'c\','+l.index+')">Edytuj</button> <button class="btn danger" onclick="accountRemove50(\'c\','+l.index+')">Usuń</button></td>':'')+'</tr>'});
 if(!list.length)html+='<tr><td colspan="'+(headers.length+(actions?1:0))+'">Brak faktur zakupowych w tym miesiącu.</td></tr>';return html+'</tbody></table></div>'
}
function renderAccounting50(){
 const host=G('accountingBody50');if(!host)return;
 const r=report(),s=r.summary,missing=r.sales.filter(l=>!l.date||!l.product).length+r.purchases.filter(l=>!l.date||!l.supplier).length;
 host.innerHTML='<div class="card acToolbar50"><div><label>Miesiąc zestawienia<input type="month" value="'+esc(selected())+'" onchange="accountMonth50(this.value)"></label></div><div class="acActions50"><button class="btn primary" onclick="accountExport50()">Pobierz Excel (.xlsx)</button><button class="btn" onclick="accountPrint50()">Drukuj / PDF</button></div></div><div class="acTotals50">'+[['Sprzedaż',s.sales],['Zakupy',s.costs]].map(([title,c])=>'<section><h3>'+title+' — '+r.month+'</h3><div><span>Netto bez VAT</span><b>'+money(c.net)+'</b></div><div><span>VAT</span><b>'+money(c.vat)+'</b></div><div><span>Brutto</span><b>'+money(c.gross)+'</b></div></section>').join('')+'</div>'+(missing?'<p class="acNotice50">'+missing+' pozycji wymaga uzupełnienia daty lub opisu. Kwoty są już uwzględnione.</p>':'')+'<div id="accountEditor50"></div><section class="card"><div class="title">Sprzedaż / dane do faktury <button class="btn primary" onclick="accountEditSale50()">＋ Dodaj sprzedaż</button></div><p class="muted">Jeden klient lub jedna faktura może zawierać wiele pozycji. Każda pozycja ma własną ilość, cenę jednostkową brutto i stawkę VAT.</p>'+saleTable50(r.salesGroups)+'</section><section class="card"><div class="title">Faktury zakupowe <button class="btn primary" onclick="accountEdit50(\'c\')">＋ Dodaj fakturę</button></div>'+purchaseTable50(r.purchases)+'</section>'
}
function sheetRows(r,kind){
 if(kind==='s'){
  const rows=[['Lp faktury','Klient','Produkt / usługa','Ilość','Cena jedn. brutto','Brutto','VAT %','VAT','Netto bez VAT','Data','Nr faktury','Uwagi']];
  r.salesGroups.forEach((g,gi)=>g.items.forEach(it=>rows.push([gi+1,[g.firstName,g.lastName].filter(Boolean).join(' '),it.product,N(it.quantity),N(it.unitGross),N(it.gross),it.vatRate==='zw'?'zw.':it.vatRate+'%',N(it.vat),N(it.net),g.date||'',g.invoice||'',g.notes||''])));
  rows.push(['SUMA','','','','',r.summary.sales.gross,'',r.summary.sales.vat,r.summary.sales.net,'','','']);return rows
 }
 const rows=[['Lp','Nazwa sprzedawcy','Nr KSeF','Nr faktury','Data otrzymania','Netto bez VAT','Brutto','VAT','Uwagi']];
 r.purchases.forEach((l,i)=>rows.push([i+1,l.supplier||'',l.ksef||'',l.invoice||'',l.date||'',l.net,l.gross,l.vat,l.notes||'']));rows.push(['SUMA','','','','',r.summary.costs.net,r.summary.costs.gross,r.summary.costs.vat,'']);return rows
}
function xml(v){return esc(v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'')}
function worksheet(rows){
 const col=n=>{let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s};
 return'<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="10" customWidth="1"/><col min="2" max="12" width="24" customWidth="1"/></cols><sheetData>'+rows.map((r,i)=>'<row r="'+(i+1)+'">'+r.map((v,j)=>'<c r="'+col(j)+(i+1)+'" '+(typeof v==='number'?'s="1"><v>'+v+'</v>':'t="inlineStr"><is><t xml:space="preserve">'+xml(v)+'</t></is>')+'</c>').join('')+'</row>').join('')+'</sheetData></worksheet>'
}
function zip(files){
 const encoder=new TextEncoder(),parts=[],central=[];let offset=0;
 const crc=data=>{let c=0xffffffff;for(const b of data){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0)}return(c^0xffffffff)>>>0};
 const header=(size,write)=>{const a=new Uint8Array(size);write(new DataView(a.buffer));return a};
 for(const [name,text] of Object.entries(files)){const n=encoder.encode(name),d=encoder.encode(text),c=crc(d),h=header(30,v=>{v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint32(14,c,true);v.setUint32(18,d.length,true);v.setUint32(22,d.length,true);v.setUint16(26,n.length,true)}),ch=header(46,v=>{v.setUint32(0,0x02014b50,true);v.setUint16(4,20,true);v.setUint16(6,20,true);v.setUint32(16,c,true);v.setUint32(20,d.length,true);v.setUint32(24,d.length,true);v.setUint16(28,n.length,true);v.setUint32(42,offset,true)});parts.push(h,n,d);central.push(ch,n);offset+=30+n.length+d.length}
 const length=central.reduce((n,p)=>n+p.length,0),end=header(22,v=>{v.setUint32(0,0x06054b50,true);v.setUint16(8,Object.keys(files).length,true);v.setUint16(10,Object.keys(files).length,true);v.setUint32(12,length,true);v.setUint32(16,offset,true)}),out=new Uint8Array(offset+length+22);let at=0;for(const p of [...parts,...central,end]){out.set(p,at);at+=p.length}return out
}
function workbook(r){
 return zip({'[Content_Types].xml':'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles"/></Types>','_rels/.rels':'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>','xl/workbook.xml':'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sprzedaż '+r.month+'" sheetId="1" r:id="rId1"/><sheet name="Zakupy '+r.month+'" sheetId="2" r:id="rId2"/></sheets></workbook>','xl/_rels/workbook.xml.rels':'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>','xl/styles.xml':'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="2" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs></styleSheet>','xl/worksheets/sheet1.xml':worksheet(sheetRows(r,'s')),'xl/worksheets/sheet2.xml':worksheet(sheetRows(r,'c'))})
}
window.accountExport50=function(){const r=report(),url=URL.createObjectURL(new Blob([workbook(r)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})),a=document.createElement('a');a.href=url;a.download='Zestawienie-dla-ksiegowej-'+r.month+'.xlsx';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)};
window.accountPrint50=function(){
 const r=report(),w=window.open('','_blank');if(!w){alert('Zezwól na otwarcie okna zestawienia.');return}
 w.document.write('<!doctype html><html lang="pl"><meta charset="utf-8"><title>Zestawienie '+r.month+'</title><style>body{font:12px Arial;color:#172238}table{border-collapse:collapse;width:100%;margin:16px 0}th,td{border:1px solid #ddd;padding:6px;text-align:left;vertical-align:top}th{background:#edf3fa}small{display:block;color:#666}@page{size:A4 landscape;margin:12mm}@media print{button{display:none}}</style><h1>Zestawienie dla księgowej — '+r.month+'</h1><button onclick="window.print()">Drukuj / zapisz PDF</button><h2>Sprzedaż</h2>'+saleTable50(r.salesGroups,false)+'<p><b>Suma: netto '+money(r.summary.sales.net)+' • VAT '+money(r.summary.sales.vat)+' • brutto '+money(r.summary.sales.gross)+'</b></p><h2>Faktury zakupowe</h2>'+purchaseTable50(r.purchases,false)+'<p><b>Suma: netto '+money(r.summary.costs.net)+' • VAT '+money(r.summary.costs.vat)+' • brutto '+money(r.summary.costs.gross)+'</b></p>');w.document.close()
};
window.mfAccounting50={report,workbook,sheetRows,saleGroups};
window.renderAccounting50=renderAccounting50;
const old=window.render;if(typeof old==='function'&&!old.__account50){let fn=function(){const out=old();renderAccounting50();return out};fn.__account50=true;window.render=fn}
const st=document.createElement('style');st.textContent='.acSaleCustomer50{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}.acSaleItemsHead50{display:flex;justify-content:space-between;align-items:center;margin:14px 0 7px}.acSaleItem50{display:grid;grid-template-columns:30px minmax(180px,1.5fr) 80px 130px 95px minmax(150px,1fr) auto;gap:7px;align-items:end;padding:9px;border:1px solid #e4e9f0;border-radius:11px;margin:7px 0;background:#fff}.acSaleItemNo50{display:grid;place-items:center;width:26px;height:26px;border-radius:8px;background:#edf3fa;color:#45617f;font-weight:800}.acSaleCalc50{font-size:9px;color:#748197}.acSaleCalc50 span{display:block}.acSaleTotal50{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0}.acSaleTotal50>div{padding:10px;border-radius:10px;background:#f3f7fb}.acSaleTotal50 span,.acSaleTotal50 b{display:block}.acSaleTotal50 span{font-size:8px;color:#7d899b}.acSaleTotal50 b{margin-top:3px;color:#315274}.acSalesTable50 td{vertical-align:top}.acSalesTable50 td small{display:block;margin-top:3px;color:#7e8b9c}.acItemCell50+ .acItemCell50{margin-top:6px;padding-top:6px;border-top:1px solid #edf1f5}.acItemCell50 b,.acItemCell50 span{display:block}.acItemCell50 span{font-size:9px;color:#7e8b9c;margin-top:2px}@media(max-width:900px){.acSaleCustomer50{grid-template-columns:1fr 1fr}.acSaleItem50{grid-template-columns:28px 1fr 80px 110px}.acSaleItem50 .acSaleCalc50{grid-column:2/4}.acSaleItem50 .btn{grid-column:4}}@media(max-width:560px){.acSaleCustomer50{grid-template-columns:1fr}.acSaleItem50{grid-template-columns:26px 1fr 70px}.acSaleItem50 label:nth-of-type(3),.acSaleItem50 label:nth-of-type(4){grid-column:2/4}.acSaleItem50 .acSaleCalc50{grid-column:2/4}.acSaleItem50 .btn{grid-column:2/4;justify-self:start}}';document.head.appendChild(st);
})();