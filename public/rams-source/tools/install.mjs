import { readFileSync, existsSync, lstatSync, realpathSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, relative, sep, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const args=process.argv.slice(2),options={};
for(let i=0;i<args.length;i++){
 const key=args[i];
 if(key==='--dry-run')options.dryRun=true;
 else if(['--target','--items'].includes(key)&&args[i+1]&&!args[i+1].startsWith('--'))options[key.slice(2)]=args[++i];
 else throw new Error(`Unknown or incomplete option: ${key}`);
}
if(!options.target||!options.items)throw new Error('Usage: node tools/install.mjs --target <app> --items button,input [--dry-run]');
const source=realpathSync(resolve(dirname(fileURLToPath(import.meta.url)),'..'));
const app=realpathSync(resolve(options.target));
if(!existsSync(join(app,'package.json')))throw new Error('Target must be an existing application with package.json.');
const manifest=JSON.parse(readFileSync(join(source,'rams.json'),'utf8'));
if(manifest.format!=='rams-source-manifest'||manifest.schemaVersion!==1)throw new Error('Unsupported RAMS manifest.');
const ids=[...new Set(options.items.split(',').map(x=>x.trim()).filter(Boolean))];
if(!ids.length)throw new Error('Choose at least one component.');
const files=new Set(manifest.coreFiles),packages={};
for(const id of ids){const item=manifest.items[id];if(!item)throw new Error(`Unknown component: ${id}`);for(const file of item.files)files.add(file);Object.assign(packages,item.packages);}
for(const id of ids) if(manifest.items[id].documentation) files.add(manifest.items[id].documentation);
function safe(root,path){
 if(typeof path!=='string'||!path||path.includes('\\')||!/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(path)||path.split('/').some(s=>!s||s==='.'||s==='..'||s.startsWith('.')))throw new Error(`Unsafe path: ${path}`);
 const full=resolve(root,path),rel=relative(root,full);
 if(rel.startsWith('..'+sep)||rel==='..'||rel.startsWith(sep))throw new Error(`Path leaves root: ${path}`);
 let current=root;
 for(const segment of rel.split(sep)){current=join(current,segment);try { if(lstatSync(current).isSymbolicLink())throw new Error(`Symbolic links are not install targets: ${path}`); } catch(error) { if(error.code!=='ENOENT')throw error; }}
 return full;
}
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const installed=safe(app,'src/rams'),plan=[];
const receiptPath=safe(app,'src/rams/installation.json');
const sourceItemsHash=digest(JSON.stringify(manifest.items));
let previous;
if(existsSync(receiptPath)) {
 previous=JSON.parse(readFileSync(receiptPath,'utf8'));
 if(previous.format!=='rams-installed-source' || previous.schemaVersion!==1 || previous.profile!=='default' || Object.keys(previous).some(k=>!['format','schemaVersion','profile','sourceVersion','sourceItemsHash','items','rules','documentation','files'].includes(k)) || previous.sourceVersion!==manifest.version || previous.sourceItemsHash!==sourceItemsHash || !Array.isArray(previous.items) || previous.items.some(id=>!manifest.items[id] || previous.documentation?.[id]!==manifest.items[id].documentation) || JSON.stringify(previous.rules)!==JSON.stringify(['AGENTS.md','docs/foundations.md']) || !previous.files || typeof previous.files!=='object' || Object.entries(previous.files).some(([file,sha])=>manifest.files[file]?.sha256!==sha)) throw Error('Existing installation receipt differs from this source snapshot. Preserve it and review the migration.');
}
for(const file of [...files].sort()){
 const entry=manifest.files[file];if(!entry)throw new Error(`Missing file metadata: ${file}`);
 const from=safe(source,file),to=safe(app,'src/rams/'+file),bytes=readFileSync(from);
 if(digest(bytes)!==entry.sha256)throw new Error(`Source hash mismatch: ${file}`);
 if(existsSync(to)&&digest(readFileSync(to))!==entry.sha256)throw new Error(`Existing file differs: ${to}. Keep your changes and resolve the conflict before installing.`);
 plan.push({file,from,to,copy:!existsSync(to),bytes});
}
// All paths, hashes and conflicts are checked before creating any destination.
const installedIds=[...new Set([...(previous?.items??[]),...ids])].sort();
const receipt={format:'rams-installed-source',schemaVersion:1,profile:'default',sourceVersion:manifest.version,sourceItemsHash,items:installedIds,rules:['AGENTS.md','docs/foundations.md'],documentation:Object.fromEntries(installedIds.map(id=>[id,manifest.items[id].documentation])),files:{...(previous?.files??{}),...Object.fromEntries(plan.map(row=>[row.file,manifest.files[row.file].sha256]))}};
if(!options.dryRun){
 for(const row of plan)if(row.copy){mkdirSync(dirname(row.to),{recursive:true});writeFileSync(row.to,row.bytes,{flag:"wx"});}
 writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n',{flag:previous?'w':'wx'});
}
console.log(JSON.stringify({status:options.dryRun?'dry-run':'installed',items:ids,root:installed,files:plan.map(({file,copy})=>({file,action:copy?'copy':'keep'})),requiredPackages:packages,requirements:manifest.requirements,styleImport:'./rams/styles.css',installationReceipt:'src/rams/installation.json'},null,2));
