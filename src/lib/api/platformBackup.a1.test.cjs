/* Targeted A.1 tests: source modules + real token-storage selection, mocked fetch/DOM,
 * a small hook harness (not a browser), and real Phase A routes through Fastify.inject.
 * No .env, sockets, PostgreSQL, pg_dump, downloads to disk or extra dependencies.
 * TASK005_TEST_MODULES optionally points to an existing checkout with dependencies. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const cp=require('node:child_process');const {createRequire}=require('node:module');
const root=path.resolve(__dirname,'../../..');const deps=createRequire(path.join(process.env.TASK005_TEST_MODULES||root,'package.json'));
const ts=deps('typescript'),React=deps('react'),jsx=deps('react/jsx-runtime'),render=deps('react-dom/server').renderToStaticMarkup;
const portableGit=path.join(root,'../git/cmd/git.exe');
const git=process.env.TASK005_TEST_GIT||(fs.existsSync(portableGit)?portableGit:'git');
const TOKEN='fabric_erp_api_token';const samplePassword='synthetic-ui-reauth-password';const dumpBytes=Buffer.from('SYNTHETIC LOCAL BACKUP');
const phaseA=require(path.join(root,'server/src/routes/task005PhaseA.security.test.cjs'));
const locales={ar:JSON.parse(fs.readFileSync(path.join(root,'src/locales/ar/settings.json'),'utf8')),tr:JSON.parse(fs.readFileSync(path.join(root,'src/locales/tr/settings.json'),'utf8'))};
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});}
function binary(options={}){return new Response(options.bytes??dumpBytes,{status:options.status??200,headers:{'Content-Type':options.type??'application/octet-stream','Content-Disposition':options.disposition??'attachment; filename="synthetic-backup.dump"','Content-Length':String(options.length??(options.bytes??dumpBytes).length),...(options.encoding?{'Content-Encoding':options.encoding}:{})}});}
function context(options={}){
 const ctx={lang:options.lang??'ar',prod:options.prod??true,apiBase:options.apiBase??'',calls:[],anchors:[],clicks:0,urls:[],revoked:[],timers:[],logs:[],focus:new Set(),platform:options.platform??true,userId:'synthetic-platform-user',companyId:'synthetic-company',pendingProfile:null};
 const store=initial=>{const map=new Map(Object.entries(initial));return {map,getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v)),removeItem:k=>map.delete(k)};};
 ctx.local=options.localStorage??store({[TOKEN]:options.token??'synthetic-web-token','fabric_erp_api_base_url':'https://ignored-production-override.invalid'});ctx.session=store({[TOKEN]:options.token??'synthetic-electron-token'});
 ctx.translate=(key,params={})=>String(locales[ctx.lang][key]??key).replace(/\{\{(\w+)\}\}/g,(_,k)=>String(params[k]??''));
 const window={localStorage:ctx.local,sessionStorage:ctx.session,addEventListener:(event,fn)=>{if(event==='focus')ctx.focus.add(fn);},removeEventListener:(event,fn)=>ctx.focus.delete(fn),...(options.electron?{fabricApp:{isElectron:true,desktopApiBaseAtBoot:ctx.apiBase||'http://127.0.0.1:4010'}}:{})};
 const fakeURL=class extends URL{};fakeURL.createObjectURL=blob=>{ctx.urls.push(blob);return 'blob:synthetic-'+ctx.urls.length;};fakeURL.revokeObjectURL=url=>ctx.revoked.push(url);
 const document={body:{appendChild:anchor=>{ctx.anchors.push(anchor);}},createElement:tag=>{assert.equal(tag,'a');if(ctx.domFailure)throw Error('synthetic DOM error');return {style:{},click(){ctx.clicks++;},remove(){this.removed=true;}};}};
 ctx.fetch=async(url,request={})=>{
  ctx.calls.push({url,request});
  if(ctx.fetchOverride)return ctx.fetchOverride(url,request);
  if(url.endsWith('/api/auth/me')){
   if(ctx.pendingProfile)return ctx.pendingProfile;
   return json({ok:true,user:{id:ctx.userId,companyId:ctx.companyId,isPlatformAdmin:ctx.platform}});
  }
  return ctx.nextResponse??binary();
 };
 const sandbox=vm.createContext({window,localStorage:ctx.local,sessionStorage:ctx.session,navigator:{userAgent:options.mobile?'Synthetic Mobile Android':'Synthetic desktop'},
  document,URL:fakeURL,Blob,Response,Headers,Request,FormData,AbortController,DOMException,fetch:(...args)=>ctx.fetch(...args),
  setTimeout:(fn,delay)=>{ctx.timers.push({fn,delay});return ctx.timers.length;},clearTimeout(){},
  console:{info:(...args)=>ctx.logs.push(args.join(' ')),warn:(...args)=>ctx.logs.push(args.join(' ')),error:(...args)=>ctx.logs.push(args.join(' '))}});
 const cache=new Map();
 ctx.load=file=>{
  file=path.resolve(root,file);if(cache.has(file))return cache.get(file).exports;const module={exports:{}};cache.set(file,module);if(file.endsWith('.json')){module.exports=JSON.parse(fs.readFileSync(file,'utf8'));return module.exports;}
  const req=name=>{
   if(name==='react')return ctx.harness?.React??React;
   if(name==='react/jsx-runtime')return jsx;
   if(name==='react-i18next')return {useTranslation:()=>({t:ctx.translate})};
   if(name==='lucide-react')return {Download:()=>null,Loader2:()=>null,X:()=>null};
   if(name.endsWith('/i18n/config'))return {__esModule:true,default:{t:ctx.translate,getFixedT:()=>key=>JSON.parse(fs.readFileSync(path.join(root,'src/locales',ctx.lang,'externalJobs.json'),'utf8'))[key]??key}};
   if(name.startsWith('.')){let next=path.resolve(path.dirname(file),name);if(!path.extname(next))next+=fs.existsSync(next+'.ts')?'.ts':'.tsx';return ctx.load(next);}
   return deps(name);
  };
  let source=fs.readFileSync(file,'utf8');
  // Equivalent to Vite's compile-time env substitution; never reads an environment file.
  source=source.replaceAll('import.meta.env','('+JSON.stringify({PROD:ctx.prod,VITE_API_BASE_URL:ctx.apiBase})+')');
  const code=ts.transpileModule(source,{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  vm.runInContext('(function(require,module,exports){'+code+'\n})',sandbox,{filename:file})(req,module,module.exports);return module.exports;
 };
 ctx.api=()=>ctx.load('src/lib/api/platformBackupApi.ts');ctx.runTimers=()=>{for(const timer of ctx.timers.splice(0))timer.fn();};return ctx;
}
function hookHarness(ctx){
 const state=[],refs=[],effects=[];let si=0,ri=0,ei=0;const pending=[];const h={dirty:false,mounted:true,tree:null};
 h.React={...React,useState(initial){const i=si++;if(!(i in state))state[i]=typeof initial==='function'?initial():initial;return [state[i],next=>{state[i]=typeof next==='function'?next(state[i]):next;h.dirty=true;}];},
  useRef(initial){const i=ri++;return refs[i]??=( {current:initial} );},
  useEffect(fn,deps){const i=ei++;if(!effects[i]){effects[i]={deps};pending.push(()=>{effects[i].cleanup=fn();});}}};ctx.harness=h;
 const Panel=ctx.load('src/components/settings/PlatformBackupDownloadPanel.tsx').PlatformBackupDownloadPanel;
 h.render=()=>{if(!h.mounted)return;si=0;ri=0;ei=0;h.dirty=false;h.tree=Panel();for(const effect of pending.splice(0))effect();};
 h.flush=async()=>{for(let i=0;i<12;i++){await new Promise(setImmediate);if(h.dirty)h.render();}};
 h.nodes=(predicate)=>{const found=[];function walk(n){if(!n||typeof n!=='object')return;if(Array.isArray(n)){n.forEach(walk);return;}if(predicate(n))found.push(n);walk(n.props?.children);}walk(h.tree);return found;};
 const text=n=>n==null||typeof n==='boolean'?'':typeof n==='string'||typeof n==='number'?String(n):Array.isArray(n)?n.map(text).join(''):text(n.props?.children);
 h.button=key=>h.nodes(n=>n.type==='button'&&text(n).trim()===ctx.translate(key).trim())[0];
 h.input=()=>{const input=h.nodes(n=>n.type==='input')[0];if(!input)return null;return input.props.ref.current??=( {value:''} );};
 h.start=async()=>{const button=h.button('backup.secure.open');assert.ok(button,'download control should exist');await button.props.onClick();await h.flush();assert.ok(h.nodes(n=>n.type==='form').length);};
 h.submit=()=>h.nodes(n=>n.type==='form')[0].props.onSubmit({preventDefault(){}});
 h.unmount=()=>{h.mounted=false;for(const effect of effects)effect.cleanup?.();};h.render();return h;
}
const tests=[];const test=(name,fn)=>tests.push([name,fn]);
test('browser same-origin POST uses real localStorage token, body-only password, safe Blob and file name',async()=>{
 const c=context();const r=await c.api().downloadDatabaseBackupToDevice(samplePassword);const call=c.calls[0];assert.equal(call.url,'/api/system/backup/download');assert.equal(call.request.method,'POST');
 assert.equal(call.request.headers.Authorization,'Bearer synthetic-web-token');assert.equal(call.request.headers['Content-Type'],'application/json');assert.equal(call.request.headers['X-Client-Platform'],'desktop-browser');assert.equal(call.request.redirect,'error');assert.equal(call.request.cache,'no-store');
 assert.equal(JSON.parse(call.request.body).password,samplePassword);assert.equal(JSON.parse(call.request.body).confirmPhrase,'FULL_PLATFORM_BACKUP');assert.equal(call.url.includes(samplePassword),false);
 assert.equal(r.fileName,'synthetic-backup.dump');assert.equal(r.sizeBytes,dumpBytes.length);assert.equal(c.clicks,1);assert.ok(c.anchors[0].removed);c.runTimers();assert.equal(c.revoked.length,1);
 assert.equal(c.logs.join('').includes(samplePassword),false);assert.equal([...c.local.map.values(),...c.session.map.values()].some(v=>v.includes(samplePassword)),false);
});
test('Electron uses real sessionStorage token and configured API; stale localStorage token is removed',async()=>{
 const c=context({electron:true,apiBase:'https://synthetic-api.invalid'});await c.api().downloadDatabaseBackupToDevice(samplePassword);
 assert.equal(c.calls[0].url,'https://synthetic-api.invalid/api/system/backup/download');assert.equal(c.calls[0].request.headers.Authorization,'Bearer synthetic-electron-token');assert.equal(c.calls[0].request.headers['X-Client-Platform'],'windows-desktop');assert.equal(c.local.getItem(TOKEN),null);
});
test('mobile label and rotated token follow the existing token-storage contract',async()=>{
 const c=context({mobile:true});const api=c.api();c.local.setItem(TOKEN,'synthetic-rotated-token');await api.downloadDatabaseBackupToDevice(samplePassword);assert.equal(c.calls[0].request.headers.Authorization,'Bearer synthetic-rotated-token');assert.equal(c.calls[0].request.headers['X-Client-Platform'],'mobile-browser');
});
test('missing token/password and already aborted request never fetch or create a Blob URL',async()=>{
 const c=context();const api=c.api();c.local.removeItem(TOKEN);await assert.rejects(api.downloadDatabaseBackupToDevice(samplePassword),e=>e.code==='UNAUTHORIZED');c.local.setItem(TOKEN,'synthetic');await assert.rejects(api.downloadDatabaseBackupToDevice(''),e=>e.code==='VALIDATION');const controller=new AbortController();controller.abort();await assert.rejects(api.downloadDatabaseBackupToDevice(samplePassword,controller.signal),e=>e.code==='CANCELLED');assert.equal(c.calls.length,0);assert.equal(c.urls.length,0);
});
test('HTTP auth/password/rate-limit/creation errors map to fixed messages, never server diagnostics',async()=>{
 for(const [status,code,expected]of [[401,'UNAUTHORIZED','UNAUTHORIZED'],[403,'FORBIDDEN','FORBIDDEN'],[403,'PASSWORD_INVALID','PASSWORD_INVALID'],[429,'REAUTH_RATE_LIMITED','REAUTH_RATE_LIMITED'],[400,'VALIDATION','VALIDATION'],[500,'BACKUP_FAILED','BACKUP_FAILED']]){
  const c=context();c.nextResponse=json({code,message:'synthetic raw diagnostic '+samplePassword},status);await assert.rejects(c.api().downloadDatabaseBackupToDevice(samplePassword),e=>e.code===expected&&!e.message.includes(samplePassword));assert.equal(c.clicks,0);assert.equal(c.urls.length,0);
 }
});
test('HTML proxy failure, JSON success, wrong MIME, partial and empty/truncated files are not downloaded',async()=>{
 for(const response of [new Response('<html>synthetic</html>',{status:502}),json({ok:false}),binary({type:'text/html'}),binary({status:206}),binary({bytes:Buffer.alloc(0)}),binary({length:999})]){
  const c=context();c.nextResponse=response;await assert.rejects(c.api().downloadDatabaseBackupToDevice(samplePassword));assert.equal(c.clicks,0);assert.equal(c.urls.length,0);
 }
});
test('transport compression does not incorrectly compare encoded Content-Length to decoded Blob size',async()=>{
 const c=context();c.nextResponse=binary({length:1,encoding:'gzip'});const r=await c.api().downloadDatabaseBackupToDevice(samplePassword);assert.equal(r.sizeBytes,dumpBytes.length);assert.equal(c.clicks,1);
});
test('filename supports UTF-8, sanitizes paths/control characters and rejects active-file extensions',()=>{
 const api=context().api();assert.equal(api.backupFileName("attachment; filename*=UTF-8''%D9%86%D8%B3%D8%AE%D8%A9.dump"),'نسخة.dump');
 assert.equal(api.backupFileName('attachment; filename="safe.dump"; filename*=UTF-8\'\'bad%ZZ'),'safe.dump');
 assert.ok(!/[\\/\r\n]/.test(api.backupFileName('attachment; filename="../../synthetic.dump"')));assert.match(api.backupFileName('attachment; filename="evil.html"'),/^clotex-backup-.*\.dump$/);assert.match(api.backupFileName(null),/\.dump$/);
});
test('network/redirect and cancellation failures are sanitized and never fall back to GET',async()=>{
 for(const aborted of [false,true]){const c=context();const controller=new AbortController();c.fetchOverride=async()=>{if(aborted)controller.abort();throw new Error('synthetic raw '+samplePassword);};await assert.rejects(c.api().downloadDatabaseBackupToDevice(samplePassword,controller.signal),e=>e.code===(aborted?'CANCELLED':'NETWORK')&&!e.message.includes(samplePassword));assert.equal(c.calls.length,1);assert.equal(c.calls[0].request.method,'POST');assert.equal(c.clicks,0);}
});
test('DOM failure releases the object URL and returns a fixed public error',async()=>{
 const c=context();c.domFailure=true;await assert.rejects(c.api().downloadDatabaseBackupToDevice(samplePassword),e=>e.code==='BACKUP_FAILED');c.runTimers();assert.equal(c.urls.length,1);assert.equal(c.revoked.length,1);
});
test('authorization check uses the existing auth/me contract and fails closed for malformed profiles',async()=>{
 const c=context();const user=await c.api().fetchPlatformBackupUser();assert.equal(user.isPlatformAdmin,true);assert.equal(c.calls[0].url,'/api/auth/me');assert.equal(c.calls[0].request.headers.Authorization,'Bearer synthetic-web-token');
 c.fetchOverride=async()=>json({user:{role:'admin',permissions:['settings.manage']}});await assert.rejects(c.api().fetchPlatformBackupUser(),e=>e.code==='INVALID_RESPONSE');
 c.fetchOverride=async()=>json({message:samplePassword},401);await assert.rejects(c.api().fetchPlatformBackupUser(),e=>e.code==='UNAUTHORIZED'&&!e.message.includes(samplePassword));
});
test('UI ordinary/company admin cannot see a download button; verified platform user can',async()=>{
 for(const platform of [false,true]){const c=context({platform}),h=hookHarness(c);assert.equal(h.button('backup.secure.open'),undefined);await h.flush();assert.equal(Boolean(h.button('backup.secure.open')),platform);assert.equal(h.nodes(n=>n.type==='input').length,0);h.unmount();}
});
test('UI opens an explicit full-platform confirmation with a password field and can cancel without POST',async()=>{
 const c=context(),h=hookHarness(c);await h.flush();await h.start();const input=h.nodes(n=>n.type==='input')[0];assert.equal(input.props.type,'password');assert.equal(input.props.autoComplete,'current-password');assert.equal(input.props.required,true);
 const field=h.input();field.value=samplePassword;assert.ok(render(h.tree).includes(c.translate('backup.secure.confirmFullDatabase')));assert.equal(render(h.tree).includes(samplePassword),false);
 h.button('backup.secure.cancel').props.onClick();await h.flush();assert.equal(field.value,'');assert.equal(h.nodes(n=>n.type==='form').length,0);assert.equal(c.calls.some(call=>call.request.method==='POST'),false);h.unmount();
});
test('UI clears the password before request, prevents duplicate submits and reports download initiation',async()=>{
 const c=context(),h=hookHarness(c);await h.flush();await h.start();const field=h.input();field.value=samplePassword;h.submit();h.submit();assert.equal(field.value,'');await h.flush();assert.equal(c.calls.filter(call=>call.request.method==='POST').length,1);assert.equal(h.nodes(n=>n.type==='form').length,0);assert.ok(h.nodes(n=>n.props?.role==='status').some(n=>render(n).includes('synthetic-backup.dump')));h.unmount();
});
test('UI wrong password remains retryable without retaining the previous password',async()=>{
 const c=context(),h=hookHarness(c);await h.flush();await h.start();const field=h.input();field.value=samplePassword;c.nextResponse=json({code:'PASSWORD_INVALID',message:'synthetic raw '+samplePassword},403);h.submit();await h.flush();assert.equal(field.value,'');assert.ok(h.nodes(n=>n.type==='form').length);assert.ok(h.nodes(n=>n.props?.role==='alert').some(n=>render(n).includes(c.translate('backup.secure.error.PASSWORD_INVALID'))));assert.equal(render(h.tree).includes(samplePassword),false);h.unmount();
});
test('UI refresh, pre-submit revocation and changed identity hide controls and prevent a password POST',async()=>{
 for(const stage of ['focus','submit','identity']){const c=context(),h=hookHarness(c);await h.flush();await h.start();const field=h.input();field.value=samplePassword;
  if(stage==='identity')c.userId='synthetic-other-user';else c.platform=false;
  if(stage==='focus')for(const focus of c.focus)void focus();else h.submit();await h.flush();assert.equal(c.calls.some(call=>call.request.method==='POST'),false);assert.equal(field.value,'');assert.equal(h.nodes(n=>n.type==='form').length,0);if(stage!=='identity')assert.equal(h.button('backup.secure.open'),undefined);h.unmount();
 }
});
test('UI unmount aborts an in-flight download and removes focus listener',async()=>{
 const c=context(),h=hookHarness(c);await h.flush();await h.start();h.input().value=samplePassword;let signal;
 c.fetchOverride=async(url,request)=>{if(url.endsWith('/api/auth/me'))return json({user:{id:c.userId,companyId:c.companyId,isPlatformAdmin:true}});signal=request.signal;return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('synthetic cancelled','AbortError'))));};
 h.submit();await h.flush();assert.ok(signal);h.unmount();assert.equal(signal.aborted,true);assert.equal(c.focus.size,0);await h.flush();assert.equal(c.clicks,0);
});
test('backup UI changes do not alter other settings translations or JSON API requests',async()=>{
 for(const lang of ['ar','tr']){const p='src/locales/'+lang+'/settings.json';const original=JSON.parse(cp.execFileSync(git,['show','HEAD:'+p],{cwd:root,encoding:'utf8'}));for(const[k,v]of Object.entries(original))assert.equal(locales[lang][k],v,k);for(const k of Object.keys(locales.ar).filter(k=>k.startsWith('backup.secure.')))assert.ok(locales.tr[k],k);}
 const c=context({apiBase:'https://synthetic-api.invalid'});c.fetchOverride=async(url,request)=>json({ok:true,data:{general:{language:'ar'}}});const settings=c.load('src/lib/api/settingsApi.ts');await settings.getSystemSettings();assert.equal(c.calls[0].url,'https://synthetic-api.invalid/api/system/settings');assert.equal(c.calls[0].request.headers.get('Authorization'),'Bearer synthetic-web-token');
 await settings.saveSystemSetting('general',{language:'tr'});assert.equal(c.calls[1].request.method,'PUT');assert.equal(JSON.parse(c.calls[1].request.body).value.language,'tr');
});
test('in-memory frontend POST -> real Phase A JWT/reauth/Blob response; server still denies tenant admin',async()=>{
 for(const id of [phaseA.ids.platform,phaseA.ids.admin]){const server=phaseA.createContext(),a=await phaseA.api(server),c=context({token:a.token(id)});c.fetchOverride=async(url,request)=>{
  const r=await a.app.inject({method:request.method??'GET',url,headers:request.headers,payload:request.body});return new Response(r.rawPayload,{status:r.statusCode,headers:r.headers});
 };if(id===phaseA.ids.platform){const r=await c.api().downloadDatabaseBackupToDevice(phaseA.testPassword);assert.equal(r.fileName,'synthetic.dump');assert.equal(r.sizeBytes,phaseA.fakeDump.length);assert.equal(c.clicks,1);}else{await assert.rejects(c.api().downloadDatabaseBackupToDevice(phaseA.testPassword),e=>e.code==='FORBIDDEN');assert.equal(c.clicks,0);assert.equal(server.dumpCalls,0);}await a.app.close();}
});
test('cross-origin POST preflight permits auth headers and exposes file metadata without weakening GET',async()=>{
 const server=phaseA.createContext(),a=await phaseA.api(server,{cors:true});
 const preflight=await a.app.inject({method:'OPTIONS',url:'/api/system/backup/download',headers:{origin:'https://synthetic-ui.invalid','access-control-request-method':'POST','access-control-request-headers':'authorization,content-type,x-client-platform'}});
 assert.equal(preflight.statusCode,204,preflight.body);assert.match(preflight.headers['access-control-allow-methods'],/POST/);assert.match(preflight.headers['access-control-allow-headers'],/authorization/);
 const r=await a.app.inject({method:'POST',url:'/api/system/backup/download',headers:{...a.headers(phaseA.ids.platform),origin:'https://synthetic-ui.invalid'},payload:{password:phaseA.testPassword,confirmPhrase:'FULL_PLATFORM_BACKUP'}});
 assert.equal(r.statusCode,200,r.body);assert.match(r.headers['access-control-expose-headers'],/Content-Disposition/);assert.equal(r.headers['access-control-allow-origin'],'https://synthetic-ui.invalid');assert.equal((await a.app.inject({url:'/api/system/backup/download',headers:a.headers(phaseA.ids.platform)})).statusCode,405);await a.app.close();
});
test('interrupted binary response cannot produce a saved file or expose transport diagnostics',async()=>{
 const c=context();c.nextResponse=new Response(new ReadableStream({start(controller){controller.error(new Error('synthetic stream failure '+samplePassword));}}),{headers:{'Content-Type':'application/octet-stream'}});
 await assert.rejects(c.api().downloadDatabaseBackupToDevice(samplePassword),e=>e.code==='NETWORK'&&!e.message.includes(samplePassword));assert.equal(c.clicks,0);assert.equal(c.urls.length,0);
});
test('UI server denial after a successful profile check hides the control; creation errors stay retryable',async()=>{
 for(const [status,code]of [[403,'FORBIDDEN'],[500,'BACKUP_FAILED']]){const c=context(),h=hookHarness(c);await h.flush();await h.start();const field=h.input();field.value=samplePassword;c.nextResponse=json({code,message:'synthetic raw '+samplePassword},status);h.submit();await h.flush();assert.equal(c.clicks,0);assert.equal(field.value,'');assert.ok(h.nodes(n=>n.props?.role==='alert').some(n=>render(n).includes(c.translate('backup.secure.error.'+code))));assert.equal(Boolean(h.button('backup.secure.open')),status===500);assert.equal(Boolean(h.nodes(n=>n.type==='form').length),status===500);h.unmount();}
});
test('UI cancel aborts a pending pre-submit authorization request without sending the password',async()=>{
 const c=context(),h=hookHarness(c);await h.flush();await h.start();const field=h.input();field.value=samplePassword;let signal;
 c.fetchOverride=async(url,request)=>{signal=request.signal;return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(new DOMException('synthetic cancelled','AbortError'))));};
 h.submit();await h.flush();assert.ok(signal);h.button('backup.secure.cancel').props.onClick();await h.flush();assert.equal(signal.aborted,true);assert.equal(field.value,'');assert.equal(c.calls.some(call=>call.request.method==='POST'),false);assert.equal(h.nodes(n=>n.type==='form').length,0);h.unmount();
});
test('Turkish backup UI uses translated permission/reauth messages without changing Arabic keys',async()=>{
 const c=context({lang:'tr'}),h=hookHarness(c);await h.flush();await h.start();assert.ok(render(h.tree).includes(locales.tr['backup.secure.confirmFullDatabase']));h.input().value=samplePassword;c.nextResponse=json({code:'PASSWORD_INVALID'},403);h.submit();await h.flush();assert.ok(h.nodes(n=>n.props?.role==='alert').some(n=>render(n).includes(locales.tr['backup.secure.error.PASSWORD_INVALID'])));h.unmount();
});
module.exports={context};
if(require.main===module)(async()=>{let failed=0;for(const[name,fn]of tests){try{await fn();console.log('PASS '+name);}catch(e){failed++;console.error('FAIL '+name+'\n'+e.stack);}}console.log(tests.length+' A.1 targeted tests; '+failed+' failures. DOM/hooks/fetch/SQL/dumps are mocked; no browser or services.');process.exitCode=failed?1:0;})();
