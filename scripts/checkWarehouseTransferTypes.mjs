import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
const git=process.argv[2] || 'git';
const base='upstream/clotex';
const originalFiles=new Set(execFileSync(git,['ls-tree','-r','--name-only',base],{encoding:'utf8'}).trim().split(/\r?\n/));
const changed=execFileSync(git,['diff','--name-only',base,'--','*.ts','*.tsx'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const originals=new Map(changed.filter(f=>originalFiles.has(f)).map(f=>[path.resolve(f),execFileSync(git,['show',`${base}:${f}`],{encoding:'utf8'})]));
function check(config,baseline){
 const raw=ts.readConfigFile(config,ts.sys.readFile);
 const parsed=ts.parseJsonConfigFileContent(raw.config,ts.sys,path.dirname(config));
 const options={...parsed.options,noEmit:true};const host=ts.createCompilerHost(options);
 if(baseline){
  const read=host.readFile.bind(host);
  host.readFile=file=>originals.get(path.resolve(file))??read(file);
  host.getSourceFile=(file,version)=>{const text=host.readFile(file);return text===undefined?undefined:ts.createSourceFile(file,text,version,true);};
 }
 const roots=baseline?parsed.fileNames.filter(f=>originalFiles.has(path.relative(process.cwd(),path.resolve(f)).replaceAll('\\','/'))):parsed.fileNames;
 const program=ts.createProgram(roots,options,host);
 return ts.getPreEmitDiagnostics(program).map(d=>({file:d.file?path.relative(process.cwd(),d.file.fileName).replaceAll('\\','/'):'config',code:d.code,message:ts.flattenDiagnosticMessageText(d.messageText,' ')}));
}
const results={compiler:ts.version,base,projects:[]};
for(const config of ['tsconfig.json','server/tsconfig.json']){
 const before=check(config,true),after=check(config,false);
 const counts=new Map();for(const d of before){const k=JSON.stringify(d);counts.set(k,(counts.get(k)||0)+1);}
 const added=after.filter(d=>{const k=JSON.stringify(d),n=counts.get(k)||0;if(n){counts.set(k,n-1);return false;}return true;});
 results.projects.push({config,baselineErrors:before.length,currentErrors:after.length,added,diagnostics:after});
 console.log(JSON.stringify({config,baselineErrors:before.length,currentErrors:after.length,added}));
 if(added.length)process.exitCode=1;
}
fs.mkdirSync('.local-test-results',{recursive:true});fs.writeFileSync('.local-test-results/task001-v2-type-comparison.json',JSON.stringify(results,null,2));
