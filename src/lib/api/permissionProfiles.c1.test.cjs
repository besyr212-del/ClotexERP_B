const assert=require('node:assert/strict');
const {context:baseContext}=require('./platformBackup.a1.test.cjs');
const context=(options={})=>baseContext({apiBase:'https://synthetic-ui.invalid',...options});
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
const tests=[],test=(name,fn)=>tests.push([name,fn]);
const until=async predicate=>{for(let i=0;i<30&&!predicate();i++)await Promise.resolve();assert.ok(predicate(),'async authentication transition did not finish');};
test('web and Electron read fresh identity-bound profiles without retaining the previous account',async()=>{
 for(const electron of [false,true]){
  const c=context({electron}),client=c.load('src/lib/api/client.ts'),profiles=c.load('src/lib/api/permissionProfilesApi.ts');
  let identity='synthetic-user-A';c.fetchOverride=async()=>json({ok:true,profile:{userId:identity,decisions:[{code:'sales.view',allowed:identity.endsWith('A')}]}});
  client.setStoredToken('synthetic-token-A');assert.equal((await profiles.fetchCurrentPermissionProfile()).userId,'synthetic-user-A');
  identity='synthetic-user-B';client.setStoredToken('synthetic-token-B');const next=await profiles.fetchCurrentPermissionProfile();assert.equal(next.userId,'synthetic-user-B');assert.equal(next.decisions[0].allowed,false);
  assert.equal(c.calls[1].request.headers.get('Authorization'),'Bearer synthetic-token-B');
  if(electron)assert.equal(c.local.getItem('fabric_erp_api_token'),null);
 }
});
test('late profile data and late 401 from account A cannot reach or evict account B',async()=>{
 for(const status of [200,401]){
  const c=context(),client=c.load('src/lib/api/client.ts'),profiles=c.load('src/lib/api/permissionProfilesApi.ts');
  let finish;c.fetchOverride=()=>new Promise(r=>finish=r);client.setStoredToken('synthetic-A');const pending=profiles.fetchCurrentPermissionProfile();client.setStoredToken('synthetic-B');
  finish(json(status===200?{profile:{userId:'A',permissions:['sensitive']}}:{message:'old session rejected'},status));
  await assert.rejects(pending,e=>e.statusCode===409&&e.body.code==='SESSION_CHANGED');assert.equal(client.getStoredToken(),'synthetic-B');
 }
});
test('switching account during JSON decode also discards the old result',async()=>{
 const c=context(),client=c.load('src/lib/api/client.ts'),profiles=c.load('src/lib/api/permissionProfilesApi.ts');let finish;
 c.fetchOverride=async()=>({ok:true,status:200,headers:new Headers({'Content-Type':'application/json'}),json:()=>new Promise(r=>finish=r)});
 client.setStoredToken('synthetic-A');const pending=profiles.fetchCurrentPermissionProfile();for(let i=0;i<10&&!finish;i++)await Promise.resolve();assert.equal(typeof finish,'function');client.setStoredToken('synthetic-B');finish({profile:{userId:'A'}});
 await assert.rejects(pending,e=>e.body.code==='SESSION_CHANGED');
});
test('an older login response cannot overwrite the newer login token',async()=>{
 const c=context(),client=c.load('src/lib/api/client.ts'),auth=c.load('src/lib/api/authApi.ts');const finishes=[];c.fetchOverride=()=>new Promise(r=>finishes.push(r));
 const first=auth.loginApi('synthetic-A','synthetic-password'),second=auth.loginApi('synthetic-B','synthetic-password');
 await until(()=>finishes.length===2);
 finishes[1](json({ok:true,token:'synthetic-token-B',user:{id:'B'}}));assert.equal((await second).user.id,'B');
 finishes[0](json({ok:true,token:'synthetic-token-A',user:{id:'A'}}));await assert.rejects(first,e=>e.body.code==='SESSION_CHANGED');assert.equal(client.getStoredToken(),'synthetic-token-B');
});
test('logout sends authenticated token and cannot clear a later login',async()=>{
 const c=context(),client=c.load('src/lib/api/client.ts'),auth=c.load('src/lib/api/authApi.ts');let finish;c.fetchOverride=()=>new Promise(r=>finish=r);
 client.setStoredToken('synthetic-A');const logout=auth.logoutApi();await until(()=>c.calls.length===1);assert.equal(c.calls[0].request.headers.get('Authorization'),'Bearer synthetic-A');assert.equal(client.getStoredToken(),null);client.setStoredToken('synthetic-B');finish(json({ok:true}));await assert.rejects(logout,e=>e.body.code==='SESSION_CHANGED');assert.equal(client.getStoredToken(),'synthetic-B');
});
test('cross-tab token writes without a local revision cannot be overwritten by old login/logout',async()=>{
 for(const action of ['login','logout']){
  const c=context(),client=c.load('src/lib/api/client.ts'),auth=c.load('src/lib/api/authApi.ts');let finish;c.fetchOverride=()=>new Promise(r=>finish=r);
  client.setStoredToken('synthetic-A');const pending=action==='login'?auth.loginApi('A','synthetic-password'):auth.logoutApi();
  await until(()=>Boolean(finish));
  c.local.setItem('fabric_erp_api_token','synthetic-B');finish(json({ok:true,token:'synthetic-A-again',user:{id:'A'}}));
  await assert.rejects(pending,e=>e.body.code==='SESSION_CHANGED');assert.equal(client.getStoredToken(),'synthetic-B');
 }
});
test('shared epoch rejects ABA login after another tab logs in and out even before storage events',async()=>{
 const a=context(),b=context({localStorage:a.local}),clientA=a.load('src/lib/api/client.ts'),clientB=b.load('src/lib/api/client.ts'),auth=a.load('src/lib/api/authApi.ts');
 let finish;a.fetchOverride=()=>new Promise(r=>finish=r);const pending=auth.loginApi('synthetic-A','synthetic-password');await until(()=>Boolean(finish));
 const revision=clientA.getAuthSessionRevision();clientB.setStoredToken('synthetic-B');clientB.setStoredToken(null);
 assert.equal(clientA.getStoredToken(),null);assert.notEqual(clientA.getAuthSessionRevision(),revision);
 finish(json({ok:true,token:'synthetic-A-late',user:{id:'A'}}));await assert.rejects(pending,e=>e.body.code==='SESSION_CHANGED');assert.equal(clientA.getStoredToken(),null);
});
test('shared epoch rejects old profile response when the token changes and returns to its original value',async()=>{
 const a=context(),b=context({localStorage:a.local}),clientA=a.load('src/lib/api/client.ts'),clientB=b.load('src/lib/api/client.ts');let finish;
 clientA.setStoredToken('synthetic-A');a.fetchOverride=()=>new Promise(r=>finish=r);const pending=a.load('src/lib/api/permissionProfilesApi.ts').fetchCurrentPermissionProfile();
 clientB.setStoredToken('synthetic-B');clientB.setStoredToken('synthetic-A');finish(json({profile:{userId:'old-A'}}));
 await assert.rejects(pending,e=>e.body.code==='SESSION_CHANGED');assert.equal(clientA.getStoredToken(),'synthetic-A');
});
test('logout intent invalidates another tab pending login before the logout HTTP response',async()=>{
 const a=context(),b=context({localStorage:a.local}),clientA=a.load('src/lib/api/client.ts');let loginFinish,logoutFinish;
 a.fetchOverride=()=>new Promise(r=>loginFinish=r);b.fetchOverride=()=>new Promise(r=>logoutFinish=r);
 const login=a.load('src/lib/api/authApi.ts').loginApi('synthetic-A','synthetic-password');await until(()=>Boolean(loginFinish));
 const logout=b.load('src/lib/api/authApi.ts').logoutApi();await until(()=>Boolean(logoutFinish));
 loginFinish(json({ok:true,token:'synthetic-A-late',user:{id:'A'}}));await assert.rejects(login,e=>e.body.code==='SESSION_CHANGED');
 logoutFinish(json({ok:true}));await logout;assert.equal(clientA.getStoredToken(),null);
});
test('Electron windows retain separate sessionStorage authority despite sharing localStorage',async()=>{
 const a=context({electron:true}),b=context({electron:true,localStorage:a.local}),ca=a.load('src/lib/api/client.ts'),cb=b.load('src/lib/api/client.ts');
 ca.setStoredToken('synthetic-electron-A');const before=ca.getAuthSessionRevision();cb.setStoredToken('synthetic-electron-B');cb.setStoredToken(null);
 assert.equal(ca.getStoredToken(),'synthetic-electron-A');assert.equal(ca.getAuthSessionRevision(),before);
});
test('blocked session storage cannot report successful login or retain the previous identity',async()=>{
 const c=context(),client=c.load('src/lib/api/client.ts'),auth=c.load('src/lib/api/authApi.ts');
 c.fetchOverride=async()=>json({ok:true,token:'synthetic-new',user:{id:'new'}});
 c.local.removeItem=()=>{throw Error('synthetic blocked storage');};
 await assert.rejects(auth.loginApi('new','synthetic-password'),e=>e.body.code==='SESSION_STORAGE');assert.equal(c.calls.length,0);
 const d=context(),dClient=d.load('src/lib/api/client.ts'),dAuth=d.load('src/lib/api/authApi.ts');d.fetchOverride=c.fetchOverride;d.local.setItem=()=>{throw Error('synthetic blocked storage');};
 await assert.rejects(dAuth.loginApi('new','synthetic-password'),e=>e.body.code==='SESSION_STORAGE');assert.equal(dClient.getStoredToken(),null);
});
(async()=>{let failed=0;for(const[name,fn]of tests){try{await fn();console.log('PASS '+name);}catch(e){failed++;console.error('FAIL '+name+'\n'+e.stack);}}console.log(tests.length+' frontend C1 tests; '+failed+' failures. Mocked storage/fetch; NOT browser/Electron.');process.exitCode=failed?1:0;})();
