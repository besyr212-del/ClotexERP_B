/* Actual C1 services/routes + Fastify/JWT, synthetic transactional SQL adapter.
 * This is NOT PostgreSQL validation. No socket, database or production access. */
const assert=require('node:assert/strict');
const {createContext,sourceLoader,api,ids,testPassword}=require('../routes/task005PhaseA.security.test.cjs');
const clone=v=>structuredClone(v),uid=n=>'a0000000-0000-4000-8000-'+String(n).padStart(12,'0');
const wh1=uid(1),wh2=uid(2),foreignWh=uid(3),roll=uid(4),transfer=uid(5),invoice=uid(6);
function fixture(){
 const c=createContext();c.installed=true;c.failC1Audit=false;c.sql=[];let serial=100,tail=Promise.resolve();
 c.state={templates:new Map(),versions:new Map(),profiles:new Map(),defaults:new Map(),audits:[]};
 c.warehouses=new Map([[wh1,ids.company],[wh2,ids.company],[foreignWh,ids.other]]);
 c.resources=new Map([[roll,{companyId:ids.company,warehouses:[wh1]}],[transfer,{companyId:ids.company,warehouses:[wh1,wh2]}],[invoice,{companyId:ids.company,warehouses:[wh1,wh2]}]]);
 const basePool=c.pool;
 function connectClient(){const base=basePool.connect();let local=null,unlock=null;
  return {release(){if(unlock){unlock();unlock=null;}},async query(original,p=[]){
   c.sql.push(original);const q=original.replace(/\s+/g,' ').trim();let rows;const placeholders=[...q.matchAll(/\$(\d+)/g)].map(m=>+m[1]);if(placeholders.length)assert.equal(Math.max(...placeholders),p.length,'SQL parameter count: '+q);
   if(q==='BEGIN'){local=clone(c.state);return (await base).query(original,p);}
   if(q.includes('pg_advisory_xact_lock')){let release;const previous=tail;tail=new Promise(r=>release=r);await previous;unlock=release;local=clone(c.state);return {rows:[],rowCount:0};}
   if(q==='COMMIT'){const r=await (await base).query(original,p);if(local)c.state=local;local=null;if(unlock){unlock();unlock=null;}return r;}
   if(q==='ROLLBACK'){local=null;const r=await (await base).query(original,p);if(unlock){unlock();unlock=null;}return r;}
   const s=local??c.state;
   if(q.includes("to_regclass('public.user_permission_profiles')"))rows=[{present:c.installed}];
   else if(q.startsWith('SELECT * FROM user_permission_profiles'))rows=s.profiles.has(p[0])?[clone(s.profiles.get(p[0]))]:[];
   else if(q.startsWith('SELECT id,company_id,username,full_name,role,is_active,is_platform_admin FROM users')&&q.includes('company_id=$2')){const u=c.users.get(p[0]);rows=u?.company_id===p[1]?[clone(u)]:[];}
   else if(q.startsWith('SELECT is_active FROM companies'))rows=[{is_active:true}];
   else if(q.startsWith('SELECT * FROM permission_templates')){const t=s.templates.get(p[0]);rows=t?.company_id===p[1]?[clone(t)]:[];}
   else if(q.startsWith('SELECT id,name,draft_revision'))rows=[...s.templates.values()].filter(t=>t.company_id===p[0]).map(clone);
   else if(q.startsWith('SELECT codes FROM permission_template_versions')){const v=s.versions.get(p.join(':'));rows=v?[{codes:clone(v.codes)}]:[];}
   else if(q.startsWith('SELECT version,codes,published_by'))rows=[...s.versions.values()].filter(v=>v.company_id===p[0]&&v.template_id===p[1]).map(clone);
   else if(q.startsWith('INSERT INTO permission_templates')){const t={id:uid(serial++),company_id:p[0],name:p[1],draft_codes:clone(p[2]),draft_revision:1,published_version:0,archived:false,created_by:p[3],updated_by:p[3]};s.templates.set(t.id,t);rows=[clone(t)];}
   else if(q.startsWith('UPDATE permission_templates SET name')){const t=s.templates.get(p[0]);rows=[];if(t?.company_id===p[1]&&t.draft_revision===p[5]){Object.assign(t,{name:p[2],draft_codes:clone(p[3]),updated_by:p[4],draft_revision:t.draft_revision+1});rows=[clone(t)];}}
   else if(q.startsWith('UPDATE permission_templates SET published_version')){const t=s.templates.get(p[1]);assert.equal(t.company_id,p[0]);t.published_version++;t.updated_by=p[2];rows=[];}
   else if(q.startsWith('UPDATE permission_templates SET archived')){const t=s.templates.get(p[1]);assert.equal(t.company_id,p[0]);t.archived=true;rows=[];}
   else if(q.startsWith('INSERT INTO permission_template_versions')){const key=p.slice(0,3).join(':');assert.ok(!s.versions.has(key));s.versions.set(key,{company_id:p[0],template_id:p[1],version:p[2],codes:clone(p[3]),published_by:p[4]});rows=[];}
   else if(q.startsWith('SELECT u.id,u.full_name,u.username'))rows=[...s.profiles.values()].filter(v=>v.company_id===p[0]&&v.template_id===p[1]&&c.users.get(v.user_id)?.company_id===v.company_id).map(v=>({...c.users.get(v.user_id),...v})).sort((a,b)=>a.id.localeCompare(b.id)).map(clone);
   else if(q.startsWith('SELECT 1 FROM user_permission_profiles')&&q.includes('JOIN users'))rows=[...s.profiles.values()].filter(v=>v.company_id===p[0]&&v.permission_admin&&v.user_id!==p[1]&&c.users.get(v.user_id)?.is_active&&c.users.get(v.user_id)?.company_id===p[0]).slice(0,1).map(()=>({one:1}));
   else if(q.startsWith('SELECT 1 FROM user_permission_profiles'))rows=[...s.profiles.values()].some(v=>v.company_id===p[0]&&v.template_id===p[1])||s.defaults.get(p[0])===p[1]?[{one:1}]:[];
   else if(q.startsWith('INSERT INTO user_permission_profiles')){
    const old=s.profiles.get(p[0]);const v=old??{user_id:p[0],company_id:p[1],template_id:null,overrides:{},warehouse_mode:'LIST',warehouse_ids:[],permission_admin:false,grantable_codes:[],revision:0};
    if(q.includes('template_id,overrides'))Object.assign(v,{template_id:p[2],overrides:JSON.parse(p[3]),warehouse_mode:p[4],warehouse_ids:clone(p[5])});
    else if(q.includes('permission_admin,grantable_codes'))Object.assign(v,{permission_admin:p[2],grantable_codes:clone(p[3])});
    else v.template_id=p[2];v.revision++;s.profiles.set(p[0],v);rows=[];
   }
   else if(q.startsWith('SELECT template_id FROM company_permission_defaults'))rows=s.defaults.has(p[0])?[{template_id:s.defaults.get(p[0])}]:[];
   else if(q.startsWith('INSERT INTO company_permission_defaults')){s.defaults.set(p[0],p[1]);rows=[];}
   else if(q.startsWith('DELETE FROM company_permission_defaults')){s.defaults.delete(p[0]);rows=[];}
   else if(q.startsWith('INSERT INTO audit_logs')&&q.includes("'PERMISSION_PROFILE'")){if(c.failC1Audit)throw Error('synthetic C1 audit failure');s.audits.push({actor:p[1],action:p[2],details:JSON.parse(p[4])});rows=[];}
   else if(q.startsWith('SELECT id FROM warehouses')&&q.includes('ANY'))rows=p[1].filter(id=>c.warehouses.get(id)===p[0]).map(id=>({id}));
   else if(q.startsWith('SELECT id FROM warehouses WHERE id='))rows=c.warehouses.get(p[0])===p[1]?[{id:p[0]}]:[];
   else if(q.startsWith('SELECT warehouse_id AS id FROM ')||q.startsWith('SELECT from_warehouse_id AS id')){const resource=c.resources.get(p[0]);rows=resource?.companyId===p[1]?resource.warehouses.map(id=>({id})):[];}
   else return (await base).query(original,p);
   return {rows:clone(rows),rowCount:rows.length};
  }};
 }
 c.pool={connect:async()=>connectClient(),query:(sql,p)=>connectClient().query(sql,p)};
 return c;
}
const base='/api/permission-profiles',company='/companies/'+ids.company;
async function setup(){const c=fixture(),a=await api(c,{profiles:true});const request=async(method,path,payload,user=ids.platform)=>a.app.inject({method,url:base+path,payload,headers:a.headers(user)});return {c,a,request};}
const profileBody=(templateId,overrides={},revision=0,warehouseIds=[wh1])=>({templateId,overrides,revision,warehouseMode:'LIST',warehouseIds});
async function createPublished(t,codes=['sales.view']){const r=await t.request('POST',company+'/templates',{name:'Synthetic template',codes});assert.equal(r.statusCode,200,r.body);const id=r.json().data.id;await publish(t,id);return id;}
async function publish(t,id){const p=await t.request('GET',company+'/templates/'+id+'/preview');assert.equal(p.statusCode,200,p.body);const r=await t.request('POST',company+'/templates/'+id+'/publish',{previewToken:p.json().data.previewToken});assert.equal(r.statusCode,200,r.body);return r.json().data;}
const tests=[],test=(n,fn)=>tests.push([n,fn]);

test('engine orders account/company/warehouse boundaries before DENY, ALLOW and template',()=>{
 const load=sourceLoader(createContext()),{decideProfilePermission:decide}=load('server/src/security/profilePermissionEngine.ts');
 const p={userId:ids.target,companyId:ids.company,active:true,companyActive:true,published:['sales.view'],overrides:{'sales.view':'DENY','sales.confirm':'ALLOW'},warehouseMode:'LIST',warehouseIds:[wh1]};
 const scope={companyId:ids.company,warehouseIds:[wh1],verified:true};
 assert.equal(decide(p,'sales.view',scope).source,'USER_DENY');assert.equal(decide(p,'sales.confirm',scope).source,'USER_ALLOW');
 assert.equal(decide({...p,overrides:{'sales.view':'INHERIT'}},'sales.view',scope).source,'TEMPLATE');
 assert.equal(decide(p,'sales.confirm',{...scope,warehouseIds:[wh2]}).reason,'WAREHOUSE_SCOPE_DENIED');
 assert.equal(decide(p,'sales.confirm',{...scope,companyId:ids.other}).reason,'COMPANY_SCOPE_DENIED');
 assert.equal(decide({...p,active:false},'sales.confirm',scope).allowed,false);assert.equal(decide({...p,companyActive:false},'sales.confirm',scope).allowed,false);
 assert.equal(decide(p,'not.real',scope).reason,'UNKNOWN_PERMISSION');assert.equal(decide(p,'platform.backup.download',scope).allowed,false);
 assert.equal(decide(p,'sales.confirm',{...scope,verified:false}).allowed,false);
});
test('publish updates multiple users atomically while preserving individual exceptions and draft isolation',async()=>{
 const t=await setup();try{
  const id=await createPublished(t);
  for(const user of [ids.target,ids.ordinary])assert.equal((await t.request('PUT',company+'/users/'+user+'/profile',profileBody(id,user===ids.target?{'sales.view':'DENY'}:{}))).statusCode,200);
  const edit=await t.request('PUT',company+'/templates/'+id+'/draft',{name:'Draft v2',codes:['sales.view','sales.confirm'],revision:1});assert.equal(edit.statusCode,200,edit.body);
  let p=(await t.request('GET',company+'/users/'+ids.target+'/profile')).json().profile;
  assert.equal(p.decisions.find(d=>d.code==='sales.confirm').allowed,false);
  const preview=(await t.request('GET',company+'/templates/'+id+'/preview')).json().data;assert.equal(preview.impacted.length,2);assert.ok(preview.impacted.every(u=>u.changes.some(c=>c.code==='sales.confirm'&&c.after)));
  await publish(t,id);p=(await t.request('GET',company+'/users/'+ids.target+'/profile')).json().profile;
  assert.equal(p.decisions.find(d=>d.code==='sales.confirm').allowed,true);assert.equal(p.decisions.find(d=>d.code==='sales.view').source,'USER_DENY');assert.deepEqual(p.overrides,{'sales.view':'DENY'});
  assert.equal((await t.request('GET',company+'/templates/'+id)).json().data.versions.length,2);
 }finally{await t.a.app.close();}
});
test('reject stale preview after profile edit and concurrent duplicate publication',async()=>{
 const t=await setup();try{const id=await createPublished(t);await t.request('PUT',company+'/users/'+ids.target+'/profile',profileBody(id));const old=(await t.request('GET',company+'/templates/'+id+'/preview')).json().data;
 await t.request('PUT',company+'/users/'+ids.target+'/profile',profileBody(id,{'sales.view':'DENY'},1));
 assert.equal((await t.request('POST',company+'/templates/'+id+'/publish',{previewToken:old.previewToken})).statusCode,409);
 const current=(await t.request('GET',company+'/templates/'+id+'/preview')).json().data;
 const results=await Promise.all([1,2].map(()=>t.request('POST',company+'/templates/'+id+'/publish',{previewToken:current.previewToken})));
 assert.deepEqual(results.map(r=>r.statusCode).sort(),[200,409]);
 }finally{await t.a.app.close();}
});
test('copy, optional default, new-user assignment and archive protection',async()=>{
 const t=await setup();try{const id=await createPublished(t);assert.equal((await t.request('PUT',company+'/default-template',{templateId:id})).statusCode,200);
 const created=await t.a.app.inject({method:'POST',url:'/api/system/users',headers:t.a.headers(ids.platform),payload:{username:'synthetic-new',fullName:'New account',password:'synthetic-new-password',role:'staff',isActive:true,notes:''}});assert.equal(created.statusCode,201,created.body);assert.equal(t.c.state.profiles.get(ids.created).template_id,id);assert.deepEqual(t.c.state.profiles.get(ids.created).warehouse_ids,[]);
 assert.equal((await t.request('POST',company+'/templates/'+id+'/archive',{})).statusCode,409);
 const copied=await t.request('POST',company+'/templates/'+id+'/copy',{name:'Copy'});assert.equal(copied.statusCode,200,copied.body);assert.equal(copied.json().data.published_version,0);
 assert.equal((await t.request('POST',company+'/templates/'+copied.json().data.id+'/archive',{})).statusCode,200);
 }finally{await t.a.app.close();}
});
test('users.manage and role admin do not grant C1 administration; delegation has an independent ceiling',async()=>{
 const t=await setup();try{
  assert.equal((await t.request('GET',company+'/templates',undefined,ids.admin)).statusCode,403);
  assert.equal((await t.request('POST',company+'/templates',{name:'No',codes:[]},ids.manager)).statusCode,403);
  assert.equal((await t.request('PUT',company+'/users/'+ids.manager+'/delegation',{enabled:true,grantableCodes:['sales.view'],password:testPassword})).statusCode,200);
  assert.equal((await t.request('POST',company+'/templates',{name:'Allowed',codes:['sales.view']},ids.manager)).statusCode,200);
  assert.equal((await t.request('POST',company+'/templates',{name:'Escalation',codes:['sales.confirm']},ids.manager)).statusCode,403);
  assert.equal((await t.request('POST',company+'/templates',{name:'Platform',codes:['platform.backup.download']},ids.manager)).statusCode,400);
  assert.equal((await t.request('PUT',company+'/users/'+ids.target+'/delegation',{enabled:true,grantableCodes:[],password:testPassword},ids.manager)).statusCode,403);
  assert.equal((await t.request('PUT',company+'/users/'+ids.manager+'/profile',profileBody(null,{},1),ids.manager)).statusCode,403);
 }finally{await t.a.app.close();}
});
test('company, warehouse, transfer and multiple-warehouse invoice identifiers cannot widen scope',async()=>{
 const t=await setup();try{const id=await createPublished(t,['inventory_transfer.confirm','sales.view']);await t.request('PUT',company+'/users/'+ids.target+'/profile',profileBody(id));
 assert.equal((await t.request('GET',company+'/users/'+ids.foreign+'/profile')).statusCode,404);
 const check=async(code,resource)=>{const r=await t.request('POST','/me/check',{code,resource},ids.target);assert.equal(r.statusCode,200,r.body);return r.json().decision;};
 assert.equal((await check('inventory_transfer.confirm',{kind:'TRANSFER',id:transfer})).allowed,false);
 assert.equal((await check('sales.view',{kind:'SALES_INVOICE',id:invoice})).allowed,false);
 assert.equal((await check('sales.view',{kind:'WAREHOUSE',id:foreignWh})).allowed,false);
 assert.equal((await check('inventory_transfer.confirm',{kind:'COMPANY'})).allowed,false);
 assert.equal((await check('sales.view',{kind:'ROLL',id:roll})).allowed,true);
 await t.request('PUT',company+'/users/'+ids.target+'/profile',profileBody(id,{},1,[wh1,wh2]));
 assert.equal((await check('inventory_transfer.confirm',{kind:'TRANSFER',id:transfer})).allowed,true);
 assert.equal((await check('sales.view',{kind:'SALES_INVOICE',id:invoice})).allowed,true);
 t.c.resources.set(invoice,{companyId:ids.company,warehouses:[wh1,null]});
 assert.equal((await check('sales.view',{kind:'SALES_INVOICE',id:invoice})).allowed,false,'Unresolved warehouse cannot be silently dropped');
 assert.equal((await t.request('PUT',company+'/users/'+ids.target+'/profile',profileBody(id,{},2,[foreignWh]))).statusCode,403);
 }finally{await t.a.app.close();}
});
test('same user in two signed sessions sees current template and overrides; disabled account denied',async()=>{
 const t=await setup();try{const id=await createPublished(t);await t.request('PUT',company+'/users/'+ids.target+'/profile',profileBody(id));
 const sessions=[t.a.headers(ids.target),{authorization:'Bearer '+t.a.token(ids.target,{username:'synthetic-other-session'})}];
 for(const headers of sessions)assert.equal((await t.a.app.inject({url:base+'/me',headers})).json().profile.decisions.find(p=>p.code==='sales.view').allowed,true);
 await t.request('PUT',company+'/users/'+ids.target+'/profile',profileBody(id,{'sales.view':'DENY'},1));
 for(const headers of sessions)assert.equal((await t.a.app.inject({url:base+'/me',headers})).json().profile.decisions.find(p=>p.code==='sales.view').allowed,false);
 t.c.users.get(ids.target).is_active=false;
 for(const headers of sessions)assert.equal((await t.a.app.inject({url:base+'/me',headers})).statusCode,401);
 }finally{await t.a.app.close();}
});
test('cannot remove/disable last delegator or reset a profiled account via weaker legacy management',async()=>{
 const t=await setup();try{
 await t.request('PUT',company+'/users/'+ids.manager+'/delegation',{enabled:true,grantableCodes:['sales.view'],password:testPassword});
 assert.equal((await t.request('PUT',company+'/users/'+ids.manager+'/delegation',{enabled:false,grantableCodes:[],password:testPassword})).statusCode,409);
 const u=t.c.users.get(ids.manager);const payload={username:u.username,fullName:u.full_name,role:u.role,isActive:false,notes:''};
 const disabled=await t.a.app.inject({method:'PUT',url:'/api/system/users/'+ids.manager,headers:t.a.headers(ids.platform),payload});assert.equal(disabled.statusCode,409,disabled.body);
 const id=await createPublished(t);await t.request('PUT',company+'/users/'+ids.target+'/profile',profileBody(id));
 const target=t.c.users.get(ids.target);const reset=await t.a.app.inject({method:'PUT',url:'/api/system/users/'+ids.target,headers:t.a.headers(ids.manager),payload:{username:target.username,fullName:target.full_name,role:target.role,isActive:true,notes:'',password:'synthetic-reset'}});assert.equal(reset.statusCode,403,reset.body);
 }finally{await t.a.app.close();}
});
test('live delegation revocation takes effect on next request and self-publication is blocked',async()=>{
 const t=await setup();try{
 for(const user of [ids.manager,ids.target])await t.request('PUT',company+'/users/'+user+'/delegation',{enabled:true,grantableCodes:['sales.view','sales.confirm'],password:testPassword});
 const headers=t.a.headers(ids.manager);
 assert.equal((await t.a.app.inject({url:base+company+'/templates',headers})).statusCode,200);
 await t.request('PUT',company+'/users/'+ids.manager+'/delegation',{enabled:false,grantableCodes:[],password:testPassword});
 assert.equal((await t.a.app.inject({url:base+company+'/templates',headers})).statusCode,403);
 const id=await createPublished(t);await t.request('PUT',company+'/users/'+ids.target+'/profile',profileBody(id,{},1));
 await t.request('PUT',company+'/templates/'+id+'/draft',{name:'Changed',codes:['sales.confirm'],revision:1});
 const preview=(await t.request('GET',company+'/templates/'+id+'/preview',undefined,ids.target)).json().data;
 assert.equal((await t.request('POST',company+'/templates/'+id+'/publish',{previewToken:preview.previewToken},ids.target)).statusCode,403);
 }finally{await t.a.app.close();}
});
test('audit failure rolls all C1 mutations back; missing tables keep legacy settings usable',async()=>{
 const t=await setup();try{
 t.c.failC1Audit=true;const r=await t.request('POST',company+'/templates',{name:'Rollback',codes:['sales.view']});assert.equal(r.statusCode,500);assert.equal(t.c.state.templates.size,0);
 t.c.failC1Audit=false;t.c.installed=false;assert.equal((await t.request('GET','/me',undefined,ids.target)).statusCode,503);
 assert.equal((await t.a.app.inject({url:'/api/system/settings',headers:t.a.headers(ids.admin)})).statusCode,200);
 assert.equal((await t.a.app.inject({url:'/api/system/users',headers:t.a.headers(ids.ordinary)})).statusCode,403);
 assert.equal((await t.a.app.inject({method:'POST',url:'/api/system/backup/download',headers:t.a.headers(ids.admin),payload:{password:testPassword,confirmPhrase:'FULL_PLATFORM_BACKUP'}})).statusCode,403);
 }finally{await t.a.app.close();}
});
test('reauthentication, unknown fields and forged platform claims fail closed',async()=>{
 const t=await setup();try{
 const path=company+'/users/'+ids.manager+'/delegation';
 assert.equal((await t.request('PUT',path,{enabled:true,grantableCodes:['sales.view'],password:'synthetic-wrong'})).statusCode,403);
 assert.equal(t.c.state.profiles.size,0);
 assert.equal((await t.request('PUT',path,{enabled:true,grantableCodes:[],password:testPassword})).statusCode,400);
 assert.equal((await t.request('PUT',path,{enabled:true,grantableCodes:['sales.view'],password:testPassword,platform:true})).statusCode,400);
 const forged=await t.a.app.inject({method:'PUT',url:base+path,headers:{authorization:'Bearer '+t.a.token(ids.admin,{isPlatformAdmin:true})},payload:{enabled:true,grantableCodes:['sales.view'],password:testPassword}});assert.equal(forged.statusCode,403);
 assert.equal(t.c.state.profiles.size,0);
 }finally{await t.a.app.close();}
});
test('changing/unlinking templates keeps requested individual exceptions and detects stale draft/profile revisions',async()=>{
 const t=await setup();try{const a=await createPublished(t),b=await createPublished(t,['sales.confirm']);
 await t.request('PUT',company+'/users/'+ids.target+'/profile',profileBody(a,{'sales.view':'DENY'}));
 const changed=await t.request('PUT',company+'/users/'+ids.target+'/profile',profileBody(b,{'sales.view':'DENY'},1));assert.equal(changed.statusCode,200,changed.body);assert.equal(changed.json().profile.decisions.find(p=>p.code==='sales.confirm').allowed,true);
 assert.equal((await t.request('PUT',company+'/users/'+ids.target+'/profile',profileBody(a,{},1))).statusCode,409);
 const unlinked=await t.request('PUT',company+'/users/'+ids.target+'/profile',profileBody(null,{'sales.view':'DENY'},2));assert.equal(unlinked.statusCode,200);assert.equal(unlinked.json().profile.template,null);assert.equal(unlinked.json().profile.decisions.find(p=>p.code==='sales.view').source,'USER_DENY');
 const update={name:'Updated',codes:['sales.confirm'],revision:1};assert.equal((await t.request('PUT',company+'/templates/'+a+'/draft',update)).statusCode,200);assert.equal((await t.request('PUT',company+'/templates/'+a+'/draft',update)).statusCode,409);
 }finally{await t.a.app.close();}
});
test('publication audit failure rolls back version pointer and immutable version insert',async()=>{
 const t=await setup();try{const id=await createPublished(t),preview=(await t.request('GET',company+'/templates/'+id+'/preview')).json().data;
 const count=t.c.state.versions.size;t.c.failC1Audit=true;
 assert.equal((await t.request('POST',company+'/templates/'+id+'/publish',{previewToken:preview.previewToken})).statusCode,500);
 assert.equal(t.c.state.versions.size,count);assert.equal(t.c.state.templates.get(id).published_version,1);
 }finally{await t.a.app.close();}
});
test('platform company-switch context cannot carry its home template into another company',async()=>{
 const t=await setup();try{
 const headers={authorization:'Bearer '+t.a.token(ids.platform,{companyId:ids.other})};
 assert.equal((await t.a.app.inject({url:base+'/me',headers})).statusCode,404);
 assert.equal((await t.a.app.inject({url:base+'/companies/'+ids.other+'/templates',headers})).statusCode,200);
 const tenantHeaders={authorization:'Bearer '+t.a.token(ids.admin,{companyId:ids.other,isPlatformAdmin:true})};
 assert.equal((await t.a.app.inject({url:base+'/companies/'+ids.other+'/templates',headers:tenantHeaders})).statusCode,403);
 }finally{await t.a.app.close();}
});
test('new-user creation rolls back if the configured default exceeds legacy manager delegation',async()=>{
 const t=await setup();try{const id=await createPublished(t);await t.request('PUT',company+'/default-template',{templateId:id});
 const r=await t.a.app.inject({method:'POST',url:'/api/system/users',headers:t.a.headers(ids.admin),payload:{username:'synthetic-denied-new',fullName:'No partial user',password:'synthetic-password',role:'staff',isActive:true,notes:''}});
 assert.equal(r.statusCode,403,r.body);assert.equal(t.c.users.has(ids.created),false);assert.equal(t.c.state.profiles.has(ids.created),false);
 }finally{await t.a.app.close();}
});
test('C1 DENY is isolated from legacy enforcement until activation, with live identity unchanged',async()=>{
 const t=await setup();try{await t.request('PUT',company+'/users/'+ids.target+'/profile',profileBody(null,{'inventory.view':'DENY'}));
 const profile=(await t.request('GET','/me',undefined,ids.target)).json().profile;assert.equal(profile.decisions.find(p=>p.code==='inventory.view').allowed,false);
 const live=await t.a.app.inject({url:'/test/live',headers:t.a.headers(ids.target)});assert.equal(live.statusCode,200);assert.ok(live.json().permissions.includes('inventory.view'));
 }finally{await t.a.app.close();}
});
async function scopedPublication(t,otherOverrides={},otherMode='LIST',otherActive=true){
 const id=await createPublished(t,[]);
 await t.request('PUT',company+'/users/'+ids.manager+'/delegation',{enabled:true,grantableCodes:['sales.view'],password:testPassword});
 await t.request('PUT',company+'/users/'+ids.manager+'/profile',profileBody(null,{},1,[wh1]));
 for(const [user,warehouses,overrides]of [[ids.target,[wh1],{}],[ids.ordinary,[wh2],otherOverrides]]){
  const r=await t.request('PUT',company+'/users/'+user+'/profile',{...profileBody(id,overrides,0,warehouses),warehouseMode:user===ids.ordinary?otherMode:'LIST'});assert.equal(r.statusCode,200,r.body);
 }
 t.c.users.get(ids.ordinary).is_active=otherActive;
 const edited=await t.request('PUT',company+'/templates/'+id+'/draft',{name:'Scoped publication',codes:['sales.view'],revision:1},ids.manager);assert.equal(edited.statusCode,200,edited.body);
 const preview=await t.request('GET',company+'/templates/'+id+'/preview',undefined,ids.manager);assert.equal(preview.statusCode,200,preview.body);
 return {id,previewToken:preview.json().data.previewToken};
}
test('shared template cannot grant outside publisher warehouses; rejection rolls back the entire publication',async()=>{
 const t=await setup();try{const p=await scopedPublication(t),versions=t.c.state.versions.size,audits=t.c.state.audits.length;
 const r=await t.request('POST',company+'/templates/'+p.id+'/publish',{previewToken:p.previewToken},ids.manager);assert.equal(r.statusCode,403,r.body);assert.ok(r.json().message.includes('نطاق المستودعات'));
 assert.equal(t.c.state.versions.size,versions);assert.equal(t.c.state.templates.get(p.id).published_version,1);assert.equal(t.c.state.audits.length,audits);
 for(const user of [ids.target,ids.ordinary])assert.equal((await t.request('GET',company+'/users/'+user+'/profile')).json().profile.decisions.find(p=>p.code==='sales.view').allowed,false);
 }finally{await t.a.app.close();}
});
test('individual DENY and existing ALLOW outside the ceiling do not count as new grants',async()=>{
 for(const override of ['DENY','ALLOW']){const t=await setup();try{const p=await scopedPublication(t,{'sales.view':override});
 const r=await t.request('POST',company+'/templates/'+p.id+'/publish',{previewToken:p.previewToken},ids.manager);assert.equal(r.statusCode,200,r.body);
 const other=(await t.request('GET',company+'/users/'+ids.ordinary+'/profile')).json().profile;assert.equal(other.overrides['sales.view'],override);assert.equal(other.decisions.find(p=>p.code==='sales.view').allowed,override==='ALLOW');
 }finally{await t.a.app.close();}}
});
test('inactive recipient and ALL-warehouse recipient cannot receive latent grants from a limited publisher',async()=>{
 for(const [mode,active]of [['LIST',false],['ALL',true]]){const t=await setup();try{const p=await scopedPublication(t,{},mode,active);
 assert.equal((await t.request('POST',company+'/templates/'+p.id+'/publish',{previewToken:p.previewToken},ids.manager)).statusCode,403);
 assert.equal(t.c.state.templates.get(p.id).published_version,1);
 }finally{await t.a.app.close();}}
});
test('publication succeeds inside the delegated ceiling and platform review can publish across company warehouses',async()=>{
 const t=await setup();try{const p=await scopedPublication(t);
 const profile=t.c.state.profiles.get(ids.ordinary);profile.warehouse_ids=[wh1];profile.revision++;
 assert.equal((await t.request('POST',company+'/templates/'+p.id+'/publish',{previewToken:p.previewToken},ids.manager)).statusCode,409);
 await publish(t,p.id);assert.equal(t.c.state.templates.get(p.id).published_version,2);
 const managerTemplate=await createPublished(t,[]);const current=t.c.state.profiles.get(ids.target);await t.request('PUT',company+'/users/'+ids.target+'/profile',profileBody(managerTemplate,{},current.revision,[wh1]));
 await t.request('PUT',company+'/templates/'+managerTemplate+'/draft',{name:'In scope',codes:['sales.view'],revision:1},ids.manager);
 const preview=(await t.request('GET',company+'/templates/'+managerTemplate+'/preview',undefined,ids.manager)).json().data;
 assert.equal((await t.request('POST',company+'/templates/'+managerTemplate+'/publish',{previewToken:preview.previewToken},ids.manager)).statusCode,200);
 }finally{await t.a.app.close();}
});

test('revision validation rejects overflow, negative, fractional and nonnumeric values at API boundaries',async()=>{
 const t=await setup();try{
  const id=await createPublished(t),url=company+'/templates/'+id+'/draft';
  for(const revision of [-1,0,1.5,2147483648,Number.MAX_SAFE_INTEGER,'1',null])assert.equal((await t.request('PUT',url,{name:'invalid',codes:[],revision})).statusCode,400);
  for(const revision of [-1,1.5,2147483648,Number.MAX_SAFE_INTEGER,'0',null])assert.equal((await t.request('PUT',company+'/users/'+ids.target+'/profile',profileBody(id,{},revision))).statusCode,400);
  assert.equal((await t.request('PUT',url,{name:'stale maximum',codes:[],revision:2147483647})).statusCode,409);
  assert.equal((await t.request('PUT',company+'/users/'+ids.target+'/profile',profileBody(id,{},2147483647))).statusCode,409);
  assert.equal((await t.request('PUT',company+'/users/'+ids.target+'/profile',profileBody(id,{},0))).statusCode,200);
 }finally{await t.a.app.close();}
});
test('revision exhaustion returns409 without changing drafts, profiles, delegation or publication',async()=>{
 const t=await setup();try{
  const max=2147483647,id=await createPublished(t),url=company+'/templates/'+id+'/draft';
  t.c.state.templates.get(id).draft_revision=max-1;
  assert.equal((await t.request('PUT',url,{name:'last revision',codes:[],revision:max-1})).statusCode,200);
  assert.equal(t.c.state.templates.get(id).draft_revision,max);
  let before=structuredClone(t.c.state);
  assert.equal((await t.request('PUT',url,{name:'overflow',codes:[],revision:max})).json().code,'CLIENT');assert.deepEqual(t.c.state,before);
  assert.equal((await t.request('PUT',company+'/users/'+ids.target+'/profile',profileBody(id))).statusCode,200);
  t.c.state.profiles.get(ids.target).revision=max-1;
  assert.equal((await t.request('PUT',company+'/users/'+ids.target+'/profile',profileBody(id,{},max-1))).statusCode,200);
  before=structuredClone(t.c.state);
  const r=await t.request('PUT',company+'/users/'+ids.target+'/profile',profileBody(id,{},max));assert.equal(r.statusCode,409);assert.equal(r.json().code,'CLIENT');assert.deepEqual(t.c.state,before);
  const d=await t.request('PUT',company+'/users/'+ids.target+'/delegation',{enabled:true,grantableCodes:['sales.view'],password:testPassword});assert.equal(d.statusCode,409);assert.deepEqual(t.c.state,before);
  const row=t.c.state.templates.get(id);row.published_version=max;t.c.state.versions.set([ids.company,id,max].join(':'),{company_id:ids.company,template_id:id,version:max,codes:[],published_by:ids.platform});
  const preview=(await t.request('GET',company+'/templates/'+id+'/preview')).json().data;before=structuredClone(t.c.state);
  const published=await t.request('POST',company+'/templates/'+id+'/publish',{previewToken:preview.previewToken});assert.equal(published.statusCode,409);assert.equal(published.json().code,'CLIENT');assert.deepEqual(t.c.state,before);
 }finally{await t.a.app.close();}
});
test('direct service revision validator never accepts nonfinite or out-of-range optimistic inputs',()=>{
 const {validatePermissionRevision:check,PERMISSION_REVISION_MAX:max}=sourceLoader(createContext())('server/src/security/permissionRevision.ts');
 for(const value of [-Infinity,Infinity,NaN,-1,0.1,max+1,'1',null,undefined])assert.throws(()=>check(value,0),e=>e.statusCode===400&&e.code==='INVALID_REVISION');
 for(const value of [0,1,max-1,max])assert.doesNotThrow(()=>check(value,0));assert.throws(()=>check(0,1));
});
(async()=>{let failed=0;for(const[name,fn]of tests){try{await fn();console.log('PASS '+name);}catch(e){failed++;console.error('FAIL '+name+'\n'+e.stack);}}console.log(tests.length+' C1 targeted tests; '+failed+' failures. Synthetic SQL adapter, NOT PostgreSQL.');process.exitCode=failed?1:0;})();
