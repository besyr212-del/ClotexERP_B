/* Explicit opt-in PostgreSQL regression. Never consumes DATABASE_URL or project .env.
 * Requires a NEW isolated cluster under TEMP with prefix clotex-c1-fixes-. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {createRequire}=require('node:module');
const root=path.resolve(__dirname,'../../..');
const deps=createRequire(path.join(process.env.TASK005_TEST_MODULES||root,'package.json'));
const {Client,Pool}=deps('pg');
const {createContext,api,ids,testPassword}=require('../routes/task005PhaseA.security.test.cjs');
const expected=path.resolve(process.env.TASK005_PG_DATA_DIR||'.');
const relative=path.relative(os.tmpdir(),expected);
if(!process.env.TASK005_PG_DATA_DIR||relative.startsWith('..')||path.isAbsolute(relative)||path.basename(expected)!=='pgdata'||!path.basename(path.dirname(expected)).startsWith('clotex-c1-fixes-'))throw Error('Refusing any cluster outside the dedicated temporary test directory');
const port=Number(process.env.TASK005_PG_PORT||54985);
if(!Number.isInteger(port)||port<49152||port>65535)throw Error('Use a dedicated local audit port');
const config={host:'127.0.0.1',port,user:'clotexauditor',connectionTimeoutMillis:3000,statement_timeout:8000};
const database='clotex_c1_security_fixes';
const tests=[],test=(name,fn)=>tests.push([name,fn]);
let pool,app;
const context=createContext();
async function main(){
 const admin=new Client({...config,database:'postgres'});
 await admin.connect();
 try{
  const identity=(await admin.query("SELECT inet_server_addr()::text AS host,current_setting('data_directory') AS dir")).rows[0];
  assert.equal(identity.host.split('/')[0],'127.0.0.1');assert.equal(path.resolve(identity.dir),expected);
  // Refuse reuse: this fixed test database must not exist before this run.
  await admin.query('CREATE DATABASE '+database);
 }finally{await admin.end();}
 pool=new Pool({...config,database,max:8});
 assert.equal((await pool.query('SELECT current_database() AS name')).rows[0].name,database);
 const migrations=path.join(root,'server/src/db/migrations');
 const applySQL=async sql=>{const db=await pool.connect();try{await db.query('BEGIN');await db.query(sql);await db.query('COMMIT');}catch(e){await db.query('ROLLBACK');throw e;}finally{db.release();}};
 for(const name of fs.readdirSync(migrations).filter(n=>n.endsWith('.sql')&&parseInt(n)<=79).sort()){
  await applySQL(fs.readFileSync(path.join(migrations,name),'utf8'));
 }
 for(const [id,code]of [[ids.company,'SYNTHETIC_A'],[ids.other,'SYNTHETIC_B']])await pool.query('INSERT INTO companies(id,code,name) VALUES($1,$2,$2)',[id,code]);
 for(const [role,codes]of Object.entries(context.roles)){
  const r=await pool.query('INSERT INTO roles(code,name) VALUES($1,$1) ON CONFLICT(code) DO UPDATE SET name=EXCLUDED.name RETURNING id',[role]);
  for(const code of codes){const p=await pool.query('INSERT INTO permissions(code,name) VALUES($1,$1) ON CONFLICT(code) DO UPDATE SET name=EXCLUDED.name RETURNING id',[code]);await pool.query('INSERT INTO role_permissions(role_id,permission_id) VALUES($1,$2) ON CONFLICT DO NOTHING',[r.rows[0].id,p.rows[0].id]);}
 }
 for(const u of context.users.values())await pool.query('INSERT INTO users(id,company_id,username,full_name,password_hash,role,is_active,is_platform_admin) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[u.id,u.company_id,u.username,u.full_name,u.password_hash,u.role,u.is_active,u.is_platform_admin]);
 const userSnapshot=async()=>JSON.stringify((await pool.query('SELECT id,company_id,username,password_hash,role,is_active,is_platform_admin FROM users ORDER BY id')).rows);
 const securitySnapshot=async()=>JSON.stringify((await pool.query("SELECT 'roles' AS kind,row_to_json(r)::text AS record FROM roles r UNION ALL SELECT 'permissions',row_to_json(p)::text FROM permissions p UNION ALL SELECT 'role_permissions',row_to_json(rp)::text FROM role_permissions rp ORDER BY kind,record")).rows);
 const securityBefore=await securitySnapshot();
 const before=await userSnapshot();
 await applySQL(fs.readFileSync(path.join(migrations,'082_user_permission_profiles.sql'),'utf8'));
 assert.equal(await userSnapshot(),before);assert.equal(await securitySnapshot(),securityBefore);console.log('PASS Migration 082 after 078 and 079 preserves existing synthetic users, IDs, passwords and roles');
 const tables=(await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename=ANY($1::text[])",[['permission_templates','permission_template_versions','user_permission_profiles','company_permission_defaults']])).rows;
 assert.equal(tables.length,4);
 context.pool=pool;app=await api(context,{profiles:true});
 const prefix='/api/permission-profiles',company='/companies/'+ids.company,code='inventory_transfer.confirm';
 const request=(method,url,payload,user=ids.platform)=>app.app.inject({method,url:prefix+url,payload,headers:app.headers(user)});
 const expect=async(status,method,url,payload,user)=>{const r=await request(method,url,payload,user);assert.equal(r.statusCode,status,r.body);return r.json();};
 test('database rejects a user profile paired with another company, without API mediation',async()=>{
  await assert.rejects(pool.query('INSERT INTO user_permission_profiles(user_id,company_id,updated_by) VALUES($1,$2,$3)',[ids.foreign,ids.company,ids.platform]),e=>e.code==='23503');
  assert.equal((await pool.query('SELECT 1 FROM user_permission_profiles WHERE user_id=$1',[ids.foreign])).rowCount,0);
 });
 const wh=async(code,companyId=ids.company)=>(await pool.query('INSERT INTO warehouses(company_id,code,name) VALUES($1,$2,$2) RETURNING id',[companyId,code])).rows[0].id;
 const w1=await wh('SYNTHETIC_W1'),w2=await wh('SYNTHETIC_W2'),foreign=await wh('SYNTHETIC_OTHER',ids.other);
 await expect(200,'PUT',company+'/users/'+ids.manager+'/delegation',{enabled:true,grantableCodes:[code],password:testPassword});
 async function profile(user,templateId,warehouses,overrides={},mode='LIST'){
  const current=(await expect(200,'GET',company+'/users/'+user+'/profile')).profile;
  return expect(200,'PUT',company+'/users/'+user+'/profile',{templateId,overrides,warehouseMode:mode,warehouseIds:warehouses,revision:current.revision});
 }
 await profile(ids.manager,null,[w1]);
 const preview=async id=>(await expect(200,'GET',company+'/templates/'+id+'/preview',undefined,ids.manager)).data.previewToken;
 async function scenario(overrides={},mode='LIST'){
  const t=(await expect(200,'POST',company+'/templates',{name:'Synthetic publication scope',codes:[]})).data;
  await expect(200,'POST',company+'/templates/'+t.id+'/publish',{previewToken:await preview(t.id)});
  await profile(ids.target,t.id,[w1]);await profile(ids.ordinary,t.id,mode==='ALL'?[]:[w2],overrides,mode);
  await expect(200,'PUT',company+'/templates/'+t.id+'/draft',{name:t.name,codes:[code],revision:1},ids.manager);
  return {id:t.id,previewToken:await preview(t.id)};
 }
 const publish=(p,user=ids.manager)=>request('POST',company+'/templates/'+p.id+'/publish',{previewToken:p.previewToken},user);
 const versionState=async id=>JSON.stringify((await pool.query('SELECT published_version,(SELECT count(*) FROM permission_template_versions WHERE template_id=$1) AS versions FROM permission_templates WHERE id=$1',[id])).rows);
 test('limited publisher cannot grant to W2 through shared template; no partial publication',async()=>{
  const p=await scenario(),before=await versionState(p.id),audits=(await pool.query('SELECT count(*) FROM audit_logs')).rows[0].count;
  assert.equal((await publish(p)).statusCode,403);assert.equal(await versionState(p.id),before);assert.equal((await pool.query('SELECT count(*) FROM audit_logs')).rows[0].count,audits);
  for(const user of [ids.target,ids.ordinary])assert.equal((await expect(200,'GET',company+'/users/'+user+'/profile')).profile.decisions.find(p=>p.code===code).allowed,false);
 });
 test('DENY and previously authorized individual ALLOW survive publication outside publisher scope',async()=>{
  for(const override of ['DENY','ALLOW']){const p=await scenario({[code]:override});assert.equal((await publish(p)).statusCode,200);const other=(await expect(200,'GET',company+'/users/'+ids.ordinary+'/profile')).profile;assert.equal(other.overrides[code],override);assert.equal(other.decisions.find(p=>p.code===code).allowed,override==='ALLOW');}
 });
 test('inactive and ALL recipients cannot acquire latent out-of-scope grants',async()=>{
  const inactive=await scenario();await pool.query('UPDATE users SET is_active=false WHERE id=$1',[ids.ordinary]);try{assert.equal((await publish({...inactive,previewToken:await preview(inactive.id)})).statusCode,403);}finally{await pool.query('UPDATE users SET is_active=true WHERE id=$1',[ids.ordinary]);}
  const all=await scenario({},'ALL');assert.equal((await publish(all)).statusCode,403);
 });
 test('in-scope publication succeeds; concurrent duplicate publication stays idempotent',async()=>{
  const p=await scenario();await profile(ids.ordinary,p.id,[w1]);p.previewToken=await preview(p.id);
  const result=await Promise.all([publish(p),publish(p)]);assert.deepEqual(result.map(r=>r.statusCode).sort(),[200,409]);
 });
 test('platform reviewer may approve all company warehouses; foreign-company profiles remain inaccessible',async()=>{
  const p=await scenario();assert.equal((await publish(p,ids.platform)).statusCode,200);
  assert.equal((await request('GET',company+'/users/'+ids.foreign+'/profile')).statusCode,404);
  const current=(await expect(200,'GET',company+'/users/'+ids.target+'/profile')).profile;
  assert.equal((await request('PUT',company+'/users/'+ids.target+'/profile',{templateId:p.id,overrides:{},warehouseMode:'LIST',warehouseIds:[foreign],revision:current.revision})).statusCode,403);
 });
 test('mid-transaction SQL audit failure rolls back version and publication pointer',async()=>{
  const p=await scenario({[code]:'DENY'}),before=await versionState(p.id);
  await pool.query("CREATE FUNCTION synthetic_c1_audit_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='C1_TEMPLATE_PUBLISHED' THEN RAISE EXCEPTION 'synthetic audit failure'; END IF; RETURN NEW; END $$");
  await pool.query('CREATE TRIGGER synthetic_c1_audit_failure BEFORE INSERT ON audit_logs FOR EACH ROW EXECUTE FUNCTION synthetic_c1_audit_failure()');
  try{assert.equal((await publish(p)).statusCode,500);assert.equal(await versionState(p.id),before);}finally{await pool.query('DROP TRIGGER synthetic_c1_audit_failure ON audit_logs');await pool.query('DROP FUNCTION synthetic_c1_audit_failure()');}
 });
 test('existing user editor requires the ACTOR password for a C1-profiled account',async()=>{
  const user=(await pool.query('SELECT * FROM users WHERE id=$1',[ids.target])).rows[0];
  const payload={username:user.username,fullName:user.full_name,role:user.role,isActive:user.is_active,notes:''};
  const send=currentPassword=>app.app.inject({method:'PUT',url:'/api/system/users/'+ids.target,headers:app.headers(ids.platform),payload:{...payload,...(currentPassword===undefined?{}:{currentPassword})}});
  assert.equal((await send()).statusCode,403);
  assert.equal((await send('synthetic wrong password')).statusCode,403);
  assert.equal((await send(testPassword)).statusCode,200);
 });

 test('INTEGER boundary inputs and exhausted persisted counters fail safely and roll back on PostgreSQL',async()=>{
  const max=2147483647,t=(await expect(200,'POST',company+'/templates',{name:'Synthetic revision boundary',codes:[]})).data;
  const url=company+'/templates/'+t.id+'/draft';
  for(const revision of [-1,0,1.25,max+1,Number.MAX_SAFE_INTEGER,'1',null])await expect(400,'PUT',url,{name:'Invalid',codes:[],revision});
  for(const revision of [-1,1.25,max+1,Number.MAX_SAFE_INTEGER,'0',null])await expect(400,'PUT',company+'/users/'+ids.target+'/profile',{templateId:null,overrides:{},warehouseMode:'LIST',warehouseIds:[],revision});
  await pool.query('UPDATE permission_templates SET draft_revision=$2 WHERE id=$1',[t.id,max-1]);
  await expect(200,'PUT',url,{name:'Last valid revision',codes:[],revision:max-1});
  const audits=async()=>(await pool.query('SELECT count(*) AS n FROM audit_logs')).rows[0].n,before=await audits();
  const fail=await expect(409,'PUT',url,{name:'Must not persist',codes:[],revision:max});assert.equal(fail.code,'CLIENT');assert.equal(await audits(),before);
  assert.equal((await pool.query('SELECT draft_revision,name FROM permission_templates WHERE id=$1',[t.id])).rows[0].name,'Last valid revision');
  const old=(await pool.query('SELECT revision FROM user_permission_profiles WHERE user_id=$1',[ids.target])).rows[0].revision;
  try{
   await pool.query('UPDATE user_permission_profiles SET revision=$2 WHERE user_id=$1',[ids.target,max-1]);
   await expect(200,'PUT',company+'/users/'+ids.target+'/profile',{templateId:null,overrides:{},warehouseMode:'LIST',warehouseIds:[],revision:max-1});
   const before=await audits();
   await expect(409,'PUT',company+'/users/'+ids.target+'/profile',{templateId:null,overrides:{},warehouseMode:'LIST',warehouseIds:[],revision:max});
   await expect(409,'PUT',company+'/users/'+ids.target+'/delegation',{enabled:true,grantableCodes:[code],password:testPassword});
   assert.equal(await audits(),before);assert.equal((await pool.query('SELECT revision FROM user_permission_profiles WHERE user_id=$1',[ids.target])).rows[0].revision,max);
  }finally{await pool.query('UPDATE user_permission_profiles SET revision=$2 WHERE user_id=$1',[ids.target,old]);}
  await pool.query('INSERT INTO permission_template_versions(company_id,template_id,version,codes,published_by) VALUES($1,$2,$3,$4,$5)',[ids.company,t.id,max,[],ids.platform]);
  await pool.query('UPDATE permission_templates SET published_version=$2 WHERE id=$1',[t.id,max]);
  const preview=(await expect(200,'GET',company+'/templates/'+t.id+'/preview')).data.previewToken,prior=await audits();
  await expect(409,'POST',company+'/templates/'+t.id+'/publish',{previewToken:preview});assert.equal(await audits(),prior);
 });
 let failed=0;for(const [name,fn]of tests){try{await fn();console.log('PASS PostgreSQL '+name);}catch(e){failed++;console.error('FAIL '+name+'\n'+e.stack);}}
 assert.equal(await userSnapshot(),before);console.log(tests.length+' real PostgreSQL regression scenarios; '+failed+' failures; no production connection.');process.exitCode=failed?1:0;
}
main().catch(e=>{console.error(e.stack);process.exitCode=1;}).finally(async()=>{if(app)await app.app.close();if(pool)await pool.end();});
