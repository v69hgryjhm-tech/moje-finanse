/* Monthly accountant ledger: one shared source with Firma+ */
(function(){
'use strict';
const G=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN'}).format(v||0);
let month='';
function selected(){if(!month)month=S.selectedYear+'-'+String(new Date().getMonth()+1).padStart(2,'0');return month}
function row(){
 const [y,m]=selected().split('-').map(Number);
 if(!S.years[y]){let old=S.selectedYear;S.selectedYear=y;Y();S.selectedYear=old}
 const r=S.years[y].company[m-1];window.mfCompanySummary44(r);return r;
}
function lines(kind){return row()[kind==='s'?'salesLines':'costLines']}
function report(){
 const r=row(),summary=window.mfCompanySummary44(r);
 const list=kind=>lines(kind).map((l,index)=>({...l,index,...window.mfCompanyLine44(l)})).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999')||a.index-b.index);
 return {month:selected(),sales:list('s'),purchases:list('c'),summary};
}
function field(id,label,value='',type='text'){return '<label>'+label+'<input id="ac_'+id+'" type="'+type+'" value="'+esc(value)+'" '+(type==='number'?'min="0" step="0.01"':'')+'></label>'}
window.accountMonth50=function(v){if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(v))return;month=v;renderAccounting50()};
window.accountEdit50=function(kind,index=-1){
 const l=index<0?{}:lines(kind)[index],p=G('accountEditor50');
 p.innerHTML='<div class="card acEditor50"><h3>'+(index<0?'Dodaj':'Edytuj')+' '+(kind==='s'?'sprzedaż':'fakturę zakupową')+'</h3><form id="accountForm50"><div class="acFields50">'+
 field('date',kind==='s'?'Data sprzedaży':'Data otrzymania',l.date||selected()+'-01','date')+
 (kind==='s'?field('product','Produkt / usługa',l.product)+field('firstName','Imię',l.firstName)+field('lastName','Nazwisko',l.lastName):field('supplier','Nazwa sprzedawcy',l.supplier)+field('ksef','Numer KSeF',l.ksef))+
 field('invoice','Numer faktury (jeśli dotyczy)',l.invoice)+field('gross','Kwota brutto',l.gross??'','number')+
 '<label>Stawka VAT<select id="ac_vatRate">'+[23,8,5,0,'zw'].map(v=>'<option '+(String(v)===String(l.vatRate??23)?'selected':'')+' value="'+v+'">'+(v==='zw'?'zwolnione':v+'%')+'</option>').join('')+'</select></label>'+field('notes','Uwagi / kanał sprzedaży',l.notes)+
 '</div><p id="acPreview50" class="acPreview50"></p><p id="acError50" role="alert"></p><div class="acActions50"><button type="submit" class="btn primary">Zapisz pozycję</button><button type="button" class="btn" onclick="document.getElementById(\'accountEditor50\').innerHTML=\'\'">Anuluj</button></div></form></div>';
 const form=G('accountForm50');form.oninput=()=>{const c=window.mfCompanyLine44({gross:G('ac_gross').value,vatRate:G('ac_vatRate').value});G('acPreview50').textContent='Netto bez VAT: '+money(c.net)+' • VAT: '+money(c.vat)};
 form.oninput();form.onsubmit=e=>{e.preventDefault();window.accountSave50(kind,index)};
 p.scrollIntoView({behavior:'smooth',block:'start'});
};
window.accountSave50=function(kind,index){
 const get=k=>G('ac_'+k)?.value.trim()||'',date=get('date'),gross=Number(get('gross'));
 if(!date||date.slice(0,7)!==selected()||!Number.isFinite(gross)||gross<=0||!(kind==='s'?get('product'):get('supplier'))){G('acError50').textContent='Podaj opis, kwotę większą od zera i datę z wybranego miesiąca.';return}
 const arr=lines(kind),l={...(index<0?{}:arr[index]),gross,vatRate:get('vatRate')==='zw'?'zw':Number(get('vatRate')),date,invoice:get('invoice'),notes:get('notes'),migrated:false};
 for(const k of (kind==='s'?['product','firstName','lastName']:['supplier','ksef']))l[k]=get(k);
 if(index<0)arr.push(l);else arr[index]=l;
 window.mfCompanySync44(row());save();window.render?.();renderAccounting50();
};
window.accountRemove50=function(kind,index){if(!confirm('Usunąć tę pozycję również z Firma+?'))return;lines(kind).splice(index,1);window.mfCompanySync44(row());save();window.render?.();renderAccounting50()};
function table(kind,list,actions=true){
 const sale=kind==='s',headers=sale?['Lp','Produkt','Imię','Nazwisko','Data','Brutto','VAT %','VAT','Netto bez VAT','Uwagi / faktura']:['Lp','Nazwa sprzedawcy','Nr KSeF','Nr faktury','Data otrzymania','Netto bez VAT','Brutto','VAT'];
 let html='<div class="acTableScroll50"><table class="acTable50"><thead><tr>'+headers.map(h=>'<th>'+h+'</th>').join('')+(actions?'<th>Akcje</th>':'')+'</tr></thead><tbody>';
 list.forEach((l,i)=>{const cells=sale?[i+1,l.product||'Uzupełnij opis',l.firstName,l.lastName,l.date||'Uzupełnij datę',money(l.gross),l.rate==='zw'?'zw.':l.rate+'%',money(l.vat),money(l.net),[l.notes,l.invoice].filter(Boolean).join(' • ')]:[i+1,l.supplier||'Uzupełnij dostawcę',l.ksef,l.invoice,l.date||'Uzupełnij datę',money(l.net),money(l.gross),money(l.vat)];
 html+='<tr>'+cells.map(c=>'<td>'+esc(c)+'</td>').join('')+(actions?'<td><button class="btn" onclick="accountEdit50(\''+kind+'\','+l.index+')">Edytuj</button> <button class="btn danger" onclick="accountRemove50(\''+kind+'\','+l.index+')">Usuń</button></td>':'')+'</tr>'});
 if(!list.length)html+='<tr><td colspan="'+(headers.length+(actions?1:0))+'">Brak pozycji w tym miesiącu.</td></tr>';
 return html+'</tbody></table></div>';
}
function renderAccounting50(){
 const host=G('accountingBody50');if(!host)return;
 const r=report(),s=r.summary,missing=[...r.sales,...r.purchases].filter(l=>!l.date||!(l.product||l.supplier)).length;
 host.innerHTML='<div class="card acToolbar50"><div><label>Miesiąc zestawienia<input type="month" value="'+esc(selected())+'" onchange="accountMonth50(this.value)"></label></div><div class="acActions50"><button class="btn primary" onclick="accountExport50()">Pobierz Excel (.xlsx)</button><button class="btn" onclick="accountPrint50()">Drukuj / PDF</button></div></div>'+
 '<div class="acTotals50">'+[['Sprzedaż',s.sales],['Zakupy',s.costs]].map(([title,c])=>'<section><h3>'+title+' — '+r.month+'</h3><div><span>Netto bez VAT</span><b>'+money(c.net)+'</b></div><div><span>VAT</span><b>'+money(c.vat)+'</b></div><div><span>Brutto</span><b>'+money(c.gross)+'</b></div></section>').join('')+'</div>'+
 (missing?'<p class="acNotice50">'+missing+' pozycji z Firma+ wymaga uzupełnienia daty lub opisu. Kwoty są już uwzględnione.</p>':'')+
 '<div id="accountEditor50"></div>'+
 '<section class="card"><div class="title">Sprzedaż <button class="btn primary" onclick="accountEdit50(\'s\')">＋ Dodaj sprzedaż</button></div>'+table('s',r.sales)+'</section>'+
 '<section class="card"><div class="title">Faktury zakupowe <button class="btn primary" onclick="accountEdit50(\'c\')">＋ Dodaj fakturę</button></div>'+table('c',r.purchases)+'</section>';
}
function sheetRows(r,kind){
 const sale=kind==='s',list=sale?r.sales:r.purchases,c=sale?r.summary.sales:r.summary.costs;
 const rows=[sale?['Lp','Produkt','Imię','Nazwisko','Data','Brutto','VAT %','VAT','Netto bez VAT','Uwagi','Nr faktury']:['Lp','Nazwa sprzedawcy','Nr KSeF','Nr faktury','Data otrzymania','Netto bez VAT','Brutto','VAT','Uwagi']];
 list.forEach((l,i)=>rows.push(sale?[i+1,l.product||'',l.firstName||'',l.lastName||'',l.date||'',l.gross,l.rate==='zw'?'zw.':l.rate+'%',l.vat,l.net,l.notes||'',l.invoice||'']:[i+1,l.supplier||'',l.ksef||'',l.invoice||'',l.date||'',l.net,l.gross,l.vat,l.notes||'']));
 rows.push(sale?['SUMA','','','','',c.gross,'',c.vat,c.net,'','']:['SUMA','','','','',c.net,c.gross,c.vat,'']);
 return rows;
}
function xml(v){return esc(v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'')}
function worksheet(rows){
 const col=n=>{let s='';for(n++;n;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s};
 return '<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols><col min="1" max="1" width="7" customWidth="1"/><col min="2" max="11" width="24" customWidth="1"/></cols><sheetData>'+
 rows.map((r,i)=>'<row r="'+(i+1)+'">'+r.map((v,j)=>'<c r="'+col(j)+(i+1)+'" '+(typeof v==='number'?'s="1"><v>'+v+'</v>':'t="inlineStr"><is><t xml:space="preserve">'+xml(v)+'</t></is>')+'</c>').join('')+'</row>').join('')+'</sheetData></worksheet>';
}
// Standard uncompressed ZIP container; numeric cells remain numeric and text cannot become formulas.
function zip(files){
 const encoder=new TextEncoder(),parts=[],central=[];let offset=0;
 const crc=data=>{let c=0xffffffff;for(const b of data){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0};
 const header=(size,write)=>{const a=new Uint8Array(size);write(new DataView(a.buffer));return a};
 for(const [name,text] of Object.entries(files)){
  const n=encoder.encode(name),d=encoder.encode(text),c=crc(d);
  const h=header(30,v=>{v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint32(14,c,true);v.setUint32(18,d.length,true);v.setUint32(22,d.length,true);v.setUint16(26,n.length,true)});
  const ch=header(46,v=>{v.setUint32(0,0x02014b50,true);v.setUint16(4,20,true);v.setUint16(6,20,true);v.setUint32(16,c,true);v.setUint32(20,d.length,true);v.setUint32(24,d.length,true);v.setUint16(28,n.length,true);v.setUint32(42,offset,true)});
  parts.push(h,n,d);central.push(ch,n);offset+=30+n.length+d.length;
 }
 const length=central.reduce((n,p)=>n+p.length,0),end=header(22,v=>{v.setUint32(0,0x06054b50,true);v.setUint16(8,Object.keys(files).length,true);v.setUint16(10,Object.keys(files).length,true);v.setUint32(12,length,true);v.setUint32(16,offset,true)});
 const out=new Uint8Array(offset+length+22);let at=0;for(const p of [...parts,...central,end]){out.set(p,at);at+=p.length}return out;
}
function workbook(r){
 return zip({
 '[Content_Types].xml':'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
 '_rels/.rels':'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
 'xl/workbook.xml':'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sprzedaż '+r.month+'" sheetId="1" r:id="rId1"/><sheet name="Zakupy '+r.month+'" sheetId="2" r:id="rId2"/></sheets></workbook>',
 'xl/_rels/workbook.xml.rels':'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
 'xl/styles.xml':'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="2" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/></cellXfs></styleSheet>',
 'xl/worksheets/sheet1.xml':worksheet(sheetRows(r,'s')),
 'xl/worksheets/sheet2.xml':worksheet(sheetRows(r,'c'))
 });
}
window.accountExport50=function(){const r=report(),url=URL.createObjectURL(new Blob([workbook(r)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})),a=document.createElement('a');a.href=url;a.download='Zestawienie-dla-ksiegowej-'+r.month+'.xlsx';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)};
window.accountPrint50=function(){
 const r=report(),w=window.open('','_blank');if(!w){alert('Zezwól na otwarcie okna zestawienia.');return}
 w.document.write('<!doctype html><html lang="pl"><meta charset="utf-8"><title>Zestawienie '+r.month+'</title><style>body{font:12px Arial;color:#172238}table{border-collapse:collapse;width:100%;margin:16px 0}th,td{border:1px solid #ddd;padding:6px;text-align:left}th{background:#edf3fa}h2{margin-top:28px}@page{size:A4 landscape;margin:12mm}@media print{button{display:none}}</style><h1>Zestawienie dla księgowej — '+r.month+'</h1><button onclick="window.print()">Drukuj / zapisz PDF</button>'+['s','c'].map(k=>{const c=k==='s'?r.summary.sales:r.summary.costs;return '<h2>'+(k==='s'?'Sprzedaż':'Faktury zakupowe')+'</h2>'+table(k,k==='s'?r.sales:r.purchases,false)+'<p><b>Suma: netto bez VAT '+money(c.net)+' • VAT '+money(c.vat)+' • brutto '+money(c.gross)+'</b></p>'}).join('')+'</html>');w.document.close();
};
window.mfAccounting50={report,workbook,sheetRows};
window.renderAccounting50=renderAccounting50;
const old=window.render;if(typeof old==='function')window.render=function(){const out=old();renderAccounting50();return out};
})();