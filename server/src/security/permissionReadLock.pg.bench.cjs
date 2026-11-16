/* Opt-in, bounded local measurement. Never changes the locking strategy or consumes DATABASE_URL. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{performance}=require('node:perf_hooks');
const {createRequire}=require('node:module'),root=path.resolve(__dirname,'../../..'),deps=createRequire(path.join(process.env.TASK005_TEST_MODULES||root,'package.json')),{Pool,Client}=deps('pg');
const {createContext,sourceLoader,ids}=require('../routes/task005PhaseA.security.test.cjs');
const expected=path.resolve(process.env.TASK005_PG_DATA_DIR||'.'),relative=path.relative(os.tmpdir(),expected),port=Number(process.env.TASK005_PG_PORT||54985);
if(!process.env.TASK005_PG_DATA_DIR||relative.startsWith('..')||path.isAbsolute(relative)||path.basename(expected)!=='pgdata'||!path.basename(path.dirname(expected)).startsWith('clotex-c1-fixes-')||!Number.isInteger(port)||port<49152||port>65535)throw Error('Refusing nonisolated PostgreSQL');
const config={host:'127.0.0.1',port,user:'clotexauditor',database:'clotex_c1_security_fixes',connectionTimeoutMillis:3000,statement_timeout:8000,application_name:'task005-c1-read-lock-audit'},pool=new Pool({...config,max:8}),ctx=createContext();ctx.pool=pool;
const load=sourceLoader(ctx),{permissionTransaction,getEffectiveProfile}=load('server/src/services/userPermissionProfileService.ts');
const claims=id=>{const u=ctx.users.get(id);return {sub:id,companyId:u.company_id,username:u.username,role:u.role,permissions:[]};};
const operation=(id,delay=0)=>permissionTransaction(claims(id),undefined,claims(id).companyId,false,false,async db=>{const result=await getEffectiveProfile(db,claims(id).companyId,id);if(delay)await db.query('SELECT pg_sleep($1)',[delay]);return result;});
async function batch(count,concurrency,delay=0){let next=0;const samples=[],start=performance.now();await Promise.all(Array.from({length:concurrency},async()=>{while(next<count){const i=next++,now=performance.now();await operation(i%2?ids.foreign:ids.target,delay);samples.push(performance.now()-now);}}));samples.sort((a,b)=>a-b);const ms=performance.now()-start;return {count,concurrency,injectedDelayMs:delay*1000,totalMs:+ms.toFixed(2),requestsPerSecond:+(count*1000/ms).toFixed(2),p50Ms:+samples[Math.floor(samples.length*.5)].toFixed(2),p95Ms:+samples[Math.min(samples.length-1,Math.floor(samples.length*.95))].toFixed(2)};}
(async()=>{
 const identity=(await pool.query("SELECT current_database() AS name,current_setting('data_directory') AS dir,inet_server_addr()::text AS host")).rows[0];assert.equal(identity.name,config.database);assert.equal(path.resolve(identity.dir),expected);assert.equal(identity.host.split('/')[0],'127.0.0.1');
 await Promise.all(Array.from({length:8},()=>pool.query('SELECT 1')));await operation(ids.target);await operation(ids.foreign);
 const rows=[];rows.push(await batch(24,1));rows.push(await batch(24,8));rows.push(await batch(8,8,.025));
 const holder=new Client(config);await holder.connect();let pending;
 try{
  await holder.query('BEGIN');await holder.query('SELECT pg_advisory_xact_lock(5005,1)');
  let finished=false;const start=performance.now();pending=operation(ids.foreign).finally(()=>{finished=true;});
  let waiting=0;for(let i=0;i<50;i++){waiting=Number((await pool.query("SELECT count(*) AS n FROM pg_stat_activity WHERE application_name=$1 AND wait_event_type='Lock' AND wait_event='advisory'",[config.application_name])).rows[0].n);if(waiting)break;await new Promise(r=>setTimeout(r,10));}
  assert.ok(waiting>=1,'Expected advisory-lock wait on another company read');assert.equal(finished,false);
  await new Promise(r=>setTimeout(r,250));assert.equal(finished,false);await holder.query('COMMIT');await pending;
  console.log(JSON.stringify({measurements:rows,crossCompanyBlocking:{observedAdvisoryWaiters:waiting,heldAfterObservationMs:250,otherCompanyReadMs:+(performance.now()-start).toFixed(2)},strategyUnchanged:true,scope:'synthetic local measurements, not production capacity estimates'},null,2));
 }finally{await holder.query('ROLLBACK').catch(()=>{});if(pending)await pending.catch(()=>{});await holder.end();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;}).finally(()=>pool.end());
