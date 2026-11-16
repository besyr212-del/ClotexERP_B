/* Real Chromium regression, isolated profile + loopback-only HTTP fixture.
 * No ERP server, real login, production URL, secrets or user browser profile. */
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const root=path.resolve(__dirname,'../../..');
const deps=createRequire(path.join(process.env.TASK005_TEST_MODULES||root,'package.json'));
const esbuild=deps('esbuild'),puppeteer=deps('puppeteer-core');
const executable=[process.env.TASK005_BROWSER_EXE,'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','C:/Program Files/Google/Chrome/Application/chrome.exe'].find(p=>p&&fs.existsSync(p));
if(!executable)throw Error('No installed Chromium found; browser regressions were NOT run');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'clotex-c1-fixes-browser-'));
let server,browser,script;const logins=[],logouts=[],profiles=[];const tests=[];
const test=(name,fn)=>tests.push([name,fn]);
const json=(res,body,status=200)=>{res.writeHead(status,{'Content-Type':'application/json'});res.end(JSON.stringify(body));};
const until=async predicate=>{for(let i=0;i<100&&!predicate();i++)await new Promise(r=>setTimeout(r,20));assert.ok(predicate(),'Loopback request did not arrive');};
async function main(){
 server=http.createServer((req,res)=>{
  if(req.url==='/test.js'){res.setHeader('Content-Type','application/javascript');res.end(script);}
  else if(req.url==='/api/auth/login'){let body='';req.on('data',v=>body+=v);req.on('end',()=>logins.push({res,username:JSON.parse(body).username}));}
  else if(req.url==='/api/auth/logout'){req.resume();req.on('end',()=>logouts.push({res,token:req.headers.authorization}));}
  else if(req.url==='/api/profile-probe'){profiles.push(res);}
  else {res.setHeader('Content-Type','text/html');res.end('<!doctype html><div id="root"></div><script src="/test.js"></script>');}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const origin='http://127.0.0.1:'+server.address().port;
 const source=`import React,{useState} from 'react';import {createRoot} from 'react-dom/client';
 import {MemoryRouter,Routes,Route,useNavigate} from 'react-router-dom';
 import {RequireAuth} from './src/components/RequireAuth';import * as client from './src/lib/api/client';import * as auth from './src/lib/api/authApi';
 window.fixture={client,auth};window.storageEvents=0;window.addEventListener('storage',()=>window.storageEvents++);
 function Controls(){const navigate=useNavigate();window.fixture.openProtected=()=>navigate('/protected');return null;}
 function Private(){const[owner]=useState(client.getStoredToken);return <div id="owner">{owner}</div>;}
 createRoot(document.getElementById('root')).render(<MemoryRouter initialEntries={['/login']}><Controls/><Routes><Route path="/protected" element={<RequireAuth><Private/></RequireAuth>}/><Route path="/login" element={<div id="login">Login</div>}/></Routes></MemoryRouter>);`;
 script=(await esbuild.build({stdin:{contents:source,sourcefile:'session-regression.tsx',loader:'tsx',resolveDir:root},bundle:true,write:false,format:'iife',platform:'browser',jsx:'automatic',define:{'import.meta.env':JSON.stringify({DEV:true,PROD:false,VITE_API_BASE_URL:origin})}})).outputFiles[0].contents;
 browser=await puppeteer.launch({executablePath:executable,headless:true,userDataDir:path.join(temporary,'profile'),args:['--disable-background-networking','--disable-component-update','--disable-sync','--no-first-run','--proxy-server=http://127.0.0.1:9','--proxy-bypass-list=127.0.0.1;localhost']});
 async function page(){const p=await browser.newPage();await p.setRequestInterception(true);p.on('request',r=>r.url().startsWith(origin+'/')?r.continue():r.abort());await p.goto(origin);await p.waitForFunction(()=>Boolean(window.fixture?.openProtected));return p;}
 const a=await page(),b=await page();
 const startLogin=(p,name,key)=>p.evaluate((name,key)=>{window[key]=window.fixture.auth.loginApi(name,'synthetic-password').then(r=>({accepted:true,id:r.user.id})).catch(e=>({accepted:false,code:e.body?.code}));},name,key);
 const replyLogin=name=>{const v=logins.find(v=>v.username===name&&!v.done);assert.ok(v);v.done=true;json(v.res,{ok:true,token:name,user:{id:name}});};
 test('real storage ABA cannot restore an old login after another tab login and logout',async()=>{
  await startLogin(a,'synthetic-old-A','oldLogin');await until(()=>logins.some(v=>v.username==='synthetic-old-A'));
  await startLogin(b,'synthetic-new-B','newLogin');await until(()=>logins.some(v=>v.username==='synthetic-new-B'));replyLogin('synthetic-new-B');assert.equal((await b.evaluate(()=>window.newLogin)).accepted,true);
  await b.evaluate(()=>{window.logout=window.fixture.auth.logoutApi().then(()=>true).catch(e=>e.body?.code);});await until(()=>logouts.length===1);assert.equal(logouts[0].token,'Bearer synthetic-new-B');json(logouts[0].res,{ok:true});assert.equal(await b.evaluate(()=>window.logout),true);
  await a.waitForFunction(()=>window.storageEvents>=2);replyLogin('synthetic-old-A');const result=await a.evaluate(()=>window.oldLogin);assert.equal(result.accepted,false);assert.equal(result.code,'SESSION_CHANGED');
  assert.equal(await a.evaluate(()=>window.fixture.client.getStoredToken()),null);assert.equal(await b.evaluate(()=>window.fixture.client.getStoredToken()),null);
 });
 test('concurrent tab logins resolve to the current intent, not the last HTTP response',async()=>{
  await startLogin(a,'synthetic-A2','a2');await until(()=>logins.some(v=>v.username==='synthetic-A2'));
  await startLogin(b,'synthetic-B2','b2');await until(()=>logins.some(v=>v.username==='synthetic-B2'));replyLogin('synthetic-B2');assert.equal((await b.evaluate(()=>window.b2)).accepted,true);
  replyLogin('synthetic-A2');assert.equal((await a.evaluate(()=>window.a2)).code,'SESSION_CHANGED');assert.equal(await a.evaluate(()=>window.fixture.client.getStoredToken()),'synthetic-B2');
 });
 test('protected React state is remounted on the other tab account switch',async()=>{
  await a.evaluate(()=>window.fixture.openProtected());await a.waitForFunction(()=>document.querySelector('#owner')?.textContent==='synthetic-B2');
  await b.evaluate(()=>window.fixture.client.setStoredToken('synthetic-C'));await a.waitForFunction(()=>document.querySelector('#owner')?.textContent==='synthetic-C');
 });
 test('late profile response is discarded even when the shared token returns to its original value',async()=>{
  await a.evaluate(()=>{window.profile=window.fixture.client.apiFetch('/api/profile-probe').then(()=> 'LEAKED').catch(e=>e.body?.code);});await until(()=>profiles.length===1);
  await b.evaluate(()=>{window.fixture.client.setStoredToken('synthetic-D');window.fixture.client.setStoredToken('synthetic-C');});await a.waitForFunction(()=>window.fixture.client.getStoredToken()==='synthetic-C');
  json(profiles[0],{privateOwner:'old synthetic-C'});assert.equal(await a.evaluate(()=>window.profile),'SESSION_CHANGED');
 });
 test('late 401 cannot evict or redirect the newly selected account',async()=>{
  await a.evaluate(()=>{window.oldFailure=window.fixture.client.apiFetch('/api/profile-probe').then(()=> 'UNEXPECTED').catch(e=>e.body?.code);});await until(()=>profiles.length===2);
  await b.evaluate(()=>window.fixture.client.setStoredToken('synthetic-E'));await a.waitForFunction(()=>document.querySelector('#owner')?.textContent==='synthetic-E');
  json(profiles[1],{message:'synthetic old session expired'},401);assert.equal(await a.evaluate(()=>window.oldFailure),'SESSION_CHANGED');
  assert.equal(await a.evaluate(()=>window.fixture.client.getStoredToken()),'synthetic-E');assert.equal(await a.$('#login'),null);
 });
 test('logout intent immediately clears private state while its HTTP request is still pending',async()=>{
  await b.evaluate(()=>{window.lastLogout=window.fixture.auth.logoutApi().then(()=>true).catch(e=>e.body?.code);});await until(()=>logouts.length===2);await a.waitForSelector('#login');assert.equal(await a.$('#owner'),null);
  json(logouts[1].res,{ok:true});assert.equal(await b.evaluate(()=>window.lastLogout),true);assert.equal(await a.evaluate(()=>window.fixture.client.getStoredToken()),null);
 });
 let failed=0;for(const [name,fn]of tests){try{await fn();console.log('PASS Browser '+name);}catch(e){failed++;console.error('FAIL '+name+'\n'+e.stack);}}
 console.log(tests.length+' real Chromium security regressions; '+failed+' failures. No production access.');process.exitCode=failed?1:0;
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;}).finally(async()=>{for(const v of [...logins,...logouts])if(!v.res.writableEnded)v.res.destroy();for(const res of profiles)if(!res.writableEnded)res.destroy();if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));});
