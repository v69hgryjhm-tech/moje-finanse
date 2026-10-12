import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=fs.readFileSync('v26forecast.js','utf8');
const nodes=new Map();
function element(){return {children:[],style:{},textContent:'',append(...items){this.children.push(...items)},appendChild(item){this.children.push(item)},querySelector(){return null},remove(){},insertAdjacentElement(_,item){this.hint=item}}}
for(const id of ['home','companyTile','companyProfitHome','companyNetHome','companyRevenueHome','homeBars','earningsChart']){
 const e=element();e.previousElementSibling=element();e.parentElement=element();e.closest=()=>({firstElementChild:element()});nodes.set(id,e);
}
const ctx={Intl,Date,console,M:['Sty','Lut','Mar','Kwi','Maj','Cze','Lip','Sie','Wrz','Paź','Lis','Gru'],S:{selectedYear:new Date().getFullYear()+1,loans:[]},document:{getElementById:id=>nodes.get(id),querySelector:()=>null,createElement:element,head:element()},render(){}};
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
 const chart=nodes.get('earningsChart').innerHTML;
 assert.ok(chart.includes('earningsScroll26'));
 assert.ok(chart.includes('viewBox="0 0 840 310"'));
 assert.ok(chart.includes('firma netto bez VAT '+fmt(expected)));
 assert.ok(chart.includes('Średnia wpisanych <strong>'+fmt(expected)+'</strong>'));
 assert.ok(!chart.includes('font-size="7'));
 assert.ok(!chart.includes('>prog.</text>'));
 const bars=nodes.get('homeBars').innerHTML;
 assert.ok(bars.includes('<p class="yearSummaryNote26">Sprzedaż netto bez VAT</p><div class="yearSummaryAmount26">'+fmt(expected)+'</div>'), 'Podsumowanie firmy musi pokazywać sprzedaż bez VAT przed kosztami');
 assert.ok(bars.includes('<span>Dodatkowa prognoza</span><strong>'+fmt(expected*11)+'</strong>'));
 assert.ok(bars.includes('<span>Łącznie w roku</span><strong>'+fmt(expected*12)+'</strong>'));
 assert.equal((bars.match(/<article /g)||[]).length,4);
 assert.ok(!bars.includes('kpiBarStack26'));
 assert.equal(nodes.get('companyNetHome').textContent,fmt(expected));
 assert.match(nodes.get('companyTile').previousElementSibling.textContent,/NETTO BEZ VAT/);
 const summary=ctx.mfCompanySummary44(year.company[0]);
 assert.equal(nodes.get('companyRevenueHome').textContent,fmt(summary.sales.gross));
 assert.equal(nodes.get('companyProfitHome').textContent,fmt(summary.cash));
 assert.equal(nodes.get('companyTile').hint.children[0].children[1].textContent,fmt(expected*11));
 assert.equal(nodes.get('companyTile').hint.children[1].children[1].textContent,fmt(expected*12));
 assert.equal(nodes.get('companyTile').parentElement.children.length,0);
}
year=makeYear([{gross:123,vatRate:23}]);
ctx.sal=()=>({rows:Array.from({length:12},(_,i)=>({total:i===0?1000:800,g:i===0?1500:1200,actual:i===0}))});
ctx.render();
const totalHtml=nodes.get('earningsChart').innerHTML;
assert.ok(totalHtml.includes('RAZEM — TYLKO WPISANE</small><strong>'+fmt(1100)));
assert.ok(totalHtml.includes('RAZEM — Z PROGNOZĄ ROCZNĄ</small><strong>'+fmt(11000)));
assert.ok(totalHtml.includes('<span>Etat netto</span><b>'+fmt(1000)));
assert.ok(totalHtml.includes('<span>Firma netto bez VAT</span><b>'+fmt(100)));
assert.ok(totalHtml.includes('<span>Dodatkowa prognoza</span><b>'+fmt(9900)));
const html=fs.readFileSync('index.html','utf8');
assert.match(html,/FIRMA — SPRZEDAŻ NETTO BEZ VAT/);
for(const file of ['index.html','v43boot.js','v47ux.js','fresh-260.html','app-252.html'])assert.match(fs.readFileSync(file,'utf8'),/4\.10\.0/);
assert.ok([...html.matchAll(/[?]v=(\d+)/g)].every(m=>m[1]==='4100'));
assert.match(fs.readFileSync('manifest.json','utf8'),/v=4100/);
console.log('PASS — karta i prognoza netto bez VAT, mieszane stawki, zero, brutto, wynik po kosztach oraz wersja/cache.');
