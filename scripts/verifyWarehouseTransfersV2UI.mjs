import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';
import puppeteer from 'puppeteer-core';
import {createServer} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
const f=JSON.parse(await fs.readFile('.local-test-results/task001-fixtures.json','utf8'));
assert.equal(f.api,'http://127.0.0.1:14030');
const pool=new pg.Pool({connectionString:'postgresql://task001_v2@127.0.0.1:5432/clotex_transfer_test_task001_v2'});
assert.equal(path.resolve((await pool.query("SELECT current_setting('data_directory') AS directory")).rows[0].directory).toLowerCase(),path.resolve('.local-test-tools/pgdata').toLowerCase());
const restrictTailwind={name:'task001-source-scope',enforce:'pre',transform(code,id){if(id.endsWith('/src/index.css'))return code.replace('@import "tailwindcss";','@import "tailwindcss" source(none);\n@source "./";');}};
const vite=await createServer({configFile:false,envDir:false,plugins:[restrictTailwind,react(),tailwindcss()],cacheDir:'node_modules/.vite-task001-v2',
 define:{'import.meta.env.VITE_API_BASE_URL':JSON.stringify(f.api)},server:{host:'127.0.0.1',port:13030,strictPort:true},clearScreen:false});
await vite.listen();
const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-proxy-server']});
const page=await browser.newPage();await page.setViewport({width:1440,height:1000});page.setDefaultTimeout(120000);page.setDefaultNavigationTimeout(180000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.setRequestInterception(true);page.on('request',r=>{const u=new URL(r.url());if(['data:','blob:','about:'].includes(u.protocol)||(u.hostname==='127.0.0.1'&&['13030','14030'].includes(u.port)))r.continue();else r.abort();});
await page.evaluateOnNewDocument((token,api)=>{localStorage.setItem('fabric_erp_api_token',token);localStorage.setItem('fabric_erp_api_base_url',api);localStorage.setItem('fabric-erp-language','ar');localStorage.setItem('fabric-erp-language-manual-override','1');},f.token,f.api);
const el=(id)=>`[data-testid="${id}"]`;
async function waitCount(count){await page.waitForFunction((count)=>Number(document.querySelector('[data-testid="transfer-fabric-selection"] [data-testid="transfer-totals"]')?.getAttribute('data-count'))===count,{},count);}
const largeOnly=process.argv.includes('--large-only');
const results=largeOnly?JSON.parse(await fs.readFile('.local-test-results/task001-v2-ui-results.json','utf8')).results.filter(r=>r.rolls!==505):[];
try{
 await page.goto('http://127.0.0.1:13030/inventory/transfers',{waitUntil:'domcontentloaded'});
 await page.waitForSelector(el('transfer-source'));
 for(const fixture of (largeOnly?[]:f.ui)){
  await page.select(el('transfer-source'),fixture.warehouses[0]);
  await page.select(el('transfer-destination'),fixture.warehouses[1]);
  await page.waitForFunction(()=>document.querySelector('[data-testid="transfer-source-location"]')?.options.length>1);
  await page.select(el('transfer-source-location'),fixture.location);
  let expected;
  if(fixture.label==='ui-single'){
   const barcode=(await pool.query('SELECT barcode FROM fabric_rolls WHERE id=$1',[fixture.rolls[0]])).rows[0].barcode;
   await page.type(el('transfer-barcode'),barcode);await page.focus(el('transfer-barcode'));await page.keyboard.press('Enter');await waitCount(1);
   await page.type(el('transfer-barcode'),barcode);await page.keyboard.press('Enter');await waitCount(1);
   await page.type(el('transfer-search'),fixture.suffix);
   await page.waitForFunction(suffix=>[...document.querySelectorAll('table tbody tr')].some(r=>r.textContent.includes(suffix)),{},fixture.suffix);
   expected=1;
  }else{
   const mode=fixture.label.replace('ui-','');await page.click(el(`transfer-mode-${mode}`));
   await page.waitForFunction(()=>{const s=document.querySelector('[data-testid="transfer-fabric"]');return s&&!s.disabled&&s.options.length===3;});
   if(mode==='multiple'){
    await page.click(el(`transfer-item-${fixture.items[0]}`));await page.click(el(`transfer-item-${fixture.items[1]}`));expected=4;
   }else if(mode==='entire'){
    await page.select(el('transfer-fabric'),fixture.items[0]);await page.click(el('transfer-add-fabric'));await page.click(el('transfer-add-fabric'));expected=3;
   }else{
    await page.select(el('transfer-fabric'),fixture.items[0]);await page.click(el(`transfer-color-${fixture.colors[0]}`));await page.click(el(`transfer-color-${fixture.colors[1]}`));await waitCount(3);
    await page.click(el(`transfer-remove-${fixture.rolls[0]}`));await waitCount(2);
    await page.select(el('transfer-fabric'),fixture.items[1]);await page.click(el(`transfer-color-${fixture.colors[0]}`));expected=3;
    await page.evaluate(async()=>{const m=await import('/src/i18n/config.ts');await m.default.changeLanguage('tr');});
    await page.waitForFunction(()=>document.querySelector('[data-testid="transfer-mode-color"]')?.textContent==='Renge göre');
    await waitCount(3);
   }
  }
  await waitCount(expected);await page.click(el('transfer-save'));
  await page.waitForFunction(()=>document.querySelector('[data-testid="transfer-save"]')?.disabled===false&&document.querySelector('[data-testid="transfer-totals"]')?.getAttribute('data-count')==='0');
  const docs=(await pool.query('SELECT id,transfer_no FROM inventory_transfers WHERE from_warehouse_id=$1',[fixture.warehouses[0]])).rows;assert.equal(docs.length,1);
  await page.select(el('transfer-list-source'),fixture.warehouses[0]);await page.select(el('transfer-list-destination'),fixture.warehouses[1]);
  await page.waitForFunction(no=>[...document.querySelectorAll('tr')].some(r=>r.textContent.includes(no)),{},docs[0].transfer_no);
  await page.evaluate(no=>{const r=[...document.querySelectorAll('tr')].find(r=>r.textContent.includes(no));r.querySelector('button').click();},docs[0].transfer_no);
  await page.waitForSelector(el('transfer-confirm-reviewed'));await page.click(el('transfer-confirm-reviewed'));
  await page.waitForFunction(()=>!document.querySelector('[role="dialog"]'));
  const rows=(await pool.query('SELECT fr.* FROM fabric_rolls fr JOIN inventory_transfer_lines l ON l.fabric_roll_id=fr.id WHERE l.transfer_id=$1',[docs[0].id])).rows;
  assert.equal(rows.length,expected);assert.ok(rows.every(r=>r.warehouse_id===fixture.warehouses[1]&&r.status==='AVAILABLE'&&Number(r.length_m)===12.345&&Number(r.unit_cost)===7));
  await page.select(el('transfer-list-source'),'');await page.select(el('transfer-list-destination'),'');
  results.push({method:fixture.label,rolls:expected,result:'PASS'});console.log('V2 UI PASS:',fixture.label,expected);
 }
 if(f.large){
  await page.select(el('transfer-source'),f.large.source);await page.select(el('transfer-destination'),f.large.destination);await page.click(el('transfer-mode-entire'));
  await page.waitForFunction(()=>{const s=document.querySelector('[data-testid="transfer-fabric"]');return s&&!s.disabled&&s.options.length===2;});
  await page.select(el('transfer-fabric'),f.large.item);await page.click(el('transfer-add-fabric'));await waitCount(505);
  await page.click(el('transfer-save'));await waitCount(0);
  const docs=(await pool.query('SELECT id,transfer_no FROM inventory_transfers WHERE from_warehouse_id=$1',[f.large.source])).rows;assert.equal(docs.length,1);
  assert.equal(Number((await pool.query('SELECT count(*) FROM inventory_transfer_lines WHERE transfer_id=$1',[docs[0].id])).rows[0].count),505);
  await page.waitForFunction(no=>[...document.querySelectorAll('tr')].some(r=>r.textContent.includes(no)),{},docs[0].transfer_no);
  await page.evaluate(no=>{const r=[...document.querySelectorAll('tr')].find(r=>r.textContent.includes(no));r.querySelector('button').click();},docs[0].transfer_no);
  await page.waitForSelector(el('transfer-confirm-reviewed'));await page.click(el('transfer-confirm-reviewed'));await page.waitForFunction(()=>!document.querySelector('[role="dialog"]'));
  assert.equal(Number((await pool.query('SELECT count(*) FROM fabric_rolls fr JOIN inventory_transfer_lines l ON l.fabric_roll_id=fr.id WHERE l.transfer_id=$1 AND fr.warehouse_id=$2 AND fr.status=\'AVAILABLE\' AND fr.length_m=1.125 AND fr.unit_cost=7',[docs[0].id,f.large.destination])).rows[0].count),505);
  results.push({method:'entire fabric across multiple pages',rolls:505,result:'PASS'});console.log('V2 UI PASS: 505 rolls across pages transferred in one document');
 }
 assert.deepEqual(errors,[]);
 await page.screenshot({path:'.local-test-results/task001-v2-ui.png',fullPage:true});
 await fs.writeFile('.local-test-results/task001-v2-ui-results.json',JSON.stringify({results,errors,language:'Arabic and Turkish',preserved:['barcode scan','search','source/destination history filters']},null,2));
}catch(error){await page.screenshot({path:'.local-test-results/task001-v2-ui-failure.png',fullPage:true}).catch(()=>{});console.error('Browser errors:',errors);throw error;}
finally{await browser.close();await vite.close();await pool.end();}
