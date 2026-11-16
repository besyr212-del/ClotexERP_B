/* Local integration regression: actual handlers/AST/Fastify, synthetic identities only. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createRequire}=require('node:module'),root=path.resolve(__dirname,'../../..'),deps=createRequire(path.join(root,'package.json')),ts=deps('typescript');
const {context}=require('../../../src/lib/api/platformBackup.a1.test.cjs');
const {createContext,sourceLoader,ids}=require('../routes/task005PhaseA.security.test.cjs');
const {inspectSources}=require('./inspectPolicySources.cjs'),manifest=require('./permission-policy-manifest.json');
const tests=[],test=(name,fn)=>tests.push([name,fn]);
test('all seven finite lifecycle paths and eligible-rolls have business policies, no default grants',()=>{
 const paths=manifest.policies.filter(p=>p.source.plugin==='externalManufacturingRoutes');assert.equal(paths.length,7);
 assert.deepEqual(paths.filter(p=>p.method==='POST').map(p=>p.path.split('/').at(-1)).sort(),['returns','services','settlements','resolve-defect','service-pricing','close'].sort());
 for(const p of paths){assert.equal(p.kind,'BUSINESS');assert.equal(p.company,'SESSION');assert.equal(p.warehouse,'ENTITY_LOOKUP');assert.ok(p.required.length);assert.ok(p.resolver.includes('WAREHOUSES'));}
 const defect=paths.find(p=>p.path.endsWith('/resolve-defect'));assert.deepEqual(defect.approval,['external_job.resolve_defect']);
 assert.ok(paths.find(p=>p.path.endsWith('/service-pricing')).compound.includes('SERVICE_PRICING_UPDATES_FEE_HEADER_NOT_GL_POSTING'));
 assert.ok(manifest.policies.find(p=>p.source.plugin==='inventoryTransferRoutes'&&p.source.localPath==='/eligible-rolls')?.required.includes('inventory_transfer.create'));
 assert.equal(manifest.permissions.length,360);
 for(const code of ['external_job.resolve_defect','external_job.close'])assert.equal(manifest.permissions.find(p=>p.code===code)?.status,'PROPOSED');
 for(const p of inspectSources().legacy)assert.ok(manifest.permissions.some(n=>n.code===p.code));
});
test('unresolvable dynamic route expressions fail closed rather than executing source',()=>{
 const read=fs.readFileSync;fs.readFileSync=function(file,...args){const value=read.call(this,file,...args);return String(file).endsWith('externalManufacturingRoutes.ts')?String(value).replace('Object.entries(actions)','loadUntrustedActions()'):value;};
 try{assert.throws(()=>inspectSources(),/Nonliteral|finite|Dynamic/i);}finally{fs.readFileSync=read;}
});
function editor(overrides={}){
 const source=fs.readFileSync(path.join(root,'src/pages/SystemSettings.tsx'),'utf8'),sf=ts.createSourceFile('SystemSettings.tsx',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),found={};
 function visit(n){if(ts.isVariableDeclaration(n)&&['handleUpdateUser','closeEditUser','openEditUser'].includes(n.name.getText(sf)))found[n.name.getText(sf)]=n.initializer.getText(sf);ts.forEachChild(n,visit);}visit(sf);
 const c={currentUser:{id:'actor',isPlatformAdmin:true},editingUser:{id:'target'},editUserForm:{username:'synthetic',fullName:'Synthetic',role:'viewer',isActive:true,notes:'',password:'',currentPassword:''},calls:[],errors:[],setEditUserSaving(){},setEditUserError(v){c.errors.push(v);},setEditingUser(v){c.editingUser=v;},setEditUserForm(v){c.editUserForm=typeof v==='function'?v(c.editUserForm):v;},setUsers(){},showToast(){},t:k=>k,async updateSystemUser(id,body){c.calls.push({id,body});return {id};},...overrides};
 const sandbox=vm.createContext(c);vm.runInContext(ts.transpileModule(Object.entries(found).map(([name,value])=>'var '+name+' = '+value+';').join('\n'),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,sandbox);return c;
}
test('actual existing edit handler requires actor reauth and clears input before sending; close/reopen clear secrets',async()=>{
 const c=editor();await c.handleUpdateUser();assert.equal(c.calls.length,0);assert.ok(c.errors.includes('users.currentPasswordRequired'));
 c.editUserForm.currentPassword=' synthetic actor password ';await c.handleUpdateUser();assert.equal(c.calls[0].body.currentPassword,' synthetic actor password ');assert.equal(c.editUserForm.currentPassword,'');
 c.editUserForm.currentPassword='secret';c.editUserForm.password='target secret';c.closeEditUser();assert.equal(c.editUserForm.currentPassword,'');assert.equal(c.editUserForm.password,'');
 c.openEditUser({id:'new',username:'new',role:'viewer',is_active:true});assert.equal(c.editUserForm.currentPassword,'');
 const own=editor({currentUser:{id:'target',isPlatformAdmin:false}});own.editUserForm.password='new password';await own.handleUpdateUser();assert.equal(own.calls.length,0);
 const ordinary=editor({currentUser:{id:'actor',isPlatformAdmin:false}});await ordinary.handleUpdateUser();assert.equal(ordinary.calls.length,1);assert.equal('currentPassword' in ordinary.calls[0].body,false);
});
test('actual settings API uses current token and body-only actor password, Arabic/Turkish labels exist',async()=>{
 const c=context({apiBase:'https://synthetic-api.invalid'});c.nextResponse=new Response(JSON.stringify({ok:true,data:{id:'target'}}),{headers:{'Content-Type':'application/json'}});
 await c.load('src/lib/api/settingsApi.ts').updateSystemUser('target',{username:'synthetic',fullName:'',role:'viewer',isActive:true,currentPassword:'synthetic secret'});
 assert.equal(c.calls[0].request.method,'PUT');assert.equal(c.calls[0].request.headers.get('Authorization'),'Bearer synthetic-web-token');assert.equal(JSON.parse(c.calls[0].request.body).currentPassword,'synthetic secret');assert.ok(!c.calls[0].url.includes('secret'));
 for(const lang of ['ar','tr']){const data=JSON.parse(fs.readFileSync(path.join(root,'src/locales',lang,'settings.json'),'utf8'));for(const key of ['Label','Hint','Required'])assert.ok(data['users.currentPassword'+key]);}
});
test('upstream manufacturing error translation survives merged client',()=>{
 const c=context({lang:'tr'}),locales=JSON.parse(fs.readFileSync(path.join(root,'src/locales/ar/externalJobs.json'),'utf8')),tr=JSON.parse(fs.readFileSync(path.join(root,'src/locales/tr/externalJobs.json'),'utf8'));
 const key=Object.keys(locales).find(k=>k.startsWith('lifecycle.errors.')&&tr[k]&&tr[k]!==locales[k]);assert.ok(key);const {ApiRequestError}=c.load('src/lib/api/client.ts');assert.equal(new ApiRequestError(locales[key],400).message,tr[key]);
});
test('actual dynamic Fastify routes preserve guards, current identity, tenant forwarding, and rollback',async()=>{
 const ctx=createContext(),load=sourceLoader(ctx),app=deps('fastify')({logger:false}),calls=[],queries=[];
 const old=ctx.pool.connect;ctx.pool.connect=async()=>({query:async sql=>{queries.push(sql);return {rows:[]};},release(){}});
 const run=async(db,company,user,job)=>{calls.push({company,user,job});if(job==='fail')throw Object.assign(Error('synthetic'),{code:'INVALID_STATE'});return {};};
 const services={manufacturingOverview:async()=>({services:[]}),receiveManufacturingBatch:run,settleManufacturingShortage:run,resolveManufacturingDefect:run,priceManufacturingServices:run,closeManufacturingJob:async(db,company,job)=>run(db,company,null,job),replaceManufacturingServices:async(db,company,job)=>run(db,company,null,job)};
 await app.register(load('server/src/routes/externalManufacturingRoutes.ts',{modules:{'../services/externalManufacturingLifecycle.js':services}}).externalManufacturingRoutes,{prefix:'/api/external-jobs'});
 const auth=load('server/src/middleware/auth.ts');const token=id=>{const u=ctx.users.get(id);return auth.signAuthToken({sub:id,companyId:u.company_id,username:u.username,role:'admin',permissions:['inventory.manage'],isPlatformAdmin:true});};
 try{for(const action of ['returns','services','settlements','resolve-defect','service-pricing','close']){
  const url='/api/external-jobs/synthetic/lifecycle/'+action;
  assert.equal((await app.inject({method:'POST',url,payload:{}})).statusCode,401);
  assert.equal((await app.inject({method:'POST',url,payload:{},headers:{authorization:'Bearer '+token(ids.ordinary)}})).statusCode,403);
  assert.equal((await app.inject({method:'POST',url,payload:{},headers:{authorization:'Bearer '+token(ids.admin)}})).statusCode,200);
  assert.equal(calls.at(-1).company,ids.company);
 }
 const r=await app.inject({method:'POST',url:'/api/external-jobs/fail/lifecycle/returns',payload:{},headers:{authorization:'Bearer '+token(ids.admin)}});assert.equal(r.statusCode,400);assert.equal(queries.at(-1),'ROLLBACK');
 ctx.users.get(ids.admin).is_active=false;assert.equal((await app.inject({method:'GET',url:'/api/external-jobs/synthetic/lifecycle',headers:{authorization:'Bearer '+token(ids.admin)}})).statusCode,401);
 }finally{await app.close();ctx.pool.connect=old;}
});
(async()=>{let failed=0;for(const[name,fn]of tests){try{await fn();console.log('PASS '+name);}catch(e){failed++;console.error('FAIL '+name+'\n'+e.stack);}}console.log(tests.length+' integration checks; '+failed+' failures');process.exitCode=failed?1:0;})();
