/* Source inspection only: no application imports, environment files or database calls. */
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
const root=path.resolve(__dirname,'../../..');
const deps=createRequire(path.join(process.env.TASK005_TEST_MODULES||root,'package.json'));
const ts=deps('typescript');
function inspectSources(){
 const declarations=[],registrations=[];let physicalDeclarations=0;
 function parse(file,routeFile=false){
  const source=fs.readFileSync(path.join(root,file),'utf8'),sf=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,file.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  function routePaths(call){
   const arg=call.arguments[0];
   if(ts.isStringLiteral(arg)||ts.isNoSubstitutionTemplateLiteral(arg))return [arg.text];
   // Resolve only a finite, literal const object iterated with Object.entries.
   // Never evaluate project JS, request input or function calls to discover paths.
   if(ts.isTemplateExpression(arg)&&arg.templateSpans.length===1&&ts.isIdentifier(arg.templateSpans[0].expression)){
    let loop=call.parent;while(loop&&!ts.isForOfStatement(loop))loop=loop.parent;
    const iterator=loop?.expression,decl=loop?.initializer;
    const binding=decl&&ts.isVariableDeclarationList(decl)?decl.declarations[0]?.name:null;
    if(iterator&&ts.isCallExpression(iterator)&&iterator.expression.getText(sf)==='Object.entries'&&iterator.arguments.length===1&&ts.isIdentifier(iterator.arguments[0])&&binding&&ts.isArrayBindingPattern(binding)&&binding.elements[0]?.name?.getText(sf)===arg.templateSpans[0].expression.text){
     const matches=[];const objectName=iterator.arguments[0].text;
     function find(n){if(ts.isVariableDeclaration(n)&&ts.isIdentifier(n.name)&&n.name.text===objectName&&n.initializer&&ts.isVariableDeclarationList(n.parent)&&(n.parent.flags&ts.NodeFlags.Const))matches.push(n.initializer);ts.forEachChild(n,find);}find(sf);
     if(matches.length!==1)throw Error('Ambiguous finite route object: '+file);
     let object=matches[0];while(ts.isSatisfiesExpression(object)||ts.isAsExpression(object)||ts.isParenthesizedExpression(object))object=object.expression;
     if(ts.isObjectLiteralExpression(object)){
      const names=object.properties.map(p=>{if(!ts.isPropertyAssignment(p)||(!ts.isIdentifier(p.name)&&!ts.isStringLiteral(p.name)))throw Error('Nonliteral finite route key: '+file);return p.name.text;});
      if(!names.length||new Set(names).size!==names.length||names.some(n=>!/^[-a-zA-Z0-9_]+$/.test(n)))throw Error('Invalid finite route keys: '+file);
      return names.map(n=>arg.head.text+n+arg.templateSpans[0].literal.text);
     }
    }
   }
   throw Error('Nonliteral API route requires explicit inspector support: '+file);
  }
  function visit(n,plugin=''){
   if(ts.isVariableDeclaration(n)&&ts.isIdentifier(n.name)&&/Routes$/.test(n.name.text))plugin=n.name.text;
   if(ts.isCallExpression(n)&&ts.isPropertyAccessExpression(n.expression)&&n.expression.expression.getText(sf)==='app'){
    const method=n.expression.name.text;
    if(['get','post','put','patch','delete'].includes(method)){
     const paths=routePaths(n);physicalDeclarations++;
     const body=n.getText(sf);
     for(const localPath of paths)declarations.push({plugin,file,method:method.toUpperCase(),localPath,currentGuard:paths.length>1?'LEGACY_ROLE_OR_PERMISSION_SWITCH':plugin==='permissionProfileRoutes'?'LIVE_C1_PROFILE_OR_DELEGATION_GUARD':body.includes('requirePlatformAdmin(')||body.includes('platformOnly: true')?'LIVE_PLATFORM_GUARD':body.includes('canManageUsers(')||body.includes("permissions.includes('settings.manage')")?'LIVE_SENSITIVE_GUARD':body.includes('requirePermission(')||body.includes('requireAdmin(')?'EXPLICIT_PERMISSION_OR_ADMIN_BYPASS':body.includes('authenticateRequest')?'AUTH_ONLY':'PUBLIC_OR_AUTH_FLOW'});
    }
    if(method==='register'&&ts.isIdentifier(n.arguments[0])&&/Routes$/.test(n.arguments[0].text)){
     const options=n.arguments[1];const prefix=options&&ts.isObjectLiteralExpression(options)?options.properties.find(p=>p.name?.getText(sf)==='prefix'):null;
     if(prefix&&!ts.isStringLiteral(prefix.initializer))throw Error('Dynamic prefix: '+file);
     registrations.push({parent:routeFile?plugin:'ROOT',plugin:n.arguments[0].text,prefix:prefix?.initializer.text||''});
    }
    if(method==='route')throw Error('app.route needs explicit inspector support: '+file);
   }
   ts.forEachChild(n,child=>visit(child,plugin));
  }visit(sf);return sf;
 }
 parse('server/src/app.ts');
 for(const name of fs.readdirSync(path.join(root,'server/src/routes')).filter(f=>f.endsWith('.ts')&&!f.includes('.test.')))parse('server/src/routes/'+name,true);
 const join=(a,b)=>((a+'/'+b).replace(/\/+/g,'/').replace(/\/$/,'')||'/');
 function expand(parent,prefix,seen=[]){
  if(seen.includes(parent))throw Error('Recursive route registration');
  const own=declarations.filter(r=>r.plugin===parent).map(r=>({...r,path:join(prefix,r.localPath)}));
  for(const r of registrations.filter(r=>r.parent===parent))own.push(...expand(r.plugin,join(prefix,r.prefix),[...seen,parent]));
  return own;
 }
 const routes=expand('ROOT','').sort((a,b)=>(a.method+' '+a.path).localeCompare(b.method+' '+b.path));
 const seen=new Set();for(const r of routes){const id=r.method+' '+r.path;if(seen.has(id))throw Error('Duplicate route: '+id);seen.add(id);}
 for(const d of declarations)if(!routes.some(r=>r.file===d.file&&r.plugin===d.plugin&&r.localPath===d.localPath&&r.method===d.method))throw Error('Unregistered route declaration: '+d.file+' '+d.localPath);
 const frontend=[];const app=parse('src/App.tsx');
 function jsx(n){if((ts.isJsxOpeningElement(n)||ts.isJsxSelfClosingElement(n))&&n.tagName.getText(app)==='Route'){
  const get=name=>n.attributes.properties.find(p=>p.name?.text===name);const p=get('path'),index=Boolean(get('index')),element=get('element')?.initializer?.getText(app)||'';
  frontend.push({path:p?.initializer?.text??'[index]',index,component:element.match(/<([A-Z]\w*)/)?.[1]||'',demo:/<(Manufacturing|Partners|ExchangeInvoices)\b/.test(element)});
 }ts.forEachChild(n,jsx);}jsx(app);
 const seed=fs.readFileSync(path.join(root,'server/src/db/seedConstants.ts'),'utf8');const beforeRoles=seed.slice(0,seed.indexOf('export const ROLES'));
 const legacy=[...beforeRoles.matchAll(/code:\s*'([^']+)',\s*name:\s*'([^']+)'/g)].map(m=>({code:m[1],ar:m[2]}));
 return {routes,declarations,frontend,legacy,counts:{apiDeclarations:physicalDeclarations,registeredApiRoutes:routes.length,routeFiles:new Set(declarations.map(r=>r.file)).size,frontendRoutes:frontend.length,reports:routes.filter(r=>r.plugin==='reportRoutes').length}};
}
module.exports={inspectSources,root};
