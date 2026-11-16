/* Targeted in-memory tests: real Fastify routing, JWT verification, bcrypt comparison
 * and session revocation. SQL, dump generation, network and dump-file IO are mocked.
 * Never loads .env, opens a socket, connects to PostgreSQL or runs pg_dump.
 * node server/src/routes/task005PhaseA.security.test.cjs
 * Optional TASK005_TEST_MODULES points to an existing checkout with dependencies. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {createRequire}=require('node:module');
const {Readable}=require('node:stream');
const {EventEmitter}=require('node:events');
const root=path.resolve(__dirname,'../../..');
const deps=createRequire(path.join(process.env.TASK005_TEST_MODULES||root,'package.json'));
const ts=deps('typescript'),Fastify=deps('fastify'),bcrypt=deps('bcryptjs');
const ids={company:'11111111-1111-4111-8111-111111111111',other:'22222222-2222-4222-8222-222222222222',
 ordinary:'33333333-3333-4333-8333-333333333333',admin:'44444444-4444-4444-8444-444444444444',
 platform:'55555555-5555-4555-8555-555555555555',manager:'66666666-6666-4666-8666-666666666666',
 target:'77777777-7777-4777-8777-777777777777',foreign:'88888888-8888-4888-8888-888888888888',
 created:'99999999-9999-4999-8999-999999999999'};
const testPassword='synthetic-phase-A-password';
const fixtureHash=bcrypt.hashSync(testPassword,4);
const fakeDump=Buffer.from('SYNTHETIC BACKUP BYTES ONLY');
function createContext(){
 const ctx={users:new Map(),roles:{viewer:['dashboard.view'],staff:['dashboard.view','inventory.view'],
   manager:['dashboard.view','inventory.view','users.manage'],
   high:['dashboard.view','users.manage','settings.manage','payroll.approve'],
   admin:['dashboard.view','inventory.view','users.manage','settings.view','settings.manage','payroll.approve']},
  queries:[],audits:[],cleanup:[],dumpCalls:0,streamCalls:0,liveReads:0,task004Present:false,task004:new Map(),
  afterLiveRead:null,onDump:null,failAudit:null,failUserWrite:false};
 for(const [id,role,platform,company]of [[ids.ordinary,'viewer',false,ids.company],[ids.admin,'admin',false,ids.company],
  [ids.platform,'admin',true,ids.company],[ids.manager,'manager',false,ids.company],[ids.target,'staff',false,ids.company],[ids.foreign,'staff',false,ids.other]]){
  ctx.users.set(id,{id,company_id:company,username:'synthetic-'+id.slice(0,4),full_name:'Synthetic test user',role,is_platform_admin:platform,is_active:true,password_hash:fixtureHash});
 }
 const sanitized=u=>({id:u.id,username:u.username,full_name:u.full_name,role:u.role,is_active:u.is_active,notes:u.notes??null});
 function dbClient(){
  let transaction=false;let pendingUsers=new Map(),pendingRoles={},pendingAudits=[];
  const getUser=id=>pendingUsers.get(id)||ctx.users.get(id);
  const getRole=role=>pendingRoles[role]||ctx.roles[role];
  return {release(){},async query(sql,params=[]){
   ctx.queries.push({sql,params});
   const placeholders=[...sql.matchAll(/\$(\d+)/g)].map(m=>+m[1]);if(placeholders.length)assert.equal(Math.max(...placeholders),params.length,'SQL placeholder mismatch');
   let rows=[];
   if(sql==='BEGIN'){transaction=true;return {rows,rowCount:0};}
   if(sql==='COMMIT'){for(const[k,v]of pendingUsers)ctx.users.set(k,v);Object.assign(ctx.roles,pendingRoles);ctx.audits.push(...pendingAudits);transaction=false;pendingUsers=new Map();pendingRoles={};pendingAudits=[];return {rows,rowCount:0};}
   if(sql==='ROLLBACK'){transaction=false;pendingUsers=new Map();pendingRoles={};pendingAudits=[];return {rows,rowCount:0};}
   if(sql.includes('ARRAY(SELECT p.code FROM roles r')){
    const u=getUser(params[0]);if(u)rows=[{...u,permissions:[...(getRole(u.role)||[])]}];
    ctx.liveReads++;if(ctx.afterLiveRead)await ctx.afterLiveRead(ctx.liveReads);
   }else if(sql.startsWith('SELECT password_hash FROM users')){
    const u=getUser(params[0]);rows=u?[{password_hash:u.password_hash}]:[];
   }else if(sql.startsWith('SELECT id,company_id,username,full_name,role,is_active,is_platform_admin FROM users')){
    const u=getUser(params[0]);rows=u?[{...u}]:[];
   }else if(sql.startsWith('SELECT id FROM roles WHERE code=')){
    rows=getRole(params[0])?[{id:params[0]}]:[];
   }else if(sql.startsWith('SELECT p.code FROM role_permissions')){
    rows=(getRole(params[0])||[]).map(code=>({code}));
   }else if(sql.includes("to_regclass('public.task004_user_permissions')")){
    rows=[{present:ctx.task004Present}];
   }else if(sql.includes('SELECT permission_code AS code FROM task004_user_permissions')){
    rows=(ctx.task004.get(params[1])||[]).map(code=>({code}));
   }else if(sql.startsWith('SELECT id FROM companies')){
    rows=[ids.company,ids.other].includes(params[0])?[{id:params[0]}]:[];
   }else if(sql.startsWith('INSERT INTO users')){
    if(ctx.failUserWrite)throw Object.assign(Error('synthetic failure'),{code:'TEST_WRITE'});
    const u={id:ids.created,company_id:params[0],username:params[1],full_name:params[2],password_hash:params[3],role:params[4],is_active:params[5],notes:params[6],is_platform_admin:false};
    pendingUsers.set(u.id,u);rows=[sanitized(u)];
   }else if(sql.startsWith('UPDATE users SET username=')){
    const previous=getUser(params[0]);if(previous&&previous.company_id===params[1]){
     const u={...previous,username:params[2],full_name:params[3],role:params[4],is_active:params[5],password_hash:params[6]??previous.password_hash,notes:params[7]};
     pendingUsers.set(u.id,u);rows=[sanitized(u)];
    }
   }else if(sql.startsWith('INSERT INTO platform_audit_log')){
    if(ctx.failAudit===params[1])throw Object.assign(Error('synthetic secret must not escape'),{code:'TEST_AUDIT'});
    const entry={kind:'platform',action:params[1],details:params[6]};if(transaction)pendingAudits.push(entry);else ctx.audits.push(entry);
   }else if(sql.startsWith('INSERT INTO audit_logs')){
    if(ctx.failAudit==='USER_AUDIT')throw Object.assign(Error('synthetic audit failure'),{code:'TEST_AUDIT'});
    const entry={kind:'tenant',action:params[2],details:params[4]};if(transaction)pendingAudits.push(entry);else ctx.audits.push(entry);
   }else if(sql.startsWith('SELECT id, username, full_name, role, is_active, notes')){
    rows=[...ctx.users.values()].filter(u=>u.company_id===params[0]).map(sanitized);
   }else if(sql.startsWith('SELECT id, code, name FROM roles')){
    rows=Object.keys(ctx.roles).map(code=>({id:code,code,name:code}));
   }else if(sql.startsWith('INSERT INTO roles')){
    pendingRoles[params[0]]=getRole(params[0])||[];rows=[{id:params[0],code:params[0],name:params[1]}];
   }else if(sql.startsWith('DELETE FROM role_permissions')){
    pendingRoles[params[0]]=[];
   }else if(sql.startsWith('INSERT INTO role_permissions')){
    pendingRoles[params[0]]=[...(getRole(params[0])||[]),params[1]];
   }
   return {rows,rowCount:rows.length};
  }};
 }
 ctx.pool={query:(...args)=>dbClient().query(...args),connect:async()=>dbClient()};return ctx;
}
function sourceLoader(ctx){
 const cache=new Map();
 const testEnv={JWT_SECRET:'synthetic-test-secret-never-used-outside-memory-005',JWT_EXPIRES_IN:'1h'};
 const dumpStub={async createDatabaseBackupFile(){ctx.dumpCalls++;if(ctx.onDump)await ctx.onDump();return {filePath:'virtual-test-dump',fileName:'synthetic.dump',sizeBytes:fakeDump.length};},safeUnlink:p=>ctx.cleanup.push(p)};
 function load(file,extra={}){
  file=path.resolve(root,file);if(cache.has(file))return cache.get(file).exports;
  if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
  const module={exports:{}};cache.set(file,module);
  const req=name=>{
   if(extra.modules&&name in extra.modules)return extra.modules[name];
   if(name.endsWith('/db/pool.js'))return {getPool:()=>ctx.pool};
   if(name.endsWith('/config/env.js'))return {getEnv:()=>testEnv};
   if(name.endsWith('/databaseBackupDownloadService.js'))return dumpStub;
   if(name.endsWith('/purgeBusinessDataService.js'))return {purgeBusinessData:async()=>{ctx.purgeCalled=true;return {};}};
   if(name==='bcryptjs')return {...bcrypt,hash:async(value,rounds)=>{assert.equal(rounds,12);return bcrypt.hash(value,4);}};
   if(name==='node:https')return {request(){throw Error('Network is forbidden in targeted tests');}};
   if(name==='node:fs')return {...fs,createReadStream(){ctx.streamCalls++;return Readable.from([fakeDump]);}};
   if(name.startsWith('.')){let target=path.resolve(path.dirname(file),name).replace(/\.js$/,'.ts');return load(target);}
   return deps(name);
  };
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
  vm.runInThisContext('(function(require,module,exports,process){'+code+'\n})',{filename:file})(req,module,module.exports,extra.process||{env:{},platform:process.platform});
  return module.exports;
 }
 return load;
}
async function api(ctx,options={}){
 const load=sourceLoader(ctx),app=Fastify({logger:false});
 if(options.shadow)load('server/src/security/permissionShadowAudit.ts').installPermissionShadowAudit(app,options.shadow);
 if(options.cors)await app.register(deps('@fastify/cors'),{origin:'https://synthetic-ui.invalid',credentials:true});
 app.setErrorHandler(load('server/src/middleware/errorHandler.ts').globalErrorHandler);
 await app.register(load('server/src/routes/systemRoutes.ts').systemRoutes,{prefix:'/api/system'});
 if(options.profiles)await app.register(load('server/src/routes/permissionProfileRoutes.ts').permissionProfileRoutes,{prefix:'/api/permission-profiles'});
 const auth=load('server/src/middleware/auth.ts');
 app.get('/test/live',{preHandler:auth.authenticateRequest},req=>({role:req.user.role,permissions:req.user.permissions,platform:req.user.isPlatformAdmin}));
 app.get('/test/platform',{preHandler:auth.authenticateRequest},(req,reply)=>auth.requirePlatformAdmin(req.user)?{ok:true}:reply.code(403).send({ok:false}));
 await app.ready();
 const token=(userId,overrides={})=>{const u=ctx.users.get(userId);return auth.signAuthToken({sub:u.id,companyId:u.company_id,username:u.username,role:u.role,permissions:[...(ctx.roles[u.role]||[])],isPlatformAdmin:u.is_platform_admin,...overrides});};
 return {app,load,token,headers:userId=>({authorization:'Bearer '+token(userId)})};
}
const tests=[];const test=(name,fn)=>tests.push([name,fn]);
const backupPayload={password:testPassword,confirmPhrase:'FULL_PLATFORM_BACKUP'};
const createPayload={username:'synthetic-created',fullName:'Test only',password:'synthetic-new-password',role:'viewer',isActive:true,notes:''};
function updatePayload(u,changes={}){return {username:u.username,fullName:u.full_name,role:u.role,isActive:u.is_active,notes:'',...changes};}
test('real JWT: old admin/platform claims cannot override current ordinary user',async()=>{
 const ctx=createContext(),a=await api(ctx);const stale=a.token(ids.ordinary,{role:'admin',permissions:['users.manage','settings.manage'],isPlatformAdmin:true});const h={authorization:'Bearer '+stale};
 const proof=await a.app.inject({url:'/test/live',headers:h});assert.deepEqual(proof.json(),{role:'viewer',permissions:['dashboard.view'],platform:false});
 for(const url of ['/api/system/users','/test/platform'])assert.equal((await a.app.inject({url,headers:h})).statusCode,403);
 assert.equal((await a.app.inject({method:'POST',url:'/api/system/backup/download',headers:h,payload:backupPayload})).statusCode,403);assert.equal(ctx.dumpCalls,0);await a.app.close();
});
test('same JWT: role/permission changes take effect without token renewal',async()=>{
 const ctx=createContext(),a=await api(ctx);const headers=a.headers(ids.manager);
 assert.equal((await a.app.inject({url:'/api/system/users',headers})).statusCode,200);
 ctx.roles.manager=ctx.roles.manager.filter(c=>c!=='users.manage');assert.equal((await a.app.inject({url:'/api/system/users',headers})).statusCode,403);
 ctx.roles.manager.push('users.manage');assert.equal((await a.app.inject({url:'/api/system/users',headers})).statusCode,200);
 ctx.users.get(ids.manager).role='viewer';assert.equal((await a.app.inject({url:'/api/system/users',headers})).statusCode,403);await a.app.close();
});
test('same JWT: platform revocation blocks own-company platform endpoints and switched context',async()=>{
 const ctx=createContext(),a=await api(ctx);const own=a.headers(ids.platform),switched={authorization:'Bearer '+a.token(ids.platform,{companyId:ids.other})};
 assert.equal((await a.app.inject({url:'/test/platform',headers:own})).statusCode,200);ctx.users.get(ids.platform).is_platform_admin=false;
 assert.equal((await a.app.inject({url:'/test/platform',headers:own})).statusCode,403);assert.equal((await a.app.inject({url:'/test/live',headers:switched})).statusCode,403);
 assert.equal((await a.app.inject({method:'PUT',url:'/api/system/roles/viewer',headers:own,payload:{name:'Viewer',permissionCodes:[]}})).statusCode,403);await a.app.close();
});
test('disabled/deleted account or revoked session denied despite a valid signed JWT',async()=>{
 for(const change of ['disabled','deleted','session']){
  const ctx=createContext(),a=await api(ctx),token=a.token(ids.platform),headers={authorization:'Bearer '+token};
  await a.app.inject({url:'/test/live',headers});
  if(change==='disabled')ctx.users.get(ids.platform).is_active=false;else if(change==='deleted')ctx.users.delete(ids.platform);else{const sessions=a.load('server/src/services/activeSessionsService.ts');assert.equal(sessions.revokeActiveSession(sessions.buildSessionKey(ids.platform,token),ids.company),true);}
  assert.equal((await a.app.inject({url:'/test/platform',headers})).statusCode,401);await a.app.close();
 }
});
test('company admin keeps seeded user-management access; role name alone does not grant it',async()=>{
 const ctx=createContext(),a=await api(ctx),headers=a.headers(ids.admin);
 assert.equal((await a.app.inject({url:'/api/system/users',headers})).statusCode,200);
 ctx.roles.admin=ctx.roles.admin.filter(c=>c!=='users.manage');assert.equal((await a.app.inject({url:'/api/system/users',headers})).statusCode,403);await a.app.close();
});
test('legacy backup GET never creates a dump, including for a platform admin',async()=>{
 const ctx=createContext(),a=await api(ctx);
 for(const [id,status]of [[ids.ordinary,403],[ids.admin,403],[ids.platform,405]])assert.equal((await a.app.inject({url:'/api/system/backup/download',headers:a.headers(id)})).statusCode,status);
 assert.equal(ctx.dumpCalls,0);assert.equal(ctx.audits.filter(e=>e.action==='FULL_BACKUP_DENIED').length,3);await a.app.close();
});
test('full backup denies ordinary/tenant manager even with correct current password',async()=>{
 const ctx=createContext(),a=await api(ctx);
 for(const id of [ids.ordinary,ids.manager,ids.admin])assert.equal((await a.app.inject({method:'POST',url:'/api/system/backup/download',headers:a.headers(id),payload:backupPayload})).statusCode,403);
 assert.equal(ctx.dumpCalls,0);assert.equal(ctx.streamCalls,0);await a.app.close();
});
test('platform backup requires explicit intent, body password and fresh bcrypt reauthentication',async()=>{
 const ctx=createContext(),a=await api(ctx),headers=a.headers(ids.platform);
 for(const payload of [{},{password:testPassword},{...backupPayload,password:''}])assert.equal((await a.app.inject({method:'POST',url:'/api/system/backup/download',headers,payload})).statusCode,400);
 assert.equal((await a.app.inject({method:'POST',url:'/api/system/backup/download',headers,payload:{...backupPayload,password:'synthetic-wrong'}})).statusCode,403);
 assert.equal(ctx.dumpCalls,0);await a.app.close();
});
test('platform backup authorizes, audits, streams synthetic bytes and cleans up',async()=>{
 const ctx=createContext(),a=await api(ctx);const r=await a.app.inject({method:'POST',url:'/api/system/backup/download',headers:a.headers(ids.platform),payload:backupPayload});
 assert.equal(r.statusCode,200,r.body);assert.deepEqual(r.rawPayload,fakeDump);assert.equal(r.headers['cache-control'],'no-store');assert.equal(ctx.dumpCalls,1);assert.equal(ctx.streamCalls,1);
 assert.match(r.headers['access-control-expose-headers'],/Content-Disposition/);assert.match(r.headers['access-control-expose-headers'],/Content-Length/);assert.match(r.headers['access-control-expose-headers'],/Content-Encoding/);
 assert.deepEqual(ctx.audits.map(e=>e.action),['FULL_BACKUP_ATTEMPT','FULL_BACKUP_AUTHORIZED','FULL_BACKUP_READY']);assert.ok(ctx.cleanup.length>0);
 assert.equal(JSON.stringify(ctx.audits).includes(testPassword),false);assert.equal(JSON.stringify(ctx.audits).includes(fixtureHash),false);await a.app.close();
});
test('platform grant/account/password/session revocation during dump prevents all file bytes',async()=>{
 for(const change of ['platform','active','password','session']){
  const ctx=createContext(),a=await api(ctx),token=a.token(ids.platform);ctx.onDump=async()=>{
   if(change==='platform')ctx.users.get(ids.platform).is_platform_admin=false;
   if(change==='active')ctx.users.get(ids.platform).is_active=false;
   if(change==='password')ctx.users.get(ids.platform).password_hash=await bcrypt.hash('synthetic-reset',4);
   if(change==='session'){const sessions=a.load('server/src/services/activeSessionsService.ts');sessions.revokeActiveSession(sessions.buildSessionKey(ids.platform,token),ids.company);}
  };
  const r=await a.app.inject({method:'POST',url:'/api/system/backup/download',headers:{authorization:'Bearer '+token},payload:backupPayload});
  assert.ok([401,403].includes(r.statusCode),r.body);assert.equal(ctx.streamCalls,0);assert.ok(ctx.cleanup.length);assert.equal(r.body.includes('SYNTHETIC BACKUP BYTES'),false);await a.app.close();
 }
});
test('audit failure fails closed before generation or before stream release; errors stay sanitized',async()=>{
 for(const action of ['FULL_BACKUP_ATTEMPT','FULL_BACKUP_AUTHORIZED','FULL_BACKUP_READY']){
  const ctx=createContext(),a=await api(ctx);ctx.failAudit=action;const r=await a.app.inject({method:'POST',url:'/api/system/backup/download',headers:a.headers(ids.platform),payload:backupPayload});
  assert.equal(r.statusCode,500);assert.equal(ctx.dumpCalls,action==='FULL_BACKUP_READY'?1:0);assert.equal(ctx.streamCalls,0);assert.equal(r.body.includes('synthetic secret'),false);await a.app.close();
 }
});
test('repeated failed backup reauthentication is rate limited',async()=>{
 const ctx=createContext(),a=await api(ctx),headers=a.headers(ids.platform);
 for(let i=0;i<5;i++)assert.equal((await a.app.inject({method:'POST',url:'/api/system/backup/download',headers,payload:{...backupPayload,password:'synthetic-wrong'}})).statusCode,403);
 assert.equal((await a.app.inject({method:'POST',url:'/api/system/backup/download',headers,payload:backupPayload})).statusCode,429);assert.equal(ctx.dumpCalls,0);await a.app.close();
});
test('delegated user manager may create a lower role with audit; no platform flag is granted',async()=>{
 const ctx=createContext(),a=await api(ctx);const r=await a.app.inject({method:'POST',url:'/api/system/users',headers:a.headers(ids.manager),payload:createPayload});
 assert.equal(r.statusCode,201,r.body);assert.equal(ctx.users.get(ids.created).is_platform_admin,false);assert.equal(ctx.users.get(ids.created).role,'viewer');assert.ok(ctx.audits.some(e=>e.action==='SECURITY_USER_CREATED'));await a.app.close();
});
test('reject unknown role, legacy admin escalation and permission-superset role',async()=>{
 for(const role of ['unknown','admin','high']){
  const ctx=createContext(),a=await api(ctx);const r=await a.app.inject({method:'POST',url:'/api/system/users',headers:a.headers(ids.manager),payload:{...createPayload,role}});
  assert.equal(r.statusCode,role==='unknown'?400:403,r.body);assert.equal(ctx.users.has(ids.created),false);await a.app.close();
 }
});
test('tenant admin cannot create another legacy bypass admin; real platform admin can',async()=>{
 const ctx=createContext(),a=await api(ctx);assert.equal((await a.app.inject({method:'POST',url:'/api/system/users',headers:a.headers(ids.admin),payload:{...createPayload,role:'admin'}})).statusCode,403);
 const r=await a.app.inject({method:'POST',url:'/api/system/users',headers:a.headers(ids.platform),payload:{...createPayload,role:'admin'}});assert.equal(r.statusCode,201,r.body);assert.equal(ctx.users.get(ids.created).is_platform_admin,false);await a.app.close();
});
test('user-management requests cannot inject platform flags or arbitrary permissions',async()=>{
 const ctx=createContext(),a=await api(ctx);
 for(const property of ['isPlatformAdmin','is_platform_admin','permissions']){
  const r=await a.app.inject({method:'POST',url:'/api/system/users',headers:a.headers(ids.platform),payload:{...createPayload,[property]:true}});assert.equal(r.statusCode,400,r.body);
 }
 assert.equal(ctx.users.has(ids.created),false);await a.app.close();
});
test('tenant manager cannot create/edit foreign-company users or move accounts',async()=>{
 const ctx=createContext(),a=await api(ctx),headers=a.headers(ids.manager);
 assert.equal((await a.app.inject({method:'POST',url:'/api/system/users',headers,payload:{...createPayload,companyId:ids.other}})).statusCode,403);
 assert.equal((await a.app.inject({method:'PUT',url:'/api/system/users/'+ids.foreign,headers,payload:updatePayload(ctx.users.get(ids.foreign))})).statusCode,404);
 assert.equal((await a.app.inject({method:'PUT',url:'/api/system/users/'+ids.target,headers,payload:updatePayload(ctx.users.get(ids.target),{companyId:ids.other})})).statusCode,403);
 const r=await a.app.inject({url:'/api/system/users?companyId='+ids.other,headers});assert.ok(r.json().data.every(u=>u.id!==ids.foreign));await a.app.close();
});
test('cannot take over a platform/high-privilege account by downgrading its role plus resetting password',async()=>{
 const ctx=createContext(),a=await api(ctx),headers=a.headers(ids.manager);ctx.users.get(ids.target).role='high';
 for(const id of [ids.platform,ids.admin,ids.target]){
  const oldHash=ctx.users.get(id).password_hash;const r=await a.app.inject({method:'PUT',url:'/api/system/users/'+id,headers,payload:updatePayload(ctx.users.get(id),{role:'viewer',password:'synthetic-takeover'})});assert.equal(r.statusCode,403,r.body);assert.equal(ctx.users.get(id).password_hash,oldHash);
 }
 await a.app.close();
});
test('TASK 004 absent requires no migration; its individual grants limit delegation when present',async()=>{
 const ctx=createContext(),a=await api(ctx);ctx.task004Present=true;ctx.task004.set(ids.target,['exchange_rate.approve']);
 const r=await a.app.inject({method:'PUT',url:'/api/system/users/'+ids.target,headers:a.headers(ids.manager),payload:updatePayload(ctx.users.get(ids.target))});assert.equal(r.statusCode,403,r.body);
 assert.equal(ctx.queries.some(q=>/^(INSERT|UPDATE|DELETE).*task004_user_permissions/.test(q.sql)),false);await a.app.close();
});
test('admin can maintain own existing account; self-disable/demotion and credential-only takeover are blocked',async()=>{
 const ctx=createContext(),a=await api(ctx),headers=a.headers(ids.admin);const own=ctx.users.get(ids.admin);
 assert.equal((await a.app.inject({method:'PUT',url:'/api/system/users/'+ids.admin,headers,payload:updatePayload(own,{fullName:'Updated test name'})})).statusCode,200);
 for(const patch of [{isActive:false},{role:'viewer'},{password:'synthetic-new-password'}])assert.equal((await a.app.inject({method:'PUT',url:'/api/system/users/'+ids.admin,headers,payload:updatePayload(own,patch)})).statusCode,403);
 const r=await a.app.inject({method:'PUT',url:'/api/system/users/'+ids.admin,headers,payload:updatePayload(own,{password:'synthetic-new-password',currentPassword:testPassword})});assert.equal(r.statusCode,200,r.body);await a.app.close();
});
test('platform credential reset requires current password, preventing backup reauthentication bypass',async()=>{
 const ctx=createContext(),a=await api(ctx),headers=a.headers(ids.platform),own=ctx.users.get(ids.platform);
 assert.equal((await a.app.inject({method:'PUT',url:'/api/system/users/'+ids.platform,headers,payload:updatePayload(own,{password:'synthetic-new-password'})})).statusCode,403);
 assert.equal(ctx.users.get(ids.platform).password_hash,fixtureHash);assert.equal((await a.app.inject({method:'PUT',url:'/api/system/users/'+ids.platform,headers,payload:updatePayload(own,{password:'synthetic-new-password',currentPassword:testPassword})})).statusCode,200);await a.app.close();
});
test('permission revoked between authentication and mutation is rejected by transactional live check',async()=>{
 const ctx=createContext(),a=await api(ctx),headers=a.headers(ids.manager);ctx.afterLiveRead=async count=>{if(count===1)ctx.roles.manager=ctx.roles.manager.filter(c=>c!=='users.manage');};
 const r=await a.app.inject({method:'POST',url:'/api/system/users',headers,payload:createPayload});assert.equal(r.statusCode,403,r.body);assert.equal(ctx.users.has(ids.created),false);assert.ok(ctx.queries.some(q=>q.sql==='ROLLBACK'));await a.app.close();
});
test('platform revocation between authentication and global-role mutation is rejected',async()=>{
 const ctx=createContext(),a=await api(ctx),headers=a.headers(ids.platform);ctx.afterLiveRead=async count=>{if(count===1)ctx.users.get(ids.platform).is_platform_admin=false;};
 const r=await a.app.inject({method:'PUT',url:'/api/system/roles/viewer',headers,payload:{name:'Viewer',permissionCodes:['users.manage']}});assert.equal(r.statusCode,403,r.body);assert.deepEqual(ctx.roles.viewer,['dashboard.view']);await a.app.close();
});
test('user-write audit failure rolls back the account change',async()=>{
 const ctx=createContext(),a=await api(ctx);ctx.failAudit='USER_AUDIT';const previous=JSON.stringify(ctx.users.get(ids.target));
 const r=await a.app.inject({method:'PUT',url:'/api/system/users/'+ids.target,headers:a.headers(ids.manager),payload:updatePayload(ctx.users.get(ids.target),{fullName:'Should rollback'})});assert.equal(r.statusCode,500);assert.equal(JSON.stringify(ctx.users.get(ids.target)),previous);await a.app.close();
});
test('sensitive session control needs a live explicit grant, while other admin bypasses are retained',async()=>{
 const ctx=createContext(),a=await api(ctx),headers=a.headers(ids.admin);ctx.roles.admin=ctx.roles.admin.filter(p=>p!=='settings.manage');
 assert.equal((await a.app.inject({url:'/api/system/active-sessions',headers})).statusCode,403);
 assert.equal((await a.app.inject({method:'POST',url:'/api/system/purge-business-data',headers,payload:{confirmPhrase:'مسح البيانات',password:testPassword}})).statusCode,403);assert.equal(ctx.purgeCalled,undefined);
 assert.equal((await a.app.inject({url:'/api/system/settings',headers})).statusCode,200);await a.app.close();
});
test('platform admin can create an ordinary account in another company with platform audit',async()=>{
 const ctx=createContext(),a=await api(ctx);const r=await a.app.inject({method:'POST',url:'/api/system/users',headers:a.headers(ids.platform),payload:{...createPayload,companyId:ids.other}});assert.equal(r.statusCode,201,r.body);assert.equal(ctx.users.get(ids.created).company_id,ids.other);assert.ok(ctx.audits.some(e=>e.action==='CREATE_USER_IN_OTHER_COMPANY'));await a.app.close();
});
test('dump service uses unique private files, excludes passwords from argv and removes failed partial dumps',async()=>{
 for(const success of [true,false]){
  const ctx=createContext(),load=sourceLoader(ctx);const files=new Map();const spawns=[];let openedMode=null;
  const fakeFs={openSync(p,flags,mode){assert.equal(flags,'wx');openedMode=mode;files.set(p,Buffer.alloc(0));return 42;},closeSync(){},existsSync:p=>files.has(p),statSync:p=>({size:files.get(p)?.length||0}),unlinkSync:p=>files.delete(p)};
  const fakeChild={spawn(command,args,options){spawns.push({args,options});const child=new EventEmitter();child.stderr=new EventEmitter();setImmediate(()=>{const p=args[args.indexOf('-f')+1];files.set(p,Buffer.from('synthetic dump'));child.stderr.emit('data',Buffer.from('synthetic diagnostic password must never escape'));child.emit('close',success?0:1);});return child;}};
  const service=load('server/src/services/databaseBackupDownloadService.ts',{modules:{'node:fs':fakeFs,'node:child_process':fakeChild,'node:os':{tmpdir:()=>'/virtual-test-only'}},process:{env:{DATABASE_URL:'postgresql://fixture:synthetic-only-password@127.0.0.1/synthetic_task005?sslmode=disable'}}});
  if(success){const first=await service.createDatabaseBackupFile(),second=await service.createDatabaseBackupFile();assert.notEqual(first.filePath,second.filePath);service.safeUnlink(first.filePath);service.safeUnlink(second.filePath);}
  else await assert.rejects(service.createDatabaseBackupFile(),e=>e.code==='BACKUP_CREATION_FAILED'&&!e.message.includes('diagnostic'));
  assert.equal(openedMode,0o600);assert.ok(spawns.every(s=>!s.args.some(a=>a.includes('synthetic-only-password'))));assert.ok(spawns.every(s=>s.options.env.PGPASSWORD==='synthetic-only-password'));assert.equal(files.size,0);
 }
});
test('unauthenticated backup requests cannot create a dump or open a file',async()=>{
 const ctx=createContext(),a=await api(ctx);
 assert.equal((await a.app.inject({url:'/api/system/backup/download'})).statusCode,401);
 assert.equal((await a.app.inject({method:'POST',url:'/api/system/backup/download',payload:backupPayload})).statusCode,401);
 assert.equal(ctx.dumpCalls,0);assert.equal(ctx.streamCalls,0);await a.app.close();
});
test('TASK 004 matching individual grants do not unnecessarily block same-level user maintenance',async()=>{
 const ctx=createContext(),a=await api(ctx);ctx.task004Present=true;ctx.task004.set(ids.manager,['exchange_rate.approve']);ctx.task004.set(ids.target,['exchange_rate.approve']);
 const r=await a.app.inject({method:'PUT',url:'/api/system/users/'+ids.target,headers:a.headers(ids.manager),payload:updatePayload(ctx.users.get(ids.target),{fullName:'Permitted same-level update'})});assert.equal(r.statusCode,200,r.body);
 assert.equal(ctx.users.get(ids.target).full_name,'Permitted same-level update');await a.app.close();
});
test('legacy GET fails closed if denial audit cannot be recorded',async()=>{
 const ctx=createContext(),a=await api(ctx);ctx.failAudit='FULL_BACKUP_DENIED';const r=await a.app.inject({url:'/api/system/backup/download',headers:a.headers(ids.platform)});
 assert.equal(r.statusCode,500);assert.equal(ctx.dumpCalls,0);assert.equal(r.body.includes('synthetic secret'),false);await a.app.close();
});
test('valid global role change is audited and remains platform-only',async()=>{
 const ctx=createContext(),a=await api(ctx),payload={name:'Viewer',permissionCodes:['dashboard.view','inventory.view']};
 assert.equal((await a.app.inject({method:'PUT',url:'/api/system/roles/viewer',headers:a.headers(ids.admin),payload})).statusCode,403);
 const r=await a.app.inject({method:'PUT',url:'/api/system/roles/viewer',headers:a.headers(ids.platform),payload});assert.equal(r.statusCode,200,r.body);assert.deepEqual(ctx.roles.viewer,payload.permissionCodes);assert.ok(ctx.audits.some(e=>e.action==='UPDATE_ROLE_PERMISSIONS'));await a.app.close();
});
module.exports={createContext,api,ids,testPassword,fakeDump,sourceLoader};
if(require.main===module)(async()=>{let failed=0;for(const[name,fn]of tests){try{await fn();console.log('PASS '+name);}catch(e){failed++;console.error('FAIL '+name+'\n'+e.stack);}}console.log(tests.length+' targeted tests; '+failed+' failures. No real database, dump, socket or production access.');process.exitCode=failed?1:0;})();
