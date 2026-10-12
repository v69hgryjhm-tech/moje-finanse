import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
const year={company:Array.from({length:12},()=>({}))};
year.company[8]={salesLines:[{gross:40,vatRate:23,product:'=FORM <x>',date:'2026-09-02',firstName:'Jan',notes:'Vinted'}],costLines:[{gross:246,vatRate:23,supplier:'Firma',ksef:'00123',invoice:'FS/09'}]};
const ctx={TextEncoder,Uint8Array,DataView,Intl,Date,S:{selectedYear:2026,years:{2026:year}},Y:()=>year,save(){},document:{getElementById:()=>null,createElement:()=>({}),head:{appendChild(){}}}};
ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync('v44business.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('v50accounting.js','utf8'),ctx);
ctx.accountMonth50('2026-09');
const r=ctx.mfAccounting50.report();
assert.equal(r.sales.length,1);assert.equal(r.summary.sales.net,32.52);assert.equal(r.summary.sales.vat,7.48);
assert.equal(r.summary.costs.net,200);assert.equal(year.company[8].salesLines[0].product,'=FORM <x>');
ctx.accountMonth50('2026-10');assert.equal(ctx.mfAccounting50.report().sales.length,0);
ctx.accountMonth50('2026-09');
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
 assert sales.find('.//s:c[@r="B2"]/s:is/s:t',ns).text=='=FORM <x>'
 assert sales.find('.//s:c[@r="I2"]/s:v',ns).text=='32.52'
 assert sales.find('.//s:c[@r="F3"]/s:v',ns).text=='40'
 purchases=E.fromstring(z.read('xl/worksheets/sheet2.xml'))
 assert purchases.find('.//s:c[@r="C2"]/s:is/s:t',ns).text=='00123'
`,file]);
const business=fs.readFileSync('v44business.js','utf8');
assert.ok(business.includes("...rowFor(S.selectedYear,i)[kind==='s'?'salesLines':'costLines'][j]"));
console.log('PASS — monthly isolation, VAT totals, shared metadata and valid two-sheet XLSX with safe text.');
