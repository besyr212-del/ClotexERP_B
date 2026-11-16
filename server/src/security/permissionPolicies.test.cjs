/* Targeted, offline tests: real source/AST/Fastify; synthetic DB and backup fixtures only. */
const assert=require('node:assert/strict');
const {inspectSources}=require('./inspectPolicySources.cjs');
const {build}=require('./buildPermissionPolicies.cjs');
const manifest=require('./permission-policy-manifest.json');
const {createContext,sourceLoader,api,ids,testPassword}=require('../routes/task005PhaseA.security.test.cjs');
const load=sourceLoader(createContext());
const {lookupApiPolicy:lookup,evaluateApiPolicy:evaluate}=load('server/src/security/permissionPolicies.ts');
const {BoundedPermissionShadowAudit:Audit}=load('server/src/security/permissionShadowAudit.ts');
const tests=[],test=(name,fn)=>tests.push([name,fn]);
const actor={companyId:'synthetic-company',permissions:[],isPlatformAdmin:false};
const all={...actor,permissions:manifest.permissions.map(p=>p.code),isPlatformAdmin:true};
const policy=(method,path)=>{const p=lookup(method,path);assert.ok(p,method+' '+path);return p;};

test('AST inventory covers every registered route and all frontend declarations',()=>{
 const source=inspectSources();
 assert.deepEqual(source.counts,{apiDeclarations:393,registeredApiRoutes:402,routeFiles:50,frontendRoutes:72,reports:69});
 assert.deepEqual(manifest.sourceCounts,source.counts);
 assert.deepEqual(manifest.policies.map(p=>p.id).sort(),source.routes.map(p=>p.method+' '+p.path).sort());
 assert.equal(new Set(manifest.policies.map(p=>p.id)).size,402);
 assert.equal(manifest.pages.length,72);
 assert.deepEqual(build(),manifest,'Regeneration must be deterministic and reviewed artifacts current');
});
test('catalog codes are unique, bilingual, and all policy references are known',()=>{
 const known=new Set(manifest.permissions.map(p=>p.code));assert.equal(known.size,manifest.permissions.length);
 for(const p of manifest.permissions){assert.ok(p.section&&p.page&&p.operation);assert.match(p.description.ar,/[\u0600-\u06ff]/);assert.ok(p.description.tr.length>3);}
 for(const p of manifest.policies){
  assert.ok(p.currentGuard);assert.ok(p.company);assert.ok(p.warehouse);
  const refs=[...p.required,...p.sensitive,...p.approval,...p.conditions.flatMap(c=>c.required),...Object.values(p.variant?.cases||{}).flat()];
  for(const code of refs)assert.ok(known.has(code),p.id+': '+code);
  if(p.kind==='BUSINESS')assert.ok(p.required.length||p.variant,'Business authentication alone is insufficient: '+p.id);
 }
});
test('preserve all legacy keys and six TASK004 names without importing its code',()=>{
 const legacy=inspectSources().legacy;assert.equal(legacy.length,21);
 for(const p of legacy)assert.equal(manifest.permissions.find(c=>c.code===p.code)?.status,'LEGACY');
 assert.deepEqual(manifest.task004Compatibility.keys,['exchange_rate.view','exchange_rate.manage','exchange_rate.approve','customer_legacy.import','customer_legacy.review','customer_statement.export']);
 assert.equal(manifest.task004Compatibility.merged,false);
 for(const key of manifest.task004Compatibility.keys){
  assert.ok(manifest.permissions.some(p=>p.code===key));
  const synthetic={...policy('GET','/api/system/users'),required:[key],conditions:[],variant:undefined};
  assert.equal(evaluate(synthetic,{...actor,permissions:[key]},null,[key]).reason,'EXPLICIT_DENY_WINS');
 }
});
test('only exact public and self exceptions; no prefix/HEAD/retired backup loophole',()=>{
 assert.deepEqual(manifest.policies.filter(p=>p.kind==='PUBLIC').map(p=>p.id).sort(),[
  'GET /api/health/live','GET /api/health','GET /api/system/info','GET /api/companies/public','POST /api/auth/login','POST /api/auth/logout','GET /api/activation/status','POST /api/activation/activate'].sort());
 assert.deepEqual(manifest.policies.filter(p=>p.kind==='SELF').map(p=>p.path).sort(),['/api/auth/me','/api/auth/presence','/api/permission-profiles/me','/api/permission-profiles/me/check']);
 for(const p of manifest.policies.filter(p=>['PUBLIC','SELF'].includes(p.kind)))assert.ok(p.exemptionReason?.ar&&p.exemptionReason?.tr);
 assert.equal(lookup('GET','/api/auth/login/extra'),null);
 assert.equal(lookup('HEAD','/api/system/backup/download'),lookup('GET','/api/system/backup/download'));
 assert.equal(evaluate(policy('GET','/api/system/backup/download'),all,null).permission,'DENY');
 assert.equal(evaluate(policy('POST','/api/system/backup/download'),actor,null).reason,'LIVE_PLATFORM_FLAG_REQUIRED');
 assert.equal(manifest.frameworkOptions.kind,'PROTOCOL_ONLY');
});
test('demo pages have view only; reports use distinct sensitive rights',()=>{
 for(const page of manifest.pages.filter(p=>p.demo)){
  assert.equal(page.required.length,1);assert.ok(page.required[0].endsWith('.view'));
  const domain=page.required[0].slice(0,-5);assert.deepEqual(manifest.permissions.filter(p=>p.code.startsWith(domain+'.')).map(p=>p.code),page.required);
 }
 const reports=manifest.policies.filter(p=>p.source.plugin==='reportRoutes');assert.equal(reports.length,69);
 for(const p of reports){assert.ok(p.required.some(k=>k.startsWith('reports.')&&k.endsWith('.view')));if(p.sensitive.includes('financial.profit.view'))assert.ok(p.required.includes('financial.profit.view'));if(p.sensitive.includes('payroll.salary.view'))assert.ok(p.required.includes('payroll.salary.view'));}
 assert.ok(manifest.permissions.some(p=>p.code.endsWith('.print')));assert.ok(manifest.permissions.some(p=>p.code.endsWith('.export')));
});
test('inline confirmation and payment need independent compound permissions',()=>{
 for(const p of manifest.policies.filter(p=>p.conditions.some(c=>c.when==='CONFIRM_TRUE'))){
  const draft=evaluate(p,actor,{confirm:false}),confirmed=evaluate(p,actor,{confirm:true,paidAmount:5});
  for(const code of p.conditions.find(c=>c.when==='CONFIRM_TRUE').required){assert.ok(!draft.missing.includes(code));assert.ok(confirmed.missing.includes(code));}
  for(const c of p.conditions.filter(c=>c.when==='CONFIRM_AND_PAID'))for(const code of c.required)assert.ok(confirmed.missing.includes(code));
 }
 for(const p of manifest.policies.filter(p=>p.compound.length&&!p.path.startsWith('/api/journal'))){assert.ok(!p.required.includes('journal.post'),p.id);}
 const derived=manifest.policies.filter(p=>p.path.includes('create-purchase-invoice')||p.path.endsWith('/finalize-purchase'));assert.equal(derived.length,2);
 for(const p of derived){assert.ok(p.required.includes('purchases.create'));assert.ok(p.required.includes('purchases.confirm'));}
});
test('document variants require trusted persisted context and resist prototype keys',()=>{
 const variants=manifest.policies.filter(p=>p.variant);assert.ok(variants.length>5);
 for(const p of variants){
  const bodySource=p.variant.source.startsWith('BODY:');
  const field=p.variant.source.includes('voucherType')?'voucherType':'returnType';
  assert.equal(evaluate(p,all,{[field]:'__proto__'}).permission,'UNRESOLVED');
  assert.equal(evaluate(p,all,{[field]:'constructor'}).permission,'UNRESOLVED');
  if(bodySource){for(const [value,keys]of Object.entries(p.variant.cases))for(const key of keys)assert.ok(evaluate(p,actor,{[field]:value}).missing.includes(key));}
  else assert.equal(evaluate(p,all,{voucherType:'RECEIPT',returnType:'SALES'}).permission,'UNRESOLVED');
 }
});
test('financial imports and untrusted render/send inputs cannot masquerade as archival or authorized documents',()=>{
 const legacy=manifest.policies.find(p=>p.source.plugin==='customerLegacyImportRoutes');
 assert.ok(legacy.required.includes('customer_statement.financial_import'));
 assert.ok(legacy.compound.includes('CURRENT_CLOTEX_FINANCIAL_IMPORT_NOT_TASK004_ARCHIVE'));
 assert.ok(!legacy.required.includes('customer_legacy.import'));
 for(const p of manifest.policies.filter(p=>p.source.plugin==='documentPdfRoutes'||p.source.plugin==='telegramRoutes'&&['/invoice','/statement','/voucher'].includes(p.source.localPath))){
  assert.match(p.resolver,/TRUSTED_DOCUMENT/);assert.ok(p.compound.length);
  assert.notEqual(evaluate(p,all,{html:'synthetic HTML',filename:'customer-statement.pdf',chatId:'synthetic'}).decision,'ALLOW');
 }
});
test('no implicit admin/legacy expansion; company and sensitive resource checks remain unresolved',()=>{
 const users=policy('GET','/api/system/users');
 assert.equal(evaluate(users,{...actor,role:'admin',permissions:['users.manage']},null).permission,'DENY');
 const business=manifest.policies.find(p=>p.company==='SESSION'&&p.required.length&&p.sensitive.length);
 assert.equal(evaluate(business,{...all,companyId:''},null).reason,'COMPANY_CONTEXT_REQUIRED');
 assert.equal(evaluate(business,all,null).decision,'INDETERMINATE');
 assert.equal(evaluate(business,all,null).projectionRequired,true);
});
test('shadow aggregation is bounded, secret-free, and logging failure cannot escape',()=>{
 let now=0;const entries=[],audit=new Audit(e=>entries.push(e),()=>now);
 const secret='CANARY_PASSWORD_JWT_FINANCIAL_HTML';
 for(let i=0;i<1000;i++)audit.observe('GET','/unknown/'+secret+i,200,{...actor,companyId:secret},{password:secret,amount:123456789,html:secret});
 assert.equal(audit.stats().buckets,1);assert.equal(entries.length,0);
 for(const p of manifest.policies){audit.observe(p.method,p.path,200,actor,null);audit.observe(p.method,p.path,200,undefined,null);audit.observe(p.method,p.path,403,all,null);}
 assert.ok(audit.stats().buckets<=512);assert.ok(audit.stats().dropped>0);
 now=60001;audit.observe('OPTIONS','/api/system/users',204,undefined,null);
 assert.ok(entries.length<=10);assert.ok(entries.length>0);assert.ok(!JSON.stringify(entries).includes(secret));assert.ok(!JSON.stringify(entries).includes('123456789'));
 assert.ok(entries.some(e=>e.policyId==='UNMAPPED'&&e.count===1000));
 for(const entry of entries)assert.deepEqual(Object.keys(entry).sort(),['event','mode','policyId','observation','reason','count','missing','scope'].sort());
 let clock=0;const broken=new Audit(()=>{throw Error(secret);},()=>clock);broken.observe('GET','/api/system/users',200,actor,null);clock=60001;assert.doesNotThrow(()=>broken.observe('OPTIONS','/',204,undefined,null));assert.ok(broken.stats().failures>0);
});
test('actual Fastify outcomes and SQL count unchanged with shadow, including secure backup',async()=>{
 const scenarios=[
  [ids.admin,'GET','/api/system/users',undefined,200],
  [ids.ordinary,'GET','/api/system/users',undefined,403],
  [ids.platform,'GET','/api/system/backup/download',undefined,405],
  [ids.admin,'POST','/api/system/backup/download',{password:testPassword,confirmPhrase:'FULL_PLATFORM_BACKUP'},403],
  [ids.platform,'POST','/api/system/backup/download',{password:'synthetic-wrong',confirmPhrase:'FULL_PLATFORM_BACKUP'},403],
  [ids.platform,'POST','/api/system/backup/download',{password:testPassword,confirmPhrase:'FULL_PLATFORM_BACKUP'},200],
 ];
 for(const [id,method,url,payload,status]of scenarios){
  const results=[];
  for(const shadow of [false,true]){
   const ctx=createContext();const a=await api(ctx,shadow?{shadow:new Audit(()=>{throw Error('logger unavailable');})}:{});
   try{const r=await a.app.inject({method,url,payload,headers:a.headers(id)});assert.equal(r.statusCode,status,r.body);results.push({status:r.statusCode,body:r.rawPayload.toString('base64'),sql:ctx.queries.length,dumps:ctx.dumpCalls,disposition:r.headers['content-disposition']});}finally{await a.app.close();}
  }
  assert.deepEqual(results[1],results[0],method+' '+url);
 }
});
test('live revocation and platform checks survive a proposed shadow allow',async()=>{
 const ctx=createContext(),a=await api(ctx,{shadow:new Audit(()=>{})});
 try{
  ctx.roles.admin.push('platform.backup.download');const headers=a.headers(ids.admin);
  assert.equal((await a.app.inject({method:'POST',url:'/api/system/backup/download',headers,payload:{password:testPassword,confirmPhrase:'FULL_PLATFORM_BACKUP'}})).statusCode,403);
  const platformHeaders=a.headers(ids.platform);ctx.users.get(ids.platform).is_platform_admin=false;
  assert.equal((await a.app.inject({method:'POST',url:'/api/system/backup/download',headers:platformHeaders,payload:{password:testPassword,confirmPhrase:'FULL_PLATFORM_BACKUP'}})).statusCode,403);
  assert.equal(ctx.dumpCalls,0);
 }finally{await a.app.close();}
});
(async()=>{let failed=0;for(const[name,fn]of tests){try{await fn();console.log('PASS '+name);}catch(e){failed++;console.error('FAIL '+name+'\n'+e.stack);}}console.log(tests.length+' Phase B targeted tests; '+failed+' failures. Offline synthetic fixtures only.');process.exitCode=failed?1:0;})();
