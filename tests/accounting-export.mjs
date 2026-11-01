import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const year={company:Array.from({length:12},()=>({}))};
year.company[8]={
  salesLines:[
    {saleGroupId:'g1',gross:80,unitGross:40,quantity:2,vatRate:23,product:'Lampa <x>',date:'2026-09-02',firstName:'Jan',lastName:'Kowalski',invoice:'FV/1',notes:'Sklep'},
    {saleGroupId:'g1',gross:54,unitGross:18,quantity:3,vatRate:8,product:'Nakładka',date:'2026-09-02',firstName:'Jan',lastName:'Kowalski',invoice:'FV/1',notes:'Sklep'}
  ],
  costLines:[{gross:246,vatRate:23,supplier:'Firma',ksef:'00123',invoice:'FS/09'}]
};
const ctx={TextEncoder,Uint8Array,DataView,Intl,Date,S:{selectedYear:2026,years:{2026:year}},Y:()=>year,save(){},document:{getElementById:()=>null,createElement:()=>({}),head:{appendChild(){}}}};
ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync('v44business.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('v50accounting.js','utf8'),ctx);

ctx.accountMonth50('2026-09');
const r=ctx.mfAccounting50.report();
assert.equal(r.sales.length,2);
assert.equal(r.salesGroups.length,1);
assert.equal(r.salesGroups[0].items.length,2);
assert.equal(r.salesGroups[0].items[0].quantity,2);
assert.equal(r.salesGroups[0].items[0].unitGross,40);
assert.equal(r.salesGroups[0].items[1].quantity,3);
assert.equal(r.salesGroups[0].gross,134);
assert.equal(r.summary.sales.net,115.04);
assert.equal(r.summary.sales.vat,18.96);
assert.equal(r.summary.costs.net,200);
assert.equal(year.company[8].salesLines[0].product,'Lampa <x>');

ctx.accountMonth50('2026-10');
assert.equal(ctx.mfAccounting50.report().sales.length,0);
ctx.accountMonth50('2026-09');

const rows=ctx.mfAccounting50.sheetRows(ctx.mfAccounting50.report(),'s');
assert.deepEqual(Array.from(rows[0]),['Lp faktury','Klient','Produkt / usługa','Ilość','Cena jedn. brutto','Brutto','VAT %','VAT','Netto bez VAT','Data','Nr faktury','Uwagi']);
assert.equal(rows[1][1],'Jan Kowalski');
assert.equal(rows[1][2],'Lampa <x>');
assert.equal(rows[1][3],2);
assert.equal(rows[1][4],40);
assert.equal(rows[2][2],'Nakładka');
assert.equal(rows[2][3],3);
assert.equal(rows[2][4],18);

const bytes=ctx.mfAccounting50.workbook(ctx.mfAccounting50.report());
const file='/tmp/accounting-test.xlsx';fs.writeFileSync(file,bytes);
execFileSync('python3',['-c',String.raw`
import zipfile,xml.etree.ElementTree as E,sys
with zipfile.ZipFile(sys.argv[1]) as z:
 assert z.testzip() is None
 for p in z.namelist(): E.fromstring(z.read(p))
 ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
 sales=E.fromstring(z.read('xl/worksheets/sheet1.xml'))
 assert len(sales.findall('.//s:f',ns))==0
 assert sales.find('.//s:c[@r="B2"]/s:is/s:t',ns).text=='Jan Kowalski'
 assert sales.find('.//s:c[@r="C2"]/s:is/s:t',ns).text=='Lampa <x>'
 assert sales.find('.//s:c[@r="D2"]/s:v',ns).text=='2'
 assert sales.find('.//s:c[@r="E2"]/s:v',ns).text=='40'
 assert sales.find('.//s:c[@r="F2"]/s:v',ns).text=='80'
 assert sales.find('.//s:c[@r="C3"]/s:is/s:t',ns).text=='Nakładka'
 assert sales.find('.//s:c[@r="D3"]/s:v',ns).text=='3'
 assert sales.find('.//s:c[@r="F4"]/s:v',ns).text=='134'
 assert sales.find('.//s:c[@r="H4"]/s:v',ns).text=='18.96'
 assert sales.find('.//s:c[@r="I4"]/s:v',ns).text=='115.04'
 purchases=E.fromstring(z.read('xl/worksheets/sheet2.xml'))
 assert purchases.find('.//s:c[@r="C2"]/s:is/s:t',ns).text=='00123'
`,file]);

const accounting=fs.readFileSync('v50accounting.js','utf8');
assert.ok(accounting.includes('saleGroupId'));
assert.ok(accounting.includes('quantity'));
assert.ok(accounting.includes('unitGross'));
assert.ok(accounting.includes('accountAddSaleItem50'));

console.log('PASS — jedna sprzedaż może mieć wiele pozycji, ilości, ceny jednostkowe, różne VAT-y i poprawny XLSX.');
