import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=fs.readFileSync('v26forecast.js','utf8');
const nodes=new Map();
function element(){return {children:[],textContent:'',append(...items){this.children.push(...items)},appendChild(item){this.children.push(item)},querySelector(){return null},remove(){},insertAdjacentElement(_,item){this.hint=item}}}
for(const id of ['home','companyTile','companyProfitHome','companyNetHome','companyRevenueHome','homeBars']){
 const e=element();e.previousElementSibling=element();e.parentElement=element();e.closest=()=>({firstElementChild:element()});nodes.set(id,e);
}
const ctx={Intl,Date,console,S:{selectedYear:new Date().getFullYear()+1,loans:[]},document:{getElementById:id=>nodes.get(id),querySelector:()=>null,createElement:element,head:element()},render(){}};
ctx.window=ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('v44business.js','utf8'),ctx);
const makeYear=lines=>({salary:Array.from({length:12},()=>({})),company:Array.from({length:12},(_,i)=>({salesLines:i===0?lines:[],costLines:i===0?[{gross:246,vatRate:23}]:[],zus:i===0?50:0,health:i===0?20:0,tax:i===0?30:0}))});
let year;
ctx.Y=()=>year;
ctx.sal=()=>({rows:Array.from({length:12},()=>({total:0,g:0}))});
vm.runInContext(source,ctx);
const fmt=n=>new Intl.NumberFormat('pl-PL',{style:'currency',currency:'PLN',minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
for(const [lines,expected] of [
 [[{gross:1363.97,vatRate:23}],1108.92],
 [[{gross:123,vatRate:23},{gross:108,vatRate:8},{gross:105,vatRate:5},{gross:100,vatRate:0},{gross:100,vatRate:'zw'}],500],
 [[],0]
]){
 year=makeYear(lines);
 ctx.render();
 assert.equal(nodes.get('companyTile').textContent,fmt(expected));
 const bars=nodes.get('homeBars').innerHTML;
 assert.ok(bars.includes('<b>'+fmt(expected)+'</b><small>FIRMA — NETTO BEZ VAT</small><span>prognoza +'+fmt(expected*11)+'</span>'), 'Słupek firmy musi pokazywać sprzedaż bez VAT, przed kosztami');
 assert.equal(nodes.get('companyNetHome').textContent,fmt(expected));
 assert.match(nodes.get('companyTile').previousElementSibling.textContent,/NETTO BEZ VAT/);
 const summary=ctx.mfCompanySummary44(year.company[0]);
 assert.equal(nodes.get('companyRevenueHome').textContent,fmt(summary.sales.gross));
 assert.equal(nodes.get('companyProfitHome').textContent,fmt(summary.cash));
 assert.equal(nodes.get('companyTile').hint.children[0].children[1].textContent,fmt(expected*11));
 assert.equal(nodes.get('companyTile').hint.children[1].children[1].textContent,fmt(expected*12));
 assert.equal(nodes.get('companyTile').parentElement.children.length,0);
}
const html=fs.readFileSync('index.html','utf8');
assert.match(html,/FIRMA — SPRZEDAŻ NETTO BEZ VAT/);
for(const file of ['index.html','v43boot.js','v47ux.js','fresh-260.html','app-252.html'])assert.match(fs.readFileSync(file,'utf8'),/4\.8\.2/);
assert.ok([...html.matchAll(/[?]v=(\d+)/g)].every(m=>m[1]==='482'));
assert.match(fs.readFileSync('manifest.json','utf8'),/v=482/);
console.log('PASS — karta i prognoza netto bez VAT, mieszane stawki, zero, brutto, wynik po kosztach oraz wersja/cache.');
